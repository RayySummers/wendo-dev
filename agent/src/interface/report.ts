import type { Dimension, Risk } from "../types.js";
import { describeFinding } from "./rules.js";
import { interfaceDimensionNote, type InterfaceAnalysis } from "./analyze.js";

/** 界面可翻译性是「沟通效果性 / 信息层级与表达自然度」下的子检查，不另起维度。 */
export const CONTENT_DIMENSION_NAME = "信息层级与表达自然度";

/**
 * 把界面信号转成报告里的风险条目。
 *
 * `kind: interface_translation` 是代码侧加的标记：这些条目不来自模型，
 * 证据是 CSS 声明与选择器，所以带 `evidence` 字段，网页与 PDF 都要单独渲染它。
 */
export function interfaceRisks(analysis: InterfaceAnalysis): Risk[] {
  return analysis.reported.map((finding) => {
    const { why, fix } = describeFinding(finding);
    return {
      severity: finding.severity,
      kind: "interface_translation" as const,
      quote: finding.quote,
      why,
      fix,
      evidence: finding.evidence,
    };
  });
}

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
const MAX_RISKS = 8;

export interface MergeOptions {
  /** 子检查挂到哪个维度上；默认知识库里 content 维度的名字。 */
  contentDimensionName?: string;
}

/**
 * 合并界面信号。
 *
 * - 风险：界面条目在前（可直接核对的结构证据），模型条目在后，按严重程度排序，最多 8 条；
 *   超出时先舍弃严重程度最低的模型条目。
 * - 维度：不新增维度，把结论追加到「信息层级与表达自然度」那一行的 note；
 *   有命中时该维度至少是 risk，没抓到 CSS 时明说无法判断，而不是当作合格。
 */
export function mergeInterfaceIntoReport(
  report: { risks: Risk[]; dimensions: Dimension[] },
  analysis: InterfaceAnalysis,
  options: MergeOptions = {},
): { risks: Risk[]; dimensions: Dimension[]; injected: number } {
  const injected = interfaceRisks(analysis);

  const ranked = [...injected, ...report.risks]
    .map((risk, index) => ({ risk, index }))
    .sort(
      (a, b) =>
        (SEVERITY_ORDER[a.risk.severity] ?? 9) - (SEVERITY_ORDER[b.risk.severity] ?? 9) ||
        a.index - b.index,
    )
    .map((entry) => entry.risk)
    .slice(0, MAX_RISKS);

  const target = options.contentDimensionName ?? CONTENT_DIMENSION_NAME;
  const note = interfaceDimensionNote(analysis);
  const dimensions = report.dimensions.map((dimension) =>
    dimension.name === target
      ? {
          ...dimension,
          status: analysis.findings.length > 0 ? ("risk" as const) : dimension.status,
          note: `${dimension.note}${dimension.note.endsWith("。") ? "" : "。"}${note}`,
        }
      : dimension,
  );

  return { risks: ranked, dimensions, injected: injected.length };
}
