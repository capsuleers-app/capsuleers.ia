// Hybrid retrieval over the in-RAM index: dense (bge-m3 cosine + the source-tier
// nudge) plus a share of lexical BM25, then de-duplicated so one family of near-identical
// records cannot fill the whole context. Pure functions over { vectors, meta, bonus },
// no models: tools/probe-retrieval.mjs and tools/verify-retrieval.mjs drive the same
// code the app runs.
//
// Why, measured on index-2026.10.02 with "dove si droppano gli impianti
// High-grade Amulet?": dense-only top-12 was 12 SDE records of the Amulet set
// (Low/Mid/High × Alpha…Omega, cosine 0.56-0.59, all saying the same thing and none
// saying where the implants come from), while the Feb 2020 patch note that answers it
// ("Amulet Implants moved to Blood Raider Loyalty Store and loot tables") sat at rank
// 339. A rare proper noun ("Amulet") barely moves a 1024-dim embedding of a whole
// question; it is exactly what a keyword index is good at. And no fusion helps while
// 18 near-copies outrank everything: hence the near-duplicate cap.

const DIM = 1024;

// Candidate pools handed to the fusion. Dense is the primary signal; the lexical
// pool only has to be deep enough to reach a chunk that mentions a rare name once.
const DENSE_POOL = 200;
const LEXICAL_POOL = 100;
// Fusion: dense score + LEX_ALPHA × BM25 normalised to the best lexical hit, over the
// union of both pools. Tuned with tools/verify-retrieval.mjs on eval/retrieval.jsonl
// (30 questions IT/EN) and checked on the held-out eval/retrieval-holdout.jsonl (22),
// counting what fits the 6000-char context: dense-only 26/30 and 19/22 → 30/30 and
// 22/22 (with the caps below). 0.05 lost the
// Italian Amulet question, 0.15 changed nothing. Reciprocal Rank Fusion was tried
// first and lost the English one: the patch note sat 5th in the lexical list only,
// and RRF ranked above it every page that merely said "implants" in BOTH lists — rank
// fusion throws away that "Amulet" is a 22-chunk word and "implants" an 821-chunk one.
const LEX_ALPHA = 0.1;
// Near-duplicate cap: a candidate whose cosine with an already-selected chunk OF THE
// SAME SOURCE is ≥ DUP_SIM waits behind every non-duplicate. Measured on
// index-2026.10.02: records of one SDE family (the 18 Amulet implants, the SKINs of a
// hull) score 0.77-0.98 with each other, a patch-note section vs the items it talks
// about ~0.65; two chunks of the SAME wiki/Support/patch-note page reach 0.85 only
// 2-9% of the time (median 0.70-0.79), so the cap thins families without splitting
// pages. Across sources a high cosine is not redundancy: the SDE record of the
// Caracal and EVE Uni's Caracal page are ≥ 0.85 apart yet complementary (the official
// skill tree vs how to fly it) — compared across sources, the cap dropped the SDE
// record and the model invented the skill list.
const DUP_SIM = 0.85;
const MAX_DUP = 1;
// One chunk per page before every other candidate (more only if there aren't k
// others): the 6000-char context holds ~4-6 blocks. With two, "quanti slot ha la
// Vexor?" filled the budget with two EVE Uni chunks + the Fandom page and the 2 000-char
// SDE record with the actual slot layout no longer fit — the model answered "3 mid,
// 4 low" (it is 4 and 5). Same on the Caracal skill tree, with four chunks of one page.
const MAX_PER_PAGE = 1;
const TOP_PAGE_CHUNKS = 2;   // …except the page of the best-ranked web chunk (see diversify)

// BM25 parameters (the textbook values) and the document-frequency ceiling above
// which a query term is ignored: the lexical side is there for RARE names (Amulet:
// 22 chunks), not for "asteroid" (1 451) or "state" (1 927 — Italian "sono state"
// pulled every "State Managed Asteroid Belt" record and pushed the 19.11 patch note
// out of the context). 1% of the index = ~850 chunks.
const BM25_K1 = 1.2, BM25_B = 0.75;
const MAX_DF_RATIO = 0.01;

// Function words of the two supported languages, plus the question words that
// carry no lexical content. "ore" is here on purpose: in Italian it means "hours",
// and as the English mining word it matches thousands of SDE ore records, so the df
// ceiling would drop it anyway — the dense side still understands it.
const STOP = new Set(`
a ad al alla alle allo ai agli anche c che chi ci come con cosa cos da dal dalla dalle dai degli dei del della delle dello di do dove dovrei e ed è gli ha hai ho i il in io la le lo ma mi ne nel nella nelle nei negli non o per perché perche più piu può puo qual quale quali qualcuno quando quanto quanti quante quanta questo questa questi queste quello quella quelli quelle se si sia sono su sul sulla sulle sui ti tra fra tu un una uno vorrei voglio dammi dimmi parlami spiegami posso puoi devo serve servono ore conviene meglio migliore migliori ha hanno fa fanno
an and are as at be by can could do does did for from has have how i if in is it its me my of on or should tell the their there these they this those to was were what when where which who why will with would you your about please give show get
better best good eve online
`.split(/\s+/).filter(Boolean));

const TOKEN = /[\p{L}\p{N}]+/gu;
const MAX_TITLE_NGRAM = 6;

/** Lower-cased word tokens (letters/digits, any script), length ≥ 2. */
export function tokenize(text) {
  const out = [];
  for (const t of (text || "").toLowerCase().match(TOKEN) || []) if (t.length >= 2) out.push(t);
  return out;
}

/**
 * Inverted index over title + text of every chunk. ~2 s and ~25 MB of postings for
 * 85k chunks (measured), so it is built once, after the vectors, not per query.
 * @param {{title?:string,text?:string}[]} meta
 */
export function buildLexicalIndex(meta) {
  const raw = new Map();   // token → [doc, tf, doc, tf, …] while building
  const byTitle = new Map();   // "damage control ii" → docs with exactly that title (≥ 2 tokens)
  const docLen = new Uint32Array(meta.length);
  let total = 0;
  for (let i = 0; i < meta.length; i++) {
    const toks = tokenize(`${meta[i].title || ""} ${meta[i].text || ""}`);
    docLen[i] = toks.length; total += toks.length;
    const tt = tokenize(meta[i].title);
    if (tt.length >= 2 && tt.length <= MAX_TITLE_NGRAM) { const k = tt.join(" "); (byTitle.get(k) || byTitle.set(k, []).get(k)).push(i); }
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    for (const [t, c] of tf) {
      let a = raw.get(t);
      if (!a) { a = []; raw.set(t, a); }
      a.push(i, c);
    }
  }
  const post = new Map();
  for (const [t, a] of raw) {
    const ids = new Uint32Array(a.length / 2), tf = new Uint16Array(a.length / 2);
    for (let j = 0; j < a.length; j += 2) { ids[j / 2] = a[j]; tf[j / 2] = Math.min(a[j + 1], 65535); }
    post.set(t, { ids, tf });
  }
  return { post, docLen, avgLen: total / (meta.length || 1), n: meta.length, byTitle };
}

/** The query terms the lexical index scores: deduped, no stopwords, no ubiquitous terms. */
export function lexicalTerms(lex, query, maxDfRatio = MAX_DF_RATIO) {
  const maxDf = Math.max(1, Math.floor(lex.n * maxDfRatio));
  return [...new Set(tokenize(query))].filter((t) => !STOP.has(t) && lex.post.get(t)?.ids.length <= maxDf);
}

/** BM25 top-`n` as [score, docIndex], best first. */
export function lexicalSearch(lex, query, n = LEXICAL_POOL, maxDfRatio = MAX_DF_RATIO) {
  const terms = lexicalTerms(lex, query, maxDfRatio);
  if (!terms.length) return [];
  const acc = new Map();
  for (const t of terms) {
    const { ids, tf } = lex.post.get(t);
    const idf = Math.log(1 + (lex.n - ids.length + 0.5) / (ids.length + 0.5));
    for (let j = 0; j < ids.length; j++) {
      const d = ids[j], f = tf[j];
      const s = idf * (f * (BM25_K1 + 1)) / (f + BM25_K1 * (1 - BM25_B + BM25_B * lex.docLen[d] / lex.avgLen));
      acc.set(d, (acc.get(d) || 0) + s);
    }
  }
  return [...acc].map(([d, s]) => [s, d]).sort((a, b) => b[0] - a[0]).slice(0, n);
}

/**
 * Docs whose WHOLE title is named in the query ("Vexor", "Damage Control II", "Jita"):
 * every title token appears among the query tokens, and at least one of them is a
 * lexical term (rare enough to pass lexicalTerms). That is the entity the question is
 * about. Measured on "quanti high slot … ha la Vexor?": BM25 favours short records, so
 * the 30+ "Vexor … SKIN" records outscored the ship's own SDE record, and the first
 * SKIN kept made the near-duplicate cap drop the ship — the model then guessed the
 * slot layout. "Vexor IGC SKIN" is not a title match: "IGC SKIN" is not in the query.
 * Candidates come from the postings of the lexical terms, so the check is cheap.
 */
export function titleMatches(lex, meta, query, maxDfRatio = MAX_DF_RATIO) {
  const qt = tokenize(query);
  const q = new Set(qt);
  const out = new Set();
  // A multi-word title typed as a phrase is a match even when every word of it is common:
  // "requisiti skill del Damage Control II" has no rare term (damage, control, ii are
  // everywhere), so the rule below never looked at the module's record and, once its
  // embedding no longer happened to be in the dense pool, the record was gone.
  if (lex.byTitle) for (let n = Math.min(MAX_TITLE_NGRAM, qt.length); n >= 2; n--) {
    for (let i = 0; i + n <= qt.length; i++) {
      const gram = qt.slice(i, i + n);
      if (gram.every((t) => STOP.has(t))) continue;   // "eve online" is in every question
      for (const d of lex.byTitle.get(gram.join(" ")) || []) out.add(d);
    }
  }
  for (const t of lexicalTerms(lex, query, maxDfRatio)) {
    for (const d of lex.post.get(t).ids) {
      if (out.has(d)) continue;
      const tt = tokenize(meta[d].title);
      if (tt.length && tt.every((x) => q.has(x))) out.add(d);
    }
  }
  return out;
}

/** Unit-normalised copy of an embedding. */
export function normalize(vec) {
  const q = Float32Array.from(vec);
  let s = 0; for (let j = 0; j < q.length; j++) s += q[j] ** 2;
  const inv = 1 / (Math.sqrt(s) || 1);
  for (let j = 0; j < q.length; j++) q[j] *= inv;
  return q;
}

/** Dense top-`n` as [score, docIndex]: cosine (vectors are pre-normalised) + tier nudge. */
export function denseSearch(index, qvec, n = DENSE_POOL) {
  const q = normalize(qvec);
  const scores = new Array(index.count);
  for (let i = 0; i < index.count; i++) {
    let dot = 0; const off = i * DIM;
    for (let j = 0; j < DIM; j++) dot += index.vectors[off + j] * q[j];
    scores[i] = [dot + (index.bonus ? index.bonus[i] : 0), i];
  }
  scores.sort((a, b) => b[0] - a[0]);
  return scores.slice(0, n);
}

/** Score fusion over the union of the pools: dense score (cosine + tier nudge) plus
 *  alpha × (BM25 normalised to the best lexical hit + 1 for a title match)
 *  → docIndex[], best first. */
export function fuseScores(index, qvec, dense, lexical, alpha, titles = new Set(), boost = null) {
  const q = normalize(qvec);
  const top = lexical[0]?.[0] || 1;
  const lexOf = new Map(lexical.map(([s, d]) => [d, s / top]));
  for (const d of titles) lexOf.set(d, (lexOf.get(d) || 0) + 1);
  const denseOf = new Map(dense.map(([s, d]) => [d, s]));
  const out = [];
  for (const d of new Set([...denseOf.keys(), ...lexOf.keys(), ...(boost ? boost.keys() : [])])) {
    let ds = denseOf.get(d);
    if (ds === undefined) {
      ds = index.bonus ? index.bonus[d] : 0; const off = d * DIM;
      for (let j = 0; j < DIM; j++) ds += index.vectors[off + j] * q[j];
    }
    out.push([ds + alpha * (lexOf.get(d) || 0) + (boost?.get(d) || 0), d]);
  }
  return out.sort((a, b) => b[0] - a[0]).map(([, d]) => d);
}

function cos(index, a, b) {
  let dot = 0; const oa = a * DIM, ob = b * DIM;
  for (let j = 0; j < DIM; j++) dot += index.vectors[oa + j] * index.vectors[ob + j];
  return dot;
}

/**
 * Greedy near-duplicate cap over a ranked docIndex[]: keeps the order, but a doc that
 * is a near-copy (cosine ≥ dupSim) of ≥ maxDup already-kept docs of its own source
 * waits behind every
 * non-duplicate. Deferred docs only come back if there aren't k distinct ones.
 */
export function diversify(index, ranked, k, o = {}) {
  const { dupSim = DUP_SIM, maxDup = MAX_DUP, maxPerPage = MAX_PER_PAGE } = o;
  const kept = [], deferred = [], perPage = new Map();
  let topPage;
  // Older index releases carry no `source`; only SDE chunks have no URL there.
  const src = (d) => index.meta[d].source || (index.meta[d].url ? "web" : "ccp_sde");
  for (const d of ranked) {
    if (kept.length >= k) break;
    const page = index.meta[d].url;   // SDE records (no URL) are one record each
    // The best-ranked page may give a second chunk: "che efficienza ha il reprocessing nelle
    // stazioni NPC?" got the intro chunk of EVE Uni's Reprocessing page, and the base yield
    // (50%) was in the next one — four chat models missed it.
    if (page && topPage === undefined) topPage = page;
    const cap = page === topPage ? Math.max(maxPerPage, o.topPageChunks ?? TOP_PAGE_CHUNKS) : maxPerPage;
    if (page && (perPage.get(page) || 0) >= cap) { deferred.push(d); continue; }
    let dups = 0;
    for (const s of kept) if (src(s) === src(d) && cos(index, d, s) >= dupSim && ++dups >= maxDup) break;
    if (dups >= maxDup) { deferred.push(d); continue; }
    kept.push(d);
    if (page) perPage.set(page, (perPage.get(page) || 0) + 1);
  }
  for (const d of deferred) { if (kept.length >= k) break; kept.push(d); }
  return kept;
}

// ── Cosmetic noise ──────────────────────────────────────────────────────────
// SDE records of SKINs ("Rokh Wiyrkomi SKIN (7 Days)") and "… Edition Blueprint" are short,
// carry the ship's name and so match every question about that hull: on "quanti CPU e
// powergrid ha la Rokh?" three of seven context blocks were SKINs. They wait behind every
// other candidate (like near-duplicates) unless the question is about skins/editions.
const COSMETIC_Q = /\b(?:skins?|editions?|cosmetic\w*|cosmetici|livree|livery|liveries|apparenza)\b/i;
export const isCosmetic = (m) => /\bSKIN\b/.test(m.title) || /\bEdition Blueprint$/i.test(m.title);
function deferCosmetic(index, ranked, query) {
  if (COSMETIC_Q.test(query)) return ranked;
  const a = [], b = [];
  for (const d of ranked) (isCosmetic(index.meta[d]) ? b : a).push(d);
  return b.length ? a.concat(b) : ranked;
}

// ── Recency ─────────────────────────────────────────────────────────────────
// "l'ultima espansione", "latest patch": the newest DATED source (patch notes, dev blogs,
// site articles carry "(YYYY-MM-DD)" in the title) must win, but a topic embedding cannot
// tell 2026-11 from 2024-06 (the answer named the June 2026 expansion with a 2024 patch
// note as source). Dated chunks get a bonus that decays with their age relative to the
// NEWEST date in the index (not the clock: an old index must still answer with its latest).
const RECENT_Q = /\b(?:ultim[oaie]|recent[ei]|attual[ei]|latest|current(?:ly)?|newest|most\s+recent|just\s+released)\b/i;
const RECENCY_W = 0.12, RECENCY_SPAN = 400;
const DATED = /\((\d{4})-(\d{2})-(\d{2})\)/;
function datesOf(index) {
  if (index._days) return index._days;
  const days = new Int32Array(index.count); let newest = 0;
  for (let i = 0; i < index.count; i++) {
    const m = DATED.exec(index.meta[i].title);
    if (m) { days[i] = Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5); if (days[i] > newest) newest = days[i]; }
  }
  return (index._days = Object.assign(days, { newest }));
}
function recencyBoost(index) {
  const days = datesOf(index), boost = new Map();
  for (let i = 0; i < index.count; i++) {
    if (!days[i]) continue;
    const age = days.newest - days[i];
    // Every dated chunk inside the span is also a candidate (fuseScores scores the union).
    if (age < RECENCY_SPAN) boost.set(i, RECENCY_W * (1 - age / RECENCY_SPAN));
  }
  return boost;
}

// ── Several entities + a theme ──────────────────────────────────────────────
// "Gila o Ishtar per gli abyssal T4?": the embedding of the whole sentence sits near one
// of the hulls and the theme (abyssal) never reaches the context. When the query names ≥2
// entities (distinct whole-title matches), or one entity plus a substantial residual
// topic, each entity gets a guaranteed slot (its best-ranked record) and the residual
// (query minus entity names and function words) is searched on its own and interleaved.
const MAX_ENTITIES = 3;
// Ranks of the plain ranking kept ahead of any interleaving with the residual list (with a
// rewrite only the first one: 0, 1 and 2 all measured 30/30 and 22/22 on the golden sets).
const HEAD = 4;
export function planQuery(lex, meta, query, titles) {
  if (!lex || !titles.size) return null;
  const groups = new Map();   // lower-cased title → docs
  for (const d of titles) {
    const key = meta[d].title.toLowerCase();
    (groups.get(key) || groups.set(key, []).get(key)).push(d);
  }
  // A title whose tokens are all part of a longer matched title is the same entity.
  const toks = [...groups.keys()].map((k) => [k, new Set(tokenize(k))]);
  const keys = toks.filter(([k, t]) => !toks.some(([k2, t2]) => k2 !== k && t2.size > t.size && [...t].every((x) => t2.has(x)))).map(([k]) => k);
  if (!keys.length) return null;
  const named = new Set(keys.flatMap((k) => tokenize(k)));
  const residual = tokenize(query).filter((t) => !STOP.has(t) && !named.has(t) && !/^t[1-5]$/.test(t));   // "t4" only matches SDE junk (T-4ACL…)
  if (keys.length < 2 && residual.length < 2) return null;
  // `residual` (keywords) feeds the lexical side; `residualText` (the sentence minus the entity
  // names) is what gets embedded — "abyssal" alone lands on SDE junk, the sentence does not.
  const residualText = query.replace(TOKEN, (w) => (named.has(w.toLowerCase()) ? " " : w))
    .replace(/\s+/g, " ").replace(/^(?:\s|[,;:]|\b(?:o|e|ed|or|and|vs\.?|versus)\b)+/i, "").trim();
  return { groups: keys.map((k) => groups.get(k)), residual: residual.length ? [...new Set(residual)].join(" ") : null, residualText };
}

// ── The record of the thing the question names ──────────────────────────────
// "quali skill servono per il Tengu?": the hull's SDE record (3 880 chars, rank 7) lost its
// place to five "Tengu <subsystem>" records and four chat models answered with a subsystem's
// skills. When the query names an entity whose whole title is a primary record (SDE ship /
// module / skill / system…, or a glossary term), that record opens the context.
const PRIMARY_TYPES = new Set(["ship", "module", "skill", "system", "region", "constellation", "glossary"]);
const MAX_PRIMARY = 2;
function entityGroups(meta, titles) {
  const groups = new Map();
  for (const d of titles) {
    const key = meta[d].title.toLowerCase();
    (groups.get(key) || groups.set(key, []).get(key)).push(d);
  }
  // A title whose tokens are all part of a longer matched title is the same entity
  // ("Vexor" inside "Vexor Navy Issue").
  const toks = [...groups.keys()].map((k) => [k, new Set(tokenize(k))]);
  const keep = toks.filter(([k, t]) => !toks.some(([k2, t2]) => k2 !== k && t2.size > t.size && [...t].every((x) => t2.has(x))));
  return keep.map(([k]) => groups.get(k));
}
function primaryRecords(index, titles, order) {
  const at = new Map(order.map((d, i) => [d, i]));
  const isPrimary = (d) => {
    const m = index.meta[d];
    return PRIMARY_TYPES.has(m.type) && !isCosmetic(m) && (m.source ? m.source === "ccp_sde" || m.source === "capsuleers_glossary" : !m.url);
  };
  return entityGroups(index.meta, titles).map((g) => g.filter(isPrimary)[0]).filter((d) => d !== undefined)
    .sort((a, b) => (at.get(a) ?? 1e9) - (at.get(b) ?? 1e9)).slice(0, MAX_PRIMARY);
}
/** Titles of the entities a query names (whole-title matches, longest wins), for follow-ups. */
export function namedEntities(lex, meta, query, max = 3) {
  if (!lex) return [];
  const titles = titleMatches(lex, meta, query);
  const out = [];
  for (const g of entityGroups(meta, titles)) {
    const d = g.find((x) => PRIMARY_TYPES.has(meta[x].type)) ?? g[0];
    if (!out.includes(meta[d].title)) out.push(meta[d].title);
  }
  return out.sort((a, b) => b.length - a.length).slice(0, max);
}

// One ranked list (best first) for a query vector: dense + lexical + title matches, cosmetic deferred.
function rank(index, lex, qvec, query, o, titles, boost) {
  const dense = denseSearch(index, qvec, DENSE_POOL);
  const lexical = lex ? lexicalSearch(lex, query, LEXICAL_POOL, o.maxDfRatio) : [];
  const ranked = lexical.length || titles.size || boost
    ? fuseScores(index, qvec, dense, lexical, o.alpha ?? LEX_ALPHA, titles, boost)
    : dense.map(([, d]) => d);
  return deferCosmetic(index, ranked, query);
}

/**
 * The retrieval the app runs: dense + lexical pools + title matches → score fusion →
 * diversity caps → top-k. Without a lexical index it degrades to dense + the cap.
 * Optional extras (o.plan/o.residual from retrieveAsync, o.rewrites = other phrasings of
 * the query, already embedded): see the sections above.
 * @returns {number[]} doc indices into index.meta, best first
 */
export function retrieve(index, lex, qvec, query, k = 12, o = {}) {
  const titles = lex && !o.noTitle ? titleMatches(lex, index.meta, query, o.maxDfRatio) : new Set();
  let boost = null;
  if (o.recency ?? RECENT_Q.test(query)) {
    boost = recencyBoost(index);
  }
  const main = rank(index, lex, qvec, query, o, titles, boost);
  const plan = o.plan === undefined ? planQuery(lex, index.meta, query, titles) : o.plan;
  const rankX = (x) => rank(index, lex, x.vec, x.query, o, new Set(), boost);
  const resList = o.residual?.vec ? rankX(o.residual) : null;           // the theme without the entity names
  const rwLists = (o.rewrites || []).filter((x) => x?.vec).map(rankX);   // other phrasings of the whole query
  const merged = [], seen = new Set();
  const push = (d) => { if (!seen.has(d)) { seen.add(d); merged.push(d); } };
  const multi = plan && plan.groups.length >= 2;
  if (!multi && !o.noPrimary) primaryRecords(index, titles, main).forEach(push);
  if (plan) {
    // One guaranteed slot per entity: its best-ranked non-cosmetic record — except when exactly
    // one named entity is a hull: then the SDE ship record (slots, bonuses, attributes, skills:
    // the L1 truth) is its slot. With two hulls (Gila vs Ishtar) the 2 × 2.5 KB SDE records
    // would eat the budget the theme needs, so the smaller wiki pages stand in.
    const pos = new Map(main.map((d, i) => [d, i]));
    const at = (d) => pos.get(d) ?? 1e9;
    const hull = (g) => g.find((d) => index.meta[d].source === "ccp_sde" && index.meta[d].type === "ship");
    const oneHull = plan.groups.filter(hull).length === 1;
    plan.groups
      .map((g) => (oneHull && hull(g)) || g.filter((d) => !isCosmetic(index.meta[d])).sort((a, b) => at(a) - at(b))[0])
      .filter((d) => d !== undefined)
      .sort((a, b) => at(a) - at(b))
      .slice(0, MAX_ENTITIES)
      .filter((d) => multi || index.meta[d].type === "ship").forEach(push);
  }
  // With several entities the theme (residual list) comes right after them. With one entity
  // the plain ranking keeps its head (it already carries the title bonus) and there is no
  // residual search: it added "Brynn's Modified Co-Processor" to "CPU e powergrid della Rokh"
  // and the answer stopped listing the hull's bonuses.
  if (multi && resList) resList.slice(0, 2).forEach(push);
  if (!multi) {
    main.slice(0, o.head ?? (rwLists.length && !plan ? 1 : HEAD)).forEach(push);
  }
  // The rewrites (e.g. English) interleave with the main ranking after its head.
  const rest = [main, ...rwLists, ...(resList && multi ? [resList] : [])];
  for (let r = 0; merged.length < Math.max(300, k * 4) && rest.some((l) => r < l.length); r++) for (const l of rest) if (r < l.length) push(l[r]);
  return diversify(index, merged, k, o);
}

/**
 * retrieve() plus the second embedding some queries deserve: when planQuery finds
 * several entities, the residual topic is embedded (one more
 * ~200 ms embedding) and searched on its own. `embed(text)` → vector; `o.rewrites` are
 * extra search queries (e.g. an English rewrite of an Italian question) fused in too.
 */
export async function retrieveAsync(index, lex, qvec, query, k, o = {}) {
  const titles = lex && !o.noTitle ? titleMatches(lex, index.meta, query, o.maxDfRatio) : new Set();
  const plan = o.noPlan ? null : planQuery(lex, index.meta, query, titles);
  const extra = {};
  if (plan?.residual && plan.groups.length >= 2 && o.embed) extra.residual = { vec: await o.embed(plan.residualText || plan.residual), query: plan.residual };
  if (o.rewrites?.length && o.embed) {
    extra.rewrites = [];
    for (const q of o.rewrites) extra.rewrites.push({ vec: await o.embed(q), query: q });   // no title bonus: the original query already has it
  }
  return retrieve(index, lex, qvec, query, k, { ...o, plan, ...extra });
}
