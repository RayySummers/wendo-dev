# 马耳他（MT）规则库 v0.1 — 页面样例（规则 → finding）

测试日期：2026-11-17 ｜ 规则版本：`rules.v0.1.json`（52 条）

## 测试页面

| # | URL | 抓取时间 (UTC) | 页面大小 | HTML SHA-256 |
| --- | --- | --- | --- | --- |
| P1 | https://www.homemate.com.mt/product/melchioni-dora-air-fryer-8-l-1800-w-with-ai-function-24-programs-black | 2026-11-17 07:49:19 | 455,807 | `b3c8fe4e64cef46e696a22f2b8b268bc0396b86ad18a54f318d8af4399c8d1fd` |
| P2 | https://www.homemate.com.mt/product/ninja-af110eu-air-fryer-black | 2026-11-17 07:49:18 | 451,579 | `bbd631b3a0506e41a8fcf2b5b1e1e401d902bfe1cd2605fa2ddb103cf9aad420` |

选择理由：马耳他本地家电零售商的真实商品页，品类落在本库范围内（小家电），同时覆盖「有折扣」与「无折扣」两种价格呈现。页面为纯英文，可用于验证语言义务的「英语即合规」判断。

抓取方式：`curl -sSL -A 'Mozilla/5.0 …'` 取服务端 HTML，用 BeautifulSoup 去脚本/样式后取可见文本。**未执行 JavaScript**，动态注入的 cookie 同意层不在快照内。

## 页面可见事实

**P1（Melchioni Dora 8L 空气炸锅）**

- 标题：`Melchioni Dora Air Fryer 8 L 1800 W With Ai Function & 24 Programs Black`；`Code: 118340048`
- 价格：`RRP: €199.00` / `Discounted Price: €129.00`
- 描述含 `The AI food recognition and soft steam functions guarantee you impeccable dishes.`
- 规格：8L、1,800 W、220–240 V AC 50–60 Hz、24 个预设程序
- 页脚：门店地址（Mriehel / The Point / Shoreline / Zejtun / Mosta）、电话 `+356 2326 2xxx`、邮箱；链接 `Delivery Information`、`Privacy Statement`、`Terms & Conditions`
- **未见**：含税说明、运费金额、制造商邮政/电子地址、欧盟负责人、安全警示/说明书、CE/DoC 信息、能效标签

**P2（Ninja AF110EU 空气炸锅）**

- `Code: AF110EU`；`RRP: €125.00`（无折扣价）
- 描述含 `Up to 75% less fat*`（脚注解释为与传统油炸手切薯条对比）
- `This product was purchased 3 times in the last month!`
- 门店库存：`Limited Stock: 6 Available`（Mosta）
- 页脚同 P1；同样未见含税说明、运费金额、制造商地址、欧盟负责人、安全信息

## 规则 → finding

| 规则 | 页面观察 | decision_level | confidence | 结论 |
| --- | --- | --- | --- | --- |
| MT-PRC-04 降价须标先前价格 | P1 以 `RRP: €199.00` 对应 `Discounted Price: €129.00`，未说明该 RRP 是否为交易者自己在降价前 ≥30 天的最低售价，也未给期间 | rule_level | high | **finding（高）**：降价公告未按 reg. 5A(1) 指明「先前价格」；以 RRP 代替不满足 |
| MT-PRC-05 先前价格的 30 天口径 | 同上 | rule_level | high | **finding（高）**：需价格台账核实 €199 是否为 30 天内最低价；页面本身未提供 |
| MT-ADV-03 价格优势陈述 | P1 的 €199 → €129 差额 35%，是本页最强的促购点 | rule_level | medium | **finding（中）**：与 MT-PRC-04/05 同源，合并为一条「折扣依据待证」 |
| MT-ADV-02 商品主要特征 | P1 `guarantee you impeccable dishes`；P2 `Up to 75% less fat*` | substantiation | high | **finding（需证明）**：`guarantee` 属绝对化承诺，`75% less fat` 有脚注但未给测试机构/报告编号 |
| MT-PRC-07 市场状况信息 | P2 `purchased 3 times in the last month!` | substantiation | medium | **finding（需证明）**：需订单数据；3 次的数据量本身不构成「热销」误导，但需可核实 |
| MT-LBL-10 GPSR Art. 19 线上报价四项 | P1/P2 均只有品牌名（Melchioni / Ninja）与型号，**无制造商邮政/电子地址、无欧盟负责人、无安全警示** | rule_level | high | **finding（高）**：线上报价缺 (a)(b)(d) 三项；这是本样例最明确的硬缺口 |
| MT-ECOM-01 信息语言 | 两页均为英文 | rule_level | high | **pass**：英语是马耳他官方语言之一，满足 reg. 5(1) |
| MT-ECOM-02 经营者身份/地址/电话/邮箱 | 页脚有 5 家门店地址、电话、邮箱 | rule_level | high | **pass（站点层）**：商品页本身无，但页脚全站可见；报告应写「站点层满足，商品页未重复展示」 |
| MT-ECOM-03 含税总价 + 全部运费 | 两页均无含税说明、无运费金额，仅 `Delivery Information` 链接 | rule_level | medium | **待核实**：若结算页在下单前给出含税总价与运费，则满足；单看商品页无法定性 |
| MT-PRC-03 配送费须明确 | 同上 | rule_level | medium | **待核实**：与 MT-ECOM-03 合并 |
| MT-LBL-01 型号/批次标识 | P1 `118340048`、P2 `AF110EU` | rule_level | high | **pass（页面层）**：可识别型号已给出 |
| MT-LBL-06/07 产品本体上的制造商信息 | 页面无 | — | — | **不作为 finding**：义务对象是产品/包装/随附文件，页面缺失不能推断违规（见「误报」） |
| MT-CERT-01 CE + DoC | 页面文本无 CE/DoC 信息 | — | — | **待核实**：义务对象是产品与随附文件；页面无 ≠ 未认证 |
| MT-LBL-11 通用充电器标签 | 空气炸锅不是无线电设备 | — | — | **不适用**：规则不触发（见「误报」） |
| MT-ADV-08 虚假限时/限量 | P2 `Limited Stock: 6 Available` 是门店库存状态，不是「限时促销」 | substantiation | — | **不构成 finding**：语境为库存提示，非稀缺性营销（见「误报」） |
| MT-ADV-09 「免费」 | 页面文本仅在导航 `Fridges & Freezers` 中出现 `free` | — | — | **不构成 finding**：子串误命中（见「误报」） |
| MT-PRV-05 Cookie 同意 | 服务端 HTML 仅引用 `cookie.js`，无同意层 | — | — | **无法评估**：需浏览器实测同意前是否已设置非必要 Cookie（见「漏报」） |

## 误报 / 漏报记录

**误报 1：`free` 命中导航 `Fridges & Freezers`。**
`MT-ADV-09` 的 `claim_pattern` 含 `free`，朴素子串匹配会命中商品分类名。集成时必须做词边界 + 排除导航/页脚/分类树，或只对主内容区（product title / description / price block）匹配。

**误报 2：`safe` 命中导航 `Safety Wear & Tool Belts`。**
`MT-ADV-01`、`MT-CERT-05` 的 `safe/safety` 触发词同理。这是本库 `README` 中「`iron` 不应命中 `environment`」提醒的实例。

**误报 3：`Limited Stock` 被判为虚假限量。**
P2 的 `Limited Stock: 6 Available` 是门店库存提示，不是「限时促销」。`MT-ADV-08` 需要判断语境：只有与倒计时、`today only`、`ends soon` 等共同出现时才升级为 finding。

**误报 4：把「页面未展示制造商地址」判为 LVD/GPSR 违规。**
`MT-LBL-02/03/06/07` 的义务对象是产品本体/包装/随附文件。页面缺失只能写「页面未展示，需向商家核实」，不能推断未标注。本样例把这类观察统一降级为「待核实」。

**漏报 1：Cookie 同意层。**
`MT-PRV-05` 需要观察「同意前是否已写入非必要 Cookie」。服务端 HTML 无法判断，必须用浏览器抓网络请求。当前样例对该规则**没有结论**，不是「合规」。

**漏报 2：说明书/安全信息的实际语言。**
页面是英文，但 `MT-LBL-04/05/08/12` 判断的是随附说明书语言。本样例无法取得包装内文件，相关规则**未评估**。

**漏报 3：能效标签。**
空气炸锅不在能效标签品类内，但页面未提供任何「是否属受管制品类」的信号。若换成电视或空调，`MT-LBL-*` 需要能效标签规则（v0.2 补）。

## 对集成的启示

1. **匹配范围要限制在主内容区。** 导航、分类树、页脚的文本必须先剔除，否则 `free`/`safe`/`limited` 会稳定误报。
2. **区分「页面义务」与「产品义务」。** 只有 `MT-ADV-*`、`MT-PRC-*`、`MT-ECOM-*`、`MT-LBL-10` 是页面可判的；`MT-LBL-01~09`、`MT-CERT-*` 需要实物/文件。
3. **价格类规则要接价格历史。** 没有历史数据时，`MT-PRC-04/05` 只能输出「需商家提供价格记录」，不能输出「折扣违规」。
4. **语言规则的默认结论是 pass。** 马耳他接受英语，语言项不应成为高频 finding；真正的语言风险在说明书与标签（需实物）。
5. **本样例的 6 条 finding 中，3 条（MT-PRC-04/05、MT-LBL-10）是 rule_level 可直接进报告；2 条（MT-ADV-02、MT-PRC-07）只能写「需证明」；1 条（MT-ADV-03）与价格规则合并。** 与 `MARKET_READINESS.md` 的接入建议一致。
