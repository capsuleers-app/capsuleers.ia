// The per-machine model recommendation (src/model-default.mjs) on the bundled catalog.
//   node desktop/tools/verify-model-default.mjs
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
import { mergeCatalogModels, pickDefaultId, withDefault } from "../src/model-default.mjs";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(fs.readFileSync(path.join(HERE, "..", "src", "models-catalog.json"), "utf-8"));
const models = mergeCatalogModels(catalog);
let bad = 0;
const check = (name, got, want) => { const ok = got === want; if (!ok) bad++; console.log(`${ok ? "✓" : "✗"} ${name}: ${got}${ok ? "" : ` (atteso ${want})`}`); };
check("nessuna info GPU → default del catalogo", pickDefaultId(models, null), "qwen3-4b");
check("4 GB", pickDefaultId(models, 4), "qwen3-4b");
check("6 GB", pickDefaultId(models, 6), "qwen3-4b");
check("8 GB", pickDefaultId(models, 8), "qwen3.5-9b");
check("10 GB", pickDefaultId(models, 10), "qwen3.5-9b");
check("12 GB", pickDefaultId(models, 12), "gemma-4-12b");
check("24 GB", pickDefaultId(models, 24), "gemma-4-12b");
check("un solo default", withDefault(models, 12).filter((m) => m.default).length, 1);
check("id unici", new Set(models.map((m) => m.id)).size, models.length);
check("le vecchie app non vedono i modelli V2", catalog.models.some((m) => /gemma-4|qwen3\.5/i.test(m.id)), false);
process.exit(bad ? 1 : 0);
