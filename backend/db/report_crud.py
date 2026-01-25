from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case, extract, text
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
        extract('year', models.EFatura.Fatura_Tarihi) == year,
        models.EFatura.Giden_Fatura == 0
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

def get_pos_odemeleri_by_date_range(db: Session, start_date: datetime.date, end_date: datetime.date, sube_id: int):
    sql = text("""
        SELECT Hesaba_Gecis as Gun, sum(Net_Tutar) as POS_Odemesi
        FROM POS_Hareketleri
        WHERE Hesaba_Gecis >= :start_date AND Hesaba_Gecis <= :end_date AND Sube_ID = :sube_id
        GROUP BY Hesaba_Gecis
        ORDER BY Hesaba_Gecis;
    """)
    result = db.execute(sql, {"start_date": start_date, "end_date": end_date, "sube_id": sube_id})
    return result.fetchall()

def get_yemek_ceki_by_date_range(db: Session, start_date: datetime.date, end_date: datetime.date, sube_id: int):
    sql = text("""
        SELECT Odeme_Tarih as Gun, sum(Tutar) as Yemek_Ceki
        FROM Yemek_Ceki
        WHERE Odeme_Tarih >= :start_date AND Odeme_Tarih <= :end_date AND Sube_ID = :sube_id
        GROUP BY Odeme_Tarih
        ORDER BY Odeme_Tarih;
    """)
    result = db.execute(sql, {"start_date": start_date, "end_date": end_date, "sube_id": sube_id})
    return result.fetchall()

def get_online_virman_by_date_range(db: Session, start_date: datetime.date, end_date: datetime.date, sube_id: int):
    sql = text("""
        SELECT
            DATE(Tarih, '+28 days') as Gun,
            SUM(Tutar) * IFNULL((SELECT Deger FROM Deger WHERE Deger_Adi = 'Online Ödeme'), 0) as Online_Virman
        FROM Gelir
        WHERE
            Tarih >= DATE(:start_date, '-28 days') AND
            Tarih <= DATE(:end_date, '-28 days') AND
            Sube_ID = :sube_id AND
            Kategori_ID IN (
                SELECT Kategori_ID
                FROM Kategori
                WHERE Ust_Kategori_ID = (
                    SELECT UstKategori_ID FROM UstKategori WHERE UstKategori_Adi = 'E-Ticaret Kredi Kart'
                )
            )
        GROUP BY Tarih
        ORDER BY Tarih;
    """)
    result = db.execute(sql, {"start_date": start_date, "end_date": end_date, "sube_id": sube_id})
    return result.fetchall()

def get_giden_fatura_by_donem(db: Session, donem: int, sube_id: int):
    sql = text("""
        SELECT k.Kategori_Adi, e.Alici_Unvani, e.Tutar 
        FROM e_Fatura e
        JOIN Kategori k ON e.Kategori_ID = k.Kategori_ID
        WHERE e.Giden_Fatura = 1 
        AND e.Donem = :donem 
        AND e.Sube_ID = :sube_id
        AND k.Kategori_Adi IN ('İade Fatura', 'Giden Fatura')
        ORDER BY k.Kategori_Adi, e.Alici_Unvani;
    """)
    result = db.execute(sql, {"donem": donem, "sube_id": sube_id})
    return result.fetchall()

def get_cari_fatura(db: Session, sube_id: int, baslangic_tarih: datetime.date):
    sql = text("""
        SELECT
            CASE
                WHEN C.Cari IS NULL THEN 'Belirsiz'
                WHEN C.Cari = 0 THEN 'Cari Olmayan Borç'
                ELSE 'Cari Borç'
            END AS Cari_Durumu,
            E.Alici_Unvani,
            E.Fatura_ID,
            E.Fatura_Tarihi,
            E.Fatura_Numarasi,
            E.Tutar,
            E.Kategori_ID
        FROM e_Fatura AS E
        LEFT JOIN Cari AS C
            ON C.Alici_Unvani = E.Alici_Unvani
            AND C.e_Fatura_Kategori_ID = E.Kategori_ID
        WHERE E.Fatura_Tarihi >= :baslangic_tarih AND
              E.Sube_ID = :sube_id
        ORDER BY
            CASE
                WHEN C.Cari IS NULL THEN 3
                WHEN C.Cari = 0 THEN 2
                ELSE 1
            END,
            E.Fatura_Tarihi;
    """)
    result = db.execute(sql, {"sube_id": sube_id, "baslangic_tarih": baslangic_tarih})
    return result.fetchall()

def get_cari_mutabakat(db: Session):
    sql = text("""
        SELECT
            C.Cari_ID,
            C.Alici_Unvani,
            MAX(M.Mutabakat_Tarihi) AS Son_Mutabakat_Tarihi,
            SUM(M.Tutar) AS Toplam_Mutabakat_Tutari
        FROM Cari AS C
        LEFT JOIN Mutabakat AS M
            ON M.Cari_ID = C.Cari_ID
        GROUP BY
            C.Cari_ID, C.Alici_Unvani
        ORDER BY
            Son_Mutabakat_Tarihi DESC;
    """)
    result = db.execute(sql)
    return result.fetchall()

def get_cari_odeme(db: Session, sube_id: int, baslangic_tarih: datetime.date):
    sql = text("""
        SELECT
            C.Cari_ID,
            C.Alici_Unvani,
            -1 * O.Tutar AS Tutar,
            O.Tarih
        FROM Cari AS C
        INNER JOIN Odeme_Referans AS ORF
            ON C.Referans_ID = ORF.Referans_ID
        INNER JOIN Odeme AS O
            ON O.Kategori_ID = ORF.Kategori_ID
           AND O.Aciklama LIKE CONCAT('%', ORF.Referans_Metin, '%')
        WHERE
            O.Sube_ID = :sube_id
            AND O.Tarih >= :baslangic_tarih
        ORDER BY
            C.Cari_ID, O.Tarih DESC;
    """)
    result = db.execute(sql, {"sube_id": sube_id, "baslangic_tarih": baslangic_tarih})
    return result.fetchall()

def get_cari_fatura_by_firma(db: Session, sube_id: int, alici_unvani: str, baslangic_tarih: datetime.date):
    sql = text("""
        SELECT
            CASE
                WHEN C.Cari IS NULL THEN 'Belirsiz'
                WHEN C.Cari = 0 THEN 'Cari Olmayan Borç'
                ELSE 'Cari Borç'
            END AS Cari_Durumu,
            E.Alici_Unvani,
            E.Fatura_ID,
            E.Fatura_Tarihi,
            E.Fatura_Numarasi,
            E.Tutar,
            E.Kategori_ID
        FROM e_Fatura AS E
        LEFT JOIN Cari AS C
            ON C.Alici_Unvani = E.Alici_Unvani
            AND C.e_Fatura_Kategori_ID = E.Kategori_ID
        WHERE E.Fatura_Tarihi >= :baslangic_tarih AND
              E.Sube_ID = :sube_id AND
              E.Alici_Unvani = :alici_unvani
        ORDER BY
            E.Fatura_Tarihi;
    """)
    result = db.execute(sql, {"sube_id": sube_id, "baslangic_tarih": baslangic_tarih, "alici_unvani": alici_unvani})
    return result.fetchall()

def get_cari_odeme_by_firma(db: Session, sube_id: int, alici_unvani: str, baslangic_tarih: datetime.date):
    sql = text("""
        SELECT
            C.Cari_ID,
            C.Alici_Unvani,
            -1 * O.Tutar AS Tutar,
            O.Tarih
        FROM Cari AS C
        INNER JOIN Odeme_Referans AS ORF
            ON C.Referans_ID = ORF.Referans_ID
        INNER JOIN Odeme AS O
            ON O.Kategori_ID = ORF.Kategori_ID
           AND O.Aciklama LIKE CONCAT('%', ORF.Referans_Metin, '%')
        WHERE
            O.Sube_ID = :sube_id
            AND O.Tarih >= :baslangic_tarih
            AND C.Alici_Unvani = :alici_unvani
        ORDER BY
            O.Tarih DESC;
    """)
    result = db.execute(sql, {"sube_id": sube_id, "baslangic_tarih": baslangic_tarih, "alici_unvani": alici_unvani})
    return result.fetchall()