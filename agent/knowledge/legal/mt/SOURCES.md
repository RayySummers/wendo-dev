# 马耳他（MT）法条规则库 v0.1 — 来源清单

核验日期：2026-11-17。规则条目见 `rules.v0.1.json`，字段 `source_id` 对应本文件编号。

> 语言政策：只收官方英文原文。马耳他法例的英文版是**官方文本**（宪法第 5(2) 条规定马耳他语与英语同为官方语言），取自 `legislation.mt`（国家律师办公室 / Office of the State Advocate 运营的官方法例数据库）的英文 PDF；EU 条例取自 EUR-Lex 官方英文版。律所文章、商业数据库与中文解读只作线索，未用作引文。

## 来源分级

| tier | 含义 | 是否可直接支撑规则 |
| --- | --- | --- |
| `official_statute` | 议会法案（Chapter）的官方英文合并文本 | 是 |
| `official_subsidiary_legislation` | 附属立法（S.L.，法律公告）的官方英文合并文本 | 是 |
| `official_eu_regulation` | 欧盟条例的官方英文文本（EUR-Lex） | 是（在马耳他直接适用） |
| `secondary` | 律所文章、商业数据库、行业报告 | 否，仅作线索（本版未用作引文） |

## 主来源

| ID | 法规 / 文件 | 版本 / 状态 | 大小 (bytes) | 官方 URL | 本地快照 | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| MT1 | Consumer Affairs Act（消费者事务法，Cap. 378） | 合并英文文本，标注至 Act XXIV of 2023 与 L.N. 212 of 2023 | 547,256 | https://legislation.mt/eli/cap/378/eng | `cap378.pdf` | `5231e4f259b103ec3166d7f6fef663d8889a35310277ecd5b8128023b0b3c288` |
| MT2 | Consumer Affairs Act (Price Indication) Regulations（价格标示条例，S.L. 378.09） | L.N. 283 of 2002，经 L.N. 25 of 2007、Acts XVI of 2019、XIII of 2022 修订 | 109,651 | https://legislation.mt/eli/sl/378.9/eng | `sl_378.9.pdf` | `1c6bbf5703a7f34a6ad3a863950c43feb78f5f08851268279077d162d41e722d` |
| MT3 | Consumer Rights Regulations（消费者权利条例，S.L. 378.17） | L.N. 439 of 2013，经 L.N. 124 of 2016、Acts XVI of 2019、XIII of 2022、L.N. 145 of 2026 修订 | 213,948 | https://legislation.mt/eli/sl/378.17/eng | `sl_378.17.pdf` | `c54f78cea235fa7f5b15caf60fa64c52d559cb2415093793cbac2d5c206b6665` |
| MT5 | Product Safety Act（产品安全法，Cap. 427） | 合并英文文本，经 Act XV of 2025 修订 | 176,486 | https://legislation.mt/eli/cap/427/eng | `cap427.pdf` | `c47a2c4891ab6faaeb46c54481de91dd35dfa33c59bd73cae0b1031ba43a4842` |
| MT6 | Low Voltage Electrical Equipment Regulations（低压电气设备条例，S.L. 427.34） | L.N. 97 of 2016，经 L.N. 257 of 2026 修订（2026-05-30 视为生效） | 171,077 | https://legislation.mt/eli/sl/427.34/eng | `sl_427.34.pdf` | `1cbc10d7218d968470add7ddbbd29033b4fc1493f6384f92557ef5c2a09f1c13` |
| MT7 | Radio Equipment Regulations（无线电设备条例，S.L. 427.41） | L.N. 213 of 2016，经 L.N. 7 of 2024、L.N. 202 of 2025 修订 | 359,584 | https://legislation.mt/eli/sl/427.41/eng | `sl_427.41.pdf` | `8305b06162171e7d1cb481edcc5afa5e2b1ba5809ade6a45d0ee9ea6a7eec291` |
| MT8 | Electrical Accessories Regulations（电气配件条例，S.L. 427.51） | L.N. 181 of 2004，经 L.N. 397 of 2004 修订 | 49,060 | https://legislation.mt/eli/sl/427.51/eng | `sl_427.51.pdf` | `9076feb161f0a2581109b2f75107080a923584e4377ab2b5112f386103d0bea4` |
| MT9 | General Product Safety (Implementing) Regulations（通用产品安全实施条例，S.L. 427.106） | L.N. 68 of 2025，2025-04-04 | 118,829 | https://legislation.mt/eli/sl/427.106/eng | `sl_427.106.pdf` | `256827d8bf077b26a9ebd29ed24993e8cfc3bc936c902950a4b3607383f12430` |
| MT10 | Regulation (EU) 2023/988 on general product safety（GPSR） | OJ L 135, 23.5.2023；2024-12-13 起适用 | 194,031（渲染文本） | https://eur-lex.europa.eu/eli/reg/2023/988/oj | `gpsr.md` | `45fd64ba8ad81f34452f5bcb47b066bd6492d88326f25ef6e61e27e45dee60cf` |
| MT11 | Regulation (EU) 2016/679（GDPR） | OJ L 119, 4.5.2016；2018-05-25 起适用 | 357,062（渲染文本） | https://eur-lex.europa.eu/eli/reg/2016/679/oj | `gdpr.md` | `f6e4ef9fa8fe65a1b49d3f2876c1924103df117c0716a6ea0274d7a42cb5e6e2` |
| MT12 | Processing of Personal Data (Electronic Communications Sector) Regulations（S.L. 586.01） | L.N. 16 of 2003，经 L.N. 522 of 2004、429 of 2013 等修订 | 181,805 | https://legislation.mt/eli/sl/586.1/eng | `sl_586.1.pdf` | `bb29e66a55acde395e49b626e9bc2b300ef0051bf9691564100a69cacb7aaefc` |

### 背景来源（未直接引为规则条文）

| ID | 文件 | 用途 | 官方 URL | SHA-256 |
| --- | --- | --- | --- | --- |
| MT-BG1 | Constitution of Malta（宪法）art. 5 | 说明马耳他语与英语同为官方语言（语言政策的前提） | https://legislation.mt/eli/const/eng | `bbe77fdb6398f98ba01c4d3e4c6d12b44c90b2597e02772683e4f1b9d89c2030` |
| MT-BG2 | Act XIII of 2022（消费者法及其他相关法律修订法） | 确认 2019/2161（Omnibus）的转化日：2022-10-21 同意、公报日生效；用于 MT-ADV-07、MT-PRC-04/05 的 effective_date | https://legislation.mt/eli/act/2022/13/eng | 见抓取记录（未入库） |
| MT-BG3 | L.N. 145 of 2026（Consumer Rights (Amendment) Regulations, 2026） | 确认 2026-06-19 生效，仅涉及金融远程服务与撤回权，不改 reg. 5(1) 语言义务 | https://legislation.mt/eli/ln/2026/145/eng | 见抓取记录（未入库） |
| MT-BG4 | L.N. 257 of 2026（内部市场紧急程序修订） | 确认 LVD 的 2026 修订只涉及紧急程序，不影响本库引用的 regs. 6/8/14 | https://legislation.mt/eli/ln/2026/257/eng | 见抓取记录（未入库） |

## 复现命令

```bash
mkdir -p mt-sources && cd mt-sources

# 1) legislation.mt 官方 PDF（英文版）。URL 中的 378.9 / 586.1 是 ELI 路径的实际写法
for spec in "cap/378:cap378" "sl/378.9:sl_378.9" "sl/378.17:sl_378.17" \
            "cap/427:cap427" "sl/427.34:sl_427.34" "sl/427.41:sl_427.41" \
            "sl/427.51:sl_427.51" "sl/427.106:sl_427.106" "sl/586.1:sl_586.1" \
            "const:const"; do
  path="${spec%%:*}"; name="${spec##*:}"
  curl -sSL -A 'Mozilla/5.0' "https://legislation.mt/eli/${path}/eng/pdf" -o "${name}.pdf"
done

# 2) EUR-Lex（直连返回 202/0 bytes，需经文本渲染代理取页面正文）
curl -sSL "https://r.jina.ai/https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988" -o gpsr.md
curl -sSL "https://r.jina.ai/https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679" -o gdpr.md

sha256sum *.pdf gpsr.md gdpr.md
```

校验引文（需要 `pdftotext`）：

```bash
python3 verify_excerpts.py --sources /path/to/mt-sources
# 54/54 excerpts matched
```

## 可复现性实测

2026-11-17 对以下 4 个文件重新下载并比对 SHA-256，**逐字节一致**：

| 文件 | 首次 | 重新下载 |
| --- | --- | --- |
| `cap378.pdf` | `5231e4f2…` | 一致 |
| `sl_378.9.pdf` | `1c6bbf57…` | 一致 |
| `sl_378.17.pdf` | `c54f78ce…` | 一致 |
| `sl_427.34.pdf` | `1cbc10d7…` | 一致 |

其余 PDF 为同源同日抓取，未逐个重下；`legislation.mt` 的 PDF 为静态文件，预计同样稳定。

`gpsr.md` / `gdpr.md` 为 EUR-Lex 页面经渲染代理取得的**文本快照**，哈希对应 2026-11-17 的抓取内容，**不保证**下次逐字节一致（页面可能有 cookie 横幅或版式差异）。复核时应以「引文是否仍可在官方页面检索到」为准，而非逐字节比对。

## 交叉核对记录

1. **Cap. 378 Part VIII 的条号断层。** arts. 48–51 已被 Act II of 2008 删除（"Deleted by II. 2008.27"），现行条文是 arts. 51A–51J。引用旧条号（48/49/50/51）的二手资料会把「误导广告」指到已废止条文；本库一律引 51B–51F 与 First Schedule。
2. **价格标示条例的「马耳他货币」遗留。** `reg. 5(10)` 仍写 "The indication of the price and of the unit price as required under these regulations shall be in Maltese currency."。马耳他 2008 年采用欧元，该条未随之修订。本库**不据此建规则**，报告中也不要引用；价格义务以 regs. 4、5、5A 为准。
3. **LVD 的语言表述有两条，口径不同。** `reg. 6(9)`（制造商）要求说明书与安全信息使用「TRD 认定的易理解语言」；`reg. 8(5)`（进口商）直接写死「either Maltese or English」。跨境卖家通常同时是进口商，报告应引 reg. 8(5)。
4. **RED 同样有两条。** `reg. 10(8)(d)` 为「as determined by TRD」，`reg. 12(4)(a)` 为「either Maltese or English」。另 `reg. 10(8)(c)` 的通用充电器标签在**远程销售**时须显示在价格标示附近，这是 3C 品类唯一明确的「页面位置」要求。
5. **GPSR 与部门协调立法的关系。** GPSR art. 2 规定：部门立法已覆盖的同一目标事项优先适用部门立法，未覆盖的部分仍适用 GPSR。因此「有 CE」不等于 GPSR 的追溯、线上报价、欧盟负责人义务已满足。
6. **GPSR 的罚则不在条例里。** art. 44 只要求成员国自行设定处罚；马耳他通过 Cap. 427 的 art. 26（通知）与 art. 32(2)（罚则）执行。报告不要写「违反 GPSR 罚款 X 欧元」，应写「按马耳他产品安全法处罚」。
7. **两个罚则轨道的金额差距。** S.L. 378.09 reg. 9(3) 是 €150–€2,000；Cap. 378 art. 106A 是 €470–€47,000。价格问题可能同时构成 art. 51C(b)(iv) 的误导（走 106A）与 reg. 5A 的违规（走 reg. 9(3)），两条都要写。
8. **S.L. 378.17 reg. 5(1) 的字母项不连续。** 清单含 (a)–(t) 并在 (e) 之后有 (ea)（个性化定价），共 21 项；引用时写「reg. 5(1)(ea)」而不是自行重编号。
9. **Cap. 427 art. 32(2) 的金额带欧分。** 官方文本写作 "one thousand and one hundred and sixty-four euro and sixty-nine cents (1,164.69)"；这是 2007 年 L.N. 426 按欧元换算后的结果，不是笔误。照录。
10. **L.N. 145 of 2026 不影响 reg. 5(1) 的语言义务。** 该修订只替换 reg. 3(3)(d) 与 reg. 5(1)(h)（金融远程服务、撤回权），语言要求仍为「at least one of the official languages of Malta」。
11. **S.L. 378.17 的 reg. 5(1)(c) 用单引号。** 官方文本写 "the trader's telephone number"（直引号），不是排版弯引号；本库按纯文本照录，verifier 做了引号归一化。

## 未取得 / 不可用的来源

| 目标 | 状态 | 影响 |
| --- | --- | --- |
| MCA 无线电设备型式批准/注册流程页 | 未找到；S.L. 399.40 为频谱 general authorisation | 3C 无线品准入只落到 RED；列入 open question 1 |
| Regulation (EU) 2017/1369 及各品类能效授权条例 | 未抓取 | 能效标签规则未建；列入 open question 2 |
| MCCAA 线上销售执法决定/处罚案例 | 无公开检索库 | 罚则只写上限，无法给实际处罚分布 |
| Cap. 378 的 2024–2026 年修订 | 合并文本未标注更新日期，未逐条核 | 可能滞后；列入 open question 4 |
| DSA (EU) 2022/2065 平台义务 | 未抓取 | 平台侧不在本库范围；列入 open question 8 |
| 马耳他语版本的消费者法条文 | 未取得（也不需要） | 英文为官方文本，不影响引文效力 |
