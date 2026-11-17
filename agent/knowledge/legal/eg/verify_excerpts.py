#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/eg-sources

The sources directory must contain the files listed in SOURCES.md. PDFs are
converted to text on the fly with `pdftotext -layout` if a .txt is missing.
For the Arabic-only PDPL source (S8), an optional HTML transcription named
`pdpl-ar-transcript.html` is also checked when present.

Exits non-zero if any excerpt does not match.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILES = {
    "S1": "cpa-181-2018-en-official.pdf",
    "S3": "goeic-1484.pdf",
    "S4": "goeic-1483.pdf",
    "S5": "telecom-law-10-2003-en.pdf",
    "S7": "tra-type-approval-updates-2025-en.pdf",
    "S8": "pdpl-151-2020-ar-copy.pdf",
}

AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def norm_en(text):
    text = unicodedata.normalize("NFKC", text)
    text = (text.replace("’", "'").replace("‘", "'")
                .replace("“", '"').replace("”", '"'))
    text = text.lower()
    return re.sub(r"[^a-z0-9]", "", text)


def norm_ar(text):
    text = unicodedata.normalize("NFKC", text).translate(AR_DIGITS)
    text = re.sub(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]", "", text)
    text = re.sub(r"[\u200B-\u200F\u202A-\u202E\u2066-\u2069]", "", text)
    text = (text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
                .replace("ى", "ي").replace("ة", "ه"))
    text = text.lower()
    return re.sub(r"[^a-z0-9\u0621-\u064A]", "", text)


def read_text(path):
    if path.endswith(".pdf"):
        txt = path[:-4] + ".txt"
        if not os.path.exists(txt):
            subprocess.run(["pdftotext", "-layout", path, txt], check=True)
        path = txt
    if path.endswith((".html", ".htm")):
        raw = open(path, encoding="utf-8", errors="ignore").read()
        raw = re.sub(r"<script.*?</script>", " ", raw, flags=re.S)
        raw = re.sub(r"<style.*?</style>", " ", raw, flags=re.S)
        raw = re.sub(r"<[^>]+>", " ", raw)
        return html.unescape(raw)
    return open(path, encoding="utf-8", errors="ignore").read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with source files listed in SOURCES.md")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    data = json.load(open(args.rules, encoding="utf-8"))
    cache = {}
    failures = []

    for rule in data["rules"]:
        sid = rule["source_id"]
        if sid not in SOURCE_FILES:
            continue
        path = os.path.join(args.sources, SOURCE_FILES[sid])
        if not os.path.exists(path):
            failures.append((rule["id"], sid, "source file missing: " + path))
            print(f'{rule["id"]:14s} {sid} MISSING')
            continue
        normalise = norm_ar if rule.get("language") != "en" else norm_en
        excerpt = normalise(rule["verbatim_excerpt"])
        key = (path, rule.get("language") != "en")
        if key not in cache:
            cache[key] = normalise(read_text(path))
        ok = excerpt in cache[key]

        if ok and sid == "S8":
            extra = os.path.join(args.sources, "pdpl-ar-transcript.html")
            if os.path.exists(extra):
                ekey = (extra, True)
                if ekey not in cache:
                    cache[ekey] = norm_ar(read_text(extra))
                ok = excerpt in cache[ekey]

        print(f'{rule["id"]:14s} {sid} {"PASS" if ok else "FAIL"}')
        if not ok:
            failures.append((rule["id"], sid, "excerpt not found in " + os.path.basename(path)))

    print(f'\n{len(data["rules"]) - len(failures)}/{len(data["rules"])} PASS, {len(failures)} mismatch')
    for f in failures:
        print(" -", *f)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
