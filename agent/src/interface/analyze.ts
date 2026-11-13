import { INTERFACE_RULE_ORDER, INTERFACE_RULES } from "./rules.js";
import type {
  InterfaceElementSnapshot,
  InterfaceFinding,
  InterfaceRuleId,
  InterfaceSnapshot,
} from "./types.js";

/**
 * 目标语言相对当前文案的膨胀系数。
 *
 * 取 1.4 与知识库 MY-UI-01/02 的「1.4 探针」一致：只有连 40% 余量都没有的容器
 * 才会被报出来。中文→英语、英语→马来语的实际膨胀通常高于这个值，所以报出来的
 * 都是下限；容器宽度来自声明推算时，证据里会标「（估算）」。
 */
export const TRANSLATION_EXPANSION = 1.4;

/** 报告里最多写几条 interface 风险；其余在维度说明里汇总。 */
const MAX_REPORTED = 3;

/**
 * 字符宽度（单位 em）分档估算。
 *
 * 没有浏览器排版引擎，只能按字符类别估：拉丁小写约 0.52em、大写 0.68em、
 * 数字 0.56em，CJK 与全角标点按 1em（定宽原子）。经验值偏保守，宁可少报。
 */
const CHAR_WIDTH_EM: Array<[RegExp, number]> = [
  [/[\u1100-\u115f\u2e80-\u303e\u3041-\u33ff\u3400-\u4dbf\u4e00-\u9fff\ua000-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/, 1],
  [/[MW@%]/, 0.92],
  [/[mw]/, 0.82],
  [/[A-Z]/, 0.68],
  [/[0-9]/, 0.56],
  [/[iljI.,:;'!|]/, 0.28],
  [/\s/, 0.28],
  [/[a-z]/, 0.52],
  [/./, 0.56],
];

function charWidthEm(char: string): number {
  for (const [pattern, width] of CHAR_WIDTH_EM) {
    if (pattern.test(char)) return width;
  }
  return 0.56;
}

/** 按字符类别估算一段文字的排版宽度（px）。 */
export function estimateTextWidth(
  text: string,
  fontSizePx: number,
  fontWeight = 400,
  letterSpacingPx = 0,
): number {
  const boldFactor = fontWeight >= 600 ? 1.04 : 1;
  let width = 0;
  const chars = Array.from(text);
  for (const char of chars) {
    width += charWidthEm(char) * fontSizePx * boldFactor;
  }
  if (letterSpacingPx > 0 && chars.length > 1) {
    width += letterSpacingPx * (chars.length - 1);
  }
  return width;
}

const round = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

function isClipped(element: InterfaceElementSnapshot): boolean {
  if (element.line_clamp && element.line_clamp > 0) return true;
  return element.overflow === "hidden" || element.overflow === "clip";
}

/** 可容纳的行数：显式 line-clamp 优先，其次按固定高度 / 行高换算。 */
function capacityLines(element: InterfaceElementSnapshot): number | undefined {
  if (element.line_clamp && element.line_clamp > 0) return element.line_clamp;
  const height = element.max_height_px ?? element.height_px;
  if (!height || height <= 0 || element.line_height_px <= 0) return undefined;
  return height / element.line_height_px;
}

function declaredBound(element: InterfaceElementSnapshot): number | undefined {
  if (element.width_px && element.width_px > 0) return element.width_px;
  if (element.max_width_px && element.max_width_px > 0) return element.max_width_px;
  return undefined;
}

/** 证据行：知识库编号 → 命中机制 → 关键数值 → 选择器。 */
function evidenceLine(
  rule: InterfaceRuleId,
  parts: Array<string | undefined>,
  selector: string,
): string {
  const meta = INTERFACE_RULES[rule];
  return [meta.kbRule, meta.mechanism, ...parts.filter((part): part is string => Boolean(part)), selector].join(" · ");
}

function findingsFor(
  rule: InterfaceRuleId,
  severity: InterfaceFinding["severity"],
  element: Pick<InterfaceElementSnapshot, "selector" | "text">,
  evidence: string,
): InterfaceFinding {
  return {
    rule,
    channel: INTERFACE_RULES[rule].channel,
    severity,
    quote: element.text,
    selector: element.selector,
    evidence,
    occurrences: 1,
  };
}

const CHAR_UNIT_WIDTH = /^\d+(?:\.\d+)?(ch|ex|ic)$/i;

/**
 * IF-TRUNC-03（MY-UI-01）：宽度按字符数（ch / ex）书写。
 *
 * 这类声明换算不成 px，正说明宽度是「按拉丁字符数」定死的：换语言后容器不会跟着变，
 * 中文会溢出、英文会留白。没有尺寸复核也能报，因为问题在「宽度怎么定的」。
 */
function checkCharUnitWidths(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  for (const element of elements) {
    const hit = [
      ["width", element.width_raw],
      ["max-width", element.max_width_raw],
      ["min-width", element.min_width_raw],
    ].find(([, raw]) => raw && CHAR_UNIT_WIDTH.test(raw.trim()));
    if (!hit) continue;
    if (element.text.trim().length < 4) continue;
    const [prop, raw] = hit as [string, string];
    const evidence = evidenceLine("IF-TRUNC-03", [`${prop}:${raw.trim()}`], element.selector);
    findings.push(findingsFor("IF-TRUNC-03", "medium", element, evidence));
  }
  return findings;
}

/** IF-TRUNC-01：固定高度 / line-clamp 的文本盒，换语言后行数不够。 */
function checkPinnedBox(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  for (const element of elements) {
    if (!isClipped(element)) continue;
    const capacity = capacityLines(element);
    if (!capacity || capacity < 1 || capacity > 4) continue;
    const width = element.container_px;
    if (!width || width < 40) continue;
    if (element.text.trim().length < 8) continue;

    // 文字按整行折行：先换算成「需要几行」，再和容器能容纳的行数比较。
    const linesNow = estimateTextWidth(element.text, element.font_size_px, element.font_weight, element.letter_spacing_px ?? 0) / width;
    const linesAfter = Math.ceil(linesNow * TRANSLATION_EXPANSION);
    const linesNowRounded = Math.ceil(linesNow);
    if (linesAfter <= capacity * 0.95) continue;

    // 已经放不下是硬证据；只有加上翻译膨胀才放不下时，按估算精度降一档。
    const declared = element.container_source === "declared";
    const severity: InterfaceFinding["severity"] =
      linesNowRounded > capacity ? (declared ? "high" : "medium") : "medium";
    const precision = declared ? "" : "（估算）";
    const evidence = evidenceLine(
      "IF-TRUNC-01",
      [
        `height:${round(element.height_px ?? 0)}px`,
        `line-height:${round(element.line_height_px)}px`,
        `估算 ${linesAfter} 行 / 可容纳 ${round(capacity)} 行`,
        `容器宽约 ${Math.round(width)}px${precision}`,
      ],
      element.selector,
    );
    findings.push(findingsFor("IF-TRUNC-01", severity, element, evidence));
  }
  return findings;
}

/** IF-TRUNC-02：单行不换行 + 固定宽度 + 省略/裁切。 */
function checkSingleLine(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  for (const element of elements) {
    if (element.white_space !== "nowrap") continue;
    const clipped = element.text_overflow === "ellipsis" || isClipped(element);
    if (!clipped) continue;
    const bound = declaredBound(element);
    if (!bound || bound < 32) continue;
    if (element.text.trim().length < 4) continue;

    const widthNow = estimateTextWidth(element.text, element.font_size_px, element.font_weight, element.letter_spacing_px ?? 0);
    const ratio = (widthNow * TRANSLATION_EXPANSION) / bound;
    if (ratio <= 0.95) continue;

    const severity: InterfaceFinding["severity"] = ratio > 1.15 ? "high" : "medium";
    const evidence = evidenceLine(
      "IF-TRUNC-02",
      [
        `white-space:nowrap + ${element.text_overflow ? "text-overflow:ellipsis" : "overflow:hidden"}`,
        `${element.width_px ? "width" : "max-width"}:${Math.round(bound)}px`,
        `当前文本估宽 ${Math.round(widthNow)}px，换语言后约 ${Math.round(widthNow * TRANSLATION_EXPANSION)}px`,
      ],
      element.selector,
    );
    findings.push(findingsFor("IF-TRUNC-02", severity, element, evidence));
  }
  return findings;
}

/** IF-WRAP-01：break-all 遇到拉丁词会在词中断行。 */
function checkBreakAll(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  for (const element of elements) {
    if (element.word_break !== "break-all") continue;
    if (!/[A-Za-z]{8,}/.test(element.text)) continue;
    const evidence = evidenceLine("IF-WRAP-01", ["word-break:break-all"], element.selector);
    findings.push(findingsFor("IF-WRAP-01", "medium", element, evidence));
  }
  return findings;
}

const LANG_TAG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

/** IF-WRAP-02：html 缺少或写错 lang。 */
function checkDocumentLang(snapshot: InterfaceSnapshot): InterfaceFinding[] {
  const lang = (snapshot.lang ?? "").trim();
  if (lang && LANG_TAG.test(lang)) return [];
  const openTag = snapshot.html_open_tag?.trim() || "<html>";
  const evidence = evidenceLine(
    "IF-WRAP-02",
    [lang ? `lang="${lang}" 不是合法的 BCP 47 标签` : "根元素没有 lang 属性", openTag],
    "html",
  );
  return [
    {
      rule: "IF-WRAP-02",
      channel: INTERFACE_RULES["IF-WRAP-02"].channel,
      severity: "low",
      quote: openTag,
      selector: "html",
      evidence,
      occurrences: 1,
    },
  ];
}

/** IF-WRAP-03：不可断的长词落进窄容器，且没有断词设置。 */
function checkLongTokens(snapshot: InterfaceSnapshot): InterfaceFinding[] {
  const elements = snapshot.elements ?? [];
  const bySelector = new Map(elements.map((element) => [element.selector, element]));
  const findings: InterfaceFinding[] = [];
  const seen = new Set<string>();

  for (const token of snapshot.long_tokens ?? []) {
    if (seen.has(token.token.toLowerCase())) continue;
    const element = bySelector.get(token.selector);
    if (!element) continue;
    if (element.overflow_wrap && element.overflow_wrap !== "normal") continue;
    if (element.hyphens && element.hyphens !== "none" && element.hyphens !== "manual") continue;
    const width = element.container_px;
    if (!width || width < 40) continue;
    const tokenWidth = estimateTextWidth(token.token, element.font_size_px, element.font_weight);
    if (tokenWidth * TRANSLATION_EXPANSION <= width * 0.95) continue;

    seen.add(token.token.toLowerCase());
    const evidence = evidenceLine(
      "IF-WRAP-03",
      [
        `长词「${token.token}」估宽 ${Math.round(tokenWidth)}px`,
        `容器宽约 ${Math.round(width)}px`,
        "未设 overflow-wrap / hyphens",
      ],
      token.selector,
    );
    findings.push(findingsFor("IF-WRAP-03", "low", { selector: token.selector, text: token.text }, evidence));
  }
  return findings;
}

/** IF-WRAP-04：标题行高过紧，折行后挤在一起。 */
function checkTightHeadings(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const baseSize = mode(elements.map((element) => element.font_size_px)) ?? 16;
  const findings: InterfaceFinding[] = [];
  for (const element of elements) {
    const isHeading = /^h[1-6]$/.test(element.tag) || element.font_size_px >= baseSize * 1.4;
    if (!isHeading) continue;
    if (element.font_size_px < 14) continue;
    if (element.text.trim().length < 12) continue;
    const ratio = element.line_height_px / element.font_size_px;
    if (ratio >= 1.2) continue;
    const evidence = evidenceLine(
      "IF-WRAP-04",
      [
        `font-size:${round(element.font_size_px)}px`,
        `line-height:${round(element.line_height_px)}px（${round(ratio, 2)} 倍）`,
      ],
      element.selector,
    );
    findings.push(findingsFor("IF-WRAP-04", "low", element, evidence));
  }
  return findings;
}

export interface HierarchyStats {
  fontSizes: number;
  fontWeights: number;
  colors: number;
  textElements: number;
  sizeValues: number[];
  weightValues: number[];
}

/** 统计同一视图里的字号 / 字重 / 颜色档位。 */
export function measureHierarchy(elements: InterfaceElementSnapshot[]): HierarchyStats {
  const sizes = new Set<number>();
  const weights = new Set<number>();
  const colors = new Set<string>();
  for (const element of elements) {
    sizes.add(Math.round(element.font_size_px * 2) / 2);
    weights.add(Math.round(element.font_weight / 100) * 100);
    if (element.color) colors.add(element.color);
  }
  return {
    fontSizes: sizes.size,
    fontWeights: weights.size,
    colors: colors.size,
    textElements: elements.length,
    sizeValues: [...sizes].sort((a, b) => a - b),
    weightValues: [...weights].sort((a, b) => a - b),
  };
}

/** IF-HIER-01：字号/字重层次很少，层级主要靠颜色和边框。 */
function checkHierarchy(elements: InterfaceElementSnapshot[], stats: HierarchyStats): InterfaceFinding[] {
  if (stats.textElements < 20) return [];
  if (stats.fontSizes > 3 || stats.fontWeights > 2 || stats.colors < 4) return [];
  const bordered = elements.filter(
    (element) => element.border_width_px > 0 || (element.border_radius_px ?? 0) >= 6,
  );
  const representative = elements.find((element) => element.color && element.text.length >= 8);
  if (!representative) return [];
  const evidence = evidenceLine(
    "IF-HIER-01",
    [
      `${stats.textElements} 个文本元素只有 ${stats.fontSizes} 档字号 / ${stats.fontWeights} 档字重`,
      `却用了 ${stats.colors} 种文字颜色`,
      `${bordered.length} 处带边框或圆角`,
    ],
    representative.selector,
  );
  return [findingsFor("IF-HIER-01", "medium", representative, evidence)];
}

function mode(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best: [number, number] = [values[0] as number, 0];
  for (const [value, count] of counts) {
    if (count > best[1]) best = [value, count];
  }
  return best[0];
}

const SEVERITY_ORDER: Record<InterfaceFinding["severity"], number> = { high: 0, medium: 1, low: 2 };

export interface InterfaceAnalysis {
  findings: InterfaceFinding[];
  /** 交给报告的条目：同一规则合并，按严重程度取前几条。 */
  reported: InterfaceFinding[];
  hierarchy: HierarchyStats;
  captured: boolean;
  reason?: string;
}

/**
 * 把抓取到的样式快照变成可举证的风险条目。
 *
 * 一条规则命中多处时合并成一条，并记录出现次数；没有信号就不产出条目，
 * 这是「无信号页面不产生假阳性」的实现位置。
 */
export function analyzeInterface(snapshot: InterfaceSnapshot | undefined): InterfaceAnalysis {
  const emptyHierarchy: HierarchyStats = {
    fontSizes: 0,
    fontWeights: 0,
    colors: 0,
    textElements: 0,
    sizeValues: [],
    weightValues: [],
  };
  if (!snapshot || !snapshot.captured) {
    return {
      findings: [],
      reported: [],
      hierarchy: emptyHierarchy,
      captured: false,
      reason: snapshot?.reason ?? "抓取结果里没有界面样式快照",
    };
  }

  const elements = snapshot.elements ?? [];
  const hierarchy = measureHierarchy(elements);

  const all: InterfaceFinding[] = [
    ...checkCharUnitWidths(elements),
    ...checkPinnedBox(elements),
    ...checkSingleLine(elements),
    ...checkBreakAll(elements),
    ...checkDocumentLang(snapshot),
    ...checkLongTokens(snapshot),
    ...checkTightHeadings(elements),
    ...checkHierarchy(elements, hierarchy),
  ];

  // 同一规则合并：保留最严重的一条作为代表，其余只计数。
  const byRule = new Map<InterfaceRuleId, InterfaceFinding[]>();
  for (const finding of all) {
    const bucket = byRule.get(finding.rule);
    if (bucket) bucket.push(finding);
    else byRule.set(finding.rule, [finding]);
  }

  const merged: InterfaceFinding[] = [];
  for (const rule of INTERFACE_RULE_ORDER) {
    const bucket = byRule.get(rule);
    if (!bucket?.length) continue;
    const sorted = [...bucket].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    const best = sorted[0] as InterfaceFinding;
    merged.push({ ...best, occurrences: bucket.length });
  }

  const reported = [...merged]
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        INTERFACE_RULE_ORDER.indexOf(a.rule) - INTERFACE_RULE_ORDER.indexOf(b.rule),
    )
    .slice(0, MAX_REPORTED);

  return { findings: merged, reported, hierarchy, captured: true };
}

/** 界面可翻译性维度的一句话依据。 */
/** 「信息层级与表达自然度」维度里的一句话依据（子检查，不另起维度）。 */
export function interfaceDimensionNote(analysis: InterfaceAnalysis): string {
  if (!analysis.captured) {
    const reason = analysis.reason ? `（${analysis.reason}）` : "";
    return `界面子检查无法判断：本次没有取到可用的 CSS${reason}。`;
  }
  const { hierarchy, findings } = analysis;
  const base = `界面子检查：检查 ${hierarchy.textElements} 个文本元素，${hierarchy.fontSizes} 档字号 / ${hierarchy.fontWeights} 档字重 / ${hierarchy.colors} 种文字颜色。`;
  if (findings.length === 0) {
    return `${base}未发现固定宽度裁切、定高文本盒或断词配置。`;
  }
  const names = findings.map((finding) => INTERFACE_RULES[finding.rule].label).join("、");
  return `${base}命中 ${findings.length} 类界面信号：${names}。`;
}
