from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class POSHareketleriBase(BaseModel):
    Islem_Tarihi: date
    Hesaba_Gecis: date
    Para_Birimi: str = Field(..., max_length=5)
    Islem_Tutari: Decimal = Field(..., ge=0, decimal_places=2)
    Kesinti_Tutari: Decimal = Field(0.00, ge=0, decimal_places=2)
    Net_Tutar: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    Sube_ID: int

class POSHareketleriCreate(POSHareketleriBase):
    pass

class POSHareketleriUpdate(POSHareketleriBase):
    Islem_Tarihi: Optional[date] = None
    Hesaba_Gecis: Optional[date] = None
    Para_Birimi: Optional[str] = Field(None, max_length=5)
    Islem_Tutari: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    Kesinti_Tutari: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    Net_Tutar: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    Sube_ID: Optional[int] = None

class POSHareketleriInDB(POSHareketleriBase):
    ID: int
    Kayit_Tarihi: datetime

    class Config:
        from_attributes = True