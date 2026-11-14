# 新加坡法条规则库 v0.1 — 来源清单

核验日期：2026-11-14。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。新加坡法规以英文制定，SSO（Singapore Statutes Online，AGC 法定数据库）提供 PDF 版本；本库全部引文来自 SSO 当前版本。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_agc` | 新加坡总检察署（AGC）Singapore Statutes Online 发布的法例 PDF | 是 |
| `official_regulator` | CCCS / Enterprise Singapore / PDPC 官网指引 | 是（指引类，标注 guideline） |
| `secondary` | 律所文章、商业数据库 | 否，仅作线索 |

## 主来源

| ID | 法规 | 版本/页码 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| SG1 | Consumer Protection (Fair Trading) Act 2003 | SSO 2020 Ed.，in force 2025-03-09，70 页 | https://sso.agc.gov.sg/Act/CPFTA2003?ViewType=Pdf | `sg_cpfta.pdf` | `a75960bee418af0b1089ef503791de8565f35baec60c2c947fa805e2160de692` |
| SG2 | Consumer Protection (Trade Descriptions and Safety Requirements) Act 1975 | SSO 2020 Ed.，in force 2025-07-01，26 页 | https://sso.agc.gov.sg/Act/CPTDSRA1975?ViewType=Pdf | `sg_cptdsra.pdf` | `bfbe6a7a6d172dcb87840eab4ab63339058ecf12b10c304f4ebd8a833174af8e` |
| SG3 | Consumer Protection (Safety Requirements) Regulations (Cap. 53, Rg 1) | SSO 2004 Ed.，in force 2025-07-01，32 页 | https://sso.agc.gov.sg/SL/CPTDSRA1975-RG1?ViewType=Pdf | `sg_cpsr.pdf` | `5173a1d89ff4aa3dde6c903d4a94e81fd1e8f5e7d29c4cb0c125c1ed31f939ab` |
| SG4 | Personal Data Protection Act 2012 | SSO 2020 Ed.，in force 2026-10-16，125 页 | https://sso.agc.gov.sg/Act/PDPA2012?ViewType=Pdf | `sg_pdpa.pdf` | `04aa3475bbe5df3a16cc010da05726abdf07f4987534d0695df6cc589bd3cf59` |

### 辅助来源（不直接支撑 `verbatim_excerpt`）

| 来源 | 用途 | URL |
| --- | --- | --- |
| CCCS — Consumer Protection (Fair Trading) Act 指引 | 交叉核对 CPFTA 的执法口径与 unfair practice 示例 | https://www.cccs.gov.sg/ |
| Enterprise Singapore — Safety Mark / controlled goods | 核对受管制商品清单、风险等级与注册流程 | https://www.enterprisesg.gov.sg/ |
| PDPC — Advisory Guidelines | 交叉核对 s.20 告知、DPO、同意机制的最佳实践 | https://www.pdpc.gov.sg/ |

## 交叉核对记录

1. **CPFTA 2003**：SSO PDF（SG1）核对 s.4(a)-(d)、Second Schedule items 1/4/5/7/9/16/19/20；CPFTA 是民事框架，救济在 s.6（消费者起诉）、s.9（CCCS 申请声明/禁令），不是刑事罚则。
2. **CPTDSRA 1975**：SSO PDF（SG2）核对 s.4、s.5(b)、s.6、s.15；s.15 为兜底罚则（S$10,000/2 年），s.4 本身未另列罚则。
3. **CPSR**：SSO PDF（SG3）核对 reg.4(1)-(3)、reg.5(1)-(2)、reg.7(1)、reg.13(1)、reg.14、First Schedule items 10/20/22；reg.4(1) 明文包含 `advertise for the purpose of supply`。
4. **PDPA 2012**：SSO PDF（SG4）核对 s.11(3)-(5)、s.12、s.13、s.20(1)、s.48J(1)/(3)；确认 s.20 本身不设刑事罚则，执法走专员指示 + 财务罚款 + 私人诉讼。
5. **时间效力**：CPFTA 2004-03-01 生效；CPTDSRA 1975-08-01；CPSR 2002-04-01（First Schedule 多数品类 2018-01-15 起生效）；PDPA 相关条款 2014-07-02 生效，s.48J 财务罚款 2022-10-01 生效。

## 未取得 / 未采用

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| Sale of Food Act 1973 / Food Regulations | 本次 PDF 请求返回 202 空响应，未重试成功 | 食品接触材料未收录，留给 v0.2 |
| Weights and Measures Act 1975 | 未取 | 净含量/计量规则未收录 |
| Spam Control Act / DNC 细则 | 未取 | 电话/短信营销规则未收录 |
| ASAS Singapore Code of Advertising Practice | 行业自律，非法律 | 仅在需要时作 guideline，不进规则库 |
| 律所/商业数据库解读 | 二手 | 仅用于定位条文，未作为来源 |

## 复核方法

1. 重新从 SSO `?ViewType=Pdf` 下载，计算 SHA-256；SSO 的 "in force from" 日期会随修订变化。
2. 优先核对附表（Second Schedule / First Schedule）是否新增品类或 unfair practice。
3. CPSR 的风险等级与受管制商品清单由 Safety Authority 在官网维护，SSO 附表是法律基线，实务清单需对 CPSO 官网。
4. 任何新规则必须同时具备：官方 URL、条文号、英文短引、`last_verified`。
