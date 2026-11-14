/**
 * 合规与风险（Layer 4）的 finding 线格式。
 *
 * 这一层只做**规则级筛查**：页面原文 + `agent/knowledge/legal/my/rules.v0.1.json`
 * 里的公开法条。三档口径固定为规则库的 `decision_level`，代码不改写、不升级：
 *
 * - `rule_level`：页面上出现了该条规则所规范的行为要素（例如宣称政府批准、限量却
 *   不写数量），有明确法条 + 页面原文证据；
 * - `substantiation`：只能写「需要证明」，不判真假；
 * - `human_review`：整体语境/误导性判断，明确标「需人工判断」。
 *
 * 任何一档都不输出「合法/违法/保证通过/已认证」。字段与 RAY-696 的 `Risk` 契约一致
 * （snake_case，BFF 映射成 camelCase），外部无需新增数组：合规条目就是带
 * `dimension: "compliance"` 的 risk。
 */

import type { Severity } from "../types.js";

export const COMPLIANCE_DIMENSION = "compliance" as const;
export const COMPLIANCE_DIMENSION_NAME = "合规与风险";

export const DECISION_LEVELS = ["rule_level", "substantiation", "human_review"] as const;
export type DecisionLevel = (typeof DECISION_LEVELS)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type ComplianceConfidence = (typeof CONFIDENCE_LEVELS)[number];

/**
 * 一条 finding 会写进报告的 `risks` 数组，字段与 `RiskSchema` 的可选字段合并后一致。
 * `ruleId` 只留在代码侧：报告正文通过 `evidence` 暴露规则编号与官方来源，
 * 避免再往契约里加一个前端不认识的字段。
 */
export interface ComplianceFinding {
  ruleId: string;
  severity: Severity;
  /** 页面原文；缺席类检查（语言/隐私告知）取最能说明语境的原文，绝不补写。 */
  quote: string;
  why: string;
  fix: string;
  dimension: typeof COMPLIANCE_DIMENSION;
  lawName: string;
  lawShort: string;
  article: string;
  /** 官方来源 URL，写进 evidence，保证每条 finding 都能回到规则库与官方法条。 */
  officialUrl: string;
  decisionLevel: DecisionLevel;
  reviewRequired: boolean;
  lastVerified: string;
  confidence: ComplianceConfidence;
  /** 取证位置 + 规则编号 + 官方来源；同一句合并时的其他法条也在这里保留。 */
  evidence: string;
}

export interface ComplianceInput {
  /** 抓取到的可见文本（原始换行保留，便于逐字引用）。 */
  text: string;
  /** 品类代码：只用于判定「这件商品是否落在该规则的适用品类」。 */
  category: string;
  /** 页面标题，仅用于取证说明。 */
  title?: string;
  /** 页面 URL，仅用于取证说明。 */
  url?: string;
}

/** 每条规则的处置结果：进了报告、还是按能力边界跳过。测试与调试用，不进报告正文。 */
export interface ComplianceRuleDisposition {
  ruleId: string;
  decisionLevel: DecisionLevel;
  outcome: "finding" | "merged" | "no_match" | "not_assessable";
  /** 跳过或未命中时的原因，写进调试日志。 */
  reason?: string;
  /** 命中的模式（`merged` 时是被合并掉的那条）。 */
  pattern?: string;
}

export interface ComplianceSkipReason {
  /** 覆盖的规则 id。 */
  ruleIds: string[];
  reason: string;
}
