from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class YemekCekiBase(BaseModel):
    Kategori_ID: int
    Tarih: date
    Tutar: float
    Odeme_Tarih: date
    Ilk_Tarih: date
    Son_Tarih: date
    Sube_ID: int = 1

class YemekCekiCreate(YemekCekiBase):
    pass

class YemekCekiUpdate(BaseModel):
    Kategori_ID: Optional[int] = None
    Tarih: Optional[date] = None
    Tutar: Optional[float] = None
    Odeme_Tarih: Optional[date] = None
    Ilk_Tarih: Optional[date] = None
    Son_Tarih: Optional[date] = None
    Sube_ID: Optional[int] = None

class YemekCekiInDB(YemekCekiBase):
    ID: int
    Kayit_Tarihi: Optional[datetime] = None

    class Config:
        from_attributes = True