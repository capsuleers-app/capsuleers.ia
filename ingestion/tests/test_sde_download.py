"""SDE API download: legacy conversion, validation, pinned release, atomic write. Offline."""

from __future__ import annotations

import dataclasses
import gzip
import json
import re
from pathlib import Path

import pytest

from capsuleers_ingestion.sde import download as d
from capsuleers_ingestion.sde.legacy import convert


def test_tables_match_what_the_parsers_read():
    src = "".join(p.read_text() for p in Path(d.__file__).parent.glob("*.py")
                  if p.name not in ("download.py", "legacy.py"))
    used = set(re.findall(r'(?:rows|by_key|exists)\(\s*"(\w+)"', src))
    assert used <= set(d.TABLES)


def test_convert_key_and_value_tables():
    assert convert("types", {"typeID": 587, "groupID": 25}) == {"_key": 587, "groupID": 25}
    assert convert("masteries", {"typeID": 1, "levels": [{"level": 0, "certificates": [1]}]}) == {
        "_key": 1, "_value": [{"_key": 0, "_value": [1]}]}
    assert convert("races", {"raceID": 1, "skills": [{"typeID": 3, "level": 4}]}) == {
        "_key": 1, "skills": [{"_key": 3, "_value": 4}]}
    sec = convert("mapSolarSystems", {"solarSystemID": 1, "securityStatus": -1})
    assert sec["securityStatus"] == -1.0 and isinstance(sec["securityStatus"], float)


def test_convert_table_rejects_empty_and_error_rows():
    with pytest.raises(RuntimeError):
        d.convert_table("types", b"\n")
    with pytest.raises(RuntimeError):
        d.convert_table("types", b'{"typeID":1}\n{"error":"boom"}\n')


class _Resp:
    def __init__(self, body: bytes, gz: bool):
        self._b = gzip.compress(body) if gz else body
        self.headers = {"Content-Encoding": "gzip"} if gz else {}

    def read(self): return self._b
    def __enter__(self): return self
    def __exit__(self, *a): return False


def _fake_api(monkeypatch, tmp_path, bad: str | None = None, flaky: bool = False):
    rel = "20990101T000000Z"
    base = f"https://x/{rel}/"
    index = {"release": rel, "buildNumber": 7, "releaseDate": "2099-01-01T00:00:00Z",
             "tables": {t: {"jsonl": {"url": f"{base}{t}.jsonl"}} for t in d.TABLES}}
    calls = {"n": 0}

    def fake(req, timeout=0):
        url = req.full_url
        if url == d.CONFIG.sde_index_url:
            return _Resp(json.dumps(index).encode(), True)
        calls["n"] += 1
        if flaky and calls["n"] == 1:
            raise OSError("transient")
        t = url.rsplit("/", 1)[1][:-6]
        body = b'{"error":"x"}\n' if t == bad else b'{"typeID":1,"v":2}\n'
        return _Resp(body, True)

    monkeypatch.setattr(d.urllib.request, "urlopen", fake)
    monkeypatch.setattr(d.time, "sleep", lambda s: None)
    monkeypatch.setattr(d, "CONFIG", dataclasses.replace(d.CONFIG, sde_dir=str(tmp_path / "sde")))
    return index


def test_download_writes_legacy_files_and_marker(monkeypatch, tmp_path):
    _fake_api(monkeypatch, tmp_path, flaky=True)
    assert d.latest_release() == {"release": "20990101T000000Z", "buildNumber": 7}
    out = Path(d.download_sde_jsonl())
    assert json.loads((out / "types.jsonl").read_text()) == {"_key": 1, "v": 2}
    marker = json.loads((out / "_sde.jsonl").read_text())
    assert marker["release"] == "20990101T000000Z" and marker["buildNumber"] == 7


def test_failed_table_keeps_previous_sde(monkeypatch, tmp_path):
    _fake_api(monkeypatch, tmp_path)
    old = Path(d.download_sde_jsonl())
    (old / "marker.txt").write_text("old")
    _fake_api(monkeypatch, tmp_path, bad="groups")
    with pytest.raises(RuntimeError):
        d.download_sde_jsonl()
    assert (old / "marker.txt").exists() and not (tmp_path / "sde.tmp").exists()
