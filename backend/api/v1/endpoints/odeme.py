from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import logging
from datetime import datetime
from decimal import Decimal # Import Decimal

from db import crud, database
from schemas import odeme

# Configure logging (using print for debugging as requested)
# logging.basicConfig(level=logging.INFO)
# logger = logger.getLogger(__name__)

router = APIRouter()

@router.post("/odeme/upload-csv/")
async def upload_odeme_csv(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    sube_id = 1 # Hardcode Sube_ID as requested
    print(f"Starting Odeme CSV upload for Sube_ID: {sube_id}, file: {file.filename}")
    if not file.filename.endswith('.csv'):
        print(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    content = await file.read()
    try:
        # Use utf-8-sig to handle BOM
        stream = io.StringIO(content.decode('utf-8-sig'))
    except Exception as e: # Simplified error handling for decoding
        print(f"Failed to decode file: {e}")
        raise HTTPException(status_code=400, detail="Cannot decode file content. Please ensure it's UTF-8 encoded.")

    csv_reader = csv.DictReader(stream, delimiter=';')

    # Get all odeme referanslar
    odeme_referanslar = crud.get_odeme_referanslar(db=db)

    added_count = 0
    skipped_count = 0
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
                print(f"Skipping row {rows_read} due to missing 'tarih'.")
                skipped_count += 1
                continue

            # Clean and parse Tutar
            tutar_str = row_normalized.get("tutar", "0.0").strip()
            
            # Check which separator is last, if any
            last_comma = tutar_str.rfind(',')
            last_period = tutar_str.rfind('.')

            if last_comma > last_period:
                # Comma is the decimal separator (e.g., "1.234,56")
                tutar_str = tutar_str.replace('.', '').replace(',', '.')
            elif last_period > last_comma:
                # Period is the decimal separator (e.g., "1,234.56")
                tutar_str = tutar_str.replace(',', '')
            
            tutar = Decimal(tutar_str) if tutar_str else Decimal('0.0')

            tarih_dt = datetime.strptime(tarih_str, '%d/%m/%Y')
            donem = int(f"{tarih_dt.year % 100:02d}{tarih_dt.month:02d}")

            aciklama = row_normalized.get("aciklama")

            # Find Kategori_ID from odeme_referanslar
            kategori_id = None
            for ref in odeme_referanslar:
                if ref.Referans_Metin in aciklama:
                    kategori_id = ref.Kategori_ID
                    break

            odeme_data = odeme.OdemeCreate(
                Tip=row_normalized.get("tip"),
                Hesap_Adi=row_normalized.get("hesap_adi"),
                Tarih=tarih_dt.date(),
                Aciklama=aciklama,
                Tutar=tutar,
                Kategori_ID=kategori_id,
                Donem=donem,
                Sube_ID=sube_id,
            )

            # Check for existing odeme
            existing_odeme = crud.get_odeme_by_unique_fields(db=db, odeme_data=odeme_data)
            if existing_odeme:
                print(f"Skipping existing record: {odeme_data.Aciklama[:30]}")
                skipped_count += 1
                continue

            # Use crud.create_odeme for single record creation
            crud.create_odeme(db=db, odeme=odeme_data)
            added_count += 1
        except (ValueError, KeyError, TypeError) as e:
            print(f"CSV parsing error on row {rows_read}: {e} - Row data: {row_normalized}")
            skipped_count += 1
            continue # Continue with the next rows

    print(f"Total rows read from CSV: {rows_read}")
    print(f"Number of records added: {added_count}")
    print(f"Number of records skipped: {skipped_count}")

    return {
        "message": f"Odeme file processed successfully. Added {added_count} records, skipped {skipped_count} records.",
        "added": added_count,
        "skipped": skipped_count
    }


@router.post("/Odeme/", response_model=odeme.OdemeInDB, status_code=status.HTTP_201_CREATED)
def create_new_odeme(odeme_data: odeme.OdemeCreate, db: Session = Depends(database.get_db)):
    return crud.create_odeme(db=db, odeme=odeme_data)

@router.get("/Odeme/", response_model=List[odeme.OdemeInDB])
def read_odemeler(skip: int = 0, limit: int | None = None, db: Session = Depends(database.get_db)):
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
