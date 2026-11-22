# 加拿大 · 广告/消费者保护/商品说明/认证/隐私 规则库 v0.1

> 支撑 RAY-684（合规与风险 Layer 4）与 RAY-685（法条研究总纲）。
> 对应子单：RAY-765（加拿大，RAY-695 backlog → v0.1）。本目录是该子单的 v0.1 交付。
> 本目录只做官方英文来源收集与结构化，不构成法律意见；不输出定性结论，页面缺失信息只写「页面未展示，需向商家核实」。

- 版本：`2026-11-18-v0.1`
- 规则数：**68 条**（广告/宣称 13、包装标签与商品说明 8、消费品安全 7、电气与能效准入 10、隐私 7、商业电子讯息 6、省级消费者保护/电商披露 14、魁北克法语标注 3）
- 覆盖法规族：**16 个**（Competition Act、CPLA、CPL Regulations、Weights and Measures Act、CCPSA、Radiocommunication Act、ISED RSS-Gen、Energy Efficiency Regulations 2016、BC Electrical Safety Regulation、Ontario O. Reg. 164/99、PIPEDA、CASL、Ontario CPA 2002、O. Reg. 17/05、BC BPCPA、Quebec Charter of the French Language）
- 全部规则带：官方 URL、条文号、英文短引、`effective_date`、`last_verified`、证据要求；**68/68 条引文已逐条回查官方文本，0 处不匹配**（`ca/verify_excerpts.py --sources …`）
- 文件：`rules.v0.1.json`、`SOURCES.md`、`SAMPLE_FINDINGS.md`、`verify_excerpts.py`、本文件

---

## Executive Summary

1. **加拿大是 25 国里唯一的联邦制法域**：广告与消费者保护、包装标签、无线设备、隐私是**联邦法**；消费者合同披露与电气安全是**省法**。每条规则带 `jurisdiction`（`federal`/`provincial`）+ `jurisdiction_note`；同一页面的同一表述可同时落入联邦与省两层，两层并行、互不排除——这是本库与其它单法域市场最大的结构差异。
2. **虚假/误导表述有两套并行的法源**：联邦《竞争法》Part VII.1（s.74.01(1)(a)，民事「可审查行为」）与 s.52(1)（刑事「明知或轻率」）是主轴；安大略省 CPA 2002 s.14、BC BPCPA s.4/s.5 是省法版本。省法**不要求证明主观故意、不要求证明有人被欺骗**，门槛更低；BC 甚至把举证责任倒置给供应商（s.5(2)）。
3. **「CUL/CSA 认证」不是联邦法要求**：加拿大没有联邦层面的电气认证法；带认证标志的义务来自**省级电气安全法**（BC Reg. 100/2004 s.21(1) 必须带认证标志才能在 BC 要约销售/展示；安大略通过 O. Reg. 164/99 采用 CSA C22.1）。省级电气认证是「两套法规并行」最典型的例子——同一台空气炸锅在 BC 和 ON 的义务分别来自两个省的条例，联邦法没有对应条款。
4. **无线设备（Wi-Fi/蓝牙/无线充电）是联邦专属**：Radiocommunication Act s.4(2)（技术验收证书 TAC）+ ISED RSS-Gen s.9.4（标签必须带 `IC:` 认证编号与 HVIN）+ s.9.3.1（说明书通知必须**英法双语**）。说明书双语是本库最容易被中文卖家漏掉的一条。
5. **联邦双语标签是硬要求**：CPL Regulations s.6(2) 要求预包装产品标签上的一切强制信息**以两种官方语言同时标示**（名址可用一种）。加拿大与其它英语市场最大的差别之一是：只印英文标签在联邦层面不合规。
6. **魁北克是单语法语省，本产品不覆盖**：Charter of the French Language s.51（产品铭文须法语）、s.52（目录/宣传册/订单表须法语，无 medium 例外）、s.58（公共标牌与商业广告须法语且显著占优）。这三条以「标注型」条目收录（`CA-QC-01`–`03`，`confidence: medium`、`jurisdiction: provincial`、notes 明写「本产品暂不覆盖」），只用于向客户提示「发往魁北克需另行合规」，**不进入英语市场的常规诊断结论**。
7. **Drip pricing（结账页加价）在加拿大有明文**：Competition Act s.74.01(1.1)（2022 年新增）——因固定强制收费导致标示价无法达成即属误导；例外只有依议会立法征收的金额（GST/HST/PST）。商家自设的「服务费/手续费」不属例外。
8. **省级电商披露比联邦更具体**：安大略 CPA 2002 s.38 + O. Reg. 17/05 s.32 列出互联网协议签订前必须披露的 **14 项信息**（含逐项价格、额外费用如关税/报关费、总价、计价货币、取消/退货/退款权利）；门槛只有 **$50**。BC BPCPA s.18.3 + s.47 + s.48 是对应版本（合同副本 15 日内送达，消费者可在收到副本后 7 日内取消）。
9. **隐私告知靠 PIPEDA，不靠营销短信**：PIPEDA 附表一原则 2/3/7/8 是网站告知义务的核心（确定目的、取得同意、相称的安全措施、政策可访问）；s.10.1 要求重大损害泄露须在「尽快可行」内同时通知个人与隐私专员。跨境营销邮件另受 CASL s.6/11 约束（同意、发送人识别、10 个工作日内执行退订）。
10. **消费品安全有记录义务**：CCPSA s.13(1) 要求制造/进口/销售者为商业目的**准备并保存文件六年**（进口商须在加拿大保存，s.13(3)）；s.14(2) 要求在知悉「事件」后**两日内**向部长提供信息；s.9(b) 禁止对安全认证状态作出虚假表述——中国出口商最常忽略的两条。

---

## 覆盖矩阵

| 法规 | 层级 | 广告/宣称 | 价格/促销 | 标签/披露 | 准入/认证 | 电商披露 | 隐私/营销 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Competition Act（联邦） | federal | §52(1), 74.01(1)(a), (b), (b.1), (c), 74.02, 74.011(4) | 74.01(1.1), 74.01(3), 74.04(2), 74.05 | — | — | — | — |
| Competition Act s.74.03(2)（联邦） | federal | §74.03(2) | — | — | — | — | — |
| Competition Act s.74.1(1)(c)（罚则） | federal | §74.1(1)(c) | — | — | — | — | — |
| Consumer Packaging and Labelling Act | federal | — | — | §5, 7(1), 10(b) | — | — | — |
| CPL Regulations | federal | — | — | §2(1), 6(2), 14(2), 25 | — | — | — |
| Weights and Measures Act | federal | — | — | §7 | — | — | — |
| Canada Consumer Product Safety Act | federal | — | — | §9, 10, 13(1) | — | — | — |
| Canada Consumer Product Safety Act s.14/41 | federal | — | — | §14(1)(c), 14(2) | — | — | — |
| Radiocommunication Act | federal | — | — | — | §4(2), 4(3) | — | — |
| ISED RSS-Gen | federal | — | — | §9.3.1, 9.3.2.1 | §9.4.1, 9.4.4.1 | — | — |
| Energy Efficiency Regulations 2016 | federal | — | — | — | §4(1), 5(1) | — | — |
| BC Electrical Safety Regulation | provincial | — | — | — | §21(1)（BC） | — | — |
| Ontario O. Reg. 164/99 | provincial | — | — | — | §2（ON） | — | — |
| PIPEDA | federal | — | — | — | — | — | §4(1)(a), Sch.1 4.2/4.3/4.4/4.7/4.8, 10.1(3) |
| CASL | federal | — | — | — | — | — | §6(1), 6(2)(a)-(c), 10(1), 11(1), 11(3), 20(4) |
| Ontario CPA 2002 | provincial | §14(1), 14(2)¶14, 17(1) | — | — | — | §38(1) | — |
| Ontario O. Reg. 17/05 | provincial | — | — | — | — | §31, 32 | — |
| BC BPCPA | provincial | §4(1), 4(3)(a)(i), 4(3)(b)(vi), 4(3)(c), 5(1) | §4(3)(c) | — | — | §18.3, 47(2), 48(1) | — |
| BC BPCPA s.190（罚则） | provincial | §190(1)-(2) | — | — | — | — | — |
| Quebec Charter of the French Language | provincial | §58 | — | §51, 52 | — | — | — |

> `CA-PRV-*` 14 条是安大略与 BC 两个省的并行条款；同一页面（如一个面向全国的产品页）**同时**落入联邦 `CA-ADV-02` 与省级 `CA-PRV-01`/`CA-PRV-07`，报告不应只写一层。

---

## 怎么用

字段与 decision_level 口径与 `../README.md` 一致：

- `rule_level`：法条 + 页面原文同时成立时给出规则级判断（如 CPLR s.6(2) 标签未双语、RSS-Gen s.9.4.4.1 标签缺 IC 编号、O. Reg. 17/05 s.32 未披露总价）。
- `substantiation`：性能/环保/测试类声称只能判「需要证明」，不能判真假。
- `human_review`：整体印象是否误导、省法门槛判断、授权/同意的有效性——须人工复核。

### 联邦制（federalism）的读法

1. **同一页面要查两层**：联邦（Competition Act / CCPSA / CPLA / Radiocommunication Act / PIPEDA / CASL）+ 省法（Ontario CPA + O. Reg. 17/05；BC BPCPA）。本库的 `jurisdiction_note` 会写清「该条与哪条省级/联邦条款并行」。
2. **电气认证是省法**：BC（Electrical Safety Regulation s.21(1)）与安大略（O. Reg. 164/99 采用 CSA C22.1）是两个独立制度；联邦没有对应条款。因此一台设备在 BC 和 ON 各有一条独立规则，不要合并成「加拿大认证要求」。
3. **无线设备是联邦**：Radiocommunication Act + ISED RSS-Gen 全国适用，与省法电气认证**叠加**，不是替代。
4. **魁北克是单语省**：`CA-QC-01/02/03` 是**标注型**条目，`jurisdiction: provincial`、`confidence: medium`、`notes` 明写「本产品暂不覆盖魁北克」。**不要**用这 3 条对英语市场页面下结论；也不要反过来以为「只要英文就安全」——联邦双语标签义务（`CA-LAB-04`）在魁北克同样适用。
5. **PIPEDA 只管「商业活动」**：`CA-PRIV-01` 的 `claim_pattern` 为空，属适用性触发；魁北克/BC/阿尔伯塔有实质相似的省级私隐法（s.30(1)），省域内交易可能改由省法管辖——本版未逐省建库（见 known_gaps）。

### 罚则口径

- 竞争法：s.74.1(1)(c) 法人最高 **$10,000,000**（再犯 $15,000,000）或获益 3 倍，无法确定获益时为全球营业额 3%，取高者；个人最高 $750,000（再犯 $1,000,000）。
- CCPSA：s.41(1) 公诉罪最高 **$5,000,000** 或 2 年监禁；s.41(3)（明知/轻率）公诉罪罚金由法院裁量或最高 5 年监禁。
- CPLA：s.20(1) 简易罪最高 **$5,000**；公诉罪最高 $10,000。
- CASL：s.20(4) 个人最高 **$1,000,000**；其他主体最高 $10,000,000。
- 安大略 CPA 2002：s.116(5) 个人最高 **$50,000**；法人最高 $250,000。
- BC BPCPA：s.190 个人最高 **$10,000**；法人最高 $100,000；法院可按违法所得三倍加处罚金。

---

## 不会做的事

- 不对「是否真的违法」下结论；页面缺失信息只写「页面未展示，需向商家核实」。
- 不把魁北克当作英语市场；`CA-QC-*` 只标注、不判定。
- 不把省级电气认证当作联邦义务；不把联邦无线认证当作省法。
- 不用二手数据库/律所文章冒充官方原文（本版未使用任何二手源作引文）。

---

## Open Questions / 未覆盖（与 index.json 的 known_gaps 一致）

1. **魁北克法语义务未覆盖**（`CA-QC-01/02/03` 三条标注型；法语原文引文未取得，实时官方站 403）。
2. **省级电气认证只建 BC 与 ON**：魁北克（Régie du bâtiment）、艾伯塔、马尼托巴、萨斯喀彻温、大西洋各省的电气安全条例未建库。
3. **省级私隐法未建库**：Quebec Law 25（Act respecting the protection of personal information in the private sector）、BC PIPA、Alberta PIPA 未建规则；PIPEDA s.30(1) 的「实质相似」关系未展开。
4. **ISED RSS 标准清单未逐产品映射**：只引用 RSS-Gen 通用条款；Wi-Fi/蓝牙具体应套 RSS-247/RSS-210/RSS-102 哪条未核（RSS 标准全文为 PDF，需另行取件）。
5. **CSA C22.1（安大略电气安全规范引用的标准）未取得**：付费标准，`CA-CERT-10` 只落到 O. Reg. 164/99 s.2 的遵守义务，`confidence: medium`。
6. **Energy Efficiency Regulations 的 energy-using product 清单未逐 SKU 映射**：只建通用义务（s.4/5）；某型号是否属「prescribed product」需逐型号核。
7. **食品接触材料未建规则**：加拿大对食品接触材料的核心依据在 Food and Drugs Act / Safe Food for Canadians Act，本版未取得相关条文引文（与其他市场一致，留到 v0.2）。
8. **促销礼品卡/预付卡、返现与折扣券**：BC BPCPA Part 4.1、安大略相关规定未建库。
9. **Competitive Act 的「Made in Canada / Product of Canada」声称**：属 Competition Bureau 指南而非法条，本版未收录为规则（官方指南可取，但引文需要页面级核验）。
10. **Ontario CPA 2002 已标 repeale（2023, c. 23, Sched. 1, s. 110）**：该法将被新法取代，替换生效日「待省督公告」；建议 v0.2 前重查该状态。

---

## 维护

- 高频变动项：Competition Act（2024 年「漂绿」条款 s.74.01(1)(b.1) 已生效，后续执法口径）、ISED RSS-Gen（Issue 6 + Amendment 1，2026-09-15 生效）、Ontario O. Reg. 17/05（2026-06-10 合并）、BC BPCPA（2026-08-01 生效的新远程销售合同制度）、Energy Efficiency Regulations（2025-10-09 修订）。
- 建议每季度重跑一次 `ca/verify_excerpts.py --sources …`（0 mismatch 为通过）；法规更新时新建版本文件（`rules.v0.1.json` → `rules.v0.2.json`），不要原地覆盖。
- 本库由研究角色维护；接入诊断规则、改报告措辞由产品/工程决定。

---

## 新增市场流程（沿用 `../README.md` 的约定）

- 新增国家的 PR 只提交 `<cc>/rules.v0.1.json`、`README.md`、`SOURCES.md`、`SAMPLE_FINDINGS.md`（外加本国的 `verify_excerpts.py`，可选）；
  `index.json` 与总 `README.md` 由 `python3 agent/knowledge/legal/scripts/sync_index.py` 重建，不要手改。
- 本次落地按 RAY-765 的验收要求在 `index.json` 里补齐 CA 的 `rules_count`/`rules_file`/`coverage`/`known_gaps`/`last_verified`，并把状态从 `backlog` 改为 `v0.1`；其余字段（`laws_count` 等）交给脚本。**`open` 保持 `false`**：规则库落地 ≠ 市场开放，开放由产品/人另行声明。
