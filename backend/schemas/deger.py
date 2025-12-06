from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class DegerBase(BaseModel):
    Deger_Adi: str = Field(..., max_length=100)
    Gecerli_Baslangic_Tarih: date
    Gecerli_Bitis_Tarih: date
    Deger_Aciklama: Optional[str] = Field(None, max_length=255)
    Deger: float = Field(..., ge=0)

class DegerCreate(DegerBase):
    pass

class DegerUpdate(DegerBase):
    pass

class Deger(DegerBase):
    Deger_ID: int

    class Config:
        from_attributes = True