# 英国法条规则库 v0.1 — 来源清单

核验日期：2026-11-14。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。英国法规以英文制定并在 legislation.gov.uk 发布；本库引文全部取自该库的 `data.xml` 合并文本与监管机关官网英文页面，不使用律所文章、商业数据库或二手翻译作为引文来源。
>
> 适用地域：除非另注，规则适用于**大不列颠（GB：英格兰、苏格兰、威尔士）**。北爱尔兰（NI）在温莎框架下继续适用欧盟产品规则（CE / UKNI），本版只在 `README.md` 标注差异，不单独建库。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | legislation.gov.uk 发布的议会法案（ukpga）合并文本 | 是 |
| `official_si` | legislation.gov.uk 发布的次级立法（uksi）合并文本 | 是 |
| `official_regulator` | CMA / ASA / OPSS / ICO / gov.uk 官方指引、守则、公告 | 是（指引/守则类标 `guideline`，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索 |

## 主来源

全部为 2026-11-14 当日从官方域名直接下载的 `data.xml` / HTML；`dct:valid` 为 legislation.gov.uk 标注的“该版本有效起始日”，`dc:modified` 为数据库最后修改日。

| ID | 法规 / 文件 | 版本（valid / modified） | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| UK1 | Digital Markets, Competition and Consumers Act 2024（DMCCA 2024） | valid 2026-10-29 / modified 2026-11-02；Part 4 Ch.1 自 2025-04-06 生效（S.I. 2025/272） | 4,319,291 | https://www.legislation.gov.uk/ukpga/2024/13/data.xml | `dmcca2024.xml` | `a14df307beeb0a821510c24e51a3a82f47ec89f0d153ead193ef08f64fb8e42e` |
| UK2 | Consumer Rights Act 2015（CRA 2015） | valid 2026-10-29 / modified 2026-10-29；主体自 2015-10-01 生效 | 2,271,171 | https://www.legislation.gov.uk/ukpga/2015/15/data.xml | `cra2015.xml` | `1c4aed4d0df5cc3141728640ba23dfb86096c7e13b3262b587344e1c35573ba7` |
| UK3 | Electrical Equipment (Safety) Regulations 2016（EESR 2016） | valid 2024-10-01 / modified 2024-10-04；自 2016-12-08 生效 | 858,492 | https://www.legislation.gov.uk/uksi/2016/1101/data.xml | `eesr2016.xml` | `895c132f0938a0300f3b7bc9afba8d42c130f24a0dd449f853dba14145a58f94` |
| UK4 | General Product Safety Regulations 2005（GPSR 2005） | valid 2025-02-27 / modified 2025-03-12；自 2005-10-01 生效 | 363,937 | https://www.legislation.gov.uk/uksi/2005/1803/data.xml | `gpsr2005.xml` | `7658fe968ae749063f4cd3e15df9e02c0bb6a9967a4b539304f973e89735bb84` |
| UK5 | Plugs and Sockets etc. (Safety) Regulations 1994 | modified 2016-08-31；Part II 自 1995-02-01 起分阶段生效 | 98,117 | https://www.legislation.gov.uk/uksi/1994/1768/data.xml | `plugs1994.xml` | `7a4f283e3011bbba5fe3189ed55e6f46d36b7b51c701cd47982d05f78317000c` |
| UK6 | Electromagnetic Compatibility Regulations 2016 | valid 2024-10-01 / modified 2024-10-10；自 2016-12-08 生效 | 1,194,772 | https://www.legislation.gov.uk/uksi/2016/1091/data.xml | `emc2016.xml` | `99d0708b82443916f7603d67dcdc5b3f19cc6e32f6d63e7bb5d4aecc773c2eb5` |
| UK7 | Radio Equipment Regulations 2017 | valid 2026-01-05 / modified 2026-01-07；自 2017-12-26 生效 | 1,784,029 | https://www.legislation.gov.uk/uksi/2017/1206/data.xml | `radio2017.xml` | `008a3dfc0ba3748c122b45bd5ab557cc5cbfbe6cd9c0a3764c47f17d76d975cc` |
| UK8 | Waste Electrical and Electronic Equipment Regulations 2013 | valid 2025-08-12 / modified 2025-08-19；自 2014-01-01 生效 | 1,542,545 | https://www.legislation.gov.uk/uksi/2013/3113/data.xml | `weee2013.xml` | `afca5da387bda446afa5b05667e80d7190b5144f37ffa8d04458220014a7165f` |
| UK9 | Batteries and Accumulators (Placing on the Market) Regulations 2008 | valid 2026-10-17 / modified 2026-11-10；自 2008-09-26 生效 | 281,469 | https://www.legislation.gov.uk/uksi/2008/2164/data.xml | `batt2008.xml` | `9f91687f75186d337c6b13c59d56bced86b11d6f679bce8f3b6d6dc78e9f803f` |
| UK10 | Privacy and Electronic Communications (EC Directive) Regulations 2003（PECR） | valid 2026-09-30 / modified 2026-10-01；自 2003-12-11 生效 | 677,816 | https://www.legislation.gov.uk/uksi/2003/2426/data.xml | `pecr2003.xml` | `565b8d49ac5bd1a140a220b99b4d3b79c656285350edfc06e7341d66f2efe2a4` |
| UK11 | UK GDPR（Regulation (EU) 2016/679，保留并修订） | valid 2026-09-30 / modified 2026-10-05；英国版自 IP completion day 起适用 | 1,675,157 | https://www.legislation.gov.uk/eur/2016/679/data.xml | `ukgdpr.xml` | `21dba5a17969a84d077a540e48700b103dff5704a3a03119df5802bf6aa62ad1` |
| UK12 | Price Marking Order 2004 | valid 2026-04-06 / modified 2026-05-18；自 2004-07-22 生效 | 77,485 | https://www.legislation.gov.uk/uksi/2004/102/data.xml | `pmo2004.xml` | `9b69ff8345ece21d1b4f6e54c4f0c9e3cb6aa7ec6d282d8c14577a90a7fa5229` |
| UK13 | Business Protection from Misleading Marketing Regulations 2008（BPRs） | valid 2025-04-06 / modified 2025-05-12；自 2008-05-26 生效 | 113,521 | https://www.legislation.gov.uk/uksi/2008/1276/data.xml | `bprs2008.xml` | `bae32c45921fad7ef42d0a69e355b660285aa9066fdd81162f7149613e2a091d` |
| UK14 | CAP Code section 03（Misleading advertising） | ASA 官网现行文本，抓取于 2026-11-14 | 80,240 | https://www.asa.org.uk/type/non_broadcast/code_section/03.html | `cap03.html` | `17fbe3010a09056dd5460c6d7b5ac9e3f9abb3ae23e0e1cebb17c382ec097a81` |
| UK15 | gov.uk：Placing UKCA or CE marked products on the market in Great Britain | 发布 2026-03-31，最后更新 2026-08-21 | 159,770 | https://www.gov.uk/guidance/using-the-ukca-marking | `ukca.html` | `33ea4890ffa8f16268cdcbdbb333a3fb184987a0ed15e5ccf11a0064732f650b` |
| UK16 | CAP Code section 11（Environmental claims） | ASA 官网现行文本，抓取于 2026-11-14；规则 11.8/11.9 于 2025-10-24 删除 | 47,848 | https://www.asa.org.uk/type/non_broadcast/code_section/11.html | `cap11.html` | `af7babd382346c64742d44d6f942c8ded0200c88ce64c68d54dc3ae42503a946` |

### 交叉核对用来源（不作为规则引文）

| ID | 文件 | 用途 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| UK-C1 | The Product Safety and Metrology etc. (Amendment) Regulations 2024（SI 2024/696） | 核对 CE 标志在 GB 继续被承认的法律依据（2024-10-01 生效） | https://www.legislation.gov.uk/uksi/2024/696/data.xml | `si2024_696.xml` | `1f4c56aab8c9753cafc6a0f6e914da68a6696924a471d484db5de29083823aab` |
| UK-C2 | Consumer Protection Act 1987 s. 12（违反安全条例罪） | 核对 Plugs 1994 等安全条例的罚则路径（简易程序最高 6 个月 / level 5） | https://www.legislation.gov.uk/ukpga/1987/43/section/12/data.xml | `cpa1987_s12.xml` | `89c0e7fa3332c766acbf1a36bfe9ce252a7f69661990dbcd8cbafe32f175f651` |

> 注：gov.uk 指引写作 “The Product Safety and Metrology (Amendment) Regulations 2024”，官方 SI 标题为 “The Product Safety and Metrology etc. (Amendment) Regulations 2024”（SI 2024/696）。规则 UK-SAFE-12 的引文取自 gov.uk 页面原文，故保留页面写法；两条来源已交叉核对。

## 复现命令

```bash
mkdir -p uk-sources && cd uk-sources
base=https://www.legislation.gov.uk
curl -sSL "$base/ukpga/2024/13/data.xml"   -o dmcca2024.xml
curl -sSL "$base/ukpga/2015/15/data.xml"   -o cra2015.xml
curl -sSL "$base/uksi/2016/1101/data.xml"  -o eesr2016.xml
curl -sSL "$base/uksi/2005/1803/data.xml"  -o gpsr2005.xml
curl -sSL "$base/uksi/1994/1768/data.xml"  -o plugs1994.xml
curl -sSL "$base/uksi/2016/1091/data.xml"  -o emc2016.xml
curl -sSL "$base/uksi/2017/1206/data.xml"  -o radio2017.xml
curl -sSL "$base/uksi/2013/3113/data.xml"  -o weee2013.xml
curl -sSL "$base/uksi/2008/2164/data.xml"  -o batt2008.xml
curl -sSL "$base/uksi/2003/2426/data.xml"  -o pecr2003.xml
curl -sSL "$base/eur/2016/679/data.xml"    -o ukgdpr.xml
curl -sSL "$base/uksi/2004/102/data.xml"   -o pmo2004.xml
curl -sSL "$base/uksi/2008/1276/data.xml"  -o bprs2008.xml
curl -sSL "$base/uksi/2024/696/data.xml"   -o si2024_696.xml
curl -sSL "$base/ukpga/1987/43/section/12/data.xml" -o cpa1987_s12.xml
curl -sSL -A 'Mozilla/5.0' https://www.asa.org.uk/type/non_broadcast/code_section/03.html -o cap03.html
curl -sSL -A 'Mozilla/5.0' https://www.asa.org.uk/type/non_broadcast/code_section/11.html -o cap11.html
curl -sSL -A 'Mozilla/5.0' https://www.gov.uk/guidance/using-the-ukca-marking -o ukca.html
sha256sum *.xml *.html
```

2026-11-14 实测：`plugs1994.xml` 与 `batt2008.xml` 重新下载后 SHA-256 与表中一致（`7a4f283e…`、`9f91687f…`），说明上述 URL 返回的是按版本固定的静态文本，可复现核验。

## 交叉核对记录

1. **CPRs 2008 已被废止（关键口径变化）**：核对 The Consumer Protection from Unfair Trading Regulations 2008（SI 2008/1277）reg 3 现显示 “Regulations revoked (6.4.2025 …) by Digital Markets, Competition and Consumers Act 2024 (c. 13), ss. 251(1), 339(1)”。因此**不再以 CPRs 2008 作为英国规则引文**；现行不公平商业行为规则落在 DMCCA 2024 Part 4 Chapter 1（ss. 224-252）。这是本版与多数二手资料的分歧点。
2. **DMCCA 生效日**：s. 224 注记 “in force at 6.4.2025 by S.I. 2025/272, reg. 2(1)(3)”；ss. 225-230、237、240-241 同批生效。刑事罚则见 s. 240；追诉期见 s. 241。
3. **CMA 直接罚款**：s. 182(6)（最终侵权通知）固定金额上限 £300,000 或全球营业额 10%；违反承诺/指示按 s. 190（5% 营业额、每日 £15,000）。与旧制度（只能向法院申请执行令）不同，须在报告中区分“可罚”与“须经法院”。
4. **Substantiation**：s. 195(2)-(3) 允许 CMA 在程序中要求商家提供事实性声称的证据，不提供或不足即“认定不准确”；法院路径见 s. 178（消费者保护令程序）。两处措辞一致，交叉核对通过。
5. **Schedule 20 清单**：逐段核对 32 项，本库选用 para 3（信任标志）、para 4（批准/背书）、para 5（诱饵价）、para 7（虚假限时）、para 10（可销售印象）、para 13（虚假评论）、para 19（疾病声称）、para 23（“免费”）。para 12（付费软文）、para 13、para 30 被 s. 237(8) 排除在刑事罪之外，但仍是民事不公平行为。
6. **CRA 2015**：s. 11(1) 描述一致；s. 11(4) 把 2013 年消费者合同信息条例附表 1/2(a) 的“主要特征”并入合同；s. 9(5)-(6) 把广告/标签中的公开陈述纳入“令人满意”判断；s. 31(1) 排除责任条款不具约束力；s. 62(4) 不公平条款定义；s. 68(1) 透明度。与 DMCCA 的分工：CRA 管合同与法定质量，DMCCA 管交易前的商业行为。
7. **EESR 2016**：reg 4（安全目标）、reg 8（型号/批次/制造商地址）、reg 9（清晰、易读、易于理解的英文说明）、reg 34（UKCA 加贴限制）、reg 50-51（罚则）。reg 6/38/39 的 “…” 是脱欧修订删除的字样，引用时已避开。
8. **插头**：Plugs and Sockets etc. (Safety) Regulations 1994 reg 12(1) 要求 BS 1363 标准插头 + BS 1362 保险丝；EESR 2016 reg 35 对 GB 市场电气设备作对应要求（含转换插头与保险丝额定）。两条交叉核对一致。1994 年条例本身不含罚则条款，其违反依《1987 年消费者保护法》s. 12 处理（UK-C2：简易程序最高 6 个月监禁或 level 5 罚金，或并罚）。
8a. **PMO 2004 罚则**：该令 art. 15（执法）已删除，正文无 “offence/penalty” 条款；因此 UK-PRC-01 的 `penalty_or_note` 只写“由地方贸易标准部门监督、以整改为主”，不写刑事后果。
9. **CE 标志仍被承认**：gov.uk 指引明确 “the UK continues to recognise the CE marking, alongside or in place of the UKCA marking, for the Great Britain market under The Product Safety and Metrology (Amendment) Regulations 2024”；SI 2024/696 reg 1 载明 2024-10-01 生效。**“英国已不承认 CE”属过时信息**，不得写入报告。
10. **GPSR 2005**：reg 5（安全产品）、reg 7(1)（风险信息）、reg 20（罚则：公诉最高 12 个月/£20,000）。北爱尔兰自 2024-12-13 起适用欧盟 GPSR (EU) 2023/988，本库未覆盖。
11. **EMC / Radio**：EMC 2016 reg 7（基本要求）；Radio 2017 reg 13(1)（英文说明、预期用途信息、频段与射频功率）。两者均要求 “easily understandable English”。
12. **WEEE / 电池**：WEEE 2013 reg 22（打叉带轮垃圾桶符号）；Batteries 2008 reg 5（同符号）、reg 6（Hg/Cd/Pb 化学符号）。含内置锂电池的小家电两者都要满足。
13. **UK GDPR**：Art 13(1) 信息清单、Art 12(1) 简明透明。现行文本已并入《2025 年数据（使用与访问）法》的修订（Art 12 出现 12A、22D、164A 等交叉引用），本库以 legislation.gov.uk 合并文本为准。
14. **PECR**：reg 6(1)（终端设备存储/访问，含 Cookie）、reg 22(2)（电子邮件事前同意）。附表 A1 的“严格必要”例外未逐项展开。
15. **PMO 2004**：art 6(1) 要求销售价格与单位价格以英镑表示；art 4(2)(b) 把“广告”排除在标示义务外，但线上商店属 distance contract 而非广告，故商品页仍须标示英镑价格。art 5 的单位价格仅适用于散装或法定需标数量的商品。
16. **BPRs 2008**：reg 3（B2B 误导性广告）、reg 4（比较广告条件，2025-04-06 起与 DMCCA s. 226/227 对接）。BPRs 仍有效，未被 DMCCA 废止。
17. **CAP Code**：section 03 已按 DMCCA 2024 重述（背景段明确提及 “Unfair Commercial Practices (UCP) provisions in Chapter 1 of Part 4”）；section 11 的 11.8/11.9 于 2025-10-24 删除。CAP 是行业自律守则，`article_type=guideline`。
18. **ASA 与法律的关系**：CAP 规则 3.1/3.3/3.4 与 DMCCA ss. 226-227、230 实质对齐；ASA 裁决可转介地方贸易标准，后者可依 DMCCA 执法。

## 未取得 / 未使用的来源

| 文件 | 状态 | 说明 |
| --- | --- | --- |
| Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013（SI 2013/3134） | 未收录为独立规则 | 其“主要特征”信息经 CRA s. 11(4)/s. 12 并入合同；取消权/退货属 Layer 3，本库只在模板中提示 |
| DMCCA 2024 Part 4 Chapter 2（订阅合同） | 未收录 | 2026 年起分阶段生效，规则细节与生效日待核；订阅型小家电/滤芯计划需另开子单 |
| EU GPSR (EU) 2023/988（北爱尔兰适用） | 未收录 | NI 与 GB 规则并行；本版只标注差异 |
| The Product Regulation and Metrology Act 2025 | 未核 | 若已生效，可能改变 OPSS 的市场监督与产品安全框架；需跟踪生效日与保留条款 |
| MHRA 医疗器械边界指引 | 未收录 | 空气净化器/美容仪的“治疗、杀菌”声称可能触发医疗器械准入；需另行研究 |
| CMA Green Claims Code / 环境声称指引 | 未收录为独立规则 | 以 CAP 11.1/11.4 + DMCCA s. 226 覆盖；CMA 指引待补 |
| 能源标签（Energy Labelling） | 未覆盖 | 大家电/部分小家电适用；当前品类未逐项映射 |
| 纺织品标签（Textile Products (Labelling etc.) Regulations 2012） | 未覆盖 | 家纺类（窗帘、床品）适用，另开子单 |
| 食品接触材料 | 未覆盖 | 水壶/饭盒等食品接触部件适用，另开子单 |
| OPSS 产品安全指南（特定品类） | 未逐条收录 | 作为市场监督背景，未作为规则引文 |
