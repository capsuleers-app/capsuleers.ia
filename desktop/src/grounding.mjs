// Which numbers of an answer do NOT appear in what the model was given (context + question).
// A local model sometimes writes a figure that is in no source ("5% armor resistance" for a
// hull whose record says 4% shield resistance; 3 850 for a sum that is 4 300). This is a
// deterministic check after generation — no second model call. Pure function.
//
// A number is supported when the context holds the same value: written differently
// (5.200.000 / 5,200,000 / 5200000), rounded (19.85 → 19.9), or scaled to k / million /
// billion ("4,76 milioni" for 4 761 992). Small integers (≤ 12: list positions, skill levels,
// counts) are never flagged.

const NUM = /\d[\d.,'’  ]*\d|\d/g;

/** "5.200.000" | "5,200,000" | "19,85" | "0.136" → number (NaN when it is not one). */
export function parseNumber(raw) {
  let s = raw.replace(/['’  ]/g, "").replace(/[.,]+$/, "");
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ""));          // thousands groups
  if (/^\d{1,3}(?:[.,]\d{3})+[.,]\d{1,2}$/.test(s)) {                                       // groups + decimals
    const i = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
    return Number(s.slice(0, i).replace(/[.,]/g, "") + "." + s.slice(i + 1));
  }
  s = s.replace(",", ".");
  return /^\d+(?:\.\d+)?$/.test(s) ? Number(s) : NaN;
}

function numbersIn(text) {
  const out = [];
  // Dates and versions are compared as text below, not as numbers.
  const plain = text.replace(/https?:\/\/\S+/g, " ").replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ");
  for (const m of plain.matchAll(NUM)) {
    // "3 items, 5 slots" — spaces only join digit GROUPS of three ("5 200 000").
    const raw = /\s/.test(m[0]) && !/^\d{1,3}(?:[\s ]\d{3})+$/.test(m[0].trim()) ? m[0].split(/\s+/) : [m[0]];
    for (const r of raw) { const v = parseNumber(r); if (Number.isFinite(v)) out.push([v, r]); }
  }
  return out;
}

const near = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(b) * 0.006, 0.0051);

/**
 * @param {string} answer   the model's answer (before links are added)
 * @param {string} given    everything the model was shown (context, question, today's date)
 * @returns {string[]} the unsupported numbers as written in the answer, deduplicated
 */
export function unsupportedNumbers(answer, given) {
  const ctx = numbersIn(given).map(([v]) => v);
  const ctxDates = new Set(given.match(/\b\d{4}-\d{2}-\d{2}\b/g) || []);
  const bad = [];
  for (const d of answer.match(/\b\d{4}-\d{2}-\d{2}\b/g) || []) if (!ctxDates.has(d) && !bad.includes(d)) bad.push(d);
  // Percentages are checked even when small: "5% armor resistance" against a record that
  // says "4% shield resistance" is exactly the error this exists for.
  const perc = (t) => [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)].map((m) => [parseNumber(m[1]), m[0].replace(/\s+/g, "")]);
  const ctxPerc = perc(given).map(([v]) => v);
  for (const [v, raw] of perc(answer)) if (!ctxPerc.some((c) => near(v, c)) && !bad.includes(raw)) bad.push(raw);
  // List numbering ("1. …", "2) …") is layout, not a claim.
  const body = answer.replace(/^[ \t]*\d{1,2}[.)]\s/gm, "");
  for (const [v, raw] of numbersIn(body)) {
    if (Number.isInteger(v) && v <= 12) continue;
    if (bad.includes(`${raw}%`)) continue;
    const ok = ctx.some((c) => near(v, c) || near(v * 1e3, c) || near(v * 1e6, c) || near(v * 1e9, c) || near(v, c * 100) || near(v * 100, c));
    if (!ok && !bad.includes(raw)) bad.push(raw);
  }
  return bad;
}
