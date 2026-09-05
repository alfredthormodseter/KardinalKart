from enum import IntEnum

VEKTER = {
    "djupne": 2.0,
    "punkt": 1.5,
    "grunne": 2.5,
    "skjer": 3.0,
    "fall": 2.0
}

DEPTH_BEST = (5.0, 20)
DEPTH_BETTER = (5.0, 35)
DEPTH_GOOD = (5.0, 50)

DEPTH_BANDS = [
    (DEPTH_BEST, 1.0),
    (DEPTH_BETTER, 0.75),
    (DEPTH_GOOD, 0.3),
]

USPESIFISERT = 1
SADELPUNKT = 2
SNAGPUNKT = 3
OMVENDT_SNAG = 4
DYPPUNKT = 5
KAIPUNKT = 6

class Dybdetype(IntEnum):
    USPESIFISERT = 1
    SADELPUNKT = 2
    SNAGPUNKT = 3
    OMVENDT_SNAG = 4
    DYPPUNKT = 5
    KAIPUNKT = 6

#Les kvar hummaren likar seg og ranger botntypane etter sådan:
PUNKT_VEKT = {
    Dybdetype.SADELPUNKT: 0.5,
    Dybdetype.SNAGPUNKT: 1.0,
    Dybdetype.OMVENDT_SNAG: 0.7,
    Dybdetype.DYPPUNKT: 0.7,
    Dybdetype.USPESIFISERT: 0.0,
    Dybdetype.KAIPUNKT: 0.0,
}

DELPOENG_NOKLAR = {"djupne", "grunne", "punkt", "skjer", "fall"}
assert DELPOENG_NOKLAR == VEKTER.keys(), (
    f"Mismatch: {DELPOENG_NOKLAR ^ VEKTER.keys()}"
)


def depth_score(depth: float | None) -> float:
    if depth is None:
        return 0.0
    d = abs(float(depth))
    for (lo, hi), score in DEPTH_BANDS:
        if lo <= d <= hi:
            return score
    return 0.0

#Funksjonen summar opp skåren til alle punkta i cella, vurder å endre skalaen til at score forblir mellom 0 og 1
def punkt_score(punkt: list) -> float:
    score = 0.0
    for p in punkt:
        dybdetype, dybde = p[0], p[1]
        vekt = PUNKT_VEKT.get(dybdetype, 0.0)
        if vekt > 0:
            score = score + vekt * depth_score(dybde)
    return round(score, 1)

def grunne_score(grunner: list) -> float:
    if not grunner:
        return 0.0
    return max(depth_score(g) for g in grunner)

def skjer_score(tal_skjer: int) -> float:
    if tal_skjer >= 1:
        return 1.0
    else:
        return 0.0

def steep_score(fall: float, tal_kurver: int) -> float:
    """Bratt overgang frå grunne til djupare vatn."""
    if tal_kurver < 2 or fall <= 0:
        return 0.0
    return min(1.0, float(fall) / 15.0)

def celle_score(celle: dict) -> dict:
    delpoeng = {
        "djupne": depth_score(celle.get("djupne")),
        "grunne": grunne_score(celle.get("grunner") or []),
        "punkt": punkt_score(celle.get("punkt") or []),
        "skjer": skjer_score(celle.get("tal_skjer") or 0),
        "fall": steep_score(celle.get("fall") or 0, celle.get("tal_kurver") or 0),
    }
    total = sum(delpoeng[k] * VEKTER.get(k, 0.0) for k in delpoeng)
    return {
        **celle,
        "poeng": round(total, 2),
        "delpoeng": {k: round(v, 2) for k, v in delpoeng.items()},
    }


def score_celler(celler: list[dict]) -> list[dict]:
    return [celle_score(c) for c in celler]