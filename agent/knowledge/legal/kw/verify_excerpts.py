#!/usr/bin/env python3
"""Verify every verbatim_excerpt in rules.v0.1.json against the downloaded official sources.

Usage:
    python3 verify_excerpts.py --sources /path/to/kw-sources

All sources are on Kuwaiti official domains (pai.gov.kw / ksm.pai.gov.kw /
citra.gov.kw).  HTML pages are stripped to text; the two CITRA documents are
scanned images, so they are OCR'd once with `pdftoppm` + `tesseract` and cached
as `<name>.ocr.txt` (the same files used when the rules were authored).

Exits non-zero if any excerpt does not match, so a re-download can be checked
without reading the rules by hand.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# source_id -> (filename, kind)  kind: html | ocr
SOURCE_FILES = {
    "KW1": ("pai_std_9532.html", "html"),
    "KW2": ("pai_std_19142.html", "html"),
    "KW3": ("pai_std_19143.html", "html"),
    "KW4": ("pai_std_19144.html", "html"),
    "KW5": ("pai_announcement.html", "html"),
    "KW6": ("AboutTabek.aspx", "html"),
    "KW7": ("QMRules.aspx", "html"),
    "KW8": ("citra_type_approval.pdf", "ocr"),
    "KW9": ("User_Protection_and_Privacy_Rules_Regulation.pdf", "ocr"),
}


def html_text(raw):
    raw = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    raw = re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), raw)
    return raw


def normalise(text):
    text = (text.replace("\u2019", "'").replace("\u2018", "'")
                .replace("\u201c", '"').replace("\u201d", '"')
                .replace("\u2014", "-").replace("\u2013", "-")
                .replace("\u00a0", " "))
    text = re.sub(r"(\w)-\s+(\w)", r"\1-\2", text)  # PDF line-break hyphenation
    return re.sub(r"\s+", " ", text).strip()


def read_ocr(path, workdir):
    base = os.path.splitext(os.path.basename(path))[0]
    txt = os.path.join(workdir, base + ".ocr.txt")
    if not os.path.exists(txt):
        pages = os.path.join(workdir, base + ".pages")
        os.makedirs(pages, exist_ok=True)
        subprocess.run(["pdftoppm", "-r", "200", "-png", path, os.path.join(pages, "p")], check=True)
        chunks = []
        for img in sorted(os.listdir(pages)):
            if not img.endswith(".png"):
                continue
            out = os.path.join(pages, img[:-4])
            subprocess.run(["tesseract", os.path.join(pages, img), out, "-l", "eng", "--psm", "3"],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            with open(out + ".txt", encoding="utf-8", errors="ignore") as fh:
                chunks.append(fh.read())
        with open(txt, "w", encoding="utf-8") as fh:
            fh.write("\n".join(chunks))
    with open(txt, encoding="utf-8", errors="ignore") as fh:
        return normalise(fh.read())


def read_source(path, kind, workdir):
    if kind == "html":
        with open(path, encoding="utf-8", errors="ignore") as fh:
            return normalise(html_text(fh.read()))
    return read_ocr(path, workdir)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True, help="directory with downloaded sources")
    ap.add_argument("--rules", default=os.path.join(HERE, "rules.v0.1.json"))
    args = ap.parse_args()

    with open(args.rules, encoding="utf-8") as fh:
        data = json.load(fh)

    cache, failures = {}, []
    for rule in data["rules"]:
        sid = rule["source_id"]
        if sid not in SOURCE_FILES:
            failures.append((rule["id"], f"no source mapping for {sid}"))
            continue
        name, kind = SOURCE_FILES[sid]
        path = os.path.join(args.sources, name)
        if not os.path.exists(path):
            failures.append((rule["id"], f"missing source file {name}"))
            continue
        if sid not in cache:
            cache[sid] = read_source(path, kind, args.sources)
        if normalise(rule["verbatim_excerpt"]) not in cache[sid]:
            failures.append((rule["id"], rule["verbatim_excerpt"][:80]))

    print(f"checked {len(data['rules'])} excerpts, {len(failures)} mismatch(es)")
    for rid, detail in failures:
        print(f"  FAIL {rid}: {detail}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
