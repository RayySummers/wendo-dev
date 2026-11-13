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
    { "name": "语言与本地化表达", "status": "risk", "note": "一句话依据" }
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
| `risks` | array | 3–8 条，按严重程度排序；`severity` 为 `high/medium/low` |
| `risks[].quote` | string | 内容风险：必须是页面正文的逐字子串（≥ 8 字符），代码会核对；界面风险：命中的元素文本或 HTML 片段 |
| `risks[].why` / `fix` | string | 简体中文，给出可执行改法 |
| `risks[].kind` | string? | 缺省视为 `content`；`interface_translation` 表示由界面信号（HTML/CSS）产出，不经模型 |
| `risks[].evidence` | string? | 仅 `interface_translation`：规则 id + 关键 CSS 声明 + 选择器，网页与 PDF 都要原样渲染 |
| `strengths` | array | 1–6 条，`quote` 同样逐字核对 |
| `not_assessable` | array | 1–8 条，说明「首页看不到什么、为什么」 |
| `dimensions` | array | 3–10 条，覆盖检索到的全部维度；`status` 为 `risk/ok/not_assessable` |

## 界面可翻译性子检查（RAY-674）

界面可翻译性是「信息层级与表达自然度」（knowledge 里的 `content` 维度）下的**子检查**，
不新增维度、不改现有权重（与 RAY-672 / RAY-673 的约定一致）：

- `dimensions` 条数不变，`content` 那一行的 `note` 末尾追加一句
  `界面子检查：检查 N 个文本元素，X 档字号 / Y 档字重 / Z 种文字颜色。命中 …`；
- 有命中时该维度状态至少是 `risk`；没抓到 CSS 时写「界面子检查无法判断」，不当作合格；
- 明细写在 `risks` 里，条目由代码注入（`src/interface/report.ts`），规则编号用知识库的
  `MY-UI-*`（见 `knowledge/my/interface-survivability.md`，RAY-673）。

三个约束：

- **命中才写**：没有信号就不产出条目。
- **有证据**：`evidence` 形如 `MY-UI-02 · 定高裁切 · height:55px · line-height:19.2px ·
  估算 4 行 / 可容纳 2.9 行 · 容器宽约 310px · <选择器>`；宽度来自声明推算时标「（估算）」。
- **不覆盖模型条目**：合并后按严重程度排序，最多 8 条；超出时先舍弃严重程度最低的模型条目。

判定口径（与知识库对齐）：MY-UI-01 `ch`/`ex` 定宽、MY-UI-02 截断（定高 / 单行省略）、
MY-UI-03 断行（`break-all`、缺 `lang`、长词、行高 < 1.2）、MY-UI-05 层级通道。
翻译膨胀按 **1.4 探针**估算，只有连 40% 余量都没有的容器才会被报出来。

## 硬性约束

- **不出现分数**：没有 `score`、`rating`、百分比、星级、`x/10`，文案里也不写「N 分」。校验器会扫描并拒绝。
- **引用可核对**：`quote` 必须是页面正文的逐字子串；改写、翻译、省略号、跨行拼接都会触发重试，重试仍失败则整份报告失败。
- **失败不返回空报告**：抓取失败、模型失败、校验失败都会抛出带错误码的异常，不会有「空报告」落盘。
- **网页与 PDF 同源**：两者都只读这一份 JSON；`scripts/verify-parity.ts` 会逐字段核对。

## 版本

`meta.agent_version` + `meta.knowledge_version` 一起定位报告来源；字段变更时提升 `agent_version` 或新增 `schema_version`（当前未引入，v1 稳定后再加）。
