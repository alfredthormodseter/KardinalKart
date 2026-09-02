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
                snitt AS (
                    SELECT c.i, c.j, c.geom,
                           sum(((a.minimumsdybde + a.maksimumsdybde) / 2)
                               * ST_Area(ST_Intersection(a.omrade, c.geom)))
                               / nullif(sum(ST_Area(ST_Intersection(a.omrade, c.geom))), 0) AS djupne
                    FROM celler c
                             JOIN dybde.dybdeareal a ON ST_Intersects(c.geom, a.omrade)
                    GROUP BY c.i, c.j, c.geom
                )
           SELECT i, j, round(djupne::numeric, 1) AS djupne,
                  ST_AsGeoJSON(ST_Transform(geom, 4326), 6) AS geom
           FROM snitt
           """)


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
         "djupne": float(r.djupne) if r.djupne is not None else None,
         "geom": json.loads(r.geom)}
        for r in rows
    ]