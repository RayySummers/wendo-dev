#!/usr/bin/env python3
"""从各国 rules.v0.1.json 重建 index.json 的计数与 README 的目录树 / 状态表。

背景：每加一个国家都要改 index.json 和 README.md，多人多单并行时必然连环冲突。
约定改为：**新增国家只提交 rules / README / SOURCES / SAMPLE_FINDINGS，不动 index.json 与总 README**，
合并后在 master 上跑一次本脚本，由它统一重建。

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


def sync_index(check: bool) -> list[str]:
    with open(INDEX, encoding="utf-8") as fh:
        idx = json.load(fh)
    problems: list[str] = []
    changed = 0
    for m in idx["markets"]:
        cc = m["market"].lower()
        loaded = load_rules(cc)
        if loaded is None:
            if m.get("rules_count"):
                problems.append(f"{m['market']}: index 记为已落地，但没有 rules 文件")
            continue
        rules, last_verified = loaded
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
        return problems
    if changed:
        idx["updated_at"] = __import__("datetime").datetime.now().astimezone().isoformat(timespec="seconds")
        with open(INDEX, "w", encoding="utf-8") as fh:
            fh.write(json.dumps(idx, ensure_ascii=False, indent=2) + "\n")
    return problems


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
    problems = sync_index(args.check)
    if args.check:
        if problems:
            print("index 与规则文件不一致：")
            for p in problems:
                print("  -", p)
            return 1
        print("index 与规则文件一致")
        return 0
    sync_readme()
    print(f"已重建 index.json 与 README.md（{len(problems)} 处计数更新）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
