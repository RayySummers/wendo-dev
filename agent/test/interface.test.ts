import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeInterface,
  estimateTextWidth,
  interfaceDimensionNote,
  measureHierarchy,
} from "../src/interface/analyze.js";
import { CONTENT_DIMENSION_NAME, interfaceRisks, mergeInterfaceIntoReport } from "../src/interface/report.js";
import type {
  InterfaceElementSnapshot,
  InterfaceFormSnapshot,
  InterfaceSnapshot,
} from "../src/interface/types.js";
import { renderReportHtml } from "../src/render/report-html.js";
import { retrieveKb } from "../src/tools/retrieve-kb.js";
import { validateReport } from "../src/tools/score-and-report.js";
import { ReportSchema } from "../src/types.js";
import { PAGE_TEXT, buildModelReport } from "./helpers.js";

function element(overrides: Partial<InterfaceElementSnapshot> = {}): InterfaceElementSnapshot {
  return {
    selector: ".card-title",
    tag: "div",
    text: "Bear Smart Rice Cooker",
    font_size_px: 16,
    font_weight: 400,
    color: "#333333",
    line_height_px: 20,
    text_transform: null,
    font_style: null,
    letter_spacing_px: null,
    white_space: null,
    overflow: null,
    text_overflow: null,
    word_break: null,
    overflow_wrap: null,
    hyphens: null,
    line_clamp: null,
    display: "block",
    width_px: null,
    max_width_px: null,
    width_raw: null,
    max_width_raw: null,
    min_width_raw: null,
    height_px: null,
    max_height_px: null,
    container_px: 300,
    container_source: "declared",
    background_color: "#ffffff",
    border_width_px: 0,
    border_radius_px: 0,
    lang: null,
    title_attr: null,
    aria_label: null,
    role: null,
    is_interactive: false,
    font_family: null,
    ...overrides,
  };
}

function snapshot(elements: InterfaceElementSnapshot[], overrides: Partial<InterfaceSnapshot> = {}): InterfaceSnapshot {
  return {
    captured: true,
    lang: "en",
    html_open_tag: '<html lang="en">',
    viewport: "width=device-width, initial-scale=1",
    stylesheets: { linked: 1, fetched: 1, failed: 0, inline_blocks: 0, rules: 12 },
    elements,
    long_tokens: [],
    ...overrides,
  };
}

test("estimateTextWidth：CJK 按全角、拉丁按约半角估算", () => {
  const latin = estimateTextWidth("abcdefghij", 16);
  const cjk = estimateTextWidth("十个全角汉字", 16);
  assert.ok(latin > 60 && latin < 100, `拉丁 10 字符应约 80px，实际 ${latin}`);
  assert.ok(cjk >= 80, `6 个 CJK 字符应约 96px，实际 ${cjk}`);
  assert.ok(estimateTextWidth("abc", 16, 700) > estimateTextWidth("abc", 16, 400));
});

test("没有界面信号的页面不产生风险条目", () => {
  const analysis = analyzeInterface(snapshot([element()]));
  assert.equal(analysis.captured, true);
  assert.deepEqual(analysis.findings, []);
  assert.deepEqual(interfaceRisks(analysis), []);
  assert.match(interfaceDimensionNote(analysis), /未发现/);
});

test("抓取不到 CSS 时明说无法判断，而不是当作合格", () => {
  const analysis = analyzeInterface({ captured: false, reason: "interface_failed: timeout" });
  assert.equal(analysis.captured, false);
  assert.deepEqual(analysis.findings, []);
  const note = interfaceDimensionNote(analysis);
  assert.match(note, /无法判断/);
  assert.match(note, /interface_failed/);
});

test("定高文本盒放不下换语言后的标题时命中 IF-TRUNC-01", () => {
  const long = element({
    selector: ".product-name",
    text: "Bear Electric Food Steamer BFS-C60L 6L Multifunction Double Layer 2 Tiers",
    height_px: 55,
    max_height_px: 55,
    line_height_px: 19.2,
    overflow: "hidden",
    container_px: 300,
  });
  const analysis = analyzeInterface(snapshot([long]));
  const finding = analysis.findings.find((item) => item.rule === "IF-TRUNC-01");
  assert.ok(finding, "应当命中定高文本盒");
  assert.equal(finding.channel, "truncation");
  assert.match(finding.evidence, /height:55px/);
  assert.match(finding.evidence, /可容纳/);
  assert.match(finding.evidence, /\.product-name/);
  assert.equal(finding.occurrences, 1);

  const [risk] = interfaceRisks(analysis);
  assert.equal(risk?.kind, "interface_translation");
  assert.equal(risk?.quote, long.text);
  assert.ok(risk?.evidence);
});

test("同一规则命中多处时合并成一条并记次数", () => {
  const base = {
    height_px: 36,
    max_height_px: 36,
    line_height_px: 18,
    overflow: "hidden" as const,
    text: "Bear Electric Food Steamer BFS-C60L 6L Multifunction Double Layer",
  };
  const analysis = analyzeInterface(
    snapshot([element({ ...base, selector: ".a" }), element({ ...base, selector: ".b" }), element({ ...base, selector: ".c" })]),
  );
  const finding = analysis.findings.find((item) => item.rule === "IF-TRUNC-01");
  assert.equal(finding?.occurrences, 3);
  assert.equal(analysis.reported.length, 1);
});

test("单行不换行 + 固定宽度 + 省略号命中 IF-TRUNC-02", () => {
  const navItem = element({
    selector: "#nav > a",
    tag: "a",
    text: "Bear Kitchen Appliances",
    white_space: "nowrap",
    text_overflow: "ellipsis",
    overflow: "hidden",
    width_px: 120,
    max_width_px: 120,
    container_px: 120,
  });
  const analysis = analyzeInterface(snapshot([navItem]));
  const finding = analysis.findings.find((item) => item.rule === "IF-TRUNC-02");
  assert.ok(finding);
  assert.match(finding.evidence, /white-space:nowrap/);
  assert.match(finding.evidence, /max-width|width/);
});

test("break-all 遇到拉丁词命中 IF-WRAP-01", () => {
  const analysis = analyzeInterface(
    snapshot([element({ text: "Pengukus Elektrik Pelbagai Fungsi", word_break: "break-all" })]),
  );
  assert.ok(analysis.findings.some((item) => item.rule === "IF-WRAP-01"));
});

test("缺少 lang 时命中 IF-WRAP-02，证据是原始开标签", () => {
  const analysis = analyzeInterface(
    snapshot([element()], { lang: null, html_open_tag: '<html dir="ltr">' }),
  );
  const finding = analysis.findings.find((item) => item.rule === "IF-WRAP-02");
  assert.ok(finding);
  assert.equal(finding.quote, '<html dir="ltr">');
  assert.match(finding.evidence, /没有 lang/);
});

test("字号字重层次很少但颜色很多时命中 IF-HIER-01", () => {
  const colors = ["#111111", "#222222", "#333333", "#444444", "#555555", "#666666"];
  const elements = colors.flatMap((color, index) =>
    Array.from({ length: 4 }, (_, row) =>
      element({ selector: `.block-${index}-${row}`, color, font_size_px: 16, font_weight: 400, text: `促销文案示例 ${index}${row}` }),
    ),
  );
  const stats = measureHierarchy(elements);
  assert.equal(stats.fontSizes, 1);
  assert.equal(stats.colors, 6);
  const analysis = analyzeInterface(snapshot(elements));
  const finding = analysis.findings.find((item) => item.rule === "IF-HIER-01");
  assert.ok(finding);
  assert.match(finding.evidence, /档字号/);
});

test("合并后接口风险排在前面，且不超过报告上限", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const model = buildModelReport(kb);
  const analysis = analyzeInterface(
    snapshot([
      element({ selector: ".a", text: "Bear Electric Food Steamer BFS-C60L 6L Multifunction Double Layer", height_px: 36, max_height_px: 36, line_height_px: 18, overflow: "hidden" }),
      element({ selector: ".b", tag: "a", text: "Bear Kitchen Appliances", white_space: "nowrap", text_overflow: "ellipsis", width_px: 100 }),
      element({ selector: ".c", text: "Pengukus Elektrik Pelbagai Fungsi", word_break: "break-all" }),
    ]),
  );
  assert.ok(analysis.reported.length >= 3);

  const merged = mergeInterfaceIntoReport(model, analysis);
  assert.ok(merged.risks.length <= 8);
  assert.equal(merged.risks[0]?.kind, "interface_translation");
  const content = merged.dimensions.find((dimension) => dimension.name === CONTENT_DIMENSION_NAME);
  assert.equal(content?.status, "risk");
  assert.match(content?.note ?? "", /界面子检查：检查 3 个文本元素/);
  assert.match(content?.note ?? "", /命中 3 类界面信号/);
  assert.equal(merged.dimensions.length, model.dimensions.length, "不新增维度");

  const full = ReportSchema.parse({
    ...buildReportWithMeta(model, merged),
  });
  assert.ok(full.risks.some((risk) => risk.kind === "interface_translation"));
});

test("模型输出里夹带的 kind / evidence 会被校验层剥掉", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const model = buildModelReport(kb) as unknown as Record<string, unknown>;
  const risks = model.risks as Array<Record<string, unknown>>;
  risks[0] = { ...risks[0], kind: "interface_translation", evidence: "模型编造的 CSS" };
  const outcome = validateReport(model, PAGE_TEXT, kb);
  assert.ok(outcome.report);
  const first = outcome.report.risks[0] as Record<string, unknown> | undefined;
  assert.equal(first?.kind, undefined);
  assert.equal(first?.evidence, undefined);
});

test("网页渲染出界面来源标签与证据", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const analysis = analyzeInterface(
    snapshot([element({ selector: ".product-name", text: "Bear Electric Food Steamer BFS-C60L 6L Multifunction Double Layer", height_px: 36, max_height_px: 36, line_height_px: 18, overflow: "hidden" })]),
  );
  const merged = mergeInterfaceIntoReport(buildModelReport(kb), analysis);
  const html = renderReportHtml(ReportSchema.parse(buildReportWithMeta(buildModelReport(kb), merged)));
  assert.match(html, /界面可翻译性/);
  assert.match(html, /界面证据/);
  assert.match(html, /MY-UI-02/);
});

function buildReportWithMeta(
  model: ReturnType<typeof buildModelReport>,
  merged: { risks: ReturnType<typeof interfaceRisks>; dimensions: ReturnType<typeof mergeInterfaceIntoReport>["dimensions"] },
) {
  return {
    ...model,
    risks: merged.risks,
    dimensions: merged.dimensions,
    meta: {
      url: "https://example.com/",
      final_url: "https://example.com/",
      title: "Example Store",
      market: "MY",
      market_name: "马来西亚",
      category: "small_appliances",
      category_name: "小家电",
      generated_at: "2026-11-13T20:00:00+08:00",
      tier: "Lite",
      source_chars: PAGE_TEXT.length,
      knowledge_version: "2026-11-12-v2",
      agent_version: "0.2.0",
    },
  };
}

// ---------------------------------------------------------------- 第 4/6/7/8/9/10 类

function elementWith(overrides: Partial<InterfaceElementSnapshot>): InterfaceElementSnapshot {
  return element(overrides);
}

function formWith(overrides: Partial<InterfaceFormSnapshot>): InterfaceFormSnapshot {
  return {
    selector: "#q",
    tag: "input",
    type: "text",
    name: "note",
    placeholder: null,
    maxlength: null,
    minlength: null,
    autocomplete: null,
    inputmode: null,
    aria_label: null,
    handlers: {},
    inside_form: true,
    ...overrides,
  };
}

test("MY-UI-04：11px 及以下字号命中 IF-SIZE-01，正常字号不报", () => {
  const small = elementWith({ selector: ".badge", text: "仅剩 2 件", font_size_px: 10, line_height_px: 12 });
  const normal = elementWith({ selector: ".body", text: "普通正文", font_size_px: 14, line_height_px: 22 });
  const analysis = analyzeInterface(snapshot([small, normal], { lang: "zh-CN" }));
  const finding = analysis.findings.find((item) => item.rule === "IF-SIZE-01");
  assert.ok(finding);
  assert.equal(finding.channel, "legibility");
  assert.match(finding.evidence, /MY-UI-04/);
  assert.match(finding.evidence, /font-size:10px/);
  assert.equal(analysis.findings.filter((item) => item.rule === "IF-SIZE-01").length, 1);

  // 规则包排除项：纯拉丁页面上的 10px 小字不算可读性发现
  const latin = analyzeInterface(
    snapshot([elementWith({ selector: ".fine", text: "Price includes SST", font_size_px: 10 })], { lang: "en-US" }),
  );
  assert.equal(latin.findings.some((item) => item.rule === "IF-SIZE-01"), false);
});

test("MY-UI-06：首屏动作过多且无主 CTA 才命中 IF-DENSITY-01", () => {
  const many = Array.from({ length: 45 }, (_, index) =>
    elementWith({
      selector: `.nav-${index}`,
      tag: "a",
      text: `Category item ${index}`,
      is_interactive: true,
      font_size_px: 14,
      background_color: "transparent",
    }),
  );
  const dense = analyzeInterface(snapshot(many));
  const finding = dense.findings.find((item) => item.rule === "IF-DENSITY-01");
  assert.ok(finding);
  assert.match(finding.evidence, /整页可点元素 45 个/);
  assert.match(finding.evidence, /没有任何视觉上突出的主操作/);

  // 有唯一主 CTA（明显更大 + 独立底色）时不报
  const withCta = [...many];
  withCta[0] = elementWith({
    selector: ".primary-cta",
    tag: "a",
    text: "Shop now",
    is_interactive: true,
    font_size_px: 22,
    background_color: "#1943c1",
  });
  const promoted = analyzeInterface(snapshot(withCta));
  assert.equal(promoted.findings.some((item) => item.rule === "IF-DENSITY-01"), false);

  // 多个突出动作 = 已经搭了层级，不报（bears.com.my 的回归用例）
  const withManyCtas = many.map((item, index) =>
    index < 8
      ? elementWith({
          selector: `.cta-${index}`,
          tag: "a",
          text: `Action ${index}`,
          is_interactive: true,
          font_size_px: 14,
          background_color: "#1943c1",
        })
      : item,
  );
  const hierarchical = analyzeInterface(snapshot(withManyCtas));
  assert.equal(hierarchical.findings.some((item) => item.rule === "IF-DENSITY-01"), false);

  // 动作不多的页面不报
  const sparse = analyzeInterface(snapshot(many.slice(0, 10)));
  assert.equal(sparse.findings.some((item) => item.rule === "IF-DENSITY-01"), false);
});

test("MY-UI-07：按钮文案里的「仅 / just」命中 IF-WORD-01", () => {
  const analyses = [
    analyzeInterface(snapshot([elementWith({ text: "仅保存", tag: "button", is_interactive: true })])),
    analyzeInterface(snapshot([elementWith({ text: "Just save", tag: "button", is_interactive: true })])),
    analyzeInterface(snapshot([elementWith({ text: "一键下单", tag: "button", is_interactive: true })])),
  ];
  // 非动作文本（库存角标）不算「用词补设计」
  const badge = analyzeInterface(snapshot([elementWith({ text: "仅剩 2 件", tag: "span", is_interactive: false })]));
  assert.equal(badge.findings.some((item) => item.rule === "IF-WORD-01"), false);
  for (const analysis of analyses) {
    const finding = analysis.findings.find((item) => item.rule === "IF-WORD-01");
    assert.ok(finding, "应当命中用词补设计");
    assert.equal(finding.channel, "wording");
    assert.match(finding.evidence, /MY-UI-07/);
  }
  const plain = analyzeInterface(snapshot([elementWith({ text: "Save to collection", tag: "button", is_interactive: true })]));
  assert.equal(plain.findings.some((item) => item.rule === "IF-WORD-01"), false);
});

test("MY-UI-08：自然语言字段硬限长命中 IF-INPUT-01，搜索/邮箱不报", () => {
  const analysis = analyzeInterface(
    snapshot([element()], {
      forms: [
        formWith({ selector: "#note", tag: "textarea", name: "remark", maxlength: 30 }),
        formWith({ selector: "#q", name: "search", type: "search", maxlength: 20, placeholder: "Search" }),
        formWith({ selector: "#mail", name: "email", type: "email", maxlength: 40 }),
      ],
    }),
  );
  const hits = analysis.findings.filter((item) => item.rule === "IF-INPUT-01");
  assert.equal(hits.length, 1);
  assert.match(hits[0]!.evidence, /maxlength=30/);
  assert.equal(hits[0]!.selector, "#note");
});

test("MY-UI-08：Enter 提交未判 isComposing 命中 IF-INPUT-02，有守卫则不报", () => {
  const bad = analyzeInterface(
    snapshot([element()], {
      forms: [
        formWith({
          selector: "#q",
          name: "search",
          placeholder: "Search",
          handlers: { onkeydown: "if(event.key==='Enter'){submit();}" },
        }),
      ],
    }),
  );
  const finding = bad.findings.find((item) => item.rule === "IF-INPUT-02");
  assert.ok(finding);
  assert.match(finding.evidence, /Enter 直接提交/);
  assert.match(finding.evidence, /未判断 isComposing/);

  const guarded = analyzeInterface(
    snapshot([element()], {
      forms: [
        formWith({
          selector: "#q",
          placeholder: "Search",
          handlers: { onkeydown: "if(!event.isComposing && event.key==='Enter'){submit();}" },
        }),
      ],
    }),
  );
  assert.equal(guarded.findings.some((item) => item.rule === "IF-INPUT-02"), false);
});

test("MY-UI-09：声音层短句只进候选，不进 risks", () => {
  const analysis = analyzeInterface(
    snapshot([elementWith({ selector: ".empty", text: "You're all set.", font_size_px: 20 })]),
  );
  const voice = analysis.candidates.filter((candidate) => candidate.kind === "voice");
  assert.ok(voice.length >= 1);
  assert.equal(voice[0]!.rule, "MY-UI-09");
  assert.match(voice[0]!.evidence, /未做 round-trip/);
  assert.equal(analysis.findings.some((item) => item.rule.startsWith("IF-")), false);
  assert.equal(interfaceRisks(analysis).length, 0);
});

test("MY-UI-09：层级依赖拉丁字面且无 CJK 回退时给候选", () => {
  const headings = [
    elementWith({ selector: "h1", tag: "h1", text: "Bear Kitchen", font_size_px: 32, font_family: "Inter, sans-serif" }),
    elementWith({ selector: "h2", tag: "h2", text: "Our Story", font_size_px: 26, font_family: "Inter, sans-serif" }),
  ];
  const analysis = analyzeInterface(snapshot(headings, { cjk_font_declared: false }));
  const fontCandidate = analysis.candidates.find((candidate) => /CJK 字面/.test(candidate.evidence));
  assert.ok(fontCandidate);
  assert.match(fontCandidate!.suggestion, /CJK/);

  const declared = analyzeInterface(snapshot(headings, { cjk_font_declared: true }));
  assert.equal(declared.candidates.some((candidate) => /CJK 字面/.test(candidate.evidence)), false);
});

test("MY-UI-10：RTL 只记录为候选，不产生风险条目", () => {
  const analysis = analyzeInterface(snapshot([element()], { dir: "ltr" }));
  const rtl = analysis.candidates.find((candidate) => candidate.kind === "rtl");
  assert.ok(rtl);
  assert.equal(rtl!.rule, "MY-UI-10");
  assert.match(rtl!.evidence, /本轮只记录/);
  assert.equal(analysis.findings.some((item) => item.rule.includes("RTL")), false);
  // 已经是 RTL 的页面不重复记录
  assert.equal(
    analyzeInterface(snapshot([element()], { dir: "rtl" })).candidates.some((c) => c.kind === "rtl"),
    false,
  );
});

test("候选进入报告契约与网页渲染，且不占 risks 名额", async () => {
  const kb = await retrieveKb({ pageText: PAGE_TEXT });
  const model = buildModelReport(kb);
  const analysis = analyzeInterface(
    snapshot([element({ selector: ".product-name", text: "Bear Electric Food Steamer BFS-C60L 6L Multifunction Double Layer", height_px: 36, max_height_px: 36, line_height_px: 18, overflow: "hidden" })]),
  );
  const merged = mergeInterfaceIntoReport(model, analysis);
  const report = ReportSchema.parse({
    ...buildReportWithMeta(model, merged),
    interface_candidates: merged.interfaceCandidates,
  });
  assert.ok((report.interface_candidates ?? []).length >= 1);
  assert.ok(merged.risks.length <= 8);

  const html = renderReportHtml(report);
  assert.match(html, /界面候选与后续项/);
  assert.match(html, /MY-UI-10/);
});
