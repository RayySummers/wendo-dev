# 报告产物

- `bear-malaysia-v1-20261112.json`：当前管线（RAY-657）的输出，网页与 PDF 的唯一数据源。
- `bear-malaysia-v1-20261112.html` / `.pdf`：由上面的 JSON 渲染，`scripts/verify-parity.ts` 已核对一致。
- `reference/v0/`：需求评论里给的 v0 基线，只作对照，不参与应用。

重新生成：

```bash
cd ..
npm run diagnose -- https://bears.com.my/ --slug bear-malaysia-v1
```

只重新渲染（不改报告内容）：

```bash
cd ..
npm run render -- reports/bear-malaysia-v1-20261112.json
```
