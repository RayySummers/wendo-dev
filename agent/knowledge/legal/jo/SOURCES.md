# 约旦（JO）规则库来源清单 v0.1

> 目的：让 `rules.v0.1.json` 的每一条 `verbatim_excerpt` 都能回到**可下载的官方文件 + 哈希 + 页码**。
> 取数日期：2026-11-17（UTC）。本文件记录取数时的 URL、字节数、页数、SHA-256，以及取不到的来源。

## 1. 已取得的官方来源

| source_id | 文件 | 发布机关 | 官方 URL | 版本 / 形态 | 字节数 | 页数 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| JO1 | `قانون حماية المستهلك (7/2017)` Consumer Protection Law No. 7 of 2017 | 约旦工业、贸易与供给部（MoITS）消费者保护司 | https://www.mit.gov.jo/ebv4.0/root_storage/ar/eb_list_page/%D9%82%D8%A7%D9%86%D9%88%D9%86_%D8%AD%D9%85%D8%A7%D9%8A%D8%A9_%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%87%D9%84%D9%83.pdf | 2017 年第 7 号法；官方公报第 5455 期（2017-04-16）文本的部内重排版 PDF | 606,364 | 10 | `b0acc14124ba8d7b22377d8fc7d990d2ff18c1a38d88f24932bf1e5da2a49771` |
| JO2 | `قانون حماية البيانات الشخصية (24/2023)` Personal Data Protection Law No. 24 of 2023 — **Official English Translation** | 数字经济与创业部（MoDEE） | https://www.modee.gov.jo/EBV4.0/Root_Storage/EN/1/PDP_Law_-_English_Version-_officail_translation.pdf | 2023 年第 24 号法；MoDEE 发布的官方英文译本（阿英对照排版） | 1,519,684 | 25 | `616d0d7456b920025b51eda221d2cca534bb22c91ac8271eef7c54181021369b` |
| JO3 | Personal Data Protection Unit 页面（生效日与过渡期） | MoDEE | https://www.modee.gov.jo/EN/Pages/Personal_Data_Protection_Unit?View=2201 | HTML 页面，含 "enacted on September 17th, 2023 … effective on March 17th, 2024 … grace period … March 16th, 2025" | 106,225 | — | `c98f6e033c8e4aad33fbc2fbed5bb3e8db89ac4a9aa7457de2e04ebb9b3d3b8c` |

来源分级：

- `JO1` = `official_ministry_copy`：内容来自官方公报文本，但由部内重新排版（页眉为“وزارة الصناعة والتجارة والتموين / مديرية حماية المستهلك”，页脚标注“الجريدة الرسمية (5455)”）。**不是**公报原始版面。
- `JO2` = `official_translation`：发布机关自己提供的英文译本，与阿拉伯文逐段对照排版，属可引用的官方英文文本。
- `JO3` = `official_page`：用于确认生效日与过渡期，不用于引文。

## 2. 阿拉伯文引文的转录规则（必读）

`JO1` 这份官方 PDF 存在**字体层连字错位**：渲染与文本层都会把 `ال` + 后续字母的连字写成“ا + 后续字母 + ل”，例如：

| 正确写法 | PDF 中的写法 |
| --- | --- |
| المستهلك | املستهلك |
| الإعلان | اإلعالن |
| الأداء | األداء |
| الاستعمال | االستعمال |

因此：

1. **引文一律按标准正字法转录**，不保留 PDF 的错位字形；否则引文在阿拉伯语读者看来是错字。
2. 每条引文都**逐条对照该页渲染图像**核对（不是只依赖文本层）。核对页码：Art 3–4 → p.2；Art 5–6 → p.3；Art 7–8 → p.4；Art 21–23 → p.8；Art 24–27 → p.9–10。
3. 校验脚本（词级比对，容忍上述连字错位）：比对 `verbatim_excerpt` 与 PyMuPDF 文本层，若某词在文本层缺失，则尝试其“错位变体”再匹配。30 条规则的比对结果：**0 处未解释差异**。唯一需要显式白名单的是 `مضللا`——文本层把该词拆成 `ل مض:ال`（换行 + 混入冒号），已对照 p.4 图像确认原文为 `مضللا`。脚本与输出见 §5。
4. 本库不把任何二手英译当作引文。`JO1` 的 21 条因此标 `language: official_english_unavailable`。

## 3. 交叉核对记录

| 事项 | 核对方式 | 结果 |
| --- | --- | --- |
| CPL 条文号与内容 | 部内 PDF 文本层 × 页面图像 × 条文序号连续性（Art 1–27 无缺号） | 一致 |
| CPL 罚则数额 | Art 25(A) 原文“لا تقل عن (250) … ولا تزيد على (10000)” | 250–10,000 JOD；监禁 ≤ 6 个月 |
| CPL 生效日 | Art 1：“يعمل به بعد ستين يوما من تاريخ نشره”；页脚 2017-04-16 | 推定 2017-06-15 生效；**公报原始版面未取得**，属推定值（confidence 依据见下） |
| CPL 是否被修订 | 部内 PDF 未附修订；检索未见 2017 年后的 CPL 修正法 | **未证实**，列入 open questions |
| PDP 生效日 | JO3 官方页面：“enacted 2023-09-17 / effective 2024-03-17 / grace period ends 2025-03-16” | 与 JO2 Art 1（公布后 6 个月生效）一致 |
| PDP 罚则 | JO2 Art 21(A)(4)、Art 22(A) | 行政罚款按日 500 JOD、上限上年营业额 3%；刑事罚金 1,000–10,000 JOD，重复加倍 |
| PDP 英译本完整性 | JO2 共 25 条，阿英逐段对照，Art 1–25 无缺号 | 一致 |

## 4. 取不到的官方来源（open questions 的证据）

以下站点在本研究环境**不可达**（TLS 连接被重置 / 连接超时，非 404）。因此相关规则**未收录**，不得凭记忆补写：

| 目标来源 | URL | 现象 | 影响 |
| --- | --- | --- | --- |
| 约旦标准与计量组织（JSMO）技术法规、标签与语言要求 | https://www.jsmo.gov.jo/ | `curl (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL`；http/无 www 变体同样失败 | **语言义务、标签格式、具体电气安全技术法规无法建条** |
| 电信监管委员会（TRC）设备型式认可指令（含 2025 年第 2 号指令） | https://www.trc.gov.jo/ | 同上，TLS 重置 | 3C 无线/通讯设备准入未覆盖 |
| 能源与矿产监管委员会（EMRC）能效标签 | https://www.emrc.gov.jo/ | 连接失败 | 能效标签未覆盖 |
| 约旦官方公报（`gazette.gov.jo`）原文版面 | https://www.gazette.gov.jo/ | 连接失败 | CPL 公报原始版面、2023 年《消费者保护指令》（OG 5879）全文未取得 |
| 海关总署 | https://www.customs.gov.jo/ | 连接失败 | 进口单证要求未覆盖 |
| 食品药品管理局（JFDA） | https://www.jfda.jo/ | 连接失败 | 食品/美妆（本单不覆盖） |
| 立法与意见局法规库 | https://www.lob.gov.jo/ | 可达但是 SPA，法规检索页需 JS | 未取得可下载的合并文本 |

> 说明：`https://www.mit.gov.jo/` 与 `https://www.modee.gov.jo/` 可达，是本单两条主来源的宿主。

## 5. 复现步骤

```bash
mkdir -p jo_sources && cd jo_sources
UA='Mozilla/5.0'

# JO1
curl -sSL -A "$UA" -o cpl_ar.pdf \
  'https://www.mit.gov.jo/ebv4.0/root_storage/ar/eb_list_page/%D9%82%D8%A7%D9%86%D9%88%D9%86_%D8%AD%D9%85%D8%A7%D9%8A%D8%A9_%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%87%D9%84%D9%83.pdf'

# JO2
curl -sSL -A "$UA" -o pdp_en.pdf \
  'https://www.modee.gov.jo/EBV4.0/Root_Storage/EN/1/PDP_Law_-_English_Version-_officail_translation.pdf'

sha256sum cpl_ar.pdf pdp_en.pdf
```

期望输出（与本文件 §1 一致）：

```
b0acc14124ba8d7b22377d8fc7d990d2ff18c1a38d88f24932bf1e5da2a49771  cpl_ar.pdf
616d0d7456b920025b51eda221d2cca534bb22c91ac8271eef7c54181021369b  pdp_en.pdf
```

引文校验（词级、容忍连字错位）：

```bash
# 在仓库根目录执行（或按实际相对路径调整）
python3 agent/knowledge/legal/jo/verify_excerpts.py \
  jo_sources/cpl_ar.pdf jo_sources/pdp_en.pdf agent/knowledge/legal/jo/rules.v0.1.json
# 期望输出：checked 30 rules; 0 rule(s) with unexplained words
```

> 若日后官方站点改版导致哈希变化：先比对条文文字，再决定是“同一文本的重新发布”（更新哈希并注明）还是“文本已修订”（新建 `rules.v0.2.json`，不原地覆盖）。

## 6. 未采信的二手材料（仅作线索，未进入规则库）

- UN ESCWA / FAOLEX 对 CPL 2017 的英文摘要与条文摘译（非约旦官方发布）。
- 律所与合规服务商（Al Tamimi、Clyde & Co、TÜV SÜD、gma.caict.ac.cn 等）对 CPL / PDP / TRC 指令的解读。
- 约旦本地媒体对 2023 年《消费者保护指令》的报道（用于确认该指令存在及公报期号 5879，未用于引文）。

以上材料只用于**发现线索**和**确认某部法规存在**；任何条文内容均以 §1 的官方文件为准。
