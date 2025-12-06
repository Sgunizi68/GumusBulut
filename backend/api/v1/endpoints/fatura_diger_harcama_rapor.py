from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from db import crud
from db.database import get_db
from schemas.fatura_diger_harcama_rapor import FaturaDigerHarcamaRaporResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=FaturaDigerHarcamaRaporResponse)
def get_fatura_diger_harcama_rapor(
    donem: Optional[List[int]] = Query(None),
    kategori: Optional[List[int]] = Query(None),
    sube_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Fatura & Diğer Harcama Raporu endpoint - combined report with both e-Fatura and DigerHarcama records
    
    Args:
        donem: Optional list of periods (e.g., [2508, 2509])
        kategori: Optional list of category IDs
        sube_id: Branch ID filter
        
    Returns:
        FaturaDigerHarcamaRaporResponse: Grouped report data with totals
    """
    logger.info(f"Getting Fatura & Diğer Harcama Raporu for Sube_ID: {sube_id}, Donem: {donem}, Kategori: {kategori}")
    
    try:
        # Validate inputs
        if sube_id and sube_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid sube_id")
        
        # Validate period format if provided
        if donem:
            for d in donem:
                donem_str = str(d)
                if d <= 0 or len(donem_str) not in [4, 6]:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid donem format. Expected YYMM (4-digit) or YYYYMM (6-digit) format, got: {d}"
                    )
        
        # Get report data using the new CRUD function
        report_data = crud.get_fatura_diger_harcama_rapor(
            db=db,
            donem_list=donem,
            kategori_list=kategori,
            sube_id=sube_id
        )
        
        logger.info(f"Successfully generated Fatura & Diğer Harcama report with {len(report_data.data)} period groups, {report_data.total_records} total records")
        return report_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_fatura_diger_harcama_rapor: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")