# 埃及 v0.1 — 真实页面「规则 → finding」样例

核验日期：**2026-11-17**。共 2 个真实页面，均为在埃及销售小家电的品牌官网英文页；抓取静态 HTML 并用正文抽取，未做浏览器渲染/截图。
页面会随促销、投放与 A/B 测试变化；本文件记录的是抓取时快照，不代表当前页面。

- 页面 A：Tefal Egypt — ACTIFRY ADVANCE 1.2KG FZ727
  `https://www.tefal.com.eg/en/COOKING-APPLIANCES/LOW-FAT-FRYERS/ACTIFRY-ADVANCE-1-2KG-FZ727/p/1510001883`
- 页面 B：Midea Egypt — 4 Litres Air Fryer MF-TN40D2
  `https://www.midea.com/eg/small-cooking-appliances/air-fryer/air-fryer-mechanical.mf-tn40d2`

> 本样例只演示「规则如何落到 finding」，不是对商家的合规评价；所有 finding 均为**页面级观察 + 需核实项**，不输出定性结论。

---

## 1. 页面 A：Tefal FZ727（英文页，跳转第三方购买）

### 抓取到的关键原文

| 位置 | 原文 |
| --- | --- |
| 主标题 | `Tefal Actifry Adcance: The crispiest results*` |
| 脚注 | `*The crispiest compared to 700g of frozen fries cooked in other Tefal Air fryers. 99% Less Added fat : Cooking of 1kg of fresh fries at 55% weight loss with 1,4cl of oil vs traditional deep frying with 2L` |
| 导航 | `15Y Repairability` |
| 保修 | `Warranty` / `View the product warranty conditions`（页面无 2 年保修文字） |
| 价格 | 仅 `recommended Price` / `This price is the price recommended by Tefal to distributors`，无具体金额 |
| 页脚 | `Privacy Policy`、`Legal terms`、`Cookies`、`Groupe Seb`；无埃及地址/注册号/税号 |
| 语言 | 页面为英文；站内有 `العربية` 切换 |

### 规则 → finding

| # | 规则 | 页面观察 | finding（报告可写） | decision_level | 风险 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | EG-LANG-01（CPA Art. 5） | 当前 URL 内容为英文；站内有阿语切换，但本页未提供阿语正文 | 「页面以英文呈现商品信息，未提供本页阿语版本；站内存在阿语站点，需核实同一商品信息是否有完整阿语版本（价格、规格、警示、保修条款）。」 | rule_level | 中 | 不能仅凭 `lang="en"` 判为不符合；需确认该页是否面向埃及消费者投放。`review_required` |
| A2 | EG-ADV-01（CPA Art. 9） | `The crispiest results*` 为最高级比较声称；脚注把比较对象限定为「其他 Tefal 空气炸锅」 | 「存在最高级比较声称；脚注提供了比较基准，但基准仅限同品牌产品，消费者可能理解为市场范围最强。需提供比较测试报告，并人工判断整体印象。」 | human_review | 中低 | 脚注存在，不能写成「无依据」；也不能写成「已合规」。`review_required` |
| A3 | EG-ADV-02 / EG-ADV-04（CPA Art. 9(2)(8)） | `99% Less Added fat` 附方法学脚注（1kg 鲜薯、55% 失水、1.4cl 油 vs 2L 油炸）；未给测试机构/报告编号 | 「减脂 99% 的声称有方法学脚注，但未展示测试机构、报告编号与适用型号；需补充 substantiation。」 | substantiation | 低 | 属于「需要证明」，不是「虚假」。 |
| A4 | EG-LABEL-01（CPA Art. 4） | 页面无埃及进口商/责任方名称、地址、商业注册号、税号；无 `Country of Origin` | 「页面未展示埃及进口商/责任方、地址、注册数据与原产地；请向商家核实。页面未展示不等于未提供。」 | substantiation | 中 | 只能写「未展示/需核实」，不能推断未注册或未标注。 |
| A5 | EG-WARR-02（CPA Art. 22） | 页面只有 `View the product warranty conditions` 链接，无 2 年保修文字 | 「页面未展示保修期。根据第 22 条，耐用商品自收货起至少 2 年保修；请提供保修卡/条款核实。」 | rule_level | 低 | 不能把「未写 2 年」直接写成「保修不足 2 年」。 |
| A6 | EG-PRICE-01（CPA Art. 7） | 无具体售价；仅 `recommended Price` 说明 | 不适用：品牌展示页，非向消费者发出的销售要约；无价格可核对。 | — | — | **误报点**：若引擎把「无价格」判为未含税标价，会误报。 |
| A7 | EG-ECOM-01/02（CPA Art. 37/40） | 无购物车/结算；`Where to buy online` 跳转第三方 | 不适用：本页不构成远程缔约流程。 | — | — | **误报点**：品牌站「Where to buy」不应触发电商披露/14 天撤销权。 |
| A8 | EG-IMP-01（Decree 43/2016） | 页面无 GOEIC 登记号 | 不作 finding：登记是进口放行条件，页面不展示不能证明未登记；需向进口商核实 HS 归类与登记号。 | — | — | **误报点**：不能因页面无登记号写「未登记」。 |
| A9 | EG-3C-01（Telecom Law Art. 48） | 空气炸锅，无联网/无线功能 | 不适用。 | — | — | 正确排除。 |

**页面 A 小结**：4 条可进报告的 finding（A1 中、A2 中低、A3 低、A4 中、A5 低），4 条不适用/需排除（A6-A9）。核心风险是**语言版本**与**进口商/原产地披露**，不是广告绝对化用语。

---

## 2. 页面 B：Midea MF-TN40D2（英文页，无结算）

### 抓取到的关键原文

| 位置 | 原文 |
| --- | --- |
| 规格 | `Total Capacity (L) | 4 L`、`Heating Watts(W) | 1500 W`、`Net Weight (Kg) | 4.3 KG` |
| 原产地 | `Country Of Origin | Made in Egypt` |
| 保修 | `Warranty | General Warranty | 2 Years full warranty` |
| 卖点 | `Dual Cyclone Rapid Air Technology`、`Optimized air convection to deliver the signature crispy.`、`Precise Temperature Control`、`Safety` |
| 页脚 | `Privacy Policy`、`Cookie Consent`、`Terms of Use`、`Copyright 2026 Copyright Midea`；无埃及地址/注册号 |
| 语言 | 页面为英文；站内有 `العربية` 切换 |

### 规则 → finding

| # | 规则 | 页面观察 | finding（报告可写） | decision_level | 风险 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | EG-WARR-02（CPA Art. 22） | 明示 `2 Years full warranty` | 未发现保修期低于法定下限；无需 finding。 | — | — | 真阴性：2 年与第 22 条下限一致。 |
| B2 | EG-LABEL-01（CPA Art. 4） | 已披露 `Made in Egypt`、容量、功率、净重；未披露埃及法律实体/注册号 | 「原产地与主要规格已披露；埃及法律实体、地址与注册数据未展示，需核实。」 | substantiation | 低 | 部分满足；不能因缺注册号写「未披露全部关键数据」。 |
| B3 | EG-IMP-01（Decree 43/2016） | `Made in Egypt` | 不适用：本 SKU 为埃及本地生产，进口登记不适用；但仍须符合 EOS 标准与 CPA 标签义务。 | — | — | **误报点**：`made in` 触发词不应把本地生产判为进口登记问题。 |
| B4 | EG-ADV-01（CPA Art. 9） | `Dual Cyclone Rapid Air Technology`、`Precise Temperature Control`、`Safety` 为技术/功能描述，无绝对化比较 | 未发现需要 substantiation 的绝对化声称；无需 finding。 | — | — | 真阴性：技术名词不等于误导。 |
| B5 | EG-LANG-01（CPA Art. 5） | 当前 URL 为英文；站内有阿语切换 | 同 A1：「需核实同一商品信息是否有完整阿语版本」。 | rule_level | 中 | 不能仅凭英文页判为不符合。 |
| B6 | EG-PRICE-01（CPA Art. 7） | 无价格/结算 | 不适用。 | — | — | 误报点同 A6。 |
| B7 | PDPL（EG-PRIV-02/03） | 页脚有 `Privacy Policy`、`Cookie Consent`；未查看政策正文与同意机制 | 「存在隐私政策与 Cookie 同意入口；需核实告知语言、目的说明、同意是否预勾选、是否可撤回。」 | rule_level | 中 | 只写「需核实」，不因链接存在判为满足。 |

**页面 B 小结**：2 条可进报告（B2 低、B5 中、B7 中），2 条真阴性（B1、B4），3 条不适用（B3、B6 等）。说明同一套规则在不同页面上会得到不同结果，**不能按品类一刀切**。

---

## 3. 误报（false positives）记录

| # | 触发方式 | 为什么会误报 | 处理 |
| --- | --- | --- | --- |
| FP1 | `lang="en"` 或页面无阿语 → 直接判 EG-LANG-01 不符合 | 站内可能有完整阿语版本；第 5 条适用于「面向消费者的广告/数据」，B2B/导出目录可能不落入 | 先查同商品阿语 URL/语言切换；报告写「需核实」，不写定性 |
| FP2 | 页面无价格 → 判 EG-PRICE-01 未含税标价 | 品牌展示页不是销售要约；价格可能在第三方平台 | 仅当页面有「加入购物车/立即购买/结算」时启用价格规则 |
| FP3 | 页面有 `Where to buy` → 判 EG-ECOM-01/02 | 远程合同规则适用于通过互联网缔约的流程，跳转第三方不等同 | 检查是否有结算/订单确认；无则 N/A |
| FP4 | 页面无 GOEIC 登记号 → 判「未登记」 | 登记是进口放行条件，页面通常不展示；本地生产不适用 | 只写「页面未展示，需向进口商核实」；`made in Egypt` 时排除 |
| FP5 | 页面无认证标志 → 判「未认证」 | 认证信息常在包装/说明书；页面不展示不能证明 | 只写「页面未展示认证信息，需核实」 |
| FP6 | `Warranty` 链接存在但无 2 年文字 → 判「保修不足」 | 链接可能指向完整条款 | 区分「未展示」与「低于法定下限」；只有明示 1 年/6 个月才写低于下限 |
| FP7 | `guaranteed` / `best` 出现 → 判第 9 条违反 | 第 9 条看整体印象与限定语；有脚注/比较基准时可能不构成误导 | 归入 human_review/substantiation，不自动定性 |
| FP8 | PDPL 规则与 CPA 第 5 条同时触发 → 重复计风险 | PDPL 管同意/营销，CPA 管语言/披露；同一页面可能两条都相关，但风险点不同 | 报告合并叙述，避免同一问题计两次高风险 |
| FP9 | 页面出现 `sale` → `le ` 子串命中 EG-PRICE-01 | `le ` 是 `sale`、`available` 等词的子串，不是价格表述 | 已把 `le ` 改为 `l.e.`；引擎仍应做词边界匹配 |
| FP10 | 空气炸锅页面出现 `smart` → 命中 EG-3C-01 型号核准 | `smart` 可出现在 `smart timer`、`smart look` 等非联网语境；品类也不对 | 已把 `smart` 收窄为 `smart home`、`smart app`；3C 规则须先过品类/无线功能判定 |
| FP11 | 页面标题 `Air Fryers best prices in Egypt` → 命中 EG-ADV-01 | `best prices` 是价格比较声称，应走价格/ substantiation 判断，不是第 9 条整体误导 | 报告写「价格比较声称，需证明比较基准」，不写「虚假宣传」 |

---

## 4. 漏报（false negatives）记录

| # | 页面原文 | 为什么当前规则会漏 | 建议 |
| --- | --- | --- | --- |
| FN1 | `The crispiest results*` | `claim_pattern` 未收录 `crispiest`/`crispier`/`most crispy`；ADV-01 只收 `best `、`perfect` 等 | v0.2 增加比较级/最高级词干：`crispiest`、`crispier`、`-est results`、`most ` |
| FN2 | `99% Less Added fat` | 未收录 `% less`、`less fat`、`fat reduction`；`100%` 不命中 `99%` | 增加 `% less`、`less fat`、`reduced fat`、`up to` |
| FN3 | `15Y Repairability` | 无「可维修性/寿命」规则；`15Y` 也不在模式中 | 新增 substantiation 规则（耐用性/可维修性声称），或并入 ADV-02 并加 `repairability`、`15y`、`lifetime` |
| FN4 | `Optimized air convection to deliver the signature crispy` | 主观效果描述，无绝对化词；不属于可规则化文本 | 不强行加规则；留给 human_review 的整体印象判断 |
| FN5 | 阿语站点可能存在，但只抓了英文 URL | 爬虫只取一个 URL，未发现 `hreflang="ar"` 对应页 | 抓取时解析 `hreflang`/语言切换，合并同商品多语言页 |

---

## 5. 对本库的校准结论

1. **语言规则必须看「同商品阿语版本」，不能看单页 `lang`**：两页都有 `العربية` 切换，直接判不符合会误报；但也不能因此判为满足，需核实阿语页是否覆盖价格、规格、警示、保修与合同条款。
2. **广告规则要区分「有脚注的比较声称」与「无依据的绝对化声称」**：Tefal 的 `crispiest` 有脚注但比较基准窄，属于 human_review；`99% Less Added fat` 有方法学，属于 substantiation。两者都不应写成「虚假宣传」。
3. **准入规则要按 HS/品类开关**：空气炸锅属 Decree 43/2016 第 17 类（进口时），但 Midea 的 `Made in Egypt` 不适用进口登记；TRA 型号核准只对电信设备强制。规则必须在报告里带「适用性判断」，否则会大面积误报。
4. **页面缺失只能写「未展示」**：进口商、注册号、原产地、认证标志、保修条款都属于此类；这是本库与「页面可观察事实」的边界。
5. **PDPL 只能提示、不能定性**：无官方英文版本，且同意机制/政策正文不在静态 HTML 中；报告应写「需核实同意记录与告知语言」，并标注需当地律师复核。

---

## 6. 复现方式

```bash
curl -sSL --max-time 45 -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' \
  'https://www.tefal.com.eg/en/COOKING-APPLIANCES/LOW-FAT-FRYERS/ACTIFRY-ADVANCE-1-2KG-FZ727/p/1510001883' \
  -o tefal-fz727-en.html
sha256sum tefal-fz727-en.html
# cca085b394e010b181edbdd37461e67a18e48759910eb92499f4981054a9abb7
```

页面内容会变；哈希只对应 2026-11-17 的快照。若重新抓取哈希不同，以新快照重跑本样例，不要沿用旧 finding。
