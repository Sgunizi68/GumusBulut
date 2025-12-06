from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import kategori

router = APIRouter()

@router.post("/kategoriler/", response_model=kategori.KategoriInDB, status_code=status.HTTP_201_CREATED)
def create_kategori(kategori: kategori.KategoriCreate, db: Session = Depends(database.get_db)):
    return crud.create_kategori(db=db, kategori=kategori)

@router.get("/kategoriler/", response_model=List[kategori.KategoriInDB])
def read_kategoriler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    kategoriler = crud.get_kategoriler(db, skip=skip, limit=limit)
    return kategoriler

@router.get("/kategoriler/{kategori_id}", response_model=kategori.KategoriInDB)
def read_kategori(kategori_id: int, db: Session = Depends(database.get_db)):
    db_kategori = crud.get_kategori(db, kategori_id=kategori_id)
    if db_kategori is None:
        raise HTTPException(status_code=404, detail="Kategori not found")
    return db_kategori

@router.put("/kategoriler/{kategori_id}", response_model=kategori.KategoriInDB)
def update_kategori(kategori_id: int, kategori: kategori.KategoriUpdate, db: Session = Depends(database.get_db)):
    db_kategori = crud.update_kategori(db=db, kategori_id=kategori_id, kategori=kategori)
    if db_kategori is None:
        raise HTTPException(status_code=404, detail="Kategori not found")
    return db_kategori

@router.delete("/kategoriler/{kategori_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kategori(kategori_id: int, db: Session = Depends(database.get_db)):
    db_kategori = crud.delete_kategori(db=db, kategori_id=kategori_id)
    if db_kategori is None:
        raise HTTPException(status_code=404, detail="Kategori not found")
    return {"message": "Kategori deleted successfully"}
