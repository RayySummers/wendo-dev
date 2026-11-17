#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/bh-src

The sources directory must contain the files listed in SOURCES.md (same names).
DOCX files are read from word/document.xml; HTML files are stripped of markup.
Exits non-zero if any excerpt does not match after whitespace normalisation.
"""
import argparse
import json
import os
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

SOURCE_FILES = {
    "BH1": "bh1_cp_law_35_2012.docx",
    "BH2": "bh2_pdpl_30_2018.docx",
    "BH3": "bh3_advertising_decree_14_1973.docx",
    "BH4": "bh4_standards_decree_16_1985.docx",
    "BH5": "bh5_prices_decree_18_1975.docx",
    "BH6": "bh6_weights_decree_6_1977.docx",
    "BH7": "bh7_tra_type_approval_faq.html",
    "BH8": "bh8_moic_consumer_faq.html",
}


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    return re.sub(r"\s+", " ", text).strip()


def read_source(path):
    if path.endswith(".docx"):
        root = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
        raw = "\n".join("".join(t.text or "" for t in p.iter(W + "t")) for p in root.iter(W + "p"))
    elif path.endswith(".html"):
        raw = open(path, encoding="utf-8", errors="ignore").read()
        raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.S)
        raw = re.sub(r"<[^>]+>", "\n", raw)
        raw = (raw.replace("&nbsp;", " ").replace("&#x27;", "'")
                  .replace("&#039;", "'").replace("&amp;", "&"))
    else:
        raw = open(path, encoding="utf-8", errors="ignore").read()
    return normalise(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    data = json.load(open(args.rules, encoding="utf-8"))
    cache, failures = {}, []
    for rule in data["rules"]:
        if len(rule.get("verbatim_excerpt", "").strip()) < 20:
            failures.append((rule["id"], "excerpt missing or too short"))
            continue
        name = SOURCE_FILES.get(rule["source_id"])
        if not name:
            failures.append((rule["id"], "no source mapping"))
            continue
        path = os.path.join(args.sources, name)
        if path not in cache:
            cache[path] = read_source(path) if os.path.exists(path) else ""
        if normalise(rule["verbatim_excerpt"]) not in cache[path]:
            failures.append((rule["id"], rule["verbatim_excerpt"][:70]))

    print(f"checked {len(data['rules'])} excerpts, {len(failures)} mismatch(es)")
    for rid, excerpt in failures:
        print(f"  FAIL {rid}: {excerpt}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
