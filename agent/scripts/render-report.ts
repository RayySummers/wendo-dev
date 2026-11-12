/**
 * 用已有的报告 JSON 重新渲染网页与 PDF，不重新诊断。
 * 用法：npx tsx scripts/render-report.ts reports/bear-malaysia-v1-20261112.json [--no-pdf]
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { renderReportHtml } from "../src/render/report-html.js";
import { renderPdf } from "../src/render/report-pdf.js";
import { ReportSchema } from "../src/types.js";

const AGENT_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { "no-pdf": { type: "boolean", default: false } },
});

const reportPath = positionals[0];
if (!reportPath) {
  console.error("用法：npx tsx scripts/render-report.ts <report.json> [--no-pdf]");
  process.exit(2);
}

const jsonPath = resolve(reportPath);
const report = ReportSchema.parse(JSON.parse(await readFile(jsonPath, "utf8")));
const htmlPath = jsonPath.replace(/\.json$/, ".html");
const pdfPath = jsonPath.replace(/\.json$/, ".pdf");

await writeFile(htmlPath, renderReportHtml(report), "utf8");
console.log(`✓ 网页 ${htmlPath}`);

if (!values["no-pdf"]) {
  const { bytes } = await renderPdf({ root: AGENT_ROOT, reportJsonPath: jsonPath, outputPath: pdfPath });
  console.log(`✓ PDF  ${pdfPath}（${(bytes / 1024).toFixed(0)} KB）`);
}
