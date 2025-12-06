from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date

class UserBase(BaseModel):
    Adi_Soyadi: str = Field(..., max_length=100)
    Kullanici_Adi: str = Field(..., max_length=50)
    Email: Optional[EmailStr] = Field(None, max_length=100)
    Expire_Date: Optional[date] = None
    Aktif_Pasif: bool = True

class UserCreate(UserBase):
    Password: str = Field(..., min_length=6) # Password for creation

class UserUpdate(UserBase):
    Password: Optional[str] = Field(None, min_length=6) # Password can be updated

class UserInDB(UserBase):
    Kullanici_ID: int
    Password: Optional[str] = None

    class Config:
        from_attributes = True
