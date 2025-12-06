from pydantic import BaseModel
from datetime import date, datetime

class GelirEkstraBase(BaseModel):
    Sube_ID: int
    Tarih: date
    RobotPos_Tutar: float
    ZRapor_Tutar: float
    Tabak_Sayisi: int = 0
    Kayit_Tarihi: datetime = datetime.now()

class GelirEkstraCreate(GelirEkstraBase):
    pass

class GelirEkstraUpdate(BaseModel):
    RobotPos_Tutar: float | None = None
    ZRapor_Tutar: float | None = None
    Tabak_Sayisi: int | None = None

class GelirEkstraInDB(GelirEkstraBase):
    GelirEkstra_ID: int

    class Config:
        from_attributes = True
