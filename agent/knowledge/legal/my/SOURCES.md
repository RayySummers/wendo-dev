# 马来西亚法条规则库 v0.1 — 来源清单

核验日期：2026-11-14（主来源均在该日重新取回并计算 SHA-256；S10 为按条合并摘录，复核方式见文末）。
规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 2026-11-14 范围修正：只收**官方英文原文或官方英文译本**。PDPA 与 Halal 令已改用官方英文文本；马来文公报仅作交叉核对，不再作为 `verbatim_excerpt` 的来源。
>
> **2026-11-14 定稿复核（RAY-689）**：发现 v0.1b 使用的 CP(ETT) Regs 2012（P.U.(A) 458/2012）已被 **CP(ETT) Regs 2024（P.U.(A) 449/2024）第 10 条废止**，2024-12-25 生效。MY-ECOM-01…05 已整体替换为 2024 年条例的 8 条规则（含新增的马来语披露义务与平台义务）；2012 年文本降为历史核对来源，不再支撑任何 `verbatim_excerpt`。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_agc` | 马来西亚总检察署（AGC）法律在线（LOM）发布的法例 PDF | 是 |
| `official_regulator` | 监管机关官网发布的法例/指引 PDF（ST、MOH、PDP） | 是 |
| `official_english_text_wto_notification` | 马来西亚政府提交 WTO TBT 通知所附的官方英文文本 | 是（英文原文，非二手翻译） |
| `gazette_scan` / `gazette_scan_state_gov` | 联邦公报（Warta Kerajaan）扫描件，托管在政府域名；用于交叉核对 | 仅交叉核对 |
| `secondary` | 商业法律数据库、律所文章、NGO 页面 | 否，仅作线索 |

## 主来源

| ID | 法规 | 版本/页码 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S1 | Consumer Protection Act 1999 (Act 599) | AGC LOM，2022-03-18 印刷版，137 页 | https://lom.agc.gov.my/ilims/upload/portal/akta/outputaktap/1690994_BI/011121_Act%20599_final.pdf | `act599_agc.pdf` | `d644972b1d305a5c2b3a998f630e5055bf5443e6199b4028f0384ffcc01e3cbb` |
| S2 | Trade Descriptions Act 2011 (Act 730) | AGC LOM，截至 2022-01-11，58 页 | https://lom.agc.gov.my/ilims/upload/portal/akta/outputaktap/1721260_BI/Act%20730_final%20as%20at%2011%20January%202022.pdf | `act730_agc.pdf` | `df64c1715096dd96c7dda6324e1e5119218db8606044f96e4d4126655b495b14` |
| S3 | Consumer Protection (Electronic Trade Transaction) Regulations 2024 (P.U.(A) 449/2024) | AGC 联邦公报 2024-12-24，11 页；马来文与英文对照，英文文本在第 7-11 页 | https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/2587477/PUA%20449%20(2024).pdf | `pua449_2024.pdf` | `997101e0b8de0b35f896db09780bd2a40a9ec46f62b3f153af871d575291dd22` |
| S4 | Electricity Regulations 1994 (P.U.(A) 38/1994)，含至 P.U.(A) 151/2013 等修订 | ST 官网合并版，222 页 | https://www.st.gov.my/sites/default/files/2026-02/Electricity-Regulations-1994.pdf | `electricity_regs_1994.pdf` | `8578728eddaf08993c136145b8df3571b3e19215c5f877eac8119940a416409c` |
| S5 | Trade Descriptions (Certification and Marking of Halal) Order 2011 (P.U.(A) 431/2011) | 马来西亚政府 WTO TBT 通知附件，英文，2012-12-21，16 页 | https://members.wto.org/crnattachments/2012/TBT/MYS/12_1573_01_x.pdf | `halal_order_en_wto.pdf` | `a65672db6ff402ac56e22d0e973e1bf3aa7e881727fcb27bf985d040ebbe9599` |
| S6 | Personal Data Protection Act 2010 (Act 709)，2026 年英文重印本（含 Act A1727 修订） | PDP 官网，英文，102 页 | https://www.pdp.gov.my/wp-content/uploads/2026/10/Akta-709-cetakan-semula-2026-BI.pdf | `act709_en.pdf` | `765d4a480248f9dcfc6ee0387e1d2df3a55ecf110b6a9c781be06bc8e6fdcfea` |
| S7 | Food Regulations 1985 (P.U.(A) 437/1985)，更新至 2026-08（P.U.(A) 48/2026） | MOH FSQ 官网，英文，165 页 | https://hq.moh.gov.my/fsq/xs/dl.php?filename=Food+Regulation+1985+Updated+August+2026+PU+A+48-2026_1.pdf | `food_regs_1985.pdf` | `3eaccf7e2a26564b8bbfee182cbcbc486c0c4526510fa6fe2b5f8b31bb7d45e6` |
| S8 | Trade Descriptions (Certification and Marking of Halal) (Amendment) Order 2023 (P.U.(A) 288/2023) | AGC LOM，英文，43 页 | https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/1863283/PUA288_2023.pdf | `halal_amend_2023.pdf` | `bbbd028e2ba20d49acf94f5a592a8fe604a7d53b2e7a9369edfe05c607a6e733` |
| S9 | Communications and Multimedia Act 1998 (Act 588) | MCMC 托管英文重印本（含 A1220/2004），2006 年版，约 300 页 | https://www.mcmc.gov.my/skmmgovmy/media/General/pdf/Act588bi_1.pdf | `act588_mcmc.pdf` | `7ffd7d255e0aa3398c9b00ec5355afc0da0a87f1245eeb2464ccd04e135ae554` |
| S10 | Communications and Multimedia (Technical Standards) Regulations 2000 (P.U.(A) 124/2000) | MCMC 官网法例页（按条分页，含 P.U.(A) 89/2001、261/2001 修订），取回 reg.14/16/17/22 全文 | https://www.mcmc.gov.my/en/commons/viewdetail?docid=1008（reg.14: docid=1022；reg.16: 1024；reg.17: 1025；reg.22: 1030） | `tsr2000_regs_excerpt.txt` | `55682f275b780fdedb79ccb10faae2a73ceb90d908f466ca7976aa9dab9141aa` |
| S11 | Guidelines for Online Shopping Platform, Merchant and Consumer in Electronic Commerce for Communications Equipment（MCMC，2025-07-31） | MCMC 官网 PDF，25 页 | https://www.mcmc.gov.my/skmmgovmy/media/General/pdf2/Guidelines-for-Online-Shopping-Platform-Merchant-and-Consumer-in-Electronic-Commerce-for-Communications-Equipment.pdf | `mcmc_ecommerce_guideline_2025.pdf` | `fc1ec83ba5dc27051964fec7daee11a2b8af0ca5856fcf65640e161c484aca76` |
| S12 | Guide to MCMC Label（MCMC 消费者手册） | MCMC 官网 PDF，含 MCMC label 说明与罚则表述 | https://www.mcmc.gov.my/skmmgovmy/media/General/pdf/Guide-to-MCMC-Label-Handbook.pdf | `guide_mcmc_label.pdf` | `b6e86b117691def231bb667f92071482796848ae69628e089212136f8d689fec` |

### 已废止 / 仅作历史核对

| ID | 法规 | 状态 | URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S3-old | Consumer Protection (Electronic Trade Transactions) Regulations 2012 (P.U.(A) 458/2012) | **已废止**：被 P.U.(A) 449/2024 reg.10 废止，2024-12-25 生效；仅用于对比 2012 → 2024 的变化 | https://aseanconsumer.org/file/post_image/Consumer%20Protection%20(Electronic%20Trade%20Transactions)%20Regulations%202012.pdf | `ett_regs_2012.pdf` | `1df74166a9e32639b32f6382287b17c12afb82f06a3eb7f02cb07b1c209789e8` |

> 2012 年文本托管在东盟消费者网站（非政府域名），v0.1b 曾把它标为 `gazette_scan`。定稿复核后不再使用：2024 年条例有 AGC 官方 PDF，且英文文本与马来文同页对照。

### 交叉核对来源（不直接支撑 `verbatim_excerpt`）

| 文件 | 用途 | URL |
| --- | --- | --- |
| Halal Order 2011 马来文公报扫描件 | 与 S5 英文文本交叉核对条号与结构 | https://jheains.ns.gov.my/images/download/Perintah-Perihal-Dagangan--Perakuan--Penandaan-Halal-2011.pdf |
| PDPA 2010 马来文重印本 | 与 S6 英文文本交叉核对 s.7、s.12A | https://www.pdp.gov.my/wp-content/uploads/2026/10/Akta-709-cetakan-semula-2026-BM.pdf |
| Food Act 1983 (Act 281) | 核对食品条例的上位法与罚则结构（s.15-17、s.34） | https://hq.moh.gov.my/fsq/xs/dl.php?filename=Food+Act+1983.pdf |
| Halal Order 2011 修正令 2026 (P.U.(A) 294/2026) | 核对附表二外国认证机构名单更新（2026-08-21 生效） | https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/3669286/PUA%20294%20(2026).pdf |
| ST FAQ: How do I apply for a CoA? | 核对 CoA 申请流程与 ST-SIRIM 标签的实务说法 | https://www.st.gov.my/how-do-i-apply-certificate-approval-coa |
| ST FAQ: equipment requiring CoA | 核对受管制设备类别（家电、低压设备） | https://www.st.gov.my/what-are-categories-and-types-equipment-require-certificate-approval-coa |
| PDPA 指引（7 项原则） | 交叉核对 s.7 告知内容 | https://www.pdp.gov.my/jpdpv2/wp-content/uploads/2023/04/7-PRINSIP-PERLINDUNGAN-DATA-PERIBADI-WEB.pdf |
| MCMC 通讯设备认证标签页 | 核对「认证后须带 MCMC label」与标签核验方式 | https://mcmc.gov.my/en/communications-equipment/certification-label |
| MCMC FAQ：消费者使用未认证设备的罚则 | 核对 reg.16 罚则上限（RM300,000／3 年） | https://www.mcmc.gov.my/en/sectors/broadcasting/faqs/communications-equipment-certification/penalties/wi-l-l-consumers-be-penal-ised-i-f-they-buy-an |
| mylaw.my: CMA 1998 s.239 转录 | 与 S9 逐句比对 s.239 措辞（仅作线索，未作为引文来源） | https://mylaw.my/legislation/akta-komunikasi-dan-multimedia-1998/section-239 |
| P.U.(B) 61/2025：Act A1743 生效日公告 | 确认《Communications and Multimedia (Amendment) Act 2025》自 2025-02-11 生效（s.92、s.112 除外）；SHA-256 `d96e8c72db30b42658231294c1e0a5e9c072ae7ab6321e6018e7f3973bae3b0b` | https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/2685090/PUB%2061.pdf |

## 交叉核对记录

1. **Act 599**：AGC LOM PDF（S1）与 KPDN MySafe 的 "as at 1 November 2019" 版本逐条比对 s.9、s.10、s.12、s.13、s.14、s.15、s.18、s.20、s.21、s.25，措辞一致；采用 AGC 版本（无第三方水印）。
2. **Act 730**：AGC LOM PDF（S2）核对 s.5、s.6、s.7、s.10、s.14、s.15、s.16、s.18、s.19、s.21、s.26、s.29；s.26/s.29 确认为"授权部长制定命令"，不是自动生效的禁止条款。
3. **ETT Regulations**：S3 为 AGC 官方 PDF（P.U.(A) 449/2024），马来文与英文同页对照；对照英马两版 reg.1-11、Schedule 1-10：条号一致；逐句核对 reg.3、reg.4、reg.6、reg.7、reg.9、reg.10 与附表 1-10 的英文措辞，未发现歧义；英文文本可直接抽取，未依赖 OCR。已确认 reg.10 明文废止 P.U.(A) 458/2012；2024 年条例自 2024-12-25 生效。与 2012 年文本的关键差异：义务主体改为 `online marketplace supplier`、附表 8 项 → 10 项（新增营业/广告地址、安全与健康证书）、新增 reg.4 国语披露、新增 reg.7 平台运营者义务、记录保存 3 年。另检索到 Skrine（2025-06）与 One Asia（2025-08）的二手解读，摘要均确认 2012 年条例被取代、reg.4 国语要求；仅作线索，未作为引文来源。
4. **Electricity Regulations 1994**：S4 为 ST 合并版；reg.97、97C、97D、97E、98、122 与 ST 2023 年报中"Regulation 97(1) 要求 CoA，涵盖制造、进口、展示、销售或广告"的表述一致。
5. **Halal Order 2011**：英文引文取自 S5（马来西亚政府 WTO TBT 通知附件，含 2012 年修订后的 "food and goods" 措辞），并与马来文公报扫描件逐条核对条号与结构。para.5(2) 的 2023 年 "and logo" 修订以 S8 为准。
6. **PDPA 2010**：S6 为 PDP 官网 2026 年英文重印本；核对 s.5(2)、s.7、s.12A 及英马两版一致性。Act A1727 的生效表：2025-01-01 / 2025-04-01 / 2025-06-01。
7. **Food Regulations 1985**：S7 为 MOH FSQ 更新至 2026-08 的英文版；核对 reg.10、reg.27、reg.28、reg.397。
8. **CMA 1998**：S9 为 MCMC 托管的英文重印本；核对了 s.16（条例可订明最高 RM300,000／3 年罚则）、s.239、s.242（一般罚则 RM100,000／2 年）。s.239(1)(c) 措辞与 mylaw.my 的 LOM 转录一致；该转录仅用于比对，未作为 `official_url`。S9 是 2006 年版（含 A1220/2004），**未含** Act A1743（2025-02-11 生效）的修订，s.239 罚则是否变动未核 → MY-3C-04 标 `confidence: medium`。
9. **TSR 2000**：S10 取回 reg.14/16/17/22 的 MCMC 法例页原文；与 S11 指南 5.1 逐条引述比对：reg.14、reg.16(1)(a)-(c)、reg.17(1)、reg.22(1)(a) 措辞一致。**差异**：S11 指南 5.1.2 引述的 reg.16(1)(d)「未附认证标志」与 4.12 的 RM300,000／3 年罚则，在 S10 的官网合并文本中均不存在 → 已在 MY-3C-02 的 `penalty_or_note` 与 README open question #9 标注，报告不引用单一罚则数字。
10. **MCMC label**：S12 与 S11 4.4-4.5 一致（MCMC logo + SLP ID；实体贴标/镭雕/印刷或 e-label）；S12 文本称罚则为「RM100,000 或监禁六个月」，与 S11／FAQ 的 RM300,000／3 年不一致，属手册未更新 → 以 S11 与 FAQ 为准并保留差异记录。

## SHA-256 可复现记录（2026-11-14 定稿复核）

重新下载全部主来源并逐项比对，结果与上表一致：

| ID | 重新下载结果 | 备注 |
| --- | --- | --- |
| S1 | `d644972b…c01e3cbb` ✅ | AGC PDF |
| S2 | `df64c171…5b495b14` ✅ | AGC PDF |
| S3 | `997101e0…5291dd22` ✅ | 2024 年条例；本次新取回 |
| S4 | `8578728e…a416409c` ✅ | ST 合并版 |
| S5 | `a65672db…ebbe9599` ✅ | WTO TBT 通知附件 |
| S6 | `765d4a48…8e6fdcfea` ✅ | PDP 英文重印本 |
| S7 | `3eaccf7e…7d45e6` ✅ | MOH FSQ 2026-08 版 |
| S8 | `bbbd028e…c607a6e733` ✅ | AGC P.U.(A) 288/2023 |
| S9 | `7ffd7d25…e135ae554` ✅ | MCMC 托管；首次 403，加浏览器 UA 后 200 |
| S11 | `fc1ec83b…484aca76` ✅ | 同上 |
| S12 | `b6e86b11…8d689fec` ✅ | 同上 |

S10 不是单一下载文件，而是 MCMC 法例页 `docid=1022/1024/1025/1030` 四页 reg.14/16/17/22 的合并摘录；`tsr2000_regs_excerpt.txt` 的 SHA-256 `55682f27…ab9141aa` 只对应这份手工合并文本。复核方式是重新抓取四页并逐条比对，而不是重算合并文件的哈希。

复现命令：

```bash
curl -sSL --max-time 90 -A 'Mozilla/5.0' -o pua449_2024.pdf \
  'https://lom.agc.gov.my/ilims/upload/portal/akta/outputp/2587477/PUA%20449%20(2024).pdf'
sha256sum pua449_2024.pdf
```

## 未能取得 / 未采用的官方来源

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| KPDN 官网（www.kpdn.gov.my、mysafe.kpdn.gov.my） | 本环境 TLS 连接被重置（`SSL_ERROR_SYSCALL`），HTTPS/HTTP、TLS 1.2 均失败 | 改用 AGC 官方公报（S3，ETT 2024）与 WTO 通知英文文本（S5）；规则文本可核对，但 `official_url` 不是 KPDN 直链 |
| AGC LOM 的 act-detail / subsid 页面 | 页面依赖动态 token 与加密 JSON，无法稳定取得 P.U.(A) 直链 | 采用已知的 AGC `outputaktap`/`outputp` PDF 直链；未取得的 P.U.(A) 以公报扫描件/WTO 通知替代 |
| AGC LOM 的 Act 588（CMA 1998）全文 | LOM 直链未定位；改用 MCMC 托管的英文重印本（S9） | S9 为 2006 年版，未含 Act A1743（2025）修订；s.239 罚则需按最新版复核（MY-3C-04 confidence=medium） |
| Act A1743《Communications and Multimedia (Amendment) Act 2025》合并文本 | 未取得 AGC 直链；仅从公报 P.U.(B) 61/2025 确认 2025-02-11 生效（s.92、s.112 除外） | 无法确认 s.239 罚则是否被改动；已在 README open question #6 登记 |
| 联邦公报门户 efederalgazette.agc.gov.my | DNS/连接失败 | 无影响，主要公报已由 AGC PDF 覆盖 |
| mylaw.my / lawplayer.com / Malaysian Bar 文章 | 商业数据库/二手解读 | 仅用于定位条文与交叉核对，未作为规则来源 |

## 复核方法（下次更新时照做）

1. 重新下载上表 PDF，计算 SHA-256；若与表中不一致，说明法规已更新，需重跑受影响的规则。
2. 先看 `effective_date` 与 `last_verified`，再核对修正令（P.U.(A)）是否改变了条文编号或措辞。
3. Halal 附表二、PDPA 的 DPO/泄露通知、ST 的管制设备清单属于高频变动项，优先复核。
4. 新市场只收官方英文原文或官方英文译本；无英文官方版本的条目标 `official_english_unavailable`，不得用二手翻译冒充法条。
5. 任何新规则必须同时具备：官方 URL、条文号、短引原文、`last_verified`；缺一不可。
