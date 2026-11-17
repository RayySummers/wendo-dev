#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/ph-sources

The sources directory must contain the HTML files listed in SOURCES.md. Each file is
converted to text on the fly (script/style stripped, entities unescaped, whitespace
collapsed) and the excerpt is searched for as a normalised substring.

Exits non-zero if any excerpt does not match, so a failed check is visible in CI.
"""
import argparse
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# source_id -> files in the sources directory that may contain the excerpt
SOURCE_FILES = {
    "PH1": ["ra7394.html"],
    "PH2": ["ra10173.html"],
    "PH3": ["ra11967.html"],
    "PH4": ["ra8792.html"],
    "PH5": ["bps_p3.html"],
    "PH6": ["bps_p1.html"],
    "PH7": ["ra7581.html"],
    "PH8": ["ra4109.html"],
}


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " ").replace("\u00ad", ""))
    return re.sub(r"\s+", " ", text).strip()


def read_html(path):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(open(path, encoding="utf-8", errors="ignore").read(), "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header"]):
        tag.decompose()
    raw = soup.get_text(" ")
    return normalise(html.unescape(raw))


def read_text(path):
    raw = open(path, encoding="utf-8", errors="ignore").read()
    return normalise(raw)


def read_source(path):
    if path.endswith((".html", ".htm")):
        return read_html(path)
    return read_text(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    data = json.load(open(args.rules, encoding="utf-8"))
    cache, failures = {}, []
    for rule in data["rules"]:
        sid = rule["source_id"]
        candidates = SOURCE_FILES.get(sid)
        if not candidates:
            failures.append((rule["id"], "no source mapping for %s" % sid))
            continue
        found = False
        for name in candidates:
            path = os.path.join(args.sources, name)
            if path not in cache:
                cache[path] = read_source(path) if os.path.exists(path) else ""
            if normalise(rule["verbatim_excerpt"]) in cache[path]:
                found = True
                break
        if not found:
            failures.append((rule["id"], rule["verbatim_excerpt"][:70]))

    total = len(data["rules"])
    print("checked %d excerpts across %d source files, %d mismatch(es)"
          % (total, len(cache), len(failures)))
    for rid, excerpt in failures:
        print("  FAIL %s: %s" % (rid, excerpt))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
