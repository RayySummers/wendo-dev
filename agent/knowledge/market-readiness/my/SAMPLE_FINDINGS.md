# 市场就绪度：真实页面跑通记录（v0.1，马来西亚）

> 目的：验证 8 条页面就绪检查能不能落到真实页面上，并记录**误报 / 漏报**。
> 本文件只记录「页面有没有写到」，不判断认证真伪、不判断合规，也不输出「合法 / 违法」结论。
> 口径见同目录 `README.md`，实现在 `agent/src/market-readiness/analyze.ts`。

## 样例页面

| 项目 | 页面 A | 页面 B |
| --- | --- | --- |
| URL | `https://www.senheng.com.my/product/joyoung-360-3d-dual-heating-circulation-6-5l-air-fryer-jaf-65f09/` | `https://bears.com.my/` |
| 类型 | 马来西亚电器零售商商品详情页（Joyoung 6.5L 空气炸锅） | 品牌站首页（Bear 小熊电器马来西亚） |
| 品类参数 | `small_appliances` | `small_appliances` |
| 取回时间 | 2026-11-14 22:13（UTC+8） | 2026-11-14 22:25（UTC+8） |
| HTTP | 200 | 200 |
| 原始 HTML | 769,134 bytes；SHA-256 `e39901c8a23319fc553595209270beea6677dd182080e966c01ee8459ed19fbb` | 未单独留档（首屏动态内容较多） |
| 可见文本 | 13,616 字符 | 2,590 字符 |
| 说明 | 价格由 JS 延迟渲染，本记录基于静态 HTML 的可见文本；未使用浏览器渲染 | 首页商品墙价格可见，规格/电压不在首页 |

页面 A 的 HTML 哈希与 `knowledge/legal/my/SAMPLE_FINDINGS.md` 的抓取一致（同一次抓取口径），
所以两份记录指向同一份页面内容。

## 结果总览

| checkId | 检查 | 页面 A | 页面 B |
| --- | --- | --- | --- |
| MY-MR-01 | 英语变体一致性 | `present` | `present` |
| MY-MR-02 | 货币与价格呈现 | `needs_review` | `needs_review` |
| MY-MR-03 | 计量单位（公制） | `present` | `present` |
| MY-MR-04 | 电压与插头 | `missing` | `missing` |
| MY-MR-05 | 本地联系方式 | `present` | `needs_review` |
| MY-MR-06 | 配送、退换与保修 | `needs_review` | `needs_review` |
| MY-MR-07 | 本地支付方式 | `needs_review` | `missing` |
| MY-MR-08 | 认证标志展示 | `missing` | `present` |

两页都是：已展示 3、未展示 2、需复核 3、不适用 0。

## 页面 A：Senheng 商品页（Air Fryer JAF-65F09）

| checkId | status | quote（原文） | 观察 |
| --- | --- | --- | --- |
| MY-MR-01 | present | `6.5L Dual Heating Air Fryer JAF-65F09 \| Senheng` | 全页英文，未命中美式拼写，也没有中文残留 |
| MY-MR-02 | needs_review | `RM` / `599.00`（跨行） | 用 RM 标价，但页面没有 SST/GST 含税或未税说明 |
| MY-MR-03 | present | `6.5L` | 商品标题带公制容量；无英制混用 |
| MY-MR-04 | missing | （空） | 商品面板没有电压/频率与插头类型 |
| MY-MR-05 | present | `+6011 3600 4040` | 页脚有本地手机号与工作时间 `9.30am - 6.30pm` |
| MY-MR-06 | needs_review | `Nationwide Delivery and Pick in Store` | 有配送与保修句，缺退换地址/期限 |
| MY-MR-07 | needs_review | `0% Interest up to 60 months` | 只写分期/BNPL，没有 FPX / 本地银行 / 本地钱包 |
| MY-MR-08 | missing | （空） | 页面没有 SIRIM / Safety Mark 字样；**只记录未展示，不代表未认证** |

补充：`RM 599.00` 在抓取文本里是 `RM` 与 `599.00` 两行，引用保留换行，仍是原文子串。

## 页面 B：bears.com.my 首页

| checkId | status | quote（原文） | 观察 |
| --- | --- | --- | --- |
| MY-MR-01 | present | `Bear Malaysia - Home Appliances \| Cookware` | 英文页面，无美式拼写与中文残留 |
| MY-MR-02 | needs_review | `RM132.60` | 商品墙用 RM 标价，没有含税/未税说明 |
| MY-MR-03 | present | `1.7L` | 商品卡带公制容量 |
| MY-MR-04 | missing | （空） | 首页没有电压/插头信息 |
| MY-MR-05 | needs_review | `03-456 7554` | 有本地电话，但没有营业地址与工作时间 |
| MY-MR-06 | needs_review | `All our products come with a 1-year warranty, backed by our local team in Malaysia…` | 只有保修句，缺配送范围/时效与退换期限 |
| MY-MR-07 | missing | （空） | 首页没有支付方式 |
| MY-MR-08 | present | `…Each unit is certified by SIRIM Malaysia, ensuring compliance` | 展示了 SIRIM 字样；**不核验证书真伪** |

## 开发中修掉的误报（已加回归测试）

| 误报 | 触发 | 修法 |
| --- | --- | --- |
| 把 `RM 0.00`（购物车小计）当成商品价格 | 页面顶部 `0 items / RM / 0.00` 先于商品报价出现 | 价格锚点跳过 0.00，并优先紧邻 SKU / 加购按钮的报价 |
| 把站点横幅 `Free Delivery * with` 当成配送承诺 | 横幅被拆成多行，首行看起来像句子 | 悬空介词/连接词结尾的碎片行不算句子 |
| 把页脚菜单 `Credit Card Installment` 当支付方式证据 | 导航链接也是完整短语 | 支付方式只认「像句子」的行 |
| 推荐位 `Samsung 75-inch Neo QLED` 被当成被诊商品的英制规格 | 整页扫描 | 商品主面板以价格锚点为界，向后止于 `Recommended Product` |
| 分类导航 `Wireless Chargers` / `Big TV 75-inch & above` 命中品类词 | 整页扫描 | 同上：商品级检查只读主面板；整页检查只看句子 |
| `Delivery` / `Returns & Refunds` / `Warranty` 页脚链接被当成「已说明」 | 关键词命中 | 短标签（≤6 词、无功能词、无标点）不算证据 |

## 仍然存在的误报 / 漏报（已记录，未在本版修）

| 类型 | 情况 | 影响 | 后续 |
| --- | --- | --- | --- |
| 偏宽松（可能误报 present） | MY-MR-03 只要商品面板出现任一公制单位就记 `present`；页面 A 只有标题里的 `6.5L`，没有规格表 | 会高估「规格写得清楚」 | 后续按「尺寸/容量/功率是否齐全」拆子项，或要求规格区命中 |
| 偏宽松 | MY-MR-06 把站点级配送横幅（`Free Delivery * with RM100 minimum spend`）与 `Nationwide Delivery and Pick in Store` 都算作配送证据 | 零售商的站点政策可能被当成该商品的承诺 | 后续区分「商品级承诺」与「站点级政策」 |
| 偏宽松 | MY-MR-01 的 `present` 可能用页面 `<title>` 作引用（页面 A/B 都是），证据真实但信息量弱 | 读者看到的是标题，不是正文句式 | 后续优先取 ≥ 24 字符的正文句子，标题只作兜底 |
| 漏报（判不了） | 页面 B 的电话 `03-456 7554` 位数不足（本地固话通常 8 位），本层按「存在本地电话」记 `needs_review`，没有判号码格式 | 号码可用性仍需人工确认 | 号码格式校验归合规/可用性规则，本层只记存在性 |
| 漏报（抓不到） | 页面 A 的退换条款在 `Returns & Refunds` 子页，商品页只留链接 | 记 `missing` 是「本页未展示」，不是「商家没有政策」 | 多页/补充上传能力（RAY-683 讨论项）后续再评估 |
| 漏报（品类） | 首页（页面 B）没有电压/插头与支付方式，按 `missing` 记 | 首页不是商品详情页，可能被读成「整站缺失」 | 报告文案已写「本页」，多页能力上线后再补 |

## 稳定性

同一份文本连续跑两遍，`findings` JSON 完全一致（无随机、无时间、无模型参与）：

```
senheng stable: true counts: {"present":3,"missing":2,"not_applicable":0,"needs_review":3}
bears   stable: true counts: {"present":3,"missing":2,"not_applicable":0,"needs_review":3}
```

自动化覆盖见 `agent/test/market-readiness.test.ts`：8 条 ID 唯一、四种状态、导航/页脚不算证据、
商品主面板截取、引用必须是原文子串、同一页两遍一致、无结论性措辞。

## 复现

```bash
# 1) 抓取（与 fetch_page 同一脚本）
python3 agent/scripts/scrape_page.py '<URL>' /tmp/page.json --timeout 30 --no-interface

# 2) 只跑市场就绪度检查（不调用模型）
cd agent && npx tsx -e '
import { readFileSync } from "node:fs";
import { analyzeMarketReadiness } from "./src/market-readiness/analyze.js";
const page = JSON.parse(readFileSync(process.argv[1], "utf8"));
const r = analyzeMarketReadiness({ text: page.text, category: "small_appliances" });
console.log(JSON.stringify(r.counts));
for (const f of r.findings) console.log(f.checkId, f.status, JSON.stringify(f.quote).slice(0, 80));
' /tmp/page.json
```

> 页面内容会随促销变化，复核时以当时的抓取与截图为准；页面 A 的 SHA-256 只对应 2026-11-14 22:13 的抓取。
