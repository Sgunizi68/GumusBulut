from pydantic import BaseModel
from datetime import date
from typing import Optional

class PosOdemesi(BaseModel):
    Gun: date
    POS_Odemesi: float

    class Config:
        orm_mode = True

class YemekCekiOdemesi(BaseModel):
    Gun: date
    Yemek_Ceki: float

    class Config:
        orm_mode = True

class OnlineVirman(BaseModel):
    Gun: date
    Online_Virman: float

    class Config:
        orm_mode = True

class GidenFatura(BaseModel):
    Kategori_Adi: str
    Alici_Unvani: str
    Tutar: float

    class Config:
        orm_mode = True

class CariFatura(BaseModel):
    Cari_Durumu: str
    Alici_Unvani: str
    Fatura_ID: int
    Fatura_Tarihi: date
    Fatura_Numarasi: str
    Tutar: float
    Kategori_ID: Optional[int] = None

    class Config:
        orm_mode = True

class CariMutabakat(BaseModel):
    Cari_ID: int
    Alici_Unvani: str
    Son_Mutabakat_Tarihi: Optional[date] = None
    Toplam_Mutabakat_Tutari: Optional[float] = None

    class Config:
        orm_mode = True

class CariOdeme(BaseModel):
    Cari_ID: int
    Alici_Unvani: str
    Tutar: float
    Tarih: date

    class Config:
        orm_mode = True
