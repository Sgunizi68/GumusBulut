from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import mimetypes

from db import crud, database, models
from schemas import yemek_ceki

router = APIRouter()

@router.post("/yemek-cekiler/", response_model=yemek_ceki.YemekCekiInDB, status_code=status.HTTP_201_CREATED)
async def create_yemek_ceki(
    Kategori_ID: int = Form(...),
    Tarih: date = Form(...),
    Tutar: float = Form(...),
    Odeme_Tarih: date = Form(...),
    Ilk_Tarih: date = Form(...),
    Son_Tarih: date = Form(...),
    Sube_ID: int = Form(...),
    Imaj_Adi: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    yemek_ceki_data = yemek_ceki.YemekCekiCreate(
        Kategori_ID=Kategori_ID,
        Tarih=Tarih,
        Tutar=Tutar,
        Odeme_Tarih=Odeme_Tarih,
        Ilk_Tarih=Ilk_Tarih,
        Son_Tarih=Son_Tarih,
        Sube_ID=Sube_ID,
        Imaj_Adi=Imaj_Adi
    )
    if image:
        # The model expects bytes, so we read the file
        yemek_ceki_data.Imaj = await image.read()
    
    return await crud.create_yemek_ceki(db=db, yemek_ceki_data=yemek_ceki_data)

@router.get("/yemek-cekiler/", response_model=List[yemek_ceki.YemekCekiList])
def read_yemek_cekiler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    yemek_cekiler = crud.get_yemek_cekiler(db, skip=skip, limit=limit)
    return yemek_cekiler

@router.get("/yemek-cekiler/{yemek_ceki_id}", response_model=yemek_ceki.YemekCekiInDB)
def read_yemek_ceki(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    db_yemek_ceki = crud.get_yemek_ceki(db, yemek_ceki_id=yemek_ceki_id)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return db_yemek_ceki

@router.get("/yemek-cekiler/{yemek_ceki_id}/image")
def get_yemek_ceki_image(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    # We query the raw model to get the bytes
    db_yemek_ceki_raw = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    
    if db_yemek_ceki_raw is None or db_yemek_ceki_raw.Imaj is None:
        raise HTTPException(status_code=404, detail="Image not found")

    media_type, _ = mimetypes.guess_type(db_yemek_ceki_raw.Imaj_Adi)
    if media_type is None:
        media_type = "application/octet-stream"

    return Response(content=db_yemek_ceki_raw.Imaj, media_type=media_type)


@router.put("/yemek-cekiler/{yemek_ceki_id}", response_model=yemek_ceki.YemekCekiInDB)
async def update_yemek_ceki(
    yemek_ceki_id: int,
    Kategori_ID: int = Form(...),
    Tarih: date = Form(...),
    Tutar: float = Form(...),
    Odeme_Tarih: date = Form(...),
    Ilk_Tarih: date = Form(...),
    Son_Tarih: date = Form(...),
    Sube_ID: int = Form(...),
    Imaj_Adi: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    yemek_ceki_data = yemek_ceki.YemekCekiUpdate(
        Kategori_ID=Kategori_ID,
        Tarih=Tarih,
        Tutar=Tutar,
        Odeme_Tarih=Odeme_Tarih,
        Ilk_Tarih=Ilk_Tarih,
        Son_Tarih=Son_Tarih,
        Sube_ID=Sube_ID,
        Imaj_Adi=Imaj_Adi
    )
    if image:
        yemek_ceki_data.Imaj = await image.read()
    elif Imaj_Adi == "": # Clear image if empty string is sent for Imaj_Adi
        yemek_ceki_data.Imaj = None
        yemek_ceki_data.Imaj_Adi = None

    db_yemek_ceki = await crud.update_yemek_ceki(db=db, yemek_ceki_id=yemek_ceki_id, yemek_ceki_data=yemek_ceki_data)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return db_yemek_ceki

@router.delete("/yemek-cekiler/{yemek_ceki_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_yemek_ceki(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    db_yemek_ceki = crud.delete_yemek_ceki(db=db, yemek_ceki_id=yemek_ceki_id)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return {"message": "Yemek Çeki deleted successfully"}
