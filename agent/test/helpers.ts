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

export function buildReport(kb: KbDigest): Report {
  return {
    ...buildModelReport(kb),
    meta: {
      source_type: "url",
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
