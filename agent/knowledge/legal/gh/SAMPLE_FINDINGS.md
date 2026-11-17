# 加纳规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实加纳商品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 页面 A | 页面 B |
| --- | --- | --- |
| 页面 | Green Lion Rhytm X50 Wireless ANC Headphones（CompuGhana 加纳站） | Sencor SWK 0950WH Electric Kettle（CompuGhana 加纳站） |
| URL | https://compughana.com/products/green-lion-rhytm-x50-wireless-anc-wireless-headphones-brown | https://compughana.com/products/sencor-swk-0950wh-electric-kettle |
| 市场信号 | GHS 标价（GH₵539.00）、英文页、加纳电话 +233 030 275 2020 | GHS 标价（GH₵909.00）、英文页、同一店铺 |
| 抓取时间 | 2026-11-17 | 2026-11-17 |
| HTML SHA-256 | `878bd0298ea86cc6dc9433b91a5f1d1e71f94e62e9a721e291ef9ee7cdaef9f5` | `984e43bbf3975e50ca560dc1cbd9c0d6df2ecdefa4eab599b3064791db6bec22` |
| 可见文本 SHA-256 | `9d8762d7840e8e73c537e5df722f19385def1fd88a31b4d0d7abb94b93e3a4f7` | `6e8ce93c6bef3dc1472e588505ed9e5c77e2a0af147132ea9ab0ac6ae204c454` |
| 抓取方式 | `curl -L -A 'Mozilla/5.0'` 取 HTML；去 `<script>/<style>/<noscript>/<svg>/<nav>/<footer>/<header>` 后用正则提取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上匹配（≤4 字母加词边界，多词短语按子串） | 同左 |

> 说明：两个页面均为同一家加纳本土零售商（Shopify 建站），商品页结构一致，便于比较「3C 无线设备」与「无无线功能的小家电」在准入规则上的差别。

## 结果概览

| 指标 | 页面 A（耳机） | 页面 B（电水壶） |
| --- | --- | --- |
| 规则总数 | 33 | 33 |
| 被 `claim_pattern` 触发的规则 | 3 | 2 |
| 触发次数 | 7 | 3 |
| 进入 finding 的条目 | 4 | 3 |
| 判为误报的触发簇 | 1 | 1 |
| 转为「需向商家核实」的结构性检查 | 3 | 3 |
| 明确不可观察 | 3 | 3 |

> 结论：加纳商品页普遍**文本信息量少**（无公司主体信息、无认证信息、无标签信息），因此 `claim_pattern` 的触发数远低于澳大利亚样例（63 次）。真正的风险集中在**结构性缺失**，不是词表命中；`claim_pattern` 只能当线索，`decision_level` 与 `review_required` 是控制误报的主要工具。

## Findings（进入报告）

### F1 · 无线耳机页面未展示 NCA 型式批准信息

- 规则：`GH-CERT-03`（ECA 775 s.66(3) + NCA TA 12.3）、`GH-CERT-04`（NCA TA 19.3(a)）
- 页面信号：商品页与规格区均无「NCA Approved」标记、无 TAC 编号、无授权代表信息。
- 判断：`rule_level`（但只能写「页面未展示」）。蓝牙耳机属电子通信设备（terminal equipment / short-range radio），投放加纳市场前须取得型式批准并加贴 NCA 标记；线上商品页一般不会展示实物标签，因此**页面缺失不等于未认证**。
- 报告写法：
  > 商品页未展示 NCA 型式批准编号或「NCA Approved」标记。根据 ECA 775 s.66 与 NCA 型式批准指南（2015）12.3/19.3(a)，蓝牙类电子通信设备须经 NCA 认证并在设备上加贴标记后才能投放市场。请提供该型号的型式批准证书（TAC）编号及包装/实物上的 NCA 标记照片；若尚未取得，请说明计划。**需专业审核。**
- 需要的证据：TAC 证书、NCA 登记册查询结果、包装六面照片、授权代表委任书。
- 严重度：high（`review_required=true` 的上游规则；本条本身仍为「待核实」）。

### F2 · 「ANC 降噪 30dB」等性能数值缺少测试依据

- 规则：`GH-LAB-10`（L.I. 1541 r.3(f) 电气特性）
- 页面信号（原文）：
  > “Noise cancellation technology is enabled in ANC mode to reduce the ambient noise by 30dB”
  > “Noise Reduction: 30±3 dB”；“Sensitivity: 119±/-2 dB”；“Bluetooth: V6.0”；“Playtime: 30-50H”
- 判断：`substantiation`。这些是需要实测数据的电气/性能特性；页面给出精确数值与公差，但未说明测试标准、测试机构或测试条件。
- 报告写法：
  > 商品页标注 “reduce the ambient noise by 30dB”“Noise Reduction: 30±3 dB”“Bluetooth V6.0” 等数值。根据 L.I. 1541 r.3(f)，标签须载明适用的电气技术特性。请提供第三方测试报告（测试标准、样本、条件、机构）与厂内规格书；数值与实测不一致时需更正页面。**需专业审核。**
- 需要的证据：ANC 降噪测试报告、蓝牙 SIG 认证/QDID、灵敏度测试报告、电池续航测试条件。

### F3 · 商品页缺供应商主体信息（名称/地址/注册号）

- 规则：`GH-ETA-01`（ETA 2008 s.47(1)(a)-(c),(f)）
- 页面信号：页脚只有品牌叙述与电话 “+233 030 275 2020”；无注册公司名、无实际地址、无注册号、无电邮。
- 判断：`rule_level`。s.47(1) 要求供应商在提供商品的平台上披露法定全名与法律地位、实际地址与电话、网站与电邮、法人注册号/负责人/注册地。
- 报告写法：
  > 商品页仅显示联系电话，未见供应商法定名称、实际地址、注册号与电邮。根据 ETA 2008 s.47(1)(a)-(c)、(f)，这些信息须在提供商品的电子平台上向消费者披露。请补充主体信息区块（并与退货地址一致）。**需专业审核。**
- 需要的证据：公司注册证书、实际经营地址、退货地址、客服电邮。

### F4 · 页脚收集电邮做营销，但未见告知目的与同意机制

- 规则：`GH-PRV-01`（DPA s.23）、`GH-PRV-02`（DPA s.27(2)）、`GH-PRV-05`（DPA s.40(1)）、`GH-ETA-06`/`GH-ETA-07`（ETA s.47(1)(o)、s.47(2)）
- 页面信号：页脚有 “Get Special Offers and Savings … Email” 输入框；商品页无隐私政策链接（页脚链接为 About Us / Branches / Terms and Conditions / Contact / Delivery / Returns / Payment Methods）。
- 判断：`rule_level`。店铺确实存在隐私政策（`/policies/privacy-policy`，最后更新 2026-10-30，Shopify 模板），但从商品页与页脚均不可达；订阅框旁无「收集目的 / 书面同意 / 退订」说明。
- 报告写法：
  > 页面在页脚收集电邮用于 “Special Offers”，但未见收集目的告知、同意勾选或退订说明，页脚也没有隐私政策入口（政策页本身存在但未链接）。根据 DPA 2012 s.23、s.27(2)、s.40(1) 与 ETA 2008 s.47(1)(o)，请补充收集前告知、明示同意与退订路径，并在页脚链接隐私政策。**需专业审核。**
- 需要的证据：订阅表单提交记录、同意文案与时间戳、隐私政策 URL、退订流程。

### F5 · 电水壶页面只有功率/容量，无标签与合规信息

- 规则：`GH-LAB-01`（L.I. 1541 r.3）、`GH-LAB-10`（r.3(f)）、`GH-CERT-01`（GSA Act s.33(2)）
- 页面信号（原文）：“Input Power: 2200 W”；“1.7 Litre capacity”；“Triple Safety System / Safety auto shut-off / Boil dry protection”。
- 判断：`substantiation` + 结构性核实。功率/容量属 r.3(f) 电气特性；L.I. 1541 要求的原产国、进口商名称地址、批号等只能在实物标签上核查；该品类是否落入 GSA 强制性标准需查清单（本版未取得）。
- 报告写法：
  > 商品页标注 “Input Power: 2200 W”“1.7 Litre capacity”。根据 L.I. 1541 r.3（附表一第 11 项「通用家用电器及配件」），标签须载明电气特性、原产国、进口商/分销商名称与地址、批号等。请提供实物包装六面照片与进口文件；若适用 GSA 强制性标准，还需提供符合性证明。**需专业审核。**
- 需要的证据：包装标签照片、进口报关单、GS 检测报告（如适用）。

## 误报（false positive）记录

| # | 触发 | 为什么是误报 | 处理 |
| --- | --- | --- | --- |
| FP1 | `GH-ETA-02` 命中 “professional”“advanced”（页面 A） | 原文为 “good for recreation or professional use”“advanced features”，属一般形容，规格区已给出可核参数；不构成「描述不足」 | 降级为不进入报告；`human_review` 规则不得凭单词定性 |
| FP2 | `GH-PRV-05` 命中 “Special Offers”（两页） | 只是页脚促销语，未见实际发送营销讯息；DPA s.40(1) 约束的是「为直接营销提供/使用信息」，不是文案本身 | 保留为「需核实订阅机制」，不作为违规 |
| FP3 | 价格区块出现 “Sale price GH₵539.00” 与 “Regular price GH₵539.00” | Shopify 模板固定输出，二者相同，无划线价/折扣声称；不构成比较价格问题 | 不进入报告；记录为模板噪声 |

## 漏报（false negative）记录

| # | 页面信号 | 为什么漏 | 处理 |
| --- | --- | --- | --- |
| FN1 | “Input Power: 2200 W” | 初版词表只有 `watt`，匹配不到 “2200 W” | v0.1 调参加入 `input power`、`litre`；不加入单字母 `w`（噪声过大）。若需覆盖 “2200W”，建议在匹配器里加 `\d+\s?w\b` 正则，而非词表 |
| FN2 | “4-Mic Calls”“Transparency Mode”“Game Mode” | 属功能名称，未列入词表 | 归入 `GH-ETA-02` 的语境判断，不单独建规则 |
| FN3 | “Low stock”“Sold out” 等稀缺性提示 | 加纳无对应成文规则（不同于欧盟/英国 DMCCA 的虚假紧迫性） | 不建规则；在 README 的 open questions 记录「若后续《消费者保护法》通过需复核」 |

## 词表调参记录

1. 初版 `GH-LAB-10`：`["mah","wh","watt","db","hz","bluetooth","anc","noise cancelling","noise reduction","energy saving","efficiency","ipx","ip67"]` → 页面 A 触发 4 次，页面 B 仅 1 次（漏 “2200 W”）。
2. 加入 `input power`、`litre` 后：页面 B 触发 3 次（`GH-LAB-10` 命中 2 次），页面 A 不变。
3. 未加入 `w`、`v`、`a` 等单字母：会把 “V6.0”“5V” 之外的普通文本全部打中。
4. `ghc_headphones.html` 的 `privacy` 字样只出现在 Shopify 脚本内，不在可见文本中；因此「隐私政策是否可从页面到达」必须做链接级检查，不能靠文本匹配。
