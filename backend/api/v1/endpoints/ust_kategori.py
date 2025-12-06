from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import ust_kategori

router = APIRouter()

@router.post("/ust-kategoriler/", response_model=ust_kategori.UstKategoriInDB, status_code=status.HTTP_201_CREATED)
def create_ust_kategori(ust_kategori: ust_kategori.UstKategoriCreate, db: Session = Depends(database.get_db)):
    return crud.create_ust_kategori(db=db, ust_kategori=ust_kategori)

@router.get("/ust-kategoriler/", response_model=List[ust_kategori.UstKategoriInDB])
def read_ust_kategoriler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    ust_kategoriler = crud.get_ust_kategoriler(db, skip=skip, limit=limit)
    return ust_kategoriler

@router.get("/ust-kategoriler/{ust_kategori_id}", response_model=ust_kategori.UstKategoriInDB)
def read_ust_kategori(ust_kategori_id: int, db: Session = Depends(database.get_db)):
    db_ust_kategori = crud.get_ust_kategori(db, ust_kategori_id=ust_kategori_id)
    if db_ust_kategori is None:
        raise HTTPException(status_code=404, detail="Ust Kategori not found")
    return db_ust_kategori

@router.put("/ust-kategoriler/{ust_kategori_id}", response_model=ust_kategori.UstKategoriInDB)
def update_ust_kategori(ust_kategori_id: int, ust_kategori: ust_kategori.UstKategoriUpdate, db: Session = Depends(database.get_db)):
    db_ust_kategori = crud.update_ust_kategori(db=db, ust_kategori_id=ust_kategori_id, ust_kategori=ust_kategori)
    if db_ust_kategori is None:
        raise HTTPException(status_code=404, detail="Ust Kategori not found")
    return db_ust_kategori

@router.delete("/ust-kategoriler/{ust_kategori_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ust_kategori(ust_kategori_id: int, db: Session = Depends(database.get_db)):
    db_ust_kategori = crud.delete_ust_kategori(db=db, ust_kategori_id=ust_kategori_id)
    if db_ust_kategori is None:
        raise HTTPException(status_code=404, detail="Ust Kategori not found")
    return {"message": "Ust Kategori deleted successfully"}
