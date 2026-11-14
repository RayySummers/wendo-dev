/**
 * 市场就绪度 v0.1（马来西亚）代码侧检查器。
 *
 * 设计口径（与 RAY-683 / RAY-697 对齐）：
 * - 只看页面**可见信息**是否存在、是否完整；不判断认证真伪，不判断税务/支付/广告是否合规。
 * - 每条检查都有固定 id（MY-MR-01…08），同一份页面文本跑两遍结果完全一致：
 *   没有随机性、没有模型参与、没有时间因素。
 * - 取证范围分两种：
 *   - `product`：商品主面板（以价格或规格表为锚点截取），避免推荐位、导航分类里的
 *     「75-inch」「Wireless Chargers」被当成被诊商品的信息；
 *   - `page`：整页，但只用「substantive」行做证据，导航/页脚链接标签（Delivery、
 *     Returns & Refunds、Warranty…）不算「页面已说明」。
 * - 找不到证据时 `quote` 留空，写「页面未展示」；绝不拼一段看起来像原文的句子。
 */

import { ELECTRICAL_CATEGORIES, MARKET_READINESS_CHECKS, type MarketReadinessCheckDef } from "./rules.js";
import {
  MARKET_READINESS_DIMENSION,
  MARKET_READINESS_DIMENSION_NAME,
  type MarketReadinessFinding,
  type MarketReadinessInput,
  type MarketReadinessStatus,
} from "./types.js";

/** 引用片段上限：超长行按词边界截断，截断后的前缀仍然是原文子串。 */
const MAX_QUOTE = 180;
/** 商品主面板：价格锚点向上/向下取多少行。 */
const PANEL_BEFORE = 10;
const PANEL_AFTER = 70;

interface Line {
  /** 在原始文本中的起止下标，保证 quote 是原文子串。 */
  start: number;
  end: number;
  text: string;
}

interface ProductPanel {
  lines: Line[];
  /** 主面板原文切片（保留原始换行），正则命中后可直接当 quote。 */
  text: string;
  /** 页面是否像一个商品详情页（有价格/SKU/加购/规格表）。 */
  productLike: boolean;
  /** 取证范围说明，写进 finding.evidence。 */
  scopeNote: string;
}

const ONSITE_SCOPE_NOTE = "整页可见文本（排除导航/页脚链接标签）";

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

/** 站点级样板文字：不作为「页面已说明」的证据（版权、条款、隐私政策等）。 */
const BOILERPLATE = /^(?:copyright|©|all rights reserved|terms?\s+(?:and|&)\s+conditions|terms of (?:use|service)|privacy policy|cookie)/i;

/**
 * 一句话/一个标签的区分：导航与页脚链接通常是短标签（Delivery、Returns & Refunds、
 * Warranty、Nationwide Delivery），没有功能词、没有句末标点。只有像样的句子才算
 * 「页面把这件事讲清楚了」。
 */
export function isSubstantiveLine(value: string): boolean {
  const text = value.trim();
  if (text.length < 12) return false;
  if (BOILERPLATE.test(text)) return false;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  const hasFunctionWord =
    /\b(?:a|an|the|and|or|of|to|for|with|without|from|in|on|at|by|is|are|was|were|be|we|you|your|our|this|that|it|as|up|per|within|if|when)\b/i.test(
      text,
    );
  const endsSentence = /[.!?]$/.test(text);
  if (!hasFunctionWord && words.length <= 6 && !endsSentence) return false;
  // 「Free Delivery * with」这类被拆行的碎片不能当证据。
  if (/\b(?:with|to|for|from|and|or|of|the|a|an|at|on|by|&)$/i.test(text)) return false;
  // 单个标题化的短行（"Free Extra One Year Warranty"）仍然可能是页脚菜单，
  // 要求至少 4 个词或有标点，避免把菜单项当成承诺。
  if (!hasFunctionWord && words.length <= 4) return false;
  return true;
}

/**
 * 原文引用截断：超长行只取原文的一个片段，优先在句末收尾，
 * 并保证片段里包含命中词（`focus`），否则引用看起来像在说别的事。
 */
function quoteOf(line: string, focus?: string): string {
  const text = line.trim();
  if (text.length <= MAX_QUOTE) return text;
  const needle = focus ?? "";
  const at = needle ? text.indexOf(needle) : -1;
  let window = text.slice(0, MAX_QUOTE);
  if (at >= 0 && at + needle.length + 40 > MAX_QUOTE) {
    const sentenceStart = text.lastIndexOf(". ", at);
    const start = sentenceStart >= 0 && at - sentenceStart < 140 ? sentenceStart + 2 : Math.max(0, at - 60);
    window = text.slice(start, Math.min(text.length, at + needle.length + 90));
    if (start > 0) {
      const firstSpace = window.indexOf(" ");
      if (firstSpace > 0 && firstSpace < 24) window = window.slice(firstSpace + 1);
    }
  }
  const focusInWindow = needle ? window.indexOf(needle) : -1;
  const sentenceEnd = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  // 句末收尾不能把命中词裁掉，否则引用与结论对不上。
  const keepsFocus = focusInWindow < 0 || sentenceEnd > focusInWindow + needle.length;
  if (sentenceEnd > 60 && keepsFocus) {
    window = window.slice(0, sentenceEnd + 1);
  } else {
    const lastSpace = window.lastIndexOf(" ");
    if (lastSpace > 40) window = window.slice(0, lastSpace);
  }
  return window
    .replace(/[\s,;:–-]+$/g, "")
    .replace(/\b(?:with|to|for|from|and|or|of|the|a|an|at|on|by|in|as)$/i, "")
    .trimEnd();
}

function isCjk(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

function hasEnglishProse(text: string): boolean {
  return /[a-z]{3,}/.test(text) && !isCjk(text);
}

/** 型号 token（JYO-JAF65F09），允许并入商品主面板；带空格的导航标题不会命中。 */
const MODEL_TOKEN = /^[A-Z0-9][A-Z0-9._-]{3,}$/;

/** 带规格线索的短行（商品标题里常见），允许并入商品主面板。 */
const SPEC_CUE =
  /\bmodel\b|\bcapacity\b|\bvoltage\b|\bpower\b|\bwatt\b|\d+(?:[.,]\d+)?\s?(?:mm|cm|kg|g|ml|l|w|kw|v|hz|°c|inch(?:es)?|lbs?|oz|ft)\b/i;

/**
 * 价格锚点：先排除 0.00（购物车小计），再优先紧邻 SKU / 加购按钮的报价。
 * 允许「RM」与金额分开两行，落点取 RM 所在行。
 */
function findPriceAnchor(text: string, lines: Line[]): number {
  const pattern = /\b(?:RM|MYR)\s*\d[\d,]*\.\d{2}/gi;
  const candidates: Array<{ lineIndex: number; value: number }> = [];
  for (const match of text.matchAll(pattern)) {
    const value = Number(match[0].replace(/[^\d.]/g, ""));
    if (!Number.isFinite(value) || value <= 0) continue;
    const at = match.index ?? 0;
    const lineIndex = lines.findIndex((line) => line.start <= at && at < line.end);
    if (lineIndex >= 0) candidates.push({ lineIndex, value });
  }
  if (!candidates.length) return -1;
  const nearProduct = candidates.find((candidate) =>
    lines
      .slice(Math.max(0, candidate.lineIndex - 8), candidate.lineIndex + 9)
      .some((line) => /^sku\b/i.test(line.text) || /^(?:add to cart|buy now)\b/i.test(line.text)),
  );
  const chosen = nearProduct ?? candidates[0];
  return chosen ? chosen.lineIndex : -1;
}

/** 商品主面板：价格锚点 → 规格表锚点 → 无法定位。 */
export function findProductPanel(text: string, lines: Line[] = toLines(text)): ProductPanel {
  // 价格：允许「RM」与金额分行（真实页面常见），所以先在整页文本上匹配，再落到行号。
  const priceAnchor = findPriceAnchor(text, lines);
  const specAnchor = lines.findIndex((line) =>
    /^(?:specifications?|technical (?:details|specifications?)|product details|产品规格)$/i.test(line.text) ||
    /^(?:capacity|power|voltage|rated\s+voltage|weight|dimensions?|product size|model)\b/i.test(line.text),
  );
  const cartLine = lines.some(
    (line) => /^(?:add to cart|buy now|pre-?order|sku)\b/i.test(line.text) || /^sku[:\s]/i.test(line.text),
  );
  const productLike = priceAnchor >= 0 || specAnchor >= 0 || cartLine;

  const anchor = priceAnchor >= 0 ? priceAnchor : specAnchor;
  if (anchor < 0) {
    return { lines: [], text: "", productLike, scopeNote: "未定位到商品主面板" };
  }

  const stop = /^(?:recommended products?|you may also like|related products?|recently viewed|frequently bought|compare products?|reviews?\b)/i;
  // 向前：句子、SKU、带规格线索的行（6.5L / 1500W / inch）才并入主面板；
  // 遇到纯导航标签就截断，避免把分类菜单和推荐位吃进来。
  let start = anchor;
  for (let i = anchor - 1; i >= 0 && i >= anchor - PANEL_BEFORE; i -= 1) {
    const line = lines[i];
    if (!line) break;
    const productish = SPEC_CUE.test(line.text) || /^sku\b/i.test(line.text) || MODEL_TOKEN.test(line.text);
    if (!isSubstantiveLine(line.text) && !productish) {
      start = i + 1;
      break;
    }
    start = i;
  }
  const picked: Line[] = [];
  for (let i = start; i < lines.length && i <= anchor + PANEL_AFTER; i += 1) {
    const line = lines[i];
    if (!line) break;
    if (i > anchor && stop.test(line.text)) break;
    picked.push(line);
  }
  const first = picked[0];
  const last = picked[picked.length - 1];
  if (!first || !last) {
    return { lines: [], text: "", productLike, scopeNote: "未定位到商品主面板" };
  }
  const panelText = text.slice(first.start, last.end);
  const note =
    priceAnchor >= 0
      ? `商品主面板（价格锚点，向上 ${PANEL_BEFORE} 行 / 向下 ${PANEL_AFTER} 行，止于推荐位）`
      : `商品主面板（规格表锚点，向下 ${PANEL_AFTER} 行）`;
  return { lines: picked, text: panelText, productLike, scopeNote: note };
}

function finding(
  def: MarketReadinessCheckDef,
  status: MarketReadinessStatus,
  quote: string,
  why: string,
  fix: string,
  evidence?: string,
  focus?: string,
): MarketReadinessFinding {
  return {
    checkId: def.id,
    label: def.label,
    status,
    quote: quote.trim() ? quoteOf(quote, focus) : "",
    why,
    fix,
    dimension: MARKET_READINESS_DIMENSION,
    ...(evidence ? { evidence } : {}),
  };
}

function notApplicable(def: MarketReadinessCheckDef, reason: string): MarketReadinessFinding {
  return finding(def, "not_applicable", "", reason, "本项不适用，无需改动。", "适用性判定：不适用");
}

/** 在商品主面板里找不到可定位的商品区时，说明为什么这项没法检查。 */
function noPanel(def: MarketReadinessCheckDef, panel: ProductPanel): MarketReadinessFinding {
  const reason = panel.productLike
    ? "页面没有可定位的价格/规格主面板，无法确认这是被诊商品的可见信息，本项记为无法检查。"
    : "本页不是商品详情页（没有价格、SKU 或规格表锚点），商品级信息不在本页可检查范围。";
  return notApplicable(def, reason);
}

function defOf(id: string): MarketReadinessCheckDef {
  const def = MARKET_READINESS_CHECKS.find((check) => check.id === id);
  if (!def) throw new Error(`未知的市场就绪度检查：${id}`);
  return def;
}

/* ------------------------------------------------------------ MY-MR-01 */

const US_SPELLING =
  /\b(colors?|centers?|centered|organiz(?:e|es|ed|ing|ation)|customiz(?:e|es|ed|ing)|personaliz(?:e|es|ed|ing)|catalogs?|favorites?|fibers?|liters?|meters?|analyze[sd]?|fulfill(?:s|ed|ing)?|gray|defen[cs]e|traveling|canceled|jewelry|practicing)\b/i;

function checkEnglishVariant(input: MarketReadinessInput, lines: Line[]): MarketReadinessFinding {
  const def = defOf("MY-MR-01");
  const body = lines.filter((line) => isSubstantiveLine(line.text));

  const usHit = body.find((line) => US_SPELLING.test(line.text));
  const cjkHit = body.find((line) => isCjk(line.text));

  if (usHit) {
    const word = US_SPELLING.exec(usHit.text)?.[0] ?? "";
    const alsoCjk = cjkHit ? "；同一页还夹带未翻译的中文，建议一并清理" : "";
    return finding(
      def,
      "needs_review",
      usHit.text,
      `页面正文出现美式拼写「${word}」。马来西亚英语以英式拼写为教育与企业文书标准，混用会显得文案不是为本地写的${alsoCjk}。`,
      `统一改成英式拼写（例如 colour / centre / organise / catalogue / favourite），并把中文残留改成目标语言版本。`,
      `${ONSITE_SCOPE_NOTE} · 命中：${word}`,
    );
  }

  if (cjkHit) {
    return finding(
      def,
      "needs_review",
      cjkHit.text,
      "英文页面的正文里夹带未翻译的中文，本地读者会把它读成「还没做完本地化」。",
      "把中文段落改成英文（或英马并列），保留品牌名与型号即可。",
      `${ONSITE_SCOPE_NOTE} · 命中：CJK 字符`,
    );
  }

  const sample = body.find((line) => line.text.length >= 24 && hasEnglishProse(line.text));
  if (sample) {
    return finding(
      def,
      "present",
      sample.text,
      "正文以英文呈现，未命中美式拼写清单，也没有未翻译的中文残留。",
      "保持统一；新增文案时沿用同一套英式拼写。",
      `${ONSITE_SCOPE_NOTE} · 美式拼写命中 0、CJK 命中 0`,
    );
  }

  return notApplicable(def, "页面没有足够长的英文正文可供取样，无法判断英语变体是否一致。");
}

/* ------------------------------------------------------------ MY-MR-02 */

const PRICE = /\b(?:RM|MYR)\s?\d[\d,]*(?:\.\d{2})?/i;
const FOREIGN_CURRENCY = /(?:\bUSD\b|US\$|\bSGD\b|S\$|\bCNY\b|\bRMB\b|¥|￥)/i;
const TAX_NOTE = /\b(?:SST|GST|VAT|sales\s+and\s+services\s+tax)\b|(?:inclusive|exclusive|incl\.?|excl\.?)\s+(?:of\s+)?(?:tax|sst|gst)/i;

function checkCurrency(input: MarketReadinessInput, panel: ProductPanel, lines: Line[]): MarketReadinessFinding {
  const def = defOf("MY-MR-02");
  if (!panel.lines.length) return noPanel(def, panel);

  const price = PRICE.exec(panel.text);
  if (price) {
    const tax = TAX_NOTE.exec(panel.text);
    if (tax) {
      return finding(
        def,
        "present",
        price[0],
        `价格以 RM（MYR）展示，页面也写明了 ${tax[0]} 口径。这只记录展示方式，税务处理请财务确认。`,
        "保持币种与含税口径一致；促销价旁边同样标注口径。",
        `${panel.scopeNote} · 命中：${price[0]} / ${tax[0]}`,
      );
    }
    return finding(
      def,
      "needs_review",
      price[0],
      "价格已用 RM 展示，但页面没有说明是含税还是未税（SST/GST），本地买家在结算前无法判断最终价格。",
      "在价格旁写明「Price inclusive of SST」或「exclusive of SST」；这是展示说明，具体税务处理请财务确认。",
      `${panel.scopeNote} · 命中：${price[0]}；含税/未税说明 0 命中`,
    );
  }

  const foreignLine = lines.find((line) => FOREIGN_CURRENCY.test(line.text));
  const foreign = FOREIGN_CURRENCY.exec(foreignLine?.text ?? "");
  if (foreign) {
    return finding(
      def,
      "needs_review",
      foreignLine?.text ?? foreign[0],
      `页面出现 ${foreign[0]} 计价，没有用 RM（MYR）展示本地价格。`,
      "以 RM 展示马来西亚售价；如需保留外币参考价，标注汇率来源与更新时间。",
      `${panel.scopeNote} · 命中：${foreign[0]}`,
    );
  }

  return finding(
    def,
    "missing",
    "",
    "商品主面板没有出现任何价格，页面没有回答「在马来西亚卖多少钱」。",
    def.missingFix,
    `${panel.scopeNote} · 价格命中 0`,
  );
}

/* ------------------------------------------------------------ MY-MR-03 */

const METRIC_UNIT =
  /\b\d+(?:[.,]\d+)?\s?(?:mm|cm|kg|g|ml|l|w|kw|v|hz|°c|litres?|liters?|centimetres?|centimeters?|kilograms?|grams?)\b/i;
const IMPERIAL_UNIT =
  /\b\d+(?:[.,]\d+)?\s?(?:inch(?:es)?|in\.|ft|feet|foot|lbs?|pounds?|oz|fl\s?oz|°f|gallons?|quarts?|pints?)\b/i;

function checkUnits(input: MarketReadinessInput, panel: ProductPanel): MarketReadinessFinding {
  const def = defOf("MY-MR-03");
  if (!panel.lines.length) return noPanel(def, panel);

  const imperial = IMPERIAL_UNIT.exec(panel.text);
  if (imperial) {
    return finding(
      def,
      "needs_review",
      imperial[0],
      `商品面板的规格使用英制单位「${imperial[0]}」。马来西亚日常与电商规格以公制为主，混用英制会让本地读者多一步换算。`,
      "规格表统一改成公制（cm / kg / ml / L / W / V）；如必须保留英制，括号标注换算值。",
      `${panel.scopeNote} · 命中：${imperial[0]}`,
    );
  }

  const metric = METRIC_UNIT.exec(panel.text);
  if (metric) {
    return finding(
      def,
      "present",
      metric[0],
      `商品面板使用公制单位（${metric[0]}），与本地规格阅读习惯一致。`,
      "保持公制写法；新增规格时不要混入 inch / lb / oz。",
      `${panel.scopeNote} · 命中：${metric[0]}；英制命中 0`,
    );
  }

  return finding(
    def,
    "missing",
    "",
    "商品主面板没有出现带单位的尺寸、容量或功率，页面没有回答「这个商品有多大/多耗电」。",
    def.missingFix,
    `${panel.scopeNote} · 公制命中 0、英制命中 0`,
  );
}

/* ------------------------------------------------------------ MY-MR-04 */

const VOLTAGE = /\b(?:220|230|240)\s?V(?:AC)?\b|\b220\s?[-–]\s?240\s?V\b|\b(?:50|60)\s?Hz\b|\b50\s?\/\s?60\s?Hz\b/i;
const PLUG = /\bType\s?G\b|\bBS\s?1363\b|\b(?:3|three)[-\s]?pin\b|\bUK\s?(?:plug|3[-\s]?pin)\b/i;

function checkPower(input: MarketReadinessInput, panel: ProductPanel): MarketReadinessFinding {
  const def = defOf("MY-MR-04");
  if (!ELECTRICAL_CATEGORIES.includes(input.category)) {
    return notApplicable(def, "本品类不属于带市电的电器，电压与插头本项不适用。");
  }
  if (!panel.lines.length) return noPanel(def, panel);

  const voltage = VOLTAGE.exec(panel.text);
  const plug = PLUG.exec(panel.text);

  if (voltage && plug) {
    return finding(
      def,
      "present",
      voltage[0],
      `商品面板写明了 ${voltage[0]} 与 ${plug[0]}，本地买家能判断能不能直接插墙插。这里只记录是否写明，不判断认证或安全。`,
      "保持写清电压、频率与插头类型；换型号时同步更新。",
      `${panel.scopeNote} · 命中：${voltage[0]} / ${plug[0]}`,
    );
  }

  if (voltage || plug) {
    const missing = voltage ? "插头类型（Type G / 三脚）" : "电压与频率（230V / 50Hz）";
    return finding(
      def,
      "needs_review",
      (voltage ?? plug)?.[0] ?? "",
      `商品面板提到了 ${(voltage ?? plug)?.[0]}，但缺少${missing}，买家仍无法确认能否在马来西亚直接使用。`,
      def.missingFix,
      `${panel.scopeNote} · 命中：${(voltage ?? plug)?.[0]}；缺少：${missing}`,
    );
  }

  return finding(
    def,
    "missing",
    "",
    "商品面板没有写明电压/频率与插头类型，页面没有回答「买回来能不能在马来西亚直接用」。",
    def.missingFix,
    `${panel.scopeNote} · 电压命中 0、插头命中 0`,
  );
}

/* ------------------------------------------------------------ MY-MR-05 */

const MY_PHONE =
  /(?:\+?60\s?1[0-9][\s-]?\d{3,4}[\s-]?\d{4}|\+?60\s?[3-9][\s-]?\d{3,4}[\s-]?\d{4}|\b0[3-9][\s-]?\d{3,4}[\s-]?\d{4}\b|\b1[03]00[\s-]?\d{2}[\s-]?\d{3}\b|\b1800[\s-]?\d{2,3}[\s-]?\d{3,4}\b)/;
const CN_PHONE = /(?:\+?86[\s-]?1[3-9]\d{9}|\+86[\s-]?\d{2,3}[\s-]?\d{4}[\s-]?\d{4})/;
const MY_ADDRESS =
  /\b(?:no\.?\s?\d+|lot\s?\d+|jalan|taman|persiaran|lebuh|lorong|kampung|bandar|selangor|kuala lumpur|penang|pulau pinang|johor|perak|sabah|sarawak|melaka|negeri sembilan|pahang|kelantan|terengganu|kedah|perlis|putrajaya|labuan)\b/i;
const MY_HOURS =
  /\b(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*(?:[-–—]|to)\s*(?:mon|tue|wed|thu|fri|sat|sun)[a-z]*|\b\d{1,2}(?:[.:]\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)\b|\b(?:working|business|operating|office)\s+hours\b/i;
const WHATSAPP = /\bwhatsapp\b/i;

function checkContact(input: MarketReadinessInput, lines: Line[]): MarketReadinessFinding {
  const def = defOf("MY-MR-05");
  const phoneLine = lines.find((line) => MY_PHONE.test(line.text));
  const cnLine = lines.find((line) => CN_PHONE.test(line.text) && !MY_PHONE.test(line.text));
  const addressLine = lines.find((line) => MY_ADDRESS.test(line.text));
  const hoursLine = lines.find((line) => MY_HOURS.test(line.text));
  const whatsappLine = lines.find((line) => WHATSAPP.test(line.text));

  if (phoneLine) {
    const hasAddress = Boolean(addressLine);
    const hasHours = Boolean(hoursLine);
    if (hasAddress || hasHours) {
      return finding(
        def,
        "present",
        phoneLine.text,
        `页面提供了马来西亚本地电话${hasAddress ? "与本地地址" : ""}${hasHours ? "、工作时间" : ""}，本地买家能找到人。`,
        "保持页脚与联系页信息一致；换号码时同步更新。",
        `整页可见文本 · 命中：本地电话${hasAddress ? " / 地址" : ""}${hasHours ? " / 工作时间" : ""}`,
      );
    }
    return finding(
      def,
      "needs_review",
      phoneLine.text,
      "页面有马来西亚本地电话，但没有营业地址或工作时间，买家不知道什么时候能联系、出问题找谁。",
      "补营业地址与工作时间（含时区），与电话放在同一处；有 WhatsApp 时一并写清服务时段。",
      "整页可见文本 · 命中：本地电话；地址 0、工作时间 0",
    );
  }

  if (cnLine) {
    return finding(
      def,
      "missing",
      cnLine.text,
      "页面只给出中国总部联系方式，没有马来西亚本地电话、地址或工作时间，本地买家遇到售后问题没有本地入口。",
      def.missingFix,
      "整页可见文本 · 命中：中国号码，本地电话 0",
    );
  }

  if (whatsappLine) {
    return finding(
      def,
      "needs_review",
      whatsappLine.text,
      "页面只有 WhatsApp 入口，没有可拨打的本地电话、地址或工作时间，部分买家仍找不到正式联络方式。",
      "保留 WhatsApp，同时补本地电话、地址与工作时间。",
      "整页可见文本 · 命中：WhatsApp；本地电话 0",
    );
  }

  if (addressLine || hoursLine) {
    return finding(
      def,
      "needs_review",
      (addressLine ?? hoursLine)?.text ?? "",
      `页面有本地${addressLine ? "地址" : "工作时间"}，但没有可拨打的马来西亚电话。`,
      "补本地电话（固话 03-… 或手机 +60 1x-…），与地址/工作时间放在一起。",
      "整页可见文本 · 本地电话 0",
    );
  }

  return finding(
    def,
    "missing",
    "",
    "页面没有出现马来西亚本地电话、地址或工作时间。",
    def.missingFix,
    "整页可见文本 · 本地电话/地址/工作时间 0 命中",
  );
}

/* ------------------------------------------------------------ MY-MR-06 */

const DELIVERY =
  /\b(?:deliver(?:y|ies|ed)?|shipp(?:ing|ed|s)?|dispatch(?:ed)?|courier|nationwide|pos\s?laju|j&t|dhl|ninja\s?van|self[-\s]?collect)\b/i;
const RETURNS = /\b(?:returns?|refunds?|exchanges?|money[-\s]?back)\b/i;
const WARRANTY = /\b(?:warrant(?:y|ies)|guarantee[ds]?|after[-\s]?sales)\b/i;

function substantiveHit(lines: Line[], pattern: RegExp): Line | undefined {
  return lines.find((line) => isSubstantiveLine(line.text) && pattern.test(line.text));
}

function checkFulfilment(input: MarketReadinessInput, lines: Line[]): MarketReadinessFinding {
  const def = defOf("MY-MR-06");
  const delivery = substantiveHit(lines, DELIVERY);
  const returns = substantiveHit(lines, RETURNS);
  const warranty = substantiveHit(lines, WARRANTY);
  const found = [delivery, returns, warranty].filter((line): line is Line => Boolean(line));
  const missing: string[] = [];
  if (!delivery) missing.push("是否配送马来西亚（含东马）与预计时效");
  if (!returns) missing.push("退换地址与期限");
  if (!warranty) missing.push("保修范围与联系人");

  if (found.length === 3) {
    return finding(
      def,
      "present",
      delivery?.text ?? found[0]?.text ?? "",
      "页面分别写到了配送、退换与保修，本地买家能判断下单后会发生什么。这里只记录是否写到，不判断条款是否合规。",
      "保持三块信息在同一处可查；换物流商或保修政策时同步更新。",
      "整页可见文本 · 命中：配送 / 退换 / 保修",
    );
  }

  if (found.length > 0) {
    return finding(
      def,
      "needs_review",
      found[0]?.text ?? "",
      `页面只写到了${[delivery ? "配送" : "", returns ? "退换" : "", warranty ? "保修" : ""].filter(Boolean).join("、")}，还缺少${missing.join("、")}。`,
      def.missingFix,
      `整页可见文本 · 命中：${[delivery ? "配送" : "", returns ? "退换" : "", warranty ? "保修" : ""].filter(Boolean).join(" / ")}；缺少：${missing.join(" / ")}`,
    );
  }

  return finding(
    def,
    "missing",
    "",
    "页面没有写到配送、退换或保修，本地买家在下单前看不到售后与物流承诺。",
    def.missingFix,
    "整页可见文本 · 配送/退换/保修 0 命中",
  );
}

/* ------------------------------------------------------------ MY-MR-07 */

const LOCAL_PAYMENTS: Array<{ label: string; pattern: RegExp }> = [
  { label: "FPX", pattern: /\bFPX\b|Financial\s+Process\s+Exchange/i },
  { label: "DuitNow", pattern: /\bDuitNow\b/i },
  { label: "Touch 'n Go", pattern: /\b(?:Touch\s?'?n\s?Go|TnG|TNG)\b/i },
  { label: "GrabPay", pattern: /\bGrabPay\b/i },
  { label: "ShopeePay", pattern: /\bShopeePay\b/i },
  { label: "Boost", pattern: /\bBoost\b/ },
  { label: "本地银行", pattern: /\b(?:Maybank2u|CIMB\s?Clicks|OCTO|PBe|Public\s+Bank|RHB(?:\s?Now)?|Hong\s+Leong\s+Connect|Bank\s+Islam|AmBank|Bank\s+Rakyat|Affin\s+Bank)\b/i },
  { label: "本地网关/先买后付", pattern: /\b(?:Atome|SPayLater|Shopee\s?PayLater|Billplz|iPay88|Razer\s?(?:Merchant|MS)|SenangPay)\b/i },
];
const INTERNATIONAL_PAYMENT = /\b(?:Visa|Mastercard|American\s+Express|Amex|PayPal|Apple\s+Pay|Google\s+Pay|Stripe)\b/i;
const INSTALMENT = /\b(?:installments?|instalments?|BNPL|buy\s+now\s+pay\s+later|0%\s*interest)\b/i;

function checkPayments(input: MarketReadinessInput, lines: Line[]): MarketReadinessFinding {
  const def = defOf("MY-MR-07");
  const hits: Array<{ label: string; line: Line }> = [];
  for (const method of LOCAL_PAYMENTS) {
    const line = lines.find((candidate) => isSubstantiveLine(candidate.text) && method.pattern.test(candidate.text));
    if (line) hits.push({ label: method.label, line });
  }

  if (hits.length) {
    const labels = [...new Set(hits.map((hit) => hit.label))];
    return finding(
      def,
      "present",
      hits[0]?.line.text ?? "",
      `页面列出了马来西亚常用支付方式（${labels.join("、")}）。这里只记录展示，不判断支付通道是否可用或合规。`,
      "保持支付方式与结算页一致；本地方式不要只放在帮助中心。",
      `整页可见文本 · 命中：${labels.join(" / ")}`,
    );
  }

  const international = lines.find((line) => isSubstantiveLine(line.text) && INTERNATIONAL_PAYMENT.test(line.text));
  const instalment = lines.find((line) => isSubstantiveLine(line.text) && INSTALMENT.test(line.text));

  if (instalment) {
    return finding(
      def,
      "needs_review",
      instalment.text,
      "页面提到了分期/先买后付，但没有列出 FPX、本地银行或本地电子钱包，买家仍不知道能不能用平时用的方式付款。",
      "补 FPX、本地银行转账与本地电子钱包；保留分期说明即可。",
      `整页可见文本 · 命中：分期/BNPL；本地方式 0`,
    );
  }

  if (international) {
    return finding(
      def,
      "needs_review",
      international.text,
      "页面只列了国际卡组织/钱包，没有出现马来西亚常用支付方式（FPX、本地银行、本地电子钱包）。",
      def.missingFix,
      `整页可见文本 · 命中：国际支付方式；本地方式 0`,
    );
  }

  return finding(
    def,
    "missing",
    "",
    "页面没有列出任何支付方式，也没有出现 FPX、本地银行或本地电子钱包。",
    def.missingFix,
    "整页可见文本 · 支付方式 0 命中",
  );
}

/* ------------------------------------------------------------ MY-MR-08 */

const CERT_MARK =
  /\bSIRIM(?:\s?QAS)?\b|\bSafety\s?Mark\b|\bSuruhanjaya\s+Tenaga\b|\bEnergy\s+Commission\b|\bMCMC\b|\bCoA\b|\bCertificate\s+of\s+Approval\b/i;
const VAGUE_CERT =
  /\b(?:certified|certification|certificate|approved\s+by|complies\s+with|meets\s+(?:the\s+)?standards?)\b/i;

function checkCertification(input: MarketReadinessInput, lines: Line[]): MarketReadinessFinding {
  const def = defOf("MY-MR-08");
  if (!ELECTRICAL_CATEGORIES.includes(input.category)) {
    return notApplicable(def, "本品类不属于需要电气认证标志展示的品类，本项不适用。");
  }

  const mark = lines.find((line) => CERT_MARK.test(line.text));
  if (mark) {
    return finding(
      def,
      "present",
      mark.text,
      `页面展示了 ${CERT_MARK.exec(mark.text)?.[0]} 相关字样。这里只记录是否展示，不核对证书编号，也不判断认证状态。`,
      "保留标志与编号，并给出可核对的来源（证书编号/查询链接）；真伪与合规判断不在本报告范围。",
      `整页可见文本 · 命中：${CERT_MARK.exec(mark.text)?.[0]}`,
      CERT_MARK.exec(mark.text)?.[0],
    );
  }

  const vague = lines.find((line) => VAGUE_CERT.test(line.text) && isSubstantiveLine(line.text));
  if (vague) {
    return finding(
      def,
      "needs_review",
      vague.text,
      "页面只写了「certified / approved」之类笼统说法，没有点名 SIRIM、Safety Mark 或证书编号，读者无法核对是哪一种标志。",
      def.missingFix,
      "整页可见文本 · 命中：笼统认证表述；标志名 0",
    );
  }

  return finding(
    def,
    "missing",
    "",
    "页面没有展示 SIRIM / Safety Mark 等认证标志或编号。这里只记录「未展示」，不代表未认证。",
    def.missingFix,
    "整页可见文本 · 认证标志 0 命中",
  );
}

/* ------------------------------------------------------------- 汇总 */

export interface MarketReadinessAnalysis {
  findings: MarketReadinessFinding[];
  panel: ProductPanel;
  counts: Record<MarketReadinessStatus, number>;
}

export function analyzeMarketReadiness(input: MarketReadinessInput): MarketReadinessAnalysis {
  const lines = toLines(input.text);
  const panel = findProductPanel(input.text, lines);

  const findings: MarketReadinessFinding[] = [
    checkEnglishVariant(input, lines),
    checkCurrency(input, panel, lines),
    checkUnits(input, panel),
    checkPower(input, panel),
    checkContact(input, lines),
    checkFulfilment(input, lines),
    checkPayments(input, lines),
    checkCertification(input, lines),
  ];

  const counts: Record<MarketReadinessStatus, number> = {
    present: 0,
    missing: 0,
    not_applicable: 0,
    needs_review: 0,
  };
  for (const item of findings) counts[item.status] += 1;

  return { findings, panel, counts };
}

/** 维度行状态：有未展示/需复核就记 risk，全部展示才记 ok。 */
export function marketReadinessDimensionStatus(
  counts: Record<MarketReadinessStatus, number>,
): "risk" | "ok" | "not_assessable" {
  if (counts.missing > 0 || counts.needs_review > 0) return "risk";
  if (counts.present > 0) return "ok";
  return "not_assessable";
}

/** 维度行说明：只说检查结果的数量，不折算分数。 */
export function marketReadinessNote(counts: Record<MarketReadinessStatus, number>): string {
  const parts = [`已展示 ${counts.present} 项`, `未展示 ${counts.missing} 项`];
  if (counts.needs_review > 0) parts.push(`需复核 ${counts.needs_review} 项`);
  if (counts.not_applicable > 0) parts.push(`不适用 ${counts.not_applicable} 项`);
  return `市场就绪度 8 项页面检查：${parts.join("、")}。只看页面可见信息，不代表认证、税务或支付合规结论。`;
}

/** 报告级「未覆盖范围」：把这一层的能力边界写死，避免被读成合规结论。 */
export const MARKET_READINESS_LIMIT = {
  item: "认证标志真伪与合规判定",
  reason:
    "市场就绪度只记录页面是否展示 SIRIM / Safety Mark、是否写明价格含税口径与支付方式，不核验证书真伪，也不判断是否满足强制认证或税务要求；这部分归合规与风险章节与人工复核。",
} as const;

export { MARKET_READINESS_DIMENSION, MARKET_READINESS_DIMENSION_NAME };
