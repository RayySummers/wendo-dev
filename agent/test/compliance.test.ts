import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_COMPLIANCE_FINDINGS,
  analyzeCompliance,
  complianceDimension,
  complianceRisks,
  complianceSummary,
} from "../src/compliance/analyze.js";
import {
  COMPLIANCE_MATCHERS,
  COMPLIANCE_SKIP_REASONS,
  myRules,
  ruleById,
  rulesVersion,
  uncoveredRuleIds,
} from "../src/compliance/rules.js";
import { ReportSchema } from "../src/types.js";
import { retrieveKb } from "../src/tools/retrieve-kb.js";
import { buildReport } from "./helpers.js";

/** 真实马来西亚小家电页的骨架：主面板 + 详情区 + 导航/推荐位噪音。 */
const CLAIM_PAGE = [
  "KHIND 3.5L Air Fryer ARF35C",
  "-33%",
  "RM 199.00",
  "Save RM0.00",
  "From RM49.92 / month",
  "Add to Cart",
  "Wireless Chargers",
  "Premium Garment Steamer",
  "Top Selling",
  "Description",
  "Features",
  "- Durable Ceramic Coated Inner Pan",
  "- Overheating Protection",
  "As KHIND Online Store, our products are 100% brand new, original and according to SIRIM safety standards.",
  "Limited Edition",
  "Recommended Product",
  "Premium Garment Steamer",
  "Wireless Chargers",
].join("\n");

/** 只有英文的完整商品页（≥6 条句子行，用于语言披露检查）。 */
const ENGLISH_PAGE = [
  "KHIND 3.5L Air Fryer ARF35C",
  "RM 199.00",
  "Description",
  "- Durable Ceramic Coated Inner Pan",
  "Enjoy FREE shipping within West Malaysia when you purchase KHIND appliances worth RM200 and above in a single order!",
  "We will reply you within 24 hours, except weekends and Public Holidays.",
  "All returns must be clarified and approved by our customer service team before being sent back.",
  "If there is damage upon receiving your product, kindly notify us with photo or video proof.",
  "As our products come with a warranty, you may register with us online via the e-warranty page.",
  "We have 10 service centres nationwide, you may find the nearest centre around you.",
].join("\n");

const MALAY_PAGE = [
  "KHIND 3.5L Air Fryer ARF35C",
  "RM 199.00",
  "Description",
  "Penghantaran percuma untuk pembelian melebihi RM200 dan waranti selama satu tahun.",
  "Harga yang dipaparkan adalah untuk penghantaran ke Semenanjung Malaysia sahaja.",
  "Sila hubungi kami untuk sebarang pertanyaan mengenai produk ini.",
  "Kami akan membalas dalam masa 24 jam pada hari bekerja.",
  "Alamat pusat servis boleh didapati di laman web kami.",
  "Produk ini disokong oleh jaminan pengeluar selama dua belas bulan.",
].join("\n");

function analyze(text: string, category = "small_appliances") {
  return analyzeCompliance({ text, category, url: "https://example.com.my/product" });
}

test("规则库：45 条规则都能加载，且每条都有判定或跳过原因", () => {
  const rules = myRules();
  assert.equal(rules.length, 45);
  assert.equal(new Set(rules.map((rule) => rule.id)).size, 45);
  assert.deepEqual(uncoveredRuleIds(), []);
  const covered = new Set([
    ...COMPLIANCE_MATCHERS.map((matcher) => matcher.ruleId),
    ...COMPLIANCE_SKIP_REASONS.flatMap((reason) => reason.ruleIds),
  ]);
  for (const rule of rules) {
    assert.ok(covered.has(rule.id), `${rule.id} 既没判定也没记跳过原因`);
  }
  // 跳过的每条规则都要写明原因，不能只留 id。
  for (const reason of COMPLIANCE_SKIP_REASONS) {
    assert.ok(reason.reason.length > 10);
  }
});

test("规则库：判定层级只来自规则库，代码不改写", () => {
  for (const matcher of COMPLIANCE_MATCHERS) {
    const rule = ruleById(matcher.ruleId);
    assert.ok(rule.article, `${rule.id} 缺条文号`);
    assert.ok(rule.official_url.startsWith("https://"), `${rule.id} 缺官方 URL`);
    assert.ok(rule.last_verified, `${rule.id} 缺核验日期`);
  }
});

test("finding：每条都能回到规则库的 id + 条文 + 官方 URL，引用是页面原文", () => {
  const analysis = analyze(CLAIM_PAGE);
  assert.ok(analysis.findings.length >= 4);
  for (const item of analysis.findings) {
    const rule = ruleById(item.ruleId);
    assert.equal(item.decisionLevel, rule.decision_level);
    assert.equal(item.article, rule.article);
    assert.equal(item.lawName, rule.law_name);
    assert.equal(item.lastVerified, rule.last_verified);
    assert.ok(item.evidence.includes(`规则 ${rule.id}`));
    assert.ok(item.evidence.includes(rule.official_url));
    assert.ok(CLAIM_PAGE.includes(item.quote), `引用不在页面原文里：${item.quote}`);
    assert.equal(item.dimension, "compliance");
  }
});

test("finding：三档判定都能出，且措辞不含判决式说法", () => {
  const analysis = analyze(CLAIM_PAGE);
  const levels = new Set(analysis.findings.map((item) => item.decisionLevel));
  assert.ok(levels.has("rule_level"), "缺规则直判");
  assert.ok(levels.has("substantiation"), "缺需事实核实");
  assert.ok(levels.has("human_review"), "缺需人工判断");
  const forbidden = /合法|违法|保证通过|已认证/;
  for (const item of analysis.findings) {
    for (const field of [item.why, item.fix, item.quote, item.evidence]) {
      assert.ok(!forbidden.test(field), `出现判决式措辞：${field}`);
    }
  }
});

test("finding：high 级与 human_review 默认标「需专业审核」", () => {
  const analysis = analyze(CLAIM_PAGE);
  for (const item of analysis.findings) {
    if (item.severity === "high" || item.decisionLevel === "human_review") {
      assert.equal(item.reviewRequired, true, `${item.ruleId} 应标需专业审核`);
    }
  }
  assert.ok(analysis.counts.reviewRequired >= 1);
});

test("误报：导航、推荐位、零折扣、分期月供、测试条件不进报告", () => {
  const analysis = analyze(
    [
      "Bear 6.5L Air Fryer",
      "RM 299.00",
      "From RM49.92 / month",
      "Save RM0.00",
      "Description",
      "- 6.5L capacity with non-stick basket",
      "The earbuds were tested with their batteries charged to 100%, the volume adjusted to 50%.",
      "Recommended Product",
      "Premium Garment Steamer",
      "Wireless Chargers",
      "Top Selling",
    ].join("\n"),
  );
  const quotes = analysis.findings.map((item) => item.quote);
  assert.ok(!quotes.includes("Wireless Chargers"));
  assert.ok(!quotes.includes("Premium Garment Steamer"));
  assert.ok(!quotes.some((quote) => quote.includes("charged to 100%")));
  assert.ok(!analysis.findings.some((item) => item.ruleId === "MY-ADV-07"), "分期月供被当成诱饵价");
  assert.ok(!analysis.findings.some((item) => item.ruleId === "MY-ADV-08"), "赔偿 voucher 被当成赠品");
});

test("误报：6.5L 不会被当成 5l 容量声明", () => {
  const analysis = analyze(["Bear Air Fryer", "RM 299.00", "Description", "- 6.5L capacity"] .join("\n"));
  assert.ok(!analysis.findings.some((item) => item.ruleId === "MY-ADV-02"));
});

test("去重：同一规则只出一条；同一句同层级合并并保留各法条", () => {
  const analysis = analyze([
    "Bear Air Fryer",
    "RM 299.00",
    "Description",
    "- Ceramic coated inner pan, ceramic coating on the basket",
    "Food grade ceramic coating for easy cleaning.",
  ].join("\n"));
  const ceramic = analysis.findings.filter((item) => item.ruleId === "MY-ADV-02");
  assert.equal(ceramic.length, 1);
  const merged = analysis.findings.find((item) => item.ruleId === "MY-ADV-02");
  assert.ok(merged?.evidence.includes("MY-FOOD-02"), "同一句的食品接触法条应保留在 evidence");
});

test("跨层级：同一句的「需事实核实」与「需人工判断」各自成条，不互相吞掉", () => {
  const analysis = analyze([
    "Bear Air Fryer",
    "RM 299.00",
    "Description",
    "100% guaranteed satisfaction for every customer.",
    "Our products are SIRIM certified and lab tested by an independent body.",
  ].join("\n"));
  const ids = analysis.findings.map((item) => item.ruleId);
  assert.ok(ids.includes("MY-ADV-01"), `缺需人工判断条目：${ids.join(",")}`);
  assert.ok(ids.includes("MY-ADV-04"), `缺需事实核实条目：${ids.join(",")}`);
  const levels = new Set(analysis.findings.map((item) => item.decisionLevel));
  assert.ok(levels.size >= 2);
});

test("缺席检查：整页英文 → 语言披露 finding；有马来语 → 不出", () => {
  const english = analyze(ENGLISH_PAGE);
  assert.ok(english.findings.some((item) => item.ruleId === "MY-ECOM-06"));
  const malay = analyze(MALAY_PAGE);
  assert.ok(!malay.findings.some((item) => item.ruleId === "MY-ECOM-06"));
});

test("缺席检查：有隐私政策链接就不出隐私告知 finding", () => {
  const withoutNotice = analyze([
    "Bear Air Fryer",
    "RM 299.00",
    "Have an account? Log in to check out faster.",
    "Subscribe to our newsletter for new arrivals.",
    "We reply within 24 hours on working days.",
    "Returns are accepted within 7 days with proof of purchase.",
    "Delivery takes 3 to 5 working days nationwide.",
  ].join("\n"));
  assert.ok(withoutNotice.findings.some((item) => item.ruleId === "MY-PRIV-01"));

  const withNotice = analyze(
    [
      "Bear Air Fryer",
      "RM 299.00",
      "Have an account? Log in to check out faster.",
      "Read our Privacy Policy for how we handle your personal data.",
      "We reply within 24 hours on working days.",
      "Returns are accepted within 7 days with proof of purchase.",
      "Delivery takes 3 to 5 working days nationwide.",
    ].join("\n"),
  );
  assert.ok(!withNotice.findings.some((item) => item.ruleId === "MY-PRIV-01"));
});

test("限量声明：写了数量或期间就不出 finding", () => {
  const bare = analyze(["Bear Air Fryer", "RM 299.00", "Description", "Limited Edition"] .join("\n"));
  assert.ok(bare.findings.some((item) => item.ruleId === "MY-ADV-09"));

  const withTerms = analyze(
    ["Bear Air Fryer", "RM 299.00", "Description", "Limited Edition", "Only 200 units, until 31 December 2026."].join("\n"),
  );
  assert.ok(!withTerms.findings.some((item) => item.ruleId === "MY-ADV-09"));
});

test("Halal：声称 halal 但页面看不到证书 → 规则级 finding；有 JAKIM 证书 → 不出", () => {
  const bare = analyze([
    "Bear Air Fryer",
    "RM 299.00",
    "Description",
    "Halal certified inner pot, suitable for muslim families.",
  ].join("\n"));
  const halal = bare.findings.find((item) => item.ruleId === "MY-HALAL-01");
  assert.ok(halal);
  assert.equal(halal?.decisionLevel, "rule_level");
  assert.equal(halal?.reviewRequired, true);

  const certified = analyze(
    [
      "Bear Air Fryer",
      "RM 299.00",
      "Description",
      "Halal certified inner pot, JAKIM certificate no. MY-2026-1234.",
    ].join("\n"),
  );
  assert.ok(!certified.findings.some((item) => item.ruleId === "MY-HALAL-01"));
});

test("确定性：同一页跑两遍结果完全一致，且条目数有上限", () => {
  const first = analyze(CLAIM_PAGE);
  const second = analyze(CLAIM_PAGE);
  assert.equal(JSON.stringify(first.findings), JSON.stringify(second.findings));
  assert.ok(first.findings.length <= MAX_COMPLIANCE_FINDINGS);
});

test("维度行：没有命中时写「无法判断」，不写成没问题", () => {
  const empty = analyze(["Bear Air Fryer", "RM 299.00", "Description", "A simple product page."].join("\n"));
  const dimension = complianceDimension(empty);
  assert.equal(dimension.name, "合规与风险");
  if (!empty.counts.total) assert.equal(dimension.status, "not_assessable");
  assert.ok(complianceSummary(empty).includes("合规规则命中"));
});

test("报告契约：合规条目能被 ReportSchema 接受，旧字段仍然可选", async () => {
  const kb = await retrieveKb({ pageText: ENGLISH_PAGE, category: "small_appliances" });
  const base = buildReport(kb);
  const analysis = analyze(ENGLISH_PAGE);
  const report = ReportSchema.parse({
    ...base,
    risks: [...base.risks, ...complianceRisks(analysis)],
    dimensions: [
      ...base.dimensions,
      complianceDimension(analysis),
    ],
  });
  const compliance = report.risks.filter((risk) => risk.dimension === "compliance");
  assert.ok(compliance.length >= 1);
  for (const risk of compliance) {
    assert.ok(risk.law_name);
    assert.ok(risk.article);
    assert.ok(risk.decision_level);
    assert.equal(typeof risk.review_required, "boolean");
    assert.ok(risk.last_verified);
    assert.ok(risk.confidence);
  }
  // 旧四维报告（没有合规字段）仍然能过 schema。
  assert.ok(ReportSchema.safeParse(base).success);
  assert.equal(rulesVersion(), myRules()[0] ? rulesVersion() : "");
});
