# 文莱法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。全部主来源在该日从 `agc.gov.bn`（文莱总检察署）或 `aiti.gov.bn`（AITI）取回并计算 SHA-256。
规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 本地 PDF 仅作研究缓存，未提交进仓库（20+ MB）。复现方式见文末「复现与校验」。
> 只收**官方英文原文**。文莱的 Laws of Brunei 以英文公布；马来语版本只用于交叉核对，未作为引文来源。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_agc_lom` | 文莱总检察署 BruLaw 门户（`agc.gov.bn/documents/...`）发布的 Laws of Brunei 合并本 PDF | 是 |
| `official_gazette` | `agc.gov.bn` 上的政府宪报（Government Gazette）PDF，含 S 编号命令/条例 | 是 |
| `official_regulator` | AITI 官网的监管指引页 | 是（仅支撑 `article_type: guideline`） |
| `gazette_scan_ocr` | 官方 PDF，但内嵌文本层有断行/边注/OCR 破损；引文经 300dpi 渲染 + Tesseract OCR + 人工比对印刷页 | 是（已逐条标注） |
| `secondary` | 律所文章、商业数据库、NGO 页面 | 否，仅作线索 |

## 主来源

| ID | 法规/文件 | 版本/页数 | 官方 URL | 本地缓存文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S1 | Consumer Protection (Fair Trading) Act (Chapter 261) | Revised Edition 2023（B.L.R.O. 5/2023），25 页；S 64/2011，经 S 52/2015 修订 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-261-2023-ED-CONSUMER-PROTECTION-FAIR-TRADING-ACT.pdf | `CAP-261-2023-ED-CONSUMER-PROTECTION-FAIR-TRADING-ACT.pdf` | `7535fa20c98b2f0aae3efd29abe2be32dce0a89a06778bec05e093c5a7392002` |
| S2 | Consumer Protection (Fair Trading) (Amendment) Order, 2015 (S 52/2015) | 宪报 2015-10-21，2 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-52-2015-CONSUMER-PROTECTION-FAIR-TRADING-AMENDMENT-ORDER-2015.pdf | `S-52-2015-CONSUMER-PROTECTION-FAIR-TRADING-AMENDMENT-ORDER-2015.pdf` | `dc1259d760d533286c924c4bda386e7cdf576f5fda22ff981c5f908421a413a7` |
| S3 | Consumer Protection (Fair Trading) (Cancellation of Contracts) Regulations (Cap. 261, Rg 1) | Revised Edition 2023，15 页 | https://www.agc.gov.bn//wp-content/uploads/2026/07/CAP-261-RG-1-2023-ED-CONSUMER-PROTECTION-FAIR-TRADING-CANCELLATION-OF-CONTRACTS-REGULATIONS.pdf | `CAP-261-RG-1-2023-CANCELLATION.pdf` | `84f8ab9dc56699d0ee406fb901f67f288e0083dcf2eac66a89ec3b0787b532aa` |
| S4 | Consumer Protection (Fair Trading) (Opt-Out Practices) Regulations (Cap. 261, Rg 2) | Revised Edition 2023，9 页 | https://www.agc.gov.bn//wp-content/uploads/2026/07/CAP-261-RG-2-203-ED-OPT-OUT-PRACTICES-REGULATIONS.pdf | `CAP-261-RG-2-2023-OPT-OUT.pdf` | `77fe2ee984acd807a15eae9d16597b428e561c2ff7b7707e6fe74b3055bef55a` |
| S5 | Price Control Act (Chapter 142) | Revised Edition 2023（B.L.R.O. 1/2023），16 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-142-2023-ED-PRICE-CONTROL-ACT.pdf | `CAP-142-2023-ED-PRICE-CONTROL-ACT.pdf` | `921edae856d1495ece0e626f5d9c13e3bc8513abce2207b26d31e8b4acdf83ce` |
| S6 | Price Control (Display of Prices) Order (Cap. 142, O 1) | S 70/1978，Revised Edition 2014，6 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-142-O-1-2014-ED-PRICE-CONTROL-DISPLAY-OF-PRICES-ORDER.pdf | `CAP-142-O-1-2014-ED-PRICE-CONTROL-DISPLAY-OF-PRICES-ORDER.pdf` | `f9162e0f7669c78e0a57c78a1e6051436a1aa948b14f96690bde324d77eacdef` |
| S7 | Price Control (Controlled Articles) Order (Cap. 142, O 4) | Revised Edition 2014，6 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-142-O-4-2014-ED-PRICE-CONTROL-CONTROLLED-ARTICLES-ORDER.pdf | `CAP-142-O-4-2014-ED-PRICE-CONTROL-CONTROLLED-ARTICLES-ORDER.pdf` | `7477b7d4567f75d1c942929ad545efc2764a6b771ec9f6a235d7c1192bfa8e9d` |
| S8 | Weights and Measures Act (Chapter 151) | Revised Edition 2014，30 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-151-2014-ED-WEIGHTS-AND-MEASURES-ACT.pdf | `CAP-151-2014-ED-WEIGHTS-AND-MEASURES-ACT.pdf` | `2ed752ef729ca52e2b1aed3a19f2c6ea2adea6d58afee8f03f90f38f54505547` |
| S9 | Weights and Measures (Verification) Regulations (Cap. 151, Rg 1) | Revised Edition 2014，6 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-151-RG-1-2014-ED-WEIGHTS-AND-MEASURES-VERIFICATION-REGULATIONS.pdf | `CAP-151-RG-1-2014-ED-WEIGHTS-AND-MEASURES-VERIFICATION-REGULATIONS.pdf` | `bbc9ec1b6b21a141b60af9bbeea6c369c3c97b85dc34b2dc3e5bc3cdb9d1751e` |
| S10 | Energy Efficiency (Standards and Labelling) Act (Chapter 233) | Revised Edition 2026（B.L.R.O. 1/2026），26 页；2023-01-14 生效（S 39/2023） | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-233-2026-ED-ENERGY-EFFICIENCY-STANDARDS-AND-LABELLING-ACT.pdf | `CAP-233-2026-ED-ENERGY-EFFICIENCY-STANDARDS-AND-LABELLING-ACT.pdf` | `072ed94649cbf83f84384ea02f6397d5f1dcf7c168e63e0fe91ef5cca55e974c` |
| S11 | Energy Efficiency (Minimum Energy Efficiency Standards and Energy Labelling) Regulations, 2023 (S 37/2023) | 宪报 2023-09-21，11 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-37-2023-E-ENERGY-EFFICIENCY-MINIMUM-ENERGY-STANDARDS-AND-ENERGY-LABELLING-REGULATIONS-2023.pdf | `S-37-2023-E-ENERGY-EFFICIENCY-MINIMUM-ENERGY-STANDARDS-AND-ENERGY-LABELLING-REGULATIONS-2023.pdf` | `20587b6e510e8c6dc0460b81fea891195437859ee86a254ad2cf353b53f321a0` |
| S12 | Energy Efficiency (Standards and Labelling) (Registrable Goods) Order, 2023 (S 38/2023) | 宪报 2023-09-21，3 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-38-2023-E-ENERGY-EFFICIENCY-STANDARDS-AND-LABELLING-REGISTRABLE-GOODS-ORDER-2023.pdf | `S-38-2023-E-ENERGY-EFFICIENCY-STANDARDS-AND-LABELLING-REGISTRABLE-GOODS-ORDER-2023.pdf` | `51a132ce4b4e1d645159c6ef487a84d166f5f743d673b90bab86d00f5309cfbd` |
| S13 | Telecommunications Order, 2001 (S 38/2001) | 宪报 2001-05-30，50 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-38-2001-TELECOMMUNICATIONS-ORDER-2001.pdf | `S-38-2001-TELECOMMUNICATIONS-ORDER-2001.pdf` | `7d0802eef11dc3f9475bdfc4a9598e804e0c85a09a0388c63fca7e203f61b0bd` |
| S14 | Telecommunications (Radio-communication) Regulations, 2013 (S 86/2013) | 宪报 2013，52 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-86-2013-TELECOMMUNICATIONS-RADIO-COMMUNICATION-REGULATIONS-2013.pdf | `S-86-2013-TELECOMMUNICATIONS-RADIO-COMMUNICATION-REGULATIONS-2013.pdf` | `6deb2b53440697a2eb3bac1c6c6bfe822168d50904c98545a84c0345e539d571` |
| S15 | AITI — Dealer Type Approval（监管指引页） | 抓取日 2026-11-17 | https://www.aiti.gov.bn/equipment-importation/dealer-type-approval/ | `aiti_dta.html`（正文抽取：`aiti_dta.txt`） | HTML `5030c269c52529e973d400e4dd418a9e34aa834db2c9e087968e737a4794399c`；正文 `97771d281ea7614872f1495ba8a9f6f6863537c428296ebb9f2cde1a077b0827` |
| S16 | Personal Data Protection Order, 2025 (S 1/2025) | 宪报 2025-01-08，86 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-1-2025-E-PERSONAL-DATA-PROTECTION-ORDER-2025.pdf | `S-1-2025-E-PERSONAL-DATA-PROTECTION-ORDER-2025.pdf` | `c3856d74f64f8a1516e5acf6bc215432b3f6ef5dac652e19c77a2c355631f008` |
| S17 | Personal Data Protection Order, 2025 — Notification of Commencement (S 10/2025) | 宪报 2025-03-22，1 页；指定 2025-01-08 生效的 Parts 1、2、10（除 s.42）、11、12 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-10-2025-PERSONAL-DATA-PROTECTION-ORDER-2025-NOTIFICATION-OF-COMMENCEMENT-1.pdf | `S-10-2025-PDPO-COMMENCEMENT.pdf` | `a2d5d35a1291290e8e970949a8a84cfad26b77c7d1f296b65f7f06e376d0d220` |
| S18 | Personal Data Protection Order, 2025 — Notification of Commencement (S 11/2025) | 1 页；指定 **2026-01-01** 生效的 Parts 3-9、s.42、Schedules 1-5 | https://www.agc.gov.bn/wp-content/uploads/2026/07/S-11-2025-PERSONAL-DATA-PROTECTION-ORDER-2025-NOTIFICATION-OF-COMMENCEMENT-1.pdf | `S-11-2025-PDPO-COMMENCEMENT.pdf` | `8009a48a90a6e3782827934bc176954a582dff52622f0079ab99bbe658be8770` |
| S19 | Merchandise Marks Act (Chapter 96) | Revised Edition 1984（B.L.R.O. 1/1984），22 页；1953-10-07 生效 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-96-1984-MERCHANDISE-MARKS-ACT.pdf | `CAP-96-1984-MERCHANDISE-MARKS-ACT.pdf` | `1dd7e169b127ed12e4205960e9df3ddb13a1812f48e43314804b07c930b1721f` |
| S20 | Sale of Goods Act (Chapter 170) | Revised Edition 1999（B.L.R.O. 1/1999），34 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-170-1999-ED-SALE-OF-GOODS-ACT.pdf | `CAP-170-1999-ED-SALE-OF-GOODS-ACT.pdf` | `438dd7e9f248ceedd54545785e5ccde257977c8b3cbc5fe6ca58d28689ae4110` |
| S21 | Unfair Contract Terms Act (Chapter 171) | Revised Edition 1999（B.L.R.O. 1/1999），18 页 | https://www.agc.gov.bn/wp-content/uploads/2026/07/CAP-171-1999-ED-UNFAIR-CONTRACT-TERMS.pdf | `CAP-171-1999-ED-UNFAIR-CONTRACT-TERMS.pdf` | `bf9ba2f3acad022f1910488524a15873ca64fec55f38cb8896de866f12139734` |

### 已核阅、未支撑任何 `verbatim_excerpt` 的来源

| ID | 文件 | 核阅目的 | SHA-256 |
| --- | --- | --- | --- |
| S22 | Halal Certificate and Halal Label Order, 2005 (S 39/2005) | 确认 Halal Label 仅指向「food」，因此非食品 halal 声明无专门规则（README open question 10） | `de2453298b24aef5760ff9ad4b12e1ec19681af99f928932dee94f79665163ba` |
| S23 | Electricity Act (Chapter 223) | 确认该法规范电力装置/持牌人，未设通用家电上市前安全认证（README open question 4） | `8f259ec5e309cfda690e538dbc02242f2262817a0ae392d3e7e413e829b96bb2` |
| S24 | Electronic Transactions Act (Chapter 196) | 确认其为电子记录/签名效力法，未设电商信息披露义务 | `9c68bce9da7d79551084f90c92db1c7a2f5a73209e1cc2565f2d02a6693f749d` |
| S25 | AITI — Equipment Search（已注册设备数据库页） | 确认可按品牌/型号检索 Equipment Registration；数据库自 2000 年起收录，但「未检索到」不等于未批准 | 页面无稳定静态正文，未计算哈希 |
| S26 | AGC BruLaw — 法规索引页（A-Z，352 条） | 用于穷举候选法规，确认无独立的「消费者保护（安全要求）令」或「电商披露条例」 | `agc_index/laws.json` = `6834308c00df9b8f95a9fbc9202956feec0cd79e37e89282bbbfee08ff2c1de4` |
| S27 | Consumer Protection (Fair Trading) Order, 2011 (S 64/2011) 原始文本 | 与 S1 的 2023 合并本逐句交叉核对 s.4、Sch. 2 para. 1/20 | `65a655832c2c4243dfe1f5c62a1d7f2ad70074e6a390acba741f6fbd238c567f` |
| S28 | AITI — Advisory Guidelines on Equipment Importation and Type Approval（PDF，effective 2019-12-13，835,135 B）<br>`https://aiti.gov.bn/media/5lghh4op/agonequipmentimportationtypeapproval_final.pdf` | 确认 DTA 的进口许可费豁免范围（Sch.3、footnote 3）与 §5.2.4 Implicit Import Permit 的类别规则 | `df3f4adb0ead2a653c03314ab346df835cefbe74d50d534ebac7af862cd2f04c` |

## OCR / 文本层说明（`gazette_scan_ocr`）

以下 4 条规则的引文不能直接从 PDF 文本层抽取（文本层把页眉、边注插入句中，或把单词断开），已用 300dpi 灰度渲染 + Tesseract（`--psm 3`）OCR，并逐字比对印刷页：

| 规则 | 来源页 | OCR 文件 | SHA-256 | 处理 |
| --- | --- | --- | --- | --- |
| BN-GDS-01 | S20 p.13 | `ocr/soga_p13.txt` | `499b7905c61ca936a581bbd5b1eaa59f72fd18369ce9aa477abaac62c2bf97dd` | 文本层在句中插入页眉「LAWS OF BRUNEI / Sale of Goods / CAP. 170」，OCR 后句子连续 |
| BN-GDS-02 | S21 p.8 | `ocr/ucta_p8.txt` + `ocr/ucta_p8_corrected.txt` | `87fd4c78e7cd16a976267b9b04a0767f3f8f3a6579df5c293222e06c508ca7ae` / `e0fa01db960dd9a2fe887fc634701dc2ef055c6c0431ef1ce43f403348c59f34` | 原文本层把 `liability` 断成 `liabilit`+换行，OCR 后仍缺尾字母；人工按版面补 1 个 `y`，生成 `_corrected` 文件 |
| BN-GDS-03 | S19 p.12 | `ocr/mm_p12.txt` | `89da8f1a514990f8036e78fec02b2414b0132e6b1db4a8d20b307f3070c46ea8` | 文本层把左边注「Application of false trade description is an offence」插入 s.20 句中 |
| BN-GDS-04 | S19 p.12 | `ocr/mm_p12.txt` | 同上 | 同页 s.21 正文 |

补充 OCR 文件（仅用于核对定义，未直接支撑引文）：`ocr/mm_p5.txt`（`ec69c4fd...`）、`ocr/mm_p6.txt`（`a772a18e...`）。

## 交叉核对记录

1. **Cap. 261**：S1（2023 合并本）与 S27（S 64/2011 原始命令）逐句比对 s.4(a)(b)、Sch. 2 para. 1、para. 20，三处措辞完全一致；S2（S 52/2015）只修改 Sch. 1，删除原第 2 段，未触及 s.4 与 Sch. 2。确认 S1 可作为现行文本。另核对 s.15（出版商免责）、s.17（歧义不利于供应商解释）、s.18（举证责任）、s.6(6)（$10,000 上限）。
2. **Cap. 261 的罚则结构**：对 S1 全文检索 `fine`、`imprison`、`offence`，命中数为 **0**，确认本法为纯民事框架；这一结论直接影响报告措辞（不能说「将被罚款」）。
3. **Price Control**：S5 s.5 与 S6 para. 2(1) 的义务表述一致（Controller 可命令零售商标价 / 附表商品须以价格标签标价）；S6 附表第 4 项确认覆盖「Electrical appliances of all kinds and spare parts therefor」；S7 附表确认受管制商品仅为米、糖、面粉、婴儿奶粉、炼乳、烟、汽油，**不含电器**，因此电器不适用最高限价，只适用标价义务。
4. **Weights and Measures**：S8 核对 s.6(1) 但书（允许 pound/kati 直至部长命令）、s.7（净重）、s.9（预包装，须有 s.8 命令）、s.13(1)(b)、s.13(2)、s.17（一般罚则）。本次**未检索到** s.8 命令，故 s.9 未单列规则。
5. **Energy Efficiency**：S10 核对 s.6（部长可指定 registrable goods）、s.7、s.8(1)、s.19(1)(2)、s.20(1)、s.29（一般罚则）；S12 附表第 1 项确认仅空调三类，均以 7.1 kW 为上限；S11 的文本层有系统性括号损坏（`(` → `!` 或 `{`），未直接引用。Sch.4 MEPS 已转录：Casement/window、Split（非变频）、Split（变频）三类均为 COP ≥ 2.90；文本层把 `≥` 渲染成 `?`（`COP?: 2.90`），以 450dpi 渲染 + 视觉复核确认。
6. **Telecommunications**：S13 核对 s.9(1)（使用前批准）、s.52（未获批准设备的断开通知）、s.68（一般罚则 $10,000／3 年）；S14 未设设备型式批准条款，故 3C 规则全部落在 S13 与 S15。S15（AITI 指引）核对 DTA 的「品牌 + 型号」评估、DTA 先于 Dealer Import Permit 的顺序。
7. **PDPO**：S16 核对 s.3（适用范围/豁免）、s.8（同意）、s.9（文莱电话号码直邮）、s.17(2)（目的告知与联系人）、s.24(1)（跨境转移）、s.37（财务罚款上限）；S17 确认 Parts 1、2、10（除 s.42）、11、12 自 2025-01-08 生效；S18 确认 **Parts 3-9 自 2026-01-01 生效**——因此 BN-PRV-01…05 的 `effective_date` 均为 2026-01-01，而非宪报日 2025-01-08。
8. **Merchandise Marks**：S19 文本层破损，s.2 定义、s.20、s.21 以 300dpi OCR 核对（p5/p6/p12）；确认「trade description」包含原产国、制造方法、材质，且 s.20 的刑责可及于「causes any false description to be applied」。
9. **Sale of Goods / UCTA**：S20 s.15(1) 与 S21 s.8(2) 以 OCR 核对；确认 UCTA s.8(2) 只保护「dealing as consumer」，且不可排除的是 SoGA ss.15-17 的默示责任。
10. **Halal**：S22 s.9 的 Halal Label 定义指向「such food」，故不适用于小家电/家居/3C；非食品 halal 声明只能回到 CPFT（open question 10）。
11. **Electricity**：S23 目录与条文确认该法规范发电、输电、供电、装置与持牌人，未设电器产品上市前认证；这是一个「未发现」结论，不等于「确定不存在」（open question 4）。
12. **Electronic Transactions**：S24 核对 s.6（电子记录法律承认）、s.9（留存），确认无消费者信息披露条款，故未建规则。

## 未取得 / 不可用来源

| 目标 | 状态 | 影响 |
| --- | --- | --- |
| 文莱通用家电安全认证（CoA / Safety Mark 类） | `not_found`（AGC 法规库 + AITI + 能效主管机关范围内） | 不能写「未认证即违规」；只能写「页面未展示认证信息，需向商家核实」。需向 DES/MOFE 书面确认 |
| WMA s.8 命令（指定只按重量/计量出售的商品） | `not_found` | s.9 预包装净重义务未单列 |
| 终止 pound/kati 过渡的部长命令 | `not_found` | 英制标示只能提示核实（BN-QTY-03 标 human_review） |
| PDPO s.24 的「prescribed requirements」配套条例 | `not_yet_published`（检索范围：PDPO Sch.1–6 均不含跨境；AITI pdp 门户 7 份 guidance 均为模板） | BN-PRV-05 标 human_review，不能判跨境转移是否合规 |
| S 37/2023 附表 4 的 MEPS 数值 | **已解决（2026-11-18）**：三类空调均为 COP ≥ 2.90，见「交叉核对记录」第 5 条 | 可按 COP ≥ 2.90 判断某型号是否达到 MEPS 门槛 |
| AITI 设备豁免清单 | **进口许可费**豁免清单已取得（S28：Sch.3 共 17 类 + footnote 3 仅蓝牙 SRD + §5.2.4 Implicit Import Permit）；**全量 DTA 豁免清单未单独公布** | 可判哪些设备免「进口许可费」；「哪些设备整体免 DTA」仍只能按 §5.2.4 的类别规则判断，不能给全量清单 |
| 文莱电商披露条例（对应马来西亚 ETT 2024） | `not_found` | 线上 listing 的卖家身份/地址披露无专门规则 |
| CPFT 附表 1(c) 与标价令/能效法的优先关系 | `unverified`（需律师） | 影响能否用 CPFT 处理价格/能效问题 |

## 复现与校验

在空目录中执行：

```bash
BASE="https://www.agc.gov.bn/wp-content/uploads/2026/07"
curl -sL "$BASE/CAP-261-2023-ED-CONSUMER-PROTECTION-FAIR-TRADING-ACT.pdf" -o cap261.pdf
curl -sL "$BASE/CAP-142-2023-ED-PRICE-CONTROL-ACT.pdf" -o pca.pdf
curl -sL "$BASE/CAP-142-O-1-2014-ED-PRICE-CONTROL-DISPLAY-OF-PRICES-ORDER.pdf" -o pdo.pdf
curl -sL "$BASE/CAP-151-2014-ED-WEIGHTS-AND-MEASURES-ACT.pdf" -o wma.pdf
curl -sL "$BASE/CAP-233-2026-ED-ENERGY-EFFICIENCY-STANDARDS-AND-LABELLING-ACT.pdf" -o ee.pdf
curl -sL "$BASE/S-38-2023-E-ENERGY-EFFICIENCY-STANDARDS-AND-LABELLING-REGISTRABLE-GOODS-ORDER-2023.pdf" -o eeg.pdf
curl -sL "$BASE/S-38-2001-TELECOMMUNICATIONS-ORDER-2001.pdf" -o tel.pdf
curl -sL "$BASE/S-1-2025-E-PERSONAL-DATA-PROTECTION-ORDER-2025.pdf" -o pdpo.pdf
curl -sL "$BASE/S-11-2025-PERSONAL-DATA-PROTECTION-ORDER-2025-NOTIFICATION-OF-COMMENCEMENT-1.pdf" -o s11.pdf
curl -sL "$BASE/CAP-96-1984-MERCHANDISE-MARKS-ACT.pdf" -o mm.pdf
curl -sL "$BASE/CAP-170-1999-ED-SALE-OF-GOODS-ACT.pdf" -o soga.pdf
curl -sL "$BASE/CAP-171-1999-ED-UNFAIR-CONTRACT-TERMS.pdf" -o ucta.pdf
sha256sum *.pdf
```

预期哈希与上表一致（2026-11-17 实测）。若 AGC 重新上传文件导致哈希变化，需在 `SOURCES.md` 记录新版本并重跑规则核对，不得直接替换。

**复核结果（2026-11-17 16:05 UTC+8）**：对全部 27 个 PDF（含 S22-S27）重新下载并逐一比对，**27/27 SHA-256 一致，0 处不一致**。

> AITI 站点对 `HEAD` 请求返回 500、对 `GET` 返回 200（站点行为，不是页面失效）；S15 的哈希基于 2026-11-17 的 GET 抓取，页面为动态 CMS，后续复核可能变化。

### 引文核对脚本（本库维护者使用）

```bash
python3 - <<'PY'
import json, re
def norm(s):
    s = s.replace('\u2019',"'").replace('\u201c','"').replace('\u201d','"')
    s = s.replace('\u2013','-').replace('\u2014','-')
    return re.sub(r'\s+',' ',s).strip()
rules = json.load(open('agent/knowledge/legal/bn/rules.v0.1.json'))['rules']
text = norm(open('cap261.txt').read())   # 按 source_id 切换对应文本
miss = [r['id'] for r in rules if r['source_id']=='S1' and norm(r['verbatim_excerpt']) not in text]
print('misses:', miss)
PY
```

## 辅助来源（仅作线索，未支撑引文）

| 用途 | 来源 |
| --- | --- |
| 确认 PDPO 的生效节奏与「sunrise period」表述 | AITI PDP 新闻稿：https://pdp.aiti.gov.bn/news-events-and-surveys/news/dfce-2025-cultivating-trust-and-accountability-in-personal-data-handling/ |
| 确认 PDPO 对境外组织的适用理解 | DLA Piper Data Protection Guide — Brunei：https://www.dlapiperdataprotection.com/index.html?c=BN |
| 确认 PDPO Parts 3-9 自 2026-01-01 生效的二手记录 | DataGuidance：https://www.dataguidance.com/news/brunei-darussalam-minister-publishes-personal-data |
| AITI 设备注册数据库说明 | https://www.aiti.gov.bn/equipment-importation/equipment-search/ |

以上仅用于交叉理解，未用于任何 `verbatim_excerpt` 或 `official_url`。
