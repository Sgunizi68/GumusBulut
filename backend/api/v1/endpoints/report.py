from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db import crud
from db.database import get_db
from schemas.report import NakitYatirmaRaporu

router = APIRouter()

@router.get("/nakit-yatirma-kontrol/{sube_id}/{donem}", response_model=NakitYatirmaRaporu)
def get_nakit_yatirma_kontrol_raporu(sube_id: int, donem: int, db: Session = Depends(get_db)):
    """
    Nakit Yatırma Kontrol Raporu için verileri getirir.
    """
    bankaya_yatan = crud.get_bankaya_yatan_by_sube_and_donem(db, sube_id=sube_id, donem=donem)
    nakit_girisi = crud.get_nakit_girisi_by_sube_and_donem(db, sube_id=sube_id, donem=donem)
    
    return {"bankaya_yatan": bankaya_yatan, "nakit_girisi": nakit_girisi}