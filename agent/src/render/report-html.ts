import type { DimensionStatus, Report, Severity } from "../types.js";

const SEVERITY_LABEL: Record<Severity, string> = { high: "高", medium: "中", low: "低" };
const SEVERITY_CLASS: Record<Severity, string> = { high: "sev-high", medium: "sev-medium", low: "sev-low" };
const STATUS_LABEL: Record<DimensionStatus, string> = {
  risk: "存在风险",
  ok: "表现良好",
  not_assessable: "无法判断",
};
const STATUS_CLASS: Record<DimensionStatus, string> = {
  risk: "st-risk",
  ok: "st-ok",
  not_assessable: "st-na",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/\//g, "-");
}

/** 网页与 PDF 共用同一份报告 JSON；这个渲染器只负责排版，不做任何内容加工。 */
export function renderReportHtml(report: Report): string {
  const { meta } = report;
  const risks = report.risks
    .map(
      (risk, index) => `
      <section class="risk">
        <div class="risk-head">
          <span class="sev ${SEVERITY_CLASS[risk.severity]}">${SEVERITY_LABEL[risk.severity]}风险</span>
          <h3>风险 ${index + 1}</h3>
        </div>
        <blockquote>${escapeHtml(risk.quote)}</blockquote>
        <div class="field"><span class="label">为什么是问题</span><p>${escapeHtml(risk.why)}</p></div>
        <div class="field"><span class="label">怎么改</span><p>${escapeHtml(risk.fix)}</p></div>
      </section>`,
    )
    .join("\n");

  const dimensions = report.dimensions
    .map(
      (dimension) => `
        <tr>
          <td>${escapeHtml(dimension.name)}</td>
          <td><span class="status ${STATUS_CLASS[dimension.status]}">${STATUS_LABEL[dimension.status]}</span></td>
          <td>${escapeHtml(dimension.note)}</td>
        </tr>`,
    )
    .join("\n");

  const strengths = report.strengths
    .map(
      (strength) => `
        <li><blockquote>${escapeHtml(strength.quote)}</blockquote><p>${escapeHtml(strength.why)}</p></li>`,
    )
    .join("\n");

  const notAssessable = report.not_assessable
    .map(
      (item) => `
        <li><strong>${escapeHtml(item.item)}</strong><p>${escapeHtml(item.reason)}</p></li>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>文化适配诊断报告 · ${escapeHtml(meta.market_name)} · ${escapeHtml(meta.title || meta.final_url)}</title>
<style>
  :root {
    --primary: #1943c1;
    --dark: #04115c;
    --light: #d0dffb;
    --warm: #f0a500;
    --text: #1e1e1e;
    --muted: #5b6472;
    --border: #d8dce6;
    --bg: #f6f7fb;
    --danger: #b42318;
    --warn: #b54708;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 48px 20px 64px;
    background: var(--bg); color: var(--text);
    font-family: "MiSans", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
    font-size: 15px; line-height: 1.75;
  }
  .sheet { max-width: 880px; margin: 0 auto; background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 48px 56px 56px; }
  header.cover { border-bottom: 3px solid var(--primary); padding-bottom: 24px; margin-bottom: 28px; }
  .brand { color: var(--primary); font-weight: 700; letter-spacing: .14em; font-size: 12px; text-transform: uppercase; }
  h1 { font-size: 30px; line-height: 1.3; margin: 10px 0 6px; color: var(--dark); }
  .subtitle { color: var(--muted); font-size: 14px; }
  .subtitle a { color: var(--primary); text-decoration: none; word-break: break-all; }
  .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 28px; margin: 22px 0 0; font-size: 13px; color: var(--muted); }
  .meta div { display: flex; gap: 8px; }
  .meta dt { color: #8a93a3; min-width: 64px; }
  .meta dd { margin: 0; color: var(--text); }
  h2 { font-size: 19px; color: var(--dark); margin: 40px 0 14px; padding-left: 12px; border-left: 4px solid var(--primary); }
  .summary { background: #f2f5ff; border: 1px solid var(--light); border-radius: 12px; padding: 20px 22px; }
  .summary p { margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { text-align: left; color: var(--muted); font-weight: 600; border-bottom: 1px solid var(--border); padding: 8px 10px; }
  td { border-bottom: 1px solid #edf0f6; padding: 10px; vertical-align: top; }
  td:first-child { width: 22%; font-weight: 600; color: var(--dark); }
  td:nth-child(2) { width: 14%; }
  .status, .sev { display: inline-block; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .st-risk, .sev-high { background: #fdecea; color: var(--danger); }
  .sev-medium { background: #fff4e5; color: var(--warn); }
  .st-ok { background: #e8f5ec; color: #16794a; }
  .st-na { background: #eef0f4; color: #5b6472; }
  .sev-low { background: #eef0f4; color: #475467; }
  .risk { border: 1px solid var(--border); border-radius: 12px; padding: 20px 22px; margin: 16px 0; break-inside: avoid; }
  .risk-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .risk-head h3 { margin: 0; font-size: 16px; color: var(--dark); }
  blockquote { margin: 8px 0 14px; padding: 12px 16px; background: #f7f8fb; border-left: 3px solid var(--warm); border-radius: 0 8px 8px 0; font-family: ui-serif, Georgia, "Times New Roman", serif; font-size: 15px; color: #2b2f36; }
  .field { margin-top: 10px; }
  .label { display: block; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--primary); text-transform: uppercase; margin-bottom: 2px; }
  .field p { margin: 0; }
  ul { padding-left: 20px; }
  ul li { margin: 12px 0; }
  ul li p { margin: 4px 0 0; color: var(--muted); }
  .note { font-size: 12.5px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 44px; padding-top: 16px; }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; }
    .risk { break-inside: avoid; }
  }
  @media (max-width: 640px) {
    body { padding: 16px 10px 32px; }
    .sheet { padding: 24px 18px 32px; border-radius: 10px; }
    h1 { font-size: 23px; }
    .meta { grid-template-columns: 1fr; }
    td:first-child, td:nth-child(2) { width: auto; }
    table, thead, tbody, tr, td { display: block; width: 100%; }
    thead { display: none; }
    tr { border-bottom: 1px solid #edf0f6; padding: 12px 0; }
    tr:last-child { border-bottom: 0; }
    td { border: 0; padding: 1px 0; }
    td:first-child { font-size: 14.5px; }
  }
</style>
</head>
<body>
<main class="sheet">
  <header class="cover">
    <div class="brand">文渡 Wendo · Cultural Adaptation Diagnosis</div>
    <h1>文化适配诊断报告</h1>
    <p class="subtitle">${escapeHtml(meta.market_name)} · ${escapeHtml(meta.category_name)} · <a href="${escapeHtml(meta.final_url)}">${escapeHtml(meta.final_url)}</a></p>
    <dl class="meta">
      <div><dt>页面标题</dt><dd>${escapeHtml(meta.title || "（无标题）")}</dd></div>
      <div><dt>诊断档位</dt><dd>${escapeHtml(meta.tier)}</dd></div>
      <div><dt>生成时间</dt><dd>${escapeHtml(formatDateTime(meta.generated_at))}（MYT）</dd></div>
      <div><dt>知识库版本</dt><dd>${escapeHtml(meta.knowledge_version)}</dd></div>
    </dl>
  </header>

  <section>
    <h2>总体判断</h2>
    <div class="summary"><p>${escapeHtml(report.summary)}</p></div>
  </section>

  <section>
    <h2>诊断维度</h2>
    <table>
      <thead><tr><th>维度</th><th>状态</th><th>依据</th></tr></thead>
      <tbody>
${dimensions}
      </tbody>
    </table>
  </section>

  <section>
    <h2>风险与修改建议</h2>
${risks}
  </section>

  <section>
    <h2>做得好的地方</h2>
    <ul>
${strengths}
    </ul>
  </section>

  <section>
    <h2>本次无法判断</h2>
    <ul>
${notAssessable}
    </ul>
  </section>

  <p class="note">本报告基于该页面单页公开内容与 Wendo 马来西亚知识库自动生成，不构成法律或合规意见；认证、法规与平台政策请以官方口径为准。报告只描述可核对的页面证据，不使用评分。</p>
</main>
</body>
</html>
`;
}
