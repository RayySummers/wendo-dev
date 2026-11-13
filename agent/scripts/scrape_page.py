#!/usr/bin/env python3
"""Wendo fetch_page：用 Scrapling 抓取单个页面，输出结构化 JSON。

约束（11/15 演示版）：
- 只抓一个 URL，不跟随站内链接、不爬取；
- 只提取可见文本，不执行站内 JS 交互；
- 失败时返回明确的 JSON 错误并以非 0 退出，绝不输出空正文。

除正文外，还会抽取界面可翻译性信号（`interface`，见 scripts/interface_signals.py）：
文档语言、内联/外链 CSS 的计算样式快照，供 TypeScript 侧判断换语言后会不会
截断、断词或层级塌掉。这一步失败只降级为 `interface.captured=false`，不影响正文。

用法：
    python3 scripts/scrape_page.py <url> <output.json> [--timeout 30] [--max-chars 20000]
                                   [--no-interface] [--interface-max-sheets 6]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

try:
    from scrapling.fetchers import Fetcher
except Exception as exc:  # pragma: no cover - dependency guard
    print(
        json.dumps(
            {
                "error": "scrapling_import_failed",
                "message": f"无法导入 Scrapling：{exc}",
                "hint": "pip install -r scripts/requirements.txt",
            },
            ensure_ascii=False,
        ),
        file=sys.stderr,
    )
    sys.exit(2)

try:
    from interface_signals import extract_interface_signals
except Exception:  # pragma: no cover - 单文件运行时也能降级
    extract_interface_signals = None  # type: ignore[assignment]


def fail(code: str, message: str, **extra: object) -> None:
    payload = {"error": code, "message": message, **extra}
    print(json.dumps(payload, ensure_ascii=False), file=sys.stderr)
    sys.exit(1)


def normalize_text(raw: str, max_chars: int) -> str:
    """保留原文措辞，只做空白与重复行归一化，方便逐字引用核对。"""
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t\u00a0]+", " ", text)
    lines = [line.strip() for line in text.split("\n")]
    cleaned: list[str] = []
    for line in lines:
        if not line:
            if cleaned and cleaned[-1] != "":
                cleaned.append("")
            continue
        if cleaned and cleaned[-1] == line:
            continue  # 连续重复行（模板占位符常重复）只保留一次
        cleaned.append(line)
    body = "\n".join(cleaned).strip()
    if len(body) > max_chars:
        body = body[:max_chars].rstrip()
    return body


def extract_title(response) -> str:
    for selector in ('title::text', 'meta[property="og:title"]::attr(content)', "h1::text"):
        try:
            value = response.css(selector).get()
        except Exception:
            value = None
        if value and value.strip():
            return value.strip()
    return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrapling single-page fetch for Wendo")
    parser.add_argument("url")
    parser.add_argument("output")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--max-chars", type=int, default=20000)
    parser.add_argument(
        "--no-interface",
        action="store_true",
        help="跳过界面可翻译性信号抽取（只出正文）",
    )
    parser.add_argument("--interface-max-sheets", type=int, default=6)
    args = parser.parse_args()

    parsed = urlparse(args.url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        fail("invalid_url", f"只接受 http/https 单页 URL，收到：{args.url}")

    started = time.monotonic()
    try:
        response = Fetcher.get(
            args.url,
            timeout=args.timeout,
            stealthy_headers=True,
            follow_redirects=True,
        )
    except Exception as exc:
        fail("fetch_failed", f"抓取失败：{exc}", url=args.url)

    status = int(getattr(response, "status", 0) or 0)
    if status >= 400:
        fail("http_error", f"页面返回 HTTP {status}", url=args.url, status=status)

    try:
        raw_text = response.get_all_text(ignore_tags=("script", "style", "noscript", "template"))
    except Exception as exc:
        fail("extract_failed", f"正文提取失败：{exc}", url=args.url, status=status)

    text = normalize_text(raw_text or "", args.max_chars)
    if len(text) < 40:
        fail(
            "empty_content",
            "页面可见正文少于 40 字符，无法诊断；不生成空报告。",
            url=args.url,
            status=status,
            chars=len(text),
        )

    interface: dict[str, object]
    if args.no_interface or extract_interface_signals is None:
        interface = {"captured": False, "reason": "disabled"}
    else:
        try:
            interface = extract_interface_signals(
                response, Fetcher, max_sheets=max(0, args.interface_max_sheets)
            )
        except Exception as exc:  # 取证失败不能拖垮正文
            interface = {"captured": False, "reason": f"interface_failed: {exc}"}

    payload = {
        "url": args.url,
        "final_url": str(getattr(response, "url", args.url) or args.url),
        "status": status,
        "title": extract_title(response),
        "text": text,
        "char_count": len(text),
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "elapsed_ms": int((time.monotonic() - started) * 1000),
        "fetcher": "scrapling/0.5.1 Fetcher",
        "normalization": "collapse whitespace; drop consecutive duplicate lines; cap at max-chars",
        "interface": interface,
    }

    with open(args.output, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
    print(json.dumps({"ok": True, "chars": len(text), "output": args.output}, ensure_ascii=False))


if __name__ == "__main__":
    main()
