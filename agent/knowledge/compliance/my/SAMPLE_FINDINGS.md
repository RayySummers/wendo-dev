# 规则 → finding 真实页面记录（合规与风险 v0.1）

> 目的：证明 `knowledge/legal/my/rules.v0.1.json` 能在真实马来西亚页面上落到 finding，
> 并记录误报/漏报的处理方式。本文件只记录页面证据与规则来源，不构成法律意见，
> 也不输出「合法 / 违法」结论。

## 样例页面

| 项目 | 页面 A | 页面 B |
| --- | --- | --- |
| URL | https://khind.com.my/products/khind-3-5l-digital-air-fryer-arf35c | https://www.senheng.com.my/product/joyoung-360-3d-dual-heating-circulation-6-5l-air-fryer-jaf-65f09/ |
| 站点 | KHIND 官方商城（品牌自营） | Senheng（马来西亚电器零售商） |
| 商品 | KHIND 3.5L Air Fryer ARF35C | Joyoung 6.5L Air Fryer JAF-65F09 |
| 抓取时间 | 2026-11-14 23:47（UTC+8） | 2026-11-14 23:52（UTC+8） |
| HTTP | 200 | 200 |
| 可见文本 | 6,958 字符 | 13,616 字符 |
| 抓取方式 | `agent/scripts/scrape_page.py`（Scrapling，静态文本，未渲染 JS） | 同左 |
| 复跑 | `npx tsx scripts/run-compliance.ts --url <URL> --category small_appliances` | 同左 |

## 页面 A：KHIND ARF35C（5 条，三档都覆盖）

| # | 规则 | 判定 | 严重度 | 法条 | 页面原文 |
| --- | --- | --- | --- | --- | --- |
| 1 | `MY-ECOM-06` | rule_level | high | CP (ETT) Regs 2024 reg.4(1)-(2) | Enjoy FREE shipping within West Malaysia when you purchase KHIND appliances worth RM200 and above in a single order! |
| 2 | `MY-ADV-02`（并 `MY-FOOD-02`） | substantiation | medium | CPA 1999 s.10(1)(a) / Food Regs 1985 reg.28(4) | - Durable Ceramic Coated Inner Pan |
| 3 | `MY-ADV-04` | substantiation | medium | CPA 1999 s.10(1)(h) | As KHIND Online Store, our products are 100% brand new, original and according to SIRIM safety standards. |
| 4 | `MY-ADV-11` | human_review | medium | CPA 1999 s.21 | - Overheating Protection |
| 5 | `MY-ADV-01` | human_review | low | CPA 1999 s.9(a) | As KHIND Online Store, our products are 100% brand new, original and according to SIRIM safety standards. |

观察：

- **3 与 5 同一句、不同层级**：`100%` 是绝对化表述（需人工判断），`SIRIM` 是认证声明
  （需事实核实）。两条各自成条、`evidence` 互相引用，没有合并成一张卡——合并会吞掉其中一档。
- **2 是合并样例**：`ceramic` 同时命中 `MY-ADV-02`（材质声明）与 `MY-FOOD-02`（陶瓷器皿
  铅镉迁移），同句同层级合并成一张卡，`evidence` 保留两条法条。
- **1 是缺席类检查**：整页可见文本马来语标记 0 命中；`quote` 取的是页面上一条真实英文披露
  原文（免运费条款），不是编的句子。该条 `review_required: true`，措辞写明「页面未展示
  不等于商家没有其他语言版本」，并注明 reg.4 是否覆盖品牌自营独立站仍待核。
- **4 的严重度是 medium**：规则库把 `MY-ADV-11` 定为 `human_review`；安全承诺可能影响购买
  决策，代码侧把这一条固定为 medium（其余 human_review 为 low）。

## 页面 B：Senheng Joyoung JAF-65F09（2 条）

| # | 规则 | 判定 | 严重度 | 法条 | 页面原文 |
| --- | --- | --- | --- | --- | --- |
| 1 | `MY-ECOM-06` | rule_level | high | CP (ETT) Regs 2024 reg.4(1)-(2) | 360 3D Dual Heating Circulation 6.5L Air Fryer JAF-65F09 |
| 2 | `MY-ADV-06` | substantiation | medium | CPA 1999 s.12(1) | -33% |

观察：

- **`-33%` 是规则库漏掉的写法**：规则库的 `claim_pattern` 只有 `% off` / `discount` 等，
  没有「-33%」。代码侧补了一条正则（`extra`），引用仍是 `MY-ADV-06`，没有新增法条。
- 页面价格由 JS 延迟渲染，静态文本里看不到原价与价格历史；finding 只写「需要能出示原价与
  价格历史」，不判断折扣真假。
- 越权声明（`MY-APP-01` / `MY-ECOM-04`）没有出条目：页面确实没有 ST CoA / SIRIM 信息，
  但「页面没写」不等于「没认证」，v0.1 不据此出 finding；认证展示由市场就绪度 `MY-MR-08` 记录。

## 误报与处理

| 命中 | 页面上下文 | 处理 |
| --- | --- | --- |
| `Wireless Chargers` | 左侧分类导航 | 不在商品区、也不是句子行 → 丢弃 |
| `Premium Garment Steamer` | 推荐位商品 | 详情区止于 `Recommended Product` → 丢弃 |
| `Save RM0.00` | KHIND 价格区 | `excludeLine`：零折扣不是价格指示 |
| `From RM49.92 / month` | Senheng 分期月供 | `excludeLine`：分期不是诱饵价（`MY-ADV-07` 不命中） |
| `charged to 100%` | Xiaomi MY 耳机页的续航测试条件 | `excludeLine`：测试条件里的百分比不是宣传声明 |
| `approved by our customer service team` | KHIND 退货流程 | 首次运行时误报 `MY-ADV-13`；`excludeLine` 排除退货/退款/付款语境后消失 |
| `compensate a voucher at our discretion` | KHIND 破损赔偿 | `excludeLine`：赔偿语境里的 voucher 不是赠品要约 |
| `6.5L` | 商品标题容量 | 词边界（`(?<![\w.])`）→ 不会命中 `5l` |

## 漏报与已知边界

| 情况 | 说明 | 处理 |
| --- | --- | --- |
| `Certified Hi-Res Audio with LDAC`（Xiaomi MY 耳机页） | `certified` 是泛词，同一行没有认证机构或 `by` 结构 | 弱门控直接跳过；宁可漏一条，也不把品牌自称当认证结论 |
| `Free EXTRA 1 Year Warranty`（Senheng） | 赠品措辞，但不含 `free gift` / `gift` | v0.1 不判；规则库 `MY-ADV-08` 的 pattern 未覆盖这种写法 |
| 页面没有 SIRIM / CoA / MCMC 信息 | 认证状态要用证书编号去 ST / MCMC / SIRIM 数据库核对 | 按设计不判：由市场就绪度 `MY-MR-08` 记录「未展示」，合规侧进 `not_assessable` |
| 有 `Privacy Policy` 页脚链接 | Senheng 页脚有链接 | 视为已提供隐私告知，不判 `MY-PRIV-01`；链接背后的八项内容是否齐全需人工看 |
| 品牌自营站是否受 ETT 2024 reg.4 约束 | 规则库 `known_gaps` 已记录待核 | finding 里明写这条不确定性，`review_required: true` |

## 对规则库的回写建议

1. `MY-ADV-06` 建议在 `claim_pattern` 里补 `-N%` 这类折扣写法（代码侧已用正则兜住，规则库同步更清楚）。
2. `MY-ADV-08` 建议补 `free warranty` / `free gift with purchase` 这类「免费附赠」写法，
   否则赠品要约只能靠人工。
3. `MY-ECOM-06` 的适用范围（平台 listing 还是也覆盖品牌自营独立站）需要律师确认后写进规则库。
4. 电气/通讯设备的认证类条目（`MY-APP-01` / `MY-ECOM-04` / `MY-3C-0x`）建议单独设计
   「证书编号 → 官方数据库核对」的流程，页面文本判定只记录展示情况。
