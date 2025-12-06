from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from decimal import Decimal

class EFaturaBase(BaseModel):
    Fatura_Tarihi: date
    Fatura_Numarasi: str = Field(..., max_length=50)
    Alici_Unvani: str = Field(..., max_length=200)
    Alici_VKN_TCKN: Optional[str] = Field(None, max_length=20)
    Tutar: Decimal = Field(..., ge=0) # decimal(15,2)
    Kategori_ID: Optional[int] = None
    Aciklama: Optional[str] = None
    Donem: int # int in DB, but frontend uses YYMM string
    Ozel: bool = False
    Gunluk_Harcama: bool = False
    Giden_Fatura: bool = False
    Sube_ID: int

class EFaturaCreate(EFaturaBase):
    pass

class EFaturaUpdate(EFaturaBase):
    Fatura_Tarihi: Optional[date] = None
    Fatura_Numarasi: Optional[str] = Field(None, max_length=50)
    Alici_Unvani: Optional[str] = Field(None, max_length=200)
    Tutar: Optional[Decimal] = Field(None, ge=0)
    Giden_Fatura: Optional[bool] = None
    Sube_ID: Optional[int] = None

class EFaturaInDB(EFaturaBase):
    Fatura_ID: int
    Kayit_Tarihi: datetime
    Kategori_Adi: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }

class EFaturaBulkResponse(BaseModel):
    message: str
    added: int
    skipped: int
    errors: int
    added_invoices: List[EFaturaInDB]
