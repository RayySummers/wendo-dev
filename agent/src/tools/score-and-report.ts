import { Agent } from "@earendil-works/pi-agent-core";
import {
  createModels,
  createProvider,
  envApiKeyAuth,
  type AssistantMessage,
  type Model,
} from "@earendil-works/pi-ai";
import { openAICompletionsApi } from "@earendil-works/pi-ai/api/openai-completions.lazy";
import { resolveLlmConfig, type TierConfig } from "../config.js";
import { extractJsonObject, hasChinese, normalizeWhitespace } from "../text.js";
import {
  ModelReportSchema,
  type FetchedPage,
  type KbDigest,
  type KbDimension,
  type ModelReport,
  type TokenUsage,
} from "../types.js";

export class ReportGenerationError extends Error {
  readonly code: string;
  readonly details: string[];

  constructor(code: string, message: string, details: string[] = []) {
    super(message);
    this.name = "ReportGenerationError";
    this.code = code;
    this.details = details;
  }
}

const SYSTEM_PROMPT = `你是「文渡 Wendo」的文化适配诊断引擎，为粤港澳大湾区中小型轻工企业出海做落地页诊断。
你的读者是企业里负责出海内容的运营负责人：他们要能直接照着改文案，而不是读一篇分析报告。

硬性规则：
1. 只使用【页面正文】与【知识库】中的信息。不得编造页面没有出现的功能、认证、评价、价格、物流承诺或客服渠道。
2. 每条风险的 quote 必须是【页面正文】里逐字出现的片段：直接复制，不要改写、不要翻译、不要用省略号、不要跨行拼接两处文本。quote 至少 8 个字符，不要只引用一个数字或单个词；优先复制完整短语或句子。代码会逐字核对，核对失败整份报告作废。
3. 输出 3–6 条风险，按严重程度从高到低排列。只保留能从页面正文举证的条目。
4. 不输出任何分数、百分比、星级、打分或综合评级。dimensions 只用 risk / ok / not_assessable 三种状态。
5. summary、why、fix、note 用简体中文；quote 保留页面原文语言（英文/马来文）。
6. strengths 必须给出页面原文引用；not_assessable 写清「首页无法判断什么、为什么无法判断」。
7. 知识库里的建议是编辑判断，不要写成马来西亚法规；没有页面证据时放进 not_assessable。
8. 只输出一个 JSON 对象：不要 Markdown 代码块，不要前后解释，不要注释。`;

function buildRuleBlock(dimensions: KbDimension[]): string {
  return dimensions
    .map((dimension) => {
      const rules = dimension.rules
        .map((rule) => {
          const hit = rule.matchedSignals.length > 0 ? `［命中：${rule.matchedSignals.join("、")}］` : "";
          return `- [${rule.id}] ${rule.rule}${hit}\n  为什么：${rule.why}\n  怎么改：${rule.fix}`;
        })
        .join("\n");
      return `### ${dimension.name}（页面信号命中 ${dimension.hits}）\n${rules}`;
    })
    .join("\n\n");
}

export function buildUserPrompt(page: FetchedPage, kb: KbDigest): string {
  const dimensionNames = kb.dimensions.map((dimension) => dimension.name);
  const excerpts = kb.excerpts
    .map((excerpt) => `#### ${excerpt.title}（${excerpt.source}）\n${excerpt.body}`)
    .join("\n\n");

  return `【样本信息】
来源：${page.finalUrl || "用户粘贴的文本（单页正文，未经抓取）"}
页面标题：${page.title || "（无标题）"}
市场：${kb.marketName}（${kb.market}）　品类：${kb.categoryName}
页面正文长度：${page.charCount} 字符（${page.fetcher === "inline-text" ? "用户粘贴" : "Scrapling 抓取，单页"}）

【页面正文（逐字引用只能取自这一段）】
"""
${page.text}
"""

【知识库检索结果】
知识库版本：${kb.version}
${buildRuleBlock(kb.dimensions)}

【知识库原文摘录】
${excerpts}

【输出 JSON 结构】
{
  "summary": "两到三句话的总体判断：最关键的适配问题 + 一个可以直接执行的下一步",
  "risks": [
    {
      "severity": "high | medium | low",
      "quote": "页面正文里的逐字片段",
      "why": "为什么这在马来西亚市场是问题（用知识库依据，不要空泛）",
      "fix": "具体怎么改：给出可直接使用的文案或做法"
    }
  ],
  "strengths": [
    { "quote": "页面正文里的逐字片段", "why": "为什么这是加分项" }
  ],
  "not_assessable": [
    { "item": "首页无法判断的事项", "reason": "为什么仅凭这一页无法判断" }
  ],
  "dimensions": [
    { "name": "维度中文名", "status": "risk | ok | not_assessable", "note": "一句话依据" }
  ]
}

dimensions 必须按顺序覆盖以下 ${dimensionNames.length} 个维度，name 必须逐字使用：
${dimensionNames.map((name, index) => `${index + 1}. ${name}`).join("\n")}

现在输出 JSON。`;
}

function buildModel(tier: TierConfig, modelId: string): Model<"openai-completions"> {
  const llm = resolveLlmConfig(tier);
  return {
    id: modelId,
    name: `${tier.label} · ${modelId}`,
    api: "openai-completions",
    provider: "wendo-gateway",
    baseUrl: llm.baseUrl,
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: llm.contextWindow,
    maxTokens: llm.maxTokens,
    compat: {
      supportsDeveloperRole: false,
      supportsReasoningEffort: false,
    },
    samplingParams: { temperature: 0.2 },
  };
}

function createAgent(tier: TierConfig, modelId: string): Agent {
  const llm = resolveLlmConfig(tier);
  const model = buildModel(tier, modelId);
  const provider = createProvider({
    id: "wendo-gateway",
    name: "Wendo LLM gateway",
    baseUrl: llm.baseUrl,
    auth: { apiKey: envApiKeyAuth("Wendo LLM gateway", ["WENDO_LLM_API_KEY"]) },
    models: [model],
    api: openAICompletionsApi(),
  });

  const models = createModels();
  models.setProvider(provider);
  const resolved = models.getModel("wendo-gateway", modelId);
  if (!resolved) {
    throw new ReportGenerationError("model_unavailable", `无法在网关中注册模型 "${modelId}"。`);
  }

  return new Agent({
    initialState: { systemPrompt: SYSTEM_PROMPT, model: resolved },
    streamFn: models.streamSimple.bind(models),
  });
}

function lastAssistant(agent: Agent): AssistantMessage {
  for (let index = agent.state.messages.length - 1; index >= 0; index -= 1) {
    const message = agent.state.messages[index];
    if (message?.role === "assistant") return message;
  }
  throw new ReportGenerationError("empty_response", "模型没有返回任何助手消息。");
}

function assistantText(message: AssistantMessage): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

async function runAgent(agent: Agent, prompt: string, timeoutMs: number): Promise<AssistantMessage> {
  const timer = setTimeout(() => agent.abort(), timeoutMs);
  try {
    await agent.prompt(prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ReportGenerationError("agent_failed", `Agent 调用失败：${message}`);
  } finally {
    clearTimeout(timer);
  }

  const message = lastAssistant(agent);
  if (message.stopReason === "aborted") {
    throw new ReportGenerationError(
      "llm_timeout",
      `模型调用超时（${Math.round(timeoutMs / 1000)}s），已中止；未生成报告。`,
    );
  }
  if (message.stopReason === "error") {
    throw new ReportGenerationError(
      "llm_error",
      `模型调用失败：${message.errorMessage ?? "未知错误"}（provider=${message.provider}, model=${message.model}）`,
    );
  }
  const text = assistantText(message);
  if (!text) {
    throw new ReportGenerationError("empty_response", "模型返回了空文本，已中止，不生成空报告。");
  }
  return message;
}

interface ValidationOutcome {
  report?: ModelReport;
  problems: string[];
}

function findForbiddenKeys(value: unknown, path = "$"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findForbiddenKeys(item, `${path}[${index}]`));
  }
  if (!value || typeof value !== "object") return [];
  const problems: string[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/^(score|scores|rating|grade|overall_score|percentage)$/i.test(key)) {
      problems.push(`不允许出现分数字段：${path}.${key}`);
    }
    problems.push(...findForbiddenKeys(child, `${path}.${key}`));
  }
  return problems;
}

function findScorePhrases(value: unknown, path = "$"): string[] {
  if (typeof value === "string") {
    return /(?<![\d.])\d+(?:\.\d+)?\s*分(?![钟之])|\/\s*(?:10|100)\b/.test(value)
      ? [`文案里出现打分表达：${path}`]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findScorePhrases(item, `${path}[${index}]`));
  }
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    findScorePhrases(child, `${path}.${key}`),
  );
}

/**
 * 对模型返回的原始对象做三层校验：
 * 1) 结构与枚举（zod）
 * 2) 风险/优势的原文引用必须逐字出现在页面正文里
 * 3) 不允许出现分数、打分表达；中文说明字段必须是中文
 */
export function validateReport(raw: unknown, pageText: string, kb: KbDigest): ValidationOutcome {
  const problems = [...findForbiddenKeys(raw), ...findScorePhrases(raw)];

  const parsed = ModelReportSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems.push(`结构错误 ${issue.path.join(".") || "(root)"}：${issue.message}`);
    }
    return { problems };
  }

  const report = parsed.data;
  const page = normalizeWhitespace(pageText);

  report.risks.forEach((risk, index) => {
    const quote = normalizeWhitespace(risk.quote);
    if (quote.length < 8) {
      problems.push(
        `risks[${index}].quote 太短（至少 8 个字符）：「${risk.quote}」，请改为完整短语或句子`,
      );
    } else if (!page.includes(quote)) {
      problems.push(`risks[${index}].quote 未在页面正文中逐字出现：「${risk.quote}」`);
    }
    if (!hasChinese(risk.why, 4)) problems.push(`risks[${index}].why 需要用简体中文说明原因`);
    if (!hasChinese(risk.fix, 4)) problems.push(`risks[${index}].fix 需要用简体中文给出改法`);
  });

  report.strengths.forEach((strength, index) => {
    const quote = normalizeWhitespace(strength.quote);
    if (quote.length < 4 || !page.includes(quote)) {
      problems.push(`strengths[${index}].quote 未在页面正文中逐字出现：「${strength.quote}」`);
    }
    if (!hasChinese(strength.why, 2)) problems.push(`strengths[${index}].why 需要用简体中文`);
  });

  const expectedNames = kb.dimensions.map((dimension) => dimension.name);
  const actualNames = report.dimensions.map((dimension) => dimension.name);
  const missing = expectedNames.filter((name) => !actualNames.includes(name));
  const extra = actualNames.filter((name) => !expectedNames.includes(name));
  if (missing.length) problems.push(`dimensions 缺少维度：${missing.join("、")}`);
  if (extra.length) problems.push(`dimensions 出现未知维度：${extra.join("、")}`);
  if (actualNames.length !== expectedNames.length) {
    problems.push(`dimensions 数量应为 ${expectedNames.length}，实际 ${actualNames.length}`);
  }

  if (!hasChinese(report.summary, 8)) {
    problems.push("summary 需要用简体中文写总体判断");
  }

  return problems.length ? { problems } : { report, problems: [] };
}

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export interface ScoreAndReportOptions {
  page: FetchedPage;
  kb: KbDigest;
  tier: TierConfig;
  /** 最多尝试次数（含修复轮），默认 2。 */
  maxAttempts?: number;
  /** 单次模型调用超时，默认取 WENDO_LLM_TIMEOUT_MS 或 180s。 */
  timeoutMs?: number;
  onAttempt?: (attempt: number, problems: string[]) => void;
}

/**
 * score_and_report：固定工具链第 3 步。
 * 用 Pi agent 做一次受约束的生成，代码侧负责结构、引用与合规校验；
 * 校验失败时带着问题清单重试一轮，仍失败则抛错，绝不返回空报告。
 */
export async function scoreAndReport(
  options: ScoreAndReportOptions,
): Promise<{ report: ModelReport; usage: TokenUsage; attempts: number }> {
  const { page, kb, tier } = options;
  const maxAttempts = options.maxAttempts ?? 2;
  const timeoutMs = options.timeoutMs ?? resolveLlmConfig(tier).timeoutMs;
  const agent = createAgent(tier, resolveLlmConfig(tier).modelId);

  const usage: TokenUsage = {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    totalTokens: 0,
    model: resolveLlmConfig(tier).modelId,
    tier: tier.label,
  };

  const userPrompt = buildUserPrompt(page, kb);
  let prompt = userPrompt;
  let problems: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    options.onAttempt?.(attempt, problems);
    const message = await runAgent(agent, prompt, timeoutMs);
    // pi 把命中缓存的输入单列在 cacheRead；计费口径应把缓存命中算进输入总量。
    usage.inputTokens += message.usage.input + message.usage.cacheRead;
    usage.cachedInputTokens += message.usage.cacheRead;
    usage.outputTokens += message.usage.output;
    usage.totalTokens += message.usage.input + message.usage.cacheRead + message.usage.output;

    let raw: unknown;
    try {
      raw = JSON.parse(extractJsonObject(assistantText(message)));
    } catch (error) {
      problems = [
        `输出不是合法 JSON：${error instanceof Error ? error.message : String(error)}。请只返回一个 JSON 对象。`,
      ];
      prompt = buildRepairPrompt(problems);
      continue;
    }

    const outcome = validateReport(raw, page.text, kb);
    if (outcome.report) {
      const sorted = [...outcome.report.risks].sort(
        (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
      );
      return { report: { ...outcome.report, risks: sorted }, usage, attempts: attempt };
    }
    problems = outcome.problems;
    prompt = buildRepairPrompt(problems);
  }

  throw new ReportGenerationError(
    "validation_failed",
    `报告在 ${maxAttempts} 次尝试后仍未通过校验，已中止（不返回空报告）。`,
    problems,
  );
}

function buildRepairPrompt(problems: string[]): string {
  return `上一次输出没有通过校验，问题如下：
${problems.map((problem, index) => `${index + 1}. ${problem}`).join("\n")}

请修正后重新输出完整 JSON：
- quote 必须从【页面正文】逐字复制，不要改写、不要跨行拼接、不要加省略号；
- 不要出现任何分数、百分比或评级；
- dimensions 按给定顺序与名称原样输出；
- 只输出 JSON，不要解释。`;
}
