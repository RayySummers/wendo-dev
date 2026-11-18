# 加拿大法条规则库 v0.1 — 来源清单

核验日期：2026-11-18。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **语言政策**：加拿大联邦官方语言为英语与法语。本库按 RAY-765 口径只收**联邦 + 主要省的官方英文原文**；魁北克省（QC）不作为英语市场覆盖，其法语义务以 `CA-QC-01`–`CA-QC-03` 三条「标注型」条目记录（引文为魁北克官方出版社发布的英译本，官方原文为法语），见文末「魁北克的访问与语言口径」。
>
> **联邦制的层级标注**：每条规则带 `jurisdiction`（`federal` / `provincial`）与 `jurisdiction_note` 两个字段。联邦法在全国适用；省法仅在所涉省份适用；同一页面的同一表述可同时落入联邦法（如 Competition Act s.74.01）与省法（如 Ontario CPA s.14 / BC BPCPA s.5），两条并行、互不排除——这一点是加拿大与其它单法域市场最大的差异，报告必须同时检查两层。

## 访问方式说明（必读）

| 站点 | 状态 | 处理 |
| --- | --- | --- |
| `laws-lois.justice.gc.ca`（联邦 Justice Laws） | 可访问（curl 直接 200） | 取 `FullText.html`，`section-XX.html` 逐条页用于规则里的 `official_url` |
| `ised-isde.canada.ca`（ISED，原 `ic.gc.ca` 重定向） | 可访问 | RSS-Gen 标准正文页直接抓取 |
| `competition-bureau.canada.ca` | 可访问 | 仅用于 s.74.011 生效日的佐证（官方监管页），未作为引文来源 |
| `www.ontario.ca/laws`（安大略 e-Laws） | 可访问 | 抓 `statute/02c30`（CPA 2002）、`regulation/050017`（O. Reg. 17/05）、`regulation/990164`（O. Reg. 164/99） |
| `www.bclaws.gov.bc.ca`（BC Laws） | 可访问 | BPCPA 用 `04002_00_multi`（完整文本），电气安全条例用 `100_2004` |
| `www.legisquebec.gouv.qc.ca`（魁北克 Légis Québec） | **403 / CloudFront 拦截**（curl、无头浏览器、代理三路均不通） | Charter of the French Language 引文取自 Wayback 对**同一官方 URL** 的 2025-11-10 快照，快照页标注 `Updated to 5 June 2025`；快照 URL 见 `CA-QC-*` 的 `archive_url` |

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_federal_statute` | 联邦 Justice Laws 合并文本（Act，2026-10-29 现行） | 是 |
| `official_subsidiary_legislation` | 联邦 Justice Laws 合并文本（Regulation / C.R.C.） | 是 |
| `official_regulator` | ISED 发布的技术标准（RSS-Gen，2026-09-15 Amendment 1 生效） | 是（技术标准，具强制力） |
| `official_provincial_legislation` | 安大略 e-Laws / BC Laws 的省级法规合并文本 | 是 |
| `official_provincial_legislation_archived` | 魁北克 Légis Québec 官方页面（Wayback 快照取件） | 是，但引文为官方英译本且快照日期 2025-11-10，需在可访问该站的网络环境复核 |

## 主来源

| ID | 法规 / 文件 | 版本 / 现行日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| CA1 | Competition Act, R.S.C., 1985, c. C-34（竞争法） | Act current to 2026-10-29, last amended 2026-03-26 | 637,301 | https://laws-lois.justice.gc.ca/eng/acts/C-34/FullText.html | `c-34.html` | `f56a4c0d8a7df7eda24ede9135abe80f444b7b62aff67e4870d7a899c56c4862` |
| CA2 | Consumer Packaging and Labelling Act, R.S.C., 1985, c. C-38（消费者包装与标签法） | Act current to 2026-10-29, last amended 2019-01-15 | 71,936 | https://laws-lois.justice.gc.ca/eng/acts/C-38/FullText.html | `cpla.html` | `547cd8809456dafc455db0d87c80c89c232222fff378fd11ffb00de3cc836cd6` |
| CA3 | Consumer Packaging and Labelling Regulations, C.R.C., c. 417 | Regulations current to 2026-10-29; s.6 经 SOR/2018-108, s.382 修订（2019-01-15 生效） | 140,295 | https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._417/FullText.html | `cplr.html` | `2a7e9e19ac60d1651828dc2feedcf293763922a273d4a6eace8c33c78dfeddb8` |
| CA4 | Weights and Measures Act, R.S.C., 1985, c. W-6（度量衡法） | Act current to 2026-10-29, last amended 2021-04-19 | 179,801 | https://laws-lois.justice.gc.ca/eng/acts/W-6/FullText.html | `weights.html` | `62d97507a764cc9fa2f72dd7cdbef266a7bf4f7872d796072768fb7f0e877f7a` |
| CA5 | Canada Consumer Product Safety Act, S.C. 2010, c. 21（加拿大消费品安全法） | SI/2011-12 于 2011-06-20 生效；current to 2026-10-29, last amended 2024-11-20 | 157,188 | https://laws-lois.justice.gc.ca/eng/acts/C-1.68/FullText.html | `ccpsa.html` | `02ba11c1d0d2f3da74f46d073ef66b8470e06fee1db70afd88ea7ad1b6051319` |
| CA6 | Radiocommunication Act, R.S.C., 1985, c. R-2（无线电通信法） | Act current to 2026-10-29, last amended 2024-06-20 | 135,973 | https://laws-lois.justice.gc.ca/eng/acts/R-2/FullText.html | `radiocomm.html` | `ff4e4a55a29430601b47d28480cc7b806c9f5fe3b163bd8ae93516a134f0c035` |
| CA7 | RSS-Gen — General Requirements for Compliance of Radio Apparatus, Issue 6（ISED 无线电设备合规通用要求） | Issue 6 2026-07-30 发布，Amendment 1 2026-09-15；取代 Issue 5（2018-04） | 160,041 | https://ised-isde.canada.ca/site/spectrum-management-telecommunications/en/devices-and-equipment/radio-equipment-standards/radio-standards-specifications-rss/rss-gen-general-requirements-compliance-radio-apparatus | `rss-gen.html` | `b8791fb4ec07c2d62ff49f7d3545d76d688b7ad49ac58786eae8559464e1dc20` |
| CA8 | Energy Efficiency Regulations, 2016 (SOR/2016-311)（能效条例） | P.C. 2016-1111，2016-12-28 刊于《加拿大公报》第二部分，发布后六个月生效（2017-06-28）；current to 2026-10-29, last amended 2025-10-09 | 1,191,113 | https://laws-lois.justice.gc.ca/eng/regulations/SOR-2016-311/FullText.html | `sor-2016-311.html` | `fc075cd3c99e0414e6a3d473780456f707a9716afa13cc09e42abbd2f22dae42` |
| CA9 | Electrical Safety Regulation, B.C. Reg. 100/2004（BC 电气安全条例） | Deposited 2004-03-23, effective 2004-04-01；consolidation current to 2026-11-10 | 71,990 | https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/100_2004 | `bc_esr_100_2004.html` | `a4d6edc4ac96fa59c7c76c3377a1f98b609b597309d2e419b8500184df28721a` |
| CA10 | O. Reg. 164/99: Electrical Safety Code（安大略省电气安全规范） | Consolidation period from 2025-05-01；Last amendment 449/24（采用 C22.1:24） | 11,557 | https://www.ontario.ca/laws/regulation/990164 | `ontario_reg_164_99.html` | `15eca486d1f45a82ee47535490add69a5cb4890423c6e86f455b7b33f4e6f027` |
| CA11 | Personal Information Protection and Electronic Documents Act, S.C. 2000, c. 5（个人信息保护与电子文件法） | Part 1 经 SI/2000-29 于 2001-01-01 生效；current to 2026-10-29, last amended 2025-03-04 | 221,452 | https://laws-lois.justice.gc.ca/eng/acts/P-8.6/FullText.html | `pipeda.html` | `76057cff329b8b9c6d0938036435160b42f4ad7bc715f391fb66eac9f7639f6e` |
| CA12 | Canada's Anti-Spam Legislation (CASL), S.C. 2010, c. 23 | s.6-9 经 SI/2013-127 于 2014-07-01 生效；current to 2026-10-29, last amended 2026-01-01 | 163,286 | https://laws-lois.justice.gc.ca/eng/acts/E-1.6/FullText.html | `casl.html` | `d3e5282657b10c7f0729e65d991cdb531355f94171c0665285723cdebbef2cd7` |
| CA13 | Consumer Protection Act, 2002, S.O. 2002, c. 30, Sched. A（安大略省消费者保护法） | Consolidation period from 2025-12-11；2004, c.19 相关修订于 2005-07-30 生效 | 309,500 | https://www.ontario.ca/laws/statute/02c30 | `ontario_cpa_02c30.html` | `d79f9cecf18f4146ea65e1d2186a4b80e965916dffc8e89183df97ad73064ac9` |
| CA14 | O. Reg. 17/05: General（安大略省消费者保护法一般条例） | Consolidation period from 2026-06-10；Last amendment 173/26 | 282,178 | https://www.ontario.ca/laws/regulation/050017 | `ontario_reg_17_05.html` | `dd9906ba29051622f514e799d5dd7bc8962d67138c587ad2dcb56e348106ebf7` |
| CA15 | Business Practices and Consumer Protection Act, S.B.C. 2004, c. 2（BC 商业实践与消费者保护法） | Assented 2004-03-31；s.238 规定由省督会同行政会议以条例指定施行日（本版未取得该施行条例）；consolidation current to 2026-11-10 | 651,939 | https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/04002_00_multi | `bclaws_04002_multi.html` | `5f2a400116528ff86181ce53e9209605ca9a472c1fdea78ebadb9bf9a48d6a32` |
| CA16 | Charter of the French Language, CQLR, c. C-11（法语宪章） | 官方页 `Updated to 5 June 2025`（Wayback 快照 2025-11-10 取件） | 954,208 | https://www.legisquebec.gouv.qc.ca/en/document/cs/C-11 | `legisquebec_c11_wayback.html` | `22ae065d237a97fa3e72695ae96fcea245bf043cac188f8aa2bebadf323def40` |

> 规则 JSON 中的 `official_url` 使用 laws-lois 的逐条页（`/section-XX.html`）、ISED 的 RSS-Gen 正文页、Ontario e-Laws / BC Laws 的单页法规；本表为便于复现列到文档级。

## 辅助来源（未作引文）

| 文件 | 说明 |
| --- | --- |
| Competition Bureau — Misleading representations and deceptive marketing practices | https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/misleading-representations-and-deceptive-marketing-practices ；用于交叉核对 Part VII.1 的条款口径，未作为引文来源 |
| Competition Bureau — Representations in electronic messages and web addresses | https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/representations-electronic-messages-and-web-addresses ；官方页明文「In force since July 1, 2014」，用于 s.74.011 的生效日佐证 |
| Consumer Protection BC — Understanding recent changes to BC's consumer protection laws | https://www.consumerprotectionbc.ca/guidance-for-businesses-law-changes/ （Updated August 2026）；用于 BC 远程销售合同修改的生效日佐证 |
| Breach of Security Safeguards Regulations (SOR/2018-64) | https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-64/FullText.html ；文内注 SI/2018-32 说明 s.10.1 于 2018-11-01 生效，未单独建规则 |

## 魁北克的访问与语言口径

1. `legisquebec.gouv.qc.ca` 在本环境（curl / 无头浏览器 / 代理三路）返回 **403**（CloudFront 拦截页 `ERROR: The request could not be satisfied`）。取件走 Wayback 对同一官方 URL 的 `20251110073630` 快照，快照页标注 `Updated to 5 June 2025`；重新取件须在可访问该站的环境下复核。
2. Charter of the French Language 的**官方文本为法语**；Légis Québec 提供官方英译本，本库引文取自该英译本（`language: en`、`source_tier: official_provincial_legislation_archived`、`confidence: medium`）。
3. **本产品按英语市场设计，v0.1 不覆盖魁北克**：`CA-QC-01`（产品铭文法语）、`CA-QC-02`（目录/宣传册/订单表法语）、`CA-QC-03`（公共标牌与商业广告法语）只作**风险标注**，不进入英语市场的常规诊断结论；若后续覆盖魁北克，须把这 3 条转为判定型规则并补齐法语原文引文。
4. 联邦层面的英法双语义务（`CA-LAB-04`，CPL Regulations s.6(2)）与魁北克的单语法语义务是**两个不同层级的义务**，不要混用：联邦要求「英法双语」，魁北克要求「法语为准且显著占优」。

## 复核清单（下次接手）

- `python3 ca/verify_excerpts.py --sources <dir>`（本文件表中的 16 个 HTML）→ 0 mismatch 为通过。
- 竞争法与 ISED 的现行版本会随修订更新；更新时先看 `idx_C-34.html` / `eer_idx.html` 的 `last amended on` 字段，再逐条重抓。
- `CA-QC-*` 三条在能访问 `legisquebec.gouv.qc.ca` 的环境里补一次实时核验。
