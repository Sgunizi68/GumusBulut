from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import puantaj

router = APIRouter()

@router.post("/puantajlar/", response_model=puantaj.PuantajInDB, status_code=status.HTTP_201_CREATED)
def create_puantaj(puantaj: puantaj.PuantajCreate, db: Session = Depends(database.get_db)):
    return crud.create_puantaj(db=db, puantaj=puantaj)

@router.get("/puantajlar/", response_model=List[puantaj.PuantajInDB])
def read_puantajlar(skip: int = 0, limit: int = 10000, db: Session = Depends(database.get_db)):
    puantajlar = crud.get_puantajlar(db, skip=skip, limit=limit)
    return puantajlar

@router.get("/puantajlar/{puantaj_id}", response_model=puantaj.PuantajInDB)
def read_puantaj(puantaj_id: int, db: Session = Depends(database.get_db)):
    db_puantaj = crud.get_puantaj(db, puantaj_id=puantaj_id)
    if db_puantaj is None:
        raise HTTPException(status_code=404, detail="Puantaj not found")
    return db_puantaj

@router.put("/puantajlar/{puantaj_id}", response_model=puantaj.PuantajInDB)
def update_puantaj(puantaj_id: int, puantaj: puantaj.PuantajUpdate, db: Session = Depends(database.get_db)):
    db_puantaj = crud.update_puantaj(db=db, puantaj_id=puantaj_id, puantaj=puantaj)
    if db_puantaj is None:
        raise HTTPException(status_code=404, detail="Puantaj not found")
    return db_puantaj

@router.delete("/puantajlar/{puantaj_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_puantaj(puantaj_id: int, db: Session = Depends(database.get_db)):
    db_puantaj = crud.delete_puantaj(db=db, puantaj_id=puantaj_id)
    if db_puantaj is None:
        raise HTTPException(status_code=404, detail="Puantaj not found")
    return {"message": "Puantaj deleted successfully"}
