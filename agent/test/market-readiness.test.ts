import assert from "node:assert/strict";
import test from "node:test";
import {
  MARKET_READINESS_DIMENSION_NAME,
  MARKET_READINESS_LIMIT,
  analyzeMarketReadiness,
  findProductPanel,
  isSubstantiveLine,
  marketReadinessDimensionStatus,
  marketReadinessNote,
} from "../src/market-readiness/analyze.js";
import { MARKET_READINESS_CHECKS } from "../src/market-readiness/rules.js";
import { MARKET_READINESS_STATUSES } from "../src/market-readiness/types.js";

/** 齐全的马来西亚小家电商品页：8 项都应判 present。 */
const GOOD_PAGE = [
  "Bear Malaysia",
  "Search",
  "Home Appliances",
  "3L Electric Air Fryer BA-A3L",
  "RM 299.00",
  "Price inclusive of SST.",
  "Capacity 3 L",
  "Power 1500 W",
  "Voltage 230V / 50Hz",
  "Plug type: Type G (3-pin)",
  "SIRIM QAS certificate no. PQ-2026-1234",
  "We deliver to Peninsular Malaysia and East Malaysia within 3-5 working days.",
  "Returns accepted within 7 days at our Selangor service centre.",
  "1 year warranty, contact our service team for claims.",
  "Pay with FPX, Maybank2u, Touch 'n Go eWallet and GrabPay.",
  "Hotline +603-1234 5678",
  "Mon-Fri 9.00am - 6.00pm",
].join("\n");

/** 只有导航/页脚链接标签的页面：不能被当成「已经说明」。 */
const NAV_ONLY_PAGE = [
  "Shop",
  "Wireless Chargers",
  "Big TV 75-inch & above",
  "Delivery",
  "Returns & Refunds",
  "Warranty",
  "Terms and Conditions",
  "Privacy Policy",
  "Copyright 2026 Example Sdn Bhd",
].join("\n");

/** 中国站直搬页面：人民币、英制、只有中国总部电话、无认证无本地支付。 */
const FOREIGN_PAGE = [
  "多功能电炸锅 AF-30",
  "¥ 399.00",
  "Product size 12.6 inch, weight 8.8 lbs",
  "Hotline +86 138 0000 0000",
  "Nationwide Delivery",
  "Warranty",
].join("\n");

function analyze(text: string, category = "small_appliances") {
  return analyzeMarketReadiness({ text, category });
}

function byId(findings: ReturnType<typeof analyze>["findings"], id: string) {
  const found = findings.find((item) => item.checkId === id);
  assert.ok(found, `缺少 ${id}`);
  return found;
}

test("8 条检查：ID 唯一、顺序固定、维度统一", () => {
  const { findings } = analyze(GOOD_PAGE);
  assert.equal(findings.length, 8);
  assert.deepEqual(
    findings.map((item) => item.checkId),
    ["MY-MR-01", "MY-MR-02", "MY-MR-03", "MY-MR-04", "MY-MR-05", "MY-MR-06", "MY-MR-07", "MY-MR-08"],
  );
  assert.equal(new Set(findings.map((item) => item.checkId)).size, 8);
  assert.equal(new Set(MARKET_READINESS_CHECKS.map((item) => item.id)).size, 8);
  for (const item of findings) {
    assert.equal(item.dimension, "market_readiness");
    assert.ok(MARKET_READINESS_STATUSES.includes(item.status));
    assert.ok(item.label.length >= 2);
    assert.ok(item.why.length >= 2);
    assert.ok(item.fix.length >= 2);
  }
});

test("页面信息齐全时 8 项都判 present，并给出原文引用", () => {
  const { findings, counts } = analyze(GOOD_PAGE);
  assert.deepEqual(counts, { present: 8, missing: 0, not_applicable: 0, needs_review: 0 });
  for (const item of findings) {
    assert.equal(item.status, "present", `${item.checkId} 应为 present`);
    assert.ok(item.quote.length > 0, `${item.checkId} 应有引用`);
    assert.ok(GOOD_PAGE.includes(item.quote), `${item.checkId} 的引用必须是原文子串`);
  }
  assert.equal(marketReadinessDimensionStatus(counts), "ok");
  assert.match(marketReadinessNote(counts), /已展示 8 项/);
});

test("导航/页脚标签不算证据：缺信息时判 missing 且 quote 为空", () => {
  const { findings } = analyze(NAV_ONLY_PAGE);
  const fulfilment = byId(findings, "MY-MR-06");
  assert.equal(fulfilment.status, "missing");
  assert.equal(fulfilment.quote, "");
  const hybrid = findings.filter((item) => item.status === "missing");
  assert.ok(hybrid.length >= 4, `应有多项未展示，实际 ${hybrid.length}`);
  for (const item of hybrid) assert.equal(item.quote, "", `${item.checkId} 不应编造原文`);
});

test("英制单位与外币会被识别，但不会被当成公制/本币", () => {
  const { findings } = analyze(FOREIGN_PAGE, "consumer_electronics");
  assert.equal(byId(findings, "MY-MR-03").status, "needs_review");
  assert.match(byId(findings, "MY-MR-03").quote, /inch|lbs/);
  assert.equal(byId(findings, "MY-MR-02").status, "needs_review");
  assert.match(byId(findings, "MY-MR-02").quote, /¥/);
  assert.equal(byId(findings, "MY-MR-05").status, "missing");
  assert.match(byId(findings, "MY-MR-05").quote, /\+86/);
  assert.equal(byId(findings, "MY-MR-08").status, "missing");
});

test("电压与插头：只写一半时判 needs_review", () => {
  const text = ["Air Fryer AF-30", "RM 299.00", "Rated voltage 230V / 50Hz", "Capacity 3 L"].join("\n");
  const { findings } = analyze(text);
  const power = byId(findings, "MY-MR-04");
  assert.equal(power.status, "needs_review");
  assert.match(power.quote, /230V/);
  assert.match(power.why, /插头/);
});

test("价格缺含税/未税说明时判 needs_review", () => {
  const text = ["Air Fryer AF-30", "RM 259.00", "Capacity 3 L", "Power 1500 W"].join("\n");
  const { findings } = analyze(text);
  const price = byId(findings, "MY-MR-02");
  assert.equal(price.status, "needs_review");
  assert.match(price.why, /含税|未税/);
});

test("非商品页：价格/单位/电压记为 not_applicable，并给出理由", () => {
  const text = [
    "About Us",
    "We are a kitchen appliance brand from Malaysia.",
    "Read our story and meet the team behind the products.",
  ].join("\n");
  const { findings } = analyze(text);
  for (const id of ["MY-MR-02", "MY-MR-03", "MY-MR-04"]) {
    const item = byId(findings, id);
    assert.equal(item.status, "not_applicable", `${id} 应为 not_applicable`);
    assert.ok(item.why.length > 10);
    assert.equal(item.quote, "");
  }
});

test("非电器品类：电压与认证不适用，但联系方式仍要检查", () => {
  const { findings } = analyze(GOOD_PAGE, "food_beverage");
  assert.equal(byId(findings, "MY-MR-04").status, "not_applicable");
  assert.equal(byId(findings, "MY-MR-08").status, "not_applicable");
  assert.equal(byId(findings, "MY-MR-05").status, "present");
});

test("同一页跑两遍结果完全一致", () => {
  const first = analyze(GOOD_PAGE);
  const second = analyze(GOOD_PAGE);
  assert.equal(JSON.stringify(first.findings), JSON.stringify(second.findings));
  assert.equal(JSON.stringify(first.counts), JSON.stringify(second.counts));
});

test("商品主面板：以价格锚点截取，推荐位里的英寸与无线充不进被诊商品", () => {
  const text = [
    "Home",
    "Wireless Chargers",
    "Big TV 75-inch & above",
    "Air Fryer AF-30",
    "RM 299.00",
    "Capacity 3 L",
    "Recommended Product",
    "Samsung 75-inch Neo QLED TV",
    "RM 9,999.00",
  ].join("\n");
  const panel = findProductPanel(text);
  assert.ok(panel.productLike);
  assert.match(panel.text, /Capacity 3 L/);
  assert.doesNotMatch(panel.text, /75-inch/);
  assert.doesNotMatch(panel.text, /9,999/);
});

test("超长原文按句/词截断，引用仍是原文子串且保留命中词", () => {
  const long = [
    "All our products come with a 1-year warranty, backed by our local team in Malaysia for your peace of mind. Each unit is certified by SIRIM Malaysia, ensuring compliance with national safety and quality standards. For added convenience, our products are fitted with the standard Malaysia 3-pin plug.",
    "RM 199.00",
  ].join("\n");
  const { findings } = analyze(long);
  const cert = byId(findings, "MY-MR-08");
  assert.equal(cert.status, "present");
  assert.ok(cert.quote.includes("SIRIM"), `引用应保留命中词：${cert.quote}`);
  const warranty = byId(findings, "MY-MR-06");
  assert.ok(warranty.quote.length > 0);
  for (const item of findings) {
    assert.ok(item.quote.length <= 180, `${item.checkId} 引用过长：${item.quote.length}`);
    assert.doesNotMatch(item.quote, /\b(?:with|to|for|from|and|or|of|the|a|an|at|on|by|in|as)$/i);
    assert.ok(long.includes(item.quote), `${item.checkId} 引用不是原文子串`);
  }
});

test("证据里不出现合法/违法/保证通过/已认证等结论性措辞", () => {
  const pages = [GOOD_PAGE, NAV_ONLY_PAGE, FOREIGN_PAGE];
  for (const page of pages) {
    const { findings } = analyze(page);
    for (const item of findings) {
      const text = `${item.why}${item.fix}${item.evidence ?? ""}`;
      assert.doesNotMatch(text, /合法|违法|保证通过|已认证/, `${item.checkId} 出现结论性措辞：${text}`);
    }
  }
});

test("isSubstantiveLine：标签不是句子，承诺才是", () => {
  assert.equal(isSubstantiveLine("Delivery"), false);
  assert.equal(isSubstantiveLine("Returns & Refunds"), false);
  assert.equal(isSubstantiveLine("Free Extra One Year Warranty"), false);
  assert.equal(isSubstantiveLine("Nationwide Delivery and Pick in Store"), true);
  assert.equal(isSubstantiveLine("We deliver to East Malaysia within 3-5 working days."), true);
  assert.equal(isSubstantiveLine("Copyright 2026 Example Sdn Bhd"), false);
});

test("维度说明与上限：只描述数量，不折算分数", () => {
  const note = marketReadinessNote({ present: 3, missing: 4, needs_review: 1, not_applicable: 0 });
  assert.match(note, /已展示 3 项/);
  assert.match(note, /未展示 4 项/);
  assert.match(note, /需复核 1 项/);
  assert.doesNotMatch(note, /\d+\s*分|评分|得分/);
  assert.equal(MARKET_READINESS_DIMENSION_NAME, "市场就绪度");
  assert.match(MARKET_READINESS_LIMIT.reason, /不核验/);
});
