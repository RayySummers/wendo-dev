import { normalizeWhitespace } from "../text.js";
import type { Report } from "../types.js";

/** 把 HTML 还原成可比较的纯文本（去标签、解实体），用于网页/PDF 内容一致性核对。 */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export interface ReportText {
  label: string;
  value: string;
}

/** 报告中所有需要网页与 PDF 一致呈现的文本，顺序与排版顺序一致。 */
export function reportTexts(report: Report): ReportText[] {
  const items: ReportText[] = [
    { label: "summary", value: report.summary },
    { label: "meta.title", value: report.meta.title },
    { label: "meta.tier", value: report.meta.tier },
  ];
  report.dimensions.forEach((dimension, index) => {
    items.push(
      { label: `dimensions[${index}].name`, value: dimension.name },
      { label: `dimensions[${index}].note`, value: dimension.note },
    );
  });
  report.risks.forEach((risk, index) => {
    items.push(
      { label: `risks[${index}].quote`, value: risk.quote },
      { label: `risks[${index}].why`, value: risk.why },
      { label: `risks[${index}].fix`, value: risk.fix },
    );
    // 界面信号带一条可直接核对的 CSS/HTML 证据，网页与 PDF 都要出现。
    if (risk.evidence) {
      items.push({ label: `risks[${index}].evidence`, value: risk.evidence });
    }
  });
  report.strengths.forEach((strength, index) => {
    items.push(
      { label: `strengths[${index}].quote`, value: strength.quote },
      { label: `strengths[${index}].why`, value: strength.why },
    );
  });
  (report.interface_candidates ?? []).forEach((candidate, index) => {
    items.push(
      { label: `interface_candidates[${index}].quote`, value: candidate.quote },
      { label: `interface_candidates[${index}].evidence`, value: candidate.evidence },
      { label: `interface_candidates[${index}].suggestion`, value: candidate.suggestion },
    );
  });
  report.not_assessable.forEach((item, index) => {
    items.push(
      { label: `not_assessable[${index}].item`, value: item.item },
      { label: `not_assessable[${index}].reason`, value: item.reason },
    );
  });
  return items.filter((item) => item.value.trim().length > 0);
}

/**
 * 逐条核对报告文本是否出现在渲染结果里。
 * stripAllWhitespace 用于 PDF 文本：pdftotext 会在任意位置断行。
 */
export function missingTexts(
  report: Report,
  haystack: string,
  options: { stripAllWhitespace?: boolean } = {},
): ReportText[] {
  const normalize = options.stripAllWhitespace
    ? (value: string) => value.replace(/\s+/g, "")
    : normalizeWhitespace;
  const target = normalize(haystack);
  return reportTexts(report).filter((item) => !target.includes(normalize(item.value)));
}
