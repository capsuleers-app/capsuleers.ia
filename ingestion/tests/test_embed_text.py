"""The text that is embedded for a chunk (index.embed_text)."""

from capsuleers_ingestion.index import embed_text

SHIP = (
    "Caracal (Tech I Ship / Cruiser)\nA powerful vessel specialising in missile deployment, with a role in fleet support.\n"
    "Requisiti skill:\nSkill richieste direttamente: Caldari Cruiser livello 1\n"
    "Bonus per livello di Caldari Cruiser: 5% bonus to Light Missile rate of fire\n"
    "Attributi: Structure Hitpoints: 1200 HP, Low Slots: 4, CPU Output: 430 tf\n"
)


def test_sde_record_is_embedded_without_the_attribute_dump():
    out = embed_text(SHIP, "ccp_sde")
    assert "Attributi:" not in out
    assert "Caldari Cruiser" in out and "Light Missile" in out


def test_other_sources_are_embedded_whole():
    wiki = "Tanking\nAttributi: questa riga appartiene a una pagina wiki e resta.\n" + "x" * 100
    assert embed_text(wiki, "eve_university_wiki") == wiki
    assert embed_text(wiki, None) == wiki


def test_a_chunk_that_is_only_the_dump_stays_whole():
    tail = "Caracal\nAttributi: Structure Hitpoints: 1200 HP, Low Slots: 4"
    assert embed_text(tail, "ccp_sde") == tail
