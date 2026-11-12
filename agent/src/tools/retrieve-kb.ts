import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { KbDigest, KbDimension, KbExcerpt, KbRule, Severity } from "../types.js";

interface RawRule {
  id: string;
  severity_hint: string;
  rule: string;
  why: string;
  fix: string;
  signals: string[];
}

interface RawDimension {
  id: string;
  name: string;
  source_sections: string[];
  rules: RawRule[];
}

interface RawIndex {
  market: string;
  market_name: string;
  category: string;
  category_name: string;
  version: string;
  dimensions: RawDimension[];
}

const KB_DIR = new URL("../../knowledge/my/", import.meta.url);
const MARKET_PATH = fileURLToPath(new URL("index.json", KB_DIR));
const COUNTRY_PATH = fileURLToPath(new URL("malaysia.md", KB_DIR));
const CATEGORY_PATH = fileURLToPath(new URL("small-appliances.md", KB_DIR));

let cache: { index: RawIndex; country: Map<string, string>; category: string } | undefined;

async function loadKb() {
  if (cache) return cache;
  const [indexRaw, countryRaw, categoryRaw] = await Promise.all([
    readFile(MARKET_PATH, "utf8"),
    readFile(COUNTRY_PATH, "utf8"),
    readFile(CATEGORY_PATH, "utf8"),
  ]);
  cache = {
    index: JSON.parse(indexRaw) as RawIndex,
    country: splitCountrySections(countryRaw),
    category: categoryRaw.trim(),
  };
  return cache;
}

/** 把国家知识库按「## Section N」切成 section 片段，检索时只取命中的段落。 */
function splitCountrySections(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = markdown.split(/^## /m);
  for (const part of parts.slice(1)) {
    const title = part.split("\n", 1)[0]?.trim() ?? "";
    const match = /^Section\s+(\d+)/.exec(title);
    if (!match?.[1]) continue;
    map.set(`Section ${match[1]}`, `## ${part.trim()}`);
  }
  return map;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 信号命中：短 ASCII 信号要求词边界，避免 "rm" 命中 "form"；
 * 长短语与中文信号直接做包含判断。
 */
export function signalMatches(text: string, signal: string): boolean {
  const needle = signal.toLowerCase();
  if (!needle) return false;
  if (/^[\x20-\x7e]+$/.test(needle) && needle.length <= 4) {
    return new RegExp(`(?<![a-z])${escapeRegex(needle)}(?![a-z])`, "i").test(text);
  }
  return text.includes(needle);
}

function toRule(raw: RawRule, text: string): KbRule {
  const matched = raw.signals.filter((signal) => signalMatches(text, signal));
  return {
    id: raw.id,
    severityHint: (["high", "medium", "low"].includes(raw.severity_hint)
      ? raw.severity_hint
      : "medium") as Severity,
    rule: raw.rule,
    why: raw.why,
    fix: raw.fix,
    signals: raw.signals,
    matchedSignals: matched,
  };
}

export interface RetrieveKbOptions {
  pageText: string;
  /** 附带原文的国家知识库段落数量，默认按命中排序取 3 个维度。 */
  excerptDimensions?: number;
  /** 每个段落的最大字符数。 */
  maxExcerptChars?: number;
}

/**
 * retrieve_kb：固定工具链第 2 步。
 * 用确定性信号匹配把页面文本映射到马来西亚 × 小家电规则，并按命中排序；
 * 不使用 LLM，保证同一页面每次拿到同一份知识库上下文。
 */
export async function retrieveKb(options: RetrieveKbOptions): Promise<KbDigest> {
  const { index, country, category } = await loadKb();
  const text = options.pageText.toLowerCase();

  const dimensions: KbDimension[] = index.dimensions.map((dimension) => {
    const rules = dimension.rules.map((rule) => toRule(rule, text));
    const hits = rules.reduce((sum, rule) => sum + rule.matchedSignals.length, 0);
    return {
      id: dimension.id,
      name: dimension.name,
      sourceSections: dimension.source_sections,
      rules,
      hits,
    };
  });

  const ranked = [...dimensions].sort((a, b) => b.hits - a.hits);

  const excerptCount = options.excerptDimensions ?? 3;
  const maxChars = options.maxExcerptChars ?? 4000;
  const excerpts: KbExcerpt[] = [];
  const seen = new Set<string>();
  for (const dimension of ranked.slice(0, excerptCount)) {
    for (const section of dimension.sourceSections) {
      if (seen.has(section)) continue;
      const body = country.get(section);
      if (!body) continue;
      seen.add(section);
      excerpts.push({
        title: `马来西亚国家知识库 · ${section}`,
        source: "knowledge/my/malaysia.md",
        body: body.slice(0, maxChars),
      });
    }
  }
  excerpts.push({
    title: "马来西亚小家电品类规则",
    source: "knowledge/my/small-appliances.md",
    body: category.slice(0, maxChars),
  });

  return {
    market: index.market,
    marketName: index.market_name,
    category: index.category,
    categoryName: index.category_name,
    version: index.version,
    dimensions: ranked,
    totalHits: dimensions.reduce((sum, dimension) => sum + dimension.hits, 0),
    excerpts,
  };
}
