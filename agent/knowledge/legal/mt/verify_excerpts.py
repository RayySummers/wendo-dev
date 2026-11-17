#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/mt-sources
    python3 verify_excerpts.py --sources /path/to/mt-sources --verbose

The sources directory must contain the files listed in SOURCES.md (see the
reproduction commands there). PDFs are converted to text on the fly with
`pdftotext -raw` if a .txt is missing.

Normalisation removes the layout artefacts of the Maltese legislation PDFs
(page headers such as "48 CAP. 378.] CONSUMER AFFAIRS", marginal
cross-references such as "S.L. 12.19."), folds whitespace and unifies quotes.
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
    "MT1": "cap378.pdf",
    "MT2": "sl_378.9.pdf",
    "MT3": "sl_378.17.pdf",
    "MT5": "cap427.pdf",
    "MT6": "sl_427.34.pdf",
    "MT7": "sl_427.41.pdf",
    "MT8": "sl_427.51.pdf",
    "MT9": "sl_427.106.pdf",
    "MT10": "gpsr.md",
    "MT11": "gdpr.md",
    "MT12": "sl_586.1.pdf",
}

_HEADER = re.compile(r"(S\.L\.|CAP\.)\s*\d")


def _is_header(line):
    s = line.strip()
    if len(s) >= 140:
        return False
    if not _HEADER.search(s):
        return False
    return s.startswith(("S.L.", "CAP.", "\x0c")) or re.match(r"^\d", s) or "[" in s


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    lines = [l.replace("\x0c", "") for l in text.split("\n") if not _is_header(l)]
    kept = []
    for line in lines:
        key = line.strip()
        if key and kept and key == kept[-1].strip():
            continue
        kept.append(line)
    return re.sub(r"\s+", " ", "\n".join(kept)).strip()


def read_source(path):
    if path.endswith(".pdf"):
        txt = path[:-4] + ".txt"
        if not os.path.exists(txt):
            subprocess.run(["pdftotext", "-raw", path, txt], check=True)
        path = txt
    raw = open(path, encoding="utf-8", errors="ignore").read()
    return normalise(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    ap.add_argument("--verbose", action="store_true")
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
        if rule["verbatim_excerpt"] not in cache[path]:
            failures.append((rule["id"], "excerpt not found in source"))
        elif args.verbose:
            print(f"OK   {rule['id']}  {rule['source_id']}")

    total = len(data["rules"])
    print(f"{total - len(failures)}/{total} excerpts matched")
    for rid, why in failures:
        print(f"FAIL {rid}: {why}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
