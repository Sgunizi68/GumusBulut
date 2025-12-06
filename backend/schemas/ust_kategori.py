from pydantic import BaseModel

class UstKategoriBase(BaseModel):
    UstKategori_Adi: str
    Aktif_Pasif: bool | None = True

class UstKategoriCreate(UstKategoriBase):
    pass

class UstKategoriUpdate(BaseModel):
    UstKategori_Adi: str | None = None
    Aktif_Pasif: bool | None = None

class UstKategoriInDB(UstKategoriBase):
    UstKategori_ID: int

    class Config:
        from_attributes = True
