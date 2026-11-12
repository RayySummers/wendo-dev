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
    "agent_version": "0.1.0"
  },
  "summary": "两到三句话：最关键的适配问题 + 一个可以直接执行的下一步。",
  "risks": [
    {
      "severity": "high",
      "quote": "页面正文里的逐字片段",
      "why": "为什么这在马来西亚市场是问题",
      "fix": "具体怎么改，给出可直接使用的文案或做法"
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
| `risks[].quote` | string | 必须是页面正文的逐字子串（≥ 8 字符），代码会核对 |
| `risks[].why` / `fix` | string | 简体中文，给出可执行改法 |
| `strengths` | array | 1–6 条，`quote` 同样逐字核对 |
| `not_assessable` | array | 1–8 条，说明「首页看不到什么、为什么」 |
| `dimensions` | array | 3–10 条，覆盖检索到的全部维度；`status` 为 `risk/ok/not_assessable` |

## 硬性约束

- **不出现分数**：没有 `score`、`rating`、百分比、星级、`x/10`，文案里也不写「N 分」。校验器会扫描并拒绝。
- **引用可核对**：`quote` 必须是页面正文的逐字子串；改写、翻译、省略号、跨行拼接都会触发重试，重试仍失败则整份报告失败。
- **失败不返回空报告**：抓取失败、模型失败、校验失败都会抛出带错误码的异常，不会有「空报告」落盘。
- **网页与 PDF 同源**：两者都只读这一份 JSON；`scripts/verify-parity.ts` 会逐字段核对。

## 版本

`meta.agent_version` + `meta.knowledge_version` 一起定位报告来源；字段变更时提升 `agent_version` 或新增 `schema_version`（当前未引入，v1 稳定后再加）。
