import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type ModelTier = "lite" | "pro" | "max";

export interface TierConfig {
  /** UI 展示名。业务代码只写 lite。 */
  label: string;
  /** 配置层映射到的 Pi 模型 ID。 */
  model: string;
  /** credit 计费倍率，仅在后台使用。 */
  multiplier: number;
  /** 11/15 演示版只开放 Lite。 */
  enabled: boolean;
}

/**
 * 唯一的模型档位映射表。
 * 业务代码只传 `lite`；这里负责 lite → deepseek-flash 的映射。
 * Pro / Max 在 11/15 演示版保持灰色（enabled: false），不做真实调用。
 */
export const TIERS: Record<ModelTier, TierConfig> = {
  lite: { label: "Lite", model: "deepseek-flash", multiplier: 1, enabled: true },
  pro: { label: "Pro", model: "deepseek-pro", multiplier: 3, enabled: false },
  max: { label: "Max", model: "deepseek-max", multiplier: 5, enabled: false },
};

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  modelId: string;
  contextWindow: number;
  maxTokens: number;
  timeoutMs: number;
}

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

/** 读取 agent/.env（若存在），不覆盖已注入的环境变量。 */
export function loadDotEnv(cwd = process.cwd()): void {
  const candidate = [resolve(cwd, ".env"), resolve(cwd, "agent/.env")];
  for (const file of candidate) {
    if (!existsSync(file)) continue;
    try {
      // Node >= 20.12：只补齐缺失的键，已存在的环境变量优先。
      process.loadEnvFile(file);
      return;
    } catch {
      return;
    }
  }
}

export function resolveTier(tier: string): TierConfig {
  const config = TIERS[tier as ModelTier];
  if (!config) {
    throw new ConfigError(`未知模型档位 "${tier}"，可选值：lite / pro / max`);
  }
  if (!config.enabled) {
    throw new ConfigError(`模型档位 ${config.label} 在 11/15 演示版未开放，目前只能使用 Lite。`);
  }
  return config;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConfigError(`环境变量 ${name} 必须是正整数，当前为 "${raw}"`);
  }
  return value;
}

export function resolveLlmConfig(tier: TierConfig): LlmConfig {
  const apiKey = process.env.WENDO_LLM_API_KEY?.trim();
  if (!apiKey) {
    throw new ConfigError(
      "缺少 WENDO_LLM_API_KEY。请在 agent/.env 中配置（参考 agent/.env.example），或直接注入环境变量。",
    );
  }
  const baseUrl = (process.env.WENDO_LLM_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const modelId = process.env.WENDO_LLM_MODEL_LITE?.trim() || tier.model;
  return {
    baseUrl,
    apiKey,
    modelId,
    contextWindow: readPositiveInt("WENDO_LLM_CONTEXT_WINDOW", 1_048_576),
    maxTokens: readPositiveInt("WENDO_LLM_MAX_TOKENS", 32_768),
    timeoutMs: readPositiveInt("WENDO_LLM_TIMEOUT_MS", 180_000),
  };
}
