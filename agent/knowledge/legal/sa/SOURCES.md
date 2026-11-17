# 沙特阿拉伯法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **语言政策落地说明**：沙特立法以阿拉伯文为准。本库只收两类英文文本：(a) 沙特官方机构发布的**官方英文译本**（Bureau of Experts at the Council of Ministers — Official Translation Department；SDAIA）；(b) 监管机关直接用英文发布的**规范性文件/指南**。二者页首或正文均带「以阿拉伯文本为准」或「不替代法律条文」的声明，本库在 `confidence` 与 `review_required` 上已作降级处理。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_translation` | 沙特官方翻译司（Bureau of Experts）或主管部门发布的官方英文译本 | 是（`confidence` 视情形降级） |
| `official_regulator` | CST / SASO / SDAIA 直接用英文发布的条例、指南 | 是（`guideline` 类须标 `article_type: guideline`） |
| `secondary` | 律所文章、商业数据库、行业媒体 | 否，仅作线索 |

## 主来源

| ID | 法规 / 文件 | 版本 / 签发 | 页数 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| SA1 | E-Commerce Law（皇家法令 M/126，2019-07-10） | Bureau of Experts 官方英译；MISA「Laws」库托管 | 10 | https://misa.gov.sa/app/uploads/2025/07/E-Commerce-Law.pdf | `sa_ecommerce_law.pdf` | `6260473e95720c26369915b072f66c6677a11c58c84f7091790b82022f236d2f` |
| SA2 | Personal Data Protection Law（皇家法令 M/19，1443-02-09 H） | SDAIA 官方英译 V2（2023-04-23 修订版） | 16 | https://sdaia.gov.sa/en/SDAIA/about/Documents/Personal%20Data%20English%20V2-23April2023-%20Reviewed-.pdf | `sa_pdpl_sdaia.pdf` | `f832f3024543ddf3efdbabbae14d6b302d07fcde8e3e9bb2ef7abbeb84b0790c` |
| SA3 | Law of Telecommunications and Information Technology（皇家法令 M/106，2022-06-01） | Bureau of Experts 官方英译；MISA 托管（同文件另含法文版） | 35 | https://misa.gov.sa/app/uploads/2025/07/Law-of-Telecommunications-and-Information-Technology.pdf | `sa_telecom_law.pdf` | `892f48760b80e1fce6a8135f7586cccf61804f986676d989982d8e8ad1f4dfaf` |
| SA4 | Regulations for Licensing of Telecommunications and Information Technology Equipment（RT12，第三版） | CST 决定 532/1445，2024-02-08；第三版（2024-02） | 13 | https://www.cst.gov.sa/en/regulations-and-licenses/regulations/Document-1582 | `sa_cst_rt12.pdf` | `17e7293180c76656d9f7dd15ce0456ff882e81103571b3fd809a8329570d7da6` |
| SA5 | Guidance Manual for the Product Safety Law（依皇家法令 M/36，2024-08-04） | SASO 英文指南 | 37 | https://www.saso.gov.sa/en/Laws-And-Regulations/guidelines/Documents/Guidanec-manual-for-the-Product-Safety-System-English.pdf | `sa_saso_psm_guide.pdf` | `3de440e89ffb2dcccd4d3300111ff3670a461248927996b1fb0eddffda1fb215` |

### 镜像与交叉核对来源（不作引文出处）

| ID | 与主来源的关系 | URL | SHA-256 | 说明 |
| --- | --- | --- | --- | --- |
| SA2-M | PDPL 官方英译，MISA 镜像 | https://misa.gov.sa/app/uploads/2025/08/PersonalDataProtectionLaw.pdf | `a58eac749b0224c47abf7fa1f313d398a408e491acf58b4898976954c3a8ccf6` | 与 SA2 逐字比对：第 1、5、7、11-22、35-43 条条文正文一致，仅页眉页脚/项目符号编码不同（MISA 版本多出 `1-!` 类排版噪声）。两版文本互证，引文取 SA2。 |

### 监控来源（尚未作为规则引文）

| ID | 文件 | 状态 | 本地文件 | SHA-256 | 说明 |
| --- | --- | --- | --- | --- | --- |
| SA-M1 | Technical Regulation for Communications and Information Technology Devices（SASO，决定 196，1445-06-28 / 2024-08-16 公布） | **纯阿拉伯文**，37 页 | `sa_saso_tr_cit_ar.pdf` | `1bfd6143aaa918edf4ecf79e246ffb14c1dcad4122ab596c988af54f619ec71b` | 与 SA4 相互补充：SASO 管技术法规本体，CST 管许可流程。因无官方英文版，按语言政策**不收为引文**。 |
| SA-M2 | General Regulation for Conformity Models（SASO，决定 194，1443-03-13 H） | **纯阿拉伯文**，37 页 | `sa_saso_conformity_models_ar.pdf` | `000691d40661de24854ab34699d9d8289d045e67a038dfac19ff4c5d294f8301` | 合格评定模式（含 SABER 的 PCoC/SCoC 模式）本体的规定；无英文版，未收。这是 SA-SAFE-04 只能停在指南级的原因。 |
| SA-M3 | Technical Regulation for Standby and Off-Mode Electric Power Consumption（SASO，决定 191） | **纯阿拉伯文**，21 页 | `sa_saso_tr_standby_ar.pdf` | `9189ec73295b32a45cb643ae331b7e35c05f2a7e737a89955a92d1deeb557963` | 待机功耗限值；小家电可能适用，未收。 |
| SA-M4 | Technical Regulation for Electromagnetic Compatibility（SASO，决定 194） | **纯阿拉伯文**，28 页 | `sa_saso_tr_emc_ar.pdf` | `0e0d00cb00cf00cbf2923aa53a191d9953816b228cc6fb9f46a2e87d21b18554` | EMC 要求；未收。 |
| SA-M5 | Consumer Protection Law（82 条版本，Istitlaa / SCBC 平台） | **2022 年公开征求意见稿**，非现行法 | — | — | 平台为「Public Consultation Platform - Istitlaa」，页面标注最后更新 2022-04-07；条文数（82）与 2026-11 获批的正式法（76 条）不符，故**不采用**，仅用于理解立法走向。 |

### 辅助来源（不直接支撑 `verbatim_excerpt`）

| 来源 | 用途 | URL |
| --- | --- | --- |
| 沙特商务部（Ministry of Commerce）新闻页 | 交叉核对 2026-11-10 新《消费者保护法》获批的要点（76 条、罚则上限、保修期、180 日生效） | https://mc.gov.sa/en/cps/Pages/commerce-first-law.aspx |
| MISA「Laws」库 | 官方英译法条的稳定入口（本轮 4 份英译中的 4 份经此取得或经此验证） | https://misa.gov.sa/activities/laws/ |
| SASO 技术法规与指南列表 | 定位技术法规 PDF 与英文指南 | https://www.saso.gov.sa/en/Laws-And-Regulations/Technical_regulations/Pages/default.aspx |
| CST 条例库 | 定位 RT12 与其他监管文件 | https://www.cst.gov.sa/en/regulations-and-licenses/regulations |
| SFDA 条例库 | 后续食品接触材料规则的来源入口（本轮未取得英文文本） | https://www.sfda.gov.sa/en/regulations |

## 交叉核对记录

1. **E-Commerce Law（SA1）**：通读 26 条。核对第 2（适用范围，含境外主体）、6、7、8、10、11、12、17、18、26 条。第 26 条明确「自官方公报公布后 90 日生效」，但公报日未核到，故 `effective_date` 记法令日并在 `effective_date_note` 说明。第 9 条（受监管职业披露执照）与本品类无关，未收录。
2. **PDPL（SA2）**：核对第 2、4、5、6、7、10、11、12、13、14、15、17、18、19、20、21、22、31、33-38、43 条。第 43 条「自公报公布后 720 日生效」；第 32 条在现行文本中标注「Repealed」，未引用。第 12 条只用「须制定隐私政策并在收集前提供」这一句，未扩展到实施条例细节（英文实施条例未取得）。
3. **PDPL 双版本比对（SA2 / SA2-M）**：对第 1、5、7、11-22、35-43 条逐条比对，条文正文一致；差异仅为排版与 PDF 生成方式（两文件 SHA 不同、字节数不同）。结论：文字层面无实质差异，可互为佐证。
4. **通信与信息技术法（SA3）**：核对第 2、3、5、6、24、25、26、27、28、35、36、37、41 条。第 41(1) 条明文废止旧《通信法》（M/12，1422-03-12 H）；第 41(2) 条「自公报公布后 180 日生效」。第 26 条列 10 项违反情形，本库只收 (1)(3) 两项与页面可观察/可核查相关的；第 26(2)(9)（无证经营/持有设备）与 B2C 页面关系较远，未单列。
5. **CST RT12（SA4）**：核对第 2、3、4、5、6、8、9、10、11、12、13 节。确认三件事：① 第 3 节把义务扩到「制造、进口、分销、销售或使用」的任何一方；② §8 明确 CoC ≠ 海关放行许可；③ §9.1.1 要求进口人必须是持 CR 的沙特公司/机构。RT12 本身无罚则条款，罚则引用 SA3 第 26/27 条。
6. **RT12 版本核对**：文件内「VERSION CONTROL TABLE」列三版（2018-04 前身、2022-02 第二版、2024-02 第三版）；页面元数据 `documentStatus: Modifying Existing Document`、决定号 532/1445、决定日 08-02-2024。以第三版为准。
7. **SASO 产品安全指南（SA5）**：核对第 01-06 章。手册第 1 页自述「It is not a binding document … and does not replace the provisions set forth in the law」，故 6 条全部标 `article_type: guideline`、`confidence: medium`、`review_required: true`。手册载明《产品安全法》为皇家法令 M/36（1446-01-29 H = 2024-08-04），与 `effective_date_note` 一致。
8. **SASO 技术法规语言核查**：抽查 4 份技术法规 PDF（通信与信息技术设备、EMC、合格评定模式、待机功耗），`pdftotext` 抽取后**均为纯阿拉伯文，无英文对照段落**；同一路径下的 `/en/` 版本返回 404。故 SASO 技术法规本体按 `official_english_unavailable` 处理，仅以英文指南（SA5）建规则。
9. **Istitlaa 稿本判定（SA-M5）**：页面位于「Public Consultation Platform - Istitlaa」，面包屑为 Trade Sector / MCI，索引页标注 `Last update: 07 April 2022`。该英文页共 82 条（含 Article 82: Entry into force），与商务部 2026-11-10 新闻稿所述正式法「76 条」不一致 → 判定为征求意见稿，不作法源。
10. **新《消费者保护法》状态**：仅通过检索摘要看到商务部英文/阿拉伯文新闻页要点（2026-11-10 内阁批准；76 条 / 10 章；罚款上限 800 万里亚尔；监禁上限 2 年；新产品保修 ≥2 年、服务与二手 ≥1 年；远程与店外合同 7 日无理由退货；公报公布后 180 日生效；取代三部现行法律）。**本环境无法直连 `mc.gov.sa`**（TCP 连接失败），故该条事实标为「未直接核实」，仅写入 README open questions #3/#4，不进入任何规则。

## 未取得 / 未采用

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| Consumer Protection Law（现行有效版本）及其 Implementing Regulations | `mc.gov.sa` 在本环境 TCP 不可达；`laws.boe.gov.sa`、`boe.gov.sa`、`npl.gov.sa`、`my.gov.sa`（Cloudflare 403）同样不可达 | 「一般广告/虚假宣传/绝对化用语/折扣/法定保修」整块无规则；电商法第 11 条只能覆盖电子广告 |
| Commercial Data Law（《商业数据法》，阿拉伯文标签义务） | 同上 | 语言义务无规则（见 README open questions #2） |
| Anti-Commercial Fraud Law（反商业欺诈法 M/19） | 同上 | 「假冒/仿冒」刑事线未建（SA-ADV-04 只到电商法商标条款） |
| PDPL Implementing Regulations | SDAIA 官网英文区未定位到英文 PDF | 同意形式、跨境传输、DPO 等细则无法落地 |
| SFDA 食品接触材料技术法规 / GSO 1863 系列 | 未检索到英文版 | 小家电食品接触只有 SA-SAFE-06 的「需证明」级 |
| 能效标签（SEEC / SASO 能效技术法规）管制清单 | 未逐项核对 | 页面是否应展示能效标签无法判断 |
| 商业数据库 / 律所解读（如 Legal500 沙特消费者保护专栏） | 二手 | 仅用于定位「消费者保护局」「Supplier's Guideline」等线索，未作来源 |

## 复核方法（可复现）

1. **下载**：`curl -sSL -A '<Chrome UA>' '<URL>' -o <file>.pdf`。CST 的 PDF 不是静态链接：先取 `Document-XXXX` 页，从内嵌 JSON 取 `fileEn[0].fileId`，再请求 `https://www.cst.gov.sa/api/feature/GetPdfUrl?documentId=<id>&fileId=<fileId>&lang=en` 得到 `/-/media/<hash>.pdf` 相对路径，最后拼接下载（本库 SA4 即如此取得）。
2. **SHA-256**：`sha256sum <file>.pdf`，与上表逐项比对。文件若更新，哈希必变——先看页数/版本表，再逐条重比引文。
3. **抽文本**：`pdftotext -layout <file>.pdf <file>.txt`；SASO 的多栏排版在 `-layout` 下会把左右栏交错，此时改用 `pdftotext <file>.pdf <file>.txt`（无 `-layout`）保留阅读顺序，两种抽取都保留用于比对。
4. **逐条比对（脚本化，非人工目测）**：把引文与全文都归一化——小写、去软连字符、把弯引号/破折号折成 ASCII、删去所有非字母数字（保留阿拉伯文区间）、压缩空白——然后做子串包含判断；引文中以 `...` 分隔的多段，逐段判断。构建脚本对 34 条全部执行该检查，**任何一条不匹配即构建失败**。本版结果：**34/34 通过，0 处不匹配**。
5. **任何新规则必须同时具备**：官方 URL、条文号、英文（或官方英译）短引、`effective_date` + `effective_date_note`、`last_verified`。
6. **本库文件命名**：上表「本地文件」是核验时使用的规范名（`sa_*`），抓取时的临时文件名可能不同（如 MISA 直接下载为 `E-Commerce-Law.pdf`），以 URL 与 SHA-256 为准。本地 PDF 副本只用于核验，未入仓；仓库内只保留 `rules.v0.1.json`、`README.md`、`SOURCES.md`、`SAMPLE_FINDINGS.md`。
