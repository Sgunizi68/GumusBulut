from pydantic import BaseModel
from datetime import date

class PosOdemesi(BaseModel):
    Gun: date
    POS_Odemesi: float

    class Config:
        orm_mode = True

class YemekCekiOdemesi(BaseModel):
    Gun: date
    Yemek_Ceki: float

    class Config:
        orm_mode = True
