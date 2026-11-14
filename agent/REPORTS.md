# 报告 JSON 契约（v1）

网页报告与 Typst PDF 共用同一份 JSON。任何字段变更都要同步修改：

- `src/types.ts`（zod schema，唯一的运行时校验）
- `src/render/report-html.ts`（网页）
- `report.typ`（PDF）
- 本文档

## 完整示例

```json
{
  "meta": {
    "url": "https://bears.com.my/",
    "final_url": "https://bears.com.my/",
    "title": "Bear Malaysia - Home Appliances | Cookware",
    "market": "MY",
    "market_name": "马来西亚",
    "category": "small_appliances",
    "category_name": "小家电",
    "generated_at": "2026-11-12T20:47:11+08:00",
    "tier": "Lite",
    "source_chars": 2590,
    "knowledge_version": "2026-11-12",
    "agent_version": "0.2.0"
  },
  "summary": "两到三句话：最关键的适配问题 + 一个可以直接执行的下一步。",
  "risks": [
    {
      "severity": "high",
      "quote": "页面正文里的逐字片段",
      "why": "为什么这在马来西亚市场是问题",
      "fix": "具体怎么改，给出可直接使用的文案或做法"
    },
    {
      "severity": "high",
      "kind": "interface_translation",
      "quote": "Bear Electric Food Steamer BFS-C60L 6L Multifuntion Double Layer 2 Tiers",
      "why": "文本被锁在固定高度或固定行数里，超出部分直接裁掉……（规则包文案）",
      "fix": "让高度跟着内容走：去掉固定 height，或把 line-clamp 提到目标语言真正需要的行数……",
      "evidence": "IF-TRUNC-01 · height:55px · line-height:19.2px · 估算 4 行 / 可容纳 2.9 行 · 容器宽约 310px · .product-name"
    }
  ],
  "strengths": [
    { "quote": "页面正文里的逐字片段", "why": "为什么这是加分项" }
  ],
  "not_assessable": [
    { "item": "首页无法判断的事项", "reason": "为什么仅凭这一页无法判断" }
  ],
  "dimensions": [
    { "name": "语言与本地化表达", "status": "risk", "note": "一句话依据" },
    { "name": "市场就绪度", "status": "risk", "note": "市场就绪度 8 项页面检查：已展示 3 项、未展示 2 项、需复核 3 项。只看页面可见信息，不代表认证、税务或支付合规结论。" }
  ],
  "market_readiness": [
    {
      "checkId": "MY-MR-01",
      "label": "英语变体一致性",
      "status": "present",
      "quote": "页面正文里的逐字片段",
      "why": "为什么记这一条",
      "fix": "怎么改",
      "dimension": "market_readiness",
      "evidence": "整页可见文本（排除导航/页脚标签） · 美式拼写命中 0、CJK 命中 0"
    }
  ]
}
```

## 字段规则

| 字段 | 类型 | 约束 |
|---|---|---|
| `meta` | object | 由 pipeline 在代码侧补齐，模型不生成 |
| `meta.generated_at` | string | 马来西亚时间（UTC+8），ISO 8601 |
| `meta.tier` | string | 只可能是 `Lite`（11/15 演示版） |
| `summary` | string | 简体中文，≥ 10 字符 |
| `risks` | array | 3–16 条（模型 3–8 条内容风险 + 合规条目最多 6 条），按严重程度排序；`severity` 为 `high/medium/low` |
| `risks[].quote` | string | 内容风险：必须是页面正文的逐字子串（≥ 8 字符），代码会核对；界面风险：命中的元素文本或 HTML 片段 |
| `risks[].why` / `fix` | string | 简体中文，给出可执行改法 |
| `risks[].kind` | string? | 缺省视为 `content`；`interface_translation` 表示由界面信号（HTML/CSS）产出，不经模型 |
| `risks[].evidence` | string? | 仅 `interface_translation`：规则 id + 关键 CSS 声明 + 选择器，网页与 PDF 都要原样渲染 |
| `strengths` | array | 1–6 条，`quote` 同样逐字核对 |
| `not_assessable` | array | 1–10 条，说明「首页看不到什么、为什么」；含两条能力边界（市场就绪度 / 合规） |
| `dimensions` | array | 3–10 条，覆盖检索到的全部维度；`status` 为 `risk/ok/not_assessable` |
| `market_readiness` | array? | 固定 8 条（`MY-MR-01`…`MY-MR-08`，允许 `not_applicable`）；代码侧产出，模型不生成 |
| `market_readiness[].status` | string | `present/missing/needs_review/not_applicable`，不是风险等级 |
| `market_readiness[].quote` | string | 页面原文；页面没展示时为空字符串，**不补写**；超长行截断后仍是原文子串 |
| `market_readiness[].evidence` | string? | 代码侧取证范围与命中项，不是页面原文 |
| `risks[].dimension` | string? | 六维之一；合规条目固定为 `compliance`（RAY-698） |
| `risks[].law_name` | string? | 法规全名，取自 `knowledge/legal/my/rules.v0.1.json`，代码不写死 |
| `risks[].article` | string? | 条文号，例如 `s.10(1)(h)`、`reg.4(1)-(2)` |
| `risks[].decision_level` | string? | `rule_level` / `substantiation` / `human_review`，沿用规则库，代码不改写 |
| `risks[].review_required` | boolean? | `true` 时网页与 PDF 显示「需专业审核」；high 级与 `human_review` 默认 true |
| `risks[].last_verified` | string? | 该条规则的最近核验日期（`YYYY-MM-DD`） |
| `risks[].confidence` | string? | `high/medium/low`，只表示判断把握，不是分数 |

## 界面可翻译性子检查（RAY-674）

界面可翻译性是「信息层级与表达自然度」（knowledge 里的 `content` 维度）下的**子检查**，
不新增维度、不改现有权重（与 RAY-672 / RAY-673 的约定一致）：

- `dimensions` 条数不变，`content` 那一行的 `note` 末尾追加一句
  `界面子检查：检查 N 个文本元素，X 档字号 / Y 档字重 / Z 种文字颜色。命中 …`；
- 有命中时该维度状态至少是 `risk`；没抓到 CSS 时写「界面子检查无法判断」，不当作合格；
- 明细写在 `risks` 里，条目由代码注入（`src/interface/report.ts`），规则编号用知识库的
  `MY-UI-*`（见 `knowledge/my/interface-survivability.md`，RAY-673）。

> 规则正文目前只在 RAY-673 的分支 `knowledge/interface-survivability` 上，尚未并入 `master`。
> 代码不读这个文件（`src/interface/rules.ts` 自带文案，按 `MY-UI-*` 编号对齐），所以它缺席
> 不影响运行；RAY-673 合并后这份引用即可对上。

### 覆盖的 10 类

| 类 | 知识库 | 实现 | 证据口径 |
|---|---|---|---|
| 1 | MY-UI-01 | IF-TRUNC-03 | `ch`/`ex` 宽度声明 |
| 2 | MY-UI-02 | IF-TRUNC-01 / IF-TRUNC-02 | 固定高 / `line-clamp` / `nowrap` + 省略 |
| 3 | MY-UI-03 | IF-WRAP-01..04 | `break-all`、缺 `lang`、长词、行高 < 1.2 |
| 4 | MY-UI-04 | IF-SIZE-01 | `font-size` ≤ 11px 且承载文本 |
| 5 | MY-UI-05 | IF-HIER-01 | 同屏字号/字重/颜色计数 |
| 6 | MY-UI-06 | IF-DENSITY-01 | 可点元素数量 + 有无视觉主 CTA |
| 7 | MY-UI-07 | IF-WORD-01 | 按钮/标签里的「仅 / 一键 / just」 |
| 8 | MY-UI-08 | IF-INPUT-01 / IF-INPUT-02 | `maxlength`、内联 Enter / 空格处理 |
| 9 | MY-UI-09 | 候选（`interface_candidates`） | 声音层与字体回退，**只作提示** |
| 10 | MY-UI-10 | 候选（`interface_candidates`） | RTL **只记录**，不做检测结论 |

### 候选通道

`interface_candidates` 是可选数组，**不进 `risks`、不影响维度状态**。规则包要求：
声音层没做 round-trip 不写成缺陷（MY-UI-09），RTL 本轮只记录（MY-UI-10）。

| 字段 | 说明 |
|---|---|
| `rule` | `MY-UI-09` 或 `MY-UI-10` |
| `kind` | `voice` / `rtl` |
| `quote` | 页面原文片段（或 `<html>` 开标签） |
| `selector` | 元素选择器 |
| `evidence` | 规则号 + 判据 + 关键值 |
| `suggestion` | 后续怎么做（建议，不是结论） |

### 三个约束

- **命中才写**：没有信号就不产出条目。
- **有证据**：`evidence` 形如 `MY-UI-02 · 定高裁切 · height:55px · line-height:19.2px ·
  估算 4 行 / 可容纳 2.9 行 · 容器宽约 310px · <选择器>`；宽度来自声明推算时标「（估算）」。
- **不覆盖模型条目**：合并后按严重程度排序，最多 8 条；超出时先舍弃严重程度最低的模型条目。

### 已知口径限制

- 静态抓取拿不到 `scrollWidth > clientWidth` 这类渲染实测，宽度与文本宽度都是**声明推算 + 字符估算**，
  因此只在余量明显不足时报，证据里标「（估算）」。
- 数量不到「首屏」：MY-UI-06 数的是**整页**可点元素，且没有同品类基线，判据取保守值。
- IME 的运行时行为（组合期是否真的抢键）需要交互复核，静态只判「脚本里有没有 `isComposing` 守卫」。

## 市场就绪度检查（RAY-697）

市场就绪度（Layer 3）作为六维之一独立成章，v0.1 只做马来西亚的 8 条**页面就绪检查**：

| checkId | 检查 | 取证范围 |
|---|---|---|
| `MY-MR-01` | 英语变体一致性 | 整页正文（排除导航/页脚标签） |
| `MY-MR-02` | 货币与价格呈现（RM/MYR + 含税口径） | 商品主面板 |
| `MY-MR-03` | 计量单位（公制，不混英制） | 商品主面板 |
| `MY-MR-04` | 电压与插头（230V/50Hz + Type G） | 商品主面板 |
| `MY-MR-05` | 本地联系方式（电话/地址/工作时间） | 整页（页脚也算） |
| `MY-MR-06` | 配送、退换与保修 | 整页正文 |
| `MY-MR-07` | 本地支付方式（FPX / 本地银行 / 本地钱包） | 整页正文 |
| `MY-MR-08` | 认证标志展示（SIRIM / Safety Mark） | 整页 |

- **代码侧、不经模型**：`src/market-readiness/analyze.ts` 在 pipeline 里跑，同一页两遍结果完全一致；
  规则口径与误报处理见 `knowledge/market-readiness/my/README.md`、`SAMPLE_FINDINGS.md`。
- **不进 risks、不计分**：8 条检查单独成章，只在 `dimensions` 里追加一行「市场就绪度」，
  `note` 只写数量（已展示/未展示/需复核/不适用），不折算分数、不给 severity。
- **四种状态**：`present`（写到了）/`missing`（没写，`quote` 为空）/`needs_review`（不完整）/
  `not_applicable`（本页或本品类不涉及，必须写理由）。
- **边界**：只记录是否展示，不核验认证真伪、不判断税务与支付合规；顶层 `not_assessable` 会追加
  一条同样的能力边界说明。
- **版式**：网页与 PDF 都在「诊断维度」之后、风险清单之前单独成章；`scripts/verify-parity.ts`
  会把这一章的文本一起核对。

## 合规与风险判定（RAY-698）

合规与风险（Layer 4）v0.1 只接马来西亚，只消费 `knowledge/legal/my/rules.v0.1.json`
（45 条 / 9 部法规），由 `src/compliance/analyze.ts` 在 pipeline 里**代码侧**判定，不经模型：

- **三档判定**：`rule_level`（页面要素直接对应法条）/ `substantiation`（只写「需要证明」）/
  `human_review`（需人工判断）。层级只来自规则库，代码不升级也不降级。
- **可判定子集**：45 条里 17 条可由页面文本判定（见 `knowledge/compliance/my/README.md`）；
  其余 28 条写在 `COMPLIANCE_SKIP_REASONS` 里，逐条给原因，不硬凑覆盖率。
- **出处可追溯**：每条 finding 的 `law_name` / `article` / `last_verified` 来自规则库，
  `evidence` 写成 `规则 <id> · <法条> · 官方来源 <url> · 取证：<范围> · 命中：<模式>`，
  网页与 PDF 都原样渲染，所以每条都能回到规则 id + 条文 + 官方 URL。
- **误报处理**：取证范围优先商品主面板 + 详情区（Description / Specifications，止于推荐位），
  模式加词边界（`6.5L` 不命中 `5l`）、泛词（`certified` / `approved` / `japan`）要求同行上下文、
  `Save RM0.00`、`From RM49.92 / month`、测试条件里的 `100%` 都排除；记录见 `SAMPLE_FINDINGS.md`。
- **去重**：同一页同一规则只出一条；同一句 + 同一层级的多个规则合并成一张卡，其余条文写进
  `evidence`；跨层级不合并（否则会吞掉其中一档），各自成条并互相引用。
- **不在报告里下判决**：输出不含「合法 / 违法 / 保证通过 / 已认证」；缺席类检查（国语版本、
  隐私告知）只写「页面未展示」，且一律 `review_required: true`。
- **版式**：网页与 PDF 都在「市场就绪度」之后单独成章「合规与风险（马来西亚）」，
  章节开头固定「基于公开法规的自动筛查，不构成法律意见」；`risks` 里仍带全部合规条目，
  由前端 / 渲染器按 `dimension` 分章，不再重复出现在风险清单。

## 硬性约束

- **不出现分数**：没有 `score`、`rating`、百分比、星级、`x/10`，文案里也不写「N 分」。校验器会扫描并拒绝。
- **引用可核对**：`quote` 必须是页面正文的逐字子串；改写、翻译、省略号、跨行拼接都会触发重试，重试仍失败则整份报告失败。
- **失败不返回空报告**：抓取失败、模型失败、校验失败都会抛出带错误码的异常，不会有「空报告」落盘。
- **网页与 PDF 同源**：两者都只读这一份 JSON；`scripts/verify-parity.ts` 会逐字段核对。

## 版本

`meta.agent_version` + `meta.knowledge_version` 一起定位报告来源；字段变更时提升 `agent_version` 或新增 `schema_version`（当前未引入，v1 稳定后再加）。
