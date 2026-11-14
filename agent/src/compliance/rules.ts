/**
 * 合规与风险 v0.1（马来西亚）规则加载与可判定子集。
 *
 * 唯一数据源：`agent/knowledge/legal/my/rules.v0.1.json`（RAY-689 定稿，45 条 / 9 部法规）。
 * 本文件**不改规则内容、不新增法条**，只做两件事：
 *
 * 1. 原样加载规则库，供 finding 引用 `law_name` / `article` / `official_url` / `last_verified`；
 * 2. 声明 v0.1「哪些规则可以被页面文本判定」，以及每条规则的取证范围与严重程度。
 *    没有出现在下面的规则一律进 `not_assessable`，附原因，不硬凑覆盖率。
 *
 * 口径（与 RAY-684 / RAY-696 / RAY-698 对齐）：
 * - `decision_level` 一律取规则库的值，代码不升级、不降级；
 * - 只有规则库标 `rule_level` 且页面上能直接看到该条规范的行为要素时才出规则级判定；
 * - `substantiation` 只写「需要证明」，`human_review` 明确标「需人工判断」。
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Severity } from "../types.js";
import type { ComplianceConfidence, ComplianceSkipReason, DecisionLevel } from "./types.js";

export interface LegalRule {
  id: string;
  market: string;
  category: string;
  law_name: string;
  law_short: string;
  article: string;
  article_type: string;
  source_id: string;
  official_url: string;
  source_tier: string;
  language: string;
  effective_date: string;
  last_verified: string;
  rule_type: string;
  decision_level: DecisionLevel;
  claim_pattern: string[];
  requirement: string;
  evidence_needed: string;
  penalty_or_note: string;
  verbatim_excerpt: string;
  confidence: ComplianceConfidence;
  review_required: boolean;
  notes?: string;
}

interface RulesFile {
  schema_version: string;
  market: string;
  market_name: string;
  version: string;
  scope: string;
  last_verified: string;
  review_policy: string;
  rules: LegalRule[];
}

const RULES_PATH = fileURLToPath(new URL("../../knowledge/legal/my/rules.v0.1.json", import.meta.url));

let cached: RulesFile | undefined;

/** 读规则库；文件缺失/结构不对时直接抛错——不允许在缺规则的情况下静默出报告。 */
export function loadMyRules(): RulesFile {
  if (cached) return cached;
  const raw = readFileSync(RULES_PATH, "utf8");
  const parsed = JSON.parse(raw) as RulesFile;
  if (!Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    throw new Error(`合规规则库为空：${RULES_PATH}`);
  }
  cached = parsed;
  return parsed;
}

export function myRules(): LegalRule[] {
  return loadMyRules().rules;
}

export function ruleById(id: string): LegalRule {
  const found = myRules().find((rule) => rule.id === id);
  if (!found) throw new Error(`规则库里没有这条规则：${id}`);
  return found;
}

export function rulesVersion(): string {
  return loadMyRules().version;
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
 */
export type FormalCheck =
  | "limited_without_terms"
  | "malay_disclosure_absent"
  | "privacy_notice_absent"
  | "halal_claim_without_certificate"
  | "government_approval_claim";

export interface FormalMatcherDef {
  ruleId: string;
  kind: "formal";
  severity: Severity;
  check: FormalCheck;
  /** 触发词（限量、halal、政府批准等）；`malay_disclosure_absent` / `privacy_notice_absent` 用各自的数据。 */
  patterns: string[];
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

export function matcherById(id: string): ComplianceMatcher | undefined {
  return COMPLIANCE_MATCHERS.find((matcher) => matcher.ruleId === id);
}

/** 规则库里既没有 matcher、也没有写在跳过清单里的规则：静默丢规则的兜底检查。 */
export function uncoveredRuleIds(): string[] {
  const covered = new Set<string>(COMPLIANCE_MATCHERS.map((matcher) => matcher.ruleId));
  for (const reason of COMPLIANCE_SKIP_REASONS) {
    for (const id of reason.ruleIds) covered.add(id);
  }
  return myRules()
    .map((rule) => rule.id)
    .filter((id) => !covered.has(id));
}

/** 每条跳过原因覆盖的规则必须在规则库里真实存在，避免拼错 id 静默丢规则。 */
export function validateSkipReasons(): void {
  const ids = new Set(myRules().map((rule) => rule.id));
  for (const reason of COMPLIANCE_SKIP_REASONS) {
    for (const id of reason.ruleIds) {
      if (!ids.has(id)) throw new Error(`跳过清单里的规则不存在：${id}`);
    }
  }
}
