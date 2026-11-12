/** 文本归一化：报告引用的逐字核对与网页/PDF 内容比对都走同一套规则。 */
export function normalizeWhitespace(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** 去掉 Markdown 代码围栏，模型偶尔会包一层 ```json。 */
export function stripCodeFence(value: string): string {
  const trimmed = value.trim();
  const fenced = /^```(?:json)?\s*\n([\s\S]*?)\n```$/i.exec(trimmed);
  return fenced?.[1]?.trim() ?? trimmed;
}

/** 从模型输出里截取第一个完整 JSON 对象（容忍前后解释性文字）。 */
export function extractJsonObject(value: string): string {
  const text = stripCodeFence(value);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("模型输出中没有找到 JSON 对象");
  }
  return text.slice(start, end + 1);
}

const CJK = /[\u4e00-\u9fff]/;

export function hasChinese(value: string, minChars = 2): boolean {
  const matches = value.match(new RegExp(CJK.source, "g"));
  return (matches?.length ?? 0) >= minChars;
}

export function formatPercent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
