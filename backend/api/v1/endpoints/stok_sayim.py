from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import stok_sayim

router = APIRouter()

@router.post("/stok-sayimlar/", response_model=stok_sayim.StokSayimInDB, status_code=status.HTTP_201_CREATED)
def create_stok_sayim(stok_sayim: stok_sayim.StokSayimCreate, db: Session = Depends(database.get_db)):
    return crud.create_stok_sayim(db=db, stok_sayim=stok_sayim)

@router.get("/stok-sayimlar/", response_model=List[stok_sayim.StokSayimInDB])
def read_stok_sayimlar(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    stok_sayimlar = crud.get_stok_sayimlar(db, skip=skip, limit=limit)
    return stok_sayimlar

@router.get("/stok-sayimlar/{sayim_id}", response_model=stok_sayim.StokSayimInDB)
def read_stok_sayim(sayim_id: int, db: Session = Depends(database.get_db)):
    db_stok_sayim = crud.get_stok_sayim(db, sayim_id=sayim_id)
    if db_stok_sayim is None:
        raise HTTPException(status_code=404, detail="Stok Sayım not found")
    return db_stok_sayim

@router.put("/stok-sayimlar/{sayim_id}", response_model=stok_sayim.StokSayimInDB)
def update_stok_sayim(sayim_id: int, stok_sayim: stok_sayim.StokSayimUpdate, db: Session = Depends(database.get_db)):
    db_stok_sayim = crud.update_stok_sayim(db=db, sayim_id=sayim_id, stok_sayim=stok_sayim)
    if db_stok_sayim is None:
        raise HTTPException(status_code=404, detail="Stok Sayım not found")
    return db_stok_sayim

@router.delete("/stok-sayimlar/{sayim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stok_sayim(sayim_id: int, db: Session = Depends(database.get_db)):
    db_stok_sayim = crud.delete_stok_sayim(db=db, sayim_id=sayim_id)
    if db_stok_sayim is None:
        raise HTTPException(status_code=404, detail="Stok Sayım not found")
    return {"message": "Stok Sayım deleted successfully"}
