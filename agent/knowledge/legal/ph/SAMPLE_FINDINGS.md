# 规则 → finding 样例：真实页面跑通记录（菲律宾）

抓取时间：2026-11-17（UTC 06:43）。规则版本：`rules.v0.1.json`（37 条）。
匹配方式：`claim_pattern` 小写子串 + 词边界（`(?<![a-z0-9])pattern(?![a-z0-9])`），跑在「商品页全文 + 搜索结果页 28 个商品名」上。这是最朴素的跑法，目的就是暴露误报。

## 样例页面

| | 页面 A（商品详情页 PDP） | 页面 B（搜索结果页） |
| --- | --- | --- |
| URL | `https://shop.wilcon.com.ph/18in-industrial-stand-fan-0933.html` | `https://shop.wilcon.com.ph/catalogsearch/result/?q=electric+fan` |
| 站点 | Wilcon Depot 官方网店（菲律宾大型家居建材零售商） | 同上 |
| 快照大小 | 296,014 bytes | 453,172 bytes |
| SHA-256（快照） | `2909401c41c2f612f7e82552eb99b261e13b762f19162d8956a1f8a9f62f64f0` | `95e7cd09d822a5917d8fe4278d82118a0d68de3acb6aa1a827ad82299d91c553` |
| 页面性质 | 服务端渲染，商品规格表可直接读到 | 服务端渲染，商品名与价格在 HTML 中 |

> 说明：这是菲律宾本地零售商的页面，用来验证「规则能否在真实菲律宾电商页面上跑通」。跨境中国卖家页面的结构不同（多为独立站 + 英文文案），误报分布会更接近页面 A 的正文部分。快照哈希仅记录本次抓取的字节，页面随时会变，不作版本凭证。

### 页面 A 原文摘录（规格表，逐字）

```
SKU            959800000933
Application    Floor Standing
Brand          Kaze
Finish         Glossy
Material       Metal
Series         Kabe Series
Unit of Measurement  Pc
Size           18in
ICC No.        A581643624
Wattage        90W
Voltage        220V
Model Number   Fsw-45b
```

价格：`₱2,430.00`；标题：`Kaze Kabe 18in Industrial Stand Fan Black`；副标题：`KAZE/KW FSW-45B 18IN CHROME/BLACK INDUSTRIAL FAN`；另有 `ICC Certificate` 链接。
页脚：`(02) 8 8945266`、`Privacy Notice`、`Pricing Policy`、`Product Warranty`、`Terms of Use`、`Certificate Of Registration`、`Store Locations`、`© 2026 WILCON DEPOT`；另有一处 `Subscribe to our newsletter and be the first to hear our special offers!`。

## 人工确认后的 findings

### F1 — PH-CERT-01（ICC 展示）：**未触发，正向对照**

页面展示了 `ICC No. A581643624` 并提供 `ICC Certificate` 链接。按 BPS 制度，列入强制认证清单的产品未取得 ICC/PS 不得分销；本页属“已展示认证信息”。

- 报告写法：`该电风扇属 DTI-BPS 强制认证清单第 1 项“Electric fans”。页面展示了 ICC 编号 A581643624，可在 BPS 清单核验；证书是否覆盖该型号与批次仍需向商家索取。`
- 注意：不得因为“编号看起来合规”就写“已认证”；本工具无法在线核验 BPS 数据库。

### F2 — PH-LAB-01（标签信息）：**触发（页面层缺口，medium）**

规格表列了 SKU、品牌、型号、功率、电压、尺寸、ICC，但**没有制造国（country of manufacture），也没有菲律宾进口商/制造商名称与地址**。Art. 77 要求这两项出现在标签/包装上。

- 报告写法：`该商品页未展示制造国与在菲律宾的进口商名称及地址（RA 7394 第 77 条要求在标签上标明）。这是页面层缺口，实物包装是否标注需向商家核实。`
- 判定：不作为违规结论。`decision_level=rule_level` 但证据只到页面层，因此输出为“需核实”。

### F3 — PH-ECOM-01（身份披露）：**可能触发（human_review）**

页脚给出了商号（`WILCON DEPOT`）与电话（`(02) 8 8945266`），但**营业地地址与电子邮箱不在本页**（地址藏在 `Store Locations` 链接后，邮箱未出现）。ITA s.23(f)(1) 要求首页公布“实体店铺/营业地地址 + 含手机或座机与有效邮箱的联系方式”。

- 两种读法都成立：(a) 门户类电商把地址放在“门店位置”页、把邮箱放在“联系我们”页，仍属“首页可合理获取”；(b) 严格按条文，s.23(f)(1) 要求的是“在首页公布”。
- 因此标 `human_review`，报告写“需人工确认”，不直接下结论。

### F4 — PH-DPA-01（隐私告知）：**触发（newsletter 场景，human_review）**

`Subscribe to our newsletter and be the first to hear our special offers!` 旁边没有指向隐私告知的链接或说明文字。按 DPA s.16(b)，在个人信息进入处理系统前应告知 8 项内容；订阅营销邮件**不落入**“履行合同所必需/明显目的”的例外（结账收货信息才落入）。

- 报告写法：`订阅入口旁未见到隐私告知或指向告知页的链接。根据 RA 10173 第 16(b) 条，营销订阅不属于“履行合同所必需”的例外，需向商家确认订阅时的告知与同意流程。`
- 同时记录：页脚存在 `Privacy Notice` 链接（说明站点层面有告知页），因此**不能**写“无隐私政策”。

### F5 — PH-LAB-04 / PH-LAB-05（标价）：**未触发，正向对照**

价格以 `₱2,430.00` 呈现，比索符号 + 分位，单位价格清晰，符合 Art. 81（公开标示价格）与 Art. 82（以比索与分标价）的形式要求。结算页是否加价未测（属 Layer 3）。

## 误报（naive 关键词匹配，全页文本）

| 规则 | 命中片段 | 命中处 | 结论 |
| --- | --- | --- | --- |
| PH-ADV-05（new） | `new` ×3 | 导航 `New`、`New Year's Day`（营业时间说明） | **误报**：既非商品状态声明，也与商品无关 |
| PH-ADV-06（sale） | `sale` ×2 | 导航 `SALE`、页脚 `After-Sale Service` | **误报**：分类名与服务名 |
| PH-ADV-07（warranty） | `warranty` ×2 | 页脚 `Product Warranty` 链接 | **误报**：是政策页入口，不是对本品保证范围的声称 |
| PH-LAB-06（icc） | `icc` ×2 | 规格表 `ICC No.` 与 `ICC Certificate` | **误报**：这是 PH-CERT-01 的证据，不是“冒用 PS 标志” |
| PH-DPA-01（subscribe/newsletter） | `newsletter`、`subscribe` ×3 | 订阅框 | 命中即 F4，属真阳性，但需人工确认告知流程 |

**结论**：5 类命中里 4 类是导航/页脚噪声，1 类是真问题。若直接把 `claim_pattern` 跑全页文本，误报率约 80%（4/5 条规则命中为误报）。实践上必须先把匹配范围限制到「商品标题 + 主图区 + 商品描述 + 价格模块 + 规格表」，再对导航/页脚做白名单剔除。

## 漏报

1. **NTC 型号核准**：该商品是插电风扇（非无线），未触发；但同站的 WiFi 类 3C 会需要的 NTC type approval 在 v0.1 无规则可跑（来源 403，见 SOURCES.md）。
2. **“Industrial”**：标题与副标题都用了 `INDUSTRIAL`，本库刻意未把 `industrial` 放进任何 `claim_pattern`——它是用途描述而非质量等级，放进去只会制造误报。
3. **能效**：`90W` 只是功率参数，页面无“节能”声称，因此 PH-ADV-17 未触发；若换成“energy saving 40%”则应命中。
4. **促销**：本页无促销，PH-ADV-12/13 无适用对象——这是“规则存在但页面无触发点”，不是漏报，记录在此以免被误读为覆盖不足。

## 对规则库的回写

1. `PH-ADV-05/06/07` 的 `notes` 需补充导航/页脚噪声提示（已在 README 第七节列出）。
2. `PH-LAB-06` 与 `PH-CERT-01` 的 `icc` 关键词重叠，建议在诊断实现里把 LAB-06 的匹配范围限定到「标志/贴纸」相关表述（`ps mark`、`ps certified`），避免把 ICC 编号当成冒用标志。
3. `PH-DPA-01` 的 `claim_pattern` 命中订阅框是有效的，但产出 finding 前必须检查“订阅入口附近 200 字符内是否有隐私告知链接”。
4. 建议 v0.2 增加一条“页面层未展示进口商信息”的 `evidence_gap` 类型，避免每次都要在报告里手写同一句话。
