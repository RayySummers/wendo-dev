# 肯尼亚 v0.1 — 真实页面「规则 → finding」样例

抓取日期：2026-11-17。抓取方式：`curl` + 桌面 Chrome UA，取服务端渲染的 HTML，去标签后取正文；页面为 Next.js 站点，价格与库存会随活动变化，下列文本均附页面原句。

纳入 3 个页面：

| # | 页面 | 类型 | 用途 |
| --- | --- | --- | --- |
| P1 | `https://hotpoint.co.ke/catalogue/ariete-2869-vintage-cordless-kettle-17l-2200w/` | 小家电（电水壶） | 广告表述、价格、标签、原产地 |
| P2 | `https://hotpoint.co.ke/catalogue/jbl-boombox-4-port-210w-34hrs-bat-ip68-waterproof-speaker-black/` | 3C 数码（蓝牙音箱） | 型式核准、防护等级声明 |
| P3 | `https://hotpoint.co.ke/privacy-policy/` | 隐私告知 | DPA s.29 清单核对（对照组） |

> 说明：这是**公开页面的自动筛查样例**，不是对商家的指控。所有 finding 只陈述「页面观察到什么 + 对应条文 + 需什么证据」。

## P1 — Ariete 2869 电水壶

页面关键原文（节选）：

- 站点横幅：`Black November Up to 60% off*`
- 价格：`Ksh 7,995`，`Ksh 7,596 with MTW5`，`Total saving Ksh 399`
- 库存：`In stock`
- 服务条：`1 Year Warranty`、`7-Day Returns`、`Free Delivery & Installation`
- 卖点：`Fast Boil Power`、`Premium Metal Body – Durable construction with refined finishes for long-lasting performance and style.`、`Elegant Positano Italian Design – Inspired by Mediterranean style`、`Rapid Boiling System – Get hot water instantly`
- 规格：`1.7L`、`2200W`、`SKU 35201100`、`Model 2869 Vintage`
- 页面未见：制造商名称/地址、肯尼亚进口商名称/地址、原产国、任何 KEBS 或 CA 证书编号

### 命中

| 规则 | 层级 | 观察 | finding 措辞（可直接用） |
| --- | --- | --- | --- |
| `KE-ADV-03` | substantiation | 「Premium Metal Body – Durable construction with refined finishes for long-lasting performance」属对品质/耐用性的特定主张 | 「页面就材质与耐用性作出具体主张。根据 CPA 2012 s.12(2)(c)，商品须确实达到所声称的标准或品质。需提供材质说明、耐用性/寿命测试报告或供应商规格书；无法提供时建议弱化为可核实的参数表述。」 |
| `KE-ADV-12` | substantiation | 「Italian Design – Inspired by Mediterranean style」易被理解为意大利来源/设计来源，页面未标原产国 | 「页面使用『Italian Design』表述且未标注原产地。根据 Competition Act 2010 s.55(b)(iii)，不得就商品原产地作虚假或误导性表示；TDA Cap. 505 s.7 另对进口商品的原产地标示有要求。需提供原产地证（Certificate of Origin）与设计来源说明。**需专业审核。**」 |
| `KE-ADV-07` | human_review | 横幅 `Up to 60% off*`，星号说明与适用品类未在首屏给出 | 「页面以『Up to 60% off*』作折扣宣传，具体适用范围以星号条件为准。根据 CPA 2012 s.12(2)(n)，以夸张或歧义方式表述重大事实、或遗漏重大事实，可能构成不公平行为。需核对活动规则与适用 SKU 清单，并确认星号说明的显著度。**需专业审核。**」 |
| `KE-LAB-04` | rule_level（弱） | 页面未展示制造商名称与地址 | 「页面未展示制造商名称与地址。根据 WMA 1999 规则 r.7(1)，预包装商品包装上须标注制造商名称地址、通用名称与净含量。**页面缺失不等于包装缺失**，需核对实物包装照片。」 |
| `KE-LAB-05` | rule_level（弱） | 页面未展示肯尼亚进口商名称与地址 | 「页面未展示肯尼亚进口商名称与地址。根据 r.7(1)(iii)，境外制造或包装后进口的商品须在包装上标注进口商名称与地址。需核对包装实物与进口记录。」 |

### 未命中但需要解释（避免误报）

| 规则 | 为什么没命中 |
| --- | --- |
| `KE-PRICE-01` / `KE-PRICE-02` | 页面是「现价 + 优惠码立减」，没有「原价/划线价」指示，`Total saving Ksh 399` 是优惠码面值，不是「此前售价」。**不构成** TDA s.4 的价格指示，不应报。若页面把 `Ksh 7,995` 标成划线「原价」并称降价，才触发 s.4(3)(a)(ii) 的 28 天推定。 |
| `KE-ADV-10` | `7-Day Returns` 是**增加**消费者权利的表述，不是排除法定担保；不触发 s.5(3)。仅当出现「不退不换 / 不承担保修」时才命中。 |
| `KE-LAB-07` | 页面用 `1.7L`、`2200W`，全部公制，符合 r.3(2)。 |
| `KE-LAB-06` | 页面为英文，符合 r.7(2)(a)（英文或斯瓦希里语二选一）。 |

### 漏报（人工能看出、规则没抓到）

| 项 | 说明 | 建议 |
| --- | --- | --- |
| `Fast Boil Power` / `Get hot water instantly` | 属性能主张，但 `KE-ADV-02` 的 `claim_pattern` 只覆盖背书/认证类（approved by、clinically proven 等），未覆盖「instant/fast」类性能词 | 两种处理：① 归入 `KE-ADV-03`（品质/性能）并补 `fast boil`、`boils in`；② 保持词表克制，由人工在高客单页面复核。本版选②，因为「instant」在食品等语境误报率高 |
| 「意大利设计」的原产地暗示 | 初次测试时 `KE-ADV-12` 的 pattern 只有 `made in`/`designed in`，未命中 | 已补入 `italian design` / `german design` / `japanese design` / `european design` 等 6 个表达，本版重跑后命中 |

## P2 — JBL Boombox 4 蓝牙音箱

页面关键原文：

- `JBL BOOMBOX 4 PORT, 210W, 34HRS BAT, IP68, Waterproof Speaker - Black`
- `Ksh 94,995` → `Ksh 90,246 with MTW5`，角标 `14 %`
- `In stock`、`1 Year Warranty`、`7-Day Returns`
- 页面未见：`Bluetooth` 字样、`type approval`、`Communications Authority`、`CA` 标志、制造商地址、进口商地址

### 命中

| 规则 | 层级 | 观察 | finding 措辞 |
| --- | --- | --- | --- |
| `KE-CERT-06` | substantiation | 无线音箱属通信设备，页面未展示 CA 型式核准/标签信息 | 「该商品为无线音频设备。根据 KICA 设备条例 2010 reg.12(2)，供销售的通信设备须持有效型式核准/接受证书并贴 CA 型式核准标签。**页面未展示相关信息，需核实设备与包装上的标签及证书编号**；不得据此推断未认证。」 |
| `KE-ADV-03` | substantiation | `IP68`、`Waterproof` 属防护等级主张 | 「页面声称 IP68 与防水。根据 CPA 2012 s.12(2)(c)，此类等级主张须与实际检测结果一致。需提供 IP 等级测试报告（IEC 60529）与对应型号。」 |
| `KE-LAB-05` | rule_level（弱） | 无进口商信息 | 同 P1 措辞。 |
| `KE-PRICE-01` | substantiation（边界） | 角标 `14 %` 未说明比较基准（是相对建议零售价、还是本站历史价） | 「页面角标 `14 %` 未标明比较基准。若该百分比指向『此前售价』，则触发 TDA s.4(3)(a)(ii) 的 28 天推定，需提供价格历史；若指向建议零售价，需注明来源。建议补充说明文字。」 |

### 漏报

| 项 | 说明 |
| --- | --- |
| 商品是否为「通信设备」 | 页面通篇没有 `Bluetooth`/`wireless` 字样，规则只能靠**类目映射**（Audio → Portable Speakers）判断，不能靠 `claim_pattern`。这说明 `KE-CERT-06` 在工程上需要「品类 → 是否受 CA 管制」的映射表，而不是关键词。 |
| 品牌授权链 | 页面未说明 JBL 授权来源。肯尼亚市场存在平行进口，`KE-LAB-01`（虚假商品说明）与商标问题可能相关，但本库不覆盖商标法，未建规则。 |

## P3 — Hotpoint 隐私声明（对照组）

页面结构（原文小标题）：`Your rights`、`How we use it`、`Sharing your data`、`Keeping it safe`、`How long we keep it`、`Contact us`、`Amendments`；并载明 `Hotpoint Appliances Ltd`、注册地址 `Hot Point Building, Off Thika Highway, Kiambu, Ruiru`、邮箱与电话。

### 命中

| 规则 | 层级 | 观察 | finding 措辞 |
| --- | --- | --- | --- |
| `KE-PRI-01` | rule_level（弱） | s.29(g)/(h) 两项未见：是否依法必须提供数据、不提供数据的后果。全文检索 `mandatory`/`voluntary`/`consequence` 均为 0 次（`required by law` 的 2 次出现在第三方披露语境，不是「提供数据是否强制」） | 「隐私声明未说明『提供个人数据是否属法定或自愿』以及『不提供数据的后果』。根据 DPA 2019 s.29(g)-(h)，收集前应告知这两项。建议在表单或声明中补充一句说明。」 |

### 未命中（对照意义）

- s.29 的其余各项（权利、收集事实、目的、第三方、联系方式、安全措施）在页面均有对应段落 → 不报。
- `KE-PRI-02`（透明性）未命中：用途按场景分段说明（订单、保修、营销、CCTV），不属于「空泛表述」。

## 汇总

| 页面 | 命中 | 其中需专业审核 | 弱命中（页面缺失，需核实实物） |
| --- | --- | --- | --- |
| P1 电水壶 | 5 | 2（`KE-ADV-12`、`KE-ADV-07`） | 2（`KE-LAB-04`、`KE-LAB-05`） |
| P2 蓝牙音箱 | 4 | 0 | 1（`KE-LAB-05`） |
| P3 隐私声明 | 1 | 0 | 1（`KE-PRI-01`，缺 2 项） |
| **合计** | **10** | **2** | **4** |

- **误报控制**：3 个页面共 4 处「看起来像但不应报」的情形（优惠码 vs 划线价、7 天退货 vs 排除担保、公制单位、英文标签），均已在上面逐条说明。
- **漏报**：2 类（性能词未入词表；通信设备需类目映射而非关键词）。第 1 类已在 `KE-ADV-12` 补齐相关表达，第 2 类的工程含义是「`KE-CERT-06` 必须由品类映射驱动」。
- **对报告层的要求**：rule_level 的标签类 finding（`KE-LAB-04/05/06`）必须写成「页面未展示，需核实包装」，不能写成「未标注」；认证类必须写成「证书待核」，不能写成「未认证」。

## 复现

```bash
ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
curl -sSL -A "$ua" 'https://hotpoint.co.ke/catalogue/ariete-2869-vintage-cordless-kettle-17l-2200w/' -o p1.html
curl -sSL -A "$ua" 'https://hotpoint.co.ke/catalogue/jbl-boombox-4-port-210w-34hrs-bat-ip68-waterproof-speaker-black/' -o p2.html
curl -sSL -A "$ua" 'https://hotpoint.co.ke/privacy-policy/' -o p3.html
# 去标签取正文后按 rules.v0.1.json 的 claim_pattern 逐条匹配
```

> 页面内容会随促销变化；上表结论对应 2026-11-17 抓取的版本。若重跑时价格或文案已变，应重新记录，不要沿用本文件的 finding。
