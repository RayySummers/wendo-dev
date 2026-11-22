#!/usr/bin/env python3
"""从各国 rules.v0.1.json 重建 index.json 的计数与 README 的目录树 / 状态表。

背景：每加一个国家都要改 index.json 和 README.md，多人多单并行时必然连环冲突。
约定改为：**新增国家只提交 rules / README / SOURCES / SAMPLE_FINDINGS，不动 index.json 与总 README**，
合并后在 master 上跑一次本脚本，由它统一重建。

字段约定：`open`（市场是否对产品开放）由人显式声明，不参与重建。
脚本只做校验——缺失或非布尔时置 `false` 并记入 problems，绝不由 `tier` 或规则数反推开放状态。

`--check` 另校验两处**文字**字段与落地状态是否自相矛盾（RAY-764 起）：
规则已落地（rules_count > 0）却仍在 `known_gaps` 写「尚未落地 / 未落地 / todo」，
或有规则但 `coverage` 为空。这两项是研究结论，脚本不自动改写，只报出来等人改。

用法：
    python3 agent/knowledge/legal/scripts/sync_index.py            # 重建并写入
    python3 agent/knowledge/legal/scripts/sync_index.py --check    # 只检查，不一致就非零退出
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.json")
README = os.path.join(ROOT, "README.md")

# 规则已落地、known_gaps 却还写着「尚未落地」的迹象。只匹配「未落地」这个词族与工单
# 状态词 todo，不匹配裸「落地」——「落地后同步计数」这类历史措辞本身不矛盾。
# 依据是 RAY-764：KW/BH/JO/TZ 四国规则文件早已提交，index 却一直写「尚未落地」，
# 而 --check 只比对计数，所以陈旧状态连续多单没被发现。
STALE_GAP_PATTERN = re.compile(r"尚未落地|未落地|(?<![a-z])todo(?![a-z])", re.I)


def check_market_metadata(m: dict, rules: list) -> list[str]:
    """校验 coverage / known_gaps 与「规则是否已落地」是否自相矛盾。

    只报问题，不自动改写：coverage 与 known_gaps 是研究结论，得由人从 README /
    SOURCES 里提炼，脚本猜不出来。两种模式都会调用本函数，但只有 --check 会因此
    非零退出；重建模式只把它打印成「待人工处理」，因为跑脚本本身修不好这类问题。
    """
    if not rules:
        # 没有规则的市场（如 CA）写「尚未落地」是对的，不是矛盾。
        return []
    cc = m["market"]
    problems: list[str] = []
    gaps = m.get("known_gaps") or []
    if not isinstance(gaps, list):
        problems.append(f"{cc}.known_gaps: 必须是数组，实际是 {type(gaps).__name__}")
        gaps = []
    stale = [g for g in gaps if isinstance(g, str) and STALE_GAP_PATTERN.search(g)]
    if stale:
        problems.append(
            f"{cc}.known_gaps 与其落地状态矛盾：已落地 {len(rules)} 条规则，"
            f"但仍写着「{stale[0][:40]}…」——换成真实缺口（从 README 的 open questions 提炼）"
        )
    coverage = m.get("coverage") or []
    if not isinstance(coverage, list):
        problems.append(f"{cc}.coverage: 必须是数组，实际是 {type(coverage).__name__}")
    elif not coverage:
        problems.append(f"{cc}: 有规则但 coverage 为空——按法规族补一句覆盖范围（参照 MY/QA 的写法）")
    return problems


def load_rules(cc: str):
    path = os.path.join(ROOT, cc, "rules.v0.1.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)
    rules = data.get("rules", data)
    last = data.get("last_verified") if isinstance(data, dict) else None
    if not last:
        dates = [r.get("last_verified") for r in rules if r.get("last_verified")]
        last = max(dates) if dates else None
    return rules, last


def sync_index(check: bool) -> tuple[list[str], list[str], int]:
    """返回 (计数类 problems, 元数据类 problems, 已改动字段数)。

    两类分开返回是因为处理方式不同：计数类由本脚本自动重建修好；元数据类
    （coverage / known_gaps）是研究结论，脚本修不了，只能报出来等人改。
    """
    with open(INDEX, encoding="utf-8") as fh:
        idx = json.load(fh)
    problems: list[str] = []
    meta_problems: list[str] = []
    changed = 0
    for m in idx["markets"]:
        # open 是产品开关，只能由人显式声明：这里只补默认值并报错，不从 tier / rules_count 推断。
        # 必须早于 load_rules() 的 continue，否则没有 rules 文件的市场（如 CA）会漏检。
        if not isinstance(m.get("open"), bool):
            problems.append(f"{m['market']}.open: {m.get('open')!r} → False（必须是显式布尔，缺失或类型错误时默认不开放）")
            m["open"] = False
            changed += 1
        cc = m["market"].lower()
        loaded = load_rules(cc)
        if loaded is None:
            if m.get("rules_count"):
                problems.append(f"{m['market']}: index 记为已落地，但没有 rules 文件")
            continue
        rules, last_verified = loaded
        # 元数据矛盾只做校验，不自动改写：coverage / known_gaps 得由人从 README 提炼。
        meta_problems.extend(check_market_metadata(m, rules))
        laws = len({r.get("law_name") for r in rules if r.get("law_name")})
        want = {
            "status": "v0.1",
            "rules_count": len(rules),
            "rules_file": f"{cc}/rules.v0.1.json",
            "readme": f"{cc}/README.md",
            "sources": f"{cc}/SOURCES.md",
        }
        # laws_count 早期是按「法规族」人工归并的（与 law_name 去重数不等），只在空值时填。
        if not m.get("laws_count"):
            want["laws_count"] = laws
        if last_verified:
            want["last_verified"] = last_verified
        for k, v in want.items():
            if m.get(k) != v:
                problems.append(f"{m['market']}.{k}: {m.get(k)!r} → {v!r}")
                m[k] = v
                changed += 1
    if check:
        return problems, meta_problems, 0
    if changed:
        idx["updated_at"] = __import__("datetime").datetime.now().astimezone().isoformat(timespec="seconds")
        with open(INDEX, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(idx, ensure_ascii=False, indent=2) + "\n")
    return problems, meta_problems, changed


def sync_readme() -> None:
    with open(INDEX, encoding="utf-8") as fh:
        idx = json.load(fh)
    mkts = idx["markets"]
    present = [m for m in mkts if os.path.exists(os.path.join(ROOT, m["market"].lower(), "rules.v0.1.json"))]

    tree = ["```", "agent/knowledge/legal/",
            "├── index.json              # 机器可读索引：市场、梯队、状态、规则数、roadmap",
            "├── README.md               # 本文件：方法、字段、扩展流程"]
    for i, m in enumerate(present):
        cc = m["market"].lower()
        branch = "└──" if i == len(present) - 1 else "├──"
        tree += [f"{branch} {cc}/                     # {m['market_name']}（{m['market']}）",
                 f"│   ├── rules.v0.1.json     # {m['rules_count']} 条规则（JSON）",
                 "│   ├── README.md", "│   ├── SOURCES.md", "│   └── SAMPLE_FINDINGS.md"]
        if i == len(present) - 1:
            tree.append("└── <market>/               # 新市场落地后按 index.json 顺序新增")
    tree.append("```")

    with open(README, encoding="utf-8") as fh:
        text = fh.read()
    text = re.sub(r"```\nagent/knowledge/legal/\n.*?\n```", "\n".join(tree), text, count=1, flags=re.S)

    def upd(line: str) -> str:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 7:
            return line
        hit = re.search(r"（([A-Z]{2})）", cells[0])
        if not hit:
            return line
        entry = next((x for x in mkts if x["market"] == hit.group(1)), None)
        if not entry or not entry.get("rules_count"):
            return line
        cells[3] = "v0.1"
        cells[4] = f"{entry['rules_count']} / {entry['laws_count']}"
        cells[5] = entry.get("last_verified") or "—"
        cells[6] = "已落地；coverage 与 known_gaps 见 index.json"
        return "| " + " | ".join(cells) + " |"

    text = "\n".join(upd(ln) if ln.startswith("| ") and re.search(r"（[A-Z]{2}）", ln) else ln
                     for ln in text.split("\n"))
    with open(README, "w", encoding="utf-8") as fh:
        fh.write(text)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="只检查，不写文件")
    args = ap.parse_args()
    problems, meta_problems, changed = sync_index(args.check)
    # 元数据矛盾（coverage 空 / known_gaps 与落地状态矛盾）两种模式都报，但只有 --check 会因此失败：
    # 重建模式改不动它们，报成失败只会让人以为跑一次脚本就能修好。
    if args.check:
        if problems or meta_problems:
            if problems:
                print("index 与规则文件不一致：")
                for p in problems:
                    print("  -", p)
            if meta_problems:
                print("index 元数据与落地状态矛盾（脚本不自动改写，需人工按 README 提炼）：")
                for p in meta_problems:
                    print("  -", p)
            return 1
        print("index 与规则文件一致")
        return 0
    sync_readme()
    print(f"已重建 index.json 与 README.md（{changed} 处计数更新）")
    if meta_problems:
        print("另有元数据矛盾待人工处理（本脚本不改写）：")
        for p in meta_problems:
            print("  -", p)
    return 0


if __name__ == "__main__":
    sys.exit(main())
