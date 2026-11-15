// Release timeline derived from the index itself, so "what is the latest expansion / the one
// before / when did it ship" has ONE authoritative answer instead of whatever dated article the
// retrieval happens to rank first (measured on four chat models: all of them named the June
// expansion in November, because an article titled "L'ultima espansione è troppo noiosa?"
// matched the question word for word).
//
// CCP's patch-note pages open with "…this release (Version 24.02 AKA Fractured Skies)" and
// "Initial Release Date: 2026-11-10"; expansions also get an "<Name>: Expansion Notes (date)"
// page published a few days before the release they belong to. Pure function, no models.

const ROOT = /^Patch Notes\b[^›]*$/;                       // the page's first chunk, not a "› section"
const VERSION = /Version\s+(\d+\.\d+)(?:\s+AKA\s+([^)]+?))?\s*\)/;
const VERSION_T = /Version\s+(\d+\.\d+)/;
const RELEASED = /Initial Release Date:\s*(\d{4}-\d{2}-\d{2})/;
const EXPANSION = /^(.+?): Expansion Notes \((\d{4}-\d{2}-\d{2})\)$/;
const day = (iso) => Date.parse(`${iso}T00:00:00Z`) / 864e5;

/** @returns {{version:string,name:string|null,date:string,url:string|null}[]} newest first */
export function buildTimeline(meta) {
  const releases = new Map(), expansions = new Map();
  for (const m of meta) {
    if (m.source && m.source !== "ccp_patch_notes") continue;
    const title = m.title || "";
    const e = EXPANSION.exec(title);
    if (e) { if (!expansions.has(e[1])) expansions.set(e[1], { name: e[1], date: e[2], url: m.url || null }); continue; }
    if (!ROOT.test(title)) continue;
    const r = RELEASED.exec(m.text || "");
    const v = VERSION.exec(m.text || "") || VERSION_T.exec(title);
    if (!r || !v) continue;
    const prev = releases.get(v[1]);
    // "19.11 #1" / "#2" are two pages of one release: keep the earliest date and any name.
    if (!prev || r[1] < prev.date) releases.set(v[1], { version: v[1], name: v[2]?.trim() || prev?.name || null, date: r[1], url: m.url || null });
    else if (!prev.name && v[2]) prev.name = v[2].trim();
  }
  const list = [...releases.values()];
  // An expansion-notes page precedes its release by a few days (Cradle of War: notes 06-05,
  // release 06-09). Attach the name to the first unnamed release within two weeks after it.
  for (const x of expansions.values()) {
    const hit = list.filter((r) => !r.name && day(r.date) >= day(x.date) - 1 && day(r.date) - day(x.date) <= 14)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (hit) { hit.name = x.name; hit.notesUrl = x.url; }
  }
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

// Questions the timeline answers: expansions / patches / versions / "what's new".
export const TIMELINE_Q = /\b(?:espansion\w*|expansions?|patch(?:\s*notes?)?|version[ei]?|release|rilasci\w*|aggiornament\w*|updates?|novit[àa]|what'?s\s+new)\b/i;

/** Context block (newest first), or "" when the index carries no release data. */
export function timelineBlock(timeline, lang = "it", max = 8) {
  if (!timeline?.length) return "";
  const it = lang === "it";
  const named = timeline.filter((r) => r.name);
  const rows = timeline.slice(0, max).map((r, i) => {
    const what = r.name ? `${it ? "espansione" : "expansion"} ${r.name}` : (it ? "aggiornamento senza nome" : "unnamed update");
    return `- ${r.date} — Version ${r.version} — ${what}${i === 0 ? (it ? " (release PIÙ RECENTE)" : " (MOST RECENT release)") : ""}`;
  });
  const head = it
    ? "Cronologia delle release di EVE Online (dalle patch notes CCP, dalla più recente; la data è il giorno di uscita):"
    : "EVE Online release timeline (from CCP patch notes, newest first; the date is the release day):";
  const last = named[0], before = named[1];
  const tail = last
    ? (it ? `Ultima espansione: ${last.name} (uscita il ${last.date}).${before ? ` Quella precedente: ${before.name} (${before.date}).` : ""}`
          : `Latest expansion: ${last.name} (released ${last.date}).${before ? ` The one before: ${before.name} (${before.date}).` : ""}`)
    : "";
  return [head, ...rows, tail].filter(Boolean).join("\n");
}
