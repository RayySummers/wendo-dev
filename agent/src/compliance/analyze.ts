/**
 * 合规与风险 v0.1（马来西亚）代码侧规则判定。
 *
 * 设计口径（与 RAY-684 / RAY-696 / RAY-698 对齐）：
 * - 只读 `agent/knowledge/legal/my/rules.v0.1.json`；法条、条文号、官方 URL、核验日期
 *   全部来自规则库，代码不写死任何法条，也不凭记忆补。
 * - 三档判定沿用规则库的 `decision_level`，不改写：规则直判 / 需事实核实 / 需人工判断。
 * - 同一页同一规则只出一条；同一句触发多条规则时合并成一张卡，各法条写进 evidence。
 * - 取证范围优先商品主面板（价格/SKU 锚点），导航、推荐位、页脚链接标签不参与取证。
 * - 缺席类检查（国语版本、隐私告知）只写「页面未展示」，不推断未认证/未合规，
 *   并一律标 `reviewRequired`。
 * - 输出里不出现「合法 / 违法 / 保证通过 / 已认证」这类判决式措辞。
 */

import type { Risk, Severity } from "../types.js";
import { findProductPanel, isSubstantiveLine } from "../market-readiness/analyze.js";
import {
  COMPLIANCE_MATCHERS,
  COMPLIANCE_SKIP_REASONS,
  myRules,
  ruleById,
  rulesVersion,
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
  },
): ComplianceFinding {
  // high 级默认标「需专业审核」；human_review 与规则库要求复核的条目同样要标。
  const reviewRequired =
    options.reviewRequired ??
    (rule.review_required || rule.decision_level === "human_review" || severityOf(rule) === "high");
  return {
    ruleId: rule.id,
    severity: severityOf(rule),
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

function severityOf(rule: LegalRule): Severity {
  const matcher = COMPLIANCE_MATCHERS.find((item) => item.ruleId === rule.id);
  if (matcher) return matcher.severity;
  if (rule.decision_level === "rule_level") return "medium";
  if (rule.decision_level === "human_review") return "low";
  return "medium";
}

/* ------------------------------------------------------------------ 声明匹配 */

function collectCandidates(input: {
  matchers: ComplianceMatcher[];
  lines: Line[];
  panel: ReturnType<typeof findProductPanel>;
}): { candidates: Candidate[]; misses: ComplianceRuleDisposition[] } {
  const { matchers, lines, panel } = input;
  const candidates: Candidate[] = [];
  const misses: ComplianceRuleDisposition[] = [];
  const region = productRegion(lines, panel);

  for (const matcher of matchers) {
    if (matcher.kind !== "claim") continue;
    const rule = ruleById(matcher.ruleId);
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

function malayMarkerCount(lines: Line[]): number {
  let count = 0;
  for (const line of lines) {
    const hits = line.text.match(MALAY_MARKERS);
    if (hits) count += hits.length;
  }
  return count;
}

function formalCandidates(
  matcher: FormalMatcherDef,
  ctx: { lines: Line[]; panel: ReturnType<typeof findProductPanel> },
): Candidate | undefined {
  const { lines, panel } = ctx;
  const scoped = panel.lines.length ? panel.lines : lines;
  const scopeNote = panel.lines.length ? panel.scopeNote : "整页可见文本";
  const rule = ruleById(matcher.ruleId);

  if (matcher.check === "limited_without_terms") {
    for (let index = 0; index < scoped.length; index += 1) {
      const line = scoped[index];
      if (!line) continue;
      const pattern = matcher.patterns.find((item) => patternRegExp(item).test(line.text));
      if (!pattern) continue;
      const neighbourhood = [scoped[index - 1], line, scoped[index + 1]]
        .filter((item): item is Line => Boolean(item))
        .map((item) => item.text)
        .join(" ");
      if (LIMITED_TERMS.test(neighbourhood)) continue;
      return { rule, def: matcher, line, pattern, scopeNote };
    }
    return undefined;
  }

  if (matcher.check === "malay_disclosure_absent") {
    const substantive = lines.filter((line) => isSubstantiveLine(line.text));
    if (substantive.length < 6) return undefined;
    if (malayMarkerCount(lines) >= 3) return undefined;
    const anchor = panel.lines.find((line) => isSubstantiveLine(line.text)) ?? substantive[0];
    if (!anchor) return undefined;
    return { rule, def: matcher, line: anchor, pattern: "整页未见马来语版本", scopeNote };
  }

  if (matcher.check === "privacy_notice_absent") {
    if (lines.some((line) => PRIVACY_NOTICE.test(line.text))) return undefined;
    const trigger = lines.find((line) => DATA_COLLECTION.test(line.text) && isSubstantiveLine(line.text));
    if (!trigger) return undefined;
    return { rule, def: matcher, line: trigger, pattern: "收集入口未见隐私告知", scopeNote: "整页可见文本" };
  }

  if (matcher.check === "halal_claim_without_certificate") {
    const claim = scoped.find((line) => matcher.patterns.some((item) => patternRegExp(item).test(line.text)));
    if (!claim) return undefined;
    if (lines.some((line) => HALAL_CERTIFICATE.test(line.text))) return undefined;
    const pattern = matcher.patterns.find((item) => patternRegExp(item).test(claim.text)) ?? "halal";
    return { rule, def: matcher, line: claim, pattern, scopeNote };
  }

  return undefined;
}

function formalFinding(candidate: Candidate): ComplianceFinding {
  const { rule, line, pattern, scopeNote } = candidate;

  if (rule.id === "MY-ADV-09") {
    return buildFinding(rule, {
      quote: line.text,
      pattern,
      scopeNote,
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
    why: `${rule.law_short} ${rule.article}：${firstSentence(rule.requirement)}`,
  });
}

function claimFinding(candidate: Candidate): ComplianceFinding {
  const { rule, pattern, line, scopeNote, def } = candidate;
  const note = def.kind === "claim" && def.note ? ` ${def.note}` : "";
  return buildFinding(rule, {
    quote: line.text,
    pattern,
    scopeNote,
    why: `${rule.law_short} ${rule.article}：${firstSentence(rule.requirement)} 页面出现「${pattern}」表述，${levelHint(rule.decision_level)}${note}`,
  });
}

/* ------------------------------------------------------------------- 主入口 */

export function analyzeCompliance(input: ComplianceInput): ComplianceAnalysis {
  const lines = toLines(input.text);
  const panel = findProductPanel(input.text, lines);

  const claimMatchers = COMPLIANCE_MATCHERS.filter((matcher) => matcher.kind === "claim");
  const formalMatchers = COMPLIANCE_MATCHERS.filter(
    (matcher): matcher is FormalMatcherDef => matcher.kind === "formal",
  );

  const { candidates, misses } = collectCandidates({ matchers: claimMatchers, lines, panel });
  const dispositions: ComplianceRuleDisposition[] = [...misses];

  for (const matcher of formalMatchers) {
    const candidate = formalCandidates(matcher, { lines, panel });
    const rule = ruleById(matcher.ruleId);
    if (!candidate) {
      dispositions.push({
        ruleId: rule.id,
        decisionLevel: rule.decision_level,
        outcome: "no_match",
        reason:
          matcher.check === "malay_disclosure_absent"
            ? "页面已出现马来语文本，或正文过短无法判断"
            : matcher.check === "privacy_notice_absent"
              ? "页面已有隐私告知，或没有可观察的数据收集入口"
              : "页面未触发该条检查的触发条件",
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
        const severity = SEVERITY_RANK[severityOf(a.rule)] - SEVERITY_RANK[severityOf(b.rule)];
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
    const base = primary.def.kind === "formal" ? formalFinding(primary) : claimFinding(primary);
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

  for (const skip of COMPLIANCE_SKIP_REASONS) {
    for (const id of skip.ruleIds) {
      const rule = ruleById(id);
      dispositions.push({
        ruleId: id,
        decisionLevel: rule.decision_level,
        outcome: "not_assessable",
        reason: skip.reason,
      });
    }
  }

  const uncovered = uncoveredRuleIds();
  if (uncovered.length) {
    throw new Error(`合规规则库有规则既没判定也没记跳过原因：${uncovered.join(", ")}`);
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

  const libraryRuleCount = myRules().length;
  const assessedRuleCount = COMPLIANCE_MATCHERS.length;

  return {
    findings: capped,
    counts,
    dispositions,
    boundaryNote: {
      item: `合规与风险（${COMPLIANCE_DIMENSION_NAME}）的判定范围`,
      reason: `马来西亚规则库 ${libraryRuleCount} 条中，本版对页面文本可判定的 ${assessedRuleCount} 条已跑（规则直判 ${counts.rule_level}、需事实核实 ${counts.substantiation}、需人工判断 ${counts.human_review}）。其余条目属证书核验、主体或平台义务，不生成 finding，也不据此判断合规。`,
    },
    skipReasons: COMPLIANCE_SKIP_REASONS,
    assessedRuleCount,
    libraryRuleCount,
    libraryVersion: rulesVersion(),
  };
}

/** 报告「诊断维度」里的一行；没有命中时写成无法判断，而不是「没问题」。 */
export function complianceDimension(analysis: ComplianceAnalysis): {
  name: string;
  status: "risk" | "ok" | "not_assessable";
  note: string;
} {
  const { counts } = analysis;
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
