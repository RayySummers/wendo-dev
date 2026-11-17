#!/usr/bin/env python3
"""Check every `verbatim_excerpt` in rules.v0.1.json against the official sources.

Usage:
    python3 agent/knowledge/legal/ng/verify_excerpts.py --sources /path/to/ng-sources

`sources` must contain the files listed in SOURCES.md §复现命令.

Two verification modes, because the sources differ in quality:

  text  — the source has a real text layer (NDPA gazette PDF; regulator HTML pages).
          The excerpt must appear as an exact substring after whitespace/quote
          normalisation. This is a hard pass/fail criterion.

  ocr   — the source is a scan whose only text layer is OCR (FCCPA gazette, and it is
          badly garbled: "goods" -> "gods", "manufacturer" -> "hranufacturer").
          Excerpts for these rules were transcribed from the official gazette's page
          images (the `gazette_page` field in rules.v0.1.json names the page). Exact
          matching is impossible, so the script reports a diagnostic 3-gram coverage
          figure against that page's OCR text instead and does NOT fail on it.
          Use `pdftoppm -f <pdf page> -l <pdf page> -r 150 -png` to re-check by eye.

Exit code 1 only if a `text`-mode excerpt fails.
"""

import argparse
import html
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
RULES = HERE / "rules.v0.1.json"

# source_id -> default (filename, mode)
SOURCES = {
    "NG1": ("fccpa2018.pdf", "ocr"),
    "NG2": ("ndpa2023.pdf", "text"),
    "NG4": ("son_soncapservice.html", "text"),
    "NG5": ("son_son-mandatory-energy-labeling-scheme.html", "text"),
    "NG6": ("ncc_ncc-type-approval-main.html", "text"),
    "NG7": ("arcon_adverts_vetting.html", "text"),
}

# rules whose excerpt lives on a sibling page of the default source
PER_RULE_OVERRIDE = {
    "NG-CRT-02": ("son_soncap-faq.html", "text"),
    "NG-LNG-02": ("ncc_type-approval-requirements.html", "text"),
}

# PDF page number in fccpa2018.pdf for each NG1 rule (A-number is the gazette page)
FCCPA_PAGES = {
    "NG-ADV-01": 66, "NG-ADV-02": 68, "NG-ADV-03": 68, "NG-ADV-04": 68,
    "NG-ADV-05": 68, "NG-ADV-06": 69, "NG-ADV-08": 66, "NG-PRC-01": 63,
    "NG-PRC-02": 63, "NG-LAB-01": 64, "NG-LAB-02": 64, "NG-LAB-03": 64,
    "NG-LAB-04": 73, "NG-LAB-05": 73, "NG-LNG-01": 62,
}


def squash(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    for a, b in [("\u2019", "'"), ("\u2018", "'"), ("\u201c", '"'), ("\u201d", '"'),
                 ("\u2013", "-"), ("\u2014", "-"), ("\u00a0", " ")]:
        text = text.replace(a, b)
    return re.sub(r"\s+", "", text).lower()


def tokens(text: str):
    text = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"[^a-z0-9 ]+", " ", text).split()


def pdf_text(path: Path, pages=None) -> str:
    cmd = ["pdftotext"]
    if pages:
        cmd += ["-f", str(pages), "-l", str(pages)]
    cmd += [str(path), "-"]
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout


def html_text(path: Path) -> str:
    raw = path.read_text(encoding="utf-8", errors="ignore")
    raw = re.sub(r"<script.*?</script>|<style.*?</style>", " ", raw, flags=re.S)
    raw = re.sub(r"<[^>]+>", " ", raw)
    return html.unescape(raw)


def coverage(excerpt: str, page_text: str, n: int = 3) -> float:
    hay = tokens(page_text)
    H = {tuple(hay[i:i + n]) for i in range(len(hay) - n + 1)}
    needle = tokens(excerpt)
    grams = [tuple(needle[i:i + n]) for i in range(len(needle) - n + 1)]
    if not grams:
        return 0.0
    return sum(1 for g in grams if g in H) / len(grams)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True)
    args = ap.parse_args()
    src = Path(args.sources)

    rules = json.loads(RULES.read_text(encoding="utf-8"))["rules"]
    cache, exact, ocr_only, failed = {}, 0, 0, 0

    for rule in rules:
        name, mode = PER_RULE_OVERRIDE.get(rule["id"], SOURCES.get(rule["source_id"], (None, None)))
        if name is None:
            print(f"FAIL  {rule['id']}: no source mapping for {rule['source_id']}")
            failed += 1
            continue
        path = src / name
        if not path.exists():
            print(f"FAIL  {rule['id']}: missing source file {name}")
            failed += 1
            continue

        if mode == "text":
            if path not in cache:
                cache[path] = squash(pdf_text(path) if path.suffix == ".pdf" else html_text(path))
            if squash(rule["verbatim_excerpt"]) in cache[path]:
                exact += 1
                print(f"OK    {rule['id']}: exact match in {name}")
            else:
                failed += 1
                print(f"FAIL  {rule['id']}: not found verbatim in {name}")
        else:
            page = FCCPA_PAGES.get(rule["id"])
            if page is None:
                print(f"SKIP  {rule['id']}: no gazette page recorded")
                continue
            cov = coverage(rule["verbatim_excerpt"], pdf_text(path, page))
            ocr_only += 1
            print(f"OCR   {rule['id']}: page image transcription; "
                  f"diagnostic 3-gram coverage {cov:.2f} vs OCR text of PDF p{page}")

    total = len(rules)
    print(f"\nchecked {total} excerpts: {exact} exact (text layer), "
          f"{ocr_only} page-image transcriptions, {failed} failed")
    if ocr_only:
        print("note: page-image transcriptions are not machine-verifiable; "
              "the coverage figure is a diagnostic, not a pass criterion.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
