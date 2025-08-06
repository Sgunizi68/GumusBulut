from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import stok_fiyat

router = APIRouter()

@router.post("/stok-fiyatlar/", response_model=stok_fiyat.StokFiyatInDB, status_code=status.HTTP_201_CREATED)
def create_stok_fiyat(stok_fiyat: stok_fiyat.StokFiyatCreate, db: Session = Depends(database.get_db)):
    return crud.create_stok_fiyat(db=db, stok_fiyat=stok_fiyat)

@router.get("/stok-fiyatlar/", response_model=List[stok_fiyat.StokFiyatInDB])
def read_stok_fiyatlar(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    stok_fiyatlar = crud.get_stok_fiyatlar(db, skip=skip, limit=limit)
    return stok_fiyatlar

@router.get("/stok-fiyatlar/{fiyat_id}", response_model=stok_fiyat.StokFiyatInDB)
def read_stok_fiyat(fiyat_id: int, db: Session = Depends(database.get_db)):
    db_stok_fiyat = crud.get_stok_fiyat(db, fiyat_id=fiyat_id)
    if db_stok_fiyat is None:
        raise HTTPException(status_code=404, detail="Stok Fiyat not found")
    return db_stok_fiyat

@router.put("/stok-fiyatlar/{fiyat_id}", response_model=stok_fiyat.StokFiyatInDB)
def update_stok_fiyat(fiyat_id: int, stok_fiyat: stok_fiyat.StokFiyatUpdate, db: Session = Depends(database.get_db)):
    db_stok_fiyat = crud.update_stok_fiyat(db=db, fiyat_id=fiyat_id, stok_fiyat=stok_fiyat)
    if db_stok_fiyat is None:
        raise HTTPException(status_code=404, detail="Stok Fiyat not found")
    return db_stok_fiyat

@router.delete("/stok-fiyatlar/{fiyat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stok_fiyat(fiyat_id: int, db: Session = Depends(database.get_db)):
    db_stok_fiyat = crud.delete_stok_fiyat(db=db, fiyat_id=fiyat_id)
    if db_stok_fiyat is None:
        raise HTTPException(status_code=404, detail="Stok Fiyat not found")
    return {"message": "Stok Fiyat deleted successfully"}
