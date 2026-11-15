"""SDE type records: separate bonuses, flat skill lists, derived values, units.

Offline: a tiny fake SDE is written to a temp dir.
    ingestion/.venv/bin/python -m pytest ingestion/tests/test_sde_records.py
"""

from __future__ import annotations

import json
import math

from capsuleers_ingestion.sde.common import Names
from capsuleers_ingestion.sde.parse import parse_types
from capsuleers_ingestion.sde.source import Sde

# Attribute ids follow the real SDE.
ATTRS = {
    4: ("mass", None, 2), 37: ("maxVelocity", "Maximum Velocity", 11), 51: ("speed", "Rate of fire", 101),
    64: ("damageMultiplier", "Damage Modifier", 104), 70: ("agility", "Inertia Modifier", 104),
    114: ("emDamage", "EM damage", 113), 116: ("explosiveDamage", "Explosive damage", 113),
    117: ("kineticDamage", "Kinetic damage", 113), 118: ("thermalDamage", "Thermal damage", 113),
    182: ("requiredSkill1", None, 116), 277: ("requiredSkill1Level", None, None),
    183: ("requiredSkill2", None, 116), 278: ("requiredSkill2Level", None, None),
    600: ("warpSpeedMultiplier", "Warp Speed Multiplier", 104), 866: ("jumpDriveConsumptionType", "Jump Drive Fuel Need", 116),
    867: ("jumpDriveRange", "Maximum Jump Range", 126), 868: ("jumpDriveConsumptionAmount", "Jump Drive Consumption Amount", 138),
    1281: ("baseWarpSpeed", "Ship Warp Speed", 144),
}
SPACESHIP, CRUISER, DESTROYER, FRIGATE, HULL_UP, MECH = 3327, 100, 101, 102, 103, 104
ROKH, ARCHON, HAMMER, DCU, ISO = 24688, 23757, 2185, 2048, 16274


def _w(root, name, rows):
    (root / f"{name}.jsonl").write_text("\n".join(json.dumps(r) for r in rows), encoding="utf-8")


def _type(tid, name, group, mass=None, desc=""):
    t = {"_key": tid, "name": {"en": name}, "groupID": group, "published": True, "description": {"en": desc}}
    if mass is not None:
        t["mass"] = mass
    return t


def _dogma(tid, **by_id):
    return {"_key": tid, "dogmaAttributes": [{"attributeID": int(a), "value": v} for a, v in by_id.items()]}


def _sde(tmp_path):
    _w(tmp_path, "categories", [{"_key": 1, "name": {"en": "Ship"}}, {"_key": 2, "name": {"en": "Skill"}},
                                {"_key": 3, "name": {"en": "Drone"}}, {"_key": 4, "name": {"en": "Module"}},
                                {"_key": 5, "name": {"en": "Material"}}])
    _w(tmp_path, "groups", [{"_key": 10, "categoryID": 1, "name": {"en": "Battleship"}},
                            {"_key": 11, "categoryID": 2, "name": {"en": "Spaceship Command"}},
                            {"_key": 12, "categoryID": 3, "name": {"en": "Combat Drone"}},
                            {"_key": 13, "categoryID": 4, "name": {"en": "Damage Control"}},
                            {"_key": 14, "categoryID": 5, "name": {"en": "Isotopes"}}])
    _w(tmp_path, "dogmaAttributes", [
        {"_key": k, "name": n, "displayName": {"en": d} if d else None, "unitID": u, "published": True}
        for k, (n, d, u) in ATTRS.items()])
    _w(tmp_path, "metaGroups", [])
    _w(tmp_path, "types", [
        _type(SPACESHIP, "Spaceship Command", 11), _type(CRUISER, "Caldari Cruiser", 11),
        _type(DESTROYER, "Caldari Destroyer", 11), _type(FRIGATE, "Caldari Frigate", 11),
        _type(HULL_UP, "Hull Upgrades", 11), _type(MECH, "Mechanics", 11),
        _type(ROKH, "Rokh", 10, mass=105300000.0), _type(ARCHON, "Archon", 10, mass=1260000000.0),
        _type(HAMMER, "Hammerhead II", 12, mass=5000.0), _type(DCU, "Damage Control II", 13),
        _type(ISO, "Helium Isotopes", 14),
        _type(9, "Caracal", 10, mass=11910000.0),
    ])
    _w(tmp_path, "typeDogma", [
        _dogma(CRUISER, **{"182": DESTROYER, "277": 3, "183": SPACESHIP, "278": 2}),
        _dogma(DESTROYER, **{"182": FRIGATE, "277": 3, "183": SPACESHIP, "278": 1}),
        _dogma(FRIGATE, **{"182": SPACESHIP, "277": 1}),
        _dogma(HULL_UP, **{"182": MECH, "277": 1}),
        _dogma(ROKH, **{"37": 89.0, "70": 0.136, "600": 3.0, "1281": 1.0}),
        _dogma(ARCHON, **{"70": 0.041, "600": 1.5, "867": 3.5, "866": ISO, "868": 3000.0}),
        _dogma(HAMMER, **{"37": 2016.0, "51": 4000.0, "64": 1.92, "118": 32.0, "114": 0.0}),
        _dogma(DCU, **{"182": HULL_UP, "277": 4}),
        _dogma(9, **{"182": CRUISER, "277": 1}),
    ])
    _w(tmp_path, "typeBonus", [
        {"_key": ROKH,
         "roleBonuses": [{"bonus": 5.0, "bonusText": {"en": "additional bonus to Reinforced Bulkhead hitpoints"}, "unitID": 105},
                         {"bonusText": {"en": "Can fit a Siege module"}}],
         "types": [{"_key": 20, "_value": [
             {"bonus": 4.0, "bonusText": {"en": "bonus to all shield resistances"}, "unitID": 105},
             {"bonus": 10.0, "bonusText": {"en": "bonus to Large Hybrid Turret optimal range"}, "unitID": 105}]}]},
    ])
    # Skill 20 is the per-level skill of the Rokh bonuses.
    rows = [json.loads(line) for line in (tmp_path / "types.jsonl").read_text().splitlines()]
    rows.append(_type(20, "Caldari Battleship", 11))
    _w(tmp_path, "types", rows)
    return Sde(tmp_path)


def _texts(tmp_path):
    sde = _sde(tmp_path)
    return {d.title: d.text for d in parse_types(sde, Names(sde))}


def test_rokh_role_and_per_level_bonuses_are_separate(tmp_path):
    text = _texts(tmp_path)["Rokh"]
    assert ("Bonus di ruolo (fissi): 5% additional bonus to Reinforced Bulkhead hitpoints; "
            "Can fit a Siege module") in text
    assert ("Bonus per livello di Caldari Battleship: 4% bonus to all shield resistances; "
            "10% bonus to Large Hybrid Turret optimal range") in text
    role_line = next(ln for ln in text.splitlines() if ln.startswith("Bonus di ruolo"))
    assert "shield resistances" not in role_line


def test_velocity_unit_is_m_per_s_not_squared(tmp_path):
    text = _texts(tmp_path)["Rokh"]
    assert "Maximum Velocity: 89 m/s," in text or text.rstrip().endswith("Maximum Velocity: 89 m/s")
    assert "m/s²" not in text


def test_ship_derived_align_and_warp(tmp_path):
    text = _texts(tmp_path)["Rokh"]
    derived = next(ln for ln in text.splitlines() if ln.startswith("Valori derivati"))
    expected = math.log(2) * 0.136 * 105300000 / 500000
    assert f"Align time base = {expected:.2f} s" in derived       # 19.85
    assert "Velocità di warp = 3 AU/s" in derived
    assert "SENZA skill" in derived
    assert "Jump range" not in derived                            # no jump drive


def test_jump_drive_ship_gets_jump_range_with_jdc_v(tmp_path):
    derived = next(ln for ln in _texts(tmp_path)["Archon"].splitlines() if ln.startswith("Valori derivati"))
    assert "Jump range massimo con Jump Drive Calibration V = 7 ly" in derived   # 3.5 x 2.0
    assert "3.5 ly senza skill" in derived
    assert "3000× Helium Isotopes per ly" in derived


def test_drone_derived_damage_and_dps(tmp_path):
    derived = next(ln for ln in _texts(tmp_path)["Hammerhead II"].splitlines() if ln.startswith("Valori derivati"))
    assert "Danno per colpo = 61.44" in derived
    assert "100% thermal" in derived
    assert "DPS base = 15.36" in derived


def test_no_derived_row_without_inputs(tmp_path):
    texts = _texts(tmp_path)
    assert "Valori derivati" not in texts["Damage Control II"]
    assert "Valori derivati" not in texts["Caracal"]    # no mass-less attrs: no inertia, no warp


def test_skill_block_flat_lists_and_starts_with_header(tmp_path):
    text = _texts(tmp_path)["Caracal"]
    lines = text.splitlines()
    i = lines.index("Requisiti skill:")
    assert lines[i + 1] == "Skill richieste direttamente: Caldari Cruiser livello 1"
    full = lines[i + 2]
    assert full.startswith("Tutte le skill necessarie (prerequisiti inclusi, livello massimo richiesto): ")
    # Deduplicated, highest level wins: Spaceship Command is required at 2 and 1 -> once, level 2.
    assert full.count("Spaceship Command") == 1 and "Spaceship Command livello 2" in full
    assert "Caldari Destroyer livello 3" in full and "Caldari Frigate livello 3" in full
    assert not any(ln.startswith("  -") for ln in lines)           # no indented tree


def test_damage_control_requirements(tmp_path):
    text = _texts(tmp_path)["Damage Control II"]
    assert "Skill richieste direttamente: Hull Upgrades livello 4" in text
    assert "Mechanics livello 1" in text
