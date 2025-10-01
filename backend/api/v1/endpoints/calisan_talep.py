from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
from datetime import date, datetime

from db import crud, database
from schemas import calisan_talep

router = APIRouter()

@router.get("/calisan-talepler/", response_model=List[calisan_talep.CalisanTalep])
def read_calisan_talepler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    talepler = crud.get_calisan_talepler(db, skip=skip, limit=limit)
    for talep in talepler:
        if talep.Imaj:
            talep.Imaj = base64.b64encode(talep.Imaj).decode('utf-8')
    return talepler

@router.get("/calisan-talepler/by-tc/{tc_no}", response_model=calisan_talep.CalisanTalep)
def read_calisan_talep_by_tc_no(tc_no: str, db: Session = Depends(database.get_db)):
    db_talep = crud.get_calisan_talep_by_tc_no(db, tc_no=tc_no)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')
    return db_talep

@router.get("/calisan-talepler/{talep_id}", response_model=calisan_talep.CalisanTalep)
def read_calisan_talep(talep_id: int, db: Session = Depends(database.get_db)):
    db_talep = crud.get_calisan_talep(db, talep_id=talep_id)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")
    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')
    return db_talep

@router.put("/calisan-talepler/{talep_id}", response_model=calisan_talep.CalisanTalep)
async def update_calisan_talep(
    talep_id: int,
    db: Session = Depends(database.get_db),
    Talep: str = Form(...),
    TC_No: str = Form(...),
    Adi: str = Form(...),
    Soyadi: str = Form(...),
    Ilk_Soyadi: str = Form(...),
    Hesap_No: Optional[str] = Form(None),
    IBAN: Optional[str] = Form(None),
    Ogrenim_Durumu: Optional[str] = Form(None),
    Cinsiyet: str = Form(...),
    Gorevi: Optional[str] = Form(None),
    Anne_Adi: Optional[str] = Form(None),
    Baba_Adi: Optional[str] = Form(None),
    Dogum_Yeri: Optional[str] = Form(None),
    Dogum_Tarihi: Optional[date] = Form(None),
    Medeni_Hali: str = Form(...),
    Cep_No: Optional[str] = Form(None),
    Adres_Bilgileri: Optional[str] = Form(None),
    Gelir_Vergisi_Matrahi: Optional[float] = Form(None),
    SSK_Cikis_Nedeni: Optional[str] = Form(None),
    Net_Maas: Optional[float] = Form(None),
    Sigorta_Giris: Optional[date] = Form(None),
    Sigorta_Cikis: Optional[date] = Form(None),
    Is_Onay_Veren_Kullanici_ID: Optional[int] = Form(None),
    Is_Onay_Tarih: Optional[datetime] = Form(None),
    SSK_Onay_Veren_Kullanici_ID: Optional[int] = Form(None),
    SSK_Onay_Tarih: Optional[datetime] = Form(None),
    Sube_ID: int = Form(...),
    Imaj: Optional[UploadFile] = File(None)
):
    update_data_dict = {
        "Talep": Talep,
        "TC_No": TC_No,
        "Adi": Adi,
        "Soyadi": Soyadi,
        "Ilk_Soyadi": Ilk_Soyadi,
        "Hesap_No": Hesap_No,
        "IBAN": IBAN,
        "Ogrenim_Durumu": Ogrenim_Durumu,
        "Cinsiyet": Cinsiyet,
        "Gorevi": Gorevi,
        "Anne_Adi": Anne_Adi,
        "Baba_Adi": Baba_Adi,
        "Dogum_Yeri": Dogum_Yeri,
        "Dogum_Tarihi": Dogum_Tarihi,
        "Medeni_Hali": Medeni_Hali,
        "Cep_No": Cep_No,
        "Adres_Bilgileri": Adres_Bilgileri,
        "Gelir_Vergisi_Matrahi": Gelir_Vergisi_Matrahi,
        "SSK_Cikis_Nedeni": SSK_Cikis_Nedeni,
        "Net_Maas": Net_Maas,
        "Sigorta_Giris": Sigorta_Giris,
        "Sigorta_Cikis": Sigorta_Cikis,
        "Is_Onay_Veren_Kullanici_ID": Is_Onay_Veren_Kullanici_ID,
        "Is_Onay_Tarih": Is_Onay_Tarih,
        "SSK_Onay_Veren_Kullanici_ID": SSK_Onay_Veren_Kullanici_ID,
        "SSK_Onay_Tarih": SSK_Onay_Tarih,
        "Sube_ID": Sube_ID,
    }

    if Imaj:
        update_data_dict["Imaj"] = await Imaj.read()
        update_data_dict["Imaj_Adi"] = Imaj.filename

    talep_update_model = calisan_talep.CalisanTalepUpdate(**update_data_dict)

    db_talep = crud.update_calisan_talep(db, talep_id=talep_id, talep=talep_update_model)
    if db_talep is None:
        raise HTTPException(status_code=404, detail="Calisan Talep not found")

    if db_talep.Imaj:
        db_talep.Imaj = base64.b64encode(db_talep.Imaj).decode('utf-8')

    return db_talep