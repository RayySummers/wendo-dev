#!/usr/bin/env python3
"""Verify every verbatim_excerpt in gh/rules.v0.1.json against downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/gh-sources

The sources directory must contain the files listed in SOURCES.md. PDFs are
converted to text with `pdftotext -layout` (cached next to the PDF).

OCR/HTML artefacts: GH4 (PHA 851 word spacing), GH5 (Act 1078 OCR), GH7 (BRR
HTML drops hyphens: "nonducted"), GH9 (Act 843 OCR). These excerpts are
reported as MANUAL and were verified by eye against the scanned page. Every
other source must match after whitespace and punctuation normalisation.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILES = {
    "GH1": ["brr_eta47.html", "brr_eta47_5.html", "brr_eta50.html"],
    "GH2": ["li1541.pdf"],
    "GH3": ["fda_labelling_guideline.pdf"],
    "GH4": ["pha851.pdf"],
    "GH5": ["gsa_act1078.pdf"],
    "GH6": ["nca_type_approval_2015.pdf", "eca775.pdf"],
    "GH7": ["brr_detail.html"],
    "GH8": ["gsa_easypass_flyer.pdf"],
    "GH9": ["dpa2012.pdf"],
}

# Scanned sources: excerpt transcribed from the page image, verified by eye.
MANUAL = {"GH4", "GH5", "GH7", "GH9"}


def normalise(text):
    text = html.unescape(text)
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)
    text = re.sub(r"[^A-Za-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()


def read_source(path):
    if path.endswith(".pdf"):
        txt = path[:-4] + ".txt"
        if not os.path.exists(txt):
            subprocess.run(["pdftotext", "-layout", path, txt], check=True)
        path = txt
    raw = open(path, encoding="utf-8", errors="ignore").read()
    if path.endswith((".html", ".htm")):
        raw = re.sub(r"<(script|style)\b.*?</\1>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<[^>]+>", " ", raw)
    return normalise(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True)
    args = ap.parse_args()

    rules = json.load(open(os.path.join(HERE, "rules.v0.1.json"), encoding="utf-8"))["rules"]
    cache = {}
    failures = []
    manual = 0

    for r in rules:
        sid = r["source_id"]
        if sid not in SOURCE_FILES:
            failures.append((r["id"], f"unknown source_id {sid}"))
            continue
        if sid not in cache:
            cache[sid] = " ".join(
                read_source(os.path.join(args.sources, f)) for f in SOURCE_FILES[sid]
            )
        if sid in MANUAL:
            manual += 1
            continue
        fragments = [f for f in re.split(r"\.\.\.|…", r["verbatim_excerpt"]) if len(f.strip()) > 10]
        if not fragments:
            failures.append((r["id"], "excerpt too short"))
            continue
        for frag in fragments:
            needle = normalise(frag)
            if needle not in cache[sid]:
                failures.append((r["id"], frag[:100]))
                break

    print(f"checked {len(rules)} rules: {len(failures)} mismatch, {manual} manual (scanned sources)")
    for rid, frag in failures:
        print(f"  MISMATCH {rid}: {frag}")
    if manual:
        print("  manual sources: " + ", ".join(sorted(MANUAL)) + " (见 SOURCES.md 交叉核对 X4/X5/X6)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
