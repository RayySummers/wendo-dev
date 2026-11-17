# 坦桑尼亚法条规则库 v0.1 — 来源清单

核验日期：2026-11-17（UTC）。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文或官方英文版本。坦桑尼亚的成文法以英文印制；《个人数据保护法》第 44 章由总检察长依《法律解释法》第 1 章第 84(4) 条译为英文，属**官方英文版本**，不是商业翻译。斯瓦希里语版本仅用于交叉核对，不作为引文来源。

> 适用地域：本版只覆盖**坦桑尼亚大陆（Mainland Tanzania）**。桑给巴尔有独立的标准与消费者主管机关，未纳入 v0.1。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 总检察长办公室（OCPD）印制的官方法定汇编（Revised Edition + Annual Supplement），依《法律修订法》第 4 章第 5(7) 条发布 | 是 |
| `official_gazette` | 政府公报（Government Notice）发布的条例，或经公报发布的官方英文版本 | 是 |
| `official_regulator` | TCRA / TBS / FCC / PDPC 官网的指引、清单、FAQ | 是（指引类标 `guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、法律信息镜像站 | 否，仅作线索（本版未用于引文） |

## 主来源（官方法定汇编，OCPD）

全部为 2026-11-17 从 `ocpd.go.tz` 直接下载的 PDF；版本信息取自文首说明页（标明纳入修订的截止日、签署人与签署日期）。

| ID | 法规 / 文件 | 版本 | 页数 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TZ1 | The Fair Competition Act, Cap. 285（含 2020 年第 8 号法、2024 年第 13 号法修订） | R.E. 2023 + Annual Supplement 2025；纳入截至 2025-07-31 的修订；总检察长 Hamza S. Johari 签署 2025-10-28 | 109 | 774,632 | https://www.ocpd.go.tz/uploads/documents/sw-1788253646-CHAPTER%20285-THE%20FAIR%20COMPETITION%20ACT.doc%20%2021.pdf | `fca2003_ocpd.pdf` | `3293205d45258c458469f1b88cd1e513ef42217684aa4cc4986835fc04db5a30` |
| TZ2 | The Merchandise Marks Act, Cap. 85 | R.E. 2023 + Annual Supplement 2025；纳入截至 2025-07-31 的修订；2025-10-28 签署 | 23 | 304,269 | https://www.ocpd.go.tz/uploads/documents/sw-1788253940-CHAPTER%2085-THE%20MERCHANDISE%20MARKS%20ACT%20YENYE%20MAREKEBISHO%20YA%202025.pdf | `cap85_merchandise_marks.pdf` | `0a16f5d99bb70d90fc1b9e736748b0b58625fff9b52881e8f251f9878bf160a0` |
| TZ3 | The Standards Act, Cap. 130 | R.E. 2023 + Annual Supplement 2025；纳入截至 2025-07-31 的修订（含 2024 年第 14 号法）；2025-10-28 签署 | 50 | 498,856 | https://www.ocpd.go.tz/uploads/documents/sw-1788435217-CHAPTER%20130-%20THE%20STANDARDS%20ACT.pdf | `cap130_standards.pdf` | `52d022293b2db05140bb037aef52618de5a424a2f9cc9c2999d1e803cc47421e` |

## 主来源（条例与公报英文版）

| ID | 法规 / 文件 | 版本 | 页数 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TZ4 | The Electronic and Postal Communications Act, Cap. 306 | R.E. 2022；GN No. 461 公布 2022-06-24；修订截至 2022-06-15，依《法律修订法》第 4 章第 4 条印制 | 105 | 945,248 | https://www.tcra.go.tz/tcra-tovuti/2022/mamlaka-website/documents/regislation/acts/en_1670493092_The_Electronic_and_Postal_Communications_Act_R_E_2022_49c3d8e5fd.pdf | `epoca_re2022.pdf` | `edd9240d0a3be0f250ab3545f3c9336d238d607a7fc228cfa050320fcdb11d40` |
| TZ5 | The Electronic and Postal Communications (Electronic Communications Equipment Standards and E-Waste Management) Regulations, 2020（依 Cap. 306 s.165 制定） | GN No. 919，公布 2020-10-23 | 18 | 157,164 | https://www.tcra.go.tz/tcra-tovuti/2021/mamlaka-website/documents/regulations/en_1619088223_The_Electronic_and_Postal_Communications_Electronic_Communications_Equipment_Standards_and_E_Waste_Management_Regulations_2020_d7730df1f3.pdf | `epoca_equip_regs_2020.pdf` | `82de67f3fd12826179d5cac33eae14f9fdf0ad93c90cab957b5a335753c07ff8` |
| TZ6 | The Electronic and Postal Communications (Electronic Communications Equipment Standards and E-Waste Management) (Amendments) Regulations, 2024 | GN No. 886，公布 2024-11-01；修订 principal Regulations 的 reg.3、reg.4(4)、reg.7、reg.17、reg.18、reg.20、reg.21 与附表（**未触及 reg.5、reg.12、reg.26、reg.27**） | 11 | 291,870 | https://www.tcra.go.tz/tcra-tovuti/2024/mamlaka-website/documents/regulations/en_1732007296_THE_ELECTRONIC_AND_POSTAL_COMMUNICATIONS_ELECTRONIC_COMMUNICATIONS_EQUIPMENT_STANDARDS_AND_E_WASTE_MANAGEMENT_AMENDMENT_REGULATIONS_2024_1b1bb303a8.pdf | `epoca_equip_regs_2024_amend.pdf` | `9792a56ab0b39be9b0a2a6da9e4439b4e0453f9a2c2f55f405c87c65e2d1a5df` |
| TZ7 | The Personal Data Protection Act, Cap. 44（English version） | GN No. 395B，公布 2023-06-13；Special Supplement No. 21 至 2023-06-13 第 15 号特别公报（Vol. 104）；依《法律解释法》第 1 章第 84(4) 条发布的官方英文版本；总检察长 Eliezer Mbuki Feleshi 签署 | 42 | 835,674 | http://pdpc.go.tz/documents/3/PERSONAL_DATA_PROTECTION_ACT_2022.pdf | `pdpa2022.pdf` | `0c1ec2168bd30c95198eb70fee3db09052da83397100781df13e0bab8c77703f` |

> TZ7 的官方托管在个人数据保护委员会（PDPC）站点。该站 `https://www.pdpc.go.tz` 的 TLS 证书与主机名不匹配（`curl` 报 `no alternative certificate subject name matches target host name`），本版改由同站的 `http://pdpc.go.tz/documents/3/...` 取得同一文件；`official_url` 按实际可取回的形式记录，非二手托管。

## 交叉核对记录

| # | 核对对象 | 核对方式 | 结果 |
| --- | --- | --- | --- |
| C1 | TZ5/TZ6 的现行有效性 | 比对 TZ5 与 TZ6 的条文编号：TZ6 逐条列出被替换/新增的条例（reg.3、4(4)、7、17、18、20、21、附表），其中不含 reg.5（型号核准义务）、reg.12（标签）、reg.26（12 个月保修）、reg.27（罚则） | 一致：本库引用的 4 条在 2024 年修订后仍为原文 |
| C2 | TZ1 消费者条款的修订状态 | 核对 s.60 页边注「Act Nos. 8 of 2020 s.23 / 13 of 2024 s.16」与 s.58、s.59 的修订注记，确认罚则段落属现行合并文本 | 一致 |
| C3 | TZ7 的身份与版本 | PDPC 官网「POLICIES AND LEGISLATIONS」页列出「THE PERSONAL DATA PROTECTION ACT, 2022」，并链接到 `/documents/3/PERSONAL_DATA_PROTECTION_ACT_2022.pdf`；该链接指向的 PDF 首两页即公报封面与英文版说明 | 一致（同一文件） |
| C4 | FCA 条文文本 | 尝试以 TanzLII（`tanzlii.org`）镜像交叉核对 s.15/s.16 文本；该站对脚本请求返回 HTTP 403（Cloudflare 挑战），web_fetch 同样返回 403 | **未完成**，见「未取得来源」 |
| C5 | TCRA 型号核准指引 | 尝试取 `tcra.go.tz/laws-and-guidelines/guidelines/type-approval-guidelines-for-electronic-communications-equipment-2023-2` 与 type approval FAQ 作交叉核对；前者返回 HTTP 503，后者为 JS 渲染页（静态 HTML 无可读正文） | **未完成**，型号核准义务仅由 TZ5 条文支撑（属一级来源，不影响引文） |
| C6 | 各部法律的原始生效日 | 合并本 s.1(2)（生效条款）在汇编中标注为 omitted，未载明原始生效日 | **未取得**；`effective_date` 按合并版适用起点（2025-07-31）或公报公布日标注，见下节 |

## effective_date 的标注口径（重要）

官方法定汇编把各法的生效条款（如 FCA s.1(2)）标为 `[Omitted]`，汇编本身不载明原始生效日。为避免凭空填写日期，本版采用以下口径，并在每条规则的 `notes` 或本表中说明：

1. **OCPD 汇编来源（TZ1/TZ2/TZ3）**：`effective_date` 取该合并版纳入修订的截止日 **2025-07-31**，表示「本条引文自该合并版起适用」；principal Act 的原始生效日列入 open questions。
2. **公报公布的条例（TZ5/TZ6）**：`effective_date` 取公报公布日 **2020-10-23** / **2024-11-01**。
3. **PDPA（TZ7）**：`effective_date` 取 **2023-05-01**（据 2023 年 GN No. 395B-1 生效通知；该通知原件未取得，见 open questions）。

## 未取得来源（not_found / inaccessible）

| 目标 | 结果 | 影响 |
| --- | --- | --- |
| TanzLII 的 FCA / EPOCA 条文镜像 | HTTP 403（Cloudflare） | 无法做第三方文本比对；引文仍来自官方汇编，结论不受影响，但交叉核对少一路 |
| 《个人数据保护法》生效通知 GN No. 395B-1 of 2023 | 未检索到官方 PDF | `TZ-PDP-*` 的 `effective_date=2023-05-01` 属**未完全核实**；报告引用时应写「2023 年 5 月起施行（生效通知以官方公报为准）」 |
| 《个人数据收集与处理条例, 2023》全文 | PDPC 站点仅见条目链接，未取到 PDF | 注册细则、DPO 要求、跨境传输细则未建规则（v0.2） |
| TBS 强制标准（compulsory standards）清单 | `tbs.go.tz` 未提供可直接取回的强制标准列表页 | `TZ-STD-01` 只能判「需核实适用标准」，不能判定某品类已被列为强制标准 |
| 《电子与邮政通信（进口）条例》等 TCRA 其他条例 | 未检索 | 进口许可环节未建规则 |
| 桑给巴尔（Zanzibar）商品与标准法规 | 未检索 | 本版仅覆盖大陆 |
| 广告语言的成文义务（斯瓦希里语） | 未找到对商品页/标签设定语言的成文条款 | 语言义务只在 open questions 记录，不建规则 |

## 复现命令

```bash
mkdir -p tz-sources && cd tz-sources

# 官方法定汇编（OCPD，PDF 按版本固定）
curl -sSL -A "Mozilla/5.0" -o fca2003_ocpd.pdf \
  "https://www.ocpd.go.tz/uploads/documents/sw-1788253646-CHAPTER%20285-THE%20FAIR%20COMPETITION%20ACT.doc%20%2021.pdf"
curl -sSL -A "Mozilla/5.0" -o cap85_merchandise_marks.pdf \
  "https://www.ocpd.go.tz/uploads/documents/sw-1788253940-CHAPTER%2085-THE%20MERCHANDISE%20MARKS%20ACT%20YENYE%20MAREKEBISHO%20YA%202025.pdf"
curl -sSL -A "Mozilla/5.0" -o cap130_standards.pdf \
  "https://www.ocpd.go.tz/uploads/documents/sw-1788435217-CHAPTER%20130-%20THE%20STANDARDS%20ACT.pdf"

# TCRA：EPOCA 与设备条例
curl -sSL -A "Mozilla/5.0" -o epoca_re2022.pdf \
  "https://www.tcra.go.tz/tcra-tovuti/2022/mamlaka-website/documents/regislation/acts/en_1670493092_The_Electronic_and_Postal_Communications_Act_R_E_2022_49c3d8e5fd.pdf"
curl -sSL -A "Mozilla/5.0" -o epoca_equip_regs_2020.pdf \
  "https://www.tcra.go.tz/tcra-tovuti/2021/mamlaka-website/documents/regulations/en_1619088223_The_Electronic_and_Postal_Communications_Electronic_Communications_Equipment_Standards_and_E_Waste_Management_Regulations_2020_d7730df1f3.pdf"
curl -sSL -A "Mozilla/5.0" -o epoca_equip_regs_2024_amend.pdf \
  "https://www.tcra.go.tz/tcra-tovuti/2024/mamlaka-website/documents/regulations/en_1732007296_THE_ELECTRONIC_AND_POSTAL_COMMUNICATIONS_ELECTRONIC_COMMUNICATIONS_EQUIPMENT_STANDARDS_AND_E_WASTE_MANAGEMENT_AMENDMENT_REGULATIONS_2024_1b1bb303a8.pdf"

# PDPC：PDPA 官方英文版（注意 www 主机名证书不匹配，改走 http 同路径）
curl -sSL -A "Mozilla/5.0" -o pdpa2022.pdf \
  "http://pdpc.go.tz/documents/3/PERSONAL_DATA_PROTECTION_ACT_2022.pdf"

# 复算
sha256sum *.pdf
```

2026-11-17 复算结果（与上表一致即视为可复现）：

```
3293205d45258c458469f1b88cd1e513ef42217684aa4cc4986835fc04db5a30  fca2003_ocpd.pdf
0a16f5d99bb70d90fc1b9e736748b0b58625fff9b52881e8f251f9878bf160a0  cap85_merchandise_marks.pdf
52d022293b2db05140bb037aef52618de5a424a2f9cc9c2999d1e803cc47421e  cap130_standards.pdf
edd9240d0a3be0f250ab3545f3c9336d238d607a7fc228cfa050320fcdb11d40  epoca_re2022.pdf
82de67f3fd12826179d5cac33eae14f9fdf0ad93c90cab957b5a335753c07ff8  epoca_equip_regs_2020.pdf
9792a56ab0b39be9b0a2a6da9e4439b4e0453f9a2c2f55f405c87c65e2d1a5df  epoca_equip_regs_2024_amend.pdf
0c1ec2168bd30c95198eb70fee3db09052da83397100781df13e0bab8c77703f  pdpa2022.pdf
```

## 引文比对方法（verbatim_excerpt 的 0 处不匹配如何验证）

`pdftotext -raw` 抽取全文 → 规整（统一弯引号与破折号、把连续空白压成单个空格）→ **剔除页眉/页脚**（各法在每页重复的 `[CAP. xxx R.E. …] A.S. 2025` 行、`GN. No. xxx (Contd)` 行及其后的页码）→ 要求每条 `verbatim_excerpt` 作为连续子串出现。

结果：28 条全部匹配，0 处不匹配。唯一需要该规整的是 `TZ-ADV-06`（s.16(i) 的引文被 FCA 第 24/25 页的页眉与页码切断，见其 `notes`）。

> 说明：`pdftotext -layout` 会把页边注（如 "Misleading or deceptive conduct"）插入正文行间，导致引文被切断；`-raw` 保留了正文阅读顺序，是本库采用的比对基础。两种抽取方式均已人工抽样核对同一段落，文字一致。

## 辅助来源（仅线索，未进规则库）

| 来源 | 用途 |
| --- | --- |
| TCRA 官网「Official Regulations」列表 | 确认 TZ5/TZ6 的公布日期与官方条目 |
| TCRA 官网「Acts」列表 | 确认 TZ4 的 R.E. 2022 版本与下载路径 |
| PDPC 官网「POLICIES AND LEGISLATIONS」 | 确认 TZ7 的官方条目与文件路径 |
| OCPD 官网「Annual Supplement of 2025」列表 | 定位 TZ1/TZ2/TZ3 的三份汇编文件 |
