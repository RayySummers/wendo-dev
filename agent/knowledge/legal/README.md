# 合规规则库（Legal Rules Library）

> 支撑 RAY-684「合规与风险（Layer 4）」与 RAY-685「法条研究」。
> 目标：让报告里的每一条合规 finding 都能回到**官方原文 + 条文号 + 核验日期**，而不是模型记忆。

## 这不是什么

- 不是法律意见，不输出"合法/违法/保证通过"。
- 不是"全球广告法"模板；每个市场单独建库，不互相套用。
- 不是诊断规则本身。诊断规则（`agent/knowledge/my/index.json`）与本库解耦，接入需产品确认。

## 目录

```
agent/knowledge/legal/
├── index.json              # 机器可读索引：市场、状态、规则数、backlog
├── README.md               # 本文件：方法、字段、扩展流程
├── my/                     # 马来西亚（RAY-688 / RAY-689）
│   ├── rules.v0.1.json     # 45 条规则（JSON）
│   ├── README.md           # 人工阅读版：关键发现、覆盖矩阵、open questions
│   ├── SOURCES.md          # 官方来源清单 + SHA-256 + 交叉核对记录
│   └── SAMPLE_FINDINGS.md  # 真实页面「规则→finding」样例与误报/漏报记录
├── sg/                     # 新加坡（RAY-690）
│   ├── rules.v0.1.json     # 36 条规则（JSON）
│   ├── README.md
│   ├── SOURCES.md
│   └── SAMPLE_FINDINGS.md
└── us/                     # 美国（RAY-691）
    ├── rules.v0.1.json     # 35 条规则（JSON）
    ├── README.md
    ├── SOURCES.md
    └── SAMPLE_FINDINGS.md
```

## 当前状态

| Stage | 市场 | 子单 | 状态 | 版本 | 规则数 | 法规数 | 最后核验 | 说明 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 马来西亚 (MY) | RAY-688 / RAY-689 | v0.1（定稿候选，待产品验收） | v0.1c | 45 | 9 | 2026-11-14 | 通用广告 + 小家电 + 3C 数码 + 电商披露（2024 条例）；含通讯设备认证、Halal、PDPA、陶瓷食品接触 |
| 2 | 新加坡 (SG) | RAY-690 | v0.1（定稿候选，待产品验收） | v0.1b | 36 | 8 | 2026-11-14 | CPFTA / CPTDSRA / CPSR Safety Mark / 食品接触 / 计量 / GST 标价 / PDPA(DNC) / Spam Control |
| 3 | 美国 (US) | RAY-691 | v0.1（定稿候选，待产品验收） | v0.1 | 35 | 20 | 2026-11-14 | 联邦优先；FTC §5 + Endorsement/Green/Review Guides + FPLA + CPSA + FCC + FDCA §409 + Magnuson-Moss + CAN-SPAM；州级另列 backlog |
| 4 | 英国 (UK) | RAY-692 | backlog | — | — | — | — | CPRs / BPRs / CRA 2015 / 电气安全 / UK GDPR |
| 5 | 澳大利亚 (AU) | RAY-693 | backlog | — | — | — | — | ACL / EESS-RCM / Food Standards / Privacy Act |
| 6 | 菲律宾 (PH) | RAY-694 | backlog | — | — | — | — | RA 7394 / BPS ICC-PS / DPA 2012 |
| 7 | 加拿大 (CA) | RAY-695 | backlog | — | — | — | — | Competition Act / CCPSA / PIPEDA；Quebec 法语问题另标 |

> 2026-11-14 结构调整：RAY-685 收为**总纲/索引**；一个国家/地区一个子单，按 stage 1-7 串行验收，不合并。MY/SG 的 `my/`、`sg/` 文件作为对应子单的 baseline，由子单复核后定稿（MY 45 条、SG 36 条均已定稿）。
> RAY-688（MY v0.1 首单，3C 6 条）与 RAY-689（MY 定稿单）范围重叠：RAY-689 已在 RAY-688 的 40 条 baseline 上完成复核与定稿（45 条），两单验收口径按 RAY-689 执行，避免重复复核。

## 语言政策（2026-11-14 起）

- 只做官方语言为英语的市场；规则库的 `verbatim_excerpt` 一律使用**官方英文原文或官方英文译本**。
- 没有官方英文版本的条文，标 `official_english_unavailable`，不得用商业数据库或二手翻译冒充法条。
- 马来文/其他语言版本仅用于交叉核对，不作为引文来源；马来西亚 v0.1 的 45 条、新加坡 v0.1 的 36 条与美国 v0.1 的 35 条均为英文引文（MY 的 Halal 用 WTO TBT 通知所附官方英文文本；MY 的 ETT 2024 用 AGC 公报内的官方英文对照文本）。

## 规则字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | `<市场>-<主题>-<序号>`，如 `MY-ADV-01`；全库唯一 |
| `market` | 是 | `MY` / `SG` / `US` / `UK` / `AU` / `PH` / `CA` |
| `category` | 是 | `通用` / `通用/电商` / `小家电` / `3C 数码` / `食品` / `美妆` … |
| `law_name` | 是 | 原文名 + 中文/英文名 |
| `law_short` | 否 | 报告里用的简称 |
| `article` | 是 | 条/款/节，精确到子项 |
| `article_type` | 是 | `statute`（法律原文）/ `subsidiary_legislation`（条例/命令）/ `guideline`（监管指南） |
| `source_id` | 是 | 对应 `SOURCES.md` 的编号 |
| `official_url` | 是 | 官方/政府域名直链；非官方托管时必须在 `official_url_note` 说明 |
| `source_tier` | 否 | 见 `SOURCES.md` 的分级 |
| `language` | 是 | `en`（官方英文原文或译本）；仅非英文原文时标 `official_english_unavailable` 并在 `notes` 说明 |
| `effective_date` | 是 | 条文生效日（ISO）；修订另注 |
| `last_verified` | 是 | 本次核对官方原文的日期（ISO） |
| `rule_type` | 是 | 禁止 / 必须披露 / 需事前批准 / 需 substantiation / 罚则 |
| `decision_level` | 是 | `rule_level` / `substantiation` / `human_review`，见下 |
| `claim_pattern` | 是 | 触发词/句式（小写子串）；空数组表示结构性/非文本规则。匹配时建议做词边界处理（如 `iron` 不应命中 `environment`），部分条目是"适用性触发"而非"违规触发" |
| `requirement` | 是 | 一句话规则 |
| `evidence_needed` | 是 | 需要什么证明、找谁核实 |
| `penalty_or_note` | 是 | 罚则上限或重要限制；可留空字符串 |
| `verbatim_excerpt` | 是 | 官方原文短引（不超过约 120 词）；不改写 |
| `confidence` | 是 | `high` / `medium` / `low` |
| `review_required` | 是 | true = 必须人工/律师复核后才能进结论 |

### decision_level 的口径（与 RAY-684 产品决定一致）

- `rule_level`：有明确法条 + 页面原文证据时，可写"根据 <市场> <法规/条款>，这类表述属于禁止/需事前批准/需附条件"。
- `substantiation`：绝对化、功效、环保、安全、比较广告——只能判"需要 substantiation/证明"，不能判真假。
- `human_review`：整体印象是否误导、比较是否公平、免责声明是否充分——标"需人工/律师复核"。

## 来源纪律

1. 只收：法规原文、政府公报、监管机关指南/FAQ。
2. 二手解读（律所文章、商业数据库、NGO 页面）只能当线索，不能进规则库；若用于交叉核对，写进 `SOURCES.md` 的"辅助来源"。
3. 找不到官方原文就标 `not_found`，不凭记忆写法条；没有官方英文版本就标 `official_english_unavailable`。
4. 每条都要有 `last_verified`；法规更新时保留旧版本文件（`rules.v0.1.json` → `rules.v0.2.json`），不要原地覆盖。
5. 罚则写"上限"，不写"必然处罚"。

## 新增一个市场的流程

1. 先列该市场的**通用广告/消费者保护**法规，再列品类特殊规则；不要一次铺满。
2. 为每部法规找到官方 PDF/HTML，记录 URL、版本、页数、SHA-256。
3. 逐条摘录：条文号 + 短引 + 生效日 + 罚则；不确定的标 `confidence: medium` 并在 README 的 open questions 登记。
4. 写 `rules.v0.1.json`、`README.md`、`SOURCES.md`；在 `index.json` 的 `markets` 增加条目。
5. 跑 `python3 -c "import json; json.load(open(...))"` 与字段完整性检查；不要改诊断代码。

## 与报告接入的边界

- 报告新增独立「合规风险」章节，按 high/medium/low 排序；每条含：观察到什么、为什么可能有问题、需要什么证据/找谁核实。
- 不出现"合法/违法/保证通过"；high 级默认加"需专业审核"。
- 页面缺失认证信息只能写"页面未展示，需向商家核实"，不得推断"未认证"。
- 报告与 PDF 均保留"基于公开法规的自动筛查，不构成法律意见"声明（措辞由产品定稿）。

## 维护

- 高频变动项：Halal 附表二、PDPA 的 DPO/泄露通知、ST 管制设备清单、各市场罚则上限。
- 建议每季度重跑一次 `SOURCES.md` 的 SHA-256；法规更新时新建版本文件并更新 `index.json`。
- 本库由研究角色维护；接入诊断规则、改报告措辞由产品/工程决定。
