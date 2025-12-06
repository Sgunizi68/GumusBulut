from pydantic import BaseModel, Field
from typing import Optional

class YetkiBase(BaseModel):
    Yetki_Adi: str = Field(..., max_length=100)
    Aciklama: Optional[str] = Field(None, max_length=65535) # TEXT type
    Tip: Optional[str] = Field(None, max_length=50)
    Aktif_Pasif: bool = True

class YetkiCreate(YetkiBase):
    pass

class YetkiUpdate(YetkiBase):
    pass

class YetkiInDB(YetkiBase):
    Yetki_ID: int

    class Config:
        from_attributes = True
