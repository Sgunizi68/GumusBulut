from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import avans_istek

router = APIRouter()

@router.post("/avans-istekler/", response_model=avans_istek.AvansIstekInDB, status_code=status.HTTP_201_CREATED)
def create_avans_istek(avans_istek: avans_istek.AvansIstekCreate, db: Session = Depends(database.get_db)):
    return crud.create_avans_istek(db=db, avans_istek=avans_istek)

@router.get("/avans-istekler/", response_model=List[avans_istek.AvansIstekInDB])
def read_avans_istekler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    avans_istekler = crud.get_avans_istekler(db, skip=skip, limit=limit)
    return avans_istekler

@router.get("/avans-istekler/{avans_id}", response_model=avans_istek.AvansIstekInDB)
def read_avans_istek(avans_id: int, db: Session = Depends(database.get_db)):
    db_avans_istek = crud.get_avans_istek(db, avans_id=avans_id)
    if db_avans_istek is None:
        raise HTTPException(status_code=404, detail="Avans İstek not found")
    return db_avans_istek

@router.put("/avans-istekler/{avans_id}", response_model=avans_istek.AvansIstekInDB)
def update_avans_istek(avans_id: int, avans_istek: avans_istek.AvansIstekUpdate, db: Session = Depends(database.get_db)):
    db_avans_istek = crud.update_avans_istek(db=db, avans_id=avans_id, avans_istek=avans_istek)
    if db_avans_istek is None:
        raise HTTPException(status_code=404, detail="Avans İstek not found")
    return db_avans_istek

@router.delete("/avans-istekler/{avans_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_avans_istek(avans_id: int, db: Session = Depends(database.get_db)):
    db_avans_istek = crud.delete_avans_istek(db=db, avans_id=avans_id)
    if db_avans_istek is None:
        raise HTTPException(status_code=404, detail="Avans İstek not found")
    return {"message": "Avans İstek deleted successfully"}
