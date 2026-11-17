#!/usr/bin/env python3
"""Verify JO rules verbatim_excerpt against the official PDFs.

Usage:
    python3 verify_excerpts.py cpl_ar.pdf pdp_en.pdf rules.v0.1.json

Why a special comparator:
  The MoITS copy of the Consumer Protection Law has a font-layer ligature
  defect: "ال" + next letter is emitted as "ا" + next letter + "ل"
  (المستهلك -> املستهلك).  We therefore compare word by word and accept a
  word if either the word itself or its known defect variant occurs in the
  extracted text.  Every reported word is a candidate typo and must be
  checked by hand against the page image.

Exit code 1 if any word is unexplained.
"""
import json
import re
import sys

import fitz  # PyMuPDF


def norm(s: str) -> str:
    s = re.sub(r"[\u064B-\u0652\u0640]", "", s)
    s = s.translate(str.maketrans({"أ": "ا", "إ": "ا", "آ": "ا", "ة": "ه", "ى": "ي", "ئ": "ي", "ؤ": "و"}))
    return re.sub(r"[^\w\u0600-\u06FF]", "", s)


def defect_variants(w: str):
    """Known font-layer defects in the MoITS PDF.

    1. word-initial "ال" + X  ->  "ا" + X + "ل"   (المستهلك -> املستهلك)
    2. "لا" anywhere          ->  "ال"             (باطلا -> باطال, إعلان -> إعالن)
    Both can co-occur, so apply them in combination.
    """
    out = {w}
    for _ in range(2):
        for v in list(out):
            # every "ال"+X can come out as "ا"+X+"ل" (word-initial or after a prefix)
            if "ال" in v:
                out.add(re.sub(r"ال(.)", lambda m: "ا" + m.group(1) + "ل", v))
                out.add(re.sub(r"ال(.)", lambda m: "ا" + m.group(1) + "ل", v, count=1))
            if "لا" in v:
                out.add(v.replace("لا", "ال"))
    return out


# Words whose PDF text layer is corrupted beyond the ligature model above.
# Each entry was verified by hand against the rendered page image.
KNOWN_TEXT_LAYER_ARTIFACTS = {
    "مضللا": "p.4: text layer splits the word as 'ل مض:ال' (line wrap + stray colon)",
}


def main() -> int:
    cpl_pdf, pdp_pdf, rules_json = sys.argv[1:4]
    cpl = norm("".join(p.get_text("text") for p in fitz.open(cpl_pdf)))
    pdp = norm("".join(p.get_text("text") for p in fitz.open(pdp_pdf)))

    rules = json.load(open(rules_json, encoding="utf-8"))["rules"]
    bad = 0
    for r in rules:
        en = r.get("language") == "en"
        corpus = pdp if en else cpl
        if en:
            words = [w for w in re.findall(r"[a-z0-9]+", r["verbatim_excerpt"].lower()) if len(w) > 3]
            missing = [w for w in words if w not in corpus.lower()]
        else:
            words = [w for w in re.split(r"\s+", r["verbatim_excerpt"]) if len(norm(w)) > 2]
            missing = []
            for w in words:
                nw = norm(w)
                if nw in corpus:
                    continue
                if any(v in corpus for v in defect_variants(nw)):
                    continue
                if nw in KNOWN_TEXT_LAYER_ARTIFACTS:
                    continue
                missing.append(w)
        if missing:
            bad += 1
            print(f"{r['id']}: {missing}")
    print(f"\nchecked {len(rules)} rules; {bad} rule(s) with unexplained words")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
