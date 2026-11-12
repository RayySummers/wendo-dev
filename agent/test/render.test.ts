import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { escapeHtml, renderReportHtml } from "../src/render/report-html.js";
import { htmlToText, missingTexts } from "../src/render/parity.js";
import { renderPdf } from "../src/render/report-pdf.js";
import { ReportSchema } from "../src/types.js";
import { retrieveKb } from "../src/tools/retrieve-kb.js";
import { PAGE_TEXT, buildReport } from "./helpers.js";

const execFileAsync = promisify(execFile);
const AGENT_ROOT = resolve(import.meta.dirname, "..");
const TMP_DIR = resolve(AGENT_ROOT, "test/.tmp");

test("HTML 报告包含网页需要的全部字段，且不出现打分", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const report = ReportSchema.parse(buildReport(kb));
  const html = renderReportHtml(report);
  const text = htmlToText(html);

  assert.deepEqual(missingTexts(report, text), []);
  assert.ok(html.includes("文化适配诊断报告"));
  assert.ok(!/(?<![\d.])\d+(?:\.\d+)?\s*分(?![钟之])/.test(text), "HTML 不应出现打分表达");
  assert.ok(html.includes("诊断档位"), "应显示诊断档位");
});

test("escapeHtml 转义用户内容", () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
});

test("Typst PDF 渲染成功，且文本与报告 JSON 一致", async (t) => {
  const typst = spawnSync(process.env.WENDO_TYPST ?? "typst", ["--version"], { encoding: "utf8" });
  if (typst.status !== 0) {
    t.skip("未安装 Typst，跳过 PDF 渲染测试");
    return;
  }
  const pdftotext = spawnSync("pdftotext", ["-v"], { encoding: "utf8" });
  if (pdftotext.status !== 0) {
    t.skip("未安装 pdftotext，跳过 PDF 文本比对");
    return;
  }

  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const report = ReportSchema.parse(buildReport(kb));
  await mkdir(TMP_DIR, { recursive: true });
  const jsonPath = resolve(TMP_DIR, "fixture.json");
  const pdfPath = resolve(TMP_DIR, "fixture.pdf");
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  try {
    const { bytes } = await renderPdf({ root: AGENT_ROOT, reportJsonPath: jsonPath, outputPath: pdfPath });
    assert.ok(bytes > 2_000, "PDF 不应是空文件");

    const { stdout } = await execFileAsync("pdftotext", ["-layout", pdfPath, "-"], {
      maxBuffer: 8 * 1024 * 1024,
    });
    const missing = missingTexts(report, stdout, { stripAllWhitespace: true });
    assert.deepEqual(missing, [], `PDF 缺少字段：${missing.map((item) => item.label).join(", ")}`);
  } finally {
    await rm(TMP_DIR, { recursive: true, force: true });
  }
});
