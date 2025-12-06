from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from decimal import Decimal
import base64

from db import crud, database, models
from schemas import nakit

router = APIRouter()

@router.post("/nakit/", response_model=nakit.NakitInDB, status_code=status.HTTP_201_CREATED)
def create_nakit_entry(
    tarih: date = Form(...),
    tutar: Decimal = Form(...),
    tip: Optional[str] = Form("Bankaya Yatan"),
    donem: int = Form(...),
    sube_id: int = Form(...),
    imaj_adi: Optional[str] = Form(None),
    imaj: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    nakit_data = {
        "Tarih": tarih,
        "Tutar": tutar,
        "Tip": tip,
        "Donem": donem,
        "Sube_ID": sube_id,
        "Imaj_Adı": imaj_adi
    }
    if imaj:
        nakit_data["Imaj"] = imaj.file.read()

    nakit_in = nakit.NakitCreate(**nakit_data)
    return crud.create_nakit(db=db, nakit=nakit_in)

@router.get("/nakit/", response_model=List[nakit.NakitInDB])
def read_nakit_entries(skip: int = 0, limit: int = 10000, sube_id: Optional[int] = None, db: Session = Depends(database.get_db)):
    nakit_entries = crud.get_nakit_entries(db, skip=skip, limit=limit, sube_id=sube_id)
    for entry in nakit_entries:
        if entry.Imaj:
            entry.Imaj = base64.b64encode(entry.Imaj).decode('utf-8')
    return nakit_entries

@router.get("/nakit/{nakit_id}", response_model=nakit.NakitInDB)
def read_nakit_entry(nakit_id: int, db: Session = Depends(database.get_db)):
    db_nakit = crud.get_nakit(db, nakit_id=nakit_id)
    if db_nakit is None:
        raise HTTPException(status_code=404, detail="Nakit entry not found")
    return db_nakit

@router.put("/nakit/{nakit_id}", response_model=nakit.NakitInDB)
def update_existing_nakit_entry(
    nakit_id: int,
    tarih: Optional[date] = Form(None),
    tutar: Optional[Decimal] = Form(None),
    tip: Optional[str] = Form(None),
    donem: Optional[int] = Form(None),
    sube_id: Optional[int] = Form(None),
    imaj_adi: Optional[str] = Form(None),
    imaj: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    update_data = {
        "Tarih": tarih,
        "Tutar": tutar,
        "Tip": tip,
        "Donem": donem,
        "Sube_ID": sube_id,
        "Imaj_Adı": imaj_adi
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}

    if imaj:
        update_data["Imaj"] = imaj.file.read()
    elif imaj_adi is not None and imaj_adi == "":
        update_data["Imaj"] = None

    nakit_in = nakit.NakitUpdate(**update_data)
    db_nakit = crud.update_nakit(db=db, nakit_id=nakit_id, nakit=nakit_in)
    if db_nakit is None:
        raise HTTPException(status_code=404, detail="Nakit entry not found")

    if db_nakit.Imaj:
        db_nakit.Imaj = base64.b64encode(db_nakit.Imaj).decode('utf-8')

    return db_nakit

@router.delete("/nakit/{nakit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_nakit_entry(nakit_id: int, db: Session = Depends(database.get_db)):
    db_nakit = crud.delete_nakit(db=db, nakit_id=nakit_id)
    if db_nakit is None:
        raise HTTPException(status_code=404, detail="Nakit entry not found")
    return {"message": "Nakit entry deleted successfully"}