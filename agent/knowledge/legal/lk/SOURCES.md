# 斯里兰卡法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。斯里兰卡议会同时发布法案的英文、僧伽罗文、泰米尔文文本，**英文文本由议会官网发布**（CAA Act s.25 仅规定僧伽罗与泰米尔文本冲突时以僧伽罗文本为准）；本库全部引文来自英文官方文本。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_parliament_digital` | 斯里兰卡议会官网发布的法案 PDF，含文本层 | 是（文本可机器比对） |
| `official_parliament_scan` | 斯里兰卡议会官网发布的法案 PDF，**图像扫描件、无文本层**（多为 300dpi） | 是（引文经 OCR 后逐条目视比对原页面图，见下） |
| `official_regulator` | 数据保护局（DPA）、电信监管委员会（TRCSL）等主管机关官网发布的法案、修正案与宪报命令 | 是（宪报命令为法律文件；指引类须标 guideline） |
| `secondary` | 律所文章、商业数据库（CommonLII 等）、行业报告 | 否，仅作线索或交叉核对 |

## 主来源

| ID | 法规 | 版本 / 生效 | 页数 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| LK1 | Consumer Affairs Authority Act, No. 9 of 2003 | 2003-03-17 认证；无另设施行日条款 | 52 | https://www.parliament.lk/uploads/acts/gbills/english/5802.pdf | `lk_caa_2003.pdf` | `f138e4ee0c4797592dcc83cb11fd9ebc0c99093abf77a098c9a3ad2cebd75000` |
| LK2 | Personal Data Protection Act, No. 9 of 2022 | 第一部分、二、三、七自 2025-03-18 施行（宪报 2366/08） | 65 | https://www.parliament.lk/uploads/acts/gbills/english/6242.pdf | `lk_pdpa_2022.pdf` | `6fcdf94fe219d9f7cd18c4790a2c6332568c65eb72846790480e65834012ef46` |
| LK3 | Measurement Units, Standards and Services Act, No. 35 of 1995 | 1995-12-21 认证；施行日由部长指定（指定令未取得） | 49 | https://www.parliament.lk/uploads/acts/gbills/english/3204.pdf | `lk_measurement_1995.pdf` | `d931e88b8f83f81977c543b7624e370ee691eb45923d7142e1b8ff44d41139dd` |
| LK4 | Sri Lanka Standards Institution Act, No. 6 of 1984 | 1984-01-27 认证；未设施行日条款 | 24 | https://www.parliament.lk/uploads/acts/gbills/english/3190.pdf | `lk_slsi_1984.pdf` | `400c2bcec0da61df872b6ff1149a379c260db294ae2af79d5d9858ad4db64a55` |
| LK5 | Sri Lanka Telecommunications Act, No. 25 of 1991 | 1991-07-03 认证即施行（s.72 除外） | 51 | https://www.parliament.lk/uploads/acts/gbills/english/3500.pdf | `lk_telecom_1991.pdf` | `d28aaaa626dd4aa2f630cb2b0b90daed0cb09d5e3dbce6790176139cdb2defc3` |

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

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| CAA 依 s.10(1)(a) 发布的标签/价格标示**指令清单**（宪报） | caa.gov.lk 在本环境 TLS 握手失败（`SSL_ERROR_SYSCALL`，直连与代理均失败），无法取得 | LK-LAB-01、LK-PRICE-01 只能写成「有指令时适用」；具体标签要素（是否要求三语、是否要求进口商信息）待补 |
| CAA 的电商/线上交易指引 | 同上，不可达 | 线上价格展示与信息披露义务无法逐条落地 |
| SLSI 强制认证命令清单与 SLS 标准目录 | slsi.lk 返回 Cloudflare JS 挑战（HTTP 403），未绕过 | LK-CERT-01/02 只能按「被命令覆盖的品类」处理；小家电/3C 是否在列未核 |
| TRCSL 类型核准规则、Vendors Licence Rules No. 1 of 2001 全文 | 官网设备页与规则页为脚本加载，未取得全文 | LK-TEL-01/02 的实操要求（申请材料、标签）未落地 |
| 宪法第 18/22 条官方英文文本（语言义务） | 未取得（议会宪法页面未定位到可下载英文 PDF） | 语言义务只作定性说明，不建规则 |
| Import Control (Standardization and Quality Control) Regulations | 未取得 | 进口环节的 SLSI 合规执行路径未落地 |
| 律所/商业数据库解读 | 二手 | 仅用于定位条文，未作为来源 |

## 复核方法（可复现）

1. 议会法案 PDF 的下载地址形如 `https://www.parliament.lk/uploads/acts/gbills/english/<编号>.pdf`，编号可从 `https://www.parliament.lk/en/business-of-parliament/acts-listing?year=<年份>&itemCount=100` 的 `act-details/<编号>` 链接取得。本库：CAA=5802、PDPA=6242、Measurement=3204、SLSI=3190、Telecom=3500。
2. 重新下载后计算 `sha256sum`，与上表比对。**扫描件注意**：议会站对同一法案只提供一份扫描 PDF，若哈希变化说明文件被替换，需重新逐条比对。
3. 扫描件无文本层，OCR 命令：`pdftoppm -r 300 -gray -png <file>.pdf pages/p` → `OMP_THREAD_LIMIT=1 tesseract pages/p-NN.png out -l eng --psm 3`（**不要**让多个 tesseract 各自开满线程，会互相拖死）。OCR 只用于定位，引文以原页面图为准。
4. 数字版 PDF 用 `pdftotext -raw` 比对（`-layout` 会把边注插入正文，导致 s.11 一类条文断开）；比对前统一空白、去掉页眉页脚与页码。
5. 任何新规则必须同时具备：官方 URL、条文号、英文短引、`effective_date`、`last_verified`。
