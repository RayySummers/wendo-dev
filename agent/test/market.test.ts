import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MarketError, resolveMarket } from "../src/market.js";
import { clearLegalLibraryCache } from "../src/compliance/library.js";
import { analyzeCompliance } from "../src/compliance/analyze.js";
import { buildReportMeta, runDiagnosis } from "../src/pipeline.js";
import { TIERS } from "../src/config.js";
import { retrieveKb } from "../src/tools/retrieve-kb.js";
import type { FetchedPage } from "../src/types.js";

const PAGE_TEXT = [
  "Bear Air Fryer 5L",
  "Free shipping",
  "2 year warranty",
  "Pay with PayNow",
  "Price S$99.00",
].join("\n");

interface FixtureMarket {
  code: string;
  name: string;
  countryFile: string;
  domain: string;
  /** 2026-07-15 的 UTC 偏移，用来核对 meta.generated_at。 */
  offset: string;
}

const FIXTURE_MARKETS: FixtureMarket[] = [
  { code: "SG", name: "新加坡", countryFile: "singapore.md", domain: "sso.agc.gov.sg", offset: "+08:00" },
  { code: "AE", name: "阿联酋", countryFile: "uae.md", domain: "uaelegislation.gov.ae", offset: "+04:00" },
  { code: "US", name: "美国", countryFile: "united-states.md", domain: "ftc.gov", offset: "-04:00" },
];

function fixturePage(): FetchedPage {
  return {
    url: "https://example.com/product",
    finalUrl: "https://example.com/product",
    status: 200,
    title: "Fixture product",
    text: PAGE_TEXT,
    charCount: PAGE_TEXT.length,
    fetchedAt: "2026-07-15T12:00:00Z",
    elapsedMs: 1,
    fetcher: "test",
  };
}

function kbIndex(market: FixtureMarket): string {
  return JSON.stringify(
    {
      market: market.code,
      market_name: market.name,
      category: "small_appliances",
      category_name: "小家电",
      version: `test-${market.code}-2026-11-18`,
      scope: "RAY-754 测试夹具：只验证按市场加载，不是生产知识库。",
      dimensions: [
        {
          id: "language",
          name: "语言与表达",
          source_sections: ["Section 1"],
          rules: [
            {
              id: `${market.code}-LANG-01`,
              severity_hint: "high",
              rule: "保修信息要说清年限与覆盖范围。",
              why: "测试夹具。",
              fix: "补全年限与覆盖范围。",
              signals: ["warranty"],
            },
            {
              id: `${market.code}-PAY-01`,
              severity_hint: "medium",
              rule: "支付方式要写本地可用渠道。",
              why: "测试夹具。",
              fix: "列出本地支付方式。",
              signals: ["paynow", "pay"],
            },
          ],
        },
      ],
    },
    null,
    2,
  );
}

function countryKb(market: FixtureMarket): string {
  return [
    `# ${market.name}国家知识库（测试夹具）`,
    "",
    "本文件只用于 RAY-754 的自动化测试，不包含生产内容。",
    "",
    "## Section 1 语言与表达",
    "",
    `这是 ${market.code} 的测试段落，用来验证 retrieve_kb 从 knowledge/${market.code.toLowerCase()}/ 读取，而不是 MY 目录。`,
    "",
  ].join("\n");
}

function legalRules(market: FixtureMarket): string {
  return JSON.stringify(
    {
      schema_version: "0.1",
      market: market.code,
      market_name: market.name,
      version: `test-${market.code}-v0.1`,
      scope: "测试夹具",
      last_verified: "2026-11-18",
      review_policy: "测试夹具不构成法律意见",
      rules: [
        {
          id: `${market.code}-LEGAL-01`,
          market: market.code,
          category: "general",
          law_name: `${market.name}测试法`,
          law_short: "Test Act",
          article: "s.1",
          article_type: "section",
          source_id: "test-fixture",
          official_url: `https://${market.domain}/test`,
          source_tier: "official",
          language: "en",
          effective_date: "2026-01-01",
          last_verified: "2026-11-18",
          rule_type: "advertising",
          decision_level: "human_review",
          claim_pattern: ["test"],
          requirement: "测试规则，仅用于夹具。",
          evidence_needed: "测试证据",
          penalty_or_note: "无",
          verbatim_excerpt: "test",
          confidence: "medium",
          review_required: true,
        },
      ],
    },
    null,
    2,
  );
}

/**
 * 建一份临时知识库根：四个市场文件 + legal/index.json。
 * 生产数据未就绪时，用它验证「按市场加载」这条链路本身是对的。
 */
async function withFixtureMarkets(run: () => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "wendo-markets-"));
  const knowledge = join(root, "knowledge");
  const legal = join(knowledge, "legal");
  const oldKnowledge = process.env.WENDO_KNOWLEDGE_DIR;
  const oldLegal = process.env.WENDO_LEGAL_DIR;

  try {
    await mkdir(legal, { recursive: true });
    await writeFile(
      join(legal, "index.json"),
      JSON.stringify(
        {
          version: "test",
          markets: FIXTURE_MARKETS.map((market) => ({
            market: market.code,
            market_name: market.name,
            status: "v0.1",
            open: true,
            rules_file: `${market.code.toLowerCase()}/rules.v0.1.json`,
          })),
        },
        null,
        2,
      ),
      "utf8",
    );

    for (const market of FIXTURE_MARKETS) {
      const cc = market.code.toLowerCase();
      const kbDir = join(knowledge, cc);
      await mkdir(join(legal, cc), { recursive: true });
      await mkdir(kbDir, { recursive: true });
      await writeFile(join(kbDir, "index.json"), kbIndex(market), "utf8");
      await writeFile(join(kbDir, "small-appliances.md"), `# ${market.name}小家电规则（测试夹具）\n`, "utf8");
      await writeFile(join(kbDir, market.countryFile), countryKb(market), "utf8");
      await writeFile(join(legal, cc, "rules.v0.1.json"), legalRules(market), "utf8");
    }

    process.env.WENDO_KNOWLEDGE_DIR = knowledge;
    process.env.WENDO_LEGAL_DIR = legal;
    clearLegalLibraryCache();
    await run();
  } finally {
    if (oldKnowledge === undefined) delete process.env.WENDO_KNOWLEDGE_DIR;
    else process.env.WENDO_KNOWLEDGE_DIR = oldKnowledge;
    if (oldLegal === undefined) delete process.env.WENDO_LEGAL_DIR;
    else process.env.WENDO_LEGAL_DIR = oldLegal;
    clearLegalLibraryCache();
    await rm(root, { recursive: true, force: true });
  }
}

test("市场解析：默认 MY，小写归一，未知市场明确失败", () => {
  const my = resolveMarket();
  assert.equal(my.code, "MY");
  assert.equal(my.name, "马来西亚");
  assert.equal(my.timeZone, "Asia/Kuala_Lumpur");
  assert.equal(resolveMarket(" sg ").code, "SG");
  assert.equal(resolveMarket("SG").name, "新加坡");

  assert.throws(
    () => resolveMarket("ZZ"),
    (error: unknown) =>
      error instanceof MarketError &&
      error.code === "market_unsupported" &&
      /未知市场/.test(error.message),
  );
});

test("MY 基线：默认市场与显式 MY 一致，法规规则库同源", async () => {
  const implicit = await retrieveKb({ pageText: PAGE_TEXT });
  const explicit = await retrieveKb({ pageText: PAGE_TEXT, market: "MY" });

  assert.equal(implicit.market, "MY");
  assert.equal(implicit.marketName, "马来西亚");
  assert.equal(implicit.legalRuleCount, 45);
  assert.equal(implicit.legalVersion, "2026-11-14-v0.1c");
  assert.deepEqual(
    explicit.dimensions.map((dimension) => [dimension.id, dimension.rules.map((rule) => rule.id)]),
    implicit.dimensions.map((dimension) => [dimension.id, dimension.rules.map((rule) => rule.id)]),
  );
  assert.ok(implicit.excerpts.every((excerpt) => excerpt.source.startsWith("knowledge/my/")));

  const meta = buildReportMeta({
    market: resolveMarket(),
    page: fixturePage(),
    kb: implicit,
    tier: TIERS.lite,
    generatedAt: new Date("2026-11-17T16:41:12Z"),
  });
  assert.equal(meta.market, "MY");
  assert.equal(meta.market_name, "马来西亚");
  assert.equal(meta.generated_at, "2026-11-18T00:41:12+08:00");
});

test("缺国家知识库：SG 直接 market_kb_missing，不回退 MY", async () => {
  await assert.rejects(
    retrieveKb({ pageText: PAGE_TEXT, market: "SG" }),
    (error: unknown) => {
      assert.ok(error instanceof MarketError);
      assert.equal(error.code, "market_kb_missing");
      assert.match(error.message, /市场 SG（新加坡）/);
      assert.match(error.message, /未回退到 MY/);
      assert.ok(error.details.some((detail) => detail.includes("knowledge/sg/singapore.md")));
      assert.ok(error.details.some((detail) => detail.includes("knowledge/sg/index.json")));
      assert.ok(error.details.some((detail) => detail.includes("knowledge/sg/small-appliances.md")));
      return true;
    },
  );
});

test("pipeline 在抓取前就拒绝缺知识库的市场，不联网、不调用模型", async () => {
  await assert.rejects(
    runDiagnosis({ url: "https://example.com/product", market: "SG" }),
    (error: unknown) => error instanceof MarketError && error.code === "market_kb_missing",
  );
});

test("SG/AE/US：知识库、规则 id、报告 meta 与时间都来自请求市场", async () => {
  await withFixtureMarkets(async () => {
    for (const market of FIXTURE_MARKETS) {
      const kb = await retrieveKb({ pageText: PAGE_TEXT, market: market.code });
      assert.equal(kb.market, market.code);
      assert.equal(kb.marketName, market.name);
      assert.equal(kb.legalVersion, `test-${market.code}-v0.1`);
      assert.equal(kb.legalRuleCount, 1);

      const ruleIds = kb.dimensions.flatMap((dimension) => dimension.rules.map((rule) => rule.id));
      assert.ok(ruleIds.length > 0);
      assert.ok(
        ruleIds.every((id) => id.startsWith(`${market.code}-`)),
        `${market.code} 的规则 id 不应混入别国：${ruleIds.join("、")}`,
      );
      assert.ok(
        kb.excerpts.every((excerpt) => excerpt.source.startsWith(`knowledge/${market.code.toLowerCase()}/`)),
        `${market.code} 的摘录来源不应指向别国目录`,
      );

      const meta = buildReportMeta({
        market: resolveMarket(market.code),
        page: fixturePage(),
        kb,
        tier: TIERS.lite,
        generatedAt: new Date("2026-07-15T12:00:00Z"),
      });
      assert.equal(meta.market, market.code);
      assert.equal(meta.market_name, market.name);
      assert.match(meta.generated_at, /^2026-07-15T/);
      assert.ok(
        meta.generated_at.endsWith(market.offset),
        `${market.code} 的 generated_at 应带 ${market.offset}，实际 ${meta.generated_at}`,
      );

      const compliance = analyzeCompliance(
        { text: PAGE_TEXT, category: "small_appliances", url: `https://${market.domain}/test` },
        { market: market.code },
      );
      assert.equal(compliance.market, market.code);
      assert.equal(compliance.marketName, market.name);
      assert.equal(compliance.findings.length, 0, "非 MY 不套用 MY 判定器");
      assert.equal(compliance.assessedRuleCount, 0);
      assert.equal(compliance.libraryRuleCount, 1);
      assert.ok(compliance.dispositions.every((item) => item.outcome === "not_assessable"));
      assert.ok(compliance.boundaryNote.reason.includes(market.name));
      assert.ok(!compliance.findings.some((finding) => finding.ruleId.startsWith("MY-")));
    }
  });
});

test("市场已有国家库但缺品类文件：仍以 market_kb_missing 失败，列出缺哪个文件", async () => {
  await withFixtureMarkets(async () => {
    await assert.rejects(
      retrieveKb({ pageText: PAGE_TEXT, market: "SG", category: "consumer_electronics" }),
      (error: unknown) => {
        assert.ok(error instanceof MarketError);
        assert.equal(error.code, "market_kb_missing");
        assert.ok(error.details.some((detail) => detail.includes("index.consumer-electronics.json")));
        assert.ok(error.details.some((detail) => detail.includes("consumer-electronics.md")));
        return true;
      },
    );
  });
});

test("规则库市场写错：retrieve_kb 识别为 market_rules_mismatch，而不是照单全收", async () => {
  await withFixtureMarkets(async () => {
    // 把 SG 的规则库改成 MY：模拟数据拷贝错误。
    const path = join(process.env.WENDO_LEGAL_DIR ?? "", "sg", "rules.v0.1.json");
    const wrong = JSON.parse(legalRules(FIXTURE_MARKETS[0]!)) as Record<string, unknown>;
    wrong.market = "MY";
    wrong.market_name = "马来西亚";
    await writeFile(path, JSON.stringify(wrong, null, 2), "utf8");
    clearLegalLibraryCache();

    await assert.rejects(
      retrieveKb({ pageText: PAGE_TEXT, market: "SG" }),
      (error: unknown) => error instanceof MarketError && error.code === "market_rules_mismatch",
    );
  });
});
