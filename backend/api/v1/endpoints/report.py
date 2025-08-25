from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging
from db import crud
from db.database import get_db
from schemas.report import NakitYatirmaRaporu

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/nakit-yatirma-kontrol/{sube_id}/{donem}", response_model=NakitYatirmaRaporu)
def get_nakit_yatirma_kontrol_raporu(sube_id: int, donem: int, db: Session = Depends(get_db)):
    """
    Nakit Yatırma Kontrol Raporu için verileri getirir.
    
    Args:
        sube_id: Branch ID
        donem: Period in YYMM or YYYYMM format (e.g., 2508 or 202508 for August 2025)
        
    Returns:
        NakitYatirmaRaporu: Contains bankaya_yatan and nakit_girisi data
    """
    logger.info(f"Getting Nakit Yatırma Kontrol Raporu for Sube_ID: {sube_id}, Donem: {donem}")
    
    try:
        # Validate inputs
        if sube_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid sube_id")
        
        if donem <= 0 or len(str(donem)) not in [4, 6]:
            raise HTTPException(status_code=400, detail="Invalid donem format. Expected YYMM or YYYYMM format (e.g., 2508 or 202508)")
        
        # Fetch data
        bankaya_yatan = crud.get_bankaya_yatan_by_sube_and_donem(db, sube_id=sube_id, donem=donem)
        nakit_girisi = crud.get_nakit_girisi_by_sube_and_donem(db, sube_id=sube_id, donem=donem)
        
        logger.info(f"Retrieved {len(bankaya_yatan)} bankaya_yatan records and {len(nakit_girisi)} nakit_girisi records")
        
        # Create response
        response = {
            "bankaya_yatan": bankaya_yatan,
            "nakit_girisi": nakit_girisi
        }
        
        # Log summary for debugging
        bankaya_total = sum(item.Tutar for item in bankaya_yatan)
        nakit_total = sum(item.Tutar for item in nakit_girisi)
        logger.info(f"Bankaya Yatan Total: {bankaya_total}, Nakit Girişi Total: {nakit_total}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_nakit_yatirma_kontrol_raporu: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")