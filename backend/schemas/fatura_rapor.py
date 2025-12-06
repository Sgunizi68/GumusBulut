from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
from decimal import Decimal

class FaturaRaporRequest(BaseModel):
    """Request schema for Fatura Report filters"""
    donem: Optional[List[int]] = None  # Optional array of periods (e.g., [2508, 2509])
    kategori: Optional[List[int]] = None  # Optional array of category IDs
    sube_id: Optional[int] = None  # Branch filter (from context)

class FaturaDetail(BaseModel):
    """Individual EFatura record details"""
    fatura_id: int
    fatura_tarihi: date
    fatura_numarasi: str
    alici_unvani: str
    tutar: Decimal
    aciklama: Optional[str] = None
    giden_fatura: Optional[bool] = None
    gunluk_harcama: Optional[bool] = None
    ozel: Optional[bool] = None
    
    class Config:
        from_attributes = True

class KategoriGroup(BaseModel):
    """Category group within a period"""
    kategori_id: Optional[int]
    kategori_adi: str
    kategori_total: Decimal
    record_count: int
    faturalar: List[FaturaDetail]

class DonemGroup(BaseModel):
    """Period group containing categories"""
    donem: int
    donem_total: Decimal
    record_count: int
    kategoriler: List[KategoriGroup]

class FaturaRaporTotals(BaseModel):
    """Summary totals for the report"""
    donem_totals: Dict[int, Decimal]  # {donem: total_amount}
    kategori_totals: Dict[str, Decimal]  # {kategori_id_str: total_amount}
    grand_total: Decimal

class FaturaRaporResponse(BaseModel):
    """Complete response schema for Fatura Report"""
    data: List[DonemGroup]
    totals: FaturaRaporTotals
    filters_applied: FaturaRaporRequest
    total_records: int
    
    class Config:
        from_attributes = True