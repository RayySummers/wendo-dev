# 孟加拉国（BD）法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。主来源均在该日重新取回并计算 SHA-256；复现结果见文末。
规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：本库只收**官方英文原文或官方英文译本**。孟加拉国的立法原文以孟加拉文为准；本版只录入已取得官方英文文本的法规。BTRC、个人数据保护、数字商务指南、Import Policy Order 2026-2029 等未取得官方英文文本的领域，**不录入规则**，统一列入“未取得来源”和 README 的 open questions。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_legislative_database` | 孟加拉国法律司法与议会事务部（LAPD）Laws of Bangladesh 数据库（bdlaws.minlaw.gov.bd）发布的法案页 / Authentic English Text | 是 |
| `official_bangladesh_code` | 孟加拉国法规汇编（Bangladesh Code，bdcode.gov.bd，LAPD）发布的英文法案 PDF | 是 |
| `official_regulator` | 监管机关官网（BSTI）发布的清单、指南、通知 | 是（清单类仅支撑“产品在清单内”） |
| `secondary` | 律所文章、媒体、商业数据库、NGO 页面 | 否，仅作线索/交叉核对 |

## 主来源

| ID | 法规 | 版本 / 页数 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S1 | The Consumers' Right Protection Act, 2009 (Act No. 26 of 2009) — Authentic English Text | SRO No. 08-Law/2014，孟加拉国政府公报（Extraordinary），2014-01-29，31 页；英文译本依 s.82 发布，自原法生效日起适用 | [bdlaws act-1014 的 Authentic English Text 附件](http://bdlaws.minlaw.gov.bd/upload/act/2024-07-25-13-38-10-62.%E0%A6%AD%E0%A7%8B%E0%A6%95%E0%A7%8D%E0%A6%A4%E0%A6%BE-%E0%A6%85%E0%A6%A7%E0%A6%BF%E0%A6%95%E0%A6%BE%E0%A6%B0-%E0%A6%B8%E0%A6%82%E0%A6%B0%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%A3-%E0%A6%86%E0%A6%87%E0%A6%A8,-%E0%A7%A8%E0%A7%A6%E0%A7%A6%E0%A7%A9.pdf) | `crpa2009_en.pdf` | `b60e0e79feb9e5f5a3cd2c06572fbc2041ce23a4772315e23c1f07d3b1f72c43` |
| S2 | The Bangladesh Standards and Testing Institution Ordinance, 1985 (Ordinance No. XXXVII of 1985) | Bangladesh Code 英文文本，23 页；含 2003 年修正（Act No. XXVII of 2003）与 2013 年追认说明 | [bdcode.gov.bd PDF](http://bdcode.gov.bd/upload/bdcodeact/2020-11-18-18-09-09-698_THE_BANGLADESH_STANDARDS_AND_TESTING_INSTITUT.pdf) | `bsti_ordinance_1985.pdf` | `7f766e8a6209fe38520a096c0e8a6bce59eec3c47d159738626143a136d81cff` |
| S3 | List of 315 Products Brought Under Mandatory Certification Marks Wing（BSTI 强制认证标志产品清单，315 项） | BSTI，2025-06-03，英文，10 页；Electrical and Electronics Products 50 项（第 266-315 项） | [BSTI 强制产品清单页](https://bsti.gov.bd/pages/static-pages/6922dcba933eb65569e11af8)；[PDF 附件](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bsti/2024/12/089df4031c004dcabafb81ba5334d855.pdf) | `bsti_pdf_02.pdf` | `d6beb83d833fb32eaf4eee07fdc680d71bb311e1ff417c11ec48ff8234bd9da4` |
| S4 | The Sale of Goods Act, 1930 (Act No. III of 1930) — s.15 | bdlaws 英文版，section-5172，UTF-16 HTML | [bdlaws s.15](http://bdlaws.minlaw.gov.bd/act-150/section-5172.html?lang=en) | `sec5172.html` | `f8f1a4bc935cec6f71810d68671a96a4b5a5e47f214ad5bac32d3ef9e8d09aad` |
| S5 | The Sale of Goods Act, 1930 (Act No. III of 1930) — s.16 | bdlaws 英文版，section-5173，UTF-16 HTML | [bdlaws s.16](http://bdlaws.minlaw.gov.bd/act-150/section-5173.html?lang=en) | `sec5173.html` | `774e7ee8c6c0ca5c01d71a2a80383b2cbccf5a7323f1972e34ebde9be8b9edd7` |
| S6 | BSTI 强制产品清单页（索引页） | BSTI 官网，孟加拉文页面，英文 PDF 附件；页面自述“335 项强制产品”并列出 315 项清单 | [BSTI 页面](https://bsti.gov.bd/pages/static-pages/6922dcba933eb65569e11af8) | `bsti_mandatory.html` | `df22cf8ce22115e5138fea20ccf7a2078d4e2e49eb03a3d8125c1b783301d1a7` |

### 版本与效力说明

1. **S1（CRPA 2009）**：法案 2009-04-06 制定。英文文本不是“二手翻译”，而是孟加拉国政府依 s.82 在公报上发布的 **Authentic English Text**（SRO 08-Law/2014），并明确自原法生效日起适用。s.82 同时规定原法以孟加拉文为准；英文文本用于本库引文。
2. **S2（BSTI Ordinance 1985）**：1985-07-25 公报。该法令曾被孟加拉国最高法院上诉庭在 Civil Appeal No. 48 of 2011 中宣告无效，后由 **2013 年第 7 号 Act（2013 Act No. 07）s.4** 在 1982-03-24 至 1986-11-11 期间追认生效；bdcode 英文文本保留了该脚注。引用本条时不能省略这段效力背景。
3. **S3（BSTI 315 项清单）**：清单页本身为孟加拉文，附件是英文汇总表。清单是 BSTI 对既有 SRO 的汇编，**不是单一法令**；每个产品背后有各自的孟加拉文 SRO。规则中的 `effective_date` 取清单汇编日期 2025-06-03，不表示每个产品都在该日首次纳入。
4. **S4/S5（Sale of Goods Act 1930）**：1930-03-15 制定，1930-07-01 生效。bdlaws 的 section 页为英文 HTML；该法案在 bdlaws 未提供单独 PDF，故以 HTML 原文为引文来源并记录原始字节哈希。

## 交叉核对记录

1. **CRPA 2009 条号与结构**：S1 英文 PDF 的 s.37、s.38、s.40、s.41-46、s.48、s.50-52、s.55-56 标题，与 bdlaws act-1014 孟加拉文目录（s.37 পণ্যের মোড়ক…、s.44 মিথ্যা বিজ্ঞাপন…、s.50 নকল পণ্য…、s.51 মেয়াদ উত্তীর্ণ…）逐条对应；未发现条号错位。
2. **CRPA 英文文本真实性**：S1 首页为孟加拉国政府公报（Ministry of Law, Justice and Parliamentary Affairs, Legislative and Parliamentary Affairs Division）通知，明确写明“Authentic English Text of the Act”；不是律所或商业数据库译本。
3. **BSTI Ordinance 条号**：S2 的 s.19、s.24、s.30 与 bdlaws act-689 孟加拉文目录的对应条号一致；s.24(1) 的英文文本含 2003 年修正的方括号，本库引文取修正后的 operative wording（`sale, distribution and commercial advertisement`）。
4. **BSTI 清单**：S3 的 315 项清单与 S6 页面自述的数量一致（页面另列“新增 7 项/13 项”，合计 335 项）；S3 的 Electrical and Electronics Products 为第 266-315 项，共 50 项。抽取的 7 个产品行（269、284、285、291、305、306、310）逐词与 `pdftotext -layout` 输出核对；由于 PDF 为两栏排版，引文按“描述 + 标准号”重建了阅读顺序，未改动任何词。
5. **Sale of Goods Act**：S4/S5 的 s.15、s.16 文本与 bdlaws act-150 目录标题一致；s.16(1)(2) 的但书（proviso）在引文中省略，`verbatim_excerpt` 只取主句，避免把但书当成独立规则。
6. **辅助来源（仅线索，未作为引文）**：Daily Star、律所对 Digital Commerce Guidelines 2021 的解读、TÜV 对 BSTI 扩展清单的报道、以及 BTRC/ICT Division 的公告，仅用于定位法规与确认发布时间；未用其文字支撑任何 `verbatim_excerpt`。

## SHA-256 可复现记录（2026-11-17）

重新下载全部主来源并逐项比对，结果与上表一致：

| ID | 重新下载结果 | 备注 |
| --- | --- | --- |
| S1 | `b60e0e79…1f72c43` ✅ | 186,062 bytes；bdlaws Authentic English Text |
| S2 | `7f766e8a…6d81cff` ✅ | 387,758 bytes；bdcode 英文文本 |
| S3 | `d6beb83d…bd9da4` ✅ | 1,019,654 bytes；BSTI 英文清单 |
| S4 | `f8f1a4bc…8d09aad` ✅ | 49,164 bytes；UTF-16 HTML 原始字节 |
| S5 | `774e7ee8…b9edd7` ✅ | 52,406 bytes；UTF-16 HTML 原始字节 |
| S6 | `df22cf8c…01d1a7` ✅ | 146,146 bytes；BSTI 清单页 HTML |

复现命令（示例）：

```bash
# S1
python3 - <<'PY'
import urllib.parse, urllib.request, hashlib
p='/upload/act/2024-07-25-13-38-10-62.ভোক্তা-অধিকার-সংরক্ষণ-আইন,-২০০৯.pdf'
url='http://bdlaws.minlaw.gov.bd'+urllib.parse.quote(p)
req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
data=urllib.request.urlopen(req, timeout=90).read()
print(len(data), hashlib.sha256(data).hexdigest())
PY

# S2
curl -sSL --max-time 90 -A 'Mozilla/5.0' \
  'http://bdcode.gov.bd/upload/bdcodeact/2020-11-18-18-09-09-698_THE_BANGLADESH_STANDARDS_AND_TESTING_INSTITUT.pdf' \
  -o bsti.pdf && sha256sum bsti.pdf

# S3
curl -sSLk --max-time 90 -A 'Mozilla/5.0' \
  'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bsti/2024/12/089df4031c004dcabafb81ba5334d855.pdf' \
  -o list.pdf && sha256sum list.pdf

# S4 / S5（注意：bdlaws 返回 UTF-16，需按原始字节哈希）
curl -sSL --max-time 60 -A 'Mozilla/5.0' \
  'http://bdlaws.minlaw.gov.bd/act-150/section-5172.html?lang=en' -o s15.html && sha256sum s15.html
```

> 说明：S1 的 URL 含孟加拉文文件名，必须百分号编码后用 `urllib` 或等价方式请求；直接用未编码的 shell 字符串可能 404。S4/S5/S6 的哈希对应**原始响应字节**，不是转码后的文本；复核时不要先 `iconv` 再哈希。

## 未取得 / 未采用的官方来源

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| Bangladesh Telecommunication Regulation Act, 2001 (Act No. 18 of 2001) | bdlaws act-857 仅有孟加拉文；BTRC 官网 PDF 亦为孟加拉文；未找到官方英文译本 | 3C 数码中的手机、路由器、蓝牙、Wi-Fi 等电信/无线电设备准入未建规则；BTRC 型号核准/技术接受证书（type approval / TAC）列入 open questions |
| BTRC 设备型号核准指南（2022 版及后续） | BTRC 官网版本为孟加拉文；英文版未取得 | 同上；无法核对具体设备类别、测试标准、证书有效期 |
| Personal Data Protection Act, 2026 (Act No. 63 of 2026) | 2026-04-10 公报，孟加拉文；BTRC 官网附件亦为孟加拉文；未找到官方英文文本 | 隐私告知、同意、数据主体权利未建规则；“隐私告知”覆盖为 **gap** |
| Digital Commerce Operation Guidelines, 2021（商务部） | 官方 PDF 未定位到英文版；公开英文内容多为媒体/律所摘要或商家自述 | 电商披露（卖家身份、商品描述、价格、交付、退换）未建规则；“电商披露”覆盖为 **gap** |
| Import Policy Order 2026-2029（2026-08-24 公报） | 官方 PDF 为孟加拉文；英文版未取得 | 进口标签、原产地标识、语言义务未建规则；“商品说明与标签/语言义务”只能覆盖 CRPA s.37 的罚则框架，不能覆盖具体字段 |
| BSTI 各产品 SRO（孟加拉文公报） | 未逐份取得/翻译；仅用 BSTI 英文汇总清单 | 产品是否在清单内可核对；具体型号范围、过渡期、豁免需以 SRO 原文与 BSTI 许可为准 → 产品规则 `confidence: medium` |
| BDS 标准全文（BDS 253:1990、BDS IEC 60311:2018 等） | BSTI 标准为付费文本，未取得 | 无法引用标准条款；只能引用“产品须符合该 BDS”的清单表述 |
| CRPA 2009 孟加拉文原文 | 未作为引文来源；仅用于条号/结构交叉核对 | 英文译本与孟加拉文原意之间的细微差异未逐句核对；高额罚则/新修订需律师复核 |
| 律所/媒体解读（Daily Star、TÜV、VDB 等） | 仅作线索 | 未支撑任何 `verbatim_excerpt` |

## 复核方法（下次更新时照做）

1. 重新下载 S1-S6，计算 SHA-256；若与上表不一致，说明法规或页面已更新，需重跑受影响规则。
2. 先看 `effective_date` 与 `last_verified`，再核对是否有修正令/新法案（CRPA 的罚则、BSTI 的 SRO 清单、SOG 的消费者保护改革）。
3. BSTI 清单页自述“335 项”，S3 为“315 项 + 后续新增 7/13 项”；每次复核先确认当前总数与新增项，不要把旧清单当最新。
4. BTRC、PDP、Import Policy Order、Digital Commerce Guidelines 的英文文本一旦发布，优先补入 v0.2；在取得官方英文文本前，不得用二手翻译补规则。
5. 任何新规则必须同时具备：官方 URL、条文号、短引原文、`last_verified`；缺一不可。
