"""Derived values computed ONLY from base SDE attributes (no skills, no modules, no
ammo): the 4B local model reads the record, so it gets the finished number, with the
formula next to it, instead of having to compute it. A row is omitted whenever one
of its inputs is missing from the SDE.

Attribute names checked against the real SDE (build 3698585):
  agility (70, "Inertia Modifier"), baseWarpSpeed (1281, AU/s), warpSpeedMultiplier (600),
  jumpDriveRange (867, ly), jumpDriveConsumptionAmount (868) / Type (866),
  speed (51, "Rate of fire", ms), damageMultiplier (64), emDamage (114),
  explosiveDamage (116), kineticDamage (117), thermalDamage (118).
Mass of a ship is NOT a dogma attribute: it is the `mass` field of types.jsonl (kg).
"""

from __future__ import annotations

import math

A_MASS, A_INERTIA = 4, 70
A_BASE_WARP, A_WARP_MULT = 1281, 600
A_JUMP_RANGE, A_JUMP_FUEL_AMOUNT, A_JUMP_FUEL_TYPE = 867, 868, 866
A_ROF, A_DMG_MULT = 51, 64
DAMAGE_ATTRS = ((114, "EM"), (116, "explosive"), (117, "kinetic"), (118, "thermal"))

# Jump Drive Calibration: +20% jump range per level (x2.0 at level V).
JDC_PER_LEVEL, JDC_MAX = 0.20, 5


def _n(v: float, nd: int = 2) -> str:
    r = round(v, nd)
    return str(int(r)) if float(r).is_integer() else f"{r:.{nd}f}".rstrip("0").rstrip(".")


def derived_line(ctx, type_id: int, t: dict, category: str, attrs: dict) -> str:
    """The "Valori derivati:" row for a type, or "" when nothing can be derived."""
    if category == "Ship":
        parts = _ship_parts(ctx, t, attrs)
    elif category in ("Module", "Drone", "Fighter"):
        parts = _damage_parts(attrs)
    else:
        parts = []
    if not parts:
        return ""
    return ("Valori derivati (calcolati solo da attributi SDE base, SENZA skill né moduli): "
            + "; ".join(parts))


def _ship_parts(ctx, t: dict, attrs: dict) -> list[str]:
    parts: list[str] = []
    mass = t.get("mass") or attrs.get(A_MASS)
    inertia = attrs.get(A_INERTIA)
    if mass and inertia:
        align = math.log(2) * inertia * mass / 500000
        parts.append(f"Align time base = {_n(align)} s "
                     f"(formula: ln(2) × inertia modifier {_n(inertia, 4)} × massa {_n(mass)} kg / 500000)")
    mult = attrs.get(A_WARP_MULT)
    if mult:
        base = attrs.get(A_BASE_WARP) or 1
        parts.append(f"Velocità di warp = {_n(base * mult)} AU/s "
                     f"(formula: ship warp speed {_n(base)} × warp speed multiplier {_n(mult)})")
    rng = attrs.get(A_JUMP_RANGE)
    if rng:
        top = rng * (1 + JDC_PER_LEVEL * JDC_MAX)
        s = (f"Jump range massimo con Jump Drive Calibration V = {_n(top)} ly "
             f"(formula: {_n(rng)} ly base × {_n(1 + JDC_PER_LEVEL * JDC_MAX, 1)}, "
             f"cioè +{int(JDC_PER_LEVEL * 100)}% per livello; {_n(rng)} ly senza skill)")
        fuel, amount = attrs.get(A_JUMP_FUEL_TYPE), attrs.get(A_JUMP_FUEL_AMOUNT)
        if fuel and amount:
            s += f"; carburante base {_n(amount)}× {ctx.names.type(int(fuel))} per ly (senza Jump Fuel Conservation)"
        parts.append(s)
    return parts


def _damage_parts(attrs: dict) -> list[str]:
    dmg = [(name, attrs.get(aid) or 0) for aid, name in DAMAGE_ATTRS]
    dmg = [(n, v) for n, v in dmg if v > 0]
    mult, rof = attrs.get(A_DMG_MULT), attrs.get(A_ROF)
    if not dmg or not mult or not rof:
        return []
    raw = sum(v for _, v in dmg)
    shot = raw * mult
    secs = rof / 1000
    split = ", ".join(f"{_n(v / raw * 100, 1)}% {n}" for n, v in dmg)
    raw_txt = " + ".join(f"{_n(v)} {n}" for n, v in dmg)
    return [
        f"Danno per colpo = {_n(shot)} (formula: ({raw_txt}) × damage multiplier {_n(mult)}); "
        f"composizione del danno: {split}",
        f"DPS base = {_n(shot / secs)} (formula: danno per colpo {_n(shot)} / rate of fire {_n(secs)} s)",
    ]
