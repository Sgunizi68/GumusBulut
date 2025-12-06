from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
from decimal import Decimal

class OdemeRaporRequest(BaseModel):
    """Request schema for Odeme Report filters"""
    donem: Optional[List[int]] = None  # Optional array of periods (e.g., [2508, 2509])
    kategori: Optional[List[int]] = None  # Optional array of category IDs
    sube_id: Optional[int] = None  # Branch filter (from context)

class OdemeDetail(BaseModel):
    """Individual Odeme record details"""
    odeme_id: int
    tip: str
    hesap_adi: str
    tarih: date
    aciklama: str
    tutar: Decimal
    
    class Config:
        from_attributes = True

class BankaHesabiGroup(BaseModel):
    """Bank account group within a category"""
    hesap_adi: str
    hesap_total: Decimal
    record_count: int
    details: List[OdemeDetail]

class KategoriGroup(BaseModel):
    """Category group within a period"""
    kategori_id: Optional[int]
    kategori_adi: str
    kategori_total: Decimal
    record_count: int
    banka_hesaplari: List[BankaHesabiGroup]

class DonemGroup(BaseModel):
    """Period group containing categories"""
    donem: int
    donem_total: Decimal
    record_count: int
    kategoriler: List[KategoriGroup]

class OdemeRaporTotals(BaseModel):
    """Summary totals for the report"""
    donem_totals: Dict[int, Decimal]  # {donem: total_amount}
    kategori_totals: Dict[str, Decimal]  # {kategori_id_str: total_amount}
    grand_total: Decimal

class OdemeRaporResponse(BaseModel):
    """Complete response schema for Odeme Report"""
    data: List[DonemGroup]
    totals: OdemeRaporTotals
    filters_applied: OdemeRaporRequest
    total_records: int
    
    class Config:
        from_attributes = True