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
├── index.json              # 机器可读索引：26 个市场、梯队、状态、规则数、roadmap
├── README.md               # 本文件：方法、字段、扩展流程
├── my/                     # 马来西亚（RAY-688 / RAY-689）
│   ├── rules.v0.1.json     # 45 条规则（JSON）
│   ├── README.md           # 人工阅读版：关键发现、覆盖矩阵、open questions
│   ├── SOURCES.md          # 官方来源清单 + SHA-256 + 交叉核对记录
│   └── SAMPLE_FINDINGS.md  # 真实页面「规则→finding」样例与误报/漏报记录
├── sg/                     # 新加坡（RAY-720 / legacy RAY-690）
│   ├── rules.v0.1.json     # 36 条规则（JSON）
│   ├── README.md
│   ├── SOURCES.md
│   ├── SAMPLE_FINDINGS.md
│   └── MARKET_READINESS.md # 一页接入建议（RAY-720）
├── us/                     # 美国（RAY-691）
│   ├── rules.v0.1.json     # 35 条规则（JSON）
│   ├── README.md
│   ├── SOURCES.md
│   └── SAMPLE_FINDINGS.md
├── uk/                     # 英国（RAY-692）
│   ├── rules.v0.1.json     # 43 条规则（JSON）
│   ├── README.md
│   ├── SOURCES.md
│   └── SAMPLE_FINDINGS.md
├── au/                     # 澳大利亚（RAY-693）
│   ├── rules.v0.1.json     # 45 条规则（JSON）
│   ├── README.md
│   ├── SOURCES.md
│   └── SAMPLE_FINDINGS.md
└── <market>/               # 新市场落地后按 index.json 顺序新增
```

## 当前状态（2026-11-17，一带一路优先）

> 一国一单；MY live，BRI 21 国按 Tier 1/2/3，US/UK/AU/CA 保留但排最后。`index.json` 的 `markets` 是唯一权威顺序；每个市场落地后同步 `rules_count` / `laws_count` / `last_verified` / `known_gaps`。

| 市场 | 梯队 | 子单 | 状态 | 规则/法规 | 最后核验 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| 马来西亚（MY） | live | RAY-688 / RAY-689 | v0.1 | 45 / 9 | 2026-11-14 | 通用广告 + 小家电 + 3C + 电商披露（2024）+ Halal/PDPA/食品接触 |
| 新加坡（SG） | Tier 1（high） | RAY-720（legacy RAY-690） | v0.1 | 36 / 8 | 2026-11-14 | CPFTA / CPTDSRA / CPSR Safety Mark / 食品接触 / 计量 / GST / PDPA(DNC) / Spam |
| 菲律宾（PH） | Tier 1（high） | RAY-721（legacy RAY-694） | in_review | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 阿联酋（AE） | Tier 1（high） | RAY-722 | in_review | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 沙特阿拉伯（SA） | Tier 1（high） | RAY-723 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 巴基斯坦（PK） | Tier 1（high） | RAY-724 | in_progress | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 尼日利亚（NG） | Tier 1（high） | RAY-725 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 南非（ZA） | Tier 1（high） | RAY-726 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 肯尼亚（KE） | Tier 1（high） | RAY-727 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 斯里兰卡（LK） | Tier 2（medium） | RAY-728 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 孟加拉国（BD） | Tier 2（medium） | RAY-729 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 卡塔尔（QA） | Tier 2（medium） | RAY-730 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 科威特（KW） | Tier 2（medium） | RAY-731 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 阿曼（OM） | Tier 2（medium） | RAY-732 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 巴林（BH） | Tier 2（medium） | RAY-733 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 埃及（EG） | Tier 2（medium） | RAY-734 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 约旦（JO） | Tier 2（medium） | RAY-735 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 坦桑尼亚（TZ） | Tier 2（medium） | RAY-736 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 加纳（GH） | Tier 2（medium） | RAY-737 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 文莱（BN） | Tier 2（medium） | RAY-738 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 新西兰（NZ） | Tier 3（low） | RAY-739 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 马耳他（MT） | Tier 3（low） | RAY-740 | todo | — | — | 未开始；落地后同步 index 的 rules_count / last_verified / known_gaps |
| 美国（US） | 非一带一路（低） | RAY-691 | v0.1 | 35 / 20 | 2026-11-14 | 联邦 FTC §5 / Endorsement / Green / Review / FPLA / CPSA / FCC / FDCA / Magnuson-Moss |
| 英国（UK） | 非一带一路（低） | RAY-692 | v0.1 | 43 / 15 | 2026-11-14 | DMCCA 2024 / CRA 2015 / EESR / GPSR / UK GDPR / PECR / BPRs |
| 澳大利亚（AU） | 非一带一路（低） | RAY-693 | v0.1 | 45 / 16 | 2026-11-14 | ACL / EESS / ACMA / GEMS / 电池标准 / APP / Spam Act |
| 加拿大（CA） | 非一带一路（低） | RAY-695 | backlog | — | — | Competition Act / CCPSA / PIPEDA；Quebec 法语问题另标 |

> 2026-11-17 KE v0.1（RAY-727）：CPA 2012 s.12 的十八项列举覆盖很广，但 **s.12 本身没有罚金**，只能落到 s.92 一般罚则（≤100 万肯先令/3 年），且 s.12 是否属「offence」文本未明示——报告不要写具体罚款金额。真正的价格抓手在 **TDA s.4(3)(a)(ii)**：原价/划线价被推定为「此前 6 个月内连续 ≥28 天以该价销售」，**举证责任在卖家**。标签语言是 **英文或斯瓦希里语二选一**（WMA 1999 规则 r.7(2)(a)），不是必须双语，且义务对象是包装不是网页；**公制强制**（r.3(2)）与**肯尼亚进口商名称地址**（r.7(1)(iii)）是跨境卖家最常见的两个缺口。认证分两套：KEBS 标准标志许可（Standards Act s.10(6)）与进口符合性验证 PVoC/CoC（VoC Order 2005），3C 另需 **CA 型式核准与标签**（KICA 设备条例 2010 reg.12(2)，reg.24 刑责 ≤30 万肯先令/3 年）。肯尼亚法律网对自动化客户端返回 403/WAF，本库经 Wayback 对同一官方 URL 的原始快照取件并锁定 SHA-256（可复现）。

## 语言政策（2026-11-14 起）

- 只做官方语言为英语的市场；规则库的 `verbatim_excerpt` 一律使用**官方英文原文或官方英文译本**。
- **2026-11-17 例外（待产品确认）**：RAY-723 把沙特阿拉伯纳入范围，理由是「英语为商务通用语」+ 一带一路第一梯队。这与「只做英语市场」的字面口径冲突。SA 库的处理方式是：仍然**只收官方英文译本**，但对没有官方英译的部门法（消费者保护法、商业数据法、反商业欺诈法）**不建规则**，并把整块缺口写进 open questions。若产品决定不承认这个例外，SA 库应整目录下线，而不是降级使用二手翻译。
- 没有官方英文版本的条文，标 `official_english_unavailable`，不得用商业数据库或二手翻译冒充法条。
- 马来文/其他语言版本仅用于交叉核对，不作为引文来源；马来西亚 v0.1 的 45 条、新加坡 v0.1 的 42 条与美国 v0.1 的 35 条均为英文引文（MY 的 Halal 用 WTO TBT 通知所附官方英文文本；MY 的 ETT 2024 用 AGC 公报内的官方英文对照文本）。

## 规则字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | `<市场>-<主题>-<序号>`，如 `MY-ADV-01`；全库唯一 |
| `market` | 是 | `MY` / `SG` / `US` / `UK` / `AU` / `AE` / `PH` / `CA` |
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
