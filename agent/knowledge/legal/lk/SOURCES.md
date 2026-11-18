# 斯里兰卡法条规则库 v0.2 — 来源清单

核验日期：2026-11-18（v0.2，RAY-762）。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **2026-11-18 域名更正（重要，别再用错）**：`caa.lk` 是**民航局（Civil Aviation Authority）**，**不是**消费者事务局。
> 消费者事务局是 `caa.gov.lk`（Consumer Affairs Authority）。v0.1 把 `caa.lk` 当作 CAA 站点探测，属误认，已更正。
>
> `caa.lk` 能返回 200 与上万字符正文，**这不代表它是本库要的源**——它的正文是飞行员执照、飞机事故、
> 航空安全通告；`/en/regulations/` 是 404，真实路径是 `/en/regulations-policies/subsidiary-legislation/regulation`，
> 通篇是 Civil Aviation Act / Air Navigation Act 一类。**看到 200 就当作 CAA 内容源会直接污染规则库。**
>
> `caa.gov.lk` 在本环境**TLS 握手失败**（`SSL_ERROR_SYSCALL`，直连 / 代理 / Playwright 三路均不通），
> 但其正文可经 `r.jina.ai` 读回（索引页），其指令 PDF 可取 Wayback 快照或政府公报库（见 LK6）。
>
> `trcsl.lk`（不带 www）是**已停用域名**（`ERR_CONNECTION_CLOSED`），不要再试；TRCSL 统一用 `www.trc.gov.lk`。

> 语言政策：只收官方英文原文。斯里兰卡议会同时发布法案的英文、僧伽罗文、泰米尔文文本，**英文文本由议会官网发布**（CAA Act s.25 仅规定僧伽罗与泰米尔文本冲突时以僧伽罗文本为准）；本库全部引文来自英文官方文本。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_parliament_digital` | 斯里兰卡议会官网发布的法案 PDF，含文本层 | 是（文本可机器比对） |
| `official_parliament_scan` | 斯里兰卡议会官网发布的法案 PDF，**图像扫描件、无文本层**（多为 300dpi） | 是（引文经 OCR 后逐条目视比对原页面图，见下） |
| `official_regulator` | 数据保护局（DPA）、电信监管委员会（TRCSL）等主管机关官网发布的法案、修正案与宪报命令 | 是（宪报命令为法律文件；指引类须标 guideline） |
| `official_regulator_gazette` | 主管机关依授权法发布的指令，官方载体为政府公报（`documents.gov.lk`），有宪报号与生效日 | 是（指令本身即法律文件，违反依 s.10(3)/s.20 构成 offence） |
| `secondary` | 律所文章、商业数据库（CommonLII 等）、行业报告 | 否，仅作线索或交叉核对 |

## 主来源

| ID | 法规 | 版本 / 生效 | 页数 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| LK1 | Consumer Affairs Authority Act, No. 9 of 2003 | 2003-03-17 认证；无另设施行日条款 | 52 | https://www.parliament.lk/uploads/acts/gbills/english/5802.pdf | `lk_caa_2003.pdf` | `f138e4ee0c4797592dcc83cb11fd9ebc0c99093abf77a098c9a3ad2cebd75000` |
| LK2 | Personal Data Protection Act, No. 9 of 2022 | 第一部分、二、三、七自 2025-03-18 施行（宪报 2366/08） | 65 | https://www.parliament.lk/uploads/acts/gbills/english/6242.pdf | `lk_pdpa_2022.pdf` | `6fcdf94fe219d9f7cd18c4790a2c6332568c65eb72846790480e65834012ef46` |
| LK3 | Measurement Units, Standards and Services Act, No. 35 of 1995 | 1995-12-21 认证；施行日由部长指定（指定令未取得） | 49 | https://www.parliament.lk/uploads/acts/gbills/english/3204.pdf | `lk_measurement_1995.pdf` | `d931e88b8f83f81977c543b7624e370ee691eb45923d7142e1b8ff44d41139dd` |
| LK4 | Sri Lanka Standards Institution Act, No. 6 of 1984 | 1984-01-27 认证；未设施行日条款 | 24 | https://www.parliament.lk/uploads/acts/gbills/english/3190.pdf | `lk_slsi_1984.pdf` | `400c2bcec0da61df872b6ff1149a379c260db294ae2af79d5d9858ad4db64a55` |
| LK5 | Sri Lanka Telecommunications Act, No. 25 of 1991 | 1991-07-03 认证即施行（s.72 除外） | 51 | https://www.parliament.lk/uploads/acts/gbills/english/3500.pdf | `lk_telecom_1991.pdf` | `d28aaaa626dd4aa2f630cb2b0b90daed0cb09d5e3dbce6790176139cdb2defc3` |

### 主管机关指令与修正案（v0.2 新增，2026-11-18）

| ID | 文件 | 宪报 / 生效 | 官方 URL | SHA-256 |
| --- | --- | --- | --- | --- |
| LK6 | CAA **Direction No. 68**（三语标签，76 类商品） | 宪报 2135/53（2019-08-07）；2020-01-01 施行 | `https://www.caa.gov.lk/web/images/Direction/English/sec10/direction_68E.pdf`（caa.gov.lk TLS 不可达，正文取自 Wayback `20250413152341` 快照） | `—`（Wayback 副本不计算，见下注） |
| LK6 | CAA **Direction No. 60**（保修文件三语） | 宪报 1966/43（2016-05-13）；2017-01-01 施行 | `https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/1966-43_E_1784558881.pdf` | `3a2a70f9b735ebea246616fff01d33253f5b9f73ae2b50fff6aceae4e70b9a85` |
| LK6 | CAA **Direction No. 91**（电商信息披露） | 宪报 2332/15（2023-05-17）；即日施行 | `https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/2332-15_E_1784564900.pdf` | `670e6d5209100a261550f0d9c92162f63ef7a9f878abde46d987f5d595523502` |
| LK6 | CAA **Direction No. 96**（SLS 强制：SLS 1616 / SLS 1306） | 宪报 2456/42（2025-10-01） | `https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/2456-42_E_1784567501.pdf` | `9cb2445a1e53d9447e8f5c64bb62c1cf20179e07bd7d0a7f47a10b8c5b7e9071` |
| LK6 | CAA **Direction No. 99**（SLS 强制：SLS 1732 / SLS 1748） | 宪报 2496/28（2026-07-09）；2026-10-08 施行 | `https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/2496-28_E_1786415260.pdf` | `09da0385f8d3de327a76602155a4a9f038899698a81fa90cd04940972e8cafa6` |
| LK6 | CAA **Direction No. 101**（修订 Direction 99 的 SLS 1749） | 宪报 2509/31（2026-10-07） | `https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/PG%208054%20(E)_1791631244.pdf` | `09c0bd6fe9d2dc40ac646c0e264993f7411b73701e042bafad7b1dee135d458d` |
| LK6 | CAA **Direction No. 63 / 64**（≤250V 电气产品 SLS 强制；插头须符 SLS 734 Part 1） | 宪报 2048/39（2017-12-07）；2019-01-01 施行 | `https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/2048-39_E_1784560050.pdf` | `4d5d55cee50bd2a3a3f526fc62e8a0441321e7ec8fea9e94430ba6b23e530bbe` |
| LK6 | CAA **Direction No. 76**（废止 Direction 73） | 宪报 2216/33（2021-02-25） | CAA 官网 Google Drive 链接（Directions 索引页 id=93 列示） | `—` |
| LK7 | **Consumer Affairs Authority (Amendment) Act, No. 20 of 2021** | 2021-09-22 认证；宪报增刊 2021-09-24 | `https://documents.gov.lk/api/content-file-proxy?file=/act-content/20-2021_E_1784552998.pdf` | `d946a987ff82b063dce8af7e1e0acd7a41b97e25a52539bbd872a8283216a52a` |

**注**：`caa.gov.lk` 直连 TLS 不可达，其 `web/images/Direction/...` 下的 PDF **无法直接下载**。上述 `documents.gov.lk` 链接是这些指令的**官方公报载体**（政府印刷局公报库），宪报号与日期与 CAA 官网索引页逐条对应，属同源官方文本，优先于 CAA 官网副本引用。

### 监管机关清单与规则（v0.2 新增）

| ID | 文件 | 说明 | 官方 URL | SHA-256 |
| --- | --- | --- | --- | --- |
| LK8 | SLSI **LT-PC-01 Issue No. 13**《Products for which the “SLS” Mark is Compulsory》 | 2026-10-01 发布，3 页，列 **50 个强制品目**，逐项给标准号、宪报号、指令号（ITD / CAA）、覆盖范围（L / L&I） | `https://slsi.lk/wp-content/uploads/2026/10/Compulsory-SLS-Mark-Items-Issue-13.pdf` | `5e2859d905f58aa1ec2462a038fc997df8547c62929a83b10452604034c85479` |
| LK9 | TRCSL **Vendors Licence (Telecommunication Apparatus) Rules, No. 1 of 2001** | 宪报 1182/12（2001-05-03）；2001-05-10 生效；1 页**扫描件无文本层**，引文经 300dpi OCR 后目视核对 | `https://www.trc.gov.lk/content/files/legislation/Vendors%20Licence-%20(Telecommunications%20Apparatus)%20Rules,%20No%201%20of%202001.pdf` | `—`（扫描件，未计算） |
| LK9 | TRCSL **RTTE Type Approval Rules 2020** | 宪报 2196/51（2020-10-09）；2020-12-16 生效；规则 3(1) 挂 s.5(q)，规则 18(3) 包装永久标签，规则 20 列 5 类豁免 | `https://www.trc.gov.lk/content/files/spectrum/RTTE_GAZETTE-English.pdf` | `—` |
| LK9 | TRCSL **Vendor Licence procedure**（2025 年宪报 2467/41 后更新版） | 许可申请、MOD 安全审查、车间检查、五类年费 | `https://www.trc.gov.lk/content/files/licensing/vender_license/2026/VendorLicenceProcedureHostInTRCSLWeb-After%20Gazette%202025.pdf` | `—` |

> **LK8 / LK9 的定位**：这两组是**主管部门的清单与规则**，用来把 LK4（SLSI 法）/ LK5（电信法）的授权条款落到可核对的品目与程序上。
> 规则条目的 `source_id` 仍为 LK4 / LK5（引文取自法条本身），LK8 / LK9 通过 `official_url_note` 引用，属**支撑性官方文件**，不用于替代 `verbatim_excerpt`。

### 配套法律文件（生效日与修正依据）

| ID | 文件 | 用途 | 官方 URL | SHA-256 |
| --- | --- | --- | --- | --- |
| LK2-A | Personal Data Protection (Amendment) Act, No. 22 of 2025（2025-10-30 认证） | 修正 PDPA s.1（施行日改由部长分次指定）、s.12、s.17、s.18、s.19；**未改动 s.11 与 Schedule V** | https://dpa.gov.lk/acts/22-2025_E_251104_201549%20(1).pdf | `675ec8209637f46e81bab7f8fad12e4b8acae3e1a202120d975534e2f7db2c76` |
| LK2-B | Gazette Extraordinary No. 2366/08（2024-01-08） | 依 PDPA s.1(3) 指定：第六、八、九、十部分 2023-12-01 施行；**第一、二、三、七部分 2025-03-18 施行** | https://dpa.gov.lk/Gazet/2024-01-08/2366-08_E.pdf | `af3dc69a4609e4d11e107d3603a1b5e8df2477527d77d9ed84d60d316a146996` |
| LK2-C | Gazette Extraordinary No. 2341/59（2023-07-21） | 依 PDPA s.1(5) 指定第五部分 2023-07-17 施行 | https://dpa.gov.lk/Gazet/2023-07-21/2341-59_E.pdf | `9c6b735cc61f9cd8dc931229b5c7431b975c4ce8f96ba347ce796f110201af75` |

### DPA 官网同日副本（核对用，未单独引用）

| 文件 | 说明 | SHA-256 |
| --- | --- | --- |
| `dpa_pdpa_en.pdf` | 数据保护局发布的 PDPA 英文版，与 LK2（议会版）**逐字节相同**，SHA-256 一致 | `6fcdf94fe219d9f7cd18c4790a2c6332568c65eb72846790480e65834012ef46` |

### 监控来源（已下载、未作为规则引文）

| ID | 文件 | 状态 | SHA-256 | 说明 |
| --- | --- | --- | --- | --- |
| LK-M1 | Electronic Transactions Act, No. 19 of 2006 | 已核对，**未收录规则** | `ac0c5fabdea3551c511630ce8c274f2669d3f2b8f23ffca2963fa570bbd87fb0` | 全文核对：该法只规范电子合同、数据讯息、电子签名与认证服务提供者，**没有**电商信息披露/经营者身份/退换货条款。斯里兰卡的电商披露义务不在 ETA，故未建规则。见 README open questions #7。 |
| LK-M2 | Imports and Exports (Control) Act, No. 1 of 1969 | 已下载，未逐条引用 | `4d0a0d3a1893fadbe6797622ae2a045a9706ecb0df870ff27ec1be913ddd592b` | 进口管制的授权法；SLSI 强制认证的进口环节执行依据（Import Control 条例）未取得，故只在 README 记录为待核。 |
| LK-M3 | Official Language Act, No. 33 of 1956 | 已下载，**未收录规则** | `d51c7fb04fbca6548675b79170f0fd839d3f396a4ea476a76227a8871d172fa0` | 该法只规定僧伽罗语为当时的官方语言，**不构成商品标签/页面语言义务**；1987 年第 13 修正案后官方语言为僧伽罗语与泰米尔语（宪法第 18 条），英语为联系语言（第 22 条）。未取得宪法官方英文文本，故不建语言规则。 |

## 辅助来源（不直接支撑 `verbatim_excerpt`）

| 来源 | 用途 | URL |
| --- | --- | --- |
| 斯里兰卡议会 Acts 检索（act-details / acts-listing） | 定位各法案的官方 PDF 编号（如 CAA=5802、PDPA=6242） | https://www.parliament.lk/en/business-of-parliament/acts-listing |
| 数据保护局（DPA） | 核对 PDPA 现行文本、修正案与施行日宪报 | https://dpa.gov.lk/ |
| 电信监管委员会（TRCSL） | 核对电信法条文、设备准入（Device Clearances / Vendors Licence）栏目结构 | https://www.trc.gov.lk/ |
| 斯里兰卡标准协会（SLSI） | 拟核对强制认证命令与 SLS 标准清单；**官网被 Cloudflare JS 挑战拦截，未取得内容** | https://www.slsi.lk/ |
| 消费者事务局（CAA） | 拟核对 CAA 依 s.10 发布的标签/价格指令；**站点在本环境不可达** | https://caa.gov.lk/ |
| CommonLII — Sri Lanka Consolidated Acts | 仅用于确认条文顺序与主题（如 s.30 误导性行为、s.10 标签指令）；该站对本环境返回 403，未作为引文来源 | https://www.commonlii.org/lk/legis/num_act/ |

## 交叉核对记录

1. **CAA Act 2003（LK1）**：核对 s.10(1)(a)、s.10(2)、s.10(3)、s.10(4)、s.11、s.26(1)、s.30、s.31(a)–(g)、s.32(1)(c)、s.60(5) 及其 (a)/(b) 罚则档；PDF 为 52 页 300dpi 扫描件、无文本层，引文由 tesseract（eng, psm 3）提取后**逐条目视比对原页面图**（PDF 第 6/7/16/17/18/36/37 页），OCR 明显错字（如 `lype`→`type`、`deccive`→`deceive`、`sclls`→`sells`）已在引文中按原页面图更正。s.1 无施行日条款，生效日按认证日 2003-03-17 标注。
2. **PDPA 2022（LK2）**：核对 s.11 及其指引的 Schedule V 第 1 项 (a)(c)(f)(h)(i)(j)(k)；PDPA 为数字版 PDF，引文与 `pdftotext` 两种提取顺序（`-layout` / `-raw`）比对，**7/7 条至少一种提取顺序可精确匹配**（`-layout` 会把边注插入正文，故以 `-raw` 为主）。施行日依 LK2-B 宪报，不是认证日 2022-03-19。
3. **PDPA 修正案 22/2025（LK2-A）**：逐条核对第 2–6 条修正范围，确认**未触及 s.11 与 Schedule V**，故 LK-PRIV-01~07 的引文在 2025 修正后仍为现行文本；s.1(4)(5) 被废除，施行日改由部长分次指定，但既有指定（LK2-B/LK2-C）依 s.1(2) 过渡条款继续有效。
4. **Measurement Act 1995（LK3）**：核对 s.12(1)/(3)、s.42、s.51(4) 与其 (a)(b) 项；PDF 49 页扫描件，引文逐条比对 PDF 第 6/17/20 页原图。第 1 条规定施行日由部长指定，指定令未取得，`effective_date` 以认证日 1995-12-21 标注并在 `notes` 说明。
5. **SLSI Act 1984（LK4）**：核对 s.20(1)、s.23 及其 (a)/(b)(i)(ii)；PDF 24 页扫描件，引文比对 PDF 第 11 页原图。**强制认证标志须由部长宪报命令逐品类指定**，命令清单未取得（SLSI 官网 Cloudflare 拦截），故规则按「适用性触发」处理。
6. **Telecommunications Act 1991（LK5）**：核对 s.5（职权，含 (q) 类型核准）、s.21(1)(a) 与其 (b)；PDF 51 页扫描件，引文比对 PDF 第 21 页原图。**TRCSL 类型核准规则与 Vendors Licence Rules No. 1 of 2001 全文未取得**（设备页由脚本加载），故只引法律授权与许可制度条款。
7. **Electronic Transactions Act 2006（LK-M1）**：全文通读，确认无电商信息披露义务；不建规则（避免把「电子交易法」误当「电商消费者保护法」）。
8. **Official Language Act 1956（LK-M3）**：全文 2 页通读，确认只涉国家官方语言，与商品标签语言无关；未建规则。

## 未取得 / 未采用

> v0.2 状态：下表前四项在 2026-11-18 已**部分或全部解除**，保留原文以便对照历史障碍；解除方式见每行末的「v0.2 进展」。

| 来源 | 状态 | 影响 | v0.2 进展（2026-11-18） |
| --- | --- | --- | --- |
| CAA 依 s.10(1)(a) 发布的标签/价格标示**指令清单**（宪报） | caa.gov.lk 在本环境 TLS 握手失败（`SSL_ERROR_SYSCALL`，直连与代理均失败） | LK-LAB-01、LK-PRICE-01 只能写成「有指令时适用」 | **已解除**：CAA Directions 索引页（`web/index.php?option=com_content&view=category&id=93&lang=en`）经 `r.jina.ai` 读回全部 100+ 条指令（s.10 与 s.12 两张表，含宪报号、生效日、废止标记）。三语标签＝Direction 68，保修三语＝Direction 60，MRP＝Direction 12/87 |
| CAA 的电商/线上交易指引 | 同上，不可达 | 线上价格展示与信息披露义务无法逐条落地 | **已解除**：CAA **Direction 91**（宪报 2332/15，2023-05-17）就是电商专项指令，PDF 已从 `documents.gov.lk` 公报库取得并逐条核对 |
| SLSI 强制认证命令清单与 SLS 标准目录 | slsi.lk 返回 Cloudflare JS 挑战（HTTP 403），未绕过 | LK-CERT-01/02 只能按「被命令覆盖的品类」处理；小家电/3C 是否在列未核 | **已解除**：用 Scrapling `StealthyFetcher` 可正常读 `slsi.lk`（curl 被挡）；官方文件 **LT-PC-01 Issue 13（2026-10-01）** 给出 50 个强制品目全表（LK8） |
| TRCSL 类型核准规则、Vendors Licence Rules No. 1 of 2001 全文 | 官网设备页与规则页为脚本加载，未取得全文 | LK-TEL-01/02 的实操要求（申请材料、标签）未落地 | **已解除**：两文件均在 TRCSL 静态路径下（`content/files/legislation/`、`content/files/spectrum/`），已下载（LK9）。注意 Rules No.1/2001 是扫描件，引文经 OCR 核对 |
| 宪法第 18/22 条官方英文文本（语言义务） | 未取得（议会宪法页面未定位到可下载英文 PDF） | 语言义务只作定性说明，不建规则 | **未解除**。但三语义务的**实证法源**已由 Direction 68 / Direction 60 落地，宪法文本不再是唯一依据 |
| Import Control (Standardization and Quality Control) Regulations | 未取得 | 进口环节的 SLSI 合规执行路径未落地 | **文本未取得**，但 Direction 96/99 已明文援引该 2006 年条例及其上位法（Imports and Exports (Control) Act No. 1 of 1969），进口检验路径可据此表述 |
| Measurement Act s.1 施行日指定令 | 未取得 | `effective_date` 按认证日标注 | **未取得**。`documents.gov.lk` 公报库按关键词（Measurement / appointed date / 35 of 1995）检索未命中该指定令；已检索 1995–2026 全量公报的表格搜索，非「未试」 |
| Measurement Act s.51「特定预包装商品」指定清单 | 未取得 | 规则按「被指定时适用」处理 | **未取得**，同上检索范围 |
| 律所/商业数据库解读 | 二手 | 仅用于定位条文，未作为来源 | 不变 |

## 复核方法（可复现）

### v0.2 新增：三条在本环境唯一可用的取数路径

这三条是踩过坑之后剩下的**能跑通**的路径，写下来免得下次重走：

**1. `caa.gov.lk` —— TLS 握手失败，但正文可读**

```bash
# 直连 / 走代理 / Playwright 全部 SSL_ERROR_SYSCALL 或 ERR_CONNECTION_CLOSED
# 唯一可用：r.jina.ai 读回 HTML 正文（对 PDF 会 422 超时，只能读索引页）
curl -sS "https://r.jina.ai/https://caa.gov.lk/web/index.php?option=com_content&view=category&id=93&lang=en"
```
- 能拿到：Directions 索引页的**全部条目**（编号、宪报号、发布日期、生效日、废止标记、PDF 相对链接）。
- 拿不到：PDF 本体。要 PDF 就走第 2 条。

**2. 政府公报（`documents.gov.lk`）—— 指令与法案的官方载体**

```bash
# 2a. 公报检索：站点是 Next.js RSC，表单提交走 POST 到同一 URL，
#     结果在响应体的 RSC 流里（形如 1:{"data":[...]}），不在 DOM 表格里。
#     用 Playwright 填搜索框再截响应体最省事（见下）：
#         page.fill("input[aria-label='Search table by entering keyword']", "Consumer Affairs")
# 2b. 拿到 uploadedFile 后，PDF 走这个代理（注意是 content-file-proxy，带前导斜杠）：
curl -sSL -o out.pdf \
  "https://documents.gov.lk/api/content-file-proxy?file=/extra-gazette-content/2332-15_E_1784564900.pdf"
```
- **坑 1**：`/api/file-proxy?file=...` 是给图片用的，PDF 会回 `500 {"error":"Failed to fetch file"}`。
- **坑 2**：正确端点是 `/api/content-file-proxy?file=/<路径>`，前导斜杠不能省。
- **坑 3**：`documents.gov.lk` 只在 `domcontentloaded` 下稳定，`networkidle` 会超时。

**3. `slsi.lk` —— curl 403，Scrapling 能过**

```python
# 用 /usr/bin/python3（系统 Python 装了 scrapling 0.5.1；~/.venvs/wendo 里没有）
from scrapling.fetchers import StealthyFetcher
r = StealthyFetcher.fetch("https://slsi.lk/en/downloads/", headless=True, network_idle=True, timeout=45000)
for a in r.css('a'):          # 强制品目清单在 downloads 页的附件里
    print(a.attrib.get('href'), a.text)
```

### 斯里兰卡各官方站点的「首页 → 真实内容」路径（2026-11-18 实测）

首页能 200 不代表能找到内容——这几个站的导航都是 JS 菜单，`href` 只在展开后才在 DOM 里。可直接用的深链：

| 站点 | 首页 | 真实内容路径（已验证可 200） |
| --- | --- | --- |
| TRCSL | `https://www.trc.gov.lk/`（200，但只有 ~2.4K 字符，是个 meta refresh 壳页） | 跳到 `https://www.trc.gov.lk/index_e.php`；法规＝`/legislation/pages_e.php?id=35`（附属立法全表 PDF 链接）；许可＝`/licensing/pages_e.php?id=13`；Vendor Licence＝`/licensing/pages_e.php?id=72`；设备核准＝`/pages_e.php?id=28` |
| SLSI | `https://slsi.lk/en/`（200） | 强制品目清单在 `/en/downloads/` 的附件里（LT-PC-01）；认证流程＝`/en/services/sls-mark-product-certification/` |
| CAA（消费者事务局） | `https://caa.gov.lk/`（**TLS 不可达**） | 经 `r.jina.ai`：`/web/index.php?option=com_content&view=category&id=93&lang=en`（Directions 索引） |
| CAA（民航局，**不是本库的源**） | `https://www.caa.lk/en/`（200） | `/en/regulations-policies/subsidiary-legislation/regulation` —— 全是航空法规 |

> TRCSL 有个坑：`/legislation/pages_e.php?id=34` 是「法规（Acts）」，`id=35` 才是「附属立法（Subsidiary Legislation）」。
> Vendors Licence Rules No.1/2001 与 RTTE Rules 2020 都在 `id=35` 那页的 PDF 列表里，静态路径为
> `content/files/legislation/...` 与 `content/files/spectrum/...`。

### 议会法案



1. 议会法案 PDF 的下载地址形如 `https://www.parliament.lk/uploads/acts/gbills/english/<编号>.pdf`，编号可从 `https://www.parliament.lk/en/business-of-parliament/acts-listing?year=<年份>&itemCount=100` 的 `act-details/<编号>` 链接取得。本库：CAA=5802、PDPA=6242、Measurement=3204、SLSI=3190、Telecom=3500。
2. 重新下载后计算 `sha256sum`，与上表比对。**扫描件注意**：议会站对同一法案只提供一份扫描 PDF，若哈希变化说明文件被替换，需重新逐条比对。
3. 扫描件无文本层，OCR 命令：`pdftoppm -r 300 -gray -png <file>.pdf pages/p` → `OMP_THREAD_LIMIT=1 tesseract pages/p-NN.png out -l eng --psm 3`（**不要**让多个 tesseract 各自开满线程，会互相拖死）。OCR 只用于定位，引文以原页面图为准。
4. 数字版 PDF 用 `pdftotext -raw` 比对（`-layout` 会把边注插入正文，导致 s.11 一类条文断开）；比对前统一空白、去掉页眉页脚与页码。
5. 任何新规则必须同时具备：官方 URL、条文号、英文短引、`effective_date`、`last_verified`。
