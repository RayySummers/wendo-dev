# 规则 → finding 样例：真实页面跑通记录（坦桑尼亚 v0.1）

> 目的：验证 `rules.v0.1.json` 能否落到真实页面上，并记录误报 / 漏报。
> 本文件只记录观察与证据，不构成法律意见，不给出定性结论。

## 样例页面

| 项目 | 内容 |
| --- | --- |
| URL | https://beipoa.co.tz/product/westpoint-5-3l-air-fryer-1500w-model-no-wafc-531522/ |
| 页面 | Bei Poa（坦桑尼亚电器零售商，达累斯萨拉姆）— Westpoint 5.3L 空气炸锅 WAFC-531522 |
| 取回时间 | 2026-11-17 07:36 UTC |
| HTTP | 200 |
| 原始 HTML | 1,454,307 bytes；SHA-256 `0d05d5f594fe0934d10465a55e9565ff0ee3df8bdf31ca954f65f743dc4409d6` |
| 可见文本 | 9,965 字符（去 `script`/`style`/标签后压空白） |
| 说明 | 该页为服务端渲染，静态 HTML 即可读到价格、卖点、FAQ 与页脚，未使用浏览器渲染。 |

商品主面板（原文摘录）：

> Westpoint 5.3L Air Fryer 1500W (Model No: WAFC-531522)
> PRICE:
> TZs 400,000
> Original price was: TZs 400,000.
> TZs 240,000
> Current price is: TZs 240,000.
> 5+ Reviews
> Experience healthy and crispy fried food with the Westpoint 5.3L Air Fryer 1500W, perfect for family meals.
> 1 Year Warranty
> All our electronics come with a 1-year warranty for peace of mind.

FAQ 区（原文摘录）：

> 🔵 Why buy from Bei Poa Tanzania?
> We offer 100% genuine Hisense products. We are the official distributors of Hisense and Samsung Products in Tanzania, with unbeatable prices and trusted after-sales support.
> Shop confidently knowing you're getting authentic quality and reliable service.
>
> 💡 Do your products come with Warranty?
> Yes. All electronics come with a 1-year official warranty.
> Note: Warranty does not apply to small appliances like kettles and irons.

规格区与页脚（原文摘录）：

> Power Consumption: 1500W
> Capacity: 5.3L
> Warranty Period: 1 Year (12 Months) from Date of Purchase.
> ...
> Privacy Policy

## 人工确认后的 findings

| # | 规则 | 观察 | 判定层级 | 置信度 | 报告写法（建议） |
| --- | --- | --- | --- | --- | --- |
| 1 | `TZ-ADV-07` s.16(k) | 页面顶部与 FAQ 两处称「All our electronics come with a 1-year warranty」，同一 FAQ 的注释又称「Warranty does not apply to small appliances like kettles and irons」；本商品即小家电。规格区另写「1 Year (12 Months) from Date of Purchase」。 | rule_level | high | 同一销售页对保修范围给出互相排斥的表述（全店电子产品 1 年 vs 小家电不适用），且未说明本商品属哪一类；FCA s.16(k) 禁止就保证/救济的存在、排除或效果作误导性陈述。建议在商品页明确本商品保修期限、起算方式与除外情形，并删除与商品无关的全店口径。 |
| 2 | `TZ-ADV-04` s.16(e)/(f) | FAQ 称「We are the official distributors of Hisense and Samsung Products in Tanzania」，但被审商品品牌为 Westpoint。 | human_review | medium | 页面把「海信/三星官方经销商」的表述与一件 Westpoint 商品并列，容易被读成该商品亦属官方渠道。需向商家索取品牌授权文件并核对授权品牌与型号范围；在取得授权前，报告只写「该表述需与授权范围核对」，不断言真伪。 |
| 3 | `TZ-ADV-05` s.16(g) | 划线价 TZs 400,000、现价 TZs 240,000（约 −40%），页面未给促销期间、未说明原价适用于该商品的时间段。 | substantiation | — | 折扣幅度需要可核对的原价与价格历史；建议索取促销前后售价记录与同款在其他渠道的同期价格。只能判「需要证明」，不能判真假。 |
| 4 | `TZ-ADV-02` s.16(a) | 「100% genuine」「authentic quality」「unbeatable prices」三处绝对化表述，未附来源、授权编号或比价依据。 | substantiation | — | 「100% 正品」「全网最低价」属可核查的事实主张；建议补充授权链（品牌授权书/进货发票/报关单）与比价口径，或改为可验证的表述。 |
| 5 | `TZ-STD-02` s.18(4) / `TZ-STD-01` s.20(6) | 页面与商品图未展示 TBS 标准标志、强制标准符合性声明或证书编号。 | —（不可判） | — | 页面未展示认证信息只能写「页面未展示，需向商家核实证书编号与适用标准」，**不得推断未认证**。 |

合计 4 条可用 findings（2 条 rule_level 观察 + 2 条需证明/需核实），1 条按规范只能写「需核实」。

## 误报（naive 关键词匹配，整页可见文本）

把 `claim_pattern` 直接对整页可见文本做小写子串计数，8 条规则共命中 **101 次**，人工复核后**只有 3 条**能进入报告（对应上表 1–4，其中 `TZ-ADV-02`/`TZ-ADV-05` 需结合上下文）。典型误报：

| 规则 | 命中次数 | 命中词 | 实际上下文 | 原因 |
| --- | --- | --- | --- | --- |
| `TZ-STD-02` | 36 | `tzs` | 全站价格「TZs 400,000」 | 货币代码与标准标志缩写同形，子串匹配必然误报 |
| `TZ-ADV-05` | 9 | `original price` | WooCommerce 价格组件的固定文案「Original price was:」 | 组件文案 ≠ 促销主张，需判断是否有真实原价 |
| `TZ-ADV-02` / `TZ-MM-01` | 各 12 | `genuine` / `authentic` / `original` | 「100% genuine Hisense products」「authentic quality」属全站模板文案 | 同一段模板文案被两条规则重复命中，且与商品本身无关 |
| `TZ-ADV-04` | 4 | `official` / `official distributor` | 经销商自我介绍 + 页脚「official warranty」 | 页面级自我介绍不等于「本商品获品牌方批准」 |
| `TZ-TEL-03` | 12 | `warranty` / `12 months` | 空气炸锅保修条款 | **品类不适用**：reg.26 只约束「电子通信设备」 |
| `TZ-PDP-01` | 3 | `privacy policy` | 页脚链接 | 有隐私政策链接 ≠ 已满足 s.23(2) 的三项告知 |

**结论**：`claim_pattern` 只能当线索。接入时必须①先做品类判定（`TZ-TEL-*` 仅 3C 通信设备），②抽取「商品主面板 + FAQ」并剥离全站导航/页脚模板，③对 `tzs`、`original`、`official`、`warranty` 这类高频词做词边界与上下文校验，④对 `claim_pattern` 为空的规则改用结构性检查。

## 漏报

| 规则 | 为什么漏 | 建议的结构性检查 |
| --- | --- | --- |
| `TZ-MM-02` s.16(b)、`TZ-ADV-06` s.16(i) | 关键词只有 `made in` / `designed in` / `assembled in`；本页**完全没有**制造国信息，因此关键词不命中，但「未标注制造国」本身正是观察点 | 反向检查：商品页/规格表/包装图是否出现制造国或原产地字段；无则记「页面未展示原产地，需核实」 |
| `TZ-ADV-08` s.17 | 结构性规则，`claim_pattern` 为空 | 检查是否存在分期/首付组件，且是否同时给出 TZS 现金总价 |
| `TZ-PRICE-02` s.23 | 交易事实不在页面上 | 需订单/收款数据；页面侧只能检查「预售/代购/缺货接单」类表述 |
| `TZ-PDP-01` s.23(2) | 商品页无收集表单，告知义务在结账环节触发 | 把检查点前移到加购/结账页与表单页 |

## 复现步骤

1. `curl -sSL -A "Mozilla/5.0" -o sample_beipoa.html "<URL>"`；`sha256sum` 应为上表值（页面内容会随商家更新变化，哈希仅对本次抓取有效）。
2. 去 `script`/`style` 与标签后压空白，得到可见文本（9,965 字符）。
3. 对 `rules.v0.1.json` 的 `claim_pattern` 做小写子串计数，得到 101 次命中。
4. 按「品类判定 → 主面板抽取 → 上下文校验」逐步收敛，得到上表 finding。
