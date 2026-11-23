/**
 * 合规与风险 v0.1 的可判定子集，按市场索引（RAY-773 起）。
 *
 * 规则库加载与市场校验在 `compliance/library.ts`；本文件**不改规则内容、不新增法条**，
 * 只做三件事：
 *
 * 1. 为每个已经挂载判定器的市场声明「哪些规则可以被页面文本判定」，以及取证范围与严重程度；
 * 2. 没挂载 matcher 的市场一律进 `not_assessable`，附原因，不硬凑覆盖率；
 * 3. 已挂载的市场里没被 matcher 覆盖的规则，逐条写成「本版尚未挂载判定」的处置，
 *    不静默丢规则（`uncoveredRuleIds`）。
 *
 * 表结构与市场边界：
 * - `COMPLIANCE_MATCHERS_BY_MARKET` 是唯一入口：`MY` 用现有 17 条数组（RAY-698 验收过，
 *   顺序与内容都不动），`SG` / `AE` / `US` 各自一份；没列出的市场视为未挂载。
 * - 四个通用 check 的实现与市场无关，各国只改参数（`terms` / `trigger` / `notice` /
 *   `evidence` / `language`）。MY 的两个 check 名带市场语义（`malay_disclosure_absent`、
 *   `halal_claim_without_certificate`），新市场用对应的中性名
 *   （`language_disclosure_absent`、`claim_without_evidence`），实现是同一份。
 * - 规则 id、条文号、官方 URL、核验日期全部由该国 `rules.v0.1.json` 提供，
 *   代码里不写死任何法条；跨市场的 matcher 一律走 `ruleById(market, id)`。
 *
 * 口径（与 RAY-684 / RAY-696 / RAY-698 对齐）：
 * - `decision_level` 一律取规则库的值，代码不升级、不降级；
 * - 只有规则库标 `rule_level` 且页面上能直接看到该条规范的行为要素时才出规则级判定；
 * - `substantiation` 只写「需要证明」，`human_review` 明确标「需人工判断」。
 */

import type { Severity } from "../types.js";
import { MarketError, resolveMarket } from "../market.js";
import type { ComplianceSkipReason, DecisionLevel } from "./types.js";
import { loadLegalLibrary, myLegalLibrary, type LegalRule, type LegalRulesFile } from "./library.js";

export type { LegalRule, LegalRulesFile } from "./library.js";

/**
 * 读 MY 规则库（兼容 RAY-698 的既有调用）。RAY-754 起，市场路径由
 * `compliance/library.ts` 按 `legal/index.json` 解析，不再写死 `knowledge/legal/my`。
 */
export function loadMyRules(): LegalRulesFile {
  return myLegalLibrary().raw;
}

export function myRules(): LegalRule[] {
  return loadMyRules().rules;
}

/** 某市场的全部规则（按 `legal/index.json` 解析；未知市场由 `resolveMarket` 明确失败）。 */
export function rulesFor(marketCode: string): LegalRule[] {
  return loadLegalLibrary(resolveMarket(marketCode)).rules;
}

/**
 * 按市场取规则。跨市场的 matcher 必须走这个入口：MY 的 id 在 SG 库里查不到时
 * 直接报错，而不是悄悄拿 MY 的法条出别国报告。
 *
 * 判定器引用了规则库里没有的 id，说明「代码里的 matcher」与「数据里的规则库」版本不一致，
 * 用 `market_rules_mismatch` 明确失败（BFF 已按这个错误码提示「规则库与知识库不一致」）。
 */
export function ruleById(marketCode: string, id: string): LegalRule {
  const found = loadLegalLibrary(resolveMarket(marketCode)).byId.get(id);
  if (!found) {
    throw new MarketError(
      "market_rules_mismatch",
      `${marketCode} 的判定器引用了规则库里没有的规则：${id}（判定器与规则库版本不一致）`,
      [`规则 ${id} 不在 ${marketCode} 的 rules.v0.1.json`],
    );
  }
  return found;
}

export function rulesVersion(marketCode: string): string {
  return loadLegalLibrary(resolveMarket(marketCode)).version;
}

/** 取证范围：`panel` 只看商品主面板；`page` 允许用整页的句子行。 */
export type MatchScope = "panel" | "page";

/**
 * 声明式匹配器：一条规则怎么被页面文本触发。
 *
 * - `patterns` 覆盖规则库的 `claim_pattern`：只取 v0.1 能可靠判定的子集。
 *   被裁掉的模式（例如 `5l` 这种会被 `6.5L` 误命中的短词，或 `original`/`genuine`
 *   这种已经在别的规则里覆盖的词）在 `SAMPLE_FINDINGS.md` 里有记录。
 * - `weak` 里的模式只在与同行正则同时成立时才采纳，用来压掉 `certified`、
 *   `approved`、`japan` 这类泛词误报。
 * - `extra` 是规则库没写、但真实页面常见的写法（`-33%`），命中后仍引用同一条规则。
 */
export interface ClaimMatcherDef {
  ruleId: string;
  kind: "claim";
  scope: MatchScope;
  severity: Severity;
  patterns: string[];
  weak?: Record<string, RegExp>;
  extra?: Array<{ source: string; label: string }>;
  /** 命中行还必须满足的正则；不满足就丢。 */
  lineGate?: RegExp;
  /** 命中行出现这个就排除（例如分期月供不是诱饵价）。 */
  excludeLine?: RegExp;
  /** 命中后附加在 why 末尾的一句上下文提醒。 */
  note?: string;
}

/**
 * 结构/缺席类检查：页面「没写到」本身就是可观察事实，但只能写「页面未展示」。
 * 这类检查一定带 `reviewRequired`，因为文本可见范围不等于事实范围。
 *
 * 四个 check 的实现与市场无关，各国只改 `FormalMatcherDef` 上的参数：
 * - `limited_without_terms`：限时/限量/起价表述缺少同屏条件；
 * - `privacy_notice_absent` / `notice_disclosure_absent`：有入口但缺告知；
 * - `malay_disclosure_absent` / `language_disclosure_absent`：整页缺法定语言版本；
 * - `halal_claim_without_certificate` / `claim_without_evidence`：有声称但看不到凭据。
 *
 * 带市场名的那两个（`malay_*` / `halal_*`）是 MY 的既有口径，RAY-698 验收过，保留原名与原实现；
 * 新市场用中性名，走同一份实现，只是把语言/凭据参数换成该国要求的。
 */
export type FormalCheck =
  | "limited_without_terms"
  | "malay_disclosure_absent"
  | "language_disclosure_absent"
  | "privacy_notice_absent"
  | "notice_disclosure_absent"
  | "halal_claim_without_certificate"
  | "claim_without_evidence"
  | "government_approval_claim";

/** 法定语言披露的参数：标记词与语言名（进 finding 文案）。 */
export interface LanguageDisclosure {
  markers: RegExp;
  label: string;
  /** 至少命中多少个标记词才算「页面有该语言版本」，默认 3。 */
  minMarkers?: number;
}

export interface FormalMatcherDef {
  ruleId: string;
  kind: "formal";
  severity: Severity;
  check: FormalCheck;
  /** 触发词（限量、halal、政府批准等）；`*_disclosure_absent` 用各自的数据。 */
  patterns: string[];
  /**
   * 「同屏已经写清条件」的判定正则。缺省用内置的数量/期间/日期集（MY-ADV-09 口径）；
   * 其他市场按本国规则换成「购买条件 / 最低消费 / 活动期间」等。
   */
  terms?: RegExp;
  /** 触发「本应告知」的入口行正则；缺省用订阅/登录/结账/联系表单等数据收集入口。 */
  trigger?: RegExp;
  /** 页面已有的告知正则；缺省用隐私告知（privacy policy / notice / statement）。 */
  notice?: RegExp;
  /**
   * 告知必须与触发词**同一行**（例如「只写英制单位而不给公制」要求同一处对照）。
   * 缺省 false：整页任一处出现告知即视为已披露。
   */
  lineScoped?: boolean;
  /**
   * 取证范围取整页句子行（而不是优先商品主面板），并要求证据行是句子行。
   * 非 MY 的缺席/凭据类检查都打开：保修承诺、订阅入口、优惠条件常写在 hero 与页脚，
   * 只扫商品面板会漏。MY 的 matcher 不设此项，保持 RAY-698 验收过的口径。
   */
  strictPage?: boolean;
  /** 语言披露检查的参数；缺省用 MY 的马来语口径。 */
  language?: LanguageDisclosure;
  /** 应能看到、但页面看不到的凭据正则；缺省用 MY 的 halal 证书编号。 */
  evidence?: RegExp;
  /** 缺凭据时进 finding 的说明，例如「可核对的证书编号」。 */
  missingEvidence?: string;
  /** 命中后附加在 why 末尾的一句上下文提醒。 */
  note?: string;
}

export type ComplianceMatcher = ClaimMatcherDef | FormalMatcherDef;

const SEVERITY_BY_LEVEL: Record<DecisionLevel, Severity> = {
  rule_level: "medium",
  substantiation: "medium",
  human_review: "low",
};

/**
 * v0.1 可判定子集（17 条）。每条都写明为什么取这些模式：
 * 模式来自规则库原文，裁剪只为去掉必然误报的泛词，不新增法条。
 */
export const COMPLIANCE_MATCHERS: ComplianceMatcher[] = [
  /* ---------------------------------------------- 宣传声明：绝对化 / 需要证明 */
  {
    ruleId: "MY-ADV-01",
    kind: "claim",
    scope: "page",
    severity: SEVERITY_BY_LEVEL.human_review,
    // 只取绝对化/最高级这一类；original/authentic/genuine 归到 MY-ADV-02 的材质与
    // 来源判定，避免同一句被三张卡重复展示。
    patterns: ["100%", "guaranteed", "safest", "best in", "no.1", "nomor satu", "paling selamat"],
    // 测试条件里的百分比（电池充到 100%、音量 50%、湿度 90%）不是宣传声明。
    excludeLine: /\b(?:charged|charge|volume|adjusted|humidity|temperature|room\s+temp|tested\s+(?:with|under|at)|battery)\b/i,
    note: "是否构成误导取决于整体语境，不只看单个词。",
  },
  {
    ruleId: "MY-ADV-02",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "stainless steel",
      "food grade",
      "grade a",
      "premium quality",
      "heavy duty",
      "ceramic",
      "non-stick",
      "antibacterial",
      "304",
      "316",
      "100% cotton",
    ],
    // 304/316 只有出现在不锈钢语境里才是材质声明，否则可能是型号或容量。
    weak: { "304": /\bstainless\b|\bsteel\b/i, "316": /\bstainless\b|\bsteel\b/i },
  },
  {
    ruleId: "MY-ADV-04",
    kind: "claim",
    scope: "page",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "sirim certified",
      "sirim",
      "certified",
      "approved",
      "recommended by",
      "doctor recommended",
      "clinically proven",
      "lab tested",
      "tested",
      "kills 99.9%",
      "sterilize",
      "sterilise",
      "award winning",
      "no.1 selling",
    ],
    // 泛词必须带认证机构或「by」结构，否则「approved」几乎必然误报。
    weak: {
      sirim: /\bsirim\b/i,
      certified: /\b(?:sirim|mcmc|fda|ce|sgs|tuv|intertek|jakim|kkm|moh)\b|by\b/i,
      approved: /\b(?:sirim|mcmc|fda|ce|sgs|tuv|jakim|kkm|moh|government|ministry)\b|by\b/i,
      tested: /\b(?:lab|sgs|tuv|intertek|sirim|independently)\b|by\b/i,
    },
  },
  {
    ruleId: "MY-ADV-05",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "made in",
      "imported from",
      "designed in",
      "assembled in",
      "country of origin",
      "origin",
      "japan",
      "germany",
      "korea",
    ],
    // 国名单独出现（「Japanese brand」）不构成原产地声明，必须带产地动词。
    weak: {
      japan: /\b(?:made|manufactured|designed|assembled|imported|produced)\b|\bfrom\b/i,
      germany: /\b(?:made|manufactured|designed|assembled|imported|produced)\b|\bfrom\b/i,
      korea: /\b(?:made|manufactured|designed|assembled|imported|produced)\b|\bfrom\b/i,
      origin: /\bcountry\s+of\s+origin\b/i,
    },
  },
  {
    ruleId: "MY-ADV-06",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "was rm",
      "was price",
      "usual price",
      "normal price",
      "up rm",
      "original price",
      "save rm",
      "% off",
      "discount",
      "lowest price",
      "cheapest",
      "half price",
    ],
    // 真实页面用「-33%」写折扣，规则库的 pattern 没覆盖，补一条正则。
    extra: [{ source: "-\\s?\\d{1,2}\\s?%", label: "-33% 形式的折扣徽标" }],
    weak: { discount: /\d|%|\brm\b/i },
    // 「Save RM0.00」这类零折扣不是价格指示。
    excludeLine: /\bsave\s+(?:rm|myr)?\s*0(?:\.00)?\b/i,
  },
  {
    ruleId: "MY-ADV-11",
    kind: "claim",
    scope: "panel",
    severity: "medium",
    patterns: ["safe", "safety", "overheat", "overheat protection", "fireproof", "flame retardant", "child lock"],
    note: "安全类表述是否构成不合理的安全承诺要看整体呈现，规则库把这条定为需人工判断。",
  },
  {
    ruleId: "MY-ADV-13",
    kind: "claim",
    scope: "page",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "tested by",
      "lab tested",
      "sgs",
      "tuv",
      "intertek",
      "certified by",
      "approved by",
      "ce marked",
      "ce certified",
      "fda approved",
      "sirim tested",
      "type approved",
    ],
    // 「approved by our customer service team」是退货流程，不是认证声明。
    excludeLine: /\b(?:returns?|refund|order|cancel|payment|delivery|shipping|warranty\s+claim)\b/i,
  },
  {
    ruleId: "MY-ADV-14",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "recommended retail price",
      "rrp",
      "was rm",
      "less than",
      "cheaper than",
      "other sellers",
      "market price",
      "harga pasaran",
    ],
    weak: { rrp: /\brm\b|\d/i, "less than": /\brm\b|\d/i, "cheaper than": /\brm\b|\d/i },
  },
  {
    ruleId: "MY-APP-03",
    kind: "claim",
    scope: "page",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: [
      "test report",
      "certificate of conformity",
      "coc",
      "safety tested",
      "iec 60335",
      "ms iec",
      "type test",
    ],
    weak: { coc: /\bcertificate\s+of\s+conformity\b|\bcoc\s*(?:no|number|#)/i },
  },
  {
    ruleId: "MY-FOOD-02",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.substantiation,
    patterns: ["ceramic", "ceramic coating", "ceramic inner pot", "lead free", "cadmium free", "food grade"],
  },

  /* ---------------------------------------------- 可得性 / 限量 / 赠品 */
  {
    ruleId: "MY-ADV-07",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.rule_level,
    patterns: ["from rm", "starting from", "as low as", "mulai rm", "serendah", "while stocks last", "limited units", "first come first served"],
    // 「From RM49.92 / month」是分期月供，不是诱饵价；同一行出现月供就排除。
    excludeLine: /\/\s*(?:month|mo)\b|per\s+month|\bx\s*\d{1,2}\b|installment|instalment/i,
    note: "分期月供（/month、x 12）不按诱饵价处理。",
  },
  {
    ruleId: "MY-ADV-08",
    kind: "claim",
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.rule_level,
    patterns: ["free gift", "gift", "hadiah", "percuma", "buy 1 free 1", "cashback", "voucher"],
    // 赔偿、退换语境里的 voucher 不是「赠品要约」。
    excludeLine: /\b(?:compensat|refund|replace|damaged|return|warranty\s+claim)\w*\b/i,
  },
  {
    ruleId: "MY-ADV-09",
    kind: "formal",
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "limited_without_terms",
    patterns: ["limited edition", "limited stock", "limited units", "only 100 units", "last chance", "edisi terhad", "stok terhad"],
  },
  {
    ruleId: "MY-ADV-16",
    kind: "claim",
    scope: "page",
    severity: "high",
    patterns: [
      "government approved",
      "kkm approved",
      "moh approved",
      "jakim approved",
      "ministry approved",
      "who approved",
      "eu approved",
    ],
  },

  /* ---------------------------------------------- 认证 / Halal / 隐私 / 语言 */
  {
    ruleId: "MY-HALAL-01",
    kind: "formal",
    severity: "high",
    check: "halal_claim_without_certificate",
    patterns: ["halal", "清真", "halal certified", "100% halal", "muslim friendly", "mesra muslim", "no pork", "no lard"],
  },
  {
    ruleId: "MY-PRIV-01",
    kind: "formal",
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "privacy_notice_absent",
    patterns: [],
  },
  {
    ruleId: "MY-ECOM-06",
    kind: "formal",
    severity: "high",
    check: "malay_disclosure_absent",
    patterns: [],
  },
];

/** 为什么某批规则 v0.1 不判定：能力边界，不是「合规」。 */
export const COMPLIANCE_SKIP_REASONS: ComplianceSkipReason[] = [
  {
    ruleIds: ["MY-ADV-03", "MY-ECOM-05", "MY-ADV-12"],
    reason: "要求先确认陈述是假的（翻新当新机、假注册号、虚假商品说明）；页面文本无法自证真假，转人工核实。",
  },
  {
    ruleIds: ["MY-ADV-10", "MY-APP-01", "MY-APP-02", "MY-APP-04", "MY-3C-01", "MY-3C-02", "MY-3C-03", "MY-3C-04", "MY-3C-05", "MY-3C-06", "MY-ECOM-04", "MY-HALAL-02"],
    reason: "电气/通讯设备的认证状态要用证书编号到 ST / MCMC / SIRIM 数据库核对，页面缺失不等于未认证；v0.1 只记录认证展示（见市场就绪度 MY-MR-08）。",
  },
  {
    ruleIds: ["MY-ECOM-01", "MY-ECOM-02", "MY-ECOM-03", "MY-ECOM-07", "MY-ECOM-08", "MY-ADV-15", "MY-HALAL-03", "MY-FOOD-03", "MY-PRIV-02", "MY-PRIV-03"],
    reason: "属披露义务或主体义务（地址、运费、退换、平台责任、法务联系人），支付/物流/退换已由市场就绪度覆盖，其余需主体资料，不在单页文本可判定范围。",
  },
  {
    ruleIds: ["MY-ADV-17", "MY-ADV-18", "MY-FOOD-01"],
    reason: "与已判定规则指向同一表述或需要额外事实（举证责任在被告的虚假陈述、客服口头说明、食品接触迁移检测），为避免重复与越界，v0.1 不单独出 finding。",
  },
];

/* ================================================================= 非 MY 市场 */

/**
 * SG 的可判定子集（RAY-773）。只挂 `rule_level` 里能用四个通用 check 表达、且**单页
 * 文本就能证实**的条目：
 *
 * - `SG-PRIV-01`（PDPA s.20(1)）→ `notice_disclosure_absent`：有收集入口但整页没有隐私告知；
 * - `SG-LANG-01`（SCA 2007 para 2(4)）→ 同一个 check：有订阅入口但没有退订说明；
 * - `SG-MET-01`（WMA s.18(1)(d), (2)）→ 同一个 check（`lineScoped`）：只写英制单位、同一处没有公制对照；
 * - `SG-PRICE-01`（GST Regs reg.77(1)）→ 同一个 check：标价写 excl. GST 却没给出含税价。
 *
 * 不挂 SG-ADV-06/08/09/11/12 与 SG-APP-*：它们要先证明商家「知道或应知」陈述为假，
 * 或要用注册号到 CPSO / IMDA 数据库核对，单页文本不能自证，理由见 SKIP。
 * 也不挂 SG-ADV-10（社论形式广告须标注）：页面上的获奖/媒体报道字样不是「以社论形式呈现的
 * 广告」，用四个 check 表达不出来，这类判断留给人工。
 */
const SG_MATCHERS: ComplianceMatcher[] = [
  {
    ruleId: "SG-PRIV-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:newsletter|subscribe|subscription|sign\s*up|register|contact\s+form|checkout|create\s+account|my\s+account|log\s*in|whatsapp)\b/i,
    notice: /\bprivacy\s+(?:policy|notice|statement)\b|\bpersonal\s+data\s+(?:notice|policy)\b|\bpdpa\b/i,
    missingEvidence: "收集个人数据的目的与隐私告知",
  },
  {
    ruleId: "SG-LANG-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:newsletter|subscribe|subscription|marketing\s+(?:email|message)s?|promotional\s+(?:email|message)s?)\b/i,
    notice: /\bunsubscribe\b|\bopt[\s-]?out\b|\bmanage\s+(?:your\s+)?preferences\b|\bstop\s+receiving\b/i,
    missingEvidence: "退订方式（unsubscribe / opt out）",
  },
  {
    ruleId: "SG-MET-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // 英制单位出现时，同一处必须同时给出公制数值（WMA s.18 要求公制为主、英制为附注）。
    trigger: /\b\d+(?:\.\d+)?\s*-?\s*(?:inch(?:es)?|in\.|feet|ft\.?|pounds?|lbs?|ounces?|oz\.?|quarts?|qt\.?|gallons?|gal\.?)\b/i,
    notice: /\b\d+(?:\.\d+)?\s*-?\s*(?:mm|cm|m|metres?|meters?|kg|kilograms?|g|grams?|ml|millilit(?:re|er)s?|lit(?:re|er)s?|l|sq\.?\s*(?:m|cm))\b/i,
    lineScoped: true,
    missingEvidence: "与英制数值并列的公制数值",
  },
  {
    ruleId: "SG-PRICE-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:before|excl\.?|excluding|exclusive\s+of|w\/o|without|not\s+includ\w*)\s*gst\b|\bgst\s+(?:not\s+included|excluded|extra)\b|\bpre-?gst\b|\+\s*gst\b/i,
    notice: /\b(?:incl\.?|inclusive\s+of|including|with)\s*gst\b|\bgst\s+(?:included|inclusive)\b/i,
    missingEvidence: "含 GST 的实际售价",
  },
];

/**
 * AE 的可判定子集（RAY-773）。四条各用四个通用 check 中的一个，都只看单页能证实的事实：
 *
 * - `AE-ADV-07`（CPL 2020 Art. 26）→ `language_disclosure_absent`：整页缺阿拉伯语版本；
 * - `AE-PRV-01`（PDPL 2021 Art. 13(2)）→ `notice_disclosure_absent`：有收集入口但缺处理目的告知；
 * - `AE-ECOM-03`（E-Commerce Law 2023 Art. 6(4)）→ 同一个 check：有订阅入口但看不到退订选择；
 * - `AE-ADV-12`（CPL ER 2023 Art. 11）→ `claim_without_evidence`：宣传保修但看不到书面保修文件。
 *
 * 不挂 AE-ADV-05/06/13/14/17（促销需事前许可、纯罚则条文）、AE-LBL-01/03（包装标签义务）、
 * AE-ADV-08/09（主体信息与商品标价）等：单页文本要么看不到，要么需要主体资料，理由见 SKIP。
 */
const AE_MATCHERS: ComplianceMatcher[] = [
  {
    ruleId: "AE-ADV-07",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "language_disclosure_absent",
    patterns: [],
    language: { markers: /[\u0600-\u06ff]+/g, label: "阿拉伯语" },
  },
  {
    ruleId: "AE-PRV-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:newsletter|subscribe|subscription|sign\s*up|register|contact\s+form|checkout|create\s+account|my\s+account|log\s*in|whatsapp)\b/i,
    notice: /\bprivacy\s+(?:policy|notice|statement)\b|\bpersonal\s+data\s+(?:notice|policy)\b|\bpdpl\b/i,
    missingEvidence: "处理个人数据的目的与隐私告知",
  },
  {
    ruleId: "AE-ECOM-03",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:newsletter|subscribe|subscription|marketing\s+(?:messages?|emails?)|promotional\s+(?:messages?|emails?)|sms\s+updates?)\b/i,
    notice: /\bunsubscribe\b|\bopt[\s-]?out\b|\bstop\s+receiving\b|\bmanage\s+(?:your\s+)?preferences\b|\bإلغاء\b/i,
    missingEvidence: "接收/拒绝促销信息的选择（退订方式）",
  },
  {
    ruleId: "AE-ADV-12",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    patterns: ["warranty", "guarantee", "warranty period", "years warranty"],
    evidence:
      /\bwarranty\s+(?:policy|terms|document|text|card|statement)\b|\bterms\s+(?:and\s+)?conditions\s+of\s+(?:the\s+)?warranty\b|\bwritten\s+warranty\b|\bwarranty\.pdf\b/i,
    missingEvidence: "书面保修文件或条款链接",
  },
];

/**
 * US 的可判定子集（RAY-773）。五条只用四个通用 check，且都只看单页能证实的事实：
 *
 * - `US-WAR-01`（Magnuson-Moss §103）→ `claim_without_evidence`：提保修却没指定 full / limited；
 * - `US-WAR-02`（16 CFR 702.3(a)）→ 同一个 check：提保修但售前看不到保修全文或链接；
 * - `US-PRI-01`（CAN-SPAM §7704(a)(3)(A)）→ `notice_disclosure_absent`：有订阅入口但没有退订机制；
 * - `US-PRI-02`（CAN-SPAM §7704(a)(5)(A)(iii)）→ 同一个 check：有订阅入口但看不到发件人实体地址；
 * - `US-ADV-06`（Free Guide §251.1(c)）→ `limited_without_terms`：写 free gift / BOGO 却不写取得条件。
 *
 * 不挂 US-ADV-03/12/13（真假评论、激励评论：要核对评论来源与激励名单）、US-LBL-08/09
 * （EnergyGuide 标签要看到图片）、US-CERT-02/03（缺陷报告与销售禁令：需执法事实）。
 */
const US_MATCHERS: ComplianceMatcher[] = [
  {
    ruleId: "US-WAR-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    patterns: ["warranty", "guarantee", "lifetime warranty", "limited warranty", "full warranty"],
    evidence: /\b(?:full|limited)\s+(?:\d+[-\s]?(?:year|yr)s?\s+)?warranty\b|\bfull\s+warranty\b|\blimited\s+warranty\b/i,
    missingEvidence: "full / limited warranty 的法定指定",
  },
  {
    ruleId: "US-WAR-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    patterns: ["warranty", "guarantee"],
    evidence:
      /\bwarranty\s+(?:policy|terms|document|text|details|information)\b|\b(?:view|read|see|download)\s+(?:the\s+)?(?:full\s+)?warranty\b|\bwarranty\.pdf\b/i,
    missingEvidence: "售前可查阅的保修全文或链接",
  },
  {
    ruleId: "US-PRI-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:newsletter|subscribe|subscription|marketing\s+emails?|promotional\s+emails?|email\s+updates?)\b/i,
    notice: /\bunsubscribe\b|\bopt[\s-]?out\b|\bmanage\s+(?:your\s+)?(?:email\s+)?preferences\b|\bemail\s+preferences\b/i,
    missingEvidence: "退订机制（unsubscribe / opt out / email preferences）",
  },
  {
    ruleId: "US-PRI-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    trigger: /\b(?:newsletter|subscribe|subscription|marketing\s+emails?|promotional\s+emails?)\b/i,
    notice:
      /\b(?:postal|mailing)\s+address\b|\bP\.?\s?O\.?\s*Box\b|\b\d{1,6}\s+[A-Za-z][A-Za-z .'-]+\s+(?:Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Court|Ct\.?)\b/i,
    missingEvidence: "发件人的有效实体邮政地址",
  },
  {
    ruleId: "US-ADV-06",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "limited_without_terms",
    patterns: ["buy one get one", "bogo", "2-for-1", "gift with purchase", "free gift", "free with purchase"],
    // 「free」类要约必须当场写清取得条件：购买门槛、限购、期限都算。
    terms:
      /\bwith\s+(?:any\s+|a\s+)?(?:purchase|order)\b|\bwhen\s+you\s+(?:buy|spend|order)\b|\bmin(?:imum)?\.?\s+(?:spend|purchase|order)\b|\borders?\s+(?:over|above|of|from)\s*\$?\d|\bon\s+orders?\s*\$?\d|\b\$\d[\d,.]*\s*\+|\bwhile\s+(?:stocks|supplies)\s+last\b|\buntil\s+(?:\d|end\s+of)\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i,
  },
];

/**
 * 按市场索引的可判定子集（RAY-773 起）。没列出的市场视为「未挂载判定器」，
 * 由 `analyze.ts` 的 `notAssessedAnalysis` 显式降级，绝不借用 MY 的法条。
 */
export const COMPLIANCE_MATCHERS_BY_MARKET: Record<string, ComplianceMatcher[]> = {
  MY: COMPLIANCE_MATCHERS,
  SG: SG_MATCHERS,
  AE: AE_MATCHERS,
  US: US_MATCHERS,
};

/** 各国未挂载判定的规则与原因。表里没有的市场只加载规则库、不判定。 */
export const COMPLIANCE_SKIP_REASONS_BY_MARKET: Record<string, ComplianceSkipReason[]> = {
  MY: COMPLIANCE_SKIP_REASONS,
  SG: [
    {
      ruleIds: ["SG-ADV-02", "SG-ADV-03", "SG-ADV-04", "SG-ADV-07", "SG-APP-03", "SG-APP-10", "SG-FOOD-01", "SG-FOOD-02", "SG-MET-02", "SG-MET-03"],
      reason: "只写「需要证明」的条目（价格比较基准、认证与测试依据、食品接触材料检测报告）；报告只记需出示何种证据，不判真假。",
    },
    {
      ruleIds: ["SG-ADV-01", "SG-PRIV-05", "SG-PRIV-07"],
      reason: "整体语境与误导性判断（绝对化用语、隐私告知是否足够、营销同意是否有效），需人工按上下文判断，代码不代下结论。",
    },
    {
      ruleIds: ["SG-ADV-05", "SG-ADV-06", "SG-ADV-08", "SG-ADV-09", "SG-ADV-11", "SG-ADV-12"],
      reason: "要求先证明商家「知道或应知」陈述不实（翻新当新机、可得性、赠品是否兑现、折扣期是否虚设、商品说明是否虚假、所称标准是否不存在），单页文本无法自证，转人工核实。",
    },
    {
      ruleIds: ["SG-ADV-10"],
      reason: "社论/报道形式的广告须标注为广告：页面上的获奖、媒体提及字样不等于「以客观报道形式呈现的广告」，是否构成须看内容形态与投放方式，转人工判断。",
    },
    {
      ruleIds: ["SG-PRICE-02", "SG-APP-01", "SG-APP-02", "SG-APP-04", "SG-APP-05", "SG-APP-06", "SG-APP-07", "SG-APP-08", "SG-APP-09", "SG-APP-11"],
      reason: "CPSR / Dealers Regs 的注册与 Safety Mark / IMDA 标签状态要用注册号到 CPSO、IMDA 数据库核对；页面缺失不等于未注册，本版只在市场就绪度记录认证展示。",
    },
    {
      ruleIds: ["SG-FOOD-03", "SG-PRIV-02", "SG-PRIV-03", "SG-PRIV-04", "SG-PRIV-06", "SG-PRIV-08", "SG-MKT-01", "SG-MKT-02"],
      reason: "属披露义务或主体义务（赠品器具符合性、DPO 联系方式、同意有效性、投诉流程、短信发送者身份、广告主题标注），单页文本要么看不到，要么需主体资料，不在本版可判定范围。",
    },
  ],
  AE: [
    {
      ruleIds: ["AE-ADV-03", "AE-ADV-18", "AE-ADV-19", "AE-ECOM-02"],
      reason: "只写「需要证明」的条目（奖项证书、原产地、性能与功效声称、原装正品）；报告只记需出示何种依据，不判真假。",
    },
    {
      ruleIds: ["AE-ADV-01", "AE-ADV-02", "AE-ADV-04", "AE-ADV-11", "AE-ADV-16"],
      reason: "整体语境与误导性判断（绝对化用语、比较价是否真实、格式条款是否损害消费者、内容标准），需人工按上下文判断。",
    },
    {
      ruleIds: ["AE-ADV-05", "AE-ADV-06", "AE-ADV-10", "AE-ADV-15", "AE-LBL-02", "AE-LBL-04", "AE-LBL-06", "AE-ECOM-04", "AE-PRV-02", "AE-PRV-04"],
      reason: "本版只挂了该国 4 条最稳的判定；这几条虽有可观察要素（促销许可、刷卡手续费、广告标注、警示语、箱内清单、TDRA 登记、执照与地址、同意方式、数据转售），但都需要同页上下文或主体资料才能下判断，留到下一阶段逐条补 matcher。",
    },
    {
      ruleIds: ["AE-ADV-08", "AE-ADV-09", "AE-ADV-13", "AE-ADV-14", "AE-ADV-17", "AE-LBL-01", "AE-LBL-03", "AE-LBL-05", "AE-ECOM-01", "AE-PRV-03"],
      reason: "主体信息、商品标价与包装标签义务，以及纯罚则条文（Art. 29 / 30 / 23）：要么需要商家主体资料与实物包装，要么只是罚则区间，单页文本不构成可判定事实。",
    },
  ],
  US: [
    {
      ruleIds: ["US-ADV-04", "US-ADV-07", "US-ADV-08", "US-ADV-09", "US-ADV-10", "US-CERT-04"],
      reason: "只写「需要证明」的条目（代表性证据、比较价基准、Made in USA、环保与「不含某物质」声称、吹风机浸水保护）；报告只记需出示何种证据，不判真假。",
    },
    {
      ruleIds: ["US-ADV-01", "US-ADV-11", "US-LBL-01", "US-LBL-02", "US-LBL-03", "US-LBL-04", "US-LBL-05", "US-LBL-06", "US-LBL-07", "US-CERT-01", "US-CERT-05", "US-CERT-06", "US-CERT-07", "US-CERT-08", "US-PRI-03"],
      reason: "整体印象判断、包装标签与 FCC / GCC 合规声明：要看实物包装、说明书与设备铭牌，单页商品页看不到，需人工或实物核对。",
    },
    {
      ruleIds: ["US-ADV-03", "US-ADV-05", "US-ADV-12", "US-ADV-13"],
      reason: "评论真伪与激励评论要核对评论来源、账号与激励名单；达人/联盟内容要看到帖子本身与披露位置。单页商品页的页脚链接标签不能证明利益关系，转人工核实。",
    },
    {
      ruleIds: ["US-LBL-08", "US-LBL-09"],
      reason: "EnergyGuide 标签要看到图片本身（16 CFR 305 要求展示可读的标签图片），文本里出现 ENERGY STAR 之类的词不能代替标签，也不据此判断未合规。",
    },
    {
      ruleIds: ["US-ADV-02", "US-CERT-02", "US-CERT-03"],
      reason: "免责声明的显著性要看字号、位置与停留时长；缺陷报告义务与销售禁令要执法事实。页面文本本身不能证明违反，留到需要看版式或外部事实时再判。",
    },
  ],
};

/** 某市场的 matcher 列表；未挂载的市场返回空数组（调用方据此降级）。 */
export function matchersFor(marketCode: string): ComplianceMatcher[] {
  return COMPLIANCE_MATCHERS_BY_MARKET[marketCode.trim().toUpperCase()] ?? [];
}

/** 该市场是否已挂载判定器。早退条件只认这个，不认市场代码本身。 */
export function hasMatchersFor(marketCode: string): boolean {
  return matchersFor(marketCode).length > 0;
}

/** 已挂载判定器的市场（按注册顺序），用于报告里的能力边界说明。 */
export function assessedMarkets(): string[] {
  return Object.keys(COMPLIANCE_MATCHERS_BY_MARKET).filter((code) => hasMatchersFor(code));
}

export function skipReasonsFor(marketCode: string): ComplianceSkipReason[] {
  return COMPLIANCE_SKIP_REASONS_BY_MARKET[marketCode.trim().toUpperCase()] ?? [];
}

export function matcherById(marketCode: string, id: string): ComplianceMatcher | undefined {
  return matchersFor(marketCode).find((matcher) => matcher.ruleId === id);
}

/**
 * 规则库里既没有 matcher、也没有写在跳过清单里的规则：静默丢规则的兜底检查。
 * 只对已挂载判定器的市场有意义——没挂 matcher 的市场整库进 `not_assessable`。
 */
export function uncoveredRuleIds(marketCode = "MY"): string[] {
  const covered = new Set<string>(matchersFor(marketCode).map((matcher) => matcher.ruleId));
  for (const reason of skipReasonsFor(marketCode)) {
    for (const id of reason.ruleIds) covered.add(id);
  }
  return rulesFor(marketCode)
    .map((rule) => rule.id)
    .filter((id) => !covered.has(id));
}

/** 每条跳过原因覆盖的规则必须在规则库里真实存在，避免拼错 id 静默丢规则。 */
export function validateSkipReasons(marketCode = "MY"): void {
  const ids = new Set(rulesFor(marketCode).map((rule) => rule.id));
  for (const reason of skipReasonsFor(marketCode)) {
    for (const id of reason.ruleIds) {
      if (!ids.has(id)) throw new Error(`${marketCode} 跳过清单里的规则不存在：${id}`);
    }
  }
}
