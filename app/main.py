from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.grid import hent_celler

app = FastAPI()

#Sjekkar om create_grid kan bli kalla
class PolygonRequest(BaseModel):
    coordinates: list[tuple[float, float]] = Field(min_length=4)

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/catches")
def get_catches():
    return {"catches": []}

#Brukar hent_celler til å lage eit grid
@app.post("/create-grid")
def create_grid(req: PolygonRequest):
    try:
        return {"cells": hent_celler(req.coordinates)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)