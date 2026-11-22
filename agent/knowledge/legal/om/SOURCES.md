# 阿曼（OM）法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> **语言政策与例外。** 阿曼官方语言为阿拉伯语，英语是商务通用语。本库按 `agent/knowledge/legal/README.md` 的语言政策，只使用**官方英文原文或官方英文译本**作为 `verbatim_excerpt`；没有官方英文版本的条文标 `official_english_unavailable` 并说明，不使用律所文章、商业数据库或二手翻译。本版 40 条全部使用官方英文原文或官方英文译本；其中 `OM-PRV-07` 的英文译本对应 2022 年文本，并明确标注其 2026 年修订只有阿拉伯语。

> **可复现性。** 下表所有 SHA-256 均为 2026-11-17 在本环境实际下载后计算；复现命令见文末。规则中的 `verbatim_excerpt` 由脚本逐条断言为下载文本的子串（去除页眉与页码后做空白归一化），40/40 通过；校验脚本逻辑见「引文校验方法」。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_translation` | 阿曼官方机构（消费者保护局 CPA、交通通信与信息技术部 MTCIT）发布的英文译本，含官报期号 | 是（英文译本与阿拉伯语原文不一致时以阿语为准） |
| `official_statute` | 苏丹诏令 / 部长决定原文（英文译本时标注） | 是 |
| `official_regional_standard` | 海湾标准化组织（GSO）发布的技术法规英文文本，经成员国适用 | 是（区域性，需确认成员国执行口径） |
| `official_regulator` | 监管机关英文指引、FAQ、公告 | 是（指引类不能替代法条） |
| `secondary` | 律所文章、商业数据库、认证机构宣传页、新闻报道 | 否，仅作线索或交叉核对 |

## 主来源

| ID | 文件 | 版本 / 日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| OM1 | Consumer Protection Law 66/2014 & The Executive Regulations of the Consumer Protection Law 77/2017（消费者保护法及实施条例，官方英文译本） | Second edition 2025（CPA 汇编，含 66/2014 与 77/2017 全文及附录 1-3） | 1,586,595 | `https://cpa.gov.om/Documents/قانون حماية المستهلك واللائحة E2.pdf`（URL 编码见复现命令） | `cpa_law_and_regs_en.pdf` | `c65941ae63188ab03fea2794f6a92f6a56d3131c97727a897fe72f3b961131ed` |
| OM2 | Personal Data Protection Law（个人数据保护法，Royal Decree 6/2022，官方英文译本） | Official Gazette Issue No. (1429)；issued 2022-02-09 | 254,152 | `https://prod.mtcit.gov.om/ITAPortal/Data/English/DocLibrary/2024115132533256/PROMULGATING%20THE%20PERSONAL%20DATA%20PROTECTION%20LAW.pdf` | `pdpl_en.pdf` | `baccaff24f56c508f1db192ff479a35b3d78a5dde8567ff9a48ac1abc96580d6` |
| OM3 | Gulf Technical Regulation for Low Voltage Electrical Equipment and Appliances（BD-142004-01，英文） | GSO 发布；文本未载生效日 | 819,323 | `https://www.gso.org.sa/wp-content/uploads/2018/02/GulfTechnicalRegulations_En.pdf` | `gso_lv_en.pdf` | `fe1e5b59299428490e672f54b11647a91392892f534a15a49d02ebea913b4eb2` |

### OM1 的结构与页码

- 第 1-20 页：Consumer Protection Law 66/2014（第 1-49 条）。
- 第 21-45 页：Executive Regulations 77/2017（第 1-44 条 + 附录 1「不得印信息的商品」、附录 2「保修商品」、附录 3「保修服务」）。
- PDF 分页处会把页码与页眉插进正文（例如 Art. 20 被 “14” 与 “THE EXECUTIVE REGULATIONS…” 截断）；引文校验脚本会先剔除**独立成行的页码与重复页眉**，再判断子串。这一步只删除版式噪声，不改动任何实词。

## 修订与交叉核对来源（不用于引文）

| ID | 文件 | 版本 / 日期 | 大小 (bytes) | 官方 URL | 本地文件 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| OM4 | Royal Decree 68/2026 Amending Some Provisions of the Personal Data Protection Law（阿语） | Official Gazette No. (1664)；issued 2026-09-03，公布 2026-09-06 | 85,333 | `https://www.mtcit.gov.om/web/content/mtcit.content/1481/attachment?download=True` | `rd68_2026_ar.pdf` | `be4edd8a11a5d443060b5351e1fd75e359701c5bbb0f55ae9a150410fae270de` |
| OM5 | 消费者保护法及实施条例（阿语合并本，gov.om 文档库） | 页面标注 Jul 20, 2026 | 1,328,319 | `https://gov.om/en/consumer-protection-authority` → Documents → “Consumer Protection Law and its Executive Regulation” | `govom_cp_ar.pdf` | `89331c17ca9e36d4877cce8739694014ec3273c5cb4d865210fadf609c275fd4` |
| OM6 | Executive Regulations of the Personal Data Protection Law（部长决定 34/2024，阿语） | 2024-08-28 | 198,588 | `https://www.mtcit.gov.om/web/content/mtcit.content/1035/attachment?download=True` | `pdpl_regs.pdf` | `43fdb2a30ab82b2cb7d76be1f01c9430252d986c3e8436d61267852ba4d6c552` |
| OM7 | Personal Data Protection Law（Royal Decree 6/2022，阿语原文） | Official Gazette No. (1429) | 154,415 | `https://www.mtcit.gov.om/web/content/mtcit.content/1034/attachment?download=True` | `pdpl_2022_ar.pdf` | `a7fde9fff58e5e9dbbf668c1af4c786e71311a0dcdb5b0f552023d67d9f061e0` |

### 官方公报（Official Gazette）下载通道（2026-11-18 实测）

司法部法律事务厅（MJLA）的公报库可机取，是 OM4 / OM6 这类「部委附件」之外的第二条官方取件路径：

- 公报列表：`https://www.mjla.gov.om/legislation/1`（可抓）
- 直下 PDF：`https://www.mjla.gov.om/modules/legislation/download.php?file=<id>`（直接回 PDF）
- `file=1185` → 公报第 1664 期（2026-09-06），苏丹诏令 68/2026（PDPL 修订令）起第 **91 页**
- `file=1045` → 公报第 1531 期（2024-02-04），含部长决定 34/2024（PDPL 实施条例）

> 旁证 `qanoon.om`（`/p/2026/rd2026068/`、`/p/2024/mtcit20240034/` 转录了同一文本）自述「موقع Qanoom.om لا يعد مصدرا رسميا للقوانين」（非官方来源），**只能当线索，不得引用为官方源**。

### 交叉核对记录

1. **CPA 英文译本 ↔ gov.om 阿语合并本（OM1 vs OM5）。**
   - 2026-11-17 从 gov.om 的 Consumer Protection Authority 页面确认：阿语合并本与英文译本覆盖同一部法律与同一部实施条例，页面标注日期 2026-07-20，晚于英文译本第二版（2025）。
   - 阿语 PDF 的文本层由 legacy 字体子集生成，`pdftotext` 输出存在字符替换（如 “احل�صــول”）与 lam-alef 分解（“املتحكم”），**无法逐字转录**。因此本版用阿语本做“结构与存在性”核对，不做引文来源；英文译本与阿语本冲突时以阿语为准，并登记为 open question。
   - 结论：英文译本可作为 v0.1 引文来源；上表 OM1 的条文**未被逐条双语比对**，这是本版已知限制。
2. **PDPL 英文译本 ↔ 阿语原文（OM2 vs OM7）。** 英文译本带 Official Gazette 1429 页眉，条号、条数与阿语本一致（32 条）；本版引用的 Arts. 11/13/19/20/21/22/23/28/29 在两个语种中条号对应。
3. **RD 68/2026（OM4）对 PDPL 的修订范围。** 阿语文本第 2 条明确替换 Arts. 2、3、7、10、14、15、22、25、27，并新增 Arts. 5bis、10bis、Art. 1 的「自动化处理」定义。因此：
   - 本版**不引用**被替换的 2022 年英文文本（原 Art. 10 同意、原 Art. 14 告知、原 Art. 15 等），仅保留未被修订的 Arts. 11、13、19、20、21、23 作为 `rule_level` 依据；
   - `OM-PRV-07`（营销同意）引用 2022 年英文原文并在 `notes` 标注 2026 年已改为「明确同意」，标 `confidence: medium`、`review_required: true`；
   - RD 68/2026 目前**没有官方英文译本**，MTCIT 英文站点的法律页仍挂 2022 年阿语 PDF。
4. **实施条例的修订史（OM1）。** 公开记录显示 77/2017 经 2022 年第 1 号部长决定、2023 年第 1 号部长决定修订；另有 2026 年 5 月的修订报道称删除 8 条处罚条款（原第 45-52 条）。本版使用的 CPA 2025 年第二版英文汇编未标注逐条修订来源，Arts. 20、21、35、36 的现行措辞标 `confidence: medium` 并列入 open questions。
5. **GSO 法规在阿曼的适用（OM3）。** GSO 文本只写“Member States”，未逐国列名；阿曼为 GCC/GSO 成员，低压电器 G-Mark 由 MOCIIP 下属 DGSM 执行。MOCIIP/DGSM 官网在本环境不可达（DNS 解析到代理黑洞），**未能取得阿曼本国的执行通告**；`effective_date` 2016-07-01 取自认证机构与公告的常用执行日（二手），标 `confidence: medium`。

## 生效日口径

| 法规 | 文本规定的生效方式 | 本库 `effective_date` | 说明 |
| --- | --- | --- | --- |
| CPL 66/2014 | Art. 49：公布后 3 个月生效 | `2014-11-30`（颁布日） | 官方公报公布日未在文本内出现，未逐条核实；报告引用时应写「2014 年颁布」，不写具体生效日 |
| 实施条例 77/2017 | Art. 3：公布次日生效 | `2017-03-09`（颁布日） | 同上，公布日未在文本内确认 |
| PDPL 6/2022 | Art. IV：公布满一年后生效（2022-02-09 颁布） | `2023-02-13` | 由「公布满一年」推算；公开资料普遍记为 2023-02-13 |
| RD 68/2026 | 公布次日生效；MTCIT 标注公布日 2026-09-06 | 未单列规则 | 被修订条文的现行措辞以阿语为准 |
| GSO BD-142004-01 | 文本未载生效日 | `2016-07-01` | 认证机构与公告常用的 G-Mark 全面执行日（二手），需向 DGSM 复核 |

## 未取得的来源（open）

| 目标 | 状态 | 影响 |
| --- | --- | --- |
| MOCIIP（商业、工业与投资促进部）官网 | `mociip.gov.om` DNS 解析到 198.18.3.239，连接超时；`www.mociip.gov.om` 同 | 无法核对阿曼本国的标准（OS）、进口登记、MS-LV 计划、广告审批流程细则 |
| DGSM（标准与计量总局） | `dgsm.gov.om`、`omanstandard.gov.om` 均不可达 | 无法取得 OS 标准清单与低压电器本国合格评定程序 |
| PACP / 消费者保护局英文页 | `pacp.gov.om` 不可达；`cpa.gov.om` 可达（OM1 来源） | 已由 CPA 英文译本覆盖 |
| TRA（电信监管局）型号核准 | `tra.gov.om` 返回 WAF “Request Rejected”（含 `/en/type-approval`）；旧站 `tra.gov.om/newsite1/...` 同 | **3C 数码的无线/电信设备型号核准（Type Approval）未建规则**，只有 open question |
| PDPL 实施条例（MD 34/2024）英文版 | MTCIT 仅提供阿语 PDF（OM6） | 隐私规则的“告知内容/同意程序”细则无法用英文引文覆盖 |
| MS-LV 计划（Omani CoC + GSO CoC，2025-11-20 生效 / 2026-02-13 强制） | 仅见认证机构与行业报道（二手） | 未建规则，列入 open questions，需向 DGSM 或指定认证机构核实 |
| 阿曼《反商业欺诈法》英文版 | gov.om 仅提供阿语 PDF | 未建规则；欺诈/假冒主要由 CPA Law Arts. 7、39、40 覆盖 |

## 引文校验方法

```python
# 1) 读取 pdftotext -layout 输出
# 2) 删除独立成行的页码（1-2 位数字）与重复页眉：
#    "Consumer Protection Law" / "THE EXECUTIVE REGULATIONS OF THE CONSUMER PROTECTION LAW" /
#    "Official Gazette Issue No. (1429)"
# 3) 空白归一化：re.sub(r"\s+", " ", t).strip()
# 4) 断言每条 verbatim_excerpt 归一化后是该文本的子串
```

结果：40 条规则全部通过（0 处不匹配）。OM-PRV-07 的英文引文对应 OM2（2022 年官报英文译本），已在 `notes` 标注其 2026 年修订。

## 复现命令

```bash
mkdir -p om-sources && cd om-sources

# OM1 消费者保护法 + 实施条例（官方英文译本，第二版 2025）
curl -sSL -A 'Mozilla/5.0' \
  'https://cpa.gov.om/Documents/%d9%82%d8%a7%d9%86%d9%88%d9%86%20%d8%ad%d9%85%d8%a7%d9%8a%d8%a9%20%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d9%87%d9%84%d9%83%20%d9%88%d8%a7%d9%84%d9%84%d8%a2%d8%a6%d8%ad%d8%a9%20E2.pdf' \
  -o cpa_law_and_regs_en.pdf

# OM2 个人数据保护法（官方英文译本，官报 1429）
curl -sSL -A 'Mozilla/5.0' \
  'https://prod.mtcit.gov.om/ITAPortal/Data/English/DocLibrary/2024115132533256/PROMULGATING%20THE%20PERSONAL%20DATA%20PROTECTION%20LAW.pdf' \
  -o pdpl_en.pdf

# OM3 海湾低压电器技术法规（英文）
curl -sSL -A 'Mozilla/5.0' \
  'https://www.gso.org.sa/wp-content/uploads/2018/02/GulfTechnicalRegulations_En.pdf' \
  -o gso_lv_en.pdf

# OM4 2026 年 PDPL 修订（阿语，MTCIT 附件）
curl -sSL -A 'Mozilla/5.0' \
  'https://www.mtcit.gov.om/web/content/mtcit.content/1481/attachment?download=True' \
  -o rd68_2026_ar.pdf

# OM4 / OM6 的官方公报原件（MJLA 公报库，2026-11-18 实测可机取）
curl -sSL -A 'Mozilla/5.0' \
  'https://www.mjla.gov.om/modules/legislation/download.php?file=1185' -o gazette_1664.pdf
curl -sSL -A 'Mozilla/5.0' \
  'https://www.mjla.gov.om/modules/legislation/download.php?file=1045' -o gazette_1531.pdf

# OM5 阿语合并本（gov.om 文档库，需先从页面取带 hash 的直链）
curl -sSL -A 'Mozilla/5.0' \
  'https://gov.om/en/consumer-protection-authority' -o govom_cpa_en.html

sha256sum cpa_law_and_regs_en.pdf pdpl_en.pdf gso_lv_en.pdf rd68_2026_ar.pdf
```

> 注：MOCIIP / DGSM / TRA 的域名在本环境不可达或被 WAF 拦截，复现时如网络环境不同，结果可能不同；`tra.gov.om` 返回的是 “Request Rejected” 页面而不是 404，不能当作已取得内容。
