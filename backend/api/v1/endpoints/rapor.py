from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from db import report_crud, database
from schemas import rapor

router = APIRouter()

@router.get("/rapor/pos-odemeleri", response_model=List[rapor.PosOdemesi])
def get_pos_odemeleri(
    start_date: date,
    end_date: date,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_pos_odemeleri_by_date_range(
        db=db,
        start_date=start_date,
        end_date=end_date,
        sube_id=sube_id
    )

@router.get("/rapor/yemek-ceki", response_model=List[rapor.YemekCekiOdemesi])
def get_yemek_ceki(
    start_date: date,
    end_date: date,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_yemek_ceki_by_date_range(
        db=db,
        start_date=start_date,
        end_date=end_date,
        sube_id=sube_id
    )
