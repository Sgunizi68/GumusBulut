from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from io import BytesIO
from datetime import datetime
import logging

from db import crud, database, models
from schemas import pos_hareketleri
from ..deps import get_current_active_user, check_permission

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/pos-hareketleri/upload/", dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_import"))])
async def upload_pos_hareketleri(
    sube_id: int = Form(...),
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    logger.info(f"Starting POS Hareketleri upload for Sube_ID: {sube_id}")
    
    # Check file extension
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file (.xlsx or .xls).")

    # Read file content
    content = await file.read()
    
    # Parse Excel file
    try:
        excel_file = BytesIO(content)
        df = pd.read_excel(excel_file, engine='openpyxl')
    except Exception as e:
        logger.error(f"Error reading Excel file: {e}")
        raise HTTPException(status_code=400, detail="Error reading Excel file. Please ensure it's a valid Excel file.")
    
    pos_hareketleri_to_create = []
    rows_read = 0
    
    # Process each row in the Excel file
    for index, row in df.iterrows():
        rows_read += 1
        try:
            # Handle potential missing or NaN values
            islem_tutari = row.get("Islem_Tutari")
            kesinti_tutari = row.get("Kesinti_Tutari", 0.00)
            net_tutar = row.get("Net_Tutar")
            
            # Skip rows with missing required fields
            if pd.isna(row.get("Islem_Tarihi")) or pd.isna(row.get("Hesaba_Gecis")) or pd.isna(row.get("Para_Birimi")) or pd.isna(islem_tutari):
                logger.warning(f"Skipping row {rows_read} due to missing required fields")
                continue
            
            # Create POS_Hareketleri object
            pos_hareket_data = pos_hareketleri.POSHareketleriCreate(
                Islem_Tarihi=row["Islem_Tarihi"],
                Hesaba_Gecis=row["Hesaba_Gecis"],
                Para_Birimi=str(row["Para_Birimi"]),
                Islem_Tutari=islem_tutari,
                Kesinti_Tutari=kesinti_tutari if not pd.isna(kesinti_tutari) else 0.00,
                Net_Tutar=net_tutar if not pd.isna(net_tutar) else None,
                Sube_ID=sube_id,
            )
            pos_hareketleri_to_create.append(pos_hareket_data)
        except (ValueError, KeyError, TypeError) as e:
            logger.error(f"Excel parsing error on row {rows_read}: {e} - Row data: {row}")
            continue

    logger.info(f"Total rows read from Excel: {rows_read}")
    logger.info(f"Number of records to be created: {len(pos_hareketleri_to_create)}")

    if not pos_hareketleri_to_create:
        logger.warning("Excel file is empty or contains no valid data to insert.")
        return {"message": "Excel file is empty or contains no valid data to insert.", "added": 0, "skipped": 0}

    result = crud.create_pos_hareketleri_bulk(db=db, pos_hareketleri=pos_hareketleri_to_create)
    logger.info(f"Bulk insert result: {result}")
    
    return {
        "message": "POS transactions file processed successfully.",
        "added": result["added"],
        "skipped": result["skipped"]
    }

@router.post("/pos-hareketleri/", response_model=pos_hareketleri.POSHareketleriInDB, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_write"))])
def create_pos_hareket(
    pos_hareket: pos_hareketleri.POSHareketleriCreate,
    db: Session = Depends(database.get_db)
):
    db_pos = crud.create_pos_hareket(db=db, pos_hareket=pos_hareket)
    if db_pos is None:
        raise HTTPException(status_code=400, detail="Duplicate record detected.")
    return db_pos

@router.post("/pos-hareketleri/bulk/", response_model=List[pos_hareketleri.POSHareketleriInDB], status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_write"))])
def create_pos_hareketleri_bulk(
    pos_hareketleri_list: List[pos_hareketleri.POSHareketleriCreate],
    db: Session = Depends(database.get_db)
):
    created_pos_hareketleri = []
    for pos_hareket in pos_hareketleri_list:
        db_pos = crud.create_pos_hareket(db=db, pos_hareket=pos_hareket)
        if db_pos is not None:  # Only add if not a duplicate
            created_pos_hareketleri.append(db_pos)
    return created_pos_hareketleri

@router.get("/pos-hareketleri/", response_model=List[pos_hareketleri.POSHareketleriInDB], dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_read"))])
def read_pos_hareketleri(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_pos_hareketleri(db, skip=skip, limit=limit)

@router.get("/pos-hareketleri/{pos_id}", response_model=pos_hareketleri.POSHareketleriInDB, dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_read"))])
def read_pos_hareket(pos_id: int, db: Session = Depends(database.get_db)):
    db_pos = crud.get_pos_hareket(db, pos_id=pos_id)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS transaction not found")
    return db_pos

@router.put("/pos-hareketleri/{pos_id}", response_model=pos_hareketleri.POSHareketleriInDB, dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_write"))])
def update_pos_hareket(
    pos_id: int,
    pos_hareket: pos_hareketleri.POSHareketleriUpdate,
    db: Session = Depends(database.get_db)
):
    db_pos = crud.update_pos_hareket(db=db, pos_id=pos_id, pos_hareket=pos_hareket)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS transaction not found")
    return db_pos

@router.delete("/pos-hareketleri/{pos_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_write"))])
def delete_pos_hareket(pos_id: int, db: Session = Depends(database.get_db)):
    db_pos = crud.delete_pos_hareket(db=db, pos_id=pos_id)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS transaction not found")
    return {"message": "POS transaction deleted successfully"}

@router.get("/pos-hareketleri/export/", dependencies=[Depends(get_current_active_user), Depends(check_permission("pos_export"))])
def export_pos_hareketleri(
    sube_id: int = None,
    db: Session = Depends(database.get_db)
):
    # Build query
    query = db.query(models.POSHareketleri)
    
    # Apply filters
    if sube_id:
        query = query.filter(models.POSHareketleri.Sube_ID == sube_id)
    
    # Get all records
    pos_hareketleri_records = query.all()
    
    # Convert to DataFrame
    data = []
    for record in pos_hareketleri_records:
        data.append({
            "ID": record.ID,
            "Islem_Tarihi": record.Islem_Tarihi,
            "Hesaba_Gecis": record.Hesaba_Gecis,
            "Para_Birimi": record.Para_Birimi,
            "Islem_Tutari": float(record.Islem_Tutari),
            "Kesinti_Tutari": float(record.Kesinti_Tutari),
            "Net_Tutar": float(record.Net_Tutar) if record.Net_Tutar else None,
            "Kayit_Tarihi": record.Kayit_Tarihi,
            "Sube_ID": record.Sube_ID
        })
    
    df = pd.DataFrame(data)
    
    # Create Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='POS_Hareketleri')
    
    # Reset buffer position
    output.seek(0)
    
    # Return Excel file
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=POS_Hareketleri.xlsx"}
    )