import type { KbDigest, ModelReport, Report } from "../src/types.js";

export const PAGE_TEXT = [
  "Welcome to Example Store",
  "Free shipping",
  "Call 03-123 4567",
  "Bestsellers",
  "Price RM99.00",
].join("\n");

export function buildModelReport(kb: KbDigest): ModelReport {
  return {
    summary:
      "测试摘要：首屏只有欢迎语与商品列表，缺少本地支付方式与可用的联络渠道；建议先补 FPX 与 WhatsApp 入口，再写清免运费条件。",
    risks: [
      {
        severity: "high",
        quote: "Call 03-123 4567",
        why: "马来西亚固话为 03-XXXXXXXX，八位号码缺位会被本地用户当成模板占位符。",
        fix: "换成完整可拨号码，并在页脚与联系页保持一致。",
      },
      {
        severity: "medium",
        quote: "Free shipping",
        why: "没有写清免运费门槛与东马适用规则，东马买家容易在结算时产生运费争议。",
        fix: "写成「Free shipping over RM150 (Peninsular Malaysia)」，并注明沙巴、砂拉越时效。",
      },
      {
        severity: "low",
        quote: "Welcome to Example Store",
        why: "首屏只有欢迎语，没有回答为什么选择这个品牌。",
        fix: "改成一句价值主张，并配一个主 CTA。",
      },
    ],
    strengths: [
      {
        quote: "Price RM99.00",
        why: "价格使用 RM 与两位小数，符合本地价格阅读习惯。",
      },
    ],
    not_assessable: [
      {
        item: "结算页支持的支付方式",
        reason: "首页没有出现支付图标，无法判断实际支持哪些渠道。",
      },
    ],
    dimensions: kb.dimensions.map((dimension, index) => ({
      name: dimension.name,
      status: index < 3 ? "risk" : "not_assessable",
      note: `测试维度依据 ${index + 1}：首页只提供有限信息。`,
    })),
  };
}

/** 市场就绪度 8 条检查的测试样本：覆盖全部四种状态，引用都取自 PAGE_TEXT。 */
const MARKET_READINESS_FIXTURE = [
  { checkId: "MY-MR-01", label: "英语变体一致性", status: "present" as const, quote: "Welcome to Example Store", why: "正文以英文呈现，未命中美式拼写清单。", fix: "保持英式拼写。", evidence: "整页可见文本 · 命中：英文正文" },
  { checkId: "MY-MR-02", label: "货币与价格呈现", status: "needs_review" as const, quote: "Price RM99.00", why: "价格以 RM 展示，但没有含税/未税说明。", fix: "写明 Price inclusive of SST。", evidence: "商品主面板 · 命中：RM99.00" },
  { checkId: "MY-MR-03", label: "计量单位（公制）", status: "present" as const, quote: "Price RM99.00", why: "规格使用公制单位。", fix: "保持公制写法。", evidence: "商品主面板 · 命中：公制" },
  { checkId: "MY-MR-04", label: "电压与插头", status: "missing" as const, quote: "", why: "页面未展示电压与插头。", fix: "补 230V / 50Hz 与 Type G。", evidence: "商品主面板 · 电压命中 0" },
  { checkId: "MY-MR-05", label: "本地联系方式", status: "present" as const, quote: "Call 03-123 4567", why: "页面给出本地电话。", fix: "补工作时间。", evidence: "整页可见文本 · 命中：本地电话" },
  { checkId: "MY-MR-06", label: "配送、退换与保修", status: "needs_review" as const, quote: "Free shipping", why: "只有一句免运费，缺区域与时效。", fix: "写清西马/东马与时效。", evidence: "整页可见文本 · 命中：配送" },
  { checkId: "MY-MR-07", label: "本地支付方式", status: "missing" as const, quote: "", why: "页面未列出支付方式。", fix: "列 FPX 与本地钱包。", evidence: "整页可见文本 · 支付方式 0 命中" },
  { checkId: "MY-MR-08", label: "认证标志展示", status: "not_applicable" as const, quote: "", why: "本页不是商品详情页，认证展示不在本页范围。", fix: "本项不适用，无需改动。", evidence: "适用性判定：不适用" },
].map((item) => ({ ...item, dimension: "market_readiness" as const }));

/** 合规条目（RAY-698）：网页与 PDF 都要渲染法条、核验日期与「需专业审核」。 */
const COMPLIANCE_FIXTURE = [
  {
    severity: "high" as const,
    quote: "We are a SIRIM certified local distributor.",
    why: "CPA 1999 s.10(1)(h)：认证类宣称需要能出示证书编号与适用范围；报告只记「需要证明」，不判断真假。",
    fix: "把 SIRIM 证书编号、型号范围与有效期写进页面；拿不出证书就删去该表述。",
    dimension: "compliance" as const,
    law_name: "Consumer Protection Act 1999 (Act 599) 消费者保护法 1999",
    article: "s.10(1)(h)",
    decision_level: "substantiation" as const,
    review_required: true,
    last_verified: "2026-11-14",
    confidence: "high" as const,
    evidence: "规则 MY-ADV-04 · CPA 1999 s.10(1)(h) · 官方来源 https://lom.agc.gov.my/ · 取证：整页句子行 · 命中：sirim certified",
  },
];

export function buildReport(kb: KbDigest): Report {
  return {
    ...buildModelReport(kb),
    risks: [...buildModelReport(kb).risks, ...COMPLIANCE_FIXTURE],
    market_readiness: MARKET_READINESS_FIXTURE,
    meta: {
      url: "https://example.com/",
      final_url: "https://example.com/",
      title: "Example Home",
      market: "MY",
      market_name: "马来西亚",
      category: "small_appliances",
      category_name: "小家电",
      generated_at: "2026-11-12T20:45:00+08:00",
      tier: "Lite",
      source_chars: PAGE_TEXT.length,
      knowledge_version: kb.version,
      agent_version: "0.1.0",
    },
  };
}
