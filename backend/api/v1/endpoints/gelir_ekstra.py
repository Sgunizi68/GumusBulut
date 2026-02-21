from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import gelir_ekstra

router = APIRouter()

@router.post("/upload-tabak-sayisi/")
def upload_tabak_sayisi(
    file: UploadFile = File(...),
    sube_id: int = Form(...),
    db: Session = Depends(database.get_db)
):
    result = crud.process_tabak_sayisi_excel(db=db, file=file, sube_id=sube_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/gelir-ekstra/", response_model=gelir_ekstra.GelirEkstraInDB, status_code=status.HTTP_201_CREATED)
def create_gelir_ekstra(gelir_ekstra: gelir_ekstra.GelirEkstraCreate, db: Session = Depends(database.get_db)):
    return crud.create_gelir_ekstra(db=db, gelir_ekstra=gelir_ekstra)

@router.get("/gelir-ekstra/", response_model=List[gelir_ekstra.GelirEkstraInDB])
def read_gelir_ekstralar(skip: int = 0, limit: int | None = None, db: Session = Depends(database.get_db)):
    gelir_ekstralar = crud.get_gelir_ekstralar(db, skip=skip, limit=limit)
    return gelir_ekstralar

@router.get("/gelir-ekstra/{gelir_ekstra_id}", response_model=gelir_ekstra.GelirEkstraInDB)
def read_gelir_ekstra(gelir_ekstra_id: int, db: Session = Depends(database.get_db)):
    db_gelir_ekstra = crud.get_gelir_ekstra(db, gelir_ekstra_id=gelir_ekstra_id)
    if db_gelir_ekstra is None:
        raise HTTPException(status_code=404, detail="Gelir Ekstra not found")
    return db_gelir_ekstra

@router.put("/gelir-ekstra/{gelir_ekstra_id}", response_model=gelir_ekstra.GelirEkstraInDB)
def update_gelir_ekstra(gelir_ekstra_id: int, gelir_ekstra: gelir_ekstra.GelirEkstraUpdate, db: Session = Depends(database.get_db)):
    db_gelir_ekstra = crud.update_gelir_ekstra(db=db, gelir_ekstra_id=gelir_ekstra_id, gelir_ekstra=gelir_ekstra)
    if db_gelir_ekstra is None:
        raise HTTPException(status_code=404, detail="Gelir Ekstra not found")
    return db_gelir_ekstra

@router.delete("/gelir-ekstra/{gelir_ekstra_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gelir_ekstra(gelir_ekstra_id: int, db: Session = Depends(database.get_db)):
    db_gelir_ekstra = crud.delete_gelir_ekstra(db=db, gelir_ekstra_id=gelir_ekstra_id)
    if db_gelir_ekstra is None:
        raise HTTPException(status_code=404, detail="Gelir Ekstra not found")
    return {"message": "Gelir Ekstra deleted successfully"}
