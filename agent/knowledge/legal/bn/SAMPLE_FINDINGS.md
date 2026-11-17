# 规则 → finding 样例：文莱真实页面跑通记录

> 目的：验证 `rules.v0.1.json` 能否落到真实页面上，并记录误报/漏报。
> 本文件只记录观察与证据，不构成法律意见，不对商家作法律定性。
> 取回时间：2026-11-17 15:50（UTC+8）。两页均为静态 HTML 抓取，未使用浏览器渲染；JS 延迟加载的价格/库存可能存在偏差。

## 样例页面

| 项目 | 页面 A | 页面 B |
| --- | --- | --- |
| URL | https://audiomarc.com.bn/product/aifa-as-t19-22-2-0hp-split-type-aircon-w9wft | https://audiomarc.com.bn/product/aifa-pro-wd2x-6-stage-filter-table-top-water-purifier-with-sensor-touch |
| 页面 | Audiomarc（文莱电器零售商）— AIFA AS-T19-22 2.0HP 分体空调 | 同一站点 — AIFA PRO-WD2X 六级过滤台式净水器 |
| HTTP | 200 | 200 |
| 原始 HTML | 183,389 bytes；SHA-256 `96055a59390a5bdf763438f8557dda882c869290cd3716f40e5097d1b733a0bb` | 186,737 bytes；SHA-256 `b88b4ddd7b4fc8a3f50c1f21aca20ff39ff80850b6a46f8a55085c40d0ecd6b4` |
| 可见文本 | 约 4,966 字符 | 约 5,497 字符 |
| 说明 | 站点币种显示 `Brunei Dollar`，价格以 `$` 标示；配送条款提到 Temburong / Tutong / Seria / KB，确认为文莱本地零售 | 同左 |

页面 A 主面板（原文摘录）：

> AIFA AS-T19-22 2.0HP Split Type Aircon
> Brand: AIFA
> Warranty: 1 Year Labour & Parts, 6 Years Compressor
> Inhouse Product
> Price $447.00 $599.00 /pc -25%
> (9 Available)
> Add to Cart / Buy Now / Out of Stock（隐藏按钮）

页面 A 描述（原文摘录）：

> 2.0HP capacity for rapid cooling in larger spaces.
> Quiet operation with separate indoor and outdoor units.
> Utilises cutting-edge tech for optimal performance and energy efficiency.
> Powerful cooling with minimised energy consumption.

页面 B 主面板（原文摘录）：

> AIFA PRO-WD2X 6-Stage Filter Table Top Water Purifier with Sensor Touch
> Warranty: 1 Year
> Inhouse Product
> Price $399.00 /Pc
> (9 Available)

页面 B 描述（原文摘录）：

> It has advanced filtration for cleaner, healthier water.
> 6-Stage Filtration System for clean, great-tasting, and impurity-free water.
> Eco-friendly alternative to bottled water, promoting sustainability.
> RO Filter Cartridge – Ultra-fine filtration (0.001-0.0001 microns), removing nearly all contaminants.
> RO Membrane Process – Ensures only water molecules pass through, eliminating harmful substances.
> FREE installation**

**脚注（原文）：** `**Water Purifier deliveries to Temburong, Tutong, Seria and KB areas will incur an extra fee, not covered by the free delivery offer for purchases over $100.`

## 人工确认后的 findings

| # | 规则 | 观察 | 判定层级 | 置信度 | 报告写法（建议） |
| --- | --- | --- | --- | --- | --- |
| 1 | `BN-ADV-08` Sch. 2 para. 7 | 页面 A 同时显示 `$447.00`、`$599.00` 与 `-25%`；静态页未给出原价的持续时间或历史价格。 | substantiation | medium | 页面以 `$599.00` 为比较价标示 25% 折扣。文莱 CPFT 附表 2 第 7 项要求价格好处真实存在；需商家提供该型号在促销期前的实际售价记录，再判断比较价是否成立。 |
| 2 | `BN-EE-04` s.19(2) | 页面 A 声称 `optimal performance and energy efficiency`、`minimised energy consumption`，但未给出能效等级、测试报告或节电比例。 | substantiation | medium | 该页面对空调能效作出正向表述但未展示测试依据。EE Act s.19(2) 要求注册供应商不得就能效作误导性陈述；需索取认可实验室测试报告与能源标签。 |
| 3 | `BN-EE-03` s.19(1) | 页面 A 未见能源标签、星级或能效等级；产品图未展示标签。 | rule_level | low | 页面未展示该空调的能源标签/能效等级。法规要求标签加贴于产品实物；此处只能写「页面未展示，需向商家核实实物标签」，不得推断未注册或未贴标。 |
| 4 | `BN-EE-01` / `BN-EE-02` s.7、s.8(1) | 页面 A 为 2.0HP（约 5.3 kW）单相分体空调，落入 `Registrable Goods Order 2023` 的 7.1 kW 上限；页面未展示 registered supplier 或型号注册信息。 | rule_level | medium | 该型号属文莱强制能效注册范围（单相、非管道式、≤7.1 kW）。需向商家/AITI 核实供应商注册与型号注册状态；页面未展示不等于未注册。 |
| 5 | `BN-ADV-03` Sch. 2 para. 1 | 页面 A 的 `Quiet operation`、`optimal performance` 属性能表述，未给出噪音值或测试标准。 | substantiation | low | 性能类表述（静音、最佳性能）需有测试依据；如无 dB 数据或测试标准，建议改为可核实的具体参数。 |
| 6 | `BN-ADV-03` Sch. 2 para. 1 | 页面 B 声称 `removing nearly all contaminants`、`eliminating harmful substances`、`cleaner, healthier water`，未给出检测机构、去除率或标准。 | substantiation | high | 净水器对污染物的去除率与健康好处的表述，需提供第三方检测报告（去除率、测试标准、进水水质条件）。未提供前只能写「需 substantiation」，不得写「虚假宣传」。 |
| 7 | `BN-ADV-01` s.4(a) | 页面 B 的 `healthier water` 可能让消费者理解为健康益处；整体语境为广告。 | human_review | medium | 该表述可能构成健康/功效暗示，是否误导需结合整体页面与目标受众判断，**需专业审核**。 |
| 8 | `BN-ADV-03` Sch. 2 para. 1 | 页面 B 声称 `Eco-friendly alternative to bottled water, promoting sustainability`，未给出环保依据（材料、能耗、生命周期）。 | substantiation | medium | 环保/可持续表述需可核实的依据；文莱没有专门的绿色声明指引，仍落入 CPFT 的性能/好处条款，建议补充依据或弱化措辞。 |
| 9 | `BN-ADV-11` Sch. 2 para. 20 | 页面 B 的 `FREE installation**` 用双星号引导，但对应脚注讲的是「偏远地区配送加收费用」，未说明安装的免费条件。 | human_review | medium | `FREE installation` 的星号脚注与安装条件不对应，可能构成以小字隐藏重大事实；需核对安装范围、额外管线/拆除费用是否在同层级披露。 |
| 10 | `BN-PRC-01` Order para. 2(1) | 两页均在商品主面板显示价格（A：`$447.00 /pc`；B：`$399.00 /Pc`），站点页首标明 `Brunei Dollar`。 | rule_level | high | 价格已在商品主面板清楚展示，未发现「必须加入购物车才显示价格」的情况；本项通过。 |

合计：10 条 findings（3 条 `rule_level`、5 条 `substantiation`、2 条 `human_review`），其中 1 条为通过项（#10）。按风险排序：#6 > #1/#2/#4 > #9 > #7 > #3/#5/#8。

## 误报（naive 关键词匹配，全页文本）

把 `claim_pattern` 直接对整页可见文本做子串匹配，共命中 40+ 条；人工复核后**排除 4 类典型误报**：

| 规则 | 命中词 | 实际上下文 | 原因 |
| --- | --- | --- | --- |
| `BN-ADV-07` | `out of stock` | 页面 A/B 的 DOM 中有一个 `class="... out-of-stock ... d-none" disabled` 的隐藏按钮；页面实际显示 `(9 Available)` | **模板残留**：按钮被 `d-none` 隐藏且 disabled，不构成对消费者的可得性陈述。若不做可见性判断会误报「库存矛盾」 |
| `BN-ADV-14` | `free` | 页面 B `FREE installation**`、`free delivery offer` | 这是「服务包含在价格内」的说明，不是「赠品/免费项目」；且脚注已披露偏远地区配送费。`BN-ADV-14` 针对的是承诺赠品却不提供 |
| `BN-ADV-03` | `energy efficiency` | 页面 A 的泛化描述，无具体百分比或等级 | 泛化性能形容词的风险低；只有具体数值/比较级才需要重点 substantiation。本次仍保留为 low，不升级为 finding 结论 |
| `BN-ADV-04` | `inhouse product` | 两页均作为卖点标签 | 含义不明确（可能是「本店自有进口/本地保修」）；在没有商家解释前，不能认定为原产地/制造方法陈述，列为 open question 而非 finding |

## 漏报（本方法看不到的部分）

| 漏报点 | 原因 | 补法 |
| --- | --- | --- |
| PDPO 告知与同意（`BN-PRV-01`…`04`） | 商品页不含隐私政策；告知/同意发生在结账、注册、订阅环节 | 需跑结账流程与订阅弹窗；本次未做登录/下单测试 |
| AITI 型式批准（`BN-3C-01`/`03`） | 两页均为家电，不含 WiFi/蓝牙/蜂窝模块 | 需换 3C 品类（路由器、手机、蓝牙音箱）重跑 |
| 实物能源标签（`BN-EE-03`） | 静态页面看不到产品实物 | 需实物照片或包装标签 |
| 安装/配送附加费的完整披露 | 页面只给脚注，未展示结算页最终费用 | 需走到结算页核对总价 |
| 页面 B 的 `6-Stage`、`0.001-0.0001 microns` 技术参数 | 属规格陈述，是否真实需实验室数据 | 本次未判；如需可加 `BN-ADV-03` 的 substantiation 项 |

## 结论

- 规则库可以在真实文莱页面上跑通：**10 条 findings，0 条需要对商家作法律定性**，全部落在「规则级事实 + 需证明 + 需人工」三类。
- 关键词匹配的主要风险是**隐藏 DOM 元素**与**泛化形容词**；接入诊断时应对 `claim_pattern` 做可见性过滤（`display:none` / `d-none` / `disabled`）与词边界处理。
- 页面 A 的能效链路（注册 → 标签 → 能效声明）是文莱最值得做成结构化检查的一条：它同时覆盖 `rule_level`、`substantiation` 与「页面未展示、需核实」三种输出。
