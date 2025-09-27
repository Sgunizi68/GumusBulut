from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db import crud, database
from schemas import calisan_talep

router = APIRouter()

@router.get("/calisan-talepler/", response_model=List[calisan_talep.CalisanTalep])
def read_calisan_talepler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    talepler = crud.get_calisan_talepler(db, skip=skip, limit=limit)
    return talepler

@router.get("/calisan-talepler/{talep_id}", response_model=calisan_talep.CalisanTalep)
def read_calisan_talep(talep_id: int, db: Session = Depends(database.get_db)):
    db_talep = crud.get_calisan_talep(db, talep_id=talep_id)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    return db_talep

@router.put("/calisan-talepler/{talep_id}", response_model=calisan_talep.CalisanTalep)
def update_calisan_talep(talep_id: int, talep: calisan_talep.CalisanTalepUpdate, db: Session = Depends(database.get_db)):
    db_talep = crud.update_calisan_talep(db, talep_id=talep_id, talep=talep)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    return db_talep