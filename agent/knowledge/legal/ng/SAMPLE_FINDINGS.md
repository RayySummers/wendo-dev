# 尼日利亚 v0.1 — 真实页面「规则 → finding」样例

用途：验证 `rules.v0.1.json` 在真实页面上是否可用，并记录**误报 / 漏报**。不是对商家的评价。

## 被测页面

| 项 | 值 |
| --- | --- |
| URL | https://www.slot.ng/ |
| 站点 | SLOT（Slot Systems Limited，尼日利亚 3C / 家电连锁） |
| 抓取时间 | 2026-11-17 |
| 响应 | HTTP 200，770,674 bytes |
| SHA-256 | `03e329a4447ae1536ea96472d830dec3a0b8a48fe659d3d402a004a678d77440` |
| 可见文本量 | 约 14,700 字符（去标签后） |
| 页面特征 | 58 处奈拉价格；「Black Friday」促销标识；「PRE-OWNED / certified refurbished」专区；页脚有公司名、拉各斯地址、电话与 Privacy Policy 链接；全页无 SONCAP / NCC / 能效标签字样 |

复现：

```bash
curl -sSL -A 'Mozilla/5.0' 'https://www.slot.ng/' -o slot_home.html
sha256sum slot_home.html
```

## 规则命中与判定

| 规则 | 命中数 | 命中示例 | 判定 | 理由 |
| --- | --- | --- | --- | --- |
| NG-PRC-01（展示价格） | 结构判定 | 58 处 `₦` 价格，列表页与专区页均标价 | **通过（无 finding）** | 商品列表均展示奈拉价格，满足 s.115(1) 的可观察部分 |
| NG-LAB-03（二手/翻新标示） | 14 | `PRE-OWNED APPLE IPHONE 13 PRO 256GB ₦612,200`、`certified refurbished iPhones` | **通过（无 finding）** | 页面把翻新机单独归入 PRE-OWNED 专区并逐条标注，s.117 的可观察要求已满足 |
| NG-LAB-01（trade description） | 9 | `genuine technology`、`Original Phones` | **不判定（避免误报）** | 属品牌自我描述，页面未出现与事实矛盾的信息；词表命中不等于误导 |
| NG-ADV-01（一般营销标准） | 7 | `Most Trusted Store`、`best prices`、`perfect for homes` | **需专业审核（human_review）** | 整体印象类表述，须结合价格比较与市场地位判断，不能由词表下结论 |
| NG-ADV-03（虚假背书/授权） | 1 | `official manufacturer's warranty, certified authenticity` | **finding（低严重度）** | 页面主张「官方保修 + 认证正品」，需索取品牌授权书与保修条款；未取得前只能写「需核实」 |
| NG-LAB-04（标签可追溯） | 结构判定 | 页脚仅有卖家 `Slot Systems Limited, 203 Obafemi Awolowo Way, Ikeja, Lagos`，商品区块无制造商/进口商信息 | **finding（低严重度）** | s.134 要求商品可追溯到制造商/进口商/分销商；页面层面缺失，写作「页面未展示，需向商家核实」 |
| NG-CRT-01（SONCAP） | 结构判定 | 全页无 SONCAP / Product Certificate 字样 | **资质提示，不作结论** | 报告写「页面未展示 SONCAP 信息，需向商家核实」，不推断未认证 |
| NG-CRT-04（NCC 型式认可） | 结构判定 | 全页无 type approval 相关信息 | **资质提示，不作结论** | 同上；手机/路由器类目适用 |
| NG-CRT-03（能效标签） | 3（全部误报） | `Hisense Split AC 1.5HP Inverter`、`Midea Inverter Chest Freezer` | **误报** | `inverter` 是产品名/技术名，不是能效宣称；说明该条 `claim_pattern` 需排除型号词 |
| NG-ADV-05（施压/稀缺） | 0 | — | **漏报候选** | 页面用「Black Friday」做限时促销但无倒计时/截止时间，未触发词表；是否构成 s.124 的压力需人审 |
| NG-PRC-02（结算价一致） | 不可判 | 首页不展示结算页 | **结构性漏报** | 需进入购物车流程抓取；首页样本覆盖不到 |
| NG-PRV-04（收集前告知） | 不可判 | 页脚存在 `Privacy Policy` 链接，订阅框未就地提示 | **需专业审核** | 只能观察到链接存在，内容与「收集点告知」是否满足 s.27 需读政策全文 |
| NG-PRV-03（预勾选同意） | 0 | 订阅框为邮箱 + SUBSCRIBE，无预勾选 | **通过（无 finding）** | 未见「继续浏览即同意」类文案 |

## 误报 / 漏报汇总

**误报（2 类）**

1. `inverter`（NG-CRT-03）：产品型号词被当作能效宣称。修正方向：把 `claim_pattern` 收窄为 `energy saving`、`saves up to`、`a+++` 等，或在匹配前剔除型号串。
2. `genuine` / `original`（NG-LAB-01）：尼日利亚电商的高频品牌词，单独命中没有信息量。修正方向：NG 的此类命中降级为「信息项」，只有与实物/授权信息冲突时才升级。

**漏报（3 类）**

1. 「Black Friday」类限时促销没有进入 NG-ADV-05 的触发词，也没进 NG-ADV-01。建议 v0.2 增加促销类触发词，但一律 `human_review`。
2. NG-PRC-02 需要结算页样本，单页抓取天然漏报；接入时应至少抓「列表页 + 详情页 + 购物车」三段。
3. NG-LNG-01 / NG-PRV-04 是文本质量判断，`claim_pattern` 为空，纯靠人工；当前流程里不会自动出现在 finding 列表，需要在报告侧显式加一条「不可自动判断项」。

## 结论

- 26 条规则中，**能在单页上自动形成 finding 的只有 2 条**（NG-ADV-03、NG-LAB-04），其余要么通过、要么需要多页/多轮抓取、要么属于人审。
- 这与 AU/MY 的经验一致：**rule_level 的价值在于「把结论钉到条文」，不在于提高自动发现数量**。尼日利亚尤其如此，因为认证类规则的关键证据（SONCAP / NCC 证书）根本不在页面上。
- 接入时建议把 NG 的 finding 分成三档：`文案风险`（ADV/LAB）、`资质待核`（CRT）、`不可自动判断`（LNG/PRV 的可读性与告知）。
