#!/usr/bin/env tsx
/**
 * 离线端到端核对：夹具 HTML → （Python）样式快照 → （TS）规则判定。
 *
 *     npm run verify:fixture
 *
 * 不联网、不需要模型 key。用来确认 detec­tor 覆盖的类别没有静默失效——
 * 只跑单元测试的话，Python 与 TS 之间那层「线格式」断了也不会被发现。
 */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { analyzeInterface } from "../src/interface/analyze.js";
import type { InterfaceSnapshot } from "../src/interface/types.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = join(root, "test/fixtures/interface-fixture-cn.html");
const workdir = mkdtempSync(join(tmpdir(), "wendo-fixture-"));
const snapshotPath = join(workdir, "snapshot.json");

const python = process.env.WENDO_PYTHON ?? "python3";

try {
  execFileSync(
    python,
    [
      "-c",
      [
        "import json, sys",
        "sys.path.insert(0, 'scripts')",
        "from scrapling.parser import Adaptor",
        "import interface_signals as ifs",
        "html = open(sys.argv[1], encoding='utf-8').read()",
        "snap = ifs.extract_interface_signals(Adaptor(html, url='https://example.com/'), None, max_sheets=0)",
        "snap['lang'] = 'zh-CN'",
        "json.dump(snap, open(sys.argv[2], 'w'), ensure_ascii=False)",
      ].join("\n"),
      fixture,
      snapshotPath,
    ],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"], timeout: 120_000 },
  );
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`抽取夹具失败（Python/Scrapling）：${detail}`);
  console.error("缺少依赖时先跑 `python3 -m pip install -r scripts/requirements.txt`。");
  process.exit(2);
}

const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as InterfaceSnapshot;
rmSync(workdir, { recursive: true, force: true });

const analysis = analyzeInterface(snapshot);

/** 夹具里刻意写下的每一类信号，都应该被某一类规则接住。 */
const expected: Array<{ rule: string; label: string }> = [
  { rule: "IF-TRUNC-01", label: "02 定高裁切" },
  { rule: "IF-TRUNC-02", label: "02 单行截断" },
  { rule: "IF-TRUNC-03", label: "01 ch/ex 定宽" },
  { rule: "IF-WRAP-01", label: "03 break-all" },
  { rule: "IF-SIZE-01", label: "04 CJK 小字号" },
  { rule: "IF-WORD-01", label: "07 用词补设计" },
  { rule: "IF-INPUT-01", label: "08 硬限长" },
  { rule: "IF-INPUT-02", label: "08 Enter/IME" },
];

const found = new Set(analysis.findings.map((finding) => finding.rule));
const missing = expected.filter((item) => !found.has(item.rule as never));
const expectedCandidates = ["MY-UI-09", "MY-UI-10"];
const candidateRules = new Set(analysis.candidates.map((candidate) => candidate.rule));

console.log(`夹具：${fixture}`);
console.log(`文本元素 ${analysis.hierarchy.textElements} 个，命中 ${analysis.findings.length} 类规则，候选 ${analysis.candidates.length} 条\n`);
for (const finding of analysis.findings) {
  console.log(`  ${finding.severity.padEnd(6)} ${finding.rule.padEnd(13)} ×${finding.occurrences}`);
  console.log(`         ${finding.evidence.slice(0, 120)}`);
}
for (const candidate of analysis.candidates) {
  console.log(`  候选   ${candidate.rule.padEnd(13)} ${candidate.kind.padEnd(5)} ${candidate.quote.slice(0, 50)}`);
}

const problems: string[] = [];
for (const item of missing) problems.push(`缺少规则命中：${item.label}（${item.rule}）`);
for (const rule of expectedCandidates) {
  if (!candidateRules.has(rule as never)) problems.push(`缺少候选：${rule}`);
}
// 候选不能混进 risks
if (analysis.reported.some((finding) => finding.rule.startsWith("MY-"))) {
  problems.push("候选混进了风险条目");
}

if (problems.length) {
  console.error(`\n${problems.length} 项不符合预期：`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log("\n夹具覆盖的类别全部命中。");
