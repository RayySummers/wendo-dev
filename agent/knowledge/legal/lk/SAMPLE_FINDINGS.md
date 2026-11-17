# 规则 → finding 样例：真实页面跑通记录（斯里兰卡）

> 目的：验证 `rules.v0.1.json` 能否落到真实页面上，并记录误报/漏报。
> 本文件只记录观察与证据，不构成法律意见，不输出定性结论；缺失项一律写「页面未展示，需向商家核实」。

## 样例页面

| 项目 | 页面 A | 页面 B |
| --- | --- | --- |
| URL | https://www.daraz.lk/products/igl-af5151-5l-digital-air-fryer-1400w-new-model-i372712125.html | https://www.daraz.lk/products/air-fryer-silver-crest-digital-touch-multifunction-6l-capacity-black-2400-watts-non-stick-bucket-temperature-control-ideal-for-frying-grill-roast-bake-toast-vegetables-french-fries-more-i580053719.html |
| 页面 | Daraz.lk — IGL-AF5151 5L Digital Air Fryer（本地品牌 IGL） | Daraz.lk — Silver Crest 6L Digital Air Fryer（无品牌，标题含 2400W） |
| 取回时间 | 2026-11-17 15:40（UTC+8） | 2026-11-17 15:40（UTC+8） |
| HTTP | 200 | 200 |
| 原始 HTML | 235,445 bytes；SHA-256 `8f81b6bfc6e01930858eb29272d7397d2422ecacc95a0f91bdc157b392212bed` | 234,992 bytes；SHA-256 `2afd57072497b497d8b01fef2b7cd20c4a33c56c230498e8fc95fca0493cf2b2` |
| 抓取方式 | `curl` 静态 HTML；商品名/描述/价格在 `<script type="application/ld+json">` 的 `Product` 与 `AggregateOffer` 中，列表页价格另取自 `catalog/?ajax=true` | 同左 |
| 价格（列表接口） | Rs. 12,400；划线价 Rs. 25,000；"50% Off"；686 sold | Rs. 9,999；"50% Off" |
| 卖家 | IGL（品牌店） | Smart shoppers（列表接口 `sellerName`） |

### 页面 A 原文摘录（JSON-LD description）

> 5 Liter Capacity
> 1400W
> Digital Display
> Easy to Use
> Oil Free
> Upto 80% Less Fat
> Non-stick coated pot and rack
> 1 YEAR WARRANTY
> … enjoy your favorite fried foods with up to 50% less fat!
> … ✅ Oil-Free Cooking for a healthier lifestyle
> 📍 Limited stock – Get yours today!

页面自述机器可读字段：`brand: IGL`、`availability: InStock`、`seller.name: ""`（空）、`hasMerchantReturnPolicy.returnPolicyCategory: MerchantReturnNotPermitted`。

### 页面 B 原文摘录（JSON-LD description）

> Powerful 2400-watt heating for cooking family-sized meals with little or no oil.
> Large 6-liter non-stick basket fits up to 6 servings for quick cooking.
> Digital touchscreen for precise temperature control (80°C to 200°C) and timer (up to 30 minutes).
> Multi-function appliance: air fry, roast, bake, reheat, and more.
> Removable non-stick basket and crisper tray are dishwasher safe for easy cleaning.

页面自述机器可读字段：`brand: No Brand`、`seller.name: ""`（空）、退货政策同上（不可退货）。

---

## 规则 → finding 跑通结果

| # | 规则 | 页面 | 页面证据 | finding（报告可用措辞） | 判定级别 |
| --- | --- | --- | --- | --- | --- |
| 1 | LK-ADV-04（s.31(c) 性能声称） | A | "Upto 80% Less Fat"、"up to 50% less fat" 两处并存，幅度不一致 | 「页面宣称最高减少 80% 脂肪，同页另处写 50%，两者口径不一。根据斯里兰卡《消费者事务局法》s.31(c)，性能声称须有依据；请提供检测报告（方法、样本、实验室）并统一口径。」 | substantiation |
| 2 | LK-ADV-08（s.31(g) 保修声称） | A | "1 YEAR WARRANTY"，页面无保修条款、保修主体、除外条款 | 「页面承诺 1 年保修，但未说明保修主体（品牌/卖家/第三方）与范围。根据 s.31(g)，保修的存在与效力不得作虚假或误导性陈述；请补充保修条款全文。」 | rule_level |
| 3 | LK-ADV-07（s.31(f) 紧迫感/必要性） | A | "📍 Limited stock – Get yours today!" | 「页面使用限时/稀缺表述。根据 s.31(f)，就商品或服务的必要性作虚假或误导性陈述构成该法项下的 offence；限时库存是否真实需商家举证。」 | human_review |
| 4 | LK-ADV-06（s.31(e) 降价声称） | A | 列表价 Rs. 12,400、划线价 Rs. 25,000、"50% Off" | 「页面以划线价 Rs. 25,000 支撑 50% 折扣。根据 s.31(e)，降价的存在与幅度不得虚假或误导；请提供该划线价的实际销售记录与持续时间。」 | substantiation |
| 5 | LK-ADV-03（s.31(b) 商品为新品） | A | 标题 "New Model"，未说明是否全新未拆 | 「页面以 'New Model' 描述商品。若为展示机/开箱机，按 s.31(b) 不得表示商品是新的；页面未说明商品状态，需向商家核实。」 | rule_level（本条在本页**未触发**违规判断，只作核实项） |
| 6 | LK-LAB-01（s.10(1)(a) 标签指令） | A/B | 页面无商品标签/铭牌照片，无进口商名称与地址 | 「页面未展示商品标签与进口商信息。斯里兰卡消费者事务局可依 s.10(1)(a) 就标签、价格标示发出指令，交易者须遵守；**页面未展示不等于未标示**，需向商家索取实物标签照片。」 | human_review |
| 7 | LK-CERT-02（SLSI s.23 强制认证） | A/B | 页面无 SLS 标志、无许可编号、无标准编号 | 「页面未展示 SLS 认证标志或许可编号。若该品类已被部长命令纳入强制认证标志，依 SLSI 法 s.23 须持许可且符合标准方可销售；**页面未展示不等于未认证**，需向商家核实许可编号。」 | rule_level（条件未满足，只作核实项） |
| 8 | LK-TEL-01（电信法 s.21 许可） | B | 页面为家用空气炸锅，无无线/电信功能描述 | 未触发。空气炸锅不属 `telecommunication apparatus`；若同一店铺售卖蓝牙/Wi-Fi 设备，需按 SKU 另判。 | — |
| 9 | LK-MEAS-02（s.42 数量/规格声明） | B | 标题与描述均称 "2400 Watts"，6L 家用空气炸锅该功率明显高于同类（常见 1,500–1,800W），页面无规格书 | 「页面标称 2400W。根据计量法 s.42，就商品数量、计量、规格作虚假或不真实声明构成该法项下的 offence；请商家提供铭牌或规格书核对。**未核对前不判定为虚假**。」 | rule_level（只作核实项） |
| 10 | LK-PRIV-01（PDPA s.11 + Sch V 1(a) 控制者身份） | A/B | 结构化数据 `seller.name` 为空；页面可见文本只有平台页脚 "Privacy Policy"，无卖家主体名称/地址 | 「商品页未展示销售者主体名称与联系方式。根据 PDPA s.11 与附表五第 1(a) 项，控制者须在收集时告知身份与联系方式；平台隐私政策是否覆盖卖家，需核实。」 | rule_level |
| 11 | LK-PRIV-02/03（目的与正当性依据、撤回同意） | A/B | 平台隐私政策链接存在（页脚），未逐页核对其内容 | 未判定。需打开 Daraz.lk 隐私政策逐项核对；本样例只验证「链接可达」，不验证内容。 | 待补 |
| 12 | LK-PRICE-01（s.11 高于标价销售） | A | 列表价与详情页价格一致（Rs. 12,400） | 未触发。结算页价格未抓取，无法验证是否加价。 | — |

---

## 误报 / 漏报记录

### 误报风险（规则会命中但实际不构成问题）

1. **LK-ADV-01 的 `claim_pattern` 含 `authentic` / `original`**：这两词在斯里兰卡电商常指「正品」「原装」，属正常商品描述；单独命中不足以说明误导，必须结合上下文。建议报告层把 LK-ADV-01 固定为 `human_review`，不自动升级为高风险。
2. **LK-MEAS-01 的 `inch`**：小家电规格中 `inch` 常用于屏幕/烤盘尺寸，且通常同时给出 cm；按 s.12 的判断应是「是否以非公制单位作为唯一计量单位」，而非「是否出现 inch」。当前 `claim_pattern` 会误命中，需在接入层加「是否同时给出公制」的前置条件（v0.1 未实现）。
3. **LK-ADV-08 的 `warranty`**：页面写 "1 YEAR WARRANTY" 本身是合规的披露，不是违规；只有当保修范围/主体与随货条款不一致时才构成 s.31(g) 问题。样例 #2 的 finding 只能写「需补充条款」，不能写「保修声称有问题」。

### 漏报风险（页面有问题但规则没抓到）

1. **s.30 整体印象型误导**：页面 A 的 "Oil-Free Cooking for a healthier lifestyle" 属健康暗示，`claim_pattern` 里没有对应词；这类要靠 `human_review` 人工看，规则层抓不到。
2. **s.31(c) 的 "characteristics accessories"**：官方扫描件该处无逗号（见 LK-ADV-04 的 `notes`），若未来做条款级 NLP 匹配需注意断句。
3. **s.10 标签指令**：v0.1 没有 CAA 指令清单，`claim_pattern` 为空数组，**完全依赖人工检查**是否有指令覆盖该品类；这是本版最大的结构性漏报面。
4. **卖家主体缺失**：Daraz 商品页的结构化数据 `seller.name` 为空，但页面可见区域可能另有店铺名（本次抓取的静态 HTML 未渲染）。若接入层只看 JSON-LD，会漏掉「页面其实展示了卖家名」的情况；反之只看看见文本会漏掉结构化字段。两侧都要取。

### 样例未覆盖的部分

- 结算页（是否加价、运费/税费是否含在标价内）未抓取。
- 商品实物标签（Sinhala/Tamil/English 三语、进口商、SLS 标志）无法从页面获得。
- 平台隐私政策正文未逐条核对。
- 无蓝牙/Wi-Fi 设备样例，LK-TEL-01/02 未被真实页面验证。
