from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from schemas.mutabakat import Mutabakat, MutabakatUpdate, MutabakatCreate
from datetime import datetime

def get_mutabakat_data(db: Session) -> List[Mutabakat]:
    query = text("""
        SELECT
            M.Cari_ID,
            M.Sube_ID,
            (SELECT Alici_Unvani FROM SilverCloud.Cari C WHERE M.Cari_ID = C.Cari_ID) AS Alici_Unvani,
            M.Mutabakat_Tarihi,
            M.Tutar,
            M.Aciklama,
            M.Mutabakat_ID,
            M.Kayit_Tarihi
        FROM SilverCloud.Mutabakat M
    """)
    result = db.execute(query).fetchall()
    
    mutabakat_list = []
    for row in result:
        mutabakat_list.append(Mutabakat(
            Cari_ID=row.Cari_ID,
            Sube_ID=row.Sube_ID,
            Alici_Unvani=row.Alici_Unvani,
            Mutabakat_Tarihi=row.Mutabakat_Tarihi,
            Tutar=row.Tutar,
            Aciklama=row.Aciklama if row.Aciklama is not None else "NULL",
            Mutabakat_ID=row.Mutabakat_ID,
            Kayit_Tarihi=row.Kayit_Tarihi
        ))
    return mutabakat_list

def create_mutabakat(db: Session, mutabakat_data: MutabakatCreate) -> Mutabakat:
    query = text("""
        INSERT INTO SilverCloud.Mutabakat (Cari_ID, Sube_ID, Mutabakat_Tarihi, Tutar, Aciklama, Kayit_Tarihi)
        VALUES (:cari_id, :sube_id, :mutabakat_tarihi, :tutar, :aciklama, :kayit_tarihi)
    """)
    params = {
        "cari_id": mutabakat_data.Cari_ID,
        "sube_id": mutabakat_data.Sube_ID,
        "mutabakat_tarihi": mutabakat_data.Mutabakat_Tarihi,
        "tutar": mutabakat_data.Tutar,
        "aciklama": mutabakat_data.Aciklama,
        "kayit_tarihi": datetime.now()
    }
    result = db.execute(query, params)
    new_mutabakat_id = result.lastrowid
    db.commit()

    # Fetch the newly created record with Alici_Unvani
    new_record = db.execute(text("""
        SELECT
            M.Cari_ID,
            M.Sube_ID,
            (SELECT Alici_Unvani FROM SilverCloud.Cari C WHERE M.Cari_ID = C.Cari_ID) AS Alici_Unvani,
            M.Mutabakat_Tarihi,
            M.Tutar,
            M.Aciklama,
            M.Mutabakat_ID,
            M.Kayit_Tarihi
        FROM SilverCloud.Mutabakat M
        WHERE M.Mutabakat_ID = :mutabakat_id
    """), {"mutabakat_id": new_mutabakat_id}).fetchone()

    if new_record:
        return Mutabakat(
            Cari_ID=new_record.Cari_ID,
            Sube_ID=new_record.Sube_ID,
            Alici_Unvani=new_record.Alici_Unvani,
            Mutabakat_Tarihi=new_record.Mutabakat_Tarihi,
            Tutar=new_record.Tutar,
            Aciklama=new_record.Aciklama if new_record.Aciklama is not None else "NULL",
            Mutabakat_ID=new_record.Mutabakat_ID,
            Kayit_Tarihi=new_record.Kayit_Tarihi
        )
    return None

def update_mutabakat(db: Session, mutabakat_id: int, mutabakat_data: MutabakatUpdate) -> Mutabakat:
    db.execute(text("""
        UPDATE SilverCloud.Mutabakat
        SET Mutabakat_Tarihi = :mutabakat_tarihi,
            Tutar = :tutar,
            Aciklama = :aciklama,
            Kayit_Tarihi = :kayit_tarihi
        WHERE Mutabakat_ID = :mutabakat_id
    """), {
        "mutabakat_id": mutabakat_id,
        "mutabakat_tarihi": mutabakat_data.Mutabakat_Tarihi,
        "tutar": mutabakat_data.Tutar,
        "aciklama": mutabakat_data.Aciklama,
        "kayit_tarihi": datetime.now()
    })
    db.commit()

    # Re-fetch the full mutabakat data with Alici_Unvani from Cari table
    full_updated_mutabakat = db.execute(text("""
        SELECT
            M.Cari_ID,
            M.Sube_ID,
            (SELECT Alici_Unvani FROM SilverCloud.Cari C WHERE M.Cari_ID = C.Cari_ID) AS Alici_Unvani,
            M.Mutabakat_Tarihi,
            M.Tutar,
            M.Aciklama,
            M.Mutabakat_ID,
            M.Kayit_Tarihi
        FROM SilverCloud.Mutabakat M
        WHERE M.Mutabakat_ID = :mutabakat_id
    """), {"mutabakat_id": mutabakat_id}).fetchone()

    if full_updated_mutabakat:
        return Mutabakat(
            Cari_ID=full_updated_mutabakat.Cari_ID,
            Sube_ID=full_updated_mutabakat.Sube_ID,
            Alici_Unvani=full_updated_mutabakat.Alici_Unvani,
            Mutabakat_Tarihi=full_updated_mutabakat.Mutabakat_Tarihi,
            Tutar=full_updated_mutabakat.Tutar,
            Aciklama=full_updated_mutabakat.Aciklama if full_updated_mutabakat.Aciklama is not None else "NULL",
            Mutabakat_ID=full_updated_mutabakat.Mutabakat_ID,
            Kayit_Tarihi=full_updated_mutabakat.Kayit_Tarihi
        )
    return None

def delete_mutabakat(db: Session, mutabakat_id: int):
    db.execute(text("DELETE FROM SilverCloud.Mutabakat WHERE Mutabakat_ID = :mutabakat_id"), {"mutabakat_id": mutabakat_id})
    db.commit()
    return {"ok": True}