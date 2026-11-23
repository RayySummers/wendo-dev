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
 *
 * ## 各国判定子集的口径（RAY-774）
 *
 * 三个市场都只挂 `rule_level`，且只挂「单页可见文本能直接定位行为要素」的条目。分三类：
 * A 缺席类（页面该写没写：告知、条件、凭据、执照）、B 限定类（限量/免费措辞缺同屏条件）、
 * C 表述类（页面作出了该条规范直接约束的说明：符合性标示、真伪说明、激励换评论）。
 *
 * - **SG**：PDPA 2012 的两项页面可见义务（s.20(1) 目的告知、s.11(5) 公开数据保护联系人）、
 *   GST reg.77(1) 含税标价、WMA 1975 s.18 公制对照、CPFTA 2003 附表 item 7 的可得性限制、
 *   CPTDSRA 1975 s.4 商品说明与 s.5(b) 符合性标示。
 *   不覆盖 CPSR / Dealers Regs / CGSR 的注册与 Safety Mark 状态（要用注册号到 CPSO、IMDA
 *   数据库核对）、需要先证明陈述为假的附表 item 5/19/20、罚则条文，以及需要主体资料或
 *   实物包装的披露义务。
 * - **AE**：CPL 2020 Art. 26 阿拉伯语、PDPL 2021 Art. 13(2) 处理目的告知与 Art. 6(1)(b)-(c)
 *   同意的作出与撤回、E-Commerce Law 2023 Art. 5(5) 费用与条款公开 / Art. 6(4) 营销选择 /
 *   Art. 6(9) 交易者执照与地址、CPL ER 2023 Art. 11 保修书面文件。
 *   不覆盖促销事前许可（Art. 18）、折扣差价告知（Art. 31）、包装标签与箱内清单（Art. 3 / 4）、
 *   TDRA 型号批准，以及纯罚则条文（Art. 23 / 29 / 30）：要么需要主体资料或实物包装，
 *   要么是执法事实，单页文本无法自证。
 * - **US**：Magnuson-Moss §103 与 16 CFR 702.3 的书面保修指定与售前可查阅、CAN-SPAM
 *   §7704(a)(3)(A) / (a)(5)(A)(iii) 的退订机制与实体地址、16 CFR 251.1(c) 的免费要约条件、
 *   16 CFR 465.4 的激励换评论。
 *   不覆盖评论真伪（§465.2）、背书关系披露（§255.5）、EnergyGuide 标签（要看到图片）、
 *   CPSC 缺陷报告与销售禁令（要执法事实）：都要外部事实或版式，单页文本不能自证。
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
  /** 改写建议；缺省按判定层级用通用文案。 */
  fix?: string;
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
  /**
   * 页脚出现「Terms of Use / Privacy Center / PDPA」这类法务入口时，是否算作「已告知」。
   *
   * 只对**隐私与目的告知**类检查成立：不同法域对隐私告知的措辞不同，看到法务入口就判缺席
   * 会误伤（RAY-773 的口径，缺省 true）。标价（GST）、退订方式、发件人地址、执照与运费条款
   * 这些检查不能被一个 Terms 链接代替，必须显式设成 `false`。
   */
  legalLinkFallback?: boolean;
  /**
   * 触发词可以出现在非句子行上。
   *
   * 缺省 false：触发词必须是句子行，免得把页脚导航标签（`Warranty`、`Affiliates`）当成入口。
   * 但购买按钮（`Add to cart` / `Buy now`）本身就是 2–3 个词的短行，过不了句子行门槛，
   * 需要它的检查（E-Commerce Law Art. 5(5) / 6(9)）必须打开这一项。
   */
  triggerAnyLine?: boolean;
  /** 语言披露检查的参数；缺省用 MY 的马来语口径。 */
  language?: LanguageDisclosure;
  /** 应能看到、但页面看不到的凭据正则；缺省用 MY 的 halal 证书编号。 */
  evidence?: RegExp;
  /** 缺凭据时进 finding 的说明，例如「可核对的证书编号」。 */
  missingEvidence?: string;
  /** 命中后附加在 why 末尾的一句上下文提醒。 */
  note?: string;
  /** 改写建议；缺省按 check 类型用通用文案。 */
  fix?: string;
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
 * SG 的可判定子集（RAY-774）。七条全部是 `rule_level`，口径见文件头「各国判定子集的口径」。
 *
 * A 缺席类：
 * - `SG-PRIV-01`（PDPA 2012 s.20(1)）→ `notice_disclosure_absent`：页面上有会收集个人数据的
 *   入口（订阅、注册、联系表单、结账、登录），但整页看不到收集/使用目的与隐私告知；
 * - `SG-PRIV-02`（PDPA 2012 s.11(3)-(5)）→ 同一个 check，但 `legalLinkFallback: false`：
 *   同样的入口在，整页却找不到数据保护联系人——s.11(5) 要求把指定人员的业务联系方式向公众
 *   公开，页脚一个 Privacy Policy 链接代替不了公开联系人；
 * - `SG-MET-01`（WMA 1975 s.18(1)(d), (2)）→ 同一个 check 且 `lineScoped`：英制数值出现时，
 *   同一处必须并列公制数值。s.18(2) 还要求英制数字与字号不大于公制，文本判不了字号，
 *   这里只判「有没有并列」；
 * - `SG-PRICE-01`（GST Regs reg.77(1)）→ 同一个 check：页面把价格写成 before / excl. GST，
 *   却整页没有含 GST 的售价。`legalLinkFallback: false`，否则页脚一个 Terms 链接就会盖掉它。
 *
 * B 限定类：
 * - `SG-ADV-06`（CPFTA 2003 附表 item 7）→ `limited_without_terms`：页面用「while stocks last」
 *   「limited time」这类表示商品在特定期间/数量/价格下可得，但同一屏没写清数量上限、截止日期、
 *   每人限购或最低消费。item 7 的免责条件就是「清楚说明限制」，写不出限制的可得性表示正是
 *   该条针对的形态。
 *
 * C 表述类（只记录「页面作出了该条直接约束的说明」，不判真假）：
 * - `SG-ADV-12`（CPTDSRA 1975 s.5(b)）→ `claim`：页面作出 Safety Mark / IEC / ISO / UL /
 *   「certified」「complies with」这类符合性标示。s.5(b) 把「不存在的规定或批准」视为虚假
 *   商品说明，所以标示必须能对上具体的标准编号与发证机构；
 * - `SG-ADV-11`（CPTDSRA 1975 s.4）→ `claim`：页面作出真伪类商品说明（genuine / authentic /
 *   original / grade A / handmade / imported from）。商品说明须真实，本条只记录说明存在。
 *
 * 不挂 SG-LANG-01 / SG-MKT-01 / SG-MKT-02：SCA 2007 的退订声明与 <ADV> 标注义务附着在
 * 「已经发出的批量商业电子讯息」上，商品页本身不能证明讯息是否合规，按页判定会误伤正常站点。
 * 不挂 SG-APP-*：CPSR / Dealers Regs / CGSR 的注册与 Safety Mark 状态要用注册号到 CPSO、
 * IMDA 数据库核对。附表 item 5/19/20（翻新当新机、赠品不兑现、虚设折扣期）要先证明商家
 * 「知道或应知」，SG-ADV-10（社论形式广告）要看内容形态与投放方式——都留给人工。
 */
const SG_MATCHERS: ComplianceMatcher[] = [
  {
    ruleId: "SG-PRIV-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // PDPA s.20(1)：收集前就要告知收集、使用或披露的目的，并给出能回答相关问题的联系人。
    // 触发点取「会收集个人数据的入口」，不按「隐私政策」四个字判。
    trigger:
      /\b(?:newsletter|subscribe|subscription|sign\s*up|register|registration|contact\s+form|enquir(?:y|ies)|checkout|create\s+account|my\s+account|log\s*in|whatsapp)\b/i,
    notice:
      /\bprivacy\s+(?:policy|notice|statement)\b|\bpersonal\s+data\s+(?:notice|policy)\b|\bpdpa\b|\bdata\s+protection\s+(?:policy|notice)\b/i,
    missingEvidence: "收集个人数据的目的与隐私告知（PDPA s.20(1)）",
    fix: "在收集入口旁给出 s.20(1) 要的三件事：收集/使用/披露的目的、业务联系人、以及获取完整告知的入口（链到隐私政策即可）。",
  },
  {
    ruleId: "SG-PRIV-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // PDPA s.11(3)-(5)：须指定负责人，并把至少一名被指定/授权人员的业务联系方式向公众公开。
    // 与 SG-PRIV-01 的分工：那条问「有没有告知目的」，这条问「找不找得到数据保护联系人」。
    legalLinkFallback: false,
    trigger:
      /\b(?:newsletter|subscribe|sign\s*up|register|contact\s+form|checkout|create\s+account|log\s*in)\b/i,
    notice:
      /\bdata\s+protection\s+officer\b|\bdpo\b|\bprivacy\s+(?:officer|contact|enquir(?:y|ies))\b|\bdata\s+protection\s+(?:contact|officer|enquir(?:y|ies))\b|\bpersonal\s+data\s+protection\s+(?:contact|officer)\b|[\w.+-]+@[\w.-]*(?:privacy|dpo|dataprotection)/i,
    missingEvidence: "数据保护负责人（DPO）的业务联系方式（PDPA s.11(5)）",
    fix: "在隐私政策或页脚公开至少一名数据保护负责人的业务联系方式（邮箱或电话），并写明可用于提出查阅、更正与投诉请求。",
  },
  {
    ruleId: "SG-MET-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // WMA 1975 s.18(1)(d), (2)：非公制单位只能作为公制数值的附加标注。文本只能判「同一处
    // 有没有公制对照」，判不了「英制字号是否更大」，所以缺失项写成「并列的公制数值」。
    trigger:
      /\b\d+(?:\.\d+)?\s*-?\s*(?:inch(?:es)?|in\.|feet|ft\.?|pounds?|lbs?|ounces?|oz\.?|quarts?|qt\.?|gallons?|gal\.?)\b/i,
    notice:
      /\b\d+(?:\.\d+)?\s*-?\s*(?:mm|cm|m|metres?|meters?|kg|kilograms?|g|grams?|ml|millilit(?:re|er)s?|lit(?:re|er)s?|l|sq\.?\s*(?:m|cm))\b/i,
    lineScoped: true,
    missingEvidence: "与英制数值并列的公制数值（WMA s.18(2)）",
    fix: "在同一处并列公制数值（8.5 in 就写 21.6 cm），并让公制数字不小于英制数字。",
  },
  {
    ruleId: "SG-PRICE-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // GST Regs reg.77(1)：对公众展示/广告/报价的价格必须已含 GST（除非取得 Comptroller 豁免）。
    // 只写「before GST / excl. GST」而没有含税价的页面，正是本条要拦的形态。
    legalLinkFallback: false,
    trigger:
      /\b(?:before|excl\.?|excluding|exclusive\s+of|w\/o|without|not\s+includ\w*)\s*gst\b|\bgst\s+(?:not\s+included|excluded|extra)\b|\bpre-?gst\b|\+\s*gst\b/i,
    notice: /\b(?:incl\.?|inclusive\s+of|including|with)\s*gst\b|\bgst\s+(?:included|inclusive)\b/i,
    missingEvidence: "已含 GST 的实际售价（GST reg.77(1)）",
    fix: "把对公众展示的主价改成含 GST 的实付价；确需展示不含税价时，含税价必须同样显著。",
  },
  {
    ruleId: "SG-ADV-06",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "limited_without_terms",
    patterns: [
      "while stocks last",
      "while supplies last",
      "limited time",
      "limited-time offer",
      "today only",
      "last chance",
      "flash sale",
      "offer ends",
      "limited units",
      "first come first served",
      "strictly while stocks last",
    ],
    // item 7 的免责条件是「清楚说明任何限制」：数量上限、截止日期、每人限购、最低消费都算。
    terms:
      /\b(?:max(?:imum)?|only|up\s+to|limited\s+to)\s+\d+|\d+\s*(?:units?|pieces?|pcs|sets?)\b|\b(?:until|till|by|before|ends?)\s+(?:\d{1,2}\s+\w+|\d{1,2}[/-]\d{1,2})|\b\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+20\d\d|\b\d{1,2}[/-]\d{1,2}[/-]20\d\d|\bper\s+(?:customer|household|person|order)\b|\bmin(?:imum)?\.?\s+(?:spend|purchase|order)\b/i,
    note: "item 7 还要求商家「知道或应知」该表示不实；这里只判「限制条件有没有写在同一屏」。",
    fix: "把这句限量/限时表述换成带可核对限制条件的写法（数量上限、截止日期或每人限购）；定不出条件就不要用限量措辞。",
  },
  {
    ruleId: "SG-ADV-12",
    kind: "claim",
    // 符合性标示通常写在商品标题、卖点与详情区，也可能出现在页脚证书行，所以取整页。
    scope: "page",
    severity: SEVERITY_BY_LEVEL.rule_level,
    patterns: [
      "safety mark",
      "certified",
      "certification",
      "complies with",
      "compliant with",
      "meets standard",
      "meets the standard",
      "tested to",
      "ce marked",
      "ul listed",
      "iec 60335",
      "iso 9001",
      "oeko-tex",
      "sgs certified",
    ],
    // 泛词必须带标准/机构才有意义：「certified pre-owned」不是符合性标示。
    weak: {
      certified: /\b(?:safety\s+mark|iec|iso|ul|ce|oeko|sgs|tuv|tüv|intertek|imda|spring|enterprise\s+singapore|standard\s+100)\b/i,
      certification: /\b(?:iec|iso|ul|ce|oeko|sgs|tuv|tüv|intertek|number|no\.)\b/i,
    },
    excludeLine:
      /\b(?:pre-?owned|refurbished|reconditioned|returns?|refund|warranty\s+claim)\b|\bnot\s+(?:been\s+)?(?:certified|approved|tested)\b|\bno\b[^.]{0,24}\b(?:certification|safety\s+mark)\b/i,
    note: "s.5(b) 只惩罚「不存在的标准或批准」；页面标示能否对上真实存在的标准，要看证书编号。",
    fix: "能对上具体标准与发证机构，就把标准编号、发证机构与有效期写在页面；对不上，就删去这处符合性标示。",
  },
  {
    ruleId: "SG-ADV-11",
    kind: "claim",
    // 商品说明写在标题、卖点与详情区，页脚链接标签不算，所以取商品面板 + 详情区。
    scope: "panel",
    severity: SEVERITY_BY_LEVEL.rule_level,
    patterns: [
      "genuine leather",
      "genuine",
      "authentic",
      "original",
      "grade a",
      "handmade",
      "hand-made",
      "imported from",
    ],
    // 「original」在价格语境里是原价，「authentic」在鉴定服务里是服务名——都不是商品说明。
    weak: {
      genuine: /\b(?:leather|silk|cotton|wool|steel|wood|product|item|brand|part)\b/i,
      original: /\b(?:product|packaging|design|brand|equipment|parts?)\b/i,
    },
    excludeLine:
      /\boriginal\s+price\b|\boriginally\s+\$|\bauthentic(?:ation)?\s+(?:service|check)\b|\bimported\s+from\s+our\b/i,
    note: "商品说明是否属实要看货源与授权文件；本条只记录页面作出了真伪/来源类说明。",
    fix: "能出示货源与授权文件，就把供应商、批号或授权凭证写在页面；出示不了，就删去 genuine / authentic 这类说明，改写成可核对的材质与产地事实。",
  },
];

/**
 * AE 的可判定子集（RAY-774）。七条全部是 `rule_level`，口径见文件头。
 *
 * A 缺席类：
 * - `AE-ADV-07`（CPL 2020 Art. 26）→ `language_disclosure_absent`：与消费者相关的数据、广告与
 *   合同须使用阿拉伯语（可并列其他语言），整页没有阿拉伯语文本；
 * - `AE-PRV-01`（PDPL 2021 Art. 13(2)）→ `notice_disclosure_absent`：有数据收集入口但整页
 *   看不到处理目的与共享对象告知；
 * - `AE-ECOM-01`（E-Commerce Law 2023 Art. 5(5)）→ 同一个 check：页面在售（加购/结账入口）
 *   却看不到运费、支付费用与交易条款的公开说明；
 * - `AE-ECOM-04`（E-Commerce Law 2023 Art. 6(9)）→ 同一个 check：页面在售却看不到数字交易者
 *   的执照、发证机关与地址；
 * - `AE-ECOM-03`（E-Commerce Law 2023 Art. 6(4)）→ 同一个 check：有营销订阅入口，但整页
 *   看不到「可以选择不接收」的退订方式（一个 Terms 链接不能代替）。
 *
 * B 凭据类：
 * - `AE-ADV-12`（CPL ER 2023 Art. 11）→ `claim_without_evidence`：宣传保修但看不到书面保修
 *   文件或条款；
 * - `AE-PRV-02`（PDPL 2021 Art. 6(1)(b)-(c)）→ 同一个 check：页面用「继续浏览即视为同意」
 *   这类默示同意，同时整页看不到撤回同意的入口。Art. 6(1)(c) 要求同意必须包含可轻易撤回的
 *   权利，两者同缺才出 finding；
 * - `AE-LBL-02`（CPL ER 2023 Art. 3(7)）→ `notice_disclosure_absent`：在售有误用风险的电热/
 *   电池类商品，却整页看不到警示语（Art. 3(7) 要求以清晰易读字体警告错误使用的危险）。
 *
 * 不挂 AE-ADV-05/06（促销事前许可、折扣差价告知）、AE-LBL-01/03/04（包装标签与箱内清单）、
 * AE-LBL-05/06（标准符合性与 TDRA 型号批准）、AE-ADV-08/09/10（主体信息、标价、刷卡不加价）、
 * AE-PRV-03/04（同意作为处理的合法性基础、数据不得交易）与罚则条文 Art. 23 / 29 / 30 / 17：
 * 要么需要主体资料与实物包装，要么是执法事实，单页文本不能自证。
 */
const AE_MATCHERS: ComplianceMatcher[] = [
  {
    ruleId: "AE-ADV-07",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "language_disclosure_absent",
    patterns: [],
    // CPL 2020 Art. 26：数据、广告与合同须用阿拉伯语，其他语言只能并列。
    // 只看页面有没有阿拉伯语版本，评价不了翻译质量；至少 3 个标记词才算「有该语言版本」。
    language: { markers: /[\u0600-\u06ff]+/g, label: "阿拉伯语", minMarkers: 3 },
    missingEvidence: "阿拉伯语版本（CPL 2020 Art. 26）",
  },
  {
    ruleId: "AE-PRV-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // PDPL 2021 Art. 13(2)：开始处理前须告知处理目的、共享对象的行业/机构与跨境传输保障。
    trigger:
      /\b(?:newsletter|subscribe|subscription|sign\s*up|register|contact\s+form|checkout|create\s+account|my\s+account|log\s*in|whatsapp)\b/i,
    notice:
      /\bprivacy\s+(?:policy|notice|statement)\b|\bpersonal\s+data\s+(?:notice|policy)\b|\bpdpl\b|\bdata\s+protection\s+(?:policy|notice)\b/i,
    missingEvidence: "处理个人数据的目的与共享对象告知（PDPL Art. 13(2)）",
    fix: "在收集入口旁给出 PDPL Art. 13(2) 要求的三项：处理目的、共享对象的行业/机构、跨境传输的保障措施。",
  },
  {
    ruleId: "AE-ECOM-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // E-Commerce Law 2023 Art. 5(5)：在网站/应用上公开价格、物流与数字支付费用、交易条款。
    legalLinkFallback: false,
    triggerAnyLine: true,
    trigger:
      /\badd\s+to\s+(?:cart|bag|basket)\b|\bbuy\s+(?:now|it\s+now)\b|\bplace\s+(?:your\s+)?order\b|\border\s+now\b|\bshop\s+now\b/i,
    notice:
      /\b(?:shipping|delivery|handling|logistics)\s+(?:fees?|charges?|costs?|policy|information)\b|\bfree\s+(?:shipping|delivery)\b|\bcash\s+on\s+delivery\b|\bpayment\s+(?:fees?|methods?)\b|\bterms\s+(?:and|&)\s+conditions\b|\bterms\s+of\s+(?:sale|service)\b|\b(?:shipping|delivery)\s*(?:&|and)\s*returns?\b|\breturns?\s+policy\b|\brefund\s+policy\b/i,
    missingEvidence: "运费/支付费用与交易条款的公开说明（E-Commerce Law Art. 5(5)）",
    fix: "在商品页或结算页公开运费、支付费用与交易条款；细则可以另页，但入口本身要能让消费者直接看到。",
  },
  {
    ruleId: "AE-ECOM-04",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // E-Commerce Law 2023 Art. 6(9)：向公众公开数字交易者的执照、发证机关、地址与联系电话。
    legalLinkFallback: false,
    triggerAnyLine: true,
    trigger:
      /\badd\s+to\s+(?:cart|bag|basket)\b|\bbuy\s+(?:now|it\s+now)\b|\bplace\s+(?:your\s+)?order\b|\border\s+now\b|\bshop\s+now\b/i,
    notice:
      /\btrade\s+licen[cs]e\b|\bcommercial\s+licen[cs]e\b|\blicen[cs]e\s+(?:no\.?|number|#)\b|\bregistration\s+(?:no\.?|number)\b|\bT\.?R\.?N\.?\b|\b(?:Dubai|Abu\s+Dhabi|Sharjah|Ajman|Umm\s+Al\s+Quwain|Ras\s+Al\s+Khaimah|Fujairah)\b[^.]{0,30}\b(?:UAE|United\s+Arab\s+Emirates)\b/i,
    missingEvidence: "数字交易者的执照、发证机关与营业地址（E-Commerce Law Art. 6(9)）",
    note: "Art. 6(9) 的义务主体是在阿联酋注册的数字交易者；跨境卖家是否属于该范围要按主体资质确认。",
    fix: "在页脚或关于页公开执照号与发证机关、营业地址与联系电话。",
  },
  {
    ruleId: "AE-ECOM-03",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // E-Commerce Law 2023 Art. 6(4)：消费者有权选择接收或拒绝促销/营销信息。
    // 一个 Terms 链接不能代替「怎么拒收」，所以关掉法务入口兜底。
    legalLinkFallback: false,
    trigger:
      /\b(?:newsletter|subscribe|subscription|marketing\s+(?:messages?|emails?)|promotional\s+(?:messages?|emails?)|sms\s+updates?|whatsapp\s+updates?)\b/i,
    notice:
      /\bunsubscribe\b|\bopt[\s-]?out\b|\bstop\s+receiving\b|\bmanage\s+(?:your\s+)?preferences\b|\bإلغاء\b|\bلا\s+أرغب\b/i,
    missingEvidence: "选择不接收促销信息的方式（退订 / opt out）",
    fix: "在订阅入口旁写明如何拒绝或退订促销信息（勾选项或退订链接），并说明退订后多久生效。",
  },
  {
    ruleId: "AE-ADV-12",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    patterns: ["warranty", "guarantee", "warranty period", "years warranty", "year warranty"],
    // CPL ER 2023 Art. 11：宣传保修就必须把证明该保修的书面文件交给消费者。
    evidence:
      /\bwarranty\s+(?:policy|terms|document|text|card|statement)\b|\bterms\s+(?:and\s+)?conditions\s+of\s+(?:the\s+)?warranty\b|\bwritten\s+warranty\b|\bwarranty\.pdf\b|\bdownload\s+(?:the\s+)?warranty\b/i,
    missingEvidence: "书面保修文件或条款链接（CPL ER Art. 11）",
    fix: "在商品页或售前流程里提供保修条款全文或可下载文件（期限、覆盖范围、除外项齐全）；拿不出书面文件就不要宣传保修。",
  },
  {
    ruleId: "AE-PRV-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    // PDPL 2021 Art. 6(1)(b)-(c)：同意须清晰、简单、无歧义、易于获取，并包含可轻易撤回的权利。
    // 「继续浏览即视为同意」不是清晰同意；页面同时看不到撤回入口时，观察到的就是这一缺口。
    patterns: [
      "by continuing to use",
      "by continuing to browse",
      "by using this site you agree",
      "by using our website you agree",
      "by signing up you agree",
      "by subscribing you agree",
      "you consent to",
      "implied consent",
    ],
    evidence:
      /\b(?:withdraw|revoke)\s+(?:your\s+|the\s+)?consent\b|\bwithdraw\s+your\s+consent\s+at\s+any\s+time\b|\bunsubscribe\b|\bopt[\s-]?out\b|\bmanage\s+(?:your\s+)?(?:cookie\s+)?preferences\b/i,
    missingEvidence: "可轻易撤回同意的入口（PDPL Art. 6(1)(c)）",
    fix: "把「继续浏览即视为同意」换成明确的同意动作（勾选框或确认页），并在同一处给出撤回同意的方式。",
  },
  {
    ruleId: "AE-LBL-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // CPL ER 2023 Art. 3(7)：须以清晰易读的字体警告错误使用商品可能导致的危险。
    // 触发点取「有可预见的误用风险」的品类（加热、搅拌、电池、充电），而不是全部商品；
    // 页面连一处警示语都没有时，才记为缺席。
    legalLinkFallback: false,
    trigger:
      /\b(?:heater|kettle|blender|air\s*fryer|iron|charger|lithium|li-ion|battery|power\s+(?:bank|station)|microwave|toaster|hair\s+dryer|humidifier|dehumidifier|vacuum|scooter|drone|3d\s*printer)\b/i,
    notice:
      /\bwarnings?\b|\bcaution\b|\bsafety\s+(?:instructions?|precautions?|information|notes?)\b|\brisk\s+of\s+(?:fire|electric\s+shock|burns?|injury|overheating)\b/i,
    missingEvidence: "误用危险的警示语（CPL ER 2023 Art. 3(7)）",
    fix: "在商品页或包装上给出可预见的误用警示（例如不要覆盖出风口、远离易燃物、充电时不要离人）。",
  },
];

/**
 * US 的可判定子集（RAY-774）。六条全部是 `rule_level`，口径见文件头。
 *
 * - `US-WAR-01`（Magnuson-Moss §103, 15 U.S.C. §2303(a)）→ `claim_without_evidence`：
 *   提保修却没按法定名称指定 full / limited；
 * - `US-WAR-02`（16 CFR 702.3(a)）→ 同一个 check：提保修但售前看不到保修全文或链接；
 * - `US-PRI-01`（CAN-SPAM §7704(a)(3)(A)）→ `notice_disclosure_absent`：有营销订阅入口但没有
 *   退订机制（Term 链接不算）；
 * - `US-PRI-02`（CAN-SPAM §7704(a)(5)(A)(iii)）→ 同一个 check：有营销订阅入口但看不到发件人
 *   的有效实体邮政地址；
 * - `US-ADV-06`（16 CFR 251.1(c)）→ `limited_without_terms`：写 free gift / BOGO 却不写取得
 *   与保留条件；
 * - `US-ADV-13`（16 CFR 465.4）→ `claim`：页面把「写评论」和「得到好处」写在一起（激励换评论）；
 * - `US-ADV-02`（16 CFR 255.0(f)）→ `claim_without_evidence`：关键条件只写成「see terms」，
 *   页面上没有同一处的条件说明（clear and conspicuous 要求难以忽略、当场看得懂）；
 * - `US-LBL-09`（16 CFR 305.27(a)(1)(i)）→ 同一个 check：页面在卖 covered product
 *   （冰箱、洗衣机、洗碗机、空调、热水器等），却看不到 EnergyGuide 标签或能耗信息。
 *
 * 不挂 US-ADV-02/03/05/12（免责声明显著性、评论真伪、背书关系披露、虚假评论）：要核对评论
 * 来源、账号与激励名单，或要看版式；不挂 US-LBL-08/09（EnergyGuide 要看到可读标签图片）；
 * 不挂 US-CERT-02/03（缺陷报告与销售禁令要执法事实）。
 */
const US_MATCHERS: ComplianceMatcher[] = [
  {
    ruleId: "US-WAR-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    patterns: ["warranty", "guarantee", "lifetime warranty", "limited warranty", "full warranty"],
    // §2303(a)：书面保修须清楚显著地指定为 full warranty 或 limited warranty。
    // 只看有没有法定指定，不看保修内容是否达到联邦最低标准（那需要保修全文）。
    evidence:
      /\b(?:full|limited)\s+(?:\d+[-\s]?(?:year|yr)s?\s+)?warranty\b|\b(?:full|limited)\s+warranty\s+statement\b/i,
    missingEvidence: "保修级别（full / limited warranty）的法定指定（15 U.S.C. §2303(a)）",
    fix: "把保修写成法定名称：「full warranty」或「limited warranty」，并注明期限；这两个词都不能省。",
  },
  {
    ruleId: "US-WAR-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    patterns: ["warranty", "guarantee"],
    // 16 CFR 702.3(a)：售价超过 $15 且附书面保修时，卖方须在售前让买家能查阅保修文本。
    evidence:
      /\bwarranty\s+(?:policy|terms|document|text|details|information)\b|\b(?:view|read|see|download)\s+(?:the\s+)?(?:full\s+)?warranty\b|\bwarranty\.pdf\b/i,
    missingEvidence: "售前可查阅的保修全文或链接（16 CFR 702.3(a)）",
    fix: "在商品页或结算前提供保修全文或可读链接，让买家下单前就能看到条款，而不是付款后才给。",
  },
  {
    ruleId: "US-PRI-01",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // CAN-SPAM §7704(a)(3)(A)：商业邮件须含清晰显著、可用的退订机制。
    // 页面提供营销订阅却没有任何退订说明时，无法确认该机制存在，故按缺席记。
    legalLinkFallback: false,
    trigger:
      /\b(?:newsletter|subscribe|subscription|marketing\s+emails?|promotional\s+emails?|email\s+updates?)\b/i,
    notice:
      /\bunsubscribe\b|\bopt[\s-]?out\b|\bmanage\s+(?:your\s+)?(?:email\s+)?preferences\b|\bemail\s+preferences\b|\bstop\s+receiving\b/i,
    missingEvidence: "退订机制（unsubscribe / opt out / email preferences）",
    fix: "在订阅入口旁写明退订方式（unsubscribe 链接或邮箱），并保证退订后 10 个工作日内停止发送。",
  },
  {
    ruleId: "US-PRI-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "notice_disclosure_absent",
    patterns: [],
    // CAN-SPAM §7704(a)(5)(A)(iii)：商业邮件须给出收件人可用的实体邮政地址。
    legalLinkFallback: false,
    trigger:
      /\b(?:newsletter|subscribe|subscription|marketing\s+emails?|promotional\s+emails?|email\s+updates?)\b/i,
    notice:
      /\b(?:postal|mailing)\s+address\b|\bP\.?\s?O\.?\s*Box\b|\b\d{1,6}\s+[A-Za-z][A-Za-z .'-]{2,}\s+(?:Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Court|Ct\.?)\b/i,
    missingEvidence: "发件人的有效实体邮政地址（CAN-SPAM §7704(a)(5)(A)(iii)）",
    fix: "在订阅入口旁或邮件模板里给出有效的实体邮政地址（USPS 注册的 P.O. Box 也可）。",
  },
  {
    ruleId: "US-ADV-06",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "limited_without_terms",
    patterns: [
      "buy one get one",
      "bogo",
      "2-for-1",
      "gift with purchase",
      "free gift",
      "free with purchase",
      "free item",
    ],
    // 251.1(c)：「free」类要约必须在要约一开始就写清取得与保留赠品的全部条件，
    // 不能只放在需要跳转的细则里。购买门槛、限购、期限、指定商品都算条件。
    terms:
      /\bwith\s+(?:any\s+|a\s+)?(?:purchase|order)\b|\bwhen\s+you\s+(?:buy|spend|order)\b|\bmin(?:imum)?\.?\s+(?:spend|purchase|order)\b|\borders?\s+(?:over|above|of|from)\s*\$?\d|\bon\s+orders?\s*\$?\d|\b\$\d[\d,.]*\s*\+|\bwhile\s+(?:stocks|supplies)\s+last\b|\buntil\s+(?:\d|end\s+of)\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\bper\s+(?:customer|household|order)\b/i,
    fix: "在「free」要约旁写清取得条件：最低消费、限购、有效期、指定商品；写不出条件就不要用 free 措辞。",
  },
  {
    ruleId: "US-ADV-13",
    kind: "claim",
    // 激励换评论的写法通常贴在评分区/详情区，也可能写在页脚积分计划里，所以取整页。
    scope: "page",
    severity: SEVERITY_BY_LEVEL.rule_level,
    patterns: [
      "review and get",
      "review for a discount",
      "review for a gift",
      "review for points",
      "leave a review and get",
      "write a review and get",
      "incentivized review",
      "free product in exchange for",
      "gift card for a review",
      "points for a review",
      "review to unlock",
    ],
    // 「review for accuracy」这类不是激励；必须同句出现好处（折扣、积分、礼品、赠品）。
    weak: {
      "review and get": /\b(?:discount|points|gift|voucher|coupon|free|credit|reward)\b/i,
    },
    excludeLine: /\b(?:no\s+(?:incentive|reward|gift)\b|we\s+(?:never|do\s+not)\s+(?:offer|pay))/i,
    note: "只有「以好处换评论」的写法落入 §465.4；单纯邀请评价不是。",
    fix: "把「写评论换折扣/礼品」改成无条件邀请：「Share your thoughts」。不要用折扣、积分或礼品换取评分或正面评价。",
  },
  {
    ruleId: "US-ADV-02",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    // 16 CFR 255.0(f)：免责声明须 clear and conspicuous——难以忽略、普通消费者直接看得懂。
    // 把关键条件写成「see terms / T&Cs apply」再指向另一个页面，等于让消费者为看懂主声明
    // 另找信息；只有页面上真的写出了条件，才算同一处披露。
    patterns: [
      "see terms",
      "see full terms",
      "see details",
      "terms apply",
      "terms and conditions apply",
      "conditions apply",
      "exclusions apply",
      "see our terms",
    ],
    evidence:
      /\bmin(?:imum)?\.?\s+(?:spend|purchase|order)\b|\bwhile\s+(?:stocks|supplies)\s+last\b|\bper\s+(?:customer|household|order)\b|\b(?:valid|ends?|until)\s+(?:\d|end\s+of)\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\bexcludes?\s+(?:\w+\s+){0,3}(?:items?|products?|brands?|sale)\b/i,
    missingEvidence: "与主声明写在同一处的条件说明（而不是只指向另一个页面）",
    note: "255.0(f) 判的是显著性；这里只判「条件有没有写在同一处」，判不了字号与位置。",
    fix: "把「see terms」换成当场可读的条件说明：最低消费、限购、截止日期都写在同一屏；细则仍可另页，但不能是唯一出处。",
  },
  {
    ruleId: "US-LBL-09",
    kind: "formal",
    strictPage: true,
    severity: SEVERITY_BY_LEVEL.rule_level,
    check: "claim_without_evidence",
    // 16 CFR 305.27(a)(1)(i)：网站以目录方式销售 covered product 时，须为每个型号展示可读的
    // EnergyGuide 标签图片。只有在页面确实在卖受覆盖品类时才触发（空气炸锅、3D 打印机等
    // 不在 305 的覆盖清单里），所以用品类词做触发，不按「通用」品类一刀切。
    patterns: [
      "refrigerator",
      "refrigerator-freezer",
      "freezer",
      "washing machine",
      "clothes washer",
      "dishwasher",
      "room air conditioner",
      "portable air conditioner",
      "ceiling fan",
      "water heater",
      "pool heater",
      "heat pump",
      "furnace",
      "general service lamp",
    ],
    evidence:
      /\benergyguide\b|\benergy\s+guide\b|\bkwh\s*\/?\s*(?:year|yr)\b|\benergy\s+(?:consumption|use|rating)\b|\benergy\s+star\b|\bestimated\s+(?:yearly|annual)\s+(?:energy\s+)?(?:use|cost)\b/i,
    missingEvidence: "可读的 EnergyGuide 标签或能耗信息（16 CFR 305.27(a)(1)(i)）",
    note: "标签要求的是展示可读的标签图片；文本里出现「节能」字样不能代替标签，也不据此判断未贴标。",
    fix: "在商品页展示该型号的 EnergyGuide 标签图片（或链接到可读的标签文件），并按 16 CFR 305.27 的要求不设下载门槛。",
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
      ruleIds: [
        "SG-ADV-02",
        "SG-ADV-03",
        "SG-ADV-04",
        "SG-ADV-07",
        "SG-APP-03",
        "SG-APP-10",
        "SG-FOOD-01",
        "SG-FOOD-02",
        "SG-MET-02",
        "SG-MET-03",
      ],
      reason:
        "规则库标 `substantiation` 的条目（价格比较基准、认证与测试依据、食品接触材料检测报告）：只写「需要出示什么证据」，不判真假，因此不进自动结论。",
    },
    {
      ruleIds: ["SG-ADV-01", "SG-PRIV-05", "SG-PRIV-07"],
      reason:
        "规则库标 `human_review` 的条目（绝对化用语、隐私告知是否充分、营销同意是否有效）：是否误导取决于整体语境，需人工按上下文判断，代码不代下结论。",
    },
    {
      ruleIds: ["SG-ADV-05", "SG-ADV-08", "SG-ADV-09"],
      reason:
        "CPFTA 2003 附表 item 5 / 19 / 20（翻新当新机、赠品不兑现、虚设折扣期）：条文要求先证明商家「知道或应知」该表示不实，单页文本无法自证，转人工核实。",
    },
    {
      ruleIds: [
        "SG-APP-01",
        "SG-APP-02",
        "SG-APP-04",
        "SG-APP-05",
        "SG-APP-06",
        "SG-APP-07",
        "SG-APP-08",
        "SG-APP-09",
        "SG-APP-11",
      ],
      reason:
        "CPSR / Dealers Regs / CGSR 2011 的注册与 Safety Mark、IMDA 标签状态：要用注册号到 CPSO、IMDA 数据库核对，页面缺失不等于未注册；本版只在市场就绪度记录认证展示。",
    },
    {
      ruleIds: [
        "SG-ADV-10",
        "SG-PRICE-02",
        "SG-PRIV-03",
        "SG-PRIV-04",
        "SG-PRIV-06",
        "SG-PRIV-08",
        "SG-FOOD-03",
        "SG-LANG-01",
        "SG-MKT-01",
        "SG-MKT-02",
      ],
      reason:
        "这一批要么需要版式或主体资料（SG-ADV-10 社论形式广告要看内容形态、SG-PRICE-02 要看含税价与不含税价的字号与位置、SG-PRIV-03/04/06/08 是政策与流程义务、SG-FOOD-03 要看赠品实物），要么义务附着在「已经发出的商业讯息」而不是商品页（SG-LANG-01 / SG-MKT-01 / SG-MKT-02 的退订声明与 <ADV> 标注）：按页判定会误伤正常站点，留给人工或下一阶段。",
    },
  ],
  AE: [
    {
      ruleIds: ["AE-ADV-03", "AE-ADV-18", "AE-ADV-19", "AE-ECOM-02"],
      reason:
        "规则库标 `substantiation` 的条目（奖项证书、原产地、性能与功效声称、原装正品）：只写「需要出示什么依据」，不判真假。",
    },
    {
      ruleIds: ["AE-ADV-01", "AE-ADV-02", "AE-ADV-04", "AE-ADV-11", "AE-ADV-16"],
      reason:
        "规则库标 `human_review` 的条目（绝对化用语、比较价是否真实、格式条款是否损害消费者、内容标准）：需人工按整体语境判断。",
    },
    {
      ruleIds: ["AE-ADV-05", "AE-ADV-06", "AE-ADV-09", "AE-ADV-10"],
      reason:
        "促销与标价类（CPL 2020 Art. 18 促销须事前取得许可、CPL ER 2023 Art. 31 折扣差价告知、Art. 8(1) 商品标价、Art. 5 折扣卡与刷卡不加价）：许可与差价是执法与交易事实，标价与折扣卡要看实物与结算页，单页商品页不能自证。",
    },
    {
      ruleIds: ["AE-LBL-01", "AE-LBL-03", "AE-LBL-04", "AE-LBL-05", "AE-LBL-06"],
      reason:
        "包装标签（成分、原产国、生产/保质期）、箱内清单与标准符合性（CPL ER Art. 3 / 4、CPL Art. 7 / 20）以及 TDRA 型号批准：要看实物包装、说明书与设备铭牌，或要用型号到 TDRA 系统核对，单页文本不构成可判定事实。",
    },
    {
      ruleIds: ["AE-ADV-08", "AE-ADV-13", "AE-ADV-14", "AE-ADV-15", "AE-ADV-17", "AE-PRV-03", "AE-PRV-04"],
      reason:
        "主体信息义务（CPL Art. 25 名称/法律形式/地址/发证机关）、广告材料须标注为广告（Media Law Art. 20(2) 的适用范围以投放形态为准）、同意作为处理的合法性基础与数据不得交易（PDPL Art. 4 / E-Commerce Art. 10(2)(d)），以及纯罚则条文（Art. 23 / 29 / 30 / 17）：要么需要主体资料，要么只是处罚区间，单页文本不能下判断。",
    },
  ],
  US: [
    {
      ruleIds: ["US-ADV-04", "US-ADV-07", "US-ADV-08", "US-ADV-09", "US-ADV-10", "US-CERT-04"],
      reason:
        "规则库标 `substantiation` 的条目（代表性证据、比较价基准、Made in USA、环保与「不含某物质」声称、吹风机浸水保护）：只写「需要出示什么证据」，不判真假。",
    },
    {
      ruleIds: [
        "US-ADV-01",
        "US-ADV-11",
        "US-LBL-01",
        "US-LBL-02",
        "US-LBL-03",
        "US-LBL-04",
        "US-LBL-05",
        "US-LBL-06",
        "US-LBL-07",
        "US-CERT-01",
        "US-CERT-05",
        "US-CERT-06",
        "US-CERT-07",
        "US-CERT-08",
        "US-PRI-03",
      ],
      reason:
        "规则库标 `human_review` 的条目（整体印象判断、包装标签与 FCC / GCC 合规声明）：要看实物包装、说明书与设备铭牌，单页商品页看不到，需人工或实物核对。",
    },
    {
      ruleIds: ["US-ADV-03", "US-ADV-05", "US-ADV-12"],
      reason:
        "评论与背书类（16 CFR 255.1 背书真实性、255.5 背书关系披露、465.2 虚假评论）：要核对评论来源、账号、激励名单与披露位置；页面上出现一个页脚链接标签不能证明利益关系，转人工核实。",
    },
    {
      ruleIds: ["US-LBL-08", "US-CERT-02", "US-CERT-03"],
      reason:
        "EnergyGuide / Lighting Facts 标签的成品文件要看到图片本身（16 CFR 305.9 的公开副本与 305.27 的展示形式），文本里出现 ENERGY STAR 之类的词不能代替标签；缺陷报告义务与销售禁令（CPSA §15 / §19）要执法事实。页面文本本身不能证明违反。",
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
