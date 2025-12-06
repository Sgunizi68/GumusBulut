from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, models
from schemas import e_fatura_referans
from db.database import get_db

router = APIRouter()

@router.post("/e-fatura-referans/", response_model=e_fatura_referans.EFaturaReferansInDB, status_code=status.HTTP_201_CREATED)
def create_efatura_referans(efatura_referans: e_fatura_referans.EFaturaReferansCreate, db: Session = Depends(get_db)):
    db_efatura_referans = crud.get_efatura_referans(db, alici_unvani=efatura_referans.Alici_Unvani)
    if db_efatura_referans:
        raise HTTPException(status_code=400, detail="e-Fatura Referans already registered")
    return crud.create_efatura_referans(db=db, efatura_referans=efatura_referans)

@router.get("/e-fatura-referans/", response_model=List[e_fatura_referans.EFaturaReferansInDB])
def read_efatura_referanslar(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    efatura_referanslar = crud.get_efatura_referanslar(db, skip=skip, limit=limit)
    return efatura_referanslar

@router.get("/e-fatura-referans/{alici_unvani}", response_model=e_fatura_referans.EFaturaReferansInDB)
def read_efatura_referans(alici_unvani: str, db: Session = Depends(get_db)):
    db_efatura_referans = crud.get_efatura_referans(db, alici_unvani=alici_unvani)
    if db_efatura_referans is None:
        raise HTTPException(status_code=404, detail="e-Fatura Referans not found")
    return db_efatura_referans

@router.put("/e-fatura-referans/{alici_unvani}", response_model=e_fatura_referans.EFaturaReferansInDB)
def update_efatura_referans(alici_unvani: str, efatura_referans: e_fatura_referans.EFaturaReferansUpdate, db: Session = Depends(get_db)):
    db_efatura_referans = crud.update_efatura_referans(db=db, alici_unvani=alici_unvani, efatura_referans=efatura_referans)
    if db_efatura_referans is None:
        raise HTTPException(status_code=404, detail="e-Fatura Referans not found")
    return db_efatura_referans

@router.delete("/e-fatura-referans/{alici_unvani}", status_code=status.HTTP_204_NO_CONTENT)
def delete_efatura_referans(alici_unvani: str, db: Session = Depends(get_db)):
    db_efatura_referans = crud.delete_efatura_referans(db=db, alici_unvani=alici_unvani)
    if db_efatura_referans is None:
        raise HTTPException(status_code=404, detail="e-Fatura Referans not found")
    return {"message": "e-Fatura Referans deleted successfully"}
