// Which chat model the app recommends on THIS machine. The catalog marks one fixed `default`
// (a 4B model that runs anywhere); with enough VRAM a bigger model answers measurably better
// (eval/answers.jsonl, blind-judged: see docs/claude/desktop-runtime.md), so the recommendation
// follows the card: the highest-`rank` model whose `minVramGB` fits the GPU's TOTAL memory.
// Total, not free: free VRAM changes with whatever is open at first launch, and the engine
// already steps the context down (or offloads layers) when memory is short.
// Pure functions — no models, no GPU.

/** `models` + `modelsV2` as one list (V2 first, ids unique). Old app versions read only
 *  `models`, so entries they cannot run (reasoning models need the no-thought budget) live
 *  in `modelsV2` and never reach them through the remote catalog. */
export function mergeCatalogModels(catalog) {
  const seen = new Set(), out = [];
  for (const m of [...(catalog?.modelsV2 || []), ...(catalog?.models || [])]) {
    if (!m?.id || seen.has(m.id)) continue;
    seen.add(m.id); out.push(m);
  }
  return out;
}

/** Id of the model to recommend; `vramGB` null/undefined (no GPU info) → the catalog's `default`. */
export function pickDefaultId(models, vramGB) {
  const fallback = (models.find((m) => m.default) || models[0])?.id ?? null;
  if (!(vramGB > 0)) return fallback;
  const fits = models.filter((m) => Number.isFinite(m.rank) && (m.minVramGB ?? Infinity) <= vramGB);
  if (!fits.length) return fallback;
  return fits.sort((a, b) => b.rank - a.rank || a.sizeGB - b.sizeGB)[0].id;
}

/** The same list with `default` true only on the recommended model. */
export function withDefault(models, vramGB) {
  const id = pickDefaultId(models, vramGB);
  return models.map((m) => ({ ...m, default: m.id === id }));
}
