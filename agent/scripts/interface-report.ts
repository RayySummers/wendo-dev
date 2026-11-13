#!/usr/bin/env tsx
/**
 * 界面可翻译性信号预览（不需要模型 key）。
 *
 *     npx tsx scripts/interface-report.ts https://bears.com.my/
 *     npx tsx scripts/interface-report.ts https://bears.com.my/ --json > signals.json
 *
 * 走的是和 diagnose 完全相同的 fetch_page 链路（Scrapling → page.json → analyze），
 * 只是跳过 retrieve_kb / score_and_report，用来核对「这个页面到底命中了什么」。
 */
import { analyzeInterface, interfaceDimensionNote } from "../src/interface/analyze.js";
import { CONTENT_DIMENSION_NAME, interfaceRisks } from "../src/interface/report.js";
import { fetchPage } from "../src/tools/fetch-page.js";

interface Args {
  url: string;
  json: boolean;
  showElements: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { url: "", json: false, showElements: false };
  for (const arg of argv) {
    if (arg === "--json") args.json = true;
    else if (arg === "--elements") args.showElements = true;
    else if (!arg.startsWith("-")) args.url = arg;
  }
  if (!args.url) {
    console.error("用法: npx tsx scripts/interface-report.ts <url> [--json] [--elements]");
    process.exit(2);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const page = await fetchPage({ url: args.url });
const analysis = analyzeInterface(page.interface);
const risks = interfaceRisks(analysis);
const dimension = { name: CONTENT_DIMENSION_NAME, status: analysis.findings.length ? "risk" : "ok", note: interfaceDimensionNote(analysis) };

if (args.json) {
  console.log(
    JSON.stringify(
      {
        url: page.finalUrl,
        lang: page.interface?.lang ?? null,
        stylesheets: page.interface?.stylesheets ?? null,
        hierarchy: analysis.hierarchy,
        captured: analysis.captured,
        findings: analysis.findings,
        dimension,
        risks,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

console.log(`URL      ${page.finalUrl}`);
console.log(`语言      ${page.interface?.lang ?? "（未声明）"}   视口 ${page.interface?.viewport ?? "-"}`);
const sheets = page.interface?.stylesheets;
console.log(
  `样式表    抓取 ${sheets?.fetched ?? 0}/${sheets?.linked ?? 0} 个外链 + ${sheets?.inline_blocks ?? 0} 个内联块，共 ${sheets?.rules ?? 0} 条声明`,
);
console.log(
  `文本元素  ${analysis.hierarchy.textElements} 个 · ${analysis.hierarchy.fontSizes} 档字号 · ${analysis.hierarchy.fontWeights} 档字重 · ${analysis.hierarchy.colors} 种颜色`,
);
console.log("");
console.log(`维度    ${dimension.name} [${dimension.status}]`);
console.log(`说明    ${interfaceDimensionNote(analysis)}`);
console.log("");

if (analysis.findings.length === 0) {
  console.log("没有命中界面信号。");
} else {
  console.log(`命中 ${analysis.findings.length} 类（报告里取前 ${risks.length} 条）：`);
  for (const finding of analysis.findings) {
    console.log(`\n[${finding.severity}] ${finding.rule} × ${finding.occurrences}`);
    console.log(`  引用  ${finding.quote.slice(0, 90)}`);
    console.log(`  证据  ${finding.evidence}`);
  }
}

if (args.showElements) {
  console.log("\n采样元素（前 40）:");
  for (const element of (page.interface?.elements ?? []).slice(0, 40)) {
    console.log(
      `  ${element.tag} · ${element.font_size_px}px/${element.font_weight} · ` +
        `w=${element.width_px ?? "-"} max=${element.max_width_px ?? "-"} h=${element.height_px ?? "-"} ` +
        `clamp=${element.line_clamp ?? "-"} · ${element.text.slice(0, 40)}`,
    );
  }
}
