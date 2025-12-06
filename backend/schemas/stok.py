from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class StokBase(BaseModel):
    Urun_Grubu: str
    Malzeme_Kodu: str
    Malzeme_Aciklamasi: str
    Birimi: str
    Sinif: Optional[str] = None
    Aktif_Pasif: bool = True

class StokCreate(StokBase):
    pass

class StokUpdate(BaseModel):
    Urun_Grubu: Optional[str] = None
    Malzeme_Kodu: Optional[str] = None
    Malzeme_Aciklamasi: Optional[str] = None
    Birimi: Optional[str] = None
    Sinif: Optional[str] = None
    Aktif_Pasif: Optional[bool] = None

class StokInDB(StokBase):
    Stok_ID: int

    class Config:
        from_attributes = True
