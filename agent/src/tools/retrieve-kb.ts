import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveCategoryProfile, type CategoryProfile } from "../categories.js";
import { loadLegalLibrary, type LegalLibrary } from "../compliance/library.js";
import {
  assertMarketKbReady,
  resolveMarket,
  MarketError,
  type MarketInfo,
} from "../market.js";
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
  /** 品类口径说明：哪些规则适用、哪些属于其他品类、不要套用。 */
  scope?: string;
  dimensions: RawDimension[];
}

interface LoadedKb {
  market: MarketInfo;
  index: RawIndex;
  country: Map<string, string>;
  category: string;
  legal: LegalLibrary;
}

/** 每个市场 × 品类单独缓存；MY 与 SG 的索引互不影响，也不共用同一个 key。 */
const cache = new Map<string, LoadedKb>();

async function loadKb(profile: CategoryProfile, market: MarketInfo): Promise<LoadedKb> {
  const cacheKey = `${market.kbDir}:${market.legalRulesPath}:${profile.code}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // 先确认四个文件都在：缺国家知识库时直接 market_kb_missing，不回退 MY。
  assertMarketKbReady(market, profile);

  const indexPath = join(market.kbDir, profile.indexFile);
  const categoryPath = join(market.kbDir, profile.rulesFile);
  const countryPath = join(market.kbDir, market.countryFile);
  const [indexRaw, countryRaw, categoryRaw] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(countryPath, "utf8"),
    readFile(categoryPath, "utf8"),
  ]);
  const index = JSON.parse(indexRaw) as RawIndex;
  if (index.market !== market.code) {
    throw new MarketError(
      "market_rules_mismatch",
      `知识库市场不一致：请求 ${market.code}（${market.name}），${profile.indexFile} 写的是「${String(index.market)}」`,
      [`索引：${indexPath}`],
    );
  }
  if (index.market_name && index.market_name !== market.name) {
    throw new MarketError(
      "market_rules_mismatch",
      `知识库市场名与索引不一致：请求 ${market.name}，${profile.indexFile} 写的是「${index.market_name}」`,
      [`索引：${indexPath}`, `legal/index.json：${market.name}`],
    );
  }
  if (index.category !== profile.code) {
    throw new MarketError(
      "market_rules_mismatch",
      `知识库索引品类不一致：${profile.indexFile} 写的是「${index.category}」，注册表写的是「${profile.code}」`,
      [`索引：${indexPath}`],
    );
  }

  const loaded: LoadedKb = {
    market,
    index,
    country: splitCountrySections(countryRaw),
    category: categoryRaw.trim(),
    // 法规规则库在检索阶段就加载并核对市场，避免报告阶段才发现读错国家。
    legal: loadLegalLibrary(market),
  };
  cache.set(cacheKey, loaded);
  return loaded;
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
  /** 目标市场代码；缺省 MY。未知市场或该国知识库缺失时明确失败，不回退。 */
  market?: string;
  /** 诊断品类代码；缺省为 small_appliances。未知品类直接报错，不回落。 */
  category?: string;
  /** 附带原文的国家知识库段落数量，默认按命中排序取 3 个维度。 */
  excerptDimensions?: number;
  /** 每个段落的最大字符数。 */
  maxExcerptChars?: number;
}

/**
 * retrieve_kb：固定工具链第 2 步。
 * 用确定性信号匹配把页面文本映射到「请求市场 × 选定品类」规则，并按命中排序；
 * 不使用 LLM，保证同一页面每次拿到同一份知识库上下文。
 *
 * RAY-686：品类由 `resolveCategoryProfile` 解析，索引与规则原文按品类加载；
 * 未登记品类抛错，避免把 3C 页面静默套进小家电规则。
 * RAY-754：市场由 `resolveMarket` 解析，国家知识库与法规规则库按 `<cc>` 加载；
 * 缺文件抛 `market_kb_missing`，绝不从 MY 目录兜底。
 */
export async function retrieveKb(options: RetrieveKbOptions): Promise<KbDigest> {
  const market = resolveMarket(options.market);
  const profile = resolveCategoryProfile(options.category);
  const { index, country, category, legal } = await loadKb(profile, market);
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
        title: `${market.name}国家知识库 · ${section}`,
        source: `knowledge/${market.code.toLowerCase()}/${market.countryFile}`,
        body: body.slice(0, maxChars),
      });
    }
  }
  excerpts.push({
    title: `${market.name}${index.category_name}品类规则`,
    source: `knowledge/${market.code.toLowerCase()}/${profile.rulesFile}`,
    body: category.slice(0, maxChars),
  });

  return {
    market: market.code,
    marketName: market.name,
    category: index.category,
    categoryName: index.category_name,
    scope: index.scope,
    version: index.version,
    legalVersion: legal.version,
    legalRuleCount: legal.rules.length,
    dimensions: ranked,
    totalHits: dimensions.reduce((sum, dimension) => sum + dimension.hits, 0),
    excerpts,
  };
}
