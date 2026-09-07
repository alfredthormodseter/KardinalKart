import json
from sqlalchemy import text
from app.db import engine

DDL = text("""
           CREATE TABLE IF NOT EXISTS omraade (
                                                  id      int PRIMARY KEY DEFAULT 1,
                                                  omriss  geometry(POLYGON, 4326) NOT NULL,
               CONSTRAINT berre_ein_rad CHECK (id = 1)
               )
           """)

HENT = text("SELECT ST_AsGeoJSON(omriss, 6) AS geom FROM omraade WHERE id = 1")

LAGRE = text("""
             INSERT INTO omraade (id, omriss)
             VALUES (1, ST_GeomFromText(:wkt, 4326))
                 ON CONFLICT (id) DO UPDATE SET omriss = EXCLUDED.omriss
             """)


def lag_tabell() -> None:
    with engine.begin() as conn:
        conn.execute(DDL)


def hent_omraade() -> list | None:
    """Returnerer ringen som [[lng, lat], ...], eller None."""
    with engine.connect() as conn:
        rad = conn.execute(HENT).first()
    if rad is None:
        return None
    return json.loads(rad.geom)["coordinates"][0]


def lagre_omraade(coords: list[tuple[float, float]]) -> None:
    if coords[0] != coords[-1]:
        coords = list(coords) + [coords[0]]
    wkt = "POLYGON((" + ",".join(f"{x} {y}" for x, y in coords) + "))"
    with engine.begin() as conn:
        conn.execute(LAGRE, {"wkt": wkt})