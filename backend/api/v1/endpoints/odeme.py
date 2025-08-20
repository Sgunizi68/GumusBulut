from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import logging
from datetime import datetime

from db import crud, database
from schemas import odeme

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/Odeme/upload-csv/")
async def upload_odeme_csv(
    sube_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    logger.info(f"Starting Odeme CSV upload for Sube_ID: {sube_id}, file: {file.filename}")
    if not file.filename.endswith('.csv'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    content = await file.read()
    try:
        # Use utf-8-sig to handle BOM
        stream = io.StringIO(content.decode('utf-8-sig'))
    except UnicodeDecodeError:
        # Fallback to another encoding if utf-8-sig fails
        try:
            stream = io.StringIO(content.decode('latin-1'))
            logger.warning("UTF-8 decoding failed, fell back to latin-1.")
        except UnicodeDecodeError:
            logger.error("Failed to decode file with both UTF-8 and latin-1.")
            raise HTTPException(status_code=400, detail="Cannot decode file content. Please ensure it's UTF-8 or Latin-1 encoded.")

    csv_reader = csv.DictReader(stream)

    odemeler_to_create = []
    rows_read = 0
    for row in csv_reader:
        rows_read += 1
        # Normalize keys from the CSV header
        row_normalized = {k.strip().lower().replace(' ', '_').replace('ş', 's').replace('ı', 'i').replace('ü', 'u').replace('ğ', 'g').replace('ö', 'o').replace('ç', 'c'): v for k, v in row.items()}
        
        # Skip empty rows
        if not any(row_normalized.values()):
            continue

        try:
            tarih_str = row_normalized.get("tarih")
            if not tarih_str:
                logger.warning(f"Skipping row {rows_read} due to missing 'tarih'.")
                continue

            # Clean and parse Tutar
            tutar_str = row_normalized.get("tutar", "0.0").replace('.', '').replace(',', '.')
            tutar = float(tutar_str) if tutar_str else 0.0

            tarih_dt = datetime.strptime(tarih_str, '%d/%m/%Y')
            donem = int(f"{tarih_dt.year}{tarih_dt.month:02d}")

            odeme_data = odeme.OdemeCreate(
                Tip=row_normalized.get("tip"),
                Hesap_Adi=row_normalized.get("hesap_adi"),
                Tarih=tarih_dt.date(),
                Aciklama=row_normalized.get("aciklama"),
                Tutar=tutar,
                Kategori_ID=None,  # Or logic to determine category
                Donem=donem,
                Sube_ID=sube_id,
            )
            odemeler_to_create.append(odeme_data)
        except (ValueError, KeyError, TypeError) as e:
            logger.error(f"CSV parsing error on row {rows_read}: {e} - Row data: {row_normalized}")
            continue # Continue with the next rows

    logger.info(f"Total rows read from CSV: {rows_read}")
    logger.info(f"Number of records to be created: {len(odemeler_to_create)}")

    if not odemeler_to_create:
        logger.warning("CSV file is empty or contains no valid data to insert.")
        return {"message": "CSV file is empty or contains no valid data to insert.", "added": 0, "skipped": 0}

    result = crud.create_odemeler_bulk(db=db, odemeler=odemeler_to_create)
    logger.info(f"Bulk insert result: {result}")
    
    return {
        "message": "Odeme file processed successfully.",
        "added": result["added"],
        "skipped": result["skipped"]
    }


@router.post("/Odeme/", response_model=odeme.OdemeInDB, status_code=status.HTTP_201_CREATED)
def create_new_odeme(odeme_data: odeme.OdemeCreate, db: Session = Depends(database.get_db)):
    return crud.create_odeme(db=db, odeme=odeme_data)

@router.get("/Odeme/", response_model=List[odeme.OdemeInDB])
def read_odemeler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    odemeler = crud.get_odemeler(db, skip=skip, limit=limit)
    return odemeler

@router.get("/Odeme/{odeme_id}", response_model=odeme.OdemeInDB)
def read_odeme(odeme_id: int, db: Session = Depends(database.get_db)):
    db_odeme = crud.get_odeme(db, odeme_id=odeme_id)
    if db_odeme is None:
        raise HTTPException(status_code=404, detail="Odeme not found")
    return db_odeme

@router.put("/Odeme/{odeme_id}", response_model=odeme.OdemeInDB)
def update_existing_odeme(odeme_id: int, odeme_data: odeme.OdemeUpdate, db: Session = Depends(database.get_db)):
    db_odeme = crud.update_odeme(db=db, odeme_id=odeme_id, odeme=odeme_data)
    if db_odeme is None:
        raise HTTPException(status_code=404, detail="Odeme not found")
    return db_odeme

@router.delete("/Odeme/{odeme_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_odeme(odeme_id: int, db: Session = Depends(database.get_db)):
    db_odeme = crud.delete_odeme(db=db, odeme_id=odeme_id)
    if db_odeme is None:
        raise HTTPException(status_code=404, detail="Odeme not found")
    return {"message": "Odeme deleted successfully"}
