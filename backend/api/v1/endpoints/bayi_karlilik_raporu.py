from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from db import crud
from schemas.bayi_karlilik_raporu import BayiKarlilikRaporuResponse, KarlilikData
from api.v1.deps import get_db

router = APIRouter()

@router.get("/bayi-karlilik-raporu/", response_model=BayiKarlilikRaporuResponse)
def get_bayi_karlilik_raporu(
    year: int = Query(..., description="Year for the report"),
    sube_id: int = Query(..., description="Sube ID for the report"),
    db: Session = Depends(get_db)
):
    """
    Get Bayi Karlilik Raporu data.
    """
    rapor_data = crud.get_bayi_karlilik_raporu(db=db, year=year, sube_id=sube_id)
    return {"data": rapor_data}
