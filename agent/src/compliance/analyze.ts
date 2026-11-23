/**
 * 合规与风险 v0.1 代码侧规则判定，按市场分派（RAY-773 起）。
 *
 * 设计口径（与 RAY-684 / RAY-696 / RAY-698 对齐）：
 * - 规则库按市场加载（RAY-754：`legal/index.json` → `legal/<cc>/rules.v0.1.json`）；
 *   法条、条文号、官方 URL、核验日期全部来自该市场的规则库，代码不写死任何法条。
 * - 判定器也按市场挂载：`rules.ts` 的 `COMPLIANCE_MATCHERS_BY_MARKET` 决定「这个市场怎么判」。
 *   没挂载的市场显式降级为「未评估」，绝不把 MY 的 matcher 套到别国页面上。
 * - 三档判定沿用规则库的 `decision_level`，不改写：规则直判 / 需事实核实 / 需人工判断。
 * - 同一页同一规则只出一条；同一句触发多条规则时合并成一张卡，各法条写进 evidence。
 * - 取证范围优先商品主面板（价格/SKU 锚点），导航、推荐位、页脚链接标签不参与取证。
 * - 缺席类检查（语言版本、隐私告知、退订、凭据）只写「页面未展示」，不推断未认证/未合规，
 *   并一律标 `reviewRequired`。
 * - 输出里不出现「合法 / 违法 / 保证通过 / 已认证」这类判决式措辞。
 */

import type { Risk, Severity } from "../types.js";
import { resolveMarket, type MarketInfo } from "../market.js";
import { findProductPanel, isSubstantiveLine } from "../market-readiness/analyze.js";
import { loadLegalLibrary, type LegalLibrary } from "./library.js";
import {
  assessedMarkets,
  hasMatchersFor,
  matchersFor,
  ruleById,
  rulesFor,
  skipReasonsFor,
  uncoveredRuleIds,
  type ComplianceMatcher,
  type FormalMatcherDef,
  type LegalRule,
} from "./rules.js";
import {
  COMPLIANCE_DIMENSION,
  COMPLIANCE_DIMENSION_NAME,
  type ComplianceFinding,
  type ComplianceInput,
  type ComplianceRuleDisposition,
  type ComplianceSkipReason,
  type DecisionLevel,
} from "./types.js";

/** 一张报告里合规条目上限：再多就不是「提示」，而是把报告压垮。 */
export const MAX_COMPLIANCE_FINDINGS = 6;
/** 引用片段上限，超长行按词边界截断，截断后仍是原文子串。 */
const MAX_QUOTE = 180;

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
const LEVEL_RANK: Record<DecisionLevel, number> = {
  rule_level: 0,
  substantiation: 1,
  human_review: 2,
};

interface Line {
  /** 在原始文本中的起止下标，保证 quote 是原文子串。 */
  start: number;
  end: number;
  text: string;
}

export interface ComplianceAnalysis {
  /** 本次分析请求的市场（规则库与 finding 都只属于该市场）。 */
  market: string;
  marketName: string;
  findings: ComplianceFinding[];
  counts: {
    total: number;
    high: number;
    medium: number;
    low: number;
    rule_level: number;
    substantiation: number;
    human_review: number;
    reviewRequired: number;
  };
  /** 每条规则的处置：进报告 / 合并 / 未命中 / 不判定。测试与调试用。 */
  dispositions: ComplianceRuleDisposition[];
  /** 报告「未覆盖范围」里的一条能力边界说明。 */
  boundaryNote: { item: string; reason: string };
  skipReasons: ComplianceSkipReason[];
  assessedRuleCount: number;
  libraryRuleCount: number;
  libraryVersion: string;
}

function toLines(text: string): Line[] {
  const lines: Line[] = [];
  let offset = 0;
  for (const raw of text.split("\n")) {
    const trimmed = raw.trim();
    if (trimmed) {
      const lead = raw.length - raw.trimStart().length;
      lines.push({ start: offset + lead, end: offset + lead + trimmed.length, text: trimmed });
    }
    offset += raw.length + 1;
  }
  return lines;
}

/** 原文引用截断：优先在句末收尾，并保证片段里包含命中词。 */
function quoteOf(line: string, focus?: string): string {
  const text = line.trim();
  if (text.length <= MAX_QUOTE) return text;
  const needle = focus ?? "";
  const at = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  let window = text.slice(0, MAX_QUOTE);
  if (at >= 0 && at + needle.length + 40 > MAX_QUOTE) {
    const sentenceStart = text.lastIndexOf(". ", at);
    const start = sentenceStart >= 0 && at - sentenceStart < 140 ? sentenceStart + 2 : Math.max(0, at - 60);
    window = text.slice(start, Math.min(text.length, at + needle.length + 90));
  }
  const lastSpace = window.lastIndexOf(" ");
  if (text.length > MAX_QUOTE && lastSpace > 60) window = window.slice(0, lastSpace);
  return window.replace(/[\s,;:–-]+$/g, "").trimEnd();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 模式编译：加词边界，短词不会被 `6.5L` 里的 `5l`、`Livechat` 里的 `chat` 命中。
 * 首尾不是字母数字时（`% off`、`100%`）不加边界，否则「20% off」会被边界挡掉。
 */
function compilePattern(pattern: string): RegExp {
  const first = pattern[0] ?? "";
  const last = pattern[pattern.length - 1] ?? "";
  const lead = /[A-Za-z0-9]/.test(first) ? "(?<![\\w.])" : "(?<!\\w)";
  const plural =
    /[A-Za-z]$/.test(pattern) && pattern.length >= 5
      ? "(?:s|es|ing)?"
      : /[A-Za-z]$/.test(pattern) && pattern.length >= 4
        ? "(?:s|es)?"
        : "";
  const trail = /[A-Za-z0-9]/.test(last) ? `${plural}(?![\\w])` : "(?!\\w)";
  const body = escapeRegExp(pattern).replace(/\\ /g, "\\s+");
  return new RegExp(`${lead}${body}${trail}`, "i");
}

const PATTERN_CACHE = new Map<string, RegExp>();

function patternRegExp(pattern: string): RegExp {
  const cached = PATTERN_CACHE.get(pattern);
  if (cached) return cached;
  const compiled = compilePattern(pattern);
  PATTERN_CACHE.set(pattern, compiled);
  return compiled;
}

/** 泛标题/导航：即使拿到了整页句子行，这几类行也不当商品声明。 */
const NON_CLAIM_LINE =
  /^(?:top selling|bestsellers?|new arrivals?|shop by|categories|customer service|track order|about us|contact us|faq|blog)\b/i;

const BOILERPLATE_LINE =
  /^(?:copyright|©|all rights reserved|terms?\s+(?:and|&)\s+conditions|terms of (?:use|service)|privacy policy|cookie)/i;

function isClaimLine(text: string, scope: "panel" | "page"): boolean {
  if (NON_CLAIM_LINE.test(text) || BOILERPLATE_LINE.test(text)) return false;
  if (scope === "panel") return text.length >= 4;
  return isSubstantiveLine(text);
}

/** 价格/折扣线索：只用来把紧贴价格上方的折扣徽标纳入取证范围。 */
const PRICE_CUE = /\d\s*%|\brm\b|\bsave\b|\bprice\b|\boff\b/i;

/** 详情区标题：商品页的 Description / Specifications 一带才是规格与材质声明。 */
const DETAIL_HEADING = /^(?:description|specifications?|product details|features|product assurance|what'?s in the box)$/i;
/** 详情区的终点：推荐位与「你可能还喜欢」不是被诊商品。 */
const DETAIL_STOP =
  /^(?:recommended products?|you may also like|related products?|recently viewed|frequently bought|compare products?|our recommends|top selling)/i;

/**
 * 商品取证区域 = 价格主面板 ∪ 详情区。
 *
 * 真实商品页把材质、防护、认证写在 Description / Specifications / Product Assurance 里，
 * 而价格主面板在 70 行内就到不了（中间隔着选项卡、评价、推荐位）。这里从最后一个
 * 详情标题往下取，止于推荐位；只收句子行与规格条目，导航与页脚链接标签仍然不收。
 */
function productRegion(
  lines: Line[],
  panel: ReturnType<typeof findProductPanel>,
): { lines: Line[]; note: string } {
  const seen = new Set<number>();
  const picked: Line[] = [];
  const push = (line: Line): void => {
    if (seen.has(line.start)) return;
    seen.add(line.start);
    picked.push(line);
  };
  // 折扣徽标（-33%）通常紧贴价格上方，落在价格锚点向上截断的那几行里。
  const panelStart = panel.lines[0]?.start;
  if (panelStart !== undefined) {
    const startIndex = lines.findIndex((line) => line.start === panelStart);
    for (let index = Math.max(0, startIndex - 12); index < startIndex; index += 1) {
      const line = lines[index];
      if (line && PRICE_CUE.test(line.text)) push(line);
    }
  }
  for (const line of panel.lines) push(line);

  // 取**第一个**详情标题：选项卡标签（Description / Specifications / Reviews）之后
  // 才是真正的正文，取最后一个会落到 Product Assurance 之后，把 Features 漏掉。
  let headingIndex = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && DETAIL_HEADING.test(line.text)) {
      headingIndex = index;
      break;
    }
  }
  if (headingIndex >= 0) {
    for (let index = headingIndex; index < lines.length && index - headingIndex <= 160; index += 1) {
      const line = lines[index];
      if (!line) continue;
      if (index > headingIndex + 4 && DETAIL_STOP.test(line.text)) break;
      if (index === headingIndex) continue;
      if (!isSubstantiveLine(line.text) && !/^[-•*]\s*\S/.test(line.text)) continue;
      push(line);
    }
  }
  picked.sort((a, b) => a.start - b.start);
  const note = panel.lines.length
    ? `${panel.scopeNote} + 详情区（Description / Specifications，止于推荐位）`
    : "商品详情区（Description / Specifications，止于推荐位）";
  return { lines: picked, note };
}

interface Candidate {
  rule: LegalRule;
  def: ComplianceMatcher;
  line: Line;
  pattern: string;
  scopeNote: string;
}

function firstSentence(value: string): string {
  const text = value.trim();
  const cut = text.search(/[。；]/);
  const sentence = cut > 20 ? text.slice(0, cut + 1) : text;
  return sentence.length > 160 ? `${sentence.slice(0, 158)}…` : sentence;
}

function levelHint(level: DecisionLevel): string {
  if (level === "rule_level") {
    return "这条规则直接规范这类表述，页面上能直接定位到行为要素；结论仍需按法条与事实核对。";
  }
  if (level === "substantiation") {
    return "这类表述需要能出示对应证明，报告只记「需要证明」，不判断真假。";
  }
  return "是否误导取决于整体语境，这一步只能标记「需人工判断」，不做结论。";
}

function fixFor(rule: LegalRule): string {
  if (rule.decision_level === "rule_level") {
    return `按 ${rule.article} 核对后改写：能出示依据的，把依据（证书/批文编号、适用范围、有效期）写在页面上；出示不了的，删去该表述。`;
  }
  if (rule.decision_level === "substantiation") {
    return `准备并留存：${rule.evidence_needed} 拿不出证据时，把表述改成可核对的具体参数（型号、材质、容量），不要用形容词。`;
  }
  return "先由本地同事或律师按整体语境判断是否构成误导，再决定保留还是改写；保留时补限定条件与适用场景。";
}

function evidenceFor(
  rule: LegalRule,
  scopeNote: string,
  pattern: string,
  merged: Array<{ rule: LegalRule; pattern: string }> = [],
): string {
  const parts = [
    `规则 ${rule.id} · ${rule.law_short} ${rule.article}`,
    `官方来源 ${rule.official_url}`,
    `取证：${scopeNote}`,
    `命中：${pattern}`,
  ];
  if (merged.length) {
    const others = merged.map((item) => `${item.rule.id} ${item.rule.law_short} ${item.rule.article}（${item.pattern}）`);
    parts.push(`同一句还触发：${others.join("、")}`);
  }
  return parts.join(" · ");
}

function buildFinding(
  rule: LegalRule,
  options: {
    quote: string;
    why: string;
    fix?: string;
    scopeNote: string;
    pattern: string;
    merged?: Array<{ rule: LegalRule; pattern: string }>;
    /** 缺席类检查把置信度降到 medium：看到的是文本可见范围，不是事实。 */
    confidence?: ComplianceFinding["confidence"];
    reviewRequired?: boolean;
    /** 该市场的 matcher 表：严重程度只在表里查，不跨市场借用。 */
    matchers: ComplianceMatcher[];
  },
): ComplianceFinding {
  // high 级默认标「需专业审核」；human_review 与规则库要求复核的条目同样要标。
  const reviewRequired =
    options.reviewRequired ??
    (rule.review_required || rule.decision_level === "human_review" || severityOf(rule, options.matchers) === "high");
  return {
    ruleId: rule.id,
    severity: severityOf(rule, options.matchers),
    quote: quoteOf(options.quote, options.pattern),
    why: options.why,
    fix: options.fix ?? fixFor(rule),
    dimension: COMPLIANCE_DIMENSION,
    lawName: rule.law_name,
    lawShort: rule.law_short,
    article: rule.article,
    officialUrl: rule.official_url,
    decisionLevel: rule.decision_level,
    reviewRequired,
    lastVerified: rule.last_verified,
    confidence: options.confidence ?? rule.confidence,
    evidence: evidenceFor(rule, options.scopeNote, options.pattern, options.merged),
  };
}

function severityOf(rule: LegalRule, matchers: ComplianceMatcher[]): Severity {
  const matcher = matchers.find((item) => item.ruleId === rule.id);
  if (matcher) return matcher.severity;
  if (rule.decision_level === "rule_level") return "medium";
  if (rule.decision_level === "human_review") return "low";
  return "medium";
}

/* ------------------------------------------------------------------ 声明匹配 */

function collectCandidates(input: {
  market: string;
  matchers: ComplianceMatcher[];
  lines: Line[];
  panel: ReturnType<typeof findProductPanel>;
}): { candidates: Candidate[]; misses: ComplianceRuleDisposition[] } {
  const { market, matchers, lines, panel } = input;
  const candidates: Candidate[] = [];
  const misses: ComplianceRuleDisposition[] = [];
  const region = productRegion(lines, panel);

  for (const matcher of matchers) {
    if (matcher.kind !== "claim") continue;
    const rule = ruleById(market, matcher.ruleId);
    const scopedLines = matcher.scope === "panel" ? region.lines : lines;
    const scopeNote =
      matcher.scope === "panel" ? region.note : "整页可见文本（只取句子行，排除导航/页脚链接标签）";
    let matched: Candidate | undefined;

    for (const line of scopedLines) {
      if (!isClaimLine(line.text, matcher.scope)) continue;
      if (matcher.excludeLine?.test(line.text)) continue;
      if (matcher.lineGate && !matcher.lineGate.test(line.text)) continue;

      for (const pattern of matcher.patterns) {
        if (!patternRegExp(pattern).test(line.text)) continue;
        const weak = matcher.weak?.[pattern];
        if (weak && !weak.test(line.text)) continue;
        matched = { rule, def: matcher, line, pattern, scopeNote };
        break;
      }
      if (!matched) {
        for (const extra of matcher.extra ?? []) {
          const re = new RegExp(extra.source, "i");
          if (!re.test(line.text)) continue;
          matched = { rule, def: matcher, line, pattern: extra.label, scopeNote };
          break;
        }
      }
      if (matched) break;
    }

    if (matched) {
      candidates.push(matched);
    } else {
      misses.push({
        ruleId: rule.id,
        decisionLevel: rule.decision_level,
        outcome: "no_match",
        reason: `页面${matcher.scope === "panel" ? "商品主面板" : "正文"}未出现该条规则的表述`,
      });
    }
  }
  return { candidates, misses };
}

/* ------------------------------------------------------------ 缺席/结构检查 */

const LIMITED_TERMS =
  /\b(?:max(?:imum)?|only|up\s+to|limited\s+to)\s+\d+|\d+\s*(?:units?|pieces?|pcs)\b|\b(?:until|till|by|before|ends?)\s+(?:\d{1,2}\s+\w+|\d{1,2}[/-]\d{1,2})|\b\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+20\d\d|\b\d{1,2}[/-]\d{1,2}[/-]20\d\d/i;

/** 马来语标记词：只用来判断「页面有没有国语版本」，不做语言质量评价。 */
const MALAY_MARKERS =
  /\b(?:dan|atau|untuk|dengan|harga|percuma|penghantaran|pembayaran|waranti|jaminan|produk|barangan|hubungi|alamat|syarat|terhad|boleh|tidak|anda|kami|kepada|daripada|adalah|telah|akan|juga|serta|bagi|oleh|sebarang|maklumat|perkhidmatan|pengguna|jualan|pembelian|pemasangan|saiz|berat|kuasa|voltan)\b/gi;

const DATA_COLLECTION =
  /\b(?:newsletter|subscribe|subscription|sign\s*up|register|registration|contact\s+form|checkout|create\s+account|my\s+account|log\s*in)\b/i;

const PRIVACY_NOTICE = /\bprivacy\s+(?:policy|notice|statement)\b|\bdasar\s+privasi\b|\bnotis\s+privasi\b/i;

const HALAL_CERTIFICATE =
  /\bjakim\b|\bhalal\s*(?:cert(?:ificate|ification)?|logo)\b[^.\n]{0,40}\b(?:no|number|ref)\b|\b(?:halal|cert(?:ificate)?)\s*(?:no\.?|number|#)\s*[:#]?\s*[\w-]{3,}/i;

/**
 * 页脚常见的数据保护/法务入口标签。别国的 `notice_disclosure_absent` 用它避免
 * 把「有数据保护页但措辞不同」误判成「没有告知」；MY 的 `privacy_notice_absent`
 * 口径不变，不读这条。
 */
const GENERIC_LEGAL_LINK =
  /\bdata\s+protection\b|\bpdpl\b|\bpdpa\b|\bprivacy\s+center\b|\blegal\s+notice\b|\bterms\s+of\s+(?:use|service)\b/i;

/** 一段文本里某个语言标记词命中的次数。 */
function markerCount(lines: Line[], markers: RegExp): number {
  let count = 0;
  for (const line of lines) {
    // 带 g 的正则有 lastIndex 状态，逐行重置，避免跨行漏计。
    markers.lastIndex = 0;
    const hits = line.text.match(markers);
    if (hits) count += hits.length;
  }
  return count;
}

/**
 * 四个通用 check 的公共实现。市场差异只通过 matcher 上的参数（语言标记、入口/告知正则、
 * 凭据正则）表达，实现本身与市场无关：MY 的 `malay_disclosure_absent` /
 * `halal_claim_without_certificate` 与别国的 `language_disclosure_absent` /
 * `claim_without_evidence` 走同一段代码。
 */
function formalCandidates(
  matcher: FormalMatcherDef,
  ctx: { market: string; lines: Line[]; panel: ReturnType<typeof findProductPanel> },
): Candidate | undefined {
  const { market, lines, panel } = ctx;
  // matcher 显式声明整页取证（非 MY 的检查）：证据行必须是句子行，
  // 免得把页脚导航标签（`Affiliates`、`Warranty`）当成声称。
  const strict = matcher.strictPage === true;
  const usable = (line: Line): boolean => !strict || isSubstantiveLine(line.text);
  // 通用 check 看整页：保修承诺、订阅入口、优惠条件都可能写在主面板之外（hero / 页脚），
  // 只扫商品面板会漏。MY 的既有 check 仍以商品面板优先（RAY-698 口径）。
  const scoped = strict ? lines : panel.lines.length ? panel.lines : lines;
  const scopeNote = strict
    ? "整页可见文本（只取句子行，排除导航/页脚链接标签）"
    : panel.lines.length
      ? panel.scopeNote
      : "整页可见文本";
  const rule = ruleById(market, matcher.ruleId);

  if (matcher.check === "limited_without_terms") {
    const terms = matcher.terms ?? LIMITED_TERMS;
    for (let index = 0; index < scoped.length; index += 1) {
      const line = scoped[index];
      if (!line) continue;
      if (!usable(line)) continue;
      const pattern = matcher.patterns.find((item) => patternRegExp(item).test(line.text));
      if (!pattern) continue;
      const neighbourhood = [scoped[index - 1], line, scoped[index + 1]]
        .filter((item): item is Line => Boolean(item))
        .map((item) => item.text)
        .join(" ");
      if (terms.test(neighbourhood)) continue;
      return { rule, def: matcher, line, pattern, scopeNote };
    }
    return undefined;
  }

  if (matcher.check === "malay_disclosure_absent" || matcher.check === "language_disclosure_absent") {
    const language = matcher.language ?? { markers: MALAY_MARKERS, label: "马来语" };
    const substantive = lines.filter((line) => isSubstantiveLine(line.text));
    if (substantive.length < 6) return undefined;
    if (markerCount(lines, language.markers) >= (language.minMarkers ?? 3)) return undefined;
    const anchor = panel.lines.find((line) => isSubstantiveLine(line.text)) ?? substantive[0];
    if (!anchor) return undefined;
    return { rule, def: matcher, line: anchor, pattern: `整页未见${language.label}版本`, scopeNote };
  }

  if (matcher.check === "privacy_notice_absent" || matcher.check === "notice_disclosure_absent") {
    const notice = matcher.notice ?? PRIVACY_NOTICE;
    const hasNotice = (line: Line): boolean => notice.test(line.text);
    if (!matcher.lineScoped && lines.some(hasNotice)) return undefined;
    // 有平台自己的 PDPO/PDPA 页脚链接时，不因为找不到具体措辞就判缺席。
    if (
      !matcher.lineScoped &&
      matcher.check === "notice_disclosure_absent" &&
      lines.some((line) => GENERIC_LEGAL_LINK.test(line.text))
    ) {
      return undefined;
    }
    const trigger = lines.find(
      (line) => (matcher.trigger ?? DATA_COLLECTION).test(line.text) && isSubstantiveLine(line.text) && !hasNotice(line),
    );
    if (!trigger) return undefined;
    // 命中说明别写死「收集入口」：同一个 check 也用于标价（GST）、单位制（英制/公制）等场景。
    const missing = matcher.missingEvidence ?? "隐私告知";
    const pattern = matcher.lineScoped ? `同一处未见${missing}` : `整页未见${missing}`;
    return {
      rule,
      def: matcher,
      line: trigger,
      pattern,
      scopeNote: matcher.lineScoped ? "同一行文本（要求同一处并列）" : "整页可见文本（未见该项告知）",
    };
  }

  if (matcher.check === "halal_claim_without_certificate" || matcher.check === "claim_without_evidence") {
    const claim = scoped.find(
      (line) => usable(line) && matcher.patterns.some((item) => patternRegExp(item).test(line.text)),
    );
    if (!claim) return undefined;
    const evidence = matcher.evidence ?? HALAL_CERTIFICATE;
    if (lines.some((line) => evidence.test(line.text))) return undefined;
    const pattern = matcher.patterns.find((item) => patternRegExp(item).test(claim.text)) ?? matcher.patterns[0] ?? "";
    return { rule, def: matcher, line: claim, pattern, scopeNote };
  }

  return undefined;
}

/**
 * 缺席/凭据类检查没触发时的处置说明。按 check 类型给具体原因，
 * 不写「页面没问题」——只说明这条检查为什么没命中。
 */
function formalMissReason(matcher: FormalMatcherDef): string {
  if (matcher.check === "malay_disclosure_absent" || matcher.check === "language_disclosure_absent") {
    const label = matcher.language?.label ?? "本国语言";
    return `页面已出现${label}文本，或正文过短无法判断`;
  }
  if (matcher.check === "privacy_notice_absent" || matcher.check === "notice_disclosure_absent") {
    return `页面已有${matcher.missingEvidence ?? "该项告知"}，或没有可观察的触发入口`;
  }
  if (matcher.check === "halal_claim_without_certificate" || matcher.check === "claim_without_evidence") {
    return `页面未出现该条规则规范的表述，或已能看到${matcher.missingEvidence ?? "对应凭据"}`;
  }
  return "页面未触发该条检查的触发条件";
}

/**
 * 非 MY 市场的缺席/凭据类 finding 文案：用该市场的规则库原文 + matcher 参数拼，
 * 不借用任何 MY 法条名或监管机构。措辞固定为「页面未展示 / 需核实」，不下结论。
 */
function formalFindingForMarket(candidate: Candidate, matchers: ComplianceMatcher[]): ComplianceFinding {
  const { rule, line, pattern, scopeNote, def } = candidate;
  if (def.kind !== "formal") return claimFinding(candidate, matchers);

  const legal = `${rule.law_short} ${rule.article}`;
  const requirement = firstSentence(rule.requirement);
  const missing = def.missingEvidence ?? "相应凭据";
  const common = { quote: line.text, pattern, scopeNote, matchers, reviewRequired: true, confidence: "medium" as const };

  if (def.check === "limited_without_terms") {
    return buildFinding(rule, {
      ...common,
      why: `页面用「${pattern}」作优惠表述，但同一屏没有写清优惠期间、限量数量或取得条件。${legal}：${requirement}`,
      fix: "在这句旁边写明优惠期间、限量数量或取得条件（例如 while stocks last / ends 31 Dec 2026 / min. spend S$80）；写不出条件就不要用限量或免费措辞。",
    });
  }

  if (def.check === "language_disclosure_absent" || def.check === "malay_disclosure_absent") {
    const label = def.language?.label ?? "马来语";
    return buildFinding(rule, {
      ...common,
      scopeNote: `整页可见文本（${label}标记命中 0）`,
      why: `整页可见文本里没有发现${label}版本。${legal}：${requirement} 这里只看页面文本，页面未展示不等于商家没有该语言版本，需向商家核实。`,
      fix: `把该条要求的消费者信息加上${label}版本并与现有语言并列；只把品牌名译成${label}不算。`,
    });
  }

  if (def.check === "notice_disclosure_absent" || def.check === "privacy_notice_absent") {
    return buildFinding(rule, {
      ...common,
      scopeNote: def.lineScoped ? "同一行文本（要求同一处并列）" : "整页可见文本（未见该项告知）",
      why: `页面出现「${line.text}」这类表述，但整页看不到${missing}。${legal}：${requirement} 页面未展示不等于商家没有做这项披露，需向商家核实。`,
      fix: `在这句表述旁或同一流程里给出${missing}，并链到可读的告知页面；内容要能对应到 ${rule.article} 要求的具体项目。`,
    });
  }

  if (def.check === "claim_without_evidence" || def.check === "halal_claim_without_certificate") {
    return buildFinding(rule, {
      ...common,
      why: `页面出现「${pattern}」这类表述，但整页看不到${missing}。${legal}：${requirement} 页面未展示不等于该凭据不存在，需向商家核实，不能据此推断违规。`,
      fix: `把${missing}写在页面可读位置（编号/链接/条款全文）；提供不出时，删去或改写这句表述。`,
    });
  }

  return buildFinding(rule, {
    ...common,
    why: `${legal}：${requirement}`,
  });
}

/**
 * 一条 finding 的组装入口：claim 类走 `claimFinding`，formal 类按市场分流。
 * MY 保留 RAY-698 验收过的专用文案；其他市场走按规则库原文生成的通用文案。
 */
function findingFor(candidate: Candidate, matchers: ComplianceMatcher[], market: string): ComplianceFinding {
  if (candidate.def.kind === "formal") return formalFinding(candidate, matchers, market);
  return claimFinding(candidate, matchers);
}

function formalFinding(candidate: Candidate, matchers: ComplianceMatcher[], market: string): ComplianceFinding {
  const { rule, line, pattern, scopeNote } = candidate;

  if (market !== "MY") return formalFindingForMarket(candidate, matchers);

  if (rule.id === "MY-ADV-09") {
    return buildFinding(rule, {
      quote: line.text,
      pattern,
      scopeNote,
      matchers,
      why: `页面用「${pattern}」表示限量，但同一屏没有写清最大数量或活动期间。${rule.law_short} ${rule.article} 要求「限量」只在数量被限定为预先确定的最大数量、或限定期间内的实际订单量时才可使用，并须显著标明数量与期间。`,
      fix: "在限量表述旁写明最大数量（例如 only 200 units）与截止日期；定不出数量或期间，就不要用限量措辞。",
      reviewRequired: true,
      confidence: "medium",
    });
  }

  if (rule.id === "MY-ECOM-06") {
    return buildFinding(rule, {
      quote: line.text,
      pattern,
      scopeNote: "整页可见文本（马来语标记命中 0）",
      matchers,
      why: "整页可见文本里没有发现国语（马来语）版本，商品信息以英文呈现。CP (ETT) Regs 2024 reg.4(1) 要求向消费者披露的附表信息以国语提供，其他语言可以并列。这里只看页面文本，页面未展示不等于商家没有其他语言版本；reg.4 是否覆盖品牌自营独立站（而非只覆盖平台 listing）在规则库里仍待核，需按商家主体类型确认。",
      fix: "把附表 1-10 项（卖家名称与联系方式、完整价格与费用、条款、预计送达、证书等）加上马来语版本并与英文并列；只把品牌名译成马来语不算。",
      reviewRequired: true,
      confidence: "medium",
    });
  }

  if (rule.id === "MY-PRIV-01") {
    return buildFinding(rule, {
      quote: line.text,
      pattern,
      scopeNote: "整页可见文本（隐私告知 0 命中）",
      matchers,
      why: `页面有「${pattern}」这类会收集个人数据的入口，但整页未见隐私告知。PDPA 2010 s.7(1) 要求在收集个人数据时以书面通知说明：处理的数据、收集与后续处理目的、数据来源、查阅与更正权及联系方式、披露给哪些第三方、限制处理的选择与方式、提供数据是强制还是自愿、不提供的后果。页面未展示不等于没有隐私政策，需向商家核实。`,
      fix: "在收集入口旁链到马来语 + 英语的隐私告知，逐项写清 s.7(1) 的八项内容，并给出可联系的数据保护联系人。",
      reviewRequired: true,
      confidence: "medium",
    });
  }

  if (rule.id === "MY-HALAL-01") {
    return buildFinding(rule, {
      quote: line.text,
      pattern,
      scopeNote,
      matchers,
      why: `页面把商品描述为 halal（「${pattern}」），但没有给出认证机构或证书编号。Halal Order 2011 para.4(1) 要求已获 JAKIM 或州伊斯兰理事会认证才能作此描述并按附表一标注标志；页面未展示证书信息，需向商家核实，不能据此推断未认证。`,
      fix: "提供 JAKIM/州伊斯兰理事会的 halal 证书编号与有效期，并在页面标注对应标志；未取得证书前不要使用 halal 描述或标志。",
      reviewRequired: true,
      confidence: "medium",
    });
  }

  return buildFinding(rule, {
    quote: line.text,
    pattern,
    scopeNote,
    matchers,
    why: `${rule.law_short} ${rule.article}：${firstSentence(rule.requirement)}`,
  });
}

function claimFinding(candidate: Candidate, matchers: ComplianceMatcher[]): ComplianceFinding {
  const { rule, pattern, line, scopeNote, def } = candidate;
  const note = def.kind === "claim" && def.note ? ` ${def.note}` : "";
  return buildFinding(rule, {
    quote: line.text,
    pattern,
    scopeNote,
    matchers,
    why: `${rule.law_short} ${rule.article}：${firstSentence(rule.requirement)} 页面出现「${pattern}」表述，${levelHint(rule.decision_level)}${note}`,
  });
}
/* ------------------------------------------------------------------- 主入口 */

export interface ComplianceOptions {
  /** 目标市场代码；缺省 MY。未知市场直接失败，不回退。 */
  market?: string;
}

/**
 * 没有 matcher 的市场的显式降级：规则库已加载并核对过市场，但还没为该市场挂载判定器。
 * 不套用 MY 的 matcher，不生成任何 finding，也不把「没查」写成「没问题」。
 */
function notAssessedAnalysis(market: MarketInfo, library: LegalLibrary): ComplianceAnalysis {
  // 文案保持 RAY-754 的逐字口径：这条只服务「没挂 matcher」的市场，
  // 「尚未建立该市场的可判定子集」对它们仍然是事实描述，不改成别的说法。
  const reason = `${market.name}规则库 ${library.rules.length} 条（${library.version}）已加载，但 agent 侧尚未建立该市场的可判定子集；本版不输出该市场的合规 finding，也不据此判断合规。`;
  return {
    market: market.code,
    marketName: market.name,
    findings: [],
    counts: {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      rule_level: 0,
      substantiation: 0,
      human_review: 0,
      reviewRequired: 0,
    },
    dispositions: library.rules.map((rule) => ({
      ruleId: rule.id,
      decisionLevel: rule.decision_level,
      outcome: "not_assessable" as const,
      reason,
    })),
    boundaryNote: {
      item: `合规与风险（${market.name}）的判定范围`,
      reason,
    },
    skipReasons: [],
    assessedRuleCount: 0,
    libraryRuleCount: library.rules.length,
    libraryVersion: library.version,
  };
}

export function analyzeCompliance(input: ComplianceInput, options: ComplianceOptions = {}): ComplianceAnalysis {
  const market = resolveMarket(options.market);
  const library = loadLegalLibrary(market);
  // RAY-773：早退条件只认「这个市场有没有挂载 matcher」，不按市场代码判。
  // 没挂载的市场整库降级为 not_assessable，绝不借用 MY 的法条。
  if (!hasMatchersFor(market.code)) return notAssessedAnalysis(market, library);

  const matchers = matchersFor(market.code);
  const skipReasons = skipReasonsFor(market.code);
  const lines = toLines(input.text);
  const panel = findProductPanel(input.text, lines);

  const claimMatchers = matchers.filter((matcher) => matcher.kind === "claim");
  const formalMatchers = matchers.filter((matcher): matcher is FormalMatcherDef => matcher.kind === "formal");

  const { candidates, misses } = collectCandidates({ market: market.code, matchers: claimMatchers, lines, panel });
  const dispositions: ComplianceRuleDisposition[] = [...misses];

  for (const matcher of formalMatchers) {
    const candidate = formalCandidates(matcher, { market: market.code, lines, panel });
    const rule = ruleById(market.code, matcher.ruleId);
    if (!candidate) {
      dispositions.push({
        ruleId: rule.id,
        decisionLevel: rule.decision_level,
        outcome: "no_match",
        reason: formalMissReason(matcher),
      });
      continue;
    }
    candidates.push(candidate);
  }

  // 同一句触发多条规则 → 合并成一张卡，主条目按「严重程度 → 判定层级 → 规则编号」取，
  // 其余条文写进 evidence，法条不丢。
  const groups = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    // 同一句 + 同一判定层级才合并：把「需事实核实」和「需人工判断」并成一张卡
    // 会让其中一档从报告里消失，所以跨层级保留两条，各自在 evidence 里互相引用。
    const key = `${candidate.line.start}:${candidate.rule.decision_level}`;
    const group = groups.get(key);
    if (group) group.push(candidate);
    else groups.set(key, [candidate]);
  }

  const ordered = [...groups.values()]
    .map((group) =>
      [...group].sort((a, b) => {
        const severity = SEVERITY_RANK[severityOf(a.rule, matchers)] - SEVERITY_RANK[severityOf(b.rule, matchers)];
        if (severity !== 0) return severity;
        const level = LEVEL_RANK[a.rule.decision_level] - LEVEL_RANK[b.rule.decision_level];
        if (level !== 0) return level;
        return a.rule.id.localeCompare(b.rule.id);
      }),
    )
    .filter((group) => group.length > 0);

  const findings: ComplianceFinding[] = [];
  for (const group of ordered) {
    const [primary, ...rest] = group;
    if (!primary) continue;
    const merged = rest.map((item) => ({ rule: item.rule, pattern: item.pattern }));
    const base = findingFor(primary, matchers, market.code);
    const finding: ComplianceFinding = merged.length
      ? { ...base, evidence: evidenceFor(primary.rule, primary.scopeNote, primary.pattern, merged) }
      : base;
    findings.push(finding);
    dispositions.push({
      ruleId: primary.rule.id,
      decisionLevel: primary.rule.decision_level,
      outcome: "finding",
      pattern: primary.pattern,
    });
    for (const item of rest) {
      dispositions.push({
        ruleId: item.rule.id,
        decisionLevel: item.rule.decision_level,
        outcome: "merged",
        pattern: item.pattern,
        reason: `与 ${primary.rule.id} 指向同一句，合并展示`,
      });
    }
  }

  findings.sort((a, b) => {
    const severity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (severity !== 0) return severity;
    const level = LEVEL_RANK[a.decisionLevel] - LEVEL_RANK[b.decisionLevel];
    if (level !== 0) return level;
    return a.ruleId.localeCompare(b.ruleId);
  });

  const capped = findings.slice(0, MAX_COMPLIANCE_FINDINGS);
  for (const dropped of findings.slice(MAX_COMPLIANCE_FINDINGS)) {
    dispositions.push({
      ruleId: dropped.ruleId,
      decisionLevel: dropped.decisionLevel,
      outcome: "not_assessable",
      reason: `超出单页 ${MAX_COMPLIANCE_FINDINGS} 条上限，未进入报告正文`,
    });
  }

  // 跳过清单是「为什么这条没判」的说明：只对本版规则库里真实存在的规则产出处置。
  // 清单与规则库版本漂移由测试里的 `validateSkipReasons()` 兜底，运行时不因此报错。
  for (const skip of skipReasons) {
    for (const id of skip.ruleIds) {
      const rule = library.byId.get(id);
      if (!rule) continue;
      dispositions.push({
        ruleId: id,
        decisionLevel: rule.decision_level,
        outcome: "not_assessable",
        reason: skip.reason,
      });
    }
  }

  const uncovered = uncoveredRuleIds(market.code);
  if (uncovered.length) {
    throw new Error(`${market.code} 合规规则库有规则既没判定也没记跳过原因：${uncovered.join(", ")}`);
  }

  const counts = {
    total: capped.length,
    high: capped.filter((item) => item.severity === "high").length,
    medium: capped.filter((item) => item.severity === "medium").length,
    low: capped.filter((item) => item.severity === "low").length,
    rule_level: capped.filter((item) => item.decisionLevel === "rule_level").length,
    substantiation: capped.filter((item) => item.decisionLevel === "substantiation").length,
    human_review: capped.filter((item) => item.decisionLevel === "human_review").length,
    reviewRequired: capped.filter((item) => item.reviewRequired).length,
  };

  const libraryRuleCount = library.rules.length;
  const assessedRuleCount = matchers.length;

  return {
    market: market.code,
    marketName: market.name,
    findings: capped,
    counts,
    dispositions,
    boundaryNote: {
      item: `合规与风险（${COMPLIANCE_DIMENSION_NAME}）的判定范围`,
      reason:
        `${market.name}规则库 ${libraryRuleCount} 条中，本版为该国挂载的可判定子集 ${assessedRuleCount} 条已跑` +
        `（页面命中：规则直判 ${counts.rule_level}、需事实核实 ${counts.substantiation}、需人工判断 ${counts.human_review}）。` +
        `其余 ${libraryRuleCount - assessedRuleCount} 条属证书核验、主体或平台义务，本版不判定，也不据此判断合规。`,
    },
    skipReasons,
    assessedRuleCount,
    libraryRuleCount,
    libraryVersion: library.version,
  };
}

/** 报告「诊断维度」里的一行；没有命中时写成无法判断，而不是「没问题」。 */
export function complianceDimension(analysis: ComplianceAnalysis): {
  name: string;
  status: "risk" | "ok" | "not_assessable";
  note: string;
} {
  const { counts } = analysis;
  if (!analysis.assessedRuleCount) {
    return {
      name: COMPLIANCE_DIMENSION_NAME,
      status: "not_assessable",
      note: `${analysis.marketName}规则库 ${analysis.libraryRuleCount} 条（${analysis.libraryVersion}）已加载，但本版判定器尚未覆盖该市场；本次不做合规筛查，也不据此判断合规。`,
    };
  }
  if (!counts.total) {
    return {
      name: COMPLIANCE_DIMENSION_NAME,
      status: "not_assessable",
      note: `本版规则（${analysis.assessedRuleCount} 条）未在本页命中可定位的表述；未命中不等于合规，其余条目见「未覆盖范围」。`,
    };
  }
  const breakdown = [
    counts.rule_level ? `规则直判 ${counts.rule_level}` : "",
    counts.substantiation ? `需事实核实 ${counts.substantiation}` : "",
    counts.human_review ? `需人工判断 ${counts.human_review}` : "",
  ]
    .filter(Boolean)
    .join("、");
  return {
    name: COMPLIANCE_DIMENSION_NAME,
    status: "risk",
    note: `规则命中 ${counts.total} 条（${breakdown}），其中 ${counts.reviewRequired} 条需专业审核；基于公开法规的自动筛查，不构成法律意见，不打分。`,
  };
}

/** 便于 CLI 打印的一行摘要。 */
export function complianceSummary(analysis: ComplianceAnalysis): string {
  const { counts } = analysis;
  if (!analysis.assessedRuleCount) {
    // 已挂载 matcher 的市场会随版本增加，这里不要写死「只覆盖马来西亚」。
    const covered = assessedMarkets().join(" / ");
    return `合规筛查未覆盖${analysis.marketName}：规则库 ${analysis.libraryRuleCount} 条已加载，本版判定器只为 ${covered} 挂载了可判定子集`;
  }
  return `合规规则命中 ${counts.total} 条：规则直判 ${counts.rule_level}、需事实核实 ${counts.substantiation}、需人工判断 ${counts.human_review}；需专业审核 ${counts.reviewRequired}`;
}

export type { ComplianceMatcher };

/**
 * 合规 finding → 报告 `risks` 条目（snake_case）。
 *
 * 只暴露 RAY-696 契约里已有的可选字段；`ruleId` 不进正文——规则编号与官方来源
 * 已经写在 `evidence` 里，前端与 PDF 都能直接看到。
 */
export function complianceRisks(analysis: ComplianceAnalysis): Risk[] {
  return analysis.findings.map((item) => ({
    severity: item.severity,
    quote: item.quote,
    why: item.why,
    fix: item.fix,
    dimension: item.dimension,
    law_name: item.lawName,
    article: item.article,
    decision_level: item.decisionLevel,
    review_required: item.reviewRequired,
    last_verified: item.lastVerified,
    confidence: item.confidence,
    evidence: item.evidence,
  }));
}
