# 澳大利亚法条规则库 v0.1 — 来源清单

核验日期：2026-11-14。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。澳大利亚联邦法规在 Federal Register of Legislation（legislation.gov.au）以英文发布；本库引文取自该库的合并 PDF 与监管机关官网英文页面，不使用律所文章、商业数据库或二手翻译作为引文来源。

> 适用地域：ACL 为联邦法并由各州/领地适用法并行实施；电气准入以州/领地法为主，EESS 仅在参与辖区适用。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | legislation.gov.au 发布的议会法案合并文本 | 是 |
| `official_regulator` | ACCC / ACCC Product Safety / EESS 官方指引、说明与数据库说明 | 是（指引类标 `guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索（本版未使用） |

## 主来源（联邦法规）

全部为 2026-11-14 从官方域名直接下载的 PDF；版本信息取自文首 compilation 页。

| ID | 法规 / 文件 | 版本 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| AU1 | Competition and Consumer Act 2010 (Cth)（含 Schedule 2 Australian Consumer Law） | Compilation No. 168；2026-10-27；C2026C00486（registered 2026-11-09） | 2,231,312 | https://www.legislation.gov.au/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/1 | `cca2010_v1.pdf` | `5e40bc9c5be89f772de47aa90d355b33a9631cd6cedaa16a47dea96cd2989ab0` |
| AU1 | （同上，第 2 卷） | Compilation No. 168 | 2,215,868 | https://www.legislation.gov.au/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/2 | `cca2010_v2.pdf` | `b269d14da2f96e13ab6e185ecc299fd714a633b8b7daa9e96f4cf04c8ea90949` |
| AU1 | （同上，第 3 卷） | Compilation No. 168 | 2,367,375 | https://www.legislation.gov.au/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/3 | `cca2010_v3.pdf` | `f266e517a42aaab81170e3ce43ecf0dedeb58880d1ace0705c85878f7ccb1b37` |
| AU1 | （同上，第 4 卷：Schedules 与 Endnotes） | Compilation No. 168 | 2,524,268 | https://www.legislation.gov.au/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/4 | `cca2010_v4.pdf` | `866a8ff9ee8b1953a8675cb53b0b6bc37deec1c92385448ab116ebe0e8362a37` |
| AU2 | Privacy Act 1988 (Cth) | Compilation No. 104；2026-06-04；C2026C00227 | 1,920,725 | https://www.legislation.gov.au/C2004A03712/2026-06-04/2026-06-04/text/original/pdf | `privacy1988.pdf` | `443e895f1e1536763af78e4553d469b0857a84553ca0c011ed796a623f954e38` |
| AU3 | Spam Act 2003 (Cth) | Compilation No. 10；2016-03-10；C2016C00614 | 1,027,376 | https://www.legislation.gov.au/C2004A01214/2016-03-10/2016-03-10/text/original/pdf | `spam2003.pdf` | `a58a1a0ef7fc2d65fdf945f84a1feed03cbc3d2353c148a59f2311d732604ff1` |
| AU4 | Consumer Goods (Products Containing Button/Coin Batteries) Safety Standard 2020 | Compilation No. 1；2022-04-06；F2022C00445 | 726,042 | https://www.legislation.gov.au/F2020L01656/2022-04-06/2022-04-06/text/original/pdf | `button_battery_safety_2020.pdf` | `1e253ccf2b7bf58012c3e4f3374335933dfd59759a077a6bc27866ee28de221d` |
| AU5 | Consumer Goods (Products Containing Button/Coin Batteries) Information Standard 2020 | As made；registered 2020-12-21；F2020L01657 | 600,725 | https://www.legislation.gov.au/F2020L01657/asmade/2020-12-21/text/original/pdf | `button_battery_info_2020.pdf` | `2ce997a4f92d84c9f29e0e447d3a6aff2f818c9a6fe1ad9209cec2689d40d745` |
| AU6 | Greenhouse and Energy Minimum Standards Act 2012 (Cth) | Compilation No. 8；2025-12-05；C2025C00666 | 625,175 | https://www.legislation.gov.au/C2012A00132/2025-12-05/2025-12-05/text/original/pdf | `gems2012.pdf` | `9d9dbcd74d300a4a485383e80c634eb9e7c955571e2363dd5822e51d765cddc9` |
| AU7 | Radiocommunications Equipment (General) Rules 2021 | Compilation No. 5；2026-01-16；F2026C00051 | 614,843 | https://www.legislation.gov.au/F2021L00661/2026-01-16/2026-01-16/text/original/pdf | `radcomms_rules2021.pdf` | `055f8616f87ac976828ae214ddbef018fdd9ed263f17f9f4d9c3c1b60fa844d6` |
| AU-C1 | Radiocommunications Act 1992 (Cth)（核对设备规则的罚则路径 s.160） | Compilation No. 82；2025-07-01；C2025C00412 | 1,484,255 | https://www.legislation.gov.au/C2004A04465/2025-07-01/2025-07-01/text/original/pdf | `radcomms1992.pdf` | `10878957d4ed1fae3d05326f9558e9a39597d68f3323dce0e35d571deb401812` |

## 主来源（监管机关指引与数据库说明，`article_type=guideline`）

| ID | 文件 | 版本 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| AU8 | EESS — Selling Electrical Equipment in Australia（销售流程与 in-scope 定义） | 抓取于 2026-11-14 | 80,751 | https://www.eess.gov.au/equipment/selling-electrical-equipment-in-australia/steps-for-compliance-with-eess/ | `eess_equipment_selling-electrical-equipment-in-australia_steps-for-compliance-with-eess.html` | `b659d6629e70f4d3277474207d586a405d0a735a4adda25e0831c109fab2f523` |
| AU8 | EESS — Registration – In-Scope Electrical Equipment（Level 1/2/3 注册） | 抓取于 2026-11-14 | 79,776 | https://www.eess.gov.au/registration/registration-in-scope-electrical-equipment/ | `eess_registration_registration-in-scope-electrical-equipment.html` | `94e157937eada4d07f5285a12fe711e001d0725896ae499a51b59beeb3703851` |
| AU8 | EESS — Responsible Supplier（澳/新实体要求） | 抓取于 2026-11-14 | 81,581 | https://www.eess.gov.au/responsible-supplier/manufacturers-and-importers-responsible-suppliers/ | `eess_responsible-supplier_manufacturers-and-importers-responsible-suppliers.html` | `73b0cb848c9ebb868abb577e4ed5f82db6680354ea27c18791e6df9f51552b23` |
| AU8 | EESS — Marking of Electrical Equipment（RCM） | 抓取于 2026-11-14 | 71,271 | https://www.eess.gov.au/rcm/marking-of-electrical-equipment/ | `eess_rcm_marking-of-electrical-equipment.html` | `d69561ab1e47d05ee2a3f71e87b297a1e423b2b7c910a6c214abf17cbd6465c0` |
| AU8 | EESS — Compliance Folder（合规档案） | 抓取于 2026-11-14 | 73,114 | https://www.eess.gov.au/safety-requirements/compliance-folder/ | `eess_safety-requirements_compliance-folder.html` | `af05187f1755493a39a463a7ed8de5c463942628fbba84e8d92ba863fd894d90` |
| AU8 | EESS — Participating Jurisdictions（IGA 签署方） | 抓取于 2026-11-14 | 73,461 | https://www.eess.gov.au/about/participating-jurisdictions/ | `eess_juris.html` | `2bbb7b4305588071278670cbb5b2f3792105fa66a7edcc6b59b55503dc150b00` |
| AU9 | ACCC — Country of origin claims | 抓取于 2026-11-14 | 115,948 | https://www.accc.gov.au/business/advertising-and-promotions/country-of-origin-claims | `accc_advertising-and-promotions_country-of-origin-claims.html` | `bf65dcc5c9e2584e4e64ace5e3a81e443bce5dc30d83879c6ab53bbb08d52854` |
| AU9 | ACCC — Environmental and sustainability claims | 抓取于 2026-11-14 | 120,818 | https://www.accc.gov.au/business/advertising-and-promotions/environmental-and-sustainability-claims | `accc_advertising-and-promotions_environmental-and-sustainability-claims.html` | `7f59688927c3789b330168517d75cd00825cc8096da6431d2aef95dee3b8f3d6` |
| AU9 | ACCC — Online reviews for products and services | 抓取于 2026-11-14 | 111,686 | https://www.accc.gov.au/business/advertising-and-promotions/online-reviews-for-product-and-services | `accc_advertising-and-promotions_online-reviews-for-product-and-services.html` | `1c6939ed38ff07f254f413e56fca73cea2a8a45a0d7ce5bc5f2d40398ca8941f` |
| AU9 | ACCC — Price displays | 抓取于 2026-11-14 | 123,802 | https://www.accc.gov.au/business/pricing/price-displays | `accc_pricing_price-displays.html` | `9b3b64ecb0f860dc00519dadbf39cafb754b7a3ffc3bcd87e185ff22be4b3683` |
| AU9 | ACCC — False or misleading claims | 抓取于 2026-11-14 | 137,144 | https://www.accc.gov.au/business/advertising-and-promotions/false-or-misleading-claims | `accc_advertising-and-promotions_false-or-misleading-claims.html` | `d9757bc3bd50d6ec7c806e2493230addd6db012d750edf7ed3f0962b7a3836c3` |
| AU10 | ACCC Product Safety — Button and coin batteries mandatory standards（4 项强制标准清单） | 抓取于 2026-11-14 | 80,630 | https://www.productsafety.gov.au/standards/button-coin-batteries | `ps_button.html` | `8f504a2fb1bf608bacb8ad4dcd11dd51bd2daca39f097378d10d3287f9f15b3c` |

> 说明：EESS 与 ACCC 页面未标注发布/更新日期，规则中的 `effective_date` 取抓取日 2026-11-14；这类条目在报告中只能作为“监管机关口径/指引”引用，不能单独当法条。

## 复现命令

```bash
mkdir -p au-sources && cd au-sources
base=https://www.legislation.gov.au

# 联邦法规（PDF，按版本固定）
curl -sSL "$base/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/1" -o cca2010_v1.pdf
curl -sSL "$base/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/2" -o cca2010_v2.pdf
curl -sSL "$base/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/3" -o cca2010_v3.pdf
curl -sSL "$base/C2004A00109/2026-10-27/2026-10-27/text/original/pdf/4" -o cca2010_v4.pdf
curl -sSL "$base/C2004A03712/2026-06-04/2026-06-04/text/original/pdf"     -o privacy1988.pdf
curl -sSL "$base/C2004A01214/2016-03-10/2016-03-10/text/original/pdf"     -o spam2003.pdf
curl -sSL "$base/F2020L01656/2022-04-06/2022-04-06/text/original/pdf"     -o button_battery_safety_2020.pdf
curl -sSL "$base/F2020L01657/asmade/2020-12-21/text/original/pdf"          -o button_battery_info_2020.pdf
curl -sSL "$base/C2012A00132/2025-12-05/2025-12-05/text/original/pdf"     -o gems2012.pdf
curl -sSL "$base/F2021L00661/2026-01-16/2026-01-16/text/original/pdf"     -o radcomms_rules2021.pdf
curl -sSL "$base/C2004A04465/2025-07-01/2025-07-01/text/original/pdf"     -o radcomms1992.pdf

# 监管机关页面（HTML，内容可能随站点更新变化，需按抓取日复核）
for p in \
  equipment/selling-electrical-equipment-in-australia/steps-for-compliance-with-eess \
  registration/registration-in-scope-electrical-equipment \
  responsible-supplier/manufacturers-and-importers-responsible-suppliers \
  rcm/marking-of-electrical-equipment \
  safety-requirements/compliance-folder \
  about/participating-jurisdictions; do
  curl -sSL -A 'Mozilla/5.0' "https://www.eess.gov.au/$p/" -o "eess_$(echo $p | tr '/' '_').html"
done
curl -sSL -A 'Mozilla/5.0' https://www.accc.gov.au/business/advertising-and-promotions/country-of-origin-claims -o accc_country_of_origin.html
curl -sSL -A 'Mozilla/5.0' https://www.accc.gov.au/business/advertising-and-promotions/environmental-and-sustainability-claims -o accc_green_claims.html
curl -sSL -A 'Mozilla/5.0' https://www.accc.gov.au/business/advertising-and-promotions/online-reviews-for-product-and-services -o accc_reviews.html
curl -sSL -A 'Mozilla/5.0' https://www.accc.gov.au/business/pricing/price-displays -o accc_price_displays.html
curl -sSL -A 'Mozilla/5.0' https://www.accc.gov.au/business/advertising-and-promotions/false-or-misleading-claims -o accc_false_claims.html
curl -sSL -A 'Mozilla/5.0' https://www.productsafety.gov.au/standards/button-coin-batteries -o ps_button.html

sha256sum *.pdf *.html
```

2026-11-14 实测：从上述 URL 重新下载 `radcomms_rules2021.pdf` 与 `button_battery_info_2020.pdf`，SHA-256 与表中一致（PDF 为按版本固定的静态文件，可复现）。HTML 页面为动态站点，重新抓取可能因页面更新而产生不同哈希；核验时以文中引文是否仍能在页面找到为准。

## 交叉核对记录

1. **ACL 的生效与罚金上限**：CCA 附表 2 为 ACL；CCA 第 4 卷 Legislation history 载明 Act No. 103, 2010 的 sch 1、2、4、5、7 自 **2011-01-01** 起施行。s.224(3A) 现行法人上限为 **$100,000,000** / 获益 3 倍 / 违规期调整营业额 30%；s.224 的修订记录为 Act No. 136/2024、No. 19/2026、No. 64/2026。许多中文资料仍写 $50m，属旧文本。
2. **s.18 没有民事罚金**：s.224(1)(a) 的清单覆盖 Part 2-2、s.23(2A)/(2C)、Part 3-1、Part 3-3 的 s.106 系列、Part 3-4 的 s.136 系列等，**不含 Part 2-1（s.18）**。因此 AU-ADV-01 的罚则写“无民事罚金”，s.18 的救济走 Part 5-2。
3. **“consumer”门槛为 $40,000**：s.3(1)(a)(i) 为 $40,000（或法规规定的更高金额），s.3(1)(b) 另设“通常为个人、家庭或家居使用”的独立标准。小家电多数落入 (b)，与售价无关。
4. **举证责任倒置**：s.4(1)-(2) 对“未来事项”陈述推定无合理依据；s.29(2) 对证言类陈述推定误导。两条均已在规则 `notes` 标注。
5. **单一价格**：s.48(1) 要求“prominent way and as a single figure”；s.48(2) 允许不含运费，但 s.48(3) 要求已知最低运费一并标明；s.48(4) 排除仅面向法人的情形；s.48(7) 定义 single price 包含税费与不可避免的收费。
6. **原产地安全港**：s.255(1) 表格 item 1/2/3/4 分别对应 grown / produce / made / information standard mark；s.255(2)(b) 定义“实质性改变”。s.255(5) 说明 “product of / produce of” 的语法变体；s.255(8) 排除包装材料。
7. **安全/信息标准的罚则**：s.224(3) 表 item 10（s.106 系列）与 item 14（s.136 系列）均适用 s.224(3A) 上限。
8. **纽扣/硬币电池的适用日**：两项标准的 `application day` 均定义为“commencement 起 18 个月期满之日的次日”；安全标准 Compilation No. 1 载明 commenced 2020-12-21、application day 2022-06-22（信息标准同为 2022-06-22）。安全标准 s.6(3)(e) 与信息标准 s.6(3)(d) 对“焊接固定的音视频/ICT 设备”设排除。
9. **信息标准 s.14 不是强制条款**：s.11(2) 明确不符合 Part 3（Recommendations）不构成对本 instrument 的违反；因此“平台商品描述加电池警示”只能作为建议，不得当作违规依据。已在 AU-BATT-05 的 `notes` 标注。
10. **EESS 的辖区范围**：`participating-jurisdictions` 页面载明 IGA 签署方为 Queensland、Western Australia、Victoria、Tasmania；页面同时写“Other jurisdictions are currently progressing or considering implementation”。因此本库不写“全澳统一强制注册”。
11. **EESS 的主体资格**：`responsible-supplier` 页面明确 “An overseas based company cannot be registered on the EESS Registration Database to become a Registered Responsible Supplier in the EESS”，并要求澳/新法律实体与 ABN/IRD；`acma-requirements-use-of-rcm` 页面另写 “Agents are not permitted under the EESS”。
12. **EESS 的 Level 与 RCM**：`registration` 页面写 Level 1 注册自愿、Level 2/3 强制；`marking-of-electrical-equipment` 页面写 “All Level 1, 2 or 3 electrical equipment offered for sale by registered Responsible Suppliers must be marked with the Regulatory Compliance Mark (RCM)”。两处不矛盾：设备注册与 RCM 加贴是两件事。
13. **EESS 的 in-scope 边界存在两页表述差异**：`not-in-scope` 页面称“exclusively for commercial, industrial, medical …”不属于 in-scope；`steps-for-compliance` 页面称“It is immaterial whether the equipment is designed or marketed for commercial or industrial purposes”。两者可协调为“纯商用/工业专用”与“家用但也可商用”之别；本库按更保守的口径处理，并在 README Open Questions 记录。
14. **ACMA 的罚则路径**：设备规则本身不写罚则，违反规则中的禁令依 Radiocommunications Act 1992 **s.160(5)** 承担民事罚则（500 penalty units），s.160(1) 另有罪行路径（500 penalty units）。已用 AU-C1 交叉核对。
15. **隐私罚则**：s.13G(3) 法人上限为 $50,000,000 / 获益 3 倍 / 调整营业额 30%；s.13H 为 2,000 penalty units；s.13K 允许对 APP 1.3/1.4 等发出侵权通知或合规通知。
16. **Spam Act 罚则**：s.25(3) 法人对 s.16(1)/(6)/(9) 每次最高 100 penalty units、同日多次合计 2,000；其他条款每次 50、合计 1,000。本库只写单位数，未折算澳元。
17. **GEMS 的适用范围**：s.12(1) 要求按产品类别注册（除非 determination 豁免）；s.16(1) 禁止供应不符合 determination 要求的产品。具体产品类别清单由 GEMS determinations 界定，本版未逐项映射。
18. **ACCC 指引与法条的关系**：5 份 ACCC 指引均为 `article_type=guideline`，`penalty_or_note` 一律回到 ACL 条款；不得把指引本身写成处罚依据。

## 未取得 / 未使用的来源

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| OAIC — Australian Privacy Principles Guidelines（APP 1 / APP 5 章节） | 未取得（HTTP 403） | `oaic.gov.au` 在本环境被 Cloudflare 拦截；本版只以 Privacy Act 1988 原文为依据，未引用 OAIC 解释 |
| ACMA — Compliance labelling / 供应商指引页面 | 未取得（超时/HTTP2 错误） | 改用 Radiocommunications Act 1992 与 Radiocommunications Equipment (General) Rules 2021 原文 |
| energyrating.gov.au（GEMS 产品类别与能效标签） | 未取得（HTTP/2 INTERNAL_ERROR） | 未逐 SKU 映射 GEMS 产品类别 |
| AS/NZS 3112（插头）、AS/NZS 60335 系列、AS/NZS 4417.1/4417.2 | 未取得（付费标准） | 插头型式未单列为规则；RCM 尺寸/位置只作证据项 |
| NSW Fair Trading — prescribed electrical articles / approval 编号 | 未取得 | NSW 未签 EESS IGA，另有本州制度；本版未建 NSW 规则 |
| SA / ACT / NT 电气安全法 | 未取得 | 同上，需 v0.2 补 |
| Country of Origin Food Labelling Information Standard 2016 | 未收录 | 仅适用食品，本版不覆盖 |
| Do Not Call Register Act 2006 | 未收录 | 电话营销属营销运营，非页面可观察 |
| TGA — 治疗用品/消毒产品指引 | 未收录 | “杀菌/消毒/抗菌”声称的 TGA 边界未研究 |
| 州/领地食品法与 FSANZ Code（食品接触材料） | 未核 | 未找到统一联邦食品接触标准；本版不覆盖 |

## 引文核验方法

- 用 `pdftotext -layout` 抽取 PDF 文本（HTML 页面用 BeautifulSoup 去脚本/样式后取可见文本），再做空白归一化与相邻重复行去重；弯引号、破折号归一为 ASCII。
- 对 45 条规则的 `verbatim_excerpt` 逐条做“归一化后子串匹配”，**45/45 命中，0 处不匹配**（匹配范围为对应 `source_id` 的全文）。
- 复验脚本：`agent/knowledge/legal/au/verify_excerpts.py`。下载完本文件所列来源后运行：

```bash
python3 agent/knowledge/legal/au/verify_excerpts.py --sources /path/to/au-sources
# checked 45 excerpts, 0 mismatch(es)
```

- 抽取值均为连续原文片段，未改写、未拼接；表格类条文（如 s.255 的 item 表）改用同条的解释性段落（s.255(2)(b)）作为引文，避免跨单元格拼接。
- PDF 为数字文本，非 OCR；无 OCR 来源需要单独标注。
