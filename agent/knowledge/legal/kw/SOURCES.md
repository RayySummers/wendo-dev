# 科威特规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文或官方英文译本。科威特的议会立法只有阿拉伯语官方文本，未收录；见文末「未取得 / 不可用来源」。
> 下载说明：本环境对部分政府站点（`*.gov.kw`）的证书链校验失败，`curl` 使用了 `-k`；因此每个文件都记录 SHA-256，重新下载后应逐字节一致。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_regulator` | 监管机关（PAI / CITRA）发布的条例、指南、标准文本；或该国通过 WTO TBT 通报提交的英文标准全文 | 是（指南类标 `article_type=guideline`，不能替代法条） |
| `official_statute` | 议会立法 / 法令的官方文本 | 是（本版未取得英文版，故无此类来源） |
| `secondary` | 律所译本、认证机构说明、新闻 | 否，仅作线索或交叉核对 |

## 主来源

| ID | 文件 | 版本 / 日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| KW1 | PAI — Kuwait Conformity Assurance Scheme (KUCAS) Guidelines（文件号 QW-750-21） | 2008-07-13（KUCAS 自 2006-06-17 实施） | 510,037 | https://chemreg.net/regulations/gmsds-july19-529/@@download/file/GMSDS-July19-529.pdf | `kucas_guidelines.pdf` | `3102d2d2f2ea4f0a9c6c6d0e4e9e591fec1b61e11181f05123f02614dfe01b12` |
| KW2 | KWS 1893:2018 — Energy Efficiency Labelling and MEPS for DX Air-Conditioners up to 70,000 Btu/h | 2018（PAI 部长令 15/2018） | 2,211,043 | https://members.wto.org/crnattachments/2018/TBT/KWT/18_5441_00_x.pdf | `18_5441_00_x.pdf` | `7095fdf6e81b954651234d4bf78c56d90bd1260db0d38b2e0858df5426d35afb` |
| KW3 | KWS 1898:2023 — Electrical Clothes Dryers: Energy Performance Requirements and Labeling（通报草案 KWS ---/2022） | 2022 草案；定稿 2023 | 760,208 | https://members.wto.org/crnattachments/2022/TBT/KWT/22_8136_00_e.pdf | `kws_22_8136.pdf` | `89dd1773c377e85fc66188ed5f8e45842ee5fed5352faf71de9e255eae09cdb1` |
| KW4 | KWS 1900:2023 — Refrigerators, Refrigerator-Freezers and Freezers: Energy Performance, Testing and Labeling Requirements（通报草案 KWS ---/2022） | 2022 草案；定稿 2023 | 1,084,462 | https://members.wto.org/crnattachments/2022/TBT/KWT/22_8552_00_e.pdf | `22_8552_00_e.pdf` | `86b75b55db0bc7953d4236250b87f64e71fb1d51d45a20b46644c810e19f4b1c` |
| KW5 | KWS 1899:2023 — Electrical Clothes Washing Machines: Energy and Water Performance Requirements and Labeling（通报草案 KWS ---/2022） | 2022 草案；定稿 2023 | 980,066 | https://members.wto.org/crnattachments/2022/TBT/KWT/22_8170_00_e.pdf | `22_8170_00_e.pdf` | `6156b5dc8da818c2fedeb009cb859876a8318435068ce04b7b10a78e750dfa02` |
| KW6 | CITRA — Regulation for Approval of Communication Devices Type（扫描件，16 页） | Version 1.4；Decision No. 153/2021（2021-09-09） | 983,321 | https://www.citra.gov.kw/sites/en/LegalReferences/Regulation_for_Approval_of_Communication_Devices_Type.pdf | `citra_type_approval.pdf` | `c0ea4da21879cc611cd12247b4b3f6ebaf42470ec511d5e1b90026932fb921f5` |
| KW7 | CITRA — User Protection and Privacy Rules Regulation（扫描件，17 页） | 未标版本；Decision No. 69/2022（2022-04-21） | 779,983 | https://www.citra.gov.kw/sites/en/LegalReferences/User_Protection_and_Privacy_Rules_Regulation.pdf | `User_Protection_and_Privacy_Rules_Regulation.pdf` | `7520788265db02ef2268b953b174010f75a2adc29a65dc9b053025cd07d5e293` |

### 决议元数据（仅用于确认决议号与日期，不产生引文）

| ID | 文件 | 内容 | 大小 (bytes) | URL | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| KW8 | CITRA 决议详情页（阿语） | Decision No. 2021/153，发布日期 09/09/2021，条例名「لائحة اعتماد نوع أجهزة الاتصالات」 | 80,398 | https://www.citra.gov.kw/sites/ar/Pages/DecisionsDetails.aspx?id=35 | `d230293d56f8837f69261ea91a92fea47b1f18c4e01a508adcdd81910669dfe8` |
| KW9 | CITRA 决议详情页（阿语） | Decision No. 2022/69，发布日期 21/04/2022，「اللائحة الخاصة بحماية حقوق مستخدمين خدمات الاتصالات وتكنولوجيا المعلومات」 | 79,783 | https://www.citra.gov.kw/sites/ar/Pages/DecisionsDetails.aspx?id=31 | `596d116af3b5118af3c543f371b7d15e09bdef7bdb38a50ecbad3cd0a718dfb3` |

### OCR 说明

KW6 / KW7 是扫描 PDF，无文本层。处理方式：

```bash
pdftoppm -r 200 -png citra_type_approval.pdf ocr_ta/p
for f in ocr_ta/p-*.png; do tesseract "$f" "${f%.png}" -l eng --psm 3; done
cat ocr_ta/p-*.txt > citra_type_approval.ocr.txt
```

引文在入库前逐页与页面图像核对（KW6 第 6/10/12/14 页；KW7 第 14/17 页），规则中 `ocr_source: true` 标注；OCR 仍可能丢失项目编号（如「1.」「.」），故引文只取完整句子，不取编号。

## 交叉核对记录

| 事实 | 主来源 | 交叉核对 | 结论 |
| --- | --- | --- | --- |
| KWS 1893:2018 现行有效、部长令 15/2018 | KW2 §1/§6 | PAI 标准详情页 `https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=9532`（Status: Active；Ministerial Decree 15/2018；英文 21 页，KWD 13） | 一致 |
| KWS 1900:2023 现行有效 | KW4 §1/§8 | PAI 标准详情页 `https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19144`（Status: Active；范围与草案一致） | 一致 |
| 干衣机/洗衣机/冰箱三项 2023 版为新增能效品类，2024-10-08 强制 | KW3/KW4/KW5 | PAI 部长令 16/2023（2023-10-08 公报）采纳 KWS 1897/1898/1899/1900:2023；Intertek、Bureau Veritas、UL、TÜV 与商务部 WTO 事务网站均称 2024-10-08 起适用且须在 PAI EER/TABEK 注册 | 一致（四家独立转述；公报原文未取得，日期仍标二手） |
| CITRA 型号核准证书有效期 3 年、2021-09 起实施 | KW6 Art. 11 | Intertek（2021-12-28）、DEKRA（2021-09-13）新闻；CITRA 决议页 153/2021 | 一致 |
| 用户保护规则适用于 CITRA 持牌人 | KW7 Art. 1-3 定义 | CITRA 决议页 69/2022 第 1 条「تسري أحكام اللائحة ... على المرخص لهم」 | 一致 |
| KUCAS 受管制产品需 TER/TIR 才能清关 | KW1 §2–§4 | PAI TABEK 介绍页 `https://ksm.pai.gov.kw/sites/cm/en/pages/AboutTabek.aspx`；Intertek/Portugal Global 2026-02 说明（二手） | 一致；2026 年办理已迁 TABEK，流程细节待核 |
| 科威特官方语言为阿拉伯语、法律以阿语公布 | — | 科威特宪法规定阿拉伯语为官方语言；MOCI/CITRA 官网阿语版 | 一致；因此英文文本均为译本或监管机关英文版 |

## 未取得 / 不可用来源

以下来源对“广告与消费者保护”模块是必需的，但截至 2026-11-17 未取得官方英文文本，按语言政策**未收录为规则**：

| 法规 | 状态 | 已知信息（仅作线索，不作引文） |
| --- | --- | --- |
| Law No. 39 of 2014 on Consumer Protection（消费者保护法） | `official_english_unavailable` | 37 条，2014-05-25 通过、2014-06-08 在《Kuwait Al-Youm》公布；设广告专章；二手英文译本（Alitqan）载有第 10 条 14 天退换、第 12 条阿语标签、第 26 条广告至少阿语 |
| Ministerial Resolution No. 27 of 2015（实施条例） | `official_english_unavailable` | 促销/折扣的价格展示与阿语价目表要求；仅见二手译本 |
| Decree-Law No. 10 of 2026 on Regulating Digital Commerce（数字商业法） | `official_english_unavailable` | 45 条，2026-02 生效；登记、披露、电子发票、误导性广告；官方公报为阿语 |
| Law No. 3 of 2006 on Press and Publications（新闻出版法，含广告） | `official_english_unavailable` | 阿语原文；未取得英文版 |
| 1977 年《公共场所广告组织法》/ 1981 年第 3369 号决定 | `official_english_unavailable` | 阿语原文；书面广告与招牌须以阿语为主 |
| Law No. 37 of 2014（CITRA 设立法） | `official_english_unavailable` | CITRA 英文页面只有简介；`/sites/en/Documents/CitraLaw.pdf` 实为阿语合并版；罚则未取得英文文本 |
| CITRA Decision No. 26/2024（Data Privacy Protection Regulation） | `official_english_unavailable` | 2024-02-18 公报公布，取代 42/2021；仅见阿语版；42/2021 英文版存在但已失效，未收录 |
| KWS 1898/1899/1900 定稿全文 | `paid_standard` | PAI 标准商店付费（KWD 计价）；本库使用 WTO 通报草案 |
| GSO 9（预包装食品标签）等 GSO 标准 | `paid_standard` | 付费件；一般标签义务未覆盖 |
| KUCAS 2026 版流程文件 | `not_found` | 已迁至 TABEK 平台，未找到与 2008 指南对应的新版公开 PDF |
| MOCI 英文法规页 | `inaccessible` | `www.moci.gov.kw/en/law/laws-regulations/` 返回 404/403；`beta.moci.gov.kw` 的法规页为 JS 渲染，无正文或 PDF 直链 |
| e.gov.kw 英文法律库 | `inaccessible` | 全站对本环境返回 403（Azure Application Gateway） |

辅助线索（仅用于理解与交叉核对，未作为引文）：Alitqan 律所 CPL 英文/阿语对照页、UN ESCWA「Arab Business Legislative Frameworks」科威特消费者保护篇、Chambers Data Protection & Privacy 2025、DLA Piper 数据保护指南。

## 复现命令

```bash
mkdir -p kw-sources && cd kw-sources

# 主来源
curl -sSL -k "https://chemreg.net/regulations/gmsds-july19-529/@@download/file/GMSDS-July19-529.pdf" -o kucas_guidelines.pdf
curl -sSL -k "https://members.wto.org/crnattachments/2018/TBT/KWT/18_5441_00_x.pdf" -o 18_5441_00_x.pdf
curl -sSL -k "https://members.wto.org/crnattachments/2022/TBT/KWT/22_8136_00_e.pdf" -o kws_22_8136.pdf
curl -sSL -k "https://members.wto.org/crnattachments/2022/TBT/KWT/22_8552_00_e.pdf" -o 22_8552_00_e.pdf
curl -sSL -k "https://members.wto.org/crnattachments/2022/TBT/KWT/22_8170_00_e.pdf" -o 22_8170_00_e.pdf
curl -sSL -k "https://www.citra.gov.kw/sites/en/LegalReferences/Regulation_for_Approval_of_Communication_Devices_Type.pdf" -o citra_type_approval.pdf
curl -sSL -k "https://www.citra.gov.kw/sites/en/LegalReferences/User_Protection_and_Privacy_Rules_Regulation.pdf" -o User_Protection_and_Privacy_Rules_Regulation.pdf

sha256sum *.pdf   # 应与上表一致

# 文本层
for f in *.pdf; do pdftotext -layout "$f" "${f%.pdf}.txt"; done

# 扫描件 OCR（KW6/KW7）
pdftoppm -r 200 -png citra_type_approval.pdf ocr_ta/p
for f in ocr_ta/p-*.png; do tesseract "$f" "${f%.png}" -l eng --psm 3; done
cat ocr_ta/p-*.txt > citra_type_approval.ocr.txt

pdftoppm -r 200 -png User_Protection_and_Privacy_Rules_Regulation.pdf ocr_up/p
for f in ocr_up/p-*.png; do tesseract "$f" "${f%.png}" -l eng --psm 3; done
cat ocr_up/p-*.txt > User_Protection_and_Privacy_Rules_Regulation.ocr.txt

# 校验所有引文
python3 verify_excerpts.py --sources .
```

## 样例页面（`SAMPLE_FINDINGS.md`）

| 文件 | 抓取日 | 大小 (bytes) | URL | SHA-256 |
| --- | --- | --- | --- | --- |
| `xcite_ac.html` | 2026-11-17 | 241,289 | https://www.xcite.com/wansa-gold-inverter-split-air-conditioner-1-5-ton-14100-btu-t4-wi-fi-white/p | `b1ecc13b611c236f4c14cade3e8c197bcd162046430aac106cbf580163feac22` |

## 变更记录

- 2026-11-17 v0.1：首版。28 条规则 / 7 个主来源；广告与消费者保护因无官方英文文本未建规则，列入 open questions。
