from pydantic import BaseModel
from typing import List, Dict, Any

class ReportDataItem(BaseModel):
    Tarih: str
    Donem: int
    Tutar: float

class NakitYatirmaRaporu(BaseModel):
    bankaya_yatan: List[ReportDataItem]
    nakit_girisi: List[ReportDataItem]