from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db import crud
from schemas import cari
from db.database import get_db

router = APIRouter()

@router.post("/cari/", response_model=cari.Cari)
def create_cari(cari_data: cari.CariCreate, db: Session = Depends(get_db)):
    return crud.create_cari(db=db, cari_data=cari_data)

@router.get("/cari/", response_model=List[cari.Cari])
def read_cariler(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cariler = crud.get_cariler(db, skip=skip, limit=limit)
    return cariler

@router.get("/cari/{cari_id}", response_model=cari.Cari)
def read_cari(cari_id: int, db: Session = Depends(get_db)):
    db_cari = crud.get_cari(db, cari_id=cari_id)
    if db_cari is None:
        raise HTTPException(status_code=404, detail="Cari not found")
    return db_cari

@router.put("/cari/{cari_id}", response_model=cari.Cari)
def update_cari(cari_id: int, cari_data: cari.CariUpdate, db: Session = Depends(get_db)):
    db_cari = crud.get_cari(db, cari_id=cari_id)
    if db_cari is None:
        raise HTTPException(status_code=404, detail="Cari not found")
    return crud.update_cari(db=db, cari_id=cari_id, cari_data=cari_data)

@router.delete("/cari/{cari_id}", response_model=cari.Cari)
def delete_cari(cari_id: int, db: Session = Depends(get_db)):
    db_cari = crud.get_cari(db, cari_id=cari_id)
    if db_cari is None:
        raise HTTPException(status_code=404, detail="Cari not found")
    return crud.delete_cari(db=db, cari_id=cari_id)
