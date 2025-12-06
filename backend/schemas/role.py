from pydantic import BaseModel, Field
from typing import Optional

class RolBase(BaseModel):
    Rol_Adi: str = Field(..., max_length=50)
    Aciklama: Optional[str] = Field(None, max_length=65535) # TEXT type
    Aktif_Pasif: bool = True

class RolCreate(RolBase):
    pass

class RolUpdate(RolBase):
    pass

class RolInDB(RolBase):
    Rol_ID: int

    class Config:
        from_attributes = True
