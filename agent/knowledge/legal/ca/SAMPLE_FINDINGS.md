# 加拿大（CA）样例 Finding 模板

> RAY-765 v0.1：本文件只登记**模板与待跑样例**，不登记实际跑出的 finding。
> CA 尚未接入 matcher（`agent/src/compliance/rules.ts` 只对 MY 有可判定子集），因此本页先给出「应触发哪些规则 / 需要什么证据」的对照表，待接入后再填实测结果。

## 待跑样例

| 样例 | 来源 | 观察对象 | 预期触发 | 备注 |
| --- | --- | --- | --- | --- |
| CA-HomeAppliance-01 | TBD（小家电电商页，含实物标签照片） | 主图 + 详情区 + 结账流程 | `CA-LAB-04`（英法双语标签）、`CA-LAB-05`（公制三位小数）、`CA-SAF-02`（认证标志虚假表述）、`CA-CERT-09`（BC 电气认证）、`CA-CERT-10`（ON 电气规范） | 需实物标签照片，纯网页无法核 `CA-LAB-05/06` |
| CA-Elec-01 | TBD（无线键盘/耳机产品页） | 产品页 + 说明书下载 | `CA-CERT-01`（Radiocommunication Act s.4(2) TAC）、`CA-CERT-03`（标签 `IC:` 编号）、`CA-CERT-05`（说明书英法双语）、`CA-CERT-06`（免许可通知） | 说明书双语是中文卖家最常漏的一项 |
| CA-Ecom-01 | TBD（安大略省目标结账页） | 结账流程 + 确认邮件 | `CA-PRV-04`（CPA s.38(1) 订约前披露）、`CA-PRV-05`（O. Reg. 17/05 s.32 的 14 项）、`CA-PRV-06`（$50 门槛）、`CA-PRV-12`（BC s.47(2) 若目标 BC） | `CA-PRV-05` 第 5 项（关税/报关费）与第 13 项（非加元计价）最常见漏项 |
| CA-Privacy-01 | TBD（隐私政策页 + 邮件营销） | 政策页 + 邮件页脚 | `CA-PRIV-06`（PIPEDA cl.4.8 政策可访问）、`CA-PRIV-03`（同意）、`CA-EML-02`（退订机制）、`CA-EML-04`（10 个工作日执行） | 需实测退订链接可用性 |
| CA-Green-01 | TBD（环保声称产品页） | 「eco-friendly」「carbon neutral」等表述 | `CA-ADV-04`（Competition Act s.74.01(1)(b.1)） | 只判「需要证明」，不能判真假 |
| CA-Price-01 | TBD（划线价 + 结账页） | 商品页划线价 + 结账页总价 | `CA-ADV-06`（drip pricing）、`CA-ADV-11`（s.74.01(3) 自身原价）、`CA-PRV-10`（BC s.4(3)(c)） | 需实际下单核实结算价 |
| CA-QC-Note-01 | TBD（面向魁北克的销售页） | 语言与投放地域 | `CA-QC-01`（产品铭文法语）、`CA-QC-02`（目录/订单表法语）、`CA-QC-03`（广告法语显著占优） | **标注型，不下结论**；本产品暂不覆盖魁北克 |

## 模板字段（与报告接入一致）

```
- observed:    <页面/文档上观察到的内容>
- rule:        <CA-XX-NN>  <法条号>
- why:         <法条要件的对应关系（引用 verbatim_excerpt，不改写）>
- evidence:    <需商家提供/需实测的证据，来自 evidence_needed>
- level:       rule_level / substantiation / human_review
- review:      true/false（true 时报告页标「需专业审核」）
- penalty:     <只写上限，不写必然处罚>
```

## 误报与漏报的观察清单（接入后填写）

- `free` / `safe` 等词命中导航与推荐位（与 MY-ADV-* 相同的坑）。
- `Limited Stock` / `While Supplies Last` 命中但库存事实未知（`CA-ADV-09` 属 `human_review`，勿下结论）。
- 页面未展示认证信息 ≠ 未认证（`CA-SAF-02` 需实物标签，纯网页抓取不应触发）。
- 说明书语言：网页抓取看不到说明书，`CA-CERT-05` 需实测下载 PDF 后判。
- `CA-PRV-*` 的省法规则需要「目标省份」判断；省级不适用时写「非该省销售，不适用」而不是「已合规」。
