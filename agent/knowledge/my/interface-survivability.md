# 界面可翻译性（translation survivability）规则包

状态：v0.2 · 2026-11-13 · 归属维度：`content`「信息层级与表达自然度」（沟通效果性）
适用：马来西亚市场站点（源语言常为中文或英文，目标语言 en / ms / zh），也可用于任意
「中文 → 英文」「英文 → 马来文」的界面检查。

v0.2 按 Ray 2026-11-13 的追问重排：把 [Rene Wang 全文](https://rene.wang/essay/build-interfaces-that-survive-translation)
拆成 10 类可诊断点（v0.1 只覆盖 3 类 CSS 信号）。**10 类是诊断粒度，不等于文章 8 个小节**：
1–3 都出自 §Atom and Wrap，4/6 出自 §Pay for compression，10 跨 §Pass the mirror test 与
§Distrust the units。映射见 §1。

本文件不接入 `index.json`、不改 `retrieve-kb` 与评分权重；接入方式见 §5，是否接入与阈值
由 RAY-674 决定。

---

## 0. 判断边界

这套规则回答一个问题：

> 这个界面换到目标语言后，信息层级、可读性、可输入性和不溢出的能力还在不在？

它**不是**在判断「亚洲 UI 丑」。推文把 Lazada 11.11 的促销界面概括成 "Asian UI"，这个结论
过宽，不能进诊断报告（见 §7）。可证据化的机制是：CJK 的字是定宽原子，英文的词是变长原子；
中文能靠密度和颜色/框线补层级，换到英文/德文/马来文后先溢出、先丢信息、层级先塌；再往下还有
输入成本和声音层——这两层不是几何问题，但同样会让译文「说不上哪里不对」。

**证据等级**（沿用现有知识库口径）：`已核实` = 直接读了官方/原始来源；`佐证` = 权威二手来源
（本包多数规则属此类：Rene Wang 文章是设计工程实践总结，不是标准）；`编辑判断` = 阈值与经验
判断，不得表述为规范；`待核` = 来源不足。

**本轮范围**：1–7 可从 HTML/CSS/文本抽信号；8 要读表单、搜索、快捷键（部分要 JS 或交互）；
9 要读文案并做 round-trip（半自动）；10 只记录、不进 MVP。

---

## 1. 文章 → 10 类 → 证据来源

| # | 诊断类 | 文章小节 | 规则 ID | 证据从哪来 | 本轮 |
| --- | --- | --- | --- | --- | --- |
| 1 | 固定宽度与文本膨胀 | §Atom and Wrap、§Distrust the units | MY-UI-01 | CSS 宽度声明、`ch`/`ex`、JS 限长 | 静态 |
| 2 | 截断 vs 换行 | §Atom and Wrap | MY-UI-02 | `nowrap`/`ellipsis`/`overflow`/`line-clamp` | 静态 |
| 3 | CJK 断行/分词 | §Atom and Wrap、§Notes | MY-UI-03 | `word-break`/`hyphens`/`lang`/`line-break` | 静态 |
| 4 | 字号/可读性下限 | §Pay for compression、§Notes | MY-UI-04 | `font-size`/`line-height` + `lang` | 静态 |
| 5 | 层级通道 | §Count your channels | MY-UI-05 | 同屏字号/字重/颜色/大小写统计 | 静态（需同屏统计） |
| 6 | 密度≠信息率 | §Pay for compression | MY-UI-06 | 字号、可点元素数、强调色数 | 静态（需基线） |
| 7 | 用词补设计 | §Don't patch with words | MY-UI-07 | 按钮文案、CTA 重复、副词 | 静态 |
| 8 | 输入成本/IME | §Price the input | MY-UI-08 | `maxlength`、inline handler、搜索/命令面板 | 静态 + JS/交互 |
| 9 | 声音层 | §Don't translate vibe | MY-UI-09 | 文案清单、字体栈、round-trip | 半自动 + 人工 |
| 10 | 镜像/RTL 与排版遗留 | §Pass the mirror test、§Distrust the units | MY-UI-10 | `dir=rtl` 复核、API 层 Latin 假设 | 记录，不进 MVP |

---

## 2. 规则

### MY-UI-01 固定宽度与文本膨胀

**规则**
宽度不能按字符数写。`width` / `min-width` / `max-width` 用视觉单位（px / rem），不要用
`ch`、`ex` 或「能放 N 个字符」折算出来的值；也不要指望用 JS 按字符数截断来兜底。

**判据（可证据化）**
必报条件（任一）：

1. 可翻译文本的容器用 `ch` / `ex` 定宽（例如 `width: 24ch`、`max-width: 30ex`）；
2. 代码注释、设计规范、CMS 字段说明里出现「fits N characters」「最多 N 个字」的宽度约定；
3. 输入框/标签用 `maxlength`、JS `slice()`/`substring()` 与视觉宽度绑定（不是业务上限）；
4. 固定宽度容器 + 目标语探针复核后 `scrollWidth > clientWidth`，或 `min-content` 宽于容器。

探针：优先用真实目标语字符串；没有时按字符数 ×1.4 做筛查（`编辑判断`，无权威标准）。
**没有复核结果不报**——见 MY-UI-02，两者分工是：01 查「宽度怎么定的」，02 查「放不下时怎么处理」。

**反例**
文章的 24ch / 24ic 对照：按 24ch 设计的输入框，拉丁文刚好放 24 个字符，中文 24 个字远远超出；
换成 24ic，bug 直接反过来。作者补了一句：用 JS 限制内容长度也救不了——CSS 的行内布局本身就是
拉丁行的形式化（baseline / ascender / descender / leading 在方块字身里都不存在）。

**改法**
最小宽度用视觉值写，容器允许增长；长度限制只表达业务上限，与像素宽度解耦；确实要按字符排版时，
先确认这串文字永不翻译。

**来源**
Rene Wang, *Build Interfaces That Survive Translation*, §Atom and Wrap、§Distrust the units、
§Notes（"Avoid `ch`, `ex`, and any magic width you got by counting characters in your own
language, unless the string can never be localized."）。

---

### MY-UI-02 截断 vs 换行

**规则**
放不下时，正确的默认动作是换行、让行/列表/面板长高；截断只能是显式策略，而且被截掉的信息必须
另有出口（`title` / `aria-label` / 详情页）。把截断当默认，等于把翻译成本转嫁给读者。

**判据**
必报条件：

1. `white-space: nowrap` 或 `text-wrap-mode: nowrap`，配 `overflow: hidden|clip`，配
   `text-overflow: ellipsis|clip`；
2. `-webkit-line-clamp: N` + `display: -webkit-box` + `-webkit-box-orient: vertical`；
3. 固定 `height` + `overflow: hidden`；
4. 上述任一成立，且元素没有 `title` / `aria-label` 提供全文（同一条从「有损」升级为「不可达」）。

复核：同 MY-UI-01，必须有一次宽度复核（目标语字符串或 1.4 探针）证明真的溢出；没有就只记
「结构观察」，不算发现。

**反例**
文章开头 v0 的日语截图：`Import from Figma` 在日语模式里直接消失——不是换行，是没地方放。
另一个更精确的对照：同一行在英文与德文下高度完全一样，因为截断行「不是在吸收多出来的长度，
而是在把它丢掉」（"Height is the only thing a row has to spend, and that one is spending
nothing."）。

**改法**
让标签取任意多行，让行、列表、面板跟着长高；只有确实不能换行（如 tab 条、表格头）才截断，
并补全文出口；不要用 JS 截字符串兜底。

**来源**
同上 §Atom and Wrap。

---

### MY-UI-03 CJK 断行/分词：`auto-phrase` 不是词典

**规则**
断行有两个任务：保住行长的比例，和不切错语义。英文的空格是免费的语义缝；CJK 没有空格，两个
任务都得自己处理。`word-break: auto-phrase` 只是让浏览器做语言相关的短语分析，**不等于词典
分词**；要按词缝断，得用 `Intl.Segmenter` 的断点。

**判据**
必报条件（任一）：

1. 文本容器声明 `word-break: break-all`，且内容含拉丁词或多语混排（会在任意两字符间断开，
   不显示连字符，且会在「整词换行本可避免断行」的位置硬断）；
2. 页面或元素缺 `lang`（或 `lang` 与可见内容不一致，例如 `lang="en-US"` 而正文是中文/马来文），
   同时声明了 `hyphens: auto`——此时断词实际不生效；
3. `word-break: keep-all` 用在 CJK 正文（整段不再换行，直接溢出）；
4. 标题/正文 `line-height` < 1.2，且存在长词或 CJK 混排（断行位置看不出来）。

复核：英文看 `min-content` 是否由最长单词决定（文章演示：英文再窄也窄不过
"Internationalization"）；CJK 看断点是否落在词中间。

**反例**
文章的可交互演示：中文与日文默认断行会把「应用」从词中间切开，英文在任何模式下都不切词。
切到 Visual Balance 模式后比例好看了，「应用」照样被切开——"the visual polish shipped, and
the dictionary is still waiting for its wiring"。

**改法**
`lang` 标到 `html` 或元素（`zh-Hans` / `en-MY` / `ms`）；CJK 用 `word-break: normal` + 合适的
`line-break`，需要短语级断行时用 `Intl.Segmenter` 断点（或实验性的 `word-break: auto-phrase`，
不能当唯一方案）；拉丁语用 `overflow-wrap: anywhere` 而不是 `break-all`；段落加
`text-wrap: pretty` 处理孤字结尾；标题 `line-height` ≥ 1.2，正文 ≥ 1.4。

**来源**
同上 §Atom and Wrap + §Notes（"Tag the `lang`"、"break at `Intl.Segmenter` seams rather than
waiting for `word-break: auto-phrase`"）；MDN `word-break`、MDN `hyphens`
（"Browsers will only hyphenate if this attribute is present and the appropriate hyphenation
dictionary is available."）。

---

### MY-UI-04 字号/可读性下限

**规则**
CJK 的可读性下限比拉丁高。拉丁字靠外形轮廓区分，10px 还能认；CJK 的区分特征是内部笔画的高
空间频率（未/末只差一条横线长短，己/已/巳只差开口），像素不够就糊成一团。所以 `lang` 是
zh/ja 时，正文 ≥ 12px 是**下限不是目标**，10px、11px 的 CJK 文本要单独查。

**判据**
必报条件（任一）：

1. `font-size` ≤ 11px 且文本为 CJK（忽略语言标记错误的页面，先确认 `lang`）；
2. `font-size` = 12px 且是正文（非标签、非角标），作为下限警戒；
3. 正文 `line-height` < 1.4，CJK 笔画密度高时行与行会粘连；
4. 用 `transform: scale()` 或 `zoom` 缩小正文来「适配」——等效于降低有效字号。

排除：拉丁文 10px 本身不作为可读性发现——文章的区分依据是「外形轮廓 vs 内部笔画」，拉丁在小
字号仍能靠轮廓分辨；但若同一页英文正文与中文正文用同一字号、且中文是主要阅读语言，按第 1 条报。

**反例**
文章的字号样本把「未/末、己/已/巳、corner/comer、Illinois」放在 16px→8px 的梯度上：拉丁在最
小字号仍能靠轮廓分辨，CJK 先糊掉。文章的结论是「可读性下限更高」（"the legibility floor sits
higher"），不是「中文不能用小字」。

**改法**
正文 ≥ 14px（CJK 12px 只是地板），行高 1.5；不要用缩小字号解决溢出（回到 MY-UI-02 换行）；
角标/徽章可以小，但不要承载正文信息。

**来源**
同上 §Pay for compression + §Notes（"Avoid font sizes below `12px` when `lang` is set to a CJK
language."）。

---

### MY-UI-05 层级通道

**规则**
层级只能用**目标语言真正提供**的通道搭。拉丁文字自带 case，再加 italic、weight、small caps、
letterspacing，五个通道不花字号和颜色就能表达等级；CJK 只有 weight，而 weight 是五个里最弱的
（加粗密集字形是填满字怀，不是增加与周围空白的对比），没有 case，合成斜体只会更糟。
所以中文界面常拿颜色和框线来补——这不是「丑」，是买不到排版通道时的替代品。诊断要报的是：
**这套替代通道在换语言后还成不成立**。

**判据**
必报条件（任一）：

1. 同一视图内相邻两个层级之间没有可见的字号差（建议阈值 < 2px）也没有字重差（建议 < 200），
   只靠颜色、底色、边框区分；
2. 层级完全由颜色承载，且强调色超过 3 种（颜色在承担等级而不是状态）；
3. `text-transform: uppercase` 被当作唯一层级手段，而目标语言无 case（中文/日文/泰文/阿拉伯文）；
4. 同一屏 `font-size` 取值超过 5 种，且没有对应的语义层级（层级靠字号堆出来）。

阈值 1/2/4 为 `编辑判断`，需在 RAY-674 用真实页面校准后再定稿。

**反例**
文章的同一段「更新日志」：拉丁版用 3 个排版通道 + 1 个颜色 + 2 个字号就能分层；中文同版只剩
1 个通道 + 1 个颜色 + 2 个字号；为了补回来，中文补偿版变成 1 个通道 + 3 个颜色 + 3 个字号 +
1 个填充块——就是支付宝那种「红框 + 多色」的来源。

**改法**
先列出目标语言可用的通道，再从这张表里搭层级；CJK 场景用字号 + 字重 + 留白/分隔线，颜色只做
状态（成功/警告/错误），不做等级；拉丁场景可以用 case，但别让它成为唯一手段；同页强调色 ≤ 2。

**来源**
同上 §Count your channels（"Five channels for signalling importance without touching size or
color."）；WCAG 2.2 SC 1.4.1 Use of Color（颜色不得作为传达信息的唯一视觉手段）。

---

### MY-UI-06 密度 ≠ 信息率

**规则**
中文一屏能放更多字符，是字宽均匀、断行免费换来的**空间**，不是**阅读速度**。把「信息密度高」
当成优点写进设计，会让翻译后的界面既挤又难读。**不要用「中文能放下」证明英文/马来文也放得下。**

**判据**
必报条件（任一）：

1. 首屏可点元素（链接/按钮/卡片）数量显著高于同类，且没有主次（没有唯一主 CTA）；
2. 同一屏同时出现 > 3 个强调色 / 角标 / 促销贴纸，且都在争夺同一层级；
3. 用「信息量大 / 一屏看全」作为卖点文案，但正文需要缩放才能读；
4. 用「中文一屏能放 N 个商品」类的对比论证来支撑英文版布局。

阈值属 `编辑判断`；「显著高于同类」需 RAY-674 用同品类样本给出基线，本包不预设数字。

**反例**
文章的双栏对照：在导航/标签这类 chrome 里中文赢——五个带文字的 tab 是中文的特权，英文
"Notifications" 在 60px 的槽里放不下；但在正文里英文赢——把中文设到真正可读的字号、配上它
真正需要的行高，面积优势就没了。Coupé 等人 2019 年测了 17 种语言的受控朗读，信息率都聚在
约 39 bit/s：信息密度高的语言说得更慢，最后拉平。"Density buys space, but it doesn't buy time."

**改法**
正文 ≥ 14px、行高 1.5；一屏一个主 CTA，次要信息进折叠/次级页；促销信息做排期，不要同屏叠加；
不要拿「密度」当卖点。

**来源**
同上 §Pay for compression + §Notes；Coupé, Oh, Dediu & Pellegrino, *Different languages,
similar encoding efficiency*, Science Advances 5(9): eaaw2594, 2019（DOI 10.1126/sciadv.aaw2594）。

---

### MY-UI-07 用词补设计

**规则**
用「仅 / 一键 / 立即 / just / only / simply」这类小字去解释一个本来就不清楚的布局，是在拿语言
补设计的洞。中文里「仅」只占几个像素，补得上；翻成英文要多好几个字符，补不上，还更啰嗦。
**先改布局，再改词。**

**判据**
必报条件（任一）：

1. 主次两个动作按钮并排、语义相近（保存/发布、加入清单/直接发布），且靠「仅/just/only」区分；
2. 按钮文本 ≤ 5 个汉字却承载两个动作（例如「保存并发布」同时表示「存进合集」和「发布成清单」）；
3. 同一 CTA 在一屏内出现 ≥ 3 次，且措辞不一致；
4. 用「一键」修饰一个需要多步的操作。

**反例**
文章的 AI 画作例子：两个按钮并排，为了说明次按钮「只是存起来」，文案里加了个「仅」。作者的
结论是这一步就错了——"We are now compensating for a design problem with language. The buttons
shouldn't be put together at all." 正确做法是去掉「仅」，把 Publish List 移到右侧，用位置表达
主次。

**改法**
用位置、分组、尺寸表达主次；文案写全（"Save to collection" / "Publish as list"），不要用副词
省字；`aria-label` 保留完整语义（文章特别提醒：视觉上省掉的词，无障碍标签里要写全）。

**来源**
同上 §Don't patch with words。

---

### MY-UI-08 输入成本 / IME

**规则**
打字成本不是常数。英文 8 个键 = 8 个字母 = 8 个字形；中文「设置」6 个键 + 1 次候选选择只换来
2 个字形，而且选词要把视线从句子移开。凡是「假设用户在用拉丁键盘」的设计——硬限长、Enter
直接提交、空格自动转 `-`、命令面板只按拉丁匹配——都要单独查。

**判据**
静态可判（HTML/CSS/内联 JS）：

1. `maxlength` 或字符计数器与业务无关的硬上限（例如备注框 100 字、地址 30 字）；
2. 内联 `oninput` / `onkeydown` 把空格或非法字符替换成 `-`（只该用于 slug 字段）；
3. 内联 `onkeydown` 监听 Enter 提交，且没有 `event.isComposing` 判断；
4. 搜索框/命令面板的 placeholder 只有拉丁示例，且站点无拼音/分词搜索入口。

需 JS 或交互（本轮标「待抽取能力」，不当静态发现）：

5. IME 组合期按 Enter 选词时触发提交/发送；
6. 全局快捷键（⌘K、/、Esc）在输入法组合期抢键；
7. 命令面板只对拉丁名称建索引，CJK 命名内容搜不到。

排除：邮箱、电话、验证码等 Latin-only 字段不报。

**反例**
文章的键盘对照：`settings` 8 键 → 8 个字形；`设置` 6 键 + 1 次候选 → 2 个字形。文章列出的真实
坑：命令面板假设一切都是拉丁（Linear 的 ⌘K 是「未计价的输入」的活例子，所以中文产品的搜索
普遍支持拼音）；硬限输入长度；IME 用户用 Enter 选词却触发了提交；自动把空格转成 `-`。
"All of these point to one result: making people hard to type."

**改法**
Enter 提交前判 `event.isComposing`；长度限制表达业务上限，并给「还能输入 N 字」的可见反馈；
空格替换只用于 slug；搜索支持拼音与分词；快捷键避开组合期；错误提示不要在输入过程中打断。

**来源**
同上 §Price the input。

---

### MY-UI-09 声音层（register / idiom / rhythm）

**规则**
几何能翻译，声音不能。声音活在三个地方：语域（register）、习语（idiom）、节奏（rhythm）。
功能字符串（标签、字段名、错误原因、设置项）直译并守住 1–8；声音字符串（空状态、成功提示、
标语）**重写，不翻译**——翻过去会变调，重写还能保住原意。

**判据**
候选标记（半自动，需人工确认后才能写进报告）：

1. 文案里有高语域依赖的短句："Oops." / "Nice." / "You're all set." / "Hang tight."，或三词
   标题/口号（节奏本身是卖点）；
2. 同一页面语域混杂（您/你、正式/口语、机构腔/朋友腔）；
3. 页面层级依赖某个拉丁 display face 的字重/字宽（例如 300 与 800 两档都用它），字体栈却没有
   声明 CJK fallback——中文版整体退回系统字体，字重、字宽、行高全变（注意：只有「层级依赖它」
   才算候选，普通 Latin-only 字体栈是常态，不报）；
4. round-trip（EN→ZH→EN，或 ZH→EN→ZH）回来的版本变平、变幼稚或变官僚。

**反例**
文章的 round-trip 演示：`Get more done, together.` / `You're all set.` / `Nothing was lost.
Give it another go.` 翻成中文再翻回来会变平；"Let's get you set up" 在中文里要么幼稚要么官僚
——中文有 您/你 两档，中间几乎没有过渡，英文产品语域那条窄带对不上。字体部分：Inter 没有 CJK cut，中文只能落系统字体；
定制一套 CJK 字面是五位数预算、多年的工程（字符集上万）。结论是反直觉的：**声音越强，越难翻译**
（"the stronger your voice, the worse it translates."）。

**改法**
把字符串分两类：functional 直译（守住 1–8）；voice 重写（"if a string would embarrass you
coming back flat, write it fresh instead of translating it"）。字体栈显式写 CJK fallback 并
检查各字重；上线前做一次反向 round-trip，用你能判断的语言读结果。

**来源**
同上 §Don't translate vibe。

**证据限制**：这条无法只靠 HTML/CSS 判定，报告里只能以「候选 + 建议」出现；没做 round-trip
就不写成缺陷。

---

### MY-UI-10 镜像/RTL 与 Latin 假设遗留（记录，不进 MVP）

**规则**
两件事记在同一条，因为它们是同一个盲点：**语言假设被写进了布局和 API**。

- RTL：按**关系**布局，不按位置。编码顺序的东西（返回箭头、进度、滑块、步骤流）镜像；表现
  约定或实物的东西（时钟、播放控制、对勾）不动；数字不镜像——阿拉伯数字在 RTL 行里仍从左到右，
  一行里同时有两个方向，光标移动、选区、字符串索引都会悄悄失去原有含义。
- Latin 假设：`ch`/`ex` 按拉丁字形定义；`toUpperCase()` 假设 case 存在；排序、字符串长度、
  搜索分词、截断、大小写 API 都默认拉丁。CJK 标点挤压（`text-spacing-trim`）、中西文间距
  （`text-autospace`）、竖排（`writing-mode: vertical-rl`）是后续。

**判据**
1. 根节点加 `dir="rtl"` 后仍不镜像的元素：`left`/`right` 定位、`transform: translateX()`、
   绝对定位、写死的 flex `order`；被整体镜像的数字、图标、图表；
2. 显示层调用 `toUpperCase()` / `toLocaleUpperCase()`；
3. 按字节或字符长度截断/校验，而不是按字素簇；
4. 排序未用 `Intl.Collator`；搜索按空格分词（对 CJK 无效）——与 MY-UI-08 判据 7 同源；
5. 竖排用 `writing-mode` 生搬，未处理标点与中西文混排。

**反例**
文章的阿拉伯语面板：翻成 RTL，数一数哪些元素拒绝移动——拒绝移动的就是「位置」不是「关系」。
`toUpperCase()` 则是一个「假设 case 存在」的函数；作者的原话是每个抽象都会泄漏它被设计时用的
那门语言。

**改法**
逻辑属性（`margin-inline-start`、`inset-inline`）、flex/grid 自然顺序、数字与代码用 bidi
isolate；显示层不做 locale 无关的大小写变换；排序用 `Intl.Collator`；标点与竖排列入后续。

**来源**
同上 §Pass the mirror test + §Distrust the units + §Notes（"Test with `dir=\"rtl\"` on the root.
Whatever lands on the wrong side was a position, not a relationship."）；文章脚注 2 指向
Apple HIG *Right to Left*。

**状态**：按父单 RAY-672 的决定，RTL 本轮只记录，不做检测实现；Latin 假设部分作为 1–8 的
补充检查项。

---

## 3. 诊断报告例句（中英对照，可直接引用）

下面 5 组来自文章里的真实对照或可直接数出的字符差异；**没有编造像素测量值**。引用时把方括号
里的值换成页面实测值，不要照抄文章的 60px。

| # | 场景 | 中文 | 英文 | 机制 | 适用规则 |
| --- | --- | --- | --- | --- | --- |
| 1 | 底部导航 / tab | 通知（2 字） | Notifications（13 字符） | 中文两个字占的宽度，英文要 ~70px；60px 的槽放不下 | 01 / 02 |
| 2 | 设置项标签 | 后台应用刷新（6 字） | Background App Refresh（22 字符） | 同一行英文多占一行，把下方开关挤出首屏 | 02 / 03 |
| 3 | 提示条 | 国际化设置在该工作区中不可用。（15 字） | Internationalization settings are unavailable in this workspace.（64 字符） | 英文 min-content 由不可断的 "Internationalization"（20 字符）决定 | 03 |
| 4 | 次级按钮 | 仅保存（3 字） | Just save（9 字符） | 「仅」在中文里只占几像素，英文多 5 个字符且仍说不清主次 | 07 |
| 5 | 输入框 / 搜索 | 设置（6 键 + 1 次选词 → 2 字） | settings（8 键 → 8 字） | 中文输入成本高，硬限长 / Enter 提交会放大成本 | 08 |

可直接用的报告句（替换方括号里的实测值）：

1. 「导航项『通知』在中文下是 2 个字；英文 'Notifications' 需要约 70px，而当前容器只有
   [60px]——英文版会被截断（'Notific…' 之类），信息直接丢失。改法：允许标签换行，或把导航项
   的最小宽度提到 [72px]，而不是加省略号。」

2. 「设置项『后台应用刷新』6 个字，英文 'Background App Refresh' 22 个字符；同一行在英文下会
   多占一行，把下方的开关挤出首屏。改法：行高按内容撑开，不要固定行高。」

3. 「提示条中文 15 个字，英文 64 个字符，而且 'Internationalization' 是不可断的单词——容器的
   min-content 由这个 20 字符的词决定，宽度不够时英文会整词溢出而不是换行。改法：给容器最小
   宽度，让提示条换行并撑高。」

4. 「『仅保存』的『仅』在中文里只占几个像素，英文 'Just save' 要多 5 个字符，而且仍然说不清
   主次。改法：移除『仅』，把『发布为清单』移到右侧，用位置表达主次。」

5. 「搜索框把 `maxlength` 设为 [20] 并按 Enter 直接提交：中文用户输入 6 个键才换来 2 个字，
   第 [20] 个字就撞上限；选词时按 Enter 还会误触发提交。改法：长度按业务上限给足，Enter
   提交前判 `event.isComposing`。」

声音层例句（`编辑判断`，必须做完 round-trip 才能写进报告，且只能写成建议）：

- 「空状态 'You're all set.' 直译后往往变平（如『全部设置好了』），原文那种收尾的轻松感会丢；
  这类字符串应重写而不是翻译。当前中文版用的是 [X]，建议改为 [Y]，并在 EN→ZH→EN 后复核语气。」

马来文方向（`编辑判断`，本包未做实测，只能作提示不能作证据）：马来西亚电商常见
"Add to Cart" → "Tambah ke Troli"、"Download" → "Muat turun" 这类变长；如需马来文例句，先取
该站真实马来文版本字符串，不要用词典直译。

---

## 4. 报告写法与红线

**三段式**：现象（哪个元素、什么证据）→ 为什么会坏（机制，引用规则 ID）→ 怎么改（可执行）。

- 证据写选择器或文本片段 + 规则 ID，例如：`#tab-description li.tablinks a` 命中 MY-UI-02
  （`max-width:200px` + `nowrap` + `ellipsis`）。
- 结论必须带目标语言：同一句中文在英文下溢出，在日文下可能刚好——不写目标语言的结论不成立。
- 证据等级要写在报告里：`静态复核` / `需要交互复核` / `仅候选（声音层）`。

**红线**：

- 不写「亚洲 UI 丑」「设计不高级」「颜色太杂」；写「层级只由颜色承载，换语言后不成立」。
- 没有复核（`scrollWidth > clientWidth` / 真实目标语字符串）就不报——宁缺勿假阳性。
- 声音层没做 round-trip 不写成缺陷；IME 的运行时行为没跑过不写成确定结论。
- 不把推文当结论；推文只能作为「为什么值得查」的背景。
- 不把 `编辑判断` 的阈值写成规范（1.4 探针、2px 字号差、3 种颜色、12px 下限都是筛查阈值）。

---

## 5. 与现有知识库的关系 / 接入方式

- 归属：`content`「信息层级与表达自然度」维度下的子检查，**不新增维度、不改现有 40 条规则的
  权重**（与父单 RAY-672 的决定一致）。
- 本文件是规则正文；`index.json` 的可合并片段见附录 A，**尚未写入** `index.json`——避免在阈值
  未校准前改变诊断 prompt 与报告输出。
- 接入顺序建议（由 RAY-674 定）：
  1. 第一批（静态，纯 DOM/CSS/文本）：MY-UI-01/02/03/04/07；
  2. 第二批（需同屏统计与基线）：MY-UI-05 的颜色/字号计数、MY-UI-06 的密度基线；
  3. 第三批（需 JS 或交互）：MY-UI-08；
  4. MY-UI-09 走人工清单 + round-trip，不进自动打分；
  5. MY-UI-10 记录，不进 MVP。

---

## 6. 已验证 / 未验证

**已验证（本次直接读取）**

- Rene Wang 文章全文（2026-11-13 抓取），§Atom and Wrap / §Pay for compression /
  §Don't patch with words / §Count your channels / §Pass the mirror test / §Distrust the units /
  §Price the input / §Don't translate vibe / §Notes 的表述与例句均按原文引用。
- MDN `word-break`、`hyphens`、`text-overflow` 的行为描述（2026-11-13 抓取）。

**佐证（权威二手，未读原文）**

- Coupé et al. 2019 的「17 种语言、约 39 bit/s」：science.org 返回 403，未能读原文；该数字由
  文章脚注与 CNRS/ScienceDaily 新闻稿相互印证（见 §7）。

**未验证 / 待核**

1. 马来文、德文相对英文的实际膨胀率——本包没有实测数据集，1.4 只是筛查阈值。
2. 各阈值（2px 字号差、3 种强调色、12/14px 字号下限）在真实马来西亚电商页上的分布。
3. 推文原帖：未取得链接与截图原件，只有父单 RAY-672 的转述，本包不引用其具体断言。
4. bears.com.my 上的实际截断：只在主题 CSS 里看到信号（见 §7「代码层样本」），没有做渲染
   复核，不能据此下结论。
5. IME 的运行时行为（Enter 选词、快捷键抢键）需要交互测试，本包只给静态线索。
6. 声音层：没有做真实 round-trip 语料，MY-UI-09 的判据只是候选清单。
7. `word-break: auto-phrase` 的浏览器覆盖与 `Intl.Segmenter` 断点在马来文上的效果。

---

## 7. 来源清单（访问日期 2026-11-13）

1. **Rene Wang, *Build Interfaces That Survive Translation***（2026-08-24，页面标注
   "Updated 2 months ago"）：https://rene.wang/essay/build-interfaces-that-survive-translation
   —— 本包 10 条规则的主要来源。
2. **Coupé, C., Oh, Y., Dediu, D. & Pellegrino, F. (2019).** Different languages, similar
   encoding efficiency: Comparable information rates across the human communicative niche.
   *Science Advances* 5(9): eaaw2594. DOI: 10.1126/sciadv.aaw2594（原文 403，数字经新闻稿交叉核对）
3. CNRS / ScienceDaily 新闻稿（2019-09-05，「17 种语言、约 39 bits per second」）：
   https://www.sciencedaily.com/releases/2019/09/190905124520.htm
4. **MDN `word-break`**：
   https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/word-break
5. **MDN `hyphens`**：
   https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/hyphens
6. **MDN `text-overflow`**：
   https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-overflow
7. **WCAG 2.2 SC 1.4.1 Use of Color**：
   https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
8. **Apple HIG, Right to Left**（文章脚注 2 指向，本包未逐页核对）：
   https://developer.apple.com/design/human-interface-guidelines/right-to-left

**代码层样本（bears.com.my，仅记录，未做渲染复核）**

- `https://bears.com.my/catalog/view/theme/aio/stylesheet/aio.css?ver=1794588257`
  （2026-11-13 抓取）：`#tab-description li.tablinks a { max-width: 200px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; }` —— MY-UI-02 的同类信号；另外
  `#module-sales-campaign .sc-timer .sc-campaign-title span` 用 `nowrap` + `line-clamp: 1` +
  `ellipsis`。首页 HTML 为 `lang="en-US"`、`dir="ltr"`；若该站提供多语切换，需确认切换后
  `lang` 是否同步更新（本包未验证，与 MY-UI-03 的判据 2 相关）。这些只是 CSS/HTML 层信号，
  **是否真的截断要看渲染后的 `scrollWidth`**，由 RAY-674 复核。

**不作为来源**

- Luckforest 关于 Lazada 11.11 的推文：未取得原帖与截图原件，仅有父单转述。本包不引用其
  「Asian UI」结论，只把它当作选题背景。

---

## 附录 A：`index.json` 片段（草稿，未接入）

字段与现有 40 条规则一致；`signals` 为草稿值，**多为结构信号**（从 CSS/HTML 取，不是文案词），
需 RAY-674 按实际抽取能力调整。建议挂到 `dimensions[id=content].rules` 末尾；MY-UI-09/10
不给片段（人工/记录，避免自动打分）。

```json
{
  "dimension": "content",
  "rules": [
    {
      "id": "MY-UI-01",
      "severity_hint": "high",
      "applies_to": "按钮、导航项、标签页、徽章、表头、商品卡标题等可翻译标签",
      "rule": "宽度不能按字符数写；min-width 用视觉单位，JS 限长不能当布局兜底。",
      "why": "CJK 是定宽原子，英文/德文/马来文是变长原子；24ch 在中文下远远放不下，JS 限长也救不了。",
      "fix": "min-width 用 px/rem；容器允许增长；长度限制只表达业务上限。",
      "signals": [],
      "source": {"type": "secondary", "title": "Rene Wang, §Atom and Wrap / §Distrust the units", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-02",
      "severity_hint": "high",
      "applies_to": "导航、tab 条、表格头、商品卡标题、按钮",
      "rule": "放不下时默认换行/撑高，截断只能是显式策略，且要有 title/aria-label 全文出口。",
      "why": "nowrap+overflow:hidden+ellipsis 三件套会在目标语言变长时直接丢信息；德文截断行高度不变，说明长度被丢掉而不是吸收。",
      "fix": "让标签换行、行/列表/面板长高；只有不能换行时才截断，并补全文出口。",
      "signals": ["nowrap", "text-overflow", "ellipsis", "line-clamp"],
      "source": {"type": "secondary", "title": "Rene Wang, §Atom and Wrap", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-03",
      "severity_hint": "high",
      "applies_to": "正文、标题、设置项、多语混排段落",
      "rule": "断行要同时保住比例与语义；用 lang 驱动断词，按 Intl.Segmenter 词缝断，不用 break-all 硬切。",
      "why": "英文空格是免费的语义缝，CJK 没有；break-all 在任意两字符间断开且不显示连字符，缺 lang 时 hyphens:auto 不生效。",
      "fix": "标注 lang；CJK 用 word-break:normal + line-break（或 Segmenter 断点）；拉丁用 overflow-wrap:anywhere；段落 text-wrap:pretty。",
      "signals": ["break-all", "hyphens", "auto-phrase", "line-break"],
      "source": {"type": "secondary", "title": "Rene Wang, §Atom and Wrap / §Notes", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-04",
      "severity_hint": "medium",
      "applies_to": "lang 为 zh/ja 的页面正文、说明文字、表单标签",
      "rule": "CJK 可读性下限更高：lang=zh/ja 时正文 ≥12px 是下限，10/11px 必须单独查。",
      "why": "中文的区分特征是内部笔画的高空间频率（未/末、己/已/巳），像素不够就糊；拉丁靠外形轮廓，10px 仍可读。",
      "fix": "正文 ≥14px，行高 1.5；不要用缩放/缩小字号解决溢出。",
      "signals": [],
      "source": {"type": "secondary", "title": "Rene Wang, §Pay for compression / §Notes", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-05",
      "severity_hint": "medium",
      "applies_to": "同一视图内的标题、正文、标签、状态标记",
      "rule": "层级只能用目标语言真正提供的通道；颜色/框线不能是唯一通道。",
      "why": "拉丁有 case/italic/weight/small caps/letterspacing 五个通道，CJK 只有 weight；CJK 界面常拿颜色和框线补层级，换到无 case 的语言后这一层消失。",
      "fix": "列出目标语言可用通道再搭层级；CJK 用字号+字重+留白，颜色只做状态；同屏强调色 ≤2。",
      "signals": ["uppercase"],
      "source": {"type": "secondary", "title": "Rene Wang, §Count your channels", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-06",
      "severity_hint": "medium",
      "applies_to": "首屏、分类页、促销区",
      "rule": "密度买空间不买时间；不要用「中文能放下」证明英文/马来文也放得下。",
      "why": "Coupé 2019 测得 17 种语言信息率约 39 bit/s，密度高的语言语速更慢；正文里中文的面积优势在可读字号下消失。",
      "fix": "正文 ≥14px、行高 1.5；一屏一个主 CTA；促销信息排期，不要同屏叠加。",
      "signals": [],
      "source": {"type": "secondary", "title": "Rene Wang, §Pay for compression；Coupé et al. 2019", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-07",
      "severity_hint": "medium",
      "applies_to": "主次按钮、CTA、表单动作",
      "rule": "不要用「仅/一键/立即/just」补布局；先改布局，再改词，aria-label 写全。",
      "why": "「仅」在中文只占几像素，英文要多几个字符且仍说不清主次；这是拿语言补设计的洞。",
      "fix": "用位置/分组/尺寸表达主次；文案写全；aria-label 保留完整语义。",
      "signals": ["仅", "一键", "立即"],
      "source": {"type": "secondary", "title": "Rene Wang, §Don't patch with words", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    },
    {
      "id": "MY-UI-08",
      "severity_hint": "medium",
      "applies_to": "表单、搜索、命令面板、快捷键、错误提示",
      "rule": "输入成本不是常数：硬限长、Enter 直接提交、空格转 -、只按拉丁索引的搜索都会放大 CJK 用户的成本。",
      "why": "英文 8 键=8 字形，中文 6 键+选词=2 字形；IME 用 Enter 选词会误触发提交；命令面板假设一切是拉丁。",
      "fix": "Enter 提交判 event.isComposing；长度按业务上限；搜索支持拼音/分词；快捷键避开组合期。",
      "signals": ["maxlength", "iscomposing", "pinyin"],
      "source": {"type": "secondary", "title": "Rene Wang, §Price the input", "url": "https://rene.wang/essay/build-interfaces-that-survive-translation"},
      "accessed": "2026-11-13",
      "confidence": "佐证"
    }
  ]
}
```
