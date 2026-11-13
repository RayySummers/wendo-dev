# Wendo Agent — 文化适配诊断（11/15 演示版）

固定工具链的文化适配诊断 agent：输入一个落地页 URL，输出一份可核对的诊断报告 JSON，
并按同一份 JSON 渲染网页与 Typst PDF。

```
fetch_page (Scrapling + 界面信号) → retrieve_kb (马来西亚 × 小家电) → score_and_report (Pi)
```

三步由 `src/pipeline.ts` 按顺序驱动，agent 不参与规划，也不能跳过、改序或自由调用工具。
这是 RAY-657 的实现，服务于 RAY-655「Wendo MVP 11/15 演示版」。

## 界面可翻译性信号（RAY-674）

`fetch_page` 除了正文，还会从抓到的 HTML/CSS 里抽一份「计算样式快照」：文档 `lang`、
`<style>` 内联块与同源外链样式表、以及每个带文本元素的字号/字重/颜色/行高/宽高/
`white-space`/`text-overflow`/`word-break`/`line-clamp` 等声明。随后由 `src/interface/`
在代码侧判断「换成英语或马来语后会不会被裁、会不会断错词、层级会不会塌」，命中才写进报告，
没有信号就不产出条目。它是「信息层级与表达自然度」维度下的子检查，不新增维度。

- 规则与文案：`src/interface/rules.ts`，编号对齐知识库 `MY-UI-01..10`
  （`knowledge/my/interface-survivability.md`，RAY-673；该文件在 RAY-673 分支上，
  尚未并入 `master`，代码不依赖它）
- 判定与阈值：`src/interface/analyze.ts`（字符宽度估算 + 1.4 倍翻译探针）
- 渲染与合并：`src/interface/report.ts`（`kind: interface_translation` + `evidence`）
- 抽取脚本：`scripts/interface_signals.py`

覆盖范围：01 固定宽度 / 02 截断 / 03 断行 / 04 CJK 小字号 / 05 层级通道 / 06 密度 /
07 用词补设计 / 08 输入与 IME（静态）。第 09 类声音层与第 10 类 RTL 只进
`interface_candidates`（提示，不是缺陷）——规则包要求没做 round-trip 不写成缺陷、RTL 只记录。

不需要模型 key 就能单独核对某页命中了什么：

```bash
npx tsx scripts/interface-report.ts https://bears.com.my/          # 人类可读
npx tsx scripts/interface-report.ts https://bears.com.my/ --json   # 机器可读
```

离线测试：`npm run test`（TS 侧规则与渲染）+ `npm run test:py`（抽取器夹具，不联网）。

`python3 scripts/scrape_page.py <url> <out.json> --no-interface` 可关闭抽取；抽取失败只降级为
`interface.captured=false`，不影响正文与报告生成。

## 产物

| 文件 | 说明 |
|---|---|
| `reports/bear-malaysia-v1-20261112.json` | 小熊电器马来西亚站首页的诊断报告（v1 演示样本） |
| `reports/bear-malaysia-v1-20261112.html` | 网页版报告，引用同一份 JSON |
| `reports/bear-malaysia-v1-20261112.pdf` | Typst 导出 PDF，内容与网页一致 |
| `reports/reference/v0/` | 需求评论里给的 v0 基线，仅作对照，不参与应用 |

报告契约见 [REPORTS.md](./REPORTS.md)。

## 快速开始

前置：Node.js ≥ 22.19、Python 3.11+、[Typst](https://typst.app/) 0.13+。

```bash
cd agent
npm install
python3 -m pip install -r scripts/requirements.txt   # Scrapling 0.5.1

cp .env.example .env
# 填入 WENDO_LLM_API_KEY；正式环境用 DeepSeek 官方 key

npm run diagnose -- https://bears.com.my/ --slug bear-malaysia
```

输出写入 `reports/`：`<slug>-<YYYYMMDD>.json` / `.html` / `.pdf`。

常用参数：

```bash
npm run diagnose -- <url> --no-pdf        # 只出 JSON + HTML
npm run diagnose -- <url> --json          # 给后端集成的 JSON 结果（含 token 用量）
npm run diagnose -- <url> --debug         # 打印每次校验失败的具体问题
```

## 模型档位

业务代码只写 `lite`，映射表在 `src/config.ts`：

| 档位 | 模型 ID | credit 倍率 | 11/15 演示版 |
|---|---|---|---|
| `lite` | `deepseek-flash`（服务版本 DeepSeek-V4.1-Flash-1017） | 1× | 开放 |
| `pro` | `deepseek-pro` | 3× | 灰色，调用会直接报错 |
| `max` | `deepseek-max` | 5× | 灰色，调用会直接报错 |

开发期 DeepSeek 直连 key 返回 401，可改用 AxonHub / 本地网关：

```dotenv
WENDO_LLM_BASE_URL=http://127.0.0.1:3425/v1
WENDO_LLM_API_KEY=<gateway key>
WENDO_LLM_MODEL_LITE=group/deepseek-pool
```

正式环境必须换回有效的 DeepSeek key（`WENDO_LLM_MODEL_LITE=deepseek-flash`）。

### 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `WENDO_LLM_API_KEY` | 无（必填） | 模型网关密钥 |
| `WENDO_LLM_BASE_URL` | `https://api.deepseek.com/v1` | OpenAI-compatible 网关地址 |
| `WENDO_LLM_MODEL_LITE` | `deepseek-flash` | Lite 档位实际模型 ID |
| `WENDO_LLM_CONTEXT_WINDOW` | `1048576` | 模型上下文窗口 |
| `WENDO_LLM_MAX_TOKENS` | `32768` | 单次输出上限 |
| `WENDO_LLM_TIMEOUT_MS` | `180000` | 单次模型调用超时 |
| `WENDO_PYTHON` | `python3` | Scrapling 使用的解释器 |
| `WENDO_TYPST` | `typst` | Typst 可执行文件 |

## 目录结构

```
agent/
├─ src/
│  ├─ pipeline.ts            固定工具链编排 + meta 注入
│  ├─ config.ts              档位映射、网关配置、.env 读取
│  ├─ types.ts               zod 报告 schema
│  ├─ interface/             界面可翻译性信号：规则包、判定、报告合并
│  ├─ tools/
│  │  ├─ fetch-page.ts       fetch_page：Scrapling 单页抓取 + 样式快照
│  │  ├─ retrieve-kb.ts      retrieve_kb：信号匹配 + 知识库摘录
│  │  └─ score-and-report.ts score_and_report：Pi agent + 校验/重试
│  └─ render/
│     ├─ report-html.ts      网页渲染
│     ├─ report-pdf.ts       Typst 编译
│     └─ parity.ts           网页/PDF 内容一致性核对
├─ scripts/
│  ├─ scrape_page.py         Scrapling 抓取脚本（只抓单页）
│  ├─ interface_signals.py   CSS 层叠 + 继承 + 尺寸归一，输出样式快照
│  ├─ interface-report.ts    只需抓取就能预览界面信号的 CLI
│  └─ verify-parity.ts       逐字段核对网页与 PDF
├─ knowledge/my/
│  ├─ malaysia.md            团队国家知识库（来自 wendo-knowledge-base）
│  ├─ small-appliances.md    小家电品类补充规则
│  └─ index.json             结构化规则（retrieve_kb 的检索源）
├─ report.typ                Typst 模板（只读报告 JSON）
├─ reports/                  演示样本与导出物
└─ test/                     node:test 测试
```

## 校验与失败行为

`score_and_report` 不信任模型输出，代码侧校验：

1. **结构**：zod schema、风险 3–8 条、维度必须覆盖检索结果；
2. **引用**：每条 `quote` 必须逐字出现在页面正文中（空白归一化后子串匹配）；
3. **合规**：不允许分数字段或「N 分」表达；`why`/`fix`/`summary` 必须是中文。

校验失败会把问题清单回传给模型重试一轮（默认 2 次尝试）；仍失败则抛出
`ReportGenerationError`，**不会落盘空报告**。抓取失败同样带错误码退出：

| 退出码 | 含义 |
|---|---|
| 2 | 配置/参数错误（缺 key、档位未开放、URL 非法） |
| 3 | fetch_page 失败（HTTP 错误、正文过短、超时） |
| 4 | score_and_report 失败（模型错误、校验失败） |
| 5 | Typst 编译失败（JSON 与 HTML 已写出） |

## 与账号 / credit / 前端衔接

- `runDiagnosis()` 返回 `usage: { inputTokens, outputTokens, totalTokens, model, tier }`，
  供 RAY-656 的 ledger 记录 token 与扣减；档位倍率在 `src/config.ts` 的 `TIERS`。
- `npm run diagnose -- <url> --json` 输出 JSON 结果（路径、风险数、usage、耗时），供后端调用。
- 报告 JSON 是 RAY-658 前端报告页的唯一数据源；`reports/*.html` 只是同源渲染的参考实现。

## 测试

```bash
npm run typecheck
npm test                 # 校验逻辑、KB 检索、HTML 渲染、Typst PDF 与文本一致性
npm run verify:parity -- reports/bear-malaysia-v1-20261112.json
```

`npm test` 中的 PDF 用例会在缺少 Typst 或 `pdftotext` 时自动跳过。

## 第三方许可

Pi 的 `pi-ai` / `pi-agent-core` / `pi-schema` / `pi-telemetry` 均为 MIT；完整许可文本见 [`THIRD_PARTY_LICENSES.md`](./THIRD_PARTY_LICENSES.md)。

## 已知限制（11/15 演示版）

- 只抓单个页面，不爬站、不执行复杂前端交互；Scrapling `Fetcher` 为主，JS 重的站点可能抓不全。
- 只做马来西亚 × 小家电；国家知识库来自 `wendo-knowledge-base`，品类规则是团队编辑判断。
- Pro / Max 只有配置占位，没有任何真实调用。
- 报告不含图片；PDF 只做文字排版。
- 正式环境需要有效的 DeepSeek key；开发期网关只用于打通链路。
