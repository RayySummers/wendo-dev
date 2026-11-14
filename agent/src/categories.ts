/**
 * 诊断品类注册表（RAY-686）。
 *
 * 品类决定 retrieve_kb 读哪一份索引与规则原文，也决定报告 meta 的
 * `category` / `category_name`。这里是 agent 侧的唯一来源：
 *   - 没有登记的品类直接报错，绝不静默回落到小家电；
 *   - 新增品类时同时放 `knowledge/my/<indexFile>` 与 `<rulesFile>`，
 *     再到 `wendo-server/src/lib/categories.ts` 把该品类标成 `dedicated`。
 */
export interface CategoryProfile {
  /** 与前端 `CategoryCode` 对齐的稳定代码。 */
  code: string;
  /** 报告 meta.category_name 使用的中文名。 */
  name: string;
  /** 结构化规则索引（含 category / category_name / version / dimensions）。 */
  indexFile: string;
  /** 供 prompt 摘录的品类规则原文。 */
  rulesFile: string;
}

export const CATEGORY_PROFILES: readonly CategoryProfile[] = [
  {
    code: "small_appliances",
    name: "小家电",
    indexFile: "index.json",
    rulesFile: "small-appliances.md",
  },
  {
    code: "consumer_electronics",
    name: "3C 数码",
    indexFile: "index.consumer-electronics.json",
    rulesFile: "consumer-electronics.md",
  },
];

export const DEFAULT_CATEGORY_CODE = "small_appliances";

export class CategoryError extends Error {
  readonly code = "category_unsupported";

  constructor(message: string) {
    super(message);
    this.name = "CategoryError";
  }
}

/**
 * 解析品类代码：空值走默认小家电，未知品类直接失败。
 * 兼容命令行里常见的 `consumer-electronics` 写法，统一成下划线代码。
 */
export function resolveCategoryProfile(requested?: string | null): CategoryProfile {
  const raw = (requested ?? "").trim();
  const code = raw ? raw.replace(/-/g, "_") : DEFAULT_CATEGORY_CODE;
  const profile = CATEGORY_PROFILES.find((item) => item.code === code);
  if (!profile) {
    const supported = CATEGORY_PROFILES.map((item) => `${item.code}（${item.name}）`).join("、");
    throw new CategoryError(`未知品类「${raw}」。当前支持：${supported}`);
  }
  return profile;
}
