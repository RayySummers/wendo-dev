# 菲律宾规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实菲律宾产品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | P-NA231-00 PHILIPS 6.2L BLK DIGITAL AIR FRYER（SM Appliance 菲律宾站） |
| URL | https://www.smappliance.com/collections/air-fryer/products/p-na231-00-philips-6-2l-blk-digital-air-fryer |
| 市场 | 菲律宾（PHP 标价、英文页、PH 配送与门店） |
| 抓取时间 | 2026-11-14 |
| HTML SHA-256 | `dad182d58b14d283188ffa52bb4704dab01341ce54651c09784bec99f85a9acb` |
| 可见文本 SHA-256 | `235e1b689bf2fffd265f747e21ad4005e4ad4193ec18ce7673fb168de8b8c13b` |
| 抓取方式 | `curl -L -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 … Chrome/124.0 Safari/537.36'` 取 HTML；去 `<script>/<style>/<noscript>/<svg>/<nav>/<footer>/<header>` 后用 BeautifulSoup 提取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上匹配（≤4 字母的词加词边界，多词短语按子串） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 28 |
| 被 `claim_pattern` 触发的规则 | 5（PH-ADV-01、03、04、05、06） |
| 触发次数 | 7 |
| 进入 finding 的条目 | 3（1 medium、1 low-medium、1 low） |
| 判为误报的触发 | 4（`original` ×3、`safe` ×1） |
| 转为「需向商家核实」的结构性检查 | 4（PS/ICC 标志、进口商地址、标签六面/翻译、投诉台地址） |
| 明确不可观察 | 2（隐私告知、认证证书状态） |

> 结论：词表触发只能当「线索」。本样例 7 次触发里只有 2 个（价格比较、健康声称）值得进入报告；`original` 全部来自「original packaging」，`safe` 来自「Dishwasher safe」。结构性规则（PS/ICC、标签、促销许可）完全依赖实物/证书，不靠文本匹配。

## Findings（进入报告）

### F1 · 「₱7,995 → ₱5,996.25，Save ₱1,998.75」缺少比较价格基准

- 规则：`PH-ADV-04`（CPA Art. 50(h)）、`PH-ADV-05`（CPA Art. 111(a)）、`PH-PRICE-01`（CPA Art. 81）、`PH-ECOM-01`（ITA s.23(a)）
- 页面信号（原文）：
  > “Price: ₱5,996.25 ₱7,995 Save ₱1,998.75”
- 判断：`rule_level`（规则明确），但是否违规取决于价格历史。页面同时展示现价、划线价与节省金额，却未说明 ₱7,995 是否为该 SKU 在菲律宾站此前的实际售价、持续了多久。根据 Art. 111(a)，若以卖家原价作比较，该商品须在广告前 90 天内以该价格实际售出，或在 90 天内至少 4 周以该价格要约销售；否则须披露价格的时间/季节区间。
- 报告写法：
  > 商品页显示 “₱5,996.25 / ₱7,995 / Save ₱1,998.75”。根据菲律宾《消费者法》（RA 7394）第 111(a) 条，以卖家原价作比较时，该商品须在广告前 90 天内以该价格实际售出，或在 90 天内至少 4 周以该价格要约销售；否则须披露价格的时间/季节区间。请提供该 SKU 在菲律宾站过去 90 天的实际售价与成交记录，以及 “₱7,995” 的定义。若无法证明，建议移除该比较价或改为不带价格基准的表述。**需专业审核。**
- 需要的证据：价格历史（含成交，不只是标价）、促销排期、后台价格字段、同款在其他 PH 渠道的售价。
- 严重度：medium（`review_required=true`）。

### F2 · 「Healthy Low Fat」健康/营养声称

- 规则：`PH-ADV-06`（CPA Art. 115，substantiation）、`PH-ADV-01`（CPA Art. 110，human_review）、`PH-ADV-02`（CPA Art. 50(a)）
- 页面信号（原文）：
  > “PHILIPS Air Fryer NA231/00 Healthy Low Fat Multi-cooker 6.2 Liters Non-Stick Frying Basket Digital Fryer”
- 判断：`substantiation`。这是关于烹饪方式与脂肪摄入的健康/营养声称，页面未给出测试方法、对照条件或数据来源。PH 法下只能判「需要证明」，不能判声称真假；若该表述来自制造商，商家仍需对其页面陈述负责。
- 报告写法：
  > 页面标题写 “Healthy Low Fat Multi-cooker”。根据《消费者法》第 115 条，广告中的特别声称须有 substantiation，并正确使用研究结果、科学术语与统计。请提供该型号与常规油炸方式的脂肪含量/热量对比测试报告（方法、样本、测试机构、日期），以及制造商对该表述的授权与原始测试条件。**需专业审核。**
- 需要的证据：对比测试报告、测试条件（食材、温度、时间、油量）、制造商授权、同类表述在其他市场的版本。
- 严重度：low-medium（`review_required=true`）。

### F3 · 「Dishwasher safe」性能/兼容性声称

- 规则：`PH-ADV-06`（CPA Art. 115，substantiation）、`PH-ADV-02`（CPA Art. 50(a)）
- 页面信号（原文）：
  > “Dishwasher safe: Yes”
- 判断：`substantiation`。这是可验证的性能/兼容性陈述，风险低于健康声称；但若实际不适用于所有洗碗机程序（温度、洗涤剂），仍可能构成不实陈述。页面未给出测试标准或限制条件。
- 报告写法：
  > 规格表写 “Dishwasher safe: Yes”。根据《消费者法》第 50(a) 与第 115 条，性能声称须有合理依据。请提供洗碗机兼容性测试报告或制造商的使用说明（允许的温度/程序/洗涤剂限制），并确认该表述是否适用于在菲律宾销售的同型号。**需专业审核。**
- 需要的证据：制造商测试报告、使用说明书、型号一致性证明。
- 严重度：low。

## 负向检查（看了但不下结论）

### N1 · 两年保修与「Pursuant to the Consumer Act」

页面写 “Warranty Parts: 2 Years Labor: 2 Years”，并在退换说明中写 “Pursuant to the Consumer Act of the Philippines (RA 7394), return or exchange will be allowed due to manufacturing defect.” 这是对明示保修与法定权利的正面披露，未出现「排除法定权利」「不退不换」等表述；不触发 `PH-LBL-04` 的保修披露缺口，也不构成 `PH-ADV-02` 的虚假批准/保证。退换本身属 Layer 3，不在本库范围。

### N2 · 价格与币种

页面以 “₱” 标价、PH 配送，未见外币结算；`PH-PRICE-01` 的「公开显示价格」与「不得高于标示价出售」在页面上成立（结算页未抓取，作为证据项要求商家确认）。含税信息页面未明示，列入证据请求。

### N3 · 产品规格

“6.2L”“200°C”“0.8 m cord”“4.3 kg”等是规格参数，不是合规声称；未触发规则。若与实物不符，走 `PH-ADV-02`/`PH-ADV-06` 的 substantiation 路径。

## 结构性检查 / 不可观察项（不得推断）

| 项 | 规则 | 页面观察 | 处理 |
| --- | --- | --- | --- |
| PS 标志 / ICC 贴纸 | PH-CERT-04、PH-CERT-06 | 页面图片与文案未展示 | 「页面未展示，需向商家核实」；不推断未认证 |
| ICC 证书号 | PH-CERT-07 | 未展示 | 要求进口商提供 ICC 证书号与覆盖型号 |
| 产品是否在 21 类强制清单 | PH-CERT-05 | 空气炸锅不在本版清单 | 不能据此推断免认证；要求 BPS 适用性确认 |
| 进口商/重包装商 PH 地址 | PH-LBL-01 | 页面只显示零售商，未显示进口商 | 要求标签照片与进口商名称/地址 |
| 标签语言/平行翻译 | PH-LBL-03 | 页面为英文；实物标签未展示 | 要求标签六面照片；英文可，但不能只有第三种语言 |
| 消费者投诉台地址 | PH-LBL-04 | 页面有 Customer Support 链接，无地址 | 要求标签/保修卡上的投诉台地址 |
| 隐私告知 | PH-PRV-01、PH-PRV-02 | 抓取时移除了 header/footer，未见订阅表单 | 本样例不作判断；需整页截图与收集点告知 |
| 认证证书状态 | PH-CERT-04/07 | 只有页面展示，无证书 | 要求 PS 许可证/ICC 证书原件或扫描件 |

## 误报记录（不进入报告）

| 触发词 | 规则 | 出现处 | 为什么是误报 |
| --- | --- | --- | --- |
| `original` ×3 | PH-ADV-03 | “original packaging”“original packaging material” | 指退货需原包装，不是「原装/全新」声称 |
| `safe` ×1 | PH-ADV-01 | “Dishwasher safe: Yes” | 是洗碗机兼容性，不是一般安全保证；已转 F3 按性能声称处理 |
| `save` ×1 | PH-ADV-04 / PH-ADV-05 | “Save ₱1,998.75” | 同一价格比较事实触发两条规则，合并为 F1，不重复计数 |
| `digital`、`non-stick`、`cool-touch` | — | 产品规格 | 产品特征词，不是合规声称 |


## 漏报记录（词表没抓到、但结构上要看）

| 场景 | 为什么漏 | 补救 |
| --- | --- | --- |
| 页面只并列两个价格、不写 “Save/Save ₱X” | `save`/`discount` 词表不触发 | 增加「两个 ₱ 价格并列 + 删除线/划线样式」的结构检测，再套 PH-ADV-05 |
| PS/ICC 标志、ICC 编号、进口商 PH 地址 | 只在实物/包装/证书上，页面文本没有 | 固定结构检查项；报告写「页面未展示，需核实」 |
| 标签语言/平行翻译 | 页面英文正常，实物标签未展示 | 要求标签六面照片；不能因页面是英文就判合规 |
| 促销许可（Art. 116） | 页面只写 “Sale/Promo”，不写是否报备 | 要求 DTI 许可/申请回执；抽奖/比赛优先 |
| 隐私告知 | 抓取时移除 header/footer，订阅表单不可见 | 用整页截图/浏览器渲染复核收集点 |
| 保修与投诉台地址 | 页面有保修年限，但无投诉台地址 | 要求保修卡/标签照片，按 PH-LBL-04 核对 |

## 词表调参与版本说明

1. **`save` 需要金额/百分比上下文**：`save` 也出现在 “save time/energy”；建议匹配规则改为「`save` 后 20 字符内出现 ₱/PHP/%」，否则只作为弱线索。
2. **`healthy` 归入 PH-ADV-06，不归 PH-ADV-01**：健康/营养声称是 substantiation 问题，不是当然的虚假广告；本样例已按此路由。
3. **`original` 需排除 packaging**：建议在预处理阶段把 “original packaging/packaging material” 替换为占位符，避免命中「原装/全新」规则。
4. **`safe` 需区分 `dishwasher safe` / `safe for` / `safety`**：`dishwasher safe` 是兼容性；`safe for children`、`100% safe` 才是安全保证类触发。
5. **结构性规则不设词表**：PS/ICC、进口商地址、标签语言、促销许可必须看实物/证书/许可，不能靠页面文本命中。
6. **样例时效**：页面价格与促销会变；本文件记录的是 2026-11-14 的可见文本哈希，复现时以哈希与原文片段核对，不以当前页面内容为准。
