# 科威特规则库 v0.1 — 真实页面「规则 → finding」样例

抓取日：2026-11-17。页面：

- URL：https://www.xcite.com/wansa-gold-inverter-split-air-conditioner-1-5-ton-14100-btu-t4-wi-fi-white/p
- 页面：Wansa GOLD Inverter Split Air Conditioner, 1.5 Ton, 14100 BTU T4, Wi-Fi（SKU 556873）
- 抓取文件：`xcite_ac.html`（241,289 bytes，SHA-256 `b1ecc13b611c236f4c14cade3e8c197bcd162046430aac106cbf580163feac22`）

这是科威特本地大型电器零售商 Xcite 的在售空调页面，属于本库覆盖的「小家电 + 能效标签」范围，且是分体变频机型，适合检验 KW-EE 系列规则。

## 文本抽取方法

HTML 去脚本/样式后抽取可见文本，未对商品图片做 OCR。页面为服务端渲染，规格表与价格在首屏 HTML 中可见；商品图、能效标签图未纳入文本。因此本样例只验证「文本可观察项」，图片可观察项按不可观察处理。

## 页面原文（与 finding 相关的部分）

- 标题：`Wansa GOLD Inverter Split Air Conditioner, 1.5 Ton, 14100 BTU T4, Wi-Fi – White.`
- 卖点：
  - `1.5 Ton cooling capacity`
  - `17400 BTU cooling capacity`
  - `14100 BTU (T4) cooling capacity`
  - `Inverter compressor for energy-efficient performance`
  - `R32 refrigerant`
- 价格：`255.000 KD` 划线价 / `149.900 KD` 现价 / `41 %` 折扣
- 页面底部站点通用文案：`Buy 100% genuine consumer electronics and home appliances from Xcite`
- 页面未见：能效标签、能效星级、PAI 注册号、原产国、说明书语言、KUCAS 证书、CITRA 信息。

## 规则命中

| 规则 | 判断层级 | 命中 | 说明 |
| --- | --- | --- | --- |
| KW-EE-02 能效宣称需测试支撑 | substantiation | 是 | 出现 `energy-efficient` 宣称，页面无 EER/星级/测试值 |
| KW-EE-06 能效信息不得含糊 | human_review | 是（弱） | 同时列 17,400 BTU 与 14,100 BTU（T4），前者未标工况 |
| KW-EE-01 能效注册 | substantiation | 不可判定 | 页面未展示注册号；标签在整机上，不能据页面推断未注册 |
| KW-EE-05 标签字段 | substantiation | 不可判定 | 同上 |
| KW-EE-03 铭牌语言/耐久 | rule_level | 不可观察 | 需实物铭牌照片 |
| KW-EE-04 说明书双语 | rule_level | 不可观察 | 需说明书实物/PDF |
| KW-CERT-02 KUCAS 清关证书 | rule_level | 不可观察 | 属清关环节，页面不承载 |
| KW-CERT-04 技术查验（电压/插头） | substantiation | 不可观察 | 需铭牌与插头照片 |
| KW-TA-01～04 CITRA 型号核准 | — | 不适用 | 空调不含无线通信模块（Wi-Fi 模块是否需单独核准见 open question） |

## Finding 样例

### F1｜能效宣称缺少测试支撑（KW-EE-02，substantiation，medium）

- 观察：页面写 `Inverter compressor for energy-efficient performance`。
- 规则：KWS 1893:2018 第 6 节要求受管制空调达到 MEPS 的 EER 下限；第 5 节要求注册时提交 GSO ISO 5151/13253 测试报告。
- 推断：这是能效相关的宣传表述，但页面未给出 EER、能效星级、T1/T4 测试值或 PAI 注册号，无法验证“高效”的依据。
- 需要：T1/T4 测试报告（EER、制冷量、输入功率）、能效标签照片、PAI 注册号。
- 报告措辞：页面宣称节能，按 KWS 1893 第 6 节需有测试值与 MEPS 对照支撑；当前页面未提供 EER 或能效星级，**需商家提供测试报告**。

### F2｜两个制冷量并列但只标了一个工况（KW-EE-06，human_review，low）

- 观察：`17400 BTU cooling capacity` 与 `14100 BTU (T4) cooling capacity` 并列，前者未注明是 T1 还是其他工况。
- 规则：KWS 1893:2018 第 7 节要求机组或包装上的能效信息不得含糊、不得引起对性能的误解。
- 推断：行业内通常理解 17,400 BTU 为 T1、14,100 BTU 为 T4，但普通消费者可能把较大值当作实际制冷能力；是否构成“含糊”需结合包装与标签判断。
- 需要：包装/铭牌上的 T1/T4 标注；测试报告。
- 报告措辞：页面同时列出两个制冷量，未标注前者的测试工况，是否构成对性能的误解**需专业审核**。

### F3｜能效标签与注册信息未展示（KW-EE-01/05，substantiation，info）

- 观察：页面没有能效标签图、星级、注册号或原产国。
- 规则：KWS 1893 第 5 节要求注册，第 9.1 节要求标签含注册号与签发日期、原产国、型号等字段。
- 推断：标签依规贴于整机（第 9.4 节），**页面不展示不等于未注册**；只能提示核实。
- 报告措辞：页面未展示能效标签与注册号，**需向商家核实**（不得推断“未认证”）。

## 误报记录

1. **CITRA 营销规则误报**：若直接跑 KW-ADV-01 的关键词（`100%`、`up to`），会命中站点页脚 `Buy 100% genuine consumer electronics...`。但（a）这是全站通用文案而非该商品宣称，（b）Xcite 是零售商，不是 CITRA 持牌人，KW-ADV-01 不适用。→ 规则必须带适用范围判断，否则是误报。
2. **“Inverter”误报**：把 `inverter` 当作能效宣称会误伤所有变频机型；本库的 KW-EE-02 只匹配 `energy saving` / `energy efficient` 等宣称词，不含 `inverter`。
3. **“T4”误报**：T4 是科威特高温工况代号，本身不是宣称；不能因出现 T4 就判定违规。

## 漏报记录

1. **图片中的标签**：能效标签、铭牌、插头通常只在商品图中出现，纯文本抽取会漏掉。若接入，需要对主图/细节图做 OCR 或人工查看。
2. **价格展示规则缺失**：页面有划线价与折扣率（255 → 149.9，41%），但科威特价格与促销规则（CPL 及实施条例）只有阿拉伯语官方文本，本库未收录 → 该维度整体漏报，属已知缺口而非规则失效。
3. **说明书语言**：页面不展示说明书，KW-EE-04 无法从页面判断；需要商家提供说明书 PDF。
4. **清关证书**：KUCAS 的 CoC/TIR 不会出现在商品页，需向进口商索取。
5. **Wi-Fi 模块的 CITRA 核准**：空调整机带 Wi-Fi，Wi-Fi 模块/整机是否需单独 CITRA 型号核准，本库未建立适用性规则（open question）。这是 3C 与家电交叉处的潜在漏报点。

## 结论

- 该页面跑通了 3 条 finding（1 条 substantiation、1 条 human_review、1 条“需核实”提示），验证了「规则 → finding」链路。
- 也暴露了两个结构性问题：能效/标签类规则大量依赖实物与图片，纯页面文本只能给“需核实”；价格与广告类规则因语言政策缺位，无法在该页面产生任何 finding。
- 这两点共同支持 README 的结论：KW 目前只适合开放「准入 + 能效标签 + 语言义务」窄模块，且报告需明确标注不可观察项。
