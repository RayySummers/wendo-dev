import { INTERFACE_RULE_ORDER, INTERFACE_RULES } from "./rules.js";
import type {
  InterfaceCandidate,
  InterfaceElementSnapshot,
  InterfaceFinding,
  InterfaceFormSnapshot,
  InterfaceRuleId,
  InterfaceSnapshot,
} from "./types.js";

/** 与抓取侧保持一致：这些 input type 不承载自然语言输入。 */
const NON_TEXT_INPUT_TYPES = new Set([
  "hidden",
  "submit",
  "button",
  "reset",
  "image",
  "file",
  "checkbox",
  "radio",
  "email",
  "tel",
  "password",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "range",
  "url",
]);

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

const CJK_TEXT = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3041-\u30ff]/;

/**
 * IF-SIZE-01（MY-UI-04）：字号压到 CJK 可读下限以下。
 *
 * 只报「会承载阅读」的文本：整段说明、商品名、价格这类；单个角标数字也报，
 * 因为角标在大促界面里经常就是唯一的促销信息载体。
 */
function checkSmallType(
  elements: InterfaceElementSnapshot[],
  documentLang: string | null | undefined,
): InterfaceFinding[] {
  // 规则包明确排除「拉丁文 10px」：拉丁靠轮廓区分，小字号本身不是发现。
  // 只有当页面语言是 CJK、或这段文字本身就是 CJK 时才判。
  const pageIsCjk = /^(zh|ja|ko)\b/i.test((documentLang ?? "").trim());
  const findings: InterfaceFinding[] = [];
  for (const element of elements) {
    if (element.font_size_px > 11) continue;
    const text = element.text.trim();
    if (text.length < 2) continue;
    // 纯图标 / 纯符号（货币符号、单个数字除外）不当作可读性问题。
    if (!/[\p{L}\p{N}]/u.test(text)) continue;
    if (text.length <= 1 && !CJK_TEXT.test(text)) continue;

    const isCjk = CJK_TEXT.test(text);
    if (!isCjk && !pageIsCjk) continue;
    const evidence = evidenceLine(
      "IF-SIZE-01",
      [
        `font-size:${round(element.font_size_px)}px`,
        `line-height:${round(element.line_height_px)}px`,
        isCjk ? "当前文本已是 CJK，低于 12px 可读下限" : "目标语言为 CJK 时低于 12px 可读下限",
      ],
      element.selector,
    );
    findings.push(findingsFor("IF-SIZE-01", element.font_size_px <= 10 ? "medium" : "low", element, evidence));
  }
  return findings;
}

/** 首屏动作密度阈值（编辑判断）：与知识库 MY-UI-06 一致，本包不预设「同类基线」，只做显著偏离。 */
const DENSITY_ACTIONS = 40;
const DENSITY_UNIQUE_TARGETS = 30;

/**
 * IF-DENSITY-01（MY-UI-06）：可点元素过多、且没有任何主次区分。
 *
 * 口径限制（会写进证据）：静态抓取量不到「首屏」，这里数的是**整页**可点元素；
 * 也没有同品类基线（RAY-673 要求基线由本单给出，目前只有这一个站点样本），
 * 所以判据取得很保守——数量显著偏离常规，且连一个视觉上突出的主操作都找不到。
 * 只要存在若干带底色/更大字号的按钮，就认为页面搭了层级，不报。
 */
function checkActionDensity(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const interactive = elements.filter((element) => element.is_interactive);
  if (interactive.length < DENSITY_ACTIONS) return [];

  const distinctTexts = new Set(
    interactive.map((element) => element.text.trim().toLowerCase()).filter(Boolean),
  );
  if (distinctTexts.size < DENSITY_UNIQUE_TARGETS) return [];

  // 主 CTA：字号明显大于其他动作、或带独立底色的动作。
  // 只要存在若干这样的动作，就说明页面确实搭了层级；只有「一个都没有」才谈得上没有主次。
  const sizes = interactive.map((element) => element.font_size_px);
  const median = medianOf(sizes);
  const promoted = interactive.filter(
    (element) =>
      element.font_size_px >= median * 1.25 ||
      (element.background_color !== null &&
        !["transparent", "inherit", "none", "rgba(0, 0, 0, 0)"].includes(element.background_color)),
  );
  if (promoted.length > 0) return [];

  const representative = interactive.reduce((best, element) =>
    element.text.length > best.text.length ? element : best,
  );
  const evidence = evidenceLine(
    "IF-DENSITY-01",
    [
      `整页可点元素 ${interactive.length} 个 / 不同文案 ${distinctTexts.size} 条`,
      `字号中位数 ${round(median)}px，没有任何视觉上突出的主操作`,
    ],
    representative.selector,
  );
  return [findingsFor("IF-DENSITY-01", "medium", representative, evidence)];
}

/** 用副词区分主次或掩盖多步操作（MY-UI-07）。 */
const PATCH_WORD = /(仅|一键|立即|轻松|只需|只需一键|\bjust\b|\bonly\b|\bsimply\b|\beasily\b)/i;

function checkPatchWords(elements: InterfaceElementSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  const seen = new Set<string>();
  for (const element of elements) {
    // 规则说的是「用副词区分主次动作」，所以只判可点元素；「仅剩 2 件」这类陈述不是它的靶子。
    if (!element.is_interactive) continue;
    const text = element.text.trim();
    if (!text || text.length > 40) continue;
    if (!PATCH_WORD.test(text)) continue;
    if (seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    const matched = text.match(PATCH_WORD)?.[0] ?? "";
    const evidence = evidenceLine(
      "IF-WORD-01",
      [`按钮/标签文案含「${matched}」`, `完整文案「${text}」`],
      element.selector,
    );
    findings.push(findingsFor("IF-WORD-01", "low", element, evidence));
  }
  return findings;
}

/** 不算「自然语言输入」的字段（规则包排除项）：邮箱、电话、验证码等 Latin-only 字段。 */
const LATIN_ONLY_FIELD = /(email|e-mail|phone|tel|mobile|fax|zip|postal|code|captcha|otp|slug|sku|search|q)$/i;

/**
 * IF-INPUT-01（MY-UI-08）：输入框硬限长。
 *
 * 判据是「短上限 + 自然语言字段」：地址 30 字、备注 100 字这类会在中文输入下先撞墙。
 * 搜索框与邮箱/电话/验证码不算（规则包排除项）。
 */
function checkHardMaxlength(forms: InterfaceFormSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  for (const form of forms) {
    if (form.tag !== "input" && form.tag !== "textarea") continue;
    if (form.type && NON_TEXT_INPUT_TYPES.has(form.type)) continue;
    if (form.maxlength === null || form.maxlength <= 0) continue;
    // 搜索框限长不构成缺陷：查询本来就是短串。
    if (form.type === "search" || LATIN_ONLY_FIELD.test(form.name ?? "") || /search/i.test(form.placeholder ?? "")) {
      continue;
    }
    const limit = form.maxlength;
    if (limit > 60) continue;
    const severity = limit <= 20 ? "medium" : "low";
    const evidence = [
      "MY-UI-08",
      "硬限长",
      `maxlength=${limit}`,
      form.placeholder ? `placeholder「${form.placeholder}」` : `字段 ${form.name ?? "(未命名)"}`,
      form.inside_form ? "位于表单内" : "独立输入框",
      form.selector,
    ].join(" · ");
    findings.push({
      rule: "IF-INPUT-01",
      channel: INTERFACE_RULES["IF-INPUT-01"].channel,
      severity,
      quote: form.placeholder || form.aria_label || `maxlength=${limit}`,
      selector: form.selector,
      evidence,
      occurrences: 1,
    });
  }
  return findings;
}

const ENTER_SUBMIT = /(key(code)?\s*(===?|==)\s*['"]Enter['"]|keyCode\s*(===?|==)\s*13|which\s*(===?|==)\s*13)/i;
const SPACE_REWRITE = /replace\s*\(\s*\/[^/]*\\s[^/]*\/[gi]*\s*,\s*['"`]-/i;
const COMPOSING_GUARD = /isComposing|compositionstart|compositionend|compositionupdate/i;

/**
 * IF-INPUT-02（MY-UI-08）：Enter 提交 / 空格替换没有判输入法组合态。
 *
 * 只做静态判据：内联脚本里出现 Enter 提交或空格转 `-`，且通篇找不到 isComposing 判断。
 * 运行时行为（组合期是否真的抢键）标注为「需要交互复核」，不写成确定结论。
 */
function checkInputHandlers(forms: InterfaceFormSnapshot[]): InterfaceFinding[] {
  const findings: InterfaceFinding[] = [];
  for (const form of forms) {
    const all = Object.values(form.handlers).join(" ");
    if (!all) continue;
    const enters = ENTER_SUBMIT.test(all);
    const spaces = SPACE_REWRITE.test(all);
    if (!enters && !spaces) continue;
    if (COMPOSING_GUARD.test(all)) continue;

    const mechanism = enters && spaces ? "Enter 提交 + 空格替换" : enters ? "Enter 直接提交" : "空格替换成 -";
    const evidence = [
      "MY-UI-08",
      mechanism,
      "未判断 isComposing",
      form.placeholder ? `placeholder「${form.placeholder}」` : `字段 ${form.name ?? "(未命名)"}`,
      form.selector,
    ].join(" · ");
    findings.push({
      rule: "IF-INPUT-02",
      channel: INTERFACE_RULES["IF-INPUT-02"].channel,
      severity: enters ? "medium" : "low",
      quote: form.placeholder || form.aria_label || form.name || form.selector,
      selector: form.selector,
      evidence,
      occurrences: 1,
    });
  }
  return findings;
}

function medianOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2 : (sorted[mid] as number);
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
  /**
   * 只作提示的候选：MY-UI-09 声音层（没做 round-trip 不写成缺陷）、
   * MY-UI-10 RTL（本轮只记录）。不进 risks，报告单列一节。
   */
  candidates: InterfaceCandidate[];
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
      candidates: [],
      hierarchy: emptyHierarchy,
      captured: false,
      reason: snapshot?.reason ?? "抓取结果里没有界面样式快照",
    };
  }

  const elements = snapshot.elements ?? [];
  const hierarchy = measureHierarchy(elements);

  const forms = snapshot.forms ?? [];
  const all: InterfaceFinding[] = [
    ...checkCharUnitWidths(elements),
    ...checkPinnedBox(elements),
    ...checkSingleLine(elements),
    ...checkBreakAll(elements),
    ...checkDocumentLang(snapshot),
    ...checkLongTokens(snapshot),
    ...checkTightHeadings(elements),
    ...checkSmallType(elements, snapshot.lang),
    ...checkHierarchy(elements, hierarchy),
    ...checkActionDensity(elements),
    ...checkPatchWords(elements),
    ...checkHardMaxlength(forms),
    ...checkInputHandlers(forms),
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

  return {
    findings: merged,
    reported,
    candidates: collectCandidates(snapshot, elements),
    hierarchy,
    captured: true,
  };
}

// ---------------------------------------------------------------- 候选（不进 risks）

/**
 * 声音层短句（MY-UI-09 判据 1）：高语域依赖的收尾/打气式文案。
 *
 * 这类句子直译会变平，规则包要求「重写，不翻译」，而且**没做 round-trip 不写成缺陷**，
 * 所以只作为候选提示，报告里写成建议。
 */
const VOICE_PHRASES =
  /\b(oops|yay|nice|awesome|you'?re all set|all set|hang tight|let'?s get you set up|get more done|nothing was lost|give it another go)\b/i;

/** 三词以内、以句号收尾的短标语：节奏本身就是卖点，翻译后最容易丢。 */
function looksLikeSlogan(text: string): boolean {
  const trimmed = text.trim();
  if (!/[.!]$/.test(trimmed)) return false;
  const words = trimmed.replace(/[.!]+$/, "").trim().split(/\s+/);
  if (words.length === 0 || words.length > 3) return false;
  return /[A-Za-z]/.test(trimmed);
}

/**
 * MY-UI-09 声音层候选 + 字体回退候选。
 *
 * 只在「能给出具体引用」时产出：命中固定句式、短标语、或页面层级依赖拉丁字面却没写 CJK 回退。
 * 规则包的红线是「没做 round-trip 不写成缺陷」，因此这些永远进 candidates，不进 risks。
 */
function collectCandidates(
  snapshot: InterfaceSnapshot,
  elements: InterfaceElementSnapshot[],
): InterfaceCandidate[] {
  return [...voiceCandidates(snapshot, elements), ...rtlCandidates(snapshot)];
}

function voiceCandidates(
  snapshot: InterfaceSnapshot,
  elements: InterfaceElementSnapshot[],
): InterfaceCandidate[] {
  const candidates: InterfaceCandidate[] = [];

  // 1) 固定句式 / 短标语
  const seen = new Set<string>();
  for (const element of elements) {
    const text = element.text.trim();
    if (!text || text.length > 80) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;

    const phrase = text.match(VOICE_PHRASES)?.[0];
    const slogan = !phrase && looksLikeSlogan(text) && element.font_size_px >= 20;
    if (!phrase && !slogan) continue;

    seen.add(key);
    candidates.push({
      rule: "MY-UI-09",
      kind: "voice",
      quote: text.slice(0, 80),
      selector: element.selector,
      evidence: [
        "MY-UI-09",
        phrase ? `高语域短句「${phrase}」` : "短标语（节奏即卖点）",
        `font-size:${round(element.font_size_px)}px`,
        "未做 round-trip，仅候选",
      ].join(" · "),
      suggestion:
        "这类字符串按声音层处理：重写而不是直译（例如按目标语言重新组织一句等价的语气），并在 EN→ZH→EN（或 ZH→EN→ZH）之后复核语气是否变平、变幼稚或变官僚。",
    });
    if (candidates.length >= 3) break;
  }

  // 2) 页面层级依赖拉丁 display face，却没有声明 CJK 回退
  if (snapshot.cjk_font_declared === false) {
    // 嵌套元素会把同一句话重复算多次（下拉菜单的 "Login" 会出现 3 层），所以按文案去重。
    const distinctText = new Set<string>();
    const big = elements.filter((element) => {
      if (element.font_size_px < 24) return false;
      const text = element.text.trim();
      if (text.length < 2) return false;
      const key = text.toLowerCase();
      if (distinctText.has(key)) return false;
      distinctText.add(key);
      return true;
    });
    // 代表样本取字号最大、其次文案最长的那一条，避免拿 "Login" 这种短标签当标题证据。
    const declared = [...big]
      .filter((element) => element.font_family)
      .sort(
        (a, b) =>
          b.font_size_px - a.font_size_px || b.text.trim().length - a.text.trim().length,
      )[0];
    if (declared && big.length >= 2) {
      const sizes = [...new Set(big.map((element) => Math.round(element.font_size_px)))].sort((a, b) => a - b);
      candidates.push({
        rule: "MY-UI-09",
        kind: "voice",
        quote: declared.text.slice(0, 60),
        selector: declared.selector,
        evidence: [
          "MY-UI-09",
          `${big.length} 处标题级文字（${sizes.join("/")}px）`,
          `字体栈「${(declared.font_family ?? "(未声明)").slice(0, 60)}」没有声明 CJK 字面`,
        ].join(" · "),
        suggestion:
          "在字体栈里显式补 CJK 回退（例如 Noto Sans SC / Source Han Sans），并逐档检查字重与行高：中文版整体退回系统字体后，标题的层级与节奏会跟着变。",
      });
    }
  }
  return candidates;
}

/**
 * MY-UI-10：RTL / Latin 假设遗留 —— 按父单决定**本轮只记录**，不做检测结论。
 *
 * 有 dir 声明就把实测值写下来（供后续镜像测试对照）；没有就记「未声明」。
 * 这一条不产生风险条目，也不影响维度状态。
 */
function rtlCandidates(snapshot: InterfaceSnapshot): InterfaceCandidate[] {
  const dir = (snapshot.dir ?? "").trim();
  const lang = (snapshot.lang ?? "").trim();
  if (dir.toLowerCase() === "rtl") return [];
  return [
    {
      rule: "MY-UI-10",
      kind: "rtl",
      quote: snapshot.html_open_tag?.trim() || "<html>",
      selector: "html",
      evidence: [
        "MY-UI-10",
        dir ? `dir="${dir}"` : "未声明 dir",
        lang ? `lang="${lang}"` : "未声明 lang",
        "RTL 镜像测试未执行（本轮只记录）",
      ].join(" · "),
      suggestion:
        "后续扩展：给根节点加 dir=\"rtl\" 做一次镜像测试，按「关系而非位置」复核（返回箭头、进度、步骤流要镜像；时钟、播放控制、对勾不动；数字不镜像）；同时检查 left/right 定位、translateX、写死的 flex order、以及 toUpperCase() 这类拉丁假设。",
    },
  ];
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
