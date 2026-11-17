# 科威特规则库 v0.1（rev.2）— 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **来源政策（rev.2）**：只收科威特官方域名（`pai.gov.kw` / `ksm.pai.gov.kw` / `citra.gov.kw`）上的英文原文或官方英文版。`members.wto.org`、`chemreg.net` 等非科威特官方托管不再作为引文来源。
> 下载说明：部分政府站点证书链不完整，`curl` 使用 `-k`；每个文件记录 SHA-256，重新下载后应逐字节一致。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_regulator` | PAI / CITRA 官方域名上的条例、公告、标准详情页、平台说明 | 是（页面类标 `article_type=guideline`，不能替代法条） |
| `official_statute` | 议会立法的官方文本 | 是（本版未取得英文版，故无此类来源） |
| `secondary` | 认证机构说明、律所译本、新闻 | 否，仅作线索或交叉核对 |

## 主来源

| ID | 文件 | 版本 / 日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| KW1 | PAI 标准详情页 — KWS 1893:2018（空调） | 部长令 15/2018；Active | 101,831 | https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=9532 | `pai_std_9532.html` | `d22df18b0d2c0741c88104a1af4103ee92fbc7fcdb5eb83bbc51b6e7307f7e12` |
| KW2 | PAI 标准详情页 — KWS 1898:2023（干衣机） | 部长令 16/2023；公报 2023-10-08 第 1656 期 | 102,277 | https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19142 | `pai_std_19142.html` | `62fe22a928fcdb91383f233da11e3efc1784b1fa298b336b9663ef66f9282411` |
| KW3 | PAI 标准详情页 — KWS 1899:2023（洗衣机） | 部长令 16/2023；公报 2023-10-08 第 1656 期 | 102,263 | https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19143 | `pai_std_19143.html` | `f1b67d024f3ae100d78e1e4f506b50f4b7fbdc2a3e819647e413050e5e9adc07` |
| KW4 | PAI 标准详情页 — KWS 1900:2023（冰箱/冷柜） | 部长令 16/2023；公报 2023-10-08 第 1656 期 | 105,045 | https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19144 | `pai_std_19144.html` | `aff8ab721bd46e59f63c93fac2ff650ffc8ce60bed39ac94c77eb9c57d4dd1b3` |
| KW5 | PAI 公告（英文） | 抓取于 2026-11-17；含热水器（2026-11-30）与照明（2026-08-17）公告 | 101,955 | https://ksm.pai.gov.kw/sites/cm/en/Pages/Annoucement.aspx | `pai_announcement.html` | `e8f8e077d453f785edd57b07a9a97f63e909d52d077d4a1d918525619e55c987` |
| KW6 | PAI — About TABEK | 页面未标日期；抓取于 2026-11-17 | 84,786 | https://ksm.pai.gov.kw/sites/cm/en/pages/AboutTabek.aspx | `AboutTabek.aspx` | `05e5f7d9b756508fd5fd40dc6851ca79f6817f288df4daaca63e9ba85cf2ddac` |
| KW7 | PAI — Kuwait Quality Mark Rules | 页面未标日期；抓取于 2026-11-17 | 80,519 | https://ksm.pai.gov.kw/sites/qm/en/AboutQM/Pages/QMRules.aspx | `QMRules.aspx` | `1816e2bfc30216db443601ffd527344ca181df25f0689f0d6101d79823e330b7` |
| KW8 | CITRA — Regulation for Approval of Communication Devices Type（扫描件，16 页） | Version 1.4；Decision No. 153/2021（2021-09-09） | 983,321 | https://www.citra.gov.kw/sites/en/LegalReferences/Regulation_for_Approval_of_Communication_Devices_Type.pdf | `citra_type_approval.pdf` | `c0ea4da21879cc611cd12247b4b3f6ebaf42470ec511d5e1b90026932fb921f5` |
| KW9 | CITRA — User Protection and Privacy Rules Regulation（扫描件，17 页） | 未标版本；Decision No. 69/2022（2022-04-21） | 779,983 | https://www.citra.gov.kw/sites/en/LegalReferences/User_Protection_and_Privacy_Rules_Regulation.pdf | `User_Protection_and_Privacy_Rules_Regulation.pdf` | 7520788265db02ef2268b953b174010f75a2adc29a65dc9b053025cd07d5e293 |

### 决议元数据（仅用于确认决议号与日期，不产生引文）

| ID | 文件 | 内容 | 大小 (bytes) | URL | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| KW10 | CITRA 决议详情页（阿语） | Decision No. 2021/153，发布日期 09/09/2021 | 80,398 | https://www.citra.gov.kw/sites/ar/Pages/DecisionsDetails.aspx?id=35 | `d230293d56f8837f69261ea91a92fea47b1f18c4e01a508adcdd81910669dfe8` |
| KW11 | CITRA 决议详情页（阿语） | Decision No. 2022/69，发布日期 21/04/2022 | 79,783 | https://www.citra.gov.kw/sites/ar/Pages/DecisionsDetails.aspx?id=31 | `596d116af3b5118af3c543f371b7d15e09bdef7bdb38a50ecbad3cd0a718dfb3` |

### OCR 说明

KW8 / KW9 是扫描 PDF，无文本层。处理方式：

```bash
pdftoppm -r 200 -png citra_type_approval.pdf ocr_ta/p
for f in ocr_ta/p-*.png; do tesseract "$f" "${f%.png}" -l eng --psm 3; done
cat ocr_ta/p-*.txt > citra_type_approval.ocr.txt
```

引文在入库前逐页与图像核对：KW8 的图像 p-05（Art 2）、p-07（Art 6）、p-11（Art 11/12）、p-13（Art 13）、p-14（Art 14）、p-15（Art 15）；KW9 的 p-14（Art 9-16/10-1-x）、p-16（Art 12-2）、p-17（Art 14）。规则中 `ocr_source: true` 标注。

## 交叉核对记录

| 事实 | 主来源 | 交叉核对 | 结论 |
| --- | --- | --- | --- |
| KWS 1893:2018 为现行强制技术法规，部长令 15/2018 | KW1 | PAI 页面类型 “Kuwaiti Technical Regulation”、状态 Active、Ministerial Decree 15/2018 | 一致 |
| KWS 1898/1899/1900:2023 由部长令 16/2023 采纳，2023-10-08 公报 | KW2/KW3/KW4 | 三页均显示 Decision No 16/2023、Newspaper Publication Date 08-10-2023、No. 1656 | 一致 |
| 四类能效法规自 2024-10-08 强制实施 | — | Intertek、Bureau Veritas、UL、TÜV 与商务部 WTO 事务网站均转述 PAI 部长令 16/2023（二手） | 一致，但公报原文未取得，规则只写二手说明 |
| PAI 对新增能效品类要求 EER 注册 + 标签印包装 + KUCAS | KW5 | 同一页面热水器公告与照明公告措辞一致 | 一致（仅限公告所列品类） |
| CITRA 型号核准证书有效期 3 年、2021-09 起实施 | KW8 Art. 11 | Intertek（2021-12-28）、DEKRA（2021-09-13）新闻；KW10 决议页 | 一致 |
| 用户保护规则适用于 CITRA 持牌人 | KW9 Art. 1-3 定义 | KW11 决议页第 1 条「تسري أحكام اللائحة ... على المرخص لهم」 | 一致 |

## rev.1 → rev.2：移除非科威特官方来源

| rev.1 来源 | 条数 | 处理 |
| --- | --- | --- |
| `members.wto.org/crnattachments/...`（KWS 1893/1898/1899/1900 英文全文，WTO TBT 通报附件） | 15 | 全部移除；不再作为引文。对应细则见下 |
| `chemreg.net/...`（KUCAS Guidelines 2008 副本，QW-750-21） | 5 | 全部移除；仅保留 PAI 公告/TABEK 页面的口径 |

被移除引文涉及的细则（本版**不建规则**，仅在此登记）：

- 能效标签字段（注册号、EER、原产国、型号）、标签位置与尺寸、分体机双标签；
- 铭牌语言（阿语/英语/双语）与说明书语言（空调/干衣机/洗衣机阿英双语；冰箱阿语）；
- MEPS 的 EER 阈值与星级分档；
- KUCAS 的 TER 有效期（2 年 / CB 3 年）、技术查验项（标记、电压、插头）、召回与退运程序、附录 A 受管制产品清单。

恢复这些规则的前置条件：采购 PAI 标准商店的 KWS 英文版（KWD 12–13/份，见 KW1–KW4 页面 “Files” 栏），或取得 PAI 书面英文文本。

## 未取得 / 不可用来源

| 法规 / 文件 | 状态 | 已知信息（仅作线索，不作引文） |
| --- | --- | --- |
| KWS 1893/1898/1899/1900 标准正文 | `paid_standard` | PAI 标准商店付费；页面仅提供 Scope 与元数据 |
| Law No. 39 of 2014 on Consumer Protection | `official_english_unavailable` | 37 条，2014-06-08 公报；广告专章；二手译本载有第 10/12/26 条 |
| Ministerial Resolution No. 27 of 2015（实施条例） | `official_english_unavailable` | 促销/折扣的价格与阿语价目表要求；仅二手译本 |
| Decree-Law No. 10 of 2026 on Digital Commerce | `official_english_unavailable` | 45 条，2026-02 颁布；登记、披露、电子发票、误导性广告 |
| Law No. 37 of 2014（CITRA 设立法） | `official_english_unavailable` | CITRA 英文页面只有简介；PDF 为阿语合并版；罚则未取得英文 |
| CITRA Decision No. 26/2024（DPPR） | `official_english_unavailable` | 2024-02-18 公报；仅阿语；42/2021 英文版已失效 |
| 一般预包装标签（GSO 9 等） | `paid_standard` | 付费件；未覆盖 |
| KUCAS 2026 版流程文件 | `not_found` | 已迁 TABEK；未找到与 2008 指南对应的新版公开 PDF |

辅助线索（仅用于理解与交叉核对）：Alitqan 律所 CPL 译本、UN ESCWA 消费者保护篇、Chambers/DLA Piper 数据保护指南、Intertek/Bureau Veritas/UL/TÜV 的能效法规说明。

## 复现命令

```bash
mkdir -p kw-sources && cd kw-sources

# PAI 标准详情页与公告/平台说明
curl -sSL -k "https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=9532"  -o pai_std_9532.html
curl -sSL -k "https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19142" -o pai_std_19142.html
curl -sSL -k "https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19143" -o pai_std_19143.html
curl -sSL -k "https://ksm.pai.gov.kw/en/Pages/StandardDetails.aspx?StandardID=19144" -o pai_std_19144.html
curl -sSL -k "https://ksm.pai.gov.kw/sites/cm/en/Pages/Annoucement.aspx" -o pai_announcement.html
curl -sSL -k "https://ksm.pai.gov.kw/sites/cm/en/pages/AboutTabek.aspx" -o AboutTabek.aspx
curl -sSL -k "https://ksm.pai.gov.kw/sites/qm/en/AboutQM/Pages/QMRules.aspx" -o QMRules.aspx

# CITRA
curl -sSL -k "https://www.citra.gov.kw/sites/en/LegalReferences/Regulation_for_Approval_of_Communication_Devices_Type.pdf" -o citra_type_approval.pdf
curl -sSL -k "https://www.citra.gov.kw/sites/en/LegalReferences/User_Protection_and_Privacy_Rules_Regulation.pdf" -o User_Protection_and_Privacy_Rules_Regulation.pdf

sha256sum *.html *.aspx *.pdf   # 应与上表一致

# CITRA 扫描件 OCR（KW8/KW9）
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
| `xcite_earbuds.html` | 2026-11-17 | 252,974 | https://www.xcite.com/sudio-a3-pro-wireless-earphone-pink/p | `5cf848e85ae8ac513f79245fdcc2e822d8f8f543d39ded6205d73a1371ae859d` |

## 变更记录

- 2026-11-17 v0.1：首版（28 条；含 WTO / chemreg 引文）。
- 2026-11-17 v0.1 rev.2：按“仅科威特官方来源”重建。移除 15 条 WTO 引文与 5 条 chemreg 引文；改为 24 条全部引 `pai.gov.kw` / `ksm.pai.gov.kw` / `citra.gov.kw`；标签/语言/MEPS 细则转入「未收录」。
