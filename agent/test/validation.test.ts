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
