from pydantic import BaseModel
from typing import List, Optional

class YemekCekiKontrolDashboardSummary(BaseModel):
    aylik_toplam_gelir: float
    donem_tutar_toplami: float
    fark: float
    kontrol_edilen_kayit: int

class YemekCekiKontrolDashboardDetail(BaseModel):
    id: int
    kategori_adi: str
    ilk_tarih: Optional[str]
    son_tarih: Optional[str]
    tutar: float
    onceki_donem_tutar: float
    sonraki_donem_tutar: float
    donem_tutar: float
    fatura_durum: str
    fatura_tarihi: Optional[str]
    odeme_tarihi: Optional[str]
    kontrol_edildi: bool

class YemekCekiKontrolDashboardCategory(BaseModel):
    kategori_adi: str
    aylik_gelir: float
    toplam_donem: float
    fark: float
    details: List[YemekCekiKontrolDashboardDetail]

class YemekCekiKontrolDashboardResponse(BaseModel):
    summary: YemekCekiKontrolDashboardSummary
    categories: List[YemekCekiKontrolDashboardCategory]
    donem: str
    sube_id: int