#!/usr/bin/env python3
"""Verify every verbatim_excerpt in ca/rules.v0.1.json against downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/ca-sources

The sources directory must contain the files listed in SOURCES.md. Federal acts
and regulations are the Justice Laws HTML (`FullText.html`), ISED RSS-Gen is the
official standard page, Ontario/BC come from the official e-Laws / BC Laws
pages, and the Quebec Charter comes from a Wayback snapshot of the official
Légis Québec page (the live site returns 403 to this environment).

Exits non-zero if any excerpt does not match after whitespace/punctuation
normalisation.
"""
import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

SOURCE_FILES = {
    "CA1": "c-34.html",
    "CA2": "cpla.html",
    "CA3": "cplr.html",
    "CA4": "weights.html",
    "CA5": "ccpsa.html",
    "CA6": "radiocomm.html",
    "CA7": "rss-gen.html",
    "CA8": "sor-2016-311.html",
    "CA9": "bc_esr_100_2004.html",
    "CA10": "ontario_reg_164_99.html",
    "CA11": "pipeda.html",
    "CA12": "casl.html",
    "CA13": "ontario_cpa_02c30.html",
    "CA14": "ontario_reg_17_05.html",
    "CA15": "bclaws_04002_multi.html",
    "CA16": "legisquebec_c11_wayback.html",
}


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    return re.sub(r"\s+", " ", text).strip()


def read_source(path):
    if path.endswith(".html"):
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(open(path, encoding="utf-8", errors="ignore").read(), "html.parser")
        for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header"]):
            tag.decompose()
        raw = soup.get_text(" ")
    else:
        raw = open(path, encoding="utf-8", errors="ignore").read()
    return normalise(raw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded official sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    data = json.load(open(args.rules, encoding="utf-8"))
    cache = {}
    failures = []
    for rule in data["rules"]:
        sid = rule["source_id"]
        name = SOURCE_FILES.get(sid)
        if not name:
            failures.append((rule["id"], "no source mapping"))
            continue
        path = os.path.join(args.sources, name)
        if path not in cache:
            cache[path] = read_source(path) if os.path.exists(path) else ""
        if normalise(rule["verbatim_excerpt"]) not in cache[path]:
            failures.append((rule["id"], rule["verbatim_excerpt"][:70]))

    total = len(data["rules"])
    print(f"checked {total} excerpts, {len(failures)} mismatch(es)")
    for rid, excerpt in failures:
        print(f"  FAIL {rid}: {excerpt}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
