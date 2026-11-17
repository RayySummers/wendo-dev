# 科威特规则库 v0.1（rev.2）— 真实页面「规则 → finding」样例

抓取日：2026-11-17。两个页面都来自科威特本地零售商 Xcite，分别覆盖「小家电能效适用范围」与「3C 无线设备型号核准」。

| 页面 | URL | 抓取文件 | 大小 (bytes) | SHA-256 |
| --- | --- | --- | --- | --- |
| Wansa GOLD 分体空调（SKU 556873） | https://www.xcite.com/wansa-gold-inverter-split-air-conditioner-1-5-ton-14100-btu-t4-wi-fi-white/p | `xcite_ac.html` | 241,289 | `b1ecc13b611c236f4c14cade3e8c197bcd162046430aac106cbf580163feac22` |
| Sudio A3 Pro 无线耳机（SKU 551930） | https://www.xcite.com/sudio-a3-pro-wireless-earphone-pink/p | `xcite_earbuds.html` | 252,974 | `5cf848e85ae8ac513f79245fdcc2e822d8f8f543d39ded6205d73a1371ae859d` |

## 文本抽取方法

HTML 去脚本/样式后抽取可见文本，未对商品图片做 OCR。两个页面均为服务端渲染，价格与卖点在首屏 HTML 中可见；商品图、包装图、能效标签图未纳入文本。因此本样例只验证「文本可观察项」，图片可观察项按不可观察处理。

## 样例 A：分体空调（能效适用范围）

### 页面原文（相关部分）

- 标题：`Wansa GOLD Inverter Split Air Conditioner, 1.5 Ton, 14100 BTU T4, Wi-Fi – White.`
- 卖点：`1.5 Ton cooling capacity`、`17400 BTU cooling capacity`、`14100 BTU (T4) cooling capacity`、`Inverter compressor for energy-efficient performance`、`R32 refrigerant`
- 价格：`255.000 KD` 划线价 / `149.900 KD` 现价 / `41 %` 折扣
- 页面未见：能效标签、星级、PAI 注册号、原产国、说明书语言、KUCAS 证书、CITRA 信息。

### 命中

| 规则 | 判断层级 | 结果 | 说明 |
| --- | --- | --- | --- |
| KW-EE-01 空调适用范围 | rule_level | 命中（在范围内） | 14,100 Btu/h ≤ 70,000 Btu/h；页面写 Wi-Fi、电压未写，但科威特空调通常 240V/50Hz；需以铭牌确认 |
| KW-CERT-01 EER 注册 + 标签印包装 | human_review | 不可判定 | 页面未展示注册号/标签；标签在整机与包装上，不能据页面推断未注册 |
| KW-CERT-02 KUCAS 合规 | rule_level | 不可观察 | 属清关/进口环节，页面不承载 |
| KW-TA-01 无线设备适用范围 | rule_level | 不确定 | 整机带 Wi-Fi 模块；模块是否需单独 CITRA 核准见 open question |
| KW-CERT-06 质量标志宣称 | rule_level | 未命中 | 页面未宣称 Kuwait Quality Mark |

### Finding

**F1｜产品落入 KWS 1893:2018 强制技术法规范围（KW-EE-01，rule_level，medium）**

- 观察：页面标注 14,100 BTU（T4），1.5 吨分体空调。
- 规则：PAI 公布的 KWS 1893:2018 范围覆盖 ≤70,000 Btu/h 的风冷 DX 空调（240V 单相 / 415V 三相，50Hz）。
- 结论：该型号在适用范围内，应按 PAI 要求办理能效注册并加贴标签；页面未展示注册号与标签，**需向商家核实**（不推断未注册）。
- 需要：能效注册号、标签照片、铭牌电压/频率。

**F2｜KUCAS 合规状态不可观察（KW-CERT-02，rule_level，info）**

- 规则：PAI 公告要求受管制产品同时遵守 KUCAS 程序。
- 结论：页面不承载清关信息，**需向进口商索取 KUCAS 符合性文件**；不得据页面缺失推断未办理。

**F3｜Wi-Fi 模块的 CITRA 适用性待定（KW-TA-01，rule_level→不可判定，low）**

- 观察：整机标注 Wi-Fi。
- 规则：CITRA 条例适用于进口/销售有线与无线通信设备。
- 结论：带无线模块的家电是否需单独型号核准，本库未建立适用性规则；**需向 CITRA 或进口商确认**。这是本样例的已知漏报点。

## 样例 B：无线耳机（CITRA 型号核准）

### 页面原文（相关部分）

- 标题：`Sudio A3 Pro Wireless Earphone - Pink`
- 卖点：`Multipoint Bluetooth Connection`、`Bluetooth 5.4`、`Active Noise Cancellation`、`Water Resistance IPX4`
- 价格：`13.900 KD`
- 规格表：Model Number `SUDIO A3 PRO`，Connection Details `Bluetooth 5.4`
- 页面未见：CITRA 型号核准证书、证书编号、CE 符合性声明。

### 命中

| 规则 | 判断层级 | 结果 | 说明 |
| --- | --- | --- | --- |
| KW-TA-01 适用范围 | rule_level | 命中（在范围内） | Bluetooth 5.4 属无线通信设备 |
| KW-TA-02 进口前须型号核准 | substantiation | 命中（需证明） | 页面未展示 CITRA 证书/编号 |
| KW-TA-03 CE 基础 | substantiation | 命中（需证明） | 页面未展示 CE DoC 或测试报告 |
| KW-TA-04/05 有效期与续期 | substantiation | 不可判定 | 需证书信息 |
| KW-ADV-01 CITRA 营销误导 | rule_level | 不适用 | Xcite 不是 CITRA 持牌人（避免误报） |

### Finding

**F4｜蓝牙耳机在 CITRA 型号核准范围内（KW-TA-01，rule_level，high）**

- 观察：页面标注 Bluetooth 5.4、无线连接。
- 规则：CITRA 条例适用于在科威特进口、分销、销售、许诺销售或使用的有线/无线通信设备。
- 结论：该型号在适用范围内，进口前须取得 CITRA 型号核准。

**F5｜页面未展示 CITRA 核准信息（KW-TA-02，substantiation，medium）**

- 观察：页面无证书编号、无“CITRA approved”标注。
- 规则：进口前须取得 Accreditation Certificate。
- 结论：需要商家提供证书编号与有效期；**页面缺失不等于未核准**（证书通常在包装/说明书/进口商处）。

**F6｜CE 符合性文件未见（KW-TA-03，substantiation，medium）**

- 结论：需要 CE DoC、EMC/RF/安全测试报告；如为蓝牙耳机，通常还需 SAR（如适用）。

## 误报记录

1. **CITRA 营销规则误报**：若直接跑 KW-ADV-01 的关键词（`100%`、`up to`），会命中空调页脚 `Buy 100% genuine consumer electronics...`。Xcite 是零售商、不是 CITRA 持牌人，规则不适用；必须先做适用范围判断。
2. **“Bluetooth 5.4”不是违规**：它只是规格，不是认证宣称；KW-TA-01 只用于判断适用范围，不能据此判定未核准。
3. **“T4”不是宣称**：T4 是科威特高温工况代号，不能因出现 T4 就推断违规。
4. **“energy-efficient performance”不再触发规则**：rev.2 删除 MEPS/标签细则后，该表述没有对应规则；这是有意的能力收缩，不是漏报。

## 漏报记录

1. **标签与铭牌在图片里**：能效标签、铭牌、插头通常只在商品图中出现，纯文本抽取会漏掉；接入时需对主图/细节图做 OCR 或人工查看。
2. **证书信息不在 listing**：CITRA 证书、KUCAS 文件、EER 注册号都由进口商/包装承载，页面通常没有。
3. **型号级 vs listing 级**：CITRA 核准按型号，一个 listing 可能对应多个型号；页面型号需与证书型号逐一比对。
4. **价格与促销**：页面有划线价与折扣率，但科威特价格规则只有阿语官方文本，本库未收录 → 该维度整体漏报，属已知缺口。
5. **说明书语言**：rev.2 未收录语言规则（英文文本仅见付费标准），无法从页面判断说明书语言。

## 结论

- 两个页面跑通了 5 条 finding：2 条适用范围（rule_level）、2 条“需证明”（substantiation）、1 条“需核实”（human_review 口径）。链路可用。
- rev.2 的规则以「适用性 + 证据请求」为主，不再输出标签字段/说明书语言的细则结论；这是“仅科威特官方来源”政策的直接结果。
- 若要恢复细则诊断，需采购 KWS 标准英文版或取得 PAI 书面英文文本，再补 v0.2。
