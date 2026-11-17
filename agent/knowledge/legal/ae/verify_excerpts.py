#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/ae-sources

The sources directory must contain the files listed in SOURCES.md. PDFs are
converted to text on the fly with `pdftotext -layout` if a .txt is missing.
Exits non-zero if any excerpt does not match.
"""
import argparse
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILES = {
    "AE1": "cp_law_1455.md",
    "AE2": "exec_regs_2157.md",
    "AE3": "media55.pdf",
    "AE4": "ecommerce_2150.md",
    "AE5": "pdpl_1972.md",
    "AE6": "tdra_type.html",
}


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    return re.sub(r"\s+", " ", text).strip()


def read_source(path):
    if path.endswith(".pdf"):
        txt = path[:-4] + ".txt"
        if not os.path.exists(txt):
            subprocess.run(["pdftotext", "-layout", path, txt], check=True)
        path = txt
    if path.endswith(".html"):
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(open(path, encoding="utf-8", errors="ignore").read(), "html.parser")
        for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header"]):
            tag.decompose()
        raw = soup.get_text(" ")
    else:
        raw = open(path, encoding="utf-8", errors="ignore").read()
    # pdftotext -layout repeats page headers; drop adjacent duplicate lines
    seen, kept = set(), []
    for line in raw.split("\n"):
        key = line.strip()
        if key and key == (kept[-1].strip() if kept else None):
            continue
        kept.append(line)
    return normalise("\n".join(kept))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    data = json.load(open(args.rules, encoding="utf-8"))
    cache = {}
    failures = []
    for rule in data["rules"]:
        name = SOURCE_FILES.get(rule["source_id"])
        if not name:
            failures.append((rule["id"], "no source mapping"))
            continue
        path = os.path.join(args.sources, name)
        if not os.path.exists(path):
            failures.append((rule["id"], f"missing source file {name}"))
            continue
        if path not in cache:
            cache[path] = read_source(path)
        if normalise(rule["verbatim_excerpt"]) not in cache[path]:
            failures.append((rule["id"], rule["verbatim_excerpt"][:70]))

    total = len(data["rules"])
    print(f"checked {total} excerpts, {len(failures)} mismatch(es)")
    for rid, excerpt in failures:
        print(f"  FAIL {rid}: {excerpt}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
