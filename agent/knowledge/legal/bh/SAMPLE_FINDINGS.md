# 巴林规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实巴林商品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不做定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | Apple AirPods 5（stc Bahrain 官方网上商店商品页） |
| URL | https://shop.stc.com.bh/index.php?route=product/product&path=101&product_id=7583 |
| 市场 | 巴林（BHD 标价、巴林本地交付、stc Bahrain 自营） |
| 抓取时间 | 2026-11-17 |
| HTML SHA-256 | `95d81768abaf0d8da0b344f7ade9c41e41ded06b4cf55bb63cf05be8146fb95d` |
| 可见文本 SHA-256 | `9c4094c971c2a6a9ad13bfaf79a3b2e751027738b2b1f8a6ce3d47343cf448d5`（13,292 字符） |
| 抓取方式 | `curl -sSkL -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'`；去 `<script>/<style>/<noscript>/<svg>/<nav>/<footer>/<header>` 后按标签切行，空白归一化，丢弃空行；`claim_pattern` 在归一化小写文本上匹配（≤4 字符的模式加词边界，多词短语按子串） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 31 |
| 被 `claim_pattern` 触发的规则 | 4 |
| 触发次数 | 9 |
| 进入 finding 的条目 | 4（1 high-risk 待律师、2 medium、1 low） |
| 判为误报的触发簇 | 4（菜单/结账弹窗/规格标题/产品属性） |
| 不可观察、只能“需核实” | 3（G-Mark、TRA 核准号、广告许可号） |

> 结论：词表触发只能当“线索”。本样例 9 次触发里没有一次可以单独成结论；真正进入报告的是**结构性缺失**（保修期、阿拉伯语版本、经营者身份、电信核准信息），不是关键词。

## Findings（进入报告）

### F1 · 商品页未展示保修期

- 规则：`BH-CP-PRICE-01`（CP Law 第 5 条第一段，`rule_level`，`review_required=false`）
- 页面信号（原文）：
  > “In Stock.” / “Available now.” / “Device payment terms” / “PAY IN INSTALLMENTS” / “BD 3.100/mo” / “18 months” / “BD 0 Upfront”
  可见文本中 “warranty” 出现 **0 次**（页脚外链菜单里的 “extended warranty” 在去导航后不计入）。
- 判断：`rule_level`。第 5 条要求供应商“advertise the product’s price, promote it and indicate the warranty period”，页面给出分期价格与期数，但未给出保修期。属于“页面未展示”的缺失项，不是对商家的定性。
- 报告写法：
  > 商品页展示了分期价格（BD 3.100/月 × 18 期、BD 2.300/月 × 24 期）与库存状态，但未展示保修期。根据巴林《消费者保护法》（2012 年第 35 号）第 5 条（官方英译本，阿拉伯语文本作准），供应商在标价与促销时应载明保修期。请补充保修期（月数/覆盖范围）并在订单确认页与发票保持一致。
- 需要的证据：保修政策文本、发票/订单确认页样本、厂保与店保的区分。
- 严重度：medium。

### F2 · 商品页为纯英文，无阿拉伯语版本

- 规则：`BH-ADV-LANG-01`（1973 年第 14 号广告法令第 2 条，`rule_level`，`review_required=true`）
- 页面信号：整个可见文本中阿拉伯字符数 **0**（`[\u0600-\u06FF]` 计数为 0）；页面标题 “AirPods 5”、按钮 “Add to cart”、条款均为英文。
- 判断：`human_review`。第 2 条文义为“广告须使用阿拉伯语，可附加外语，并须书面载明许可证号”；该条制定于户外广告时代，**对电商商品页的适用性没有官方英文说明**，因此不能写成“违规”，只能提示缺口并交律师。
- 报告写法：
  > 页面为纯英文。巴林 1973 年第 14 号广告法令第 2 条要求广告使用阿拉伯语（可附加外语）并书面载明许可证号；该条对线上商品页的适用性尚无官方英文说明。建议提供阿拉伯语版本，并向主管机关核实是否需要广告许可。**需专业审核。**
- 需要的证据：阿拉伯语版本页面、广告许可（如适用）、主管机关书面答复。
- 严重度：high（高风险项，仅作提示）。

### F3 · 页面未展示 TRA 型号核准信息

- 规则：`BH-TEL-01`（TRA Type Approval FAQ，`rule_level`，`review_required=false`）
- 页面信号（原文）：
  > “Connectivity” / “Bluetooth 5.3 wireless technology” / “AirPods can be used as wireless Bluetooth headphones with Apple devices using earlier software and with non‑Apple devices, but functionality may be limited.”
- 判断：`rule_level`（适用性成立、缺失可核对）。蓝牙耳机属 RTTE，须在使用/销售/分销前向 TRA 注册；页面未展示核准/注册信息。按本库边界，只能写“页面未展示，需向商家核实”，**不得推断“未注册”**。
- 报告写法：
  > 该商品为蓝牙（RTTE）设备。根据 TRA 型号核准制度（官方英文页面），此类设备须在巴林使用、销售或分销前完成注册。页面未展示核准信息；请向商家索取 TRA 注册/核准记录，或在 TRA 已批准设备清单中核对型号。本条不构成对合规状态的判断。
- 需要的证据：TRA 型号核准证书/注册号、型号与固件版本、进口商主体。
- 严重度：medium。

### F4 · 商品页缺少可识别的经营者注册信息

- 规则：`BH-CP-ID-01`（CP Law 第 4 条，`rule_level`，`review_required=false`）
- 页面信号（原文）：
  > 页面标题 “AirPods 5 - stc Online Shop”；正文主体仅以 “stc” 标识（“stc Customer”、“Add to existing stc plan”）。可见文本中 “Commercial Registration”、“CR”、“registration” 出现 **0 次**。
  > 说明：页脚版权与条款在去 `<footer>` 后被剥离，本样例未把页脚计为可见经营者信息；如页脚另有 CR/地址，应以完整页面复核。
- 判断：`rule_level`，但需限定范围。第 4 条要求在与消费者的函件、文件与电子文据上展示可识别经营身份的信息；页面以品牌与版权声明呈现主体，但**未展示商业注册号/地址**。是否已在订单确认邮件或发票中满足，需进一步取证。
- 报告写法：
  > 商品页以 “stc” 品牌与版权声明标识经营者，但未展示商业注册号（CR）或营业地址。根据《消费者保护法》第 4 条，供应商须在与消费者的往来文件（含电子文件）上展示可识别其经营身份的信息。请核对订单确认页、电子发票与条款页是否已展示；如仅品牌名，建议补充 CR 与地址。
- 需要的证据：订单确认邮件、电子发票、条款页截图、SIJILAT 登记信息。
- 严重度：low。

## 误报（false positives）

| 触发簇 | 命中词 | 实际语境（原文） | 处置 |
| --- | --- | --- | --- |
| 结账/优惠弹窗文案 | `discount`、`offer`、`promotion`、`promo` | “The promo code you have entered does not apply on the discounted items you have selected.” / “You can only use one offer at a time.” | 误报：不是商品自身的促销声明；建议对隐藏弹窗与结账文案做排除 |
| 客服/配送说明 | `sales`、`SMS` | “The e-shop does not provide business sales at this stage.” / “provide you with tracking information via SMS.” | 误报：`BH-CP-PRICE-02`、`BH-PRIV-04` 被误触；`sms` 应只在“营销订阅/退订”语境计入 |
| 规格区标题 | `specification` | “Features & Specifications” / “Technical Specifications” | 误报：标题本身不是规格声明；`BH-CP-ADV-02` 不应据此触发 |
| 产品属性 | `wireless`、`smart`、`bluetooth` | “Bluetooth 5.3 wireless technology” / “This plan covers your smartphone…” | 非误报但**不是违规**：`BH-TEL-01` 的 `claim_pattern` 属“适用性触发”，命中只代表需要检查准入，不代表页面有问题 |

## 漏报与不可观察（false negatives / not observable）

1. **G-Mark / 低压电器准入**：样例为电池供电的蓝牙耳机，不属低压电器；本库也没有可引用的官方英文 G-Mark 规则（见 `SOURCES.md` BH11），因此不产生 finding。家电类目上线前必须先补此项。
2. **广告许可号**：第 2 条要求广告载明许可证号，但全站未见许可信息；因线上适用性未定，本样例不单列 finding，只在 F2 中提示。
3. **实际成交价**：静态 HTML 中 “Total device” 显示 “BD 0.000 / VAT INCLUSIVE”，是未选择分期方案时的占位值；若直接比对会误报“价格为 0”。实际价格需渲染后的结账页，属**不可从静态页判定**。
4. **PDPA 告知与同意**：商品页无收集表单，隐私告知只能从站点隐私政策与结账流程核对；本样例未展开，留待含表单的页面测试。
5. **发票与退换条款**：第 7 条第 3 款（不得载明不退不换）在页面层不可观察，需发票/小票样本。

## 调参建议（给工程）

- 排除区：`<nav>`、页脚、隐藏弹窗（`.modal`、`[hidden]`、`aria-hidden="true"`）、结账提示语；本样例 4 个误报簇全部来自这些区域。
- `BH-TEL-01` 的 `claim_pattern` 属“适用性触发”，报告中应显示为“需核对型号核准”，而不是“发现问题”。
- 对价格类规则，先判断是否渲染出非零总价；静态占位值（0.000）应跳过，避免“价格为 0”类误报。
- 阿拉伯语检查用字符集统计（`\u0600-\u06FF`）比词表可靠；样例为 0，可直接作为“无阿拉伯语版本”的证据。
