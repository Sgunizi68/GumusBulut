from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from db.database import get_db
from schemas.vps import VPSDashboardData, MainData, ScoreData
from db.models import Puantaj, Calisan, GelirEkstra, PuantajSecimi
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/vps-dashboard", response_model=VPSDashboardData)
def get_vps_dashboard_data(month: str, db: Session = Depends(get_db)):
    try:
        year = 2000 + int(month[:2])
        month_num = int(month[2:])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYMM.")

    start_date = datetime(year, month_num, 1)
    end_date = (start_date.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

    # 1. Puantaj Günü and Dates
    puantaj_gunu_query = db.query(extract('day', Puantaj.Tarih)).filter(
        Puantaj.Tarih >= start_date, 
        Puantaj.Tarih <= end_date
    ).distinct().all()
    dates = sorted([d[0] for d in puantaj_gunu_query])
    if not dates:
        return VPSDashboardData(mainData=[], scoreData=[], dates=[], iseGirenCalisanSayisi=0, istenCikanCalisanSayisi=0)

    # 2. Çalışan and Aktif Çalışan Ortalaması
    calisan_counts = []
    aktif_calisan_counts = []
    for day in dates:
        date_obj = datetime(year, month_num, day)
        calisan_count = db.query(func.count(Calisan.TC_No)).filter(
            Calisan.Sigorta_Giris <= date_obj,
            (Calisan.Sigorta_Cikis == None) | (Calisan.Sigorta_Cikis >= date_obj)
        ).scalar()
        calisan_counts.append(calisan_count)

        aktif_calisan_count = db.query(func.count(Puantaj.TC_No.distinct())).filter(
            Puantaj.Tarih == date_obj
        ).scalar()
        aktif_calisan_counts.append(aktif_calisan_count)

    calisan_ortalama = f"{sum(calisan_counts) / len(calisan_counts):.1f}" if calisan_counts else "0.0"
    aktif_calisan_ortalama = f"{sum(aktif_calisan_counts) / len(aktif_calisan_counts):.1f}" if aktif_calisan_counts else "0.0"

    # 3. Tabak Sayısı
    tabak_sayisi_query = db.query(func.sum(GelirEkstra.Tabak_Sayisi)).filter(
        extract('year', GelirEkstra.Tarih) == year,
        extract('month', GelirEkstra.Tarih) == month_num,
        extract('day', GelirEkstra.Tarih).in_(dates)
    ).group_by(extract('day', GelirEkstra.Tarih)).order_by(extract('day', GelirEkstra.Tarih)).all()
    tabak_sayisi = [ts[0] if ts[0] is not None else 0 for ts in tabak_sayisi_query]

    # 4. VPS
    # This is a placeholder. VPS calculation logic needs to be defined.
    vps_values = [random.randint(2, 4) for _ in dates]

    main_data = [
        MainData(label="Çalışan Ortalaması", average=calisan_ortalama, values=calisan_counts),
        MainData(label="Aktif Çalışan Ortalaması", average=aktif_calisan_ortalama, values=aktif_calisan_counts),
        MainData(label="Puantaj Günü", values=dates),
        MainData(label="Tabak Sayısı", values=tabak_sayisi),
        MainData(label="VPS", values=vps_values),
    ]

    # 5. İşe Giren ve İşten Çıkan Çalışan Sayısı
    ise_giren = db.query(func.count(Calisan.TC_No)).filter(
        extract('year', Calisan.Sigorta_Giris) == year,
        extract('month', Calisan.Sigorta_Giris) == month_num
    ).scalar()

    isten_cikan = db.query(func.count(Calisan.TC_No)).filter(
        extract('year', Calisan.Sigorta_Cikis) == year,
        extract('month', Calisan.Sigorta_Cikis) == month_num
    ).scalar()

    # 6. Puantaj Özeti (Score Data)
    puantaj_secimleri = db.query(PuantajSecimi).all()
    score_data = []
    for secim in puantaj_secimleri:
        person_counts = []
        values = []
        for day in dates:
            date_obj = datetime(year, month_num, day)
            count = db.query(func.count(Puantaj.TC_No)).filter(
                Puantaj.Tarih == date_obj,
                Puantaj.Secim_ID == secim.Secim_ID
            ).scalar()
            person_counts.append(count)
            values.append(str(secim.Degeri) if count > 0 else '')

        score_data.append(ScoreData(
            label=secim.Secim,
            multiplier=f"{secim.Degeri}x",
            values=values,
            personCounts=person_counts
        ))

    return VPSDashboardData(
        mainData=main_data,
        scoreData=score_data,
        dates=dates,
        iseGirenCalisanSayisi=ise_giren,
        istenCikanCalisanSayisi=isten_cikan,
    )