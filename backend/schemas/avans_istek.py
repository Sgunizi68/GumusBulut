from pydantic import BaseModel
from datetime import datetime

class AvansIstekBase(BaseModel):
    TC_No: str
    Donem: int
    Sube_ID: int
    Tutar: float
    Aciklama: str | None = None
    Kayit_Tarihi: datetime = datetime.now()

class AvansIstekCreate(AvansIstekBase):
    pass

class AvansIstekUpdate(BaseModel):
    Tutar: float | None = None
    Aciklama: str | None = None

class AvansIstekInDB(AvansIstekBase):
    Avans_ID: int

    class Config:
        from_attributes = True
