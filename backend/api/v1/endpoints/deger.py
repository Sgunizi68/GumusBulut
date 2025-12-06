from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database
from schemas import deger

router = APIRouter()

@router.post("/degerler/", response_model=deger.Deger, status_code=status.HTTP_201_CREATED)
def create_deger(deger: deger.DegerCreate, db: Session = Depends(database.get_db)):
    return crud.create_deger(db=db, deger=deger)

@router.get("/degerler/", response_model=List[deger.Deger])
def read_degerler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    degerler = crud.get_degerler(db, skip=skip, limit=limit)
    return degerler

@router.get("/degerler/{deger_id}", response_model=deger.Deger)
def read_deger(deger_id: int, db: Session = Depends(database.get_db)):
    db_deger = crud.get_deger(db, deger_id=deger_id)
    if db_deger is None:
        raise HTTPException(status_code=404, detail="Deger not found")
    return db_deger

@router.put("/degerler/{deger_id}", response_model=deger.Deger)
def update_deger(deger_id: int, deger: deger.DegerUpdate, db: Session = Depends(database.get_db)):
    db_deger = crud.update_deger(db=db, deger_id=deger_id, deger=deger)
    if db_deger is None:
        raise HTTPException(status_code=404, detail="Deger not found")
    return db_deger

@router.delete("/degerler/{deger_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deger(deger_id: int, db: Session = Depends(database.get_db)):
    db_deger = crud.delete_deger(db=db, deger_id=deger_id)
    if db_deger is None:
        raise HTTPException(status_code=404, detail="Deger not found")
    return {"message": "Deger deleted successfully"}