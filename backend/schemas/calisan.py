from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal

class CalisanBase(BaseModel):
    TC_No: str
    Adi: str
    Soyadi: str
    Hesap_No: str | None = None
    IBAN: str | None = None
    Net_Maas: Decimal | None = None
    Sigorta_Giris: date | None = None
    Sigorta_Cikis: date | None = None
    Aktif_Pasif: bool = True

class CalisanCreate(CalisanBase):
    Sube_ID: int

class CalisanUpdate(BaseModel):
    Adi: str | None = None
    Soyadi: str | None = None
    Hesap_No: str | None = None
    IBAN: str | None = None
    Net_Maas: Decimal | None = None
    Sigorta_Giris: date | None = None
    Sigorta_Cikis: date | None = None
    Aktif_Pasif: bool | None = None

class Calisan(CalisanBase):
    Sube_ID: int

    class Config:
        from_attributes = True