"""Checks eval/answers.jsonl without models or GPU.

Shape: unique ids, lang in {it,en}, known cat, `must` = non-empty list of non-empty
groups of non-empty strings (or `refuse`), `turns` rows with the same rules per turn.
Optional --index <index.meta.jsonl>: every must group needs at least one alternative
present (case-insensitive) somewhere in the index text, as a coverage sanity check
(computed answers like "12.6" can legitimately be absent: they are reported, not failed).

    python eval/validate_answers.py
    python eval/validate_answers.py --index path/to/index.meta.jsonl
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

CATS = {"newbie", "slang", "lookup", "mechanics", "computed", "advice", "current", "followup", "refuse"}


def groups_of(spec: dict, where: str, errs: list[str]) -> list[list[str]]:
    if spec.get("refuse"):
        if spec.get("must"):
            errs.append(f"{where}: refuse e must insieme")
        return []
    must = spec.get("must")
    if not isinstance(must, list) or not must:
        errs.append(f"{where}: must vuoto o mancante")
        return []
    for g in must:
        if not isinstance(g, list) or not g or not all(isinstance(a, str) and a.strip() for a in g):
            errs.append(f"{where}: gruppo must non valido {g!r}")
            return []
    return must


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default=str(Path(__file__).with_name("answers.jsonl")))
    ap.add_argument("--index", help="index.meta.jsonl: controlla che i fatti attesi esistano nell'indice")
    args = ap.parse_args()

    errs: list[str] = []
    rows = []
    for n, line in enumerate(open(args.dataset, encoding="utf-8"), 1):
        if line.strip():
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as e:
                errs.append(f"riga {n}: JSON non valido ({e})")
    seen: set[str] = set()
    checks: list[tuple[str, list[str]]] = []
    for r in rows:
        i = r.get("id", "?")
        if i in seen:
            errs.append(f"{i}: id duplicato")
        seen.add(i)
        if r.get("lang") not in ("it", "en"):
            errs.append(f"{i}: lang non valido")
        if r.get("cat") not in CATS:
            errs.append(f"{i}: cat sconosciuta {r.get('cat')!r}")
        if "turns" in r:
            if r.get("cat") != "followup" or not isinstance(r["turns"], list) or len(r["turns"]) < 2:
                errs.append(f"{i}: turns richiede cat followup e almeno 2 turni")
                continue
            for t, turn in enumerate(r["turns"], 1):
                if not str(turn.get("q", "")).strip():
                    errs.append(f"{i} turno {t}: q vuota")
                for g in groups_of(turn, f"{i} turno {t}", errs):
                    checks.append((f"{i}/{t}", g))
        else:
            if not str(r.get("q", "")).strip():
                errs.append(f"{i}: q vuota")
            for g in groups_of(r, i, errs):
                checks.append((i, g))

    if args.index:
        corpus = "\n".join(json.loads(l)["text"].lower() for l in open(args.index, encoding="utf-8") if l.strip())
        for i, g in checks:
            if not any(a.lower() in corpus for a in g):
                print(f"  [non nell'indice] {i}: {g}")

    print(f"{len(rows)} righe · " + ", ".join(f"{c} {n}" for c, n in sorted(Counter(r.get('cat') for r in rows).items())))
    for e in errs:
        print("ERRORE", e)
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
