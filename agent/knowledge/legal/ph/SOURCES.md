# 菲律宾法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **语言政策**：只收官方英文原文。菲律宾的共和国法案以英文制定并公布；本库引文取自官方域名的英文原文，不使用律所文章、商业数据库或二手翻译。

> **可访问性现实**：本次核验中，`officialgazette.gov.ph`（官方公报）、`dti.gov.ph`、`privacy.gov.ph`、`ntc.gov.ph`、`congress.gov.ph`、`senate.gov.ph` 对本环境**全站返回 Cloudflare 403 challenge**（headless Chrome 亦无法通过）。因此法条原文改取 **Supreme Court E-Library（`elibrary.judiciary.gov.ph`，菲律宾最高法院官方电子图书馆）**——该站点提供共和国法案全文，并在文首保留官方公报的卷期与公布日引证行，可用来核对版本。BPS 页面取自 `bps.dti.gov.ph`（该站点 TLS 证书与主机名不匹配，需 `-k`；内容为官方发布）。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 最高法院电子图书馆发布的共和国法案全文（含官方公报引证行） | 是 |
| `official_regulator` | DTI-BPS 官方网站的制度说明与清单 | 是（指引类标 `guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、法条聚合站（如 lawphil.net） | 否，仅作线索（本版未用于引文） |

## 主来源（法条）

全部于 2026-11-17 从 `elibrary.judiciary.gov.ph` 直接下载的 HTML；文首引证行用于确认版本。

| ID | 法规 / 文件 | 引证行（版本标识） | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| PH1 | Republic Act No. 7394 — The Consumer Act of the Philippines | `S. NO. 1820 H. NO. 33757 / 88 OG No. 24, 3639 (June 15, 1992)` | 237,717 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/3302 | `ra7394.html` | `b99b9f21f4b98cd48b86f813282143f10ca45346245cfcf1979da45767c6572a` |
| PH2 | Republic Act No. 10173 — Data Privacy Act of 2012 | `108 OG No. 41, 5168 (October 8, 2012); Manila Bulletin; Philippine Star, August 24, 2012` | 76,640 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/50253 | `ra10173.html` | `20698b938ad7ab4126545c67d21b0ca3092793b5826831dbb3fcc6f31fb15bd4` |
| PH3 | Republic Act No. 11967 — Internet Transactions Act of 2023 | `Daily Tribune, December 8, 2023 p.A14; 119 OG No. 51, 10623 (December 18, 2023)` | 99,564 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/96902 | `ra11967.html` | `bb92421e3b76f97167ba0e45573a934a542168a4f7c1c545357551c0e26c4634` |
| PH4 | Republic Act No. 8792 — Electronic Commerce Act of 2000 | `S. No. 1902 H. No. 9971 / 96 OG No. 48, 7675 (Nov. 27, 2000)` | 76,968 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/3888 | `ra8792.html` | `f380e67c26a737809b1f0c31dcb556fe58930c315a686ded4eb0f3d4e885fd6e` |

## 主来源（监管机关，`article_type=guideline`）

| ID | 文件 | 版本 / 日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| PH5 | DTI-BPS — Product Certification Schemes（PS/ICC 制度说明：两类强制认证、PS 可授予外国制造商、ICC 发给进口商、未加贴标志不得分销） | 页面未标注发布日；抓取于 2026-11-17 | 57,142 | https://bps.dti.gov.ph/product-certification/product-certification-schemes | `bps_p3.html` | `28fbfbc57b9591c2a2a946fe186c7e56ef8304f873ae6f32fefb1d1902706a0d` |
| PH6 | DTI-BPS — List of Products Under Mandatory Certification（强制认证清单，编号 1–111，含 HOUSEHOLD APPLIANCES / CONSUMER ELECTRONICS / LIGHTING AND WIRING DEVICES） | 页面未标注发布日；抓取于 2026-11-17 | 85,911 | https://bps.dti.gov.ph/product-certification/list-of-products-under-mandatory-certification | `bps_p1.html` | `cc8881cbd83a2dd6d4813ade88416aa91fdb50abeb2ec24c790eb7a0f6fea98f` |

## 已下载、用于核对但未直接引用的来源

| ID | 文件 | 引证行 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PH7 | Republic Act No. 7581 — Price Act | `88 OG No. 27, 4312 (July 6, 1992)` | 55,212 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/3502 | `ra7581.html` | `50333901307da70ad4164a4280deab22c3430826275994ddb2a9e049427f9e84` | 核对“价格管制”是否适用于小家电：仅限基本必需品/主要商品且在价格冻结情形，未建规则（见 README open questions） |
| PH8 | Republic Act No. 4109 — Standards Law（BPS 设立与标准化职权） | `61 OG No. 12, 1657 (March 22, 1965)` | 39,126 | https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/7339 | `ra4109.html` | `8b764e5eaab069c8ade80d13831436f43f44b884c1cffd3370428f3ddb1de200` | 作为 PH-CERT-01/02 的上位职权依据写入 `notes`，未单列规则 |

> 说明：PH5/PH6 为动态站点页面，重新抓取可能因站点更新产生不同哈希；核验时以「文中引文是否仍能在页面找到」为准（`verify_excerpts.py` 就是做这件事）。PH1–PH4 为静态渲染的法条页面，短期内哈希应稳定，但站点改版同样会导致差异。

## 复现命令

```bash
mkdir -p ph-sources && cd ph-sources
base=https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2

# 法条（最高法院电子图书馆，HTML）
curl -sS --compressed -A 'Mozilla/5.0' "$base/3302"  -o ra7394.html    # RA 7394 Consumer Act
curl -sS --compressed -A 'Mozilla/5.0' "$base/50253" -o ra10173.html   # RA 10173 Data Privacy Act
curl -sS --compressed -A 'Mozilla/5.0' "$base/96902" -o ra11967.html   # RA 11967 Internet Transactions Act
curl -sS --compressed -A 'Mozilla/5.0' "$base/3888"  -o ra8792.html    # RA 8792 E-Commerce Act
curl -sS --compressed -A 'Mozilla/5.0' "$base/3502"  -o ra7581.html    # RA 7581 Price Act（核对用）
curl -sS --compressed -A 'Mozilla/5.0' "$base/7339"  -o ra4109.html    # RA 4109 Standards Law（核对用）

# 监管机关页面（BPS 站点证书与主机名不匹配，需 -k）
curl -sSk --compressed -A 'Mozilla/5.0' \
  https://bps.dti.gov.ph/product-certification/product-certification-schemes -o bps_p3.html
curl -sSk --compressed -A 'Mozilla/5.0' \
  https://bps.dti.gov.ph/product-certification/list-of-products-under-mandatory-certification -o bps_p1.html

sha256sum *.html

# 引文逐条比对
cd ../wendo-dev/agent/knowledge/legal/ph
python3 verify_excerpts.py --sources /path/to/ph-sources
```

2026-11-17 实测：按上述命令重新下载后，`ra7394.html` / `ra10173.html` / `ra11967.html` / `ra8792.html` 的 SHA-256 与上表一致（同一天内多次下载一致）；`verify_excerpts.py` 输出 `checked 37 excerpts across 5 source files, 0 mismatch(es)`。负向对照（故意改写 1 条引文）返回 `exit 1` 并指出具体 rule id，说明校验脚本本身有效。

## 交叉核对记录

1. **RA 7394 的罚则没有被“提高消费者法罚则”的法案改过。** 检索时命中 *Republic Act No. 11449 (2019)*，其标题含“INCREASING PENALTIES FOR VIOLATIONS”，初看像消费者法修正案；核对全文后确认它修改的是 **RA 8484（Access Devices Regulation Act of 1998）**，与 RA 7394 无关。本库因此仍按 1992 年原文记载 P500–P10,000 / P5,000 / P600 三档罚则。**这是一次纠正误引的核对**。
2. **RA 7394 无 effectivity clause。** 全文以 `Approved: April 13, 1992` 结束，无“自公布后 X 日生效”条款。本库按 15 日公示规则自引证行的公报日 1992-06-15 推为 **1992-06-30**，属推断，已在条目与 open questions 标注。
3. **标签语言：RA 7394 Art. 77 未规定语言。** 对 Art. 76–83 全文检索无任何语言要求；语言义务实际由 ITA s.23(c)(1) 的 `Filipino and/or English` 承担。结论：纯英文标签/手册可满足 PH 要求（与 MY 的国语义务形成对比）。
4. **ITA 生效日两口径。** s.38 为“公布完成后 15 天”。引证行同时载报纸日 2023-12-08 与公报日 2023-12-18。本库取 **2023-12-23**（报纸日起算），另一口径 2024-01-02 已写入 open questions。
5. **ITA s.29(e) 三档罚款全部写 “for the second offense”。** 首犯档缺失，属立法笔误；本库照录并在 `penalty_or_note` 注明，不替立法机关补正。
6. **ITA s.29(d)(1) 数值自相矛盾。** 原文为 “not less than One hundred thousand pesos (P100.00) but not more than Five thousand pesos (P5,000.00)”——下限高于上限，括号内又是 P100。
7. **ITA s.23(f)(1) 排印错误。** 原文作 “at least one (10 government identification card”，明显应为 “(1)”。引文止于 (iii) 联系方式，未取该段。
8. **s.23(c)/(h) 有义务无罚则。** s.29(e) 只列 s.23(a)/(f)/(i)。义务与罚则不匹配，已写入 open questions。
9. **RA 7394 Art. 77 原文有 OCR 讹误。** 例如 “ts general make or active ingredients”（应为 “its”）、“rounded of to at least the nearest tenths”、“preceeding”。引文只取无争议的首句与第三段，避免把讹误当成法条文字。
10. **BPS 自相矛盾的产品计数。** PH5 称“87 个产品与系统”，PH6 清单编号连续至 111。本库以清单条目为准（认定“哪些产品在清单内”），不引用 87 这个数字。
11. **BPS 清单里“家电”是逐项列举的。** 电风扇、电熨斗、搅拌机、榨汁机、食品加工机、电水壶、电饭锅、电热水瓶、咖啡机、压力锅、慢炖锅、多功能锅、烤面包机、电炉、电热板、电烤炉、电烤箱、turbo broiler、电磁炉、微波炉、洗衣机、脱水机、冰箱、空调共 25 项；照明与接线器件 25 项；消费电子仅 4 项（电视、光盘播放器、雾化产品、加热烟草）。**USB 充电器、移动电源未出现**——不得据“3C 都要认证”下结论。
12. **RA 10173 生效日可自引证行推出。** s.45 为“在两份全国性报纸公布后 15 天”，引证行载明 Manila Bulletin / Philippine Star 均于 2012-08-24 公布 → **2012-09-08**。
13. **RA 8792 s.42 为“公布后立即生效”。** 引证行只有公报日 2000-11-27，报纸公布日未核；本库取 2000-11-27（较保守），并在条目 `notes` 说明实际可能更早。
14. **电子化不能减轻责任。** RA 8792 s.33(c) 明确：通过电子数据消息/电子文件实施的 RA 7394 违规，适用同一罚则。这是把 1992 年法律适用于网页的直接依据，单独建为 PH-ADV-15。

## 未取得 / 未使用的来源

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| NTC 型号核准（type approval）相关备忘录通告 | 未取得（HTTP 403） | `ntc.gov.ph` 对 http/https、不同 UA 一律返回 Cloudflare challenge；Wayback CDX 仅列出备忘录通告的年份索引页，未追到具体 MC 正文。这是 v0.1 的**实质缺口**（WiFi/蓝牙 3C 的准入）。 |
| BPS 强制认证的部门行政令（DAO）正文 | 未取得（未逐页翻取） | `bps.dti.gov.ph` 的 DAO 列表按发布时间倒序分页，本次只在首页确认 10 条（最新为 DAO 22-11）。覆盖“家用电器”的 DAO 编号与正文待补。 |
| RA 7394 的 IRR（DTI 实施规则） | 未取得 | Art. 77/79 授权主管部门另行规定标签项，该清单在 IRR 中；本次未取得官方文本。 |
| 菲律宾官方公报（officialgazette.gov.ph）原文 | 未取得（HTTP 403） | 全站 Cloudflare challenge，headless Chrome 亦被拦；Wayback 2025 年后的快照同样只存下 challenge 页面。法条改由最高法院电子图书馆提供（见上）。 |
| 国家隐私委员会（NPC）通告与罚款表 | 未取得（HTTP 403） | `privacy.gov.ph` 全站 403。本库只依据 DPA 法条本身，不引用 NPC 通告。 |
| DTI 消费者保护相关行政命令（含广告、促销许可的具体规则） | 未取得 | `dti.gov.ph` 403；ADR 与促销许可的细则未核。 |
| 能效标识（DOE）文本 | 未取得 | 未检索；属 v0.2 范围。 |
| `lawphil.net`（RA 7394 全文） | 已获取但**未用作引文** | 站点可访问（HTTP 200），但为民间法条库（Arellano Law Foundation），非官方发布；仅作排版参照，未写入任何 `official_url`。 |
