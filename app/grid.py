import json
from sqlalchemy import text
from app.db import engine

MAKS_CELLER = 20_000

ESTIMAT = text("""
    SELECT ST_Area(ST_Transform(ST_GeomFromText(:wkt, 4326), 25832))
           / (2.598 * :size * :size) AS n
""")

SQL = text("""
           WITH omr AS (
               SELECT ST_Transform(ST_GeomFromText(:wkt, 4326), 25832) AS geom
           ),
                celler AS (
                    SELECT h.i, h.j, h.geom
                    FROM omr, ST_HexagonGrid(:size, omr.geom) AS h
                    WHERE ST_Intersects(h.geom, omr.geom)
                ),
                areal AS (
                    SELECT c.i, c.j, c.geom,
                           sum(((a.minimumsdybde + a.maksimumsdybde) / 2)
                               * ST_Area(ST_Intersection(a.omrade, c.geom)))
                               / nullif(sum(ST_Area(ST_Intersection(a.omrade, c.geom))), 0) AS djupne
                    FROM celler c
                             JOIN dybde.dybdeareal a ON ST_Intersects(c.geom, a.omrade)
                    GROUP BY c.i, c.j, c.geom
                ),
                punkt AS (
                    SELECT c.i, c.j,
                           count(*)      AS tal_punkt,
                           avg(d.dybde)  AS maalt_djupne
                    FROM celler c
                             JOIN dybde.dybdepunkt d ON ST_Intersects(c.geom, d.posisjon)
                    GROUP BY c.i, c.j
                ),
                grunner AS (
                    SELECT c.i, c.j,
                           count(*)     AS tal_grunner,
                           min(g.dybde) AS grunnaste
                    FROM celler c
                             JOIN dybde.grunne g ON ST_Intersects(c.geom, g.posisjon)
                    GROUP BY c.i, c.j
                ),
                skjer AS (
                    SELECT c.i, c.j, count(*) AS tal_skjer
                    FROM celler c
                             JOIN dybde.skjer s ON ST_Intersects(c.geom, s.posisjon)
                    GROUP BY c.i, c.j
                ),
                kurve AS (
                    SELECT c.i, c.j,
                           count(DISTINCT k.dybde)     AS nivaa,
                           max(k.dybde) - min(k.dybde) AS fall
                    FROM celler c
                             JOIN dybde.dybdekurve k ON ST_Intersects(c.geom, k.grense)
                    GROUP BY c.i, c.j
                )
           SELECT a.i, a.j,
                  round(a.djupne::numeric, 1)         AS djupne,
                  round(p.maalt_djupne::numeric, 1)   AS maalt_djupne,
                  coalesce(p.tal_punkt, 0)            AS tal_punkt,
                  round(g.grunnaste::numeric, 1)      AS grunnaste,
                  coalesce(g.tal_grunner, 0)          AS tal_grunner,
                  coalesce(s.tal_skjer, 0)            AS tal_skjer,
                  coalesce(k.fall, 0)                 AS fall,
                  ST_AsGeoJSON(ST_Transform(a.geom, 4326), 6) AS geom
           FROM areal a
                    LEFT JOIN punkt   p USING (i, j)
                    LEFT JOIN grunner g USING (i, j)
                    LEFT JOIN skjer   s USING (i, j)
                    LEFT JOIN kurve   k USING (i, j)
           """)


def _f(v):
    return float(v) if v is not None else None


def hent_celler(coords: list[tuple[float, float]], size: float) -> list[dict]:
    """coords er [(lng, lat), ...], lukka ring."""
    wkt = "POLYGON((" + ",".join(f"{x} {y}" for x, y in coords) + "))"

    with engine.connect() as conn:
        n = conn.execute(ESTIMAT, {"wkt": wkt, "size": size}).scalar()
        if n > MAKS_CELLER:
            raise ValueError(
                f"Omrisset gir ca. {int(n)} celler. Maks er {MAKS_CELLER}. "
                f"Auk cellestorleiken eller marker eit mindre område."
            )
        rows = conn.execute(SQL, {"wkt": wkt, "size": size}).fetchall()

    return [
        {"i": r.i, "j": r.j,
         "djupne": _f(r.djupne),
         "maalt_djupne": _f(r.maalt_djupne),
         "tal_punkt": r.tal_punkt,
         "grunnaste": _f(r.grunnaste),
         "tal_grunner": r.tal_grunner,
         "tal_skjer": r.tal_skjer,
         "fall": r.fall,
         "geom": json.loads(r.geom)}
        for r in rows
    ]