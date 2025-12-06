from pydantic import BaseModel
from typing import Optional

class CariBase(BaseModel):
    Alici_Unvani: str
    e_Fatura_Kategori_ID: Optional[int] = None
    Referans_ID: Optional[int] = None
    Cari: Optional[bool] = True
    Aciklama: Optional[str] = None
    Aktif_Pasif: Optional[bool] = True

class CariCreate(CariBase):
    pass

class CariUpdate(CariBase):
    pass

class Cari(CariBase):
    Cari_ID: int

    class Config:
        orm_mode = True