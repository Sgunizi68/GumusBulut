from pydantic import BaseModel
from datetime import datetime

class StokSayimBase(BaseModel):
    Malzeme_Kodu: str
    Sube_ID: int
    Donem: str
    Miktar: float
    Kayit_Tarihi: datetime = datetime.now()

class StokSayimCreate(StokSayimBase):
    pass

class StokSayimUpdate(BaseModel):
    Miktar: float | None = None

class StokSayimInDB(StokSayimBase):
    Sayim_ID: int

    class Config:
        from_attributes = True
