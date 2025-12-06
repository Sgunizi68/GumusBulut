from pydantic import BaseModel

class KullaniciRolBase(BaseModel):
    Kullanici_ID: int
    Rol_ID: int
    Sube_ID: int
    Aktif_Pasif: bool = True

class KullaniciRolCreate(KullaniciRolBase):
    pass

class KullaniciRolInDB(KullaniciRolBase):
    # For display purposes, might include related names
    Kullanici_Adi: str | None = None
    Rol_Adi: str | None = None
    Sube_Adi: str | None = None

    class Config:
        from_attributes = True
