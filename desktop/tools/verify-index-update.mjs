// Interrupted index update scenario, offline (local HTTP server, temp dir, no GPU).
//   node desktop/tools/verify-index-update.mjs
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import http from "node:http";
import { createHash } from "node:crypto";
import { downloadFile } from "../src/downloader.mjs";
import { loadEffectiveManifest, loadManifest, compareVersions } from "../src/assets.mjs";
let bad = 0;
const check = (n, got, want) => { const ok = got === want; if (!ok) bad++; console.log(`${ok ? "✓" : "✗"} ${n}: ${got}${ok ? "" : ` (atteso ${want})`}`); };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "verify-idx-"));
const oldBuf = Buffer.alloc(4000, 1), newBuf = Buffer.alloc(6000, 2);
let cutAfter = 0;  // >0: server drops the connection after that many bytes
const srv = http.createServer((req, res) => {
  const m = /^bytes=(\d+)-/.exec(req.headers.range || ""); const from = m ? +m[1] : 0;
  const body = newBuf.subarray(from);
  res.writeHead(m ? 206 : 200, { "content-length": cutAfter ? body.length : body.length });
  if (cutAfter) { res.write(body.subarray(0, cutAfter)); setTimeout(() => req.socket.destroy(), 20); } else res.end(body);
}).listen(0);
await new Promise((r) => srv.on("listening", r));
const url = `http://127.0.0.1:${srv.address().port}/index.vec`;
const dest = path.join(tmp, "index.vec");
try {
  // 1) old index installed, update interrupted mid-download
  fs.writeFileSync(dest, oldBuf);
  cutAfter = 2500;
  await downloadFile({ url, dest, sha256: sha(newBuf), size: newBuf.length }).catch(() => {});
  check("interrotto: il vecchio index.vec resta", fs.existsSync(dest) && fs.statSync(dest).size === oldBuf.length, true);
  check("interrotto: .part parziale presente", fs.existsSync(dest + ".part"), true);
  // 2) resume of the same download completes and verifies
  cutAfter = 0;
  await downloadFile({ url, dest, sha256: sha(newBuf), size: newBuf.length });
  check("ripreso: nuovo index.vec verificato", sha(fs.readFileSync(dest)), sha(newBuf));
  check("ripreso: nessun .part/.id residuo", fs.existsSync(dest + ".part") || fs.existsSync(dest + ".part.id"), false);
  // 3) a .part of ANOTHER version (different sha) must be discarded, not resumed
  fs.unlinkSync(dest);
  fs.writeFileSync(dest + ".part", Buffer.alloc(2500, 9));
  fs.writeFileSync(dest + ".part.id", "sha256:" + "0".repeat(64));
  await downloadFile({ url, dest, sha256: sha(newBuf), size: newBuf.length });
  check(".part di altra versione scartato", sha(fs.readFileSync(dest)), sha(newBuf));
  // 3b) legacy .part without sidecar is discarded too
  fs.unlinkSync(dest); fs.writeFileSync(dest + ".part", Buffer.alloc(2500, 9));
  await downloadFile({ url, dest, sha256: sha(newBuf), size: newBuf.length });
  check(".part senza sidecar scartato", sha(fs.readFileSync(dest)), sha(newBuf));
  // 4) effective manifest: stale persisted manifest + missing files → newer bundled one
  const bundled = loadManifest();
  const dd = path.join(tmp, "data"); fs.mkdirSync(dd);
  const old = { index: { ...bundled.index, version: "2026.10.02", baseUrl: "https://example.invalid/old", files: [{ name: "index.vec", size: 4000, sha256: "x" }] } };
  fs.writeFileSync(path.join(dd, "index-manifest.json"), JSON.stringify(old));
  check("manifest: file vecchi assenti → bundled", loadEffectiveManifest(dd).index.version, bundled.index.version);
  fs.writeFileSync(path.join(dd, "index.vec"), oldBuf);
  check("manifest: indice vecchio installato → persisted", loadEffectiveManifest(dd).index.version, "2026.10.02");
  check("compareVersions", compareVersions("2026.11.14", "2026.10.02"), 1);
} finally { srv.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
process.exit(bad ? 1 : 0);
