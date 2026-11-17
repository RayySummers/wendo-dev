# 阿联酋法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文或官方英文译本。法条正文取自 `uaelegislation.gov.ae` 的英文译本栏（页面底部标注 “Translated in cooperation with”）；媒体法取自阿联酋媒体委员会（UAEMC）官网发布的官方英文 PDF。律所文章、商业数据库（Lexis、Lexology）与中文解读只作交叉核对的线索，不作为引文来源。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 联邦法律 / 法令 / 内阁决议的官方英文文本（uaelegislation.gov.ae 英文译本栏） | 是 |
| `official_regulator` | 监管机关官网的服务说明、指引（TDRA、UAEMC、MoIAT） | 是（标 `article_type=guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索（本版未用作引文） |

## 主来源

| ID | 法规 / 文件 | 版本 / 状态 | 大小 (bytes) | 官方 URL | 本地快照 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| AE1 | Federal Law No. (15) of 2020 Concerning Consumer Protection（消费者保护法） | 英文译本栏；生效 2020-11-16（第 38 条） | 24,757 | https://uaelegislation.gov.ae/en/legislations/1455 | `cp_law_1455.md` | `890abd4219bb2260aa4da7f46137163070c817df0e7a24c385d8206ae3071574` |
| AE2 | Cabinet Resolution No. (66) of 2023 Concerning the Executive Regulations of Federal Law No. (15) of 2020（实施条例） | 2023-07-03 颁布；第 43 条：公布后 3 个月生效（2023-10-14） | 45,786 | https://uaelegislation.gov.ae/en/legislations/2157 | `exec_regs_2157.md` | `2b365be4facb75424fce6cd3e052ed1b6008f48d8e0f3b8df503d8065ce458fa` |
| AE3 | Federal Decree-Law No. (55) of 2023 Concerning Media Regulation（媒体监管法） | 2023-10-02 颁布；第 31 条：2023-12-01 生效；UAEMC 官方英文 PDF | 130,997 | https://uaemc.gov.ae/wp-content/uploads/2024/05/Federal-Decree-by-Law-No.-55-of-2023-Concerning-Media-Regulation-EN.pdf | `media55.pdf`（文本 `media55.txt`，32,242 bytes / `f3861fc9…`） | `dcdf01bb4f72c6e5f4fd197abf84c005bf71a0503e219364bb4f051b5617b8c2` |
| AE4 | Federal Decree-Law No. (14) of 2023 Concerning the Modern Technology-Based Trade（现代技术贸易法 / 电商法） | 2023-09-04 颁布；第 21 条：公布次日生效（2023-09-16） | 27,086 | https://uaelegislation.gov.ae/en/legislations/2150 | `ecommerce_2150.md` | `2db8cf3c56604690b73f59bc2a2dd07e11289e1e637b04a328bd0e674d9a7d1c` |
| AE5 | Federal Decree-Law No. (45) of 2021 Concerning the Protection of Personal Data（个人数据保护法，PDPL） | 2022-01-02 生效（u.ae 官方口径）；英文译本栏 | 45,835 | https://uaelegislation.gov.ae/en/legislations/1972 | `pdpl_1972.md` | `bb9669e5198febb9cab088914eb712683c6a030b0e39857b96e11e82bf236ddf` |
| AE6 | TDRA — Register and Approve Telecommunication Equipment（服务说明：Level 1–3、流程、费用） | 抓取于 2026-11-17；页面未标注发布/更新日期 | 311,847（HTML） | https://tdra.gov.ae/en/Services/register-and-approve-telecommunication-equipment | `tdra_type.html` | `646d169a22e18035c02a52097c0cab400c064d9e4cd7debd3cdb9ca50ffcef87` |

> **下载方式说明（重要）**：`uaelegislation.gov.ae` 在本环境对直接下载（含 `/download` 路径）返回 Cloudflare 403，普通 `curl` 亦被拦截；上表 AE1/AE2/AE4/AE5 的正文快照是通过文本渲染代理 `https://r.jina.ai/<官方 URL>` 取得的页面正文，URL 仍是官方页面本身。快照哈希对应本次抓取的文本，**不保证**下次抓取逐字节一致（页面可能更新）。AE3 为静态 PDF，已实测重新下载后 SHA-256 一致。AE6 为动态 HTML 页面，哈希对应抓取日快照。

## 复现命令

```bash
mkdir -p ae-sources && cd ae-sources

# 1) 媒体法（静态 PDF，字节稳定；站点证书链需 -k）
curl -sSLk -A 'Mozilla/5.0' \
  "https://uaemc.gov.ae/wp-content/uploads/2024/05/Federal-Decree-by-Law-No.-55-of-2023-Concerning-Media-Regulation-EN.pdf" \
  -o media55.pdf
pdftotext -layout media55.pdf media55.txt

# 2) 立法门户正文（直连 403；用文本渲染代理取页面正文）
for u in 1455 2157 2150 1972; do
  curl -sSL "https://r.jina.ai/https://uaelegislation.gov.ae/en/legislations/$u" -o "leg_$u.md"
done

# 3) TDRA 服务页
curl -sSLk -A 'Mozilla/5.0' \
  "https://tdra.gov.ae/en/Services/register-and-approve-telecommunication-equipment" -o tdra_type.html

sha256sum media55.pdf media55.txt leg_1455.md leg_2157.md leg_2150.md leg_1972.md tdra_type.html
```

2026-11-17 实测：`media55.pdf` 重新下载后 SHA-256 与上表一致（`dcdf01bb…`）。AE1/AE2/AE4/AE5 为动态页面快照，复核时应以“文中引文是否仍在页面可检索到”为准，而非逐字节比对。

## 交叉核对记录

1. **CPL 条文编号在英文译本中跳号。** 官方英文译本从第 8 条直接到第 10 条，**没有第 9 条**；第 29/30 条的罚则清单也不含第 9 条。本库按译本编号引用，未自行补号；引用“第 8 条之后”的条款时以条名为准。
2. **罚则双档的分界。** 第 29 条覆盖第 7、10、11、12、15、16、17、21 条与第 8 条第 1–3 款（最高 2 年监禁、AED 10,000–2,000,000）；第 30 条覆盖第 18、19、20、26 条与第 8 条第 4 款（最高 6 个月、AED 3,000–200,000）。**阿语义务（第 26 条）落在轻档**，这是很多中文解读写错的地方。
3. **促销许可有两层。** 第 18 条是法律层“事前许可”，条例第 31 条把折扣许可、促销许可与“一周内生效的折扣须告知、否则 30 天内退差价”写细；两条同时适用，不互相替代。
4. **阿语义务的范围。** 第 26 条是“数据、广告、合同”，第 25(1) 条是电商“商品与服务信息、规格、合同条款、支付与保修”；第 8(4) 条另要求**发票**使用阿语。三条不是同一条的重复，报告要按页面元素分别引用。
5. **条例第 3 条的 8 项清单是“最低清单”。** 条文写 “include, but is not limited to”，因此不能把“8 项齐全”当成充分条件；品类标准（UAE.S/GSO）可能追加要求。
6. **“Made in” 的格式。** 条例第 3(2) 条要求原产国写作“the name of the country preceded by the phrase: ‘Made in’”。本库把“原产地陈述的真实性”归入 AE-ADV-18（substantiation），把“标签是否载明原产国”归入 AE-LBL-01（rule_level），两者不合并。
7. **条例第 5(3) 条禁止刷卡加收。** 条文原文 “Not to add any additional amounts to the value of the goods in the event of using credit cards”，没有“除非事先披露”的例外；因此“刷卡加收 2%（已披露）”仍属条文禁止的情形，但罚则回到 CPL 第 8 条（本条例未单列罚则）。
8. **条例第 11 条的保修文件。** 条文禁止“宣传保修但不给书面文件”，不是禁止宣传保修；页面写“1 年保修”本身不构成缺口。
9. **媒体法的广告条款。** 第 20(1) 条把广告与“媒体内容标准”挂钩，第 17 条列 16 项标准（含第 13 项虚假新闻、第 15 项谣言与误导新闻）；第 20(2) 条单独要求标明广告属性。三条要分开引用，不能把“未标广告”写成“违反第 17 条”。
10. **媒体法罚则。** 第 23(1)(B) 条为 AED 1,000–1,000,000，再犯加倍且不超过 AED 2,000,000；同条另有警告、停业至 6 个月、吊销许可。2024 年第 68 号实施条例与 2025 年第 42 号违规罚则决议未取得英文全文，本版未引用其附表。
11. **电商法与 CPL 并行。** 电商法第 5(5) 条（价格/费用/条款公开）、第 5(7) 条（不得误导）、第 6(4) 条（营销拒收）、第 6(9) 条（执照/地址公开）与 CPL 第 8、17、25 条重叠但不冲突；罚则由 2025 年第 200 号内阁决议规定，本版未取得原文，故 `penalty_or_note` 只写“由该决议规定”。
12. **PDPL 第 13(2) 条的三个子项。** 条文要求在处理前提供第 (1) 款的 (b) 处理目的、(d) 共享对象（境内外）、(g) 跨境传输保护措施；三项缺一即不满足“处理前告知”。第 13(1) 条其余项（数据类型、存储期限、更正/删除程序、投诉渠道）是“应请求提供”，不是“处理前必须展示”。
13. **PDPL 罚则。** 第 26 条把违规行为与行政处罚授权给内阁决议，法条本身不含金额；本版隐私条目只写义务，不写金额。
14. **生效日口径。** CPL 第 38 条为“公布次日生效”，官方公报公布日为 2020-11-15，故取 2020-11-16（公开资料另有“2020-11-10 颁布”“2020-11-16 生效”两种表述，本库取生效日）。条例第 43 条为“公布后 3 个月”，公开记录为 2023-10-14。电商法第 21 条为“公布次日”，颁布日 2023-09-04，取 2023-09-16。媒体法第 31 条直接写“2023-12-01 生效”。PDPL 生效日取 u.ae 官方页面口径 2022-01-02。
15. **TDRA 型号批准。** 服务页写明设备须“before they are put up for sale in the country's markets”注册并获批，分 Level 1（低风险，无需技术检验）、Level 2（中风险，TDRA 可要求检验）、Level 3（高风险，须检验）；费用为审核 AED 500 + 证书 AED 200，检验费按制式另计。页面未列罚则。
16. **ECAS / G-Mark 未建模。** MoIAT 站点在本环境返回过期证书（`SSL certificate has expired`），`/en/ecas`、`/en/services/issue-conformity-certificates` 均为 404；本版只用 CPL 第 20 条作规则级依据，未把 ECAS 注册或 G-Mark 写成条文要求。
17. **强制标准清单未取得。** 阿联酋以内阁决议分批采纳 UAE.S/GSO 标准（例如电气/电子产品的 10 项强制标准），uaelegislation 的英文页对相关决议返回 404（仅阿语页可见）；本版未逐项映射品类与标准号。

## 未取得 / 未使用的来源

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| MoIAT — ECAS 注册 / 符合性证书服务页与用户手册 | 未取得（SSL 证书过期；服务页 404） | 认证与准入只写到 CPL 第 20 条，ECAS 流程留 v0.2 |
| Cabinet Decision No. 15/2015（10 项电气/电子强制标准）英文版 | 未取得（英文页 404，阿语页可见） | 未逐项映射 UAE.S 标准号 |
| Cabinet Decision No. 200/2025（电商法违规与罚则） | 未取得 | AE-ECOM 系列罚则只写“由该决议规定” |
| PDPL 行政处罚附表（第 26 条授权） | 未取得 | 隐私条目不含金额 |
| PDPL Executive Regulations（实施条例） | 未核定版本 | 本版只引 PDPL 原文 |
| Cabinet Decision No. 68/2024（媒体法实施条例） | 未取得英文全文 | 广告许可、内容分类、达人备案未建模 |
| Cabinet Decision No. 42/2025（媒体违规罚则） | 未取得 | 只用媒体法第 23 条的区间 |
| DIFC DP Law 2020 / ADGM Data Protection Regulations 2021 | 未收录 | 自由区独立数据制度，另开子单 |
| UAE.S / GSO 标准全文（含 IEC 60335 系列） | 未取得（付费标准） | 只作证据项提示，不作条文引文 |
| 各酋长国促销许可流程（DED 等） | 未核对 | 只写“需向商家索取许可编号” |
| 迪拜市 / DED 消费品技术指引（阿拉伯语） | 未收录 | 地方执法口径未建库 |

## 引文核验方法

- 文本来源：AE1/AE2/AE4/AE5 为官方页面正文快照（Markdown）；AE3 用 `pdftotext -layout` 抽取 PDF；AE6 为 HTML 去标签后的可见文本。
- 归一化：弯引号转直引号、破折号转 `-`、`&nbsp;` 转空格、连续空白压成一个空格。
- 对 33 条规则的 `verbatim_excerpt` 逐条做“归一化后子串匹配”，匹配范围为对应 `source_id` 的全文：**33/33 命中，0 处不匹配**。
- 复验脚本：`agent/knowledge/legal/ae/verify_excerpts.py`。把本文件所列快照放入同一目录后运行：

```bash
python3 agent/knowledge/legal/ae/verify_excerpts.py --sources /path/to/ae-sources
# checked 33 excerpts, 0 mismatch(es)
```

- 抽取值均为连续原文片段，未改写、未拼接；跨项条文（如条例第 8 条的 4–7 项）按连续区间摘录，未跨段拼接。
- AE1–AE5 均为数字文本，非 OCR；AE6 为 HTML 文本。无 OCR 来源需要单独标注。
