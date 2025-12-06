from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import crud
from db.database import get_db
from schemas.ozet_kontrol_raporu import OzetKontrolRaporuData
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/ozet-kontrol-raporu/{sube_id}/{donem}", response_model=OzetKontrolRaporuData)
def get_ozet_kontrol_raporu(
    sube_id: int,
    donem: int,
    db: Session = Depends(get_db)
):
    """
    Get all data for Ozet Kontrol Raporu.
    """
    logger.info(f"Getting Ozet Kontrol Raporu for Sube_ID: {sube_id}, Donem: {donem}")
    
    try:
        report_data = crud.get_ozet_kontrol_raporu_data(db=db, sube_id=sube_id, donem=donem)
        return report_data
    except Exception as e:
        logger.error(f"Error in get_ozet_kontrol_raporu: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
