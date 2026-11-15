"""EVE player slang glossary (L3, hand-written by the project, not dated).

A local data file, `terms.json`: one entry per term of player jargon (o7, scram, cyno,
TiDi, crit hole, ...) with aliases and a short definition in English and Italian. The
model needs it because slang is not in the SDE and is spelled many ways in questions.

One Document per term, title = the term (so the retrieval's title match hooks it),
`source=capsuleers_glossary`, `type=glossary`, no URL (the site has no glossary page).
It is a Provider like the CCP ones and sits in the same registry (ccp/__init__.py), so
ccp_update.py, run.py --ccp and the rag-publish workflow pick it up with no extra
wiring: the stamp of a term is the hash of its entry, so editing one term re-indexes
only that term. No network: list() and documents() read the file.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from ..ccp.common import Item, Provider
from ..models import Document

TERMS_FILE = Path(__file__).with_name("terms.json")
LICENSE = "© Capsuleers — glossario del gergo dei giocatori (contenuto originale del progetto)"


def slug(term: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-") or "term"


def load_terms(path: Path = TERMS_FILE) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


class GlossaryProvider(Provider):
    name = "glossary"
    description = "Glossario del gergo dei giocatori (capsuleers.ia)"

    def __init__(self, path: Path = TERMS_FILE) -> None:
        self.path = path

    def list(self) -> list[Item]:
        items: list[Item] = []
        seen: set[str] = set()
        for entry in load_terms(self.path):
            key = slug(entry["term"])
            if key in seen:
                raise ValueError(f"termine duplicato nel glossario: {entry['term']!r}")
            seen.add(key)
            stamp = hashlib.sha1(json.dumps(entry, sort_keys=True, ensure_ascii=False)
                                 .encode("utf-8")).hexdigest()[:12]
            items.append(Item(key=key, stamp=stamp, label=entry["term"], data=entry))
        return items

    def documents(self, item: Item) -> list[Document]:
        e = item.data
        term = e["term"]
        lines = [f"{term} (EVE Online slang / gergo dei giocatori)"]
        aliases = [a for a in e.get("aliases") or [] if a.lower() != term.lower()]
        if aliases:
            lines.append("Also written / Anche scritto: " + ", ".join(aliases))
        lines.append(f"EN: {e['en']}")
        lines.append(f"IT: {e['it']}")
        return [Document(
            id=f"capsuleers:glossary:{item.key}", type="glossary", title=term,
            text="\n".join(lines), source="capsuleers_glossary", url=None,
            metadata={"license": LICENSE, "category": "glossary", "aliases": aliases})]

    def fetch(self, items, delay: float = 0.0):
        # Local file: no rate limit to respect.
        yield from super().fetch(items, delay=0.0)
