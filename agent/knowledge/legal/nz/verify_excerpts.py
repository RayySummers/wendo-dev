#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the downloaded official text.

Usage:
    python3 verify_excerpts.py --sources /path/to/nz-sources

The sources directory must contain the text dumps listed below. Each dump is the
rendered page text of the official document (see SOURCES.md for the URL and the
extraction method); no PDF/OCR step is involved because legislation.govt.nz serves
its current consolidations as JavaScript-rendered HTML.

Exits non-zero if any excerpt does not match.
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILES = {
    "NZ1": "fta.txt",
    "NZ2": "cga.txt",
    "NZ3": "priv.txt",
    "NZ4": "uema.txt",
    "NZ5": "wma.txt",
    "NZ6": "elec.txt",
    "NZ7": "radio.txt",
    "NZ8": "emc.txt",
    "NZ9": "maori.txt",
}


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    return re.sub(r"\s+", " ", text).strip()


def read_source(path):
    raw = open(path, encoding="utf-8", errors="ignore").read()
    # the rendered page repeats nav labels on every line block; drop adjacent duplicates
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
    missing = []
    for rule in data["rules"]:
        sid = rule["source_id"]
        name = SOURCE_FILES.get(sid)
        if not name:
            failures.append((rule["id"], "no source mapping"))
            continue
        path = os.path.join(args.sources, name)
        if not os.path.exists(path):
            missing.append(name)
            failures.append((rule["id"], f"source file missing: {name}"))
            continue
        if path not in cache:
            cache[path] = read_source(path)
        if normalise(rule["verbatim_excerpt"]) not in cache[path]:
            failures.append((rule["id"], rule["verbatim_excerpt"][:70]))

    total = len(data["rules"])
    print(f"checked {total} excerpts, {len(failures)} mismatch(es)")
    for rid, excerpt in failures:
        print(f"  FAIL {rid}: {excerpt}")
    if missing:
        print("missing source files: " + ", ".join(sorted(set(missing))))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
