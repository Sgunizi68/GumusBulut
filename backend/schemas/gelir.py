from pydantic import BaseModel
from datetime import date, datetime

class GelirBase(BaseModel):
    Sube_ID: int
    Kategori_ID: int
    Tarih: date
    Tutar: float
    Kayit_Tarihi: datetime = datetime.now()

class GelirCreate(GelirBase):
    pass

class GelirUpdate(BaseModel):
    Kategori_ID: int | None = None
    Tarih: date | None = None
    Tutar: float | None = None

class GelirInDB(GelirBase):
    Gelir_ID: int

    class Config:
        from_attributes = True
