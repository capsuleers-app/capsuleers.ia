// End-to-end answer quality of ONE chat model on eval/answers.jsonl: the real ask()
// pipeline (retrieval + prompt + generation), scored on facts the answer must contain
// (`must`: every group needs one of its alternatives, case-insensitive), on the reply
// language, and — for `refuse` rows — on saying the sources don't have it instead of
// inventing. Rows have a `cat` (score printed per category); `followup` rows carry
// `turns` asked in sequence WITHOUT resetting the conversation, the row passes only if
// every turn does. One process per model: VRAM is released when it exits.
//
//   node tools/eval-answers.mjs Qwen3-4B-Instruct-2507-Q4_K_M.gguf
//   IA_MODELS=/dir/with/ggufs node tools/eval-answers.mjs <file.gguf> [--only id,id] [--cat a,b] [--show]
//
// The models are linked into a scratch dir, so the app's saved model choice
// (models/.selected-model) is never touched. Ends with one JSON line for comparisons.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configurePaths, init, ask, resetConversation, shutdown } from "../src/engine.mjs";
import { detectLang } from "../src/links.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(os.homedir(), ".config", "capsuleers-ia-desktop");
const DATA = process.env.IA_DATA || path.join(APP, "data");
const MODELS = process.env.IA_MODELS || path.join(APP, "models");
const EMBED = process.env.IA_EMBED || path.join(APP, "models", "bge-m3-Q8_0.gguf");
const DATASET = path.join(HERE, "..", "..", "eval", "answers.jsonl");

const argv = process.argv.slice(2);
const opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
// --out f.json saves every full answer; --rescore f.json re-scores them against the CURRENT
// dataset without loading a model (after fixing a too-strict `must`, or to compare runs).
const outFile = opt("--out"), rescore = opt("--rescore");
const saved = rescore ? JSON.parse(fs.readFileSync(rescore, "utf-8")) : null;
const file = saved ? saved.model : argv.find((a) => a.endsWith(".gguf"));
if (!file) { console.error("uso: eval-answers.mjs <modello.gguf> [--only id,id] [--cat a,b] [--show]"); process.exit(2); }
const only = argv.includes("--only") ? new Set(argv[argv.indexOf("--only") + 1].split(",")) : null;
const cats = argv.includes("--cat") ? new Set(argv[argv.indexOf("--cat") + 1].split(",")) : null;
const show = argv.includes("--show");

const scratch = saved ? null : fs.mkdtempSync(path.join(os.tmpdir(), "capsuleers-eval-"));
if (!saved) {
  fs.symlinkSync(EMBED, path.join(scratch, "bge-m3-Q8_0.gguf"));
  fs.symlinkSync(path.resolve(MODELS, file), path.join(scratch, file));
  fs.writeFileSync(path.join(scratch, ".selected-model"), file);
  configurePaths({ modelsDir: scratch, dataDir: DATA });
}

const REFUSAL = /non ho (questa|quest'|queste|l')?\s*informazion|non (è|e') (presente|indicat|specificat|riportat)|non (sono|risulta) disponibil|not (in|available in) the (provided )?(context|sources)|i don'?t have (this|that) information|does not (specify|mention|contain|provide|state)|(cannot|can't|unable to) (answer|determine|predict|be determined)|no information (about|on|regarding)|is not (mentioned|specified|stated|provided|available)|non (posso|è possibile) (rispondere|determinare|prevedere|saperlo)|nessuna informazione|non (viene|vengono) (menzionat|specificat|indicat)/i;

const cases = fs.readFileSync(DATASET, "utf-8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  .filter((c) => (!only || only.has(c.id)) && (!cats || cats.has(c.cat)));
const t0 = Date.now();
const info = saved ? saved.info : await init(() => {});
const savedById = saved ? new Map(saved.rows.map((r) => [r.id, r])) : null;
const outRows = [];
console.log(`${file}${saved ? " (rescore)" : ""} · GPU ${info.gpu} · layer in GPU ${info.gpuLayers}/${info.totalLayers} · caricato in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

let pass = 0, ms = 0, chars = 0, nAsk = 0;
const byCat = {};
const phases = {};   // ms per pipeline phase, summed over every question (ask() → timing)
for (const c of cases) {
  if (saved && !savedById.has(c.id)) continue;
  if (!saved) resetConversation();   // once per row: `turns` share one conversation
  const turns = c.turns || [c];
  let ok = true, dtRow = 0, note = "";
  const shown = [];
  for (const [i, turn] of turns.entries()) {
    const t = Date.now();
    const prev = saved ? savedById.get(c.id) : null;
    const { answer, timing } = prev ? { answer: prev.answers[i] ?? "" } : await ask(turn.q, () => {}, c.lang);
    for (const [k, v] of Object.entries(timing || {})) phases[k] = (phases[k] || 0) + v;
    const dt = prev ? (prev.ms[i] ?? 0) : Date.now() - t;
    (outRows[outRows.length - 1]?.id === c.id ? outRows[outRows.length - 1] : outRows[outRows.push({ id: c.id, cat: c.cat, answers: [], ms: [] }) - 1]).answers.push(answer);
    outRows[outRows.length - 1].ms.push(dt); dtRow += dt; ms += dt; chars += answer.length; nAsk++;
    const text = answer.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");   // linkified names → plain
    const facts = turn.refuse ? REFUSAL.test(text)
      : (turn.must || []).every((group) => group.some((alt) => text.toLowerCase().includes(alt.toLowerCase())));
    const lang = detectLang(text, c.lang) === c.lang;
    if (!(facts && lang)) { ok = false; note += `${c.turns ? ` t${i + 1}` : ""}${facts ? "" : " · fatti mancanti"}${lang ? "" : " · lingua sbagliata"}`; }
    shown.push(`${c.turns ? `t${i + 1}: ` : ""}${text.replace(/\s+/g, " ").slice(0, 400)}`);
  }
  if (ok) pass++;
  const k = c.cat || "other";
  (byCat[k] ||= { pass: 0, total: 0 }).total++;
  if (ok) byCat[k].pass++;
  console.log(`${ok ? "✓" : "✗"} ${c.id.padEnd(22)} ${(dtRow / 1000).toFixed(1).padStart(5)} s${note}`);
  if (show || !ok) for (const l of shown) console.log(`    ${l}`);
}
const n = cases.length || 1;
console.log("\nper categoria:");
for (const [k, v] of Object.entries(byCat).sort()) console.log(`  ${k.padEnd(10)} ${v.pass}/${v.total}`);
console.log(`\n${file}: ${pass}/${cases.length} corrette · ${(ms / n / 1000).toFixed(1)} s/riga in media`);
if (Object.keys(phases).length) console.log("fasi (ms medi per domanda): " + Object.entries(phases).map(([k, v]) => `${k} ${Math.round(v / (nAsk || 1))}`).join(" · "));
console.log(JSON.stringify({ model: file, pass, total: cases.length, byCat, avgSec: +(ms / n / 1000).toFixed(2), avgChars: Math.round(chars / (nAsk || 1)), gpuLayers: `${info.gpuLayers}/${info.totalLayers}` }));
if (outFile) fs.writeFileSync(outFile, JSON.stringify({ model: file, info, env: { ctx: process.env.IA_CHAT_CTX || null, chars: process.env.IA_CONTEXT_CHARS || null }, rows: outRows }));
if (saved) process.exit(0);
await shutdown();
fs.rmSync(scratch, { recursive: true, force: true });
process.exit(0);
