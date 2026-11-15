"""Slang glossary: data file integrity, Documents, registry wiring.

Offline: reads the bundled terms.json only.
    ingestion/.venv/bin/python -m pytest ingestion/tests/test_glossary.py
"""

from __future__ import annotations

from capsuleers_ingestion.ccp import providers
from capsuleers_ingestion.glossary import GlossaryProvider, load_terms, slug

CORE = ["o7", "o/", "gf", "gg", "FC", "Blops", "Bubble", "Gank", "Tackle", "Point", "Scram", "Web",
        "Neut", "Cyno", "Hot drop", "Bridge", "Titan bridge", "Doctrine", "Logi", "DPS", "EWAR",
        "Alpha strike", "Kiting", "Brawling", "Gate camp", "Safe spot", "Bookmark", "Ping", "CTA",
        "Stratop", "SRP", "AFK cloaky", "Awox", "Blue", "Red", "Neutral", "NBSI", "NRDS", "Podded",
        "Pod express", "D-scan", "K-space", "J-space", "C1-C6", "Static", "Rolling", "Crit hole",
        "EOL", "Capital", "Super", "Dread", "FAX", "Triage", "Siege", "TiDi", "DT", "TQ", "SiSi",
        "PLEX", "SP", "ISK", "mil", "bil", "Jita", "Undock", "Insta-undock"]


def test_data_file_is_complete_and_unique():
    terms = load_terms()
    assert 100 <= len(terms) <= 150
    for t in terms:
        assert t["term"].strip() and len(t["en"]) > 40 and len(t["it"]) > 40, t["term"]
        assert isinstance(t.get("aliases", []), list)
    assert len({slug(t["term"]) for t in terms}) == len(terms)
    have = {t["term"] for t in terms}
    assert [c for c in CORE if c not in have] == []


def test_one_document_per_term_titled_with_the_term():
    prov = GlossaryProvider()
    items = prov.list()
    docs = [d for _, ds in prov.fetch(items) for d in ds]
    assert len(docs) == len(items) == len(load_terms())
    cyno = next(d for d in docs if d.title == "Cyno")
    assert cyno.source == "capsuleers_glossary" and cyno.type == "glossary" and cyno.url is None
    assert cyno.id == "capsuleers:glossary:cyno"
    assert "EN: " in cyno.text and "IT: " in cyno.text
    assert cyno.metadata["ccp_provider"] == "glossary"      # provenance for --seed-from-dump


def test_stamp_changes_only_for_the_edited_term(tmp_path):
    src = load_terms()
    import json
    f = tmp_path / "t.json"
    f.write_text(json.dumps(src), encoding="utf-8")
    before = {i.key: i.stamp for i in GlossaryProvider(f).list()}
    src[0]["en"] += " Edited."
    f.write_text(json.dumps(src), encoding="utf-8")
    after = {i.key: i.stamp for i in GlossaryProvider(f).list()}
    assert [k for k in before if before[k] != after[k]] == [slug(src[0]["term"])]


def test_registered_in_the_ccp_registry():
    names = [p.name for p in providers()]
    assert "glossary" in names and "articles" in names
    assert [p.name for p in providers("glossary")] == ["glossary"]
