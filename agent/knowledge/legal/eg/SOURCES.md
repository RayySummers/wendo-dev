# 埃及法条规则库 v0.1 — 来源清单

核验日期：**2026-11-17**。主来源均在该日重新取回并计算 SHA-256；TRA 两个文件因官网维护改用 Wayback 快照，仍为官方 PDF 原件。
规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 2026-11-17 语言政策说明：埃及官方语言为阿拉伯语。本库优先使用**官方英文原文或官方英译本**（27 条）；PDPL 2020 未找到官方英文版本，4 条标 `official_english_unavailable`，`verbatim_excerpt` 保留阿拉伯语原文，不以律所/商业翻译冒充官方英文。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_regulator_english` | 埃及监管机关官网发布的英文法律/法令/指南 | 是 |
| `official_regulator_archived_english` | 上述官方 PDF 的 Wayback 存档（原件由官方域名托管，抓取时官网不可用） | 是（须记录原 URL 与快照时间） |
| `gazette_copy_secondary_ar` | 官方公报版面的复制件，托管在第三方；用于无官方电子直链的阿拉伯语法律 | 是，但 `confidence: medium`，须第二份转录交叉核对 |
| `official_regulator_ar` | 监管机关官网阿拉伯语原文 | 仅交叉核对（本版未直接引用） |
| `secondary` | 律所文章、商业数据库、媒体 | 否，仅作线索/交叉核对 |

## 主来源

| ID | 法规/文件 | 版本/页数 | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| S1 | Law No. 181 of 2018 Promulgating the Consumer Protection Act（CPA 2018），官方英译本 | Official Gazette Issue 37 bis (C), 2018-09-13；32 页 | https://cpa.gov.eg/Portals/0/Law/English%20version%20CPA%20LAW.pdf | `cpa-181-2018-en-official.pdf` | `d01b0ce645790e0628e58c4b8aa48254e3f8778cbd73b60118f6e3195a3d338d` |
| S2 | 同上，阿拉伯语作准文本 | 32 页 | https://cpa.gov.eg/Portals/0/Law/CPA-Newlaw.pdf | `cpa-181-2018-ar.pdf` | `b0349ee9f7746b1c182f3df4de7e436d3b9943619e1dd2d93f570b93e771db5a` |
| S3 | Ministerial Decree No. 43 of 2016 on registration of eligible factories exporting to Egypt | 2016-01-16 登记；5 页 | https://www.goeic.gov.eg/upload/online/2016/03/documents/files/en/1484.pdf | `goeic-1484.pdf` | `0869b9a7ac93c2150935c106901bd71924077f0a7f80dc0832302c87c67035a6` |
| S4 | Ministerial Decree No. 44 of 2019（新增附表第 26-29 类，含手机） | 2019-01-15 登记；1 页 | https://www.goeic.gov.eg/upload/online/2019/03/documents/files/en/1483.pdf | `goeic-1483.pdf` | `f7cf64ee7b8437eeba71a94b1db54c60291d7472dd05878f73c26caa13d5d9f4` |
| S5 | Telecommunication Regulation Law No. 10 of 2003（英文版，Art. 48 型号核准） | 2003-02；34 页 | 原 URL：http://www.tra.gov.eg/uploads/law/law_en.pdf（2026-11-17 返回 404）<br>存档：https://web.archive.org/web/20160303204816/http://www.tra.gov.eg/uploads/law/law_en.pdf | `telecom-law-10-2003-en.pdf` | `867a2ad3be82f25546d330aef1e90d25aa58c4e1cde777e2c4f9f5d46ec4aae8` |
| S6 | TRA/NTRA FAQ on Telecom Equipment Type Approval | 2024-03；7 页 | 原 URL：https://www.tra.gov.eg/wp-content/uploads/2024/03/FAQ.pdf<br>存档：https://web.archive.org/web/20250430023749/https://www.tra.gov.eg/wp-content/uploads/2024/03/FAQ.pdf | `tra-faq-2024-en.pdf` | `a540dccffae4263d719775b36fa3142fef04590992fa7efac4dea8e449fed91d` |
| S7 | Major Updates on Type Approval Procedure | 2025-03-24；2 页 | 原 URL：https://www.tra.gov.eg/wp-content/uploads/2025/05/Major-latest-updates-on-Type-Approval-procedure-1-2025-.pdf<br>存档：https://web.archive.org/web/20260110160849/https://www.tra.gov.eg/wp-content/uploads/2025/05/Major-latest-updates-on-Type-Approval-procedure-1-2025-.pdf | `tra-type-approval-updates-2025-en.pdf` | `b2d7c04227c4e666b019ce036e40a9b81766148a03ff3c3256fd42a9a8798985` |
| S8 | Law No. 151 of 2020 Promulgating the Personal Data Protection Law（PDPL 2020） | Official Gazette Issue 28 bis (هـ), 2020-07-15；8 页（版面复制件） | https://www.dataguidance.com/sites/default/files/egypt_data_protection_law_arabic.pdf | `pdpl-151-2020-ar-copy.pdf` | `c484ad624cddb3376d9b7bb99e9759ac61c97a3ceca889133c2cc34726559af9` |

> S1 说明：该 PDF 由 CPA 官网「Legislations」页发布，版式为 Official Gazette（Issue No 37 bis (C), 13 September 2018），标题页与末页均有公报页眉。英文版是官方译本；阿拉伯语（S2）为作准文本。报告引用英文时写「CPA 2018 官方英译本」。
>
> S5/S6/S7 说明：2026-11-17 抓取时 `tra.gov.eg` 首页显示「الموقع تحت الصيانة」（站点维护），原文件 URL 返回 404。使用 Wayback 的 `if_` 原始文件接口取回官方 PDF；S5 快照为 2016-03-03，S6 为 2025-04-30，S7 为 2026-01-10。重新下载的 SHA-256 与上表一致。
>
> S8 说明：该 PDF 是官方公报第 28 期增刊（هـ）的浏览器打印件，页眉含 `العدد رقم 28 مكرر(هـ) بتاريخ نشر 15/07/2020` 与公报门户的导航栏。非政府域名托管；官方公报门户 `alamiria.gov.eg` 的存档服务需会话访问，未取得稳定直链。文本已用第二份逐字转录（S9）交叉核对。

## 辅助来源（不直接支撑 `verbatim_excerpt`）

| ID | 文件 | 用途 | URL | SHA-256 |
| --- | --- | --- | --- | --- |
| S9 | PDPL 2020 阿拉伯语逐字转录（注明转自上诉法院立法门户） | 与 S8 交叉核对第 2、3、17、18 条；4 条引文在两份文本中均匹配 | https://alhasswalawfirm.com/law-library/law-151-2020 | `000dadf164af40ed1ecd5ff5193ca78630291a7be2a228f1aa847f1021c26f8b` |
| S10 | Ministerial Decree No. 195 of 2022（登记办理时限 15 天） | 核对 GOEIC 登记流程与时限，不单独建规则 | https://www.goeic.gov.eg/upload/online/2022/03/documents/files/en/1481.pdf | `cba065ab2457f8312f8d00fb00632529cfb3a0453437c2020546316dc8e53ada` |
| S11 | Import and Export Law No. 118 of 1975（英文） | 核对 GOEIC 登记与进口检验的上位法依据（Art. 11 管制商品须检验） | https://www.goeic.gov.eg/upload/online/2005/03/documents/files/en/1494.pdf | `1570e3deb93422657e065c844cd74e4c20e9ddedf0e4b28988bc147e300695c7` |
| S12 | GOEIC 工厂/商标权人登记服务指南（英文） | 核对登记主体、文件、15 天办理与 30 天续期 | https://www.goeic.gov.eg/upload/online/2024/08/documents/files/en/1680.PDF | `285eeef1593bf7a7c14c848462256b00007019ef50c83c94e4c3354e44b6920b` |
| S13 | Tefal Egypt FZ727 英文商品页（样例） | `SAMPLE_FINDINGS.md` 的规则→finding 样例 | https://www.tefal.com.eg/en/COOKING-APPLIANCES/LOW-FAT-FRYERS/ACTIFRY-ADVANCE-1-2KG-FZ727/p/1510001883 | `cca085b394e010b181edbdd37461e67a18e48759910eb92499f4981054a9abb7`（HTML） |
| S14 | Midea Egypt MF-TN40D2 英文商品页（样例） | 同上，用于对照「已披露 2 年保修/原产地」的页面 | https://www.midea.com/eg/small-cooking-appliances/air-fryer/air-fryer-mechanical.mf-tn40d2 | `b6f05d692524d26e9532411af2269ef7706403c8642907ec5d40da5493253aa4`（HTML） |

## 交叉核对记录

1. **CPA 2018（S1/S2）**：英文版与阿语版同为 32 页；逐页核对第 3-7、9、13、14、19、21、22、29、34、37、40 条的条号、页序与段落结构，英文版与阿语版版面一一对应。阿语 PDF 使用内嵌自定义字体，`pdftotext` 提取为乱码，未做逐字机器比对；英文引文以 S1 为准，建议当地律师在 v0.2 用纸质公报复核。第 9 条的 11 项、第 64-66 条罚则清单逐项核对条号，未发现英文版内部矛盾。
2. **CPA 生效日**：第 5 条（颁布法）规定「公布后三个月生效」；公报日 2018-09-13，故 `effective_date` 取 2018-12-13。
3. **GOEIC 43/2016 与 44/2019（S3/S4）**：S4 第 1 条明确「在 43/2016 附表新增第 26、27、28、29 类」，第 29 类为 `8517.11 - 8517.12 phones (telephones)`；S3 附表第 17 类为 household sets 及一串 HS 编码。两文件条号、附表编号连续，未发现冲突。S3 第 4 条规定「公布后两个月生效」，登记日 2016-01-16，故取 2016-03-16；S4 第 2 条规定「公布次日生效」，取 2019-01-16。
4. **GOEIC 登记流程（S10/S12）**：S12 明确「未登记工厂生产或未从登记商标权人/配送中心进口的商品，不得放行用于流通」；S10 把文件齐备后的登记办理期压到 15 天，并规定 30 天内续期、逾期警告/删除、60 天申诉。与 S3 第 1 条的登记制度一致。
5. **Telecom Law 2003（S5）与 TRA FAQ（S6）**：S5 Art. 48 授权 NTRA 制定型号核准与进口/制造/使用/交易/营销许可规则；S6 第 1 问把强制范围落到手机、IP 摄像头、交换机、路由器、卫星设备、雷达，并明确 PC/笔记本/家用电器目前为可选。两者不冲突，但**不能把 Art. 48 的「任何类型设备」直接等同于「所有家电都要核准」**；规则 EG-3C-01 的 `notes` 已标注该边界。
6. **TRA 2025 更新（S7）**：第 1 项要求面向公众产品附阿语用户手册；第 7 项要求 Tight Scheme 手册写明翻译机构名称/联系方式（ISO 17100 或阿拉伯国家政府认可）；第 2 项要求标签不可擦除；第 4 项要求装运发票型号与核准型号完全一致。S7 原文为表格，`pdftotext` 会把序号列插入句中；EG-3C-02 的引文只取连续可核对的第一句，其余要求在 `requirement`/`notes` 中说明。
7. **PDPL 2020（S8/S9）**：S8 与 S9 对第 2、3(1)、17、18(3) 条逐字比对；阿拉伯语归一化（NFKC、去变音符/ tatweel / 双向控制符、统一 alef/ya/ta marbuta、阿拉伯-印度数字转 ASCII）后，4 条引文在两份文本中均为子串匹配。S8 为公报版面，S9 为上诉法院立法门户转录；两份独立来源一致，但仍无法替代官方英文版本。
8. **PDPL 罚则条号**：第 36 条对应第 2 条（未经同意处理）、第 37 条对应第 3 条、第 43 条对应第 17/18 条；逐条核对第 35-48 条的条号与罚则区间，未发现错位。
9. **样例页面（S13/S14）**：2026-11-17 抓取，保存 HTML 与 `pdftotext` 等价的正文文本；页面内容可能随投放/促销变化，`SAMPLE_FINDINGS.md` 记录的是抓取时快照。Tefal 页面为品牌站（跳转第三方购买），Midea 页面为品牌站（无结算），二者都不构成完整远程合同流程。

## SHA-256 可复现记录（2026-11-17 重新下载）

重新下载 S1、S3、S4、S5、S6、S7、S8 并逐项比对，结果全部一致：

| ID | 重新下载结果 | 备注 |
| --- | --- | --- |
| S1 | `d01b0ce6…5a3d338d` ✅ | CPA 官网 |
| S3 | `0869b9a7…c67035a6` ✅ | GOEIC 官网 |
| S4 | `f7cf64ee…13d5d9f4` ✅ | GOEIC 官网 |
| S5 | `867a2ad3…6ec4aae8` ✅ | Wayback `if_` 原始文件 |
| S6 | `a540dccf…49fed91d` ✅ | Wayback `if_` 原始文件 |
| S7 | `b2d7c042…a8798985` ✅ | Wayback `if_` 原始文件 |
| S8 | `c484ad62…726559af9` ✅ | 第三方托管的公报复制件 |

复现命令（示例）：

```bash
curl -sSL --max-time 90 -A 'Mozilla/5.0' -o s1.pdf \
  'https://cpa.gov.eg/Portals/0/Law/English%20version%20CPA%20LAW.pdf'
sha256sum s1.pdf
# d01b0ce645790e0628e58c4b8aa48254e3f8778cbd73b60118f6e3195a3d338d

curl -sSL --max-time 90 -A 'Mozilla/5.0' -o s5.pdf \
  'https://web.archive.org/web/20160303204816if_/http://www.tra.gov.eg/uploads/law/law_en.pdf'
sha256sum s5.pdf
# 867a2ad3be82f25546d330aef1e90d25aa58c4e1cde777e2c4f9f5d46ec4aae8
```

> Wayback 的 `if_` 后缀取原始文件；不带 `if_` 可能返回带工具栏的页面，哈希会不同。

## 引文核对方法

`verify_excerpts.py` 读取 `rules.v0.1.json`，按 `source_id` 找本地源文件，逐条检查 `verbatim_excerpt` 是否为源文本子串：

```bash
python3 verify_excerpts.py --sources /path/to/eg-sources
# 31/31 PASS, 0 mismatch
```

源文件命名：

| source_id | 文件名 |
| --- | --- |
| S1 | `cpa-181-2018-en-official.pdf` |
| S3 | `goeic-1484.pdf` |
| S4 | `goeic-1483.pdf` |
| S5 | `telecom-law-10-2003-en.pdf` |
| S7 | `tra-type-approval-updates-2025-en.pdf` |
| S8 | `pdpl-151-2020-ar-copy.pdf`（同时比对 `pdpl-ar.txt`） |

归一化规则：

- 英文：NFKC、弯引号转直引号、转小写、去所有非字母数字字符（消除换行、连字符断词与标点差异）。
- 阿拉伯语：NFKC、阿拉伯-印度数字转 ASCII、去变音符（U+0610-061A、U+064B-065F、U+0670、U+06D6-06ED）、去 tatweel（U+0640）、去双向控制符（U+200B-200F、U+202A-202E、U+2066-2069）、统一 `أ/إ/آ`→`ا`、`ى`→`ي`、`ة`→`ه`、转小写、去非字母数字字符。
- S8 同时检查公报 PDF 文本与 S9 的 HTML 转录；4 条 PDPL 引文在两者中均匹配。

## 未能取得 / 未采用的官方来源

| 来源 | 状态 | 影响 |
| --- | --- | --- |
| CPA 实施细则（Prime Minister Decree No. 822/2019）英文文本 | 未找到官方英文版；CPA 官网英文页只列法律 | 第 4、6、10、18、37 条的具体数据项无法逐项核对；README open question #1 |
| PDPL 实施细则（MCIT Decision No. 81/2025） | 2025-11 发布，阿拉伯语；未取得文本 | 隐私告知内容、DPO 登记、许可门槛待补；README open question #5 |
| EOS 强制标准清单 / ES 1781 全文 | EOS 标准需购买；官网只列目录与简介 | 小家电标准符合性只能判「需要证明」；未把 WTO 通知摘要当条文 |
| 埃及广告标准（CPA 第 1(6) 条引用的 Egyptian standard specifications for advertising requirements） | 未定位标准号/文本 | 数字广告是否有额外内容标准未知；README open question #2 |
| 能效标签要求 | 未取得官方文本 | 冰箱/空调/洗衣机/灯具能效标识未建规则 |
| 官方公报门户 `alamiria.gov.eg` 的存档直链 | 站点可达，但 `/ar-eg/archiving-service/`、`/Sec/Archive.aspx` 均 404；存档需会话 | PDPL 只能用第三方托管的公报复制件 + 第二份转录 |
| `tra.gov.eg` 实时站点 | 首页显示「الموقع تحت الصيانة」，原 PDF URL 404 | 使用 Wayback 官方 PDF 原件（S5/S6/S7） |
| WTO TBT 通知（G/TBT/N/EGY/233 等） | `docs.wto.org` 返回 JS 挑战页，未取得正文 | 未把通知摘要作为引文；ES 1781 只能留在 open questions |
| `egypt.gov.eg` / `sis.gov.eg` | TLS 连接被重置 | 未使用；不影响本版主来源 |
| Jumia Egypt / Noon Egypt | Cloudflare 403 / HTTP2 错误 | 样例改用品牌官网（Tefal/Midea），不依赖平台页 |
| 律所文章（Andersen、Consortio、Al Tamimi 等） | 二手解读 | 仅用于定位条文，未作为 `official_url` 或引文 |

## 复核方法（下次更新时照做）

1. 重新下载上表主来源，计算 SHA-256；若与表中不一致，说明法规/指南已更新，需重跑受影响的规则。
2. 先看 `effective_date` 与 `last_verified`，再核对是否有新法令修改条号/罚则（GOEIC 附表、TRA 方案、CPA 罚则、PDPL 实施细则）。
3. GOEIC 附表与 HS 编码、TRA 型号核准方案、PDPL 许可是高频变动项，优先复核。
4. 任何新规则必须同时具备：官方 URL、条文号、短引原文、`last_verified`；缺一不可。
5. 无官方英文版本的条目，必须保留阿拉伯语原文并标 `official_english_unavailable`；不得用二手翻译补英文引文。
