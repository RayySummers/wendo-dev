/**
 * 界面可翻译性信号的线格式（wire format）。
 *
 * 数据由 `scripts/interface_signals.py` 产出，落在 fetch_page 的 page.json 的
 * `interface` 字段里。字段名保持 Python 侧的 snake_case，避免多一层无意义的映射；
 * 分析层（analyze.ts）会把它转成 camelCase 的 findings。
 *
 * 注意：这里的数值都是「按声明推算」而不是浏览器实测——宽高来自 CSS 声明，
 * 文本宽度按字符类别估算。分析层因此在证据里标注 container_source。
 */
export interface InterfaceElementSnapshot {
  selector: string;
  tag: string;
  text: string;
  font_size_px: number;
  font_weight: number;
  color: string | null;
  line_height_px: number;
  text_transform: string | null;
  font_style: string | null;
  letter_spacing_px: number | null;
  white_space: string | null;
  overflow: string | null;
  text_overflow: string | null;
  word_break: string | null;
  overflow_wrap: string | null;
  hyphens: string | null;
  line_clamp: number | null;
  display: string | null;
  width_px: number | null;
  max_width_px: number | null;
  /** 原始宽度声明，用于识别 ch / ex 这类按字符计的宽度（MY-UI-01）。 */
  width_raw: string | null;
  max_width_raw: string | null;
  min_width_raw: string | null;
  height_px: number | null;
  max_height_px: number | null;
  /** 估算的内容区宽度（px）；null 表示拿不到可信宽度。 */
  container_px: number | null;
  /** declared=元素自己写了 px 宽度；estimate=等分容器推算；viewport=一路继承下来。 */
  container_source: "declared" | "estimate" | "viewport" | string;
  background_color: string | null;
  border_width_px: number;
  border_radius_px: number | null;
  /** 元素级 lang（混排页面才有）；null 表示继承文档。 */
  lang: string | null;
  /** 截断后的全文出口；有任一项时 MY-UI-02 从「有损」降级为「可恢复」。 */
  title_attr: string | null;
  aria_label: string | null;
  role: string | null;
  is_interactive: boolean;
  /** 元素生效的字体栈原文，用于 MY-UI-09 判据 3。 */
  font_family: string | null;
}

/** 输入控件快照：只看静态属性与内联 JS，不执行交互（MY-UI-08）。 */
export interface InterfaceFormSnapshot {
  selector: string;
  tag: string;
  type: string | null;
  name: string | null;
  placeholder: string | null;
  maxlength: number | null;
  minlength: number | null;
  autocomplete: string | null;
  inputmode: string | null;
  aria_label: string | null;
  handlers: Record<string, string>;
  inside_form: boolean;
  action?: string | null;
  method?: string | null;
}

/**
 * 候选（不是发现）。
 *
 * MY-UI-09 声音层按规则包要求「没做 round-trip 不写成缺陷」，所以只以候选 + 建议出现；
 * MY-UI-10 的 RTL 本轮只记录，同样走这条通道。报告里单独一节展示，不计入 risks。
 */
export interface InterfaceCandidate {
  rule: "MY-UI-09" | "MY-UI-10";
  /** 候选类型：voice = 声音层，rtl = 镜像/排版遗留。 */
  kind: "voice" | "rtl";
  quote: string;
  selector: string;
  evidence: string;
  /** 建议怎么做；不含结论性判断。 */
  suggestion: string;
}

export interface InterfaceLongToken {
  token: string;
  selector: string;
  text: string;
}

export interface InterfaceStylesheetStats {
  linked: number;
  fetched: number;
  failed: number;
  inline_blocks: number;
  rules: number;
}

export interface InterfaceSnapshot {
  captured: boolean;
  reason?: string;
  viewport_px?: number;
  lang?: string | null;
  dir?: string | null;
  html_open_tag?: string;
  viewport?: string | null;
  stylesheets?: InterfaceStylesheetStats;
  elements?: InterfaceElementSnapshot[];
  long_tokens?: InterfaceLongToken[];
  forms?: InterfaceFormSnapshot[];
  /** 页面是否在任一字体栈里显式声明了 CJK 字面。 */
  cjk_font_declared?: boolean;
}

/** 规则 id 稳定不变：报告、知识库、前端都按它对齐文案。 */
export type InterfaceRuleId =
  | "IF-TRUNC-01"
  | "IF-TRUNC-02"
  | "IF-TRUNC-03"
  | "IF-WRAP-01"
  | "IF-WRAP-02"
  | "IF-WRAP-03"
  | "IF-WRAP-04"
  | "IF-SIZE-01"
  | "IF-HIER-01"
  | "IF-DENSITY-01"
  | "IF-WORD-01"
  | "IF-INPUT-01"
  | "IF-INPUT-02";

export type InterfaceChannel =
  | "truncation"
  | "wrapping"
  | "legibility"
  | "hierarchy"
  | "density"
  | "wording"
  | "input";

export interface InterfaceFinding {
  rule: InterfaceRuleId;
  channel: InterfaceChannel;
  severity: "high" | "medium" | "low";
  /** 命中的元素文本，作为报告里的引用片段。 */
  quote: string;
  /** 元素选择器（可直接贴到 DevTools 核对）。 */
  selector: string;
  /** 规则名 + 关键数值，报告里的「界面证据」一行。 */
  evidence: string;
  /** 同类命中数量（同一规则合并后）。 */
  occurrences: number;
}
