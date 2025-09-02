from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class POSKontrolDailyData(BaseModel):
    Tarih: str  # Date in YYYY-MM-DD format
    Gelir_POS: Optional[Decimal] = None
    POS_Hareketleri: Optional[Decimal] = None
    POS_Kesinti: Optional[Decimal] = None
    POS_Net: Optional[Decimal] = None
    Odeme: Optional[Decimal] = None
    Odeme_Kesinti: Optional[Decimal] = None
    Odeme_Net: Optional[Decimal] = None
    Kontrol_POS: Optional[str] = None  # "OK" or "Not OK"
    Kontrol_Kesinti: Optional[str] = None  # "OK" or "Not OK"

class POSKontrolSummary(BaseModel):
    total_records: int
    successful_matches: int
    error_matches: int
    success_rate: str  # Percentage string like "100%"

class POSKontrolDashboardResponse(BaseModel):
    data: List[POSKontrolDailyData]
    summary: POSKontrolSummary