/**
 * 市场就绪度（Layer 3）的检查结果线格式。
 *
 * 这一层只回答「页面上有没有把进入马来西亚市场所需的信息讲清楚」：
 * 每条检查只有 `present / missing / not_applicable / needs_review` 四种状态，
 * 没有分数、没有严重程度、不判断是否合规、不核验证书真伪。
 */

export const MARKET_READINESS_STATUSES = [
  "present",
  "missing",
  "not_applicable",
  "needs_review",
] as const;

export type MarketReadinessStatus = (typeof MARKET_READINESS_STATUSES)[number];

/** 维度 key 固定，与网页报告 `DimensionKey` 的 `market_readiness` 对齐。 */
export const MARKET_READINESS_DIMENSION = "market_readiness" as const;

export const MARKET_READINESS_DIMENSION_NAME = "市场就绪度";

export interface MarketReadinessFinding {
  /** v0.1 的 8 条固定检查：MY-MR-01 … MY-MR-08。 */
  checkId: string;
  label: string;
  status: MarketReadinessStatus;
  /** 页面原文；未展示时为空字符串，绝不补写。 */
  quote: string;
  why: string;
  fix: string;
  dimension: typeof MARKET_READINESS_DIMENSION;
  /** 代码侧的取证位置（命中项、行号、取证范围），不是页面原文。 */
  evidence?: string;
}

export interface MarketReadinessInput {
  /** fetch_page 抓到的可见文本（原始换行保留，便于逐字引用）。 */
  text: string;
  /** 品类代码；决定电压/插头与认证两类检查是否适用。 */
  category: string;
  /** 页面标题，仅用于取证说明。 */
  title?: string;
  /** 页面 URL，仅用于取证说明。 */
  url?: string;
}
