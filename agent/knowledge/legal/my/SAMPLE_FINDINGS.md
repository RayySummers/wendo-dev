# 规则 → finding 样例：真实页面跑通记录

> 目的：验证 `rules.v0.1.json` 能否落到真实页面上，并记录误报/漏报。
> 本文件只记录观察与证据，不构成法律意见，不输出「合法/违法」结论。

## 样例页面

| 项目 | 内容 |
| --- | --- |
| URL | https://www.senheng.com.my/product/joyoung-360-3d-dual-heating-circulation-6-5l-air-fryer-jaf-65f09/ |
| 页面 | Senheng（马来西亚电器零售商）— Joyoung 6.5L 空气炸锅 JAF-65F09 |
| 取回时间 | 2026-11-14 15:41（UTC+8） |
| HTTP | 200 |
| 原始 HTML | 769,134 bytes；SHA-256 `e39901c8a23319fc553595209270beea6677dd182080e966c01ee8459ed19fbb` |
| 可见文本 | 14,271 字符（`BeautifulSoup` 去 script/style 后） |
| 说明 | 页面价格由 JS 延迟渲染；本记录基于静态 HTML + 可见文本，未使用浏览器渲染。 |

页面主面板（原文摘录）：

> 6.5L Digital Touch Screen Visible Air Fryer
> -33%
> Joyoung
> 360 3D Dual Heating Circulation 6.5L Air Fryer JAF-65F09
> SKU: JYO-JAF65F09
> RM 599.00
> From RM49.92 / month
> ...
> Free EXTRA 1 Year Warranty — Enjoy Free Warranty from us! *T&C Apply.
> Nationwide Delivery and Pick in Store — Seamless Experience for Online and Offline. *T&C Apply.
> Description

页脚（原文摘录）：

> Hotline +6011 3600 4040
> Email ccc@senheng.com.my
> Locate our Outlets
> Copyright©️2026 SENHENG ELECTRIC (KL) SDN. BHD. 199401011012 (296691-X) All Rights Reserved

## 人工确认后的 findings

| # | 规则 | 观察 | 判定层级 | 置信度 | 报告写法（建议） |
| --- | --- | --- | --- | --- | --- |
| 1 | `MY-ECOM-06` reg.4(1) | 商品页、页脚、按钮均为英文；未发现马来语版本或语言切换。 | rule_level | high | 页面面向马来西亚消费者的附表信息以英文呈现，未提供国语（马来语）版本；2024 年条例 reg.4(1) 要求以国语披露，建议补充马来语版本并保留英文并列。 |
| 2 | `MY-ECOM-01` Schedule items 1-5 | 公司名、注册号、电邮、电话在页脚可见；页面未见营业地址（仅「Locate our Outlets」链接）；「Description」标签下无商品主要特征文本。 | rule_level | medium | 销售页未直接展示营业地址与商品主要特征（材质、容量、功率、配件等）；需向商家核实地址与规格，并把附表 1-5 项放到销售页可获取的位置。 |
| 3 | `MY-ECOM-03` Schedule items 7-9 | 支付方式（分期/BNPL）与 T&C 链接可见；配送仅写「Nationwide Delivery and Pick in Store」，无预计送达时间。 | rule_level | medium | 页面未给出预计送达/供货时间；附表第 9 项要求 estimated time，建议写明工作日区间与例外（预购、东马）。 |
| 4 | `MY-ECOM-04` + `MY-APP-01` | 页面未展示 ST CoA、SIRIM 或任何电气安全认证信息。 | rule_level | medium | 页面未展示该空气炸锅的电气安全认证/CoA 信息，需向商家核实证书编号与状态；不得据此推断「未认证」。 |
| 5 | `MY-ADV-06` s.12(1) | 页面显示「-33%」与 RM599.00；静态可见文本无原价，HTML 的 `data-regular` 为 RM899.00。 | human_review | low | 折扣率需要可核对的原价与价格历史；静态抓取看不到渲染后的划线价，需浏览器截图 + 促销前后售价记录后再判断。 |

合计：5 条 findings（1 条语言、2 条披露、1 条认证展示、1 条需人工复核的价格指示）。

## 误报（naive 关键词匹配，全页文本）

把 `claim_pattern` 直接对整页可见文本做子串匹配，共命中 30+ 条，**人工复核后 0 条可直接采用**。典型误报：

| 规则 | 命中词 | 实际上下文 | 原因 |
| --- | --- | --- | --- |
| `MY-ADV-02` | `5l` | 「6.5L」 | 子串匹配，未做词边界 |
| `MY-ADV-08` | `free` | 站点横幅「Free Delivery * with RM100」 | 全站导航/促销条，不属于商品页要约 |
| `MY-ADV-12` | `premium` | 推荐位「Premium Garment Steamer」 | 推荐商品，不是被审商品 |
| `MY-ADV-15` | `rm` | 价格符号 | 过短模式 |
| `MY-ADV-17` | `top` | 导航「Top Selling」 | 无上下文 |
| `MY-ADV-18` | `chat` | 「Livechat」 | 子串匹配 |
| `MY-APP-01` | `air fryer` / `kettle` / `blender` | 左侧分类导航 | 商品类别词出现在导航 |
| `MY-3C-02` | `wireless` / `wireless charger` | 导航「Wireless Chargers」 | 被审商品不含通讯模块 |
| `MY-PRIV-01` | `privacy policy` | 页脚链接 | 有隐私政策链接 ≠ 满足 s.7 告知内容 |

**结论**：`claim_pattern` 只能当线索。接入时必须先抽取「商品主面板」，去掉导航、推荐位、页脚全站文案，并对短词做词边界与上下文校验；否则误报率不可接受。

## 漏报

| 情况 | 说明 | 建议 |
| --- | --- | --- |
| `-33%` 折扣徽标 | `MY-ADV-06` 的 pattern 只有 `% off` / `discount` 等词，未覆盖「-33%」这种写法 | 增加正则抽取 `-\d+%`，并要求同页出现原价或「was」价 |
| 营业地址、预计送达、马来语版本 | `MY-ECOM-01/03/06` 是结构性义务，`claim_pattern` 为空数组，不会自动命中 | 由页面结构检查器（字段是否存在、页面语言检测）处理，而不是关键词匹配 |
| 商品材质/食品接触 | 页面未写材质，`MY-FOOD-01/02` 不会命中；但这不等于违反 reg.27/28 | 需实物标签或检测报告；报告中写「页面未展示，需向商家核实」 |
| 「Free EXTRA 1 Year Warranty」 | 未命中 `MY-ADV-08`（赠品规则）；该表述附有 *T&C Apply | 保留为观察项，不自动判定 |

## 对规则库的回写

- 本次未改动 `claim_pattern` 的匹配逻辑（规则库只提供线索，匹配器由产品侧实现）。
- 建议产品侧实现：`product_scope` 抽取 + 词边界 + 结构性检查器（语言、字段存在性）+ 人工复核队列。
- `MY-ADV-06` 建议增加百分比折扣的正则抽取；`MY-ECOM-06` 建议接语言检测（BM/EN 比例）。
- 页面缺失认证信息统一写「页面未展示，需向商家核实」。

## 复现

```bash
curl -sSL --max-time 30 -A 'Mozilla/5.0 ... Chrome/124.0' \
  'https://www.senheng.com.my/product/joyoung-360-3d-dual-heating-circulation-6-5l-air-fryer-jaf-65f09/' \
  -o joyoung.html
sha256sum joyoung.html   # 页面动态，哈希可能随促销/库存变化
```

> 页面内容会随促销变化；上表 SHA-256 只对应 2026-11-14 15:41 的抓取。复核 finding 时以当时的截图与页面为准。
