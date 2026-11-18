#!/usr/bin/env python3
"""来源域审计：找出仍引二手汇编的法条，以及「URL 换了、说明没换」的残留。

背景（RAY-756 / RAY-760）：中期检查表第五节承诺「871 条落在该国官方公报或法律库，
12 条仍引二手汇编」。这个数字原先是用临时脚本扫出来的，换个人接手就复现不了。
本脚本把那套扫法固化下来：每次改动 `--/rules.v0.1.json` 或新增国家后跑一次，
数字与条目都从数据里算，不再靠人临时 grep。

三段检查（对应 RAY-760 描述）：

1. **二手域命中**：`official_url` 的主机落在已知二手汇编域（见 `SECONDARY_DOMAINS`）。
2. **说明与 URL 不一致**：`official_url` 指向 A 站，但 `official_url_note` / `notes` /
   `source_note` 等说明字段里还写着二手汇编的名字（历史教训：PK 那批 FAOLEX 残留，
   只改 URL 不改说明，看着干净其实没改完）。
3. **官方域分布**：按主机统计，输出每国「官方 / 二手 / 待降级」条数与官方域占比。

判定口径（写给下一个人，别自己改着玩）：

- **二手域清单是显式的**，不做「猜域名像不像政府站」那种事：`kenyalaw.org`、
  `pakistancode.gov.pk`、`elibrary.judiciary.gov.ph` 这类是官方/官方授权站点，
  猜出来只会制造噪音。发现新的二手汇编，加进 `SECONDARY_DOMAINS` 或临时用
  `--extra-secondary` 传进来。
- **`web.archive.org` 不算二手**：它是官方页的存档快照（如 KE / EG 在源站 WAF 挡了
  自动化客户端时用 Wayback 取件），口径上仍算「官方原文的存档副本」，单独归为
  `archive` 类，计入官方数并在 JSON 里标出。若某条的 `official_url` 存档的是二手汇编
  页面，第 2 段检查会照样报出来。
- **「待降级」是文本启发式**：二手域条目若在说明字段里没有出现「非政府 / 非官方 /
  二手 / 降级」任一措辞，就算「待降级」——意思是它还没告诉读者「这条不是官方直链」。
  这跟「有没有真正换源」是两件事：降级标注齐全的条目仍然计入二手域。
- **`source_tier` 自相矛盾也会点出来**：二手域条目的 `source_tier` 若还写着 `official_*`，
  finding 里会加一句「自称官方，与二手托管矛盾」。这只是附注，不新增计数。
- **退出码**只由「二手域」「说明不一致」「缺 official_url」三类决定，与条数多少无关；
  「待降级」只进报表，不单独触发非零（二手域本身已经触发了）。

用法：

    python3 agent/knowledge/legal/scripts/audit_sources.py
    python3 agent/knowledge/legal/scripts/audit_sources.py --market MY
    python3 agent/knowledge/legal/scripts/audit_sources.py --market EG,GH --json
    python3 agent/knowledge/legal/scripts/audit_sources.py --warn-only   # 只报告，恒零退出

退出码：

    0  干净（或加了 --warn-only）
    1  存在二手域、说明不一致、或 official_url 缺失
    2  输入有问题（规则文件缺失 / JSON 解析失败 / --root 不是目录 / --market 写了不存在的市场）

输出：默认打印人读的报表；`--json` 打印机器可读 JSON（下游脚本直接消费，字段见
`build_report()`）。两种输出互斥，`--json` 时不打印报表，报错仍走 stderr。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Iterable, Sequence
from urllib.parse import urlparse

# scripts/ 的上一级就是 legal/ 根目录
ROOT_DEFAULT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULES_FILENAME = "rules.v0.1.json"
INDEX_FILENAME = "index.json"

# 已知二手汇编域 → 人读说明。新增来源改这里；脚本不猜域名性质。
SECONDARY_DOMAINS: dict[str, str] = {
    "faolex.fao.org": "FAOLEX（联合国粮农组织法律数据库，二手汇编；所藏影印本原样保留但不等于发布国官方直链）",
    "members.wto.org": "WTO 通报文档库（成员提交的 TBT/SPS 通报附件，非发布国官方公报）",
    "dataguidance.com": "DataGuidance（商业法律数据库）",
    "chemreg.net": "ChemReg（商业化学品法规数据库）",
}

# 说明字段里出现这些词就认定「提到了该二手源」。只匹配指向具体产品的词，
# 不用裸 "WTO"（"WTO TBT" 之外还有大量正当地提及世贸组织的句子）。
SECONDARY_MENTION_PATTERNS: dict[str, re.Pattern[str]] = {
    "faolex.fao.org": re.compile(r"faolex|fao\s*lex", re.I),
    # 只认「当成来源在引用」的写法：裸 `WTO 通知 / WTO TBT` 会把「新官方文本已与旧 WTO
    # 通知逐页核对一致」这种换源做对了才写的溯源说明一起判成残留（RAY-757 的真实写法）。
    # 域名出现即算；纯文字提法要求带「附件 / 通知文号 / .pdf」这类指向具体文档的尾巴。
    "members.wto.org": re.compile(
        r"members\.wto\.org"
        r"|wto\s*tbt\s*(?:通知|通报)?\s*附件"
        r"|wto\s*(?:通知|通报)\s*附件"
        r"|wto\s*tbt\s*通知\s*文号",
        re.I,
    ),
    "dataguidance.com": re.compile(r"dataguidance|data\s*guidance", re.I),
    "chemreg.net": re.compile(r"chemreg|chem\s*reg", re.I),
}

# 「这条说明是在讲『已与二手文本交叉核对过』」的信号词。命中这些词说明这条规则
# 提到二手源是为了交代核对过程，而不是还把它当来源挂着——那是换源做对了的证据。
# 只在同一句内生效，避免整段里任意一句出现「核对」就放过全段。
CROSSCHECK_MARKERS: tuple[str, ...] = (
    "逐页一致", "逐字一致", "逐字核对", "交叉核对", "全文比对", "比对无差异",
    "已核对", "核对一致", "与旧引用", "旧引用", "改自", "替代",
)

# 分句：中英文句号、分号、换行都算边界。
SENTENCE_SPLIT = re.compile(r"[。；;\n]|\.\s+")

# 扫描的说明类字段。official_url 之外，这些是「这条法条从哪来」的唯一线索。
NOTE_FIELDS: tuple[str, ...] = (
    "official_url_note",
    "notes",
    "source_note",
    "verbatim_note",
    "gazette_page",
    "archive_url",
)

# 已做降级标注的措辞（任一命中即认为这条已经告诉读者「不是官方直链」）。
DOWNGRADE_MARKERS: tuple[str, ...] = ("非政府", "非官方", "二手", "降级")

# 官方页的存档快照：算官方原文，不算二手。
ARCHIVE_DOMAINS: tuple[str, ...] = (
    "web.archive.org",
    "archive.org",
    "archive.ph",
    "perma.cc",
    "webcache.googleusercontent.com",
)

KIND_SECONDARY = "secondary_host"          # official_url 主机是二手汇编
KIND_NOTE_RESIDUE = "note_mentions_secondary"  # 说明里还写着二手汇编，但 URL 不是它
KIND_MISSING_URL = "missing_official_url"  # official_url 缺失或不是 http(s)


def normalize_host(url: str) -> str:
    """取 URL 的主机名（小写、去端口/用户信息/末尾点）。取不到就返回空串。"""
    if not isinstance(url, str) or not url.strip():
        return ""
    try:
        parsed = urlparse(url.strip())
        netloc = parsed.netloc
    except ValueError:
        return ""
    if not netloc:
        return ""
    host = netloc.rsplit("@", 1)[-1]
    if host.startswith("["):  # IPv6 字面量，本库不该出现，原样返回便于报错
        return host.split("]")[0].lstrip("[").lower()
    host = host.split(":")[0]
    return host.strip(".").lower()


def is_http_url(url: str) -> bool:
    """official_url 必须是绝对的 http(s) 地址：相对路径、ftp、空值都不算。"""
    if not isinstance(url, str) or not url.strip():
        return False
    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return False
    return parsed.scheme.lower() in ("http", "https") and bool(parsed.netloc)


def host_matches(host: str, domain: str) -> bool:
    """host 等于 domain 或是其子域。"""
    return bool(host) and (host == domain or host.endswith("." + domain))


def classify_host(host: str, secondary: Sequence[str]) -> str:
    """把主机归为 secondary / archive / official；空主机返回空串。"""
    if not host:
        return ""
    if canonical_secondary(host, secondary):
        return "secondary"
    if any(host_matches(host, d) for d in ARCHIVE_DOMAINS):
        return "archive"
    return "official"


def canonical_secondary(host: str, secondary: Sequence[str]) -> str:
    """host 命中的二手源规范域名；不是二手源返回空串。

    用规范域名（`dataguidance.com`）而不是实际主机（`www.dataguidance.com`）去查
    说明文案与残留匹配，否则 `www.` 前缀会让两段检查对不上。
    """
    for domain in secondary:
        if host_matches(host, domain):
            return domain
    return ""


def mentioned_secondary(text: str, secondary: Sequence[str]) -> list[str]:
    """说明字段里提到了哪些二手源（按 canonical 域去重后返回）。"""
    if not isinstance(text, str) or not text:
        return []
    hits: list[str] = []
    for canonical in secondary:
        pattern = SECONDARY_MENTION_PATTERNS.get(canonical)
        if pattern is None:
            # --extra-secondary 传进来的域：按字面匹配
            pattern = re.compile(re.escape(canonical), re.I)
        if pattern.search(text) and canonical not in hits:
            hits.append(canonical)
    return hits


def is_crosscheck_sentence(sentence: str) -> bool:
    """这句话是否在交代「已与二手文本核对过」（而不是还把它当来源挂着）。"""
    return any(m in sentence for m in CROSSCHECK_MARKERS)


def mentioned_as_source(text: str, secondary: Sequence[str]) -> list[str]:
    """说明字段里仍然把二手源**当成来源**挂着的地方。

    跟 `mentioned_secondary()` 的区别：逐句看，只在「提到二手源、但该句没有核对措辞」
    时才认。这样 `notes` 里写一句「英文引文逐字取自 AGC 公报；该文本与旧引用的 WTO
    通知附件逐页一致」不会因为后半句被误判成残留——那是换源做对了才该写的溯源说明。
    """
    if not isinstance(text, str) or not text:
        return []
    hits: list[str] = []
    for sentence in SENTENCE_SPLIT.split(text):
        if not sentence.strip() or is_crosscheck_sentence(sentence):
            continue
        for canonical in mentioned_secondary(sentence, secondary):
            if canonical not in hits:
                hits.append(canonical)
    return hits


def downgrade_marked(rule: dict) -> bool:
    """说明字段里是否已经写明「不是官方直链」。"""
    for name in NOTE_FIELDS:
        value = rule.get(name)
        if isinstance(value, str) and any(m in value for m in DOWNGRADE_MARKERS):
            return True
    return False


def tier_claims_official(rule: dict) -> bool:
    """source_tier 是否自称官方（`official_*`）。"""
    tier = rule.get("source_tier")
    return isinstance(tier, str) and tier.startswith("official")


@dataclass
class Finding:
    kind: str
    market: str
    rule_id: str
    field: str
    host: str
    message: str
    downgrade_marked: bool = False

    def as_dict(self) -> dict:
        return {
            "kind": self.kind,
            "market": self.market,
            "rule_id": self.rule_id,
            "field": self.field,
            "host": self.host,
            "downgrade_marked": self.downgrade_marked,
            "message": self.message,
        }


@dataclass
class MarketReport:
    market: str
    market_name: str
    rules_file: str
    rules: int = 0
    official: int = 0
    secondary: int = 0
    archive: int = 0
    pending_downgrade: int = 0
    note_mismatch: int = 0
    missing_url: int = 0
    domains: dict[str, dict[str, int]] = field(default_factory=dict)  # host -> {kind, count}
    findings: list[Finding] = field(default_factory=list)

    @property
    def official_share(self) -> float:
        return (self.official / self.rules) if self.rules else 0.0

    def as_dict(self) -> dict:
        return {
            "market": self.market,
            "market_name": self.market_name,
            "rules_file": self.rules_file,
            "rules": self.rules,
            "official": self.official,
            "secondary": self.secondary,
            "archive": self.archive,
            "pending_downgrade": self.pending_downgrade,
            "note_mismatch": self.note_mismatch,
            "missing_official_url": self.missing_url,
            "official_share": round(self.official_share, 4),
            "domains": [
                {"host": h, "kind": v["kind"], "count": v["count"]}
                for h, v in sorted(self.domains.items(), key=lambda kv: (-kv[1]["count"], kv[0]))
            ],
            "findings": [f.as_dict() for f in self.findings],
        }


class InputError(Exception):
    """规则文件不可读 / 不合法：属于输入问题，退出码 2。"""


def load_rules(path: str) -> tuple[list[dict], dict]:
    """读一个 rules 文件，返回 (rules, 文件级元数据)。

    兼容两种形态：带 `rules` 数组的对象，或直接是数组。
    """
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except FileNotFoundError:
        raise InputError(f"规则文件不存在：{path}")
    except json.JSONDecodeError as exc:
        raise InputError(f"规则文件不是合法 JSON：{path}（第 {exc.lineno} 行第 {exc.colno} 列：{exc.msg}）")
    except OSError as exc:
        raise InputError(f"规则文件读取失败：{path}（{exc.strerror or exc}）")

    if isinstance(data, dict):
        rules = data.get("rules")
        meta = data
    else:
        rules = data
        meta = {}
    if not isinstance(rules, list):
        raise InputError(f"规则文件缺少 rules 数组：{path}")
    for i, rule in enumerate(rules):
        if not isinstance(rule, dict):
            raise InputError(f"规则文件第 {i} 条不是对象：{path}")
    return rules, meta


def discover_markets(root: str, wanted: Sequence[str]) -> list[tuple[str, str, str]]:
    """返回 [(市场代码, 目录名, rules 文件路径)]，按 index.json 顺序，其次按字母。"""
    order: list[str] = []
    index_path = os.path.join(root, INDEX_FILENAME)
    if os.path.exists(index_path):
        try:
            with open(index_path, encoding="utf-8") as fh:
                idx = json.load(fh)
            order = [str(m.get("market", "")).upper() for m in idx.get("markets", []) if m.get("market")]
        except (json.JSONDecodeError, OSError, AttributeError):
            # index.json 只是排序提示，坏了不该让审计跑不起来；同步一致性由 sync_index.py 管
            order = []

    found: dict[str, tuple[str, str, str]] = {}
    try:
        entries = sorted(os.listdir(root))
    except OSError as exc:
        raise InputError(f"扫描目录失败：{root}（{exc.strerror or exc}）")
    for name in entries:
        path = os.path.join(root, name, RULES_FILENAME)
        if not os.path.isdir(os.path.join(root, name)) or not os.path.exists(path):
            continue
        code = name.upper()
        found[code] = (code, name, path)

    if wanted:
        unknown = [w for w in wanted if w not in found]
        if unknown:
            available = ", ".join(sorted(found)) or "（无）"
            raise InputError(f"没有这些市场的规则文件：{', '.join(unknown)}；可选市场：{available}")
        codes = [w for w in wanted]
    else:
        codes = sorted(found, key=lambda c: (order.index(c) if c in order else len(order), c))
    return [found[c] for c in codes]


def audit_market(code: str, dirname: str, path: str, root: str, secondary: Sequence[str]) -> MarketReport:
    rules, meta = load_rules(path)
    report = MarketReport(
        market=code,
        market_name=str(meta.get("market_name") or code),
        rules_file=os.path.relpath(path, root),
    )
    for rule in rules:
        report.rules += 1
        rule_id = str(rule.get("id") or "?")
        url = rule.get("official_url")
        host = normalize_host(url)
        kind = classify_host(host, secondary)

        # 1) 主机归属
        canonical = canonical_secondary(host, secondary)
        if kind == "secondary":
            report.secondary += 1
            marked = downgrade_marked(rule)
            if not marked:
                report.pending_downgrade += 1
            # tier 自称 official_* 但又指向二手源：读者会以为这是官方直链，必须点出来
            tier_note = ""
            if tier_claims_official(rule):
                tier_note = f"；且 source_tier={rule.get('source_tier')!r} 自称官方，与二手托管矛盾"
            report.findings.append(Finding(
                kind=KIND_SECONDARY,
                market=code,
                rule_id=rule_id,
                field="official_url",
                host=canonical,
                downgrade_marked=marked,
                message=(f"official_url 落在二手汇编 {canonical}（{SECONDARY_DOMAINS.get(canonical, '--extra-secondary 传入')}）"
                         + ("" if marked else "；说明字段未标注「非政府/二手/降级」")
                         + tier_note),
            ))
        elif not is_http_url(url):
            report.missing_url += 1
            report.findings.append(Finding(
                kind=KIND_MISSING_URL,
                market=code,
                rule_id=rule_id,
                field="official_url",
                host=host,
                message=f"official_url 缺失或不是绝对的 http(s) 地址：{url!r}",
            ))
        elif kind == "archive":
            report.archive += 1
            report.official += 1
        else:
            report.official += 1

        if host:
            bucket = report.domains.setdefault(host, {"kind": kind or "official", "count": 0})
            bucket["count"] += 1

        # 2) 说明与 URL 不一致（URL 已不是二手源，说明里还留着二手源的名字）
        for name in NOTE_FIELDS:
            value = rule.get(name)
            if not isinstance(value, str):
                continue
            for canonical in mentioned_as_source(value, secondary):
                if host_matches(host, canonical):
                    continue  # URL 就是它，属于第 1 段，不是残留
                report.note_mismatch += 1
                report.findings.append(Finding(
                    kind=KIND_NOTE_RESIDUE,
                    market=code,
                    rule_id=rule_id,
                    field=name,
                    host=canonical,
                    message=(f"{name} 仍写着 {canonical}（{SECONDARY_DOMAINS.get(canonical, canonical)}），"
                             f"但 official_url 指向 {host or '（空）'}"),
                ))
    return report


def build_report(root: str, wanted: Sequence[str], extra_secondary: Sequence[str]) -> dict:
    # 保序去重：--extra-secondary 传了内置清单里已有的域不该让它算两遍
    secondary: list[str] = []
    for domain in list(SECONDARY_DOMAINS) + [d.strip().lower().strip(".") for d in extra_secondary]:
        if domain and domain not in secondary:
            secondary.append(domain)
    markets = discover_markets(root, wanted)
    reports = [audit_market(code, dirname, path, root, secondary) for code, dirname, path in markets]

    totals = {
        "markets": len(reports),
        "rules": sum(r.rules for r in reports),
        "official": sum(r.official for r in reports),
        "secondary": sum(r.secondary for r in reports),
        "archive": sum(r.archive for r in reports),
        "pending_downgrade": sum(r.pending_downgrade for r in reports),
        "note_mismatch": sum(r.note_mismatch for r in reports),
        "missing_official_url": sum(r.missing_url for r in reports),
    }
    totals["official_share"] = round(totals["official"] / totals["rules"], 4) if totals["rules"] else 0.0
    findings = [f for r in reports for f in r.findings]
    return {
        "generated_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "root": os.path.abspath(root),
        "ok": not any(f.kind in (KIND_SECONDARY, KIND_NOTE_RESIDUE, KIND_MISSING_URL) for f in findings),
        "markers": {
            "secondary_domains": {d: SECONDARY_DOMAINS.get(d, "（--extra-secondary 传入）") for d in secondary},
            "note_fields": list(NOTE_FIELDS),
            "downgrade_markers": list(DOWNGRADE_MARKERS),
            "archive_domains": list(ARCHIVE_DOMAINS),
        },
        "totals": totals,
        "markets": [r.as_dict() for r in reports],
        "findings": [f.as_dict() for f in findings],
    }


# ---------------------------------------------------------------- 人读报表

def format_text(report: dict) -> str:
    t = report["totals"]
    out: list[str] = []
    out.append(f"来源域审计：{t['markets']} 国 / {t['rules']} 条规则")
    out.append(
        f"  官方 {t['official']} 条（{t['official_share'] * 100:.1f}%）"
        f" | 二手域 {t['secondary']} 条"
        f" | 说明不一致 {t['note_mismatch']} 条"
        f" | 待降级 {t['pending_downgrade']} 条"
    )
    if t["archive"]:
        out.append(f"  其中 {t['archive']} 条为官方页存档快照（web.archive.org 等），按口径计入官方")
    out.append("")
    out.append("按市场：")
    for m in report["markets"]:
        top = [f"{d['host']} {d['count']}" for d in m["domains"] if d["kind"] != "secondary"][:3]
        tail = ", ".join(top) if top else "—"
        flags = []
        if m["secondary"]:
            flags.append(f"二手 {m['secondary']}")
        if m["note_mismatch"]:
            flags.append(f"说明不一致 {m['note_mismatch']}")
        if m["pending_downgrade"]:
            flags.append(f"待降级 {m['pending_downgrade']}")
        if m["missing_official_url"]:
            flags.append(f"缺 URL {m['missing_official_url']}")
        line = (f"  {m['market']} {m['market_name']}: {m['rules']} 条，官方 {m['official']}"
                f"（{m['official_share'] * 100:.1f}%）；" + ("；".join(flags) if flags else "无问题"))
        out.append(line)
        out.append(f"      主要官方域：{tail}")
    if report["findings"]:
        out.append("")
        out.append("问题条目：")
        labels = {
            KIND_SECONDARY: "[二手域]",
            KIND_NOTE_RESIDUE: "[说明残留]",
            KIND_MISSING_URL: "[缺 URL]",
        }
        for f in report["findings"]:
            out.append(f"  {labels.get(f['kind'], '[' + f['kind'] + ']')} {f['rule_id']}（{f['field']}）：{f['message']}")
    else:
        out.append("")
        out.append("没有二手域，也没有说明不一致。")
    return "\n".join(out)


# ---------------------------------------------------------------- CLI

def parse_markets(raw: Iterable[str]) -> list[str]:
    codes: list[str] = []
    for chunk in raw:
        for part in chunk.replace("，", ",").split(","):
            code = part.strip().upper()
            if code and code not in codes:
                codes.append(code)
    return codes


def main(argv: Sequence[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        prog="audit_sources.py",
        description="审计法条库的来源域：二手汇编命中、说明与 URL 不一致、每国官方域分布。",
        epilog=(
            "退出码：0 干净（或 --warn-only）；1 有二手域或说明不一致；2 输入有问题。\n"
            "示例：python3 agent/knowledge/legal/scripts/audit_sources.py --market MY --json"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--market", action="append", metavar="CC", default=[],
                    help="只审计指定市场，可重复或逗号分隔（如 --market MY 或 --market EG,GH）；默认全部")
    ap.add_argument("--json", action="store_true", help="输出机器可读 JSON（下游脚本用）")
    ap.add_argument("--warn-only", action="store_true", help="只报告，不因发现问题而改退出码（恒 0）")
    ap.add_argument("--root", default=ROOT_DEFAULT, metavar="DIR",
                    help="法条库根目录（默认为脚本上一级，即 agent/knowledge/legal）")
    ap.add_argument("--extra-secondary", action="append", metavar="HOST", default=[],
                    help="临时追加二手汇编域（可重复），不写入脚本常量")
    args = ap.parse_args(argv)

    root = os.path.abspath(os.path.expanduser(args.root))
    if not os.path.isdir(root):
        print(f"错误：--root 不是目录：{root}", file=sys.stderr)
        return 2

    try:
        report = build_report(root, parse_markets(args.market), args.extra_secondary)
    except InputError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(format_text(report))

    if args.warn_only:
        return 0
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
