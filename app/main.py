from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.grid import hent_celler
from app.kalkulering import score_celler
from app.omraade import lag_tabell, hent_omraade, lagre_omraade
from contextlib import asynccontextmanager
from app.trekk import lag_tabell as lag_trekk_tabell, lagre_trekk

@asynccontextmanager
async def lifespan(app: FastAPI):
    lag_tabell()
    yield

app = FastAPI(lifespan=lifespan)

#Sjekkar om create_grid kan bli kalla
class PolygonRequest(BaseModel):
    coordinates: list[tuple[float, float]] = Field(min_length=4)

class TrekkRequest(BaseModel):
    lat: float
    lng: float
    staatid_dagar: int = Field(ge=1, le=5)
    total_antall: int = Field(ge=0)
    undermaals_antall: int = Field(ge=0)
    djupne: float | None = None

@app.post("/trekk")
def post_trekk(req: TrekkRequest):
    if req.undermaals_antall > req.total_antall:
        raise HTTPException(400, "Undermåls kan ikkje vere fleire enn totalt.")
    return {"trekk_id": lagre_trekk(**req.model_dump())}

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/omraade")
def get_omraade():
    return {"coordinates": hent_omraade()}

@app.put("/omraade")
def put_omraade(req: PolygonRequest):
    lagre_omraade(req.coordinates)
    return {"ok": True}

@app.get("/catches")
def get_catches():
    return {"catches": []}

@asynccontextmanager
async def lifespan(app: FastAPI):
    lag_tabell()
    lag_trekk_tabell()
    yield

@app.post("/create-grid")
def create_grid(req: PolygonRequest):
    try:
        celler = hent_celler(req.coordinates)
        if isinstance(celler, dict) and "error" in celler:
            return {"status": celler["error"]}

        celler = score_celler(celler)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "cells": celler,
        "maks_poeng": max((c["poeng"] for c in celler), default=0.0),
        "status": f"Lastar varmekart med {len(celler)} celler..."
    }

app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)