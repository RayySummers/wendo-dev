# 尼日利亚法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。尼日利亚联邦法规以英文在 Federal Republic of Nigeria Official Gazette 公布，监管机关官网亦为英文；本库不使用律所文章、商业数据库或二手翻译作为引文来源。

> 引用口径提醒：FCCPA 的官方 gazette 只有扫描件，其文本层是**不可用的 OCR**（见 §引文核验方法）。FCCPA 的 15 条引文是从 gazette 页面图像逐字转录的，`rules.v0.1.json` 的 `gazette_page` 字段记录了对应页码，复核时必须看图像而不是 OCR 文本。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 官方 gazette 的数字文本（可复制、可检索） | 是 |
| `official_statute_scan` | 官方 gazette 的扫描件，文本层为 OCR，引文须按页面图像转录 | 是（引文以图像为准，标 `ocr`） |
| `official_regulator` | FCCPC / SON / NCC / ARCON 官网的条例、指引、FAQ | 是（`article_type=guideline` 的条目不能替代法条） |
| `secondary` | 律所文章、商业数据库、NGO 页面 | 否，仅作线索（本版未使用） |

## 主来源

| ID | 文件 | 版本 / 出处 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| NG1 | Federal Competition and Consumer Protection Act, 2018（FCCPA） | Official Gazette No. 18, Vol. 106, 2019-02-01；Act No. 1 of 2019（gazette 页码 A1–A96） | 7,842,477 | https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf | `fccpa2018.pdf` | `aa942cdef860387e8f984de52666e5683d12d6e2813cb47b10335e0bf82a07f5` |
| NG2 | Nigeria Data Protection Act, 2023（NDPA） | Official Gazette No. 119, Vol. 110, 2023-07-01；Act No. 37 of 2023（gazette 页码 A719–A758） | 658,393 | https://old.ncc.gov.ng/documents/1193-nigeria-data-protection-act-2023/file | `ndpa2023.pdf` | `5bfb22cf7b344e92ecca9b80decf73db694a0d1000c4f42188f46e047d8df075` |
| NG3 | The Federal Competition and Consumer Protection Commission (Administrative Penalties) Regulations, 2020 | S.I. No. 68 of 2020；Official Gazette No. 211, Vol. 107, 2020-12-25（B3215–B3228） | 41,108 | https://fccpc.gov.ng/wp-content/uploads/2022/07/The-FCCPC-Administrative-Penalties-Regulations-2020.pdf | `FCCPC-Admin-Penalties.pdf` | `086ca360668a96960a054bc315d7a2319c58a5dbf70200842dad99b16c30807d` |
| NG4 | SONCAP 服务页与 FAQ（Product Certificate / SONCAP Certificate / SONCAP Default） | 抓取于 2026-11-17 | 165,058 / 442,283 | https://son.gov.ng/soncapservice/ ・ https://son.gov.ng/soncap-faq/ | `son_soncapservice.html` ・ `son_soncap-faq.html` | `f546bcc0c75d25fb1c4b998bca5e244ea84711c95c34c08b22b86f87cca11247` ・ `86e605e09800339c2d60384d68f0f0bc82435bd56055d1f178ef759ff62a29e7` |
| NG5 | SON Mandatory Energy Labeling Scheme（SONMELS）页 | 抓取于 2026-11-17（同页含 2026 年条例征求意见公告） | 165,622 | https://son.gov.ng/son-mandatory-energy-labeling-scheme/ | `son_son-mandatory-energy-labeling-scheme.html` | `0e5f0e266fbb6dc03541434a1ed7f00ec452c6be853f74e07f965c2938051869` |
| NG6 | NCC Equipment Type Approval 页 ・ Type Approval Requirements 页 | 抓取于 2026-11-17（requirements 页自述为 2022-10 版本） | 4,521,027 / 126,497 | https://www.ncc.gov.ng/industry/numbering-type-approval/type-approval ・ https://www.ncc.gov.ng/type-approval-requirements | `ncc_ncc-type-approval-main.html` ・ `ncc_type-approval-requirements.html` | `ba3fd3c7a0a850c15166c447ea5bf6239fd7e428f1baa45ba3b130f5fc0e12dd` ・ `387c49b0e58f1de3db7fd1e84a5705fd573ff26f363b5c79724809778d84df36` |
| NG7 | ARCON — Adverts Vetting（pre-exposure clearance / Certificate of Approval） | 抓取于 2026-11-17 | 17,455 | https://advertcouncil.gov.ng/_adverts_vetting.php | `arcon_adverts_vetting.html` | `a28738d6cd073528cbfb75d6b6c0d7c49cb5ce858695bea21a7bca76cc17769d` |
| NG8 | ARCON Act 2022（**仅取得 gazette 前置页**） | Official Gazette No. 120, Vol. 109, 2022-07-05；Act No. 23 of 2022（正文本应为 A719–A771） | 167,302 | http://advertcouncil.gov.ng/documents/ARCON%20Act%202022.pdf | `arcon_act2022.pdf` | `7a9d47012119ca0fbd6119ce07ca9b393e8d85f2e5aef7713e2132c716959eb1`（**不可作规则引文来源**，见 §未取得来源） |

注 1：NG6 两个文件为动态页面，抓取时可能因站点改版产生不同哈希；核验口径是「引文能否在页面中找到」，由 `verify_excerpts.py` 自动检查。

## 复现命令

```bash
mkdir -p ng-sources && cd ng-sources

# 法条（官方 gazette）
curl -sSL -A 'Mozilla/5.0' 'https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf' -o fccpa2018.pdf
curl -sSL -A 'Mozilla/5.0' 'https://old.ncc.gov.ng/documents/1193-nigeria-data-protection-act-2023/file' -o ndpa2023.pdf
curl -sSL -A 'Mozilla/5.0' 'https://fccpc.gov.ng/wp-content/uploads/2022/07/The-FCCPC-Administrative-Penalties-Regulations-2020.pdf' -o FCCPC-Admin-Penalties.pdf

# 监管机关页面（HTML，内容随站点更新变化，需按抓取日复核）
curl -sSL -A 'Mozilla/5.0' 'https://son.gov.ng/soncapservice/' -o son_soncapservice.html
curl -sSL -A 'Mozilla/5.0' 'https://son.gov.ng/soncap-faq/' -o son_soncap-faq.html
curl -sSL -A 'Mozilla/5.0' 'https://son.gov.ng/son-mandatory-energy-labeling-scheme/' -o son_son-mandatory-energy-labeling-scheme.html
curl -sSL -A 'Mozilla/5.0' 'https://www.ncc.gov.ng/industry/numbering-type-approval/type-approval' -o ncc_ncc-type-approval-main.html
curl -sSL -A 'Mozilla/5.0' 'https://www.ncc.gov.ng/type-approval-requirements' -o ncc_type-approval-requirements.html
curl -sSL -A 'Mozilla/5.0' 'https://advertcouncil.gov.ng/_adverts_vetting.php' -o arcon_adverts_vetting.html

sha256sum *.pdf *.html
```

2026-11-17 实测：`fccpa2018.pdf` 与 `ndpa2023.pdf` 为静态 PDF，重新下载后 SHA-256 与上表一致（FCCPA 在 NIPC 官网 `https://nipc.gov.ng/assets/resources/federal-competition-and-consumer-protection-act-2018/federal-competition-and-consumer-protection-act-2018.pdf` 有同一文件副本，字节数同为 7,842,477，可作同一性交叉核对）。HTML 页面为动态站点，重抓可能产生不同哈希。

## 引文核验方法

1. 数字文本来源（NG2 及 NG4–NG7）：`pdftotext`（不加 `-layout`，保持阅读顺序）或 HTML 去标签后，做空白压缩、引号/破折号归一，再对 `verbatim_excerpt` 做**去空白子串匹配**；11 条全部命中，0 处不匹配。
2. 扫描来源（NG1）：FCCPA 的 OCR 文本层损坏严重（实测 34,837 词中约 1,451 词含 `rn/rr` 型误识，如 `goods→gods`、`manufacturer→hranufacturer`、`Commission→Corrmission`），**不可作为引文依据**。15 条引文改为在 gazette 页面图像上逐字转录，页码记录在 `rules.v0.1.json` 的 `gazette_page`（A 60–A 71）。复核方式：

```bash
# 例：核对 NG-LAB-01（s.116(2)，gazette A62）
pdftoppm -f 64 -l 64 -r 150 -png fccpa2018.pdf page
# 打开 page-64.png 与 rules.v0.1.json 中该条的 verbatim_excerpt 逐字比对
```

3. 复验脚本：`agent/knowledge/legal/ng/verify_excerpts.py`（下载完 §复现命令 的来源后运行）：

```bash
python3 agent/knowledge/legal/ng/verify_excerpts.py --sources /path/to/ng-sources
# checked 26 excerpts: 11 exact (text layer), 15 page-image transcriptions, 0 failed
```

脚本对 OCR 条目输出 3-gram 覆盖率作为**诊断值**（区间 0.22–1.00，低值来自 OCR 误识而非引文错误），不作为通过标准；对数字文本条目则是硬性通过标准。

4. 抽取值均为连续原文片段，未改写、未拼接。唯一例外：NG-CRT-03 的引文跨了页面上的换行与句号排版（`...market access by` / `December 2026` / `.`），按语义合并，已在 `notes` 标注。

## 交叉核对记录

1. **FCCPA 条文号边界**：以 FCCPC（Administrative Penalties）Regulations 2020 附表 1 的条目反查条文号——item 26↔s.114（plain language）、27↔s.115（价格）、28↔s.116（trade description）、29↔s.117（二手/翻新）、31↔s.123（一般营销标准）、32↔s.124（胁迫/不公平手段）、33↔s.125（虚假表述）、34↔s.126（检测/证言）、37↔s.130-131、38↔ss.134-135。该对照表与 gazette 图像上的条文编号一致。
2. **FCCPA 罚则上限的来源**：gazette 正文本条只写民事赔偿/监禁，具体行政罚款基准在 Regulations 2020 附表 1。本库的 `penalty_or_note` 一律引 Regulations 2020 的条目号，不把行政基准写成法条本身的规定。
3. **境外主体的责任链**：s.125(3) 把境外经营者的表述视为「进口该商品/服务或该展示物的经营者」作出；s.125(2) 的 (a)-(e) 项中 (c) 涉及展示物，故 (3)(b) 单列。该条与跨境电商的责任分配直接相关，但「谁是 importer」需按报关主体逐案确认。
4. **NDPA 罚则上限**：s.48(3)-(5)，重要控制者取 N10,000,000 与上一财年营业额 2% 的较高者；非重要主体取 N2,000,000 与 2% 的较高者；s.49 是「不遵守 s.47 命令」的刑事路径（最高 1 年监禁或同额罚金）。
5. **NDPA 与 NDPR 的关系**：NDPR 2019 是 NDPC 前身（NDPB）依 NITDA Act 发布的条例；NDPA 2023 施行后 NDPR 的存续状态本版未核实，未把 NDPR 条文收入规则库（见 §未取得来源）。
6. **NDPA 无语言条款**：全文检索未发现对隐私政策语言的强制规定；只能通过 s.27(3) 的「clear, concise, transparent, intelligible, and easily accessible format」间接判断。故「语言义务」在 NG 只有两条（s.114 plain language、NCC 英文文件要求）。
7. **SONCAP 的双文件结构**：SONCAP 服务页写 Product Certificate 用于开立 Form M、SONCAP Certificate 用于清关；FAQ 页写「importer of regulated products must obtain two certificates」。两页措辞不同但所指一致，本库按两页合并表述。
8. **SONCAP Default 的性质**：FAQ 以问答体给出「20% CIF 或 N2,000,000 取较高者」，不是条例条文；本库标 `rule_type=罚则`、`confidence=medium`、`review_required=true`。
9. **SONMELS 的效力状态**：同一页既列 Phase I/II 强制时间表（2026-12），又挂出《SONMELS Regulations, 2026》的征求意见公告。条例仍为草案，故 `confidence=medium`、`review_required=true`；报告里应写「按 SON 公布的时间表」而不是「依法强制」。
10. **NCC 的适用主体**：type approval 页明确「manufacturers, vendors and operators, including customer devices such as mobile phones and wireless adapters」都须在进入尼日利亚前符合标准；FAQ 进一步列出申请人范围（含 authorized representatives / importers / distributors / authorized vendors）。
11. **NCC 型式认可 ≠ Device Checker 上架**：页面明确两者是分开的流程，Type Approval 先完成，蜂窝设备可能还需 IMEI/TAC 登记。本库只把 Type Approval 立为规则，Device Checker 写入 `notes`。
12. **ARCON 的可得性差异**：`arcon.gov.ng` 在本环境返回 403，`advertcouncil.gov.ng` 可访问；后者的 ARCON Act 页只有导航没有正文，`/documents/ARCON Act 2022.pdf` 只有 gazette 前置页（A717–A718）与目录，正文 A719–A771 缺失。因此 ARCON 规则只能落在 vetting 页面（guideline），没有条文号。
13. **「vetting 类别」的边界**：ARCON 页面只写「No advertisement under the vetting category should be exposed unless…」，未定义哪些广告属于 vetting 类别；线上短视频/直播/独立站详情页是否在内无法从官网确认，已列为 open question。
14. **价格展示的货币要求**：s.115(2) 要求价格「expressed in the currency of the Federal Republic of Nigeria」；跨境电商以外币标价（USD/CNY）是否满足，本版未找到监管口径，列为 open question。
15. **报告措辞边界**：所有罚则只写上限；页面缺失认证信息只写「页面未展示，需向商家核实」，不推断「未认证」。

## 未取得 / 未使用的来源

| 文件 | 状态 | 影响 |
| --- | --- | --- |
| ARCON Act 2022 全文（A719–A771） | 未取得（官网仅有前置页；APCON 旧域名 TLS 握手失败） | ARCON 规则只能停留在 vetting 页面，无法给条文号与罚则 |
| Standards Organisation of Nigeria Act, 2015（Act No. 14 of 2015） | 未取得（son.gov.ng 无 Act 全文 PDF） | SONCAP / SONMELS 规则均为 `guideline` 级；SON 的处罚条款未收录 |
| NCC Type Approval Regulations, 2024 | 未取得（NCC 页面只援引名称） | 型式认可的罚则与程序细节缺失 |
| FCCPC Consumer Protection Regulations（2026 征求意见稿） | 未取得正式版（官网仅有 Exposure Draft） | 未作为规则来源；若正式颁布，s.114-117 的落地细则需重做 |
| NDPC 关于「data controller of major importance」的认定指引 | 未取得全文 | NG-PRV-05 的门槛判断留空，`confidence=medium` |
| NDPR 2019 与 NDPA 2023 的衔接 | 未核实 | 未收录 NDPR 条文 |
| 尼日利亚广告行业自律准则（Nigerian Code of Advertising） | 官网页面为空模板 | 未收录行业自律规则 |
| 计量/预包装商品标签条例 | 未检索 | 「净含量/计量」类规则缺失（v0.2） |
| 州级消费者保护机构（如 Lagos State Consumer Protection Agency）规则 | 未检索 | 联邦与州分层未建（v0.2） |
| 食品/美妆/玩具/化学品品类规则 | 不在本单范围 | 由后续品类单覆盖 |
