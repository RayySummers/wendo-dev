# 新加坡 · 小家电品类规则 v0.1

本文件是 `knowledge/sg/singapore.md`（国家知识库）的品类补充，供 retrieve_kb 在「新加坡 × 小家电」
场景检索。结构化规则与逐条来源见 `index.json`（36 条，含来源 URL + 访问日期 2026-11-18）。
文件控制在 4,000 字符内，确保 retrieve_kb 摘录时全文可见（同 MY 约定）。

置信标注：`已核实`=直接访问官方来源；`佐证`=复用团队国家知识库或权威二手来源；
`编辑判断`=行业经验，不得表述为法规；`待核`=来源不足，仅作建议。

## 1. 电气准入（SG-TRUST-01~03）

- **[已核实] SAFETY Mark**：受管制商品须在 CPSO 注册、贴 SAFETY Mark 才能供应或为供应而广告；
  标签带 8 位注册编号，买家可用型号或编号反查登记册。只写「safety certified」不可核。
- **[已核实] 33 类清单**：CPSR 附表一含电水壶/airpot（≤10L）、厨房机、电饭煲等 33 类；
  清单内先取证再宣传，清单外仍受 CGSR 一般安全要求约束。
- **[已核实] IMDA**：蓝牙耳机、Wi-Fi 音箱、带无线模块的家电须先做设备注册；不得在未注册设备上
  标「IMDA compliant」。来源：imda.gov.sg Equipment Registration。
- **[佐证] 230V / 50Hz · G 型（BS 1363 三方脚）**：写 110V 或配美规/欧规插头，买家判断「不能用」。

## 2. 价格与税（SG-PRICE-01~04）

- **[已核实] GST 含税标价**：GST 注册商家对公众标价必须含 GST（现 9%）；同时列含税与不含税价时，
  含税价显著度不得更低。把税留到结算页才出现，最高罚 S$5,000。来源：IRAS。
- **[已核实] 折扣要有依据**：划线「原价」须真实、近期、实际成交过；虚构原价属 CPFTA 第二附表禁止项。
- **[编辑判断] 货币统一**：S$1,299.00；不要 S$1299 / SGD 1299 / $1.3k 混用（本地 $ 易被读成美元）。
- **[编辑判断] 到手价前置**：商品卡给含税价 + 免运门槛，别让买家到结算页才算总价。

## 3. 支付与结算（SG-PAY-01~04）

- **[佐证] 本地支付**：PayNow、GrabPay、ShopeePay、Visa/Mastercard、Apple/Google Pay、NETS；
  只放信用卡与 PayPal 会明显流失（PayNow 覆盖绝大多数成年人口）。来源：abs.org.sg。
- **[佐证] 分期**：Atome / SPayLater 要写期数、最低消费、是否 0% 利息；只放图标回答不了「付多少」。
- **[编辑判断] 安全表述**：写 3-D Secure / PCI DSS 服务商；不写「100% secure」。
- **[佐证] 分拆定价**：结算页按「小计 / 运费 / 折扣 / 应付总额（含 GST）」分项；CCCS 价格透明指引。

## 4. 配送与退换（SG-LOG-01~05）

- **[佐证] 时效**：本地 1–3 工作日；写截单时间与承运商（SingPost / Ninja Van / J&T / Qxpress）。
- **[佐证] 取件**：SingPost POPStation 智能柜与 POPStop 网点覆盖全岛，上班族常用自取；
  只给送货上门会漏需求并增加二次派送。来源：singpost.com 取件点。
- **[编辑判断] 免运门槛**：写「Free delivery over S$80」，不写无条件 free shipping。
- **[已核实] 退换 ≠ 法定冷静期**：新加坡多数网上下单**没有**法定冷静期，退货是商家自愿政策；
  写清窗口、商品状态、退货运费归属与退款渠道。CPFTA Part III 救济只针对不符合合同的商品。
- **[已核实] 缺陷救济**：交付时不符合合同的，可要求 repair / replace / 减价 / refund，并给本地寄修入口。

## 5. 客服与联络（SG-SVC-01~04）

- **[佐证] 渠道**：WhatsApp Business 是首选，但纯 WhatsApp 不够；至少并列电邮或表单，写服务时间 SGT。
- **[已核实] 电话**：统一 8 位编号计划，手机 8/9 开头、固话 6 开头；+65 1234 567 会被当模板占位符。
  来源：IMDA National Numbering Plan。
- **[编辑判断] 响应**：写「1 business day，周末与公共假日不计」。
- **[已核实] 营销同意**：PDPA 要求事前告知目的并取得同意；同意不得作为下单条件，不得预勾选；
  短信营销须先查 DNC 登记册，并提供发送者身份与退订渠道。来源：pdpc.gov.sg / dnc.gov.sg。

## 6. 语言（SG-LANG-01~05）

- **[佐证] 英式拼写**：colour / centre / organise / catalogue / travelled；日期 18/11/2026。
- **[编辑判断] Singlish 边界**：lah / shiok / kiasu 仅限社媒语气，不进规格、保修与结算。
- **[编辑判断] 直译品类词**：Health Pot → glass kettle / multi-cooker，Stew Cooker → slow cooker，
  Food Menu → Recipes；直译词不进本地搜索也说清不用途。
- **[已核实] 公制**：WMA 1975 s.18(1)(d) 禁止只用非公制单位；英制只能作公制之后的附加标注。
- **[编辑判断] 英文为主**：面向大众市场英文是共同语；中文页要有英文对照。

## 7. 文化与节庆（SG-CUL-01~04）

- **[佐证] 多元族裔**：华族约 74%、马来族约 13%、印度族约 9%；素材只呈现单一族裔会排除其余客群。
- **[编辑判断] 节庆**：CNY、Hari Raya、Deepavali、圣诞都要排；不要把某一族群当默认客群。
- **[佐证] 饮食边界**：面向穆斯林客群的食品接触场景避开猪肉与酒精；未经 MUIS 认证不得用 halal 标志。
- **[编辑判断] 数字与色彩**：华族忌 4、喜 8/9，白色关联丧事；按客群分层使用，不当成全市场统一规则。

## 8. 信息层级（SG-CONT-01~05）

- **[佐证] 首屏三问**：卖什么、为什么选你、下一步做什么；「Welcome to our store」占首屏是转化损失。
- **[佐证] 中式英语**：Welcome to call / Please kindly revert → Get in touch / Contact us。
- **[编辑判断] 品类导航**：Air Fryer、Rice Cooker、Air Purifier、Vacuum，不用 Healthy Living。
- **[编辑判断] 规格表格**：容量/功率/电压/尺寸/噪音可横向比；长段落堆参数会推高阅读成本。
- **[佐证] CTA**：Shop now / Compare models / Chat with us；避免 Hurry! Last chance!。

## 9. 已知不确定项（待核）

- CPSR 各 SKU 风险等级（低/中/高）与 CoC / SDoC 路径需逐型号向 CPSO 或 CAB 确认。
- CGSR 信息手册品类—标准映射未逐项取得，清单外品类只能写到「需符合性证明」。
- 带无线模块的家电属 IMDA 哪一注册类别，需按型号查 IMDA 设备数据库。
- Atome / SPayLater 的最低消费、期数与逾期条款以各平台当期页面为准。
- 新加坡小家电退货率的公开统计未取得，相关表述不写具体数字。
