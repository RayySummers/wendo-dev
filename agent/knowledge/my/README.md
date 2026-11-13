# 马来西亚 × 小家电知识库 v2（RAY-660）

本目录是 retrieve_kb（固定工具链第 2 步）的检索源。v2 的目标：把知识库从「能跑」提升到
「能支撑 11/15 演示的规则库」——每条规则可追溯、可核对，不改任何编排代码。

## 变更摘要

| 文件 | 变更 |
| --- | --- |
| `index.json` | 版本 `2026-11-12` → `2026-11-12-v2`；规则 29 → 40 条；每条规则新增 `applies_to`（适用品类）、`source`（来源 URL）、`accessed`（访问日期）、`confidence`（置信度）字段；信号去重 |
| `small-appliances.md` | 按 8 个覆盖面重写为 v2，压缩到 3,141 字符（retrieve_kb 摘录上限 4,000 字符，确保全文可见），并标注每段规则的置信度与来源 |
| `malaysia.md` | 未改动（团队国家知识库同步件，见文件头注释） |

## 规则与信号数量

- **规则**：40 条（v1 为 29 条，全部保留），分布：language 7 / payment 4 / logistics 4 /
  trust 7 / service 4 / pricing 3 / culture 6 / content 5。
- **信号**：唯一信号 202 个。v1 原始信号条目 166、去重后唯一 146 个——本次全部保留
  （逐条 diff 核对，无丢失）；仅两处更名/归位：
  - `shoopepay` → `shopeepay`（v1 的拼写笔误，页面真实写法是 ShopeePay）；
  - 16 个跨规则重复信号字符串（如 `rm`、`free shipping`、`contact us`）各保留在一个主规则里，
    另见下表「去重归位」。新增 56 个信号全部不与现有信号重复。
- **去重归位**（原重复信号保留处）：`delivery`→LOG-01、`contact us`→SVC-01、`03-`→SVC-01、
  `rm`→PAY-02、`free shipping`→LOG-01、`cart`→PAY-03、`bestsellers`/`featured`→TRUST-04、
  `about us`/`local team`→TRUST-03、`multifuntion`→LANG-02、`welcome to`/`more`/`shop now`→CONT-01、
  `information`→CONT-02、`buy now`/`order now`→PRICE-03。
- **无信号规则**：`MY-PRICE-02` 的触发信号与 LOG-01/PAY-02/PAY-03/TRUST-04 完全重叠，按
  「不重复」原则留空（该规则作为规则文本仍会进入诊断 prompt）。

## 新增规则（11 条）

| ID | 内容 | 置信度 |
| --- | --- | --- |
| MY-LANG-06 | 规格用公制单位与摄氏度，避免 oz/inch/lb/°F | 待核 |
| MY-LANG-07 | 避免 Hot Sale/High Quality 等堆叠营销词 | 佐证 |
| MY-TRUST-05 | 240V/50Hz + 插头标准（MS 589-1/BS 1363；2-pin 仅限 Class II） | 已核实 |
| MY-TRUST-06 | ST COA 管制品类清单核对（水壶/厨房机/烤面包机/电饭煲等 34 类） | 已核实 |
| MY-TRUST-07 | 保修条款具体化 + TTPM 消费者维权渠道 | 佐证 |
| MY-PAY-04 | BNPL/分期写清免息与月供，不只放图标 | 编辑判断 |
| MY-LOG-04 | 写明承运商（Pos Laju/J&T/Ninja Van）与运单查询 | 编辑判断 |
| MY-SVC-04 | 发货/客服承诺排除联邦与州属公共假日 | 佐证 |
| MY-CUL-05 | Ramadan 档期口径（sahur/iftar 场景，Raya 前为销售高峰） | 编辑判断 |
| MY-CUL-06 | 电商大促日历（9.9/10.10/11.11/12.12/Black Friday） | 编辑判断 |
| MY-CONT-05 | 客服语言矩阵：英文必通、马来语跟上 | 编辑判断 |

## 来源清单（均为 2026-11-12 访问）

**已核实**（本人在本次任务中直接访问核实）：

1. Suruhanjaya Tenaga FAQ——需要 COA 的设备类别（34 类，含水壶、厨房机、烤面包机/烤箱、
   电饭煲、风扇、熨斗、吸尘器、适配器）：
   https://www.st.gov.my/what-are-categories-and-types-equipment-require-certificate-approval-coa
2. Suruhanjaya Tenaga FAQ——允许使用的插头类型（MS 589-1/BS 1363-1；MS 1577；MS 1578/
   BS EN 50075，2-pin 仅限 Class II）：
   https://www.st.gov.my/what-types-plug-tops-are-permitted-use-malaysia

**佐证**（官方/权威来源，来自团队国家知识库 malaysia.md 的 2026-11-12 同步，或本次检索
到官方入口但未逐页深读）：

3. Halal Malaysia（JAKIM 官方门户）：https://www.halal.gov.my/
4. KPDN 2025-01-14 关于清真认证的报章文告：
   https://www.kpdnhep.gov.my/ms/media-kpdn/berita-kpdn/keratan-akhbar/keratan-akhbar-2025-januari?download=1806:keratan-akhbar-14-januari-2025
5. KPDN：Tribunal Tuntutan Pengguna Malaysia (TTPM)：
   https://www.kpdn.gov.my/ms/info-korporat/bahagian/ketua-setiausaha/tribunal-tuntutan-pengguna-malaysia-ttpm
6. MCMC Numbering and Electronic Addressing Plan（手机号 3+8）：
   https://www.mcmc.gov.my/skmmgovmy/media/General/pdf/NumberingAndElectronicAddrressingPlan_2.pdf
7. MyGovernment 官方门户假期日历（联邦假日；州属另列）：
   https://gaharu.malaysia.gov.my/en/calendar
8. DataReportal, Digital 2025: Malaysia：
   https://datareportal.com/reports/digital-2025-malaysia
9. U.S. ITA Trade.gov：Malaysia eCommerce：
   https://www.trade.gov/country-commercial-guides/malaysia-ecommerce
10. Wikipedia：Malaysian English（英式变体为教育标准）：
    https://en.wikipedia.org/wiki/Malaysian_English
11. 团队国家知识库 malaysia.md（wendo-knowledge-base 同步件）：
    https://github.com/RayySummers/wendo-knowledge-base/blob/main/references/regions/asiapacific/malaysia.md

**编辑判断 / 待核**（无可靠公开来源或二手来源不足，规则文本中已标注）：

12. Pos Malaysia 2026-03 燃油附加费报道（malaymail.com.my，作为东马加价背景，费率本身待核）：
    https://www.malaymail.com/news/malaysia/2026/03/19/sending-international-parcels-pos-malaysia-just-added-a-40pc-fuel-surcharge/213153

## 已知不确定项（待核，未编造）

1. 东马（沙巴/砂拉越）运费附加费的具体费率与起价——规则文案用 RMXX 占位。
2. 马来西亚计量公制化的具体法规条文（MY-LANG-06 按行业惯例执行）。
3. Atome / SPayLater 等BNPL 的免息期、适用金额与逾期条款——展示文案以各平台官方页面为准。
4. Raya 前 kitchen appliance 销售高峰的量化数据（MY-CUL-05 未写具体数字）。
5. SSM 注册信息公开检索入口的具体页面结构（MY-TRUST-03 未写具体 URL）。
6. TTPM 索赔上限的具体数值——规则只陈述渠道存在，未写金额。
7. 固话「03- + 8 位」的格式按本地通识与 MCMC 编号计划佐证；MCMC PDF 未逐页核对。

## 与 10 条已知样本的对应

| 样本 | 命中路径 |
| --- | --- |
| SIRIM 空口宣称 | TRUST-01（信号 `sirim`/`certified`） |
| 7 位电话 | SVC-01（信号 `03-`）+ SVC-02 |
| Free shipping 无东西马规则 | LOG-01（信号 `free shipping`） |
| Multifuntion 拼写 | LANG-02（信号 `multifuntion`） |
| Health Pot 直译 | LANG-05（信号 `health pot`） |
| Stew Cooker 直译 | LANG-05（信号 `stew cooker`） |
| Food Menu 直译 | LANG-05（信号 `food menu`） |
| 无 WhatsApp | SVC-01（缺席时规则文本仍进 prompt，由模型按页面举证） |
| 无支付方式 | PAY-01 / PAY-03（同上） |
| 无 SSM 信息 | TRUST-03（同上） |
| 只有英文首屏 | LANG-01/02 + CONT-01（同上） |

## 验证

- `node` 解析 `index.json`：40 条规则、202 个唯一信号、无重复、146 个 v1 信号全部保留。
- `npm test`（agent/）：retrieve_kb 仍返回 8 个维度、命中排序正常、报告校验用例通过。
- 未运行真实模型调用，不产生 token 费用。

## 边界确认

- 只改了 `agent/knowledge/my/` 下三个文件；未触碰 `src/`（Pi 编排、retrieve-kb、score-and-report）、
  前端与 `obsidian-vault-wendo/`。
- `retrieve-kb.ts` 以宽松方式消费 `index.json`（只读取既有字段），新增字段对运行时无影响；
  `knowledge_version` 会随 `index.json` 的 `version` 字段自动进入报告 meta。

---

## v3 增补：界面可翻译性规则（RAY-673 / RAY-674）

版本 `2026-11-12-v2` → `2026-11-13-v3`；规则 40 → 50 条。新增 10 条全部挂在 `content`
「信息层级与表达自然度」维度下，**不新增维度、不改既有 40 条规则的信号与权重**。

规则正文、判据、反例、中英对照例句见 `interface-survivability.md`（同目录）；`index.json`
里的条目是它的可检索版本，编号一致（`MY-UI-01`…`MY-UI-10`）。

| ID | 一句话 | severity_hint | 文本信号 |
| --- | --- | --- | --- |
| MY-UI-01 | 宽度不按字符数写（ch/ex/JS 限长） | high | 无（CSS 层取证） |
| MY-UI-02 | 截断只能是显式策略，优先换行 | high | 无（CSS 层取证） |
| MY-UI-03 | 用 lang 驱动断词，不用 break-all | high | 无（CSS 层取证） |
| MY-UI-04 | CJK 可读性下限 12px | medium | 无（CSS 层取证） |
| MY-UI-05 | 层级只用目标语言提供的通道 | medium | 无（需同屏统计） |
| MY-UI-06 | 密度买空间不买时间 | medium | 无（需基线） |
| MY-UI-07 | 不用「仅需」这类补丁词区分主次 | medium | `仅需`、`仅可`、`only saves`、`just saves`、`only save` |
| MY-UI-08 | 输入成本 / IME 硬限长 | medium | `字以内`、`max characters`、`maximum of`、`characters left`、`characters remaining`、`剩余字符` |
| MY-UI-09 | 声音层：功能直译、voice 重写 | low | `oops`、`you're all set`、`hang tight`、`nothing here yet`、`something went wrong` |
| MY-UI-10 | RTL 与拉丁假设遗留（不进 MVP） | low | 无（记录项） |

**为什么 7 条不给文本信号**：`retrieve_kb` 只对 `fetch_page` 抽出的**可见正文**做匹配
（`pipeline.ts` 传的是 `page.text`），而 MY-UI-01/02/03/04/05/06/10 的证据在 CSS 与 DOM 结构里，
可见文本根本看不到。给它们编造文案信号会造成两种坏结果：规则被无关页面误命中、检索排序被虚高的
命中数打乱。因此这些条目以「无信号规则」存在——按 `MY-PRICE-02` 的先例，规则文本仍会进入诊断
prompt，由模型按页面自行举证；结构性取证由 RAY-674 的 `scripts/interface_signals.py` +
`src/interface/` 承担（它直接解析 CSS 层叠，命中后由代码注入 `kind: interface_translation`
的风险条目，证据带 `MY-UI-*` 编号）。

**信号挑选标准：出现在可见文本里就接近举证。** 实测被排除的候选（全语料 70 个页面）：

| 候选 | 为什么排除 |
| --- | --- |
| `…` | 命中的全是加载态（`Sending your verification code…`，senheng.com.my）或正文省略（工商银行、阮一峰博客），没有一处是 CSS 截断 |
| `一键` | 多是产品功能：`一键看电视`（苏宁）、`一键抠图`（CSDN）、`一键刷新BIOS` |
| `立即购买` / `立即抢购` | 正常电商 CTA：`立即购买 Galaxy S26 Ultra`（三星中国），不是补丁词 |
| 单独的 `仅` | 正文里是「只」：`政府仅批准两项申请`（东方日报） |
| `read more` / `view all` | 正常的展开/查看全部入口（ZALORA、HERMO），不是截断证据 |
| `search` / `just` | 几乎每站都有，纯噪音 |

## v3 实测检索结果（2026-11-14）

`retrieve_kb` 直接跑 `index.json`，两条真实页面命中：

| 页面 | 结果 |
| --- | --- |
| `https://www.easyparcel.my/quote`（404 页，站点提供 EN/中文/Malay） | `MY-UI-09`［命中：`oops`］；content 维度 hits=4，排名 2/8 |
| `https://www.bears.com.my/` | 0 条 MY-UI 命中（英文首页，无界面文案证据），content hits=8，排名 3/8 |

bears 上 0 命中是**预期结果**：那是全英文页面，页面上没有补丁词、没有中文限长提示、没有
voice 层短句；它的截断问题在 CSS 里（`#tab-description li.tablinks a` 的
`max-width:200px + nowrap + ellipsis`），由 RAY-674 的 CSS 层负责报，不由文本信号负责。
不为了让 demo 好看而硬造信号，是本规则的底线。

## v3 验证

- `npm test`：15 个用例全绿，其中 4 个是本单新增的 MY-UI 回归用例（检索、命中、不误命中、
  prompt 注入）。
- `npx tsc --noEmit`：无报错。
- 排序无回归：bears / ZALORA / Lazada / HERMO 四个真实页面上，8 个维度的 hits 与排名与 v2
  **完全一致**（新增 10 条规则全部 0 命中，不影响既有排序）。
- 未运行真实模型调用，不产生 token 费用。

## v3 边界

- 只改 `knowledge/my/index.json`、`knowledge/my/README.md`、`knowledge/my/interface-survivability.md`
  与 `test/validation.test.ts`；未改 `src/tools/retrieve-kb.ts`、评分权重与前端。
- `retrieve-kb.ts` 仍以宽松方式消费 `index.json`，新增规则零代码改动即可被检索。
