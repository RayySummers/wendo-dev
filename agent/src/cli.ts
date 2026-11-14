import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { CategoryError } from "./categories.js";
import { ConfigError, loadDotEnv } from "./config.js";
import { FetchPageError } from "./tools/fetch-page.js";
import { runDiagnosis } from "./pipeline.js";
import { ReportGenerationError } from "./tools/score-and-report.js";
import { PdfRenderError, renderPdf } from "./render/report-pdf.js";
import { renderReportHtml, formatDateTime } from "./render/report-html.js";
import type { Report } from "./types.js";

const AGENT_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

const HELP = `文渡 Wendo 诊断 CLI（固定工具链 fetch_page → retrieve_kb → score_and_report）

用法：
  npm run diagnose -- <url> [选项]

选项：
  --tier <lite>            模型档位，11/15 演示版只开放 lite
  --category <code>        诊断品类：small_appliances（默认）| consumer_electronics
  --out-dir <dir>          输出目录，默认 reports
  --slug <name>            文件名前缀，默认取域名；最终文件名附带日期
  --no-pdf                 只生成 JSON 与 HTML
  --no-html                只生成 JSON（调试用）
  --timeout <seconds>      单次模型调用超时，默认 180
  --max-attempts <n>       校验失败后的总尝试次数，默认 2
  --json                   以 JSON 打印结果（给后端集成）
  --debug                  打印每次校验失败的具体问题
  -h, --help               显示帮助

环境变量：
  WENDO_LLM_API_KEY        必填，模型网关密钥（也可写在 agent/.env）
  WENDO_LLM_BASE_URL       模型网关地址，默认 https://api.deepseek.com/v1
  WENDO_LLM_MODEL_LITE     Lite 档位映射的模型 ID，默认 deepseek-flash
  WENDO_CATEGORY           诊断品类，默认 small_appliances（--category 优先）
  WENDO_PYTHON             Python 解释器，默认 python3
  WENDO_TYPST              Typst 可执行文件，默认 typst
`;

function die(message: string, details: string[] = [], code = 1): never {
  console.error(`\n✗ ${message}`);
  for (const detail of details) console.error(`  · ${detail}`);
  process.exit(code);
}

function malaysiaDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function defaultSlug(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return host.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "report";
}

function riskBreakdown(report: Report): string {
  const count = (severity: string) => report.risks.filter((risk) => risk.severity === severity).length;
  return `高 ${count("high")} / 中 ${count("medium")} / 低 ${count("low")}`;
}

async function main(): Promise<void> {
  loadDotEnv(AGENT_ROOT);
  loadDotEnv(process.cwd());

  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      tier: { type: "string", default: "lite" },
      category: { type: "string", default: process.env.WENDO_CATEGORY ?? "small_appliances" },
      "out-dir": { type: "string", default: "reports" },
      slug: { type: "string" },
      "no-pdf": { type: "boolean", default: false },
      "no-html": { type: "boolean", default: false },
      timeout: { type: "string" },
      "max-attempts": { type: "string", default: "2" },
      json: { type: "boolean", default: false },
      debug: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  const url = positionals[0];
  if (!url) die("缺少 URL。用法：npm run diagnose -- https://bears.com.my/", [], 2);
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocol");
  } catch {
    die(`URL 不合法：${url}（只接受 http/https 单页地址）`, [], 2);
  }

  const timeoutSeconds = Number.parseInt(values.timeout ?? "", 10);
  const maxAttempts = Number.parseInt(values["max-attempts"] ?? "2", 10);
  if (!Number.isFinite(maxAttempts) || maxAttempts < 1) die("--max-attempts 必须是正整数", [], 2);

  const started = Date.now();
  const result = await runDiagnosis({
    url,
    tier: values.tier,
    category: values.category,
    maxAttempts,
    timeoutMs: Number.isFinite(timeoutSeconds) ? timeoutSeconds * 1000 : undefined,
    onStage: (stage, detail) => {
      if (!values.json) console.error(`→ ${stage}：${detail}`);
    },
    onAttempt: (attempt, problems) => {
      if (!values.debug || !problems.length) return;
      console.error(`  第 ${attempt} 次尝试待修复问题：`);
      for (const problem of problems) console.error(`    · ${problem}`);
    },
  });

  const { report } = result;
  const date = malaysiaDate(report.meta.generated_at);
  const base = `${values.slug ?? defaultSlug(report.meta.final_url)}-${date.replace(/-/g, "")}`;
  const outDir = resolve(process.cwd(), values["out-dir"] ?? "reports");
  await mkdir(outDir, { recursive: true });

  const jsonPath = join(outDir, `${base}.json`);
  const htmlPath = join(outDir, `${base}.html`);
  const pdfPath = join(outDir, `${base}.pdf`);

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (!values["no-html"]) {
    await writeFile(htmlPath, renderReportHtml(report), "utf8");
  }

  let pdfBytes: number | undefined;
  if (!values["no-pdf"]) {
    const rendered = await renderPdf({
      root: AGENT_ROOT,
      reportJsonPath: jsonPath,
      outputPath: pdfPath,
    });
    pdfBytes = rendered.bytes;
  }

  const summary = {
    json: jsonPath,
    html: values["no-html"] ? null : htmlPath,
    pdf: values["no-pdf"] ? null : pdfPath,
    risks: report.risks.length,
    risks_by_severity: riskBreakdown(report),
    attempts: result.attempts,
    usage: result.usage,
    timings: result.timings,
    generated_at: formatDateTime(report.meta.generated_at),
  };

  if (values.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`\n✓ 诊断完成：${report.meta.market_name} · ${report.meta.category_name} · ${report.meta.tier}`);
  console.log(`  报告 JSON   ${jsonPath}`);
  if (summary.html) console.log(`  网页 HTML   ${summary.html}`);
  if (summary.pdf) console.log(`  PDF         ${summary.pdf}（${((pdfBytes ?? 0) / 1024).toFixed(0)} KB）`);
  console.log(
    `  风险 ${report.risks.length} 条（${summary.risks_by_severity}）｜尝试 ${result.attempts} 次｜` +
      `token ${result.usage.totalTokens.toLocaleString("en-US")}（in ${result.usage.inputTokens.toLocaleString("en-US")} / out ${result.usage.outputTokens.toLocaleString("en-US")}）｜` +
      `耗时 ${((Date.now() - started) / 1000).toFixed(1)}s`,
  );
}

main().catch((error: unknown) => {
  if (error instanceof ConfigError) die(error.message, [], 2);
  if (error instanceof CategoryError) die(error.message, [], 2);
  if (error instanceof FetchPageError) die(error.message, [`错误码：${error.code}`], 3);
  if (error instanceof ReportGenerationError) die(error.message, error.details, 4);
  if (error instanceof PdfRenderError) {
    die(error.message, error.details ? [error.details] : [], 5);
  }
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  die("未预期的错误", [message], 1);
});
