from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database
from schemas import odeme_referans

router = APIRouter()

@router.post("/Odeme_Referans/", response_model=odeme_referans.OdemeReferansInDB, status_code=status.HTTP_201_CREATED)
def create_new_odeme_referans(referans_data: odeme_referans.OdemeReferansCreate, db: Session = Depends(database.get_db)):
    return crud.create_odeme_referans(db=db, odeme_referans=referans_data)

@router.get("/Odeme_Referans/", response_model=List[odeme_referans.OdemeReferansInDB])
def read_odeme_referanslar(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    referanslar = crud.get_odeme_referanslar(db, skip=skip, limit=limit)
    return referanslar

@router.get("/Odeme_Referans/{referans_id}", response_model=odeme_referans.OdemeReferansInDB)
def read_odeme_referans(referans_id: int, db: Session = Depends(database.get_db)):
    db_referans = crud.get_odeme_referans(db, referans_id=referans_id)
    if db_referans is None:
        raise HTTPException(status_code=404, detail="OdemeReferans not found")
    return db_referans

@router.put("/Odeme_Referans/{referans_id}", response_model=odeme_referans.OdemeReferansInDB)
def update_existing_odeme_referans(referans_id: int, referans_data: odeme_referans.OdemeReferansUpdate, db: Session = Depends(database.get_db)):
    db_referans = crud.update_odeme_referans(db=db, referans_id=referans_id, odeme_referans=referans_data)
    if db_referans is None:
        raise HTTPException(status_code=404, detail="OdemeReferans not found")
    return db_referans

@router.delete("/Odeme_Referans/{referans_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_odeme_referans(referans_id: int, db: Session = Depends(database.get_db)):
    db_referans = crud.delete_odeme_referans(db=db, referans_id=referans_id)
    if db_referans is None:
        raise HTTPException(status_code=404, detail="OdemeReferans not found")
    return {"message": "OdemeReferans deleted successfully"}
