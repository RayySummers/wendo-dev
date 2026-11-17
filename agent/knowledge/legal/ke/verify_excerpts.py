#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the official Kenyan sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/ke-sources

The sources directory must contain the PDFs listed in SOURCES.md (see the
"复现命令" section). PDFs are converted to text with `pdftotext -layout` if a
.txt is missing.

Two Kenya-specific allowances, both documented in SOURCES.md:

1. OCR noise in the scanned Kenya Gazette PDF (KE1): the text layer reads
   "is*void" where the page reads "is void". OCR_FIXES corrects the *source*
   text for comparison only; the quote itself follows the page image.
2. The scan prints section headings in the margin, and OCR splices them into
   the middle of sentences. Matching is therefore word-by-word with a gap
   budget of 8 inserted tokens. Digital-text PDFs match exactly anyway.

Exits non-zero if any excerpt does not match.
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILES = {
    "KE1": "cpa2012.pdf",
    "KE2": "tda_cap505.pdf",
    "KE3": "standards_cap496.pdf",
    "KE4": "standards_cap496.pdf",
    "KE5": "wma_cap513.pdf",
    "KE6": "wma_cap513.pdf",
    "KE7": "kica_cap411.pdf",
    "KE8": "dpa2019.pdf",
    "KE9": "competition2010.pdf",
}

OCR_FIXES = {
    "is*void": "is void",
}

MAX_GAP = 8


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
    raw = open(path, encoding="utf-8", errors="ignore").read()
    for noise, good in OCR_FIXES.items():
        raw = raw.replace(noise, good)
    # pdftotext -layout repeats page headers; drop adjacent duplicate lines
    seen, kept = set(), []
    for line in raw.split("\n"):
        key = line.strip()
        if key and key == (kept[-1].strip() if kept else None):
            continue
        kept.append(line)
    return normalise("\n".join(kept))


def matches(excerpt, source, max_gap=MAX_GAP):
    if excerpt in source:
        return True
    words = excerpt.split()
    src = source.split()
    n = len(words)
    for i in range(len(src)):
        if src[i] != words[0]:
            continue
        j, gaps = 0, 0
        for k in range(i, min(len(src), i + n + max_gap + 1)):
            if j == n:
                break
            if src[k] == words[j]:
                j += 1
            else:
                gaps += 1
                if gaps > max_gap:
                    break
        if j == n:
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    data = json.load(open(args.rules, encoding="utf-8"))
    cache = {}
    failures = []
    for rule in data["rules"]:
        sid = rule["source_id"]
        name = SOURCE_FILES.get(sid)
        if not name:
            failures.append((rule["id"], "no source mapping for " + sid))
            continue
        path = os.path.join(args.sources, name)
        if path not in cache:
            cache[path] = read_source(path) if os.path.exists(path) else ""
        if not cache[path]:
            failures.append((rule["id"], "missing source file " + name))
            continue
        if not matches(normalise(rule["verbatim_excerpt"]), cache[path]):
            failures.append((rule["id"], rule["verbatim_excerpt"][:70]))

    total = len(data["rules"])
    print(f"checked {total} excerpts against {len(cache)} source files, {len(failures)} mismatch(es)")
    for rid, excerpt in failures:
        print(f"  FAIL {rid}: {excerpt}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
