from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal # Import Decimal

class OdemeBase(BaseModel):
    Tip: str = Field(..., max_length=50)
    Hesap_Adi: str = Field(..., max_length=50)
    Tarih: date
    Aciklama: str = Field(..., max_length=200)
    Tutar: Decimal # Changed to Decimal
    Kategori_ID: Optional[int] = None
    Donem: Optional[int] = None
    Sube_ID: int

class OdemeCreate(OdemeBase):
    pass

class OdemeUpdate(BaseModel):
    Tip: Optional[str] = Field(None, max_length=50)
    Hesap_Adi: Optional[str] = Field(None, max_length=50)
    Tarih: Optional[date] = None
    Aciklama: Optional[str] = Field(None, max_length=200)
    Tutar: Optional[Decimal] = None # Changed to Decimal
    Kategori_ID: Optional[int] = None
    Donem: Optional[int] = None
    Sube_ID: Optional[int] = None

class OdemeInDB(OdemeBase):
    Odeme_ID: int
    Kayit_Tarihi: Optional[datetime] = None

    class Config:
        from_attributes = True
