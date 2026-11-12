# 马来西亚 · 小家电品类规则 v2

本文件是 `knowledge/my/malaysia.md`（国家知识库）的品类补充，供 retrieve_kb 在「马来西亚 × 小家电」
场景检索。结构化规则与逐条来源见 `index.json`（40 条，含来源 URL + 访问日期 2026-11-12）。

置信标注：`已核实`=官方来源（本人 2026-11-12 访问）；`佐证`=复用团队 2026-11-12 同步的国家知识库；
`编辑判断`=行业经验，不得表述为法规；`待核`=来源不足，仅作建议。

## 1. 电气与合规（MY-TRUST-01/05/06/07）

- **[已核实] COA 管制清单**：ST 官方 FAQ 列出需 COA 的消费电器 34 类，含水壶、厨房机、
  烤面包机/烤箱、电饭煲、冰箱、风扇、熨斗、吸尘器、适配器/充电器。清单内品类须先取证再宣传。
  来源：st.gov.my/what-are-categories-and-types-equipment-require-certificate-approval-coa
- **[已核实] 插头**：13A 插须符合 MS 589-1 / BS 1363-1（3-pin 方脚）；2-pin 仅限非金属机身
  （Class II）电器。页面规格应写「240V / 50Hz, 3-pin plug (BS 1363)」。
  来源：st.gov.my/what-types-plug-tops-are-permitted-use-malaysia
- **[已核实] SIRIM 空口宣称**：受管制电器写「SIRIM certified」必须能给出证书编号或标签图；
  未取证就宣称是高风险合规问题，先删宣称再补证。
- **[佐证] 保修**：写清期限、覆盖部件、索赔流程；消费者可走消费人仲裁庭 TTPM 维权
  （kpdn.gov.my 官方页面）。只写「1-year warranty」不足以支撑信任。

## 2. 清真与食品接触（MY-TRUST-02）

- **[佐证] 清真边界**：认证由 JAKIM/州宗教局颁发（halal.gov.my）；未认证不得使用清真标志，
  不得写「halal certified」，否则有被 KPDN 执法的先例。
- **[编辑判断] 表达边界**：食品接触小家电可写「food-contact parts are BPA-free / 可拆卸清洗」
  （需检测依据），不要用清真标志替代材质说明。
- **[编辑判断] 素材禁忌**：猪、酒精、犬类形象、左手递物演示都不要出现。

## 3. 语言与搜索（MY-LANG-01~07）

- **[佐证] 英/马双语**：马来语是国语与本地平台主要搜索语言；SKU 标题建议「马来语 + 英文」并列。
- **[编辑判断] 直译品类词**：Health Pot→glass kettle、Stew Cooker→slow cooker、
  Food Menu→Recipes/Resipi；直译词不进本地搜索、也说不清用途。
- **[佐证] 英式拼写**：colour/centre/organise/catalogue；日期 DD/MM/YYYY。
- **[待核] 公制单位**：规格用 L/ml、cm、W 与摄氏度，避免 oz/inch/lb/°F（马来西亚采用公制）。
- **[编辑判断] 常用马来语词**：rice cooker=Periuk Nasi、air fryer=Penggoreng Udara、
  blender=Pengisar、oven/toaster=Ketuhar/Pembakar Roti、multi cooker=Periuk Serbaguna。

## 4. 支付与结算（MY-PAY-01~04）

- **[佐证] 本地支付**：FPX 网银 + 电子钱包（Touch 'n Go、GrabPay、Boost、ShopeePay）是主流；
  分期有 Atome、SPayLater。只显示信用卡/PayPal 会显著降低转化。
  来源：trade.gov/country-commercial-guides/malaysia-ecommerce
- **[编辑判断] 分期文案**：写「or 3 payments of RMxx with Atome · 0% interest」，别只放图标。
- **[编辑判断] 货币**：RM1,299.00 格式（千分位 + 两位小数），避免 MYR1299 混用。

## 5. 物流（MY-LOG-01~04）

- **[编辑判断] 西马/东马**：西马 2–5 工作日；沙巴、砂拉越 7–14 工作日且按邮编加价。
  「Free shipping」必须写清门槛与适用区域，否则东马买家下单后才见加价。
- **[待核] 附加费**：本地快递收取燃油附加费（Pos Malaysia 2026-03 起国际件 +40%），
  东马具体费率以承运商报价为准。
- **[编辑判断] 承运商**：写明 Pos Laju / J&T / Ninja Van 等伙伴与运单查询入口。

## 6. 客服与信任（MY-SVC-01~04、MY-TRUST-03）

- **[佐证] WhatsApp**：国民客服渠道，提供 wa.me 一键联系 + 服务时间（MYT，UTC+8）。
  来源：datareportal.com/reports/digital-2025-malaysia
- **[佐证] 电话格式**：西马固话 03-XXXXXXXX（8 位）、手机 01X-XXX XXXX（MCMC 编号计划）；
  缺位号码（03-456 7554）会被视为假号码。
- **[编辑判断] 本地实体**：页脚补 SSM 注册名、本地地址、客服邮箱与退换货地址。
- **[佐证] 假假日历**：联邦与州属假日不同，发货承诺要排除公共假日
  （gaharu.malaysia.gov.my/en/calendar）。

## 7. 节庆与档期（MY-CUL-01~06）

- **[佐证] 三大节庆**：Hari Raya、CNY、Deepavali 覆盖多族群，不能只做单一族群。
- **[编辑判断] Ramadan 档期**：烹饪类小家电按 sahur 备餐与 iftar 开桌两个时段做场景；
  Raya 前是全年最大销售窗口之一。
- **[编辑判断] 大促节点**：9.9 / 10.10 / 11.11 / 12.12 与 Black Friday 排进促销日历。
- **[编辑判断] CTA 语气**：温和引导（Learn more / Chat with us）优于「Hurry! Limited time!」。

## 8. 已知不确定项（待核）

- 东马（沙巴/砂拉越）运费附加费的具体费率与起价。
- 马来西亚计量公制化的具体法规条文（单位规则按行业惯例执行）。
- BNPL 各平台的免息期与逾期条款（以 Atome / SPayLater 官方页面为准）。
- Raya 前 kitchen appliance 销售高峰的量化数据。
- SSM 注册信息公开检索入口的具体页面结构。

完整来源清单与置信度逐条对应关系见同目录 `README.md` 与 `index.json` 的 source 字段。
