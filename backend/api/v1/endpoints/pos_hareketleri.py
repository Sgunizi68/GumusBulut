from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from io import BytesIO
from datetime import datetime
import logging

from db import crud, database, models
from schemas import pos_hareketleri
# Removed security dependencies

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/pos-hareketleri/upload/")
async def upload_pos_hareketleri(
    sube_id: int = Form(...),
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    logger.info(f"Starting POS Hareketleri upload for Sube_ID: {sube_id}")
    
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file.")

    content = await file.read()
    
    try:
        excel_file = BytesIO(content)
        df = pd.read_excel(excel_file, engine='openpyxl')

        if df.empty:
            return {"added": 0, "skipped": 0}

        # --- Robust Column Name Normalization and Mapping ---
        
        def normalize_column_name(col_name):
            name = str(col_name).strip().lower()
            # Consistent character replacement for robust matching
            replacements = {
                'ı': 'i', 'i̇': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 
                '_': ' ', '-': ' '
            }
            for tr_char, en_char in replacements.items():
                name = name.replace(tr_char, en_char)
            # Consolidate whitespace
            return " ".join(name.split())

        df.columns = [normalize_column_name(col) for col in df.columns]

        # Keys in this map are the fully normalized, ASCII-like versions
        column_mapping = {
            'islem tarihi': 'islem_tarihi',
            'hesaba gecis tarihi': 'hesaba_gecis',
            'para birimi': 'para_birimi',
            'islem tutari': 'islem_tutari',
            'kesinti tutari': 'kesinti_tutari',
            'net tutar': 'net_tutar',
            'tarih': 'islem_tarihi',
            'tutar': 'islem_tutari',
            'hesaba gecis': 'hesaba_gecis',
        }

        df.rename(columns=column_mapping, inplace=True)

        # --- Validation and Type Conversion ---
        required_cols = ["islem_tarihi", "hesaba_gecis", "para_birimi", "islem_tutari"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            error_detail = f"Could not find required columns: {', '.join(missing_cols)}. Found: {df.columns.tolist()}"
            raise HTTPException(status_code=400, detail=error_detail)

        df['islem_tarihi'] = pd.to_datetime(df['islem_tarihi'], dayfirst=True, errors='coerce')
        df['hesaba_gecis'] = pd.to_datetime(df['hesaba_gecis'], dayfirst=True, errors='coerce')
        df['islem_tutari'] = pd.to_numeric(df['islem_tutari'], errors='coerce')
        if 'kesinti_tutari' in df.columns:
            df['kesinti_tutari'] = pd.to_numeric(df['kesinti_tutari'], errors='coerce')
        if 'net_tutar' in df.columns:
            df['net_tutar'] = pd.to_numeric(df['net_tutar'], errors='coerce')

        pos_hareketleri_to_create = []
        df.dropna(subset=['islem_tarihi', 'hesaba_gecis', 'para_birimi', 'islem_tutari'], inplace=True)
        
        for index, row in df.iterrows():
            pos_hareket_data = pos_hareketleri.POSHareketleriCreate(
                Islem_Tarihi=row["islem_tarihi"],
                Hesaba_Gecis=row["hesaba_gecis"],
                Para_Birimi=str(row["para_birimi"]),
                Islem_Tutari=row["islem_tutari"],
                Kesinti_Tutari=row.get("kesinti_tutari", 0.00) if not pd.isna(row.get("kesinti_tutari")) else 0.00,
                Net_Tutar=row.get("net_tutar") if not pd.isna(row.get("net_tutar")) else None,
                Sube_ID=sube_id,
            )
            pos_hareketleri_to_create.append(pos_hareket_data)
        
        if not pos_hareketleri_to_create:
            logger.warning("No valid data found to insert.")
            return {"message": "No valid data to insert.", "added": 0, "skipped": len(df)}

        result = crud.create_pos_hareketleri_bulk(db=db, pos_hareketleri_list=pos_hareketleri_to_create)
        
        return {
            "message": "POS transactions file processed successfully.",
            "added": result["added"],
            "skipped": result["skipped"]
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unhandled error during POS upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred on the server: {e}")

@router.post("/pos-hareketleri/", response_model=pos_hareketleri.POSHareketleriInDB, status_code=status.HTTP_201_CREATED)
def create_pos_hareket(
    pos_hareket: pos_hareketleri.POSHareketleriCreate,
    db: Session = Depends(database.get_db)
):
    db_pos = crud.create_pos_hareket(db=db, pos_hareket=pos_hareket)
    if db_pos is None:
        raise HTTPException(status_code=400, detail="Duplicate record detected.")
    return db_pos

@router.post("/pos-hareketleri/bulk/", response_model=List[pos_hareketleri.POSHareketleriInDB], status_code=status.HTTP_201_CREATED)
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

@router.get("/pos-hareketleri/", response_model=List[pos_hareketleri.POSHareketleriInDB])
def read_pos_hareketleri(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_pos_hareketleri(db, skip=skip, limit=limit)

@router.get("/pos-hareketleri/{pos_id}", response_model=pos_hareketleri.POSHareketleriInDB)
def read_pos_hareket(pos_id: int, db: Session = Depends(database.get_db)):
    db_pos = crud.get_pos_hareket(db, pos_id=pos_id)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS transaction not found")
    return db_pos

@router.put("/pos-hareketleri/{pos_id}", response_model=pos_hareketleri.POSHareketleriInDB)
def update_pos_hareket(
    pos_id: int,
    pos_hareket: pos_hareketleri.POSHareketleriUpdate,
    db: Session = Depends(database.get_db)
):
    db_pos = crud.update_pos_hareket(db=db, pos_id=pos_id, pos_hareket=pos_hareket)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS transaction not found")
    return db_pos

@router.delete("/pos-hareketleri/{pos_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pos_hareket(pos_id: int, db: Session = Depends(database.get_db)):
    db_pos = crud.delete_pos_hareket(db=db, pos_id=pos_id)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS transaction not found")
    return {"message": "POS transaction deleted successfully"}

@router.get("/pos-hareketleri/export/")
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