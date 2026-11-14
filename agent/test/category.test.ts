import assert from "node:assert/strict";
import test from "node:test";
import { CategoryError, resolveCategoryProfile } from "../src/categories.js";
import { buildUserPrompt } from "../src/tools/score-and-report.js";
import { retrieveKb } from "../src/tools/retrieve-kb.js";
import type { FetchedPage } from "../src/types.js";

const PAGE_TEXT =
  "iPhone 18 Pro. Pay 0% interest for up to 24 months. Apple Trade In. " +
  "Find an Apple Store or other retailer near you. Call 1800-80-6419.";

function page(text = PAGE_TEXT): FetchedPage {
  return {
    url: "https://www.apple.com/my/",
    finalUrl: "https://www.apple.com/my/",
    status: 200,
    title: "Apple (Malaysia)",
    text,
    charCount: text.length,
    fetchedAt: "2026-11-14T00:00:00+08:00",
    elapsedMs: 1200,
    fetcher: "test",
  };
}

test("品类解析：默认小家电，兼容连字符写法，未知品类直接失败", () => {
  assert.equal(resolveCategoryProfile().code, "small_appliances");
  assert.equal(resolveCategoryProfile("").code, "small_appliances");
  assert.equal(resolveCategoryProfile("consumer-electronics").code, "consumer_electronics");
  assert.equal(resolveCategoryProfile("consumer_electronics").name, "3C 数码");
  assert.throws(
    () => resolveCategoryProfile("food_beverage"),
    (error: unknown) => error instanceof CategoryError && /未知品类/.test(error.message),
  );
});

test("retrieve_kb：3C 品类读自己的索引，不混入小家电专属规则", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT, category: "consumer_electronics" });
  assert.equal(kb.market, "MY");
  assert.equal(kb.category, "consumer_electronics");
  assert.equal(kb.categoryName, "3C 数码");
  assert.equal(kb.dimensions.length, 9);
  assert.ok(kb.scope?.includes("3C 数码"));
  assert.ok(kb.excerpts.some((excerpt) => excerpt.source === "knowledge/my/consumer-electronics.md"));

  const ids = kb.dimensions.flatMap((dimension) => dimension.rules.map((rule) => rule.id));
  assert.ok(ids.every((id) => id.startsWith("MY-CE-")));
  assert.ok(!ids.includes("MY-TRUST-02"), "小家电的食品接触/halal 规则不能进入 3C 口径");

  const text = kb.dimensions.flatMap((dimension) => dimension.rules.map((rule) => rule.rule)).join("\n");
  assert.ok(!/BPA|halal certified|食品接触/.test(text), "3C 规则正文不应包含小家电专属判断");
});

test("retrieve_kb：不传品类时仍以小家电为默认，行为不变", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  assert.equal(kb.category, "small_appliances");
  assert.equal(kb.categoryName, "小家电");
  assert.equal(kb.dimensions.length, 8);
  assert.ok(kb.excerpts.some((excerpt) => excerpt.source === "knowledge/my/small-appliances.md"));
});

test("user prompt：写入品类口径，并要求模型不要跨品类套规则", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT, category: "consumer_electronics" });
  const prompt = buildUserPrompt(page(), kb);
  assert.ok(prompt.includes("品类：3C 数码"));
  assert.ok(prompt.includes("【品类口径】"));
  assert.ok(prompt.includes("不包含小家电的食品接触"));
  assert.ok(prompt.includes("MY-CE-SPEC-01"));
});
