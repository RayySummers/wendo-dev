# 合规与风险 v0.1（马来西亚）判定口径

> 数据源：`agent/knowledge/legal/my/rules.v0.1.json`（RAY-689 定稿，45 条 / 9 部法规）。
> 代码：`agent/src/compliance/`。本文件说明「哪 17 条能判、怎么判、剩下的为什么不判」，
> 不改规则内容，也不新增法条。

## 三档判定（沿用规则库，代码不改写）

| `decision_level` | 报告里的写法 | 什么时候出 |
| --- | --- | --- |
| `rule_level` | 规则直判 | 页面上能直接看到该条规则所规范的行为要素（宣称政府批准、限量却不写数量、整页没有国语版本…），且规则库有明确条文 |
| `substantiation` | 需事实核实 | 页面出现可核对的事实性声明（材质、容量、原产地、认证、检测、折扣率），只能写「需要证明」，不判真假 |
| `human_review` | 需人工判断 | 绝对化用语、安全承诺这类要看整体语境的表述，只标「需人工判断」 |

- `review_required`：规则库标了 `true` 的一律保留；`high` 级与 `human_review` 默认也标 `true`，
  报告页与 PDF 显示「需专业审核」。
- 输出不含「合法 / 违法 / 保证通过 / 已认证」等判决式措辞；缺席类检查只写「页面未展示」，
  并注明「不等于商家没有」。
- 同一页同一规则只出一条；同一句 + 同一层级的多个规则合并成一张卡，其余条文写进 `evidence`；
  跨层级不合并（否则会吞掉其中一档），各自成条并互相引用。

## 可判定子集（17 条）

| 规则 | 判定 | 严重度 | 取证范围 | 判定依据 |
| --- | --- | --- | --- | --- |
| `MY-ADV-01` | human_review | low | 整页句子行 | 绝对化/最高级：`100%`、`guaranteed`、`safest`、`best in`、`no.1`… |
| `MY-ADV-02` | substantiation | medium | 商品区 | 材质/等级：`stainless steel`、`ceramic`、`food grade`、`grade a`、`304/316`… |
| `MY-ADV-04` | substantiation | medium | 整页句子行 | 认证/背书：`SIRIM`、`certified`、`approved`、`lab tested`、`award winning`… |
| `MY-ADV-05` | substantiation | medium | 商品区 | 原产地：`made in`、`designed in`、`imported from`、国名 + 产地动词 |
| `MY-ADV-06` | substantiation | medium | 商品区 | 价格指示：`was RM`、`original price`、`% off`、`discount`，另有 `-33%` 正则 |
| `MY-ADV-07` | rule_level | medium | 商品区 | 可得性：`from RM`、`as low as`、`while stocks last`…（分期月供排除） |
| `MY-ADV-08` | rule_level | medium | 商品区 | 赠品/返现：`free gift`、`gift`、`cashback`、`voucher`（赔偿语境排除） |
| `MY-ADV-09` | rule_level | medium | 商品区 | 限量：同一屏没有最大数量/期间才出 |
| `MY-ADV-11` | human_review | medium | 商品区 | 安全承诺：`safe`、`overheat(ing)`、`fireproof`、`child lock`… |
| `MY-ADV-13` | substantiation | medium | 整页句子行 | 第三方检测：`tested by`、`SGS`、`TUV`、`certified by`…（退货流程排除） |
| `MY-ADV-14` | substantiation | medium | 商品区 | 比价：`RRP`、`cheaper than`、`market price`… |
| `MY-ADV-16` | rule_level | high | 整页句子行 | 政府批准：`government approved`、`KKM/MOH/JAKIM approved`… |
| `MY-APP-03` | substantiation | medium | 整页句子行 | 测试报告/CoC：`test report`、`certificate of conformity`、`IEC 60335`… |
| `MY-FOOD-02` | substantiation | medium | 商品区 | 陶瓷/铅镉：`ceramic`、`lead free`、`cadmium free`… |
| `MY-HALAL-01` | rule_level | high | 商品区 | 声称 halal 但整页没有 JAKIM/证书编号 |
| `MY-PRIV-01` | rule_level | medium | 整页 | 有订阅/登录/结账入口但整页没有隐私告知 |
| `MY-ECOM-06` | rule_level | high | 整页 | 整页马来语标记 0 命中（英文页） |

## 不判定的 28 条与原因

| 分组 | 规则 | 原因 |
| --- | --- | --- |
| 需要先证明陈述是假的 | `MY-ADV-03`、`MY-ADV-12`、`MY-ECOM-05` | 翻新当新机、虚假商品说明、假注册号：页面文本无法自证真假 |
| 认证状态要用证书库核对 | `MY-ADV-10`、`MY-APP-01`、`MY-APP-02`、`MY-APP-04`、`MY-3C-01`…`MY-3C-06`、`MY-ECOM-04`、`MY-HALAL-02` | 页面缺失不等于未认证；认证展示部分由市场就绪度 `MY-MR-08` 记录 |
| 披露/主体义务，单页不可判定 | `MY-ECOM-01/02/03/07/08`、`MY-ADV-15`、`MY-HALAL-03`、`MY-FOOD-03`、`MY-PRIV-02/03` | 地址、运费、退换、平台责任、DPO：需要主体资料；支付/物流/退换已由市场就绪度覆盖 |
| 与已判定规则重复或需额外检测 | `MY-ADV-17`、`MY-ADV-18`、`MY-FOOD-01` | 同一表述由 `MY-ADV-01/02` 覆盖；客服口头说明与迁移检测不在单页文本内 |

跳过清单在 `src/compliance/rules.ts` 的 `COMPLIANCE_SKIP_REASONS`，`uncoveredRuleIds()` 会
检查「规则库里既没 matcher 也没记跳过原因」的规则并直接报错，避免静默丢规则。

## 取证范围

1. **商品主面板**：以价格或 SKU 为锚点向上 10 行 / 向下 70 行，止于推荐位；导航与分类菜单
   （`Wireless Chargers`、`Premium Garment Steamer`）不参与取证。紧贴价格上方 12 行内的
   折扣徽标（`-33%`）并入。
2. **详情区**：从第一个 `Description / Specifications / Product Assurance` 标题往下取，
   止于 `Recommended Product` / `You may also like` 等推荐位；只收句子行与 `-` 开头的规格条目。
3. **整页句子行**：用于认证、检测、政府批准这类可能写在页脚或「为什么买我们」区块的声明；
   导航/页脚链接标签（`Delivery`、`Privacy Policy`）不算句子，不参与。

## 误报与边界

- 模式加词边界：`5l` 不会命中 `6.5L`，`chat` 不会命中 `Livechat`。
- 泛词加同行上下文：`certified` / `approved` / `tested` 要同行出现认证机构或 `by` 结构；
  `japan` / `korea` / `germany` 要同行出现 `made in` / `designed in` 这类产地动词；
  `304` / `316` 要同行出现 `stainless` / `steel`。
- 语境排除：`Save RM0.00`（零折扣）、`From RM49.92 / month`（分期月供）、
  赔偿/退换语境里的 `voucher`、退货流程里的 `approved by our customer service team`、
  测试条件里的 `charged to 100%`。
- **不做的事**：不核验证书真伪、不判断是否构成违法、不推断「未认证」、不用模型记忆补法条。
- 真实页面的命中与误报记录见 [`SAMPLE_FINDINGS.md`](./SAMPLE_FINDINGS.md)。

## 复跑

```bash
cd agent
npx tsx scripts/run-compliance.ts --url <商品页> --category small_appliances
npx tsx --test test/compliance.test.ts
```

输出写到 `agent/reports/compliance/<host>-<slug>.json`：含 `findings`、每条规则的 `dispositions`
（`finding` / `merged` / `no_match` / `not_assessable` 及原因）与能力边界说明，可复现、可核对。
