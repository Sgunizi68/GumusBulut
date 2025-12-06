from pydantic import BaseModel

class RolYetkiBase(BaseModel):
    Rol_ID: int
    Yetki_ID: int
    Aktif_Pasif: bool = True

class RolYetkiCreate(RolYetkiBase):
    pass

class RolYetkiInDB(RolYetkiBase):
    # For display purposes, might include related names
    Rol_Adi: str | None = None
    Yetki_Adi: str | None = None

    class Config:
        from_attributes = True
