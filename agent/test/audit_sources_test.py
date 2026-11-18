#!/usr/bin/env python3
"""audit_sources.py 的离线夹具测试（不联网）。

    python3 agent/test/audit_sources_test.py

为什么要这个测试：脚本第 2 段检查（「说明里还写着二手汇编，但 URL 已经换掉」）在
2026-11-18 的全库数据上是 0 命中——这正是它在起作用时的样子。没有夹具的话，这段
代码到下一次 PK 那类残留出现之前都不会被执行到，坏了也发现不了。

夹具一律建在临时目录里，不碰 `agent/knowledge/legal/` 的真实数据。
"""
from __future__ import annotations

import contextlib
import io
import json
import sys
import tempfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "knowledge" / "legal" / "scripts"
sys.path.insert(0, str(SCRIPTS))

import audit_sources as audit  # noqa: E402

FAILURES: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    if condition:
        print(f"ok   {name}")
    else:
        FAILURES.append(f"{name}{(' — ' + detail) if detail else ''}")


def make_root(tmp: Path, markets: dict[str, object]) -> Path:
    """在 tmp 下按 {市场代码: rules 数据} 造一棵 legal/ 树。数据是 str 时原样写盘（用来造坏 JSON）。"""
    for code, data in markets.items():
        d = tmp / code.lower()
        d.mkdir(parents=True)
        text = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False)
        (d / "rules.v0.1.json").write_text(text, encoding="utf-8")
    return tmp


def run(root: Path, *argv: str) -> int:
    """跑 main() 取退出码，把报表 stdout 收掉（测试只看退出码，不想刷屏）。"""
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        return audit.main(["--root", str(root), *argv])


def main() -> int:
    # ---- 1) URL 换了、说明还留着二手源的名字（PK 那批 FAOLEX 残留的模式）
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": {"market": "XX", "market_name": "测试国", "rules": [
            {"id": "XX-A-01", "official_url": "https://example.gov.xx/act.pdf",
             "official_url_note": "引文取自官方站点", "notes": "本 PDF 为 FAOLEX 存档版本"},
        ]}})
        rep = audit.build_report(str(root), [], [])
        kinds = {f["kind"] for f in rep["findings"]}
        check("说明残留被识别", audit.KIND_NOTE_RESIDUE in kinds, str(kinds))
        check("说明残留不重复计入二手域", rep["totals"]["secondary"] == 0, str(rep["totals"]))
        check("说明残留使报告 not ok", rep["ok"] is False)
        check("说明残留退出码 1", run(root) == 1)
        check("--warn-only 恒 0", run(root, "--warn-only") == 0)

    # ---- 2) URL 本身就是二手源：算二手域；未标注「非政府/二手/降级」时进待降级
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": {"market": "XX", "rules": [
            {"id": "XX-A-01", "official_url": "https://faolex.fao.org/docs/pdf/x.pdf",
             "official_url_note": "FAOLEX 托管的公报影印本"},
            {"id": "XX-A-02", "official_url": "https://www.dataguidance.com/x.pdf",
             "official_url_note": "非政府域名：商业法律库托管的原文"},
        ]}})
        rep = audit.build_report(str(root), [], [])
        t = rep["totals"]
        check("二手域计 2 条", t["secondary"] == 2, str(t))
        check("只有未标注的那条进待降级", t["pending_downgrade"] == 1, str(t))
        # URL 就是二手源本身时，说明里再提一次不算「不一致」
        check("同源提及不算说明残留", t["note_mismatch"] == 0, str(t))
        hosts = {f["host"] for f in rep["findings"] if f["kind"] == audit.KIND_SECONDARY}
        check("二手域报告用规范域名", hosts == {"faolex.fao.org", "dataguidance.com"}, str(hosts))

    # ---- 2b) source_tier 自称 official_* 却指向二手源：要在 finding 里点出来
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": {"market": "XX", "rules": [
            {"id": "XX-A-01", "official_url": "https://faolex.fao.org/x.pdf",
             "source_tier": "official_statute", "notes": "非政府域名：FAOLEX 影印本"},
            {"id": "XX-A-02", "official_url": "https://faolex.fao.org/y.pdf",
             "source_tier": "secondary_scan", "notes": "二手"},
        ]}})
        msgs = {f["rule_id"]: f["message"] for f in audit.build_report(str(root), [], [])["findings"]}
        check("tier 自称官方的矛盾被指出",
              "自称官方" in msgs.get("XX-A-01", ""), str(msgs))
        check("tier 本就不称官方的不误报",
              "自称官方" not in msgs.get("XX-A-02", ""), str(msgs))

    # ---- 3) 官方页的 Wayback 快照算官方，不算二手
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": {"market": "XX", "rules": [
            {"id": "XX-A-01",
             "official_url": "https://web.archive.org/web/2024/https://example.gov.xx/c.pdf",
             "notes": "Wayback 快照"},
        ]}})
        rep = audit.build_report(str(root), [], [])
        t = rep["totals"]
        check("存档快照计入官方", t["official"] == 1 and t["secondary"] == 0, str(t))
        check("存档快照单独计数", t["archive"] == 1, str(t))
        check("纯官方快照退出码 0", run(root) == 0)

    # ---- 4) 缺 official_url / 相对路径 / 非 http 协议都是缺陷，不是「干净」
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": {"market": "XX", "rules": [
            {"id": "XX-A-01", "official_url": "", "notes": "缺 URL"},
            {"id": "XX-A-02", "notes": "字段都没有"},
            {"id": "XX-A-03", "official_url": "./local/act.pdf", "notes": "相对路径"},
            {"id": "XX-A-04", "official_url": "ftp://example.gov.xx/a.pdf", "notes": "非 http"},
        ]}})
        rep = audit.build_report(str(root), [], [])
        check("缺 URL / 相对路径 / 非 http 共 4 条", rep["totals"]["missing_official_url"] == 4, str(rep["totals"]))
        check("缺 URL 退出码 1", run(root) == 1)

    # ---- 5) --market 过滤与错误输入
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {
            "xx": {"market": "XX", "rules": [
                {"id": "XX-A-01", "official_url": "https://faolex.fao.org/x.pdf", "notes": "二手"}]},
            "yy": {"market": "YY", "rules": [
                {"id": "YY-A-01", "official_url": "https://example.gov.yy/x.pdf", "notes": "ok"}]},
        })
        rep = audit.build_report(str(root), ["YY"], [])
        check("--market 只审指定市场", rep["totals"]["markets"] == 1 and rep["totals"]["rules"] == 1, str(rep["totals"]))
        check("过滤掉问题市场后退出码 0", run(root, "--market", "YY") == 0)
        check("过滤掉干净市场后退出码 1", run(root, "--market", "XX") == 1)
        check("逗号分隔多市场", audit.build_report(str(root), ["XX", "YY"], [])["totals"]["markets"] == 2)
        check("未知市场退出码 2", run(root, "--market", "ZZ") == 2)

    # ---- 6) 坏输入有清晰报错（退出码 2），不是崩栈
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": '{"market": "XX", "rules": ['})
        check("坏 JSON 退出码 2", run(root) == 2)
    with tempfile.TemporaryDirectory() as td:
        root = make_root(Path(td), {"xx": {"market": "XX", "rules": "not-a-list"}})
        check("rules 非数组退出码 2", run(root) == 2)
    check("--root 不存在退出码 2", audit.main(["--root", "/nonexistent-audit-root"]) == 2)

    # ---- 7) 空库不算失败
    with tempfile.TemporaryDirectory() as td:
        check("空目录退出码 0", run(Path(td)) == 0)

    # ---- 8) 主机归一化：大小写 / 端口 / 子域 / 末尾点
    check("大写主机归一化", audit.normalize_host("HTTPS://FAOLEX.FAO.ORG/x.pdf") == "faolex.fao.org")
    check("去端口", audit.normalize_host("https://faolex.fao.org:443/x.pdf") == "faolex.fao.org")
    check("去末尾点", audit.normalize_host("https://faolex.fao.org./x.pdf") == "faolex.fao.org")
    check("子域命中", audit.host_matches("www.dataguidance.com", "dataguidance.com"))
    check("非子域不误命中", not audit.host_matches("notdataguidance.com", "dataguidance.com"))
    check("空 URL 主机为空", audit.normalize_host("") == "")
    check("非 http 串不崩", audit.normalize_host("not a url") == "")

    # ---- 9) 真实库：只断言不会随换源漂移的结构不变式
    #
    # 这里刻意不钉死「871 官方 / 12 二手」——那正是 RAY-757/758/759 要改掉的数字，
    # 钉死它等于让测试在换源合入的那天自己红。今天的基线写在 README 的「基线」小节，
    # 换源推进后由人跟着更新。测试只保证分类不重不漏、总数对得上。
    real = SCRIPTS.parent
    if (real / "index.json").exists():
        rep = audit.build_report(str(real), [], [])
        t = rep["totals"]
        per_rule_sum = sum(m["rules"] for m in rep["markets"])
        check("真实库：市场条数之和等于总数", per_rule_sum == t["rules"], f"{per_rule_sum} vs {t['rules']}")
        check("真实库：官方+二手+缺URL 等于规则总数",
              t["official"] + t["secondary"] + t["missing_official_url"] == t["rules"], str(t))
        check("真实库：每个市场分类不重不漏",
              all(m["official"] + m["secondary"] + m["missing_official_url"] == m["rules"]
                  for m in rep["markets"]),
              str([(m["market"], m["rules"]) for m in rep["markets"]
                   if m["official"] + m["secondary"] + m["missing_official_url"] != m["rules"]]))
        check("真实库：findings 条数等于三类问题之和",
              len(rep["findings"]) == t["secondary"] + t["note_mismatch"] + t["missing_official_url"],
              str(t))
        check("真实库：官方占比与计数自洽",
              abs(t["official_share"] - t["official"] / t["rules"]) < 1e-4 if t["rules"] else True,
              str(t))
        # 换源完成后这条会变成 0；在那之前它至少必须是个已知的小数字，不是失控。
        check("真实库：二手域条数不超过 12（RAY-756 的起点，只应下降）", t["secondary"] <= 12, str(t["secondary"]))
        pk = audit.build_report(str(real), ["PK"], [])
        check("PK 修完后二手为 0", pk["totals"]["secondary"] == 0, str(pk["totals"]))

    if FAILURES:
        print(f"\n{len(FAILURES)} 项失败：")
        for f in FAILURES:
            print("  -", f)
        return 1
    print("\n全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
