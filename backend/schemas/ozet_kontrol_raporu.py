from pydantic import BaseModel

class OzetKontrolRaporuData(BaseModel):
    robotpos_tutar: float
    toplam_satis_gelirleri: float
    nakit: float
    gunluk_harcama_efatura: float
    gunluk_harcama_diger: float
    kalan_nakit: float
    bankaya_yatan: float
    gelir_pos: float
    pos_hareketleri: float
    gelir_toplam: float
    virman_toplam: float
    aylik_gelir: float
    toplam_donem: float
