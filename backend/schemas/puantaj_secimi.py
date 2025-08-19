from pydantic import BaseModel

class PuantajSecimiBase(BaseModel):
    Secim: str
    Degeri: float
    Renk_Kodu: str
    Aktif_Pasif: bool = True

class PuantajSecimiCreate(PuantajSecimiBase):
    pass

class PuantajSecimiUpdate(BaseModel):
    Secim: str | None = None
    Degeri: float | None = None
    Renk_Kodu: str | None = None
    Aktif_Pasif: bool | None = None

class PuantajSecimiInDB(PuantajSecimiBase):
    Secim_ID: int

    class Config:
        from_attributes = True
