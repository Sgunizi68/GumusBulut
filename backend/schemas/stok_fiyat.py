from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class StokFiyatBase(BaseModel):
    Malzeme_Kodu: str
    Gecerlilik_Baslangic_Tarih: str
    Fiyat: float
    Sube_ID: int
    Aktif_Pasif: bool = True

class StokFiyatCreate(StokFiyatBase):
    pass

class StokFiyatUpdate(BaseModel):
    Malzeme_Kodu: Optional[str] = None
    Gecerlilik_Baslangic_Tarih: Optional[str] = None
    Fiyat: Optional[float] = None
    Sube_ID: Optional[int] = None
    Aktif_Pasif: Optional[bool] = None

class StokFiyatInDB(StokFiyatBase):
    Fiyat_ID: int
    Malzeme_Aciklamasi: Optional[str] = None # Added Malzeme_Aciklamasi

    class Config:
        from_attributes = True
