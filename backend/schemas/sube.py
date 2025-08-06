from pydantic import BaseModel, Field
from typing import Optional

class SubeBase(BaseModel):
    Sube_Adi: str = Field(..., max_length=100)
    Aciklama: Optional[str] = Field(None, max_length=65535) # TEXT type
    Aktif_Pasif: bool = True

class SubeCreate(SubeBase):
    pass

class SubeUpdate(SubeBase):
    pass

class SubeInDB(SubeBase):
    Sube_ID: int

    class Config:
        from_attributes = True
