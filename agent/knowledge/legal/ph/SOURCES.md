# 菲律宾（PH）法条规则库 v0.1 — 来源清单

核验日期：2026-11-14。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。菲律宾的英语与菲语均为官方语言；本库引文全部取自英文文本，菲语文本仅用于交叉核对，不作引文来源。
>
> 来源限制：菲律宾政府主站（Official Gazette、DTI、NPC、参议院）在本环境普遍返回 HTTP 403。法规全文改用 **Lawphil（Arellano Law Foundation）镜像**；DAO 01:2008 用 **Supreme Court E-Library**；BPS 认证页面与 DAO 02:2007 用 **bps.dti.gov.ph**。所有非政府域名托管均在规则条目的 `official_url_note` 标注。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute_mirror` | 成文法全文，经 Lawphil（Arellano Law Foundation）镜像取得；文本为官方英文原文，未改写 | 是（须在 `official_url_note` 说明镜像） |
| `official_subsidiary` | DTI 部门行政令（DAO），经 Supreme Court E-Library 或 BPS 官网取得 | 是 |
| `official_regulator` | DTI-BPS 官方认证页面（无发布日，按抓取日核对） | 是（指引类标 `guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索（本版未使用） |

## 主来源（成文法与部门行政令）

| ID | 法规 / 文件 | 版本 / 说明 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| PH1 | Republic Act No. 7394 — The Consumer Act of the Philippines（1992-04-13 通过；1992-07-15 生效） | Lawphil 全文页；含 Art. 1–173 | 206,880 | https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html | `ph1_ra7394.html` | `29f91efce061918439965395661ed02e1e8f9b0ade4d4e7ce15e865a5d6c60f3` |
| PH2 | DTI Department Administrative Order No. 01, Series of 2008 — Addenda to the IRR of RA 7394 on Chapter IV on Labeling and Fair Packaging（2008-01-21 通过） | Supreme Court E-Library 全文页；OCR/转录文本 | 7,788 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocsfriendly/11/52305 | `ph2_dao01_2008.html` | `f7591bf0db462984051ddd33e9af441415d9e4e8a6c5c917cac2b13f3efd0a2c` |
| PH3 | DTI-BPS Mandatory Product Certification Schemes（PS / ICC） | 官网页面；无发布/更新日期 | 57,142 | https://bps.dti.gov.ph/product-certification/product-certification-schemes | `ph3_bps_schemes.html` | `32eb7ef216bea59d769d4b267f25f3055120860740f74c5e5ed677edcab34f5f` |
| PH4 | DTI-BPS PS and ICC Marks | 官网页面；无发布/更新日期 | 58,228 | https://bps.dti.gov.ph/product-certification/ps-and-icc-marks | `ph4_bps_marks.html` | `7572f69f72ba25b0cede261791d3c234d370d463136f341045b1e49f5cdb3652` |
| PH5 | DTI-BPS List of Products Under Mandatory Certification | 官网页面；含 21 类家用电器 | 85,911 | https://bps.dti.gov.ph/product-certification/list-of-products-under-mandatory-certification | `ph5_bps_list.html` | `b73bfcce096ad410397bdc1a031cae9969bea2e54c9c636f632e4d337170e4d3` |
| PH6 | DTI Department Administrative Order No. 02, Series of 2007 — Defining the Responsibilities and Liabilities of Manufacturers, Importers, Traders, Wholesalers, Distributors, Retailers, Service Providers and/or Their Agents（2007-06-07 签署；30 天后生效） | BPS 官网 PDF；13 页；扫描件 + OCR 文本层 | 9,965,091 | https://bps.dti.gov.ph/component/edocman/271-dao-02-2007-defining-the-responsiblities-and-liabilities-of-the-manufacturers-importers-traders/download?Itemid= | `ph6_dao02_2007.pdf` | `06428bbef789c366e417966b79b6912096c09356d60803ee02fefd6608b7b015` |
| PH7 | Republic Act No. 11967 — Internet Transactions Act of 2023（2023-12-05 通过；15 天后生效；过渡期至 2025-06-20） | Lawphil 全文页 | 46,024 | https://lawphil.net/statutes/repacts/ra2023/ra_11967_2023.html | `ph7_ra11967.html` | `9b00908ff202b39f01c769def26f98ff23fef8f5b248e6e411f669c09bf6557f` |
| PH8 | Republic Act No. 10173 — Data Privacy Act of 2012（2012-08-15 通过；15 天后生效） | Lawphil 全文页 | 56,745 | https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html | `ph8_ra10173.html` | `d9f00c3e74239247ad7896bf20ae76e4835b2ffed975f143296b9591b767d20f` |
| PH9 | Republic Act No. 4109 — Philippine Standardization Law（1964-06-20 通过；通过即生效） | Lawphil 全文页 | 16,721 | https://lawphil.net/statutes/repacts/ra1964/ra_4109_1964.html | `ph9_ra4109.html` | `0d7053ff1e1b42a234ea5d088d26798a8fcc2970e86d9eb2e46a093e51283b7f` |

## 主来源（监管页面，`article_type=guideline`）

| ID | 页面 | 抓取日 | 用于规则 | 说明 |
| --- | --- | --- | --- | --- |
| PH3 | BPS — Product Certification Schemes | 2026-11-14 | PH-CERT-04 | 说明 PS 与 ICC 两套强制认证、87 项产品、三大类 |
| PH4 | BPS — PS and ICC Marks | 2026-11-14 | PH-CERT-06 | 说明标志贴附位置、包装贴标与执法核对 |
| PH5 | BPS — List of Products Under Mandatory Certification | 2026-11-14 | PH-CERT-05 | 21 类家用电器清单（items 1–21） |

> 监管页面未标注发布/更新日期，规则中的 `effective_date` 取抓取日 2026-11-14；这类条目在报告中只能作为「监管机关口径/指引」引用，不能单独当法条。

## 复现命令

```bash
mkdir -p ph-sources && cd ph-sources

curl -sSL -A 'Mozilla/5.0' \
  'https://lawphil.net/statutes/repacts/ra1992/ra_7394_1992.html' \
  -o ph1_ra7394.html
curl -sSL -A 'Mozilla/5.0' \
  'https://elibrary.judiciary.gov.ph/thebookshelf/showdocsfriendly/11/52305' \
  -o ph2_dao01_2008.html
curl -sSL -A 'Mozilla/5.0' \
  'https://bps.dti.gov.ph/product-certification/product-certification-schemes' \
  -o ph3_bps_schemes.html
curl -sSL -A 'Mozilla/5.0' \
  'https://bps.dti.gov.ph/product-certification/ps-and-icc-marks' \
  -o ph4_bps_marks.html
curl -sSL -A 'Mozilla/5.0' \
  'https://bps.dti.gov.ph/product-certification/list-of-products-under-mandatory-certification' \
  -o ph5_bps_list.html
curl -sSL -A 'Mozilla/5.0' \
  'https://bps.dti.gov.ph/component/edocman/271-dao-02-2007-defining-the-responsiblities-and-liabilities-of-the-manufacturers-importers-traders/download?Itemid=' \
  -o ph6_dao02_2007.pdf
curl -sSL -A 'Mozilla/5.0' \
  'https://lawphil.net/statutes/repacts/ra2023/ra_11967_2023.html' \
  -o ph7_ra11967.html
curl -sSL -A 'Mozilla/5.0' \
  'https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html' \
  -o ph8_ra10173.html
curl -sSL -A 'Mozilla/5.0' \
  'https://lawphil.net/statutes/repacts/ra1964/ra_4109_1964.html' \
  -o ph9_ra4109.html

sha256sum ph1_ra7394.html ph2_dao01_2008.html ph3_bps_schemes.html \
  ph4_bps_marks.html ph5_bps_list.html ph6_dao02_2007.pdf \
  ph7_ra11967.html ph8_ra10173.html ph9_ra4109.html
```

预期 SHA-256 与上表一致。BPS 页面为动态站点，重新抓取时若页面改版，哈希会变化；以「抓取日 + 条文片段」复核，不以当前页面内容为准。

## 交叉核对记录

| 事项 | 核对方式 | 结果 |
| --- | --- | --- |
| RA 7394 生效日 1992-07-15 | Proclamation No. 1098, s. 1997（Official Gazette）载明「took effect on 15 July 1992」；`officialgazette.gov.ph` 在本环境 403，仅用检索结果交叉核对 | 一致（confidence: high） |
| RA 11967 全面执行日 2025-06-20 | DTI 新闻稿（2025-06-23）称过渡期于 2025-06-20 结束、IRR 为 JAO 24-03（2024-05-24）；DTI 站点 403，仅用检索结果交叉核对 | 一致（confidence: medium，生效日由过渡期倒推） |
| RA 10173 生效日 2012-09-09 | 条文 Sec. 45 要求公布后 15 天生效；公布日未取得 | 常见引用，未直接核对公报（confidence: medium） |
| DAO 01:2008 与 CPA Art. 77 | 两者均要求标签披露；DAO 追加英文/菲语平行翻译与投诉台地址 | 互补，无冲突 |
| BPS 页面与 DAO 02:2007 | BPS 页面「PS/ICC 方可分销」与 DAO 02:2007 s.3.3（进口商先取 ICC）、s.5.4（标签/包装显示标志）一致 | 一致 |
| PH6 PDF 可复现性 | 2026-11-14 重新下载 `ph6_dao02_2007.pdf`，SHA-256 与首次下载一致 | `06428bbe…b7b015`，一致 |
| ITA s.23(a) 与 CPA Art. 81 | ITA 明文引用 Art. 81 | 一致 |
| ITA s.23(c)(1) 语言要求 与 DAO 01:2008 s.2 | ITA：包装信息以 Filipino and/or English；DAO：英文或菲语平行翻译 | 不冲突；线上销售两者叠加 |

## 未取得 / 未使用的来源

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| Official Gazette（officialgazette.gov.ph） | HTTP 403（Cloudflare） | 无法逐字比对政府公报；RA 7394/10173/11967/4109 用 Lawphil 镜像 |
| DTI 主站（dti.gov.ph） | HTTP 403 | 无法取得 DTI 消费者页面与新闻稿原文；ITA 执行日仅用检索结果交叉核对 |
| NPC（privacy.gov.ph） | HTTP 403 | DPA IRR、NPC Circular 16-01 / 2023-06 未取得；隐私规则只依据 DPA 原文 |
| 参议院（senate.gov.ph） | HTTP 403 | 未用于引文 |
| ecommerce.dti.gov.ph（ITA IRR / JAO 24-03） | TLS 握手失败（SSL_ERROR_SYSCALL） | ITA IRR 未纳入；平台义务与罚则档位细节待补 |
| www.bps.dti.gov.ph | DNS 解析失败 | 改用 bps.dti.gov.ph（可访问） |
| DAO 04:2008（PS 标志规则，13 页） | PDF 为扫描件，无文本层 | 未作为引文来源；PS/ICC 要求改用 BPS 页面 + DAO 02:2007 文本层 |
| DAO 05:2008（ICC 规则，12 页） | PDF 为扫描件，无文本层 | 同上 |
| DAO 02:2004 / 06:2000 / 9:1999 / 11:04 s.2011（家电强制 PNS） | 未逐份取得/核对 | 21 类家电清单的逐项法律依据未映射；见 README Open Questions |
| FDA Philippines（fda.gov.ph） | 可访问，但未用于本版规则 | FDA 管健康产品/HUHS；小家电准入由 BPS 管。带抗菌/UV/健康声称的电器是否落入 FDA 需另开子单 |
| AdBoard / Philippine Advertising Code | 非成文法，未收录 | 行业自律规则不作为法条引用 |

## OCR 与文本质量说明

- **PH2（DAO 01:2008）**：Supreme Court E-Library 页面含 OCR/转录噪声（如 "ail manufacturers"、"consume!" products"、"be|S"）。规则只引用无噪声片段；引用前仍应打开原页核对。
- **PH6（DAO 02:2007）**：BPS PDF 为扫描件 + OCR 文本层（13 页）。`verbatim_excerpt` 已避开 OCR 断行与错字；例如 s.5.6 的 "tag" 在文本层显示为 "tat="，因此未把该句收入引文。正式使用前应以 PDF 图像逐字复核。
- 其余来源（PH1/PH3/PH4/PH5/PH7/PH8/PH9）为 HTML 文本，无 OCR 问题。

## 引文核验

```bash
python3 agent/knowledge/legal/ph/verify_excerpts.py --sources ./ph-sources
# checked 28 excerpts, 0 mismatch(es)
```

核验脚本按 `source_id` 映射到上表文件；HTML 去脚本/样式后取可见文本，PDF 用 `pdftotext -layout` 转文本，统一空白后做子串比对。
