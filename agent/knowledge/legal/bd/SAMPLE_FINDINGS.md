# 规则 → finding 样例：真实页面跑通记录（BD v0.1）

> 目的：验证 `rules.v0.1.json` 能否落到真实孟加拉国电商页面上，并记录误报/漏报。
> 本文件只记录观察与证据，不构成法律意见，也不对合规状态作终局判断。

## 样例页面

| 项目 | 内容 |
| --- | --- |
| URL | https://www.startech.com.bd/xiaomi-electric-kettle-2-lite |
| 页面 | Star Tech（孟加拉国 3C/家电零售商）— Xiaomi Electric Kettle 2 Lite |
| 取回时间 | 2026-11-17T07:11:03Z（UTC） |
| HTTP | 200 |
| 原始 HTML | 422,625 bytes；SHA-256 `af54c492158638ff0072c207898c05d68235c8d62c898b0cc5257b6a8c77b0f7` |
| 可见文本 | 18,921 字符（去 script/style 后，含导航/页脚） |
| 说明 | 页面为静态 HTML；价格与库存可能随促销变化。本记录只对应上述时间点与哈希。 |

产品面板（原文摘录）：

> Xiaomi Electric Kettle 2 Lite
> Price
> 3,500৳ 4,200৳
> Regular Price
> 3,780৳
> Status
> In Stock
> Product Code
> 54099
> Brand
> XIAOMI
> Key Features
> MPN: MJDSH06-A
> Model: Electric Kettle 2 Lite
> Capacity: 1.5L
> Rated Power: 1500W
> 304 Stainless Steel Inner Layer, Double Insulation
> Protection: Dry-boil, Auto shut-off, Steam sensor

页脚（原文摘录）：

> Online Delivery
> Privacy Policy
> Terms and Conditions
> Refund and Return Policy
> © 2026 Star Tech Ltd | All rights reserved

## 人工确认后的 findings

| # | 规则 | 观察 | 判定层级 | 置信度 | 报告写法（建议） |
| --- | --- | --- | --- | --- | --- |
| 1 | `BD-APPL-01` + `BD-CERT-01`/`02` | 商品为 1.5L 家用电热水壶，属于 BSTI 315 项清单第 310 项（BDS 253:1990）；整页可见文本未出现 BSTI、CM、Standard Mark、许可证号或 b mark。 | rule_level | medium | 页面未展示该电热水壶的 BSTI CM 许可证号或标准标志；需向商家索取制造商/进口商的 CM 证书/许可证并核对型号。页面缺失不等于未认证，不得推断“未认证”。**需专业审核。** |
| 2 | `BD-ADV-01` | 页面写“lowest price”“best price”“original Xiaomi”；同时显示 3,500৳、划线 4,200৳、Regular Price 3,780৳，参考价不一致（4,200 ≠ 3,780）。 | human_review | medium | 页面使用绝对化价格表述，且划线价与 Regular Price 不一致，可能影响消费者对折扣的判断。按 CRPA 2009 s.44，若表述虚假或不实并使买家受骗，存在合规风险（上限 1 年/20 万塔卡）。是否构成“欺骗”需结合价格历史与上下文，**需专业审核**。 |
| 3 | `BD-SOG-01` | 页面声称“food-grade 304 stainless-steel”“1.5L”“1500W”，但无材质单、迁移测试报告或第三方检测报告。 | human_review | medium | 商品描述含材质/容量/功率声称，但页面未提供可核对依据。按 Sale of Goods Act 1930 s.15，商品应与描述相符；建议索取规格书与检测报告。本报告只判“需要证明”，不判真假。 |
| 4 | `BD-APPL-01` + `BD-CERT-02` | 页面以“dry-boil protection”“auto shut-off”“steam sensor”为主要安全卖点，但无 BDS 253:1990 检测报告、CM 证书或召回/事故记录。 | rule_level | medium | 该产品须符合 BDS 253:1990 并取得 BSTI CM 许可；页面以安全功能为卖点但未展示检测报告或证书。需向商家索取制造商/进口商的 BDS 253 检测报告与 CM 证书；不能仅凭页面声称判断安全性。**需专业审核。** |
| 5 | `BD-PRICE-01` | 产品页显示商品价格与 Regular Price，但未显示运费、手续费或预计送达时间；页脚只有“Online Delivery”链接。 | human_review | medium | 页面未在商品页展示运费/预计送达；需核实结算页与配送政策。按 CRPA 2009 s.38 的价目表展示义务，线上页面是否构成“shop or organization”的显著位置存在解释空间，**需专业审核**。 |

合计：5 条 findings（1 条认证展示、1 条广告/价格、1 条描述证据、1 条安全声称、1 条价格/交付披露）。

**未形成 finding 的规则**：`BD-EXP-01`（无保质期）、`BD-ADV-02`（无 replica/first copy 等假货词）、`BD-PRICE-04`/`05`（页面只有容量/功率，没有重量/尺寸承诺）、`BD-3C-01`~`03`（商品不是 3C 配件）、`BD-CERT-03`/`04`/`05`（无 s.24 通知或标志出现）、`BD-SOG-02`（只有泛化的“For Home User”导航词，不是特定用途承诺）。

## 误报（naive 关键词匹配，整页可见文本）

把 `claim_pattern` 直接对整页可见文本做子串匹配，共命中 25 条；人工复核后 5 条可转为 finding，其余多为导航/品牌/规则错配。典型误报：

| 规则 | 命中词 | 实际上下文 | 原因 |
| --- | --- | --- | --- |
| `BD-APPL-03` | `ceiling fan` | 左侧“Appliance > Fan > Ceiling Fan”分类导航 | 商品是电热水壶，不是风扇 |
| `BD-3C-01` | `battery` | 导航“Laptop Battery” | 商品不是电池 |
| `BD-3C-02` | `ups` | 导航“Monitor Power > UPS” | 商品不是 UPS |
| `BD-3C-03` | `adapter` / `power strip` | 导航“Laptop Charger / Adapter”“Power Strip” | 商品不是插头/转换器 |
| `BD-SOG-01` | `premium` | 导航“Premium Ultrabook” | 推荐位/分类词，不是被审商品 |
| `BD-SOG-02` | `for home use` | 导航“Antivirus For Home User” | 子串匹配，非商品用途承诺 |
| `BD-PRICE-04` | `liter` / `ml` | 商品描述“1.5 liter”“250mL” | 容量声称，不是重量；规则错配 |

**结论**：`claim_pattern` 只能当线索。接入时必须先抽取“商品主面板”，去掉导航、推荐位、页脚全站文案，并对短词做词边界与上下文校验；否则误报率不可接受。

## 漏报

| 情况 | 说明 | 建议 |
| --- | --- | --- |
| 价格不一致（4,200 vs 3,780） | `BD-ADV-01` 的 pattern 不含价格数字/划线价结构，无法自动命中 | 增加结构化价格抽取：`ins`/`del`/`Regular Price` 三字段比对；要求同页出现原价或“was”价 |
| BSTI CM 缺失 | `BD-APPL-01`/`BD-CERT-01` 是结构性义务，`claim_pattern` 为空数组 | 由页面结构检查器（是否出现 BSTI/CM/许可证号/b mark）处理，而不是关键词匹配 |
| 运费/预计送达缺失 | `BD-PRICE-01` 是结构性披露，页面只给“Online Delivery”链接 | 接配送/结算页检查器，或人工核对 |
| `food-grade` 连字符 | 原 pattern 只有 `food grade`，页面写 `food-grade`，曾漏报 | 已在 v0.1 最终版加入 `food-grade`；建议匹配器统一做连字符/空格归一化 |
| 安全声称 | `BD-SAFE-02` 命中 `safety`/`auto shut-off`，但没有测试报告，不能自动判定 | 保留为观察项，进入人工复核队列 |

## 对规则库的回写

本次已回写 `rules.v0.1.json` 的 `claim_pattern`：

- `BD-ADV-01`：移除过宽的 `best`、`instant`（曾命中“Instant Camera”导航）；保留 `best price`、`lowest price`。
- `BD-PRICE-04`：移除 `kg`、`gram`、`gm`（曾命中品牌名/“Program”）；保留 `net weight`、`gross weight`、`kilogram`、`litre`、`liter`、`ml`。
- `BD-PRICE-05`：移除 `cm`、`mm`（曾命中 CMX 等品牌）；保留 `centimetre`、`centimeter`、`millimetre`、`millimeter`、`inch`、`size`、`dimension`。
- `BD-SAFE-02`：移除单独的 `safe`（曾命中 SafeWay 品牌）；保留 `safety`、`certified safe`、`child safe` 等。
- `BD-SOG-01`：加入 `food-grade`、`stainless steel`，覆盖连字符与材质声称。

建议产品侧实现：`product_scope` 抽取 + 词边界/连字符归一化 + 结构化价格检查器 + 结构性披露检查器（BSTI 标志、运费、交付时间）+ 人工复核队列。页面缺失认证信息统一写“页面未展示，需向商家核实”。

## 复现

```bash
curl -sSLk --max-time 60 \
  -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36' \
  'https://www.startech.com.bd/xiaomi-electric-kettle-2-lite' \
  -o sample_kettle.html
sha256sum sample_kettle.html   # af54c492…8c77b0f7（页面动态，哈希随促销/库存变化）
```

> 页面内容会随促销变化；上表 SHA-256 只对应 2026-11-17T07:11:03Z 的抓取。复核 finding 时以当时的截图与页面为准。
