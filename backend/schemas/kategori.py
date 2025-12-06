from pydantic import BaseModel
from typing import Literal

class KategoriBase(BaseModel):
    Kategori_Adi: str
    Ust_Kategori_ID: int | None = None
    Tip: Literal["Gelir", "Gider", "Bilgi", "Ödeme", "Giden Fatura"]
    Aktif_Pasif: bool = True
    Gizli: bool = False

class KategoriCreate(KategoriBase):
    pass

class KategoriUpdate(BaseModel):
    Kategori_Adi: str | None = None
    Ust_Kategori_ID: int | None = None
    Tip: str | None = None
    Aktif_Pasif: bool | None = None
    Gizli: bool | None = None

class KategoriInDB(KategoriBase):
    Kategori_ID: int

    class Config:
        from_attributes = True
