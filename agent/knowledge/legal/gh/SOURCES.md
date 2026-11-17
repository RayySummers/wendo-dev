# 加纳（GH）法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文或官方英文译本。加纳成文法以英文制定并公布，本库全部引文为英文原文；未使用任何二手翻译。加纳没有可公开访问的政府统一立法数据库，官方文本主要来自**部门/监管机关托管的公报影印本**与**贸易与工业部 BRR 门户的逐条公布页**。凡非 `*.gov.gh` 域名者，均在规则字段 `official_url_note` 与下表「托管说明」中注明。

> 适用说明：加纳**没有统一的消费者保护法**（《Consumer Protection Bill》自 2014 年提出后仍未通过）。消费者保护规则分散在 ETA 2008、L.I. 1541、PHA 851、GSA Act 2022 等部门法与监管指南中；这一结构性事实已写入 `README.md` 的关键发现与 open questions。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 公报影印本或政府门户公布的成文法/附属立法原文 | 是 |
| `official_regulator` | 监管机关官网发布的指南、通告、流程文件（含 BRR 门户逐条公布页） | 是（指南类标 `article_type=guideline`，不能替代法条） |
| `secondary` | 律所文章、行业报告、商业数据库、非政府组织研究 | 否，仅作线索（本版仅用于交叉核对与 open questions，未作为引文） |

## 主来源（成文法与附属立法）

| ID | 法规 / 文件 | 版本与日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 | 托管说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GH1 | Electronic Transactions Act, 2008 (Act 772)，as amended by Act 838 (2012)（s.47、s.50） | 2008 年；BRR 页面未载生效日 | 58,524（s.47 页） | https://brr.gov.gh/new/search_detail.php?indexes_id=NTEx~Electronic+Transactions+Act,+2008+(Act+772)+as+amended+by+the+Electronic+Transactions+(Amendment)+Act,+2012+(Act+838)~79~57 | `brr_eta47.html` | `3851f227c1d2453b111d712ed5f42fb17971e412a16ce1e985fef61e5445e5fd` | gov.gh（贸易与工业部 BRR 门户）；同法 s.47(5)-(6) 与 s.50(1) 为另两个页面（见下） |
| GH1 | 同上，s.47(5)-(6) | 同上 | 55,663 | https://brr.gov.gh/new/search_detail.php?indexes_id=NTEy~Electronic+Transactions+Act~79~57 | — | 页面为动态渲染，SHA 会随访问变化；以条文文本为准 | 同上 |
| GH1 | 同上，s.50(1) | 同上 | 55,558 | https://brr.gov.gh/new/search_detail.php?indexes_id=NTEz~Electronic+Transactions+Act~79~57 | — | 同上 | 同上 |
| GH2 | Ghana Standards Board (Food, Drugs and Other Goods) General Labelling Rules, 1992 (L.I. 1541) | 1992-05-04 生效（r.16） | 82,473 | https://faolex.fao.org/docs/pdf/gha17279.pdf | `li1541.pdf` | `ea19e0840dde8e2e413210bd0e7e0034709650e995ecd452c16a907749f97c61` | FAOLEX 托管的加纳公报影印本（政府提交文本）；非政府域名 |
| GH3 | FDA Guidelines for Labelling of Cosmetics and Household Chemical Substances（FDA/MCH/CHC/GL-LCH/2013/03） | Version 01；2013-02-01 首次通过，2013-03-01 发布 | 110,033 | https://fdaghana.gov.gh/wp-content/uploads/2024/02/GUIDELINE-LABELLING-REQUIREMENTS-MDCHC-1.pdf | `fda_labelling_guideline.pdf` | `c6ea02dbb9755963ec054f6a5a3913bbb68c34ac900c59457339ebeafbbd1630` | gov.gh（FDA 官网） |
| GH4 | Public Health Act, 2012 (Act 851) | 2012-10-09 签署；2012-10-16 公报 | 983,821 | https://brr.gov.gh/acc/registry/docs/PUBLIC%20HEALTH%20ACT,%202012%20(ACT%20851).pdf | `pha851.pdf` | `4260765df7d71b7b279b938516e3203d42ea39be2be68b3da8a78ed26c79a15f` | gov.gh（BRR 门户文件库） |
| GH5 | Ghana Standards Authority Act, 2022 (Act 1078) | 2022-06-30 签署 | 6,449,690 | https://faolex.fao.org/docs/pdf/gha233071.pdf | `gsa_act1078.pdf` | `004143e3c12c7576bf292dbe64d462f16f2317c679a1f4cfb67e828f8b635d86` | FAOLEX 托管的加纳公报影印本；**文本层为 OCR，质量较差**，s.33(2) 已按扫描页 p.24 逐字校读 |
| GH6 | Electronic Communications Act, 2008 (Act 775) | 2009-01-06 签署 | 381,477 | https://nca.org.gh/wp-content/uploads/2023/04/NCA-Electronic-Communications-Act-775.pdf | `eca775.pdf` | `cdb016fc5e237c3ceb2396b0c1a75b9254270bff91a0de45b665f9a73d90f898` | gov.gh（NCA 官网） |
| GH6 | NCA Type Approval Guidelines — Electronic Communications Equipment | 2015-05-26 | 1,793,564 | https://nca.org.gh/wp-content/uploads/2021/11/Type-Approval-Revised-Guidelines-2015-Final-Revised2.pdf | `nca_type_approval_2015.pdf` | `f09add7cef2c1aa24b3137339f1a2628d903fc115c68d58ab1ad6a9ef91d31e1` | gov.gh（NCA 官网） |
| GH7 | Energy Efficiency Standards and Labelling (Non-Ducted Air Conditioners and Self-Ballasted Fluorescent Lamps) Regulations, 2005 (L.I. 1815) | 2005-06-02 制定；BRR 记公报日 2005-01-01 | 56,791（reg.2 页） | https://brr.gov.gh/new/search_detail.php?indexes_id=MTM0Ng==~Energy+Efficiency+Standards+and+Labelling+(Non-Ducted+Air+Conditioners+and+Self-Ballasted+Fluorescent+Lamps)+Regulations,+2005+(L.I.+1815)~148~9 | `brr_detail.html` | `c848bc4e4d7e4ff5095ef1c8b53b6cef7de5a1bbc841120de2619c5fa95bd756` | gov.gh（BRR 门户） |
| GH8 | Ghana EasyPASS — Certificate of Conformity（进口合格评定宣传资料） | 2018 版（2019-01-01 起强制） | 550,198 / 315,148 | https://gsa.gov.gh/wp-content/uploads/2018/12/VoC-Ghana-EasyPASS-Flyer-Import-1.4.pdf；https://gsa.gov.gh/wp-content/uploads/2019/08/Ghana-trifold-leaflet-3-005-3.pdf | `gsa_easypass_flyer.pdf`；`gsa_easypass_trifold.pdf` | `634ff12dbe3103b4ba73adadf0129c56d32e5a088ed48f2607bbe21fe750a683`；`460bdc6bfea677abd30fd06fd5c87e4f1188c79eb6e1bcd1bf5f239030d2a037` | gov.gh（GSA 官网） |
| GH9 | Data Protection Act, 2012 (Act 843) | 2012-05-10 签署；2012-05-18 公报 | 9,431,126 | https://nca.org.gh/wp-content/uploads/2020/09/Data-Protection-Act-2012.pdf | `dpa2012.pdf` | `408f8366a45d52212ea3763961d107074eb197d51ea666649a82fbb60cb5b3f7` | gov.gh（NCA 官网托管）；**无文本层，本库用 OCR 检索并逐页比对扫描图** |

## 监管指引与辅助来源（不作为引文）

| ID | 文件 | 版本 | 官方 URL | 用途 |
| --- | --- | --- | --- | --- |
| GH9-A | NCA Code of Conduct on Unsolicited Electronic Communications (UEC) | v2.0，2014-10-30 | https://nca.org.gh/wp-content/uploads/2020/09/Unsolicited-Electronic-Communications-Guidelines.zip（内含 PDF） | 仅用于理解 ETA s.50 的执行口径（同意记录、退订、发送者身份）；其义务主体主要是持牌运营商，未直接建规则 |
| GH10 | Weights and Measures Act, 1975 (NRCD 326) | 1975 | http://www.epa.gov.gh/ghanalex/acts/Acts/WEIGHTS%20AND%20MEASURES%20ACT,1975.pdf | 已取得并查阅（净含量/计量器具），本版未建规则；见 open questions |
| GH11 | Ghana EasyPASS 进口检验页面 | 抓取于 2026-11-17 | https://gsa.gov.gh/import-inspection/ | 页面正文由脚本渲染，未取到可引用的流程文本；未作为来源 |

## 交叉核对记录

| # | 待核事实 | 核对方式 | 结论 |
| --- | --- | --- | --- |
| X1 | ETA 2008 s.47 条文 | ① BRR 门户逐条页（已下载）；② 议会机构库（`ir.parliament.gh`）同名 PDF 的检索摘要，措辞与 BRR 一致 | 一致。议会 PDF 直链被 SPA 拦截、无法下载，故只作旁证，不作引文来源 |
| X2 | L.I. 1541 附表一是否覆盖小家电/3C | 逐项阅读影印本附表一（第 1-11 项） | 覆盖：燃气灶、冰箱、电扇、收音机、电视、空调、灯具、电气配件、办公设备、电机、通用家用电器、电缆、干电池 |
| X3 | L.I. 1541 r.4(3) 英文义务 | 影印本原文 + 与 r.3 的适用范围对照 | 确认「goods meant for sale or distribution in the Ghana」须以英文标示 |
| X4 | Act 1078 s.33(2) | FAOLEX OCR 文本与扫描页 p.24 对照（人工目视逐字校对） | OCR 有噪声（“andatory Standard”），**按扫描原文校正后引用**，未改动条文含义 |
| X5 | Act 843 s.27(2) 九项告知 | OCR 文本与扫描页 p.15 对照（人工目视逐字校对） | 一致 |
| X6 | Act 851 s.113(1)(b)/s.118(1)/s.148(1) | BRR PDF 文本层；PDF 存在空格缺失（“inamanner,thatisfalse”） | 已按原文补空格引用；能义不变。报告不引用该条的罚金数额 |
| X7 | 加纳是否存在统一消费者保护法 | Consumers International 研究报告、SOAS 论文、2025-03 加纳媒体报道（CPA 称法案仍未通过） | 三份二手资料一致：无统一立法，Bill 长期未通过。**列为 open question，不作为规则依据** |
| X8 | EasyPASS 执行机构 | GSA 2018/2019 宣传资料（Bureau Veritas）；GTAI 2026-07 报告（称 GSA 自 2026-07-01 自行执行） | **冲突**。GSA 官网未见更新公告；规则 GH-CERT-07 只写「装运前合格评定/CoC」，不写机构名，标 medium |
| X9 | NCA 型式批准是否有更新版 | NCA 官网 2026-02 公告「terminal communication equipment 技术规格公开征求意见」 | 2015 指南仍为现行可取得的完整文本；2026 年技术规格可能更新，列入 open questions |
| X10 | L.I. 1815 reg.2 文本 | BRR 页面与条例排版对照 | BRR 的 HTML 在换行处丢失连字符（“nonducted”“selfballasted”），引文按条例原排版作 “non-ducted”；该条在 `verify_excerpts.py` 中标为 MANUAL |

## 未取得 / 不可访问的来源

| 目标 | 状态 | 影响 |
| --- | --- | --- |
| Consumer Protection Act, 1993 (PNDCL 306) 官方文本 | `not_found`：GhaLII（ghalii.org）返回 Cloudflare 403；lawsghana.com 403；gov.gh 未找到托管副本 | 本版不引用该法；「加纳是否有统一消费者保护法」以二手资料交叉核对后列为 open question |
| Consumer Protection Bill（在审）文本 | `not_found` | 无法预判未来规则变化；列入 open questions |
| GSA 强制性标准清单 / 相关公报通告 | `not_found`：GSA 官网未提供可检索清单 | GH-CERT-01 只能写「若适用强制性标准」，无法逐品类判断 |
| L.I. 1958（家用制冷器具能效）与 L.I. 2353（LED/自镇流灯）文本 | 仅见 BRR 目录条目，未取得条文 | 冰箱/灯具能效规则未建；GH-CERT-06 仅覆盖空调与自镇流荧光灯（L.I. 1815） |
| NCA 型式批准登记册（在线查询） | 未取得可编程接口 | 报告中只能要求商家提供 TAC，不能自行核验 |
| DPC 注册指引 / 数据保护条例 | 未取得 | GH-PRV-03 只能引用 s.27(1) 本身 |
| GS 1 / GS IEC 60335 等产品标准全文 | 付费标准，未取得 | 认证类规则只能引用法律与指南，不能引用具体技术限值 |
| 加纳官方立法数据库 | 不存在可公开访问的统一库 | 这是本库来源结构的根本限制，已写入 README |

## 复现命令

```bash
mkdir -p gh-sources && cd gh-sources
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

# 成文法（PDF）
curl -sSL -A "$UA" 'https://faolex.fao.org/docs/pdf/gha17279.pdf' -o li1541.pdf
curl -sSL -A "$UA" 'https://faolex.fao.org/docs/pdf/gha233071.pdf' -o gsa_act1078.pdf
curl -sSL -A "$UA" 'https://brr.gov.gh/acc/registry/docs/PUBLIC%20HEALTH%20ACT,%202012%20(ACT%20851).pdf' -o pha851.pdf
curl -sSL -A "$UA" 'https://nca.org.gh/wp-content/uploads/2023/04/NCA-Electronic-Communications-Act-775.pdf' -o eca775.pdf
curl -sSL -A "$UA" 'https://nca.org.gh/wp-content/uploads/2020/09/Data-Protection-Act-2012.pdf' -o dpa2012.pdf

# 监管指南
curl -sSL -A "$UA" 'https://fdaghana.gov.gh/wp-content/uploads/2024/02/GUIDELINE-LABELLING-REQUIREMENTS-MDCHC-1.pdf' -o fda_labelling_guideline.pdf
curl -sSL -A "$UA" 'https://nca.org.gh/wp-content/uploads/2021/11/Type-Approval-Revised-Guidelines-2015-Final-Revised2.pdf' -o nca_type_approval_2015.pdf
curl -sSL -A "$UA" 'https://gsa.gov.gh/wp-content/uploads/2018/12/VoC-Ghana-EasyPASS-Flyer-Import-1.4.pdf' -o gsa_easypass_flyer.pdf
curl -sSL -A "$UA" 'https://gsa.gov.gh/wp-content/uploads/2019/08/Ghana-trifold-leaflet-3-005-3.pdf' -o gsa_easypass_trifold.pdf

# BRR 逐条页（HTML，动态渲染，SHA 仅作抓取时点记录）
curl -sSL -A "$UA" 'https://brr.gov.gh/new/search_detail.php?indexes_id=NTEx~Electronic+Transactions+Act,+2008+(Act+772)+as+amended+by+the+Electronic+Transactions+(Amendment)+Act,+2012+(Act+838)~79~57' -o brr_eta47.html
curl -sSL -A "$UA" 'https://brr.gov.gh/new/search_detail.php?indexes_id=NTEy~Electronic+Transactions+Act~79~57' -o brr_eta47_5.html
curl -sSL -A "$UA" 'https://brr.gov.gh/new/search_detail.php?indexes_id=NTEz~Electronic+Transactions+Act~79~57' -o brr_eta50.html
curl -sSL -A "$UA" 'https://brr.gov.gh/new/search_detail.php?indexes_id=MTM0Ng==~Energy+Efficiency+Standards+and+Labelling+(Non-Ducted+Air+Conditioners+and+Self-Ballasted+Fluorescent+Lamps)+Regulations,+2005+(L.I.+1815)~148~9' -o brr_li1815_reg2.html

# 逐条比对引文（PDF 会自动 pdftotext；扫描件来源标 MANUAL，已目视校对）
python3 ../gh/verify_excerpts.py --sources .

# 校验
sha256sum li1541.pdf gsa_act1078.pdf pha851.pdf eca775.pdf dpa2012.pdf \
  fda_labelling_guideline.pdf nca_type_approval_2015.pdf gsa_easypass_flyer.pdf gsa_easypass_trifold.pdf
```

> 重新下载后 SHA-256 应与上表一致。BRR 页面为服务端动态渲染，HTML 字节可能变化（含会话 token），核验以条文文本为准；PDF 类来源应逐字节一致。
