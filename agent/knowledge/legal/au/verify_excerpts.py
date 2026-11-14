#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/au-sources

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
    "AU1": "cca2010_v4.pdf",
    "AU2": "privacy1988.pdf",
    "AU3": "spam2003.pdf",
    "AU4": "button_battery_safety_2020.pdf",
    "AU5": "button_battery_info_2020.pdf",
    "AU6": "gems2012.pdf",
    "AU7": "radcomms_rules2021.pdf",
}

# Guideline sources are HTML; all pages under the same source_id are searched.
SOURCE_GLOBS = {
    "AU8": "eess_*.html",
    "AU9": "accc_*.html",
}

URL_FILES = {
    "https://www.eess.gov.au/responsible-supplier/manufacturers-and-importers-responsible-suppliers/":
        "eess_responsible-supplier_manufacturers-and-importers-responsible-suppliers.html",
    "https://www.eess.gov.au/registration/registration-in-scope-electrical-equipment/":
        "eess_registration_registration-in-scope-electrical-equipment.html",
    "https://www.eess.gov.au/rcm/marking-of-electrical-equipment/":
        "eess_rcm_marking-of-electrical-equipment.html",
    "https://www.eess.gov.au/safety-requirements/compliance-folder/":
        "eess_safety-requirements_compliance-folder.html",
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
        sid = rule["source_id"]
        candidates = []
        if sid in SOURCE_FILES:
            candidates = [SOURCE_FILES[sid]]
        elif sid in SOURCE_GLOBS:
            import glob
            candidates = [os.path.basename(p) for p in glob.glob(os.path.join(args.sources, SOURCE_GLOBS[sid]))]
        elif rule["official_url"] in URL_FILES:
            candidates = [URL_FILES[rule["official_url"]]]
        if not candidates:
            failures.append((rule["id"], "no source mapping"))
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
    print(f"checked {total} excerpts, {len(failures)} mismatch(es)")
    for rid, excerpt in failures:
        print(f"  FAIL {rid}: {excerpt}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
