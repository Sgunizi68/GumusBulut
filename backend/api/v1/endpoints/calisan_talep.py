from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
from datetime import date, datetime

from db import crud, database
from schemas import calisan_talep

router = APIRouter()

@router.post("/calisan-talepler/", response_model=calisan_talep.CalisanTalep, status_code=201)
async def create_calisan_talep(
    talep: calisan_talep.CalisanTalepCreate,
    db: Session = Depends(database.get_db)
):
    db_talep = crud.create_calisan_talep(db, talep=talep)
    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')
    return db_talep

@router.get("/calisan-talepler/", response_model=List[calisan_talep.CalisanTalep])
def read_calisan_talepler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    talepler = crud.get_calisan_talepler(db, skip=skip, limit=limit)
    for talep in talepler:
        if talep.Imaj:
            talep.Imaj = base64.b64encode(talep.Imaj).decode('utf-8')
    return talepler

@router.get("/calisan-talepler/by-tc/{tc_no}", response_model=calisan_talep.CalisanTalep)
def read_calisan_talep_by_tc_no(tc_no: str, db: Session = Depends(database.get_db)):
    db_talep = crud.get_calisan_talep_by_tc_no(db, tc_no=tc_no)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')
    return db_talep

@router.get("/calisan-talepler/{talep_id}", response_model=calisan_talep.CalisanTalep)
def read_calisan_talep(talep_id: int, db: Session = Depends(database.get_db)):
    db_talep = crud.get_calisan_talep(db, talep_id=talep_id)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')
    return db_talep

@router.put("/calisan-talepler/{talep_id}", response_model=calisan_talep.CalisanTalep)
async def update_calisan_talep(
    talep_id: int,
    talep: calisan_talep.CalisanTalepUpdate,
    db: Session = Depends(database.get_db)
):
    db_talep = crud.update_calisan_talep(db, talep_id=talep_id, talep=talep)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')
    return db_talep

@router.delete("/calisan-talepler/{talep_id}", status_code=204)
def delete_calisan_talep(talep_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_calisan_talep(db, talep_id=talep_id)
    if not success:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    return {"ok": True}