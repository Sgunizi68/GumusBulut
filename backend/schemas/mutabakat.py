from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class MutabakatBase(BaseModel):
    Mutabakat_Tarihi: date
    Tutar: float
    Aciklama: Optional[str] = None

class MutabakatCreate(MutabakatBase):
    Cari_ID: int
    Sube_ID: int

class MutabakatUpdate(MutabakatBase):
    Sube_ID: Optional[int] = None

class Mutabakat(MutabakatBase):
    Mutabakat_ID: int
    Cari_ID: int
    Sube_ID: int
    Alici_Unvani: str
    Kayit_Tarihi: datetime

    class Config:
        from_attributes = True