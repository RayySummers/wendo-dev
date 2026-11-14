import { z } from "zod";
import type { InterfaceSnapshot } from "./interface/types.js";

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

/** 报告里的风险条目：模型字段 + 可选的来源标记与界面证据。 */
export const RiskSchema = RiskCoreSchema.extend({
  kind: z.enum(RISK_KINDS).optional(),
  /** 界面信号证据：规则 id + 关键声明 + 选择器；只有 interface_translation 会带。 */
  evidence: z.string().trim().min(2).optional(),
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
  risks: z.array(RiskSchema).min(3).max(8),
  strengths: z.array(StrengthSchema).min(1).max(6),
  not_assessable: z.array(NotAssessableSchema).min(1).max(8),
  dimensions: z.array(DimensionSchema).min(3).max(10),
  /**
   * 界面可翻译性的「候选」通道：声音层与 RTL 记录。
   * 规则包要求这两类不做成缺陷（没 round-trip / 本轮只记录），所以单列，不进 risks。
   */
  interface_candidates: z.array(InterfaceCandidateSchema).optional(),
});

/** 模型只负责这五个字段；meta 由 pipeline 在代码侧补齐，避免模型编造 URL 与时间。 */
export const ModelReportSchema = ReportSchema.omit({ meta: true, interface_candidates: true }).extend({
  // 模型不产出来源标记与证据：这两项由界面信号在代码侧注入。
  risks: z.array(RiskCoreSchema).min(3).max(8),
});

export type RiskCore = z.infer<typeof RiskCoreSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Strength = z.infer<typeof StrengthSchema>;
export type NotAssessable = z.infer<typeof NotAssessableSchema>;
export type Dimension = z.infer<typeof DimensionSchema>;
export type InterfaceCandidateEntry = z.infer<typeof InterfaceCandidateSchema>;
export type ReportMeta = z.infer<typeof ReportMetaSchema>;
export type Report = z.infer<typeof ReportSchema>;
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
