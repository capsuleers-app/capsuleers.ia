"""Download the official SDE from the SDE API (https://sde.evetech.net) as JSON Lines.

The index `.../tranquility/latest/` is read ONCE: `release`, `buildNumber` and every
`tables.<name>.jsonl.url` are pinned to that release, so a publication in the middle of a
run cannot mix two releases. `buildNumber` is NOT unique: the identity of a SDE is `release`.
Only the tables the ingestion reads are downloaded, validated, converted to the legacy zip
format (`sde/legacy.py`) and written into CONFIG.sde_dir, so the parsers do not change.
"""

from __future__ import annotations

import gzip
import json
import shutil
import time
import urllib.request
from pathlib import Path

from ..config import CONFIG, USER_AGENT
from .legacy import convert

# Tables read by sde/*.py (kept in sync by tests/test_sde_download.py).
TABLES = (
    "ancestries", "bloodlines", "blueprints", "categories", "certificates",
    "characterAttributes", "dogmaAttributes", "dogmaEffects", "dogmaUnits", "dungeons",
    "factions", "groups", "mapConstellations", "mapRegions", "mapSolarSystems",
    "mapStargates", "marketGroups", "metaGroups", "npcCharacters", "npcCorporations",
    "npcStations", "planetSchematics", "races", "stationOperations", "stationServices",
    "typeBonus", "typeDogma", "types",
)

ATTEMPTS = 4
INDEX_TIMEOUT = 30
TABLE_TIMEOUT = 300


def _get(url: str, timeout: int) -> bytes:
    """GET with gzip, retry and exponential backoff. Returns the decompressed body."""
    last: Exception | None = None
    for attempt in range(ATTEMPTS):
        if attempt:
            time.sleep(2 ** attempt)
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                body = r.read()
                if r.headers.get("Content-Encoding") == "gzip" or body[:2] == b"\x1f\x8b":
                    body = gzip.decompress(body)
                return body
        except Exception as e:  # noqa: BLE001 - retried, then re-raised below
            last = e
    raise RuntimeError(f"Download fallito dopo {ATTEMPTS} tentativi: {url}: {last}") from last


def fetch_index() -> dict:
    """The SDE API index (one request; follows the `latest` redirect)."""
    idx = json.loads(_get(CONFIG.sde_index_url, INDEX_TIMEOUT))
    if not idx.get("release") or "tables" not in idx:
        raise RuntimeError("Indice SDE API senza 'release'/'tables'")
    return idx


def latest_release() -> dict:
    """Return {'release': str, 'buildNumber': int} of the most recent SDE (tiny check)."""
    idx = fetch_index()
    return {"release": idx["release"], "buildNumber": int(idx.get("buildNumber", 0))}


def convert_table(name: str, raw: bytes) -> list[str]:
    """Validate a table download and convert it to legacy-format lines."""
    out: list[str] = []
    for n, line in enumerate(raw.decode("utf-8").splitlines(), 1):
        if not line.strip():
            continue
        rec = json.loads(line)
        if not isinstance(rec, dict) or not rec or "error" in rec:
            raise RuntimeError(f"Tabella {name}: riga {n} non valida ({line[:120]})")
        out.append(json.dumps(convert(name, rec), ensure_ascii=False, separators=(",", ":")))
    if not out:
        raise RuntimeError(f"Tabella {name}: vuota")
    return out


def download_sde_jsonl(index: dict | None = None) -> str:
    """Download, validate and convert the SDE into CONFIG.sde_dir. Returns that folder.

    The target folder is replaced atomically only when every table is valid.
    """
    index = index or fetch_index()
    tables = index["tables"]
    out_dir = Path(CONFIG.sde_dir)
    tmp_dir = out_dir.with_name(out_dir.name + ".tmp")
    shutil.rmtree(tmp_dir, ignore_errors=True)
    tmp_dir.mkdir(parents=True)
    try:
        for name in TABLES:
            if name not in tables:
                raise RuntimeError(f"Tabella {name} assente dall'indice SDE API")
            raw = _get(tables[name]["jsonl"]["url"], TABLE_TIMEOUT)
            lines = convert_table(name, raw)
            (tmp_dir / f"{name}.jsonl").write_text("\n".join(lines) + "\n", encoding="utf-8")
        # Same marker as the zip's _sde.jsonl, plus the release (the real identity).
        (tmp_dir / "_sde.jsonl").write_text(json.dumps({
            "_key": "sde", "buildNumber": int(index.get("buildNumber", 0)),
            "release": index["release"], "releaseDate": index.get("releaseDate"),
        }) + "\n", encoding="utf-8")
        shutil.rmtree(out_dir, ignore_errors=True)
        tmp_dir.rename(out_dir)
    except BaseException:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
    return str(out_dir)
