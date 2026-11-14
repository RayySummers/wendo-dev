# 马来西亚法条规则库 v0.1 — 来源清单

核验日期：2026-11-14（全部来源均在该日重新取回并计算 SHA-256）。
规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_agc` | 马来西亚总检察署（AGC）法律在线（LOM）发布的法例 PDF | 是 |
| `official_regulator` | 监管机关官网发布的法例/指引 PDF（ST、MOH、PDP） | 是 |
| `gazette_scan` / `gazette_scan_state_gov` | 联邦公报（Warta Kerajaan）扫描件，托管在政府域名；AGC 直链在本环境不可达时使用 | 是，但引文需注明扫描件与 OCR |
| `secondary` | 商业法律数据库、律所文章、NGO 页面 | 否，仅作线索与交叉核对 |

## 主来源

| ID | 法规 | 版本/页码 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S1 | Consumer Protection Act 1999 (Act 599) | AGC LOM，2022-03-18 印刷版，137 页 | https://lom.agc.gov.my/ilims/upload/portal/akta/outputaktap/1690994_BI/011121_Act%20599_final.pdf | `act599_agc.pdf` | `d644972b1d305a5c2b3a998f630e5055bf5443e6199b4028f0384ffcc01e3cbb` |
| S2 | Trade Descriptions Act 2011 (Act 730) | AGC LOM，截至 2022-01-11，58 页 | https://lom.agc.gov.my/ilims/upload/portal/akta/outputaktap/1721260_BI/Act%20730_final%20as%20at%2011%20January%202022.pdf | `act730_agc.pdf` | `df64c1715096dd96c7dda6324e1e5119218db8606044f96e4d4126655b495b14` |
| S3 | Consumer Protection (Electronic Trade Transactions) Regulations 2012 (P.U.(A) 458/2012) | 联邦公报 2012-12-21，7 页 | https://aseanconsumer.org/file/post_image/Consumer%20Protection%20(Electronic%20Trade%20Transactions)%20Regulations%202012.pdf | `ett_regs_2012.pdf` | `1df74166a9e32639b32f6382287b17c12afb82f06a3eb7f02cb07b1c209789e8` |
| S4 | Electricity Regulations 1994 (P.U.(A) 38/1994)，含至 P.U.(A) 151/2013 等修订 | ST 官网合并版，222 页 | https://www.st.gov.my/sites/default/files/2026-02/Electricity-Regulations-1994.pdf | `electricity_regs_1994.pdf` | `8578728eddaf08993c136145b8df3571b3e19215c5f877eac8119940a416409c` |
| S5 | Trade Descriptions (Certification and Marking of Halal) Order 2011 (P.U.(A) 431/2011) | 联邦公报 2011-12-30，9 页（扫描件） | https://jheains.ns.gov.my/images/download/Perintah-Perihal-Dagangan--Perakuan--Penandaan-Halal-2011.pdf | `halal_order_2011.pdf` | `b99ef8b328e0b19c02cb10c96979da0010acd0ef5f8e1e4d8fcfea69bbdb9ef7` |
| S6 | Personal Data Protection Act 2010 (Act 709)，2026 年重印本（含 Act A1727 修订） | PDP 官网，109 页，马来文 | https://www.pdp.gov.my/wp-content/uploads/2026/10/Akta-709-cetakan-semula-2026-BM.pdf | `act709_bm.pdf` | `856844ab5350c1cbb830bde2df4c1f2fd975727ddd29df42df40d36134ebf814` |
| S7 | Food Regulations 1985 (P.U.(A) 437/1985)，更新至 2026-08（P.U.(A) 48/2026） | MOH FSQ 官网，165 页 | https://hq.moh.gov.my/fsq/xs/dl.php?filename=Food+Regulation+1985+Updated+August+2026+PU+A+48-2026_1.pdf | `food_regs_1985.pdf` | `3eaccf7e2a26564b8bbfee182cbcbc486c0c4526510fa6fe2b5f8b31bb7d45e6` |

### 辅助来源（不直接支撑规则）

| 文件 | 用途 | URL |
| --- | --- | --- |
| Food Act 1983 (Act 281) | 核对食品条例的上位法与罚则结构（s.15-17、s.34） | https://hq.moh.gov.my/fsq/xs/dl.php?filename=Food+Act+1983.pdf |
| Halal Order 2011 修正令 2023 (P.U.(A) 288/2023) | 核对 para.5(2) 加入 "and logo" | https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/1863283/PUA288_2023.pdf |
| Halal Order 2011 修正令 2026 (P.U.(A) 294/2026) | 核对附表二外国认证机构名单更新（2026-08-21 生效） | https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/3669286/PUA%20294%20(2026).pdf |
| ST FAQ: How do I apply for a CoA? | 核对 CoA 申请流程与 ST-SIRIM 标签的实务说法 | https://www.st.gov.my/how-do-i-apply-certificate-approval-coa |
| ST FAQ: equipment requiring CoA | 核对受管制设备类别（家电、低压设备） | https://www.st.gov.my/what-are-categories-and-types-equipment-require-certificate-approval-coa |
| PDPA 指引（7 项原则） | 交叉核对 s.7 告知内容 | https://www.pdp.gov.my/jpdpv2/wp-content/uploads/2023/04/7-PRINSIP-PERLINDUNGAN-DATA-PERIBADI-WEB.pdf |

## 交叉核对记录

1. **Act 599**：AGC LOM PDF（S1）与 KPDN MySafe 的 "as at 1 November 2019" 版本逐条比对 s.9、s.10、s.12、s.13、s.14、s.15、s.18、s.20、s.21、s.25，措辞一致；采用 AGC 版本（无第三方水印）。
2. **Act 730**：AGC LOM PDF（S2）核对 s.5、s.6、s.7、s.10、s.14、s.15、s.16、s.18、s.19、s.21、s.26、s.29；s.26/s.29 确认为"授权部长制定命令"，不是自动生效的禁止条款。
3. **ETT Regulations**：S3 为 AGC 联邦公报扫描件；另与 Bank Negara 托管的同一 P.U.(A) 458 文本比对 reg.2-5 与附表 1-8，条款编号一致。S3 的 PDF 文本层可直接抽取，未依赖 OCR。
4. **Electricity Regulations 1994**：S4 为 ST 合并版；reg.97、97C、97D、97E、98、122 与 ST 2023 年报中"Regulation 97(1) 要求 CoA，涵盖制造、进口、展示、销售或广告"的表述一致。
5. **Halal Order 2011**：S5 为公报扫描件，OCR 文本存在拼写噪声（如 "OOlal"、"perihaI"）。引文已与 LOM 文本（mylaw.my 转录，标注 "Official text from Laws of Malaysia Online"）逐句比对；仅采用语义清晰的段落，未采用 OCR 明显错误的字符。2023 年修订（P.U.(A) 288/2023）与 2026 年附表二修订已单独核对。
6. **PDPA 2010**：S6 为 PDP 官网 2026 重印本；核对 s.5(2)、s.7、s.12A、s.12B 及 Act A1727 的生效表（2025-01-01 / 2025-04-01 / 2025-06-01）。
7. **Food Regulations 1985**：S7 为 MOH FSQ 更新至 2026-08 的英文版；核对 reg.10、reg.27、reg.28、reg.397。

## 未能取得 / 未采用的官方来源

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| KPDN 官网（www.kpdn.gov.my、mysafe.kpdn.gov.my） | 本环境 TLS 连接被重置（`SSL_ERROR_SYSCALL`），HTTPS/HTTP、TLS 1.2 均失败 | 改用 AGC 公报扫描件（S3、S5）；不影响规则文本，但 `official_url` 不是 KPDN 直链 |
| AGC LOM 的 act-detail / subsid 页面 | 页面依赖动态 token 与加密 JSON，无法稳定取得 P.U.(A) 直链 | 采用已知的 AGC `outputaktap`/`outputp` PDF 直链；未取得的 P.U.(A) 以公报扫描件替代 |
| MCMC 官网的 Act 588 全文 | 页面只有目录，正文未内嵌；PDF 直链未找到 | 本版未收录 CMA 1998 s.233（见 `README.md` 的 backlog） |
| 联邦公报门户 efederalgazette.agc.gov.my | DNS/连接失败 | 无影响，主要公报已由 AGC PDF 覆盖 |
| mylaw.my / lawplayer.com / Malaysian Bar 文章 | 商业数据库/二手解读 | 仅用于定位条文与交叉核对，未作为规则来源 |

## 复核方法（下次更新时照做）

1. 重新下载上表 PDF，计算 SHA-256；若与表中不一致，说明法规已更新，需重跑受影响的规则。
2. 先看 `effective_date` 与 `last_verified`，再核对修正令（P.U.(A)）是否改变了条文编号或措辞。
3. Halal 附表二、PDPA 的 DPO/泄露通知、ST 的管制设备清单属于高频变动项，优先复核。
4. 任何新规则必须同时具备：官方 URL、条文号、短引原文、`last_verified`；缺一不可。
