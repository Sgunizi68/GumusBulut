from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date
from decimal import Decimal

# Reuse existing FaturaRaporRequest for consistency
from schemas.fatura_rapor import FaturaRaporRequest

class B2BEkstreDetail(BaseModel):
    """Individual B2B Ekstre record details"""
    ekstre_id: int
    tarih: date
    fis_no: str
    aciklama: Optional[str] = None
    borc: Decimal
    alacak: Decimal
    tutar: Decimal  # Net amount (Borc - Alacak)
    
    class Config:
        from_attributes = True

class B2BEkstreKategoriGroup(BaseModel):
    """Category group within a period"""
    kategori_id: Optional[int]
    kategori_adi: str
    kategori_total: Decimal
    record_count: int
    kayitlar: List[B2BEkstreDetail]

class B2BEkstreDonemGroup(BaseModel):
    """Period group containing categories"""
    donem: int
    donem_total: Decimal
    record_count: int
    kategoriler: List[B2BEkstreKategoriGroup]

class B2BEkstreRaporTotals(BaseModel):
    """Summary totals for the B2B Ekstre report"""
    donem_totals: Dict[int, Decimal]
    kategori_totals: Dict[str, Decimal]
    grand_total: Decimal

class B2BEkstreRaporResponse(BaseModel):
    """Complete response schema for B2B Ekstre Report"""
    data: List[B2BEkstreDonemGroup]
    totals: B2BEkstreRaporTotals
    filters_applied: FaturaRaporRequest
    total_records: int
    
    class Config:
        from_attributes = True