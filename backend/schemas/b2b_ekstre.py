from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class B2BEkstreBase(BaseModel):
    Tarih: date
    Fis_No: str = Field(..., max_length=50)
    Fis_Turu: Optional[str] = Field(None, max_length=50)
    Aciklama: Optional[str] = None
    Borc: float = Field(0.00)
    Alacak: float = Field(0.00)
    Toplam_Bakiye: Optional[float] = None
    Fatura_No: Optional[str] = Field(None, max_length=50)
    Fatura_Metni: Optional[str] = None
    Donem: str # int in DB, but frontend uses YYMM string
    Kategori_ID: Optional[int] = None
    Sube_ID: int

class B2BEkstreCreate(B2BEkstreBase):
    pass

class B2BEkstreUpdate(BaseModel):
    Tarih: Optional[date] = None
    Fis_No: Optional[str] = Field(None, max_length=50)
    Fis_Turu: Optional[str] = Field(None, max_length=50)
    Aciklama: Optional[str] = None
    Borc: Optional[float] = None
    Alacak: Optional[float] = None
    Toplam_Bakiye: Optional[float] = None
    Fatura_No: Optional[str] = Field(None, max_length=50)
    Fatura_Metni: Optional[str] = None
    Donem: Optional[str] = None
    Kategori_ID: Optional[int] = None
    Sube_ID: Optional[int] = None

class B2BEkstreInDB(B2BEkstreBase):
    Ekstre_ID: int
    Kayit_Tarihi: Optional[datetime] = None

    class Config:
        from_attributes = True
