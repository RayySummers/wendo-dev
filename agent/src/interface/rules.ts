import type { InterfaceChannel, InterfaceFinding, InterfaceRuleId } from "./types.js";

/**
 * 界面可翻译性规则包（工程侧实现）。
 *
 * 规则正文与出处见 `knowledge/my/interface-survivability.md`（RAY-673，Cale）：
 * `kbRule` 就是那份文档里的 MY-UI-* 编号，报告证据里优先显示它，两边可以逐条对照。
 * 这里只保留诊断报告需要的那一层：一句话说明「为什么换语言会坏」+「怎么改」，
 * 不做审美判断，也不写「亚洲 UI 丑」这类结论。
 */
export interface InterfaceRule {
  /** 实现侧的稳定 id，用于测试与代码内部分组。 */
  id: InterfaceRuleId;
  /** 知识库规则编号（RAY-673），报告证据里显示这个。 */
  kbRule: `MY-UI-${string}`;
  channel: InterfaceChannel;
  /** 命中的具体机制，出现在证据行里，便于区分同一规则的不同触发方式。 */
  mechanism: string;
  /** 维度说明里的一句话小结。 */
  label: string;
  why: string;
  fix: string;
}

export const INTERFACE_RULES: Record<InterfaceRuleId, InterfaceRule> = {
  "IF-TRUNC-01": {
    id: "IF-TRUNC-01",
    kbRule: "MY-UI-02",
    channel: "truncation",
    mechanism: "定高裁切",
    label: "定高文本盒裁掉长标题",
    why: "文本被锁在固定高度或固定行数里，超出部分直接裁掉。中文靠更短的字符能把信息塞进两三行；换成英语或马来语后同样的信息要多占半行到一行，最先被裁掉的往往正是型号、规格或卖点。",
    fix: "让高度跟着内容走：去掉固定 height，或把 line-clamp 提到目标语言真正需要的行数；截断只能是显式策略，被截掉的信息要另有出口（title / aria-label / 详情页）。改完在英语、马来语下各看一次标题是否完整。",
  },
  "IF-TRUNC-02": {
    id: "IF-TRUNC-02",
    kbRule: "MY-UI-02",
    channel: "truncation",
    mechanism: "单行截断",
    label: "单行截断丢字",
    why: "元素被设成单行不换行，还叠了省略号或裁切，宽度也写死了。英语、马来语的同一个说法通常比中文长，一旦超宽就直接截断，用户看到的是半截标题或按钮文案；没有 title / aria-label 时这串字在任何地方都找不回来。",
    fix: "把固定宽度换成 min-width 加可伸缩宽度并允许换行；确实不能换行（tab 条、表头）才截断，同时补 title 或 aria-label 给全文出口。再按目标语言实测一次。",
  },
  "IF-TRUNC-03": {
    id: "IF-TRUNC-03",
    kbRule: "MY-UI-01",
    channel: "truncation",
    mechanism: "ch/ex 定宽",
    label: "ch/ex 定宽",
    why: "宽度按「能放 N 个字符」来写（ch / ex）。ch 量的是数字 0 的宽度，本身就是拉丁字形的假设：同一串 24ch 的中文会远远超出，换成英语又可能剩一大截。这类宽度不会随语言变化，翻译后必然错位。",
    fix: "宽度改成视觉单位（px / rem）或 min-width + 自适应；长度限制只表达业务上限，不要和像素宽度绑定。确实要按字符排版时，先确认这串文字永远不会被翻译。",
  },
  "IF-WRAP-01": {
    id: "IF-WRAP-01",
    kbRule: "MY-UI-03",
    channel: "wrapping",
    mechanism: "break-all",
    label: "break-all 断错词",
    why: "`word-break: break-all` 允许在任意字符处断行。中文没有词边界，这样切不影响阅读；拉丁字母会在单词中间被切开，而且不显示连字符，读起来像拼写错误。",
    fix: "改用 `overflow-wrap: anywhere` 或 `word-break: normal` 搭配 `hyphens: auto`，让断行发生在词边界；CJK 需要短语级断行时用 `Intl.Segmenter` 的断点，不要把 break-all 当默认。",
  },
  "IF-WRAP-02": {
    id: "IF-WRAP-02",
    kbRule: "MY-UI-03",
    channel: "wrapping",
    mechanism: "缺 lang",
    label: "缺少 lang",
    why: "页面根元素没有声明语言（或声明与正文不符），浏览器就不会为目标语言加载断词词典、选择字形。换成英语、马来语后，长词只能整块溢出或被迫硬断，连字符也不会出现。",
    fix: "给 `<html>` 补上 `lang`（例如 `lang=\"en-MY\"`、`lang=\"ms\"`、`lang=\"zh-Hans\"`）；语言混杂时把 lang 标到对应元素上，再按语言给出 `hyphens` 与字体栈。",
  },
  "IF-WRAP-03": {
    id: "IF-WRAP-03",
    kbRule: "MY-UI-03",
    channel: "wrapping",
    mechanism: "长词溢出",
    label: "长词溢出",
    why: "页面上已经有不可断的长串（品牌名、复合词或全大写标签），容器偏窄又没开断词。换语言后新出现的长词会直接顶出容器，而不是自然折行。",
    fix: "给容器加 `overflow-wrap: anywhere` 与 `hyphens: auto`，或把长词拆成可读的两段；不要靠缩小字号硬塞。",
  },
  "IF-WRAP-04": {
    id: "IF-WRAP-04",
    kbRule: "MY-UI-03",
    channel: "wrapping",
    mechanism: "行高过紧",
    label: "行高过紧",
    why: "标题行高相对字号偏小（不到 1.2 倍）。单行时看不出来；换成英语或马来语后标题折成两行，行与行贴在一起，严重时下半行会被容器裁掉。",
    fix: "标题行高提到字号的 1.2 倍以上（正文 1.4 以上），或明确允许标题占两行；折行后检查上下留白与容器高度是否还够。",
  },
  "IF-HIER-01": {
    id: "IF-HIER-01",
    kbRule: "MY-UI-05",
    channel: "hierarchy",
    mechanism: "层级靠颜色",
    label: "层级靠颜色",
    why: "同一屏里字号、字重的层次很少，层级主要靠颜色和边框区分。拉丁文字自带大小写、斜体等通道，中文没有这些通道，只能拿颜色和框线来补；换成英语或马来语后文字长度一变、色块关系先乱，读者就分不清哪句是标题、哪句是补充说明。",
    fix: "把关键层级落到字号和字重上（标题更大更粗），颜色只做状态标记；改完再按目标语言检查每个层级的对比度与主次是否还成立。",
  },
};

export const INTERFACE_RULE_ORDER: InterfaceRuleId[] = [
  "IF-TRUNC-01",
  "IF-TRUNC-02",
  "IF-TRUNC-03",
  "IF-WRAP-01",
  "IF-WRAP-02",
  "IF-WRAP-03",
  "IF-WRAP-04",
  "IF-HIER-01",
];

export function ruleFor(id: InterfaceRuleId): InterfaceRule {
  return INTERFACE_RULES[id];
}

/** 报告里一条 interface 风险：文案来自规则包，证据来自 analyze.ts。 */
export function describeFinding(finding: InterfaceFinding): { why: string; fix: string } {
  const rule = INTERFACE_RULES[finding.rule];
  const scope =
    finding.occurrences > 1 ? `页面里同类共 ${finding.occurrences} 处，以这一处为例。` : "";
  return { why: `${rule.why}${scope}`, fix: rule.fix };
}
