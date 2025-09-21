from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import logging
from db import crud
from db.database import get_db
from schemas.report import NakitYatirmaRaporu
from schemas.odeme_rapor import OdemeRaporResponse
from schemas.fatura_rapor import FaturaRaporResponse
from schemas.pos_kontrol_dashboard import POSKontrolDashboardResponse

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
    logger.info(f"Getting Nakit Yatırma Kontrol Raporu for Sube_ID: {sube_id}, Donem: {donem} (original format)")
    
    try:
        # Validate inputs
        if sube_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid sube_id")
        
        donem_str = str(donem)
        if donem <= 0 or len(donem_str) not in [4, 6]:
            raise HTTPException(status_code=400, detail=f"Invalid donem format. Expected YYMM (4-digit) or YYYYMM (6-digit) format, got: {donem} (length: {len(donem_str)})")
        
        # Log period format information
        if len(donem_str) == 4:
            logger.info(f"Period format: 4-digit ({donem}) - querying database directly")
        else:
            logger.info(f"Period format: 6-digit ({donem}) - will be converted to 4-digit in CRUD functions")
        
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


@router.get("/odeme-rapor/", response_model=OdemeRaporResponse)
def get_odeme_rapor(
    donem: Optional[List[int]] = Query(None),
    kategori: Optional[List[int]] = Query(None),
    sube_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Odeme Rapor endpoint - comprehensive payment report with grouping
    
    Args:
        donem: Optional list of periods (e.g., [2508, 2509])
        kategori: Optional list of category IDs
        sube_id: Branch ID filter
        
    Returns:
        OdemeRaporResponse: Grouped report data with totals
    """
    logger.info(f"Getting Odeme Rapor for Sube_ID: {sube_id}, Donem: {donem}, Kategori: {kategori}")
    
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
        
        # Get report data using the comprehensive CRUD function
        report_data = crud.get_odeme_rapor(
            db=db,
            donem_list=donem,
            kategori_list=kategori,
            sube_id=sube_id
        )
        
        logger.info(f"Successfully generated Odeme report with {len(report_data.data)} period groups, {report_data.total_records} total records")
        return report_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_odeme_rapor: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/fatura-rapor/", response_model=FaturaRaporResponse)
def get_fatura_rapor(
    donem: Optional[List[int]] = Query(None),
    kategori: Optional[List[int]] = Query(None),
    sube_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Fatura Rapor endpoint - comprehensive e-Fatura report with grouping
    
    Args:
        donem: Optional list of periods (e.g., [2508, 2509])
        kategori: Optional list of category IDs
        sube_id: Branch ID filter
        
    Returns:
        FaturaRaporResponse: Grouped report data with totals
    """
    logger.info(f"Getting Fatura Rapor for Sube_ID: {sube_id}, Donem: {donem}, Kategori: {kategori}")
    
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
        
        # Get report data using the comprehensive CRUD function
        report_data = crud.get_fatura_rapor(
            db=db,
            donem_list=donem,
            kategori_list=kategori,
            sube_id=sube_id
        )
        
        logger.info(f"Successfully generated Fatura report with {len(report_data.data)} period groups, {report_data.total_records} total records")
        return report_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_fatura_rapor: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/pos-kontrol/{sube_id}/{donem}", response_model=POSKontrolDashboardResponse)
def get_pos_kontrol_dashboard(
    sube_id: int,
    donem: int,
    skip: int = 0,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """
    POS Kontrol Dashboard endpoint - compares Gelir POS data with POS_Hareketleri data
    
    Args:
        sube_id: Branch ID
        donem: Period in YYMM format (e.g., 2508 for August 2025)
        
    Returns:
        POSKontrolDashboardResponse: Daily comparison data and summary statistics
    """
    logger.info(f"Getting POS Kontrol Dashboard for Sube_ID: {sube_id}, Donem: {donem}")
    
    try:
        # Validate inputs
        if sube_id <= 0:
            raise HTTPException(status_code=400, detail="Invalid sube_id")
        
        donem_str = str(donem)
        if donem <= 0 or len(donem_str) != 4:
            raise HTTPException(status_code=400, detail=f"Invalid donem format. Expected YYMM (4-digit) format, got: {donem} (length: {len(donem_str)})")
        
        # Get report data using the comprehensive CRUD function
        report_data = crud.get_pos_kontrol_dashboard_data(
            db=db,
            sube_id=sube_id,
            donem=donem,
            skip=skip,
            limit=limit
        )
        
        logger.info(f"Successfully generated POS Kontrol Dashboard with {len(report_data.data)} daily records, success rate: {report_data.summary.success_rate}")
        return report_data
        
    except HTTPException:
        raise

@router.get("/all-expenses-by-category/{donem}", response_model=List[Dict[str, Any]])
def get_all_expenses_by_category(donem: int, db: Session = Depends(get_db)):
    """
    Fetches all expenses grouped by category for a given period.
    """
    logger.info(f"Getting all expenses by category for Donem: {donem}")
    try:
        if donem <= 0 or len(str(donem)) != 4:
            raise HTTPException(status_code=400, detail="Invalid donem format. Expected YYMM (4-digit) format.")
        
        expenses_data = crud.get_all_expenses_by_category_for_donem(db=db, donem=donem)
        logger.info(f"Successfully fetched {len(expenses_data)} expense categories for Donem: {donem}")
        return expenses_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_all_expenses_by_category: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/depo-kira-rapor/", response_model=List[Dict[str, Any]])
def get_depo_kira_rapor(db: Session = Depends(get_db)):
    """
    Depo Kira Raporu için verileri getirir.

    Returns:
        List[Dict[str, Any]]: Contains Donem and Toplam_Tutar
    """
    logger.info(f"Getting Depo Kira Raporu")

    try:
        report_data = crud.get_depo_kira_rapor(db=db)
        logger.info(f"Successfully generated Depo Kira report with {len(report_data)} records")
        return report_data

    except Exception as e:
        logger.error(f"Error in get_depo_kira_rapor: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/ozet-kontrol-raporu/robotpos-tutar/{sube_id}/{donem}", response_model=float)
def get_robotpos_tutar_endpoint(sube_id: int, donem: int, db: Session = Depends(get_db)):
    """
    Get the total Robotpos Tutar for a given period and branch.
    """
    logger.info(f"Getting Robotpos Tutar for Sube_ID: {sube_id}, Donem: {donem}")
    
    try:
        tutar = crud.get_robotpos_tutar(db=db, sube_id=sube_id, donem=donem)
        logger.info(f"Successfully fetched Robotpos Tutar: {tutar}")
        return tutar
    except Exception as e:
        logger.error(f"Error in get_robotpos_tutar_endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")