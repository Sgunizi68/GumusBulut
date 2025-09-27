from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class CalisanTalepBase(BaseModel):
    Talep: str
    TC_No: str
    Adi: str
    Soyadi: str
    Ilk_Soyadi: str
    Hesap_No: Optional[str] = None
    IBAN: Optional[str] = None
    Ogrenim_Durumu: Optional[str] = None
    Cinsiyet: str
    Gorevi: Optional[str] = None
    Anne_Adi: Optional[str] = None
    Baba_Adi: Optional[str] = None
    Dogum_Yeri: Optional[str] = None
    Dogum_Tarihi: Optional[date] = None
    Medeni_Hali: str
    Cep_No: Optional[str] = None
    Adres_Bilgileri: Optional[str] = None
    Gelir_Vergisi_Matrahi: Optional[float] = None
    SSK_Cikis_Nedeni: Optional[str] = None
    Net_Maas: Optional[float] = None
    Sigorta_Giris: Optional[date] = None
    Sigorta_Cikis: Optional[date] = None
    Is_Onay_Veren_Kullanici_ID: Optional[int] = None
    Is_Onay_Tarih: Optional[datetime] = None
    SSK_Onay_Veren_Kullanici_ID: Optional[int] = None
    SSK_Onay_Tarih: Optional[datetime] = None
    Sube_ID: int
    Imaj_Adi: Optional[str] = None

class CalisanTalepCreate(CalisanTalepBase):
    pass

class CalisanTalepUpdate(CalisanTalepBase):
    pass

class CalisanTalep(CalisanTalepBase):
    Calisan_Talep_ID: int
    Kayit_Tarih: datetime

    class Config:
        orm_mode = True
