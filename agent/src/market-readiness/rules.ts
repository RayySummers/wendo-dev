/**
 * 市场就绪度 v0.1：马来西亚 8 条页面就绪检查的元数据。
 *
 * 规则只做「页面可见信息的存在性/完整性」取证：
 * - 不判断认证是否真实有效（`MY-MR-04` / `MY-MR-08` 只记录是否写明、是否展示）；
 * - 不判断广告或税务是否合规（`MY-MR-02` / `MY-MR-07` 只记录展示）；
 * - 缺失一律写「页面未展示」，不用推测补。
 *
 * 知识库引用（`references`）指向 `agent/knowledge/my/index.json` 的规则 id，
 * 产品口径见 `agent/knowledge/market-readiness/my/README.md`。
 */

export type MarketReadinessScope = "page" | "product";

export interface MarketReadinessCheckDef {
  id: string;
  label: string;
  /** `product` 只对商品主面板取证；`page` 允许用整页（含页脚）取证。 */
  scope: MarketReadinessScope;
  /** 适用品类；空数组表示不限品类。 */
  categories: string[];
  /** 知识库里对应的规则编号，报告里不展示，只用于追溯口径。 */
  references: string[];
  /** 页面未展示时的默认改法；命中证据后会替换成更具体的一句。 */
  missingFix: string;
}

/** 带市电的产品品类：电压/插头与认证展示这两项只对这些品类适用。 */
export const ELECTRICAL_CATEGORIES = [
  "small_appliances",
  "consumer_electronics",
  "beauty_personal_care",
  "home_living",
];

export const MARKET_READINESS_CHECKS: MarketReadinessCheckDef[] = [
  {
    id: "MY-MR-01",
    label: "英语变体一致性",
    scope: "page",
    categories: [],
    references: ["MY-LANG-03", "MY-LANG-04"],
    missingFix: "统一使用马来西亚英语（英式拼写），并清理未翻译的中文残留。",
  },
  {
    id: "MY-MR-02",
    label: "货币与价格呈现",
    scope: "product",
    categories: [],
    references: ["MY-LANG-05", "MY-PRICE-01"],
    missingFix: "用 RM（MYR）标价，并在价格旁写明含税/未税口径。",
  },
  {
    id: "MY-MR-03",
    label: "计量单位（公制）",
    scope: "product",
    categories: [],
    references: ["MY-LANG-06"],
    missingFix: "规格表统一用公制：cm / kg / ml / L / W / V，不再混写英制。",
  },
  {
    id: "MY-MR-04",
    label: "电压与插头",
    scope: "product",
    categories: ELECTRICAL_CATEGORIES,
    references: ["MY-APP-01", "MY-SPEC-01"],
    missingFix: "在规格表写明 230V / 50Hz 与 Type G 三脚插头；如走适配器方案，写清随箱附件。",
  },
  {
    id: "MY-MR-05",
    label: "本地联系方式",
    scope: "page",
    categories: [],
    references: ["MY-SERVICE-01", "MY-ECOM-01"],
    missingFix: "补马来西亚本地电话、营业地址与工作时间，而不是只留中国总部联系方式。",
  },
  {
    id: "MY-MR-06",
    label: "配送、退换与保修",
    scope: "page",
    categories: [],
    references: ["MY-ECOM-03", "MY-WARRANTY-01"],
    missingFix: "分别写清是否配送马来西亚（含东马）、退换地址与期限、保修范围与联系人。",
  },
  {
    id: "MY-MR-07",
    label: "本地支付方式",
    scope: "page",
    categories: [],
    references: ["MY-PAY-01"],
    missingFix: "列出马来西亚常用支付方式，例如 FPX、本地银行转账与本地电子钱包。",
  },
  {
    id: "MY-MR-08",
    label: "认证标志展示",
    scope: "page",
    categories: ELECTRICAL_CATEGORIES,
    references: ["MY-APP-01", "MY-3C-01"],
    missingFix: "在规格或页脚展示 SIRIM / Safety Mark 等标志与证书编号，并给出可核对的来源。",
  },
];

export function checkById(id: string): MarketReadinessCheckDef {
  const found = MARKET_READINESS_CHECKS.find((check) => check.id === id);
  if (!found) throw new Error(`未知的市场就绪度检查：${id}`);
  return found;
}
