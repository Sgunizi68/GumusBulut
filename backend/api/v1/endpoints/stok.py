from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import stok, stok_fiyat, stok_sayim

router = APIRouter()

@router.post("/stoklar/", response_model=stok.StokInDB, status_code=status.HTTP_201_CREATED)
def create_stok(stok: stok.StokCreate, db: Session = Depends(database.get_db)):
    return crud.create_stok(db=db, stok=stok)

@router.get("/stoklar/", response_model=List[stok.StokInDB])
def read_stoklar(skip: int = 0, db: Session = Depends(database.get_db)):
    stoklar = crud.get_stoklar(db, skip=skip)
    return stoklar

@router.get("/stoklar/{stok_id}", response_model=stok.StokInDB)
def read_stok(stok_id: int, db: Session = Depends(database.get_db)):
    db_stok = crud.get_stok(db, stok_id=stok_id)
    if db_stok is None:
        raise HTTPException(status_code=404, detail="Stok not found")
    return db_stok

@router.put("/stoklar/{stok_id}", response_model=stok.StokInDB)
def update_stok(stok_id: int, stok: stok.StokUpdate, db: Session = Depends(database.get_db)):
    db_stok = crud.update_stok(db=db, stok_id=stok_id, stok=stok)
    if db_stok is None:
        raise HTTPException(status_code=404, detail="Stok not found")
    return db_stok

@router.delete("/stoklar/{stok_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stok(stok_id: int, db: Session = Depends(database.get_db)):
    db_stok = crud.delete_stok(db=db, stok_id=stok_id)
    if db_stok is None:
        raise HTTPException(status_code=404, detail="Stok not found")
    return {"message": "Stok deleted successfully"}



@router.post("/stok-fiyatlar/", response_model=stok_fiyat.StokFiyatInDB, status_code=status.HTTP_201_CREATED)
def create_stok_fiyat(stok_fiyat: stok_fiyat.StokFiyatCreate, db: Session = Depends(database.get_db)):
    return crud.create_stok_fiyat(db=db, stok_fiyat=stok_fiyat)

@router.get("/stok-fiyatlar/", response_model=List[stok_fiyat.StokFiyatInDB])
def read_stok_fiyatlar(skip: int = 0, db: Session = Depends(database.get_db)):
    stok_fiyatlar = crud.get_stok_fiyatlar(db, skip=skip)
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

@router.post("/stok-sayimlar/", response_model=stok_sayim.StokSayimInDB, status_code=status.HTTP_201_CREATED)
def create_stok_sayim(stok_sayim: stok_sayim.StokSayimCreate, db: Session = Depends(database.get_db)):
    return crud.create_stok_sayim(db=db, stok_sayim=stok_sayim)

@router.get("/stok-sayimlar/", response_model=List[stok_sayim.StokSayimInDB])
def read_stok_sayimlar(skip: int = 0, db: Session = Depends(database.get_db)):
    stok_sayimlar = crud.get_stok_sayimlar(db, skip=skip)
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
