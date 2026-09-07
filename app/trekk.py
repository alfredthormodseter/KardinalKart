import json
from sqlalchemy import text
from app.db import engine
from datetime import datetime, timedelta, timezone

DDL = text("""
           CREATE TABLE IF NOT EXISTS trekk (
                                                trekk_id           bigserial PRIMARY KEY,
                                                sett_tid           timestamptz NOT NULL,
                                                trekk_tid          timestamptz NOT NULL,
                                                posisjon           geography(POINT, 4326) NOT NULL,
               djupne             real,
               total_antall       int NOT NULL DEFAULT 0,
               undermaals_antall  int NOT NULL DEFAULT 0,
               CONSTRAINT undermaals_ikkje_fleire_enn_totalt
               CHECK (undermaals_antall <= total_antall),
               CONSTRAINT ikkje_negativ
               CHECK (total_antall >= 0 AND undermaals_antall >= 0),
               CONSTRAINT trekt_etter_sett
               CHECK (trekk_tid >= sett_tid)
               )
           """)

DDL_INDEKS = text("""
                  CREATE INDEX IF NOT EXISTS trekk_posisjon_idx
                      ON trekk USING gist (posisjon)
                  """)


def lag_tabell() -> None:
    with engine.begin() as conn:
        conn.execute(DDL)
        conn.execute(DDL_INDEKS)

LAGRE = text("""
             INSERT INTO trekk (sett_tid, trekk_tid, posisjon, djupne,
                                total_antall, undermaals_antall)
             VALUES (:sett_tid, :trekk_tid,
                     ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                     :djupne, :total_antall, :undermaals_antall)
                 RETURNING trekk_id
             """)


def lagre_trekk(lat: float, lng: float, staatid_dagar: int,
                total_antall: int, undermaals_antall: int,
                djupne: float | None = None) -> int:
    trekk_tid = datetime.now(timezone.utc)
    sett_tid = trekk_tid - timedelta(days=staatid_dagar)
    with engine.begin() as conn:
        return conn.execute(LAGRE, {
            "sett_tid": sett_tid,
            "trekk_tid": trekk_tid,
            "lat": lat, "lng": lng,
            "djupne": djupne,
            "total_antall": total_antall,
            "undermaals_antall": undermaals_antall,
        }).scalar()