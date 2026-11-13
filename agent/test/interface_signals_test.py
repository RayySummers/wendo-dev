#!/usr/bin/env python3
"""interface_signals.py 的离线夹具测试（不联网）。

    cd agent && python3 test/interface_signals_test.py

覆盖三类容易静默失效的地方：
1. 内联 <style> 的读取（get_all_text 对 style 返回空，曾导致内联 CSS 完全没被解析）；
2. 层叠与继承（specificity / !important / 顺序 / inherit 关键字）；
3. 表单与元素属性的静态抽取（MY-UI-08 依赖 maxlength 与内联 handler）。
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from scrapling.parser import Adaptor  # noqa: E402

import interface_signals as ifs  # noqa: E402

FAILURES: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    if condition:
        print(f"ok   {name}")
    else:
        FAILURES.append(f"{name}{(' — ' + detail) if detail else ''}")
        print(f"FAIL {name}{(' — ' + detail) if detail else ''}")


def snapshot(html: str) -> dict:
    adaptor = Adaptor(html, url="https://example.com/")
    return ifs.extract_interface_signals(adaptor, None, max_sheets=0)


def by_selector(snap: dict, selector: str) -> dict:
    """选择器是「从最近的 id 起」的路径，同 tag 兄弟会带 nth-of-type，按末段前缀匹配。"""
    for element in snap["elements"]:
        found = element["selector"]
        tail = found.rsplit(">", 1)[-1].strip()
        if found == selector or tail == selector or tail.startswith(selector + ":"):
            return element
    raise AssertionError(f"没有找到元素 {selector}；实际有 {[e['selector'] for e in snap['elements']]}")


# 1) 内联样式必须被读到（回归：get_all_text() 对 <style> 返回空串）
snap = snapshot(
    """<html lang="en"><head><style>
    .card-title { height: 40px; overflow: hidden; font-size: 16px; line-height: 20px; }
    </style></head><body>
    <div class="card-title">Bear Electric Food Steamer BFS-C60L</div>
    </body></html>"""
)
check("内联 <style> 被解析成规则", snap["stylesheets"]["rules"] == 1, str(snap["stylesheets"]))
check(
    "内联样式作用到元素（height/overflow）",
    by_selector(snap, "div.card-title")["height_px"] == 40.0
    and by_selector(snap, "div.card-title")["overflow"] == "hidden",
)

# 2) 层叠：id > class > 标签；!important 压过更高特异性；后写覆盖先写
snap = snapshot(
    """<html><head><style>
    .a { font-size: 20px; }
    #target { font-size: 14px; }
    div { font-size: 12px; }
    .a { font-size: 18px !important; }
    </style></head><body><div id="target" class="a">Hello</div></body></html>"""
)
check("!important 覆盖 id 选择器", by_selector(snap, "#target")["font_size_px"] == 18.0)

snap = snapshot(
    """<html><head><style>
    .x { font-size: 13px; } .x { font-size: 17px; }
    </style></head><body><p class="x">Hi</p></body></html>"""
)
check("同特异性后写覆盖先写", by_selector(snap, "p.x")["font_size_px"] == 17.0)

# 3) 继承与关键字：子元素继承 font-size，inherit 取父值而不是字面量
snap = snapshot(
    """<html><head><style>
    .parent { font-size: 22px; color: #333333; }
    .child { font-size: inherit; }
    .px { font-size: 2em; }
    </style></head><body>
    <div class="parent"><span class="child">inherit me</span><span class="px">em me</span></div>
    </body></html>"""
)
check("font-size:inherit 取父元素 px", by_selector(snap, "span.child")["font_size_px"] == 22.0)
check("2em 按父字号归一", by_selector(snap, "span.px")["font_size_px"] == 44.0)

# 4) 忽略 JS 状态与伪元素：:hover 的值不能当生效值
snap = snapshot(
    """<html><head><style>
    .btn { font-size: 16px; }
    .btn:hover { font-size: 30px; }
    .btn::before { font-size: 40px; content: "x"; }
    </style></head><body><a class="btn" href="#">Go</a></body></html>"""
)
check(":hover / ::before 不参与层叠", by_selector(snap, "a.btn")["font_size_px"] == 16.0)

# 5) 表单静态属性：maxlength / handlers / placeholder
snap = snapshot(
    """<html><body>
    <form action="/search" method="get">
      <input id="q" name="search" type="text" placeholder="Search" maxlength="12"
             onkeydown="if(event.key==='Enter'){go();}">
    </form>
    <textarea id="note" maxlength="30"></textarea>
    <span class="s">仅保存</span>
    <button onclick="save()">Save</button>
    </body></html>"""
)
forms = {form["selector"]: form for form in snap["forms"]}
check("input 被抽到", "#q" in forms, str(list(forms)))
check("maxlength 解析成整数", forms.get("#q", {}).get("maxlength") == 12)
check("内联 handler 被读到", "onkeydown" in (forms.get("#q", {}).get("handlers") or {}))
check("textarea 位于 body 内不算 form", forms.get("#note", {}).get("inside_form") is False)
check("input 在 form 内被识别", forms.get("#q", {}).get("inside_form") is True)
check("form 记录 action", forms.get("form", {}).get("action") == "/search")

# 6) 可点元素与交互计数（MY-UI-06/07 的输入）
buttons = [e for e in snap["elements"] if e["is_interactive"]]
check("onclick 的 button 计为可点元素", any(e["text"] == "Save" for e in buttons))
check("span 不算可点元素", all(e["tag"] != "span" for e in buttons))

# 7) CJK 字体回退标记（MY-UI-09 判据 3）
snap_no_fallback = snapshot(
    """<html><head><style>h1 { font-family: "Inter", sans-serif; font-size: 32px; }</style></head>
    <body><h1>Bear Kitchen</h1></body></html>"""
)
check("无 CJK 回退时标记 false", snap_no_fallback["cjk_font_declared"] is False)

snap_fallback = snapshot(
    """<html><head><style>h1 { font-family: "Inter", "Noto Sans SC", sans-serif; font-size: 32px; }</style></head>
    <body><h1>Bear Kitchen</h1></body></html>"""
)
check("声明 CJK 回退时标记 true", snap_fallback["cjk_font_declared"] is True)

# 8) 缺 lang 与 doc 级字段
snap = snapshot("<html><body><p>Hello</p></body></html>")
check("缺 lang 时 lang 为 None", snap["lang"] is None)
check("保留原始 html 开标签", snap["html_open_tag"] == "<html>")

# 8.5) 行高来源：具体值算声明，normal/initial 算推算
snap = snapshot(
    """<html><head><style>
    .a { font-size: 16px; line-height: 24px; }
    .b { font-size: 16px; line-height: normal; }
    </style></head><body><p class="a">A</p><p class="b">B</p></body></html>"""
)
check("line-height 具体值标记为已声明", by_selector(snap, "p.a")["line_height_declared"] is True)
check("line-height:normal 标记为推算", by_selector(snap, "p.b")["line_height_declared"] is False)

# 9) ch / ex 原值保留（MY-UI-01）。只对有可见文本的元素成立：
#    空输入框没有可引用的原文，按「没有复核就不报」的口径不产出证据。
snap = snapshot(
    """<html><head><style>.f { width: 24ch; font-size: 16px; }</style></head>
    <body><p class="f">Free shipping over RM150</p></body></html>"""
)
check(
    "ch 宽度保留原值且不换算成 px",
    by_selector(snap, "p.f")["width_raw"] == "24ch" and by_selector(snap, "p.f")["width_px"] is None,
)

if FAILURES:
    print(f"\n{len(FAILURES)} 项失败：")
    for failure in FAILURES:
        print(f"  - {failure}")
    sys.exit(1)
print("\n全部通过。")
