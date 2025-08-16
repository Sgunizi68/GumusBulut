from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database
from schemas import odeme

router = APIRouter()

@router.post("/Odeme/", response_model=odeme.OdemeInDB, status_code=status.HTTP_201_CREATED)
def create_new_odeme(odeme_data: odeme.OdemeCreate, db: Session = Depends(database.get_db)):
    return crud.create_odeme(db=db, odeme=odeme_data)

@router.get("/Odeme/", response_model=List[odeme.OdemeInDB])
def read_odemeler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    odemeler = crud.get_odemeler(db, skip=skip, limit=limit)
    return odemeler

@router.get("/Odeme/{odeme_id}", response_model=odeme.OdemeInDB)
def read_odeme(odeme_id: int, db: Session = Depends(database.get_db)):
    db_odeme = crud.get_odeme(db, odeme_id=odeme_id)
    if db_odeme is None:
        raise HTTPException(status_code=404, detail="Odeme not found")
    return db_odeme

@router.put("/Odeme/{odeme_id}", response_model=odeme.OdemeInDB)
def update_existing_odeme(odeme_id: int, odeme_data: odeme.OdemeUpdate, db: Session = Depends(database.get_db)):
    db_odeme = crud.update_odeme(db=db, odeme_id=odeme_id, odeme=odeme_data)
    if db_odeme is None:
        raise HTTPException(status_code=404, detail="Odeme not found")
    return db_odeme

@router.delete("/Odeme/{odeme_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_odeme(odeme_id: int, db: Session = Depends(database.get_db)):
    db_odeme = crud.delete_odeme(db=db, odeme_id=odeme_id)
    if db_odeme is None:
        raise HTTPException(status_code=404, detail="Odeme not found")
    return {"message": "Odeme deleted successfully"}
