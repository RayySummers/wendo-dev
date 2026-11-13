import assert from "node:assert/strict";
import test from "node:test";
import { retrieveKb, signalMatches } from "../src/tools/retrieve-kb.js";
import { validateReport } from "../src/tools/score-and-report.js";
import { PAGE_TEXT, buildModelReport } from "./helpers.js";

test("signalMatches 使用词边界，短信号不会误命中单词内部", () => {
  assert.equal(signalMatches("the form is here", "rm"), false);
  assert.equal(signalMatches("price RM150", "rm"), true);
  assert.equal(signalMatches("chat on whatsapp", "whatsapp"), true);
  assert.equal(signalMatches("pengukus elektrik", "pengukus"), true);
});

test("retrieve_kb 返回全部维度，并按页面信号排序", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  assert.equal(kb.market, "MY");
  assert.equal(kb.category, "small_appliances");
  assert.equal(kb.dimensions.length, 8);
  assert.ok(kb.excerpts.length >= 2);
  assert.ok(kb.totalHits > 0);
  // 命中数单调不增
  for (let index = 1; index < kb.dimensions.length; index += 1) {
    assert.ok(kb.dimensions[index - 1]!.hits >= kb.dimensions[index]!.hits);
  }
});

test("合法报告通过校验", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const outcome = validateReport(buildModelReport(kb), PAGE_TEXT, kb);
  assert.deepEqual(outcome.problems, []);
  assert.ok(outcome.report);
  assert.equal(outcome.report.risks.length, 3);
});

test("引用不是页面原文时被拒绝", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const report = buildModelReport(kb);
  report.risks[0]!.quote = "Call us anytime";
  const outcome = validateReport(report, PAGE_TEXT, kb);
  assert.ok(outcome.problems.some((problem) => problem.includes("未在页面正文中逐字出现")));
});

test("出现分数字段或打分表达时被拒绝", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const withScore = { ...buildModelReport(kb), score: 82 };
  assert.ok(
    validateReport(withScore, PAGE_TEXT, kb).problems.some((problem) => problem.includes("分数字段")),
  );

  const withPhrase = buildModelReport(kb);
  withPhrase.summary = "页面整体评分 8 分，主要问题是缺少支付方式。";
  assert.ok(
    validateReport(withPhrase, PAGE_TEXT, kb).problems.some((problem) => problem.includes("打分表达")),
  );
});

test("正常的时间描述不会被误判为打分", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const report = buildModelReport(kb);
  report.risks[1]!.fix = "东马配送通常需要 7–14 个工作日，请在 10 分钟内回复客户咨询。";
  const outcome = validateReport(report, PAGE_TEXT, kb);
  assert.equal(outcome.problems.length, 0);
});

test("风险少于 3 条时被拒绝（结构校验）", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const report = buildModelReport(kb);
  report.risks = report.risks.slice(0, 2);
  const outcome = validateReport(report, PAGE_TEXT, kb);
  assert.ok(outcome.problems.some((problem) => problem.includes("结构错误 risks")));
});

test("维度缺失时被拒绝", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const report = buildModelReport(kb);
  report.dimensions = report.dimensions.slice(0, 6);
  const outcome = validateReport(report, PAGE_TEXT, kb);
  assert.ok(outcome.problems.some((problem) => problem.includes("dimensions 缺少维度")));
});

test("MY-UI-* 规则进入检索结果，且只在有文本证据时命中", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const ui = kb.dimensions.flatMap((dimension) => dimension.rules).filter((rule) =>
    rule.id.startsWith("MY-UI-"),
  );
  assert.equal(ui.length, 10, "10 条 MY-UI 规则都应被检索到");

  // 该 fixture 是英文首页，没有「仅/一键/立即」，不应命中 MY-UI-07。
  const ui07 = ui.find((rule) => rule.id === "MY-UI-07")!;
  assert.deepEqual(ui07.matchedSignals, []);

  // 规则文本即使没有信号也要进 prompt（与 MY-PRICE-02 同口径）。
  assert.ok(ui07.rule.length > 0);
  assert.ok(ui07.why.length > 0);
  assert.ok(ui07.fix.length > 0);
});

test("MY-UI-07 只收「补丁词」，不把新闻里的「仅」和普通 CTA 当证据", async () => {
  // 真·补丁词：用副词区分两个近义动作。
  const patch = await retrieveKb({ pageText: "仅需 3 步完成下单" });
  const fromPatch = patch.dimensions
    .flatMap((dimension) => dimension.rules)
    .find((rule) => rule.id === "MY-UI-07")!;
  assert.deepEqual(fromPatch.matchedSignals, ["仅需"]);

  // 「仅批准」是「只」的意思，不是界面补丁词。
  const prose = await retrieveKb({ pageText: "政府仅批准两项申请，另有 3 项待审。" });
  const fromProse = prose.dimensions
    .flatMap((dimension) => dimension.rules)
    .find((rule) => rule.id === "MY-UI-07")!;
  assert.deepEqual(fromProse.matchedSignals, []);

  // 「立即购买」是正常电商 CTA（三星中国等站的真实写法），不作为补丁词证据。
  const cta = await retrieveKb({ pageText: "立即购买 Galaxy S26 Ultra" });
  const fromCta = cta.dimensions
    .flatMap((dimension) => dimension.rules)
    .find((rule) => rule.id === "MY-UI-07")!;
  assert.deepEqual(fromCta.matchedSignals, []);
});

test("没有截断标记的英文页面不命中 MY-UI-02", async () => {
  const kb = await retrieveKb({ pageText: "Read More\nView All\nShop Now" });
  const ui02 = kb.dimensions
    .flatMap((dimension) => dimension.rules)
    .find((rule) => rule.id === "MY-UI-02")!;
  assert.deepEqual(ui02.matchedSignals, [], "read more / view all 不是截断证据");
});

test("MY-UI-09 命中真实页面抓到的 voice 文案，且规则文本进入 prompt", async () => {
  // 取自 https://www.easyparcel.my/quote 的 404 页（2026-11-14 抓取，站点提供 EN/中文/Malay）。
  const pageText = [
    "Oops! Page Not Found - 404 Error | EasyParcel Malaysia",
    "Ship Valuable International Parcels with EasyCover Protection Up To RM10,000!",
    "Learn More",
  ].join("\n");
  const kb = await retrieveKb({ pageText });
  const ui09 = kb.dimensions
    .flatMap((dimension) => dimension.rules)
    .find((rule) => rule.id === "MY-UI-09")!;
  assert.deepEqual(ui09.matchedSignals, ["oops"]);
  assert.ok(ui09.fix.includes("round-trip"), "声音层必须给 round-trip 的改法");

  const { buildUserPrompt } = await import("../src/tools/score-and-report.js");
  const prompt = buildUserPrompt(
    {
      url: "https://www.easyparcel.my/quote",
      finalUrl: "https://www.easyparcel.my/quote",
      status: 404,
      title: "Oops! Page Not Found",
      text: pageText,
      charCount: pageText.length,
      fetchedAt: "2026-11-14T00:00:00+08:00",
      elapsedMs: 1,
      fetcher: "test",
    },
    kb,
  );
  assert.ok(prompt.includes("[MY-UI-09]"), "MY-UI-09 应进入诊断 prompt");
  assert.ok(prompt.includes("［命中：oops］"), "prompt 应带上命中标记");
  for (let i = 1; i <= 10; i += 1) {
    assert.ok(prompt.includes(`[MY-UI-${String(i).padStart(2, "0")}]`), `MY-UI-${i} 应进入 prompt`);
  }
});
