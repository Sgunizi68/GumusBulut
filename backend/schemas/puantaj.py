from pydantic import BaseModel
from datetime import date, datetime

class PuantajBase(BaseModel):
    TC_No: str
    Tarih: date
    Sube_ID: int
    Secim_ID: int
    Kayit_Tarihi: datetime = datetime.now()

class PuantajCreate(PuantajBase):
    pass

class PuantajUpdate(BaseModel):
    Secim_ID: int | None = None

class PuantajInDB(PuantajBase):
    Puantaj_ID: int

    class Config:
        from_attributes = True