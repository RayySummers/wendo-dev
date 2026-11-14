import { resolveCategoryProfile } from "./categories.js";
import { resolveLlmConfig, resolveTier } from "./config.js";
import type { DiagnosisResult, FetchedPage, KbDigest, Report } from "./types.js";
import { ReportSchema } from "./types.js";
import { analyzeInterface, type InterfaceAnalysis } from "./interface/analyze.js";
import { mergeInterfaceIntoReport } from "./interface/report.js";
import {
  MARKET_READINESS_DIMENSION_NAME,
  MARKET_READINESS_LIMIT,
  analyzeMarketReadiness,
  marketReadinessDimensionStatus,
  marketReadinessNote,
  type MarketReadinessAnalysis,
} from "./market-readiness/analyze.js";
import { fetchPage, type FetchPageOptions } from "./tools/fetch-page.js";
import { retrieveKb } from "./tools/retrieve-kb.js";
import { scoreAndReport } from "./tools/score-and-report.js";

export const AGENT_VERSION = "0.3.0";

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
  url: string;
  /** 业务代码只写 lite；pro/max 在这里会被拒绝。 */
  tier?: string;
  /** 诊断品类代码；缺省 small_appliances。未知品类在抓取前就失败。 */
  category?: string;
  fetch?: Omit<FetchPageOptions, "url">;
  maxAttempts?: number;
  timeoutMs?: number;
  onStage?: (stage: "fetch_page" | "retrieve_kb" | "score_and_report", detail: string) => void;
  onAttempt?: (attempt: number, problems: string[]) => void;
}

export interface TimedDiagnosis extends DiagnosisResult {
  page: FetchedPage;
  kb: KbDigest;
  /** 界面可翻译性信号的命中结果（代码侧，不经模型）。 */
  interfaceAnalysis: InterfaceAnalysis;
  /** 市场就绪度 8 项检查结果（代码侧，不经模型）。 */
  marketReadiness: MarketReadinessAnalysis;
  timings: { fetchMs: number; retrieveMs: number; reportMs: number; totalMs: number };
}

/**
 * 固定工具链：fetch_page → retrieve_kb → score_and_report。
 * 三步由代码按顺序驱动，agent 不参与规划，也不能跳过或改序。
 */
export async function runDiagnosis(options: RunDiagnosisOptions): Promise<TimedDiagnosis> {
  const tier = resolveTier(options.tier ?? "lite");
  // 先校验品类与网关配置，缺 key / 品类未知时在抓取前就失败，不浪费一次网络请求。
  const category = resolveCategoryProfile(options.category);
  resolveLlmConfig(tier);
  const started = Date.now();

  options.onStage?.("fetch_page", options.url);
  const fetchStart = Date.now();
  const page = await fetchPage({ url: options.url, ...options.fetch });
  const fetchMs = Date.now() - fetchStart;
  options.onStage?.("fetch_page", `抓到 ${page.charCount} 字符（HTTP ${page.status}）`);

  options.onStage?.("retrieve_kb", `马来西亚 × ${category.name}`);
  const retrieveStart = Date.now();
  const kb = await retrieveKb({ pageText: page.text, category: category.code });
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

  // 界面信号在代码侧分析并合并进报告：命中才写，没有信号不硬编。
  const interfaceAnalysis = analyzeInterface(page.interface);
  const contentDimension = kb.dimensions.find((dimension) => dimension.id === "content");
  const merged = mergeInterfaceIntoReport(
    { risks: report.risks, dimensions: report.dimensions },
    interfaceAnalysis,
    { contentDimensionName: contentDimension?.name },
  );
  if (merged.injected > 0) {
    options.onStage?.("score_and_report", `并入 ${merged.injected} 条界面可翻译性信号`);
  }
  // 市场就绪度（RAY-697）：8 条固定检查在代码侧跑，不经模型，保证同一页两次结果一致。
  const marketReadiness = analyzeMarketReadiness({
    text: page.text,
    category: category.code,
    title: page.title,
    url: page.finalUrl,
  });
  options.onStage?.(
    "score_and_report",
    `市场就绪度 ${marketReadiness.findings.length} 项检查：未展示 ${marketReadiness.counts.missing}、需复核 ${marketReadiness.counts.needs_review}`,
  );
  const dimensions = [
    ...merged.dimensions.filter((dimension) => dimension.name !== MARKET_READINESS_DIMENSION_NAME),
    {
      name: MARKET_READINESS_DIMENSION_NAME,
      status: marketReadinessDimensionStatus(marketReadiness.counts),
      note: marketReadinessNote(marketReadiness.counts),
    },
  ];
  // 把这一层的能力边界写进「未覆盖范围」，避免被读成认证/合规结论；上限 8 条，满了就不加。
  const notAssessable =
    report.not_assessable.length < 8
      ? [...report.not_assessable, { ...MARKET_READINESS_LIMIT }]
      : report.not_assessable;

  const composed = {
    summary: report.summary,
    risks: merged.risks,
    strengths: report.strengths,
    not_assessable: notAssessable,
    dimensions,
    interface_candidates: merged.interfaceCandidates,
    market_readiness: marketReadiness.findings,
  };

  const meta: Report["meta"] = {
    url: page.url,
    final_url: page.finalUrl,
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

  const full = ReportSchema.parse({ ...composed, meta });
  return {
    report: full,
    usage,
    attempts,
    page,
    kb,
    interfaceAnalysis,
    marketReadiness,
    timings: { fetchMs, retrieveMs, reportMs, totalMs: Date.now() - started },
  };
}
