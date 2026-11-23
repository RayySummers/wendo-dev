/**
 * 判定器按市场分派（RAY-773）与内容（RAY-774）的契约测试。
 *
 * 这一组测试锁住六件事，避免以后「为了多覆盖一条规则」把别国法条写进报告：
 * 1. 每个已挂载市场的 matcher 只引用**该国规则库里真实存在**的规则；
 * 2. 挂上去的规则一律是 `rule_level`（不把需核实 / 需人工判断的条目硬塞进可判定集）；
 * 3. 规则库里每条规则要么有 matcher、要么在跳过清单里，不静默丢规则；
 * 4. 没挂 matcher 的市场（PH）仍是 `not_assessable`，且 downgrade 文案与 RAY-754 逐字一致；
 * 5. RAY-774 的口径：SG / AE / US 各挂 5–8 条；一份明显违规的英文商品页每国至少命中 5 条；
 * 6. 反例：一份把该披露的都披露了的英文商品页，三国都不能出 finding（不误报），
 *    且输出里不能出现马来西亚专属词。
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { analyzeCompliance } from "../src/compliance/analyze.js";
import {
  assessedMarkets,
  hasMatchersFor,
  matchersFor,
  rulesFor,
  skipReasonsFor,
  uncoveredRuleIds,
  validateSkipReasons,
} from "../src/compliance/rules.js";

/** 每个市场它的官方来源域名应落在这里（验收要求能核到 .gov.sg / .gov.ae / .gov）。 */
const OFFICIAL_DOMAIN: Record<string, RegExp> = {
  MY: /^https:\/\/(?:lom\.agc\.gov\.my|www\.pdp\.gov\.my)\//,
  SG: /^https:\/\/sso\.agc\.gov\.sg\//,
  AE: /^https:\/\/uaelegislation\.gov\.ae\//,
  US: /^https:\/\/(?:www\.ecfr\.gov|www\.govinfo\.gov)\//,
};

/**
 * 一份英文商品页夹具：hero 有获奖语、GST 说明、赠品、英制尺寸、保修、积分登录、
 * 订阅入口，页脚有公司地址与联系方式。用来验证三种市场各自命中至少 3 条。
 */
const FIXTURE_PAGE = [
  "NovaChef 5.5L Digital Air Fryer",
  "Winner of the 2026 Home Kitchen Award",
  "All prices are shown before GST.",
  "Free gift for our valued customers",
  "The basket measures 12.5 inches across.",
  "Every unit comes with a 2 year warranty.",
  "Get 500 points when you log in to your account",
  "Subscribe to our newsletter for recipes and offers",
  "Description",
  "The NovaChef air fryer circulates hot air around the basket so food crisps without deep frying.",
  "Eight presets cover fries, wings, fish, vegetables, bake, roast, reheat and dehydrate.",
  "Specifications",
  "Capacity 5.5 litres, power 1700W, voltage 220-240V, weight 5.6 kg.",
  "NovaChef Home Pte Ltd, 12 Kitchener Road, Singapore",
  "Contact our support team for spare parts and repairs.",
].join("\n");

/**
 * 反例页：故意把三国要求的披露都写全（含 GST 含税价、DPO 联系方式、阿拉伯语版本、
 * 交易者执照与迪拜地址、limited warranty + 保修条款、退订方式、实体邮政地址、
 * 公制+英制并列、误导性用语 0）。一份干净页面不该出任何 finding。
 */
const CLEAN_PAGE = readFileSync(
  new URL("./fixtures/compliance-en-clean.txt", import.meta.url),
  "utf8",
);

/**
 * 违规页：手写构造的英文商品页，覆盖三国各自的典型缺口（限量无期限、GST 未含、
 * 英制无公制、符合性标示、真伪说明、保修无指定/无全文、订阅无退订、无地址、
 * 免费赠品无条件、激励换评论、关键条件只写 see terms、无阿拉伯语、隐性同意）。
 * 只用于验证「能命中」，不代表任何真实站点。
 */
const FLAWED_PAGE = readFileSync(
  new URL("./fixtures/compliance-en-flawed.txt", import.meta.url),
  "utf8",
);

/** 马来西亚专属词：出现在 SG / AE / US 的报告里就是串味。 */
const MY_ONLY_TERMS = /\bSIRIM\b|\bFPX\b|\bTTPM\b|\bMCMC\b|\bRM\b|东马|马来语|Malaysia|JAKIM|PDPA 2010/i;

const MOUNTED = assessedMarkets();

test("已挂载 matcher 的市场就是 MY / SG / AE / US，且每个都至少有 3 条规则", () => {
  assert.deepEqual([...MOUNTED].sort(), ["AE", "MY", "SG", "US"]);
  for (const code of MOUNTED) {
    const rules = new Set(matchersFor(code).map((matcher) => matcher.ruleId));
    assert.ok(rules.size >= 3, `${code} 挂载的可判定规则少于 3 条：${[...rules].join("、")}`);
  }
});

test("每个 matcher 的 ruleId 都在该国规则库里；新市场只挂 rule_level", () => {
  for (const code of MOUNTED) {
    const byId = new Map(rulesFor(code).map((rule) => [rule.id, rule]));
    for (const matcher of matchersFor(code)) {
      const rule = byId.get(matcher.ruleId);
      assert.ok(rule, `${code} 的 matcher 引用了不存在的规则 ${matcher.ruleId}`);
      // MY 是 RAY-698 验收过的三档判定（含 substantiation / human_review 的既有条目），
      // 不改动；RAY-773 新挂的 SG / AE / US 只允许 rule_level。
      if (code !== "MY") {
        assert.equal(
          rule.decision_level,
          "rule_level",
          `${code} / ${matcher.ruleId} 的判定层级是 ${rule.decision_level}，不应进可判定集`,
        );
      }
      // 不能把 MY 的规则 id 挂到别国市场上。
      assert.ok(matcher.ruleId.startsWith(`${code}-`), `${code} 的 matcher 引用了别国规则 ${matcher.ruleId}`);
    }
  }
});

test("规则库不静默丢规则：每条规则要么有 matcher、要么记了跳过原因", () => {
  for (const code of MOUNTED) {
    validateSkipReasons(code);
    assert.deepEqual(uncoveredRuleIds(code), [], `${code} 有规则既没判定也没记跳过原因`);

    const mounted = new Set(matchersFor(code).map((matcher) => matcher.ruleId));
    const skipped = new Set(skipReasonsFor(code).flatMap((reason) => reason.ruleIds));
    const both = [...mounted].filter((id) => skipped.has(id));
    assert.deepEqual(both, [], `${code} 的规则同时出现在 matcher 与跳过清单里：${both.join("、")}`);
    // 跳过原因必须写清楚，不能是空串占位。
    for (const reason of skipReasonsFor(code)) {
      assert.ok(reason.ruleIds.length > 0, `${code} 有空的分组`);
      assert.ok(reason.reason.trim().length > 10, `${code} 的跳过原因太短：${reason.reason}`);
    }
  }
});

test("RAY-774：SG / AE / US 各挂 5–8 条 rule_level matcher，ruleId 不重复", () => {
  for (const code of ["SG", "AE", "US"]) {
    const ids = matchersFor(code).map((matcher) => matcher.ruleId);
    assert.ok(ids.length >= 5 && ids.length <= 8, `${code} 挂了 ${ids.length} 条，应在 5–8 条之间`);
    assert.equal(new Set(ids).size, ids.length, `${code} 的 matcher 有重复 ruleId：${ids.join("、")}`);
  }
});

test("RAY-774 反例：明显违规的英文页，SG / AE / US 各出至少 5 条 finding", () => {
  for (const code of ["SG", "AE", "US"]) {
    const analysis = analyzeCompliance(
      { text: FLAWED_PAGE, category: "small_appliances", url: "https://example.com/blender" },
      { market: code },
    );
    assert.ok(
      analysis.findings.length >= 5,
      `${code} 在违规页只出了 ${analysis.findings.length} 条 finding：${analysis.findings.map((f) => f.ruleId).join("、")}`,
    );
    assert.ok(
      analysis.findings.every((finding) => finding.ruleId.startsWith(`${code}-`)),
      `${code} 的 finding 混进了别国规则：${analysis.findings.map((f) => f.ruleId).join("、")}`,
    );
    assert.ok(
      analysis.findings.every((finding) => finding.decisionLevel === "rule_level"),
      `${code} 的 finding 里出现了非 rule_level 条目`,
    );
  }
});

test("RAY-774 反例：披露齐全的英文页，SG / AE / US 都不出 finding（不误报）", () => {
  for (const code of ["SG", "AE", "US"]) {
    const analysis = analyzeCompliance(
      { text: CLEAN_PAGE, category: "small_appliances", url: "https://example.com/purifier" },
      { market: code },
    );
    assert.deepEqual(
      analysis.findings.map((finding) => finding.ruleId),
      [],
      `${code} 在干净页上误报：${analysis.findings.map((f) => `${f.ruleId}「${f.quote}」`).join("、")}`,
    );
  }
});

test("RAY-774：SG / AE / US 的报告里不出现马来西亚专属词", () => {
  for (const code of ["SG", "AE", "US"]) {
    const analysis = analyzeCompliance(
      { text: FLAWED_PAGE, category: "small_appliances", url: "https://example.com/blender" },
      { market: code },
    );
    for (const finding of analysis.findings) {
      const text = [finding.why, finding.fix, finding.evidence, finding.lawName].join(" ");
      assert.doesNotMatch(text, MY_ONLY_TERMS, `${code} / ${finding.ruleId} 的输出出现马来西亚专属词：${text}`);
    }
  }
});

test("同一个页面：SG / AE / US 各出至少 3 条 finding，且法条/官方 URL 来自各自规则库", () => {
  for (const code of ["SG", "AE", "US"]) {
    const analysis = analyzeCompliance(
      { text: FIXTURE_PAGE, category: "small_appliances", url: "https://example.com/product" },
      { market: code },
    );

    assert.equal(analysis.market, code);
    assert.ok(
      analysis.findings.length >= 3,
      `${code} 只出了 ${analysis.findings.length} 条 finding：${analysis.findings.map((f) => f.ruleId).join("、")}`,
    );
    assert.equal(analysis.assessedRuleCount, new Set(matchersFor(code).map((m) => m.ruleId)).size);

    const domain = OFFICIAL_DOMAIN[code]!;
    const known = new Set(rulesFor(code).map((rule) => rule.id));
    for (const finding of analysis.findings) {
      assert.ok(known.has(finding.ruleId), `${code} 的 finding 引用了本国规则库之外的规则 ${finding.ruleId}`);
      assert.ok(finding.lawName?.trim(), `${finding.ruleId} 缺 law_name`);
      assert.ok(finding.article?.trim(), `${finding.ruleId} 缺 article`);
      assert.ok(finding.lastVerified?.trim(), `${finding.ruleId} 缺 last_verified`);
      assert.ok(
        domain.test(finding.officialUrl),
        `${finding.ruleId} 的官方 URL 不属于 ${code} 的官方域名：${finding.officialUrl}`,
      );
      // 判决式措辞不许出现在输出里。
      assert.ok(
        !/合法|违法|保证通过|已认证/.test(finding.why),
        `${finding.ruleId} 的 why 出现判决式措辞：${finding.why}`,
      );
      // 每条 finding 的 evidence 必须带 `规则 <id>`，BFF 靠它校验 market_rules_mismatch。
      assert.match(finding.evidence, new RegExp(`规则 ${finding.ruleId}`));
    }
  }
});

test("每个市场只用自己那套 check：SG/AE/US 不会写出 MY 的国语/清真判定", () => {
  for (const code of ["SG", "AE", "US"]) {
    const analysis = analyzeCompliance(
      { text: FIXTURE_PAGE, category: "small_appliances" },
      { market: code },
    );
    for (const finding of analysis.findings) {
      assert.ok(!finding.ruleId.startsWith("MY-"), `${code} 报告里出现 MY 规则：${finding.ruleId}`);
      assert.ok(!/JAKIM|PDPA 2010|国语（马来语）/.test(finding.why), `${code} 的 why 借用了 MY 法条：${finding.why}`);
    }
  }
});

test("未挂 matcher 的市场（PH）仍是 not_assessable，文案与 RAY-754 一致", () => {
  assert.equal(hasMatchersFor("PH"), false);
  assert.deepEqual(matchersFor("PH"), []);

  const analysis = analyzeCompliance(
    { text: FIXTURE_PAGE, category: "small_appliances" },
    { market: "PH" },
  );

  assert.equal(analysis.findings.length, 0);
  assert.equal(analysis.assessedRuleCount, 0);
  assert.equal(analysis.libraryRuleCount, rulesFor("PH").length);
  assert.ok(analysis.dispositions.every((item) => item.outcome === "not_assessable"));
  // 降级文案逐字保留：不把「没查」写成「没问题」，也不点名任何具体市场的法条。
  assert.equal(
    analysis.boundaryNote.reason,
    `菲律宾规则库 ${rulesFor("PH").length} 条（${analysis.libraryVersion}）已加载，但 agent 侧尚未建立该市场的可判定子集；本版不输出该市场的合规 finding，也不据此判断合规。`,
  );
});

test("MY 的行为零变化：17 条 matcher、45 条规则、不服役于别国", () => {
  assert.equal(matchersFor("MY").length, 17);
  assert.equal(rulesFor("MY").length, 45);
  assert.equal(skipReasonsFor("MY").reduce((sum, reason) => sum + reason.ruleIds.length, 0), 28);
});
