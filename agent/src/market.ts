/**
 * 市场解析（RAY-754）。
 *
 * 唯一数据源是 `agent/knowledge/legal/index.json`：市场代码、中文名、规则文件路径
 * 都以这份索引为准，代码里不再写「MY / 马来西亚」这类业务常量。
 *
 * 这一层只回答三件事：
 * 1. 请求的市场代码是否被规则库收录（`market_unsupported`）；
 * 2. 该市场的国家知识库与法规规则库是否齐备（`market_kb_missing`）；
 * 3. 报告 meta 使用的市场名与本地时区。
 *
 * 开放与否（`open`）由索引声明，但**不在这里拦截**：RAY-753 负责产品侧开关，
 * agent 只保证「有知识库就按该国出报告，没有就明确失败」，不静默回退 MY。
 */

import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { CategoryProfile } from "./categories.js";

export const DEFAULT_MARKET = "MY";

/** agent/ 根目录（本文件在 agent/src/ 下）。 */
const AGENT_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

/**
 * 国家知识库文件名（`knowledge/<cc>/<country>.md`）。
 * 只描述文件命名，不声明市场是否开放；新增市场时在这里补一行即可。
 */
const COUNTRY_FILES: Record<string, string> = {
  MY: "malaysia.md",
  SG: "singapore.md",
  PH: "philippines.md",
  AE: "uae.md",
  SA: "saudi-arabia.md",
  PK: "pakistan.md",
  NG: "nigeria.md",
  ZA: "south-africa.md",
  KE: "kenya.md",
  LK: "sri-lanka.md",
  BD: "bangladesh.md",
  QA: "qatar.md",
  KW: "kuwait.md",
  OM: "oman.md",
  BH: "bahrain.md",
  EG: "egypt.md",
  JO: "jordan.md",
  TZ: "tanzania.md",
  GH: "ghana.md",
  BN: "brunei.md",
  NZ: "new-zealand.md",
  MT: "malta.md",
  US: "united-states.md",
  UK: "united-kingdom.md",
  AU: "australia.md",
  CA: "canada.md",
};

/**
 * 报告时间使用的时区：只影响 `meta.generated_at` 的本地偏移与日期。
 * 多时区国家取商业中心时区（US 纽约 / CA 多伦多 / AU 悉尼），不是法律口径。
 */
const TIME_ZONES: Record<string, string> = {
  MY: "Asia/Kuala_Lumpur",
  SG: "Asia/Singapore",
  PH: "Asia/Manila",
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  PK: "Asia/Karachi",
  NG: "Africa/Lagos",
  ZA: "Africa/Johannesburg",
  KE: "Africa/Nairobi",
  LK: "Asia/Colombo",
  BD: "Asia/Dhaka",
  QA: "Asia/Qatar",
  KW: "Asia/Kuwait",
  OM: "Asia/Muscat",
  BH: "Asia/Bahrain",
  EG: "Africa/Cairo",
  JO: "Asia/Amman",
  TZ: "Africa/Dar_es_Salaam",
  GH: "Africa/Accra",
  BN: "Asia/Brunei",
  NZ: "Pacific/Auckland",
  MT: "Europe/Malta",
  US: "America/New_York",
  UK: "Europe/London",
  AU: "Australia/Sydney",
  CA: "America/Toronto",
};

export type MarketErrorCode =
  | "market_index_missing"
  | "market_unsupported"
  | "market_kb_missing"
  | "market_rules_mismatch";

export class MarketError extends Error {
  readonly code: MarketErrorCode;
  /** 逐条补充信息（缺哪些文件、索引里有哪些市场），进 stderr 与日志。 */
  readonly details: string[];

  constructor(code: MarketErrorCode, message: string, details: string[] = []) {
    super(message);
    this.name = "MarketError";
    this.code = code;
    this.details = details;
  }
}

interface RawMarket {
  market?: unknown;
  market_name?: unknown;
  status?: unknown;
  open?: unknown;
  rules_file?: unknown;
}

interface RawIndex {
  markets?: unknown;
}

export interface MarketInfo {
  /** 两位大写市场代码，例如 SG。 */
  code: string;
  /** 索引里的中文市场名，报告 meta.market_name 直接用这个。 */
  name: string;
  /** 是否已开放给产品；agent 不拦截，只透传，便于日志核对。 */
  open: boolean;
  /** 规则库状态，例如 v0.1。 */
  status: string;
  /** `knowledge/<cc>/` 的绝对路径。 */
  kbDir: string;
  /** 国家知识库文件名，例如 singapore.md。 */
  countryFile: string;
  /** `knowledge/legal/<cc>/rules.v0.1.json` 的绝对路径。 */
  legalRulesPath: string;
  /** 报告时间使用的 IANA 时区。 */
  timeZone: string;
}

/** 知识库根目录；测试可用 WENDO_KNOWLEDGE_DIR 指向夹具（相对路径按 agent/ 解析）。 */
export function knowledgeRoot(): string {
  const override = process.env.WENDO_KNOWLEDGE_DIR?.trim();
  return override ? resolve(AGENT_ROOT, override) : join(AGENT_ROOT, "knowledge");
}

/**
 * 合规规则库根目录；与 wendo-server 使用同一个 WENDO_LEGAL_DIR 约定。
 * 相对路径按 agent/ 解析，避免从别的 cwd 启动时指到错误目录。
 */
export function legalRoot(): string {
  const override = process.env.WENDO_LEGAL_DIR?.trim();
  return override ? resolve(AGENT_ROOT, override) : join(knowledgeRoot(), "legal");
}

const indexCache = new Map<string, RawMarket[]>();

/** 读 legal/index.json；缺失或结构不对时明确失败，不返回空市场列表。 */
function readLegalIndex(): RawMarket[] {
  const root = legalRoot();
  const cached = indexCache.get(root);
  if (cached) return cached;

  const indexPath = join(root, "index.json");
  if (!existsSync(indexPath)) {
    throw new MarketError(
      "market_index_missing",
      `找不到市场索引 ${indexPath}。请设置 WENDO_LEGAL_DIR 指向 agent/knowledge/legal，或 WENDO_KNOWLEDGE_DIR 指向 agent/knowledge。`,
    );
  }

  let parsed: RawIndex;
  try {
    parsed = JSON.parse(readFileSync(indexPath, "utf8")) as RawIndex;
  } catch (error) {
    throw new MarketError(
      "market_index_missing",
      `市场索引无法解析：${indexPath}（${error instanceof Error ? error.message : String(error)}）`,
    );
  }
  if (!Array.isArray(parsed.markets)) {
    throw new MarketError("market_index_missing", `市场索引缺少 markets 数组：${indexPath}`);
  }

  const markets = parsed.markets.filter((item): item is RawMarket => Boolean(item) && typeof item === "object");
  indexCache.set(root, markets);
  return markets;
}

function codeOf(raw: RawMarket): string {
  return typeof raw.market === "string" ? raw.market.trim().toUpperCase() : "";
}

function nameOf(raw: RawMarket): string {
  return typeof raw.market_name === "string" ? raw.market_name.trim() : "";
}

/**
 * 解析请求的市场。空值走默认 MY；`sg` 这类小写按大写处理；
 * 未收录的代码直接抛 `market_unsupported`，绝不回落到默认市场。
 */
export function resolveMarket(requested?: string | null): MarketInfo {
  const raw = (requested ?? "").trim();
  const code = raw ? raw.toUpperCase() : DEFAULT_MARKET;
  const markets = readLegalIndex();
  const entry = markets.find((item) => codeOf(item) === code);
  if (!entry) {
    const available = markets
      .map((item) => `${codeOf(item)}（${nameOf(item)}）`)
      .filter((label) => label !== "（）")
      .join("、");
    throw new MarketError(
      "market_unsupported",
      `未知市场「${raw || code}」。agent/knowledge/legal/index.json 收录的市场：${available || "（空）"}`,
    );
  }

  const name = nameOf(entry);
  if (!name) {
    throw new MarketError("market_index_missing", `市场索引里的 ${code} 缺少 market_name。`);
  }
  const rulesFile =
    typeof entry.rules_file === "string" && entry.rules_file.trim()
      ? entry.rules_file.trim()
      : `${code.toLowerCase()}/rules.v0.1.json`;

  return {
    code,
    name,
    open: entry.open === true,
    status: typeof entry.status === "string" ? entry.status : "",
    kbDir: join(knowledgeRoot(), code.toLowerCase()),
    countryFile: COUNTRY_FILES[code] ?? `${code.toLowerCase()}.md`,
    legalRulesPath: join(legalRoot(), rulesFile),
    timeZone: TIME_ZONES[code] ?? "UTC",
  };
}

export interface MissingMarketFile {
  /** 人类可读的文件用途，写进错误详情。 */
  label: string;
  path: string;
}

function displayPath(path: string): string {
  const rel = relative(process.cwd(), path);
  return rel.startsWith("..") ? path : rel;
}

/**
 * 该市场 + 品类要跑通一次诊断，必须有四个文件：国家知识库、品类索引、
 * 品类规则原文、法规规则库。只做存在性检查，内容校验留给各自的加载器。
 */
export function marketKbMissing(market: MarketInfo, category: CategoryProfile): MissingMarketFile[] {
  const required: MissingMarketFile[] = [
    { label: `${market.name}国家知识库`, path: join(market.kbDir, market.countryFile) },
    { label: `${market.name}×${category.name}索引`, path: join(market.kbDir, category.indexFile) },
    { label: `${market.name}×${category.name}规则原文`, path: join(market.kbDir, category.rulesFile) },
    { label: `${market.name}法规规则库`, path: market.legalRulesPath },
  ];
  return required.filter((item) => !existsSync(item.path));
}

/**
 * 抓取前的前置检查：缺文件时在联网和调用模型之前失败，错误码 `market_kb_missing`。
 * 错误详情逐条列出缺哪个文件，方便补齐知识库；不会建议或执行 MY 兜底。
 */
export function assertMarketKbReady(market: MarketInfo, category: CategoryProfile): void {
  const missing = marketKbMissing(market, category);
  if (!missing.length) return;
  throw new MarketError(
    "market_kb_missing",
    `市场 ${market.code}（${market.name}）的知识库未就绪：缺少 ${missing.length} 个文件。已停止，未回退到 ${DEFAULT_MARKET}。`,
    missing.map((item) => `${item.label}：${displayPath(item.path)}`),
  );
}
