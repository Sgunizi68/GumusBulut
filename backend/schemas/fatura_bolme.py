from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

class FaturaBolmeBase(BaseModel):
    Bolunmus_Fatura: str
    Ana_Fatura: str
    Ana_Tutar: Decimal
    Fatura_ID: int
    Fatura_Tarihi: date
    Fatura_Numarasi: str
    Alici_Unvani: str
    Alici_VKN_TCKN: Optional[str] = None
    Tutar: Decimal
    Kategori_ID: Optional[int] = None
    Kategori_Adi: Optional[str] = None
    Aciklama: Optional[str] = None
    Donem: int
    Ozel: bool
    Gunluk_Harcama: bool
    Giden_Fatura: bool
    Sube_ID: int
    Kayit_Tarihi: datetime

class FaturaBolme(FaturaBolmeBase):
    class Config:
        from_attributes = True
