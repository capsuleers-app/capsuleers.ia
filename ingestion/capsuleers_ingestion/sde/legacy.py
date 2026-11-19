"""Conversione dei record della SDE API (https://sde.evetech.net) nel formato zip legacy.

L'API usa come chiave del record il nome della tabella (`typeID`, `solarSystemID`...) invece
di `_key`, e per alcune tabelle/liste annidate dei campi con nome (`_value`). I parser in
`sde/*.py` leggono il formato zip: si converte qui, al confine del download, cosi' non cambiano.
Regole verificate per parita' completa con lo zip della stessa build
(riferimento: docs/claude/sde-legacy-converter.py nel repo dell'orchestratore).
"""

from __future__ import annotations

VALUE_TABLES = {'freelanceJobSchemas':'schemas','masteries':'levels','skinrComponentPointValues':'rarities','skinrSlotsToMaterials':'slots','skinrTierThresholds':'tiers'}
# path (list fields, dot-separated, '_value' = unwrapped value list) -> rule
NESTED={
 'appliedProximityEffects':{'dbuffs':'kv'},'linkWithShip':{'dbuffs':'kv'},'proximityTrap':{'dbuffs':'kv'},
 'systemDbuffEmitters':{'dbuffs':'kv'},'systemWideEffects':{'dbuffs':'kv'},
 'certificates':{'skillTypes':'k'},'contrabandTypes':{'factions':'k'},'epicArcs':{'missions':'k'},
 'dynamicItemAttributes':{'attributeIDs':'k'},'planetSchematics':{'types':'k'},'typeBonus':{'types':'kv'},
 'freelanceJobSchemas':{'_value':'k','_value.parameters':'k'},
 'masteries':{'_value':'kv'},'skinrComponentPointValues':{'_value':'kv'},'skinrTierThresholds':{'_value':'kv'},
 'missions':{'messages':'msg','extraStandings':'kv'},
 'npcCorporations':{'corporationTrades':'kv','divisions':'k','investors':'kv','exchangeRates':'kv'},
 'races':{'skills':'kv'},'shipTreeFactions':{'elements':'kv'},
 'shipTreeGroups':{'elements':'kv','preReqSkills':'k','preReqSkills.skills':'k'},
 'stationOperations':{'stationTypes':'kv'},'stationStandingsRestrictions':{'services':'kv'},
 'typeElements':{'elements':'kv'},
}

# L'API serializza i float interi come int (1.0 -> 1); lo zip li ha float e `fmt` ne stampa
# la differenza ("Security: -1.0" vs "-1" nei documenti di Pochven). Verificato sulla build 3720952.
FLOAT_FIELDS = {'mapSolarSystems': ('securityStatus',)}


def apply_rule(rule,it):
    if not isinstance(it,dict) or not it: return it
    ks=list(it)
    if rule=='kv' and len(ks)==2: return {'_key':it[ks[0]],'_value':it[ks[1]]}
    if rule=='msg': return {'_key':it.get('kind'),**(it.get('text') or {})}
    d={'_key':it[ks[0]]}
    for k in ks[1:]: d[k]=it[k]
    return d

def walk(obj,parts,rule):
    if not isinstance(obj,dict) or parts[0] not in obj or not isinstance(obj[parts[0]],list): return
    lst=obj[parts[0]]
    if len(parts)==1: obj[parts[0]]=[apply_rule(rule,x) for x in lst]
    else:
        for x in lst: walk(x,parts[1:],rule)

def convert(t,r):
    items=list(r.items()); k0,v0=items[0]
    out={'_key':v0}
    if t in VALUE_TABLES: out['_value']=r.get(VALUE_TABLES[t])
    else:
        for k,v in items[1:]: out[k]=v
    for f in FLOAT_FIELDS.get(t, ()):
        if isinstance(out.get(f), int) and not isinstance(out[f], bool):
            out[f] = float(out[f])
    # deepest paths first so parents still have original key names
    for path,rule in sorted(NESTED.get(t,{}).items(),key=lambda p:-p[0].count('.')):
        walk(out,path.split('.'),rule)
    return out
