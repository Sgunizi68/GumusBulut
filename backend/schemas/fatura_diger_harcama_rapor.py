from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date
from decimal import Decimal

# Reuse existing FaturaRaporRequest for consistency
from schemas.fatura_rapor import FaturaRaporRequest

class KayitDetail(BaseModel):
    """Unified record details for both EFatura and DigerHarcama"""
    id: int
    tarih: date
    belge_numarasi: str
    karsi_taraf_adi: str
    tutar: Decimal
    aciklama: Optional[str] = None
    etiket: str  # "Gelen Fatura", "Giden Fatura", or "Diğer Harcama"
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
    kayitlar: List[KayitDetail]

class DonemGroup(BaseModel):
    """Period group containing categories"""
    donem: int
    donem_total: Decimal
    record_count: int
    kategoriler: List[KategoriGroup]

class FaturaDigerHarcamaRaporTotals(BaseModel):
    """Summary totals for the combined report"""
    donem_totals: Dict[int, Decimal]
    kategori_totals: Dict[str, Decimal]
    grand_total: Decimal

class FaturaDigerHarcamaRaporResponse(BaseModel):
    """Complete response schema for combined report"""
    data: List[DonemGroup]
    totals: FaturaDigerHarcamaRaporTotals
    filters_applied: FaturaRaporRequest
    total_records: int
    
    class Config:
        from_attributes = True