# Runtime desktop — engine, retrieval, fonti

Leggi se tocchi `desktop/src/engine.mjs`, `retrieval.mjs`, `source-tiers.mjs`, `prices.mjs`, prompt, modelli o eval delle risposte. `docs/architecture.md` descrive un design precedente (API Fastify + Ollama + Qdrant a runtime): storico, non vale per il runtime attuale.

## Panoramica
**Capsuleers.IA** — a **standalone, cross-platform, 100% local, GPU-accelerated** desktop
AI assistant for **EVE Online**. It answers questions (skills, fitting, terminology, PVE,
wormholes, sovereignty, exploration, industry…) **with cited sources**, in Italian or
English (auto-detected). A local LLM (via `node-llama-cpp`) answers over a **RAG** index of
EVE knowledge. Nothing leaves the machine except optional lookups to public EVE APIs for the
live-data features.

The companion website / web platform lives in a separate repo (**capsuleers.website**, capsuleers.app); this
repo is the desktop app + the offline data factory that feeds it.

## Two parts

| Part | Path | Runtime | Role |
|---|---|---|---|
| **App** | [`desktop/`](../../desktop/) | Electron + Node | The shipped product. No server, no Qdrant/Ollama, no Python at runtime. |
| **Data factory** | [`ingestion/`](../../ingestion/) | Python (build-time, offline) | Generates the knowledge-base index from EVE sources; run by whoever builds a release. |

The app is self-contained: at runtime it only needs the GGUF models + the prebuilt index
(downloaded once on first launch). The Python pipeline never runs on an end user's machine.

## Desktop runtime architecture

Orchestrator is [`desktop/src/engine.mjs`](../../desktop/src/engine.mjs):

- **Models** — `node-llama-cpp` (GPU **Vulkan/Metal/CUDA**, CPU fallback). Embeddings via
  **bge-m3 (Q8)**; chat model from an updatable catalog ([`models-catalog.json`](../../desktop/src/models-catalog.json)),
  Q4 GGUF. `DIM = 1024`, `TOP_K = 12`, `MAX_CONTEXT_CHARS = 6000`.
- **Index** — in-RAM vectors (cosine), no DB. Loaded from `index.vec` + `index.meta.jsonl`.
- **`ask(question, onToken, uiLang)`** pipeline: (1) if the message is a pasted EFT fit
  (`looksLikeFit`) → fit analysis (see below) is injected as context; (2) embed → retrieve
  top-K → build prompt (EVE expert, answers only from context, cites sources, replies in the
  user's language) → stream tokens, then sources.
- **Hybrid retrieval** — [`retrieval.mjs`](../../desktop/src/retrieval.mjs) (pure, no models): dense
  (cosine + tier nudge, pool 200) + **BM25** over title+text (pool 100, built at `init()`, ~2 s /
  ~25 MB) + **title matches** (every title token named in the query: "Vexor", "Damage Control II"),
  fused as `dense + 0.1 × (BM25/best + 1 if title match)`, then two diversity caps: a near-copy
  (cosine ≥ 0.85) of a kept chunk **of the same source** waits behind everything else (SDE families:
  18 Amulet implants, a hull's SKINs), and **one chunk per page** first. Why: on "dove si droppano gli
  High-grade Amulet?" dense-only filled the context with the Amulet records and the Feb 2020 patch
  note that answers it was rank 339; on "quanti slot ha la Vexor?" Vexor SKINs (short → BM25 favourite)
  and EVE Uni chunks pushed the SDE record out of the budget. Cross-source near-copies are NOT capped:
  the SDE Caracal and EVE Uni's Caracal page are ≥ 0.85 apart and complementary. **The context budget
  is the real limit** (6000 chars ≈ 4-6 blocks): engine.mjs picks blocks in RETRIEVAL order, skipping
  one that doesn't fit, and only then sorts the chosen ones by tier — sorting first let low-relevance
  L1 records evict the best L3 hit. Measured with `node desktop/tools/verify-retrieval.mjs` (counts
  what fits the budget): `eval/retrieval.jsonl` dense 26/30 → 30/30, held-out
  `eval/retrieval-holdout.jsonl` 19/22 → 22/22. `tools/probe-retrieval.mjs "<q>"` shows the ranking,
  `IA_DEBUG_PROMPT=1` prints the exact prompt. RRF was tried and lost the English Amulet question
  (rank fusion forgets that "Amulet" is a 22-chunk word and "implants" an 821-chunk one).
- **Qualità delle risposte (batteria di 31 domande, indice 2026.11)** — tutte in `retrieval.mjs`/`engine.mjs`:
  (1) *cosmetici*: SKIN e "… Edition Blueprint" aspettano dietro tutti gli altri candidati salvo domande su skin/edition (Rokh: 3/7 blocchi → 0).
  (2) *compattazione*: il blocco "Requisiti skill (albero completo…)" dei record SDE di navi si omette (`compactText`) se la domanda non parla di skill/requisiti/pilotare, e il budget conta il blocco compattato: l'Archon SDE (2806 car.) rientra.
  (3) *più entità + tema* (`planQuery`, `retrieveAsync`): ≥2 titoli interi nominati → un posto garantito al record primario di ciascuno (con una sola nave: il suo record SDE; con due navi le pagine wiki, più corte) + seconda ricerca sulla domanda senza i nomi (1 embedding extra, ~100 ms) subito dopo. Con 1 sola entità niente ricerca residua: interlacciarla faceva perdere caracal-skills/amulet-drop-en e aggiungeva "Brynn's Co-Processor" alla Rokh. "Gila o Ishtar per gli abyssal" → Ishtar + Gila + Abyssal FAQ/Community Fits (prima: solo Ishtar).
  (4) *recenza*: con "ultimo/attuale/latest/current" i chunk datati "(YYYY-MM-DD)" ricevono +0.12 decrescente su 400 giorni rispetto alla data più recente dell'indice (non all'orologio); il prompt utente porta "DATA DI OGGI" e il SYSTEM ha una riga su "ultimo = fonte datata più recente, di' la data".
  (5) *IT→EN* (`searchRewrite`): query inglese scritta dal modello e interlacciata alla classifica. **Spenta di serie** (`IA_REWRITE=1` la accende): in tre misure ha spostato il punteggio di ±1-2 domande (rumore) per 0,5-0,9 s in più su ogni domanda italiana.
  (6) *smistamento*: `isMechanicsQuestion` (mcp-intel.mjs) blocca intent live e `intelQuery` per "cosa succede quando…/how does X work/come funzionano le kill"; il polso globale richiede un marcatore temporale (adesso/ora/right now…), non basta "in EVE".
- **Answer eval / model choice** — `node desktop/tools/eval-answers.mjs <model.gguf>` runs the real
  `ask()` on `eval/answers.jsonl` (facts the answer must contain, reply language, `refuse` rows for
  unanswerable questions) in a scratch models dir (never touches `.selected-model`). Measure with
  the GPU free: EVE clients running hold ~7.6 GB of VRAM and change both speed and stability.
- **Source hierarchy** — [`source-tiers.mjs`](../../desktop/src/source-tiers.mjs) is the single table
  of how much each source is trusted: **L1** CCP (SDE, ESI, docs, Support, patch notes, dev posts),
  **L2** processed official data (EVE Ref), **L3** structured community (EVE University, EVE-Scout,
  Anoikis, eve-kill, Dotlan, Fuzzwork, zKillboard…), **L4** general community (Fandom wikis,
  eve-survival, Riley, EVE Workbench). It drives three things: a small retrieval nudge
  (`TIER_BONUS`, ±0.015 added to the cosine score, precomputed per chunk at index load); the tag on
  every context block (`[L1 · CCP SDE · item]`, live blocks too) plus a SYSTEM rule "on conflict the
  lower level wins"; and the `tier` on every cited source (sorted primary-first, chip in the UI).
  The tier is derived from `source` when the index carries it, else from the URL host — so it works on
  index releases published before `source` was exported (only SDE chunks have `url: null`).
  **Dated L1 sources (CCP patch notes, dev blogs) get NO retrieval nudge** (`bonusOf`): they stay L1
  for the tag and the conflict rule, but describe a change as of their date and may be superseded —
  and the SYSTEM prompt says SDE/ESI beat them, and among them the newest wins. Support, EVE Academy
  and the dev-docs guides describe the CURRENT game and get the full L1 nudge. The retrieved blocks
  enter the context **sorted by tier** (stable within a tier): a 4B model weighs the head of the
  context most, and the conflict rule is only as good as its attention to the L1 block — on "how does
  sov work" that is what moved the answer from TCU/I-Hub to the Equinox Sovereignty Hub. The prompt
  forbids writing the L-labels in the answer (the model did). **A new
  source needs a row there**, or it silently lands at L4: `node desktop/tools/verify-source-tiers.mjs`
  fails on any host without one, and measures the nudge on real questions (median top-1↔top-12 gap
  0.087; 0.9 chunks of 12 replaced per question — it reorders the tail, never the head).
- **Prices come at two levels and are NOT in conflict**: EVE Ref's global reference average (L2) and
  the live Jita 4-4 order book from Fuzzwork (L3, `jitaPrice` in [`prices.mjs`](../../desktop/src/prices.mjs),
  5-min cache = the server's own expiry). Each is its own tagged block and cited source, and the live
  directive says so explicitly — otherwise "the lower level wins" would make the model prefer the
  global average over the real Jita price. Prices under 100 ISK keep two decimals (Tritanium 3.82 vs
  3.65 was rounded to "4 / 4"). The fit analysis block is tagged **L2 · eve-fit-engine**.
- **Query rules** (`expandQuery`, `intelQuery`, both exported and checked by
  `node desktop/tools/verify-query-rules.mjs`): the killboard-stats trigger needs a word end on
  `stat` — without it "STATus di sicurezza" went to eve-kill as a pilot name and the answer cited the
  killboard; and in an ITALIAN sentence about mining "ore" is REPLACED with "minerale (ore)" (Italian
  "ore" = hours), never after a count ("quante ore", "3 ore"). Measured: appending "(mining ore)"
  pushed the target patch note from rank 5 to 18, substituting brought it to 2.
- **`configurePaths({ modelsDir, dataDir })`** points sibling modules at the userData data dir
  ([`prices.mjs`](../../desktop/src/prices.mjs), [`links.mjs`](../../desktop/src/links.mjs)) — otherwise the
  packaged app looks for lookup files inside `app.asar`. **`fit.mjs` no longer needs this** (its
  SDE is bundled in the `eve-fit-engine` package).
- **Cronologia delle release** ([`timeline.mjs`](../../desktop/src/timeline.mjs)): versione, nome e data d'uscita ricavati dalle patch notes dell'indice ("Version 24.02 AKA Fractured Skies", "Initial Release Date", pagine "<Nome>: Expansion Notes"). Su domande di espansioni/patch/novità entra come primo blocco L1: prima tutti e 4 i modelli rispondevano "Cradle of War" a novembre (categoria current 11/14 → 14/14).
- **Record dell'entità nominata** (`primaryRecords`): il record SDE/glossario il cui titolo intero è nella domanda apre il contesto (max 2). "Quali skill servono per il Tengu?" dava le skill di un subsystem: la nave (3 880 car.) era al rango 7 e non entrava.
- **Sezioni sorelle** (`siblingSections`): il primo chunk di una pagina tagliata ai titoli porta anche i titoli delle altre sezioni vicine alla domanda (≤400 car.): i nomi delle Command Carrier sono quattro sezioni della stessa pagina.
- **Follow-up**: ogni turno ricorda le entità di cui parla (`ents`); la riformulazione (`condense`) riceve due turni tagliati a 500 car. più il soggetto, e parte solo se la domanda si appoggia alla conversazione (marcatore `FOLLOW_UP`, nessuna entità propria, o similarità ≥ 0.5 col turno precedente).
- **Lingua**: per le domande inglesi SYSTEM, etichette e direttive sono in inglese (`SYSTEM_EN`). Col solo SYSTEM italiano i modelli copiavano il rifiuto in italiano (refuse 5/8 → 8/8 su Gemma 4 12B).
- **Modelli con ragionamento** (Qwen3.5, Gemma 4): `budgets: { thoughtTokens: 0 }` su ogni prompt; lasciati liberi consumavano i 1 600 token in pensieri e la risposta era vuota dopo 30 s.
- **Velocità** (`timing` restituito da `ask()`, stampato da eval-answers; Gemma 4 12B su RX 6700 XT): lettura del prompt ~520 token/s → primo token 4,1-4,8 s, generazione 3-4,5 s, ricerca 0,2 s. Il contesto chat vive quanto il modello (`withSequence`): node-llama-cpp riusa il prefisso già valutato (le ~925-1 020 token del SYSTEM) circa 3 volte su 4, −0,6 s medi; `IA_NO_CTX_REUSE=1` per confrontare. Le ricerche live indipendenti dal retrieval partono in parallelo. batchSize più grande e flashAttention: nessun guadagno misurabile.
- **Finestra più ampia NON di serie**: 8192 token / 12 000 car. → 134/139 contro 132/139 (Gemma 4 12B), ma +2,7 s prima del primo token. `IA_CHAT_CTX` / `IA_CONTEXT_CHARS` per misurare.
- **Catalogo e predefinito** ([`model-default.mjs`](../../desktop/src/model-default.mjs), `node desktop/tools/verify-model-default.mjs`): `modelsV2` contiene i modelli che le app < 0.1.74 non sanno eseguire (leggono solo `models`); il predefinito è il `rank` più alto il cui `minVramGB` sta nella VRAM TOTALE della scheda (≥11 GB Gemma 4 12B, ≥8 GB Qwen3.5 9B, altrimenti Qwen3 4B). Qwen3.5 4B misurato e scartato (peggiore del Qwen3 4B).
- **Benchmark** (`eval/answers.jsonl`, 139 domande in 9 categorie, indice di prova 2026-11-14 + record SDE nuovi + glossario, 2026-11-15): motore di partenza 112/139 con Qwen3 4B → **133/139** Qwen3 4B (4,9 s/risposta), **133/139** Qwen3.5 9B (9,3 s), **130/139** Gemma 4 12B (10,2 s). Il conteggio a parole chiave è saturo e oscilla di ±2: per confrontare modelli serve il giudizio cieco sulle risposte complete (`--out`, poi `--rescore` per ricalcolare dopo aver corretto un `must`).
- **Giudizio cieco sulle risposte finali** (3 giudici LLM, lettere rimescolate, stesse 139 domande, 2026-11-15) — correttezza / risposte piene / risposte sbagliate / italiano: Gemma 4 12B 94% / 126 / 3 / 94%; Qwen3.5 9B 92% / 120 / 3 / 92%; Qwen3 4B 86% / 103 / 2 / 78%. Prima delle correzioni al motore le risposte sbagliate erano 6 / 9 / 9. Il 4B resta debole su consigli, principianti e follow-up (75-76%) e sui termini italiani.
