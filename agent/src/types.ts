import { z } from "zod";

export const SEVERITIES = ["high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const DIMENSION_STATUSES = ["risk", "ok", "not_assessable"] as const;
export type DimensionStatus = (typeof DIMENSION_STATUSES)[number];

/**
 * 报告 JSON 契约。
 * 网页与 PDF 共用这一份 JSON；字段变更需要同时更新 agent/REPORT-SCHEMA.md。
 * 注意：报告不含任何分数、百分比或评级数字。
 */
export const RiskSchema = z.object({
  severity: z.enum(SEVERITIES),
  /** 页面正文中的逐字引用，代码会做子串校验。 */
  quote: z.string().trim().min(2),
  why: z.string().trim().min(2),
  fix: z.string().trim().min(2),
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

export const SOURCE_TYPES = ["url", "text"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const ReportMetaSchema = z.object({
  /** url = 抓取单页；text = 用户粘贴的文本，此时 url / final_url 为 null。 */
  source_type: z.enum(SOURCE_TYPES).default("url"),
  url: z.string().url().nullable(),
  final_url: z.string().url().nullable(),
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

export const ReportSchema = z.object({
  meta: ReportMetaSchema,
  summary: z.string().trim().min(10),
  risks: z.array(RiskSchema).min(3).max(8),
  strengths: z.array(StrengthSchema).min(1).max(6),
  not_assessable: z.array(NotAssessableSchema).min(1).max(8),
  dimensions: z.array(DimensionSchema).min(3).max(10),
});

/** 模型只负责这五个字段；meta 由 pipeline 在代码侧补齐，避免模型编造 URL 与时间。 */
export const ModelReportSchema = ReportSchema.omit({ meta: true });

export type Risk = z.infer<typeof RiskSchema>;
export type Strength = z.infer<typeof StrengthSchema>;
export type NotAssessable = z.infer<typeof NotAssessableSchema>;
export type Dimension = z.infer<typeof DimensionSchema>;
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
