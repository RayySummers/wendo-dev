#set document(title: "文化适配诊断报告", author: "文渡 Wendo")
#set page(
  paper: "a4",
  margin: (x: 2.1cm, y: 1.9cm),
  footer: context align(center)[
    #text(size: 7.5pt, fill: rgb("#8a93a3"))[
      文渡 Wendo · 文化适配诊断报告 · 第 #counter(page).display() 页
    ]
  ],
)

#let report = json(sys.inputs.at("report", default: "reports/report.json"))
#let meta = report.meta

#let primary = rgb("#1943c1")
#let dark = rgb("#04115c")
#let warm = rgb("#f0a500")
#let muted = rgb("#5b6472")
#let faint = rgb("#8a93a3")
#let border = rgb("#d8dce6")
#let body-font = ("MiSans", "Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", "Helvetica", "Arial")
#let quote-font = ("Newsreader", "Noto Serif", "Noto Serif CJK SC", "Songti SC", "SimSun", "Georgia", "Times New Roman")

#set text(font: body-font, size: 10pt, fill: rgb("#1e1e1e"), lang: "zh", hyphenate: false)
#set par(justify: true, leading: 0.85em, spacing: 1.15em)

#let sev-label(s) = if s == "high" { "高风险" } else if s == "medium" { "中风险" } else { "低风险" }
#let sev-fg(s) = if s == "high" { rgb("#b42318") } else if s == "medium" { rgb("#b54708") } else { rgb("#475467") }
#let sev-bg(s) = if s == "high" { rgb("#fdecea") } else if s == "medium" { rgb("#fff4e5") } else { rgb("#eef0f4") }
#let status-label(s) = if s == "risk" { "存在风险" } else if s == "ok" { "表现良好" } else { "无法判断" }
#let status-fg(s) = if s == "risk" { rgb("#b42318") } else if s == "ok" { rgb("#16794a") } else { rgb("#5b6472") }
#let status-bg(s) = if s == "risk" { rgb("#fdecea") } else if s == "ok" { rgb("#e8f5ec") } else { rgb("#eef0f4") }

#let chip(label, fill, color) = box(
  fill: fill,
  inset: (x: 7pt, y: 2.2pt),
  radius: 99pt,
  text(size: 8pt, weight: "bold", fill: color, label),
)

#let section(title) = block(
  sticky: true,
  above: 16pt,
  below: 7pt,
)[
  #text(size: 14.5pt, weight: "bold", fill: dark, title)
  #v(3pt)
  #line(length: 100%, stroke: 0.9pt + primary)
]

#let fmt-time(iso) = {
  let parts = iso.split("T")
  if parts.len() < 2 { iso } else {
    parts.at(0) + " " + parts.at(1).slice(0, 5) + " MYT"
  }
}

#let field-label(text-body) = text(size: 8pt, weight: "bold", fill: primary, tracking: 0.7pt, text-body)

// ---------- 封面 ----------
#text(size: 8pt, weight: "bold", fill: primary, tracking: 1.6pt)[
  文渡 WENDO · CULTURAL ADAPTATION DIAGNOSIS
]
#v(7pt)
#text(size: 25pt, weight: "bold", fill: dark)[文化适配诊断报告]
#v(6pt)
#text(size: 10.5pt, fill: muted)[
  #meta.market_name · #meta.category_name
]
#v(2pt)
#if meta.final_url != none [
  #link(meta.final_url)[#text(size: 9pt, fill: primary, meta.final_url)]
] else [
  #text(size: 9pt, fill: primary)[粘贴文本]
]

#v(12pt)
#line(length: 100%, stroke: 2.2pt + primary)
#v(9pt)

#table(
  columns: (58pt, 1fr),
  stroke: none,
  inset: (x: 0pt, y: 3pt),
  [ #field-label[来源标题] ], [ #if meta.title != "" [#meta.title] else [（无标题）] ],
  [ #field-label[诊断档位] ], [ #meta.tier ],
  [ #field-label[生成时间] ], [ #text(size: 9pt, fmt-time(meta.generated_at)) ],
  [ #field-label[知识库版本] ], [ #text(size: 9pt, meta.knowledge_version) ],
  [ #field-label[正文长度] ], [ #text(size: 9pt, str(meta.source_chars) + " 字符") ],
)

// ---------- 总体判断 ----------
#section[总体判断]
#block(
  width: 100%,
  fill: rgb("#f2f5ff"),
  stroke: 0.6pt + rgb("#d0dffb"),
  radius: 6pt,
  inset: 12pt,
)[
  #text(size: 10.2pt, report.summary)
]

// ---------- 诊断维度 ----------
#section[诊断维度]
#for (i, d) in report.dimensions.enumerate() {
  block(breakable: false, width: 100%)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      column-gutter: 10pt,
      [#text(size: 9.6pt, weight: "bold", fill: dark, d.name)],
      [#chip(status-label(d.status), status-bg(d.status), status-fg(d.status))],
    )
    #v(2pt)
    #text(size: 9pt, fill: rgb("#3f4754"), d.note)
  ]
  if i < report.dimensions.len() - 1 {
    v(6pt)
    line(length: 100%, stroke: 0.4pt + rgb("#edf0f6"))
  }
  v(7pt)
}

// ---------- 风险与修改建议 ----------
#section[风险与修改建议]
#for (i, risk) in report.risks.enumerate() {
  block(breakable: false, width: 100%)[
    #chip(sev-label(risk.severity), sev-bg(risk.severity), sev-fg(risk.severity))
    #h(5pt)
    #text(size: 11.5pt, weight: "bold", fill: dark)[风险 #(i + 1)]
    #v(5pt)
    #block(
      width: 100%,
      fill: rgb("#f7f8fb"),
      stroke: (left: 2.4pt + warm),
      inset: (x: 10pt, y: 7pt),
      radius: (right: 4pt),
    )[
      #text(font: quote-font, size: 10.4pt, fill: rgb("#2b2f36"), risk.quote)
    ]
    #v(7pt)
    #field-label[为什么是问题]
    #v(1pt)
    #text(size: 9.6pt, risk.why)
    #v(6pt)
    #field-label[怎么改]
    #v(1pt)
    #text(size: 9.6pt, risk.fix)
  ]
  v(11pt)
}

// ---------- 做得好的地方 ----------
#section[做得好的地方]
#for s in report.strengths {
  block(breakable: false, below: 10pt, width: 100%)[
    #block(
      width: 100%,
      fill: rgb("#f7f8fb"),
      stroke: (left: 2.4pt + warm),
      inset: (x: 10pt, y: 6pt),
      radius: (right: 4pt),
    )[
      #text(font: quote-font, size: 10pt, fill: rgb("#2b2f36"), s.quote)
    ]
    #v(4pt)
    #text(size: 9.2pt, fill: muted, s.why)
  ]
}

// ---------- 本次无法判断 ----------
#section[本次无法判断]
#for item in report.not_assessable {
  block(breakable: false, below: 12pt, width: 100%)[
    #block(text(size: 9.6pt, weight: "bold", fill: dark, item.item))
    #block(text(size: 9.2pt, fill: muted, item.reason))
  ]
}

// ---------- 免责声明 ----------
#v(14pt)
#line(length: 100%, stroke: 0.5pt + border)
#v(5pt)
#text(size: 7.6pt, fill: faint)[
  本报告基于该页面单页公开内容与 Wendo 马来西亚知识库自动生成，不构成法律或合规意见；
  认证、法规与平台政策请以官方口径为准。报告只描述可核对的页面证据，不使用评分。
]
