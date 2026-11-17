# 巴基斯坦规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实巴基斯坦商品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | Anex AG-4065 Deluxe Cordless Electric Kettle 1.7 Liter Capacity With Official Warranty |
| 渠道 | TeleX（Telemart）巴基斯坦站 |
| URL | https://www.telex.pk/products/anex-ag-4065-deluxe-cordless-electric-kettle-1-7-liter-capacity-with-official-warranty |
| 市场信号 | 英文页、PKR 标价（Rs.）、拉合尔发货、2–4 日达 |
| 品类 | 小家电（电水壶） |
| 抓取时间 | 2026-11-17 |
| HTML SHA-256 | `822296ca5c2abc270324a41065a8b5ba76d4c984ee6346f13184446932591dc2`（682,013 bytes） |
| 可见文本 SHA-256 | `9efaaac6fac3064c4dccea08f182555f65482105c00563c79923a6fd8439b4d8`（2,871 字符） |
| 抓取方式 | `curl -L -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'` 取 HTML；去 `<script>/<style>/<noscript>/<svg>/<nav>/<footer>/<header>` 后用 BeautifulSoup 提取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上匹配（≤4 字母的词加词边界，多词短语按子串） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 35 |
| 被 `claim_pattern` 触发的规则 | 11 |
| 触发次数 | 47 |
| 进入 finding 的条目 | 4（1 medium、2 low-medium、1 low） |
| 判为误报的触发簇 | 6 |
| 转为「需向商家核实」的结构性检查 | 3（PS 标志 / CM Licence / 能效标签不适用） |
| 明确不可观察 | 2（实物铭牌、包装标签） |

> 结论：词表触发只能当线索。47 次触发里只有 4 条值得进入报告，绝大多数是**关联推荐位**（页面底部「Related Products」里其他商品的文案）与**页面控件文字**（`Quantity`、`Model`、`Return`、`Sale`）。`decision_level` 与 `review_required` 是控制误报的主要工具；`claim_pattern` 为空的结构性规则必须看证书编号与实物，不能靠文本匹配。

## Findings（进入报告）

### F1 · 「30% OFF / Rs.10,000.00 → Rs.6,999.00」的参考价没有基准说明

- 规则：`PK-CON-05`（ICPA s.2(f)(viii)）、`PK-ADV-02`（Competition Act s.10(2)(b)）
- 页面信号（原文）：
  > "30% OFF … Regular price Save -30% Rs.6,999.00 Rs.10,000.00 Regular price Rs.6,999.00"
- 判断：`human_review`。页面同时展示现价、划线价与折扣率，但未说明 Rs.10,000.00 是否为本 SKU 在巴基斯坦渠道近期实际成交价、持续了多久、覆盖多少库存。仅凭页面无法判断，需价格历史。
- 报告写法：
  > 商品页显示「Rs.6,999.00 / 划线价 Rs.10,000.00 / 30% OFF」。根据旁遮普《Consumer Protection Act, 2005》s.22(2) 与《Islamabad Consumers Protection Act, 1995》s.2(f)(viii)，以特定价格招揽却无法在合理期间按该价格供货，或就商品通常售价误导公众，均可能构成不公平交易；《Competition Act, 2010》s.10(2)(b) 亦覆盖「缺乏合理依据」的价格信息。请提供该 SKU 过去 30/60 天的实际成交价与促销排期。**需人工复核。**
- 需要的证据：价格历史（含促销排期）、成交订单样本、划线价的后台字段定义。
- 严重度：medium（`review_required=true`）。

### F2 · 「9 Million+ Satisfied Customers」无法核验

- 规则：`PK-ADV-06`（Competition Act s.10(2)(b) 之 lacking a reasonable basis）
- 页面信号（原文）：
  > "★★★★★ 9 Million+ Satisfied Customers"
- 判断：`substantiation`。这是全站级的信任声称，与单个 SKU 无关，页面未给出统计口径（订单数？注册用户？含退货？）、时间范围或第三方审计。不能判真假，只能要求依据。
- 报告写法：
  > 页面写「9 Million+ Satisfied Customers」。根据《Competition Act, 2010》s.10(2)(b)，向消费者发布缺乏合理依据的信息可能构成欺骗性营销。请提供该数字的统计口径、时间范围与可核验来源；无法提供时建议改为可核验的具体表述（如「自 20XX 年起累计发货 X 台」）。**需专业审核。**
- 需要的证据：订单/用户统计口径说明、审计或平台后台截图。
- 严重度：low-medium（`review_required=true`）。

### F3 · 标题写「Official Warranty」，正文只写「2 years warranty」，未写承担主体

- 规则：`PK-SD-04`（SCPA s.21(j)）、`PK-CON-04`（ICPA s.2(f)(vi)）、`PK-CON-02`（ICPA s.2(f)(iii)，「official」暗示官方/授权）
- 页面信号（原文）：
  > "…Capacity With Official Warranty" / "220-240V 50/60 1850-2200W 2 years warranty"
- 判断：`human_review`。巴基斯坦市场「official warranty」通常指品牌方（此处 Anex）保修，但页面未写明保修主体、覆盖范围、索赔流程与除外条款，也未说明是本地保修还是需寄回。若实际由店铺自行承担，「official」可能构成误导。
- 报告写法：
  > 页面标题写「Official Warranty」，正文写「2 years warranty」，但未说明保修由品牌方还是零售商承担、覆盖哪些部件、如何索赔。根据信德《Consumer Protection Act, 2014》s.21(j) 与《Islamabad Consumers Protection Act, 1995》s.2(f)(vi)，就担保的存在、排除或效果作误导性表示属禁止情形；买家位于旁遮普时适用条文待补（见 README open questions 3）。请提供完整保修条款与授权证明。**需人工复核。**
- 需要的证据：品牌授权书、保修卡样本、售后条款页面。
- 严重度：low-medium（`review_required=true`）。

### F4 · 页面未展示 PS 标志 / CM Licence，也未展示进口商信息

- 规则：`PK-STD-03`（PSQCA Act s.14(1)）、`PK-STD-04`（s.14(2)）、`PK-STD-07`（强制清单）
- 页面信号：无。可见文本中不存在 `PS`、`PSQCA`、`CM` 等标志或编号，也没有进口商/制造商名称与地址。
- 判断：结构性检查，`confidence: medium`。PSQCA 公布的强制清单中列有电水壶性能测量标准 PS:253（「Methods for measuring the performance of electric kettles, jugs for household…」），但该条目是**测试方法标准**，是否因此要求 CM 许可需向 PSQCA 或进口商核实；页面缺失**不能**推断未认证。
- 报告写法：
  > 页面未展示 PS 标志、CM Licence 编号或进口商信息。PSQCA 依《PSQCA Act, 1996》s.14 公告的强制清单包含电水壶相关标准（PS:253），列入商品须取得认证标志后方可销售/进口。**页面未展示不等于未认证**——请向商家索取证书编号并在 PSQCA 有效许可清单核对。**需专业审核。**
- 需要的证据：CM Licence 编号与持证主体、证书覆盖型号、进口报关时的 PSQCA 检验记录。
- 严重度：low（结构性缺失）。

## 误报记录（false positives）

| # | 触发簇 | 命中规则 | 为什么是误报 | 处理 |
| --- | --- | --- | --- | --- |
| 1 | 关联推荐位的「High Quality Watch / New Collection / Sale」 | PK-CON-01、PK-CON-09、PK-SD-01 | 文本属于页面底部「Related Products」中的**其他商品**（手表、数据线、充电宝），不是本 SKU 的描述 | 建议匹配前裁剪 `Related Products` / `Recently Viewed` 区块；本版在 SAMPLE 中人工剔除 |
| 2 | 控件文字 `Quantity`、`Model`、`Return`、`Delivery` | PK-SD-01、PK-SD-04、PK-CON-12 | 「Quantity:」是购买数量选择器，「Return」是「Shipping and Return」标签页标题，「Delivery Time」是物流说明 | 词表对 ≤6 字母的通用词应要求上下文（如 `model` 后接型号串）；`return policy` 才是有效短语 |
| 3 | 规格表里的 `10000 mAh`、`PB-10` | PK-SOG-01 | 属关联推荐位的充电宝参数，不是电水壶参数 | 同 #1，需先做区块裁剪 |
| 4 | 「★★★★★」五星图形 | 无规则命中 | 没有评论条数、没有评论内容；不构成可判定的声称 | 记录为**漏报候选**（见下），暂不建规则 |
| 5 | `Auto shutoff with boil-dry protection` | PK-ADV-02 | 属产品功能描述，且是电水壶的标准安全设计；页面无需为每个功能附检测报告 | 保留在 `claim_pattern` 但降级：仅在**无任何规格/认证信息**的页面上升级为 finding |
| 6 | `2 years warranty` 重复出现 3 次（标题/描述/规格） | PK-CON-04 | 同一表述的重复命中，不是三个问题 | 匹配后按「规则 ID + 归一化短语」去重 |

## 漏报记录（false negatives）

| # | 页面信号 | 为什么漏 | 建议 |
| --- | --- | --- | --- |
| 1 | 页面无 PS 标志 / CM 编号 / 进口商名称 | 结构性，`claim_pattern` 为空，词表永远命中不了 | 已转为 F4 的固定结构性检查；建议在诊断里做成「认证信息是否可见」的布尔检查，而不是文案规则 |
| 2 | 「★★★★★」无评论条数 | 无对应规则；巴基斯坦没有类似美国 16 CFR 465 的评论规则 | 不建规则；如需，归入 PK-ADV-06 的 substantiation（「评分依据」） |
| 3 | 页面无乌尔都语内容 | 语言义务是负向结论（宪法 Art. 251 不构成商品页义务） | 不建规则；作为本地化建议，不进 Layer 4 |
| 4 | 未提供隐私政策链接 | 巴基斯坦无生效的综合性数据保护法 | 不建规则；不得写成合规缺陷 |
| 5 | 「Cordless」与「1.7 Liter」是否与实物一致 | 需实物/铭牌，页面不可判 | 归入 PK-SOG-01 的「需向商家核实」，不单独出 finding |

## 词表调参记录

- v0.1 初版（35 条，含 7 条旁遮普法）：12 条规则 / 52 次命中；加安全类词后 13 条 / 58 次。
- 验收修订版（移除 7 条旁遮普规则、加 4 条 ICPA 与 3 条信德规则，仍为 35 条）：11 条规则 / 47 次命中。减少的命中来自被移除的 `warranty`/`return`/`sale` 类旁遮普规则重复计数，finding 结论不变。
- 向 `PK-ADV-02` 增补 `boil-dry`、`auto shutoff`、`bpa free`、`food grade`、`double insulation`、`shockproof`；向 `PK-ADV-06` 增补 `trusted by`、`award winning`，新增命中全部落在误报簇 #5，说明**这类功能词对 finding 的边际价值低**，保留是为了在「无规格页」上兜底。
- 未采用的方案：给 `quality`、`new`、`model`、`sale` 这类高频通用词加白名单。原因：白名单会掩盖真实的翻新机/二手未标注问题（PK-CON-09），宁可依赖区块裁剪 + 人工复核。

## 复现

```bash
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
curl -sSLk -A "$UA" -o anex4065.html \
  "https://www.telex.pk/products/anex-ag-4065-deluxe-cordless-electric-kettle-1-7-liter-capacity-with-official-warranty"
sha256sum anex4065.html   # 应为 822296ca5c2abc270324a41065a8b5ba76d4c984ee6346f13184446932591dc2
```

> 注意：电商页面会随库存/促销变动，HTML hash 只在抓取当日有效；可见文本 hash 用于比对「同一版文案」。若 hash 不一致，应以当日快照重跑，而不是沿用本文件的 finding。
