# 英国规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实英国产品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | DREO Air Purifier 530S（英国站） |
| URL | https://uk.dreo.com/products/air-purifier-530s |
| 市场 | 英国（GBP £ 标价、英文页、UK 配送与退货政策） |
| 抓取时间 | 2026-11-14 |
| HTML SHA-256 | `5d00e2a1a16844e2064b2e8d9e1e4e0b0c76dfa22871167f287cff513bb8ceec` |
| 可见文本 SHA-256 | `92ec2d04309e26cef2f208b325a48d94eed39212d5e9aadb76eda3037eb35567` |
| 抓取方式 | `curl -L -A 'Mozilla/5.0'` 取 HTML；去 `<script>/<style>/<noscript>/<svg>` 后用 BeautifulSoup 提取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上做子串匹配（≤4 字母的词加词边界） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 43 |
| 被 `claim_pattern` 触发的规则 | 11 |
| 进入 finding 的条目 | 4（1 high-medium、2 medium、1 low） |
| 判为误报的触发 | 4（含 1 个词表噪声） |
| 需要商家补证据的结构性检查 | 3 |
| 明确不适用 / 不可观察 | 3（Cookie 横幅、评论区、认证标志实物） |

> 结论：词表触发只能当“线索”。本样例 11 个触发里只有 4 个值得进入报告，4 个是误报，3 个转为“需核实”。`decision_level` 与 `review_required` 是控制误报的主要工具；`claim_pattern` 为空的结构性规则需要看流程/实物，不能靠文本匹配。

## Findings（进入报告）

### F1 · 英国站参数写 60 Hz，与英国 50 Hz 电网不一致

- 规则：`UK-DESC-01`（CRA 2015 s. 11(1)）、`UK-DESC-02`（CRA 2015 s. 11(4)）、`UK-SAFE-01`（EESR 2016 reg. 4，证据项）
- 页面信号（原文）：
  > Specifications — Rated Power: 26 W / Input Voltage: 220~240V / **Frequency: 60 Hz**
- 判断：`rule_level`（描述与事实不一致的部分）+ `substantiation`（安全合规部分）。
  - 英国低压电网为 230 V / 50 Hz；页面把频率写成 60 Hz，与英国市场不符。可能来源：沿用美国站规格模板，或真实规格标注错误。两种情形都需要更正或说明。
  - 不能仅凭此行推断产品不合格：需要型号铭牌、说明书与测试报告交叉核对。
- 报告写法：
  > 页面「Specifications」标注 “Frequency: 60 Hz”，而英国电网为 50 Hz。根据 CRA 2015 s. 11(1)/(4)，商品页提供的规格属于合同描述的一部分，须与实物一致。请核对铭牌与说明书，并更正页面参数；若 60 Hz 为模板错误，请同步检查同站其他 SKU。**需专业审核。**
- 需要的证据：铭牌照片、说明书规格页、EMC/安全测试报告中的额定频率、同站其他 SKU 的规格表。
- 严重度：medium（`review_required=true`）。

### F2 · 英国站退货政策引用德国消费者法

- 规则：`UK-ADV-02`（DMCCA 2024 s. 226(1)(a)）、`UK-ADV-04`（DMCCA 2024 s. 227）
- 页面信号（原文）：
  > “According to **German consumer protection laws**, customers are legally entitled to a 14-day right of withdrawal without giving a reason. On top of this, DREO extends this period to 30 days …”
- 判断：`rule_level`。英国消费者的 14 天取消权来自 **Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013**，不是德国法。把英国权利写成德国法依据，属于对适用法律的不准确陈述，也可能让消费者误以为权利来源或适用范围不同。
- 报告写法：
  > 页面在退货说明中写 “According to German consumer protection laws, customers are legally entitled to a 14-day right of withdrawal…”。英国站的 14 天取消权依据是 2013 年消费者合同信息、取消与附加收费条例，而非德国法。根据 DMCCA 2024 s. 226(1)(a)，就影响交易决定的事项提供不准确信息可能构成误导性行为。建议改为英国法表述，并保留 30 天商家的额外承诺。**需专业审核。**
- 需要的证据：页面快照、退货政策全文、商家对英国/欧盟站点的模板复用流程。
- 严重度：medium（`review_required=true`）。

### F3 · 划线价为空：“Regular price (/)”

- 规则：`UK-ADV-03`（DMCCA 2024 s. 226(2)）
- 页面信号（原文）：
  > “Air Purifier 530S **Sale price £139.99 GBP Regular price (/)**”
- 判断：`human_review`。字面上“促销价 + 划线价”是常见呈现，但划线价为空（渲染为 “(/)”），消费者无法判断折扣基准；结合 “Black Friday Sale” 横幅，可能让消费者以为存在一个并不存在的原价。是否构成误导取决于整体呈现与是否有真实历史价格。
- 报告写法：
  > 商品页显示 “Sale price £139.99 GBP Regular price (/)”，划线价为空。根据 DMCCA 2024 s. 226(2)，即使信息字面真实，呈现方式造成误导仍可能构成误导性行为。请提供该 SKU 在英国站的历史售价与促销排期；若划线价无真实基准，建议移除。**需专业审核。**
- 需要的证据：价格历史（至少 30/60 天）、促销开始时间、同款在其他渠道的售价、Shopify 后台的 compare-at price 设置。
- 严重度：medium（`review_required=true`）。

### F4 · “30 天无理由退货，不问任何问题”与实际条件并列

- 规则：`UK-ADV-04`（DMCCA 2024 s. 227）、`UK-ADV-03`（s. 226(2)）
- 页面信号（原文）：
  > “30-Day Worry-Free Return Guarantee — If you are not completely satisfied with your product, you may return it in good condition within 30 days for a full refund, no questions asked.” 随后同一段写明 “for returns not related to product quality, the customer is responsible for the return shipping costs”。
- 判断：`human_review`。“no questions asked”与“须保持完好、非质量问题退货运费自理”并存，属于限定条件与主声称同一段但语义上收紧；是否误导取决于显著度与消费者理解。
- 报告写法：
  > 页面主标题称 “30-Day Worry-Free Return Guarantee … no questions asked”，同段后部又要求 “in good condition” 且非质量问题退货运费由消费者承担。根据 DMCCA 2024 s. 227，重要限定应以消费者容易看到的方式呈现。建议把条件放在与主声称同等显著的位置。**需专业审核。**
- 需要的证据：页面版式截图（桌面/移动）、退货政策全文、实际退货流程。
- 严重度：low。

## 误报记录（不进入报告）

### FP1 · “Free Shipping / Fast & Free Delivery”（`UK-ADV-13`）

- 页面信号：“Tax included. Free Shipping”“Fast & Free Delivery … (restrictions may apply in some regions)”。
- 为什么是误报：DMCCA Sch. 20 para 23 针对的是“产品被描述为免费，但消费者还要支付其他费用”。免运费本身不构成该行为；页面也没有把产品本身说成免费。
- 处理：不进入 finding；仅在“配送限制未说明”时另按 s. 227 观察（本例限制说明已给出链接，故不单列）。

### FP2 · 币种下拉框出现 USD/CAD/EUR（`UK-PRC-01`）

- 页面信号：国家/币种选择器列出 “United States (USD $)、Canada (CAD $)、Deutschland (EUR €) …”。
- 为什么是误报：英国站实际标价与结算为 GBP（“£139.99 GBP”），选择器只是站点切换入口。PMO 2004 art. 6(1) 要求的是对英国消费者的价格标示以英镑表示，本例满足。
- 处理：不进入 finding；调参建议：`claim_pattern` 中的 `$`/`usd` 应结合“当前站点币种/结算币种”上下文判断，不能单看下拉框。

### FP3 · 空气质量指示灯 “green”（`UK-ASA-02`）

- 页面信号：“the Air Quality Indicator is only green or blue”。
- 为什么是误报：这里的 green 是设备指示灯颜色，不是环境声称。CAP 11.1 针对的是 “eco-friendly / sustainable / carbon neutral” 一类环境声称。
- 处理：不进入 finding；调参建议：环境声称词表应使用短语（`eco-friendly`、`carbon neutral`），不要单用 `green`。

### FP4 · “Serial Fans & Heaters” 命中 `serial`（`UK-SAFE-02`）

- 页面信号：导航与商品名 “Remote Control for Serial Fans & Heaters”。
- 为什么是误报：这是产品系列名，不是“序列号”。词表噪声。
- 处理：不进入 finding；调参建议：`serial` 仅在 “serial number / serial no.” 上下文触发。

## 结构性检查（转为“需商家核实”，不作为 finding）

| 项 | 规则 | 页面观察 | 报告写法 |
| --- | --- | --- | --- |
| S1 认证标志与制造商信息 | `UK-SAFE-02`、`UK-SAFE-04`、`UK-SAFE-10` | 页面与可见包装图未展示 UKCA/CE 标志、制造商邮政地址、进口商信息、WEEE 打叉垃圾桶符号 | 「页面未展示，需向商家核实」；不推断未认证 |
| S2 Cookie 同意 | `UK-PRV-03` | 服务端 HTML 不含 Cookie 横幅（JS 注入），无法判断默认开关与拒绝路径 | 需用浏览器实跑并截图；当前不作结论 |
| S3 评论区 | `UK-ADV-10` | “Reviews” 为 JS 组件，静态 HTML 无评论内容 | 需浏览器渲染后核对评论来源、是否有激励、是否只展示好评 |

## 其他观察（不进规则库）

- **HEPA Pro 效率未标标准**：页面称 “3-Stage HEPA Pro Filter”，但未给 EN 1822 / ISO 16890 等级或 CADR 测试方法（仅给 CADR 221 m³/h）。这不是本版任何一条规则的直接触发项；若后续把“过滤效率声称”纳入 CAP 3.7 的 substantiation 清单，可作为样例。
- **中文 UI 串泄漏**：“加载产品选项中...” 出现在英国站“你可能也喜欢”组件。属本地化质量问题，不是合规规则项；但对“英文页”的一致性有影响，建议产品侧记录。
- **“Black Friday Sale” 横幅**：抓取日为 2026-11-14，活动时间合理；未核活动结束时间与是否长期常驻，故不触发 `UK-ADV-12`。

## 调参记录（v0.1 → 后续版本）

1. `UK-SAFE-02`：`serial` → 建议改为 `serial number`、`serial no.`（避免系列名噪声）。
2. `UK-ASA-02`：移除单词 `green`，仅保留 `eco-friendly`、`environmentally friendly`、`sustainable`、`carbon neutral` 等短语。
3. `UK-PRC-01`：`$`/`usd` 需与“当前站点币种/结算币种”联合判断，单独命中不计 finding。
4. `UK-ADV-13`：`free` 需排除 `free shipping`、`free delivery`（免运费不属 para 23），除非同时存在其他强制收费。
5. `UK-ADV-10`：`review` 需排除导航标签 “Reviews”；仅在评论正文/评分组件内匹配。
