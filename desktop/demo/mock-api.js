// Demo mock of the preload API (window.capsuleers), for README screenshots ONLY.
// Injected into the real renderer by an external Playwright script (never loaded by the app,
// excluded from every electron-builder config). All pilots, corporations, alliances and
// conversations here are INVENTED. No LLM, no network.
(() => {
  const handlers = {};
  const on = (name) => (cb) => { (handlers[name] = handlers[name] || []).push(cb); };
  const emit = (name, payload) => (handlers[name] || []).forEach((cb) => cb(payload));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let watching = false;

  // ── invented entities ──────────────────────────────────────────────────
  const ALL = {
    EMBR: { id: 99100001, name: "Ember Accord", t: "EMBR" },
    VGL: { id: 99100002, name: "Northern Vigil", t: "NVGL" },
    TIDE: { id: 99100003, name: "Tidal Compact", t: "TIDE" },
  };
  const CORP = {
    HLS: { id: 98100001, name: "Hollow Lantern Syndicate", t: "HLS" },
    QMR: { id: 98100002, name: "Quiet Meridian", t: "QMRD" },
    RVN: { id: 98100003, name: "Ravenmoor Salvage", t: "RVNM" },
    OWL: { id: 98100004, name: "Owlglass Logistics", t: "OWLG" },
    SLT: { id: 98100005, name: "Saltmarsh Irregulars", t: "SLTM" },
  };
  const P = (n, id, a, c, kills, losses, eff, danger, flags = []) => ({
    id: 95100000 + id, name: n, found: true, danger, kills, losses, eff, window: 90, flags,
    allianceId: a ? a.id : null, allianceName: a ? a.name : null, allianceTicker: a ? a.t : null,
    corpId: c.id, corpName: c.name, corpTicker: c.t,
  });
  const ROWS = [
    P("Korvath Ilune", 1, ALL.EMBR, CORP.HLS, 214, 31, 91, 3, ["capital", "FC: likely"]),
    P("Tessk Vorn", 2, ALL.EMBR, CORP.HLS, 163, 40, 84, 3, ["bait: probable"]),
    P("Aelwyn Dray", 3, ALL.EMBR, CORP.HLS, 98, 22, 82, 2, ["logi"]),
    P("Dax Quillon", 4, ALL.EMBR, CORP.QMR, 77, 35, 71, 2),
    P("Sable Marrow", 5, ALL.VGL, CORP.RVN, 142, 66, 68, 2, ["capital"]),
    P("Ivrenn Holt", 6, ALL.VGL, CORP.RVN, 51, 29, 64, 1),
    P("Nira Oakhaven", 7, ALL.VGL, CORP.OWL, 33, 18, 61, 1, ["logi"]),
    P("Oskar Veln", 8, ALL.TIDE, CORP.SLT, 19, 14, 58, 1),
    P("Mara Zeltin", 9, ALL.TIDE, CORP.SLT, 12, 20, 40, 0),
    P("Lyra Penhallow", 10, null, CORP.OWL, 6, 9, 37, 0),
    P("Brannic Thule", 11, ALL.EMBR, CORP.QMR, 44, 25, 63, 1),
    P("Yuun Sekai", 12, null, CORP.SLT, 0, 3, 0, 0),
  ];
  const ship = (id, name, n) => ({ id, name, count: n });
  const DETAIL = {
    id: ROWS[0].id, name: "Korvath Ilune", allianceName: ALL.EMBR.name, corpName: CORP.HLS.name,
    kills: 214, losses: 31, eff: 91, dominant: "small gang",
    play: { solo: 12, small: 61, fleet: 27 }, capital_pilot: true, is_logi: false, fc: "likely",
    partners: [{ id: ROWS[1].id, name: "Tessk Vorn", count: 58 }, { id: ROWS[2].id, name: "Aelwyn Dray", count: 41 }, { id: ROWS[3].id, name: "Dax Quillon", count: 27 }],
    ships: [ship(23757, "Archon", 14), ship(11987, "Guardian", 9), ship(29984, "Tengu", 7), ship(22456, "Sabre", 5)],
  };

  const EFT = [
    "[Vexor Navy Issue, L4 Blitz]",
    "Drone Damage Amplifier II", "Drone Damage Amplifier II", "Damage Control II",
    "Medium Armor Repairer II", "Adaptive Invulnerability Field II", "",
    "10MN Afterburner II", "Medium Cap Battery II", "Warp Scrambler II", "",
    "Medium Auxiliary Nano Pump I", "Medium Anti-EM Screen Reinforcer I", "",
    "Hammerhead II x5", "Ogre II x5", "Hobgoblin II x5",
  ].join("\n");
  const ANSWER = [
    "For level 4 missions the **Vexor Navy Issue** is a drone boat: it needs almost no weapons, so the slots go to tank and speed.",
    "",
    "- **Tank**: a medium armor repairer plus an adaptive invulnerability field covers most Angel and Guristas pockets.",
    "- **Damage**: two Drone Damage Amplifiers II, and 5 drone slots of Hammerheads and Ogres for range.",
    "- **Skills**: Drones V and Heavy Drone Operation III are the big multipliers.",
    "",
    "A solid starting fit:",
    "```",
    EFT,
    "```",
    "The panel below is computed offline from the bundled fitting engine.",
  ].join("\n");
  const SOURCES = [
    { title: "Vexor Navy Issue - EVE University Wiki", url: "https://wiki.eveuniversity.org/Vexor_Navy_Issue", type: "wiki", tier: 2 },
    { title: "Level 4 mission guide", url: "https://wiki.eveuniversity.org/Combat_Missions", type: "wiki", tier: 2 },
    { title: "Drone mechanics (SDE)", type: "sde", tier: 1 },
  ];
  const FITSTATS = {
    kind: "fitstats", ship: "Vexor Navy Issue", shipClass: "Cruiser", context: "L4 Blitz",
    damage: [{ label: "max", dps: 468, ammo: "Hammerhead II", rangeKm: 52, alpha: null }, { label: "min", dps: 391, ammo: "Ogre II", optimalKm: 38, falloffKm: 22 }],
    ehp: { total: 28450, resists: {
      shield: { em: 0, th: 20, kin: 40, exp: 50 }, armor: { em: 72, th: 66, kin: 71, exp: 78 }, hull: { em: 33, th: 33, kin: 33, exp: 33 } } },
    cap: { stable: true, pct: 61 }, nav: { speed: 1480, align: 6.9 }, targeting: { rangeKm: 66 },
    drones: { active: 5, controlRangeKm: 62 }, activeTank: { armor: 118 },
  };

  const MODELS = [
    { file: "gemma-3-12b-it-Q4_K_M.gguf", label: "Gemma 3 12B Instruct", current: true, rating: "veloce", sizeGB: 7.3, quant: "Q4_K_M", gpuLayers: 49, totalLayers: 49, etaSeconds: 9, tokPerSec: 58, fraction: 1 },
    { file: "qwen3-8b-Q5_K_M.gguf", label: "Qwen3 8B", current: false, rating: "veloce", sizeGB: 5.7, quant: "Q5_K_M", gpuLayers: 37, totalLayers: 37, etaSeconds: 7, tokPerSec: 74, fraction: 1 },
    { file: "mistral-small-24b-Q4_K_M.gguf", label: "Mistral Small 24B", current: false, rating: "accettabile", sizeGB: 14.3, quant: "Q4_K_M", gpuLayers: 36, totalLayers: 41, etaSeconds: 28, tokPerSec: 17, fraction: 0.88 },
  ];
  const CATALOG = [
    { id: "gemma-3-27b", label: "Gemma 3 27B Instruct", sizeGB: 16.5, quant: "Q4_K_M", rating: "lento", recommended: "" },
    { id: "qwen3-14b", label: "Qwen3 14B", sizeGB: 9.0, quant: "Q4_K_M", rating: "accettabile", recommended: "" },
  ];

  const fakeUrl = (k) => ({ url: "https://capsuleers.app/s/" + k, expiresAt: Date.now() + 6 * 3600e3, copied: true });
  const HISTORY = [
    { kind: "intel", count: 12, url: "https://capsuleers.app/s/a1b2c3", createdAt: Date.now() - 3600e3, expiresAt: Date.now() + 5 * 3600e3 },
    { kind: "dscan", count: 47, url: "https://capsuleers.app/s/d4e5f6", createdAt: Date.now() - 2 * 86400e3, expiresAt: Date.now() + 3600e3 },
  ];

  const api = {
    ask: async (q) => {
      const text = ANSWER;
      for (let i = 0; i < 6; i++) { emit("token", text.slice(i * 12, i * 12 + 12)); await sleep(15); }
      return { answer: ANSWER, sources: SOURCES, cards: FITSTATS };
    },
    reset: () => {},
    appVersion: async () => "0.1.72",
    models: {
      list: async () => ({ manage: true, vram: { totalMB: 16384, freeMB: 8240, usedMB: 8144 }, models: MODELS }),
      vram: async () => ({ totalMB: 16384, freeMB: 8240 }),
      set: async () => ({ ok: true }), delete: async () => ({ ok: true }),
      catalog: async () => ({ available: true, models: CATALOG }),
      download: async () => ({ ok: true }), cancelDownload: () => {}, onDownloadProgress: on("dl"),
    },
    rag: {
      info: async () => ({
        version: "index-2026-11-02", embedModel: "bge-m3 (Q8_0)", dim: 1024, totalBytes: 1.42e9, canRedownload: true,
        update: { available: false },
        files: [{ name: "vectors.f16", size: 1.18e9 }, { name: "chunks.jsonl.gz", size: 2.2e8 }, { name: "names-index.json", size: 2.4e7 }],
      }),
      redownload: async () => ({}), cancelRedownload: () => {}, onProgress: on("ragp"), restart: () => {},
    },
    clipboard: { write: async () => true },
    data: { wipeAll: async () => ({}) },
    onToken: on("token"), onStatus: on("status"), onReady: on("ready"),
    setup: { state: async () => ({}), start: async () => ({}), cancel: () => {}, onNeeded: on("setup:needed"), onProgress: on("setup:progress"), onDone: on("setup:done"), onError: on("setup:error") },
    win: { minimize() {}, maximize() {}, close() {}, mini() {}, restore() {}, setMinWidth() {}, onState: on("wstate"), onMiniState: on("wmini") },
    local: {
      toggle: async () => { watching = !watching; return watching; },
      state: async () => watching,
      scan: () => {}, confirm: () => {},
      detail: async () => DETAIL,
      share: async () => fakeUrl("a1b2c3"),
      shareDScan: async () => fakeUrl("d4e5f6"),
      history: { list: async () => HISTORY, clear: async () => ({}) },
      onDetected: on("ldet"), onStart: on("lstart"), onProgress: on("lprog"), onResult: on("lres"),
      onDScanStart: on("dsstart"), onDScanResult: on("dsres"),
    },
  };
  window.capsuleers = api;

  // Driver used by the screenshot script.
  const DSCAN = {
    system: "J123456 (C3 wormhole)", total: 47, shipUnits: 21,
    shipClasses: [
      { cls: "Dreadnought", count: 1, capital: true }, { cls: "Force Auxiliary", count: 1, capital: true },
      { cls: "Strategic Cruiser", count: 4 }, { cls: "Heavy Assault Cruiser", count: 5 }, { cls: "Logistics", count: 3 },
      { cls: "Command Ship", count: 2 }, { cls: "Interdictor", count: 2 }, { cls: "Frigate", count: 3 },
    ],
    ships: [
      { typeId: 19720, name: "Revelation", count: 1 }, { typeId: 37604, name: "Apostle", count: 1 },
      { typeId: 29984, name: "Tengu", count: 2 }, { typeId: 29990, name: "Loki", count: 2 },
      { typeId: 12005, name: "Ishtar", count: 3 }, { typeId: 12011, name: "Eagle", count: 2 },
      { typeId: 11987, name: "Guardian", count: 2 }, { typeId: 11985, name: "Basilisk", count: 1 },
      { typeId: 22474, name: "Sleipnir", count: 1 }, { typeId: 22456, name: "Sabre", count: 2 },
    ],
    other: [{ name: "Structures", count: 7 }, { name: "Deployables", count: 5 }, { name: "Drones", count: 11 }, { name: "Celestials", count: 3 }],
  };
  window.__demo = {
    ready: () => { emit("status", { k: "ready" }); emit("ready", { count: 184213, gpu: "cuda" }); },
    localResult: () => { emit("lstart", { total: ROWS.length }); emit("lres", { rows: ROWS, total: ROWS.length, resolved: ROWS.length }); },
    dscan: () => { emit("dsstart", { total: 47 }); emit("dsres", DSCAN); },
    setWatching: (v) => { watching = v; },
  };
})();
