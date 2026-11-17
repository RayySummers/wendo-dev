# 肯尼亚法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **语言政策**：肯尼亚宪法规定英语与斯瓦希里语为官方语言，全部相关法规以英文发布并可在肯尼亚法律网（Kenya Law, National Council for Law Reporting）取得英文原文。本库 34 条规则的 `verbatim_excerpt` 全部取自官方英文文本，无 `official_english_unavailable` 条目。

> **访问方式说明（必读）**：`kenyalaw.org` 对自动化客户端返回 **403 / AWS WAF 挑战页**（`window.awsWafCookie…`），直接 `curl` 取不到 PDF。本库改由 **Wayback Machine 对同一官方 URL 的原始快照**（`/web/<ts>id_/<原始URL>`，`id_` 表示不做内容改写）取得 PDF，并按 SHA-256 锁定版本。重新下载可复现同一哈希（已实测：`cpa2012.pdf` 两次下载均为 `47a04a38…bb35`）。原始 URL 记录在 `official_url`，快照 URL 记录在 `archive_url`。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 肯尼亚法律网发布的议会法案修订版（Revised Edition）PDF，含文首同意日与生效日 | 是 |
| `official_subsidiary_legislation` | 同一修订版卷内附的附属立法（Legal Notice / Order / Rules / Regulations），带 L.N. 编号 | 是 |
| `secondary` | 律所文章、商业数据库、新闻 | 否，仅作线索（本版未用于任何引文） |

## 主来源

| ID | 法规 / 文件 | 版本与文首日期 | 页数 | 官方 URL | 快照 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| KE1 | Consumer Protection Act, No. 46 of 2012（消费者保护法） | Kenya Gazette Supplement No. 201 (Acts No. 46), 2012-12-14；同意日 2012-12-13；文首载「Date of Commencement: By Notice」 | 75 | https://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/ConsumerProtectionActNo46of2012.pdf | https://web.archive.org/web/2023id_/https://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/ConsumerProtectionActNo46of2012.pdf | `cpa2012.pdf` | `47a04a38cabbfebcd484332e65582dc3dc6447bbd93232b6c1b485e9b366bb35` |
| KE2 | Trade Descriptions Act, Chapter 505 | Revised Edition 2012 [1980]；同意日 1977-07-13；生效日 1979-04-01；经 Act No. 2 of 2002 等修订 | 18 | http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/TradeDescriptionsAct_Cap505.pdf | https://web.archive.org/web/2023id_/http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/TradeDescriptionsAct_Cap505.pdf | `tda_cap505.pdf` | `ebb5d2e67b64473af459aa02ea9a987031b80c4f0d63eb4eded21a54be4139da` |
| KE3 | Standards Act, Chapter 496 | Revised Edition 2012 [1981]；同意日 1974-01-16；生效日 1974-07-12 | 150 | http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/StandardsActCap496.PDF | https://web.archive.org/web/2023id_/http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/StandardsActCap496.PDF | `standards_cap496.pdf` | `c09467a7fac480100ccd17e536b4e0f0eaf962a3ba946879355e64b425113d68` |
| KE4 | Verification of Conformity to Kenya Standards of Imports Order, 2005（L.N. 78/2005），编入 KE3 第 145–147 页 | L.N. 78/2005；文本未载公告日 | — | 同 KE3 | 同 KE3 | `standards_cap496.pdf` | 同 KE3 |
| KE5 | Weights and Measures Act, Chapter 513 | Revised Edition 2012；同意日 1987-12-23；生效日 1988-02-01 | 190 | http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/WeightsandMeasuresAct_Cap513.pdf | https://web.archive.org/web/2023id_/http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/WeightsandMeasuresAct_Cap513.pdf | `wma_cap513.pdf` | `1b3bfac4100c5379b654e9c0c29c813f0bc2ffcbac99b1f5a541515f656b1502` |
| KE6 | Weights and Measures (Sale and Labelling of Goods) Rules, 1999（L.N. 24/1999, L.N. 106/1999 等历次修订），编入 KE5 第 172 页起 | 1999 年规则（合并 1971–2004 历次修订） | — | 同 KE5 | 同 KE5 | `wma_cap513.pdf` | 同 KE5 |
| KE7 | Kenya Information and Communications (Importation, Type Approval and Distribution of Communications Equipment) Regulations, 2010（L.N. 57/2010），编入 Cap. 411A 第 217–223 页 | L.N. 57/2010；文本未载公告日 | — | http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/KenyaInformationandCommunicationsAct(No2of1998).pdf | https://web.archive.org/web/2023id_/http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/KenyaInformationandCommunicationsAct(No2of1998).pdf | `kica_cap411.pdf` | `7a773c1d054fc7b972f02343ec09d0d54a60c89186fc186a58d5a4fdaea3516d` |
| KE8 | Data Protection Act, No. 24 of 2019 | 同意日 2019-11-08；生效日 2019-11-25 | 49 | http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/2019/TheDataProtectionAct__No24of2019.pdf | https://web.archive.org/web/2023id_/http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/2019/TheDataProtectionAct__No24of2019.pdf | `dpa2019.pdf` | `7d76e977bbc0b5ca652c058e62be2baf04d2b2106424ff76c7a2b71bff803301` |
| KE9 | Competition Act, No. 12 of 2010 | Revised Edition 2012；同意日 2010-12-30；生效日 2011-08-01 | 54 | http://www.kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/CompetitionAct_No12of2010.pdf | https://web.archive.org/web/2023id_/http://www.kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/CompetitionAct_No12of2010.pdf | `competition2010.pdf` | `59df147fcba74f6d7a5ce383d1d99a78fcf4d1d71ca4d8f238eab0e97d1adac9` |

`effective_date` 取值规则：

- KE2 / KE3 / KE5 / KE9：取文首「Date of commencement」原文日期。
- KE8：取文首「Date of Commencement」。
- KE1：文首只写「By Notice」，未给日期。规则中暂用 **2013-03-14**，依据是两个独立的二手来源（Digital Policy Alert 事件页、Duesday 法规追踪页）一致记载该日生效；**官方公报的生效公告本库未取得**，故该日期标 `confidence: medium`（仅影响日期字段，不影响条文引用）。见「open questions」。
- KE4 / KE6 / KE7（附属立法）：合并本未载公告日期，规则中暂按 **对应年份的 1 月 1 日** 记载，且 `notes` 已注明是年度近似值。引用条文不受影响，但**报告不应把该日期当作精确生效日**。

## 逐条核对记录

| 来源 | 核对方式 | 结果 |
| --- | --- | --- |
| KE1（扫描件 + OCR 文本层） | 引文先在 `pdftotext -layout` 输出中比对；涉及 s.12(2)(a)–(q)、s.13(1)、s.15(1)、s.5(1)、s.31(2) 的引文另将 PDF 第 24–28、19、40 页渲染为图片逐页目视核对 | 目视核对 100% 一致；文本层发现 2 处 OCR 噪点（`is*void`、`thiS`），引文避开或按页面文字书写，校验脚本对 `is*void` 做记录在案的纠正（见下） |
| KE2 | 数字文本 PDF，`pdftotext -layout` 后逐词完全匹配 | 0 处不匹配 |
| KE3 / KE4 | 数字文本 PDF，同上 | 0 处不匹配（KE4 第 3 段原文为「A persons who imports goods…」，保留原拼写） |
| KE5 / KE6 | 数字文本 PDF，同上 | 0 处不匹配 |
| KE7 | 数字文本 PDF（Cap. 411A 合并本内附属立法），同上 | 0 处不匹配 |
| KE8 | 数字文本 PDF，同上 | 0 处不匹配 |
| KE9 | 数字文本 PDF，同上 | 0 处不匹配 |

**OCR 噪点处理**：`cpa2012.pdf` 的文本层把 s.5(3) 的「is void」识别成 `is*void`。为让「逐字比对」可自动化，`verify_excerpts.py` 内置一条记录在案的替换（`is*void` → `is void`），仅作用于比对用文本，不改引文。除此之外未对任何原文做美化或改写。

**扫描件页眉/边注**：肯尼亚公报扫描件的边注（如 "Unconscionable representation."）会被 OCR 插入正文中间，导致整句在文本层被切断。`verify_excerpts.py` 因此采用「逐词匹配 + 允许 ≤8 个插入词」的容差匹配，并在 `rules.v0.1.json` 的 `notes` 中标注需人工目视的条目。

## 交叉核对

| 事项 | 核对来源 | 结论 |
| --- | --- | --- |
| CPA 2012 生效日 | Digital Policy Alert 事件页（2026-11-08 更新）；Duesday `subscription.ke-cpa` 覆盖页 | 两处独立记载均为 2013-03-14；官方公报未取得 → 标 medium |
| CPA 2012 与宪法第 46 条的关系 | 宪法 Art. 46（消费者享有合理品质商品、必要信息、健康与经济利益保护、缺陷赔偿）为 CPA 的上位依据 | 仅作背景，未收录为规则（宪法不是具体页面义务） |
| TDA s.15 罚金 | 文内注明经 Act No. 6 of 2001 s.64、Act No. 15 of 2003 s.57 修订为「不超过 200 万肯先令 / 5 年」 | 与合并本正文一致 |
| Standards Act s.15 一般罚则 | 合并本 s.15(1)：初犯 12 个月或 100 万肯先令；累犯 3 年；持续违反按日加罚 10 万 | 已在 `penalty_or_note` 摘要 |
| WMA 一般罚则 | 合并本 s.63 | 本库未逐字摘录 s.63，罚则字段只写「按 s.63 一般罚则」，**具体金额未核实**，见 open questions |
| KICA 设备条例罚则 | reg. 24(2)：30 万肯先令 / 3 年 | 已摘录 |
| DPA 行政罚款 | s.63：500 万肯先令或上一年营业额 1%，取较低者 | 已摘录 |
| 肯尼亚官方语言 | 宪法第 7 条（英语与斯瓦希里语为官方语言）——本库未直接引宪法条文，语言义务改用 WMA 1999 规则 r.7(2)(a) 的明文 | 语言义务只落在**标签**，页面文案无法条义务 |

## 未取得 / 无法核实的来源

1. **Consumer Protection (General) Regulations**：CPA s.31(1)、s.36 反复使用「prescribed information」，但本库未找到任何已刊宪的通用条例。肯尼亚法律网检索受限（WAF），公开检索亦未见。→ `KE-ADV-11` 只用 s.31(2) 的自足义务，s.31(1)/s.36 未建规则。
2. **CPA 生效公告（Commencement Notice）**：官方公报未取得，生效日依赖二手来源。
3. **KEBS 强制标准清单（KS 标准号与公报命令）**：`kebs.org` TLS 证书错误（`no alternative subject name matches`），官网无法直接访问；肯尼亚法律网的标准命令亦未逐份取得。→ `KE-CERT-01` 只写规则，不列具体标准号。
4. **KEBS PVoC 清单（受符合性验证的 HS 编码/品类）**：同上，未取得。
5. **Data Protection (General) Regulations, 2021**：未下载核对，`KE-PRI-02` 的「透明性」判断因此只用法条原则，未用条例表格。
6. **WMA s.63 一般罚则的具体金额**：合并本可读但本版未摘录，罚则字段只写条款指向。
7. **郡级（county）法规与行业自律守则**（如广告业自律组织）：不在本版范围。
8. **KEBS 标准标志（standardization mark）的图形与许可编号格式**：未取得官方图样，`KE-CERT-02` 只按 s.10(6) 文本判断「是否有许可」，不判断图形真伪。

## 复现命令

```bash
mkdir -p ke-sources && cd ke-sources
wb=https://web.archive.org/web/2023id_/

curl -sSL "${wb}https://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/ConsumerProtectionActNo46of2012.pdf" -o cpa2012.pdf
curl -sSL "${wb}http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/TradeDescriptionsAct_Cap505.pdf" -o tda_cap505.pdf
curl -sSL "${wb}http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/StandardsActCap496.PDF" -o standards_cap496.pdf
curl -sSL "${wb}http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/WeightsandMeasuresAct_Cap513.pdf" -o wma_cap513.pdf
curl -sSL "${wb}http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/KenyaInformationandCommunicationsAct(No2of1998).pdf" -o kica_cap411.pdf
curl -sSL "${wb}http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/2019/TheDataProtectionAct__No24of2019.pdf" -o dpa2019.pdf
curl -sSL "${wb}http://www.kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/CompetitionAct_No12of2010.pdf" -o competition2010.pdf

sha256sum *.pdf            # 与上表逐项比对
python3 ../verify_excerpts.py --sources .
```

## 版本说明

- 本版为 v0.1，覆盖 9 个来源文件（7 个 PDF，其中 KE4/KE6 为合并本内附属立法）。
- 若肯尼亚修订 CPA 或 WMA 规则，按 `../README.md` 的流程新建 `rules.v0.2.json`，不原地覆盖。
