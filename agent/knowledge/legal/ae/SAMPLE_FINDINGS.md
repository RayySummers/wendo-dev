# 阿联酋规则库 v0.1 —「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实阿联酋产品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | Samsung Gulf — Q990H 11.1.4ch Soundbar with Wireless Dolby Atmos (2026) |
| URL | https://www.samsung.com/ae/audio-devices/soundbar/q990h-black-hw-q990h-zn/ |
| 市场 | 阿联酋（AED 标价、UAE/English 站点、阿联酋配送与保修条款） |
| 抓取时间 | 2026-11-17 |
| HTML SHA-256 | `71a268ce8f5f5d922c94a53dc8d199829306d1a28501906d788c26c0dd9f2d59`（1,118,527 bytes） |
| 可见文本 SHA-256 | `14eff712111b935a6af4c04f80fc45ea7f2b33335227cb4b8335fc69a059dfab`（51,549 字符） |
| 抓取方式 | `curl -L -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'`；去 `<script>/<style>/<noscript>/<svg>` 后用标签剥离取可见文本，空白归一化；`claim_pattern` 在归一化小写文本上匹配（≤4 字母的单词加词边界，多词短语按子串） |

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 33 |
| 被 `claim_pattern` 触发的规则 | 14 |
| 触发次数 | 254 |
| 进入 finding 的条目 | 4（1 high、2 medium、1 low） |
| 判为误报的触发簇 | 6 |
| 转为「需向商家核实」的结构性检查 | 4（阿语版本、TDRA 注册、ECAS/G-Mark、促销许可） |
| 明确不可观察 | 2（包装标签实物、保修纸质文件） |

> 结论：254 次触发里只有 4 个值得进入报告。噪声集中在 `was` / `off` / `ad` / `genuine` / `warranty` 这类高频词，以及前端未渲染的模板占位符（`{{...}}`）。`decision_level` 与 `review_required` 是控制误报的主要工具；`claim_pattern` 为空的结构性规则（阿语、标签、准入）无法靠文本匹配发现，必须走结构检查。

## Findings（进入报告）

### F1 · “No.1 selling Soundbar brand for 12 years” 与媒体奖项

- 规则：`AE-ADV-03`（条例第 8(5) 条，奖项/证书/质量标志）、`AE-ADV-19`（条例第 8(7) 条，预期效果）、`AE-ADV-01`（CPL 第 17 条，兜底）
- 页面信号（原文）：
  > “Samsung is ranked No.1 selling Soundbar brand for 12 years (2014~2025) ⓒ 2026 Futuresource Consulting”
  > “[Techaeris] Editor's Choice 2026”
  > “This is the absolute best of the best and worth every penny.”
- 判断：`substantiation`。页面给出了排名来源（Futuresource）与年份区间，形式上是可核的；但“No.1”的口径（销量/销售额、全球/区域、soundbar 品类定义）与奖项的评选方法未展示。第三句是媒体引语，不是商家自己的结论。
- 报告写法：
  > 页面在奖项区显示 “No.1 selling Soundbar brand for 12 years (2014~2025)”，并引用 “[Techaeris] Editor's Choice 2026”。根据阿联酋《消费者保护法实施条例》第 8(5)、(7) 条，奖项、证书与预期效果类陈述属于欺骗性描述的法定要素。请提供 Futuresource 报告原件（口径、地域、品类定义）与奖项授权/评选规则；在提供前，该声称属于“待证实”，本报告不对其真实性作判断。**需专业审核。**
- 需要的证据：Futuresource 报告（含方法说明）、奖项授权书、引语原文与授权、覆盖型号。
- 严重度：medium（`review_required=true`）。

### F2 · “Trade-in … up to AED 4,000* cashback” 的促销许可与条件

- 规则：`AE-ADV-05`（CPL 第 18 条）、`AE-ADV-06`（条例第 31 条）、`AE-ADV-04`（CPL 第 8(2) 条，价格陈述）
- 页面信号（原文）：
  > “Trade-in your old television and get up to AED 4,000* cashback.”
- 判断：`rule_level` + `human_review` 组合。阿联酋对促销/折扣实行事前许可；页面展示的是带星号的“最高 AED 4,000”换购返现，属于促销机制。许可编号未展示；星号条件（旧机折价上限、适用型号、时间）需看细则。是否“最高”可达，取决于旧机估值规则，属整体印象判断。
- 报告写法：
  > 页面显示 “Trade-in your old television and get up to AED 4,000* cashback”。根据阿联酋《消费者保护法》第 18 条与《实施条例》第 31 条，开展促销或折扣前须取得主管机关许可，并在折扣一周内生效时告知消费者。请提供该活动的促销许可编号与有效期、返现上限的计算规则与适用型号；页面未展示许可信息，**需向商家核实**。**需专业审核。**
- 需要的证据：促销许可/备案、活动规则（T&C）、旧机估值表、活动起止日期。
- 严重度：medium。

### F3 · 整页只有英文，无阿拉伯语版本

- 规则：`AE-ADV-07`（CPL 第 26 条）、`AE-ADV-08`（CPL 第 25(1) 条，电商信息）
- 页面信号（原文）：
  > 语言/地区选择器仅 “UAE / English”；页面标题、卖点、条款、页脚均为英文。
- 判断：`rule_level`。CPL 第 26 条要求消费者相关的数据、广告与合同使用阿拉伯语（可并列其他语言）。该页面为面向阿联酋的电商商品页，未见阿语版本入口。是否另有阿语站点需核实；若确无，属结构性缺口。
- 报告写法：
  > 页面语言选择器仅提供 “UAE / English”，商品卖点、条款与页脚均为英文。根据阿联酋《消费者保护法》第 26 条，与消费者相关的数据、广告与合同须使用阿拉伯语，可并列其他语言。请确认是否存在阿语版本；**页面未展示阿语版本，需向商家核实**。**需专业审核。**
- 需要的证据：阿语站点/阿语商品页截图、语言切换入口、阿语与英语内容一致性。
- 严重度：high（该条对阿联酋市场是结构性门槛）。

### F4 · Cookie 横幅的“继续浏览即视为同意”

- 规则：`AE-PRV-02`（PDPL 第 6(1)(b)–(c) 条）、`AE-PRV-01`（PDPL 第 13(2) 条）
- 页面信号（原文）：
  > “This site uses cookies. By clicking ACCEPT or continuing to browse the site you are agreeing to our use of cookies.”
- 判断：`rule_level`。PDPL 第 6 条要求同意以清晰、简单、无歧义且易于获取的方式作出，并包含可轻易撤回的权利；“继续浏览即视为同意”把不作为当作同意，且横幅未展示处理目的、共享对象与跨境传输信息（第 13(2) 条）。是否存在分类选择/撤回入口需看交互。
- 报告写法：
  > 页面 Cookie 横幅写明 “By clicking ACCEPT or continuing to browse the site you are agreeing to our use of cookies”，未在同一层级展示处理目的、共享对象或撤回方式。根据阿联酋《个人数据保护法》第 6 条与第 13(2) 条，同意须清晰、无歧义且可轻易撤回，控制者须在处理前告知目的、共享对象与跨境保护措施。请提供同意界面截图、同意记录与撤回路径；**需专业审核**，本报告不对其有效性作定性。
- 需要的证据：同意管理平台配置、分类开关、同意日志、隐私政策链接与版本。
- 严重度：medium。

### F5 · 安装费用提示（正向样例，不进入 finding）

- 规则：`AE-ADV-10`（条例第 5 条）
- 页面信号（原文）：
  > “Standard installation charges may apply. Click here for more details.”
- 判断：披露到位。它提示了可能收费并给出入口，属正向做法；是否足够显著才是 `human_review` 的问题。本样例不进入 finding，仅作为“同一规则下的正向对照”。

## 误报簇（不进入 finding）

| # | 触发 | 规则 | 为什么不是 finding |
| --- | --- | --- | --- |
| 1 | `Was Price` / `Original Price` / `savePrice`（12 次） | AE-ADV-04 | 全部是未渲染的前端模板占位符（`{{priceAnchor...}}`），不是页面实际展示的划线价。 |
| 2 | `warranty`（30 次） | AE-ADV-12 | 绝大多数是 `{{price.warrantyMessage}}` 占位符；实际保修条款在独立页面，属“需查看随货文件”，不是页面缺口。 |
| 3 | `off`（1 次） | AE-ADV-04 | 上下文是 “reflects off the ceiling”（声波反射），不是折扣。 |
| 4 | `genuine`（2 次） | AE-ECOM-02 | 上下文是 “genuine Samsung parts”（维修备件），不是商品正品声称。 |
| 5 | `wireless`（37 次） | AE-LBL-06 | TDRA 型号批准是“适用性触发”：带无线模块才需要注册，页面出现 wireless 不等于未注册。 |
| 6 | `promotions`（3 次） | AE-ADV-05 | 上下文是订阅勾选 “I would like to receive … promotions”，属营销同意，不是促销活动。 |
| 7 | `ad`（3 次） | AE-ADV-15 | 匹配到 “Download / Add / Read More” 等词片段，不是广告标识缺失。 |

## 漏报与不可观察

1. **`claim_pattern=[]` 的条目不会触发。** 阿语义务（ADV-07/08）、标签（LBL-01/02/03）、标准符合性（LBL-05）、电商披露（ECOM-01/04）都靠结构检查；本样例中 F3 是人工发现的，不是词表命中。
2. **TDRA 注册号与 ECAS/G-Mark 在页面上通常不存在。** 只能写“页面未展示，需向商家核实”，不能推断未注册。
3. **包装实物标签不可见。** 条例第 3 条的 8 项清单（含 “Made in” 格式、进口商地址、阿语警告）需要包装实拍或标签稿，网页无法覆盖。
4. **价格未在静态快照中渲染。** 售价由 JS 渲染，快照只捕获到换购返现；价格类规则需要浏览器渲染后的快照。
5. **保修文件与促销许可属商家后台材料。** 页面只能证明“未展示”，不能证明“不存在”。

## 词表调参建议（v0.2）

- 删除或收紧：`was`、`off`、`ad`、`save`、`deal`、`genuine`、`warranty`（单词级噪声过高）。
- 改为短语：`was price`、`original price`、`save aed`、`% off`、`deal ends`、`limited time offer`、`cashback`、`trade-in`。
- 对“适用性触发”类规则（如 `wireless`、`battery`、`refurbished`）在 `notes` 标注“命中只代表需要检查，不代表缺口”，报告中不得直接生成 finding。
- 增加阿语关键词：`ضمان`（保修）、`خصم`（折扣）、`عرض`（优惠）、`صنع في`（Made in），用于识别“只有阿语、没有英语”的反向缺口。
- 结构性规则建议独立成 `structural_checks`，不与 `claim_pattern` 混用，避免“0 命中=无风险”的误读。
