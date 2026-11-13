#!/usr/bin/env python3
"""界面可翻译性（translation survivability）信号抽取。

这一层只做「取证」：把页面里跟「换一种语言会不会溢出、被裁掉、层级塌掉」有关的
计算样式抽出来，不下判断、不评分。规则与阈值在 TypeScript 侧
（src/interface/rules.ts + src/interface/analyze.ts），可以用 node:test 覆盖；
Python 只负责拿到接近浏览器渲染时的那份声明与尺寸。

抽取内容：
- 文档级：<html lang>、dir、viewport、原始 <html ...> 开标签；
- 样式来源：<style> 内联块 + <link rel=stylesheet> 同源外链（限数量、限体积）；
- 元素级：带可见文本的元素，按 CSS 层叠 + 继承算出最终生效值，并把
  em/rem/%/关键字归一成 px；同时沿祖先链估算内容区宽度（container_px）。

它不是浏览器：不执行 JS、不做真正的排版。宽高来自声明而不是测量，
文本宽度在 TS 侧按字符类别估算，所以报告里给出的是「估算余量」而不是精确像素。
"""

from __future__ import annotations

import re
from typing import Any, Iterable
from urllib.parse import urljoin, urlparse

# 与「换语言后会不会坏」有关的声明，其余属性不进 payload。
TRACKED_PROPERTIES: frozenset[str] = frozenset(
    {
        "font-size",
        "font-weight",
        "font-style",
        "font-family",
        "color",
        "background-color",
        "border",
        "border-width",
        "border-radius",
        "line-height",
        "letter-spacing",
        "text-transform",
        "font-family",
        "white-space",
        "overflow",
        "overflow-x",
        "text-overflow",
        "word-break",
        "overflow-wrap",
        "word-wrap",
        "hyphens",
        "width",
        "max-width",
        "min-width",
        "height",
        "max-height",
        "-webkit-line-clamp",
        "line-clamp",
        "display",
        "flex",
        "flex-direction",
        "flex-wrap",
        "grid-template-columns",
        "padding",
        "padding-left",
        "padding-right",
    }
)

# 会被子元素继承的声明。
INHERITED_PROPERTIES: frozenset[str] = frozenset(
    {
        "font-size",
        "font-weight",
        "font-style",
        "font-family",
        "color",
        "line-height",
        "letter-spacing",
        "text-transform",
        "white-space",
        "word-break",
        "overflow-wrap",
        "hyphens",
    }
)

# JS 状态、伪元素、打印样式：静态抓取时看到的值不代表用户看到的值。
SKIP_SELECTOR = re.compile(
    r"::?(before|after|placeholder|selection|first-line|first-letter|marker|backdrop)\b"
    r"|:(hover|focus|active|visited|focus-within|focus-visible|checked|disabled|target|link)\b",
    re.IGNORECASE,
)

# 可点元素：MY-UI-06 用它数首屏 CTA 密度，MY-UI-07 用它找并列的主次动作。
INTERACTIVE_TAGS = frozenset({"a", "button"})
INTERACTIVE_ROLES = frozenset({"button", "link", "tab", "menuitem"})

# 表单/输入：MY-UI-08 只看这些元素的静态属性（不跑交互）。
FORM_TAGS = frozenset({"input", "textarea", "select", "form", "label"})

# 字体栈里出现这些词就当「已声明 CJK 回退」（MY-UI-09 判据 3）。
CJK_FONT_HINTS = (
    "cjk",
    "han",
    "hei",
    "song",
    "kai",
    "ming",
    "yahei",
    "pingfang",
    "noto sans sc",
    "noto serif sc",
    "source han",
    "hiragino",
    "ms gothic",
    "malgun",
    "sarabun",
)

SKIP_TAGS = frozenset(
    {
        "script",
        "style",
        "noscript",
        "template",
        "head",
        "meta",
        "link",
        "title",
        "svg",
        "path",
        "iframe",
        "canvas",
        "input",
        "select",
        "textarea",
        "option",
        "br",
        "hr",
    }
)

# 评估视口：桌面 1280。百分比宽度沿祖先链按这个基准折算。
VIEWPORT_PX = 1280
ROOT_FONT_PX = 16.0

MAX_ELEMENTS = 600
MAX_TEXT_CHARS = 180
MAX_SHEETS = 6
MAX_SHEET_BYTES = 500_000
MAX_INLINE_CSS_CHARS = 200_000


# --------------------------------------------------------------------------- CSS


def _strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)


def _iter_blocks(css: str) -> Iterable[tuple[str, str]]:
    """把样式表切成 (prelude, body)；@media/@supports 递归展开，@font-face 等跳过。"""
    depth = 0
    start = 0
    prelude = ""
    body_start = 0
    index = 0
    length = len(css)
    while index < length:
        char = css[index]
        if char == "{":
            if depth == 0:
                prelude = css[start:index].strip()
                body_start = index + 1
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                body = css[body_start:index]
                index += 1
                start = index
                if prelude.startswith("@"):
                    lowered = prelude.lower()
                    if lowered.startswith("@media"):
                        if _media_matches(lowered):
                            yield from _iter_blocks(body)
                    elif lowered.startswith("@supports"):
                        yield from _iter_blocks(body)
                elif prelude:
                    yield prelude, body
                continue
        index += 1


def _media_matches(prelude: str) -> bool:
    """只取桌面视口：跳过 print 与 max-width < 768px 的移动端覆盖。"""
    if re.search(r"\bprint\b", prelude):
        return False
    for value in re.findall(r"max-width\s*:\s*(\d+(?:\.\d+)?)\s*px", prelude):
        if float(value) < 768:
            return False
    return True


def parse_declarations(body: str) -> dict[str, tuple[str, bool]]:
    """解析成 {property: (value, important)}，只保留 TRACKED_PROPERTIES。"""
    decls: dict[str, tuple[str, bool]] = {}
    for chunk in body.split(";"):
        if ":" not in chunk:
            continue
        prop, _, value = chunk.partition(":")
        prop = prop.strip().lower()
        if prop not in TRACKED_PROPERTIES:
            continue
        value = re.sub(r"\s+", " ", value).strip()
        if not value:
            continue
        important = value.lower().endswith("!important")
        if important:
            value = value[: -len("!important")].strip()
        decls[prop] = (value, important)
    return decls


def _specificity(selector: str) -> tuple[int, int, int]:
    """(id, class/attr/pseudo-class, 元素/伪元素) —— 够用的近似值。"""
    ids = len(re.findall(r"#[\w-]+", selector))
    classes = len(re.findall(r"\.[\w-]+", selector))
    attrs = len(re.findall(r"\[[^\]]*\]", selector))
    pseudo_classes = len(re.findall(r"(?<!:):(?!:)[\w-]+", selector))
    stripped = re.sub(r"#[\w-]+", " ", selector)
    stripped = re.sub(r"\.[\w-]+", " ", stripped)
    stripped = re.sub(r"\[[^\]]*\]", " ", stripped)
    stripped = re.sub(r"::?[\w-]+(\([^)]*\))?", " ", stripped)
    tags = len(re.findall(r"(?<![\w-])[a-zA-Z][\w-]*", stripped))
    pseudo_elements = len(re.findall(r"::[a-zA-Z-]+", selector))
    return ids, classes + attrs + pseudo_classes, tags + pseudo_elements


class CssRule:
    __slots__ = ("selector", "declarations", "order", "specificity")

    def __init__(
        self, selector: str, declarations: dict[str, tuple[str, bool]], order: int
    ) -> None:
        self.selector = selector
        self.declarations = declarations
        self.order = order
        self.specificity = _specificity(selector)


def parse_stylesheet(css: str, order_start: int = 0) -> tuple[list[CssRule], int]:
    rules: list[CssRule] = []
    order = order_start
    for prelude, body in _iter_blocks(_strip_comments(css)):
        declarations = parse_declarations(body)
        if not declarations:
            continue
        for selector in prelude.split(","):
            selector = selector.strip()
            if not selector or SKIP_SELECTOR.search(selector):
                continue
            order += 1
            rules.append(CssRule(selector, declarations, order))
    return rules, order


def _sheet_urls(response: Any) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    try:
        links = response.css('link[rel~="stylesheet"][href]')
    except Exception:
        return urls
    for link in links:
        href = (link.attrib.get("href") or "").strip()
        if not href or href.startswith("data:"):
            continue
        absolute = urljoin(response.url, href)
        if absolute in seen:
            continue
        seen.add(absolute)
        urls.append(absolute)
    return urls


def _inline_css(response: Any) -> tuple[str, int]:
    chunks: list[str] = []
    size = 0
    try:
        blocks = response.css("style")
    except Exception:
        return "", 0
    for block in blocks:
        # get_all_text() 会跳过 style（按「可见文本」处理），样式表内容只在 _root.text 里。
        raw = getattr(block, "_root", block)
        text = (getattr(raw, "text", "") or "") + "".join(
            child.tail or "" for child in raw if isinstance(child.tag, str)
        )
        if not text.strip():
            continue
        if size + len(text) > MAX_INLINE_CSS_CHARS:
            break
        chunks.append(text)
        size += len(text)
    return "\n".join(chunks), len(blocks)


def _same_origin(a: str, b: str) -> bool:
    try:
        pa, pb = urlparse(a), urlparse(b)
    except ValueError:
        return False
    return pa.scheme == pb.scheme and pa.netloc == pb.netloc


def collect_rules(response: Any, fetcher: Any, max_sheets: int = MAX_SHEETS) -> dict[str, Any]:
    """内联 <style> 优先，然后按文档顺序取同源外链 CSS。单个样式表失败不影响整体。"""
    inline_css, inline_blocks = _inline_css(response)
    rules, order = parse_stylesheet(inline_css, 0)
    stats = {
        "linked": 0,
        "fetched": 0,
        "failed": 0,
        "inline_blocks": inline_blocks,
        "rules": len(rules),
    }

    linked = _sheet_urls(response)
    stats["linked"] = len(linked)
    origin = str(getattr(response, "url", "") or "")

    for url in linked:
        if stats["fetched"] >= max_sheets:
            break
        if origin and not _same_origin(origin, url):
            continue
        try:
            sheet = fetcher.get(url, timeout=20, stealthy_headers=True, follow_redirects=True)
        except Exception:
            stats["failed"] += 1
            continue
        css = getattr(sheet, "html_content", "") or ""
        if not css or len(css) > MAX_SHEET_BYTES:
            stats["failed"] += 1
            continue
        parsed, order = parse_stylesheet(css, order)
        if not parsed:
            stats["failed"] += 1
            continue
        rules.extend(parsed)
        stats["fetched"] += 1
        stats["rules"] += len(parsed)
    return {"rules": rules, "stats": stats}


# ------------------------------------------------------------------- 元素与尺寸


def _element_key(element: Any) -> str:
    """文档内绝对 XPath 作为身份：lxml 的代理对象会在 GC 后重建，id() 不可靠。"""
    try:
        return element.getroottree().getpath(element)
    except Exception:
        return ""


def _match_elements(response: Any, rules: list[CssRule]) -> dict[str, list[CssRule]]:
    """把选择器解析成元素。同一个选择器只求值一次；无效选择器直接跳过。"""
    by_element: dict[str, list[CssRule]] = {}
    cache: dict[str, list[str]] = {}
    for rule in rules:
        key = rule.selector
        identifiers = cache.get(key)
        if identifiers is None:
            try:
                identifiers = [
                    path
                    for path in (_element_key(match._root) for match in response.css(key))
                    if path
                ]
            except Exception:
                identifiers = []
            cache[key] = identifiers
        for identifier in identifiers:
            by_element.setdefault(identifier, []).append(rule)
    return by_element


def _cascade(element_rules: list[CssRule], inline_style: str) -> dict[str, str]:
    """按 (important, specificity, 出现顺序) 合并；inline style 视为最高特异性。"""
    if inline_style:
        inline = parse_declarations(inline_style)
        element_rules = element_rules + [CssRule(":inline", inline, 1 << 20)]
    best: dict[str, tuple[tuple[int, int, int, int], str]] = {}
    for rule in element_rules:
        for prop, (value, important) in rule.declarations.items():
            rank = (1 if important else 0, *rule.specificity, rule.order)
            current = best.get(prop)
            if current is None or rank >= current[0]:
                best[prop] = (rank, value)
    return {prop: value for prop, (_, value) in best.items()}


_NUMERIC = re.compile(r"^(-?\d+(?:\.\d+)?)(px|rem|em|%|pt)?$", re.IGNORECASE)


def _length_px(value: str | None, base_px: float, root_px: float = ROOT_FONT_PX) -> float | None:
    """把长度归一成 px；auto/关键字/未知单位返回 None（宁可不判，也不猜）。"""
    if not value:
        return None
    text = value.strip().lower()
    if text in ("auto", "none", "normal", "inherit", "initial", "unset", "fit-content", "max-content", "min-content"):
        return None
    match = _NUMERIC.match(text)
    if not match:
        return None
    number = float(match.group(1))
    unit = (match.group(2) or "px").lower()
    if unit == "px":
        return number
    if unit == "rem":
        return number * root_px
    if unit == "em":
        return number * base_px
    if unit == "%":
        return number / 100.0 * base_px
    if unit == "pt":
        return number * 96.0 / 72.0
    return None


def _percent(value: str | None) -> float | None:
    if not value:
        return None
    text = value.strip().lower()
    if not text.endswith("%"):
        return None
    try:
        return float(text[:-1]) / 100.0
    except ValueError:
        return None


def _padding_lr(style: dict[str, str]) -> tuple[float, float]:
    left = _length_px(style.get("padding-left"), 16.0)
    right = _length_px(style.get("padding-right"), 16.0)
    if left is not None and right is not None:
        return left, right
    shorthand = style.get("padding")
    if not shorthand:
        return left or 0.0, right or 0.0
    parts = shorthand.split()
    values = [_length_px(part, 16.0) for part in parts]
    numbers = [value for value in values if value is not None]
    if not numbers:
        return left or 0.0, right or 0.0
    if len(numbers) == 1:
        lr = numbers[0]
    else:
        lr = numbers[1]
    return left if left is not None else lr, right if right is not None else lr


def _border_px(style: dict[str, str]) -> float:
    explicit = _length_px(style.get("border-width"), 16.0)
    if explicit is not None:
        return explicit
    raw = style.get("border")
    if not raw:
        return 0.0
    if re.search(r"\b(none|hidden)\b", raw):
        return 0.0
    match = re.match(r"^\s*(-?\d+(?:\.\d+)?)(px|rem|em|pt)\b", raw)
    if not match:
        return 0.0
    return _length_px(match.group(1) + match.group(2), 16.0) or 0.0


def _line_height_px(value: str | None, font_size_px: float) -> float:
    if not value:
        return round(font_size_px * 1.2, 2)
    text = value.strip().lower()
    if text in ("normal", "inherit", "initial", "unset"):
        return round(font_size_px * 1.2, 2)
    if _NUMERIC.match(text) and (text.replace(".", "").isdigit()):
        # 无单位 = 相对 font-size 的倍数
        return round(float(text) * font_size_px, 2)
    resolved = _length_px(text, font_size_px)
    return round(resolved, 2) if resolved is not None else round(font_size_px * 1.2, 2)


def _line_clamp(style: dict[str, str]) -> int | None:
    for prop in ("-webkit-line-clamp", "line-clamp"):
        raw = style.get(prop)
        if not raw:
            continue
        match = re.search(r"\d+", raw)
        if match:
            return int(match.group(0))
    return None


def _resolve_keywords(style: dict[str, str], inherited: dict[str, str]) -> dict[str, str]:
    """inherit/unset 取父元素的值，initial 视为「未声明」；否则属性字符串会污染统计。"""
    resolved: dict[str, str] = {}
    for prop, value in style.items():
        keyword = value.strip().lower()
        if keyword in ("inherit", "unset"):
            parent_value = inherited.get(prop)
            if parent_value:
                resolved[prop] = parent_value
        elif keyword == "initial":
            continue
        else:
            resolved[prop] = value
    return resolved


# 一排 flex/grid 子项等分父容器；只用于「没有自己写宽度」的子项，属于估算。
_ROW_DISPLAYS = frozenset({"flex", "inline-flex", "grid", "inline-grid"})


def _share_row_width(
    node: Any, style: dict[str, str], inner_width: float, shared_width: dict[str, float]
) -> None:
    display = (style.get("display") or "").strip().lower()
    if display not in _ROW_DISPLAYS or inner_width <= 0:
        return
    if display.startswith("flex") and (style.get("flex-direction") or "row").strip().lower() in (
        "column",
        "column-reverse",
    ):
        return
    children = [child for child in node if isinstance(child.tag, str)]
    if not 2 <= len(children) <= 8:
        return
    columns = len(children)
    if display.startswith("grid"):
        template = style.get("grid-template-columns") or ""
        repeat = re.search(r"repeat\(\s*(\d+)", template)
        if repeat:
            columns = max(1, min(8, int(repeat.group(1))))
        else:
            columns = len([part for part in template.split() if part]) or columns
    # 一屏最多按 4 列估：宁可高估容器宽度（少报），也不要低估（误报）。
    columns = min(columns, 4)
    share = inner_width / max(1, columns)
    for child in children:
        shared_width.setdefault(_element_key(child), share)


def _is_hidden(style: dict[str, str], element: Any) -> bool:
    if (style.get("display") or "").lower() == "none":
        return True
    if (element.get("aria-hidden") or "").lower() == "true":
        return True
    if element.get("hidden") is not None:
        return True
    inline = (element.get("style") or "").lower()
    return "display:none" in inline.replace(" ", "")


def _text_of(element: Any) -> str:
    """元素内的可见文本；跳过 script/style 等不可见子树。"""
    parts: list[str] = []
    if element.text:
        parts.append(element.text)
    for child in element:
        if isinstance(child.tag, str) and child.tag.lower() in SKIP_TAGS:
            continue
        parts.append(_text_of(child))
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def _css_path(element: Any) -> str:
    """生成稳定、可粘贴到 DevTools 的 CSS 选择器：id 优先，其次 tag.class + nth-of-type。"""
    parts: list[str] = []
    node = element
    while node is not None and isinstance(node.tag, str) and node.tag.lower() not in ("html", "body"):
        node_id = (node.get("id") or "").strip()
        if node_id and " " not in node_id:
            parts.append(f"#{node_id}")
            break
        segment = node.tag.lower()
        classes = [c for c in (node.get("class") or "").split() if c][:2]
        if classes:
            segment += "." + ".".join(classes)
        parent = node.getparent()
        if parent is not None:
            same_tag = [s for s in parent if isinstance(s.tag, str) and s.tag == node.tag]
            if len(same_tag) > 1:
                segment += f":nth-of-type({same_tag.index(node) + 1})"
        parts.append(segment)
        node = node.getparent()
        if len(parts) >= 6:
            break
    selector = " > ".join(reversed(parts)) or element.tag.lower()
    return selector[:160]


def _long_tokens(elements: list[dict[str, Any]], min_length: int = 14) -> list[dict[str, str]]:
    """页面上没有空格、无法自然断行的长词（马来语复合词、品牌名、ALL-CAPS 标签）。"""
    found: list[dict[str, str]] = []
    seen: set[str] = set()
    for element in elements:
        for token in re.findall(r"[A-Za-z][A-Za-z'-]{%d,}" % (min_length - 1), element["text"]):
            lowered = token.lower()
            if lowered in seen:
                continue
            seen.add(lowered)
            found.append(
                {"token": token[:40], "selector": element["selector"], "text": element["text"][:80]}
            )
            if len(found) >= 12:
                return found
    return found


_CJK_SEARCH_HINTS = re.compile(r"[\u4e00-\u9fff]")

# 只对「人写的自然语言」限长有意义；邮箱/电话/验证码这类字段不参与（规则包排除项）。
NON_TEXT_INPUT_TYPES = frozenset(
    {
        "hidden",
        "submit",
        "button",
        "reset",
        "image",
        "file",
        "checkbox",
        "radio",
        "email",
        "tel",
        "password",
        "number",
        "date",
        "time",
        "datetime-local",
        "month",
        "week",
        "color",
        "range",
        "url",
    }
)


def _inline_handlers(node: Any) -> dict[str, str]:
    """内联事件属性：Scrapling 的 Selector 没有 lxml 的 get()，统一走 _root。"""
    handlers: dict[str, str] = {}
    raw = getattr(node, "_root", node)
    for name in ("onkeydown", "onkeyup", "onkeypress", "oninput", "onchange", "onsubmit"):
        value = raw.get(name)
        if value:
            handlers[name] = re.sub(r"\s+", " ", value).strip()
    return handlers


def _collect_forms(response: Any) -> list[dict[str, Any]]:
    """静态表单快照：MY-UI-08 只看属性与内联 JS，不执行任何交互。"""
    records: list[dict[str, Any]] = []
    seen: set[tuple[Any, ...]] = set()
    try:
        nodes = response.css("input, textarea, select, form")
    except Exception:
        return records
    for node in nodes:
        raw = getattr(node, "_root", node)
        tag = (raw.tag or "").lower()
        attrib = {k: (v or "") for k, v in raw.attrib.items()}
        handlers = _inline_handlers(node)
        record: dict[str, Any] = {
            "selector": _css_path(raw),
            "tag": tag,
            "type": (attrib.get("type") or ("textarea" if tag == "textarea" else "")).strip().lower() or None,
            "name": (attrib.get("name") or "").strip() or None,
            "placeholder": (attrib.get("placeholder") or "").strip() or None,
            "maxlength": _int_attr(attrib.get("maxlength")),
            "minlength": _int_attr(attrib.get("minlength")),
            "autocomplete": (attrib.get("autocomplete") or "").strip() or None,
            "inputmode": (attrib.get("inputmode") or "").strip() or None,
            "aria_label": (attrib.get("aria-label") or "").strip() or None,
            "handlers": handlers,
            "inside_form": tag == "form"
            or (raw.getparent() is not None and _has_form_ancestor(raw)),
        }
        if tag == "form":
            record["action"] = (attrib.get("action") or "").strip() or None
            record["method"] = (attrib.get("method") or "").strip().lower() or None
        # 同构模板里的重复控件（每个商品卡一个隐藏 input）合并成一条，避免 payload 膨胀。
        signature = (record["selector"], record["tag"], record["type"], record["maxlength"], record["name"])
        if signature in seen:
            continue
        seen.add(signature)
        records.append(record)
    return records


def _has_form_ancestor(node: Any) -> bool:
    parent = node.getparent()
    depth = 0
    while parent is not None and depth < 12:
        if isinstance(parent.tag, str) and parent.tag.lower() == "form":
            return True
        parent = parent.getparent()
        depth += 1
    return False


def _int_attr(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _viewport(response: Any) -> str | None:
    try:
        found = response.css('meta[name="viewport"]::attr(content)').get()
    except Exception:
        return None
    return (found or "").strip() or None


def _html_open_tag(html: str) -> str:
    match = re.search(r"<html[^>]*>", html, flags=re.IGNORECASE)
    return match.group(0).strip() if match else ""


# ------------------------------------------------------------------------ 主流程


def extract_interface_signals(
    response: Any,
    fetcher: Any,
    *,
    max_sheets: int = MAX_SHEETS,
    viewport_px: int = VIEWPORT_PX,
) -> dict[str, Any]:
    """输出给 TypeScript 侧的原始快照；异常由调用方兜底成 captured=false。"""
    collected = collect_rules(response, fetcher, max_sheets=max_sheets)
    rules: list[CssRule] = collected["rules"]
    by_element = _match_elements(response, rules)

    try:
        root = response.css("html")[0]._root
    except Exception:
        return {"captured": False, "reason": "no_html_root"}

    html_attrib = {k: (v or "") for k, v in root.attrib.items()}

    # 祖先链内容区宽度：从根往下推，遇到 px/max-width 就收紧，遇到 % 就按父级折算。
    content_width: dict[str, float] = {}
    shared_width: dict[str, float] = {}
    precision: dict[str, str] = {}
    computed: dict[str, dict[str, Any]] = {}
    elements: list[dict[str, Any]] = []

    for node in root.iter():
        if not isinstance(node.tag, str):
            continue
        tag = node.tag.lower()
        parent = node.getparent()
        parent_key = _element_key(parent) if parent is not None else ""
        parent_width = content_width.get(parent_key, float(viewport_px))
        parent_style = computed.get(parent_key, {})

        inline_style = node.get("style") or ""
        own = _cascade(by_element.get(_element_key(node), []), inline_style)
        inherited = {k: v for k, v in parent_style.items() if k in INHERITED_PROPERTIES}
        style = _resolve_keywords({**inherited, **own}, inherited)

        parent_font = float(parent_style.get("__font_px", ROOT_FONT_PX))
        font_px = _length_px(style.get("font-size"), parent_font) or parent_font
        weight = _font_weight(style.get("font-weight"), parent_style.get("__weight", 400))

        padding_left, padding_right = _padding_lr(style)
        border = _border_px(style)

        key = _element_key(node)
        shared = shared_width.get(key)
        width_px = _length_px(style.get("width"), parent_width)
        width_percent = _percent(style.get("width"))
        if width_percent is not None:
            width_px = parent_width * width_percent
        max_width_px = _length_px(style.get("max-width"), parent_width)
        min_width_px = _length_px(style.get("min-width"), parent_width)

        parent_precision = precision.get(parent_key, "viewport")
        if width_px is not None:
            box, container_source = width_px, "declared"
        elif shared is not None:
            box, container_source = shared, "estimate"
        else:
            box, container_source = parent_width, parent_precision
        if max_width_px is not None:
            box = min(box, max_width_px)
        if min_width_px is not None:
            box = max(box, min_width_px)
        inner_width = max(0.0, box - padding_left - padding_right - 2 * border)
        content_width[key] = inner_width
        precision[key] = container_source
        computed[key] = {**style, "__font_px": font_px, "__weight": weight}
        _share_row_width(node, style, inner_width, shared_width)

        if tag in SKIP_TAGS:
            continue
        text = _text_of(node)
        if not text or len(text) > MAX_TEXT_CHARS:
            continue
        if _is_hidden(style, node):
            continue

        attrib = {k: (v or "") for k, v in node.attrib.items()}
        elements.append(
            {
                "selector": _css_path(node),
                "tag": tag,
                "text": text,
                # 元素级 lang 覆盖：混排页面（en 页面里夹马来语商品名）只有这里看得出来。
                "lang": (attrib.get("lang") or "").strip() or None,
                # 截断后的全文出口：有 title / aria-label 时 MY-UI-02 从「有损」降级。
                "title_attr": (attrib.get("title") or "").strip() or None,
                "aria_label": (attrib.get("aria-label") or "").strip() or None,
                "role": (attrib.get("role") or "").strip().lower() or None,
                "is_interactive": tag in INTERACTIVE_TAGS
                or (attrib.get("role") or "").strip().lower() in INTERACTIVE_ROLES
                or attrib.get("onclick") is not None,
                "font_family": (style.get("font-family") or "").strip() or None,
                "font_size_px": round(font_px, 2),
                "font_weight": weight,
                "color": (style.get("color") or "").strip().lower() or None,
                "line_height_px": _line_height_px(style.get("line-height"), font_px),
                "text_transform": (style.get("text-transform") or "").strip().lower() or None,
                "font_style": (style.get("font-style") or "").strip().lower() or None,
                "letter_spacing_px": _length_px(style.get("letter-spacing"), font_px),
                "white_space": (style.get("white-space") or "").strip().lower() or None,
                "overflow": (style.get("overflow") or style.get("overflow-x") or "").strip().lower() or None,
                "text_overflow": (style.get("text-overflow") or "").strip().lower() or None,
                "word_break": (style.get("word-break") or "").strip().lower() or None,
                "overflow_wrap": (
                    style.get("overflow-wrap") or style.get("word-wrap") or ""
                ).strip().lower()
                or None,
                "hyphens": (style.get("hyphens") or "").strip().lower() or None,
                "line_clamp": _line_clamp(style),
                "display": (style.get("display") or "").strip().lower() or None,
                "width_px": _round(width_px),
                "max_width_px": _round(max_width_px),
                # 原始声明：ch / ex 这类按字符计的宽度换算不成 px，但正是 MY-UI-01 要找的东西。
                "width_raw": (style.get("width") or "").strip() or None,
                "max_width_raw": (style.get("max-width") or "").strip() or None,
                "min_width_raw": (style.get("min-width") or "").strip() or None,
                "height_px": _round(_length_px(style.get("height"), font_px)),
                "max_height_px": _round(_length_px(style.get("max-height"), font_px)),
                "container_px": _round(inner_width) if inner_width > 0 else None,
                "container_source": container_source,
                "background_color": (style.get("background-color") or "").strip().lower() or None,
                "border_width_px": border,
                "border_radius_px": _length_px(style.get("border-radius"), font_px),
            }
        )

    elements.sort(key=_interest, reverse=True)
    capped = elements[:MAX_ELEMENTS]

    return {
        "captured": True,
        "viewport_px": viewport_px,
        "lang": (html_attrib.get("lang") or "").strip() or None,
        "dir": (html_attrib.get("dir") or "").strip() or None,
        "html_open_tag": _html_open_tag(getattr(response, "html_content", "") or ""),
        "viewport": _viewport(response),
        "stylesheets": collected["stats"],
        "elements": capped,
        "long_tokens": _long_tokens(capped),
        "forms": _collect_forms(response),
        "cjk_font_declared": _declares_cjk_font(computed),
    }


def _declares_cjk_font(computed: dict[str, dict[str, Any]]) -> bool:
    """页面是否在某个字体栈里显式写了 CJK 字面（MY-UI-09 判据 3 的前提）。"""
    for style in computed.values():
        family = (style.get("font-family") or "").lower()
        if not family:
            continue
        if any(hint in family for hint in CJK_FONT_HINTS):
            return True
    return False


def _round(value: float | None) -> float | None:
    return None if value is None else round(value, 1)


def _font_weight(value: str | None, parent_weight: float | int = 400) -> float:
    if not value:
        return float(parent_weight or 400)
    text = value.strip().lower()
    if text in ("inherit", "unset", "initial"):
        return float(parent_weight or 400)
    if text in ("normal", "regular"):
        return 400.0
    if text == "bold":
        return 700.0
    if text == "bolder":
        return min(900.0, float(parent_weight or 400) + 300)
    if text == "lighter":
        return max(100.0, float(parent_weight or 400) - 300)
    match = re.match(r"^(\d{3})$", text)
    return float(match.group(1)) if match else float(parent_weight or 400)


def _interest(item: dict[str, Any]) -> tuple[int, int, int]:
    """有截断/断行机制的、且文本更长的元素优先保留，保证录满上限时证据不丢。"""
    score = 0
    if item["white_space"] == "nowrap":
        score += 4
    if item["text_overflow"]:
        score += 3
    if item["overflow"] in ("hidden", "clip"):
        score += 2
    if item["line_clamp"]:
        score += 3
    if item["height_px"] or item["max_height_px"]:
        score += 2
    if item["word_break"] == "break-all":
        score += 2
    return (score, len(item["text"]), int(item["font_size_px"]))
