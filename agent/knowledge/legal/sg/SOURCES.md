# 新加坡法条规则库 v0.1 — 来源清单

核验日期：2026-11-14。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。新加坡法规以英文制定，SSO（Singapore Statutes Online，AGC 法定数据库）提供 PDF 版本；本库全部引文来自 SSO 的现行合并文本。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_agc` | 新加坡总检察署（AGC）Singapore Statutes Online 发布的法例 / 附属立法 PDF | 是 |
| `official_regulator` | CCCS / Enterprise Singapore（CPSO）/ PDPC / IRAS 官网指引 | 是（指引类，标注 guideline，不能替代法条） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索 |

## 主来源

| ID | 法规 | 版本 / 生效 | 页数 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| SG1 | Consumer Protection (Fair Trading) Act 2003 | SSO 2020 Ed.，in force 2025-03-09 | 70 | https://sso.agc.gov.sg/Act/CPFTA2003?ViewType=Pdf | `sg_cpfta.pdf` | `a75960bee418af0b1089ef503791de8565f35baec60c2c947fa805e2160de692` |
| SG2 | Consumer Protection (Trade Descriptions and Safety Requirements) Act 1975 | SSO 2020 Ed.，in force 2025-07-01 | 26 | https://sso.agc.gov.sg/Act/CPTDSRA1975?ViewType=Pdf | `sg_cptdsra.pdf` | `bfbe6a7a6d172dcb87840eab4ab63339058ecf12b10c304f4ebd8a833174af8e` |
| SG3 | Consumer Protection (Safety Requirements) Regulations（Cap. 53, Rg 1） | 2004 Ed.，in force 2025-07-01 | 32 | https://sso.agc.gov.sg/SL/CPTDSRA1975-RG1?ViewType=Pdf | `sg_cpsr.pdf` | `5173a1d89ff4aa3dde6c903d4a94e81fd1e8f5e7d29c4cb0c125c1ed31f939ab` |
| SG4 | Personal Data Protection Act 2012 | SSO 2020 Ed.，in force 2026-10-16 | 125 | https://sso.agc.gov.sg/Act/PDPA2012?ViewType=Pdf | `sg_pdpa.pdf` | `04aa3475bbe5df3a16cc010da05726abdf07f4987534d0695df6cc589bd3cf59` |
| SG5 | Sale of Food Act 1973 | SSO 2020 Ed.，in force 2026-05-01 | 70 | https://sso.agc.gov.sg/Act/SFA1973?ViewType=Pdf | `sg_sfa1973.pdf` | `753416ad92dcf0d6887ef30cb8601a3fafcc82b9afd33ec2712aef80b0a44dba` |
| SG6 | Food Regulations（Cap. 283, Rg 1） | 2005 Ed.，in force 2026-01-30 | 317 | https://sso.agc.gov.sg/SL/SFA1973-RG1?ViewType=Pdf | `sg_food_regs.pdf` | `a7c629ee235fb314692a0414c642cfdb86d7f241f81fb10077fcff2e3e607b99` |
| SG7 | Weights and Measures Act 1975 | SSO 2020 Ed.，in force 2025-11-28 | 67 | https://sso.agc.gov.sg/Act/WMA1975?ViewType=Pdf | `sg_wma1975.pdf` | `03ce9b4168d7a5d01c291a275feb202d044a7fb108db340976c4bf35d611301b` |
| SG8 | Weights and Measures Regulations 2005（S 844/2005） | in force 2025-07-01 | 26 | https://sso.agc.gov.sg/SL/WMA1975-S844-2005?DocDate=20250630&ViewType=Pdf | `sg_wma_regs2005.pdf` | `0a885927c2fa8cdee536aaff9edb21e6a9bb9c61471c08912800a61f1382b80a` |
| SG9 | Goods and Services Tax (General) Regulations 1993 | in force 2026-09-21 | 229 | https://sso.agc.gov.sg/SL/GSTA1993-RG1?DocDate=20260918&ViewType=Pdf | `sg_gst_regs.pdf` | `6679ff01fb9bd433569da4a3e30041656518fcd38e9d2fb518003a3dedff9ea4` |
| SG10 | Spam Control Act 2007 | SSO 2020 Ed.，in force 2022-04-01 | 18 | https://sso.agc.gov.sg/Act/SCA2007?ViewType=Pdf | `sg_sca2007.pdf` | `c6df0f722793c586da472b26285b45194b8761b171600ea9359971e746985ab0` |

### 监控来源（尚未作为规则引文）

| ID | 法规 | 状态 | 本地文件 | SHA-256 | 说明 |
| --- | --- | --- | --- | --- | --- |
| SG-M1 | Food Safety and Security Act 2025（Act 7 of 2025） | SSO 合并文本 in force 2026-07-01；s.395 明文废除 Sale of Food Act 1973，但 2026-11-14 查 SSO 时 SFA 仍显示为 current version | `sg_fssa2025.pdf` | `52b519b1e13f0e564adfa0f62dda778cb712f0427824e11c6d55878991c79b3c` | FSSA ss.162–163 针对「hazardous food contact article」设罪（s.162 最高 S$50,000；s.163 严格责任最高 S$20,000）。废除生效后需以 FSSA 替换 SG-FOOD-01/02 的法条依据，见 README open questions #8。 |

### 辅助来源（不直接支撑 `verbatim_excerpt`）

| 来源 | 用途 | URL |
| --- | --- | --- |
| CCCS — CPFTA 指引与执法案例 | 交叉核对 CPFTA 第二附表各项的执法口径 | https://www.cccs.gov.sg/ |
| Enterprise Singapore / CPSO — Safety Mark、受管制商品与风险等级 | 核对 33 类受管制商品、注册流程、风险等级；规则只引 SSO 条文，CPSO 用于实务核对 | https://www.enterprisesg.gov.sg/ |
| PDPC — Advisory Guidelines（Consent / DNC / Registration） | 交叉核对 s.20 告知、s.43 DNC 查询流程 | https://www.pdpc.gov.sg/ |
| IRAS — Displaying and quoting prices | 核对 GST 含税展示与 S$5,000 罚款口径（官方指引，非条例原文） | https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/invoicing-price-display-and-record-keeping/displaying-and-quoting-prices |
| Weights and Measures Programme（weightsandmeasures.gov.sg） | 核对 pre-packaged goods 的实务口径 | https://www.weightsandmeasures.gov.sg/ |

## 交叉核对记录

1. **CPFTA 2003（SG1）**：核对 s.4(a)-(d)、Second Schedule Part 1 items 1/4/5/7/9/16/19/20；CPFTA 是民事框架，救济在 s.6（消费者起诉）、s.9（CCCS 申请声明/禁令），不是刑事罚则。
2. **CPTDSRA 1975（SG2）**：核对 s.4、s.5(b)、s.6、s.7、s.15；s.15 为兜底罚则（S$10,000/2 年），s.4 本身未另列罚则。
3. **CPSR（SG3）**：核对 reg.4(1)-(3)、reg.5(1)-(2)、reg.7(1)、reg.13(1)、reg.14、First Schedule items 10/20/22；reg.4(1) 明文包含 `advertise for the purpose of supply`。
4. **PDPA 2012（SG4）**：核对 s.11(3)-(5)、s.12、s.13、s.20(1)、s.43(1)、s.44、s.46(1)、s.47(1)-(2)、s.48I(1)(b)、s.48J(1)(b)(i)、(4)；DNC 各条（ss.43-48）自 2014-01-02 生效（Act 的 commencement 表），财务罚款自 2022-10-01 起适用。
5. **Sale of Food Act 1973（SG5）**：核对 s.15、s.16、s.16A、s.40(1)-(2)、s.49（一般罚则 S$5,000 / 再犯 S$10,000）；确认 SFA 在 2026-11-14 仍为 SSO 上的 current version（FSSA 的废除条文尚未使 SFA 下架）。
6. **Food Regulations（SG6）**：核对 reg.13(1)-(4)、reg.37(1)-(4)、reg.261（罚则 S$1,000 / 再犯 S$2,000）；reg.37(1)(c) 带 `[S 444/2012 wef 03/09/2012]` 修订标记，reg.37(2)/(3) 未见单独修订标记，故以条例 1988-10-01 施行日为该条生效日。
7. **Weights and Measures Act 1975（SG7）**：核对 s.2（prepacked / indication of quantity / inadequate package 定义）、s.16、s.17、s.18(1)(d)、(2)、s.19(1)-(5)、s.35（罚则：s.18 走 s.35(2) 最高 S$2,000；s.19(1)/(2) 走 s.35(1) 最高 S$5,000/3 个月；s.19(3) 走 s.35(2)）。s.18(1)(d) 与 s.19 均带 `[30/2005]`，Act 30/2005 于 2006-01-01 生效。
8. **WMA Regulations 2005（SG8，仅核对未引用）**：通读目录与条文，确认该条例只规范计量器具（最大允许误差、检定、Accuracy Label、pattern approval、Authorised Verifier、供应商注册），**没有**预包装商品净含量标示义务；因此计量规则只引 Act 本身。
9. **WMA (Sale of Goods in Metric Units) Order（O 1，核对后未引用）**：para 2(c) 明文排除 pre-packed goods，Schedule 只列纺织品/杂货/肉类等，不适用于小家电，故未收录。
10. **Price Control Act 1950（核对后未引用）**：s.7 的「展示价目表」只适用于 price-regulated goods（由 Price Controller 定价的商品），s.8 只是授权 Controller 另行命令。新加坡的含 GST 标价义务来自 **GST (General) Regulations reg.77**，不是 Price Control Act；这一点与「价格展示=价格管制法」的直觉不同，已写入 README 关键发现。
11. **GST (General) Regulations（SG9）**：核对 reg.77(1)-(3)、reg.78（豁免申请）；reg.77(1) 要求标价含税，reg.77(2) 要求含税价与不含税价并列时含税价不低显著度；IRAS 指引确认「未遵守可罚最高 S$5,000」。
12. **Spam Control Act 2007（SG10）**：核对 s.2（electronic address / instant messaging account 定义）、s.3、s.4A、s.6（批量门槛）、s.11、s.12、s.13、s.14、Second Schedule paras 2(1)-(9)、3(1)-(3)；para 3(3) 的即时通讯豁免由 Act 40/2020 于 2021-02-01 加入。

## 未取得 / 未采用

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| CPSO 受管制商品注册数据库（逐型号查询） | 需登录/交互查询，未抓取 | SG-APP-01/04/06 只能核对「页面是否展示 Safety Mark 编号」，编号是否覆盖具体型号需人工在 CPSO 系统核对 |
| DNC Registry 查询接口 | 需注册账号与付费查询，未接入 | SG-PRIV-05 只能作为流程核查项，无法自动验证 |
| ASAS Singapore Code of Advertising Practice | 行业自律，非法律 | 未收录；如产品需要可另标 `guideline` |
| 律所/商业数据库解读 | 二手 | 仅用于定位条文，未作为来源 |
| IRAS 关于 OVR（海外供应商注册）的细节 | 未逐页核对 | GST 规则只覆盖境内应税人的标价义务，跨境低价值货物另议 |

## 复核方法（可复现）

1. 用带浏览器 UA 的请求下载 SSO PDF：`curl -A '<Chrome UA>' '<URL>' -o <file>.pdf`；SSO 前面有 AWS WAF，纯 `curl` 默认 UA 会得到 403，命中 JS 挑战时返回 `202` 空响应——此时改用无头浏览器打开任一 SSO 法条页通过挑战，再用同一会话请求 PDF（本库 2026-11-14 即如此取得 SG8/SG9）。
2. 重新计算 SHA-256 并与上表比对；SSO 的 `in force from` 日期会随修订变化，若日期变了，说明文本已更新，需重新逐条比对引文。
3. 用 `pdftotext -layout` 抽文本后逐条回查：先去掉 SSO 页眉页脚（`Informal Consolidation …`、`20xx Ed.`、页码），再只保留字母数字做比对（消除换行/连字符/标点差异），`...` 分隔的引文按片段逐段回查。本次 **36/36 条 0 处不匹配**。本地 PDF 副本只用于核验，未入仓。
4. 优先核对附表（CPFTA Second Schedule / CPSR First Schedule / Food Regs 的限额）是否新增或调整。
5. 任何新规则必须同时具备：官方 URL、条文号、英文短引、`effective_date`、`last_verified`。
