import json
from sqlalchemy import text
from app.db import engine

MAKS_CELLER = 20_000
CELLESTORLEIK = 20.0

ESTIMAT = text("""
    SELECT ST_Area(ST_Transform(ST_MakeValid(ST_GeomFromText(:wkt, 4326)), 25832))
           / (2.598 * :size * :size) AS n
""")

SQL = text("""
           WITH omriss AS (SELECT ST_Transform(ST_MakeValid(ST_GeomFromText(:wkt, 4326)), 25832) AS geom),
                celler AS (SELECT h.i, h.j, h.geom
                           FROM omriss, ST_HexagonGrid(:size, omriss.geom) AS h
                           WHERE ST_Intersects(h.geom, omriss.geom)),
                --Hentar alle dybdeomrader som overlappar med cella og reknar snittdybda(uvekta enn så lenge)
                omradedybde AS (
                    SELECT c.i, c.j, c.geom,
                        avg((a.minimumsdybde + a.maksimumsdybde) / 2.0 ) AS snitt
                    FROM celler c
                        JOIN dybde.dybdeareal a ON ST_Intersects(c.geom, a.omrade)
                    GROUP BY c.i, c.j, c.geom),
                --Returnerar ei liste med dybde og type til alle dybdepunkta i cella
                dybdepunkta AS (
                    SELECT c.i, c.j,
                        jsonb_agg(jsonb_build_array(a.dybdetype, a.dybde) ORDER BY a.dybde) AS punkt
                    FROM celler c
                        JOIN dybde.dybdepunkt a ON ST_Intersects(c.geom, a.posisjon)
                    GROUP BY c.i, c.j),
                --Returnerar ei liste over dybda til alle grunnane i cella
                grunner AS (
                    SELECT c.i, c.j,
                        jsonb_agg(g.dybde ORDER BY g.dybde) AS grunne
                    FROM celler c
                        JOIN dybde.grunne g ON ST_Intersects(c.geom, g.posisjon)
                    GROUP BY c.i, c.j),
                --Returnerar talet skjer i cella
                skjer AS (
                    SELECT c.i, c.j, count(*) AS tal_skjer
                    FROM celler c
                        JOIN dybde.skjer s ON ST_Intersects(c.geom, s.posisjon)
                    GROUP BY c.i, c.j),
                --Returnerar talet dybdekurver i cella og fallet frå høgst til lågast
                fall AS (
                    SELECT c.i, c.j, count(DISTINCT d.dybde) AS tal_kurver, max(d.dybde) - min(d.dybde) AS fall
                    FROM celler c
                        JOIN dybde.dybdekurve d ON ST_Intersects(c.geom, d.grense)
                    GROUP BY c.i, c.j)
           SELECT c.i,
                  c.j,
                  round(o.snitt::numeric, 1)                  AS djupne,
                  coalesce(p.punkt, '[]'::jsonb)              AS punkt,
                  coalesce(g.grunne, '[]'::jsonb)             AS grunner,
                  coalesce(s.tal_skjer, 0)                    AS tal_skjer,
                  coalesce(f.tal_kurver, 0)                   AS tal_kurver,
                  coalesce(f.fall, 0)                         AS fall,
                  ST_AsGeoJSON(ST_Transform(c.geom, 4326), 6) AS geom
           FROM celler c
                    LEFT JOIN omradedybde o USING (i, j)
                    LEFT JOIN dybdepunkta p USING (i, j)
                    LEFT JOIN grunner g USING (i, j)
                    LEFT JOIN skjer s USING (i, j)
                    LEFT JOIN fall f USING (i, j)
           """)


def _f(v):
    return float(v) if v is not None else None


def hent_celler(coords: list[tuple[float, float]]) -> list[dict]:
    """coords er [(lng, lat), ...], lukka ring."""
    if coords[0] != coords[-1]:
        coords = list(coords) + [coords[0]]
    wkt = "POLYGON((" + ",".join(f"{x} {y}" for x, y in coords) + "))"

    with engine.connect() as conn:
        n = conn.execute(ESTIMAT, {"wkt": wkt, "size": CELLESTORLEIK}).scalar()
        if n > MAKS_CELLER:
            raise ValueError(
                f"Omrisset gir ca. {int(n)} celler. Maks er {MAKS_CELLER}. "
                f"Marker eit mindre område."
            )
        rows = conn.execute(SQL, {"wkt": wkt, "size": CELLESTORLEIK}).fetchall()

    return [
        {"i": r.i, "j": r.j,
         "djupne": _f(r.djupne),
         "punkt": r.punkt,
         "grunner": r.grunner,
         "tal_skjer": r.tal_skjer,
         "tal_kurver": r.tal_kurver,
         "fall": _f(r.fall),
         "geom": json.loads(r.geom)}
        for r in rows
    ]