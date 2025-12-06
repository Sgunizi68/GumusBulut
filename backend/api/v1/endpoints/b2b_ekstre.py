from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime
import logging

# Import send_email function assuming the script is run from the project root
from send_email import gmail_send_message
from db import crud, database, models
from schemas import b2b_ekstre

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/b2b-ekstreler/upload/")
async def upload_b2b_ekstre(
    sube_id: int = Form(...),
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    logger.info(f"Starting B2B Ekstre upload for Sube_ID: {sube_id}")
    if not file.filename.endswith('.csv'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    content = await file.read()
    # Use utf-8-sig to handle potential BOM characters at the start of the file
    stream = io.StringIO(content.decode('utf-8-sig'))
    csv_reader = csv.DictReader(stream)

    ekstreler_to_create = []
    rows_read = 0
    for row in csv_reader:
        rows_read += 1
        # Normalize keys from the CSV header to be more robust
        row_normalized = {k.strip().lower().replace(' ', '_').replace('ş', 's').replace('ı', 'i').replace('ü', 'u').replace('ğ', 'g').replace('ö', 'o').replace('ç', 'c'): v for k, v in row.items()}
        
        if rows_read == 1:
            logger.info(f"First row normalized data: {row_normalized}")

        try:
            fis_no = row_normalized.get("fis_no") or row_normalized.get("fiş_no")
            if not fis_no:
                # Use description as a fallback, otherwise generate a placeholder
                fis_no = row_normalized.get("aciklama", f"PAYMENT-{row_normalized.get('tarih')}-{rows_read}")

            # Update e_Fatura.Aciklama if applicable
            aciklama_from_csv = row_normalized.get("aciklama")
            if fis_no and aciklama_from_csv:
                e_fatura_record = db.query(models.EFatura).filter(models.EFatura.Fatura_Numarasi == fis_no).first()
                if e_fatura_record and not e_fatura_record.Aciklama:
                    logger.info(f"Updating e_Fatura record for Fatura_Numarasi {fis_no} with new Aciklama.")
                    e_fatura_record.Aciklama = aciklama_from_csv
                    db.commit()

            # Handle potential missing 'donem' key
            donem = row_normalized.get("donem")
            if not donem:
                # Attempt to derive from 'tarih' if not present
                tarih_str = row_normalized.get('tarih')
                if tarih_str:
                    try:
                        tarih_dt = datetime.strptime(tarih_str, '%d.%m.%Y')
                        donem = f"{tarih_dt.year%100:02d}{tarih_dt.month:02d}"
                        logger.info(f"Derived 'donem' as {donem} from 'tarih' {tarih_str}")
                    except ValueError:
                        logger.error(f"Could not parse date to derive 'donem' on row {rows_read}. Row: {row_normalized}")
                        continue # Skip row if 'donem' is critical and cannot be derived
                else:
                    logger.error(f"'donem' and 'tarih' are missing on row {rows_read}. Row: {row_normalized}")
                    continue # Skip row

            ekstre_data = b2b_ekstre.B2BEkstreCreate(
                Tarih=datetime.strptime(row_normalized["tarih"], '%d.%m.%Y').date(),
                Fis_No=fis_no,
                Fis_Turu=row_normalized.get("fis_turu") or row_normalized.get("fiş_türü"),
                Aciklama=row_normalized.get("aciklama"),
                Borc=float(row_normalized.get("borc", "0.0").replace(',', '.')) if row_normalized.get("borc") else 0.0,
                Alacak=float(row_normalized.get("alacak", "0.0").replace(',', '.')) if row_normalized.get("alacak") else 0.0,
                Toplam_Bakiye=float(row_normalized.get("toplam_bakiye").replace(',', '.')) if row_normalized.get("toplam_bakiye") else None,
                Fatura_No=row_normalized.get("fatura_no"),
                Fatura_Metni=row_normalized.get("fatura_metni"),
                Donem=donem,
                Kategori_ID=int(row_normalized["kategori_id"]) if row_normalized.get("kategori_id") else None,
                Sube_ID=sube_id,
            )
            ekstreler_to_create.append(ekstre_data)
        except (ValueError, KeyError, TypeError) as e:
            logger.error(f"CSV parsing error on row {rows_read}: {e} - Row data: {row_normalized}")
            # Decide if you want to stop or continue
            # raise HTTPException(status_code=400, detail=f"CSV parsing error on row {rows_read}: {e}")
            continue # Continue with the next rows

    logger.info(f"Total rows read from CSV: {rows_read}")
    logger.info(f"Number of records to be created: {len(ekstreler_to_create)}")

    if not ekstreler_to_create:
        logger.warning("CSV file is empty or contains no valid data to insert.")
        return {"message": "CSV file is empty or contains no valid data to insert.", "added": 0, "skipped": 0}

    result = crud.create_b2b_ekstre_bulk(db=db, ekstreler=ekstreler_to_create)
    logger.info(f"Bulk insert result: {result}")
    
    # Send email notification to admins
    try:
        print("--- DEBUG: ENTERING EMAIL BLOCK ---")
        admin_users = crud.get_users_by_role_name(db, role_name="Admin")
        if not admin_users:
            print("--- DEBUG: No admin users found, skipping email notification. ---")
        else:
            subject = "B2B Ekstre Yükleme"
            body = f"'{file.filename}' Yüklendi."
            print(f"--- DEBUG: Found {len(admin_users)} admin user(s). ---")
            for user in admin_users:
                if user.Email:
                    print(f"--- DEBUG: Attempting to send email to {user.Email} ---")
                    gmail_send_message(to_email=user.Email, subject=subject, body=body)
                else:
                    print(f"--- DEBUG: Admin user {user.Kullanici_Adi} has no email address, skipping. ---")
            print("--- DEBUG: Finished sending email notifications. ---")
    except Exception as e:
        print(f"--- DEBUG: CRITICAL ERROR IN EMAIL BLOCK: {e} ---")
        # Do not re-raise the exception, as the file upload itself was successful.

    return {
        "message": "B2B Ekstre file processed successfully.",
        "added": result["added"],
        "skipped": result["skipped"]
    }

@router.post("/b2b-ekstreler/", response_model=b2b_ekstre.B2BEkstreInDB, status_code=status.HTTP_201_CREATED)
def create_new_b2b_ekstre(ekstre: b2b_ekstre.B2BEkstreCreate, db: Session = Depends(database.get_db)):
    return crud.create_b2b_ekstre(db=db, ekstre=ekstre)

@router.get("/b2b-ekstreler/", response_model=List[b2b_ekstre.B2BEkstreInDB])
def read_b2b_ekstreler(skip: int = 0, db: Session = Depends(database.get_db)):
    ekstreler = crud.get_b2b_ekstreler(db, skip=skip)
    return ekstreler

@router.get("/b2b-ekstreler/{ekstre_id}", response_model=b2b_ekstre.B2BEkstreInDB)
def read_b2b_ekstre(ekstre_id: int, db: Session = Depends(database.get_db)):
    db_ekstre = crud.get_b2b_ekstre(db, ekstre_id=ekstre_id)
    if db_ekstre is None:
        raise HTTPException(status_code=404, detail="B2B Ekstre not found")
    return db_ekstre

@router.put("/b2b-ekstreler/{ekstre_id}", response_model=b2b_ekstre.B2BEkstreInDB)
def update_existing_b2b_ekstre(ekstre_id: int, ekstre: b2b_ekstre.B2BEkstreUpdate, db: Session = Depends(database.get_db)):
    db_ekstre = crud.update_b2b_ekstre(db=db, ekstre_id=ekstre_id, ekstre=ekstre)
    if db_ekstre is None:
        raise HTTPException(status_code=404, detail="B2B Ekstre not found")
    return db_ekstre

@router.delete("/b2b-ekstreler/{ekstre_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_b2b_ekstre(ekstre_id: int, db: Session = Depends(database.get_db)):
    db_ekstre = crud.delete_b2b_ekstre(db=db, ekstre_id=ekstre_id)
    if db_ekstre is None:
        raise HTTPException(status_code=404, detail="B2B Ekstre not found")
    return {"message": "B2B Ekstre deleted successfully"}
