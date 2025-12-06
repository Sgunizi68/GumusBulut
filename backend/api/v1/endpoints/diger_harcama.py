from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from db import crud, database, models
from schemas import diger_harcama

router = APIRouter()

@router.post("/diger-harcamalar/", response_model=diger_harcama.DigerHarcamaInDB, status_code=status.HTTP_201_CREATED)
async def create_diger_harcama(
    Alici_Adi: str = Form(...),
    Belge_Numarasi: Optional[str] = Form(None),
    Belge_Tarihi: date = Form(...),
    Donem: int = Form(...),
    Tutar: float = Form(...),
    Kategori_ID: int = Form(...),
    Harcama_Tipi: str = Form(...),
    Gunluk_Harcama: Optional[bool] = Form(False),
    Sube_ID: int = Form(...),
    Açıklama: Optional[str] = Form(None),
    Imaj_Adi: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    harcama_data = diger_harcama.DigerHarcamaCreate(
        Alici_Adi=Alici_Adi,
        Belge_Numarasi=Belge_Numarasi,
        Belge_Tarihi=Belge_Tarihi,
        Donem=Donem,
        Tutar=Tutar,
        Kategori_ID=Kategori_ID,
        Harcama_Tipi=Harcama_Tipi,
        Gunluk_Harcama=Gunluk_Harcama,
        Sube_ID=Sube_ID,
        Açıklama=Açıklama,
        Imaj_Adi=Imaj_Adi
    )
    if image:
        harcama_data.Imaj = await image.read()
    return await crud.create_diger_harcama(db=db, harcama=harcama_data)

@router.get("/diger-harcamalar/", response_model=List[diger_harcama.DigerHarcamaInDB])
def read_diger_harcamalar(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    harcamalar = crud.get_diger_harcamalar(db, skip=skip, limit=limit)
    return harcamalar

@router.get("/diger-harcamalar/{harcama_id}", response_model=diger_harcama.DigerHarcamaInDB)
def read_diger_harcama(harcama_id: int, db: Session = Depends(database.get_db)):
    db_harcama = crud.get_diger_harcama(db, harcama_id=harcama_id)
    if db_harcama is None:
        raise HTTPException(status_code=404, detail="Diğer Harcama not found")
    return db_harcama

@router.put("/diger-harcamalar/{harcama_id}", response_model=diger_harcama.DigerHarcamaInDB)
async def update_diger_harcama(
    harcama_id: int,
    Alici_Adi: str = Form(...),
    Belge_Numarasi: Optional[str] = Form(None),
    Belge_Tarihi: date = Form(...),
    Donem: int = Form(...),
    Tutar: float = Form(...),
    Kategori_ID: int = Form(...),
    Harcama_Tipi: str = Form(...),
    Gunluk_Harcama: Optional[bool] = Form(False),
    Sube_ID: int = Form(...),
    Açıklama: Optional[str] = Form(None),
    Imaj_Adi: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    harcama_data = diger_harcama.DigerHarcamaUpdate(
        Alici_Adi=Alici_Adi,
        Belge_Numarasi=Belge_Numarasi,
        Belge_Tarihi=Belge_Tarihi,
        Donem=Donem,
        Tutar=Tutar,
        Kategori_ID=Kategori_ID,
        Harcama_Tipi=Harcama_Tipi,
        Gunluk_Harcama=Gunluk_Harcama,
        Sube_ID=Sube_ID,
        Açıklama=Açıklama,
        Imaj_Adi=Imaj_Adi
    )
    if image:
        harcama_data.Imaj = await image.read()
    elif Imaj_Adi == "": # Clear image if empty string is sent for Imaj_Adi
        harcama_data.Imaj = None
        harcama_data.Imaj_Adi = None
    db_harcama = await crud.update_diger_harcama(db=db, harcama_id=harcama_id, harcama=harcama_data)
    if db_harcama is None:
        raise HTTPException(status_code=404, detail="Diğer Harcama not found")
    return db_harcama

@router.delete("/diger-harcamalar/{harcama_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diger_harcama(harcama_id: int, db: Session = Depends(database.get_db)):
    db_harcama = crud.delete_diger_harcama(db=db, harcama_id=harcama_id)
    if db_harcama is None:
        raise HTTPException(status_code=404, detail="Diğer Harcama not found")
    return {"message": "Diğer Harcama deleted successfully"}
