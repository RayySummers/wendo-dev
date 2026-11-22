# 卡塔尔（QA）规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文或官方英文译本。卡塔尔的官方语言为阿拉伯语；本库使用的英文文本均来自官方域名（立法门户、部委、监管机关、GSO），并在“译本状态”列标明其官方性。无官方英文版本的条文（2012 年第 68 号执行条例）未编码为规则，列入 `README.md` 的 known gaps。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_legal_portal` | Al Meezan（卡塔尔官方立法门户）发布的英文译本 | 是（须标注译本非官方） |
| `official_regulator` | MOCI / MCIT / CRA / NCSA 官网发布的法规、指南、许可 | 是（指南类标 `guideline`，不能替代法条） |
| `official_regional` | GSO 发布的海湾技术法规（卡塔尔为成员国） | 是（英文本为非官方译本，需标注） |
| `secondary` | 律所文章、贸易促进机构、认证机构说明 | 否，仅作线索（本版未用于引文） |

## 主来源

| ID | 法规 / 文件 | 版本 / 日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 | 译本状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | Law No. 8 of 2008 on Consumer Protection（含 2011 年第 14 号法令修订标记） | 公布于 2008-07-24 官方公报第 7 期；Al Meezan 记录 31 条（含 18 bis） | 113,767 | https://www.almeezan.qa/LawView.aspx?opt&LawID=2647&TYPE=PRINT&language=en | `law8_wb.html` | `220408f75bb52b5fc6cfce217f112fde1eda80ed88e09911af635208db1f8b6e` | 官方门户英文译本；页脚自述 “Please do not consider the material presented above Official” |
| S2 | 同上 + 2012 年第 68 号《执行条例》（阿拉伯文合订本，MOCI 2023-06 出版） | 2023-06 | 2,528,140 | https://www.moci.gov.qa/sites/default/files/2026-06/moci1.pdf | `moci1.pdf` | `789f7fb06f917e01a5885e8f993a92277cfd1b42a6fa0b046f4637552d25e0e9` | 阿拉伯文正本；用于结构与条号交叉核对，未作英文引文 |
| S3 | Decree Law No. 16 of 2010 Promulgating the Electronic Transactions and Commerce Law | 2010-08-19；公报 2010-10-20；77 条 | 234,846 | https://www.mcit.gov.qa/wp-content/uploads/sites/4/2024/06/e-commerce_law_en_1.pdf | `ecommerce_law_wb.pdf` | `9a507049123038c28e7316c0d7bb29bf297669376294c30cb0b2763887322dcf` | MCIT 发布的官方英文 PDF |
| S4 | Law No. 13 of 2016 on Protecting Personal Data Privacy | 签发 2016-11-03；公报 2016 年第 15 期 | 156,504 | https://assurance.ncsa.gov.qa/sites/default/files/library/2022-09/NCSA-NCGAA-Law%20No.%20%2813%29%20of%202016%20%20on%20Protecting%20Personal%20Data%20Privacy%20-%20English.pdf | `pdppl_en.pdf` | `09a08f74c7956ad0c1f2569587894e777eaa94b9ef80b70b61928869dd003d42` | NCSA 官网英文译本；PDF 自述 “This document is not official” |
| S5 | Telecommunications Law No. 34 of 2006（经 2017 年第 17 号法修订） | 签发 2006-11-06 | 173,679 | https://www.cra.gov.qa/-/media/Feature/Publication/CRA_TELECOM_LAW_ENGLISH_Draft_FA.ashx | `CRA_TELECOM_LAW_ENGLISH_Draft_FA.pdf` | `2988a9466dba2a03de3e30412c0d68607659ce8fe073d457eabf2e77040dde6e` | CRA 官网英文版（文件名含 Draft，页面为现行法律参考） |
| S6 | Type Approval Guidelines for RTTE（ICTRA 01/6-2010-TA-Guidelines） | 2011-01-09 | 435,621 | https://www.cra.gov.qa/-/media/System/4/D/8/7/4D87FF06B6B253A79DA525C1299ABA57/2011-01-09-Guidelines-Type-Approval-EN.ashx | `cra_ta_guidelines.pdf` | `eec4ac2e35b92ef95d7d783189feca7ea170eeef141a1410a8b7036d6d6e5afd` | CRA 官网发布的英文指南 |
| S7 | Class License for the use of RLAN devices over 5925–6425 MHz Band（CRA/SM/TA/001/2022） | 2022-04-04 | 333,809 | https://www.cra.gov.qa/-/media/System/D/2/5/8/D258CF18B83A5613B0D590193CB799CB/Class-License-WIFI-6E-Final-English-032022--V3.ashx | `cra_wifi6e.pdf` | `2d3291274264db36154718d06a4cc088686e32772de954c43129d213469d20b9` | CRA 官网英文类许可 |
| S8 | Gulf Technical Regulation for Low Voltage Electrical Equipment and Appliances（BD-142004-01） | 生效 2016-07-01 | 661,711 | https://www.gso.org.sa/wp-content/uploads/2017/11/Gulf-Technical-Regulation-for-Low-Voltage-Electrical-Equipment-and-Appliances-BD-142004-01.pdf | `gso_lve.pdf` | `ef5182a88ef603d5eeef59da933af831f6d20429ffca7bfd4d98377cbdead1f6` | GSO 英文本封面自述 “Non-official Translation”；阿拉伯文本为准 |
| S9 | Consumer Rights Guide（MOCI，2024 第一版，阿拉伯文） | 2024 | 4,488,728 | https://www.moci.gov.qa/sites/default/files/2026-06/A5-Consumer-Rights-Guide-20240918-EN-AR4391.pdf | `consumer_rights_guide.pdf` | 未入规则引文（仅背景） | 文件名含 EN-AR，实际正文为阿拉伯文；仅用于背景阅读 |

> S9 未参与任何 `verbatim_excerpt`，故未计算 SHA-256 入表；如需复现可按 URL 重新下载。

> ⚠️ **罚则待核（2026-11-22）**：Law No. 8/2008 Art. 18 经 Law No. 7/2018 修订（2018-05-13 通过、2018-07-04 生效，WIPO Lex 记「as amended up to Law No. 7 of 2018」；原版标 superseded）。现行罚则幅度未取得官方文本，仓库内 13 条引用「3,000–1,000,000 里亚尔」的规则一律标 `review_required`，报告中不得作确定性结论。

## 访问状态与替代路径

| 来源 | 2026-11-17 直连结果 | 处理 |
| --- | --- | --- |
| Al Meezan `LawView.aspx`（S1） | 站点已改为单页应用（Vite SPA），所有路径返回同一 HTML 壳；`LawView.aspx` 不再返回法律正文 | 使用 Wayback Machine 2023-04-01 快照（同一官方 URL）：<br>`http://web.archive.org/web/20230401083656id_/https://www.almeezan.qa/LawView.aspx?opt&LawID=2647&TYPE=PRINT&language=en` |
| MCIT 电商法 PDF（S3） | 直连返回 HTTP 500（WAF） | 使用 Wayback Machine 2025-11-19 快照（同一官方 URL）：<br>`http://web.archive.org/web/20251119144301id_/https://www.mcit.gov.qa/wp-content/uploads/sites/4/2024/06/e-commerce_law_en_1.pdf` |
| MOCI 消费者指南（S9） | 可下载，但正文为阿拉伯文 | 仅作背景，不作为引文 |
| Kahramaa（km.qa / www.kahramaa.com.qa） | `www` 域名证书不匹配，`km.qa` 可访问但未取得英文规范文本 | 未收录能效标签规则；列入 open questions |
| 2012 年第 68 号执行条例英文版 | Al Meezan 无英文快照；MOCI 英文页仅提供阿拉伯文合订本 | 未编码为规则；列入 known gaps |
| CRA `/-/media/` 附件（S5/S6/S7） | 2026-11-18 23:1x 复测：媒体端点触发 Google reCAPTCHA v3 限流（922 B 挑战页）；S5 于同日 23:02 曾成功取回（173,679 B，与记录一致），随后转为 404 | S6/S7 需人工在浏览器另存后更新 token；引文不得记为已核（见下方说明） |

> 2026-11-18 23:1x 复测：`/-/media/` 端点触发 Google reCAPTCHA v3 限流（922 B 挑战页），S5 于同日 23:02 曾成功取回（173,679 B，与记录一致）后转为 404；S6 的 token 已由 `4D87FF06…` 轮换为 `A414762A…`。**S6/S7 的引文当前无法回源复核，不得记为已核。**

## 交叉核对记录

1. **CPL 2008 条号与结构（S1 vs S2）**：英文快照的章节结构（Chapter One Definitions 1；Chapter Two Rights 2–4；Chapter Three Supplier's Obligations 5–17；Chapter Four Sanctions 18–22；Chapter Five General Provisions 23–30）与阿拉伯文合订本的条号顺序一致；英文页元数据“31 条”系将 18 bis 计入。**结论：条号可用。** 阿拉伯文 PDF 文本层存在 ligature 损坏（如 “غلافها” 提取为 “غالفها”），未做逐字比对。
2. **CPL 2008 修订状态**：线上阿语版已反映 2018 年第 7 号法修订（Art. 1 / 18 / 22 带 2018-05-13 标记；Art. 18 标注 `معدلة ملغاة`，废止日 2018-05-13）。英文快照（S1，Wayback 2023-04-01）未反映，该快照仅含 2011 年第 14 号法令修订标记（Art. 1、10、18、18 bis、22）；据 Al Tamimi 2018-08 文章（辅助来源）涉及行政处罚与关店期限。**结论：罚则与 Art. 18 bis 的现行版本待核，已在 README open questions 登记。**
3. **电商法条号（S3 vs Al Meezan 记录）**：Al Meezan 的该法目录显示 “Chapter Eight (51-59) Consumer Protection”“Number of Articles: 77”，与 S3 的目录、Art. 51–59 编号一致。**结论：条号可用。**
4. **PDPPL（S4）**：NCSA 英文本自述非官方，官方版本为 2016 年公报第 15 期（阿拉伯文）。本库未取得阿拉伯文正本，无法做逐条对照；Art. 23 罚则上限 1,000,000 里亚尔、Art. 24 上限 5,000,000 里亚尔与条文正文一致。**结论：条号与罚则可用，译本官方性需在报告中标注。**
5. **电信法（S5）**：PDF 页眉为 “Telecommunication Law No (34)2006 Amended Provisions No (17)2017”；CRA 法律参考页列出同一法律。Art. 54–58 为设备标准与核准章节。**结论：可用。**
6. **CRA 型号核准指南（S6）**：CRA 官网 “Type Approval” 页面在 2026-11-17 仍列出 “Type Approval Guidelines，January 09, 2011” 文档；申请入口已迁至 e-Spectrum。**结论：指南文本可用，流程以 e-Spectrum 为准。**
7. **GSO 低压电器法规（S8）**：Art. 1 定义列明成员国包括 “State of Qatar”；Art. 40 生效日 2016-07-01；英文本每页页脚 “Non-official Translation”。文件内页标题写作 BD-1420XX-01（占位编号），发布编号为 BD-142004-01。**结论：可作为区域要求引用，不能当作卡塔尔国内法英文本。**
8. **卡塔尔 G-Mark 落地**：未找到 QS/MOCI 的英文落地通告；KOTRA、TÜV 等二手资料称卡塔尔自 2016-07-01 起执行（辅助来源，未用于引文）。**结论：confidence=medium，review_required=true。**

## 复现命令

```bash
mkdir -p qa-sources && cd qa-sources

# S1 CPL 2008 英文（Wayback 快照，官方 URL 同源）
curl -sS -L --compressed --max-time 60 \
  'http://web.archive.org/web/20230401083656id_/https://www.almeezan.qa/LawView.aspx?opt&LawID=2647&TYPE=PRINT&language=en' \
  -o law8_wb.html

# S2 MOCI 阿拉伯文合订本（法律 + 执行条例）
curl -sS -L --max-time 60 -A 'Mozilla/5.0' \
  'https://www.moci.gov.qa/sites/default/files/2026-06/moci1.pdf' -o moci1.pdf

# S3 电商法英文（Wayback 快照）
curl -sS -L --compressed --max-time 90 \
  'http://web.archive.org/web/20251119144301id_/https://www.mcit.gov.qa/wp-content/uploads/sites/4/2024/06/e-commerce_law_en_1.pdf' \
  -o ecommerce_law_wb.pdf

# S4 PDPPL 英文
curl -sS -L --max-time 90 -A 'Mozilla/5.0' \
  'https://assurance.ncsa.gov.qa/sites/default/files/library/2022-09/NCSA-NCGAA-Law%20No.%20%2813%29%20of%202016%20%20on%20Protecting%20Personal%20Data%20Privacy%20-%20English.pdf' \
  -o pdppl_en.pdf

# S5 电信法英文
curl -sS -L --max-time 60 -A 'Mozilla/5.0' \
  'https://www.cra.gov.qa/-/media/Feature/Publication/CRA_TELECOM_LAW_ENGLISH_Draft_FA.ashx' \
  -o CRA_TELECOM_LAW_ENGLISH_Draft_FA.pdf

# S6 型号核准指南（CRA 的 /-/media/ 链接需带 Referer，否则返回 404）
# ⚠️ 2026-11-18 23:1x 起该端点触发 Google reCAPTCHA v3 限流（922 B 挑战页），curl 已取不到。
#    复现方式改为：浏览器打开 https://www.cra.gov.qa/en/document/type-approval-guidelines
#    → 点附件另存为 cra_ta_guidelines.pdf。
#    下面的 URL 里 token 已由 4D87FF06… 轮换为 A414762A…，token 待人工在浏览器里更新后再替换。
curl -sS -L --max-time 60 -A 'Mozilla/5.0' \
  -H 'Referer: https://www.cra.gov.qa/en/services/telecommunications/spectrum-management/type-approval' \
  'https://www.cra.gov.qa/-/media/System/4/D/8/7/4D87FF06B6B253A79DA525C1299ABA57/2011-01-09-Guidelines-Type-Approval-EN.ashx' \
  -o cra_ta_guidelines.pdf

# S7 Wi-Fi 6E 类许可
# ⚠️ 同上：2026-11-18 23:1x 复测 404 / reCAPTCHA 挑战页，curl 已取不到。
#    复现方式改为：浏览器打开
#    https://www.cra.gov.qa/en/document/class-license-for-the-use-of-rlan-devices-over-5925-6425-mhz-band
#    → 点附件另存为 cra_wifi6e.pdf；token 待人工更新。
curl -sS -L --max-time 60 -A 'Mozilla/5.0' \
  'https://www.cra.gov.qa/-/media/System/D/2/5/8/D258CF18B83A5613B0D590193CB799CB/Class-License-WIFI-6E-Final-English-032022--V3.ashx' \
  -o cra_wifi6e.pdf

# S8 GSO 低压电器技术法规
curl -sS -L --max-time 90 -A 'Mozilla/5.0' \
  'https://www.gso.org.sa/wp-content/uploads/2017/11/Gulf-Technical-Regulation-for-Low-Voltage-Electrical-Equipment-and-Appliances-BD-142004-01.pdf' \
  -o gso_lve.pdf

sha256sum law8_wb.html moci1.pdf ecommerce_law_wb.pdf pdppl_en.pdf \
  CRA_TELECOM_LAW_ENGLISH_Draft_FA.pdf cra_ta_guidelines.pdf cra_wifi6e.pdf gso_lve.pdf
```

> 2026-11-17 复验：GSO（S8）与 CRA 指南（S6）重新下载后 SHA-256 一致（S6 需带 Referer）；S1/S3 的 Wayback 快照为固定时间戳，重复下载应得到同一文件。
> 2026-11-18 23:1x 复测起 S5/S6/S7 已不能在命令行复现（reCAPTCHA 限流 + token 轮换），只能人工浏览器另存，见上节「访问状态与替代路径」。

## 辅助来源（仅作线索，未用于引文）

- Al Tamimi & Company, “Qatar: Legislative changes in favour of consumers, domestic and foreign investments”, 2018-08（2018 年第 7 号法修订背景）。
- KOTRA（韩国贸易投资振兴公社）多哈贸易馆，G-Mark / 卡塔尔电子电器认证说明（2016、2020）。
- TÜV Rheinland / TÜV SÜD，GCC 低压电器技术法规与 G-Mark 说明。
- 半岛报（The Peninsula），2012-11-26，“Outlets must issue receipts in Arabic”（执行条例生效背景）。

> 上述二手资料仅用于确定“去核什么”，未进入任何 `verbatim_excerpt` 或规则正文；引用时不得作为法条来源。
