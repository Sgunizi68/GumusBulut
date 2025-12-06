from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

class NakitBase(BaseModel):
    Tarih: date
    Tutar: Decimal = Field(..., ge=0)
    Tip: Optional[str] = "Bankaya Yatan"
    Donem: int
    Sube_ID: int
    Imaj_Adı: Optional[str] = None
    Imaj: Optional[bytes] = None

class NakitCreate(NakitBase):
    pass

class NakitUpdate(NakitBase):
    Tarih: Optional[date] = None
    Tutar: Optional[Decimal] = Field(None, ge=0)
    Tip: Optional[str] = None
    Donem: Optional[int] = None

class NakitInDB(NakitBase):
    Nakit_ID: int
    Kayit_Tarih: datetime

    class Config:
        from_attributes = True

class NakitBulkResponse(BaseModel):
    message: str
    added: int
    skipped: int
    errors: int
    added_nakit_entries: List[NakitInDB]