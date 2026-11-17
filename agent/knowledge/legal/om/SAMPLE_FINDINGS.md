# 阿曼规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实阿曼商品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | Porodo Lifestyle Dual Design Air Fryer & Grill, Black（XHAWI，阿曼本土电商平台） |
| URL | https://www.xhawi.com/products/620048-porodo-lifestyle-dual-design-air-fryer-grill-black |
| 市场信号 | 阿曼本土平台（“Proudly Omani”）、OMR 标价、马斯喀特/阿曼境内配送、UK 三脚插头 |
| 抓取时间 | 2026-11-17T07:16Z |
| HTML SHA-256 | `1c55400d3a715322ec6c8182e5c171eb2e4042ca8cb56cd701c2213c0835c4e1` |
| 可见文本 SHA-256 | `a172b129610a1cffac79a85fc7b8f80538cad7596534f9c8edeba16615a63b61` |
| 抓取方式 | `curl -L -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 …'`；去 `<script>/<style>/<noscript>/<svg>` 后提取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上匹配（≤4 字母单词加词边界，多词短语按子串） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 40 |
| 有 `claim_pattern` 的规则 | 18 |
| 被触发的规则 | 8 |
| pattern-rule 命中次数 | 17 |
| 进入 finding 的条目 | 2（1 medium、1 low） |
| 转为「需向商家核实」的结构性检查 | 3 |
| 明确不可观察 | 2（G-Mark 实物、阿语包装） |
| 判为误报的触发簇 | 5 |

> 结论：词表触发只能当“线索”。本样例 17 次命中里只有 1 个值得进入报告（“100% Original / Brand New”），其余多为页脚组件、导航菜单与规格描述。22 条结构性规则（`claim_pattern` 为空）完全无法靠文本匹配触发，必须用清单逐项核对。

## Findings（进入报告）

### F1 · “100% Original / Brand New” 的绝对化真伪声称

- 规则：`OM-ADV-08`（实施条例 Art. 19(2)，`rule_level`）、`OM-ADV-10`（实施条例 Art. 19(10)，`substantiation`）、`OM-ADV-01`（CPL Art. 20，`human_review`）
- 页面信号（原文）：
  > “100% Original”
  >
  > “Brand New”
  >
  > “100% Original Brand New Split your payment into: 12 easy installments-no fees.”
- 判断：`human_review`。阿曼实施条例 Art. 19(2) 禁止就商品的真实情况、性质、类型、原产地、成分、功效或构成作欺骗性陈述；Art. 19(8) 另禁止使用虚假或伪造的质量保证证书。“100% Original” 是可核查的真伪声称，但页面没有给出品牌授权、供货链路或防伪信息，无法判断其真实性，只能要求证明。
- 报告写法：
  > 商品页标注 “100% Original / Brand New”。根据阿曼《消费者保护法实施条例》（MD 77/2017）第 19(2) 条，供应商不得就商品的真实情况、原产地或构成误导消费者；“100%”属绝对化表述。请提供品牌授权书或采购链路发票、对应型号的防伪/序列号记录，以及若为平行进口的说明。**需专业审核。**
- 需要的证据：品牌授权书、采购发票与链路、型号/批次记录、防伪标识说明。
- 严重度：medium（`review_required=true`）。

### F2 · 分期付款的“0% Interest / 12 期免手续费”缺少完整分期披露

- 规则：本版**未建规则**（属 Layer 3 支付/分期；对应实施条例 Art. 13 的分期发票披露要求，仅供参考）
- 页面信号（原文）：
  > “From 3.560/Monthly with 0% Interest.”
  >
  > “Split your payment into: 12 easy installments-no fees.”
- 判断：`out_of_scope`。实施条例 Art. 13 要求分期发票载明分期总额、利率及计算方式、利率计算日、期数与每期金额、分期期间、逾期罚则、双方权利义务；页面只给每期金额与“0% 利息”，未给总额与条款。该条属支付/金融披露，本单（Layer 4）不建规则，转 Layer 3 处理。
- 报告写法（如接入 Layer 3）：
  > 页面宣传 “0% Interest / 12 easy installments”。根据实施条例 Art. 13，分期交易须在发票中披露分期总额、利率与计算方式、期数与每期金额、逾期罚则等。请提供分期服务商协议与发票模板，确认“0% 利息”是否已计入商品总价。
- 严重度：low（转 Layer 3）。

## 结构性检查（页面未展示，不等于未取得）

| 规则 | 页面观察到什么 | 报告写法 |
| --- | --- | --- |
| `OM-PRD-04`（G-Mark） | 页面未出现 G-Mark / Gulf Conformity Mark 标识或证书编号；仅列 “Power Plug: UK 3-Pin Plug” 与 “Rated Voltage: 220-240V” | 页面未展示 G-Mark。根据海湾低压电器技术法规 BD-142004-01，该类电器投放成员国市场前须完成合格评定并加贴 G-Mark。**页面未展示不等于未取得**，请向商家索取证书与 DoC。**需专业审核。** |
| `OM-PRD-05`（阿语说明书） | 页面只有英文描述与英文规格；无阿语说明书/安全信息链接 | 页面未提供阿语安全信息或使用说明。根据 GSO 法规制造商义务 11 与 CPL 第 5/19 条，阿语是硬性要求。请索取包装内说明书照片。 |
| `OM-ADV-03`（CR 号） | 页脚与商家卡片（“Sold by: FoneZone”）均未显示商业登记号 | 页面未显示商业登记号。根据 CPL 第 6 条，商业广告与发票须显示 CR 号。请提供商家 CR 号与发票模板。 |

## 误报记录

| 触发 | 命中规则 | 为什么是误报 | 处理 |
| --- | --- | --- | --- |
| “Guaranteed Safe Checkout” | `OM-ADV-01`（safe / guaranteed） | 这是支付安全徽章，不是商品安全或质量保证声称 | 在 finding 生成前排除页脚/支付组件文本 |
| “compacting the best functions” | `OM-ADV-10`（best） | 产品描述里的普通形容词，未与具体指标绑定 | `best` 只在标题/主图/价格区等“声称位”计权 |
| “Up to 60 Minuets Timer” | `OM-ADV-14`（up to） | 规格参数（定时上限），不是性能/效益比较 | `up to` 需与百分比、对比对象或“vs”同现才计 |
| 导航 “Deals / Offers / Discount” | `OM-ADV-04`、`OM-ADV-06` | 平台导航与分类名，不是本商品促销 | 只取商品主区域文本 |
| 页脚 “Subscribe To Our Deals” | `OM-PRV-07`（subscribe） | 订阅表单的存在本身不构成同意缺陷 | 需看到发送行为与同意记录才计 |

## 漏报记录

| 规则 | 为什么漏 | 补救 |
| --- | --- | --- |
| `OM-LBL-01`、`OM-LBL-02`、`OM-LBL-04`（阿语标签/双语警告） | `claim_pattern` 为空，页面也没有阿语文本可匹配 | 改为清单项：包装正反面照片、说明书照片、阿语字段清单 |
| `OM-PRD-05`、`OM-PRD-07`（阿语说明书、进口商信息） | 同上 | 清单项 + 向商家索取 |
| `OM-ADV-02`（广告事前批准） | 页面不会有“未批准”的文本信号 | 只能作为流程问询项，不能自动判定 |
| TRA 型号核准（未建规则） | 3C 数码的无线设备需 TRA 核准，本版无规则 | 3C 品类报告加固定问询项：“是否取得 TRA 型号核准与标签？” |

## 词表调参建议

1. `safe`、`guaranteed`、`best`、`premium` 在电商页噪声极高，建议只在 **标题、主图文案、价格区、A+ 卖点** 中计权，并排除页脚/支付/物流组件。
2. `up to` 单独出现多为规格参数；与 `%`、`vs`、`compared`、`saves` 同现时才触发 `OM-ADV-14`。
3. `original`、`genuine`、`authentic` 在本市场应保持高权重：阿曼实施条例 Art. 19(2)/(8) 对真伪与证书的表述很直接。
4. `discount`、`offer`、`deal` 只取商品主区域，避免导航污染。
5. 阿语页面需要单独词表（如 `أصلي` 原装、`ضمان` 保证、`تخفيض` 折扣）；本版未做阿语词表，列为 v0.2 事项。
