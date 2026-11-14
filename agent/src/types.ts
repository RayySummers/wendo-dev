import { z } from "zod";
import type { InterfaceSnapshot } from "./interface/types.js";
import {
  MARKET_READINESS_DIMENSION,
  MARKET_READINESS_STATUSES,
  type MarketReadinessFinding,
} from "./market-readiness/types.js";

export const SEVERITIES = ["high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const DIMENSION_STATUSES = ["risk", "ok", "not_assessable"] as const;
export type DimensionStatus = (typeof DIMENSION_STATUSES)[number];

/**
 * 风险来源。
 * - content：模型依据页面正文 + 知识库得出的内容/表达问题（默认）
 * - interface_translation：代码从 HTML/CSS 抽出的界面信号，带选择器与声明证据
 */
export const RISK_KINDS = ["content", "interface_translation"] as const;
export type RiskKind = (typeof RISK_KINDS)[number];

/**
 * 报告 JSON 契约。
 * 网页与 PDF 共用这一份 JSON；字段变更需要同时更新 agent/REPORT-SCHEMA.md。
 * 注意：报告不含任何分数、百分比或评级数字。
 */
export const RiskCoreSchema = z.object({
  severity: z.enum(SEVERITIES),
  /** 页面正文中的逐字引用，代码会做子串校验。 */
  quote: z.string().trim().min(2),
  why: z.string().trim().min(2),
  fix: z.string().trim().min(2),
});

/** 六维固定顺序；合规条目用 `dimension: "compliance"`，与前端 DimensionKey 对齐。 */
export const RISK_DIMENSIONS = [
  "language",
  "naturalness",
  "culture",
  "effectiveness",
  "market_readiness",
  "compliance",
] as const;
export type RiskDimension = (typeof RISK_DIMENSIONS)[number];

export const DECISION_LEVELS = ["rule_level", "substantiation", "human_review"] as const;

/**
 * 报告里的风险条目：模型字段 + 可选的来源标记与界面证据。
 *
 * RAY-696 / RAY-698 起，合规条目也走这个结构（`dimension: "compliance"`），
 * 出处字段一律可选：旧报告不填也能渲染，BFF 负责 snake_case → camelCase。
 */
export const RiskSchema = RiskCoreSchema.extend({
  kind: z.enum(RISK_KINDS).optional(),
  /** 界面信号证据：规则 id + 关键声明 + 选择器；只有 interface_translation 会带。 */
  evidence: z.string().trim().min(2).optional(),
  /** 所属维度；缺省时前端按「综合判断」处理。 */
  dimension: z.enum(RISK_DIMENSIONS).optional(),
  /** 法条出处（RAY-696 契约）：法规全名与条文号。 */
  law_name: z.string().trim().min(2).optional(),
  article: z.string().trim().min(2).optional(),
  /** 判断层级：规则直判 / 需事实核实 / 需人工判断；由规则库给出，不由模型改写。 */
  decision_level: z.enum(DECISION_LEVELS).optional(),
  /** true 时报告页与 PDF 标「需专业审核」。 */
  review_required: z.boolean().optional(),
  /** 该条规则最近一次核验日期（YYYY-MM-DD）。 */
  last_verified: z.string().trim().min(4).optional(),
  /** 判断把握，只用于展示，不是分数。 */
  confidence: z.enum(SEVERITIES).optional(),
});

export const StrengthSchema = z.object({
  quote: z.string().trim().min(2),
  why: z.string().trim().min(2),
});

export const NotAssessableSchema = z.object({
  item: z.string().trim().min(2),
  reason: z.string().trim().min(2),
});

export const DimensionSchema = z.object({
  name: z.string().trim().min(2),
  status: z.enum(DIMENSION_STATUSES),
  note: z.string().trim().min(2),
});

/**
 * 市场就绪度（RAY-697）：代码侧固定 8 条页面检查，不走模型。
 * `quote` 允许为空——页面没展示时留空，绝不补一段看起来像原文的句子。
 */
export const MarketReadinessFindingSchema = z.object({
  checkId: z.string().regex(/^MY-MR-0[1-8]$/),
  label: z.string().trim().min(2),
  status: z.enum(MARKET_READINESS_STATUSES),
  quote: z.string(),
  why: z.string().trim().min(2),
  fix: z.string().trim().min(2),
  dimension: z.literal(MARKET_READINESS_DIMENSION),
  /** 代码侧取证位置（检查范围、命中项），不是页面原文。 */
  evidence: z.string().trim().min(2).optional(),
});

export const ReportMetaSchema = z.object({
  url: z.string().url(),
  final_url: z.string().url(),
  title: z.string(),
  market: z.string(),
  market_name: z.string(),
  category: z.string(),
  category_name: z.string(),
  generated_at: z.string(),
  tier: z.string(),
  source_chars: z.number().int().nonnegative(),
  knowledge_version: z.string(),
  agent_version: z.string(),
});

/** 界面可翻译性候选：声音层（MY-UI-09）与 RTL 记录（MY-UI-10），只作提示，不是缺陷。 */
export const InterfaceCandidateSchema = z.object({
  rule: z.enum(["MY-UI-09", "MY-UI-10"]),
  kind: z.enum(["voice", "rtl"]),
  quote: z.string().trim().min(2),
  selector: z.string().trim().min(1),
  evidence: z.string().trim().min(2),
  suggestion: z.string().trim().min(2),
});

export const ReportSchema = z.object({
  meta: ReportMetaSchema,
  summary: z.string().trim().min(10),
  // 模型最多 8 条内容风险 + 代码侧最多 6 条合规条目（RAY-698），上限放到 16。
  risks: z.array(RiskSchema).min(3).max(16),
  strengths: z.array(StrengthSchema).min(1).max(6),
  // 模型条目 + 市场就绪度/合规两条能力边界说明（RAY-697 / RAY-698），上限放到 10。
  not_assessable: z.array(NotAssessableSchema).min(1).max(10),
  dimensions: z.array(DimensionSchema).min(3).max(10),
  /**
   * 界面可翻译性的「候选」通道：声音层与 RTL 记录。
   * 规则包要求这两类不做成缺陷（没 round-trip / 本轮只记录），所以单列，不进 risks。
   */
  interface_candidates: z.array(InterfaceCandidateSchema).optional(),
  /** 市场就绪度 8 条页面检查；v0.1 固定 8 条，其中可以有 not_applicable。 */
  market_readiness: z.array(MarketReadinessFindingSchema).length(8).optional(),
});

/** 模型只负责这五个字段；meta 由 pipeline 在代码侧补齐，避免模型编造 URL 与时间。 */
export const ModelReportSchema = ReportSchema.omit({
  meta: true,
  interface_candidates: true,
  market_readiness: true,
}).extend({
  // 模型不产出来源标记与证据：这两项由界面信号在代码侧注入。
  risks: z.array(RiskCoreSchema).min(3).max(8),
});

export type RiskCore = z.infer<typeof RiskCoreSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Strength = z.infer<typeof StrengthSchema>;
export type NotAssessable = z.infer<typeof NotAssessableSchema>;
export type Dimension = z.infer<typeof DimensionSchema>;
export type InterfaceCandidateEntry = z.infer<typeof InterfaceCandidateSchema>;
export type MarketReadinessEntry = z.infer<typeof MarketReadinessFindingSchema>;
export type ReportMeta = z.infer<typeof ReportMetaSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type { MarketReadinessFinding };
export type ModelReport = z.infer<typeof ModelReportSchema>;

export interface FetchedPage {
  url: string;
  finalUrl: string;
  status: number;
  title: string;
  text: string;
  charCount: number;
  fetchedAt: string;
  elapsedMs: number;
  fetcher: string;
  /** HTML/CSS 界面信号快照；抓取脚本未产出或失败时缺省。 */
  interface?: InterfaceSnapshot;
}

export interface KbRule {
  id: string;
  severityHint: Severity;
  rule: string;
  why: string;
  fix: string;
  signals: string[];
  matchedSignals: string[];
}

export interface KbDimension {
  id: string;
  name: string;
  sourceSections: string[];
  rules: KbRule[];
  hits: number;
}

export interface KbExcerpt {
  title: string;
  source: string;
  body: string;
}

export interface KbDigest {
  market: string;
  marketName: string;
  category: string;
  categoryName: string;
  /** 品类口径说明：哪些规则适用、哪些规则属于其他品类、不得套用。 */
  scope?: string;
  version: string;
  dimensions: KbDimension[];
  totalHits: number;
  excerpts: KbExcerpt[];
}

export interface TokenUsage {
  /** 输入 token 总数，含命中缓存的输入（计费按总量算）。 */
  inputTokens: number;
  outputTokens: number;
  /** 其中命中 prompt cache 的部分，仅用于观察成本。 */
  cachedInputTokens: number;
  totalTokens: number;
  model: string;
  tier: string;
}

export interface DiagnosisResult {
  report: Report;
  usage: TokenUsage;
  attempts: number;
}
