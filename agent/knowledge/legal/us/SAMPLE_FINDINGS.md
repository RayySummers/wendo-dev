# 美国规则库 v0.1 — 「规则 → finding」样例与误报/漏报记录

> 目的：验证 `rules.v0.1.json` 在真实美国产品页上的可执行性，并记录误报（false positive）、漏报（false negative）与词表调参。
> 本文件不是对商家的指控，也不构成法律意见；所有 finding 均为「页面观察到什么 + 需要什么证据」，不写定性结论。

## 样例页面

| 项 | 值 |
| --- | --- |
| 页面 | COSORI Iconic® Smart Air Fryer – Stainless Steel 6.5-Quart |
| URL | https://cosori.com/products/iconic-air-fryer |
| 市场 | 美国（USD 定价、英文页、Free Shipping to Continental US） |
| 抓取时间 | 2026-11-14 |
| HTML SHA-256 | `fac6fadece183e86bb64d4eb8056d93a78107a8044e104ea31e003b97dcb7e3d` |
| 可见文本 SHA-256 | `f7436bb9335b9b136f62da969588b7841d8accd33316fee57267c9f9aa1d3387` |
| 抓取方式 | `curl -L` 取 HTML，去 `<script>/<style>/<noscript>` 后用 BeautifulSoup 提取可见文本；触发匹配在归一化小写文本上做子串匹配 |

同页还验证了两个链接可访问（用于判断「售前可查阅」与「隐私政策是否存在」）：

- 保修全文：https://cosori.com/pages/limited-product-warranty-for-cosori-iconic-%E2%84%A2 （HTTP 200）
- 隐私政策：https://cosori.com/pages/legal/privacy （HTTP 200）

## 结果概览

| 指标 | 数量 |
| --- | --- |
| 规则总数 | 35 |
| 被 `claim_pattern` 触发的规则 | 11 |
| 进入 finding 的条目 | 6（4 medium、2 low） |
| 判为误报的触发 | 5（另有 2 个转为证据请求，2 个为词表调参历史误报） |
| 需要商家补证据的结构性检查 | 4 |
| 明确不适用（scope 排除） | 3（EnergyGuide、Prop 65、GCC 对非受规则约束小家电） |

> 结论：词表触发只能当“线索”，不能直接当结论；本样例中 11 个触发里只有 6 个值得进入报告，5 个是误报。`decision_level` 与 `review_required` 是控制误报的主要工具。

> 说明：下表 FP7/FP8 是调参过程中出现过的历史误报，最终 `claim_pattern` 已移除对应词，不再触发；保留记录是为了说明为什么词表要按“词边界 + 上下文”收敛。

## Findings（进入报告）

### F1 · PFAS-free / BPA-free 声称缺少检测依据

- 规则：`US-ADV-10`（16 CFR §260.9(a)，Green Guides free-of claims）
- 页面信号：
  - “The PFAS-free ceramic-coated, nonstick basket and crisper plate are dishwasher-safe for easy cleanup.”
  - “Iconic features ceramic-coated, nonstick cooking surfaces free of PFAS and BPA …”
- 判断：`substantiation`。页面把“PFAS-free”作为卖点，但没有检测方法、检出限、覆盖部件（涂层、密封圈、炸篮/脆片盘）或第三方报告。
- 报告写法：
  > 页面称“PFAS-free / free of PFAS and BPA”，但未给出检测方法、检出限与覆盖部件。根据 FTC Green Guides 16 CFR §260.9(a)，“free of”声称须有依据并作必要限定；请提供第三方检测报告与声称适用范围。**需专业审核。**
- 需要的证据：涂层/密封圈/食品接触部件的 PFAS 与 BPA 检测报告（含方法、检出限、样品编号）；声称覆盖的部件清单。
- 严重度：medium（`review_required=true`）。

### F2 · energy-efficient 比较声称缺少对比数据

- 规则：`US-ADV-09`（16 CFR §260.3(d)/§260.4，Green Guides；FTC Act §5 兜底）
- 页面信号：“A more powerful and energy-efficient motor that allows for precise airflow control compared to traditional AC motor air fryers”
- 判断：`substantiation`。这是比较性能/能效声称（与传统 AC 电机空气炸锅对比），但页面没有测试方法、基准机型、功耗数据或测试机构。
- 报告写法：
  > 页面称“more powerful and energy-efficient motor … compared to traditional AC motor air fryers”，属于比较性能/能效声称。根据 FTC Act §5 与 Green Guides §260.3(d)/§260.4，比较性环保或性能声称须有可证实依据；请提供对比测试方法、基准机型与数据。
- 需要的证据：能效/功耗测试报告（输入功率、单位时间能耗、测试标准）、对比机型清单与测试条件。
- 严重度：medium。

### F3 · “award-winning / industry leading” 缺少奖项与比较基准

- 规则：`US-ADV-01`（15 U.S.C. §45(a)(1)，FTC Act §5）
- 页面信号：
  - “Iconic is engineered to last and backed by an industry leading warranty.”
  - “Award-winning, durable design backed by a 5-year limited warranty”
- 判断：`human_review`。页面没有说明奖项名称、评选机构/年份，也没有给出“industry leading”的比较基准（保修期限、覆盖范围、同行数据）。
- 报告写法：
  > 页面称“award-winning”与“industry leading warranty”，但未说明奖项名称、评选机构/年份，也未给出“industry leading”的比较基准。此类绝对或比较声称需在投放前持有依据；请提供奖项证书与对比数据，否则建议改为可核实的具体表述。**需专业审核。**
- 需要的证据：奖项证书/主办方页面、评选年份与类别；保修期限/覆盖范围的同行对比数据。
- 严重度：medium（`review_required=true`）。

### F4 · 食品接触部件未提供 FDA FCN/合规依据

- 规则：`US-CERT-08`（21 U.S.C. §348(a)(3)(B)，FDCA §409）
- 页面信号：
  - “304 stainless steel, commonly used for cookware and food-contact surfaces”
  - “ceramic-coated, nonstick cooking surfaces”
  - “PFAS-free ceramic-coated … basket and crisper plate”
- 判断：`human_review`。页面明确这些部件接触食品，但没有 FCN 号、21 CFR 条款、供应商合规声明或迁移测试。不能因为页面没写就推断未合规；应要求证据。
- 报告写法：
  > 页面说明炸篮/脆片盘与食品接触，但未展示 FDA FCN 号或 21 CFR 条款。根据 FDCA §409（21 U.S.C. §348），食品接触物质须有现行有效的 FCN、法规或豁免；请提供材料清单、FCN/法规依据与迁移测试报告。**需专业审核。**
- 需要的证据：涂层/不锈钢/密封圈的材料清单与供应商合规声明；FDA FCN 号或 21 CFR 条款；迁移测试报告。
- 严重度：medium（`review_required=true`）。

### F5 · Smart/App 控制设备的 FCC 声明未在页面展示

- 规则：`US-CERT-05`（47 CFR §15.19(a)(3)）
- 页面信号：“Smart Air Fryer”；“Control your air fryer remotely … through the VeSync app”；“voice control”
- 判断：`human_review`。设备很可能含 Wi-Fi/蓝牙，但页面不是设备铭牌；不能写“未认证”。应要求设备铭牌、说明书与 SDoC/FCC ID。
- 报告写法：
  > 产品为 App 控制的“Smart Air Fryer”，页面未展示 FCC 合规声明。根据 47 CFR §15.19(a)(3)，受认证/SDoC 设备应在设备显著位置标注规定声明；请提供设备铭牌、说明书与 SDoC/FCC ID。**页面未展示不等于未认证。**
- 需要的证据：设备铭牌/底部照片、说明书中的 FCC 声明、SDoC 文件或 FCC ID。
- 严重度：low（`review_required=false`）。

### F6 · 保修期限表述不一致（2-year vs 5-year）

- 规则：`US-WAR-01`（15 U.S.C. §2303(a)）；同时涉及 FTC Act §5 的整体印象
- 页面信号：
  - 购物车抽屉：“2-year warranty”
  - 产品摘要/FAQ：“5-Year Limited Warranty”“5-year limited warranty”
- 判断：`human_review`，低置信。产品页正文与 FAQ 一致写 5 年 limited，购物车抽屉的 2 年很可能是站点模板残留；但同一页出现两个期限，可能影响消费者理解。
- 报告写法：
  > 产品页正文写“5-year limited warranty”，购物车抽屉写“2-year warranty”。根据 15 U.S.C. §2303(a)，书面保修须清楚显著地指定 full/limited；期限表述不一致可能影响消费者理解，建议统一并链接完整保修文本。
- 需要的证据：站点模板配置、购物车文案来源、保修政策页版本。
- 严重度：low（`review_required=false`，但建议人工确认）。

## 误报记录（false positives）

| # | 触发规则 | 页面信号 | 为什么不是 finding | 处理 |
| --- | --- | --- | --- | --- |
| FP1 | `US-ADV-05` material connection | 页脚 “Affiliates”；“partnership updates” 订阅文案 | 这是网站导航/订阅文案，不是对产品的背书，也没有付款/寄样关系 | 保持规则，但在报告中要求“背书上下文”；不要把 footer 词当触发 |
| FP2 | `US-ADV-06` “Free” | “Free Shipping to Continental US”“Free shipping on all products” | 免运费是“Free”要约，但页面已说明适用范围（美国本土）；没有隐藏加价 | 低风险；只有附加条件未披露时才写 finding |
| FP3 | `US-ADV-07` former price | “Regular price $249.00” | 单一售价，没有 was/now 或“原价”对比；Shopify 的 “Regular price” 标签不是比较广告 | 不写 finding；只有出现“was/now”“save X%”才进入 substantiation |
| FP4 | `US-WAR-01` / `US-WAR-02` | “warranty / guarantee / limited warranty” | 产品明确写“5-year limited warranty”，且保修全文页可访问（HTTP 200） | 不写 finding；F6 只处理 2-year/5-year 不一致 |
| FP5 | `US-PRI-03` privacy policy | “privacy policy” 链接 | 隐私政策存在且可访问；本样例未审 policy 内容 | 不写 finding；如审内容，另做 PRI-03 检查 |
| FP6 | `US-CERT-05` “smart” | “Smart Air Fryer” | “smart”只是适用性触发，不等于 FCC 违规 | 转成 F5 的“证据请求”，不写“未认证” |
| FP7 | `US-ADV-01` “perfect” | “perfectly even results” | 形容词“perfectly”不是绝对化承诺；子串匹配会误伤 | 已从 `claim_pattern` 移除 `perfect`，保留 `best/#1/guaranteed/100%` 等 |
| FP8 | `US-ADV-11` “compare” | 导航 “Compare” | 导航词不是比较广告 | 已移除 `compare`，保留 `better than/superior to/versus` |

## 漏报与修正（false negatives / tuning）

| # | 问题 | 影响 | 修正 |
| --- | --- | --- | --- |
| FN1 | `food-contact` 带连字符，`food contact` 匹配不到 | F4 最初漏掉 | `US-CERT-08` 增加 `food-contact` |
| FN2 | `energy-efficient` 不在 Green Guides 词表 | F2 最初漏掉 | `US-ADV-09` 增加 `energy-efficient/energy efficient/energy saving/energy-saving` |
| FN3 | `award-winning`、`industry leading` 不在 FTC §5 词表 | F3 最初漏掉 | `US-ADV-01` 增加 `award-winning/award winning/industry leading/industry-leading` 等 |
| FN4 | 页面没有 “made in / country of origin”，`US-LBL-07` 不触发 | 原产地标记需要看实物，不能靠页面词表 | 作为结构性证据请求（见下），不写 finding |
| FN5 | 页面没有进口商名称/地址、净含量标签，`US-LBL-01/04/05/06` 不触发 | FPLA 是包装标签义务 | 作为结构性证据请求（见下） |
| FN6 | “Made with 304 stainless steel” 不触发 `US-ADV-08` | 这是材料声称，不是美国原产地声称 | 正确不触发；不要误报 Made in USA |
| FN7 | 空气炸锅不触发 `US-LBL-08/09` | 空气炸锅通常不是 EnergyGuide covered product | 正确不触发；不要套用 16 CFR Part 305 |
| FN8 | 页面有 Prop 65 警告，但本库不评分 | Prop 65 是加州州法，不在联邦库范围 | 记录为 out-of-scope，州级子单处理 |

## 结构性证据请求（不是 finding）

这些项目在页面上不可观察，只能向商家索取；报告中应写成“需核实”，不写成“缺失/违规”。

| # | 规则 | 请求 | 写法 |
| --- | --- | --- | --- |
| E1 | `US-LBL-01` / `US-LBL-04` / `US-LBL-05` / `US-LBL-06` | 产品标签/包装六面图：商品身份、制造商/进口商名称与地址、净含量（英制+公制）、醒目度 | “页面未展示标签信息；请提供实物标签照片。**页面未展示，需向商家核实。**” |
| E2 | `US-LBL-07` | 产品铭牌/底部/包装的原产地英文标记照片 | “页面未展示原产地；根据 19 CFR §134.11，进口商品须在商品或容器上永久标明原产国；请提供实物照片。**页面未展示，需向商家核实。**” |
| E3 | `US-CERT-01` | 该型号是否受 CPSC 规则约束的确认；如受约束，提供 GCC 与测试报告 | “多数小家电没有强制性 CPSC 标准；请先确认适用规则，再提供 GCC。” |
| E4 | `US-CERT-07` | SDoC 文件、美国境内责任方名称/地址/联系方式 | “如按 SDoC 授权，请提供合规信息声明与美国责任方信息。” |
| E5 | `US-CERT-02` | 客诉/事故/失效分析与 CPSC 报告记录 | 流程义务；页面不可观察，不写 finding |

## 对规则设计的结论

1. **词表只做线索**：本样例 11 个触发里 5 个是误报。`claim_pattern` 必须是“适用性触发”，不是“违规判定”。
2. **范围（scope）比词表更重要**：EnergyGuide、Prop 65、GCC 这三个最容易误报的点，都是“适用范围”问题，不是词表问题。
3. **页面 ≠ 标签 ≠ 设备**：FPLA/原产地/FCC 都是“实物或说明书”义务；页面缺失只能写“需核实”，不能写“未认证/未标记”。
4. **比较/绝对声称要看依据**：`award-winning`、`industry leading`、`energy-efficient` 都需要证据，但只能写“需要证明”，不能写“虚假”。
5. **同页文案不一致值得单列**：2-year vs 5-year 这种站点模板残留，规则本身不罚，但会影响消费者理解，适合放在 `human_review`。

## 复现

```bash
curl -sS -L -H "User-Agent: Mozilla/5.0" \
  "https://cosori.com/products/iconic-air-fryer" -o cosori_iconic.html
sha256sum cosori_iconic.html
# 期望：fac6fadece183e86bb64d4eb8056d93a78107a8044e104ea31e003b97dcb7e3d

python3 - <<'PY'
from bs4 import BeautifulSoup
import re
s=BeautifulSoup(open('cosori_iconic.html',encoding='utf-8',errors='replace').read(),'lxml')
for t in s(['script','style','noscript']): t.decompose()
txt=re.sub(r'[ \t]+',' ',s.get_text('\n'))
txt=re.sub(r'\n\s*\n+','\n',txt)
open('cosori_iconic.txt','w').write(txt)
PY
sha256sum cosori_iconic.txt
# 期望：f7436bb9335b9b136f62da969588b7841d8accd33316fee57267c9f9aa1d3387
```

> 页面内容会变；上面的哈希对应 2026-11-14 的抓取结果。若哈希不一致，说明页面已更新，finding 需要重新核对。
