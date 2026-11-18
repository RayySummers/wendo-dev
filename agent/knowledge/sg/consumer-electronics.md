# 新加坡 · 3C 数码品类规则 v0.1

本文件是 `knowledge/sg/singapore.md`（国家知识库）的 3C 品类补充，供 retrieve_kb 在
「新加坡 × 3C 数码」场景检索。结构化规则见 `index.consumer-electronics.json`
（40 条，来源 URL + 访问日期 2026-11-18）。文件控制在 4,000 字符内，确保摘录全文可见。

置信标注：`已核实`=直接访问官方来源；`佐证`=复用团队国家知识库或权威二手来源；
`编辑判断`=行业经验，不得表述为法规；`待核`=来源不足，仅作建议。

## 1. 规格与准入（SG-CE-SPEC-01~05）

- **[已核实] 无线设备注册**：手机、平板、笔记本、手表、耳机、Wi-Fi/蓝牙设备须先经 IMDA
  设备注册，注册号须能对应具体型号；不得在未注册设备上标「IMDA compliant」。来源：imda.gov.sg。
- **[已核实] 电源类**：充电器/适配器若在 CPSR 33 类清单内，须有 SAFETY Mark 与 8 位注册编号；
  写 230V / 50Hz 与 G 型三脚（BS 1363），宽压产品写 100–240V。
- **[编辑判断] 型号与地区版本**：3C 强型号驱动；规格区要给 Model（SG 版）、盒内清单、
  保修适用地区，不要只给一个产品名。
- **[编辑判断] 兼容性**：写清 OS 版本、充电协议（USB-C PD）、配件代际；
  不要写“compatible with all devices”。
- **[编辑判断] 电池与防护**：容量用 mAh/Wh、功率用 W、防护用 IP 代码；
  “all-day battery”“fast charge”不能代替数字。

## 2. 保修与售后（SG-CE-WAR-01~04）

- **[已核实] 保修条款**：写期限、覆盖部件、是否国际保修、索赔流程与维修网点；
  只写“1-year warranty”不算完成。CPFTA Part III 的救济不能被条款排除。
- **[编辑判断] 渠道**：区分官方保修、授权经销商与水货（parallel import）；给序列号查询入口。
- **[编辑判断] 延保/维修**：AppleCare 类服务要写覆盖年限、意外损坏次数、自付额与维修时效。
- **[已核实] 免责边界**：不写“no refund / no warranty”覆盖法定权利；可写
  “This warranty does not affect your statutory rights under the Consumer Protection (Fair Trading) Act”。

## 3. 支付、分期与 trade-in（SG-CE-PAY-01~04）

- **[佐证] 本地支付**：PayNow、GrabPay、ShopeePay、Visa/Mastercard、Apple/Google Pay、NETS；
  3C 高客单价下缺 PayNow 与钱包的流失比小家电更大。
- **[编辑判断] 价格含 GST**：GST 注册商家标价必须含 9% GST，并写明运费门槛。
- **[佐证] 0% 分期**：写最低消费、期数、参与银行与卡种；缺条件买家会默认自己不符合。
- **[编辑判断] Trade-in**：写合作方、估价与最终价差异、可抵扣范围、数据清除；
  最高估价不能写成保证价。

## 4. 配送与退换（SG-CE-LOG-01~04）

- **[佐证] 免运费**：写门槛与时效（本地 1–3 工作日）；高单价 3C 建议给签收与保价选项。
- **[佐证] 取件**：POPStation 智能柜 24/7 自取对上班族是刚需；给取件期限与逾期退回规则。
- **[已核实] 退换**：新加坡多数网上下单没有法定冷静期；写清窗口、未拆封/已激活条件、
  退货运费与退款渠道。已激活设备的退货条件要单独写。
- **[编辑判断] 订单查询**：页脚给 Order Status 与运单号；不要只写“we will contact you”。

## 5. 认证、隐私与本地信任（SG-CE-TRUST-01~04）

- **[已核实] 认证对号入座**：无线设备核对 IMDA 注册；电源类核对 CPSR/SAFETY Mark；
  不能用一句“safety certified”覆盖所有产品。
- **[已核实] PDPA**：收集账号、地址、设备信息时要有隐私说明（目的、保存期限、第三方、
  联系人与查询/更正渠道），并公开至少一名 DPO 的业务联系方式。不写“100% secure”。
- **[编辑判断] 本地主体**：页脚写 ACRA 注册名与 UEN、地址、邮箱、+65 电话；
  跨境卖家写本地授权经销商。
- **[佐证] 社会证明**：放可追溯评价（型号/日期）、平台评分或媒体测评；不编造评分。

## 6. 品牌语气与本地化边界（SG-CE-BRAND-01~04）

- **[编辑判断] 全球 master 可保留**：3C 全球品牌资产来自一致语气与产品名；
  本地化预算优先给价格、库存、配送、保修、支付。
- **[编辑判断] 不机翻**：产品名/系列名/功能名保留原文，只翻译描述性文字。
- **[佐证] 最高级宣称**：world's best / No.1 / most accurate 必须有测试机构、样本与日期；
  否则改成可核对参数（CPFTA 第二附表禁止无依据的性能与质量表示）。
- **[编辑判断] 节庆场景**：3C 用“送礼/升级/以旧换新”，不要硬套厨房或宗教叙事。

## 7. 3C 不应套用小家电规则（防误报）

- **食品接触 / BPA / halal / 厨房场景**：只适用于食品接触小家电；3C 页面没有这些证据时不得判断。
- **CPSR 厨房电器清单**：3C 只对充电器/适配器等电源类核对，不整体套用。
- **语言**：3C 全球品牌可保留英文主文案，但交易与售后信息仍应有英文清晰版本（新加坡英文为共同语）。
- **规模**：Apple 有全球门店与保修网络，这不是中小企业必须项；benchmark 只用于发现规则缺口。

## 8. 来源

- IMDA：Equipment Registration / Dealer and Equipment Registration Framework（imda.gov.sg）
- CPSO：CPSR 受管制商品与 SAFETY Mark（consumerproductsafety.gov.sg）
- IRAS：GST 含税标价（iras.gov.sg）
- PDPC：PDPA 数据保护义务（pdpc.gov.sg）；DNC 登记册（dnc.gov.sg）
- CPFTA 2003 / WMA 1975 / GST Regs（sso.agc.gov.sg）
- ABS：PayNow（abs.org.sg）；SingPost：取件点（singpost.com）
- 团队国家知识库 singapore.md（wendo-knowledge-base）

## 9. 已知不确定项（待核）

- 各型号是否属 CPSR 33 类、以及风险等级对应的 CoC / SDoC 路径，需逐型号向 CPSO 确认。
- IMDA 各类设备的注册类别（ESER / GER 等）与标签形式以 IMDA 当期公布为准。
- Atome / SPayLater 的 3C 分期门槛以平台当期条款为准。
- 新加坡 3C 退货率与激活后折价的公开统计未取得，相关表述不写具体数字。
