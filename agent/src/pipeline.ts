import { resolveLlmConfig, resolveTier } from "./config.js";
import type { DiagnosisResult, FetchedPage, KbDigest, Report } from "./types.js";
import { ReportSchema } from "./types.js";
import { fetchPage, type FetchPageOptions } from "./tools/fetch-page.js";
import { retrieveKb } from "./tools/retrieve-kb.js";
import { scoreAndReport } from "./tools/score-and-report.js";

export const AGENT_VERSION = "0.1.0";

/** 马来西亚固定 UTC+8，无夏令时；报告时间直接带本地时区，PDF 与网页显示一致。 */
function toMalaysiaIso(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+08:00`;
}

export interface RunDiagnosisOptions {
  /** 单页地址；与 text 二选一。 */
  url?: string;
  /** 用户粘贴的文本；与 url 二选一。跳过 fetch_page，其余两步不变。 */
  text?: string;
  /** 粘贴文本的标题，仅 text 模式使用。 */
  textTitle?: string;
  /** 业务代码只写 lite；pro/max 在这里会被拒绝。 */
  tier?: string;
  fetch?: Omit<FetchPageOptions, "url">;
  maxAttempts?: number;
  timeoutMs?: number;
  onStage?: (stage: "fetch_page" | "retrieve_kb" | "score_and_report", detail: string) => void;
  onAttempt?: (attempt: number, problems: string[]) => void;
}

export interface TimedDiagnosis extends DiagnosisResult {
  page: FetchedPage;
  kb: KbDigest;
  timings: { fetchMs: number; retrieveMs: number; reportMs: number; totalMs: number };
}

/** 把粘贴文本包装成和抓取结果同构的 FetchedPage，后续两步不需要分支。 */
function inlinePage(text: string, title: string | undefined): FetchedPage {
  const body = text.trim();
  return {
    url: "",
    finalUrl: "",
    status: 200,
    title: (title || "").trim() || "粘贴文本",
    text: body,
    charCount: body.length,
    fetchedAt: new Date().toISOString(),
    elapsedMs: 0,
    fetcher: "inline-text",
  };
}

/**
 * 固定工具链：fetch_page → retrieve_kb → score_and_report。
 * 三步由代码按顺序驱动，agent 不参与规划，也不能跳过或改序。
 * text 模式没有页面可抓，第一步退化为「接收粘贴文本」，检索与生成完全一致。
 */
export async function runDiagnosis(options: RunDiagnosisOptions): Promise<TimedDiagnosis> {
  const tier = resolveTier(options.tier ?? "lite");
  // 先校验网关配置，缺 key 时在抓取前就失败，不浪费一次网络请求。
  resolveLlmConfig(tier);

  const url = options.url?.trim() ?? "";
  const text = options.text?.trim() ?? "";
  if ((url && text) || (!url && !text)) {
    throw new TypeError("runDiagnosis 需要 url 或 text 其中之一（不能同时提供，也不能都为空）");
  }

  const started = Date.now();

  options.onStage?.("fetch_page", url || "粘贴文本");
  const fetchStart = Date.now();
  const page = url
    ? await fetchPage({ url, ...options.fetch })
    : inlinePage(text, options.textTitle);
  const fetchMs = Date.now() - fetchStart;
  options.onStage?.(
    "fetch_page",
    url ? `抓到 ${page.charCount} 字符（HTTP ${page.status}）` : `收到粘贴文本 ${page.charCount} 字符`,
  );

  options.onStage?.("retrieve_kb", "马来西亚 × 小家电");
  const retrieveStart = Date.now();
  const kb = await retrieveKb({ pageText: page.text });
  const retrieveMs = Date.now() - retrieveStart;
  options.onStage?.("retrieve_kb", `${kb.dimensions.length} 个维度，${kb.totalHits} 个信号命中`);

  options.onStage?.("score_and_report", `档位 ${tier.label}`);
  const reportStart = Date.now();
  const { report, usage, attempts } = await scoreAndReport({
    page,
    kb,
    tier,
    maxAttempts: options.maxAttempts,
    timeoutMs: options.timeoutMs,
    onAttempt: (attempt, problems) => {
      options.onAttempt?.(attempt, problems);
      if (attempt === 1) return;
      options.onStage?.("score_and_report", `第 ${attempt} 次尝试，修复 ${problems.length} 个问题`);
    },
  });
  const reportMs = Date.now() - reportStart;

  const meta: Report["meta"] = {
    source_type: url ? "url" : "text",
    url: page.url || null,
    final_url: page.finalUrl || null,
    title: page.title,
    market: kb.market,
    market_name: kb.marketName,
    category: kb.category,
    category_name: kb.categoryName,
    generated_at: toMalaysiaIso(new Date()),
    tier: tier.label,
    source_chars: page.charCount,
    knowledge_version: kb.version,
    agent_version: AGENT_VERSION,
  };

  const full = ReportSchema.parse({ ...report, meta });
  return {
    report: full,
    usage,
    attempts,
    page,
    kb,
    timings: { fetchMs, retrieveMs, reportMs, totalMs: Date.now() - started },
  };
}
