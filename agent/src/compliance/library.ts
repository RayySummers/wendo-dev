/**
 * 按市场加载合规规则库（RAY-754）。
 *
 * 唯一数据源：`agent/knowledge/legal/<cc>/rules.v0.1.json`。这里只做加载与一致性
 * 校验，不解释法条；可判定子集（matcher）仍由 `rules.ts` 声明。
 *
 * 与 RAY-773 的边界：加载器只保证「读到的是本国的库」，判定器再决定「这个市场怎么判」。
 * 已挂载可判定子集的市场见 `rules.ts` 的 `COMPLIANCE_MATCHERS_BY_MARKET`（当前 MY / SG / AE / US）；
 * 未挂载的市场整库降级为 not_assessable。任何情况下都不把 MY 的 matcher 套到别国页面上，
 * 否则会在 SG 报告里写出马来西亚法条——那是比「没有合规章节」严重得多的错误。
 */

import { existsSync, readFileSync } from "node:fs";
import { MarketError, resolveMarket, type MarketInfo } from "../market.js";

export interface LegalRule {
  id: string;
  market: string;
  category: string;
  law_name: string;
  law_short: string;
  article: string;
  article_type: string;
  source_id: string;
  official_url: string;
  source_tier: string;
  language: string;
  effective_date: string;
  last_verified: string;
  rule_type: string;
  decision_level: "rule_level" | "substantiation" | "human_review";
  claim_pattern: string[];
  requirement: string;
  evidence_needed: string;
  penalty_or_note: string;
  verbatim_excerpt: string;
  confidence: "high" | "medium" | "low";
  review_required: boolean;
  notes?: string;
}

export interface LegalRulesFile {
  schema_version: string;
  market: string;
  market_name: string;
  version: string;
  scope: string;
  last_verified: string;
  review_policy: string;
  rules: LegalRule[];
}

export interface LegalLibrary {
  market: string;
  marketName: string;
  version: string;
  lastVerified: string;
  scope: string;
  reviewPolicy: string;
  rules: LegalRule[];
  byId: Map<string, LegalRule>;
  raw: LegalRulesFile;
  path: string;
}

const cache = new Map<string, LegalLibrary>();

function fail(path: string, message: string): never {
  throw new MarketError("market_rules_mismatch", `${message}（${path}）`);
}

/**
 * 读某市场的规则库并按路径缓存。文件缺失 → `market_kb_missing`；
 * 市场代码/名称不匹配、规则为空或重复 → `market_rules_mismatch`。
 */
export function loadLegalLibrary(market: MarketInfo): LegalLibrary {
  const cached = cache.get(market.legalRulesPath);
  if (cached) return cached;

  const path = market.legalRulesPath;
  if (!existsSync(path)) {
    throw new MarketError("market_kb_missing", `市场 ${market.code}（${market.name}）缺少法规规则库：${path}`, [
      `法规规则库：${path}`,
    ]);
  }

  let parsed: LegalRulesFile;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8")) as LegalRulesFile;
  } catch (error) {
    fail(path, `法规规则库无法解析：${error instanceof Error ? error.message : String(error)}`);
  }

  if (parsed.market !== market.code) {
    fail(
      path,
      `规则库市场不一致：请求 ${market.code}（${market.name}），文件写的是 ${String(parsed.market)}（${String(parsed.market_name)}）`,
    );
  }
  if (parsed.market_name && parsed.market_name !== market.name) {
    fail(path, `规则库市场名与索引不一致：索引 ${market.name}，文件 ${parsed.market_name}`);
  }
  if (!Array.isArray(parsed.rules) || parsed.rules.length === 0) {
    fail(path, `法规规则库为空：${market.code}`);
  }
  const byId = new Map<string, LegalRule>();
  for (const rule of parsed.rules) {
    if (!rule?.id) fail(path, `法规规则库存在无 id 的规则：${market.code}`);
    if (byId.has(rule.id)) fail(path, `法规规则库存在重复规则 id：${rule.id}`);
    if (rule.market && rule.market !== market.code) {
      fail(path, `规则 ${rule.id} 的 market 是 ${rule.market}，不是 ${market.code}`);
    }
    byId.set(rule.id, rule);
  }

  const library: LegalLibrary = {
    market: market.code,
    marketName: market.name,
    version: parsed.version,
    lastVerified: parsed.last_verified,
    scope: parsed.scope,
    reviewPolicy: parsed.review_policy,
    rules: parsed.rules,
    byId,
    raw: parsed,
    path,
  };
  cache.set(path, library);
  return library;
}

/** 测试与调试用：清空加载缓存（会在测试里切换 WENDO_LEGAL_DIR）。 */
export function clearLegalLibraryCache(): void {
  cache.clear();
}

/** MY 规则库的便捷入口；其他市场请显式传 market。 */
export function myLegalLibrary(): LegalLibrary {
  return loadLegalLibrary(resolveMarket("MY"));
}
