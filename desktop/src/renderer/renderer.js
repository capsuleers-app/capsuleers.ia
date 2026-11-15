// System language (Electron reflects the system locale in navigator.language).
const SYS_LANG = (navigator.language || "en").toLowerCase().startsWith("it") ? "it" : "en";
const $ = (id) => document.getElementById(id);
// Numeric coercion for external values interpolated into HTML (NaN/garbage → 0).
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
// External URLs are accepted only when https://; anything else becomes "".
const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u) ? u : "");

// Stroke icons (24 viewBox) used by markup built at runtime.
const ICONS = {
  users: "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>",
  radar: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 12l6-6\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>",
  arrow: "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
  check: "<path d=\"M20 6 9 17l-5-5\"/>",
  copy: "<rect x=\"9\" y=\"9\" width=\"12\" height=\"12\"/><path d=\"M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1\"/>",
  ext: "<path d=\"M15 3h6v6M10 14 21 3M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7\"/>",
  target: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>",
  clip: "<rect x=\"8\" y=\"2\" width=\"8\" height=\"4\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"m9 14 2 2 4-4\"/>",
  pause: "<path d=\"M9 5v14M15 5v14\"/>",
  x: "<path d=\"M18 6 6 18M6 6l12 12\"/>",
  refresh: "<path d=\"M21 12a9 9 0 1 1-2.64-6.36L21 8\"/><path d=\"M21 3v5h-5\"/>",
  trash: "<path d=\"M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15\"/>",
  down: "<path d=\"M12 3v12M7 10l5 5 5-5\"/><path d=\"M5 21h14\"/>",
  alert: "<path d=\"M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z\"/><path d=\"M12 9v4M12 17h.01\"/>",
  cpu: "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><path d=\"M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3\"/>"
};
const ic = (n, s = 16) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
// Brand emblem (inline, currentColor strokes).
const markSvg = (s = 14) => `<svg class="mark" width="${s}" height="${s}" viewBox="-24 20 560 560" aria-hidden="true"><path d="M176 40 L336 40 L408 150 L388 184 L418 184 L418 376 L256 560 L94 376 L94 184 L124 184 L104 150 Z" fill="#202027"/><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round"><path stroke-width="13" d="M212 110 L300 110 L336 198 L300 284 L212 284 L176 198 Z M176 40 L212 110 M336 40 L300 110 M176 198 L124 184 M336 198 L388 184 M124 184 L182 322 M388 184 L330 322 M212 284 L182 322 M300 284 L330 322 M182 322 L330 322 M182 322 L94 376 M330 322 L418 376 M226 322 L256 560 M286 322 L256 560 M182 322 L212 510 M330 322 L300 510"/><path stroke-width="26" d="M176 40 L336 40 L408 150 L388 184 L418 184 L418 376 L256 560 L94 376 L94 184 L124 184 L104 150 Z"/></g></svg>`;


// Dictionary of all GUI strings (it / en, from the system locale). Entries can be
// functions when dynamic values are needed (counts, names…).
const I18N = {
  it: {

        wcMini: "Riduci a icona (always-on-top)", wcTray: "Riduci nel tray", wcMax: "Massimizza", wcClose: "Chiudi",
        miniExpand: "Click per espandere",
        navLabel: "Sezioni", navGroup: "Intel", navLocal: "Local", navDscan: "D-Scan",
        navHistory: "Link condivisi", navAbout: "Informazioni",
        
        watchOn: "Ascolto attivo", watchOff: "Ascolto in pausa",
        watchOnTitle: "Sto leggendo gli appunti (Local / D-Scan). Click per mettere in pausa.",
        watchOffTitle: "Ascolto appunti in pausa. Click per attivarlo.",
        localDetected: (n) => `Rilevata una Local di ${n} piloti negli appunti`,
        localShowIntel: "Mostra intel",
        dscanDetected: (n) => `Rilevato D-Scan di ${n} oggetti`,
        dscanAnalyze: "Analizza", bannerDismiss: "Ignora",
        
        
        
        
        
        
        
        
        
        localTitle: "<span>Local</span>", btnRescan: "Rileggi appunti", btnReadNow: "Leggi gli appunti ora",
        localEmptyH: "Copia la Local da EVE", localEmptyP: "Nella finestra Local di EVE: Ctrl+A, Ctrl+C. L'intel compare da sola con l'ascolto attivo.",
        danger: ["ignoto", "basso", "medio", "alto"],
        intelDetail: "Dettaglio intel", notFound: "nessuna attività PvP negli ultimi 90 giorni",
        windowDays: (n) => `${n}g`,
        localResolving: (n) => `risoluzione di ${n} piloti…`, loadingIntel: "Carico l'intel…",
        pilotsNoun: "piloti", dangerNoun: "pericolosi", resolvedOf: (r, t) => `risolti ${r}/${t}`,
        alliancesLabel: "Alleanze", corporationsLabel: "Corporazioni", pilotsLabel: "Piloti", riskHighMed: "Rischio alto o medio",
        compAlliance: "Composizione per alleanza", noAlliance: "Senza alleanza", unknownCorp: "Corporazione sconosciuta",
        colPilot: "Pilota", colKl: "Kill / perdite", colTags: "Tag", colRisk: "Rischio",
        shareBtn: "Condividi", shareTitle: "Condividi questo intel (link valido 24h)",
        sharing: "Creo il link…", shareProcessing: "Elaborazione del link condivisibile in corso…", shareErr: "Impossibile creare il link condivisibile",
        shareCopied: "Link copiato", shareExpires: (s) => `scade tra ${s}`, shareClose: "Chiudi",
        shareCopy: "Copia", shareOpen: "Apri", shareCopiedShort: "Copiato!", copyLink: "Copia link",
        historyModalTitle: "Link <span>condivisi</span>", historyLede: "Ogni link vive 24 ore su capsuleers.app.",
        historyClear: "Svuota storico", historyEmpty: "Nessun link condiviso di recente.",
        activeLinks: "Link attivi", linkLifetime: "Durata di un link",
        colType: "Tipo", colContent: "Contenuto", colCreated: "Creato", colValidity: "Validità residua", colActions: "Azioni",
        pilotsShort: (n) => `${n} piloti`, objectsShort: (n) => `${n} oggetti`, intelShort: "Local", dscanShort: "D-Scan",
        dscanTitle: "D-<span>Scan</span>",
        dscanResolving: (n) => `analisi di ${n} oggetti…`, dscanAnalyzing: "Analizzo il D-Scan…",
        dscanSystem: "Sistema", dscanShipClasses: "Classi di nave", dscanShips: "Navi",
        dscanUnits: (n) => `${n} unità`, dscanEntities: (n) => `${n} entità`, dscanNone: "nessun oggetto",
        dscanEntNoun: "entità", dsClasses: (n) => `${n} classi`, dsShipsSub: (u, h) => `${u} unità · ${h} scafi`,
        dsCapitals: "Capitali",
        dscanCats: { Ships: "Navi", Structures: "Strutture", Deployables: "Deployable", Drones: "Droni", Celestials: "Celestiali", Others: "Altro" },
        dsEmptyH: "Copia un D-Scan da EVE", dsEmptyP: "L'analisi è fatta sul tuo computer: nessun dato esce finché non premi Condividi.",
        dsS1H: "Apri il Directional Scanner", dsS1T: "Nella finestra D-Scan di EVE premi Scan.",
        dsS2H: "Seleziona e copia", dsS2T: "Clic su un risultato, poi Ctrl+A e Ctrl+C.",
        dsS3H: "Leggi qui", dsS3T: "Con l'ascolto attivo la composizione compare da sola, offline.",
        dossier: "Dossier pilota", closeDossier: "Chiudi dossier", riskWord: "Rischio",
        loadingIntelOf: (name) => `Carico l'intel di ${name}…`, noData: "Nessun dato",
        statKills: "Kill", statLoss: "Perdite", statWindow: "Finestra", statEff: "Efficienza",
        playStyle: "Stile di volo", psSolo: "Solo", psSmall: "Piccola gang", psFleet: "Flotta",
        fliesWith: "Vola spesso con", recentShips: "Ultime navi usate",
        lblOverview: "Profilo", titleOverview: "Profilo del personaggio su capsuleers.app",
        lblPvp: "Dati PvP", titlePvp: "Dati PvP e killboard su eve-kill.com",
        appPre: "App", aboutTitle: "<span>Informazioni</span>", 
        aboutVersion: "Versione", aboutPowered: "powered by",
        aboutCredit: 'Creato da <a href="https://capsuleers.app/it/character/789877270" target="_blank" rel="noopener">TremalJack</a> con il supporto della community di EVE Online.',
        aboutDataH: "Dati e servizi", aboutLegalH: "Note legali", aboutDangerH: "Zona pericolosa",
        aboutDisc1: "<b>Strumento non ufficiale</b> creato da fan, non affiliato né approvato da Fenris Creations.",
        aboutDisc2: "EVE Online e il logo EVE sono marchi registrati di Fenris Creations. Tutti i diritti riservati. Tutti i nomi di prodotti, loghi e marchi citati appartengono ai rispettivi proprietari. Fenris Creations non è in alcun modo responsabile del contenuto o del funzionamento di questa applicazione, né può essere ritenuta responsabile per eventuali danni derivanti dal suo utilizzo.",
        
        wipeConfirmBtn: "Conferma rimozione",

  navGrpAssistant: "Assistente", navChat: "Chat", navGrpEngine: "Motore", navModels: "Modello", navRag: "Indice EVE",
  stHeading: "Motore locale", stModel: "Modello", stGpu: "GPU", stIndex2: "Indice",
  chipOnline: "Online", chipGpu: (g) => `GPU ${g}`,
  chatTitle: "<span>Chat</span>", chatLede: "Nuova conversazione",
  btnNewChat: "Nuova chat", btnNewTitle: "Nuova conversazione",
  btnModel: "Modello", btnModelTitle: "Scegli il modello IA (con stima del tempo di risposta)",
  btnSend: "Invia", msgLabel: "Messaggio",
  inputPlaceholder: "Chiedi di skill, fitting, wormhole, piloti…  Digita / per i comandi",
  composerHint: "Invio per inviare · Maiusc+Invio per andare a capo",
  slashHeader: "Comandi", slashHelp: "↑↓ scegli · Tab completa · Esc chiudi",
  wlH: "Chiedi a <span>Capsuleers.IA</span>",
  wlP: "Un assistente che gira sul tuo computer: conosce oggetti, skill e fitting dall'SDE e legge kill, piloti e mercato in tempo reale da capsuleers.app.",
  wlDocs: "Documenti nell'indice", wlCmds: "Comandi rapidi", wlLive: "Live", wlLiveSub: "Kill e mercato",
  wlGroups: [["Fitting", ["Un fit Gila per le abissali T4", "Specifiche del fit #2 della dottrina"]], ["Intel", ["Chi è TremalJack?", "Dove caccia Kestrel Vanguard Armada"]], ["Navigazione", ["Rotta sicura da Jita ad Amarr", "Collegamento Thera più vicino a Dodixie"]]],
  modelsTitle: "Modello <span>IA</span>", modelsLede: "Più layer entrano in GPU, più la risposta è veloce.",
  modelsInstalled: "Modelli installati", modelsDefaultNote: "Il modello scelto resta il predefinito a ogni avvio",
  modelsEstimateNote: "Stima sulla VRAM libera ora",
  colModel: "Modello", colGpuLoad: "Carico in GPU", colRating: "Resa", colTypical: "Risposta tipica",
  vramFree: "VRAM libera", vramTotal: "VRAM totale", accel: "Accelerazione", vramUsed: (p) => `In uso ${p}%`,
  vramHint: "Chiudere browser e Steam libera VRAM", pctGpu: (p) => `${p}% in GPU`, modelUse: "Usa",
  modelsDelete: "Elimina", modelsDownload: "Scarica", modelsDownloadMore: "Scarica un altro modello",
  badgeInUse: "In uso", badgeRecommended: "Consigliato",
  ragTitle: "Indice <span>EVE</span>", ragLede: "L'archivio da cui l'assistente cita oggetti, skill e guide.",
  ragVersionK: "Versione", ragStateK: "Stato", ragDocsK: "Documenti", ragEmbedDim: (d) => `Embedder · ${d} dim`, ragDiskK: "Su disco",
  ragFilesK: "File dell'indice", ragProgTitle: "Download in corso", colFile: "File", colSize: "Dimensione",
  ragUpdateAvail: (v) => `Aggiornamento: ${v}`, ragUpToDate: "Aggiornato",
  ragRedownload: "Riscarica indice", ragRestart: "Riavvia per applicare", ragDone: "Indice riscaricato. Riavvia per applicarlo.",
  ragDevNote: "Riscaricamento non disponibile in sviluppo (l'indice è nel progetto).",
  setupTitle: "Primo <span>avvio</span>",
  wipeBtn: "Rimuovi tutti i dati e i modelli",
  wipeHint: "Cancella definitivamente i modelli scaricati, l'indice EVE, la cache e le impostazioni di questa app, poi la chiude. Usalo prima di disinstallare per liberare tutto lo spazio. Operazione irreversibile.",
  aboutSub: "Assistente locale e intel per EVE Online",
  aboutDisc3: "EVE Static Data Export ed ESI (Fenris Creations), EVE University Wiki (CC BY-NC-SA), eve-survival (missioni PvE), Anoikis (wormhole), EVE Ref e Fuzzwork (prezzi), capsuleers.app (killboard e intel), eve-kill (analisi MCP), EVE Workbench (fit della community) ed EVE-Scout (Thera/Turnur). Il modello IA gira sul tuo computer; le risposte possono contenere errori: <b>verifica sempre in gioco</b>.",
  sources: "Fonti",
  readyChip: (s) => s,
    btnNew: "Nuova", 
    btnLocal: "Intel", btnLocalTitle: "Intel Local da appunti (copia la Local da EVE)",
    
    btnRag: "RAG", btnRagTitle: "Indice RAG: versione, dettagli e riscaricamento",
    
    ragIntro: "La knowledge base EVE da cui l'IA cita le risposte (SDE, wiki, missioni, guide). Qui puoi vederne la versione e forzarne il riscaricamento.",
    ragEmbedK: "Embedder", ragDimK: "Dimensione vettore",
    ragTotalK: "Dimensione totale", 
    
    ragRedownloading: "Riscarico…",
    
    
    
    wcInfo: "Informazioni", 
    
    
    
    
    
    
    
    modelsHint: "Stima sulla VRAM <b>libera ora</b>: più layer entrano in GPU, più la risposta è veloce. Chiudere altre app che usano la GPU (browser, Steam…) libera VRAM e accelera i modelli più grandi. I tempi sono indicativi per una risposta tipica.<br>Il modello che scegli diventa il <b>predefinito</b> e verrà riusato a ogni riavvio dell'app.",
    
    
    
    
    
    
    localOn: "Ascolto appunti ATTIVO — copia la Local da EVE. Click per disattivare.",
    localOff: "Intel Local da appunti (spento) — click per attivare",
    
    
    danger: ["ignoto", "basso", "medio", "alto"],
    
    killAbbr: "K", lossAbbr: "P", 
    
    
    pilotsCount: (n) => `${n} piloti`,
    
    dangerousCount: (n) => ` · ${n} pericolosi`,
    
    alliancesDetected: "Alleanze rilevate", 
    
    
    
    
    
    historyToggle: "Cronologia link condivisi", historyTitle: "Link condivisi",
    
    
    
    
    btnHistory: "Storico intel", btnHistoryTitle: "Storico dei link intel/D-Scan condivisi",
    
    
    
    
    
    
    
    dscanOther: "Altre entità",
    
    
    
    
    
    
    
    openKillmail: "Apri il killmail su eve-kill.com",
    
    tier1: "L1 · fonte primaria CCP", tier2: "L2 · dati ufficiali elaborati", tier3: "L3 · community strutturata", tier4: "L4 · community generica",
    fitCopy: "Copia", fitCopied: "Copiato!",
    cards: { kill: "Kill", duration: "Durata", isk: "ISK distrutti", iskMin: "ISK/min", alliances: "Alleanze", corps: "Corp", multiParty: "Multi-party",
      kills: "Kill", losses: "Perdite", kd: "K/D", iskRatio: "ISK ratio", iskEff: "ISK eff.", soloRate: "Solo %", finalBlows: "Final blow", gang: "Gang medio",
      iskDestroyed: "ISK distrutti", iskLost: "ISK persi", solo: "Solo kill", peak: "Picco attività", shipsFlown: "Navi più usate", shipsLost: "Navi più perse",
      dim: { ship_flown: "Navi più volate", ship_lost: "Navi più perse", system: "Sistemi più attivi", constellation: "Costellazioni più attive", region: "Regioni più attive",
        killed_alliance: "Alleanze più uccise", dies_to_alliance: "Uccisa più spesso da (alleanze)", killed_corporation: "Corp più uccise", dies_to_corporation: "Uccisa più spesso da (corp)" },
      ps: { solo: "Solo", small: "Small gang", mid: "Mid gang", fleet: "Flotta", blob: "Blob" }, avgFleet: "Flotta media",
      list: { wingmates: "Compagni di volo", prey: "Prede preferite", hunters: "Cacciatori" }, huntingGrounds: "Sistemi di caccia",
      iskShare: "Quota ISK", contested: "Sistemi contesi", battle: { won: "Vittorioso", lost: "Sconfitto" }, fitsFor: "Fit per",
      fitCalc: "Fit calcolato", fitHint: "Chiedi «specifiche del #X» (es. «specifiche del #1») per il fitting completo in EFT e l'analisi di quel fit.",
      fs: { high: "Alto danno", long: "Lunga gittata", dps: "DPS", alpha: "alpha", range: "Gittata", optimal: "Ottimale", ehp: "EHP", cap: "Cap", stable: "stabile", capLab: "Capacitore", stableCap: "Stabile", unstable: "Instabile", emptyIn: "vuoto in",
        speed: "Velocità", align: "Align", warp: "Warp", targeting: "Targeting", drones: "Droni", activeRep: "Rep attiva", passiveRegen: "Rigen scudo",
        shield: "Scudo", armor: "Armatura", hull: "Scafo", em: "EM", th: "Th", kin: "Kin", exp: "Exp" } },
    computing: "Calcolo le stime…",
    allLayers: (n) => `tutti i ${n} layer in GPU`,
    someLayers: (g, t) => `solo ${g}/${t} layer in GPU`,
    vramLine: (free, total, pct) => `VRAM: <b>${free} GB liberi</b> su ${total} GB · ${pct}% in uso`,
    
    
    
    
    modelsDeleteConfirm: (label) => `Eliminare ${label}? Libera spazio su disco; potrai riscaricarlo.`,
    rating: { veloce: "veloce", accettabile: "accettabile", lento: "lento" },
    errCap: "Errore", errLow: "errore",
    
    setupIntro: "Per funzionare 100% offline, Capsuleers.IA scarica una sola volta il modello IA e l'indice di conoscenza di EVE. Scegli il modello: potrai cambiarlo o aggiungerne altri in seguito.",
    setupResume: "Se interrompi o cade la connessione, il download riprende da dove era rimasto.",
    setupStart: "Scarica e avvia", setupCancel: "Annulla", setupRetry: "Riprova",
    setupInstalled: "già scaricato",
    setupInclLine: (gb) => `Incluso (una tantum): indice EVE + embedding · ~${gb} GB`,
    setupTotalLine: (gb) => `Da scaricare ora: ~${gb} GB`,
    setupErrCap: "Download non riuscito",
    setupDataTitle: "AGGIORNAMENTO <b>DATI</b>",
    setupDataIntro: "È disponibile un aggiornamento dell'indice di conoscenza di EVE. Il modello IA è già installato e <b>non</b> verrà riscaricato: si aggiornano solo i dati.",
    setupDataStart: "Aggiorna e avvia",
    setupDataTotal: (size) => `Dati da scaricare: ~${size}`,
    readyLine: (count, gpu) => `ONLINE · ${count} DOC · GPU:${gpu}`,
    
    
    stIndex: "Carico l'indice…",
    stModels: (c) => `Indice: ${Number(c).toLocaleString()} documenti. Carico i modelli (GPU)…`,
    stLoadingModel: (n) => `Carico ${n}…`,
    stReady: (s) => !s.gpu
      ? `Pronto · ${s.model} (GPU non disponibile: tutto su CPU, lento).`
      : s.onGpu
        ? `Pronto · ${s.model} (GPU: ${s.gpu}, ${s.loaded}/${s.total} layer).`
        : `Pronto · ${s.model} MA LENTO: solo ${s.loaded}/${s.total} layer in GPU (VRAM insufficiente). Chiudi app che usano la GPU.`,
  },
  en: {

        wcMini: "Shrink to icon (always-on-top)", wcTray: "Minimize to tray", wcMax: "Maximize", wcClose: "Close",
        miniExpand: "Click to expand",
        navLabel: "Sections", navGroup: "Intel", navLocal: "Local", navDscan: "D-Scan",
        navHistory: "Shared links", navAbout: "About",
        
        watchOn: "Watching", watchOff: "Paused",
        watchOnTitle: "Reading the clipboard (Local / D-Scan). Click to pause.",
        watchOffTitle: "Clipboard watch paused. Click to enable.",
        localDetected: (n) => `Detected a Local of ${n} pilots in the clipboard`,
        localShowIntel: "Show intel",
        dscanDetected: (n) => `D-Scan detected: ${n} objects`,
        dscanAnalyze: "Analyze", bannerDismiss: "Dismiss",
        
        
        
        
        
        
        
        
        
        localTitle: "<span>Local</span>", btnRescan: "Re-read clipboard", btnReadNow: "Read the clipboard now",
        localEmptyH: "Copy the Local from EVE", localEmptyP: "In EVE's Local window: Ctrl+A, Ctrl+C. The intel shows up by itself while the watch is on.",
        danger: ["unknown", "low", "medium", "high"],
        intelDetail: "Intel details", notFound: "no PvP activity in the last 90 days",
        windowDays: (n) => `${n}d`,
        localResolving: (n) => `resolving ${n} pilots…`, loadingIntel: "Loading intel…",
        pilotsNoun: "pilots", dangerNoun: "dangerous", resolvedOf: (r, t) => `resolved ${r}/${t}`,
        alliancesLabel: "Alliances", corporationsLabel: "Corporations", pilotsLabel: "Pilots", riskHighMed: "High or medium risk",
        compAlliance: "Alliance breakdown", noAlliance: "No Alliance", unknownCorp: "Unknown Corporation",
        colPilot: "Pilot", colKl: "Kills / losses", colTags: "Tags", colRisk: "Risk",
        shareBtn: "Share", shareTitle: "Share this intel (link valid for 24h)",
        sharing: "Creating link…", shareProcessing: "Processing the share link…", shareErr: "Couldn't create the share link",
        shareCopied: "Link copied", shareExpires: (s) => `expires in ${s}`, shareClose: "Close",
        shareCopy: "Copy", shareOpen: "Open", shareCopiedShort: "Copied!", copyLink: "Copy link",
        historyModalTitle: "Shared <span>links</span>", historyLede: "Every link lives 24 hours on capsuleers.app.",
        historyClear: "Clear history", historyEmpty: "No links shared recently.",
        activeLinks: "Active links", linkLifetime: "Link lifetime",
        colType: "Type", colContent: "Content", colCreated: "Created", colValidity: "Time left", colActions: "Actions",
        pilotsShort: (n) => `${n} pilots`, objectsShort: (n) => `${n} objects`, intelShort: "Local", dscanShort: "D-Scan",
        dscanTitle: "D-<span>Scan</span>",
        dscanResolving: (n) => `analyzing ${n} objects…`, dscanAnalyzing: "Analyzing the D-Scan…",
        dscanSystem: "System", dscanShipClasses: "Ship classes", dscanShips: "Ships",
        dscanUnits: (n) => `${n} units`, dscanEntities: (n) => `${n} entities`, dscanNone: "no objects",
        dscanEntNoun: "entities", dsClasses: (n) => `${n} classes`, dsShipsSub: (u, h) => `${u} units · ${h} hulls`,
        dsCapitals: "Capitals",
        dscanCats: { Ships: "Ships", Structures: "Structures", Deployables: "Deployables", Drones: "Drones", Celestials: "Celestials", Others: "Others" },
        dsEmptyH: "Copy a D-Scan from EVE", dsEmptyP: "The analysis runs on your computer: no data leaves it until you press Share.",
        dsS1H: "Open the Directional Scanner", dsS1T: "In EVE's D-Scan window press Scan.",
        dsS2H: "Select and copy", dsS2T: "Click a result, then Ctrl+A and Ctrl+C.",
        dsS3H: "Read it here", dsS3T: "With the watch on, the breakdown appears by itself, offline.",
        dossier: "Pilot dossier", closeDossier: "Close dossier", riskWord: "Risk",
        loadingIntelOf: (name) => `Loading intel for ${name}…`, noData: "No data",
        statKills: "Kills", statLoss: "Losses", statWindow: "Window", statEff: "Efficiency",
        playStyle: "Flight style", psSolo: "Solo", psSmall: "Small gang", psFleet: "Fleet",
        fliesWith: "Often flies with", recentShips: "Recently used ships",
        lblOverview: "Profile", titleOverview: "Character profile on capsuleers.app",
        lblPvp: "PvP data", titlePvp: "PvP data and killboard on eve-kill.com",
        appPre: "App", aboutTitle: "<span>About</span>", 
        aboutVersion: "Version", aboutPowered: "powered by",
        aboutCredit: 'Created by <a href="https://capsuleers.app/en/character/789877270" target="_blank" rel="noopener">TremalJack</a> with the support of the EVE Online community.',
        aboutDataH: "Data and services", aboutLegalH: "Legal notes", aboutDangerH: "Danger zone",
        aboutDisc1: "<b>Unofficial tool</b> made by fans, not affiliated with nor endorsed by Fenris Creations.",
        aboutDisc2: "EVE Online and the EVE logo are registered trademarks of Fenris Creations. All rights reserved. All product names, logos and brands mentioned are property of their respective owners. Fenris Creations is in no way responsible for the content or operation of this application, nor can it be held liable for any damage arising from its use.",
        
        wipeConfirmBtn: "Confirm removal",

  navGrpAssistant: "Assistant", navChat: "Chat", navGrpEngine: "Engine", navModels: "Model", navRag: "EVE index",
  stHeading: "Local engine", stModel: "Model", stGpu: "GPU", stIndex2: "Index",
  chipOnline: "Online", chipGpu: (g) => `GPU ${g}`,
  chatTitle: "<span>Chat</span>", chatLede: "New conversation",
  btnNewChat: "New chat", btnNewTitle: "New conversation",
  btnModel: "Model", btnModelTitle: "Choose the AI model (with response-time estimate)",
  btnSend: "Send", msgLabel: "Message",
  inputPlaceholder: "Ask about skills, fitting, wormholes, pilots…  Type / for commands",
  composerHint: "Enter to send · Shift+Enter for a new line",
  slashHeader: "Commands", slashHelp: "↑↓ choose · Tab complete · Esc close",
  wlH: "Ask <span>Capsuleers.IA</span>",
  wlP: "An assistant that runs on your computer: it knows items, skills and fittings from the SDE and reads kills, pilots and market live from capsuleers.app.",
  wlDocs: "Documents in the index", wlCmds: "Quick commands", wlLive: "Live", wlLiveSub: "Kills and market",
  wlGroups: [["Fitting", ["A Gila fit for T4 abyssals", "Specs of doctrine fit #2"]], ["Intel", ["Who is TremalJack?", "Where does Kestrel Vanguard Armada hunt"]], ["Navigation", ["Safe route from Jita to Amarr", "Closest Thera connection to Dodixie"]]],
  modelsTitle: "<span>AI</span> model", modelsLede: "The more layers fit in GPU, the faster the reply.",
  modelsInstalled: "Installed models", modelsDefaultNote: "The chosen model stays the default at every start",
  modelsEstimateNote: "Estimate on the VRAM free now",
  colModel: "Model", colGpuLoad: "GPU load", colRating: "Rating", colTypical: "Typical reply",
  vramFree: "Free VRAM", vramTotal: "Total VRAM", accel: "Acceleration", vramUsed: (p) => `In use ${p}%`,
  vramHint: "Closing the browser and Steam frees VRAM", pctGpu: (p) => `${p}% on GPU`, modelUse: "Use",
  modelsDelete: "Delete", modelsDownload: "Download", modelsDownloadMore: "Download another model",
  badgeInUse: "In use", badgeRecommended: "Recommended",
  ragTitle: "<span>EVE</span> index", ragLede: "The archive the assistant cites items, skills and guides from.",
  ragVersionK: "Version", ragStateK: "Status", ragDocsK: "Documents", ragEmbedDim: (d) => `Embedder · ${d} dim`, ragDiskK: "On disk",
  ragFilesK: "Index files", ragProgTitle: "Download in progress", colFile: "File", colSize: "Size",
  ragUpdateAvail: (v) => `Update: ${v}`, ragUpToDate: "Up to date",
  ragRedownload: "Re-download index", ragRestart: "Restart to apply", ragDone: "Index re-downloaded. Restart to apply it.",
  ragDevNote: "Re-download not available in dev (the index lives in the project).",
  setupTitle: "First <span>run</span>",
  wipeBtn: "Remove all data and models",
  wipeHint: "Permanently deletes the downloaded models, the EVE index, caches and this app's settings, then closes it. Use it before uninstalling to reclaim all disk space. This cannot be undone.",
  aboutSub: "Local assistant and intel for EVE Online",
  aboutDisc3: "EVE Static Data Export and ESI (Fenris Creations), EVE University Wiki (CC BY-NC-SA), eve-survival (PvE missions), Anoikis (wormholes), EVE Ref and Fuzzwork (prices), capsuleers.app (killboard and intel), eve-kill (MCP analytics), EVE Workbench (community fits) and EVE-Scout (Thera/Turnur). The AI model runs on your computer; answers may contain errors: <b>always verify in-game</b>.",
  sources: "Sources",
    btnNew: "New", 
    btnLocal: "Intel", btnLocalTitle: "Local intel from clipboard (copy the Local from EVE)",
    
    btnRag: "RAG", btnRagTitle: "RAG index: version, details and re-download",
    
    ragIntro: "The EVE knowledge base the AI cites its answers from (SDE, wikis, missions, guides). Here you can see its version and force a re-download.",
    ragEmbedK: "Embedder", ragDimK: "Vector dim",
    ragTotalK: "Total size", 
    
    ragRedownloading: "Re-downloading…",
    
    
    
    wcInfo: "Info", 
    
    
    
    
    
    
    
    modelsHint: "Estimate on the VRAM <b>free now</b>: the more layers fit in GPU, the faster the reply. Closing other apps that use the GPU (browser, Steam…) frees VRAM and speeds up bigger models. Times are indicative for a typical answer.<br>The model you choose becomes the <b>default</b> and is reused on every app restart.",
    
    
    
    
    
    
    localOn: "Clipboard watch ON — copy the Local from EVE. Click to disable.",
    localOff: "Local intel from clipboard (off) — click to enable",
    
    
    danger: ["unknown", "low", "medium", "high"],
    
    killAbbr: "K", lossAbbr: "L", 
    
    
    pilotsCount: (n) => `${n} pilots`,
    
    dangerousCount: (n) => ` · ${n} dangerous`,
    
    alliancesDetected: "Alliances detected", 
    
    
    
    
    
    historyToggle: "Shared-link history", historyTitle: "Shared links",
    
    
    
    
    btnHistory: "Intel history", btnHistoryTitle: "History of shared intel/D-Scan links",
    
    
    
    
    
    
    
    dscanOther: "Other entities",
    
    
    
    
    
    
    
    openKillmail: "Open the killmail on eve-kill.com",
    
    tier1: "L1 · primary CCP source", tier2: "L2 · processed official data", tier3: "L3 · structured community", tier4: "L4 · general community",
    fitCopy: "Copy", fitCopied: "Copied!",
    cards: { kill: "Kills", duration: "Duration", isk: "ISK destroyed", iskMin: "ISK/min", alliances: "Alliances", corps: "Corps", multiParty: "Multi-party",
      kills: "Kills", losses: "Losses", kd: "K/D", iskRatio: "ISK ratio", iskEff: "ISK eff.", soloRate: "Solo %", finalBlows: "Final blows", gang: "Avg gang",
      iskDestroyed: "ISK destroyed", iskLost: "ISK lost", solo: "Solo kills", peak: "Peak activity", shipsFlown: "Top ships flown", shipsLost: "Top ships lost",
      dim: { ship_flown: "Top ships flown", ship_lost: "Top ships lost", system: "Most active systems", constellation: "Most active constellations", region: "Most active regions",
        killed_alliance: "Alliances killed most", dies_to_alliance: "Most killed by (alliances)", killed_corporation: "Corps killed most", dies_to_corporation: "Most killed by (corps)" },
      ps: { solo: "Solo", small: "Small gang", mid: "Mid gang", fleet: "Fleet", blob: "Blob" }, avgFleet: "Avg fleet",
      list: { wingmates: "Wingmates", prey: "Favourite prey", hunters: "Hunters" }, huntingGrounds: "Hunting grounds",
      iskShare: "ISK share", contested: "Contested systems", battle: { won: "Winner", lost: "Defeated" }, fitsFor: "Fits for",
      fitCalc: "Computed fit", fitHint: "Ask \"specs of #X\" (e.g. \"specs of #1\") for that fit's full EFT and analysis.",
      fs: { high: "High damage", long: "Long range", dps: "DPS", alpha: "alpha", range: "Range", optimal: "Optimal", ehp: "EHP", cap: "Cap", stable: "stable", capLab: "Capacitor", stableCap: "Stable", unstable: "Unstable", emptyIn: "empty in",
        speed: "Speed", align: "Align", warp: "Warp", targeting: "Targeting", drones: "Drones", activeRep: "Active rep", passiveRegen: "Shield regen",
        shield: "Shield", armor: "Armor", hull: "Hull", em: "EM", th: "Th", kin: "Kin", exp: "Exp" } },
    computing: "Computing estimates…",
    allLayers: (n) => `all ${n} layers in GPU`,
    someLayers: (g, t) => `only ${g}/${t} layers in GPU`,
    vramLine: (free, total, pct) => `VRAM: <b>${free} GB free</b> of ${total} GB · ${pct}% in use`,
    
    
    
    
    modelsDeleteConfirm: (label) => `Delete ${label}? Frees disk space; you can re-download it later.`,
    rating: { veloce: "fast", accettabile: "acceptable", lento: "slow" },
    errCap: "Error", errLow: "error",
    
    setupIntro: "To run 100% offline, Capsuleers.IA downloads the AI model and the EVE knowledge index once. Pick a model: you can change it or add more later.",
    setupResume: "If you stop or lose connection, the download resumes where it left off.",
    setupStart: "Download & start", setupCancel: "Cancel", setupRetry: "Retry",
    setupInstalled: "already downloaded",
    setupInclLine: (gb) => `Included (one-time): EVE index + embedding · ~${gb} GB`,
    setupTotalLine: (gb) => `To download now: ~${gb} GB`,
    setupErrCap: "Download failed",
    setupDataTitle: "DATA <b>UPDATE</b>",
    setupDataIntro: "An update to the EVE knowledge index is available. Your AI model is already installed and will <b>not</b> be re-downloaded: only the data is updated.",
    setupDataStart: "Update & start",
    setupDataTotal: (size) => `Data to download: ~${size}`,
    readyLine: (count, gpu) => `ONLINE · ${count} DOC · GPU:${gpu}`,
    
    
    stIndex: "Loading index…",
    stModels: (c) => `Index: ${Number(c).toLocaleString()} documents. Loading models (GPU)…`,
    stLoadingModel: (n) => `Loading ${n}…`,
    stReady: (s) => !s.gpu
      ? `Ready · ${s.model} (GPU unavailable: all on CPU, slow).`
      : s.onGpu
        ? `Ready · ${s.model} (GPU: ${s.gpu}, ${s.loaded}/${s.total} layers).`
        : `Ready · ${s.model} BUT SLOW: only ${s.loaded}/${s.total} layers in GPU (insufficient VRAM). Close apps using the GPU.`,
  },
};
const L = I18N[SYS_LANG];

// --- Markdown → HTML (minimal: bold, italic, code, lists, headings) ---
// Escapes &, <, > AND the quote chars: esc()'d values are also placed inside
// double-quoted HTML attributes (title="…", href="…"), so leaving " / ' raw
// would allow an attribute-breakout XSS from any value that reaches an attribute
// (e.g. a crafted URL the model echoes into a markdown link). Encoding both quotes
// makes esc() safe in element-content AND attribute contexts.
const PS_SAFE = (k) => (typeof PS_COLOR === "object" && Object.prototype.hasOwnProperty.call(PS_COLOR, k) && /^#[0-9a-fA-F]{3,8}$/.test(PS_COLOR[k])) ? PS_COLOR[k] : "#888";
const psCol = PS_SAFE;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
// Numeric ids/counts from external data → always an integer (never raw text) before they reach innerHTML/URLs.
const nid = (v) => { const n = Math.trunc(Number(v)); return Number.isFinite(n) ? n : 0; };
// Links to external data are accepted only as https:// (blocks javascript:, data:, etc.).
const safeHref = (u) => (typeof u === "string" && /^https:\/\//i.test(u) && !/[\s"'<>]/.test(u)) ? u : null;
const setHref = (el, u) => { const h = safeHref(u); if (h) el.href = h; return !!h; };
// eve-kill.com entity URL: type from a whitelist, id as integer.
const EK_TYPES = new Set(["character", "corporation", "alliance", "ship", "item", "system", "region"]);
const ekUrl = (type, id) => EK_TYPES.has(type) ? `https://eve-kill.com/${type}/${nid(id)}` : "#";
const inline = (s) => s
  // URL char class excludes " (and <) so a quote can never break out of href="…"
  // even if esc() ordering ever changes — defence in depth on top of the esc() above.
  .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s"]+)\)/g, '<a href="$2">$1</a>')
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/(?<![*])\*([^*\n]+)\*(?![*])/g, "<em>$1</em>")
  // Auto-link bare http(s) URLs (e.g. a killmail link) → clickable, opens in the browser.
  // Skips URLs already inside an href="…" / markdown link (negative lookbehind) and keeps
  // trailing punctuation out of the link.
  .replace(/(?<![">=])\bhttps?:\/\/[^\s<"]+/g, (u) => { const m = u.match(/^(.*?)([.,;:!?)]*)$/); return `<a href="${m[1]}">${m[1]}</a>${m[2]}`; });
function mdToHtml(md) {
  const lines = esc(md).split("\n");
  let html = "";
  const stack = [];      // nested lists: [{ type:'ul'|'ol', indent:number }]
  let liOpen = false;    // is the last <li> still open (so a child list nests inside it)?
  let codeBuf = null;    // !== null while inside a ``` fenced block (e.g. an EFT fit)
  const closeLi = () => { if (liOpen) { html += "</li>"; liOpen = false; } };
  const popList = () => { closeLi(); html += `</${stack.pop().type}>`; if (stack.length) liOpen = true; };
  const closeAll = () => { while (stack.length) popList(); };
  // A fenced block is rendered as a fit blockquote with a copy button (used for EFT fits).
  const flushCode = () => {
    const body = (codeBuf || []).join("\n");
    html += `<blockquote class="fit"><button class="fit-copy" type="button" title="${L.fitCopy}">`
      + `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">`
      + `<rect x="9" y="9" width="11" height="11" rx="1"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>`
      + `<span>${L.fitCopy}</span></button><pre>${body}</pre></blockquote>`;
    codeBuf = null;
  };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (/^\s*```/.test(line)) {                 // fence open/close
      if (codeBuf !== null) flushCode();
      else { closeAll(); codeBuf = []; }
      continue;
    }
    if (codeBuf !== null) { codeBuf.push(raw); continue; }  // verbatim (already esc'd)
    let m;
    if (m = line.match(/^\s*#{1,6}\s+(.*)/)) { closeAll(); html += `<h4>${inline(m[1])}</h4>`; }
    else if (m = line.match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)/)) {
      const indent = m[1].replace(/\t/g, "  ").length;   // tab = 2 spazi
      const type = /^\s*\d+\./.test(line) ? "ol" : "ul";
      while (stack.length && stack[stack.length - 1].indent > indent) popList();  // chiudi i livelli più profondi
      const top = stack[stack.length - 1];
      if (!top || indent > top.indent) {                 // più indentato → nuova sottolista dentro il <li> corrente
        html += `<${type}>`; stack.push({ type, indent }); liOpen = false;
      } else {                                           // stesso livello → chiudi il <li> fratello
        closeLi();
        if (top.type !== type) { html += `</${stack.pop().type}><${type}>`; stack.push({ type, indent }); }
      }
      html += `<li>${inline(m[2])}`; liOpen = true;
    }
    else if (line.trim() === "") { closeAll(); }
    else { closeAll(); html += `<p>${inline(line)}</p>`; }
  }
  if (codeBuf !== null) flushCode();   // unterminated fence (still streaming): render what we have
  closeAll();
  return html;
}

// --- Kill card ---
const IMG = "https://images.evetech.net";
function fmtIsk(n) {
  if (n == null) return "?";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
  return String(Math.round(n));
}
function fmtEve(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]} ${m[4]}:${m[5]}` : "";
}
function renderKills(kills) {
  const wrap = document.createElement("div");
  wrap.className = "kills";
  for (const k of kills) {
    const a = document.createElement("a");
    a.className = "kill" + (k.kind === "losses" ? " loss" : "");
    a.href = `https://eve-kill.com/kill/${nid(k.killmailId)}`;
    a.title = L.openKillmail;
    const vimg = k.isCharacter
      ? `${IMG}/characters/${nid(k.victimId)}/portrait?size=32`
      : `${IMG}/corporations/${nid(k.victimId)}/logo?size=32`;
    a.innerHTML =
      `<img src="${IMG}/types/${nid(k.shipId)}/render?size=32" alt="" />` +
      `<span class="nm">${esc(k.shipName)}</span>` +
      `<img class="victim" src="${vimg}" alt="" />` +
      `<span class="nm dim">${esc(k.victimName)}</span>` +
      `<span class="sys">${esc(k.system)}</span>` +
      `<span class="val">${fmtIsk(k.value)} ISK</span>` +
      `<span class="tm">${fmtEve(k.time)} EVE</span>`;
    wrap.appendChild(a);
  }
  return wrap;
}

// Generic data cards (currently: recent battles). Drawn client-side from a structured
// payload so the model only writes a one-line intro instead of a wall of text.
const hhmm = (s) => (String(s || "").match(/\d{2}:\d{2}/) || [""])[0];
function battleCardEl(b) {
  const C = L.cards;
  const el = document.createElement(b.href ? "a" : "div");
  el.className = "gcard";
  if (b.href && setHref(el, b.href)) el.title = "eve-kill.com";
  const stat = (label, val) => val == null || val === "" ? "" :
    `<div class="gc-s"><span class="gc-v">${esc(String(val))}</span><span class="gc-l">${esc(label)}</span></div>`;
  const ally = b.topAlliance?.id
    ? `<div class="gc-ally"><img src="${IMG}/alliances/${nid(b.topAlliance.id)}/logo?size=32" alt="" />`
      + `<span>${esc(b.topAlliance.name || "")}${b.topAlliance.ticker ? ` <i>[${esc(b.topAlliance.ticker)}]</i>` : ""}</span></div>`
    : "";
  const win = (b.start && b.end) ? `<span class="gc-win">${hhmm(b.start)} → ${hhmm(b.end)}</span>` : "";
  el.innerHTML =
    `<div class="gc-head"><span class="gc-title">#${esc(String(b.id ?? "?"))}</span>`
    + (b.multiParty ? `<span class="gc-badge">${esc(C.multiParty)}</span>` : "") + `</div>`
    + ((b.system || b.region) ? `<div class="gc-sub">${esc(b.system || "")}${b.region ? ` · ${esc(b.region)}` : ""}</div>` : "")
    + `<div class="gc-stats">`
    + stat(C.kill, b.killCount)
    + stat(C.duration, b.durationMin != null ? b.durationMin + "m" : null)
    + stat(C.isk, b.iskDestroyed != null ? fmtIsk(b.iskDestroyed) : null)
    + stat(C.iskMin, b.iskPerMin != null ? fmtIsk(b.iskPerMin) : null)
    + stat(C.alliances, b.alliances)
    + stat(C.corps, b.corporations)
    + `</div>` + ally + win;
  return el;
}
// Image URL for an entity by type (portrait for characters, logo for corp/alliance, render for ships).
const entityImg = (type, id, size = 64) =>
  type === "character" ? `${IMG}/characters/${nid(id)}/portrait?size=${nid(size)}`
  : type === "corporation" ? `${IMG}/corporations/${nid(id)}/logo?size=${nid(size)}`
  : type === "alliance" ? `${IMG}/alliances/${nid(id)}/logo?size=${nid(size)}`
  : `${IMG}/types/${nid(id)}/render?size=${nid(size)}`;
const statCell = (label, val) => val == null || val === "" ? "" :
  `<div class="gc-s"><span class="gc-v">${esc(String(val))}</span><span class="gc-l">${esc(label)}</span></div>`;
const nFmt = (n) => Number(n) >= 1000 ? (Number(n) / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(Number(n) || 0);
const shipStrip = (title, ships) => !ships?.length ? "" :
  `<div class="ship-strip"><div class="ss-title">${esc(title)}</div><div class="ss-row">` +
  ships.map((s) => `<a class="ss-item" href="https://eve-kill.com/item/${nid(s.id)}" title="${esc(s.name || "")}">`
    + `<img src="${entityImg("ship", s.id, 32)}" alt="" /><span>${esc(s.name || "")}</span>`
    + `<i>${nFmt(s.n)}</i></a>`).join("") + `</div></div>`;

function entityHead(e, sub) {
  const img = e.id ? `<img class="eh-img" src="${entityImg(e.type, e.id, 64)}" alt="" />` : "";
  const name = `${esc(e.name || "?")}${e.ticker ? ` <span class="eh-tk">[${esc(e.ticker)}]</span>` : ""}`;
  const inner = `${img}<div class="eh-meta"><div class="eh-name">${name}</div>${sub ? `<div class="eh-sub">${esc(sub)}</div>` : ""}</div>`;
  if (safeHref(e.href)) { const a = document.createElement("a"); a.className = "ent-head"; a.href = safeHref(e.href); a.title = "eve-kill.com"; a.innerHTML = inner; return a; }
  const d = document.createElement("div"); d.className = "ent-head"; d.innerHTML = inner; return d;
}

function profileEl(c) {
  const C = L.cards, lf = c.lifetime;
  const el = document.createElement("div"); el.className = "panel";
  el.appendChild(entityHead(c.entity, null));
  const grid = document.createElement("div"); grid.className = "gc-stats wide";
  grid.innerHTML = statCell(C.kills, lf.kills?.toLocaleString())
    + statCell(C.losses, lf.losses?.toLocaleString())
    + statCell(C.iskEff, lf.iskEff != null ? lf.iskEff + "%" : null)
    + statCell(C.iskDestroyed, lf.iskDestroyed != null ? fmtIsk(lf.iskDestroyed) : null)
    + statCell(C.iskLost, lf.iskLost != null ? fmtIsk(lf.iskLost) : null)
    + statCell(C.solo, lf.soloKills?.toLocaleString())
    + statCell(C.finalBlows, lf.finalBlows?.toLocaleString());
  el.appendChild(grid);
  const strips = shipStrip(C.shipsFlown, c.shipsFlown) + shipStrip(C.shipsLost, c.shipsLost);
  if (strips) { const s = document.createElement("div"); s.innerHTML = strips; el.appendChild(s); }
  return el;
}

function statsEl(c) {
  const C = L.cards, t = c.totals;
  const el = document.createElement("div"); el.className = "panel";
  el.appendChild(entityHead(c.entity, null));
  const grid = document.createElement("div"); grid.className = "gc-stats wide";
  grid.innerHTML = statCell(C.kills, t.kills?.toLocaleString())
    + statCell(C.losses, t.losses?.toLocaleString())
    + statCell(C.kd, t.kd != null ? (+t.kd).toFixed(2) : null)
    + statCell(C.iskRatio, t.iskRatio != null ? (+t.iskRatio).toFixed(2) : null)
    + statCell(C.iskEff, t.iskEff != null ? t.iskEff + "%" : null)
    + statCell(C.soloRate, t.soloRate != null ? t.soloRate + "%" : null)
    + statCell(C.finalBlows, t.finalBlows?.toLocaleString())
    + statCell(C.gang, t.avgGang != null ? (+t.avgGang).toFixed(1) : null);
  el.appendChild(grid);
  if (c.peakHourUtc != null) {
    const f = document.createElement("div"); f.className = "gc-win";
    f.textContent = `${C.peak}: ${String(c.peakHourUtc).padStart(2, "0")}:00 UTC`;
    el.appendChild(f);
  }
  return el;
}

function rankEl(c) {
  const C = L.cards;
  const el = document.createElement("div"); el.className = "panel";
  const dimLabel = (C.dim && C.dim[c.dimension]) || c.dimension || "";
  const head = document.createElement("div"); head.className = "rank-title";
  head.textContent = `${dimLabel}${c.entity?.name ? " · " + c.entity.name : ""}`;
  el.appendChild(head);
  const iconType = /alliance/.test(c.dimension) ? "alliance" : /corporation/.test(c.dimension) ? "corporation"
    : /^ship_/.test(c.dimension) ? "ship" : null;
  const list = document.createElement("div"); list.className = "ranklist";
  for (const r of c.rows) {
    const row = document.createElement("div"); row.className = "rrow";
    const img = iconType && r.id ? `<img src="${entityImg(iconType, r.id, 32)}" alt="" />` : "";
    const kl = [r.kills != null ? `${C.kills} ${(+r.kills).toLocaleString()}` : "",
                r.losses != null ? `${C.losses} ${(+r.losses).toLocaleString()}` : ""].filter(Boolean).join(" · ");
    row.innerHTML = `<span class="rr-n">${esc(r.rank)}</span>${img}`
      + `<span class="rr-name">${esc(r.name || "?")}</span>`
      + `<span class="rr-kl">${kl}</span>`
      + (r.isk != null ? `<span class="rr-isk">${fmtIsk(r.isk)}</span>` : "");
    list.appendChild(row);
  }
  el.appendChild(list);
  return el;
}

const PS_COLOR = { solo: "#34d399", small: "#38bdf8", mid: "#f97316", fleet: "#a78bfa", blob: "#fb7185" };
function pilotEl(c) {
  const C = L.cards, e = c.entity;
  const el = document.createElement("div"); el.className = "panel";
  el.appendChild(entityHead(e, null));
  // Badges: dominant playstyle + FC likelihood + archetype tags + flags.
  const badges = [];
  if (c.playstyle?.dominant) badges.push(`<span class="gc-badge">${esc(c.playstyle.dominant)}</span>`);
  if (c.fc) badges.push(`<span class="pbadge fc">FC: ${esc(c.fc)}</span>`);
  for (const t of (c.tags || [])) badges.push(`<span class="pbadge">${esc(t)}</span>`);
  for (const f of (c.flags || [])) badges.push(`<span class="pbadge">${esc(f)}</span>`);
  if (badges.length) { const b = document.createElement("div"); b.className = "pbadges"; b.innerHTML = badges.join(""); el.appendChild(b); }
  // Stat grid.
  const grid = document.createElement("div"); grid.className = "gc-stats wide";
  grid.innerHTML = statCell(C.kills, c.stats.kills != null ? (+c.stats.kills).toLocaleString() : null)
    + statCell(C.losses, c.stats.losses != null ? (+c.stats.losses).toLocaleString() : null)
    + statCell(C.iskEff, c.stats.iskEff != null ? c.stats.iskEff + "%" : null);
  el.appendChild(grid);
  // Playstyle distribution bar (solo/small/mid/fleet/blob).
  if (c.playstyle?.bars?.some(([, v]) => v > 0)) {
    const ps = document.createElement("div"); ps.className = "ps-wrap";
    const segs = c.playstyle.bars.filter(([, v]) => v > 0)
      .map(([k, v]) => `<i style="width:${nid(v)}%;background:${psCol(k)}" title="${esc((C.ps && C.ps[k]) || k)}: ${nid(v)}%"></i>`).join("");
    const legend = c.playstyle.bars.map(([k, v]) => `<span><b style="background:${psCol(k)}"></b>${esc((C.ps && C.ps[k]) || k)} ${nid(v)}%</span>`).join("");
    ps.innerHTML = `<div class="pbar">${segs}</div><div class="ps-legend">${legend}</div>`
      + (c.playstyle.avgFleet != null ? `<div class="ps-avg">${esc(C.avgFleet)}: ${esc(c.playstyle.avgFleet)}</div>` : "");
    el.appendChild(ps);
  }
  // Recent ships + wingmates.
  if (c.ships?.length) { const s = document.createElement("div"); s.innerHTML = shipStrip(L.recentShips, c.ships); el.appendChild(s); }
  if (c.wingmates?.length) {
    const w = document.createElement("div"); w.className = "wm-wrap";
    w.innerHTML = `<div class="ss-title">${esc(L.fliesWith)}</div><div class="wm-row">`
      + c.wingmates.map((p) => `<a class="wm-chip" href="https://eve-kill.com/character/${nid(p.id)}" title="${esc(p.name)}">`
        + `<img src="${entityImg("character", p.id, 32)}" alt="" /><span>${esc(p.name)}</span>`
        + (p.shared != null ? `<i>${nFmt(p.shared)}</i>` : "") + `</a>`).join("") + `</div>`;
    el.appendChild(w);
  }
  return el;
}

// Character portrait list (flies_with / preys_on / hunted_by): portrait + name +
// corp·alliance + a metric badge (shared / total kills).
function entityListEl(c) {
  const el = document.createElement("div"); el.className = "panel";
  const title = (L.cards.list && L.cards.list[c.variant]) || "";
  if (title || c.entityName) {
    const h = document.createElement("div"); h.className = "rank-title";
    h.textContent = `${title}${c.entityName ? " · " + c.entityName : ""}`;
    el.appendChild(h);
  }
  const list = document.createElement("div"); list.className = "elist";
  for (const it of c.items) {
    const row = document.createElement("a"); row.className = "erow";
    row.href = `https://eve-kill.com/character/${nid(it.id)}`; row.title = "eve-kill.com";
    row.innerHTML = `<img src="${entityImg("character", it.id, 32)}" alt="" />`
      + `<span class="er-name">${esc(it.name)}</span>`
      + (it.sub ? `<span class="er-sub">${esc(it.sub)}</span>` : `<span class="er-sub"></span>`)
      + (it.metric != null ? `<span class="er-m">${nFmt(it.metric)}</span>` : "");
    list.appendChild(row);
  }
  el.appendChild(list);
  return el;
}

// Solar-system list (hunts_in): security badge + system + region + kills.
const secColor = (s) => s == null ? "#7b8290" : s >= 0.45 ? "#34d399" : s > 0.0 ? "#eab308" : "#fb7185";
const secTxt = (s) => s == null ? "?" : (Math.round(Number(s) * 10) / 10).toFixed(1);
function sysListEl(c) {
  const el = document.createElement("div"); el.className = "panel";
  if (c.entityName) {
    const h = document.createElement("div"); h.className = "rank-title";
    h.textContent = `${L.cards.huntingGrounds || ""} · ${c.entityName}`;
    el.appendChild(h);
  }
  const list = document.createElement("div"); list.className = "elist";
  for (const s of c.items) {
    const row = document.createElement(s.href ? "a" : "div"); row.className = "erow";
    if (s.href && setHref(row, s.href)) row.title = "eve-kill.com";
    const col = secColor(s.security);
    row.innerHTML = `<span class="sec" style="color:${col};border-color:${col}">${secTxt(s.security)}</span>`
      + `<span class="er-name">${esc(s.name)}</span>`
      + `<span class="er-sub">${esc(s.region || "")}</span>`
      + (s.kills != null ? `<span class="er-m">${nFmt(s.kills)} ${esc(L.cards.kill)}</span>` : "");
    list.appendChild(row);
  }
  el.appendChild(list);
  return el;
}

// war_report → head-to-head recap: two sides with logos + scoreboard + ISK-share bar + contested systems.
function versusEl(c) {
  const C = L.cards;
  const el = document.createElement("div"); el.className = "panel";
  const side = (s, won) => `<a class="vs-side${won ? " win" : ""}" href="${s.id ? ekUrl(s.type, s.id) : "#"}" title="eve-kill.com">`
    + `<img src="${entityImg(s.type, s.id, 64)}" alt="" /><span class="vs-name">${esc(s.name)}</span></a>`;
  const head = document.createElement("div"); head.className = "vs-head";
  head.innerHTML = side(c.a, c.leader === "a") + `<span class="vs-mid">VS</span>` + side(c.b, c.leader === "b");
  el.appendChild(head);
  const score = document.createElement("div"); score.className = "vs-score";
  const row = (a, lbl, b) => `<div class="vs-a">${esc(String(a))}</div><div class="vs-l">${esc(lbl)}</div><div class="vs-b">${esc(String(b))}</div>`;
  score.innerHTML = row((+c.a.kills || 0).toLocaleString(), C.kills, (+c.b.kills || 0).toLocaleString())
    + row(fmtIsk(c.a.isk || 0), C.iskDestroyed, fmtIsk(c.b.isk || 0));
  el.appendChild(score);
  if (c.iskShareA != null) {
    const a = Math.max(0, Math.min(100, c.iskShareA)), b = 100 - a;
    const bar = document.createElement("div");
    bar.innerHTML = `<div class="vs-bar"><i style="width:${a}%;background:#f97316"></i><i style="width:${b}%;background:#38bdf8"></i></div>`
      + `<div class="vs-barlbl"><span>${a}%</span><span>${esc(C.iskShare)}</span><span>${(Math.round(b * 10) / 10)}%</span></div>`;
    el.appendChild(bar);
  }
  if (c.systems?.length) {
    const s = document.createElement("div"); s.className = "vs-sys";
    s.innerHTML = `<div class="ss-title">${esc(C.contested)}</div><div class="ss-row">`
      + c.systems.map((x) => `<span class="syschip">${esc(x.name)}${x.kills != null ? ` <i>${nFmt(x.kills)}</i>` : ""}</span>`).join("") + `</div>`;
    el.appendChild(s);
  }
  return el;
}

// battle_report → per-team recap: winner/loser badge + team scoreboard + member alliance/corp logos.
function battleReportEl(c) {
  const C = L.cards;
  const el = document.createElement("div"); el.className = "panel";
  const meta = [c.system, c.region, c.durationMin != null ? c.durationMin + "m" : null,
    c.totalKills != null ? c.totalKills + " " + C.kills : null, c.totalIsk != null ? fmtIsk(c.totalIsk) : null].filter(Boolean).join(" · ");
  const head = document.createElement(c.href ? "a" : "div"); head.className = "rank-title bt-title";
  if (c.href && setHref(head, c.href)) head.title = "eve-kill.com";
  head.textContent = `#${c.id} · ${meta}`;
  el.appendChild(head);
  const teams = document.createElement("div"); teams.className = "bt-teams";
  for (const t of c.teams) {
    const tb = document.createElement("div"); tb.className = "bt-team " + (t.won ? "win" : "lose");
    const members = (t.members || []).map((m) => `<a class="bt-m" href="${ekUrl(m.type, m.id)}" title="${esc(m.name)}">`
      + `<img src="${entityImg(m.type, m.id, 32)}" alt="" /><span>${esc(m.name)}${m.ticker ? ` <i>[${esc(m.ticker)}]</i>` : ""}</span></a>`).join("");
    tb.innerHTML = `<div class="bt-h"><span class="bt-badge">${esc(t.won ? C.battle.won : C.battle.lost)}</span>`
      + `<span class="bt-stat">${(+t.kills || 0).toLocaleString()} ${esc(C.kills)} · ${fmtIsk(t.isk || 0)}</span></div>`
      + `<div class="bt-members">${members}</div>`;
    teams.appendChild(tb);
  }
  el.appendChild(teams);
  return el;
}

// EVE Workbench community fits: #N index + ship icon + fit name + ship/class/author + tags + cost.
function fitListEl(c) {
  const C = L.cards;
  const el = document.createElement("div"); el.className = "panel";
  const h = document.createElement("div"); h.className = "rank-title";
  h.textContent = `${C.fitsFor || "Fit"} · ${c.ship}${c.tag ? ` (${c.tag})` : ""}`;
  el.appendChild(h);
  const list = document.createElement("div"); list.className = "elist";
  c.items.forEach((f, i) => {
    const row = document.createElement("a"); row.className = "fitrow";
    row.href = `https://eveworkbench.com/fit/${encodeURIComponent(String(f.id))}`; row.title = "eveworkbench.com";
    const tags = (f.tags || []).map((t) => `<span class="fittag">${esc(t)}</span>`).join("");
    row.innerHTML = `<span class="fit-n">#${i + 1}</span><img src="${entityImg("ship", f.shipId, 32)}" alt="" />`
      + `<div class="fit-main"><span class="fit-name">${esc(f.name)}</span>`
      + `<span class="fit-sub">${esc(f.shipName || "")}${f.shipClass ? ` · ${esc(f.shipClass)}` : ""}${f.author ? ` · ${esc(f.author)}` : ""}</span></div>`
      + (f.alpha ? `<span class="fittag alpha" title="Alpha">α</span>` : "")
      + (tags ? `<span class="fit-tags">${tags}</span>` : "")
      + (f.cost != null ? `<span class="er-m">${fmtIsk(f.cost)}</span>` : "");
    list.appendChild(row);
  });
  el.appendChild(list);
  const foot = document.createElement("div"); foot.className = "fit-hint";
  foot.textContent = C.fitHint || "";
  el.appendChild(foot);
  return el;
}

// Visual fit card (computed DPS/range, EHP + resists, cap, nav, targeting, drones). The EFT block of the
// answer, if any, is moved in by the caller (see adoptEft) as the right-hand column.
function dmgBox(x, C) {
  const lbl = x.label === "max" ? C.fs.high : x.label === "min" ? C.fs.long : C.fs.dps;
  const range = x.rangeKm != null ? `${C.fs.range} ${x.rangeKm} km`
    : x.optimalKm != null ? `${C.fs.optimal} ${x.optimalKm} km${x.falloffKm ? ` +${x.falloffKm}` : ""}` : "";
  const sub = `${range}${x.alpha != null ? `${range ? " · " : ""}${C.fs.alpha} ${x.alpha}` : ""}`;
  return `<div class="k"><b class="num">${esc(x.dps)}</b><span>${esc(C.fs.dps)} · ${esc(lbl)}${x.ammo ? ` · ${esc(x.ammo)}` : ""}</span>`
    + (sub ? `<small class="num">${esc(sub)}</small>` : "") + `</div>`;
}
function fitStatsEl(c) {
  const C = L.cards, fs = C.fs;
  const el = document.createElement("div"); el.className = "fitcard";
  const big = (v, u, l) => `<div class="k"><b class="num">${esc(String(v))}${u ? `<em>${esc(u)}</em>` : ""}</b><span>${esc(l)}</span></div>`;
  const sec = (l, v) => v == null || v === "" ? "" : `<div><b class="num">${esc(String(v))}</b>${esc(l)}</div>`;
  let h = `<div class="fc-st"><div><span class="lab">${esc(c.shipClass || C.fitCalc)}</span>`
    + `<h3>${esc(c.ship)}${c.context ? ` · ${esc(c.context)}` : ""}</h3></div>`;
  h += `<div class="fc-big">${(c.damage || []).map((x) => dmgBox(x, C)).join("")}`
    + (c.ehp ? big((+c.ehp.total).toLocaleString(), "", fs.ehp) : "")
    + (c.nav ? big(c.nav.speed, "m/s", fs.speed) : "") + `</div>`;
  const rest = sec(fs.align, c.nav ? c.nav.align + " s" : null)
    + sec(fs.targeting, c.targeting ? c.targeting.rangeKm + " km" : null)
    + sec(fs.drones, c.drones ? `${c.drones.active} · ${c.drones.controlRangeKm} km` : null)
    + sec(fs.activeRep, c.activeTank ? Object.values(c.activeTank).join("/") + "/s" : null)
    + sec(fs.passiveRegen, c.passiveShield ? c.passiveShield + "/s" : null);
  if (rest) h += `<div class="fc-sec">${rest}</div>`;
  if (c.cap) {
    const ok = !!c.cap.stable;
    const w = ok ? 100 : Math.max(6, Math.min(100, Math.round((+c.cap.secondsToEmpty || 0) / 3)));
    h += `<div><span class="lab">${esc(fs.capLab)}</span><div class="fc-cap ${ok ? "ok" : "warn"}"><span class="bar"><i style="width:${nid(w)}%"></i></span>`
      + `<b class="num">${ok ? `${esc(fs.stableCap)} ${esc(c.cap.pct)}%` : `${esc(fs.unstable)} · ${esc(fs.emptyIn)} ${esc(c.cap.secondsToEmpty)} s`}</b></div></div>`;
  }
  if (c.ehp?.resists) {
    const R = c.ehp.resists, rows = [["shield", R.shield], ["armor", R.armor], ["hull", R.hull]].filter(([, r]) => r);
    h += `<div class="fc-rs"><div class="rh"><span></span><span>${esc(fs.em)}</span><span>${esc(fs.th)}</span><span>${esc(fs.kin)}</span><span>${esc(fs.exp)}</span></div>`
      + rows.map(([k, r]) => `<div><span>${esc(fs[k])}</span><b class="num">${esc(r.em)}%</b><b class="num">${esc(r.th)}%</b><b class="num">${esc(r.kin)}%</b><b class="num">${esc(r.exp)}%</b></div>`).join("") + `</div>`;
  }
  el.innerHTML = h + `</div>`;
  return el;
}
// Moves the answer's EFT blockquote (copy button included: the click handler is delegated on #chat) into the card.
function adoptEft(card, from) {
  const eft = from.querySelector("blockquote.fit");
  const el = card.querySelector(".fitcard");
  if (eft && el) { el.appendChild(eft); el.classList.add("has-eft"); }
}

// coalition_graph → circular chord diagram. Every alliance sits on a RING (no entity
// is centred) and ALL relationships are drawn as gently-bundled chords coloured by
// type (allied=cyan / enemy=red / mixed=amber, thickness ∝ battles). Fully
// deterministic — no force simulation, so it can never collapse into a blob.
function coalitionGraphEl(c) {
  const it = SYS_LANG === "it";
  const T = it
    ? { ally: "alleati", enemy: "nemici", mixed: "misto", width: "spessore = battaglie", net: "Rete coalizioni", battles: "battaglie" }
    : { ally: "allies", enemy: "enemies", mixed: "mixed", width: "width = battles", net: "Coalition network", battles: "battles" };
  const el = document.createElement("div"); el.className = "panel";
  const byId = new Map(c.nodes.map((n) => [n.id, n]));
  const head = document.createElement("div"); head.className = "rank-title";
  head.textContent = `${T.net} · ${nFmt(c.nodeCount)} ⬡ · ${nFmt(c.edgeCount)} ↔`;
  el.appendChild(head);

  const present = new Set(); for (const l of c.links) { present.add(l.a); present.add(l.b); }
  // Ring order = total incident battles desc → busiest alliances spread out, stable layout.
  const wsum = new Map();
  for (const l of c.links) { wsum.set(l.a, (wsum.get(l.a) || 0) + (l.w || 0)); wsum.set(l.b, (wsum.get(l.b) || 0) + (l.w || 0)); }
  const ids = [...present].filter((id) => byId.has(id)).sort((a, b) => (wsum.get(b) || 0) - (wsum.get(a) || 0));
  const N = ids.length;
  if (N < 2) return el;
  const ix = new Map(ids.map((id, i) => [id, i]));
  const E = c.links.map((l) => ({ s: ix.get(l.a), t: ix.get(l.b), w: l.w || 1, type: l.type }))
    .filter((e) => e.s != null && e.t != null && e.s !== e.t);

  const SZ = N > 40 ? 20 : N > 28 ? 24 : 30, hsz = SZ / 2;
  const R = Math.max(210, Math.round((N * (SZ + 16)) / (2 * Math.PI)));   // ring big enough for spacing
  const VB = 2 * (R + 80), cx = VB / 2, cy = VB / 2;                      // margin for logos + radial labels
  const ang = (i) => -Math.PI / 2 + i * (2 * Math.PI / N);
  const PX = ids.map((_, i) => cx + R * Math.cos(ang(i)));
  const PY = ids.map((_, i) => cy + R * Math.sin(ang(i)));

  const COL = { ally: "#22d3ee", enemy: "#f87171", mixed: "#e0b352" };
  const ws = E.map((e) => e.w), wmin = Math.min(...ws), wmax = Math.max(...ws);
  const sw = (w) => (wmax > wmin ? 1 + 3 * (w - wmin) / (wmax - wmin) : 1.5);
  const nm = (id) => byId.get(id)?.name || byId.get(id)?.ticker || String(id);
  // Chords bowed toward the centre (control point pulled 50% inward) → soft bundling.
  const edgesSvg = E.map((e) => {
    const ax = PX[e.s], ay = PY[e.s], bx = PX[e.t], by = PY[e.t];
    const qx = cx + ((ax + bx) / 2 - cx) * 0.5, qy = cy + ((ay + by) / 2 - cy) * 0.5;
    const tip = `${nm(ids[e.s])} ↔ ${nm(ids[e.t])} · ${e.w} ${T.battles} · ${T[e.type] || T.mixed}`;
    return `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="${COL[e.type] || COL.mixed}" stroke-width="${sw(e.w).toFixed(1)}" stroke-opacity="0.32"><title>${esc(tip)}</title></path>`;
  }).join("");
  const nodesSvg = ids.map((id, i) => {
    const x = PX[i], y = PY[i], n = byId.get(id) || {}, foc = c.focus && id === c.focus;
    const ca = Math.cos(ang(i)), sa = Math.sin(ang(i)), anchor = ca >= 0 ? "start" : "end";
    return `<a href="https://eve-kill.com/alliance/${nid(id)}"><title>${esc((n.name || "") + (n.ticker ? ` [${n.ticker}]` : ""))}</title>`
      + `<image href="https://images.evetech.net/alliances/${nid(id)}/logo?size=64" x="${(x - hsz).toFixed(1)}" y="${(y - hsz).toFixed(1)}" width="${SZ}" height="${SZ}" />`
      + `<rect x="${(x - hsz).toFixed(1)}" y="${(y - hsz).toFixed(1)}" width="${SZ}" height="${SZ}" rx="5" fill="none" stroke="${foc ? "#f97316" : "#2a2f37"}" stroke-width="${foc ? 2.5 : 1.2}" />`
      + `<text x="${(x + ca * (hsz + 6)).toFixed(1)}" y="${(y + sa * (hsz + 6)).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="9" font-family="ui-monospace,monospace" fill="#c4c7c5">${esc(n.ticker || "")}</text></a>`;
  }).join("");

  const holder = document.createElement("div");
  holder.innerHTML = `<svg viewBox="0 0 ${VB} ${VB}" width="100%" style="max-height:680px;display:block">${edgesSvg}${nodesSvg}</svg>`;
  el.appendChild(holder.firstChild);

  const legend = document.createElement("div");
  legend.style.cssText = "display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;font-family:ui-monospace,monospace;font-size:.72rem;color:#8a9099;margin-top:.5rem";
  const key = (col, lbl) => `<span style="display:inline-flex;align-items:center;gap:.35rem"><i style="width:14px;height:3px;background:${col};display:inline-block"></i>${esc(lbl)}</span>`;
  legend.innerHTML = key(COL.ally, T.ally) + key(COL.enemy, T.enemy) + key(COL.mixed, T.mixed) + `<span>${esc(T.width)}</span>`;
  el.appendChild(legend);

  // Allies grouped per alliance (roster): one row per alliance listing ALL its allies —
  // each ally as logo + ticker + (shared battles). Sorted by total shared battles desc.
  const allyOf = new Map();
  for (const e of E) {
    if (e.type !== "ally") continue;
    const A = ids[e.s], B = ids[e.t];
    if (!allyOf.has(A)) allyOf.set(A, []);
    if (!allyOf.has(B)) allyOf.set(B, []);
    allyOf.get(A).push({ id: B, w: e.w });
    allyOf.get(B).push({ id: A, w: e.w });
  }
  const subjects = [...allyOf.keys()].filter((id) => byId.has(id))
    .map((id) => ({ id, allies: allyOf.get(id).sort((x, y) => y.w - x.w), tot: allyOf.get(id).reduce((s, x) => s + x.w, 0) }))
    .sort((a, b) => b.tot - a.tot);
  if (subjects.length) {
    const lh = document.createElement("div"); lh.className = "rank-title";
    lh.style.cssText = "margin-top:1.1rem;font-size:.8rem";
    lh.textContent = it ? "Alleanze e i loro alleati" : "Alliances and their allies";
    el.appendChild(lh);
    const tk = (id) => esc(byId.get(id)?.ticker || byId.get(id)?.name || id);
    const logo = (id, sz) => `<img src="https://images.evetech.net/alliances/${nid(id)}/logo?size=32" alt="" style="width:${sz}px;height:${sz}px;border-radius:3px;background:#0a0b0d;flex:0 0 auto" />`;
    const list = document.createElement("div");
    list.style.cssText = "margin-top:.5rem;display:flex;flex-direction:column;gap:4px";
    for (const sub of subjects) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;flex-wrap:wrap;gap:.4rem .6rem;padding:.45rem .65rem;background:#0e1014;border:1px solid var(--line);border-left:3px solid #22d3ee;border-radius:3px;font-family:ui-monospace,monospace;font-size:.76rem";
      const subj = `<a href="https://eve-kill.com/alliance/${nid(sub.id)}" style="display:inline-flex;align-items:center;gap:.4rem;color:#e6e9ee;text-decoration:none;flex:0 0 auto;min-width:6.5rem">`
        + logo(sub.id, 24) + `<b style="white-space:nowrap">${tk(sub.id)}</b></a><span style="color:#22d3ee;flex:0 0 auto">›</span>`;
      const allies = sub.allies.map((al) =>
        `<a href="https://eve-kill.com/alliance/${nid(al.id)}" title="${tk(al.id)} · ${nFmt(al.w)} ${esc(T.battles)}" style="display:inline-flex;align-items:center;gap:.3rem;color:#c4c7c5;text-decoration:none">`
        + logo(al.id, 18) + `<span style="white-space:nowrap">${tk(al.id)} <span style="color:#8a9099">(${nFmt(al.w)})</span></span></a>`).join("");
      row.innerHTML = subj + `<span style="flex:1 1 auto;min-width:0;display:flex;flex-wrap:wrap;gap:.35rem .7rem;align-items:center">${allies}</span>`;
      list.appendChild(row);
    }
    el.appendChild(list);
  }
  return el;
}

// entity_timeline → per-period activity list (one compact row per month/day/year),
// styled like the kill list. Green = kills / ISK destroyed, red = losses / ISK lost.
function timelineEl(c) {
  const el = document.createElement("div"); el.className = "panel";
  if (c.entity) {
    const head = document.createElement(c.entity.id ? "a" : "div"); head.className = "rank-title";
    if (c.entity.id) { head.href = ekUrl(c.entity.type, c.entity.id); head.title = "eve-kill.com"; }
    head.textContent = c.entity.name || "";
    el.appendChild(head);
  }
  const lab = SYS_LANG === "it" ? { k: "K", l: "P", solo: "solo", fb: "FB" } : { k: "K", l: "L", solo: "solo", fb: "FB" };
  const fmtPeriod = (p) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(p || ""); if (!m) return p || "";
    if (c.bucket === "year") return m[1];
    if (c.bucket === "day") return `${m[3]}/${m[2]}/${m[1]}`;
    return new Date(+m[1], +m[2] - 1, 1).toLocaleDateString(SYS_LANG === "it" ? "it-IT" : "en-GB", { month: "short", year: "numeric" });
  };
  const list = document.createElement("div");
  list.style.cssText = "margin-top:.7rem;display:flex;flex-direction:column;gap:4px";
  for (const r of c.rows) {
    const row = document.createElement("div");
    row.style.cssText = "display:grid;grid-template-columns:5.5rem 1fr auto;gap:.25rem .8rem;align-items:center;padding:.4rem .65rem;background:#0e1014;border:1px solid var(--line);border-left:3px solid var(--orange);border-radius:3px;font-family:ui-monospace,monospace;font-size:.78rem";
    const solo = r.soloKills != null ? ` · ${lab.solo} ${nFmt(r.soloKills)}` : "";
    const fb = r.finalBlows != null ? ` · ${lab.fb} ${nFmt(r.finalBlows)}` : "";
    row.innerHTML =
      `<span style="color:#c4c7c5;font-weight:700">${esc(fmtPeriod(r.period))}</span>`
      + `<span><b style="color:#6fd96b">${lab.k} ${nFmt(r.kills)}</b> · <b style="color:#f87171">${lab.l} ${nFmt(r.losses)}</b><span style="color:#8a9099">${solo}${fb}</span></span>`
      + `<span style="text-align:right;white-space:nowrap"><span style="color:#6fd96b">${fmtIsk(r.iskDestroyed)}</span> · <span style="color:#f87171">${fmtIsk(r.iskLost)}</span></span>`;
    list.appendChild(row);
  }
  el.appendChild(list);
  return el;
}

// ships_used → most-flown hulls as a kill-list-style list: ship render + name + count.
function shipsListEl(c) {
  const el = document.createElement("div"); el.className = "panel";
  if (c.entityName) { const h = document.createElement("div"); h.className = "rank-title"; h.textContent = c.entityName; el.appendChild(h); }
  const list = document.createElement("div");
  list.style.cssText = "margin-top:.7rem;display:flex;flex-direction:column;gap:4px";
  for (const s of c.items) {
    const a = document.createElement("a");
    a.href = `https://eve-kill.com/item/${nid(s.id)}`;
    a.title = "eve-kill.com";
    a.style.cssText = "display:flex;align-items:center;gap:.6rem;padding:.35rem .65rem;background:#0e1014;border:1px solid var(--line);border-left:3px solid var(--orange);border-radius:3px;color:#c4c7c5;text-decoration:none;font-family:ui-monospace,monospace;font-size:.82rem";
    const kl = (s.kills || s.losses) ? ` <span style="opacity:.7">(${nFmt(s.kills || 0)}K·${nFmt(s.losses || 0)}${SYS_LANG === "it" ? "P" : "L"})</span>` : "";
    a.innerHTML = `<img src="${IMG}/types/${nid(s.id)}/render?size=32" alt="" style="width:30px;height:30px;flex:0 0 auto;background:#0a0b0d" />`
      + `<span style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.name)}</span>`
      + (s.count != null ? `<span style="margin-left:auto;color:#8a9099;white-space:nowrap;flex:0 0 auto">${nFmt(s.count)}×${kl}</span>` : "");
    list.appendChild(a);
  }
  el.appendChild(list);
  return el;
}

function renderCards(cards) {
  const wrap = document.createElement("div");
  if (cards.kind === "battles") { wrap.className = "cardgrid"; for (const b of cards.items) wrap.appendChild(battleCardEl(b)); return wrap; }
  wrap.className = "cardpanel";
  if (cards.kind === "profile") wrap.appendChild(profileEl(cards));
  else if (cards.kind === "stats") wrap.appendChild(statsEl(cards));
  else if (cards.kind === "rank") wrap.appendChild(rankEl(cards));
  else if (cards.kind === "pilot") wrap.appendChild(pilotEl(cards));
  else if (cards.kind === "entitylist") wrap.appendChild(entityListEl(cards));
  else if (cards.kind === "syslist") wrap.appendChild(sysListEl(cards));
  else if (cards.kind === "versus") wrap.appendChild(versusEl(cards));
  else if (cards.kind === "battlecard") wrap.appendChild(battleReportEl(cards));
  else if (cards.kind === "coalitiongraph") wrap.appendChild(coalitionGraphEl(cards));
  else if (cards.kind === "timeline") wrap.appendChild(timelineEl(cards));
  else if (cards.kind === "shiplist") wrap.appendChild(shipsListEl(cards));
  else if (cards.kind === "fitlist") wrap.appendChild(fitListEl(cards));
  else if (cards.kind === "fitstats") wrap.appendChild(fitStatsEl(cards));
  return wrap;
}



// ── Chat shell ───────────────────────────────────────────────────────────
const chat = $("chat");              // scroll container
const chatCol = $("chat-col");       // message column
const statusText = $("status-text");
const q = $("q");
const send = $("send");
const scrollBottom = () => { chat.scrollTop = chat.scrollHeight; };
const nearBottom = () => chat.scrollHeight - chat.scrollTop - chat.clientHeight < 140;
function bubble(cls) {
  const d = document.createElement("div");
  if (cls === "user") d.className = "um";
  else { d.className = "am"; d.innerHTML = `<span class="who">${markSvg(14)}Capsuleers.IA</span>`; }
  chatCol.appendChild(d);
  scrollBottom();
  return d;
}


// ── Window controls ─────────────────────────────────────────────────────
const ICON_MAX = ic("max", 14);
const ICON_RESTORE = '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="14" height="14"/><path d="M7 7V3h14v14h-4"/></svg>';
$("wc-mini").addEventListener("click", () => capsuleers.win.mini());
$("wc-tray").addEventListener("click", () => capsuleers.win.minimize());
$("wc-max").addEventListener("click", () => capsuleers.win.maximize());
$("wc-close").addEventListener("click", () => capsuleers.win.close());
capsuleers.win.onState((max) => { $("wc-max").innerHTML = max ? ICON_RESTORE : ICON_MAX; });
// Mini-mode: click the icon to return to the interface
document.querySelector("#mini img").addEventListener("click", () => capsuleers.win.restore());
capsuleers.win.onMiniState((mini) => document.body.classList.toggle("mini", mini));

// ── Info page ───────────────────────────────────────────────────────────
// Show the running app version so "old vs new build" is distinguishable at a glance.
capsuleers.appVersion().then((v) => { if (v) $("about-version").textContent = "v" + v; }).catch(() => {});
// Danger zone: full data wipe with a two-step inline confirm (no native dialogs).
const wipeBtn = $("wipe-data");
let wipeArmed = false;
wipeBtn.addEventListener("click", () => {
  if (wipeBtn.disabled || wipeArmed) return;
  wipeArmed = true;
  const wrap = document.createElement("span");
  wrap.className = "wipe-confirm";
  const cancel = document.createElement("button");
  cancel.className = "btn s"; cancel.type = "button"; cancel.textContent = L.setupCancel;
  const yes = document.createElement("button");
  yes.className = "btn s c"; yes.type = "button"; yes.textContent = L.wipeConfirmBtn;
  cancel.addEventListener("click", () => { wrap.remove(); wipeArmed = false; });
  yes.addEventListener("click", async () => {
    wrap.remove(); wipeBtn.disabled = true; $("wipe-label").textContent = L.computing;
    try { await capsuleers.data.wipeAll(); } catch { /* app is quitting */ }
  });
  wrap.append(cancel, yes);
  wipeBtn.parentElement.append(wrap);
});

// ── View router ─────────────────────────────────────────────────────────
// Exactly one view fills the main area; the rail drives it. The pilot dossier is a drawer.
const VIEW_IDS = { chat: "v-chat", local: "local", dscan: "dscan", history: "history-modal", models: "v-models", rag: "v-rag", about: "about" };
let currentView = "chat";
const navBtns = [...document.querySelectorAll(".rl [data-view]")];
function showView(name) {
  for (const [k, id] of Object.entries(VIEW_IDS)) $(id).classList.toggle("show", k === name);
  for (const b of navBtns) {
    const on = b.dataset.view === name;
    b.classList.toggle("on", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  }
  closePilot();   // a view switch closes the pilot drawer
  currentView = name;
  if (name !== "history") stopHistTimer();   // stop the countdown ticker when leaving History
  if (name === "history") renderHistory();
  if (name === "models") loadModels();
  if (name === "rag") openRag();
  if (name === "chat" && !q.disabled) q.focus();
}
for (const b of navBtns) b.addEventListener("click", () => showView(b.dataset.view));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePilot(); });
const openLocal = () => showView("local");
const openDscan = () => showView("dscan");

// ── Clipboard watch ─────────────────────────────────────────────────────
const localBtn = $("local-btn");
// Reflect the clipboard-watch state on the Local page toggle.
function setWatchUI(on) {
  localBtn.classList.toggle("p", on);
  localBtn.innerHTML = (on ? ic("clip", 14) : ic("pause", 14)) + `<span>${esc(on ? L.watchOn : L.watchOff)}</span>`;
  localBtn.title = on ? L.watchOnTitle : L.watchOffTitle;
  localBtn.setAttribute("aria-pressed", on ? "true" : "false");
}
async function refreshLocalBtn() { setWatchUI(await capsuleers.local.state()); }
// Audible cue for a detected Local: an app-played sound (not the OS toast,
// which Windows suppresses via Focus Assist while a game runs fullscreen), so
// you hear it even when gaming on another monitor. Primed on the toggle click
// (a user gesture) so the AudioContext is allowed to play later.
let _ac = null;
function primeAudio() { try { _ac = _ac || new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === "suspended") _ac.resume(); } catch { /* no audio */ } }
function localBeep() {
  try {
    primeAudio(); if (!_ac) return;
    const t = _ac.currentTime;
    for (const [i, f] of [[0, 880], [0.16, 1245]]) {  // two short rising tones
      const o = _ac.createOscillator(), g = _ac.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i);
      g.gain.exponentialRampToValueAtTime(0.3, t + i + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i + 0.16);
      o.connect(g).connect(_ac.destination);
      o.start(t + i); o.stop(t + i + 0.17);
    }
  } catch { /* audio not available */ }
}
localBtn.addEventListener("click", async () => { primeAudio(); await capsuleers.local.toggle(); refreshLocalBtn(); });
refreshLocalBtn();

// "Re-read clipboard": force an immediate check (Local or D-Scan). Buttons may be rebuilt → delegate.
document.addEventListener("click", (e) => {
  if (e.target.closest("#local-rescan, [data-scan]")) { primeAudio(); capsuleers.local.scan(); }
});

// In-app banner when a Local is detected (reliable even if the OS toast is missed).
const localBanner = $("local-banner");
const hideLocalBanner = () => { localBanner.hidden = true; };
capsuleers.local.onDetected(({ kind, count }) => {
  const isD = kind === "dscan";
  $("local-banner-text").textContent = isD ? L.dscanDetected(count) : L.localDetected(count);
  $("local-banner-show").textContent = isD ? L.dscanAnalyze : L.localShowIntel;
  localBanner.hidden = false;
  localBeep();
});
$("local-banner-show").addEventListener("click", () => { hideLocalBanner(); capsuleers.local.confirm(); });
$("local-banner-x").addEventListener("click", hideLocalBanner);
capsuleers.local.onStart(hideLocalBanner);          // local intel started → hide the banner
capsuleers.local.onDScanStart(hideLocalBanner);     // d-scan analysis started → hide the banner

// ── Rail counters ───────────────────────────────────────────────────────
// Active shared links (count shown in the rail).
async function refreshLinkCount() {
  let list = [];
  try { list = await capsuleers.local.history.list(); } catch { list = []; }
  const n = list.filter((e) => Number(typeof e.expiresAt === "string" ? Date.parse(e.expiresAt) : e.expiresAt) > Date.now()).length;
  $("nav-history-n").textContent = n ? String(n) : "";
  return list;
}

// ── Local intel from clipboard ──────────────────────────────────────────
const localBody = $("local-body");
const localSub = $("local-sub");
const localSummary = $("local-summary");
const localLh = $("local-lh");
const emptyBlock = (icon, h, p, steps) =>
  `<div class="empty">${ic(icon, 40)}<h2>${esc(h)}</h2><p>${esc(p)}</p>${steps || ""}` +
  `<button class="btn" type="button" data-scan>${ic("clip", 14)}${esc(L.btnReadNow)}</button></div>`;
function renderLocalEmpty() {
  localSummary.hidden = true; localLh.hidden = true; localSub.innerHTML = "";
  localBody.innerHTML = emptyBlock("users", L.localEmptyH, L.localEmptyP);
}
const RISK_COL = ["var(--cap-ink-3)", "var(--cap-ok)", "var(--cap-warn)", "var(--cap-crit)"];
const flagClass = (f) => /^(capital|bait|FC:High)/i.test(f) ? "crit" : /^FC:/i.test(f) ? "warn" : f === "logi" ? "fl" : "";
function localRow(r) {
  const a = document.createElement("div");
  const dg = Math.min(3, Math.max(0, num(r.danger)));
  a.className = "lr d" + dg;
  if (r.id) {
    a.setAttribute("role", "button"); a.tabIndex = 0;
    a.title = L.intelDetail;
    const go = () => openPilot({ id: r.id, name: r.name, danger: dg, window: r.window });
    a.addEventListener("click", go);
    a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  }
  const alliLogo = r.allianceId ? `<img class="lg" src="${IMG}/alliances/${num(r.allianceId)}/logo?size=32" alt="" title="${esc(r.allianceName || "")}" />` : `<span class="lg"></span>`;
  const corpLogo = r.corpId ? `<img class="lg" src="${IMG}/corporations/${num(r.corpId)}/logo?size=32" alt="" title="${esc(r.corpName || "")}" />` : `<span class="lg"></span>`;
  const portrait = r.id ? `<img class="av" src="${IMG}/characters/${num(r.id)}/portrait?size=64" alt="" width="34" height="34" />` : `<span class="av" style="width:34px;height:34px;"></span>`;
  const sub = `${alliLogo}${corpLogo}<span>${r.allianceTicker ? "&lt;" + esc(r.allianceTicker) + "&gt; " : ""}${esc(r.corpName || "")}</span>`;
  let kl;
  if (r.found) {
    const k = num(r.kills), l = num(r.losses), tot = k + l;
    const duel = tot
      ? `<span class="duel" role="img" aria-label="${k} / ${l}"><i style="width:${Math.round((k / tot) * 100)}%;background:var(--cap-ok);"></i><i style="flex:1;background:var(--cap-crit);margin-left:2px;"></i></span>`
      : `<span class="duel"><i style="flex:1;background:var(--cap-panel-2);"></i></span>`;
    kl = `<span class="num"><b style="color:var(--cap-ok);">${k}</b> <span class="mut">/</span> <b style="color:var(--cap-crit);">${l}</b>${r.window ? ` <span class="mut">· ${esc(L.windowDays(num(r.window)))}</span>` : ""}</span>${duel}`;
  } else {
    kl = `<span class="mut" title="${esc(L.notFound)}">${esc(L.notFound)}</span>`;
  }
  const tags = (r.flags || []).map((f) => `<span class="tag ${flagClass(f)}">${esc(f)}</span>`).join("");
  a.innerHTML =
    `<i class="rb" style="background:${RISK_COL[dg]};"></i>${portrait}` +
    `<span class="nm"><b${r.found ? "" : ' class="miss"'}>${esc(r.name)}</b><span class="sub">${sub}</span></span>` +
    `<span class="kl">${kl}</span><span class="tg">${tags}</span><span class="rk" style="color:${RISK_COL[dg]};">${esc(L.danger[dg])}</span>`;
  return a;
}

// Local scan summary: counts (alliances/corps/pilots/risk) + alliance composition (filter buttons)
function aggregateLocal(rows) {
  const allies = new Map();      // allianceName → { name, id, count }
  const corpKeys = new Set();    // unique "ally\0corp" pairs → corporation total
  for (const r of rows) {
    const name = r.allianceName || L.noAlliance;
    let a = allies.get(name);
    if (!a) { a = { name, id: r.allianceId || null, count: 0 }; allies.set(name, a); }
    a.count++;
    if (!a.id && r.allianceId) a.id = r.allianceId;
    corpKeys.add(name + "\u0000" + (r.corpName || L.unknownCorp));
  }
  const allies_ = [...allies.values()].sort((x, y) => y.count - x.count || x.name.localeCompare(y.name));
  return { allianceCount: allies_.length, corpCount: corpKeys.size, pilotCount: rows.length, allies: allies_ };
}
const COMP_COL = ["var(--cap-c1)", "var(--cap-c2)", "var(--cap-c3)", "var(--cap-c4)"];
// Alliance filter: the legend buttons narrow the pilot list to one alliance (keyed by the
// same name aggregateLocal groups on, so "No Alliance" filters too). Reset on every new scan.
let _localRows = [], _allyFilter = null;
const allyKey = (r) => r.allianceName || L.noAlliance;
function renderLocalRows() {
  const rows = _allyFilter == null ? _localRows : _localRows.filter((r) => allyKey(r) === _allyFilter);
  localBody.innerHTML = "";
  for (const r of rows) localBody.appendChild(localRow(r));
  const chips = localSummary.querySelector(".ach");
  if (chips) {
    chips.classList.toggle("filtering", _allyFilter != null);
    for (const b of chips.querySelectorAll("button")) {
      const on = b.dataset.ally === _allyFilter;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
}
localSummary.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-ally]");
  if (!b) return;
  _allyFilter = _allyFilter === b.dataset.ally ? null : b.dataset.ally;
  renderLocalRows();
  localBody.scrollTop = 0;
});
function renderLocalSummary(rows) {
  if (!rows || !rows.length) { localSummary.hidden = true; localLh.hidden = true; localSummary.innerHTML = ""; return; }
  const s = aggregateLocal(rows);
  const risky = rows.filter((r) => r.danger >= 2).length;
  const col = (i) => i < COMP_COL.length ? COMP_COL[i] : "var(--cap-ink-3)";
  const bars = s.allies.map((a, i) => `<i style="flex:${num(a.count)};background:${col(i)};"></i>`).join("");
  const legend = s.allies.map((a, i) => {
    const logo = a.id ? `<img class="lg" src="${IMG}/alliances/${num(a.id)}/logo?size=32" alt="" />` : "";
    return `<button type="button" data-ally="${esc(a.name)}" aria-pressed="false" title="${esc(a.name)}"><i class="sw" style="background:${col(i)};"></i>${logo}${esc(a.name)} <b class="num">${num(a.count)}</b></button>`;
  }).join("");
  localSummary.innerHTML =
    `<div class="sum"><div class="big">` +
      `<div class="k"><b class="num">${num(s.allianceCount)}</b><span>${esc(L.alliancesLabel)}</span></div>` +
      `<div class="k"><b class="num">${num(s.corpCount)}</b><span>${esc(L.corporationsLabel)}</span></div>` +
      `<div class="k"><b class="num">${num(s.pilotCount)}</b><span>${esc(L.pilotsLabel)}</span></div>` +
      `<div class="k"><b class="num crit">${num(risky)}</b><span>${esc(L.riskHighMed)}</span></div></div>` +
    `<div class="dw"><span class="lab">${esc(L.compAlliance)}</span><div class="dist" style="margin-top:10px;">${bars}</div><div class="ach">${legend}</div></div></div>`;
  localSummary.hidden = false; localLh.hidden = false;
}

capsuleers.local.onStart(({ total }) => {
  openLocal();
  localSummary.hidden = true; localLh.hidden = true;
  _localRows = []; _allyFilter = null;
  localSub.innerHTML = `<span>${esc(L.localResolving(total))}</span>`;
  localBody.innerHTML = `<div class="lprog">${esc(L.loadingIntel)} <span id="lp">0</span>/${num(total)}<div class="bar"><i id="lpbar"></i></div></div>`;
});
capsuleers.local.onProgress(({ done, total }) => {
  const lp = $("lp"), bar = $("lpbar");
  if (lp) lp.textContent = done;
  if (bar) bar.style.width = Math.round((done / total) * 100) + "%";
});
capsuleers.local.onResult((res) => {
  openLocal();
  if (res.error) { localSummary.hidden = true; localLh.hidden = true; localBody.innerHTML = `<div class="lprog">⚠ ${esc(res.error)}</div>`; return; }
  const high = res.rows.filter((r) => r.danger >= 2).length;
  localSub.innerHTML = `<span><b class="num">${num(res.rows.length)}</b>${esc(L.pilotsNoun)}</span>` +
    (high ? `<span><b class="num crit">${num(high)}</b>${esc(L.dangerNoun)}</span>` : "") +
    (res.capped ? `<span>${esc(L.resolvedOf(res.resolved, res.total))}</span>` : "");
  $("nav-local-n").textContent = String(res.rows.length);
  renderLocalSummary(res.rows);
  _localRows = res.rows; _allyFilter = null;
  renderLocalRows();
});

// ── Share the intel + history of generated links ────────────────────────
const histPanel = $("local-history");  // content of the history view
// NB: labels are set lazily (in onResult, below) — they depend on `L`.
let _lastShareUrl = null, _histTimer = null;
function stopHistTimer() { if (_histTimer) { clearInterval(_histTimer); _histTimer = null; } }

// Human "23h 59m" / "12m 30s" / "45s" remaining; null when past/invalid.
function fmtRemain(expMs) {
  let s = Math.floor((Number(expMs) - Date.now()) / 1000);
  if (!Number.isFinite(s) || s <= 0) return null;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
// One share flow for both Local and D-Scan (same DOM shape, different ids / IPC).
function wireShare(p, invoke) {
  const btn = $(p + "-share"), label = $(p + "-share-label"), out = $(p + "-share-out");
  const msg = $(p + "-share-msg"), urlEl = $(p + "-share-url"), expEl = $(p + "-share-exp"), copyBtn = $(p + "-share-copy");
  let last = null;
  const clearOut = () => { msg.textContent = ""; urlEl.textContent = ""; urlEl.removeAttribute("href"); expEl.textContent = ""; copyBtn.hidden = true; };
  const reset = () => { out.hidden = true; out.classList.remove("err", "pending"); btn.hidden = true; };
  const offer = () => { btn.hidden = false; btn.disabled = false; label.textContent = L.shareBtn; btn.title = L.shareTitle; copyBtn.textContent = L.shareCopy; };
  btn.addEventListener("click", async () => {
    btn.disabled = true; label.textContent = L.sharing;
    // Show the share row immediately with a "processing" placeholder until the server replies.
    out.classList.remove("err"); out.classList.add("pending");
    clearOut(); msg.textContent = L.shareProcessing; out.hidden = false;
    let r;
    try { r = await invoke(); } catch (e) { r = { error: e.message }; }
    btn.disabled = false; label.textContent = L.shareBtn;
    out.classList.remove("pending");
    if (!r || r.error) { out.classList.add("err"); clearOut(); msg.textContent = L.shareErr; out.hidden = false; return; }
    last = r.url;
    msg.textContent = L.shareCopied;
    { const u = safeUrl(r.url); urlEl.textContent = u; if (u) urlEl.href = u; else urlEl.removeAttribute("href"); }
    const rem = fmtRemain(typeof r.expiresAt === "string" ? Date.parse(r.expiresAt) : r.expiresAt);
    expEl.textContent = rem ? L.shareExpires(rem) : "";
    copyBtn.hidden = false; copyBtn.textContent = L.shareCopy;
    out.hidden = false;
    refreshLinkCount();
    if (currentView === "history") renderHistory();   // keep an open history list fresh
  });
  copyBtn.addEventListener("click", () => {
    if (!last) return;
    capsuleers.clipboard.write(last);
    copyBtn.textContent = L.shareCopiedShort;
    setTimeout(() => { copyBtn.textContent = L.shareCopy; }, 1400);
  });
  $(p + "-share-x").addEventListener("click", () => { out.hidden = true; });
  return { reset, offer };
}
const localShare = wireShare("local", () => capsuleers.local.share());
capsuleers.local.onStart(localShare.reset);
capsuleers.local.onResult((res) => {
  if (res && !res.error && Array.isArray(res.rows) && res.rows.some((r) => r.id)) localShare.offer();
});

function tickHistCountdowns() {
  let anyLive = false;
  for (const el of histPanel.querySelectorAll(".lh-exp[data-exp]")) {
    const left = Number(el.dataset.exp) - Date.now();
    const rem = fmtRemain(el.dataset.exp);
    if (rem) {
      anyLive = true; el.textContent = rem;
      el.classList.toggle("soon", left < 3600000);
      const bar = el.parentElement.querySelector(".bar i");
      if (bar) bar.style.width = Math.max(0, Math.min(100, Math.round(left / 864000))) + "%";   // of 24 h
    } else { el.closest(".lh-row")?.remove(); }   // expired mid-view → drop the row
  }
  if (!anyLive) renderHistory();   // list emptied → re-render the empty state
}

async function renderHistory() {
  const list = await refreshLinkCount();
  stopHistTimer();
  $("history-clear").hidden = !list.length;
  const head = `<div class="big" style="margin-bottom:22px;"><div class="k"><b class="num">${list.length}</b><span>${esc(L.activeLinks)}</span></div>` +
    `<div class="k"><b class="num">24 h</b><span>${esc(L.linkLifetime)}</span></div></div>`;
  if (!list.length) {
    histPanel.innerHTML = head + `<div class="mut" style="font-size:13px;">${esc(L.historyEmpty)}</div>`;
    return;
  }
  const rows = list.map((e) => {
    const when = new Date(e.createdAt).toLocaleString(SYS_LANG === "it" ? "it-IT" : "en-GB",
      { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const kind = e.kind || "intel";
    const count = e.count ?? e.pilotCount;   // back-compat with pre-kind entries
    const label = count != null ? (kind === "dscan" ? L.objectsShort(count) : L.pilotsShort(count)) : "";
    const exp = num(typeof e.expiresAt === "string" ? Date.parse(e.expiresAt) : e.expiresAt);
    return `<tr class="lh-row" data-url="${esc(safeUrl(e.url))}"><td><span class="tag${kind === "dscan" ? " fl" : ""}">${esc(kind === "dscan" ? L.dscanShort : L.intelShort)}</span></td>` +
      `<td style="color:var(--cap-ink);">${esc(label)}</td><td class="mut num">${esc(when)}</td>` +
      `<td style="width:220px;"><span class="lh-bar"><span class="bar"><i style="width:0;background:var(--cap-ok);"></i></span><span class="lh-exp num" data-exp="${exp}"></span></span></td>` +
      `<td class="r"><span class="lh-act"><button class="btn s lh-open" type="button">${ic("ext", 13)}${esc(L.shareOpen)}</button>` +
      `<button class="ib lh-copy" type="button" aria-label="${esc(L.copyLink)}" title="${esc(L.copyLink)}">${ic("copy", 14)}</button></span></td></tr>`;
  }).join("");
  histPanel.innerHTML = head +
    `<table class="t"><thead><tr><th>${esc(L.colType)}</th><th>${esc(L.colContent)}</th><th>${esc(L.colCreated)}</th><th>${esc(L.colValidity)}</th><th class="r">${esc(L.colActions)}</th></tr></thead><tbody>${rows}</tbody></table>`;
  for (const row of histPanel.querySelectorAll(".lh-row")) {
    row.querySelector(".lh-open")?.addEventListener("click", () => {
      const u = safeUrl(row.dataset.url); if (u) window.open(u, "_blank");   // opens in the system browser
    });
    row.querySelector(".lh-copy")?.addEventListener("click", () => {
      const u = safeUrl(row.dataset.url); if (!u) return;
      capsuleers.clipboard.write(u);
      const b = row.querySelector(".lh-copy");
      b.innerHTML = ic("check", 14); setTimeout(() => { b.innerHTML = ic("copy", 14); }, 1400);
    });
  }
  tickHistCountdowns();
  _histTimer = setInterval(tickHistCountdowns, 1000);
}
$("history-clear").addEventListener("click", async () => {
  try { await capsuleers.local.history.clear(); } catch { /* */ }
  renderHistory();
});

// ── D-Scan analysis ─────────────────────────────────────────────────────
const dscanBody = $("dscan-body");
const dscanSub = $("dscan-sub");
const dsShare = wireShare("dscan", () => capsuleers.local.shareDScan());
capsuleers.local.onDScanStart(dsShare.reset);   // reset on a fresh analysis
const dsCat = (name) => (L.dscanCats && L.dscanCats[name]) || name;
function renderDscanEmpty() {
  dscanSub.innerHTML = "";
  const steps = [[L.dsS1H, L.dsS1T], [L.dsS2H, L.dsS2T], [L.dsS3H, L.dsS3T]]
    .map(([h, t], i) => `<div class="stp"><span class="n">${i + 1}</span><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join("");
  dscanBody.innerHTML = emptyBlock("radar", L.dsEmptyH, L.dsEmptyP, `<div class="stps">${steps}</div>`);
}
capsuleers.local.onDScanStart(({ total }) => {
  openDscan();
  dscanSub.innerHTML = `<span>${esc(L.dscanResolving(total))}</span>`;
  dscanBody.innerHTML = `<div class="lprog">${esc(L.dscanAnalyzing)}</div>`;
});
capsuleers.local.onDScanResult((res) => {
  openDscan();
  if (!res || res.error) {
    dscanSub.innerHTML = "";
    dscanBody.innerHTML = `<div class="lprog">⚠ ${esc(res?.error || L.noData)}</div>`;
    return;
  }
  dscanSub.innerHTML = `<span><b class="num">${num(res.total)}</b>${esc(L.dscanEntNoun)}</span>` +
    (res.system ? `<span>${esc(L.dscanSystem)} <b style="font-size:14px;">${esc(res.system)}</b></span>` : "");
  $("nav-dscan-n").textContent = String(num(res.total));
  const caps = res.shipClasses.filter((c) => c.capital).reduce((n, c) => n + num(c.count), 0);
  const tile = (n, label, cls) => `<div class="k"><b class="num${cls ? " " + cls : ""}">${num(n)}</b><span>${esc(label)}</span></div>`;
  const tiles = tile(res.shipUnits, L.dscanShips) + tile(caps, L.dsCapitals, "crit") +
    res.other.map((o) => tile(o.count, dsCat(o.name))).join("");
  const mx = Math.max(1, ...res.shipClasses.map((c) => num(c.count)));
  const classes = res.shipClasses.map((c) => {
    const cap = !!c.capital;
    return `<div class="cr"><span${cap ? ' style="color:var(--cap-crit);font-weight:700;"' : ""}>${esc(c.cls)}</span>` +
      `<span class="bar"><i style="width:${Math.round((num(c.count) / mx) * 100)}%;background:${cap ? "var(--cap-crit)" : "var(--cap-accent)"};"></i></span>` +
      `<b class="num"${cap ? ' style="color:var(--cap-crit);"' : ""}>${num(c.count)}</b></div>`;
  }).join("");
  const ships = res.ships.map((s) =>
    `<div class="sr"><img loading="lazy" alt="" src="${IMG}/types/${num(s.typeId)}/icon?size=64"><span>${esc(s.name)}</span><b class="num">×${num(s.count)}</b></div>`).join("");
  dscanBody.innerHTML = (res.shipClasses.length || res.ships.length || res.other.length)
    ? `<div class="sec first"><div class="big">${tiles}</div></div>` +
      `<div class="sec" style="margin-top:22px;flex:1;min-height:0;display:flex;flex-direction:column;"><div class="ds">` +
      `<div><div class="sh"><h2>${esc(L.dscanShipClasses)}</h2><span>${esc(L.dsClasses(res.shipClasses.length))}</span></div>${classes}</div>` +
      `<div><div class="sh"><h2>${esc(L.dscanShips)}</h2><span>${esc(L.dsShipsSub(num(res.shipUnits), res.ships.length))}</span></div><div class="shg">${ships}</div></div>` +
      `</div></div>`
    : `<div class="mut" style="padding:22px 0;font-style:italic;">${esc(L.dscanNone)}</div>`;
  // Offer sharing once we have a real breakdown.
  if (res.total > 0) dsShare.offer();
});

// ── Pilot dossier (right-side drawer over the active view) ──────────────
const pilotOv = $("pilot");
const pilotCard = $("pilot-card");
function closePilot() { pilotOv.classList.remove("open"); }
pilotOv.addEventListener("click", (e) => { if (e.target === pilotOv) closePilot(); });
const closeBtn = () => `<button class="ib" type="button" data-close aria-label="${esc(L.closeDossier)}" title="${esc(L.closeDossier)}" style="align-self:flex-start;">${ic("x", 14)}</button>`;
async function openPilot(who) {
  pilotOv.classList.add("open");
  pilotCard.innerHTML = `<div class="dr-h"><div class="dr-id"><span class="lab">${esc(L.dossier)}</span><h2>${esc(who.name || "")}</h2></div>${closeBtn()}</div>` +
    `<div class="dr-msg">${esc(L.loadingIntelOf(who.name || ""))}</div>`;
  pilotCard.querySelector("[data-close]").addEventListener("click", closePilot);
  let d;
  try { d = await capsuleers.local.detail(who); } catch (e) { d = { error: e.message }; }
  if (!pilotOv.classList.contains("open")) return;   // closed while loading
  if (!d || d.error) {
    pilotCard.innerHTML = `<div class="dr-h"><div class="dr-id"><span class="lab">${esc(L.dossier)}</span><h2>${esc(who.name || "")}</h2></div>${closeBtn()}</div>` +
      `<div class="dr-msg">⚠ ${esc(d?.error || L.noData)}</div>`;
    pilotCard.querySelector("[data-close]").addEventListener("click", closePilot);
    return;
  }
  renderPilot(d, who);
}

function renderPilot(d, who) {
  const p = d.play || {}; const tot = Math.max(1, num(p.solo) + num(p.small) + num(p.fleet));
  const pct = (v) => Math.round((num(v) / tot) * 100);
  const dg = who && who.danger != null ? Math.min(3, Math.max(0, num(who.danger))) : (d.danger != null ? Math.min(3, Math.max(0, num(d.danger))) : null);
  const org = (kind, id, name) => name
    ? `<span class="dr-o">${id ? `<img class="lg" src="${IMG}/${kind}/${num(id)}/logo?size=32" alt="" />` : ""}<span>${esc(name)}</span></span>` : "";
  const tags = [];
  if (d.capital_pilot) tags.push(`<span class="tag crit">capital</span>`);
  if (d.fc) tags.push(`<span class="tag ${/high/i.test(d.fc) ? "crit" : "warn"}">FC:${esc(d.fc)}</span>`);
  if (d.is_logi) tags.push(`<span class="tag fl">logi</span>`);
  if (d.bait) tags.push(`<span class="tag crit">bait:${esc(d.bait)}</span>`);
  if (dg) tags.push(`<span class="tag ${["", "ok", "warn", "crit"][dg]}">${esc(L.riskWord)} ${esc(L.danger[dg])}</span>`);
  let ring = "";
  if (d.eff != null) {
    const R = 30, C = 2 * Math.PI * R, eff = Math.max(0, Math.min(100, num(d.eff)));
    ring = `<span class="ring" style="width:76px;height:76px;" role="img" aria-label="${esc(L.statEff)} ${eff}%"><svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--cap-crit)" stroke-width="7"/><circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--cap-ok)" stroke-width="7" stroke-dasharray="${(C * eff / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 38 38)"/></svg><b class="num">${eff}%</b></span>`;
  }
  const stat = (v, label, color) => `<div class="k"><b class="num"${color ? ` style="color:${color};"` : ""}>${v}</b><span>${esc(label)}</span></div>`;
  const stats = `<div class="dr-k">${ring}<div class="big" style="gap:26px;">` +
    stat(d.kills != null ? num(d.kills) : "?", L.statKills, "var(--cap-ok)") +
    stat(d.losses != null ? num(d.losses) : "?", L.statLoss, "var(--cap-crit)") +
    (who && who.window ? stat(esc(L.windowDays(num(who.window))), L.statWindow) : "") + `</div></div>`;
  const style = tot > 0 && (p.solo || p.small || p.fleet)
    ? `<div><span class="lab">${esc(L.playStyle)}</span><div class="dist" style="margin-top:9px;">` +
      `<i style="flex:${num(p.solo)};background:var(--cap-c3);"></i><i style="flex:${num(p.small)};background:var(--cap-c2);"></i><i style="flex:${num(p.fleet)};background:var(--cap-c1);"></i></div>` +
      `<div class="ach" style="margin-top:8px;"><span><i class="sw" style="background:var(--cap-c3);"></i>${esc(L.psSolo)} <b class="num">${pct(p.solo)}%</b></span>` +
      `<span><i class="sw" style="background:var(--cap-c2);"></i>${esc(L.psSmall)} <b class="num">${pct(p.small)}%</b></span>` +
      `<span><i class="sw" style="background:var(--cap-c1);"></i>${esc(L.psFleet)} <b class="num">${pct(p.fleet)}%</b></span></div></div>` : "";
  const list = (arr, mkImg, go) => {
    const mx = Math.max(1, ...arr.map((x) => num(x.count)));
    return arr.map((x) => `<div class="dr-r${go ? " go" : ""}"${go ? ` role="button" tabindex="0" data-pilot="${num(x.id)}" data-name="${esc(x.name)}"` : ""}>${mkImg(x)}<span>${esc(x.name)}</span>` +
      `<span class="bar" style="width:90px;"><i style="width:${Math.round((num(x.count) / mx) * 100)}%;background:var(--cap-ink-3);"></i></span><b class="num">${num(x.count)}</b></div>`).join("");
  };
  const partners = (d.partners || []).length
    ? `<div><span class="lab">${esc(L.fliesWith)}</span><div style="margin-top:6px;">${list(d.partners, (x) => `<img class="av" src="${IMG}/characters/${num(x.id)}/portrait?size=32" alt="" width="26" height="26" />`, true)}</div></div>` : "";
  const ships = (d.ships || []).length
    ? `<div><span class="lab">${esc(L.recentShips)}</span><div style="margin-top:6px;">${list(d.ships, (s) => `<img src="${IMG}/types/${num(s.id)}/icon?size=32" alt="" width="26" height="26" />`, false)}</div></div>` : "";

  pilotCard.innerHTML =
    `<div class="dr-h"><img class="dr-p" src="${IMG}/characters/${num(d.id)}/portrait?size=128" alt="" /><div class="dr-id"><span class="lab">${esc(L.dossier)}</span><h2>${esc(d.name)}</h2>` +
      org("alliances", d.allianceId, d.allianceName) + org("corporations", d.corpId, d.corpName) +
      (tags.length ? `<span class="dr-t">${tags.join("")}</span>` : "") + `</div>${closeBtn()}</div>` +
    `<div class="dr-s">${stats}${style}${partners}${ships}</div>` +
    `<div class="dr-f"><button class="btn" type="button" data-url="https://capsuleers.app/${SYS_LANG}/character/${num(d.id)}" title="${esc(L.titleOverview)}">${ic("ext", 14)}${esc(L.lblOverview)}</button>` +
    `<button class="btn" type="button" data-url="https://eve-kill.com/character/${num(d.id)}" title="${esc(L.titlePvp)}">${ic("target", 14)}${esc(L.lblPvp)}</button></div>`;

  pilotCard.querySelector("[data-close]").addEventListener("click", closePilot);
  // Opens external links in the system browser (overview on capsuleers.app, PvP on eve-kill.com).
  for (const a of pilotCard.querySelectorAll("[data-url]")) {
    a.addEventListener("click", () => { const u = safeUrl(a.dataset.url); if (u) window.open(u, "_blank"); });
  }
  // Click on a partner → opens their detail (drill-down).
  for (const c of pilotCard.querySelectorAll("[data-pilot]")) {
    const go = () => openPilot({ id: Number(c.dataset.pilot), name: c.dataset.name });
    c.addEventListener("click", go);
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  }
}



// Copy button on fit blockquotes (delegated: blocks are injected via innerHTML).
chat.addEventListener("click", (e) => {
  const btn = e.target.closest(".fit-copy");
  if (!btn) return;
  const pre = btn.parentElement.querySelector("pre");
  if (!pre) return;
  window.capsuleers.clipboard.write(pre.textContent);
  const span = btn.querySelector("span");
  btn.classList.add("done");
  if (span) span.textContent = L.fitCopied;
  clearTimeout(btn._t);
  btn._t = setTimeout(() => { btn.classList.remove("done"); if (span) span.textContent = L.fitCopy; }, 1400);
});

// Applies the static strings to elements marked with data-i18n[-title|-html|-ph|-aria].
function applyStaticI18n() {
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = L[el.dataset.i18n];
  for (const el of document.querySelectorAll("[data-i18n-html]")) el.innerHTML = L[el.dataset.i18nHtml];
  for (const el of document.querySelectorAll("[data-i18n-title]")) el.title = L[el.dataset.i18nTitle];
  for (const el of document.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", L[el.dataset.i18nAria]);
  for (const el of document.querySelectorAll("[data-i18n-ph]")) el.placeholder = L[el.dataset.i18nPh];
}
applyStaticI18n();

// Enforce a minimum window width so the titlebar never wraps. Measured from the
// titlebar's natural content width and pushed to main, which clamps it to the screen.
function headerMinWidth() {
  const header = document.querySelector("header");
  if (!header) return 0;
  const cs = getComputedStyle(header);
  const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
  const kids = Array.from(header.children);
  let w = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + gap * Math.max(0, kids.length - 1);
  for (const el of kids) w += el.getBoundingClientRect().width;
  return Math.ceil(w + 10);   // small breathing buffer
}
let _minWT = null;
function pushMinWidth() {
  clearTimeout(_minWT);
  _minWT = setTimeout(() => { const w = headerMinWidth(); if (w > 200) capsuleers.win.setMinWidth(w); }, 120);
}
pushMinWidth();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(pushMinWidth);

// ── Welcome (empty chat) ─────────────────────────────────────────────────
let idxCount = null;   // documents in the index, known after the engine is ready
function showWelcome() {
  $("chat-lede").textContent = L.chatLede;
  const groups = L.wlGroups.map(([t, qs]) =>
    `<div class="c"><span class="lab">${esc(t)}</span>${qs.map((s) => `<button type="button" data-ask="${esc(s)}">${ic("arrow", 13)}<span>${esc(s)}</span></button>`).join("")}</div>`).join("");
  const b = bubble("bot");
  b.style.cssText = "gap:16px;margin-top:24px;";
  b.innerHTML +=
    `<h2 style="font-size:26px;font-weight:700;text-transform:uppercase;color:var(--cap-ink);">${L.wlH.replace("<span>", '<span style="color:var(--cap-accent-txt);">')}</h2>` +
    `<p style="max-width:640px;">${esc(L.wlP)}</p>` +
    `<div class="big" style="gap:36px;margin:6px 0 8px;"><div class="k"><b class="num" id="wl-docs">${idxCount != null ? esc(idxCount.toLocaleString()) : "—"}</b><span>${esc(L.wlDocs)}</span></div>` +
    `<div class="k"><b class="num">${SLASH_CMDS.length}</b><span>${esc(L.wlCmds)}</span></div>` +
    `<div class="k"><b style="color:var(--cap-ok);">${esc(L.wlLive)}</b><span>${esc(L.wlLiveSub)}</span></div></div>` +
    `<div class="wl">${groups}</div>`;
}
chatCol.addEventListener("click", (e) => {
  const b = e.target.closest("[data-ask]");
  if (!b || q.disabled) return;
  q.value = b.dataset.ask; q.focus(); caretToEnd();
});

// New conversation (resets history + chat)
$("new-chat").addEventListener("click", () => {
  showView("chat");
  capsuleers.reset();
  chatCol.innerHTML = "";
  showWelcome();
  if (!q.disabled) q.focus();
});

// Status from the engine arrives structured (object {k:…}); here we localize it.
function formatStatus(s) {
  if (typeof s === "string") return s;
  if (!s || !s.k) return "";
  if (s.k === "index") return L.stIndex;
  if (s.k === "models") return L.stModels(s.count);
  if (s.k === "loadingModel") return L.stLoadingModel(s.model);
  if (s.k === "ready") return L.stReady(s);
  return "";
}
let ready = false;
const statusChip = $("status");
function setModelName(name) {
  if (!name) return;
  $("st-model").textContent = name; $("st-model").title = name;
  $("model-btn-label").textContent = name;
}
capsuleers.onStatus((s) => {
  const t = formatStatus(s);
  statusText.textContent = t; statusChip.title = t;
  if (s && s.k === "ready") {
    setModelName(s.model);
    statusChip.classList.toggle("warn", !!(s.gpu && !s.onGpu));
  }
  pushMinWidth();
});
capsuleers.onReady((info) => {
  ready = true;
  idxCount = info.count;
  statusText.textContent = L.chipOnline; statusChip.classList.remove("warn"); statusChip.classList.add("ok");
  const gpu = (info.gpu || "cpu").toUpperCase();
  const gc = $("gpu-chip"); gc.textContent = L.chipGpu(gpu); gc.hidden = false;
  $("st-gpu").textContent = gpu;
  $("st-index").textContent = idxCount.toLocaleString() + " " + (SYS_LANG === "it" ? "doc" : "docs");
  const wd = $("wl-docs"); if (wd) wd.textContent = idxCount.toLocaleString();
  q.disabled = false; send.disabled = false;
  if (currentView === "chat") q.focus();
  pushMinWidth();
});




let current = null, body = null;
capsuleers.onToken((t) => { if (body) { body.textContent += t; chat.scrollTop = chat.scrollHeight; } });

// Input history recall with ↑/↓ (shell / ChatGPT style).
const inputHistory = [];   // submitted questions, oldest → newest
let histPos = 0;           // 0 = live draft; N = N-th entry from the end
let qDraft = "";           // the live input, saved while navigating history
const caretToEnd = () => { const n = q.value.length; q.setSelectionRange(n, n); };

// ── Slash commands ──────────────────────────────────────────────────────
// Friendly shortcuts that EXPAND into the natural-language prompt the engine already
// understands. `i` = inserted text (a lead-in ending in a space takes an argument); `a`
// = the argument hint shown in the menu. Typing "/" opens the menu; it filters as you type.
const SLASH = {
  it: [
    { c: "dottrine", d: "Dottrine/fit dominanti di un'alleanza o corp", i: "dottrine di ", a: "<corp/alleanza>" },
    { c: "fit", d: "Cerca un fit della community per una nave", i: "voglio un fit per ", a: "<nave> [pvp/pve…]" },
    { c: "come-fitta", d: "Come fitta una nave uno specifico pilota (dalle loss recenti)", i: "come fitta ", a: "<pilota> la <nave>" },
    { c: "specifiche", d: "Statistiche + EFT di un fit dalla lista/dottrina", i: "specifiche del #", a: "<N>" },
    { c: "chi-è", d: "Intel su pilota / corp / alleanza", i: "chi è ", a: "<nome>" },
    { c: "vola-con", d: "Compagni di volo abituali", i: "con chi vola ", a: "<pilota>" },
    { c: "prede", d: "Chi uccide più spesso (le sue prede)", i: "prede di ", a: "<entità>" },
    { c: "cacciatori", d: "Chi lo uccide più spesso", i: "chi uccide ", a: "<entità>" },
    { c: "caccia", d: "Sistemi di caccia preferiti", i: "dove caccia ", a: "<pilota>" },
    { c: "efficienza", d: "K:D, ISK ratio, solo rate, fasce orarie", i: "efficienza di ", a: "<entità>" },
    { c: "panoramica", d: "Riepilogo killboard (kill/perdite, ISK, top navi)", i: "panoramica di ", a: "<entità>" },
    { c: "classifica", d: "Top sistemi/regioni/navi/alleanze", i: "top sistemi di ", a: "<entità>" },
    { c: "navi", d: "Navi più usate", i: "che navi usa ", a: "<entità>" },
    { c: "battaglie", d: "Ultime battaglie (per ISK distrutti)", i: "ultime battaglie" },
    { c: "report-battaglia", d: "Recap di una battaglia per ID", i: "report battaglia ", a: "<id>" },
    { c: "kill-costosi", d: "Kill più costosi (ultimi 30 giorni)", i: "kill più costosi" },
    { c: "ultimi-kill", d: "Ultimi kill di un'entità", i: "ultimi kill di ", a: "<entità>" },
    { c: "killmail", d: "Analizza un killmail (link o ID)", i: "analizza il killmail ", a: "<link/id>" },
    { c: "guerra", d: "Scontro testa a testa (X vs Y)", i: "guerra tra ", a: "<X> e <Y>" },
    { c: "rotta", d: "Rotta sicura con pericolosità per salto", i: "rotta sicura da ", a: "<X> a <Y>" },
    { c: "sistema", d: "Pericolosità/attività di un sistema", i: "quanto è pericoloso ", a: "<sistema>" },
    { c: "meta", d: "Meta del momento (fit/dottrine più diffusi)", i: "qual è la meta del momento" },
    { c: "coalizioni", d: "Grafo coalizioni (alleati/nemici)", i: "coalizioni" },
    { c: "prezzo", d: "Prezzo di riferimento di un oggetto", i: "prezzo di ", a: "<oggetto>" },
    { c: "thera", d: "Collegamento Thera/Turnur più vicino", i: "collegamento Thera più vicino a ", a: "<sistema>" },
  ],
  en: [
    { c: "doctrines", d: "Dominant doctrines/fits of an alliance or corp", i: "doctrines of ", a: "<corp/alliance>" },
    { c: "fit", d: "Search a community fit for a ship", i: "I want a fit for ", a: "<ship> [pvp/pve…]" },
    { c: "pilot-fit", d: "How a specific pilot fits a ship (from recent losses)", i: "how does ", a: "<pilot> fit the <ship>" },
    { c: "specs", d: "Stats + EFT of a fit from the list/doctrine", i: "specs of #", a: "<N>" },
    { c: "who-is", d: "Intel on pilot / corp / alliance", i: "who is ", a: "<name>" },
    { c: "flies-with", d: "Frequent wingmates", i: "who flies with ", a: "<pilot>" },
    { c: "prey", d: "Who they kill most (their prey)", i: "who does ", a: "<entity> prey on" },
    { c: "hunters", d: "Who kills them most", i: "who hunts ", a: "<entity>" },
    { c: "hunts", d: "Preferred hunting systems", i: "where does ", a: "<entity> hunt" },
    { c: "efficiency", d: "K:D, ISK ratio, solo rate, activity", i: "efficiency of ", a: "<entity>" },
    { c: "overview", d: "Killboard overview (kills/losses, ISK, top ships)", i: "overview of ", a: "<entity>" },
    { c: "top", d: "Top systems/regions/ships/alliances", i: "top systems of ", a: "<entity>" },
    { c: "ships", d: "Most flown ships", i: "what ships does ", a: "<entity> use" },
    { c: "battles", d: "Recent battles (by ISK destroyed)", i: "recent battles" },
    { c: "battle-report", d: "Recap of a battle by ID", i: "battle report ", a: "<id>" },
    { c: "expensive-kills", d: "Most expensive kills (last 30 days)", i: "most expensive kills" },
    { c: "recent-kills", d: "Recent kills of an entity", i: "recent kills of ", a: "<entity>" },
    { c: "killmail", d: "Analyze a killmail (link or ID)", i: "analyze killmail ", a: "<link/id>" },
    { c: "war", d: "Head-to-head (X vs Y)", i: "war between ", a: "<X> and <Y>" },
    { c: "route", d: "Safe route with per-hop danger", i: "safe route from ", a: "<X> to <Y>" },
    { c: "system", d: "Danger/activity of a system", i: "how dangerous is ", a: "<system>" },
    { c: "meta", d: "Current meta (most common fits/doctrines)", i: "what's the meta right now" },
    { c: "coalitions", d: "Coalition graph (allies/enemies)", i: "coalitions" },
    { c: "price", d: "Reference price of an item", i: "price of ", a: "<item>" },
    { c: "thera", d: "Closest Thera/Turnur connection", i: "closest Thera connection to ", a: "<system>" },
  ],
};
const SLASH_CMDS = SLASH[SYS_LANG] || SLASH.en;
const slashEl = document.getElementById("slash");
let slashItems = [], slashIdx = 0;
const slashVisible = () => !slashEl.hidden;
function hideSlash() { slashEl.hidden = true; slashItems = []; }
function renderSlash() {
  slashEl.innerHTML = `<div class="sh2"><span class="lab">${esc(L.slashHeader)} · ${esc(q.value)}</span><span class="mut">${esc(L.slashHelp)}</span></div>` +
    slashItems.map((c, n) =>
    `<div class="scmd${n === slashIdx ? " sel" : ""}" role="option" data-i="${n}">`
    + `<span class="sc-cmd">/${esc(c.c)}</span>`
    + `<span class="sc-desc">${esc(c.d)}</span><span class="sc-arg">${esc(c.a || "")}</span></div>`).join("");
  slashEl.hidden = !slashItems.length;
  const sel = slashEl.querySelector(".scmd.sel");
  if (sel) sel.scrollIntoView({ block: "nearest" });
}
// Show the menu only while the whole draft is a bare "/token" (before any argument).
function updateSlash() {
  const m = q.value.match(/^\/([\p{L}\-]*)$/u);
  if (!m) return hideSlash();
  const t = m[1].toLowerCase();
  slashItems = SLASH_CMDS.filter((c) => c.c.includes(t) || c.d.toLowerCase().includes(t))
    .sort((a, b) => (b.c.startsWith(t) ? 1 : 0) - (a.c.startsWith(t) ? 1 : 0));
  slashIdx = 0;
  renderSlash();
}
function applySlash(item) {
  if (!item) return;
  q.value = item.i; hideSlash(); q.focus(); caretToEnd();
}
// Expand a submitted "/cmd args" into its natural-language prompt (no-op otherwise).
function expandSlash(text) {
  const m = text.match(/^\/([\p{L}\-]+)\s*([\s\S]*)$/u);
  if (!m) return text;
  const cmd = SLASH_CMDS.find((c) => c.c === m[1].toLowerCase());
  if (!cmd) return text;
  const arg = m[2].trim();
  return cmd.i.endsWith(" ") ? (cmd.i + arg).trim() : cmd.i;
}
q.addEventListener("input", updateSlash);
q.addEventListener("blur", () => setTimeout(hideSlash, 120));   // let a click register first
slashEl.addEventListener("mousedown", (e) => {                  // mousedown: fire before blur
  const row = e.target.closest(".scmd"); if (!row) return;
  e.preventDefault(); applySlash(slashItems[Number(row.dataset.i)]);
});

async function askNow() {
  hideSlash();
  const text = expandSlash(q.value.trim());   // "/dottrine X" → "dottrine di X"
  if (!text) return;
  if (inputHistory[inputHistory.length - 1] !== text) inputHistory.push(text);  // recall with ↑/↓
  if (inputHistory.length > 100) inputHistory.shift();
  histPos = 0; qDraft = "";
  q.value = ""; q.disabled = true; send.disabled = true;
  bubble("user").textContent = text;
  current = bubble("bot");
  body = document.createElement("div");
  body.className = "md stream";
  current.appendChild(body);
  $("chat-lede").textContent = text.length > 90 ? text.slice(0, 90) + "…" : text;
  const res = await capsuleers.ask(text);
  body.classList.remove("stream");
  if (res.error) body.textContent = "⚠ " + res.error;
  else {
    body.innerHTML = mdToHtml(res.answer);  // replaces the raw stream with rendered Markdown
  }
  if (!res.error && res.sources?.length) {
    const s = document.createElement("div");
    s.className = "sources";
    s.innerHTML = `<b>${L.sources}</b> ` + res.sources.map(x =>
      (x.tier ? `<span class="tier tier-${nid(x.tier)}" title="${esc(L["tier" + nid(x.tier)] || "")}">L${nid(x.tier)}</span> ` : "")
      + (safeHref(x.url) ? `<a href="${esc(safeHref(x.url))}">${esc(x.title)}</a>` : `${esc(x.title)} <span style="opacity:.6">(${esc(x.type)})</span>`)).join(" · ");
    current.appendChild(s);
  }
  if (!res.error && res.kills?.length) current.appendChild(renderKills(res.kills));
  if (!res.error && res.cards?.kind) { current.classList.add("with-cards"); const cw = renderCards(res.cards); if (res.cards.kind === "fitstats") adoptEft(cw, current); current.appendChild(cw); }
  // Follow the full answer: the streamed-token scroll stops at the (often 1-line) intro,
  // so the markdown re-render + appended sources/kills/cards land below the fold. Scroll
  // to the bottom now, and keep following as the card/portrait images load and grow the
  // layout — but only while the user is still near the bottom (don't yank them if they
  // scrolled up to read history).
  scrollBottom();
  requestAnimationFrame(scrollBottom);
  current.querySelectorAll("img").forEach((im) => {
    if (im.complete) return;
    const follow = () => { if (nearBottom()) scrollBottom(); };
    im.addEventListener("load", follow, { once: true });
    im.addEventListener("error", follow, { once: true });
  });
  current = null; body = null;
  q.disabled = false; send.disabled = false; q.focus();
}

send.addEventListener("click", askNow);
q.addEventListener("keydown", (e) => {
  // Slash menu open: arrows navigate, Enter/Tab pick, Esc closes — before submit/history.
  if (slashVisible()) {
    if (e.key === "ArrowDown") { slashIdx = (slashIdx + 1) % slashItems.length; renderSlash(); e.preventDefault(); return; }
    if (e.key === "ArrowUp") { slashIdx = (slashIdx - 1 + slashItems.length) % slashItems.length; renderSlash(); e.preventDefault(); return; }
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); applySlash(slashItems[slashIdx]); return; }
    if (e.key === "Escape") { e.preventDefault(); hideSlash(); return; }
  }
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askNow(); return; }
  // ↑ recalls older questions, ↓ newer — but only when the caret is on the
  // first/last line, so arrows still move within a multi-line draft.
  if (e.key === "ArrowUp" && histPos < inputHistory.length && q.value.slice(0, q.selectionStart).indexOf("\n") === -1) {
    if (histPos === 0) qDraft = q.value;
    histPos++; q.value = inputHistory[inputHistory.length - histPos]; caretToEnd(); e.preventDefault();
  } else if (e.key === "ArrowDown" && histPos > 0 && q.value.slice(q.selectionEnd).indexOf("\n") === -1) {
    histPos--; q.value = histPos === 0 ? qDraft : inputHistory[inputHistory.length - histPos]; caretToEnd(); e.preventDefault();
  }
});


// ── Model page (with response-time estimate given the VRAM) ──────────────
const modelBtn = $("model-btn");
const modelsList = $("models-list");
const modelsDl = $("models-dl");
let switching = false, canManage = false;

capsuleers.onReady(() => { modelBtn.disabled = false; });
modelBtn.addEventListener("click", () => { if (!modelBtn.disabled) showView("models"); });

function fmtEta(s) { return s >= 90 ? "~" + Math.round(s / 60) + "m" : "~" + s + "s"; }
const RATING_TAG = { veloce: "ok", accettabile: "warn", lento: "crit" };

function renderVram(r) {
  const v = r.vram;
  if (!v) { $("vram-block").innerHTML = ""; return; }
  const gb = (mb) => (mb / 1024).toFixed(1);
  const usedPct = Math.round(v.usedMB / v.totalMB * 100);
  const gpu = $("st-gpu").textContent.split(" · ")[0];
  $("st-gpu").textContent = `${gpu} · ${gb(v.freeMB)} GB`;
  $("vram-block").innerHTML =
    `<div class="vr"><div class="big">` +
      `<div class="k"><b class="num">${gb(v.freeMB)} <small>GB</small></b><span>${esc(L.vramFree)}</span></div>` +
      `<div class="k"><b class="num">${gb(v.totalMB)} <small>GB</small></b><span>${esc(L.vramTotal)}</span></div>` +
      `<div class="k"><b>${esc(gpu)}</b><span>${esc(L.accel)}</span></div></div>` +
      `<div style="flex:1;min-width:0;"><div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--cap-ink-3);"><span>${esc(L.vramUsed(usedPct))}</span><span>${esc(L.vramHint)}</span></div>` +
      `<div class="bar" style="height:10px;margin-top:8px;"><i style="width:${usedPct}%;background:var(--cap-accent);"></i></div></div></div>`;
}

function modelRow(m) {
  const row = document.createElement("div");
  row.className = "mr" + (m.current ? " on" : "");
  if (m.error) {
    row.style.gridTemplateColumns = "1fr";
    row.innerHTML = `<span class="mn2"><b>${esc(m.label)}</b><span class="warn">${esc(L.errLow)}: ${esc(m.error)}</span></span>`;
    return row;
  }
  const frac = m.fraction != null ? m.fraction : (m.totalLayers ? m.gpuLayers / m.totalLayers : 1);
  const pct = Math.round(Math.max(0, Math.min(1, frac)) * 100);
  const layerTxt = m.gpuLayers >= m.totalLayers ? L.allLayers(m.totalLayers) : L.someLayers(m.gpuLayers, m.totalLayers);
  const tag = m.current
    ? `<span class="tag acc">${esc(L.badgeInUse)}</span>`
    : `<span class="tag ${RATING_TAG[m.rating] || ""}">${esc(L.rating[m.rating] || m.rating)}</span>`;
  const acts = m.current ? "" :
    `<button class="btn s mr-use" type="button">${esc(L.modelUse)}</button>` +
    (canManage ? `<button class="ib mr-del" type="button" aria-label="${esc(L.modelsDelete)} ${esc(m.label)}" title="${esc(L.modelsDelete)}">${ic("trash", 14)}</button>` : "");
  row.innerHTML =
    `<span class="radio${m.current ? " on" : ""}"></span>` +
    `<span class="mn2"><b>${esc(m.label)}</b><span${pct < 100 ? ' class="warn"' : ""}>${esc(m.sizeGB)} GB · ${esc(m.quant)} · ${esc(layerTxt)}</span></span>` +
    `<span class="gp"><span class="bar"><i style="width:${pct}%;background:${pct === 100 ? "var(--cap-ok)" : "var(--cap-warn)"};"></i></span><span>${esc(L.pctGpu(pct))}</span></span>` +
    tag +
    `<span class="tm"><b class="num eta">${esc(fmtEta(m.etaSeconds))}</b><span class="num">~${esc(m.tokPerSec)} tok/s</span></span>` +
    `<span class="acts">${acts}</span>`;
  row.querySelector(".mr-use")?.addEventListener("click", () => selectModel(m, row));
  row.querySelector(".mr-del")?.addEventListener("click", () => deleteModel(m, row));
  return row;
}

// Inline confirm + delete a downloaded model (frees disk space).
function deleteModel(m, row) {
  const fresh = row.cloneNode(false);   // drop the row's handlers
  row.replaceWith(fresh); row = fresh;
  row.className = "mr";
  row.style.gridTemplateColumns = "1fr auto";
  row.innerHTML =
    `<span class="mn2"><b>${esc(L.modelsDeleteConfirm(m.label))}</b></span>` +
    `<span class="acts"><button class="btn s mdel-no" type="button">${esc(L.setupCancel)}</button>` +
    `<button class="btn s c mdel-yes" type="button">${esc(L.modelsDelete)}</button></span>`;
  row.querySelector(".mdel-no").addEventListener("click", () => loadModels());
  row.querySelector(".mdel-yes").addEventListener("click", async () => {
    const res = await capsuleers.models.delete(m.file);
    if (res?.error) { row.querySelector(".mn2").innerHTML = `<span class="warn">${esc(res.error)}</span>`; return; }
    await loadModels();  // refresh + the freed VRAM/space
  });
}

async function loadModels() {
  modelsList.innerHTML = `<div class="mut" style="padding:14px 12px;font-size:13px;">${esc(L.computing)}</div>`;
  const r = await capsuleers.models.list();
  canManage = !!r.manage;
  renderVram(r);
  modelsDl.innerHTML = ""; $("models-dl-sec").hidden = true;
  if (r.error) { modelsList.innerHTML = `<div class="mn2" style="padding:14px 12px;"><span class="warn">${esc(L.errCap)}: ${esc(r.error)}</span></div>`; return; }
  modelsList.innerHTML = "";
  (r.models || []).forEach((m) => {
    modelsList.appendChild(modelRow(m));
    if (m.current) setModelName(m.label);
  });
  await appendDownloadable();   // models still to download (packaged only)
}

// Lists catalog models not yet on disk, each with a download button.
async function appendDownloadable() {
  let cat;
  try { cat = await capsuleers.models.catalog(); } catch { return; }
  if (!cat?.available || !cat.models?.length) return;
  for (const m of cat.models) modelsDl.appendChild(dlRow(m));
  $("models-dl-sec").hidden = false;
}

function dlRow(m) {
  const row = document.createElement("div");
  row.className = "mr dlrow";
  const reco = (SYS_LANG === "it" && m.recommended) ? ` · ${esc(m.recommended)}` : "";
  const recBadge = m.default ? ` <span class="tag acc" style="height:20px;margin-left:8px;">${esc(L.badgeRecommended)}</span>` : "";
  const tag = m.rating ? `<span class="tag ${RATING_TAG[m.rating] || ""}">${esc(L.rating[m.rating] || m.rating)}</span>` : "<span></span>";
  row.innerHTML =
    `<span>${ic("down", 16)}</span>` +
    `<span class="mn2"><b>${esc(m.label)}${recBadge}</b><span>${esc(m.sizeGB)} GB · ${esc(m.quant)}${reco}</span></span><span></span>` + tag + `<span></span>` +
    `<span class="acts"><button class="btn s dl-btn" type="button">${ic("down", 13)}${esc(L.modelsDownload)} · ${esc(m.sizeGB)} GB</button></span>` +
    `<div class="dl-prog" hidden><div class="bar"><i></i></div>` +
    `<div class="dl-row2"><span class="dl-stat num"></span><button class="btn s dl-cancel" type="button">${esc(L.setupCancel)}</button></div></div>`;
  row.querySelector(".dl-btn").addEventListener("click", () => startModelDownload(m, row));
  row.querySelector(".dl-cancel").addEventListener("click", () => capsuleers.models.cancelDownload());
  return row;
}

let dlActive = null;  // { bar, stat } of the row currently downloading
capsuleers.models.onDownloadProgress((p) => {
  if (!dlActive) return;
  const pct = p.total ? Math.min(100, Math.round(p.received / p.total * 100)) : 0;
  dlActive.bar.style.width = pct + "%";
  dlActive.stat.textContent = `${pct}% · ${(p.received / 1e9).toFixed(1)}/${(p.total / 1e9).toFixed(1)} GB`
    + (p.speed ? ` · ${(p.speed / 1e6).toFixed(1)} MB/s` : "");
});

async function startModelDownload(m, row) {
  if (switching || dlActive) return;
  const btn = row.querySelector(".dl-btn");
  const prog = row.querySelector(".dl-prog");
  btn.hidden = true; prog.hidden = false;
  dlActive = { bar: row.querySelector(".bar i"), stat: row.querySelector(".dl-stat") };
  dlActive.stat.textContent = "…";
  document.querySelectorAll(".dl-btn, .mr:not(.dlrow)").forEach((el) => el.classList.add("busy"));
  q.disabled = true; send.disabled = true;
  const res = await capsuleers.models.download(m.id);
  dlActive = null;
  q.disabled = false; send.disabled = false;
  document.querySelectorAll(".busy").forEach((el) => el.classList.remove("busy"));
  if (res?.error && !res.aborted) {
    prog.querySelector(".dl-stat").innerHTML = `<span style="color:var(--cap-warn);">${esc(L.errLow)}: ${esc(res.error)}</span>`;
    btn.hidden = false;
    return;
  }
  await loadModels();  // success → model installed & now current; aborted → keep .part, refresh
}

async function selectModel(m, row) {
  if (switching) return;
  switching = true;
  document.querySelectorAll(".mr").forEach((el) => el.classList.add("busy"));
  row.classList.remove("busy");
  const eta = row.querySelector(".eta"); if (eta) eta.textContent = "…";
  q.disabled = true; send.disabled = true;  // input blocked during the swap
  const res = await capsuleers.models.set(m.file);
  switching = false;
  q.disabled = false; send.disabled = false;
  if (res?.error) { const t = row.querySelector(".mn2 span"); if (t) t.innerHTML = `<span style="color:var(--cap-warn);">${esc(L.errLow)}: ${esc(res.error)}</span>`; }
  await loadModels();  // reflects the new current model and the new VRAM
}

// ── RAG index page: version/details + forced re-download ─────────────────
const ragInfoEl = $("rag-info");
const ragRedl = $("rag-redl");
const ragRestart = $("rag-restart");
let ragActive = false;
const fmtB = (b) => b >= 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${Math.round(b / 1e6)} MB`;
const secShow = (id, on) => { $(id).hidden = !on; };

function renderRagInfo(info) {
  if (!info || info.error) {
    ragInfoEl.innerHTML = `<div class="mn2"><span class="warn">${esc(info?.error || "—")}</span></div>`;
    secShow("rag-files-sec", false);
    return;
  }
  const stat = info.update?.available
    ? `<span class="tag warn">${esc(L.ragUpdateAvail(info.update.version || "?"))}</span>`
    : `<span class="tag ok">${esc(L.ragUpToDate)}</span>`;
  ragInfoEl.innerHTML = `<div class="big">` +
    `<div class="k"><b class="num" style="font-size:22px;">${esc(info.version || "—")}</b><span>${esc(L.ragVersionK)}</span></div>` +
    `<div class="k" style="align-self:center;">${stat}<span style="margin-top:4px;">${esc(L.ragStateK)}</span></div>` +
    (idxCount != null ? `<div class="k"><b class="num">${esc(idxCount.toLocaleString())}</b><span>${esc(L.ragDocsK)}</span></div>` : "") +
    `<div class="k"><b>${esc(info.embedModel || "—")}</b><span>${esc(L.ragEmbedDim(info.dim || "—"))}</span></div>` +
    `<div class="k"><b class="num">${esc(fmtB(info.totalBytes || 0))}</b><span>${esc(L.ragDiskK)}</span></div></div>`;
  const files = (info.files || []).map((f) => `<tr><td style="color:var(--cap-ink);">${esc(f.name)}</td><td class="r num mut">${esc(fmtB(f.size))}</td></tr>`).join("");
  $("rag-files").innerHTML = files ? `<table class="t"><thead><tr><th>${esc(L.colFile)}</th><th class="r">${esc(L.colSize)}</th></tr></thead><tbody>${files}</tbody></table>` : "";
  secShow("rag-files-sec", !!files);
  if (info.canRedownload) { ragRedl.disabled = false; ragRedl.removeAttribute("title"); }
  else { ragRedl.disabled = true; ragRedl.title = L.ragDevNote; }
}

async function openRag() {
  if (!ragActive) { secShow("rag-err-sec", false); secShow("rag-note-sec", false); ragRestart.hidden = true; secShow("rag-prog", false); }
  ragInfoEl.innerHTML = `<div class="mut" style="font-size:13px;">${esc(L.computing)}</div>`;
  try { renderRagInfo(await capsuleers.rag.info()); } catch (e) { renderRagInfo({ error: e.message }); }
}

capsuleers.rag.onProgress((p) => {
  if (!ragActive) return;
  const pct = p.total ? Math.min(100, Math.round(p.received / p.total * 100)) : 0;
  $("rag-fill").style.width = pct + "%";
  $("rag-pct").innerHTML = `<b style="color:var(--cap-ink);">${pct}%</b> · ${esc(fmtB(p.received))} / ${esc(fmtB(p.total))}`;
  $("rag-speed").textContent = p.speed ? `${(p.speed / 1e6).toFixed(1)} MB/s` : "";
  $("rag-label").textContent = p.label || "";
});

async function ragRedownload() {
  if (ragActive || ragRedl.disabled) return;
  ragActive = true;
  secShow("rag-err-sec", false); secShow("rag-note-sec", false); ragRestart.hidden = true;
  ragRedl.classList.add("busy");
  secShow("rag-prog", true); $("rag-fill").style.width = "0%"; $("rag-pct").textContent = "…"; $("rag-speed").textContent = ""; $("rag-label").textContent = "";
  const res = await capsuleers.rag.redownload();
  ragActive = false;
  ragRedl.classList.remove("busy");
  secShow("rag-prog", false);
  if (res?.aborted) return;  // user cancelled → keep the old index + current info
  if (res?.error) { $("rag-err").textContent = res.error; secShow("rag-err-sec", true); return; }
  // Success: offer the restart that reloads the engine on the fresh index.
  $("rag-note").textContent = L.ragDone; secShow("rag-note-sec", true);
  ragRestart.hidden = false;
  try { renderRagInfo(await capsuleers.rag.info()); } catch { /* keep prior info */ }
}
ragRedl.addEventListener("click", ragRedownload);
$("rag-retry").addEventListener("click", ragRedownload);
$("rag-cancel").addEventListener("click", () => capsuleers.rag.cancelRedownload());
ragRestart.addEventListener("click", () => capsuleers.rag.restart());



// ── First-run setup: on-demand download of AI model + EVE index ──

// --- First-run setup: on-demand download of AI model + EVE index ---
(() => {
  const ov = document.getElementById("setup");
  const listEl = document.getElementById("setup-models");
  const inclEl = document.getElementById("setup-incl");
  const totalEl = document.getElementById("setup-total");
  const startBtn = document.getElementById("setup-start");
  const startLabel = document.getElementById("setup-start-label");
  const cancelBtn = document.getElementById("setup-cancel");
  const actions = document.getElementById("setup-actions");
  const prog = document.getElementById("setup-prog");
  const fill = document.getElementById("setup-fill");
  const labelEl = document.getElementById("setup-label");
  const pctEl = document.getElementById("setup-pct");
  const errEl = document.getElementById("setup-err");
  const errMsg = document.getElementById("setup-err-msg");
  let baseB = 0, models = [], selected = null;   // baseB = one-time bytes (embedding+index) still to fetch
  let dataOnly = false;                           // true = model present, only EVE data to (re)download

  const GB = (b) => (b / 1e9).toFixed(1);
  const MBs = (b) => (b / 1e6).toFixed(1);
  // MB under 1 GB, GB above — keeps small data updates readable ("~300 MB" not "~0.3 GB").
  const fmtSize = (b) => b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${Math.round(b / 1e6)} MB`;
  // Switch the overlay between first-run (model picker) and data-only (update) presentation.
  function applyMode() {
    const titleEl = ov.querySelector("h2");
    const introEl = ov.querySelector(".setup-intro");
    titleEl.innerHTML = dataOnly ? L.setupDataTitle : L.setupTitle;
    introEl.innerHTML = dataOnly ? L.setupDataIntro : L.setupIntro;
    startLabel.textContent = dataOnly ? L.setupDataStart : L.setupStart;
    listEl.hidden = dataOnly;   // no model choice when only data updates
  }

  function totalBytes() {
    const m = models.find((x) => x.id === selected);
    return baseB + (m && !m.installed ? m.sizeGB * 1e9 : 0);
  }
  function renderTotal() {
    if (dataOnly) {
      inclEl.textContent = "";
      totalEl.innerHTML = `<b>${esc(L.setupDataTotal(fmtSize(totalBytes())))}</b>`;
      return;
    }
    inclEl.textContent = baseB > 0 ? "· " + L.setupInclLine(GB(baseB)) : "";
    totalEl.innerHTML = `<b>${esc(L.setupTotalLine(GB(totalBytes())))}</b>`;
  }
  function renderModels() {
    listEl.innerHTML = "";
    for (const m of models) {
      const reco = (SYS_LANG === "it" && m.recommended) ? m.recommended : "";
      const recBadge = m.default ? `<span class="tag acc">${esc(L.badgeRecommended)}</span>` : "";
      const row = document.createElement("label");
      row.className = "so" + (m.id === selected ? " on" : "");
      row.innerHTML =
        `<input type="radio" name="setup-model" ${m.id === selected ? "checked" : ""}>` +
        `<span class="radio${m.id === selected ? " on" : ""}"></span>` +
        `<span class="mn2"><b>${esc(m.label)}${recBadge}</b>${reco ? `<span>${esc(reco)}</span>` : ""}</span>` +
        `<b class="num" style="font-size:13px;">${m.installed ? `<span class="sinstalled">${esc(L.setupInstalled)}</span>` : "~" + esc(m.sizeGB) + " GB"}</b>`;
      row.querySelector("input").addEventListener("change", () => { selected = m.id; renderModels(); renderTotal(); });
      listEl.appendChild(row);
    }
  }
  // Blocca/sblocca la scelta del modello (durante il download non si cambia).
  function setLocked(on) {
    listEl.classList.toggle("locked", on);
    for (const inp of listEl.querySelectorAll("input")) inp.disabled = on;
  }
  function showErr(msg) {
    prog.hidden = true; actions.hidden = false; cancelBtn.hidden = true; setLocked(false);
    startLabel.textContent = L.setupRetry;
    errMsg.textContent = msg; errEl.hidden = false;
  }

  startBtn.addEventListener("click", async () => {
    // Durante il download: nascondi il pulsante e disabilita la scelta del modello.
    errEl.hidden = true; actions.hidden = true; cancelBtn.hidden = false; prog.hidden = false; setLocked(true);
    labelEl.textContent = "…"; pctEl.textContent = "0%"; fill.style.width = "0%";
    const res = await capsuleers.setup.start(selected);
    if (res?.error && !res.aborted) showErr(res.error);
  });
  cancelBtn.addEventListener("click", () => capsuleers.setup.cancel());

  capsuleers.setup.onNeeded((data) => {
    baseB = data.baseBytes || 0; models = data.models || []; dataOnly = !!data.dataOnly;
    // Data-only: keep the already-installed model so firstRunTasks won't fetch one.
    selected = dataOnly
      ? (models.find((m) => m.installed && m.default) || models.find((m) => m.installed) || models[0] || {}).id || null
      : (models.find((m) => m.default) || models[0] || {}).id || null;
    errEl.hidden = true; prog.hidden = true; actions.hidden = false; cancelBtn.hidden = true; setLocked(false);
    applyMode(); renderModels(); renderTotal();
    ov.hidden = false;
  });
  capsuleers.setup.onProgress((p) => {
    const pct = p.total ? Math.min(100, Math.round(p.received / p.total * 100)) : 0;
    fill.style.width = pct + "%";
    labelEl.textContent = p.label + (p.speed ? ` · ${MBs(p.speed)} MB/s` : "");
    pctEl.textContent = `${pct}% · ${fmtSize(p.received)}/${fmtSize(p.total)}`;
  });
  capsuleers.setup.onDone(() => { ov.hidden = true; });
  capsuleers.setup.onError((e) => { if (e.aborted) { prog.hidden = true; actions.hidden = false; cancelBtn.hidden = true; setLocked(false); } else showErr(e.message); });
})();


// ── Init ─────────────────────────────────────────────────────────────────
renderLocalEmpty();
renderDscanEmpty();
refreshLinkCount();
showWelcome();   // first message on open
showView("chat");
