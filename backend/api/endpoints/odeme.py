from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import io
import pandas as pd
from datetime import date, datetime

from backend.db.database import get_db
from backend.schemas.odeme import OdemeCreate
from backend.db import crud

router = APIRouter()

@router.post("/upload-csv/", status_code=status.HTTP_201_CREATED)
async def upload_odeme_csv(
    file: UploadFile = File(...),
    sube_id: int = None, # Expect Sube_ID as a query parameter
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files are allowed."
        )

    if sube_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sube_ID is required as a query parameter."
        )

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Rename 'Açıklama' column to 'Aciklama' to match schema
        if 'Açıklama' in df.columns:
            df.rename(columns={'Açıklama': 'Aciklama'}, inplace=True)
        
        required_columns = ["Tip", "Hesap_Adi", "Tarih", "Aciklama", "Tutar"]
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns in CSV. Expected: {', '.join(required_columns)}"
            )

        created_records = []
        for index, row in df.iterrows():
            try:
                # Clean and convert Tutar
                tutar_str = str(row["Tutar"]).replace('.', '').replace(',', '.')
                tutar = float(tutar_str)

                # Convert Tarih to date object
                # Assuming date format is DD/MM/YYYY
                tarih = datetime.strptime(row["Tarih"], "%d/%m/%Y").date()

                odeme_data = OdemeCreate(
                    Tip=row["Tip"],
                    Hesap_Adi=row["Hesap_Adi"],
                    Tarih=tarih,
                    Aciklama=row["Aciklama"],
                    Tutar=tutar,
                    Kategori_ID=None, # Not in CSV, set to None
                    Donem=None, # Not in CSV, set to None
                    Sube_ID=sube_id # From query parameter
                )
                created_odeme = crud.odeme.create(db, obj_in=odeme_data)
                created_records.append(created_odeme.Odeme_ID) # Assuming Odeme_ID is returned
            except Exception as e:
                # Log the error and continue, or raise a more specific error
                print(f"Error processing row {index}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Error processing row {index}: {e}. Data: {row.to_dict()}"
                )

        return {"message": f"Successfully uploaded and processed {len(created_records)} odeme records.", "created_ids": created_records}

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty."
        )
    except pd.errors.ParserError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not parse CSV file. Please check its format."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}"
        )
