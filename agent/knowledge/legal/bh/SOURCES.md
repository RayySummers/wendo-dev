# 巴林（BH）法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，`source_id` 对应本文件编号。

> **语言政策（本库的关键约束）**：巴林官方语言为阿拉伯语，法律以《官方公报》阿拉伯语文本作准。LLOC（立法与法律意见委员会）与 MOLA（司法部）发布**官方英文译本**，页首均带免责声明：“The official version of the law … is published in Arabic in the Official Gazette … provided for guidance and easy reference purposes.”。本库只用这类官方译本或主管机关英文页面，**不用律所文章、商业数据库或第三方翻译**作为引文来源；没有官方英文文本的规范（如 2014 年第 66 号部长决定、GSO 低压电器技术法规）只登记为 gap，见文末“未取得来源”。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_translation` | LLOC / MOLA 发布的英阿对照官方译本（阿拉伯语作准） | 是；报告中须标注译本性质 |
| `official_regulator_guidance` | 主管机关官网英文页面（TRA、MOIC） | 是；`article_type=guideline`，不能替代法条 |
| `reference_only` | 官方发布但英文本明确为“非官方译本”，或只有阿拉伯语的规范 | 否，仅作 gap 说明与本目录的 open questions |

## 主来源

全部于 2026-11-17 从官方域名直接下载。DOCX 为 MOLA/LLOC 的英阿对照本；HTML 为监管机关英文页面的存档副本；SHA-256 针对**下载的原始文件**，可重新下载复算。

| ID | 文件 | 版本 / 发布 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| BH1 | Law No. (35) of 2012 with respect to Consumer Protection（消费者保护法） | MOLA 英文版，含截至 2026-06-01 的修订；页面更新 2026-08-03 | 2,606,050 | https://www.mola.gov.bh/EN/Legislation/Laws/35-2012 | `bh1_cp_law_35_2012.docx` | `77d6fd3257ed44304604c0c2b08e85116b438792d6497015ea7e07968e088aee` |
| BH2 | Law No. (30) of 2018 with respect to Personal Data Protection（个人数据保护法） | MOLA 英文版，含修订；页面更新 2026-08-03 | 2,688,019 | https://www.mola.gov.bh/EN/Legislation/Laws/30-2018 | `bh2_pdpl_30_2018.docx` | `596b243a03c9e668f480e2aec1f5dfc30187af0b10f950ead3427162d218d2d6` |
| BH3 | Legislative Decree No. (14) of 1973 regarding the Regulation of Advertisement（广告管理法令） | LLOC 英文译本，网站发布 2024-05 | 19,145 | https://www.lloc.gov.bh/Legislation/id/L1473 | `bh3_advertising_decree_14_1973.docx` | `7eaa074a59b74bc6ef0405cc07d6b720435343807afa6f78ad22d55637d17576` |
| BH4 | Legislative Decree No. (16) of 1985 regarding Specifications and Measures（规格与计量法令） | LLOC 英文译本，网站发布 2024-05 | 20,862 | https://www.lloc.gov.bh/Legislation/id/L1685 | `bh4_standards_decree_16_1985.docx` | `fecf4f383929846d2caf11659d371dd0572b1e405e249a9783000adbb6c92c7b` |
| BH5 | Legislative Decree No. (18) of 1975 regarding Price Determination and Monitoring（价格确定与监管法令） | LLOC 英文译本，网站发布 2024-05 | 34,121 | https://www.lloc.gov.bh/Legislation/id/L1875 | `bh5_prices_decree_18_1975.docx` | `0832b07746a418f78174fa07297047cd4522c7203d7bf901a7682291a967b7e6` |
| BH6 | Legislative Decree No. (6) of 1977 regarding Weights, Measures and Quantities（度量衡法令） | LLOC 英文译本，网站发布 2024-05 | 27,102 | https://www.lloc.gov.bh/Legislation/id/L0677 | `bh6_weights_decree_6_1977.docx` | `ee84133351742fbbb765eee949d5d35ec5c7ef2205d058e6e90c2464c8493063` |
| BH7 | TRA — Type Approval Frequently Asked Questions（型号核准问答） | 抓取于 2026-11-17；页面未标发布/更新日 | 112,303 | https://tra.bh/en/category/frequently-asked-questions | `bh7_tra_type_approval_faq.html` | `6c11e0b9e6611dfd55d4abeeccb78cddf3018a95c8a5e8d7f9a45edf24f8801a` |
| BH7b | TRA — Type Approval Overview（型号核准概览） | 抓取于 2026-11-17 | 84,055 | https://tra.bh/en/category/overview-typeapproval | `bh7b_tra_type_approval_overview.html` | `77e6ea452d9fd4022890744753d516023439cad17b14b670d658780f16bd3240` |
| BH8 | MOIC — Consumer Protection FAQ（消费者保护问答） | 抓取于 2026-11-17；页面为 Drupal 动态页 | 63,095 | https://www.moic.gov.bh/en/faq/30 | `bh8_moic_consumer_faq.html` | `447ad31bd88dbb43b4d1107b438389a031247728f844cc5c6b7e6a31b430acb0` |
| BH9 | MOIC — Inspection Directorate, Violations & Procedures Manual（违规与处理程序手册，英文版） | 2024-10 上传 | 404,554 | https://www.moic.gov.bh/sites/default/files/2024-10/%d8%af%d9%84%d9%8a%d9%84%20%d8%a7%d9%84%d9%85%d8%ae%d8%a7%d9%84%d9%81%d8%a7%d8%aa-%20%d9%84%d9%84%d9%85%d9%88%d9%82%d8%b9-%20%d8%a8%d8%a7%d9%84%d8%a7%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a-%20%d9%85%d8%b3%d8%aa%d9%86%d8%af%202_0.pdf | `bh9_moic_violations_manual.pdf` | `420fb97e08017215b4aa2e1ac20d84ea46b5f345f3054fbbfb4ccbf8733db3d0` |

> BH9 只用于交叉核对执法口径（第 101/103/104/106/107 项：不标价、不开票、标价与收银价不符、不退不换声明、促销违规），不作为规则引文来源。

### `reference_only`：官方发布但不能作英文引文的文件

| ID | 文件 | 状态 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| BH10 | Ministerial Decision No. (66) of 2014 issuing the Implementing Regulation of the Consumer Protection Law（消费者保护法实施条例） | **只有阿拉伯语**：LLOC 有阿语页面，`/FullEn/MD6614.docx` 返回 404 | 25,383 | https://www.lloc.gov.bh/Legislation/id/MD6614 | `bh10_md66_2014_arabic_only.html` | `de356cce5496ac00e907608a5f7f1272c09a7d7c620839ef31457cc290917795` |
| BH11 | GSO — Gulf Technical Regulation for Low Voltage Electrical Equipment and Appliances BD-142004-01 | 英文本首页写明 “Only the Arabic version of this Regulation is authentic” / “Non-official Translation” | 661,711 | https://www.gso.org.sa/wp-content/uploads/2017/11/Gulf-Technical-Regulation-for-Low-Voltage-Electrical-Equipment-and-Appliances-BD-142004-01.pdf | `bh11_gso_lve_tr_non_official.pdf` | `ef5182a88ef603d5eeef59da933af831f6d20429ffca7bfd4d98377cbdead1f6` |
| BH12 | Legislative Decree No. (54) of 2018 promulgating the Electronic Communications and Transactions Law（电子通信与交易法） | 已取得官方英文本，但本版未从中建规则（未见面向消费者的披露义务条款） | 2,636,235 | https://www.mola.gov.bh/EN/Legislation/Laws/54-2018 | `bh12_ect_law_54_2018.docx` | `2865675f41c758e7fb7824bc67eca3e83e8dfc42965847ddd789e4f8322eb077` |

## 交叉核对记录

1. **BH1 与 2024 年 LLOC 版本逐条比对**：本库 10 条 CP Law 引文中 9 条与 LLOC 2024-05 版（`https://lloc.gov.bh/FullEn/K3512.docx`，SHA-256 `3c334df3860267e90533dc69a3978584892f8ad1740c40c0240043a940e445ad`）完全一致；**第 6 条第 1 款存在译本差异**：2024 版句末为 “causing confusion or misunderstanding thereto”，2026 版改为 “causing confusion or misunderstanding.” 并另起一句 “The supplier shall be exempted…”。本库采用 2026 版（MOLA 现行版），差异不影响文义，但说明**英文译本会随修订重译**，引用时应记录版本日期。
2. **BH2 与 2024 年 LLOC 版本比对**：6 条 PDPA 引文全部一致（`https://lloc.gov.bh/FullEn/K3018.docx`，SHA-256 `b199b77d5642461580a5c55486607c9441e4bd2b35bbe2e038727de3ebecc045`）。
3. **BH5 第 14 条 / 第 20 条与 MOIC 执法口径**：MOIC 违规手册第 101 项（不标价）、第 103 项（标价与收银价不符）与价格法令第 14、20 条方向一致；MOIC FAQ 另把“高于公布价销售”归到 2007 年第 1 号部长令。
4. **BH3 第 2 条阿拉伯语义务与 CP Law**：CP Law 本身未规定商品信息语言；阿拉伯语义务来自广告法令第 2 条、价格法令第 14 条与 GSO 标准，三者适用对象不同，报告不得混用。
5. **BH7 与 BH7b 一致性**：概览页“all telecom equipment imported … shall be subject to the Type Approval Regulation before it is made readily available in the local market”与 FAQ“must be registered with the TRA before it can be used, sold or distributed”一致。
6. **GSO BH11 与巴林国内法**：1985 年第 16 号法令第 2(A)、14 条把 GSO/国家规格作为进口符合性基础，但**巴林是否以 G-Mark 作为低压电器的强制准入标志，本版未取得巴林官方英文文件**，故不建规则。
7. **PDPA 生效日**：第 60 条为“公布次月起满一年生效”，按 2018-07-12 公布推算 **2019-08-01**；公开资料常见的“2019-07-12”未见于条文，采用条文推算值并在 open questions 标注。

## 重下载核验（2026-11-17）

从官方 URL 重新下载后逐文件比对 SHA-256，结果一致（抽样 3 个来源，覆盖 DOCX 与 HTML 两种格式）：

| 文件 | 首次下载 | 重下载 | 结果 |
| --- | --- | --- | --- |
| `bh1_cp_law_35_2012.docx` | `77d6fd…2eb077` | `77d6fd…2eb077` | 一致 |
| `bh3_advertising_decree_14_1973.docx` | `7eaa07…d17576` | `7eaa07…d17576` | 一致 |
| `bh7_tra_type_approval_faq.html` | `6c11e0…f8801a` | `6c11e0…f8801a` | 一致 |

> 说明：DOCX 为 MOLA/LLOC 静态发布的文件，按版本固定；HTML 为动态站点页面，若站点改版，SHA-256 会变化，此时应重新核验文本并更新 `last_verified`。其余文件未逐一重下载，复现命令见下。

## 未取得来源（open questions 对应）

| 项 | 状态 | 影响 |
| --- | --- | --- |
| 2014 年第 66 号部长决定（消费者保护法实施条例）官方英文文本 | 未取得（LLOC 仅阿语；`/FullEn/MD6614.docx` 404） | 折扣/促销、标价、退换细则无法逐条引用 |
| Ministerial Order No. (1) of 2007（零售标价）原文 | 未取得（仅 MOIC FAQ 英文引述） | 该条只能作 guideline，条文号/罚则缺失 |
| GSO BD-142004-01 官方英文文本 | 不存在（英文本为非官方译本） | G-Mark 准入无法建 `rule_level` 规则 |
| BSMD 强制标准清单 / Bahrain Standards Store 逐项 | 未核对 | 无法判断具体 SKU 是否落入强制标准 |
| TRA《Type Approval Regulation》全文与罚则 | 未取得（站点文档为 S3 随机文件名，未定位到稳定链接） | 型号核准的处罚与标签要求缺失 |
| PDPA 第 12(1) 条“充分保护”国家/地区名单 | 未取得 | 跨境传输只能判“需证明” |
| 广告法令对线上广告的适用口径 | 无官方英文说明 | 高风险项，全部 `review_required` |
| CP Law 2026-06-01 之后的修订 | 未覆盖 | 需按《官方公报》阿拉伯语原文复核 |

## 复现命令

```bash
mkdir -p bh-src && cd bh-src
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

# 1) MOLA 英阿对照本（DOCX；同一页面给出 DOCX/PDF 两个链接）
curl -sSkL -A "$UA" -o bh1_cp_law_35_2012.docx \
  'https://www.mola.gov.bh/MediaManager/Media/MolaMedia/Documents/2026/Batch1/L3512ConsumerProtection/L3512.docx'
curl -sSkL -A "$UA" -o bh2_pdpl_30_2018.docx \
  'https://www.mola.gov.bh/MediaManager/Media/MolaMedia/Documents/2026/Batch3/L3018PersonalDataProtection/L3018.docx'
curl -sSkL -A "$UA" -o bh12_ect_law_54_2018.docx \
  'https://www.mola.gov.bh/MediaManager/Media/MolaMedia/Documents/2026/Batch3/L5418ElectronicCommunicationsAndTransactions/L5418.docx'

# 2) LLOC 英文译本（Decree-Law：L + 法号 + 两位年份）
for f in L1473 L1685 L1875 L0677; do
  curl -sSkL -A "$UA" -o "${f}.docx" "https://www.lloc.gov.bh/FullEn/${f}.docx"
done
mv L1473.docx bh3_advertising_decree_14_1973.docx
mv L1685.docx bh4_standards_decree_16_1985.docx
mv L1875.docx bh5_prices_decree_18_1975.docx
mv L0677.docx bh6_weights_decree_6_1977.docx

# 3) TRA / MOIC 英文页面
curl -sSkL -A "$UA" -o bh7_tra_type_approval_faq.html 'https://tra.bh/en/category/frequently-asked-questions'
curl -sSkL -A "$UA" -o bh7b_tra_type_approval_overview.html 'https://tra.bh/en/category/overview-typeapproval'
curl -sSkL -A "$UA" -o bh8_moic_consumer_faq.html 'https://www.moic.gov.bh/en/faq/30'

# 4) MOIC 违规手册（英文，文件名含阿拉伯语百分号编码）
curl -sSkL -A "$UA" -o bh9_moic_violations_manual.pdf \
  'https://www.moic.gov.bh/sites/default/files/2024-10/%d8%af%d9%84%d9%8a%d9%84%20%d8%a7%d9%84%d9%85%d8%ae%d8%a7%d9%84%d9%81%d8%a7%d8%aa-%20%d9%84%d9%84%d9%85%d9%88%d9%82%d8%b9-%20%d8%a8%d8%a7%d9%84%d8%a7%d9%86%d8%ac%d9%84%d9%8a%d8%b2%d9%8a-%20%d9%85%d8%b3%d8%aa%d9%86%d8%af%202_0.pdf'

# 5) 复算 SHA-256
sha256sum bh1_cp_law_35_2012.docx bh2_pdpl_30_2018.docx bh3_advertising_decree_14_1973.docx \
         bh4_standards_decree_16_1985.docx bh5_prices_decree_18_1975.docx bh6_weights_decree_6_1977.docx \
         bh7_tra_type_approval_faq.html bh7b_tra_type_approval_overview.html bh8_moic_consumer_faq.html \
         bh9_moic_violations_manual.pdf
```

**2024 年 LLOC 交叉核对文件**（仅用于比对，不作为引文来源）：

```bash
curl -sSkL -A "$UA" -o K3512.docx 'https://lloc.gov.bh/FullEn/K3512.docx'   # SHA-256 3c334df3860267e90533dc69a3978584892f8ad1740c40c0240043a940e445ad
curl -sSkL -A "$UA" -o K3018.docx 'https://lloc.gov.bh/FullEn/K3018.docx'   # SHA-256 b199b77d5642461580a5c55486607c9441e4bd2b35bbe2e038727de3ebecc045
```

> 访问注意：MOLA 站点对连续请求会返回 403（无 UA 或短时间多次请求），复现时加浏览器 UA 并留 2–3 秒间隔；旧 `legalaffairs.gov.bh/Media/LegalPDF/*.pdf` 链接已 404，不要再用。

## 校验方式

```bash
python3 verify_excerpts.py --sources /path/to/bh-src
# checked 31 excerpts, 0 mismatch(es)
```

校验脚本读取 DOCX 的 `word/document.xml` 与 HTML 去标签后的文本，统一空白与引号后做子串比对；不通过则退出码为 1。
