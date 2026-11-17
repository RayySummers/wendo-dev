# 南非 · 法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **语言政策**：只收官方英文原文。南非所有法案在 Government Gazette 上以英文（及另一官方语言）双语公布，
> 本库引文全部取自公报英文页，不使用律所文章、商业数据库或二手翻译作为引文来源。

> **文本层说明**：ZA2（ECTA）与 ZA4（NRCS Act）的公报 PDF 是扫描件，文本层为 OCR，
> 存在断词与多余空格（如 `the followinginformation`、`ha<; heen`）。这两部法的引文逐条按扫描页人工校对，
> 只修正断词与空格，用词未改。`verify_excerpts.py` 对全部来源做「忽略空白」比对，故 OCR 空格差异不影响校验结果。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | gov.za 公布的 Government Gazette 法案英文页 | 是 |
| `official_regulation` | 部长依授权制定的条例（同样载于 Government Gazette） | 是（`article_type=subsidiary_legislation`） |
| `official_regulator` | NRCS 官网的监管口径说明页 | 是（`article_type=guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业自律准则（ARB） | 否，仅作线索（本版未使用） |

## 主来源（法律与条例）

全部为 2026-11-17 从官方域名直接下载；版本信息取自文首公报页眉。

| ID | 法规 / 文件 | 公报与日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| ZA1 | Consumer Protection Act 68 of 2008 消费者保护法 | Government Gazette No. 32186, Vol. 526, 2009-04-29（签署版） | 626,998 | https://www.gov.za/sites/default/files/gcis_document/201409/321864670.pdf | `cpa2008.pdf` | `35b70595dcd315e12ee46290bca426facecae33edad9ad3bdc5e5223bfcb1db7` |
| ZA2 | Electronic Communications and Transactions Act 25 of 2002 电子通信与交易法 | Government Gazette No. 23708, 2002-08-02 | 2,717,594 | https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf | `ecta25of2002.pdf` | `0e13f57752f7efda55fb03fabb8b48dc88043d5e3163fb95fcfe638086cf13c0` |
| ZA3 | Protection of Personal Information Act 4 of 2013 个人信息保护法 | Government Gazette No. 37067, 2013-11-26 | 394,447 | https://www.gov.za/sites/default/files/gcis_document/201409/3706726-11act4of2013popi.pdf | `popia4of2013.pdf` | `148e8d014a41926f2c4c596074a1dd5f7b75735fcd3e8b7ae5edfadbb7f5d212` |
| ZA4 | National Regulator for Compulsory Specifications Act 5 of 2008 强制规范国家监管局法 | Government Gazette No. 31216, 2008-07-04 | 553,423 | https://www.gov.za/sites/default/files/gcis_document/201409/312167280.pdf | `nrcs_act_2008_govza.pdf` | `feac6178382fe379cb50119a1e48fd26f5b81fc7326e305cbc8f146139850760` |
| ZA5 | Electronic Communications Act 36 of 2005 电子通信法 | Government Gazette No. 28743, 2006-04-18 | 1,216,835 | https://www.gov.za/sites/default/files/gcis_document/201409/a36-050.pdf | `eca36of2005.pdf` | `099e3e5534ca81211caaa37a2c393e2075156ba4b1188a6a1f06eb1c77946f55` |
| ZA6 | Legal Metrology Act 9 of 2014 法定计量法 | Government Gazette No. 37661, 2014-05-19 | 253,765 | https://www.gov.za/sites/default/files/gcis_document/201409/37661gon385.pdf | `legalmetrology9of2014.pdf` | `e275f924b3f384341b4023213c81e930e843519db5a1a7314206a43303b7dbc8` |
| ZA9 | Consumer Protection Act: Regulations（GN R.293）消费者保护法实施条例 | Government Gazette No. 34180, 2011-04-01 | 2,707,732 | https://www.gov.za/sites/default/files/gcis_document/201409/34180rg9515gon293.pdf | `cpa_regs_293.pdf` | `8921e716009bf4c439a0ef63469b67cc5ce0ea736cc7f3299356788d2e73ebb5` |

## 主来源（监管机关口径，`article_type=guideline`）

| ID | 文件 | 抓取日 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| ZA7 | NRCS — Imports & Exports（授权书 LOA 与 ℮-Mark 数量标记口径） | 2026-11-17 | 183,531 | http://www.nrcs.org.za/imports-and-exports/ | `nrcs_impexp.html` | `20de23e461affd1211161fc0023f91bc4c452283dca91daf1d361c64b1f3bbf6` |
| ZA8 | NRCS — About Compulsory Specification（强制规范的定义与制定流程） | 2026-11-17 | 185,101 | http://www.nrcs.org.za/compulsory-specifications/about-compulsory-specifications/ | `nrcs_about_cs.html` | `39f85ac14cf285f29ce754feb297741e576194e85434f4fc42c06d625d8c31a9` |

> **TLS 说明**：`www.nrcs.org.za` 的 HTTPS 证书链在本环境无法验证（`unable to get local issuer certificate`），
> 因此这两个页面经 `http://` 抓取。内容为 NRCS 官网原文，但传输未加密，SHA-256 记录的是该次响应体的哈希；
> 若日后 HTTPS 可验证，应重新抓取并更新哈希。

## 交叉核对记录

| # | 核对对象 | 方法 | 结果 |
| --- | --- | --- | --- |
| 1 | CPA ↔ ECTA 的管辖边界 | 在**两部法原文**中同时核对四个交叉引用：CPA s.16(1)（直销撤销权不适用于 ECTA s.44 的交易）、CPA s.23(1)(b)（价格披露不适用于 ECTA s.43 的交易）、CPA s.26(1)(a)（交易记录不适用于 ECTA s.43 的交易）、CPA s.33(1)(b)（目录销售不适用于 ECTA 第 7 章的交易） | 四处引用在两侧原文均成立，确认「线上交易优先适用 ECTA 第 7 章、线下/直销适用 CPA」的分工，并据此避免同一事实被两条规则重复计分 |
| 2 | NRCS 授权书（LOA）制度 | NRCS Act s.14/s.15 原文 ↔ NRCS 官网 Imports & Exports 页「Letters of Authority are issued to manufacturers and importers ... in order that the products can be imported or offered for sale」 | 法定禁止（s.14）+ 行政授权（LOA）两层一致；官网为口径来源，法条为规则依据 |
| 3 | 原产地说明的适用范围 | CPA s.24(4)-(5) 原文 ↔ CPA Regulations reg.6（附件 D：纺织品/服装/鞋/皮革）与 reg.7（转基因生物） | 确认 `s.24(5)` 的强制原产地说明**不含**家电与 3C；据此把 ZA-DIS-09 的 category 限为「家居用品」，并在 `penalty_or_note` 写明不适用家电 |
| 4 | 直销的隐私与讯息两条路径 | POPIA s.69(1)/(4) ↔ ECTA s.45(1) | 两法并行不冲突：POPIA 管「处理个人信息」，ECTA 管「商业讯息本身」；规则库分别收录，报告可同时引用但需说明层级 |
| 5 | 行政罚款上限 | CPA s.112(2) 原文（10% 年营业额 或 R1 000 000，取较高者）↔ s.112(3) 裁量因素 | 一致；未采用二手资料中常见的「固定 R1 000 000」写法 |
| 6 | 计量单位义务的两端 | LMA s.34(4)（进口标示）↔ s.35(1)（广告计量） | 一致；进口与广告两端分别建规则 |

## 未取得 / 不可达的来源（open questions 的对应项）

| 目标 | 尝试 | 结果与处理 |
| --- | --- | --- |
| ICASA 型号核准（Type Approval）细则与豁免清单 | `https://www.icasa.org.za/`（TLS 握手失败）、`http://www.icasa.org.za/`（empty reply）各一次 | 未取得。规则库只用 ECA s.35(1) 作法律依据，ICASA 的程序性细则写入 open questions；报告不得引用未核实的核准流程细节 |
| NRCS 强制规范清单（VC 编号）与最新公告 | `nrcs.org.za/compulsory-specifications/`、`/compulsory-specifications-2/` 页面均为空壳（仅导航与页脚） | 未取得。规则库以「适用强制规范的商品」表述，不写具体 VC 编号；家电对应的 SANS 60335 系列在 open questions 标注 |
| SANS 60335 系列（家用电器安全）标准全文 | SABS 付费标准 | 未取得。规则只到「须符合强制规范」层级，不细化技术要求 |
| CPA 生效公告（Proclamation R.11 of 2011）单独文本 | gov.za 未检出 | 未取得；但条例与生效公告同载 GG 34180（2011-04-01），故 CPA 规则 `effective_date` 记 2011-04-01 |
| LMA 生效公告（总统公告） | 未检出 | 未取得；LMA 规则 `effective_date` 记公报日 2014-05-19 并标 `confidence=medium` |
| ECA 全面生效日 | 未取得公告 | ECA 规则 `effective_date` 记 2006-07-19（ECA 全面生效日）为暂记，`confidence=medium` |
| CPA 与 ECTA 的官方合并文本（consolidation） | gov.za 仅提供签署版公报 | 未取得。本版依据签署版；如后续有修订，须在 v0.2 复核（见 README 的 open questions） |
| 广告自律准则（ARB Code of Advertising Practice） | 未采用 | 属行业自律，非官方来源，按来源纪律不收；仅在 README 提示其存在 |

## 样例页面（SAMPLE_FINDINGS 用）

| 项目 | 值 |
| --- | --- |
| URL | https://hisense.co.za/products/hisense-h09afbk2s5-air-fryer/ |
| 抓取时间 | 2026-11-17（UTC+8） |
| 抓取方式 | `curl -sSL -A "Mozilla/5.0 ..."`，单次 GET |
| 大小 (bytes) | 383,475 |
| 本地文件 | `sample_page.html` |
| SHA-256 | `187d2121527236ee1e6b0efaaacbec2f9830dba8965cd4edb385e25d2616cb9e` |

## 复现命令

```bash
mkdir -p za-sources && cd za-sources
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

curl -sSL -A "$UA" -o cpa2008.pdf              https://www.gov.za/sites/default/files/gcis_document/201409/321864670.pdf
curl -sSL -A "$UA" -o cpa_regs_293.pdf         https://www.gov.za/sites/default/files/gcis_document/201409/34180rg9515gon293.pdf
curl -sSL -A "$UA" -o ecta25of2002.pdf         https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf
curl -sSL -A "$UA" -o popia4of2013.pdf         https://www.gov.za/sites/default/files/gcis_document/201409/3706726-11act4of2013popi.pdf
curl -sSL -A "$UA" -o nrcs_act_2008_govza.pdf  https://www.gov.za/sites/default/files/gcis_document/201409/312167280.pdf
curl -sSL -A "$UA" -o eca36of2005.pdf          https://www.gov.za/sites/default/files/gcis_document/201409/a36-050.pdf
curl -sSL -A "$UA" -o legalmetrology9of2014.pdf https://www.gov.za/sites/default/files/gcis_document/201409/37661gon385.pdf
curl -sSL -A "$UA" -o nrcs_impexp.html         http://www.nrcs.org.za/imports-and-exports/
curl -sSL -A "$UA" -o nrcs_about_cs.html       http://www.nrcs.org.za/compulsory-specifications/about-compulsory-specifications/

sha256sum *.pdf *.html   # 与上表逐项比对

# 引文校验（需要 pdftotext；缺 .txt 时脚本会自行转换）
python3 ../wendo-dev/agent/knowledge/legal/za/verify_excerpts.py --sources .
```

期望输出：`41 rules checked, 0 problem(s)`。

> 复现注意：gov.za 的 PDF URL 带公报文件名，文件名稳定但内容可能随官方替换而变化。
> 重新下载后若哈希不一致，先比对 rulename 与页码，再判断是「官方重发」还是「URL 被复用」，
> 不要直接覆盖旧哈希记录。
