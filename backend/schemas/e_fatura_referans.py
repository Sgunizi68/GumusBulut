from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EFaturaReferansBase(BaseModel):
    Alici_Unvani: str = Field(..., max_length=200)
    Referans_Kodu: str = Field(..., max_length=50)
    Kategori_ID: Optional[int] = None
    Aciklama: Optional[str] = Field(None, max_length=500)
    Aktif_Pasif: bool = True

class EFaturaReferansCreate(EFaturaReferansBase):
    pass

class EFaturaReferansUpdate(BaseModel):
    Referans_Kodu: Optional[str] = Field(None, max_length=50)
    Kategori_ID: Optional[int] = None
    Aciklama: Optional[str] = Field(None, max_length=500)
    Aktif_Pasif: Optional[bool] = None

class EFaturaReferansInDB(EFaturaReferansBase):
    Kayit_Tarihi: datetime

    class Config:
        from_attributes = True
