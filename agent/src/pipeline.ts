import { resolveCategoryProfile } from "./categories.js";
import { resolveLlmConfig, resolveTier, type TierConfig } from "./config.js";
import { assertMarketKbReady, resolveMarket, type MarketInfo } from "./market.js";
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
import {
  analyzeCompliance,
  complianceDimension,
  complianceRisks,
  complianceSummary,
  type ComplianceAnalysis,
} from "./compliance/analyze.js";
import { COMPLIANCE_DIMENSION_NAME } from "./compliance/types.js";
import { fetchPage, type FetchPageOptions } from "./tools/fetch-page.js";
import { retrieveKb } from "./tools/retrieve-kb.js";
import { scoreAndReport } from "./tools/score-and-report.js";

export const AGENT_VERSION = "0.4.0";

/** ISO 偏移（+08:00）；`longOffset` 对 UTC 返回 GMT，统一成 +00:00。 */
function offsetFor(timeZone: string, date: Date): string {
  const zone =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /^(?:GMT|UTC)([+-])(\d{2}):(\d{2})$/.exec(zone);
  return match ? `${match[1]}${match[2]}:${match[3]}` : "+00:00";
}

/** 报告时间用请求市场的本地时区，带显式偏移，网页与 PDF 显示一致。 */
function marketIso(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}${offsetFor(timeZone, date)}`;
}

export interface ReportMetaInput {
  market: MarketInfo;
  page: FetchedPage;
  kb: KbDigest;
  tier: TierConfig;
  /** 测试注入固定时间；生产不传。 */
  generatedAt?: Date;
}

/**
 * 报告 meta 的市场字段全部来自请求市场（`legal/index.json`），不从知识库索引反推。
 * 这样即便知识库文件写错，也有 `retrieve_kb` 的市场一致性校验兜底，meta 不会静默变成 MY。
 */
export function buildReportMeta(input: ReportMetaInput): Report["meta"] {
  const { market, page, kb, tier } = input;
  return {
    url: page.url,
    final_url: page.finalUrl,
    title: page.title,
    market: market.code,
    market_name: market.name,
    category: kb.category,
    category_name: kb.categoryName,
    generated_at: marketIso(input.generatedAt ?? new Date(), market.timeZone),
    tier: tier.label,
    source_chars: page.charCount,
    knowledge_version: kb.version,
    agent_version: AGENT_VERSION,
  };
}

export interface RunDiagnosisOptions {
  url: string;
  /** 业务代码只写 lite；pro/max 在这里会被拒绝。 */
  tier?: string;
  /** 诊断品类代码；缺省 small_appliances。未知品类在抓取前就失败。 */
  category?: string;
  /** 目标市场代码；缺省 MY。未知市场/缺该国知识库在抓取前失败，不回退。 */
  market?: string;
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
  /** 市场就绪度 8 项检查结果（代码侧，不经模型）；非 MY 尚未配置时为 null。 */
  marketReadiness: MarketReadinessAnalysis | null;
  /** 合规与风险的规则级判定（代码侧，只读请求市场的规则库，不经模型）。 */
  compliance: ComplianceAnalysis;
  timings: { fetchMs: number; retrieveMs: number; reportMs: number; totalMs: number };
}

/**
 * 固定工具链：fetch_page → retrieve_kb → score_and_report。
 * 三步由代码按顺序驱动，agent 不参与规划，也不能跳过或改序。
 */
export async function runDiagnosis(options: RunDiagnosisOptions): Promise<TimedDiagnosis> {
  const tier = resolveTier(options.tier ?? "lite");
  // 先校验品类、市场与知识库，未知品类 / 未知市场 / 缺知识库都在抓取前失败，
  // 不浪费网络请求，也不会用 MY 的知识库冒充别国。
  const category = resolveCategoryProfile(options.category);
  const market = resolveMarket(options.market);
  assertMarketKbReady(market, category);
  resolveLlmConfig(tier);
  const started = Date.now();

  options.onStage?.("fetch_page", options.url);
  const fetchStart = Date.now();
  const page = await fetchPage({ url: options.url, ...options.fetch });
  const fetchMs = Date.now() - fetchStart;
  options.onStage?.("fetch_page", `抓到 ${page.charCount} 字符（HTTP ${page.status}）`);

  options.onStage?.("retrieve_kb", `${market.name} × ${category.name}`);
  const retrieveStart = Date.now();
  const kb = await retrieveKb({ pageText: page.text, category: category.code, market: market.code });
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
  // 市场就绪度（RAY-697）：8 条固定检查在代码侧跑，不经模型。
  // v0.1 的检查口径只覆盖马来西亚，别国不能套用 RM/FPX/东马这类判断，先显式标未配置。
  const marketReadiness =
    market.code === "MY"
      ? analyzeMarketReadiness({
          text: page.text,
          category: category.code,
          title: page.title,
          url: page.finalUrl,
        })
      : null;
  if (marketReadiness) {
    options.onStage?.(
      "score_and_report",
      `市场就绪度 ${marketReadiness.findings.length} 项检查：未展示 ${marketReadiness.counts.missing}、需复核 ${marketReadiness.counts.needs_review}`,
    );
  } else {
    options.onStage?.("score_and_report", `市场就绪度：${market.name}尚未配置，跳过 MY 口径检查`);
  }
  // 合规与风险（RAY-698）：按请求市场加载规则库，代码侧判定，不经模型。
  const compliance = analyzeCompliance(
    {
      text: page.text,
      category: category.code,
      title: page.title,
      url: page.finalUrl,
    },
    { market: market.code },
  );
  options.onStage?.("score_and_report", complianceSummary(compliance));

  const readinessDimension = marketReadiness
    ? {
        name: MARKET_READINESS_DIMENSION_NAME,
        status: marketReadinessDimensionStatus(marketReadiness.counts),
        note: marketReadinessNote(marketReadiness.counts),
      }
    : {
        name: MARKET_READINESS_DIMENSION_NAME,
        status: "not_assessable" as const,
        note: `${market.name}的页面就绪检查尚未配置：v0.1 的 8 条检查只覆盖马来西亚，本次不做该市场就绪度判断。`,
      };
  const readinessLimit = marketReadiness
    ? MARKET_READINESS_LIMIT
    : {
        item: "市场就绪度（页面就绪检查）的判定范围",
        reason: `${market.name}的页面就绪检查尚未配置：v0.1 只覆盖马来西亚，本次未做该市场就绪度判断。`,
      };

  const dimensions = [
    ...merged.dimensions.filter(
      (dimension) => dimension.name !== MARKET_READINESS_DIMENSION_NAME && dimension.name !== COMPLIANCE_DIMENSION_NAME,
    ),
    readinessDimension,
    complianceDimension(compliance),
  ];
  // 把两层的能力边界写进「未覆盖范围」，避免被读成认证/合规结论。
  const notAssessable = [...report.not_assessable];
  for (const limit of [readinessLimit, compliance.boundaryNote]) {
    if (notAssessable.length >= 10) break;
    notAssessable.push({ ...limit });
  }

  const composed = {
    summary: report.summary,
    // 合规条目与内容风险共用 `risks`（RAY-696 契约），用 dimension 区分。
    risks: [...merged.risks, ...complianceRisks(compliance)],
    strengths: report.strengths,
    not_assessable: notAssessable,
    dimensions,
    interface_candidates: merged.interfaceCandidates,
    market_readiness: marketReadiness?.findings,
  };

  const meta = buildReportMeta({ market, page, kb, tier });

  const full = ReportSchema.parse({ ...composed, meta });
  return {
    report: full,
    usage,
    attempts,
    page,
    kb,
    interfaceAnalysis,
    marketReadiness,
    compliance,
    timings: { fetchMs, retrieveMs, reportMs, totalMs: Date.now() - started },
  };
}
