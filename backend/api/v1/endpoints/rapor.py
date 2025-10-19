from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from db import report_crud, database
from schemas import rapor

router = APIRouter()

@router.get("/rapor/pos-odemeleri", response_model=List[rapor.PosOdemesi])
def get_pos_odemeleri(
    start_date: date,
    end_date: date,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_pos_odemeleri_by_date_range(
        db=db,
        start_date=start_date,
        end_date=end_date,
        sube_id=sube_id
    )

@router.get("/rapor/yemek-ceki", response_model=List[rapor.YemekCekiOdemesi])
def get_yemek_ceki(
    start_date: date,
    end_date: date,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_yemek_ceki_by_date_range(
        db=db,
        start_date=start_date,
        end_date=end_date,
        sube_id=sube_id
    )

@router.get("/rapor/online-virman", response_model=List[rapor.OnlineVirman])
def get_online_virman(
    start_date: date,
    end_date: date,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_online_virman_by_date_range(
        db=db,
        start_date=start_date,
        end_date=end_date,
        sube_id=sube_id
    )

@router.get("/rapor/giden-fatura", response_model=List[rapor.GidenFatura])
def get_giden_fatura(
    donem: int,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_giden_fatura_by_donem(
        db=db,
        donem=donem,
        sube_id=sube_id
    )

@router.get("/rapor/cari-fatura", response_model=List[rapor.CariFatura])
def get_cari_fatura_raporu(
    sube_id: int,
    baslangic_tarih: date,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_cari_fatura(db=db, sube_id=sube_id, baslangic_tarih=baslangic_tarih)

@router.get("/rapor/cari-mutabakat", response_model=List[rapor.CariMutabakat])
def get_cari_mutabakat_raporu(
    db: Session = Depends(database.get_db)
):
    return report_crud.get_cari_mutabakat(db=db)

@router.get("/rapor/cari-odeme", response_model=List[rapor.CariOdeme])
def get_cari_odeme_raporu(
    sube_id: int,
    baslangic_tarih: date,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_cari_odeme(db=db, sube_id=sube_id, baslangic_tarih=baslangic_tarih)

@router.get("/rapor/cari-fatura-by-firma", response_model=List[rapor.CariFatura])
def get_cari_fatura_by_firma_raporu(
    sube_id: int,
    alici_unvani: str,
    baslangic_tarih: date,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_cari_fatura_by_firma(db=db, sube_id=sube_id, alici_unvani=alici_unvani, baslangic_tarih=baslangic_tarih)

@router.get("/rapor/cari-odeme-by-firma", response_model=List[rapor.CariOdeme])
def get_cari_odeme_by_firma_raporu(
    sube_id: int,
    alici_unvani: str,
    baslangic_tarih: date,
    db: Session = Depends(database.get_db)
):
    return report_crud.get_cari_odeme_by_firma(db=db, sube_id=sube_id, alici_unvani=alici_unvani, baslangic_tarih=baslangic_tarih)

