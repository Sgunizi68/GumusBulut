from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db import report_crud

router = APIRouter()

@router.get("/bayi-karlilik/{year}/{sube_id}")
def get_bayi_karlilik_report(year: int, sube_id: int, db: Session = Depends(get_db)):
    report_data = report_crud.get_bayi_karlilik_raporu(db=db, year=year, sube_id=sube_id)
    return report_data
