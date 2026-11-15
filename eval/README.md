# Capsuleers.IA — Evaluation

A set of "golden" questions to measure the AI's accuracy on skills, fitting,
terminology, ships/modules, universe, industry, and lore.

## Files

- `dataset.jsonl` — questions with their expected facts (`expect`). Fields: `id`,
  `category`, `source` (`sde`/`wiki`/`mixed`), `question`, `expect` (a list of
  facts that a correct answer must contain).
- `validate_dataset.py` — verifies that the expected facts are present in the corpus
  (JSONL dump). **Requires no infrastructure.** It checks the coverage and correctness
  of the golden set: if a fact isn't in the corpus, the RAG can never answer it.
- `run_eval.py` — end-to-end harness: queries the `/ask` API and verifies the
  answers (substring match or semantic grading via LLM). **Requires the API to be running.**

- `answers.jsonl` — answer-quality set, run by `desktop/tools/eval-answers.mjs`
  (needs the GPU and a model). Row: `{"id","cat","q","lang":"it"|"en","must":[[alt,…],…]}`;
  each `must` group needs ONE of its alternatives (case-insensitive substring) in the answer.
  `"refuse":true` replaces `must`: the answer must say the sources lack it.
  `followup` rows use `"turns":[{"q","must"|"refuse"},…]`, asked in sequence without
  resetting the conversation; the row passes only if every turn does.
- `validate_answers.py` — offline shape check of `answers.jsonl` (unique ids, lang, cat,
  non-empty `must`/`turns`); with `--index index.meta.jsonl` it also flags `must` groups
  with no alternative anywhere in the index. No models needed.

Categories of `answers.jsonl`: `newbie`, `slang`, `lookup` (single SDE datum), `mechanics`
(rules/formulas), `computed` (calculation from SDE attributes), `advice` (comparisons; `must` =
what a good answer must name), `current` (recency, patch-notes facts with their date), `followup`,
`refuse`. Every `must` was checked against the index; `computed` values come from SDE
records (ship mass is not in the index, so no align-time questions).

## Usage

```bash
# 1. Coverage (offline, against the ingestion dumps)
python eval/validate_dataset.py

# 2. End-to-end quality (API running: Qdrant + Ollama + populated index)
python eval/run_eval.py            # substring match of the expected facts
python eval/run_eval.py --judge    # semantic grading via LLM

# 3. Answer quality per category (GPU free, model in IA_MODELS)
python eval/validate_answers.py
node desktop/tools/eval-answers.mjs <model.gguf> [--cat newbie,advice] [--only id,id] [--show]
```

## Interpretation

- `validate_dataset` measures whether the **data exists** to answer (coverage).
- `run_eval` measures whether the **system retrieves and answers** correctly (retrieval +
  generation quality). The gap between the two points to retrieval or
  prompt problems, not data problems.

- `eval-answers` prints pass/total per category plus the total, and the final JSON line
  carries `byCat`. Compare models or engine changes category by category: a total
  that stays flat can hide a regression in `current` or `followup`. Rows are ~one per
  fact, so a category of 8–14 rows moves ~10 points per failure: read trends, not single rows.

Extending the set is encouraged: add rows to `dataset.jsonl` for every
real use case (questions asked by the site's users).
