# v0 基线报告（对照用）

来源：RAY-657 需求评论（Ray，2026-11-12 12:26）的附件，保留原文未改动。

- 生成方式：Pi 1.5.2 + Scrapling 0.5.1，抓取 `https://bears.com.my/` 首页 3148 字符；
  开发期模型为 AxonHub `group/deepseek-pool`。
- 数据结构与当前管线不同：`{ generated_at, source, model, report }` 嵌套，`strengths` /
  `not_assessable` 是字符串数组，`dimensions` 是后台数值分（v0 明确标注「不对外」）。
- 本目录只用于对照，**不要**被应用读取，也不要覆盖它。当前管线输出在
  `reports/bear-malaysia-v1-20261112.*`。

两者不是替代关系：v0 是第一次跑通的样本；v1 加了固定工具链、原文引用校验、无分数约束与
Typst PDF。
