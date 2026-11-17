# 巴基斯坦法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：巴基斯坦宪法 Art. 251(2) 规定英语可继续用于公务，联邦与省级立法、公报、监管机关网站均有官方英文版本。本库引文一律取官方英文原文，不使用律所文章、商业数据库或二手翻译。

> 适用地域：巴基斯坦为联邦制。Competition Act 2010、PSQCA Act 1996、Sale of Goods Act 1930 适用于全巴基斯坦；Islamabad Consumers Protection Act 1995 仅适用伊斯兰堡首都区；旁遮普、信德两省消费者保护法仅在各自省内适用。规则中已就每条注明。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 联邦/省议会法案文本（Pakistan Code、省司法机关/省法务部门发布的合并文本） | 是 |
| `official_subsidiary` | 依母法发布的规例/公告（SRO、Gazette 公报） | 是 |
| `official_regulator` | PSQCA / NEECA 官网的指引、清单、FAQ | 是（指引类标 `guideline`，不能替代法条） |
| `official_archive_snapshot` | 官方 `.gov.pk` 页面的 Wayback 存档快照（仅在该官方站点从当前网络不可达时使用） | 是，但须同时记录官方 URL、快照时间戳与快照 SHA-256，并在 `official_url_note` 说明 |
| `secondary` | 律所文章、商业数据库、二手法律汇编（含 FAOLEX 等非政府托管的汇编） | 否，仅作线索；不得作为 `verbatim_excerpt` 的来源 |

## 主来源

全部为 2026-11-17 从官方域名（或注明之存档库）直接下载；版本信息取自文首/页脚。

| ID | 法规 / 文件 | 版本 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| PK1 | Competition Act, 2010（竞争法） | Pakistan Code 发布文本（未标合并版本号） | 294,557 | https://pakistancode.gov.pk/pdffiles/administratore1b5ab79c2c1975670e6aa7fe57e57d6.pdf | `competition2010.pdf` | `26fa4eef08472c85ac0b784e4536c9a5fb94af8b1f51e562d3c533c57fe5e947` |
| PK2 | Pakistan Standards and Quality Control Authority Act, 1996（PSQCA 法） | Pakistan Code 发布文本 | 291,066 | https://pakistancode.gov.pk/pdffiles/administratorbf3c739041f23d1715243047f9bab24c.pdf | `psqca1996.pdf` | `89fe473a21ad66a0ddbb908c6b9fc06081bda474fba57b7a79a3f1c3ddfb4f45` |
| PK3 | Islamabad Consumers Protection Act, 1995（首都区消费者保护法） | 文首标注「Updated till 3.8.2022」 | 239,502 | https://pakistancode.gov.pk/pdffiles/administratorbc4daf1cd281f7808ceb417c316f18ea.pdf | `icpa1995.pdf` | `1b4eb0ba3040e2f2caad8563c4b671890db5a98653edf02fd71fb89952f90cf2` |
| PK4 | Punjab Consumer Protection Act, 2005（Pb. Act II of 2005） | **官方站 `punjablaws.gov.pk/laws/477.html`**；原站从本环境不可达，引文取 **Wayback 2025-08-10 快照**（`20250810043230`）；页面为 Word 导出、**cp1252 编码**（按 UTF-8 解码会丢 en dash，导致 s.21 引文误判不匹配）；2025 年修正案（Pb. Act LIV of 2025）是否并入未核 | 170,348 | http://punjablaws.gov.pk/laws/477.html（快照：https://web.archive.org/web/20250810043230/http://www.punjablaws.gov.pk/laws/477.html） | `punjablaws_477_20250810.html` | `adca892e1b23be868ee9c582dd4470a8b7718b71a8fbcd7ab0c56b29967ae3b9` |
| PK5 | Sindh Consumer Protection Act, 2014（Sindh Act No. XVII of 2015；文首「Amendment up to date: Sindh Act No. XXIX of 2023」） | 信德司法学院（Sindh Judicial Academy）更新版 | 1,219,223 | https://sja.gos.pk/assets/Updated_Laws/Sindh%20Consumer%20Protection%20Act%2C%202014.pdf | `SindhConsumerProtectionActC14.pdf` | `700b9e166973a155f3f8265ec92d459b3aa6c603e913fce90b7441ff13631ea6` |
| PK6 | Sale of Goods Act, 1930（货物买卖法） | Pakistan Code 发布文本 | 395,246 | https://pakistancode.gov.pk/pdffiles/administrator03eadfb5474bfa7c9e45ab4558d5a926.pdf | `sog1930.pdf` | `ac89374529aa0d4929fa1feb5fefc6106c0513187dfde2d8b05ce9042e2a5fd8` |
| PK7 | Constitution of the Islamic Republic of Pakistan（宪法，Art. 251） | Pakistan Code 发布文本 | 1,184,244 | https://pakistancode.gov.pk/pdffiles/administrator9d8e2ecc414c6d3371ac41114b61a2c4.pdf | `constitution.pdf` | `bd0caf96b8ea2b257e7dd5d70684fba71b70e41e7c64720314d9ba619b4009e9` |
| PK9 | S.R.O. 46(KE)/2020（依 PSQCA Act s.14；Gazette of Pakistan, 2020-10-03） | 扫描件（CamScanner），4 页 | 759,446 | https://www.psqca.com.pk/SRO_108_ITEMS_files/SRO46(KE)&47(KE).pdf | `sro46_47_2020.pdf` | `3dab1b82854235785a1f4f9f840e9e2358b854f71211af0bca8118350c0e9cff` |
| PK10 | National Energy Efficiency and Conservation (Pakistan Energy Labels for Fans) Regulations, 2023（S.R.O. 411(I)/2024；Gazette 2024-03-20） | 扫描件，18 页 | 4,039,552 | https://neeca.pk/neecagov/regulations/SRO411(I)-2024.pdf | `sro411_2024.pdf` | `40da2307a9d270aaeeec4b0b7625d36970b0aa1fbdf8d985a19e4606335e9af4` |

## 主来源（监管机关页面，`article_type=guideline`）

| ID | 文件 | 版本 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| PK8 | PSQCA — List Of Compulsory Item to meet Pakistan Standards（强制认证商品清单，S# 1–176，共 176 项） | 抓取于 2026-11-17 | 151,326 | https://www.psqca.com.pk/confirmity-assessment-ca/list-of-compulsory-item-to-meet-pakistan-standards/ | `psqca_compulsory.html` | `22cf03a85c00f785e1865cc8480e85b34e44da0168bdf39da1165eb8d7c3796a` |
| PK11 | PSQCA — Conformity Assessment 概述（Pakistan Conformity Assessment Rules 2011；「105 products so far」的技术法规口径） | 抓取于 2026-11-17 | 108,042 | https://www.psqca.com.pk/confirmity-assessment-ca/ | `psqca_ca.html` | `869f3c221ca66c685da1dda4712129436c2b32485fa15a71a9fd8534fe4e385c` |
| PK12 | PSQCA — Enforcement of Standards（公报公告 + 两个月申请期 + CM 许可流程） | 抓取于 2026-11-17 | 112,437 | https://www.psqca.com.pk/confirmity-assessment-ca/enforcement-of-standards/ | `psqca_enforcement.html` | `bbed3b0ad2742d1645b0e23a1799b5523d9383b160593d4aa8711f28456fae5e` |
| PK13 | NEECA — Registration of Fans under Pakistan Energy Label Regulations（PELR）：强制性与适用风扇类型（FAQ） | 抓取于 2026-11-17 | 41,818 | https://neeca.gov.pk/Detail/NGExMDk0M2UtNTI3Ni00N2M0LTgyYzMtZjQyZDk2MTY1ODgx | `neeca_pelr_fan.html` | `117ab6997161398ff428d20998d9414ed3213dbfa78a86061d80ccf99a94d961` |

> PK8 / PK11 / PK12 / PK13 未标注发布或更新日期，规则中的 `effective_date` 取所依据的法条/公告日期；这类条目在报告中只能作为「监管机关口径」引用，不能单独当法条。

## 引文核对记录

| 范围 | 核对方式 | 结果 |
| --- | --- | --- |
| PK1/PK2/PK3/PK5/PK6 + PK8（24 条引文） | `pdftotext -layout` / HTML 可见文本抽取后逐条字符串匹配（归一化空白/引号/连字符），脚本随库提供：`python3 verify_excerpts.py --sources <dir>` | 24/24 命中，0 处不匹配 |
| PK4（7 条引文） | 官方页面 `punjablaws.gov.pk/laws/477.html` 的 Wayback 2025-08-10 快照，**按 cp1252 解码**后逐条匹配 | 7/7 命中，0 处不匹配（详见下「编码陷阱」） |
| PK9（1 条）、PK10（3 条） | 扫描件：200 dpi 转图 → Tesseract OCR 定位 → **人工逐字读图复核**（见下「OCR 说明」） | 4/4 与图像一致 |

> PK7（宪法）、PK11/PK12（PSQCA 概述与执法页）、PK13（NEECA FAQ）不承载规则引文，仅用于背景与负向结论（语言义务、强制认证口径），故不参与引文比对。

### 编码陷阱（PK4）

`punjablaws.gov.pk/laws/477.html` 是 Word 导出的 HTML，页面字符集为 **cp1252**，s.21 引导句中的 en dash（`0x96`）在 UTF-8 下是非法字节。若用 `decode('utf-8', 'ignore')` 读取，该 dash 会被静默丢弃，`PK-PB-01` 的引文（`…representation that– (a)…`）就会误判为不匹配——**会得到 6/7 的假阴性**。`verify_excerpts.py` 已改为先试 UTF-8、失败回退 cp1252。

### OCR 说明（重要）

- PK9 与 PK10 的官方 PDF 均为**扫描图像**，无文字层，`pdftotext` 输出为空。引文不是 OCR 直出，而是「OCR 定位 + 人工读图逐字核对」，因此 `notes` 中已标注扫描件来源。
- PK10 的关键条文（reg.3(1)、reg.3(2)、reg.4(7)）已逐页读图确认；附表（Schedules）为竖排表格，本次**未转录**，因此罚金具体数额未写入规则。
- 凡以 OCR/扫描件为依据的条目，`confidence` 仍为 `high`（图像清晰、逐字核对），但**在引用时应同时给出 PDF 页码**，便于复核。

## 不可达来源与替代路径

| 目标 | 现象 | 处理 |
| --- | --- | --- |
| `www.pta.gov.pk`（PTA 型号核准规例、Type Approval Procedures、Terminal Equipment 清单） | TLS 握手失败（`SSL_ERROR_SYSCALL`），HTTP 亦被重置 | `web.archive.org` 返回「Temporarily Offline」；本次**放弃**，登记为 open question 1，3C 品类不开放 |
| `punjabcode.punjab.gov.pk` / `punjablaws.gov.pk`（旁遮普省法典） | TLS 握手失败 / 连接被重置（`SSL_ERROR_SYSCALL`） | 引文改用**官方页面 `punjablaws.gov.pk/laws/477.html` 的 Wayback 2025-08-10 快照**（PK4）；7 条引文与该快照逐字核对 **7/7 一致**；FAOLEX 版本已停用 |
| `www.commerce.gov.pk`（Import Policy Order 2022） | 403 Forbidden（含 PDF 直链） | `tipp.gov.pk` 仅取到 S.R.O. 750(I)/2025；IPO 2022 标签条款未取得，登记为 open question 7 |
| `www.ccp.gov.pk`（竞争委员会指引） | TLS 握手失败 | 未使用；规则只依据 Competition Act 原文 |
| `kpcode.kp.gov.pk`（KP 省法典，含 KP Consumer Protection Act 1997） | TLS 握手失败，HTTP 301 后仍不可达 | 未建 KP 规则，登记为 open question 6 |
| `www.pakistancode.gov.pk`（PECA 2016、PT(Re-Org) Act 1996） | 检索无结果/间歇性 TLS 失败 | 未取得全文，隐私与 3C 章节因此空缺 |

## 未取得来源（`not_found`）

1. Prevention of Electronic Crimes Act, 2016（PECA）全文 — Pakistan Code 未收录，`moitt.gov.pk` 未检索到正文。
2. Pakistan Telecommunication (Re-Organization) Act, 1996 与 PTA 型号核准规例 / 设备清单。
3. Import Policy Order, 2022（SRO 545(I)/2022）标签条款。
4. KP Consumer Protection Act, 1997（经 KP Act II of 2005、XVII of 2015 修订）官方合并文本。
5. Balochistan Consumer Protection 相关省法。
6. PS:185、PS:253、PS:5254 等 PS 标准正文（付费/受限；官网部分 PDF 链接错配，如 PS IEC 60669-1 指向油漆刷标准文档）。
7. NEECA PELR 附表 V 的罚金数额（扫描件表格未转录）。

## 复现命令

> 说明：本环境下多个 `.gov.pk` 站点的证书链不完整，`curl` 需加 `-k`；HTML 站点需带浏览器 UA，否则返回 403/空页。

```bash
mkdir -p pk-sources && cd pk-sources
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

# 联邦法（Pakistan Code，PDF 直链按 hash 固定）
curl -sSLk -A "$UA" -o competition2010.pdf https://pakistancode.gov.pk/pdffiles/administratore1b5ab79c2c1975670e6aa7fe57e57d6.pdf
curl -sSLk -A "$UA" -o psqca1996.pdf      https://pakistancode.gov.pk/pdffiles/administratorbf3c739041f23d1715243047f9bab24c.pdf
curl -sSLk -A "$UA" -o icpa1995.pdf       https://pakistancode.gov.pk/pdffiles/administratorbc4daf1cd281f7808ceb417c316f18ea.pdf
curl -sSLk -A "$UA" -o sog1930.pdf        https://pakistancode.gov.pk/pdffiles/administrator03eadfb5474bfa7c9e45ab4558d5a926.pdf
curl -sSLk -A "$UA" -o constitution.pdf   https://pakistancode.gov.pk/pdffiles/administrator9d8e2ecc414c6d3371ac41114b61a2c4.pdf

# 省法
# 旁遮普：官方站从本环境不可达，取 2025-08-10 快照（与 rules.v0.1.json 的 PK-PB-01~07 引文逐字核对 7/7）
curl -sSLk -A "$UA" -o punjablaws_477_20250810.html \
  "https://web.archive.org/web/20250810043230/http://www.punjablaws.gov.pk/laws/477.html"
curl -sSLk -A "$UA" -o SindhConsumerProtectionActC14.pdf "https://sja.gos.pk/assets/Updated_Laws/Sindh%20Consumer%20Protection%20Act%2C%202014.pdf"

# 公告与规例（扫描件）
curl -sSLk -A "$UA" -o sro46_47_2020.pdf "https://www.psqca.com.pk/SRO_108_ITEMS_files/SRO46(KE)&47(KE).pdf"
curl -sSLk -A "$UA" -o sro411_2024.pdf    "https://neeca.pk/neecagov/regulations/SRO411(I)-2024.pdf"

# 监管机关页面
curl -sSLk -A "$UA" -o psqca_compulsory.html  "https://www.psqca.com.pk/confirmity-assessment-ca/list-of-compulsory-item-to-meet-pakistan-standards/"
curl -sSLk -A "$UA" -o psqca_ca.html          "https://www.psqca.com.pk/confirmity-assessment-ca/"
curl -sSLk -A "$UA" -o psqca_enforcement.html "https://www.psqca.com.pk/confirmity-assessment-ca/enforcement-of-standards/"
curl -sSLk -A "$UA" -o neeca_pelr_fan.html    "https://neeca.gov.pk/Detail/NGExMDk0M2UtNTI3Ni00N2M0LTgyYzMtZjQyZDk2MTY1ODgx"

sha256sum *.pdf *.html
```

重新下载后应满足：8 个 PDF 与 4 个 HTML 的 SHA-256 与本文件一致（HTML 页面若监管机关改版，hash 会变，此时应在版本记录中登记并重抓清单）。
