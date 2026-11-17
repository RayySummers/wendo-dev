# 卡塔尔规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实卡塔尔商品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | Xiaomi Smart Air Purifier 4 Lit Wi-Fi（Jarir Bookstore 卡塔尔站，英文） |
| URL | https://www.jarir.com/qa-en/xiaomi-smart-air-purifier-4-lit-smart-home-devices-685069.html |
| 市场信号 | 配送地 Qatar、QAR 标价、页脚 “C. R. No. 23678”（卡塔尔商业登记） |
| 抓取时间 | 2026-11-17 |
| HTML SHA-256 | `8c14449ca3847b839e63f2d4b8f554f03aa21691486add8ccd3b2ce6a9c28377` |
| 可见文本 SHA-256 | `16a9dbcfc7862da9f23302c84ef92da33f5916a015b6edaa6e4a7771b559d0a0` |
| 抓取方式 | Chromium headless（Playwright，UA Chrome 120，locale en-US），`body.inner_text()` 取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上匹配（≤4 字符加词边界，多词短语按子串） |

> 该页为动态渲染页，价格与促销随时变化；复现时以哈希与原文片段核对，不以当前页面内容为准。

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 35 |
| 被 `claim_pattern` 触发的规则 | 9 |
| 触发次数 | 9 |
| 进入 finding 的条目 | 4（2 medium、1 low、1 low-medium） |
| 判为误报的触发簇 | 3 |
| 负向检查（看了但不下结论） | 2 |
| 结构性检查 / 不可观察 | 5 |
| 漏报 | 1（比较价无标注） |

> 结论：词表触发只能当“线索”。本样例 9 次触发里 4 个进入报告，其余是页脚、币种与订阅组件噪声；同时有 1 个真实价格信号未被词表捕获，说明卡塔尔场景需要“数值比较价”检测，而不能只靠 `was/RRP` 字样。

## Findings（进入报告）

### F1 · “Works with Amazon Alexa/Google Assistant” 兼容性声称

- 规则：`QA-ADV-01`（CPL 2008 Art. 7，`substantiation`）
- 页面信号（原文）：
  > “Xiaomi Smart Air Purifier 4 Lit Wi-Fi, Works with Amazon Alexa/Google Assistant, White”
- 判断：`substantiation`。这是第三方生态兼容性声称，可核实但页面未给出认证或测试依据；不能仅凭文案判定真假。
- 报告写法：
  > 页面称 “Works with Amazon Alexa/Google Assistant”。根据卡塔尔 2008 年第 8 号《消费者保护法》第 7 条，商品描述不得包含虚假或欺骗性信息；此类兼容性声称需要可核实的认证或测试记录。请提供对应型号（BHR5274GL）的兼容性认证/测试报告与授权使用证明。本项只判“需要证明”，不判声称真假。
- 需要的证据：Alexa/Google 兼容性认证或测试记录、品牌授权、对应固件版本说明。
- 严重度：medium（`review_required=true`）。

### F2 · 订阅入口的同意与隐私告知

- 规则：`QA-ECM-03`（电商法 Art. 54，`substantiation`）、`QA-PRV-03`（PDPPL Art. 22，`substantiation`）
- 页面信号（原文）：
  > “Be the first to know about the latest technology and offers”；“Subscribe for Exclusive Offers”；“Subscribe”
- 判断：`substantiation`。页面只显示订阅入口，未在可见文本中说明勾选性质、用途、退订方式与隐私告知；需看实际弹窗/表单与同意记录。PDPPL Art. 22 还要求营销通讯标明发送者身份与停止方式。
- 报告写法：
  > 页面提供 “Subscribe for Exclusive Offers” 邮件订阅入口。根据卡塔尔 2010 年第 16 号电商法第 54 条，未经消费者明确同意不得发送商业性电子通讯；根据 2016 年第 13 号《个人数据隐私保护法》第 22 条，直接营销须事先同意、标明发送者身份并提供停止方式。请提供订阅表单截图（含默认勾选状态）、同意记录与退订路径。**需专业审核。**
- 需要的证据：订阅表单（桌面/移动）、同意文本版本与时间戳、退订处理日志、隐私政策链接。
- 严重度：medium（`review_required=false`，但涉及两条规则，建议人工确认）。

### F3 · “12 months warranty by JARIR” 的保修范围

- 规则：`QA-WAR-02`（CPL Art. 9，`rule_level`）、`QA-WAR-01`（CPL Art. 16，`human_review`）
- 页面信号（原文）：
  > “12 months warranty by JARIR”；“Warranty Period (Months) 12”；“Warranted by JARIR”
- 判断：`rule_level` + `human_review`。页面明确了保修主体（JARIR）与期限（12 个月），这是有利披露；但未展示保修范围、除外情形、备件供应与超过 15 日的备用机安排。Art. 24 下排除法定义务的条款无效，需看条款全文。
- 报告写法：
  > 页面写 “12 months warranty by JARIR”。根据 CPL 第 9 条，贸易代理/经销商须执行生产商或代理提供的全部保证；第 16 条对备件供应与保修责任另有要求。请提供保修条款全文，确认 12 个月保修的主体、范围、除外情形与备件承诺，并确认未通过条款排除法定责任。**需专业审核。**
- 需要的证据：保修条款、品牌授权/代理协议、备件供应承诺、维修时限与备用机安排。
- 严重度：low。

### F4 · “QR 589 / QR 669” 比较价缺少标注（词表漏报）

- 规则：`QA-PRC-02`（CPL Art. 10，`rule_level`）、`QA-PRC-01`（CPL Art. 8，`rule_level`）
- 页面信号（原文）：
  > “QR 589”；“Inclusive of VAT”；“QR 669”；“Sold as: Each”；“QR 147.25 Per Month/4 months”
- 判断：`human_review`。页面同时出现 589 与 669 两个价格，669 未标注为“原价/划线价/建议零售价”，也未说明有效期；若 669 从未在合理期间成交，比较价可能造成误导。另一方面，“Inclusive of VAT” 是价格披露的正面证据。
- 报告写法：
  > 商品页显示 “QR 589 / Inclusive of VAT” 与 “QR 669”，未说明 669 的含义与有效期。根据 CPL 第 10 条，不得以高于广告价收取价款；比较价格应有真实成交基础。请提供该 SKU 过去 30/60 天的实际售价与成交记录，并说明 669 的定义。若 669 不是真实近期售价，建议移除或标注。**需专业审核。**
- 需要的证据：价格历史、成交订单样本、669 的后台字段、其他卡塔尔渠道售价。
- 严重度：low-medium。
- **漏报说明**：本页没有 “was/RRP/list price” 字样，`QA-PRC-02` 的 `claim_pattern` 未触发；该 finding 来自人工观察。建议 v0.2 增加“同一页面出现两个 QAR 价格且低价在前”的数值型检测，而不是继续堆词。

## 负向检查（看了但不下结论）

### N1 · “Inclusive of VAT”

页面在 589 下方明确写 “Inclusive of VAT”，符合 CPL Art. 8 与电商法 Art. 55 对含税价格披露的方向；未发现结账页另加税费的证据（结账页未抓取）。

### N2 · 页脚商业登记信息

页脚显示 “Copyright © 2026. Jarir Bookstore. C. R. No. 23678.”，属于电商法 Art. 51 身份披露的正面证据；但未显示地址、许可机关与客服邮箱，仍需整页复核。

## 结构性检查 / 不可观察项（不得推断）

| 项 | 规则 | 页面观察 | 处理 |
| --- | --- | --- | --- |
| CRA 型号核准 | `QA-TEL-01`/`QA-TEL-02` | 空气净化器含 Wi-Fi，属 RTTE；页面未展示核准证书编号 | 「页面未展示，需向商家索取 CRA 核准证书与铭牌照片」，不推断未核准 |
| CRA 标签 | `QA-TEL-03`/`QA-TEL-04` | 页面无铭牌/标签图 | 需实物或铭牌照片 |
| G-Mark | `QA-REG-01` | 页面未展示 G-Mark | 需证书与铭牌照片；GSO 英文本为非官方译本，结论需专业审核 |
| 阿拉伯语信息 | `QA-LAB-02` | 当前为 EN 界面；页脚有 “عربي” 语言入口，但未抓取阿拉伯语版本 | 「页面未展示阿拉伯语商品信息」，需抓取阿拉伯语页面后再判断，不凭英文页推断违规 |
| 隐私政策 | `QA-PRV-01`/`QA-ECM-08` | 可见文本未见隐私政策链接 | 需整页截图（含页脚）复核 |

## 误报记录（不进入报告）

| 触发词 | 规则 | 出现处 | 为什么是误报 |
| --- | --- | --- | --- |
| `exclusive` | `QA-ADV-06` | “Subscribe for Exclusive Offers” | 订阅组件的营销套话，不构成对商品排他性的实质声称 |
| `offer` | `QA-ECM-02` | 同上 | 不是带条件的促销要约，只是订阅标题 |
| `warranty` ×2 | `QA-WAR-01`/`QA-WAR-02` | 同一句 “12 months warranty by JARIR” | 同一事实触发两条规则，应按一个 finding 处理，避免重复计数 |
| `subscribe` ×2 | `QA-ECM-03`/`QA-PRV-03` | 同一订阅入口 | 同上；两条规则分别对应电商法与 PDPPL，报告合并为 F2 |

## 词表调参与版本说明

1. **删除 `qr`**（`QA-PRC-01`）：卡塔尔里亚尔代码在页面上高频出现，会命中所有价格，噪声过大；保留 `inclusive of vat` 等含税/不含税信号。
2. **删除裸 `sms`**（`QA-ECM-03`）：本页 “We'll confirm your date by SMS” 是配送通知，不是营销短信；营销场景改用 `newsletter`/`subscribe`/`marketing`。
3. **删除裸 `delivery`**（`QA-ECM-07`）：改为 `delivery within`/`ships in`/`delivery time`/`pre-order`，只在出现时限承诺时触发 30 日解除权的检查。
4. **`warranty` 保留在两条规则**：Art. 9（执行生产商保证）与 Art. 16（损害/备件/保修责任）是不同义务；报告层去重即可，词表层不必合并。
5. **未加入 `only`/`new` 的强匹配**：这两个词在卡塔尔页面多为人称或时间描述，误报率高；保留在 `QA-ADV-06` 但必须人工复核。
6. **样例时效**：页面价格与促销会变；本文件记录的是 2026-11-17 的可见文本哈希，复现时以哈希与原文片段核对。
