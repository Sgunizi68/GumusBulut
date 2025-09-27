from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db import crud, models
from schemas import calisan_talep
from db import database

router = APIRouter()

@router.get("/calisan-talepler/", response_model=List[calisan_talep.CalisanTalep])
def read_calisan_talepler(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 100,
):
    try:
        talepler = crud.get_calisan_talepler(db, skip=skip, limit=limit)
        return talepler
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/calisan-talepler/", response_model=calisan_talep.CalisanTalep)
def create_calisan_talep(
    *, 
    db: Session = Depends(database.get_db), 
    talep_in: calisan_talep.CalisanTalepCreate
):
    talep = crud.create_calisan_talep(db=db, talep=talep_in)
    return talep

@router.get("/calisan-talepler/{calisan_talep_id}", response_model=calisan_talep.CalisanTalep)
def read_calisan_talep(
    calisan_talep_id: int,
    db: Session = Depends(database.get_db),
):
    db_talep = crud.get_calisan_talep(db, calisan_talep_id=calisan_talep_id)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    return db_talep

@router.put("/calisan-talepler/{calisan_talep_id}", response_model=calisan_talep.CalisanTalep)
def update_calisan_talep(
    calisan_talep_id: int,
    *, 
    db: Session = Depends(database.get_db), 
    talep_in: calisan_talep.CalisanTalepUpdate
):
    db_talep = crud.get_calisan_talep(db, calisan_talep_id=calisan_talep_id)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    talep = crud.update_calisan_talep(db=db, calisan_talep_id=calisan_talep_id, talep=talep_in)
    return talep

@router.delete("/calisan-talepler/{calisan_talep_id}", response_model=calisan_talep.CalisanTalep)
def delete_calisan_talep(
    calisan_talep_id: int,
    db: Session = Depends(database.get_db),
):
    db_talep = crud.get_calisan_talep(db, calisan_talep_id=calisan_talep_id)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    talep = crud.delete_calisan_talep(db=db, calisan_talep_id=calisan_talep_id)
    return talep
