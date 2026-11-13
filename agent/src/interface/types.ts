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
  | "IF-HIER-01";

export type InterfaceChannel = "truncation" | "wrapping" | "hierarchy";

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
