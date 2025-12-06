from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class OdemeReferansBase(BaseModel):
    Referans_Metin: str = Field(..., max_length=50)
    Kategori_ID: int
    Aktif_Pasif: bool = True

class OdemeReferansCreate(OdemeReferansBase):
    pass

class OdemeReferansUpdate(BaseModel):
    Referans_Metin: Optional[str] = Field(None, max_length=50)
    Kategori_ID: Optional[int] = None
    Aktif_Pasif: Optional[bool] = None

class OdemeReferansInDB(OdemeReferansBase):
    Referans_ID: int
    Kayit_Tarihi: Optional[datetime] = None

    class Config:
        from_attributes = True
