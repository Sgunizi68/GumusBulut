from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import puantaj_secimi

router = APIRouter()

@router.post("/puantaj-secimi/", response_model=puantaj_secimi.PuantajSecimiInDB, status_code=status.HTTP_201_CREATED)
def create_puantaj_secimi(puantaj_secimi: puantaj_secimi.PuantajSecimiCreate, db: Session = Depends(database.get_db)):
    return crud.create_puantaj_secimi(db=db, puantaj_secimi=puantaj_secimi)

@router.get("/puantaj-secimi/", response_model=List[puantaj_secimi.PuantajSecimiInDB])
def read_puantaj_secimleri(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    puantaj_secimleri = crud.get_puantaj_secimleri(db, skip=skip, limit=limit)
    return puantaj_secimleri

@router.get("/puantaj-secimi/{secim_id}", response_model=puantaj_secimi.PuantajSecimiInDB)
def read_puantaj_secimi(secim_id: int, db: Session = Depends(database.get_db)):
    db_puantaj_secimi = crud.get_puantaj_secimi(db, secim_id=secim_id)
    if db_puantaj_secimi is None:
        raise HTTPException(status_code=404, detail="Puantaj Secimi not found")
    return db_puantaj_secimi

@router.put("/puantaj-secimi/{secim_id}", response_model=puantaj_secimi.PuantajSecimiInDB)
def update_puantaj_secimi(secim_id: int, puantaj_secimi: puantaj_secimi.PuantajSecimiUpdate, db: Session = Depends(database.get_db)):
    db_puantaj_secimi = crud.update_puantaj_secimi(db=db, secim_id=secim_id, puantaj_secimi=puantaj_secimi)
    if db_puantaj_secimi is None:
        raise HTTPException(status_code=404, detail="Puantaj Secimi not found")
    return db_puantaj_secimi

@router.delete("/puantaj-secimi/{secim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_puantaj_secimi(secim_id: int, db: Session = Depends(database.get_db)):
    db_puantaj_secimi = crud.delete_puantaj_secimi(db=db, secim_id=secim_id)
    if db_puantaj_secimi is None:
        raise HTTPException(status_code=404, detail="Puantaj Secimi not found")
    return {"message": "Puantaj Secimi deleted successfully"}
