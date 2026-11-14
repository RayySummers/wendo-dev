# 美国法条规则库 v0.1 — 来源清单

核验日期：2026-11-14。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。美国联邦法规以英文制定；本库引文来自 GPO 的 United States Code（2024 年版）与 eCFR（2026-11-12 快照），不使用律所文章、商业数据库或二手翻译作为引文来源。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_federal_statute` | GPO 出版的 United States Code（govinfo，2024 年版） | 是 |
| `official_ecfr` | eCFR（GPO/NARA）发布的联邦法规现行文本（按 2026-11-12 快照） | 是 |
| `official_regulator` | FTC / CPSC / FCC / CBP / FDA 官网指引、执法公告 | 是（指引类，标注 guideline，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索 |

## 主来源

| ID | 法规 / 条款 | 版本 / 生效 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| US1 | 15 U.S.C. §45（FTC Act §5） | U.S. Code 2024 Ed.；§5(a)(1) 现行文本（1938 年修正加入 “unfair or deceptive acts or practices”） | 47,198 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec45.htm | `usc15_45.htm` | `28de76e074dde70c74930d24738fda83a837c04bba6304c148051d1600679546` |
| US2 | 15 U.S.C. §1125（Lanham Act §43(a)） | U.S. Code 2024 Ed. | 29,324 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap22-subchapIII-sec1125.htm | `usc15_1125.htm` | `64b9c612cfb85aebc90bce3e52ce5989c3693ffdd29770647e3251e01bae242a` |
| US3 | 15 U.S.C. §1453（FPLA §4） | U.S. Code 2024 Ed.；FPLA 1967-07-01 生效 | 11,618 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap39-sec1453.htm | `usc15_1453.htm` | `9405eba38c2b8816b7b9cdf407dd0099af4b6a62f57bb110d147d31424d61b59` |
| US4 | 15 U.S.C. §2063（CPSA §14） | U.S. Code 2024 Ed.；§14(a)(1) 现行文本为 CPSIA 2008 修正（2008-11-12 生效） | 42,831 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap47-sec2063.htm | `usc15_2063.htm` | `78563c9a44dcbf81ade6ea297707e3dfc50d69bc1103d6fda4c8c790582bc1d4` |
| US5 | 15 U.S.C. §2064（CPSA §15） | U.S. Code 2024 Ed.；CPSA 1972-12-26 生效 | 33,233 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap47-sec2064.htm | `usc15_2064.htm` | `1f6a815c0a8e96dda41c47aab8613574cbe371817538e3a5d829f33ef043f9ae` |
| US6 | 15 U.S.C. §2068（CPSA §19） | U.S. Code 2024 Ed.；CPSA 1972-12-26 生效 | 13,562 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap47-sec2068.htm | `usc15_2068.htm` | `621feddcf203b3d4317837f0c4799df25ef40ed01faa029f85f64fe59d70ffcc` |
| US7 | 15 U.S.C. §2303（Magnuson-Moss §103） | U.S. Code 2024 Ed.；1975-07-04 适用 | 3,382 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap50-sec2303.htm | `usc15_2303.htm` | `1e518cb579898c7c9c2754bfe3530913a05ee07ca5afbc644d1491cbbb5fb06f` |
| US8 | 15 U.S.C. §7704（CAN-SPAM） | U.S. Code 2024 Ed.；2004-01-01 生效 | 16,751 | https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap103-sec7704.htm | `usc15_7704.htm` | `2b05593caad0c84d682ac9b10778876172e05ffb2bc52bf7651daaf31a250d8b` |
| US9 | 19 U.S.C. §1304（Tariff Act §304） | U.S. Code 2024 Ed. | 35,339 | https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1304.htm | `usc19_1304.htm` | `ac7268864bff5f7ba770407a3f86fd8914ff56a3b043b7946f79c81f9f783b14` |
| US10 | 21 U.S.C. §348（FDCA §409） | U.S. Code 2024 Ed.；1958-09-06 生效 | 37,062 | https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapIV-sec348.htm | `usc21_348.htm` | `67dbc0060d7b35ae420764032bb54113e0bfb3c1aabe94e8cf51e73cd09c239e` |
| US11 | 16 CFR Part 255（Endorsement Guides） | eCFR 2026-11-12 快照；2023-07-26 修订 | 77,017 | https://www.ecfr.gov/current/title-16/part-255 | `t16p255.xml` | `feb1c8cfee82158c16c4210ef320bc93ffb2f414aa2bdce6e6772a77064180ea` |
| US12 | 16 CFR Part 260（Green Guides） | eCFR 2026-11-12 快照；2012 年修订，eCFR 记录 2016-12-22 最后修订 | 73,696 | https://www.ecfr.gov/current/title-16/part-260 | `t16p260.xml` | `cd6279e2c73fb247ea87cc0c413347eb1a9f6ea0beef57173d506686c74bec2a` |
| US13 | 16 CFR Part 323（Made in USA Labeling Rule） | eCFR 2026-11-12 快照；2021-08-13 生效 | 5,790 | https://www.ecfr.gov/current/title-16/part-323 | `t16p323.xml` | `e65c53c986082add2c81aaf9a03e1a9c9868393d2fe95d584f49ecc11fb9f74f` |
| US14 | 16 CFR Part 251（“Free” Guide） | eCFR 2026-11-12 快照；原 36 FR 21517（1971-11-10） | 8,897 | https://www.ecfr.gov/current/title-16/part-251 | `t16p251.xml` | `45ec0b40ff77d3475da2b8b7e07cd9e916a577da71e56e906b34380ae8600c89` |
| US15 | 16 CFR Part 233（Deceptive Pricing Guides） | eCFR 2026-11-12 快照；原 32 FR 15534（1967-11-08） | 17,423 | https://www.ecfr.gov/current/title-16/part-233 | `t16p233.xml` | `b92702dd6a699702e4b13f01ba341e89dad5bda7572a499b48d2ba018630281d` |
| US16 | 16 CFR Part 500（FPLA Regulations） | eCFR 2026-11-12 快照；1994-01-12 重新发布 | 62,588 | https://www.ecfr.gov/current/title-16/part-500 | `t16p500.xml` | `b59f55bce420dbb29c1aac0b4e7feb17a7e4822e8fda346cb79f2150ea05dd7a` |
| US17 | 16 CFR Part 305（Energy Labeling Rule） | eCFR 2026-11-12 快照 | 264,014 | https://www.ecfr.gov/current/title-16/part-305 | `t16p305.xml` | `f4b8e3f5de23681e4a4989574e201a29fb902199fb22fa378ead4e35991065fd` |
| US18 | 16 CFR Part 702（Written Warranty Terms） | eCFR 2026-11-12 快照；2016-09-15 修订 | 10,862 | https://www.ecfr.gov/current/title-16/part-702 | `t16p702.xml` | `892548e45c894638546a3697e0ff32153bb69a8b9e0cc7fc5768ccd7452a7afe` |
| US19 | 16 CFR Part 1120（Substantial Product Hazard List） | eCFR 2026-11-12 快照；2022-12-28 修订 | 14,252 | https://www.ecfr.gov/current/title-16/part-1120 | `t16p1120.xml` | `bae3515764a856e2eef34f6774412aa535b09e3ec1655c5dc44e61e1998af88e` |
| US20 | 19 CFR Part 134（CBP Country of Origin Marking） | eCFR 2026-11-12 快照；T.D. 72-262（1972-09-29） | 77,970 | https://www.ecfr.gov/current/title-19/part-134 | `t19p134.xml` | `831764721612fa113a1b95ec0d925bc601edcca61ef499f5264e0b81c59bf4d8` |
| US21 | 47 CFR Part 15（FCC Part 15） | eCFR 2026-11-12 快照 | 571,831 | https://www.ecfr.gov/current/title-47/part-15 | `t47p15.xml` | `74ea049a987626a0c8509b2c24279f9fea4689bff7248c6a3e1856a9dae641be` |
| US22 | 47 CFR Part 2（FCC Part 2） | eCFR 2026-11-12 快照 | 967,123 | https://www.ecfr.gov/current/title-47/part-2 | `t47p2.xml` | `17c0fcaf1e5445cd93c93c55706eb48a3015e9b4a3342dc61aedc35e09e9ff79` |
| US23 | 16 CFR Part 465（Consumer Reviews and Testimonials Rule） | eCFR 2026-11-12 快照；2024-10-21 生效 | 17,346 | https://www.ecfr.gov/current/title-16/part-465 | `t16p465.xml` | `0ed274f696f88713e0a1560408acb9b9c611b90959fb686b2afe547df568d6c4` |

> 官方 URL 在规则 JSON 中使用的是精确到 section 的 eCFR 快照链接（`https://www.ecfr.gov/on/2026-11-12/title-16/section-255.0`）；本表为便于复现列到 part 级。US9（19 U.S.C. §1304）是 19 CFR §134.11 的上位法，规则引文用 CFR，条文用 US9 交叉核对。

## 监控来源（尚未作为规则引文）

| ID | 法规 / 文件 | 状态 | 说明 |
| --- | --- | --- | --- |
| US-M1 | FTC — Advertising Substantiation Policy Statement | 本环境 `ftc.gov` 返回 403，未取得原文 | 美国 substantiation 原则的官方来源；取得后补一条 guideline 级规则 |
| US-M2 | 16 CFR Part 1110（CPSC eFiling of Certificates） | 未取得 | 需核对是否已生效、是否适用于小家电 GCC；影响进口流程 |
| US-M3 | 16 CFR Part 464（FTC Rule on Unfair or Deceptive Fees） | 未取得 | 可能影响电商“总价/费用”披露；待核对生效日与适用范围 |
| US-M4 | 加州 Prop 65（27 CCR §25600 et seq.） | 未取得（州法，out of scope） | 样品页出现 Prop 65 警告；州级子单处理 |
| US-M5 | 加州 CCPA/CPRA、其他州隐私法 | 未取得（州法，out of scope） | 联邦层面无综合隐私法；州法另列 backlog |

## 交叉核对记录

1. **FTC Act §5（US1）**：核对 §5(a)(1) 的 “unfair or deceptive acts or practices”；该措辞来自 1938-03-21 的 Wheeler-Lea 修正（Act Mar. 21, 1938, ch. 49, §3）。§5 本身没有私人诉权；民事罚金通常以违反最终命令或贸易规则为前提。
2. **Lanham Act §43(a)（US2）**：核对 §1125(a)(1)(B) 的“商业广告/促销中的虚假或误导性陈述”；这是私人民事诉讼路径，和 FTC 的行政路径不同。
3. **FPLA（US3）**：核对 §1453(a)(1)（身份 + 名称地址）与 §1453(a)(2)（净含量、英制 + SI）；§1456(b) 明确非食品/药品/器械/化妆品的违反按 FTC Act §5 处理。
4. **CPSA §14（US4）**：核对 §2063(a)(1)(A) 的 GCC 要求；CPSIA §102(a)(1)(B) 的修正自 2008-11-12 生效（90 days after 2008-08-14）；CPSA 原法自 1972-12-26 生效（60th day after 1972-10-27）。
5. **CPSA §15（US5）**：核对 §2064(b)(3)（substantial product hazard）与 (b)(4)（unreasonable risk of serious injury/death）；未报告属 §2068(a)(4)。
6. **CPSA §19（US6）**：核对 §2068(a)(1)（不符合适用规则的产品不得销售/分销/进口）；罚则见 §2069（民事）与 §2070（刑事）。
7. **Magnuson-Moss §103（US7）**：核对 §2303(a) 的 full/limited 指定；§2304 的联邦最低标准作为交叉核对，未单列规则。
8. **CAN-SPAM（US8）**：核对 §7704(a)(3)(A)（退订机制）与 §7704(a)(5)(A)(iii)（实体邮政地址）；10 个工作日停发见 (a)(4)(A)(i)。
9. **FDCA §409（US10）**：核对 §348(a)(3)(B)（FCN 生效）与 (a)(3)(A)（法规）；食品接触物质定义见 §348(h)(6)，未单列。
10. **Endorsement Guides（US11）**：核对 §255.0(f)（clear and conspicuous）、§255.1(a)（真实意见）、§255.2(b)（代表性结果）、§255.5(a)（material connection）；2023-07-26 修订（88 FR 48102）。
11. **Green Guides（US12）**：核对 §260.3(a)（限定与披露）、§260.4(b)（总体环保声称）、§260.9(a)（free-of）；2012 年修订（77 FR 62124），eCFR 记录最后修订 2016-12-22。
12. **Made in USA Rule（US13）**：核对 §323.2 的三要件；§323.1(a) 对 “Made in the United States” 的定义包含 made/manufactured/built/produced/created/crafted 等表述。
13. **Free Guide（US14）**：核对 §251.1(c) 的“at the outset”披露；原 36 FR 21517（1971-11-10）。
14. **Deceptive Pricing Guides（US15）**：核对 §233.1(a) 的 bona fide former price；§233.3 的 MSRP 比较未单列，写入 README open questions。
15. **FPLA Regulations（US16）**：核对 §500.4(a)、§500.5(a)、§500.6(a)、§500.20；Part 500 于 1994-01-12 重新发布（59 FR 1872）。
16. **CBP marking（US20）**：核对 §134.11 的英文原产国标记；上位法 19 U.S.C. §1304（US9）交叉核对。
17. **Energy Labeling（US17）**：核对 §305.9（制造商网站提供标签）与 §305.27(a)(1)(i)（网站目录展示标签）；covered product 清单只含列名品类，空气炸锅/电水壶不在内。
18. **Warranty disclosure（US18）**：核对 §702.3(a) 的售前可查阅；§701.3 的书面保修条款未单列，避免与 §2303 重复。
19. **Hazard list（US19）**：核对 §1120.3(a) 的手持电吹风浸水保护；UL 859 §5 / UL 1727 §6 通过 §1120.4 并入。
20. **FCC Part 15（US21）**：核对 §15.19(a)(3) 的设备声明与 §15.105(b) 的 Class B 说明书声明；两段声明在 eCFR XML 的 `<EXTRACT>` 块中，解析时需连同 `<P>` 一起取。
21. **FCC Part 2（US22）**：核对 §2.1077(a)(3) 的美国境内责任方信息；SDoC 定义见 §2.909。
22. **Review Rule（US23）**：核对 §465.2(a)（虚假评论/证言）与 §465.4（买评论）；2024-10-21 生效。

## 复现方法

### eCFR（法规）

```bash
# 以 title-16 part 255 为例；日期使用 eCFR 的 up_to_date_as_of（2026-11-12）
curl -sS -L --compressed \
  -H "Accept: application/xml" \
  "https://www.ecfr.gov/api/versioner/v1/full/2026-11-12/title-16.xml?part=255" \
  -o t16p255.xml
sha256sum t16p255.xml
# 期望：feb1c8cfee82158c16c4210ef320bc93ffb2f414aa2bdce6e6772a77064180ea
```

> eCFR API 要求 `Accept-Encoding` 允许压缩；`curl --compressed` 会解压后写盘，哈希按解压后的 XML 计算。

### United States Code（法律）

```bash
# 以 15 U.S.C. §45 为例；使用 GovInfo 的 2024 年版（2025 年版在核验日尚未发布该 title）
curl -sS -L \
  "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapI-sec45.htm" \
  -o usc15_45.htm
sha256sum usc15_45.htm
# 期望：28de76e074dde70c74930d24738fda83a837c04bba6304c148051d1600679546
```

### 版本元数据

```bash
curl -sS -L --compressed \
  "https://www.ecfr.gov/api/versioner/v1/versions/title-16.json?part=255"
```

用于核对每条 section 的 `amendment_date`；`rules.v0.1.json` 的 `effective_date` 取该条最新修订日（并在 `notes` 说明原始发布/修订背景）。

## 未取得 / 不可用的来源

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| FTC 官网（ftc.gov） | 本环境访问返回 403（首页、legal library、business guidance 均试过） | 未直接引用 FTC 指南网页；改用 eCFR 的 16 CFR 文本，避免二手转述 |
| FTC — Advertising Substantiation Policy Statement | 未取得 | 未单列 general substantiation 规则；用 255.2/260.3/260.4/233.1 等具体条目表达 |
| CPSC — 16 CFR Part 1110 eFiling | 未取得 | GCC 电子申报未纳入；open questions 跟踪 |
| GovInfo — USCODE 2025 title 15 | 该 edition 的 title 15 页面返回 Page Not Found | 使用 2024 年版；对 2026 年的规则判断需按季度复核是否有新修正 |
| 州级来源（Prop 65、CCPA/CPRA 等） | 未取得（out of scope） | 本版只做联邦；州法另列 backlog |

> 本清单的 SHA-256 是 2026-11-14 从上述 URL 下载后的文件哈希；eCFR 使用固定日期快照，GovInfo 使用固定 edition，重新下载应得到同一哈希。若官方发布新版本，旧哈希会失效，应按 `../README.md` 的版本流程新建 `rules.v0.2.json`，不要原地覆盖。

### 关于 PDF

MY/SG 的官方来源以 PDF 为主，因此验收口径写「重新下载 PDF 后 SHA-256 一致」。美国联邦来源的官方发布形态是 **HTML/XML**：eCFR 提供 XML API（本库用它取条文并核对 `<EXTRACT>` 块），GovInfo 提供 USCODE HTML。两家也都提供 PDF，但 PDF 是排版副本，条文文本以 XML/HTML 为准；因此本库的哈希针对官方 HTML/XML 快照。若需要 PDF 版本，可从同一 eCFR/GovInfo 页面下载并单独记录哈希，但不应以 PDF 的排版差异覆盖 XML/HTML 的文本核对结果。
