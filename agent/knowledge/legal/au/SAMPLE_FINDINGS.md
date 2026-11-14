# 澳大利亚规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实澳大利亚产品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | Philips 3000 Series XXL 7.2 Litre Air Fryer Black NA342/00（The Good Guys 澳洲站） |
| URL | https://www.thegoodguys.com.au/philips-3000-series-xxl-72-litre-air-fryer-black-na34200 |
| 市场 | 澳大利亚（AUD 标价、英文页、AU 配送与门店自提） |
| 抓取时间 | 2026-11-14 |
| HTML SHA-256 | `77cae328a6cce809f6fe07ad019f153e979d4384d685ff210e8208683a08ff4a` |
| 可见文本 SHA-256 | `93bc93fb2e8310d8e3dd4a0e865ff3b9e96d580434be648b907e5e7ec2a63d07` |
| 抓取方式 | `curl -L -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'` 取 HTML；去 `<script>/<style>/<noscript>/<svg>/<nav>/<footer>/<header>` 后用 BeautifulSoup 提取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上做匹配（≤4 字母的词加词边界，多词短语按子串） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 45 |
| 被 `claim_pattern` 触发的规则 | 11 |
| 触发次数 | 63 |
| 进入 finding 的条目 | 4（1 medium、2 low、1 low-medium） |
| 判为误报的触发簇 | 6 |
| 转为「需向商家核实」的结构性检查 | 3 |
| 明确不可观察 | 3（隐私政策链接、RCM/EESS 标识、电池仓实物） |

> 结论：词表触发只能当“线索”。本样例 63 次触发里只有 4 个值得进入报告，绝大部分是评论原文、促销文案与页面组件噪声。`decision_level` 与 `review_required` 是控制误报的主要工具；`claim_pattern` 为空的结构性规则需要看注册号、标识与流程，不能靠文本匹配。

## Findings（进入报告）

### F1 · “TICKET $199 → $148，$51 OFF” 的比较价格缺少基准说明

- 规则：`AU-ADV-06`（ACL s.29(1)(i)）、`AU-GUIDE-04`（ACCC Price displays）、`AU-ADV-12`（ACL s.48，证据项）
- 页面信号（原文）：
  > “BLACK FRIDAY $ 148 TICKET $ 199 ¤ $51 OFF ¤ Deal ends 02/12/26”
- 判断：`human_review`。页面同时展示现价、 “TICKET” 价与折扣额，但未说明 “TICKET” 是否为该 SKU 在澳洲站此前的实际售价、持续了多久。若 $199 从未在合理期间成交，或只在极小比例库存成交，则比较价格可能造成误导；仅凭页面无法判断。
- 报告写法：
  > 商品页显示 “BLACK FRIDAY $148 / TICKET $199 / $51 OFF”。根据 ACL s.29(1)(i)，就价格作虚假或误导性陈述属禁止情形；ACCC 的价格展示指引要求划线价有真实的近期成交基础。请提供该 SKU 在澳洲站过去 30/60 天的实际售价与成交记录，以及 “TICKET” 的定义；若 $199 不是真实近期售价，建议移除该比较价。**需专业审核。**
- 需要的证据：价格历史（含促销排期）、成交订单样本、 “TICKET” 价的后台字段、同款在其他 AU 渠道的售价。
- 严重度：medium（`review_required=true`）。

### F2 · 评论聚合分与激励披露

- 规则：`AU-ADV-04`（ACL s.29(1)(e)-(f)）、`AU-GUIDE-03`（ACCC Online reviews）
- 页面信号（原文）：
  > “4.9 Read 54 Reviews”；单条评论下 “This customer is a verified purchaser who may have received an incentive in return for providing an authentic review.”
- 判断：`human_review`。页面**披露了**评论者可能获得激励，这一点优于常见做法；但 4.9 的聚合分、54 条评论的筛选与排序规则、激励是否影响评分，均无法从页面验证。
- 报告写法：
  > 商品页显示 “4.9 / 54 Reviews”，并在每条评论下披露 “verified purchaser … may have received an incentive”。根据 ACCC 在线评论指引与 ACL s.29(1)(e)-(f)，评论的采集、筛选与激励安排不得造成误导。请提供评论导出、激励计划条款与审核/删除政策；若存在只展示好评或激励与评分挂钩的安排，需进一步评估。**需专业审核。**
- 需要的证据：评论后台导出（含评分分布）、激励计划 T&Cs、审核与排序规则、评论者购买匹配记录。
- 严重度：low。

### F3 · “Time and Energy Saving” 比较声称

- 规则：`AU-ADV-05`（ACL s.29(1)(g)）、`AU-ADV-09`（ACL s.4）、`AU-GUIDE-05`（ACCC False or misleading claims）
- 页面信号（原文）：
  > “Time and Energy Saving: Philips states it is designed to save time and energy when cooking compared with conventional oven use.”
- 判断：`substantiation`。这是比较型性能声称，且已注明来源为 Philips；注明来源降低了“商家自述”的风险，但仍需有可核实的比较测试（能耗、时间、测试条件）。
- 报告写法：
  > 页面写 “Philips states it is designed to save time and energy when cooking compared with conventional oven use”。根据 ACL s.29(1)(g) 与 s.4，性能与比较类声称需要有合理依据。请提供能耗与时间对比测试报告（方法、样本、负载、测试机构），并确认该表述是否获得 Philips 授权使用。**需专业审核。**
- 需要的证据：能耗/时间对比测试报告、Philips 的原始声称与授权、测试条件说明。
- 严重度：low-medium。

### F4 · “Sign up to Earn or Access 90 Day StoreCash” 促销与收集个人信息

- 规则：`AU-ADV-13`（ACL s.32）、`AU-ADV-18`（Spam Act s.16）、`AU-PRV-03`（APP 5）
- 页面信号（原文）：
  > “Sign up to Earn or Access 90 Day StoreCash > here”；页尾促销条件写 “Qualifying conditions, including signing up to 90 Day StoreCash, activating a Digital Wallet before being eligible to earn/win …”
- 判断：`human_review`。促销附有 T&Cs 链接，条件（注册、激活钱包、60 天内配送/自提）写在页面下部；风险点在于注册即收集个人信息时的收集告知是否在收集点可见，以及“earn/win”的规则是否足够显著。
- 报告写法：
  > 页面顶部反复出现 “Sign up to Earn or Access 90 Day StoreCash”，具体条件写在页面下部并指向 T&Cs。根据 ACL s.32，返现/赠品/奖品类促销须按承诺提供；根据 APP 5，收集个人信息时须告知目的与披露对象。请提供促销 T&Cs、注册流程截图与收集告知文本，确认关键条件在注册前可见。**需专业审核。**
- 需要的证据：促销 T&Cs、注册/激活流程截图（桌面与移动）、隐私收集告知、奖品/积分发放记录。
- 严重度：low。

## 负向检查（看了但不下结论）

### N1 · “2 year manufacturer's warranty”

页面写 “Model NA342/00 in black comes with a 2 year manufacturer's warranty”。这是对明示保修的陈述，未出现“替代法定权利”“不退不换”“保证作废”等表述；不触发 `AU-ADV-08`/`AU-ADV-17`。只有把它写成排除 ACL 保证时才进入 finding。

### N2 · AI 生成的 “Product Summary & FAQs”

页面有一段标注 “The below information is AI generated based on Australian websites information around this item. We have done our best to ensure its accuracy but suggest verifying any information within this tab before purchasing.” 该段仍属商家的陈述，免责声明不能自动消除误导；本样例未发现与规格表冲突的具体句子，故不单列 finding，但保留为复核项。

### N3 · 币种与含税

页面以 “$” 标价、AU 配送，未见外币结算；未发现 s.48 的单一价格缺口。含税与否页面未明示，作为证据项要求商家确认。

## 结构性检查 / 不可观察项（不得推断）

| 项 | 规则 | 页面观察 | 处理 |
| --- | --- | --- | --- |
| RCM 标志 / EESS 注册号 | AU-ELEC-02/03 | 页面未展示 | 「页面未展示，需向商家核实」，不推断未注册 |
| 责任供应商（澳/新实体） | AU-ELEC-01 | 页面只显示零售商，未显示进口商/责任供应商 | 需向商家索取 EESS 注册号与责任供应商名称 |
| 纽扣/硬币电池 | AU-BATT-01~05 | 该品类为插电式，未见电池仓信息 | 不适用或需实物核实 |
| GEMS 能效标签 | AU-GEMS-01/02 | 页面未展示能效标签 | 需确认是否属 GEMS 产品类别 |
| 隐私政策 / APP 1 | AU-PRV-01/02 | 提取时去除了 header/footer，未见政策链接 | 本样例不作判断；需整页截图复核 |
| 评论真实性 | AU-GUIDE-03 | 只有页面展示，无后台数据 | 需评论导出与激励条款 |

## 误报记录（不进入报告）

| 触发词 | 规则 | 出现处 | 为什么是误报 |
| --- | --- | --- | --- |
| `best` ×4 | AU-ADV-02 / AU-GUIDE-05 | 消费者评论正文 “Best air fryer”“one of the best” | 不是商家自己的质量声称；但评论内容本身仍受 s.29(1)(e)-(f) 约束 |
| `recommended` ×4 | AU-ADV-05 | 评论组件 “Yes, I recommend this product.” | 消费者表态，不是商家声称获得批准/推荐 |
| `new` ×1 | AU-ADV-03 | 评论正文 “New model works more efficiently” | 与“商品是新的”无关 |
| `win` ×3 | AU-ADV-13 | 促销条款 “eligible to earn/win” | 积分/StoreCash 规则用语，不单凭此认定奖品承诺 |
| `customer review` ×2 | AU-ADV-04 | 评论披露句 “customer reviews are collected from verified purchasers…” | 描述评论采集方式，不是证言声称 |
| `save` ×1 | AU-GUIDE-04 | “Time and Energy Saving” | 不是价格折扣 |
| `sign up` ×4 | AU-PRV-03 / AU-ADV-18 | 页头 StoreCash 与 newsletter | 触发同意/告知检查，不等于违规 |
| `price beat` ×2 | AU-ADV-06 / AU-GUIDE-04 | “Price Check: Pay Less with PRICE BEAT” | 价格匹配政策名称，不是价格比较声称 |
| `rating` | AU-GUIDE-03 | 星级组件 | UI 元素 |

## 词表调参与版本说明

1. **新增 `ticket` / `ticket price` / `price beat`**：澳洲零售商常用 “TICKET $199” 表示划线价/票面价；原词表只有 `was $`、`rrp`，在本样例漏掉了最关键的比较价格信号。已补入 `AU-ADV-06` 与 `AU-GUIDE-04`。
2. **未加入 `off`**：`$51 OFF` 很常见，但 `off` 也会命中 “based off”“turn off”，噪声过大；报告阶段再人工识别折扣额。
3. **未加入 `energy`**：会命中 “energy rating”（GEMS）与 “energy saving”（性能声称）两类不同规则；本样例改用 `AU-GUIDE-05` + 人工判断。
4. **评论区的“商家引用”边界**：评论组件里的文字既可能是消费者原文，也可能被商家编辑/精选；本样例按“消费者原文”处理，但要求商家提供审核与排序规则。
5. **样例时效**：页面价格与促销会变；本文件记录的是 2026-11-14 的可见文本哈希，复现时以哈希与原文片段核对，不以当前页面内容为准。
