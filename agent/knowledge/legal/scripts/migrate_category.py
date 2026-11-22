#!/usr/bin/env python3
"""把规则级自由文本 `category` 迁移为受控词表 `product_scope`（RAY-751）。

背景
----
`category` 是自由文本：883 条规则里出现 29 种写法，同一字段同时承担「产品品类」
与「合规主题」两件事。RAY-743 原计划拆成 `product_scope` + `topic`，全量审计证明
`topic` 无法从 `category` 推出（615 条只有品类词，硬跑只能得到空数组），因此
RAY-751 只做确定性的那一半：**品类**。本脚本不引入 `topic`。

脚本只做三件事，其余字段一概不动：

1. `category` 原值 → `product_scope` 数组。映射表 29 条逐字写全，**不做任何前缀 /
   拆分 / 模糊匹配**；遇到表里没有的取值直接报错退出，宁可停下也不猜。
2. 原字段原样保留为 `category_legacy`，紧跟在 `product_scope` 下一行，便于回溯。
3. 回写前断言：把插入的两行换回原 `category` 行后必须逐字节还原成迁移前的文件，
   且每条规则除 `product_scope` / `category_legacy` 外与迁移前完全一致（键序也一样）。

`通用` 是通配符——「适用于所有品类」，不是「一个叫通用的品类」。词表与读取端
约束见 ../README.md 的「规则字段」与「product_scope 词表」两节。

用法
----
    python3 scripts/migrate_category.py                    # 干跑：逐值统计 + 迁移前 ID 摘要
    python3 scripts/migrate_category.py --write            # 就地迁移 25 个 rules.v0.1.json
    python3 scripts/migrate_category.py --check            # 校验已迁移状态（结构 / 词表 / ID 对账）
    python3 scripts/migrate_category.py --check --baseline # 另比对 RAY-743 的逐值审核基线

ID 摘要口径：883 个 `id` 排序后用 `\\n` 拼接，取 sha256（迁移不改 ID，前後必须相同）。
"""
from __future__ import annotations

import argparse
import glob
import hashlib
import json
import os
import re
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.json")

WILDCARD = "通用"
PRODUCT_SCOPE_VALUES = ("通用", "小家电", "3C数码", "家居用品", "食品接触材料")

# 29 种旧写法 → product_scope。顺序与 RAY-743 评论区审计表一致，条数是 Cale 的逐值统计。
# 纯词形归一：`3C 数码`（带空格）→ `3C数码`；`家居` / `家居化学品` / `清洁用品` → `家居用品`；
# `食品接触` / `接触食品` → `食品接触材料`。
#
# 注意 `隐私` / `营销` / `隐私/营销` / `营销/语言` 这 4 个旧值（合计 22 条）只有主题没有
# 品类词。它们和 `通用` 一样「不区分品类」，因此 product_scope 取 `通用`（通配），
# 而不是空数组——空数组会让这 22 条对所有品类筛选都不可见，等于把本单要修的漏检
# 换个地方重演。这一点在 RAY-743 审计表里标了 ⚠，本单按表落地。
CATEGORY_TO_PRODUCT_SCOPE = {
    "通用": ("通用",),
    "通用/电商": ("通用",),
    "小家电": ("小家电",),
    "3C 数码": ("3C数码",),
    "小家电/3C 数码": ("小家电", "3C数码"),
    "小家电/3C 数码/家居用品": ("小家电", "3C数码", "家居用品"),
    "通用/隐私": ("通用",),
    "隐私/营销": ("通用",),
    "通用/网站": ("通用",),
    "隐私": ("通用",),
    "家居用品（家居化学品/清洁用品）": ("家居用品",),
    "家居用品": ("家居用品",),
    "小家电/家居用品/3C 数码": ("小家电", "家居用品", "3C数码"),
    "小家电/接触食品": ("小家电", "食品接触材料"),
    "营销": ("通用",),
    "通用/价格": ("通用",),
    "通用/准入": ("通用",),
    "通用/小家电/3C 数码": ("通用", "小家电", "3C数码"),
    "家居": ("家居用品",),
    "通用/计量": ("通用",),
    "家居/食品接触": ("家居用品", "食品接触材料"),
    "家居用品/小家电": ("家居用品", "小家电"),
    "通用/保修": ("通用",),
    "小家电/家居用品": ("小家电", "家居用品"),
    "小家电/食品接触": ("小家电", "食品接触材料"),
    "营销/语言": ("通用",),
    "通用/3C 数码": ("通用", "3C数码"),
    "通用/小家电": ("通用", "小家电"),
    "通用/跨境电商": ("通用",),
    # 2026-11-22 合入 LK v0.2（RAY-762）时新增：这四个取值都是主题，不是产品品类，
    # 与上面「隐私 / 营销 / 保修 / 电商渠道」同一处理口径，记「通用」覆盖全品类。
    "标签": ("通用",),
    "担保": ("通用",),
    "罚则": ("通用",),
    "电商": ("通用",),
}

# RAY-743 审计基线（wendo-dev HEAD f4890dd，25 国、883 条、29 种写法）。
BASELINE_RULE_COUNT = 883
BASELINE_SCOPE_HITS = 981
BASELINE_RAW_CATEGORY_COUNTS = {
    "通用": 341,
    "通用/电商": 214,
    "小家电": 113,
    "3C 数码": 71,
    "小家电/3C 数码": 42,
    "小家电/3C 数码/家居用品": 14,
    "通用/隐私": 11,
    "隐私/营销": 10,
    "隐私": 7,
    "通用/网站": 7,
    "家居用品（家居化学品/清洁用品）": 6,
    "家居用品": 5,
    "通用/小家电/3C 数码": 4,
    "通用/准入": 4,
    "小家电/接触食品": 4,
    "营销": 4,
    "小家电/家居用品/3C 数码": 4,
    "通用/价格": 4,
    "家居": 3,
    "通用/计量": 3,
    "家居用品/小家电": 2,
    "家居/食品接触": 2,
    "通用/保修": 2,
    "通用/跨境电商": 1,
    "通用/3C 数码": 1,
    "通用/小家电": 1,
    "小家电/家居用品": 1,
    "营销/语言": 1,
    "小家电/食品接触": 1,
}
BASELINE_PER_MARKET = {
    "ae": 33, "au": 45, "bd": 28, "bh": 31, "bn": 40, "eg": 31, "gh": 33,
    "jo": 30, "ke": 34, "kw": 24, "lk": 28, "mt": 54, "my": 45, "ng": 26,
    "nz": 31, "om": 40, "ph": 37, "pk": 35, "qa": 35, "sa": 34, "sg": 42,
    "tz": 28, "uk": 43, "us": 35, "za": 41,
}

CATEGORY_LINE = re.compile(r'^(?P<indent>[ \t]*)"category": (?P<value>"(?:[^"\\]|\\.)*")(?P<comma>,?)$')


class MigrationError(RuntimeError):
    pass


def rules_files() -> list[str]:
    return sorted(glob.glob(os.path.join(ROOT, "*", "rules.v0.1.json")))


def load_rules(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)
    rules = data.get("rules", data)
    if not isinstance(rules, list):
        raise MigrationError(f"{path}: 解析不出 rules 数组")
    return rules


def id_digest(ids) -> tuple[str, int]:
    payload = "\n".join(sorted(ids)).encode("utf-8")
    return hashlib.sha256(payload).hexdigest(), len(payload)


def migrate_text(text: str, path: str) -> str:
    """把 `"category": "..."` 行就地替换成两行，其余文本一个字节都不动。"""
    data = json.loads(text)
    rules = data.get("rules", data)
    out: list[str] = []
    undo: dict[int, str] = {}
    i = 0
    for line in text.split("\n"):
        m = CATEGORY_LINE.match(line)
        if not m:
            out.append(line)
            continue
        if i >= len(rules):
            raise MigrationError(f"{path}: category 行比规则条数还多（第 {i + 1} 条起）")
        rule = rules[i]
        legacy = json.loads(m.group("value"))
        if legacy != rule.get("category"):
            raise MigrationError(
                f"{path}: 第 {i + 1} 条规则行序与 JSON 顺序不一致（行上是 {legacy!r}，JSON 里是 {rule.get('category')!r}）"
            )
        try:
            scope = CATEGORY_TO_PRODUCT_SCOPE[legacy]
        except KeyError:
            raise MigrationError(
                f"{path} 规则 {rule.get('id')}: 未知 category {legacy!r}，映射表里没有这个写法；"
                "按 RAY-751 要求不做模糊匹配，请先补映射表"
            ) from None
        indent = m.group("indent")
        scope_line = f'{indent}"product_scope": {json.dumps(list(scope), ensure_ascii=False)},'
        legacy_line = f'{indent}"category_legacy": {m.group("value")}{m.group("comma")}'
        undo[len(out)] = line
        out.append(scope_line)
        out.append(legacy_line)
        i += 1

    if i != len(rules):
        raise MigrationError(f"{path}: 找到 {i} 个 category 行，但有 {len(rules)} 条规则")

    new_text = "\n".join(out)
    new_data = json.loads(new_text)

    # 文本校验：把插入的两行换回原来的 category 行，必须逐字节还原成迁移前的文件。
    # 这条断言保证除 category 那一行外，缩进、空行、数组内联写法、键序一个字节都没变。
    rebuilt: list[str] = []
    j = 0
    while j < len(out):
        if j in undo:
            rebuilt.append(undo[j])
            j += 2
        else:
            rebuilt.append(out[j])
            j += 1
    if "\n".join(rebuilt) != text:
        raise MigrationError(f"{path}: 改写后无法逐字节还原成原文件，格式会漂移，已中止")

    for old_rule, new_rule in zip(rules, new_data["rules"]):
        legacy = old_rule["category"]
        want = {k: v for k, v in old_rule.items() if k != "category"}
        want["product_scope"] = list(CATEGORY_TO_PRODUCT_SCOPE[legacy])
        want["category_legacy"] = legacy
        if new_rule != want:
            raise MigrationError(f"{path}: 规则 {old_rule.get('id')} 除两个新字段外还有别的差异")
        want_order: list[str] = []
        for key in old_rule:
            if key == "category":
                want_order += ["product_scope", "category_legacy"]
            else:
                want_order.append(key)
        if list(new_rule) != want_order:
            raise MigrationError(f"{path}: 规则 {old_rule.get('id')} 键序不一致")
    return new_text


def write_atomic(path: str, text: str) -> None:
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path), prefix=".migrate-", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
        os.replace(tmp, path)
    except BaseException:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise


def report_counts(counts: dict[str, int], hits: dict[str, int], total_hits: int) -> None:
    print("旧写法 → product_scope（条数 / 展开后命中数）")
    for legacy in sorted(counts, key=lambda v: (-counts[v], v)):
        scope = ", ".join(CATEGORY_TO_PRODUCT_SCOPE[legacy])
        print(f"  {legacy:<24} {counts[legacy]:>4} 条  → [{scope}]")
    print()
    print(f"品类命中数（product_scope 长度之和）：{total_hits}")
    for value in PRODUCT_SCOPE_VALUES:
        raw = sum(n for legacy, n in counts.items() if CATEGORY_TO_PRODUCT_SCOPE[legacy] == (value,))
        print(f"  {value:<8} 展开后 {hits.get(value, 0):>4} 条   （其中 {raw} 条来自只含该品类的单一旧写法）")


def dry_run(baseline: bool) -> int:
    files = rules_files()
    if not files:
        print(f"在 {ROOT} 下没找到任何 */rules.v0.1.json", file=sys.stderr)
        return 1
    counts: dict[str, int] = {}
    hits: dict[str, int] = {}
    total_hits = 0
    total_rules = 0
    per_market: dict[str, int] = {}
    ids: list[str] = []
    problems: list[str] = []
    for path in files:
        cc = os.path.basename(os.path.dirname(path))
        rules = load_rules(path)
        per_market[cc] = len(rules)
        total_rules += len(rules)
        for rule in rules:
            legacy = rule.get("category")
            if legacy not in CATEGORY_TO_PRODUCT_SCOPE:
                problems.append(f"{cc}: 规则 {rule.get('id')} 的 category {legacy!r} 不在映射表里")
                continue
            counts[legacy] = counts.get(legacy, 0) + 1
            for value in CATEGORY_TO_PRODUCT_SCOPE[legacy]:
                hits[value] = hits.get(value, 0) + 1
                total_hits += 1
            ids.append(rule.get("id"))
    digest, size = id_digest(ids)

    print(f"市场 {len(files)} 个 · 规则 {total_rules} 条 · category 写法 {len(counts)} 种")
    print(f"迁移前 ID 摘要 sha256={digest}  ({len(ids)} 个 id, {size} 字节)\n")
    report_counts(counts, hits, total_hits)

    if len(set(ids)) != len(ids):
        problems.append(f"存在重复 ID：{len(ids) - len(set(ids))} 个")
    if baseline:
        if total_rules != BASELINE_RULE_COUNT:
            problems.append(f"规则总数 {total_rules} ≠ 基线 {BASELINE_RULE_COUNT}")
        if total_hits != BASELINE_SCOPE_HITS:
            problems.append(f"品类命中数 {total_hits} ≠ 基线 {BASELINE_SCOPE_HITS}")
        for legacy, want in BASELINE_RAW_CATEGORY_COUNTS.items():
            if counts.get(legacy, 0) != want:
                problems.append(f"category {legacy!r}: {counts.get(legacy, 0)} 条 ≠ 基线 {want}")
        for cc, want in BASELINE_PER_MARKET.items():
            if per_market.get(cc) != want:
                problems.append(f"{cc}: {per_market.get(cc)} 条 ≠ 基线 {want}")
        extra = set(per_market) - set(BASELINE_PER_MARKET)
        if extra:
            problems.append(f"基线里没有的市场：{sorted(extra)}")

    print()
    if problems:
        print("基线 / 完整性比对未通过：")
        for p in problems:
            print("  -", p)
        return 1
    if baseline:
        print("基线比对通过")
    print("干跑：没有写任何文件（加 --write 落盘）")
    return 0


def do_write() -> int:
    files = rules_files()
    if not files:
        print(f"在 {ROOT} 下没找到任何 */rules.v0.1.json", file=sys.stderr)
        return 1
    skipped = []
    ids: list[str] = []
    written = 0
    for path in files:
        cc = os.path.basename(os.path.dirname(path))
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        if '"product_scope"' in text:
            skipped.append(cc)
            ids += [r["id"] for r in load_rules(path)]
            continue
        new_text = migrate_text(text, path)
        write_atomic(path, new_text)
        written += 1
        rules = json.loads(new_text)["rules"]
        ids += [r["id"] for r in rules]
    digest, _ = id_digest(ids)
    if skipped:
        print(f"已迁移过、跳过 {len(skipped)} 个：{', '.join(skipped)}")
    print(f"已迁移 {written} 个文件 · {len(ids)} 条规则")
    print(f"迁移后 ID 摘要 sha256={digest}")
    return 0


def check(baseline: bool) -> int:
    files = rules_files()
    problems: list[str] = []
    counts: dict[str, int] = {}
    hits: dict[str, int] = {}
    total_hits = 0
    total_rules = 0
    per_market: dict[str, int] = {}
    ids: list[str] = []
    per_file_hits: dict[str, int] = {}

    index_counts: dict[str, int] = {}
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as fh:
            for m in json.load(fh).get("markets", []):
                if m.get("rules_count"):
                    index_counts[m["market"].lower()] = m["rules_count"]

    for path in files:
        cc = os.path.basename(os.path.dirname(path))
        rules = load_rules(path)
        per_market[cc] = len(rules)
        total_rules += len(rules)
        file_hits = 0
        for rule in rules:
            rid = rule.get("id")
            ids.append(rid)
            if "category" in rule:
                problems.append(f"{cc}/{rid}: category 还在，迁移没做完")
            if "product_scope" not in rule:
                problems.append(f"{cc}/{rid}: 缺 product_scope")
                continue
            scope = rule["product_scope"]
            if not isinstance(scope, list) or not scope:
                problems.append(f"{cc}/{rid}: product_scope 必须是非空数组，实际 {scope!r}")
                continue
            if len(set(scope)) != len(scope):
                problems.append(f"{cc}/{rid}: product_scope 有重复值 {scope!r}")
            for value in scope:
                if value not in PRODUCT_SCOPE_VALUES:
                    problems.append(f"{cc}/{rid}: product_scope 取值 {value!r} 不在词表内")
                hits[value] = hits.get(value, 0) + 1
                file_hits += 1
                total_hits += 1
            legacy = rule.get("category_legacy")
            if not isinstance(legacy, str) or not legacy:
                problems.append(f"{cc}/{rid}: 缺 category_legacy")
                continue
            counts[legacy] = counts.get(legacy, 0) + 1
            expected = CATEGORY_TO_PRODUCT_SCOPE.get(legacy)
            if expected is None:
                problems.append(f"{cc}/{rid}: category_legacy {legacy!r} 不在映射表里")
            elif scope != list(expected):
                problems.append(
                    f"{cc}/{rid}: product_scope {scope!r} 与映射表不一致（{legacy!r} 应为 {list(expected)!r}）"
                )
        per_file_hits[cc] = file_hits
        if cc in index_counts and index_counts[cc] != len(rules):
            problems.append(f"{cc}: {len(rules)} 条规则，但 index.json 记为 {index_counts[cc]}")

    digest, size = id_digest(ids)
    if len(set(ids)) != len(ids):
        dupes = sorted({i for i in ids if ids.count(i) > 1})
        problems.append(f"存在重复 ID {len(ids) - len(set(ids))} 个：{', '.join(dupes[:5])}")

    print(f"市场 {len(files)} 个 · 规则 {total_rules} 条 · 唯一 ID {len(set(ids))} 个")
    print(f"迁移后 ID 摘要 sha256={digest}  ({len(ids)} 个 id, {size} 字节)")
    print(f"品类命中数（product_scope 长度之和）：{total_hits}")
    for value in PRODUCT_SCOPE_VALUES:
        print(f"  {value:<8} {hits.get(value, 0):>4} 条规则命中")
    print()
    print("每国条数 / 品类命中数：" + " · ".join(f"{cc} {per_market[cc]}/{per_file_hits[cc]}" for cc in sorted(per_market)))

    if baseline:
        if total_rules != BASELINE_RULE_COUNT:
            problems.append(f"规则总数 {total_rules} ≠ 基线 {BASELINE_RULE_COUNT}")
        if total_hits != BASELINE_SCOPE_HITS:
            problems.append(f"品类命中数 {total_hits} ≠ 基线 {BASELINE_SCOPE_HITS}")
        for legacy, want in BASELINE_RAW_CATEGORY_COUNTS.items():
            if counts.get(legacy, 0) != want:
                problems.append(f"category_legacy {legacy!r}: {counts.get(legacy, 0)} 条 ≠ 基线 {want}")
        for cc, want in BASELINE_PER_MARKET.items():
            if per_market.get(cc) != want:
                problems.append(f"{cc}: {per_market.get(cc)} 条 ≠ 基线 {want}")
        missing = set(BASELINE_RAW_CATEGORY_COUNTS) - set(counts)
        extra = set(counts) - set(BASELINE_RAW_CATEGORY_COUNTS)
        if missing:
            problems.append(f"基线里有但数据里没有的旧写法：{sorted(missing)}")
        if extra:
            problems.append(f"数据里有但基线没有的旧写法：{sorted(extra)}")

    print()
    if problems:
        print(f"校验未通过（{len(problems)} 项）：")
        for p in problems:
            print("  -", p)
        return 1
    print("校验通过" + ("（含基线比对）" if baseline else ""))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="把规则级 category 迁移为 product_scope（RAY-751）")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--write", action="store_true", help="就地迁移 25 个 rules.v0.1.json（默认只干跑）")
    mode.add_argument("--check", action="store_true", help="校验已迁移状态，不一致就非零退出")
    ap.add_argument("--baseline", action="store_true", help="同时比对 RAY-743 审计基线（条数与逐值计数）")
    args = ap.parse_args()
    try:
        if args.check:
            return check(args.baseline)
        if args.write:
            return do_write()
        return dry_run(args.baseline)
    except MigrationError as exc:
        print(f"迁移中止：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
