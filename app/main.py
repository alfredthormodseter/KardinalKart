from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from app.grid import hent_celler

app = FastAPI()

class PolygonRequest(BaseModel):
    coordinates: list[tuple[float, float]] = Field(min_length=4)
    cell_size: float = Field(default=20.0, ge=5, le=500)

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/catches")
def get_catches():
    return {"catches": []}

@app.post("/create-grid")
def create_grid(req: PolygonRequest):
    return {"cells": hent_celler(req.coordinates, req.cell_size)}

app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)