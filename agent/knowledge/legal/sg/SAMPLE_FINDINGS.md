# 规则 → finding 样例：真实页面跑通记录（新加坡）

> 目的：验证 `rules.v0.1.json` 能否落到真实页面上，并记录误报/漏报。
> 本文件只记录观察与证据，不构成法律意见，不输出定性结论；缺失项一律写「页面未展示，需向商家核实」。

## 样例页面

| 项目 | 页面 A | 页面 B |
| --- | --- | --- |
| URL | https://mayer.sg/products/mayer-6-5l-ceramic-air-fryer | https://www.harveynorman.com.sg/home-appliances/small-kitchen-appliances-en/fryers/tefal-easy-fry-pop-5l-air-fryer-nest-ey2452.html |
| 页面 | Mayer 新加坡官网 — 6.5L Ceramic Air Fryer（MMAF65） | Harvey Norman 新加坡 — Tefal Easy Fry POP 5L（EY2452） |
| 取回时间 | 2026-11-14 16:46（UTC+8） | 2026-11-14 16:46（UTC+8） |
| HTTP | 200 | 200 |
| 原始 HTML | 384,715 bytes；SHA-256 `0b2551933f3b8b8e358507c00cfe45c136988d2ae145cdebb124db488950b840` | 427,019 bytes；SHA-256 `fb950d75710a7411398ad488c08fa7e0ceba173bedf70ab5732c4f7709868fc2` |
| 可见文本 | 4,770 字符（`BeautifulSoup` 去 script/style 后） | 39,727 字符（同法） |
| 抓取方式 | `curl` 静态 HTML（服务端渲染，价格与规格在 HTML 内） | `curl` 静态 HTML（服务端渲染） |

### 页面 A 原文摘录

> 6.5L Ceramic Air Fryer
> MMAF65
> S$ 119.00
> S$ 319.00
> 62% Off!
> Tax included
> 100% Authentic Product
> …
> Ceramic coating basket with tray
> Temperature: 80 - 200C
> Timer: Up to 60 min
> …
> Model : MMAF65
> Gross Capacity : 6.5L
> Voltage : 220-240V~, 50-60Hz
> Wattage : 1600W
> Product Dimension : L377*W284*H292 mm
> Net Weight : 3.8KGS
> Gross Weight : 4.5KGS
> Safety Mark : 240769-11

### 页面 B 原文摘录

> Tefal Easy Fry POP 5L Air Fryer - Nest (EY2452)
> S$ 119
> was S$ 149
> You Save S$ 30
> …
> The generous 5 L / 1 KG capacity and 10 automatic programs are perfect for delicious, healthy dishes…
> The generous capacity of 5 L / 1 KG is suitable up to 6 people…
> non-stick, dishwasher-safe basket

## 人工确认后的 findings

| # | 规则 | 观察 | 判定层级 | 置信度 | 报告写法（建议） |
| --- | --- | --- | --- | --- | --- |
| 1 | `SG-FOOD-02` reg.37(3) | 页面 A 称「Ceramic coating basket with tray」，是直接接触食物的陶瓷涂层；页面与可见文本均无铅/镉迁移检测报告或符合性声明。 | substantiation | high | 页面以陶瓷涂层接触食物，但未展示铅/镉迁移检测结果。按新加坡《食品条例》reg.37(3)，陶瓷食品器具的铅析出有上限（杯/壶 0.5 µg/ml）；请提供 ISO 6486 或等效检测报告与批次。**需专业审核。** |
| 2 | `SG-FOOD-01` reg.37(2) | 页面 A 只写「Ceramic coating basket」，未写涂层成分、基材（铝/钢）、硅胶支架材质；页面 B 只写「non-stick」。两页均无食品接触符合性声明。 | substantiation | medium | 页面未展示食品接触面的材质与符合性声明。按 reg.37(2)，用于食品烹饪的器具不得可能析出铅、锑、砷、镉等有毒物质；请提供涂层与基材说明、食品接触检测报告。**需专业审核。** |
| 3 | `SG-ADV-09` Sch2 item 9 | 页面 A 同时显示 S$119.00、划线 S$319.00 与「62% Off!」，未给原价的有效期间或价格历史；页面 B 显示「was S$149 / You Save S$30」。 | human_review | medium | 页面以「原价 S$319 → 现价 S$119（62% Off）」作价格优势表述。CPFTA 第二附表第 9 项要求该价格优势真实存在；请提供促销前实际售价与持续时间（含截图或后台记录）。在核实前不判断折扣真假。 |
| 4 | `SG-ADV-02` s.4(b) | 页面 A 写「100% Authentic Product」，未说明授权渠道或防伪依据。 | substantiation | medium | 页面使用「100% Authentic」的绝对化表述；按 CPFTA s.4(b)，此类声称需有依据（品牌授权书、进货凭证）。请提供授权链证明。 |
| 5 | `SG-APP-01` / `SG-APP-04` / `SG-APP-06` reg.4(1)、reg.13(1) | 页面 A 展示「Safety Mark : 240769-11」，说明商家主动披露了注册编号；但页面本身无法验证该编号对应的注册商品是否为本型号。页面 B 全文未出现 Safety Mark 或注册编号。 | rule_level（A：正向）/ 需核实（B） | medium | A：页面展示了 Safety Mark 编号 240769-11，需在 CPSO 注册系统核对该编号是否覆盖 MMAF65 型号。B：页面未展示 Safety Mark 或 CPSO 注册编号；按 CPSR reg.4(1)，受管制商品在供应或为供应而广告前须注册并贴标，请向商家索取注册记录。**不得据此推断「未认证」。** |
| 6 | `SG-PRICE-01` reg.77(1) | 页面 A 标价旁写「Tax included」，属已含 GST 的展示；页面 B 只写「S$ 119」与「SGD」，全文无 GST 说明。 | rule_level（A：满足）/ 需核实（B） | medium | A：价格已标注含 GST，符合 reg.77(1) 的展示要求（仍需确认商家 GST 注册状态）。B：页面未说明标价是否含 GST；请向商家核实 GST 注册状态与结算页最终价格，不得仅凭缺失判定违规。 |
| 7 | `SG-MET-03` s.19(2) | 页面 A 同时给出 Gross Capacity 6.5L、Net Weight 3.8KGS、Gross Weight 4.5KGS，区分了净重与毛重；页面 B 用「5 L / 1 KG」描述容量，未说明 1 KG 指什么。 | rule_level（A：满足）/ 需核实（B） | medium | A：规格区分净重/毛重，未见数量表述矛盾（页面数值仍需实测）。B：「5 L / 1 KG」并列但未说明 1 KG 的口径（食材装载量？净重？），建议要求商家给出容量与载重定义，避免消费者误解。 |
| 8 | `SG-PRIV-01` / `SG-PRIV-04` s.20(1)、s.12 | 页面 A 页脚有 Privacy Policy 链接、邮箱与电话，newsletter 表单写「Be the first to hear about new products and sales」；页面 B 页脚亦有 Privacy Policy。 | rule_level | medium | newsletter 收集邮箱前已给出用途说明，方向正确；仍需确认表单提交页是否有 PDPA s.20 的完整目的告知与业务联系人。 |

合计 8 条 findings：食品接触 2 条（均需专业审核）、价格/折扣 2 条（1 条需人工复核）、准入 1 条（A 正向 / B 需核实）、GST 展示 1 条、计量 1 条、隐私 1 条。

## 已检查但未触发（正向对照）

| 规则 | 页面 A | 页面 B |
| --- | --- | --- |
| `SG-MET-01` s.18(1)(d) | 全部公制（L、mm、kg、W、V），无非公制单位 → 未见问题 | 5 L、1 KG 均为公制 → 未见问题 |
| `SG-PRICE-02` reg.77(2) | 只展示一个含税价，没有并列不含税价 → 不触发 | 同左 |
| `SG-FOOD-03` reg.13(2) | 未见赠品/抽奖电器 → 不触发 | 页面有「Spin & Bao」活动文案，但赠品内容未在页面说明 → 记录为观察项，不判定 |
| `SG-MKT-01/02` SCA | 页面为商品页，非批量电子讯息 → 不触发 | 同左 |
| `SG-PRIV-05`~`08` PDPA DNC | 页面无短信/电话营销入口 → 不触发（WhatsApp 分享按钮不构成营销发送） | 同左 |

## 误报（naive 关键词匹配，全页文本）

把 `claim_pattern` 直接对整页可见文本做子串/词边界匹配，页面 A 命中 15 条规则、页面 B 命中 11 条，**人工复核后只有 5 条能转成 finding（#3–#7）**，其余是导航、促销条、页脚与评价模块造成的误报。典型误报：

| 页面 | 规则 | 命中词 | 实际上下文 | 原因 |
| --- | --- | --- | --- | --- |
| A | `SG-APP-01` | `air fryer` | 左侧分类导航「Air Fryers」 | 品类词出现在导航，不是被审商品 |
| A | `SG-ADV-05` | `new` | 「Get 5% OFF for NEW USER only」 | 站点促销条，不是商品新旧表述 |
| A | `SG-ADV-08` | `free` / `voucher` | 「FREE DELIVERY」「unlock the voucher」 | 全站促销条与 newsletter 激励 |
| A | `SG-ADV-10` | `review` / `news` | 商品评价模块、Newsletter | 页面结构词 |
| A | `SG-PRIV-01` | `subscribe` / `account` | 「SUBSCRIBE NOW」页脚、登录入口 | 有入口 ≠ 满足 s.20 告知内容 |
| B | `SG-ADV-01` | `best` / `guaranteed` | 站点导航与保修文案（「Best Denki」类目、warranty） | 未做上下文与实体消歧 |
| B | `SG-APP-01` | `microwave` / `vacuum` | 推荐位与分类导航 | 被审商品是空气炸锅 |
| B | `SG-ADV-07` | `was s$` / `save` | 「was S$149 / You Save S$30」 | 这**是**有效命中，但需价格历史才能判断，不能直接下结论 |

**结论**：`claim_pattern` 只能当线索。接入时必须先抽取「商品主面板 + 规格表」，去掉导航、推荐位、页脚全站文案与评价模块，并对 `new/free/best/capacity` 这类高频词做上下文校验。

## 漏报

| 情况 | 说明 | 建议 |
| --- | --- | --- |
| 陶瓷涂层的铅镉风险 | `SG-FOOD-02` 只命中「ceramic」；若页面写「stone coating」「mineral coating」则不命中 | 扩充材质同义词，并由结构检查器读取规格表的 Material 字段 |
| Safety Mark 编号真伪 | `SG-APP-04` 只检查页面有无「Safety Mark」字样；编号是否覆盖该型号需查 CPSO 注册系统 | 接入 CPSO 公开查询或要求商家上传注册记录，不靠关键词 |
| GST 含税说明 | `SG-PRICE-01` 的 pattern 只覆盖「before GST / excl. GST」等否定式；页面完全不提 GST 时不会命中 | 由结构检查器判断「价格区块是否有 tax 说明」 |
| 赠品电器 | 页面 A 的促销活动可能含赠品，但赠品内容不在商品页 | 需读取活动页；否则只记为观察项 |
| 折扣原价真实性 | 划线价是否存在过、持续多久，页面无法证明 | 需要商家后台价格历史或第三方价格追踪 |

## 对规则库的回写

- 本次未改 `claim_pattern` 的匹配逻辑（规则库只提供线索，匹配器由产品侧实现）。
- 新增规则后被真实页面命中的：`SG-FOOD-01`、`SG-FOOD-02`、`SG-PRICE-01`、`SG-MET-03`、`SG-ADV-09`，说明食品接触/计量/价格三块缺口确实会在小家电页面出现。
- `SG-PRICE-02`、`SG-MET-01`、`SG-MKT-01/02`、`SG-PRIV-05~08` 在这两个页面未触发，属正常（需要并列含税价、非公制单位、批量讯息或营销发送才会命中）。

---

## 2026-11-17 复核与新增样例（RAY-720）

### 页面 A 复抓（Mayer SG，用于确认旧 findings 仍成立）

| 项目 | 2026-11-14 | 2026-11-17 |
| --- | --- | --- |
| URL | https://mayer.sg/products/mayer-6-5l-ceramic-air-fryer | 同左 |
| HTTP | 200 | 200 |
| HTML | 384,715 bytes / `0b255193…b840` | 377,031 bytes / `36208f72…da1` |
| 可见文本 | 4,770 字符 | 3,869 字符 |

HTML 哈希与文本长度变化来自评价/推荐模块的动态注入；**正文关键项未变**：`Safety Mark : 240769-11`、`Gross Capacity : 6.5L`、`Net Weight : 3.8KGS`、`S$ 119.00`、`S$ 319.00`、`62% Off!`、`Ceramic coating basket`。上表 #1-#8 的 findings 与误报/漏报结论继续成立，未发现需要撤回的条目。

### 页面 C（新样例，3C 数码）

| 项目 | 内容 |
| --- | --- |
| URL | https://www.xiaomi.com/sg/product/redmi-buds-6-pro/ |
| 页面 | Xiaomi 新加坡 — Redmi Buds 6 Pro（蓝牙耳机） |
| 取回时间 | 2026-11-17 14:40（UTC+8） |
| HTTP | 200 |
| 原始 HTML | 134,737 bytes；SHA-256 `d4bc6ab91787375e585092a784d56a42db1c4756c664d599567d4872a861d082` |
| 可见文本 | 11,931 字符（`BeautifulSoup` 去 script/style 后） |
| 抓取方式 | `curl` 静态 HTML（服务端渲染；页面为产品介绍页，「Buy Now」跳转购买，无标价） |

原文摘录：

> Elevate every beat
> Certified Hi-Res Audio with LDAC
> Up to 55dB active noise cancellation with multi-level adjustments*
> Built-in dimensional audio with head tracking*
> IP54 …
> *Active noise cancellation test data provided by the National Institute of Metrology, China.
> *IP54 water-resistance test: The earbuds passed the test conducted by TÜV SÜD Certification and Testing (China) …

### 页面 C 的 findings

| # | 规则 | 观察 | 判定层级 | 置信度 | 报告写法（建议） |
| --- | --- | --- | --- | --- | --- |
| 9 | `SG-APP-07` reg.20(1) | 页面在售蓝牙耳机（`Bluetooth`、`LDAC`、无线连接），属新加坡无线电通信设备；全文无 IMDA 注册号、无注册声明、无包装/标签图。 | rule_level（需核实） | high | 页面在售蓝牙耳机。按新加坡《电信（经销商）条例》reg.20(1)，该型号须先经 IMDA 注册才可销售；请提供 IMDA 注册号与有效期（注册 5 年）。**页面未展示不等于未注册，需在 IMDA 系统核实。** |
| 10 | `SG-APP-08` Sch2 para 8(a)/(e) | 页面未展示 IMDA 合规标签，也无说明书/包装的标签照片。 | rule_level（需核实） | medium | 已注册设备在展示或要约销售前须在设备、说明书或包装上贴 IMDA 指定标签；请提供标签照片与注册号，核对是否覆盖本型号。 |
| 11 | `SG-ADV-02` s.4(b) | 「Certified Hi-Res Audio with LDAC」使用了认证类表述，页面未给出认证机构、证书编号或适用型号。 | substantiation | high | 页面使用「Certified Hi-Res Audio」的认证表述；按 CPFTA s.4(b)，认证类声称需有依据。请提供认证机构（如 Japan Audio Society 的 Hi-Res Audio 认证）、证书编号与覆盖型号。 |
| 12 | `SG-ADV-03` Sch2 item 1 | 「Up to 55dB active noise cancellation」为性能声称；页面同时给出测试来源（National Institute of Metrology, China）与限定条件（特定频段、分别测试），属较规范的披露。 | substantiation（方向正确） | medium | 性能数据已注明测试机构与条件，方向正确；仍需索取检测报告（方法、样品、频段）确认「55dB」与「up to」的口径一致。 |
| 13 | `SG-ADV-02` s.4(b) | 「IP54」旁注明由 TÜV SÜD Certification and Testing (China) 测试，属可核对的第三方测试披露。 | substantiation（方向正确） | medium | IP54 声称已给出测试机构；核对报告编号与型号即可，不必作为高风险项。 |

合计新增 5 条 findings：准入 2 条（均需核实，不得推断未注册）、认证/性能 substantiation 2 条（1 条需补证书、1 条披露较规范）、第三方测试 1 条（正向）。

### 页面 C：误报（naive 关键词匹配）

把 `claim_pattern` 直接对整页文本做子串匹配，页面 C 命中 **18 条**规则；人工复核后只有 **3 条**能转成 finding（#9、#11、#12/#13）。典型误报：

| 规则 | 命中词 | 实际上下文 | 原因 |
| --- | --- | --- | --- |
| `SG-APP-01` | `iron` | 「test equipment and **environ**ment」 | 未做词边界，`iron` 命中 `environment` |
| `SG-ADV-12` | `ce` | 「experien**ce**」「differen**ce**」 | 两字母词无边界，几乎必然误命中 |
| `SG-ADV-01` | `100%` | 「batteries charged to **100%**」 | 测试条件，不是商品性能声称 |
| `SG-ADV-08` | `free` | 「ad-**free** music」「Spotify Premium for **free**」 | 第三方促销，不是本商品赠品 |
| `SG-FOOD-02` | `ceramic` | 「Piezoelectric **ceramic** driver」 | 压电陶瓷发声单元，不接触食物 |
| `SG-APP-10` | `iso` | 「compar**iso**n」 | 未做词边界 |
| `SG-MET-03` | `volume` | 「**volume** adjusted to 50%」 | 音量，不是容量 |
| `SG-ADV-05` | `new` | 「new Spotify Premium users」 | 促销对象，不是商品新旧 |

**结论（更新）**：`claim_pattern` 的噪声在 3C 页面比小家电页面更高（18 命中 → 3 有效），接入前必须：① 词边界 + 实体消歧；② 只取商品主面板、规格表与包装信息；③ 两字母/短词（`ce`、`ul`、`iso`、`l.`）默认关闭子串匹配。

### 页面 C：漏报

| 情况 | 说明 | 建议 |
| --- | --- | --- |
| IMDA 注册状态 | 页面不展示注册号时，`SG-APP-07` 只能给「需核实」，无法自动判定 | 接入 IMDA 设备注册查询（按型号/注册号），或要求商家上传注册记录 |
| 无标价 | 页面为产品介绍页，无价格区块，`SG-PRICE-01/02` 无法评估 | 换用零售 listing 页（如 Harvey Norman / Courts）复测价格类规则 |
| 电池/充电器准入 | 耳机充电盒、充电器可能同时属 CPSR 受管制电气产品，但页面未单列配件型号 | 需要 SKU 级配件清单；当前只记录为观察项 |
| 「Buy Now」跳转页 | 实际成交页在另一个域名，页面信息可能不一致 | 抓取链路需跟随到结算/商品详情页，并记录跳转链 |
