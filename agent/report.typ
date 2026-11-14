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
#let mono-font = ("DejaVu Sans Mono", "Noto Sans Mono", "Consolas", "Courier New", "Liberation Mono")

#set text(font: body-font, size: 10pt, fill: rgb("#1e1e1e"), lang: "zh", hyphenate: false)
#set par(justify: true, leading: 0.85em, spacing: 1.15em)

#let sev-label(s) = if s == "high" { "高风险" } else if s == "medium" { "中风险" } else { "低风险" }
#let sev-fg(s) = if s == "high" { rgb("#b42318") } else if s == "medium" { rgb("#b54708") } else { rgb("#475467") }
#let sev-bg(s) = if s == "high" { rgb("#fdecea") } else if s == "medium" { rgb("#fff4e5") } else { rgb("#eef0f4") }
#let status-label(s) = if s == "risk" { "存在风险" } else if s == "ok" { "表现良好" } else { "无法判断" }
#let status-fg(s) = if s == "risk" { rgb("#b42318") } else if s == "ok" { rgb("#16794a") } else { rgb("#5b6472") }
#let status-bg(s) = if s == "risk" { rgb("#fdecea") } else if s == "ok" { rgb("#e8f5ec") } else { rgb("#eef0f4") }
#let mr-status-label(s) = if s == "present" { "已展示" } else if s == "missing" { "未展示" } else if s == "needs_review" { "需复核" } else { "不适用" }
#let mr-status-fg(s) = if s == "present" { rgb("#16794a") } else if s == "missing" { rgb("#b42318") } else if s == "needs_review" { rgb("#b54708") } else { rgb("#5b6472") }
#let mr-status-bg(s) = if s == "present" { rgb("#e8f5ec") } else if s == "missing" { rgb("#fdecea") } else if s == "needs_review" { rgb("#fff4e5") } else { rgb("#eef0f4") }

#let chip(label, fill, color) = box(
  fill: fill,
  inset: (x: 7pt, y: 2.2pt),
  radius: 99pt,
  text(size: 8pt, weight: "bold", fill: color, label),
)

#let dc-label(s) = if s == "rule_level" { "规则直判" } else if s == "substantiation" { "需事实核实" } else { "需人工判断" }

#let citation(item) = {
  let out = item.at("law_name", default: "规则库未给出")
  let art = item.at("article", default: none)
  if art != none { out = out + " · " + art }
  let ver = item.at("last_verified", default: none)
  if ver != none { out = out + " · 核验 " + ver }
  out
}

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
#link(meta.final_url)[#text(size: 9pt, fill: primary, meta.final_url)]

#v(12pt)
#line(length: 100%, stroke: 2.2pt + primary)
#v(9pt)

#table(
  columns: (58pt, 1fr),
  stroke: none,
  inset: (x: 0pt, y: 3pt),
  [ #field-label[页面标题] ], [ #meta.title ],
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

// ---------- 市场就绪度（RAY-697） ----------
#let market-checks = report.at("market_readiness", default: ())
#if market-checks.len() > 0 [
  #section[市场就绪度（马来西亚）]
  #let mr-count(status) = market-checks.filter(item => item.status == status).len()
  #text(size: 8.8pt, fill: muted)[
    只看页面有没有把进入马来西亚市场所需的信息讲清楚：共 #market-checks.len() 项，
    已展示 #mr-count("present")、未展示 #mr-count("missing")、需复核 #mr-count("needs_review")。
    不判断认证真伪，也不构成税务、支付或合规结论。
  ]
  #v(7pt)
  #for item in market-checks {
    block(breakable: false, width: 100%)[
      #grid(
        columns: (auto, 1fr),
        align: (left, left),
        column-gutter: 8pt,
        [#chip(mr-status-label(item.status), mr-status-bg(item.status), mr-status-fg(item.status))],
        [#text(size: 9.6pt, weight: "bold", fill: dark)[#item.checkId · #item.label]],
      )
      #v(3pt)
      #if item.quote != "" {
        block(
          width: 100%,
          fill: rgb("#f7f8fb"),
          stroke: (left: 2.4pt + warm),
          inset: (x: 9pt, y: 5pt),
          radius: (right: 4pt),
        )[
          #text(font: quote-font, size: 9.4pt, fill: rgb("#2b2f36"), item.quote)
        ]
      } else {
        text(size: 9pt, fill: muted)[页面未展示这项内容，没有可引用的原文。]
      }
      #v(4pt)
      #field-label[为什么记这一条]
      #v(1pt)
      #text(size: 9.2pt, item.why)
      #v(4pt)
      #field-label[怎么改]
      #v(1pt)
      #text(size: 9.2pt, item.fix)
      #if item.at("evidence", default: none) != none {
        v(4pt)
        text(font: mono-font, size: 8pt, fill: rgb("#3d4552"), item.evidence)
      }
    ]
    v(9pt)
  }
]

// ---------- 风险与修改建议 ----------
#section[风险与修改建议]
#let content-risks = report.risks.filter(risk => risk.at("dimension", default: "") != "compliance")
#let compliance-risks = report.risks.filter(risk => risk.at("dimension", default: "") == "compliance")
#for (i, risk) in content-risks.enumerate() {
  let kind = risk.at("kind", default: none)
  let evidence = risk.at("evidence", default: none)
  block(breakable: false, width: 100%)[
    #chip(sev-label(risk.severity), sev-bg(risk.severity), sev-fg(risk.severity))
    #if kind == "interface_translation" {
      h(5pt)
      chip("界面可翻译性", rgb("#eef2ff"), primary)
    }
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
      #if kind == "interface_translation" {
        text(font: mono-font, size: 9pt, fill: rgb("#2b2f36"), risk.quote)
      } else {
        text(font: quote-font, size: 10.4pt, fill: rgb("#2b2f36"), risk.quote)
      }
    ]
    #v(7pt)
    #if evidence != none {
      field-label[界面证据]
      v(1pt)
      block(
        width: 100%,
        fill: rgb("#ffffff"),
        stroke: 0.6pt + border,
        inset: (x: 8pt, y: 5pt),
        radius: 4pt,
      )[
        #text(font: mono-font, size: 8.4pt, fill: rgb("#3d4552"), evidence)
      ]
      v(7pt)
    }
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

// ---------- 合规与风险（RAY-698） ----------
#if compliance-risks.len() > 0 [
  #section[合规与风险（马来西亚）]
  #let dc-count(level) = compliance-risks.filter(item => item.at("decision_level", default: "") == level).len()
  #let review-count = compliance-risks.filter(item => item.at("review_required", default: false)).len()
  #text(size: 8.8pt, fill: muted)[
    基于公开法规的自动筛查，不构成法律意见。共 #compliance-risks.len() 条：
    规则直判 #dc-count("rule_level")、需事实核实 #dc-count("substantiation")、需人工判断 #dc-count("human_review")，
    其中 #review-count 条需专业审核。每条都标了法条与核验日期；只做规则级筛查，不对是否触犯法条下结论，也不核验证书真伪。
  ]
  #v(7pt)
  #for (i, item) in compliance-risks.enumerate() {
    block(breakable: false, width: 100%)[
      #chip(sev-label(item.severity), sev-bg(item.severity), sev-fg(item.severity))
      #h(5pt)
      #chip(dc-label(item.at("decision_level", default: "")), rgb("#eef2ff"), primary)
      #if item.at("review_required", default: false) {
        h(5pt)
        chip("需专业审核", rgb("#fdecea"), rgb("#b42318"))
      }
      #h(6pt)
      #text(size: 11.2pt, weight: "bold", fill: dark)[合规 #(i + 1)]
      #v(5pt)
      #if item.quote != "" {
        block(
          width: 100%,
          fill: rgb("#f7f8fb"),
          stroke: (left: 2.4pt + warm),
          inset: (x: 10pt, y: 7pt),
          radius: (right: 4pt),
        )[
          #text(font: quote-font, size: 10pt, fill: rgb("#2b2f36"), item.quote)
        ]
      } else {
        text(size: 9pt, fill: muted)[页面未展示这项内容，没有可引用的原文。]
      }
      #v(5pt)
      #text(size: 8.6pt, fill: muted)[法条出处：#citation(item)]
      #v(6pt)
      #field-label[为什么记这一条]
      #v(1pt)
      #text(size: 9.2pt, item.why)
      #v(6pt)
      #field-label[怎么改]
      #v(1pt)
      #text(size: 9.2pt, item.fix)
      #if item.at("evidence", default: none) != none {
        v(6pt)
        field-label[规则与来源]
        v(1pt)
        block(
          width: 100%,
          fill: rgb("#ffffff"),
          stroke: 0.6pt + border,
          inset: (x: 8pt, y: 5pt),
          radius: 4pt,
        )[
          #text(font: mono-font, size: 8pt, fill: rgb("#3d4552"), item.evidence)
        ]
      }
    ]
    v(11pt)
  }
]

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

// ---------- 界面候选与后续项（声音层 / RTL 记录） ----------
#let candidates = report.at("interface_candidates", default: ())
#if candidates.len() > 0 [
  #section[界面候选与后续项]
  #text(size: 8.6pt, fill: muted)[
    以下是提示，不是缺陷：声音层未做 round-trip 前不判为问题，RTL 本轮只记录。
  ]
  #v(5pt)
  #for candidate in candidates {
    block(breakable: false, below: 11pt, width: 100%)[
      #block(
        width: 100%,
        fill: rgb("#f7f8fb"),
        stroke: (left: 2.4pt + warm),
        inset: (x: 9pt, y: 6pt),
        radius: (right: 4pt),
      )[
        #text(font: quote-font, size: 9.6pt, fill: rgb("#2b2f36"), candidate.quote)
      ]
      #v(4pt)
      #block(
        width: 100%,
        fill: rgb("#ffffff"),
        stroke: 0.6pt + border,
        inset: (x: 8pt, y: 4pt),
        radius: 4pt,
      )[
        #text(font: mono-font, size: 8pt, fill: rgb("#3d4552"), candidate.evidence)
      ]
      #v(4pt)
      #text(size: 9pt, fill: muted, candidate.suggestion)
    ]
  }
]

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
