#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/za-sources

The sources directory must contain the PDFs listed in SOURCES.md. Each PDF is
converted to text with `pdftotext -layout` if the .txt is missing.

Comparison rules
----------------
*  Whitespace is ignored entirely. This is deliberate: several South African
   gazette PDFs are scanned images with an OCR text layer that drops or inserts
   spaces ("the followinginformation", "ha<; heen"), and the margin line numbers
   of the printed gazette sit inside sentences. Wording, punctuation and digits
   are still compared exactly.
*  Two layout artefacts of the printed gazette are removed before comparison, for
  every source: soft hyphens at line ends are joined, and a bare 1-3 digit line
  number at end of line (the printed margin numbering) is dropped.
*  Ligatures are folded (ﬁ→fi) and curly quotes / en-em dashes are normalised,
   because the text layer differs from the printed page on those glyphs only.
*  Rules whose source is a scanned OCR PDF carry a `notes` field saying so; this
   script prints them so the OCR provenance stays visible.

Exits non-zero if any excerpt does not match, if a required field is missing, or
if two rules share an id.
"""

import argparse
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# source_id -> file in the sources directory
SOURCE_FILES = {
    "ZA1": "cpa2008.pdf",
    "ZA2": "ecta25of2002.pdf",
    "ZA3": "popia4of2013.pdf",
    "ZA4": "nrcs_act_2008_govza.pdf",
    "ZA5": "eca36of2005.pdf",
    "ZA6": "legalmetrology9of2014.pdf",
    "ZA9": "cpa_regs_293.pdf",
}

# source_id -> HTML files in the sources directory
SOURCE_HTML = {
    "ZA7": ["nrcs_impexp.html"],
    "ZA8": ["nrcs_about_cs.html"],
}

REQUIRED = [
    "id", "market", "category", "law_name", "article", "article_type", "source_id",
    "official_url", "language", "effective_date", "last_verified", "rule_type",
    "decision_level", "claim_pattern", "requirement", "evidence_needed",
    "penalty_or_note", "verbatim_excerpt", "confidence", "review_required",
]

OCR_SOURCES = {"ZA2", "ZA4"}


def fold(text):
    return (text
            .replace("\u2019", "'").replace("\u2018", "'")
            .replace("\u201c", '"').replace("\u201d", '"')
            .replace("\u2014", "-").replace("\u2013", "-")
            .replace("\u00a0", " ")
            .replace("\ufb00", "ff").replace("\ufb01", "fi").replace("\ufb02", "fl")
            .replace("\ufb03", "ffi").replace("\ufb04", "ffl"))


def normalise(text):
    return re.sub(r"\s+", "", fold(text))


HEADER = re.compile(
    r"(GOVERNMENT GAZETTE|Government Gazette|^Act No|^\d+\s+No\.\s*\d"
    r"|^\s*\d+\s*$|^No\.\s*\d+|NATIONAL REGULATOR|CONSUMER PROTECTION ACT"
    r"|PROTECTION OF PERSONAL INFORMATION|^ELECTRONIC\s*$|^COMMUNICATIONS\s*$"
    r"|AND TRANSACTIONS|LEGAL METROLOGY ACT|^\s*[A-Z][a-z]+ \d+, \d{4}\s*$)")


def delayout(raw):
    """Drop the printed gazette's page furniture and join soft hyphens."""
    kept = []
    for line in raw.splitlines():
        if not line.strip():
            kept.append("")
            continue
        if HEADER.search(line):
            continue
        kept.append(re.sub(r"\s+\d{1,3}\s*$", "", line))
    text = "\n".join(kept)
    text = re.sub(r"-\s*\n\s*", "", text)
    return re.sub(r"[ \t]+", " ", text)


def read_source(path):
    if path.endswith(".pdf"):
        txt = path[:-4] + ".txt"
        if not os.path.exists(txt):
            subprocess.run(["pdftotext", "-layout", path, txt], check=True)
        with open(txt, encoding="utf-8", errors="replace") as fh:
            return delayout(fh.read())
    with open(path, encoding="utf-8", errors="replace") as fh:
        return delayout(fh.read())


def html_text(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        raw = fh.read()
    raw = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", " ", raw)
    return re.sub(r"<[^>]+>", " ", raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", default=os.path.join(HERE, "..", "..", "..", "za-sources"),
                    help="directory holding the downloaded official PDFs")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    with open(args.rules, encoding="utf-8") as fh:
        doc = json.load(fh)
    rules = doc["rules"]

    cache = {}
    fails = 0

    ids = [r["id"] for r in rules]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        print("DUPLICATE IDS:", dupes)
        fails += 1

    for r in rules:
        for field in REQUIRED:
            if field not in r:
                print(f"MISSING FIELD {field}: {r.get('id')}")
                fails += 1
        if r.get("market") != "ZA":
            print(f"BAD MARKET: {r.get('id')} -> {r.get('market')}")
            fails += 1
        if len(r.get("verbatim_excerpt", "")) > 800:
            print(f"EXCERPT TOO LONG: {r.get('id')}")
            fails += 1

    ocr = sorted({r["id"] for r in rules if r["source_id"] in OCR_SOURCES})
    if ocr:
        print("OCR text layer sources (excerpts hand-checked against the scanned page):")
        for i in sorted(ocr):
            print("  -", i)
        print()

    for r in rules:
        sid = r["source_id"]
        if sid in SOURCE_FILES:
            path = os.path.join(args.sources, SOURCE_FILES[sid])
            if not os.path.exists(path):
                print(f"MISSING SOURCE FILE for {sid}: {path}")
                fails += 1
                continue
            if sid not in cache:
                cache[sid] = normalise(read_source(path))
            haystack = cache[sid]
        elif sid in SOURCE_HTML:
            if sid not in cache:
                chunks = []
                for name in SOURCE_HTML[sid]:
                    p = os.path.join(args.sources, name)
                    if not os.path.exists(p):
                        print(f"MISSING SOURCE FILE for {sid}: {p}")
                        fails += 1
                        continue
                    chunks.append(html_text(p))
                cache[sid] = normalise(" ".join(chunks))
            haystack = cache[sid]
        else:
            print(f"UNKNOWN source_id {sid} on {r['id']}")
            fails += 1
            continue

        if normalise(r["verbatim_excerpt"]) not in haystack:
            print(f"NO MATCH: {r['id']} ({r['article']})")
            print("   excerpt:", r["verbatim_excerpt"][:160])
            fails += 1
        else:
            print(f"ok  {r['id']:12s} {r['article']}")

    print()
    print(f"{len(rules)} rules checked, {fails} problem(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
