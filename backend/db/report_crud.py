from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, extract
from decimal import Decimal
import datetime
from . import models

def get_bayi_karlilik_raporu(db: Session, year: int, sube_id: int):
    
    def get_monthly_values(query_results):
        monthly_values = [Decimal('0.0')] * 12
        for month, total in query_results:
            if month and 1 <= month <= 12:
                monthly_values[month - 1] = Decimal(total) if total else Decimal('0.0')
        return monthly_values

    def get_kategori_id(db: Session, kategori_adi: str):
        kategori = db.query(models.Kategori.Kategori_ID).filter(models.Kategori.Kategori_Adi == kategori_adi).first()
        return kategori[0] if kategori else None
    
    def get_ust_kategori_id(db: Session, ust_kategori_adi: str):
        ust_kategori = db.query(models.UstKategori.UstKategori_ID).filter(models.UstKategori.UstKategori_Adi == ust_kategori_adi).first()
        return ust_kategori[0] if ust_kategori else None

    def get_kategori_ids_by_ust_kategori(db: Session, ust_kategori_id: int):
        if not ust_kategori_id:
            return []
        return [id[0] for id in db.query(models.Kategori.Kategori_ID).filter(models.Kategori.Ust_Kategori_ID == ust_kategori_id).all()]

    # --- Calculations for specific rows ---

    # Get category IDs
    yemeksepeti_kategori_id = get_kategori_id(db, 'Yemek Sepeti (Online) Komisyonu')
    
    base_efatura_query = db.query(
        extract('month', models.EFatura.Fatura_Tarihi),
        func.sum(models.EFatura.Tutar)
    ).filter(
        models.EFatura.Sube_ID == sube_id,
        extract('year', models.EFatura.Fatura_Tarihi) == year
    ).group_by(extract('month', models.EFatura.Fatura_Tarihi))

    # Yemeksepeti
    yemeksepeti_values = [Decimal('0.0')] * 12
    if yemeksepeti_kategori_id:
        yemeksepeti_query = base_efatura_query.filter(
            models.EFatura.Kategori_ID == yemeksepeti_kategori_id,
            models.EFatura.Aciklama.like('%Yemek Sepeti%')
        ).all()
        yemeksepeti_values = get_monthly_values(yemeksepeti_query)

    # Trendyol
    trendyol_values = [Decimal('0.0')] * 12
    if yemeksepeti_kategori_id:
        trendyol_query = base_efatura_query.filter(
            models.EFatura.Kategori_ID == yemeksepeti_kategori_id,
            models.EFatura.Aciklama.like('%Trendyol%')
        ).all()
        trendyol_values = get_monthly_values(trendyol_query)

    # Getir
    getir_values = [Decimal('0.0')] * 12
    if yemeksepeti_kategori_id:
        getir_query = base_efatura_query.filter(
            models.EFatura.Kategori_ID == yemeksepeti_kategori_id,
            models.EFatura.Aciklama.like('%Getir%')
        ).all()
        getir_values = get_monthly_values(getir_query)

    # Migros
    migros_values = [Decimal('0.0')] * 12
    if yemeksepeti_kategori_id:
        migros_query = base_efatura_query.filter(
            models.EFatura.Kategori_ID == yemeksepeti_kategori_id,
            models.EFatura.Aciklama.like('%Migros%')
        ).all()
        migros_values = get_monthly_values(migros_query)

    # "Diğer Detay Toplamı" and "Demirbaş Sayılmayan Giderler"
    
    # This is complex. I will need to calculate all other rows in "Diğer Detay" first.
    # For now, I will return placeholder values for these.
    demirbas_sayilmayan_giderler_values = [Decimal('0.0')] * 12
    diger_detay_toplami_values = [Decimal('0.0')] * 12

    # --- Construct Response ---
    
    # This is a partial response for now
    response = {
        "processedExcelRows": [
            { "label": "Yemeksepeti Komisyon ve Lojistik Giderleri", "values": [float(v) for v in yemeksepeti_values], "total": float(sum(yemeksepeti_values)), "category": "lojistik" },
            { "label": "Trendyol Komisyon ve Lojistik Giderleri", "values": [float(v) for v in trendyol_values], "total": float(sum(trendyol_values)), "category": "lojistik" },
            { "label": "Getir Getirsin Komisyon ve Lojistik Giderleri", "values": [float(v) for v in getir_values], "total": float(sum(getir_values)), "category": "lojistik" },
            { "label": "Migros Hemen Komisyon ve Lojistik Giderleri", "values": [float(v) for v in migros_values], "total": float(sum(migros_values)), "category": "lojistik" },
        ],
        "processedDigerRows": [
            { "label": "Demirbaş Sayılmayan Giderler", "values": [float(v) for v in demirbas_sayilmayan_giderler_values], "total": float(sum(demirbas_sayilmayan_giderler_values)), "category": "diger" },
        ],
        "processedMoreRows": [
            { "label": "Diğer Detay Toplamı", "values": [float(v) for v in diger_detay_toplami_values], "total": float(sum(diger_detay_toplami_values)), "category": "gider" },
        ]
    }
    return response
