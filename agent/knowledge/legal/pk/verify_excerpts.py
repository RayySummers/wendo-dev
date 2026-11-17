#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/pk-sources

The sources directory must contain the files listed in SOURCES.md. PDFs are
converted to text on the fly with `pdftotext -layout`. HTML sources have their
visible text extracted with BeautifulSoup when available, otherwise a crude
tag-strip is used.

Scanned sources (PK9: S.R.O. 46(KE)/2020, PK10: S.R.O. 411(I)/2024) have no
text layer, so their excerpts are reported as SKIP and must be checked against
the image by hand — see SOURCES.md "OCR 说明".

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
    "PK1": "competition2010.pdf",
    "PK2": "psqca1996.pdf",
    "PK3": "icpa1995.pdf",
    "PK4": "pak195698.pdf",
    "PK5": "SindhConsumerProtectionActC14.pdf",
    "PK6": "sog1930.pdf",
    "PK7": "constitution.pdf",
    "PK8": "psqca_compulsory.html",
    "PK11": "psqca_ca.html",
    "PK12": "psqca_enforcement.html",
    "PK13": "neeca_pelr_fan.html",
}

# No text layer (scanned gazette / CamScanner). Excerpts were checked by eye.
SCANNED = {"PK9": "sro46_47_2020.pdf", "PK10": "sro411_2024.pdf"}


def html_text(path):
    raw = open(path, "rb").read().decode("utf-8", "ignore")
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(raw, "html.parser")
        for tag in soup(["script", "style"]):
            tag.decompose()
        return soup.get_text(" ", strip=True)
    except Exception:
        return re.sub(r"<[^>]+>", " ", raw)


def load(path):
    if path.lower().endswith(".pdf"):
        return subprocess.run(
            ["pdftotext", "-layout", path, "-"],
            capture_output=True, text=True, check=False,
        ).stdout
    return html_text(path)


def norm(text):
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl").replace("\u00ad", "")
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2013", "-").replace("\u2014", "-").replace("\u00a0", " "))
    return re.sub(r"\s+", " ", text).strip().lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with the files listed in SOURCES.md")
    args = ap.parse_args()

    rules = json.load(open(os.path.join(HERE, "rules.v0.1.json"), encoding="utf-8"))["rules"]
    cache, failed, skipped = {}, [], []

    for rule in rules:
        sid = rule["source_id"]
        if sid in SCANNED:
            skipped.append((rule["id"], sid))
            continue
        name = SOURCE_FILES.get(sid)
        if name is None:
            print(f"[MISS]  {rule['id']}: no file registered for source {sid}")
            failed.append(rule["id"])
            continue
        path = os.path.join(args.sources, name)
        if not os.path.exists(path):
            print(f"[MISS]  {rule['id']}: {path} not found")
            failed.append(rule["id"])
            continue
        if sid not in cache:
            cache[sid] = norm(load(path))
        if norm(rule["verbatim_excerpt"]) in cache[sid]:
            print(f"[ok]    {rule['id']}")
        else:
            print(f"[FAIL]  {rule['id']}: excerpt not found in {name}")
            failed.append(rule["id"])

    for rid, sid in skipped:
        print(f"[skip]  {rid}: {sid} is a scanned source, verify against the image (see SOURCES.md)")

    total = len(rules)
    print(f"\n{total - len(failed) - len(skipped)}/{total - len(skipped)} text-layer excerpts matched; "
          f"{len(skipped)} scanned excerpts need manual check; {len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
