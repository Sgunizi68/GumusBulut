from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import gelir

router = APIRouter()

@router.post("/gelirler/", response_model=gelir.GelirInDB, status_code=status.HTTP_201_CREATED)
def create_gelir(gelir: gelir.GelirCreate, db: Session = Depends(database.get_db)):
    return crud.create_gelir(db=db, gelir=gelir)

@router.get("/gelirler/", response_model=List[gelir.GelirInDB])
def read_gelirler(skip: int = 0, limit: int | None = None, db: Session = Depends(database.get_db)):
    gelirler = crud.get_gelirler(db, skip=skip, limit=limit)
    return gelirler

@router.get("/gelirler/{gelir_id}", response_model=gelir.GelirInDB)
def read_gelir(gelir_id: int, db: Session = Depends(database.get_db)):
    db_gelir = crud.get_gelir(db, gelir_id=gelir_id)
    if db_gelir is None:
        raise HTTPException(status_code=404, detail="Gelir not found")
    return db_gelir

@router.put("/gelirler/{gelir_id}", response_model=gelir.GelirInDB)
def update_gelir(gelir_id: int, gelir: gelir.GelirUpdate, db: Session = Depends(database.get_db)):
    db_gelir = crud.update_gelir(db=db, gelir_id=gelir_id, gelir=gelir)
    if db_gelir is None:
        raise HTTPException(status_code=404, detail="Gelir not found")
    return db_gelir

@router.delete("/gelirler/{gelir_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gelir(gelir_id: int, db: Session = Depends(database.get_db)):
    db_gelir = crud.delete_gelir(db=db, gelir_id=gelir_id)
    if db_gelir is None:
        raise HTTPException(status_code=404, detail="Gelir not found")
    return {"message": "Gelir deleted successfully"}
