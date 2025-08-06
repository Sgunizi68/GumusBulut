from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Literal

class DigerHarcamaBase(BaseModel):
    Alici_Adi: str = Field(..., max_length=200)
    Belge_Numarasi: Optional[str] = Field(None, max_length=50)
    Belge_Tarihi: date
    Donem: int
    Tutar: float
    Kategori_ID: int
    Harcama_Tipi: Literal['Nakit', 'Banka Ödeme', 'Kredi Kartı']
    Gunluk_Harcama: Optional[bool] = False
    Sube_ID: int
    Açıklama: Optional[str] = Field(None, max_length=45)
    Kayit_Tarihi: Optional[datetime] = None
    Imaj: Optional[str] = None
    Imaj_Adi: Optional[str] = Field(None, max_length=255)

class DigerHarcamaCreate(DigerHarcamaBase):
    pass

class DigerHarcamaUpdate(BaseModel):
    Alici_Adi: Optional[str] = Field(None, max_length=200)
    Belge_Numarasi: Optional[str] = Field(None, max_length=50)
    Belge_Tarihi: Optional[date] = None
    Donem: Optional[int] = None
    Tutar: Optional[float] = None
    Kategori_ID: Optional[int] = None
    Harcama_Tipi: Optional[Literal['Nakit', 'Banka Ödeme', 'Kredi Kartı']] = None
    Gunluk_Harcama: Optional[bool] = None
    Sube_ID: Optional[int] = None
    Açıklama: Optional[str] = Field(None, max_length=45)
    Imaj: Optional[str] = None
    Imaj_Adi: Optional[str] = Field(None, max_length=255)

class DigerHarcamaInDB(DigerHarcamaBase):
    Harcama_ID: int

    class Config:
        from_attributes = True