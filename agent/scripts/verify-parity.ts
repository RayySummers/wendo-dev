/**
 * 核对网页与 PDF 是否完整呈现同一份报告 JSON。
 *
 * 用法：npx tsx scripts/verify-parity.ts reports/bear-malaysia-20261112.json
 * 可选：--html <path> --pdf <path>
 */
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { promisify } from "node:util";
import { htmlToText, missingTexts } from "../src/render/parity.js";
import { ReportSchema } from "../src/types.js";

const execFileAsync = promisify(execFile);

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { html: { type: "string" }, pdf: { type: "string" } },
});

const reportPath = positionals[0];
if (!reportPath) {
  console.error("用法：npx tsx scripts/verify-parity.ts <report.json> [--html path] [--pdf path]");
  process.exit(2);
}

const report = ReportSchema.parse(JSON.parse(await readFile(resolve(reportPath), "utf8")));
const htmlPath = resolve(values.html ?? reportPath.replace(/\.json$/, ".html"));
const pdfPath = resolve(values.pdf ?? reportPath.replace(/\.json$/, ".pdf"));

let failed = false;

const html = await readFile(htmlPath, "utf8");
const htmlMissing = missingTexts(report, htmlToText(html));
if (htmlMissing.length) {
  failed = true;
  console.error(`✗ 网页缺少 ${htmlMissing.length} 个字段：`);
  for (const item of htmlMissing) console.error(`  · ${item.label}：${item.value.slice(0, 60)}`);
} else {
  console.log(`✓ 网页完整呈现 ${report.risks.length} 条风险、${report.strengths.length} 条优势、${report.not_assessable.length} 条未覆盖项`);
}

const { stdout: pdfText } = await execFileAsync("pdftotext", ["-layout", pdfPath, "-"], {
  maxBuffer: 8 * 1024 * 1024,
});
const pdfMissing = missingTexts(report, pdfText, { stripAllWhitespace: true });
if (pdfMissing.length) {
  failed = true;
  console.error(`✗ PDF 缺少 ${pdfMissing.length} 个字段：`);
  for (const item of pdfMissing) console.error(`  · ${item.label}：${item.value.slice(0, 60)}`);
} else {
  console.log(`✓ PDF 与网页内容一致（${report.meta.final_url}，档位 ${report.meta.tier}）`);
}

const scorePattern = /(?<![\d.])\d+(?:\.\d+)?\s*分(?![钟之])/;
if (scorePattern.test(pdfText) || scorePattern.test(htmlToText(html))) {
  failed = true;
  console.error("✗ 网页或 PDF 出现打分表达");
}

process.exit(failed ? 1 : 0);
