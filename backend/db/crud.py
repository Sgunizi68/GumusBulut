from sqlalchemy.orm import Session
from typing import List
from datetime import date

from db import models
from schemas import sube, user, role, permission, kullanici_rol, rol_yetki, e_fatura, b2b_ekstre, diger_harcama, gelir, gelir_ekstra, stok, stok_fiyat, stok_sayim, calisan, puantaj_secimi, puantaj, avans_istek, ust_kategori, kategori, deger, e_fatura_referans, nakit, odeme, odeme_referans, pos_hareketleri, yemek_ceki, calisan_talep, cari
from core.security import verify_password, get_password_hash

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.Password):
        return False
    return user
    return user

# --- Sube CRUD ---
def get_sube(db: Session, sube_id: int):
    return db.query(models.Sube).filter(models.Sube.Sube_ID == sube_id).first()

def get_sube_by_name(db: Session, sube_adi: str):
    return db.query(models.Sube).filter(models.Sube.Sube_Adi == sube_adi).first()

def get_subeler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sube).offset(skip).limit(limit).all()

def create_sube(db: Session, sube: sube.SubeCreate):
    db_sube = models.Sube(**sube.dict())
    db.add(db_sube)
    db.commit()
    db.refresh(db_sube)
    return db_sube

def update_sube(db: Session, sube_id: int, sube: sube.SubeUpdate):
    db_sube = db.query(models.Sube).filter(models.Sube.Sube_ID == sube_id).first()
    if db_sube:
        for key, value in sube.dict(exclude_unset=True).items():
            setattr(db_sube, key, value)
        db.commit()
        db.refresh(db_sube)
    return db_sube

def delete_sube(db: Session, sube_id: int):
    db_sube = db.query(models.Sube).filter(models.Sube.Sube_ID == sube_id).first()
    if db_sube:
        db.delete(db_sube)
        db.commit()
    return db_sube

# --- Kullanici CRUD ---
def get_user(db: Session, user_id: int):
    return db.query(models.Kullanici).filter(models.Kullanici.Kullanici_ID == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.Kullanici).filter(models.Kullanici.Kullanici_Adi == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Kullanici).offset(skip).limit(limit).all()

def create_user(db: Session, user: user.UserCreate):
    hashed_password = get_password_hash(user.Password)
    db_user = models.Kullanici(**user.dict(exclude={"Password"}), Password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: user.UserUpdate):
    db_user = db.query(models.Kullanici).filter(models.Kullanici.Kullanici_ID == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        if "Password" in update_data and update_data["Password"] is not None:
            update_data["Password"] = get_password_hash(update_data["Password"])
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.Kullanici).filter(models.Kullanici.Kullanici_ID == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def get_users_by_role_name(db: Session, role_name: str) -> List[models.Kullanici]:
    """
    Retrieves all users associated with a specific role by role name.
    """
    return db.query(models.Kullanici).join(models.KullaniciRol).join(models.Rol).filter(models.Rol.Rol_Adi == role_name).all()

# --- Rol CRUD ---
def get_rol(db: Session, rol_id: int):
    return db.query(models.Rol).filter(models.Rol.Rol_ID == rol_id).first()

def get_rol_by_name(db: Session, rol_adi: str):
    return db.query(models.Rol).filter(models.Rol.Rol_Adi == rol_adi).first()

def get_roller(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Rol).offset(skip).limit(limit).all()

def create_rol(db: Session, rol: role.RolCreate):
    db_rol = models.Rol(**rol.dict())
    db.add(db_rol)
    db.commit()
    db.refresh(db_rol)
    return db_rol

def update_rol(db: Session, rol_id: int, rol: role.RolUpdate):
    db_rol = db.query(models.Rol).filter(models.Rol.Rol_ID == rol_id).first()
    if db_rol:
        for key, value in rol.dict(exclude_unset=True).items():
            setattr(db_rol, key, value)
        db.commit()
        db.refresh(db_rol)
    return db_rol

def delete_rol(db: Session, rol_id: int):
    db_rol = db.query(models.Rol).filter(models.Rol.Rol_ID == rol_id).first()
    if db_rol:
        db.delete(db_rol)
        db.commit()
    return db_rol

# --- Yetki CRUD ---
def get_yetki(db: Session, yetki_id: int):
    return db.query(models.Yetki).filter(models.Yetki.Yetki_ID == yetki_id).first()

def get_yetki_by_name(db: Session, yetki_adi: str):
    return db.query(models.Yetki).filter(models.Yetki.Yetki_Adi == yetki_adi).first()

def get_yetkiler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Yetki).offset(skip).limit(limit).all()

def create_yetki(db: Session, yetki: permission.YetkiCreate):
    db_yetki = models.Yetki(**yetki.dict())
    db.add(db_yetki)
    db.commit()
    db.refresh(db_yetki)
    return db_yetki

def update_yetki(db: Session, yetki_id: int, yetki: permission.YetkiUpdate):
    db_yetki = db.query(models.Yetki).filter(models.Yetki.Yetki_ID == yetki_id).first()
    if db_yetki:
        for key, value in yetki.dict(exclude_unset=True).items():
            setattr(db_yetki, key, value)
        db.commit()
        db.refresh(db_yetki)
    return db_yetki

def delete_yetki(db: Session, yetki_id: int):
    db_yetki = db.query(models.Yetki).filter(models.Yetki.Yetki_ID == yetki_id).first()
    if db_yetki:
        db.delete(db_yetki)
        db.commit()
    return db_yetki

# --- KullaniciRol CRUD ---
def get_kullanici_rol(db: Session, kullanici_id: int, rol_id: int, sube_id: int):
    return db.query(models.KullaniciRol).filter(
        models.KullaniciRol.Kullanici_ID == kullanici_id,
        models.KullaniciRol.Rol_ID == rol_id,
        models.KullaniciRol.Sube_ID == sube_id
    ).first()

def get_kullanici_rolleri(db: Session, kullanici_id: int | None = None, skip: int = 0, limit: int = 100):
    query = db.query(models.KullaniciRol)
    if kullanici_id:
        query = query.filter(models.KullaniciRol.Kullanici_ID == kullanici_id)
    return query.offset(skip).limit(limit).all()

def create_kullanici_rol(db: Session, kr: kullanici_rol.KullaniciRolCreate):
    db_kr = models.KullaniciRol(**kr.dict())
    db.add(db_kr)
    db.commit()
    db.refresh(db_kr)
    return db_kr

def update_kullanici_rol_status(db: Session, kullanici_id: int, rol_id: int, sube_id: int, aktif_pasif: bool):
    db_kr = db.query(models.KullaniciRol).filter(
        models.KullaniciRol.Kullanici_ID == kullanici_id,
        models.KullaniciRol.Rol_ID == rol_id,
        models.KullaniciRol.Sube_ID == sube_id
    ).first()
    if db_kr:
        db_kr.Aktif_Pasif = aktif_pasif
        db.commit()
        db.refresh(db_kr)
    return db_kr

def delete_kullanici_rol(db: Session, kullanici_id: int, rol_id: int, sube_id: int):
    db_kr = db.query(models.KullaniciRol).filter(
        models.KullaniciRol.Kullanici_ID == kullanici_id,
        models.KullaniciRol.Rol_ID == rol_id,
        models.KullaniciRol.Sube_ID == sube_id
    ).first()
    if db_kr:
        db.delete(db_kr)
        db.commit()
    return db_kr

# --- EFatura CRUD ---
def get_efatura(db: Session, efatura_id: int):
    return db.query(models.EFatura).filter(models.EFatura.Fatura_ID == efatura_id).first()

def get_efaturalar(db: Session):
    return db.query(models.EFatura).all()

def create_efaturas_bulk(db: Session, efaturas: List[e_fatura.EFaturaCreate]):
    added_invoices = []
    skipped_count = 0
    error_count = 0
    
    for efatura_data in efaturas:
        print("Processing efatura:", efatura_data)
        # Skip if Fatura_Numarasi is empty or None
        if not efatura_data.Fatura_Numarasi:
            skipped_count += 1
            continue

        # Check if the invoice already exists
        exists = db.query(models.EFatura).filter(
            models.EFatura.Fatura_Numarasi == efatura_data.Fatura_Numarasi,
            models.EFatura.Sube_ID == efatura_data.Sube_ID
        ).first()
        
        if exists:
            skipped_count += 1
            continue

        try:
            # Check for existing e_fatura_referans to assign Kategori_ID
            efatura_referans = db.query(models.EFaturaReferans).filter(
                models.EFaturaReferans.Alici_Unvani == efatura_data.Alici_Unvani
            ).first()

            if efatura_referans:
                efatura_data.Kategori_ID = efatura_referans.Kategori_ID
            
            db_efatura = models.EFatura(**efatura_data.dict())
            db.add(db_efatura)
            db.commit()
            db.refresh(db_efatura)
            added_invoices.append(db_efatura)
        except Exception as e:
            print(f"Error adding invoice {efatura_data.Fatura_Numarasi}: {e}")
            db.rollback()
            error_count += 1

    return {
        "message": f"Processed {len(efaturas)} invoices.",
        "added": len(added_invoices),
        "skipped": skipped_count,
        "errors": error_count,
        "added_invoices": added_invoices
    }

def update_efatura(db: Session, efatura_id: int, efatura: e_fatura.EFaturaUpdate):
    db_efatura = db.query(models.EFatura).filter(models.EFatura.Fatura_ID == efatura_id).first()
    if db_efatura:
        for key, value in efatura.dict(exclude_unset=True).items():
            setattr(db_efatura, key, value)
        db.commit()
        db.refresh(db_efatura)
    return db_efatura

def delete_efatura(db: Session, efatura_id: int):
    db_efatura = db.query(models.EFatura).filter(models.EFatura.Fatura_ID == efatura_id).first()
    if db_efatura:
        db.delete(db_efatura)
        db.commit()
    return db_efatura

def get_efatura_by_fatura_numarasi(db: Session, fatura_numarasi: str):
    result = db.query(models.EFatura, models.Kategori.Kategori_Adi).outerjoin(models.Kategori, models.EFatura.Kategori_ID == models.Kategori.Kategori_ID).filter(models.EFatura.Fatura_Numarasi == fatura_numarasi).first()
    if result:
        efatura, kategori_adi = result
        efatura.Kategori_Adi = kategori_adi
        return efatura
    return None

def create_efatura(db: Session, efatura: e_fatura.EFaturaCreate):
    # Check for existing e_fatura_referans to assign Kategori_ID
    efatura_referans = db.query(models.EFaturaReferans).filter(
        models.EFaturaReferans.Alici_Unvani == efatura.Alici_Unvani
    ).first()

    if efatura_referans:
        efatura.Kategori_ID = efatura_referans.Kategori_ID

    db_efatura = models.EFatura(**efatura.dict())
    db.add(db_efatura)
    db.commit()
    db.refresh(db_efatura)
    return db_efatura


# --- RolYetki CRUD ---
def get_rol_yetki(db: Session, rol_id: int, yetki_id: int):
    return db.query(models.RolYetki).filter(
        models.RolYetki.Rol_ID == rol_id,
        models.RolYetki.Yetki_ID == yetki_id
    ).first()

def get_rol_yetkileri(db: Session, rol_id: int | None = None, skip: int = 0, limit: int = 100):
    query = db.query(models.RolYetki)
    if rol_id:
        query = query.filter(models.RolYetki.Rol_ID == rol_id)
    return query.offset(skip).limit(limit).all()

def create_rol_yetki(db: Session, ry: rol_yetki.RolYetkiCreate):
    db_ry = models.RolYetki(**ry.dict())
    db.add(db_ry)
    db.commit()
    db.refresh(db_ry)
    return db_ry

def update_rol_yetki_status(db: Session, rol_id: int, yetki_id: int, aktif_pasif: bool):
    db_ry = db.query(models.RolYetki).filter(
        models.RolYetki.Rol_ID == rol_id,
        models.RolYetki.Yetki_ID == yetki_id
    ).first()
    if db_ry:
        db_ry.Aktif_Pasif = aktif_pasif
        db.commit()
        db.refresh(db_ry)
    return db_ry

def delete_rol_yetki(db: Session, rol_id: int, yetki_id: int):
    db_ry = db.query(models.RolYetki).filter(
        models.RolYetki.Rol_ID == rol_id,
        models.RolYetki.Yetki_ID == yetki_id
    ).first()
    if db_ry:
        db.delete(db_ry)
        db.commit()
    return db_ry

# --- B2BEkstre CRUD ---
def get_b2b_ekstre(db: Session, ekstre_id: int):
    ekstre = db.query(models.B2BEkstre).filter(models.B2BEkstre.Ekstre_ID == ekstre_id).first()
    if ekstre: ekstre.Donem = str(ekstre.Donem)
    return ekstre

def get_b2b_ekstreler(db: Session, skip: int = 0):
    ekstreler = db.query(models.B2BEkstre).offset(skip).all()
    for ekstre in ekstreler:
        ekstre.Donem = str(ekstre.Donem)
    return ekstreler

def create_b2b_ekstre(db: Session, ekstre: b2b_ekstre.B2BEkstreCreate):
    ekstre_dict = ekstre.dict()
    ekstre_dict['Donem'] = int(ekstre_dict['Donem'])
    db_ekstre = models.B2BEkstre(**ekstre_dict)
    db.add(db_ekstre)
    db.commit()
    db.refresh(db_ekstre)
    db_ekstre.Donem = str(db_ekstre.Donem) # Convert back to string for response
    return db_ekstre

def update_b2b_ekstre(db: Session, ekstre_id: int, ekstre: b2b_ekstre.B2BEkstreUpdate):
    print(f"[CRUD] update_b2b_ekstre called: ekstre_id={ekstre_id}, ekstre_data={ekstre.dict(exclude_unset=True)}")
    db_ekstre = db.query(models.B2BEkstre).filter(models.B2BEkstre.Ekstre_ID == ekstre_id).first()
    if db_ekstre:
        update_data = ekstre.dict(exclude_unset=True)
        if 'Donem' in update_data and update_data['Donem'] is not None: 
            update_data['Donem'] = int(update_data['Donem'])
        for key, value in update_data.items():
            setattr(db_ekstre, key, value)
        db.commit()
        db.refresh(db_ekstre)
        db_ekstre.Donem = str(db_ekstre.Donem) # Convert back to string for response
    return db_ekstre

def delete_b2b_ekstre(db: Session, ekstre_id: int):
    db_ekstre = db.query(models.B2BEkstre).filter(models.B2BEkstre.Ekstre_ID == ekstre_id).first()
    if db_ekstre:
        db.delete(db_ekstre)
        db.commit()
    return db_ekstre

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_b2b_ekstre_by_unique_fields(db: Session, ekstre: b2b_ekstre.B2BEkstreCreate):
    return db.query(models.B2BEkstre).filter(
        models.B2BEkstre.Tarih == ekstre.Tarih,
        models.B2BEkstre.Fis_No == ekstre.Fis_No,
        models.B2BEkstre.Borc == ekstre.Borc,
        models.B2BEkstre.Alacak == ekstre.Alacak,
        models.B2BEkstre.Sube_ID == ekstre.Sube_ID
    ).first()

def create_b2b_ekstre_bulk(db: Session, ekstreler: List[b2b_ekstre.B2BEkstreCreate]):
    added_count = 0
    skipped_count = 0
    logger.info(f"Starting bulk create of B2B Ekstre for {len(ekstreler)} records.")

    new_ekstreler_mappings = []
    for ekstre_data in ekstreler:
        existing_ekstre = get_b2b_ekstre_by_unique_fields(db, ekstre_data)
        if existing_ekstre:
            logger.info(f"Skipping existing record: {ekstre_data.Fis_No}")
            skipped_count += 1
            continue
        
        ekstre_dict = ekstre_data.dict()
        ekstre_dict['Donem'] = int(ekstre_dict['Donem'])
        new_ekstreler_mappings.append(ekstre_dict)
        added_count += 1

    if new_ekstreler_mappings:
        try:
            db.bulk_insert_mappings(models.B2BEkstre, new_ekstreler_mappings)
            db.commit()
            logger.info(f"Successfully committed {added_count} new B2B Ekstre records.")
        except Exception as e:
            logger.error(f"Error committing B2B Ekstre records: {e}")
            db.rollback()
            raise
        
    return {"added": added_count, "skipped": skipped_count}


# --- DigerHarcama CRUD ---
import base64

def get_diger_harcama(db: Session, harcama_id: int):
    harcama = db.query(models.DigerHarcama).filter(models.DigerHarcama.Harcama_ID == harcama_id).first()
    if harcama:
        if harcama.Donem is not None:
            harcama.Donem = str(harcama.Donem)
        if harcama.Imaj is not None:
            harcama.Imaj = base64.b64encode(harcama.Imaj).decode('utf-8')
    return harcama

def get_diger_harcamalar(db: Session, skip: int = 0):
    harcamalar = db.query(models.DigerHarcama).offset(skip).all()
    for harcama in harcamalar:
        if harcama.Donem is not None:
            harcama.Donem = str(harcama.Donem)
        if harcama.Imaj is not None:
            harcama.Imaj = base64.b64encode(harcama.Imaj).decode('utf-8')
    return harcamalar

async def create_diger_harcama(db: Session, harcama: diger_harcama.DigerHarcamaCreate):
    harcama_dict = harcama.dict(exclude_unset=True)
    if 'Donem' in harcama_dict and harcama_dict['Donem'] is not None:
        harcama_dict['Donem'] = int(harcama_dict['Donem'])
    
    db_harcama = models.DigerHarcama(**harcama_dict)
    db.add(db_harcama)
    db.commit()
    db.refresh(db_harcama)
    
    # Convert Donem back to string and Imaj to base64 for the response
    if db_harcama.Donem is not None:
        db_harcama.Donem = str(db_harcama.Donem)
    if db_harcama.Imaj is not None:
        db_harcama.Imaj = base64.b64encode(db_harcama.Imaj).decode('utf-8')
        
    return db_harcama

async def update_diger_harcama(db: Session, harcama_id: int, harcama: diger_harcama.DigerHarcamaUpdate):
    print(f"[CRUD] update_diger_harcama called: harcama_id={harcama_id}, harcama_data={harcama.dict(exclude_unset=True)}")
    db_harcama = db.query(models.DigerHarcama).filter(models.DigerHarcama.Harcama_ID == harcama_id).first()
    if db_harcama:
        update_data = harcama.dict(exclude_unset=True)
        
        # Ensure 'Donem' is an integer if present
        if 'Donem' in update_data and update_data['Donem'] is not None:
            try:
                update_data['Donem'] = int(update_data['Donem'])
            except (ValueError, TypeError):
                # Handle cases where 'Donem' is not a valid integer
                raise HTTPException(status_code=422, detail="Invalid 'Donem' value. Must be an integer.")

        # Handle image data if present
        if 'Imaj' in update_data and isinstance(update_data['Imaj'], bytes):
            db_harcama.Imaj = update_data['Imaj']
            # Optionally remove 'Imaj' from update_data if it's handled separately
            del update_data['Imaj']

        for key, value in update_data.items():
            setattr(db_harcama, key, value)
            
        db.commit()
        db.refresh(db_harcama)
        
        # Convert 'Donem' back to string for the response, if needed
        if db_harcama.Donem is not None:
            db_harcama.Donem = str(db_harcama.Donem)

        # Convert Imaj to base64 for the response
        if db_harcama.Imaj is not None:
            db_harcama.Imaj = base64.b64encode(db_harcama.Imaj).decode('utf-8')
            
    return db_harcama

def delete_diger_harcama(db: Session, harcama_id: int):
    db_harcama = db.query(models.DigerHarcama).filter(models.DigerHarcama.Harcama_ID == harcama_id).first()
    if db_harcama:
        db.delete(db_harcama)
        db.commit()
    return db_harcama

# --- Gelir CRUD ---
def get_gelir(db: Session, gelir_id: int):
    return db.query(models.Gelir).filter(models.Gelir.Gelir_ID == gelir_id).first()

def get_gelirler(db: Session, skip: int = 0, limit: int | None = None):
    return db.query(models.Gelir).offset(skip).limit(limit).all()

def create_gelir(db: Session, gelir: gelir.GelirCreate):
    db_gelir = models.Gelir(**gelir.dict())
    db.add(db_gelir)
    db.commit()
    db.refresh(db_gelir)
    return db_gelir

def update_gelir(db: Session, gelir_id: int, gelir: gelir.GelirUpdate):
    db_gelir = db.query(models.Gelir).filter(models.Gelir.Gelir_ID == gelir_id).first()
    if db_gelir:
        for key, value in gelir.dict(exclude_unset=True).items():
            setattr(db_gelir, key, value)
        db.commit()
        db.refresh(db_gelir)
    return db_gelir

def delete_gelir(db: Session, gelir_id: int):
    db_gelir = db.query(models.Gelir).filter(models.Gelir.Gelir_ID == gelir_id).first()
    if db_gelir:
        db.delete(db_gelir)
        db.commit()
    return db_gelir

def get_nakit_gelir_by_date_range(db: Session, start_date: date, end_date: date, sube_id: int):
    logger.info(f"get_nakit_gelir_by_date_range called with start_date: {start_date}, end_date: {end_date}, sube_id: {sube_id}")
    nakit_kategori = db.query(models.Kategori).filter(models.Kategori.Kategori_Adi == 'Nakit').first()
    if not nakit_kategori:
        logger.warning("Nakit category not found.")
        return []
    
    logger.info(f"Nakit category ID: {nakit_kategori.Kategori_ID}")
    
    result = db.query(models.Gelir).filter(
        models.Gelir.Tarih >= start_date,
        models.Gelir.Tarih <= end_date,
        models.Gelir.Sube_ID == sube_id,
        models.Gelir.Kategori_ID == nakit_kategori.Kategori_ID
    ).all()
    logger.info(f"Found {len(result)} records in get_nakit_gelir_by_date_range.")
    return result

# --- GelirEkstra CRUD ---
def get_gelir_ekstra(db: Session, gelir_ekstra_id: int):
    return db.query(models.GelirEkstra).filter(models.GelirEkstra.GelirEkstra_ID == gelir_ekstra_id).first()

def get_gelir_ekstralar(db: Session, skip: int = 0, limit: int | None = None):
    return db.query(models.GelirEkstra).offset(skip).limit(limit).all()

def create_gelir_ekstra(db: Session, gelir_ekstra: gelir_ekstra.GelirEkstraCreate):
    db_gelir_ekstra = models.GelirEkstra(
        Sube_ID=gelir_ekstra.Sube_ID,
        Tarih=gelir_ekstra.Tarih,
        RobotPos_Tutar=gelir_ekstra.RobotPos_Tutar,
        ZRapor_Tutar=gelir_ekstra.ZRapor_Tutar
    )
    db.add(db_gelir_ekstra)
    db.commit()
    db.refresh(db_gelir_ekstra)
    return db_gelir_ekstra

def update_gelir_ekstra(db: Session, gelir_ekstra_id: int, gelir_ekstra: gelir_ekstra.GelirEkstraUpdate):
    db_gelir_ekstra = db.query(models.GelirEkstra).filter(models.GelirEkstra.GelirEkstra_ID == gelir_ekstra_id).first()
    if db_gelir_ekstra:
        update_data = gelir_ekstra.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_gelir_ekstra, key, value)
        db.commit()
        db.refresh(db_gelir_ekstra)
    return db_gelir_ekstra

def delete_gelir_ekstra(db: Session, gelir_ekstra_id: int):
    db_gelir_ekstra = db.query(models.GelirEkstra).filter(models.GelirEkstra.GelirEkstra_ID == gelir_ekstra_id).first()
    if db_gelir_ekstra:
        db.delete(db_gelir_ekstra)
        db.commit()
    return db_gelir_ekstra

# --- Stok CRUD ---
def get_stok(db: Session, stok_id: int):
    return db.query(models.Stok).filter(models.Stok.Stok_ID == stok_id).first()

def get_stoklar(db: Session, skip: int = 0):
    return db.query(models.Stok).offset(skip).all()

def create_stok(db: Session, stok: stok.StokCreate):
    db_stok = models.Stok(**stok.dict())
    db.add(db_stok)
    db.commit()
    db.refresh(db_stok)
    return db_stok

def update_stok(db: Session, stok_id: int, stok: stok.StokUpdate):
    db_stok = db.query(models.Stok).filter(models.Stok.Stok_ID == stok_id).first()
    if db_stok:
        for key, value in stok.dict(exclude_unset=True).items():
            setattr(db_stok, key, value)
        db.commit()
        db.refresh(db_stok)
    return db_stok

def delete_stok(db: Session, stok_id: int):
    db_stok = db.query(models.Stok).filter(models.Stok.Stok_ID == stok_id).first()
    if db_stok:
        db.delete(db_stok)
        db.commit()
    return db_stok

# --- StokFiyat CRUD ---
def get_stok_fiyat(db: Session, fiyat_id: int):
    stok_fiyat_with_details = (
        db.query(
            models.StokFiyat,
            models.Stok.Malzeme_Aciklamasi,
            models.StokFiyat.Sube_ID,
            models.StokFiyat.Aktif_Pasif
        )
        .join(models.Stok, models.StokFiyat.Malzeme_Kodu == models.Stok.Malzeme_Kodu)
        .filter(models.StokFiyat.Fiyat_ID == fiyat_id).first()
    )

    if stok_fiyat_with_details:
        sf, malzeme_aciklamasi, sube_id, aktif_pasif = stok_fiyat_with_details
        sf.Gecerlilik_Baslangic_Tarih = str(sf.Gecerlilik_Baslangic_Tarih) if sf.Gecerlilik_Baslangic_Tarih is not None else None
        sf.Fiyat = float(sf.Fiyat) if sf.Fiyat is not None else None
        sf.Malzeme_Aciklamasi = malzeme_aciklamasi
        sf.Sube_ID = sube_id
        sf.Aktif_Pasif = aktif_pasif
        return sf
    return None

def get_stok_fiyatlar(db: Session, skip: int = 0):
    stok_fiyatlar_with_details = (
        db.query(
            models.StokFiyat,
            models.Stok.Malzeme_Aciklamasi
        )
        .join(models.Stok, models.StokFiyat.Malzeme_Kodu == models.Stok.Malzeme_Kodu)
        .offset(skip).all()
    )

    # Manually construct the response to include Malzeme_Aciklamasi and handle type conversions
    result = []
    for sf, malzeme_aciklamasi in stok_fiyatlar_with_details:
        sf.Gecerlilik_Baslangic_Tarih = str(sf.Gecerlilik_Baslangic_Tarih) if sf.Gecerlilik_Baslangic_Tarih is not None else None
        sf.Fiyat = float(sf.Fiyat) if sf.Fiyat is not None else None
        # Attach Malzeme_Aciklamasi directly to the StokFiyat object for easier Pydantic serialization
        sf.Malzeme_Aciklamasi = malzeme_aciklamasi
        result.append(sf)
    return result

def create_stok_fiyat(db: Session, stok_fiyat: stok_fiyat.StokFiyatCreate):
    db_stok = db.query(models.Stok).filter(models.Stok.Malzeme_Kodu == stok_fiyat.Malzeme_Kodu).first()
    if not db_stok:
        raise HTTPException(status_code=404, detail="Malzeme Kodu not found in Stok table")

    db_stok_fiyat = models.StokFiyat(**stok_fiyat.dict())
    db.add(db_stok_fiyat)
    db.commit()
    db.refresh(db_stok_fiyat)

    # Convert types for the response
    if db_stok_fiyat.Gecerlilik_Baslangic_Tarih is not None:
        db_stok_fiyat.Gecerlilik_Baslangic_Tarih = str(db_stok_fiyat.Gecerlilik_Baslangic_Tarih)
    if db_stok_fiyat.Fiyat is not None:
        db_stok_fiyat.Fiyat = float(db_stok_fiyat.Fiyat)

    return db_stok_fiyat

def update_stok_fiyat(db: Session, fiyat_id: int, stok_fiyat: stok_fiyat.StokFiyatUpdate):
    db_stok_fiyat = db.query(models.StokFiyat).filter(models.StokFiyat.Fiyat_ID == fiyat_id).first()
    if db_stok_fiyat:
        update_data = stok_fiyat.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_stok_fiyat, key, value)
        db.commit()
        db.refresh(db_stok_fiyat)
        # Ensure Gecerlilik_Baslangic_Tarih is converted to string only if it's not None
        if db_stok_fiyat.Gecerlilik_Baslangic_Tarih is not None:
            db_stok_fiyat.Gecerlilik_Baslangic_Tarih = str(db_stok_fiyat.Gecerlilik_Baslangic_Tarih)
        # Ensure Fiyat is converted to float
        if db_stok_fiyat.Fiyat is not None:
            db_stok_fiyat.Fiyat = float(db_stok_fiyat.Fiyat)
    return db_stok_fiyat

def delete_stok_fiyat(db: Session, fiyat_id: int):
    db_stok_fiyat = db.query(models.StokFiyat).filter(models.StokFiyat.Fiyat_ID == fiyat_id).first()
    if db_stok_fiyat:
        db.delete(db_stok_fiyat)
        db.commit()
    return db_stok_fiyat

# --- StokSayim CRUD ---
def get_stok_sayim(db: Session, sayim_id: int):
    stok_sayim_details = db.query(models.StokSayim).filter(models.StokSayim.Sayim_ID == sayim_id).first()
    if stok_sayim_details:
        if stok_sayim_details.Donem is not None:
            stok_sayim_details.Donem = str(stok_sayim_details.Donem)
        return stok_sayim_details
    return None

def get_stok_sayimlar(db: Session, skip: int = 0):
    stok_sayimlar = db.query(models.StokSayim).offset(skip).all()
    for ss in stok_sayimlar:
        if ss.Donem is not None:
            ss.Donem = str(ss.Donem)
    return stok_sayimlar

def create_stok_sayim(db: Session, stok_sayim: stok_sayim.StokSayimCreate):
    stok_sayim_dict = stok_sayim.dict()
    stok_sayim_dict['Donem'] = int(stok_sayim_dict['Donem'])
    db_stok_sayim = models.StokSayim(**stok_sayim_dict)
    db.add(db_stok_sayim)
    db.commit()
    db.refresh(db_stok_sayim)
    db_stok_sayim.Donem = str(db_stok_sayim.Donem) # Convert back to string for response
    return db_stok_sayim

def update_stok_sayim(db: Session, sayim_id: int, stok_sayim: stok_sayim.StokSayimUpdate):
    db_stok_sayim = db.query(models.StokSayim).filter(models.StokSayim.Sayim_ID == sayim_id).first()
    if db_stok_sayim:
        update_data = stok_sayim.dict(exclude_unset=True)
        if 'Donem' in update_data and update_data['Donem'] is not None:
            update_data['Donem'] = int(update_data['Donem'])
        for key, value in update_data.items():
            setattr(db_stok_sayim, key, value)
        db.commit()
        db.refresh(db_stok_sayim)
        db_stok_sayim.Donem = str(db_stok_sayim.Donem) # Convert back to string for response
    return db_stok_sayim

def delete_stok_sayim(db: Session, sayim_id: int):
    db_stok_sayim = db.query(models.StokSayim).filter(models.StokSayim.Sayim_ID == sayim_id).first()
    if db_stok_sayim:
        db.delete(db_stok_sayim)
        db.commit()
    return db_stok_sayim

# --- Calisan CRUD ---
def get_calisan(db: Session, tc_no: str):
    return db.query(models.Calisan).filter(models.Calisan.TC_No == tc_no).first()

def get_calisan_by_tc_no(db: Session, tc_no: str):
    return db.query(models.Calisan).filter(models.Calisan.TC_No == tc_no).first()

def get_calisanlar(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Calisan).offset(skip).limit(limit).all()

def create_calisan(db: Session, calisan: calisan.CalisanCreate):
    db_calisan = models.Calisan(
        TC_No=calisan.TC_No,
        Adi=calisan.Adi,
        Soyadi=calisan.Soyadi,
        Hesap_No=calisan.Hesap_No,
        IBAN=calisan.IBAN,
        Net_Maas=calisan.Net_Maas,
        Sigorta_Giris=calisan.Sigorta_Giris,
        Sigorta_Cikis=calisan.Sigorta_Cikis,
        Aktif_Pasif=calisan.Aktif_Pasif,
        Sube_ID=calisan.Sube_ID
    )
    db.add(db_calisan)
    db.commit()
    db.refresh(db_calisan)
    return db_calisan

def update_calisan(db: Session, tc_no: str, calisan: calisan.CalisanUpdate):
    db_calisan = db.query(models.Calisan).filter(models.Calisan.TC_No == tc_no).first()
    if db_calisan:
        for key, value in calisan.dict(exclude_unset=True).items():
            setattr(db_calisan, key, value)
        db.commit()
        db.refresh(db_calisan)
    return db_calisan

def delete_calisan(db: Session, tc_no: str):
    db_calisan = db.query(models.Calisan).filter(models.Calisan.TC_No == tc_no).first()
    if db_calisan:
        db.delete(db_calisan)
        db.commit()
    return db_calisan

# --- CalisanTalep CRUD ---
def get_calisan_talep(db: Session, talep_id: int):
    return db.query(models.CalisanTalep).filter(models.CalisanTalep.Calisan_Talep_ID == talep_id).first()

def get_calisan_talep_by_tc_no(db: Session, tc_no: str):
    return db.query(models.CalisanTalep).filter(models.CalisanTalep.TC_No == tc_no).first()

def get_calisan_talepler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CalisanTalep).offset(skip).limit(limit).all()

def create_calisan_talep(db: Session, talep: calisan_talep.CalisanTalepCreate):
    talep_data = talep.dict()
    if talep_data.get("Imaj"):
        try:
            talep_data["Imaj"] = base64.b64decode(talep_data["Imaj"])
        except Exception:
            talep_data["Imaj"] = None
    
    db_talep = models.CalisanTalep(**talep_data)
    db.add(db_talep)
    db.commit()
    db.refresh(db_talep)
    return db_talep

def update_calisan_talep(db: Session, talep_id: int, talep: calisan_talep.CalisanTalepUpdate):
    db_talep = db.query(models.CalisanTalep).filter(models.CalisanTalep.Calisan_Talep_ID == talep_id).first()
    if db_talep:
        original_ssk_onay = db_talep.SSK_Onay_Tarih

        update_data = talep.dict(exclude_unset=True)
        
        if 'Imaj' in update_data and update_data['Imaj']:
            try:
                update_data['Imaj'] = base64.b64decode(update_data['Imaj'])
            except Exception:
                update_data['Imaj'] = None
        
        for key, value in update_data.items():
            setattr(db_talep, key, value)

        if db_talep.SSK_Onay_Tarih is not None and original_ssk_onay is None:
            if db_talep.Talep == 'İşten Çıkış':
                calisan_to_update = db.query(models.Calisan).filter(models.Calisan.TC_No == db_talep.TC_No).first()
                if calisan_to_update:
                    calisan_to_update.Sigorta_Cikis = db_talep.Sigorta_Cikis
            
            elif db_talep.Talep == 'İşe Giriş':
                calisan_to_update = db.query(models.Calisan).filter(models.Calisan.TC_No == db_talep.TC_No).first()
                if calisan_to_update:
                    calisan_to_update.Hesap_No = db_talep.Hesap_No
                    calisan_to_update.IBAN = db_talep.IBAN
                    calisan_to_update.Net_Maas = db_talep.Net_Maas
                    calisan_to_update.Sigorta_Giris = db_talep.Sigorta_Giris
                    calisan_to_update.Sigorta_Cikis = db_talep.Sigorta_Cikis
                    calisan_to_update.Aktif_Pasif = True
                else:
                    new_calisan = models.Calisan(
                        TC_No=db_talep.TC_No,
                        Adi=db_talep.Adi,
                        Soyadi=db_talep.Soyadi,
                        Hesap_No=db_talep.Hesap_No,
                        IBAN=db_talep.IBAN,
                        Net_Maas=db_talep.Net_Maas,
                        Sigorta_Giris=db_talep.Sigorta_Giris,
                        Sigorta_Cikis=db_talep.Sigorta_Cikis,
                        Aktif_Pasif=True,
                        Sube_ID=db_talep.Sube_ID
                    )
                    db.add(new_calisan)
        
        db.commit()
        db.refresh(db_talep)
    return db_talep

def delete_calisan_talep(db: Session, talep_id: int):
    db_talep = db.query(models.CalisanTalep).filter(models.CalisanTalep.Calisan_Talep_ID == talep_id).first()
    if db_talep:
        db.delete(db_talep)
        db.commit()
        return True
    return False

# --- Cari CRUD ---
def get_cari(db: Session, cari_id: int):
    return db.query(models.Cari).filter(models.Cari.Cari_ID == cari_id).first()

def get_cariler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Cari).offset(skip).limit(limit).all()

def create_cari(db: Session, cari_data: cari.CariCreate):
    db_cari = models.Cari(**cari_data.dict())
    db.add(db_cari)
    db.commit()
    db.refresh(db_cari)
    return db_cari

def update_cari(db: Session, cari_id: int, cari_data: cari.CariUpdate):
    db_cari = db.query(models.Cari).filter(models.Cari.Cari_ID == cari_id).first()
    if db_cari:
        for key, value in cari_data.dict(exclude_unset=True).items():
            setattr(db_cari, key, value)
        db.commit()
        db.refresh(db_cari)
    return db_cari

def delete_cari(db: Session, cari_id: int):
    db_cari = db.query(models.Cari).filter(models.Cari.Cari_ID == cari_id).first()
    if db_cari:
        db.delete(db_cari)
        db.commit()
    return db_cari

# --- PuantajSecimi CRUD ---
def get_puantaj_secimi(db: Session, secim_id: int):
    return db.query(models.PuantajSecimi).filter(models.PuantajSecimi.Secim_ID == secim_id).first()

def get_puantaj_secimleri(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PuantajSecimi).offset(skip).limit(limit).all()

def create_puantaj_secimi(db: Session, puantaj_secimi: puantaj_secimi.PuantajSecimiCreate):
    db_puantaj_secimi = models.PuantajSecimi(**puantaj_secimi.dict())
    db.add(db_puantaj_secimi)
    db.commit()
    db.refresh(db_puantaj_secimi)
    return db_puantaj_secimi

def update_puantaj_secimi(db: Session, secim_id: int, puantaj_secimi: puantaj_secimi.PuantajSecimiUpdate):
    db_puantaj_secimi = db.query(models.PuantajSecimi).filter(models.PuantajSecimi.Secim_ID == secim_id).first()
    if db_puantaj_secimi:
        for key, value in puantaj_secimi.dict(exclude_unset=True).items():
            setattr(db_puantaj_secimi, key, value)
        db.commit()
        db.refresh(db_puantaj_secimi)
    return db_puantaj_secimi

def delete_puantaj_secimi(db: Session, secim_id: int):
    db_puantaj_secimi = db.query(models.PuantajSecimi).filter(models.PuantajSecimi.Secim_ID == secim_id).first()
    if db_puantaj_secimi:
        db.delete(db_puantaj_secimi)
        db.commit()
    return db_puantaj_secimi

# --- Puantaj CRUD ---
def get_puantaj(db: Session, puantaj_id: int):
    return db.query(models.Puantaj).filter(models.Puantaj.Puantaj_ID == puantaj_id).first()

def get_puantajlar(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Puantaj).offset(skip).limit(limit).all()

def create_puantaj(db: Session, puantaj: puantaj.PuantajCreate):
    db_puantaj = models.Puantaj(**puantaj.dict())
    db.add(db_puantaj)
    db.commit()
    db.refresh(db_puantaj)
    return db_puantaj

def update_puantaj(db: Session, puantaj_id: int, puantaj: puantaj.PuantajUpdate):
    db_puantaj = db.query(models.Puantaj).filter(models.Puantaj.Puantaj_ID == puantaj_id).first()
    if db_puantaj:
        for key, value in puantaj.dict(exclude_unset=True).items():
            setattr(db_puantaj, key, value)
        db.commit()
        db.refresh(db_puantaj)
    return db_puantaj

def delete_puantaj(db: Session, puantaj_id: int):
    db_puantaj = db.query(models.Puantaj).filter(models.Puantaj.Puantaj_ID == puantaj_id).first()
    if db_puantaj:
        db.delete(db_puantaj)
        db.commit()
    return db_puantaj

# --- AvansIstek CRUD ---
def get_avans_istek(db: Session, avans_id: int):
    return db.query(models.AvansIstek).filter(models.AvansIstek.Avans_ID == avans_id).first()

def get_avans_istekler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AvansIstek).offset(skip).limit(limit).all()

def create_avans_istek(db: Session, avans_istek: avans_istek.AvansIstekCreate):
    db_avans_istek = models.AvansIstek(**avans_istek.dict())
    db.add(db_avans_istek)
    db.commit()
    db.refresh(db_avans_istek)
    return db_avans_istek

def update_avans_istek(db: Session, avans_id: int, avans_istek: avans_istek.AvansIstekUpdate):
    db_avans_istek = db.query(models.AvansIstek).filter(models.AvansIstek.Avans_ID == avans_id).first()
    if db_avans_istek:
        for key, value in avans_istek.dict(exclude_unset=True).items():
            setattr(db_avans_istek, key, value)
        db.commit()
        db.refresh(db_avans_istek)
    return db_avans_istek

def delete_avans_istek(db: Session, avans_id: int):
    db_avans_istek = db.query(models.AvansIstek).filter(models.AvansIstek.Avans_ID == avans_id).first()
    if db_avans_istek:
        db.delete(db_avans_istek)
        db.commit()
    return db_avans_istek

# --- UstKategori CRUD ---
def get_ust_kategori(db: Session, ust_kategori_id: int):
    return db.query(models.UstKategori).filter(models.UstKategori.UstKategori_ID == ust_kategori_id).first()

def get_ust_kategoriler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.UstKategori).offset(skip).limit(limit).all()

def create_ust_kategori(db: Session, ust_kategori: ust_kategori.UstKategoriCreate):
    db_ust_kategori = models.UstKategori(**ust_kategori.dict())
    db.add(db_ust_kategori)
    db.commit()
    db.refresh(db_ust_kategori)
    return db_ust_kategori

def update_ust_kategori(db: Session, ust_kategori_id: int, ust_kategori: ust_kategori.UstKategoriUpdate):
    db_ust_kategori = db.query(models.UstKategori).filter(models.UstKategori.UstKategori_ID == ust_kategori_id).first()
    if db_ust_kategori:
        for key, value in ust_kategori.dict(exclude_unset=True).items():
            setattr(db_ust_kategori, key, value)
        db.commit()
        db.refresh(db_ust_kategori)
    return db_ust_kategori

def delete_ust_kategori(db: Session, ust_kategori_id: int):
    db_ust_kategori = db.query(models.UstKategori).filter(models.UstKategori.UstKategori_ID == ust_kategori_id).first()
    if db_ust_kategori:
        db.delete(db_ust_kategori)
        db.commit()
    return db_ust_kategori

# --- Kategori CRUD ---
def get_kategori(db: Session, kategori_id: int):
    return db.query(models.Kategori).filter(models.Kategori.Kategori_ID == kategori_id).first()

def get_kategoriler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Kategori).offset(skip).limit(limit).all()

def create_kategori(db: Session, kategori: kategori.KategoriCreate):
    db_kategori = models.Kategori(**kategori.dict())
    db.add(db_kategori)
    db.commit()
    db.refresh(db_kategori)
    return db_kategori

def update_kategori(db: Session, kategori_id: int, kategori: kategori.KategoriUpdate):
    db_kategori = db.query(models.Kategori).filter(models.Kategori.Kategori_ID == kategori_id).first()
    if db_kategori:
        for key, value in kategori.dict(exclude_unset=True).items():
            setattr(db_kategori, key, value)
        db.commit()
        db.refresh(db_kategori)
    return db_kategori

def delete_kategori(db: Session, kategori_id: int):
    db_kategori = db.query(models.Kategori).filter(models.Kategori.Kategori_ID == kategori_id).first()
    if db_kategori:
        db.delete(db_kategori)
        db.commit()
    return db_kategori

# --- Deger CRUD ---
def get_deger(db: Session, deger_id: int):
    return db.query(models.Deger).filter(models.Deger.Deger_ID == deger_id).first()

def get_degerler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Deger).offset(skip).limit(limit).all()

def create_deger(db: Session, deger: deger.DegerCreate):
    db_deger = models.Deger(**deger.dict())
    db.add(db_deger)
    db.commit()
    db.refresh(db_deger)
    return db_deger

def update_deger(db: Session, deger_id: int, deger: deger.DegerUpdate):
    db_deger = db.query(models.Deger).filter(models.Deger.Deger_ID == deger_id).first()
    if db_deger:
        for key, value in deger.dict(exclude_unset=True).items():
            setattr(db_deger, key, value)
        db.commit()
        db.refresh(db_deger)
    return db_deger

def delete_deger(db: Session, deger_id: int):
    db_deger = db.query(models.Deger).filter(models.Deger.Deger_ID == deger_id).first()
    if db_deger:
        db.delete(db_deger)
        db.commit()
    return db_deger

# --- EFaturaReferans CRUD ---
def get_efatura_referans(db: Session, alici_unvani: str):
    return db.query(models.EFaturaReferans).filter(models.EFaturaReferans.Alici_Unvani == alici_unvani).first()

def get_efatura_referanslar(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.EFaturaReferans).offset(skip).limit(limit).all()
    except Exception as e:
        print(f"Error fetching e-fatura referanslar: {e}")
        raise

def create_efatura_referans(db: Session, efatura_referans: e_fatura_referans.EFaturaReferansCreate):
    db_efatura_referans = models.EFaturaReferans(**efatura_referans.dict())
    db.add(db_efatura_referans)
    db.commit()
    db.refresh(db_efatura_referans)
    return db_efatura_referans

def update_efatura_referans(db: Session, alici_unvani: str, efatura_referans: e_fatura_referans.EFaturaReferansUpdate):
    db_efatura_referans = db.query(models.EFaturaReferans).filter(models.EFaturaReferans.Alici_Unvani == alici_unvani).first()
    if db_efatura_referans:
        for key, value in efatura_referans.dict(exclude_unset=True).items():
            setattr(db_efatura_referans, key, value)
        db.commit()
        db.refresh(db_efatura_referans)
    return db_efatura_referans

def delete_efatura_referans(db: Session, alici_unvani: str):
    db_efatura_referans = db.query(models.EFaturaReferans).filter(models.EFaturaReferans.Alici_Unvani == alici_unvani).first()
    if db_efatura_referans:
        db.delete(db_efatura_referans)
        db.commit()
    return db_efatura_referans

# --- Nakit CRUD ---
def get_nakit(db: Session, nakit_id: int):
    return db.query(models.Nakit).filter(models.Nakit.Nakit_ID == nakit_id).first()

from typing import List, Optional

def get_nakit_entries(db: Session, skip: int = 0, limit: int = 10000, sube_id: Optional[int] = None):
    query = db.query(models.Nakit)
    if sube_id:
        query = query.filter(models.Nakit.Sube_ID == sube_id)
    return query.offset(skip).limit(limit).all()

def create_nakit(db: Session, nakit: nakit.NakitCreate):
    db_nakit = models.Nakit(**nakit.dict())
    db.add(db_nakit)
    db.commit()
    db.refresh(db_nakit)
    return db_nakit

def update_nakit(db: Session, nakit_id: int, nakit: nakit.NakitUpdate):
    db_nakit = db.query(models.Nakit).filter(models.Nakit.Nakit_ID == nakit_id).first()
    if db_nakit:
        update_data = nakit.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_nakit, key, value)
        db.commit()
        db.refresh(db_nakit)
    return db_nakit

def delete_nakit(db: Session, nakit_id: int):
    db_nakit = db.query(models.Nakit).filter(models.Nakit.Nakit_ID == nakit_id).first()
    if db_nakit:
        db.delete(db_nakit)
        db.commit()
    return db_nakit

# --- YemekCeki CRUD ---
def get_yemek_ceki(db: Session, yemek_ceki_id: int):
    yemek_ceki = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    if yemek_ceki and yemek_ceki.Imaj is not None:
        yemek_ceki.Imaj = base64.b64encode(yemek_ceki.Imaj).decode('utf-8')
    return yemek_ceki

def get_yemek_cekiler(db: Session, skip: int = 0, limit: int = 100):
    results = db.query(
        models.YemekCeki.ID,
        models.YemekCeki.Kategori_ID,
        models.YemekCeki.Tarih,
        models.YemekCeki.Tutar,
        models.YemekCeki.Odeme_Tarih,
        models.YemekCeki.Ilk_Tarih,
        models.YemekCeki.Son_Tarih,
        models.YemekCeki.Sube_ID,
        models.YemekCeki.Imaj_Adi,
        (models.YemekCeki.Imaj != None).label('has_imaj')
    ).offset(skip).limit(limit).all()
    return results

async def create_yemek_ceki(db: Session, yemek_ceki_data: yemek_ceki.YemekCekiCreate):
    yemek_ceki_dict = yemek_ceki_data.dict(exclude_unset=True)
    
    db_yemek_ceki = models.YemekCeki(**yemek_ceki_dict)
    db.add(db_yemek_ceki)
    db.commit()
    db.refresh(db_yemek_ceki)
    
    if db_yemek_ceki.Imaj is not None:
        db_yemek_ceki.Imaj = base64.b64encode(db_yemek_ceki.Imaj).decode('utf-8')
        
    return db_yemek_ceki

async def update_yemek_ceki(db: Session, yemek_ceki_id: int, yemek_ceki_data: yemek_ceki.YemekCekiUpdate):
    db_yemek_ceki = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    if db_yemek_ceki:
        update_data = yemek_ceki_data.dict(exclude_unset=True)
        
        if 'Imaj' in update_data and isinstance(update_data['Imaj'], bytes):
            db_yemek_ceki.Imaj = update_data['Imaj']
            del update_data['Imaj']
        
        # If Imaj_Adi is an empty string, it means clear the image
        if 'Imaj_Adi' in update_data and update_data['Imaj_Adi'] == "":
            db_yemek_ceki.Imaj = None
            db_yemek_ceki.Imaj_Adi = None

        for key, value in update_data.items():
            setattr(db_yemek_ceki, key, value)
            
        db.commit()
        db.refresh(db_yemek_ceki)
        
        if db_yemek_ceki.Imaj is not None:
            db_yemek_ceki.Imaj = base64.b64encode(db_yemek_ceki.Imaj).decode('utf-8')
            
    return db_yemek_ceki

def delete_yemek_ceki(db: Session, yemek_ceki_id: int):
    db_yemek_ceki = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    if db_yemek_ceki:
        db.delete(db_yemek_ceki)
        db.commit()
    return db_yemek_ceki

# --- Odeme CRUD ---
def get_odeme(db: Session, odeme_id: int):
    return db.query(models.Odeme).filter(models.Odeme.Odeme_ID == odeme_id).first()

def get_odemeler(db: Session, skip: int = 0, limit: int | None = None):
    return db.query(models.Odeme).all()

def create_odeme(db: Session, odeme: odeme.OdemeCreate):
    db_odeme = models.Odeme(**odeme.dict())
    db.add(db_odeme)
    db.commit()
    db.refresh(db_odeme)
    return db_odeme

def get_odeme_by_unique_fields(db: Session, odeme_data: odeme.OdemeCreate):
    return db.query(models.Odeme).filter(
        models.Odeme.Tarih == odeme_data.Tarih,
        models.Odeme.Hesap_Adi == odeme_data.Hesap_Adi,
        models.Odeme.Aciklama == odeme_data.Aciklama,
        models.Odeme.Tutar == odeme_data.Tutar,
        models.Odeme.Sube_ID == odeme_data.Sube_ID
    ).first()

def create_odemeler_bulk(db: Session, odemeler: List[odeme.OdemeCreate]):
    added_count = 0
    skipped_count = 0
    logger.info(f"Starting bulk create of Odeme for {len(odemeler)} records.")
    
    for odeme_data in odemeler:
        existing_odeme = get_odeme_by_unique_fields(db, odeme_data)
        if existing_odeme:
            logger.info(f"Skipping existing record: {odeme_data.Aciklama[:30]}")
            skipped_count += 1
            continue
        
        db_odeme = models.Odeme(**odeme_data.dict())
        db.add(db_odeme)
        added_count += 1
    
    try:
        db.commit()
        logger.info(f"Successfully committed {added_count} new Odeme records.")
    except Exception as e:
        logger.error(f"Error committing Odeme records: {e}")
        db.rollback()
        raise
        
    return {"added": added_count, "skipped": skipped_count}

def update_odeme(db: Session, odeme_id: int, odeme: odeme.OdemeUpdate):
    db_odeme = db.query(models.Odeme).filter(models.Odeme.Odeme_ID == odeme_id).first()
    if db_odeme:
        for key, value in odeme.dict(exclude_unset=True).items():
            setattr(db_odeme, key, value)
        db.commit()
        db.refresh(db_odeme)
    return db_odeme

def get_odeme_rapor(db: Session, donem_list: List[int], kategori_list: List[int], sube_id: Optional[int] = None):
    """
    Get Odeme records for specific donem, kategori, and optionally sube_id
    """
    import logging
    from schemas.report import OdemeRaporResponse, OdemeRaporTotals, OdemeRaporRequest
    from decimal import Decimal
    
    logger = logging.getLogger(__name__)
    
    logger.info(f"Fetching Odeme records for Donem: {donem_list}, Kategori: {kategori_list}, Sube_ID: {sube_id}")
    
    try:
        # Query with debug info
        query = db.query(models.Odeme).filter(
            models.Odeme.Donem.in_(donem_list),
            models.Odeme.Kategori_ID.in_(kategori_list)
        )
        if sube_id:
            query = query.filter(models.Odeme.Sube_ID == sube_id)
        
        logger.info(f"Query SQL: {str(query)}")
        records = query.all()
        logger.info(f"Found {len(records)} Odeme records")
        
        result = []
        donem_totals = {}
        kategori_totals = {}
        grand_total = Decimal('0')
        
        for record in records:
            try:
                result.append({
                    "Tarih": record.Tarih.strftime('%Y-%m-%d'),
                    "Donem": record.Donem,
                    "Kategori_ID": record.Kategori_ID,
                    "Tutar": float(record.Tutar)
                })
                
                # Update totals
                donem_totals[record.Donem] = donem_totals.get(record.Donem, Decimal('0')) + record.Tutar
                kategori_totals[record.Kategori_ID] = kategori_totals.get(record.Kategori_ID, Decimal('0')) + record.Tutar
                grand_total += record.Tutar
                
            except Exception as e:
                logger.error(f"Error processing record {record.Odeme_ID}: {e}")
                continue
        
        logger.info(f"Successfully processed {len(result)} Odeme records")
        return OdemeRaporResponse(
            data=result,
            totals=OdemeRaporTotals(
                donem_totals=donem_totals,
                kategori_totals=kategori_totals,
                grand_total=grand_total
            ),
            filters_applied=OdemeRaporRequest(
                donem=donem_list,
                kategori=kategori_list,
                sube_id=sube_id
            ),
            total_records=len(records)
        )
        
    except Exception as e:
        logger.error(f"Error in get_odeme_rapor: {e}")
        # Return empty response on error
        empty_response = OdemeRaporResponse(
            data=[],
            totals=OdemeRaporTotals(
                donem_totals={},
                kategori_totals={},
                grand_total=Decimal('0')
            ),
            filters_applied=OdemeRaporRequest(
                donem=donem_list,
                kategori=kategori_list,
                sube_id=sube_id
            ),
            total_records=0
        )
        return empty_response

# --- POS Kontrol Dashboard CRUD Functions ---
def get_pos_kontrol_dashboard_data(db: Session, sube_id: int, donem: int, skip: int = 0, limit: int = 100):
    """
    Get POS Kontrol Dashboard data for a specific branch and period with pagination.
    """
    import logging
    from collections import defaultdict
    from decimal import Decimal
    from datetime import datetime, timedelta
    from sqlalchemy import func, and_, or_
    from schemas.pos_kontrol_dashboard import POSKontrolDailyData, POSKontrolSummary, POSKontrolDashboardResponse

    logger = logging.getLogger(__name__)

    # Convert donem to date range
    # donem is in YYMM format (e.g., 2508 for August 2025)
    if len(str(donem)) == 4:
        year = 2000 + int(str(donem)[:2])
        month = int(str(donem)[2:])
    else:
        raise ValueError("Invalid donem format. Expected YYMM format.")

    # Calculate first and last day of the month
    first_day = datetime(year, month, 1)
    if month == 12:
        last_day = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = datetime(year, month + 1, 1) - timedelta(days=1)

    logger.info(f"Fetching POS Kontrol Dashboard data for Sube_ID: {sube_id}, Donem: {donem} ({first_day.date()} to {last_day.date()})")

    # Get POS category ID (where Kategori_Adi = "POS")
    pos_kategori = db.query(models.Kategori).filter(
        models.Kategori.Kategori_Adi == "POS"
    ).first()

    pos_kategori_id = pos_kategori.Kategori_ID if pos_kategori else None
    if not pos_kategori:
        logger.warning("POS category not found in database. Gelir POS data will be empty.")
    else:
        logger.info(f"Found POS category with ID: {pos_kategori_id}")

    # Get Gelir data for POS category
    gelir_dict = {}
    if pos_kategori_id:
        gelir_records = db.query(
            models.Gelir.Tarih,
            func.sum(models.Gelir.Tutar).label('total_tutar')
        ).filter(
            and_(
                models.Gelir.Sube_ID == sube_id,
                models.Gelir.Kategori_ID == pos_kategori_id,
                models.Gelir.Tarih >= first_day.date(),
                models.Gelir.Tarih <= last_day.date()
            )
        ).group_by(models.Gelir.Tarih).all()
        logger.info(f"Found {len(gelir_records)} Gelir POS records")
        gelir_dict = {record.Tarih: record.total_tutar for record in gelir_records}
    else:
        logger.info("Skipping Gelir POS query as POS category ID is missing")

    # Find the "Kredi Kartı Ödemesi" category
    kredi_karti_kategori = db.query(models.Kategori).filter(
        models.Kategori.Kategori_Adi == "Kredi Kartı Ödemesi"
    ).first()

    # Get all POS_Hareketleri records for the period
    pos_hareketleri_records = db.query(models.POSHareketleri).filter(
        and_(
            models.POSHareketleri.Sube_ID == sube_id,
            models.POSHareketleri.Islem_Tarihi >= first_day.date(),
            models.POSHareketleri.Islem_Tarihi <= last_day.date()
        )
    ).all()
    logger.info(f"Found {len(pos_hareketleri_records)} POS_Hareketleri records")

    # Get all Odeme records for the period with Kredi Kartı Ödemesi category
    odeme_query = db.query(models.Odeme).filter(
        and_(
            models.Odeme.Sube_ID == sube_id,
            models.Odeme.Tarih >= first_day.date(),
            models.Odeme.Tarih <= last_day.date()
        )
    )

    # Filter by Kredi Kartı Ödemesi category if found
    if kredi_karti_kategori:
        odeme_query = odeme_query.filter(models.Odeme.Kategori_ID == kredi_karti_kategori.Kategori_ID)

    odeme_records = odeme_query.all()
    logger.info(f"Found {len(odeme_records)} Odeme records with Kredi Kartı Ödemesi category")

    # Get all Odeme records for Kesinti calculation (Kategori_ID = 81 and Tutar < 0)
    kesinti_odeme_records = db.query(models.Odeme).filter(
        and_(
            models.Odeme.Sube_ID == sube_id,
            models.Odeme.Kategori_ID == 81,
            models.Odeme.Tutar < 0,
            models.Odeme.Tarih >= first_day.date(),
            models.Odeme.Tarih <= last_day.date() + timedelta(days=1) # Fetch one extra day for the calculation
        )
    ).all()
    logger.info(f"Found {len(kesinti_odeme_records)} Odeme records for Kesinti calculation (Kategori_ID=81 and Tutar < 0)")

    # Group kesinti odeme records by date for easy lookup
    kesinti_odeme_by_date = defaultdict(Decimal)
    for record in kesinti_odeme_records:
        kesinti_odeme_by_date[record.Tarih] += record.Tutar # Sum of negative numbers

    # Create a lookup dictionary for Odeme records by (Tarih, Tutar) for matching
    odeme_lookup = {(record.Tarih, record.Tutar): record for record in odeme_records}

    # Group POS_Hareketleri by Islem_Tarihi and calculate sums
    pos_hareketleri_by_date = defaultdict(lambda: {
        'total_islem_tutari': Decimal('0'),
        'total_kesinti_tutari': Decimal('0'),
        'total_net_tutar': Decimal('0'),
        'matched_odeme_total': Decimal('0')  # For the correct Ödeme calculation
    })

    # Process each POS_Hareketleri record
    for record in pos_hareketleri_records:
        islem_tutari = record.Islem_Tutari or Decimal('0')
        kesinti_tutari = record.Kesinti_Tutari or Decimal('0')
        net_tutar = record.Net_Tutar or Decimal('0')

        # Add to date group totals
        pos_hareketleri_by_date[record.Islem_Tarihi]['total_islem_tutari'] += islem_tutari
        pos_hareketleri_by_date[record.Islem_Tarihi]['total_kesinti_tutari'] += kesinti_tutari
        pos_hareketleri_by_date[record.Islem_Tarihi]['total_net_tutar'] += net_tutar

        # Check if there's a matching Odeme record
        # Match criteria: Hesaba_Gecis = Odeme.Tarih AND Islem_Tutari = Odeme.Tutar
        if (record.Hesaba_Gecis, record.Islem_Tutari) in odeme_lookup:
            pos_hareketleri_by_date[record.Islem_Tarihi]['matched_odeme_total'] += record.Islem_Tutari

    pos_hareketleri_dict = {
        date: data for date, data in pos_hareketleri_by_date.items()
    }
    # For the Ödeme field, we now use the matched_odeme_total instead of a simple sum of all Odeme records
    odeme_dict = {date: data['matched_odeme_total'] for date, data in pos_hareketleri_by_date.items()}

    # Generate list of all dates in the period
    all_dates = []
    current_date = first_day.date()
    while current_date <= last_day.date():
        all_dates.append(current_date)
        current_date += timedelta(days=1)

    # Build daily data
    daily_data = []
    successful_matches = 0
    error_matches = 0

    for date in all_dates:
        # Get values for the date
        gelir_pos = gelir_dict.get(date)
        pos_hareketleri_data = pos_hareketleri_dict.get(date)
        odeme = odeme_dict.get(date)

        pos_hareketleri = pos_hareketleri_data['total_islem_tutari'] if pos_hareketleri_data else None
        pos_kesinti = pos_hareketleri_data['total_kesinti_tutari'] if pos_hareketleri_data else None
        pos_net = pos_hareketleri_data['total_net_tutar'] if pos_hareketleri_data else None
        odeme = odeme_dict.get(date)  # This is now the matched total, not a simple lookup

        # Compare values with tolerance (0.01) for Kontrol POS
        kontrol_pos = None
        if gelir_pos is not None and pos_hareketleri is not None:
            if abs(gelir_pos - pos_hareketleri) <= Decimal('0.01'):
                kontrol_pos = "OK"
                successful_matches += 1
            else:
                kontrol_pos = "Not OK"
                error_matches += 1
        elif gelir_pos is None and pos_hareketleri is None:
            kontrol_pos = "OK"  # Both are None, considered matching
            successful_matches += 1
        elif gelir_pos is not None or pos_hareketleri is not None:
            kontrol_pos = "Not OK"  # One is None, the other is not
            error_matches += 1

        # New calculation for Odeme_Kesinti
        next_day = date + timedelta(days=1)
        odeme_kesinti_for_date = abs(kesinti_odeme_by_date.get(next_day, Decimal('0')))

        # For Kontrol Kesinti: Compare POS Kesinti with the new Odeme_Kesinti calculation
        kontrol_kesinti = None
        if pos_kesinti is not None and odeme_kesinti_for_date is not None:
            if abs(pos_kesinti - odeme_kesinti_for_date) <= Decimal('0.01'):
                kontrol_kesinti = "OK"
            else:
                kontrol_kesinti = "Not OK"
        elif pos_kesinti is None and odeme_kesinti_for_date == Decimal('0'): # If pos_kesinti is None, check if odeme_kesinti is also zero
            kontrol_kesinti = "OK"
        elif pos_kesinti is not None or odeme_kesinti_for_date != Decimal('0'):
            kontrol_kesinti = "Not OK"

        # Set Odeme_Kesinti and Odeme_Net to actual Odeme values for proper comparison
        actual_odeme_for_date = None
        odeme_records_for_date = [r for r in odeme_records if r.Tarih == date]
        if odeme_records_for_date:
            actual_odeme_for_date = sum(r.Tutar for r in odeme_records_for_date) or Decimal('0')

        # New calculation for Odeme_Net
        odeme_net_for_date = (odeme or Decimal('0')) - odeme_kesinti_for_date

        daily_record = POSKontrolDailyData(
            Tarih=date.strftime('%Y-%m-%d'),
            Gelir_POS=float(gelir_pos) if gelir_pos is not None else None,
            POS_Hareketleri=float(pos_hareketleri) if pos_hareketleri is not None else None,
            POS_Kesinti=float(pos_kesinti) if pos_kesinti is not None else None,
            POS_Net=float(pos_net) if pos_net is not None else None,
            Odeme=float(odeme) if odeme is not None else None,
            Odeme_Kesinti=float(odeme_kesinti_for_date) if odeme_kesinti_for_date is not None else None,
            Odeme_Net=float(odeme_net_for_date) if odeme_net_for_date is not None else None,
            Kontrol_POS=kontrol_pos,
            Kontrol_Kesinti=kontrol_kesinti
        )

        daily_data.append(daily_record)

    # Calculate success rate
    total_records = len(all_dates) # Use total number of dates for summary
    if total_records > 0:
        success_rate = f"{(successful_matches / total_records) * 100:.0f}%"
    else:
        success_rate = "0%"

    # Apply skip and limit for pagination
    paginated_daily_data = daily_data[skip : skip + limit]

    # Create summary
    summary = POSKontrolSummary(
        total_records=total_records,
        successful_matches=successful_matches,
        error_matches=error_matches,
        success_rate=success_rate
    )

    # Create response
    response = POSKontrolDashboardResponse(
        data=paginated_daily_data,
        summary=summary
    )

    logger.info(f"Successfully generated POS Kontrol Dashboard data with {len(paginated_daily_data)} paginated records (total: {total_records}), {successful_matches} successful matches, {error_matches} error matches, success rate: {success_rate}")
    return response

# --- POS Hareketleri CRUD ---
def get_pos_hareket(db: Session, pos_id: int):
    return db.query(models.POSHareketleri).filter(models.POSHareketleri.ID == pos_id).first()

def get_pos_hareketleri(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.POSHareketleri).offset(skip).limit(limit).all()

def is_duplicate_pos_hareket(db: Session, pos_hareket: pos_hareketleri.POSHareketleriCreate):
    """
    Check if a POS_Hareketleri record is a duplicate based on:
    - Islem_Tarihi
    - Hesaba_Gecis
    - Para_Birimi
    - Islem_Tutari
    - Sube_ID
    """
    existing = db.query(models.POSHareketleri).filter(
        models.POSHareketleri.Islem_Tarihi == pos_hareket.Islem_Tarihi,
        models.POSHareketleri.Hesaba_Gecis == pos_hareket.Hesaba_Gecis,
        models.POSHareketleri.Para_Birimi == pos_hareket.Para_Birimi,
        models.POSHareketleri.Islem_Tutari == pos_hareket.Islem_Tutari,
        models.POSHareketleri.Sube_ID == pos_hareket.Sube_ID
    ).first()
    return existing is not None

def create_pos_hareket(db: Session, pos_hareket: pos_hareketleri.POSHareketleriCreate):
    # Check for duplicates
    if is_duplicate_pos_hareket(db, pos_hareket):
        return None  # Return None to indicate duplicate
    
    # Calculate Net_Tutar if not provided
    net_tutar = pos_hareket.Net_Tutar
    if net_tutar is None:
        net_tutar = pos_hareket.Islem_Tutari - pos_hareket.Kesinti_Tutari
    
    # Validate that Islem_Tutari >= Kesinti_Tutari
    if pos_hareket.Islem_Tutari < pos_hareket.Kesinti_Tutari:
        raise ValueError("Islem_Tutari must be greater than or equal to Kesinti_Tutari")
    
    db_pos_hareket = models.POSHareketleri(
        Islem_Tarihi=pos_hareket.Islem_Tarihi,
        Hesaba_Gecis=pos_hareket.Hesaba_Gecis,
        Para_Birimi=pos_hareket.Para_Birimi,
        Islem_Tutari=pos_hareket.Islem_Tutari,
        Kesinti_Tutari=pos_hareket.Kesinti_Tutari,
        Net_Tutar=net_tutar,
        Sube_ID=pos_hareket.Sube_ID
    )
    db.add(db_pos_hareket)
    db.commit()
    db.refresh(db_pos_hareket)
    return db_pos_hareket

def update_pos_hareket(db: Session, pos_id: int, pos_hareket: pos_hareketleri.POSHareketleriUpdate):
    db_pos = db.query(models.POSHareketleri).filter(models.POSHareketleri.ID == pos_id).first()
    if db_pos:
        update_data = pos_hareket.dict(exclude_unset=True)
        
        # Calculate Net_Tutar if not provided but Islem_Tutari and Kesinti_Tutari are provided
        if "Net_Tutar" not in update_data:
            islem_tutari = update_data.get("Islem_Tutari", db_pos.Islem_Tutari)
            kesinti_tutari = update_data.get("Kesinti_Tutari", db_pos.Kesinti_Tutari)
            if "Islem_Tutari" in update_data or "Kesinti_Tutari" in update_data:
                update_data["Net_Tutar"] = islem_tutari - kesinti_tutari
        
        # Validate that Islem_Tutari >= Kesinti_Tutari if both are provided
        islem_tutari = update_data.get("Islem_Tutari", db_pos.Islem_Tutari)
        kesinti_tutari = update_data.get("Kesinti_Tutari", db_pos.Kesinti_Tutari)
        if islem_tutari < kesinti_tutari:
            raise ValueError("Islem_Tutari must be greater than or equal to Kesinti_Tutari")
        
        for key, value in update_data.items():
            setattr(db_pos, key, value)
        db.commit()
        db.refresh(db_pos)
    return db_pos

def delete_pos_hareket(db: Session, pos_id: int):
    db_pos = db.query(models.POSHareketleri).filter(models.POSHareketleri.ID == pos_id).first()
    if db_pos:
        db.delete(db_pos)
        db.commit()
    return db_pos

def create_pos_hareketleri_bulk(db: Session, pos_hareketleri_list: List[pos_hareketleri.POSHareketleriCreate]):
    added_count = 0
    skipped_count = 0
    
    for pos_hareket in pos_hareketleri_list:
        try:
            # Check for duplicates
            if is_duplicate_pos_hareket(db, pos_hareket):
                skipped_count += 1
                continue
            
            # Calculate Net_Tutar if not provided
            net_tutar = pos_hareket.Net_Tutar
            if net_tutar is None:
                net_tutar = pos_hareket.Islem_Tutari - pos_hareket.Kesinti_Tutari
            
            # Validate that Islem_Tutari >= Kesinti_Tutari
            if pos_hareket.Islem_Tutari < pos_hareket.Kesinti_Tutari:
                skipped_count += 1
                continue
            
            db_pos_hareket = models.POSHareketleri(
                Islem_Tarihi=pos_hareket.Islem_Tarihi,
                Hesaba_Gecis=pos_hareket.Hesaba_Gecis,
                Para_Birimi=pos_hareket.Para_Birimi,
                Islem_Tutari=pos_hareket.Islem_Tutari,
                Kesinti_Tutari=pos_hareket.Kesinti_Tutari,
                Net_Tutar=net_tutar,
                Sube_ID=pos_hareket.Sube_ID
            )
            db.add(db_pos_hareket)
            added_count += 1
        except Exception as e:
            skipped_count += 1
            continue
    
    db.commit()
    return {"added": added_count, "skipped": skipped_count}

# --- OdemeReferans CRUD ---
def get_odeme_referans(db: Session, referans_id: int):
    return db.query(models.OdemeReferans).filter(models.OdemeReferans.Referans_ID == referans_id).first()

def get_odeme_referanslar(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.OdemeReferans).offset(skip).limit(limit).all()

def create_odeme_referans(db: Session, odeme_referans: odeme_referans.OdemeReferansCreate):
    db_odeme_referans = models.OdemeReferans(**odeme_referans.dict())
    db.add(db_odeme_referans)
    db.commit()
    db.refresh(db_odeme_referans)
    return db_odeme_referans

def update_odeme_referans(db: Session, referans_id: int, odeme_referans: odeme_referans.OdemeReferansUpdate):
    db_odeme_referans = db.query(models.OdemeReferans).filter(models.OdemeReferans.Referans_ID == referans_id).first()
    if db_odeme_referans:
        for key, value in odeme_referans.dict(exclude_unset=True).items():
            setattr(db_odeme_referans, key, value)
        db.commit()
        db.refresh(db_odeme_referans)
    return db_odeme_referans

def delete_odeme_referans(db: Session, referans_id: int):
    db_odeme_referans = db.query(models.OdemeReferans).filter(models.OdemeReferans.Referans_ID == referans_id).first()
    if db_odeme_referans:
        db.delete(db_odeme_referans)
        db.commit()
    return db_odeme_referans

# --- Report CRUD Functions ---
def get_bankaya_yatan_by_sube_and_donem(db: Session, sube_id: int, donem: int):
    """
    Get Odeme records where Kategori_ID == 60 (Bankaya Yatan) for specific sube and donem
    """
    import logging
    from schemas.report import ReportDataItem
    
    logger = logging.getLogger(__name__)
    
    # Keep donem as is since database now stores periods in 4-digit format
    # No conversion needed - if input is 6-digit, convert to 4-digit
    if len(str(donem)) == 6:
        donem = donem - 2000  # Convert 202508 to 2508
    
    logger.info(f"Fetching Bankaya Yatan records for Sube_ID: {sube_id}, Donem: {donem}")
    
    try:
        # Query with debug info
        query = db.query(models.Odeme).filter(
            models.Odeme.Sube_ID == sube_id,
            models.Odeme.Donem == donem,
            models.Odeme.Kategori_ID == 60
        )
        
        logger.info(f"Query SQL: {str(query)}")
        records = query.all()
        logger.info(f"Found {len(records)} Bankaya Yatan records")
        
        # Also check if there are any Odeme records without Kategori_ID filter for debugging
        total_odeme_count = db.query(models.Odeme).filter(
            models.Odeme.Sube_ID == sube_id,
            models.Odeme.Donem == donem
        ).count()
        logger.info(f"Total Odeme records for this sube/donem: {total_odeme_count}")
        
        # Check if Kategori_ID=60 exists at all
        kategori_60_exists = db.query(models.Kategori).filter(models.Kategori.Kategori_ID == 60).first()
        logger.info(f"Kategori_ID=60 exists: {kategori_60_exists is not None}")
        
        result = []
        for record in records:
            try:
                result.append(ReportDataItem(
                    Tarih=record.Tarih.strftime('%Y-%m-%d'),
                    Donem=record.Donem,
                    Tutar=float(record.Tutar)
                ))
            except Exception as e:
                logger.error(f"Error processing record {record.Odeme_ID}: {e}")
                continue
        
        logger.info(f"Successfully processed {len(result)} Bankaya Yatan records")
        return result
        
    except Exception as e:
        logger.error(f"Error in get_bankaya_yatan_by_sube_and_donem: {e}")
        return []

def get_nakit_girisi_by_sube_and_donem(db: Session, sube_id: int, donem: int):
    """
    Get Nakit records for specific sube and donem
    """
    import logging
    from schemas.report import ReportDataItem
    
    logger = logging.getLogger(__name__)
    
    # Keep donem as is since database now stores periods in 4-digit format
    # No conversion needed - if input is 6-digit, convert to 4-digit
    if len(str(donem)) == 6:
        donem = donem - 2000  # Convert 202508 to 2508
    
    logger.info(f"Fetching Nakit Girişi records for Sube_ID: {sube_id}, Donem: {donem}")
    
    try:
        # Query with debug info
        query = db.query(models.Nakit).filter(
            models.Nakit.Sube_ID == sube_id,
            models.Nakit.Donem == donem
        )
        
        logger.info(f"Query SQL: {str(query)}")
        records = query.all()
        logger.info(f"Found {len(records)} Nakit Girişi records")
        
        # Also check total count for debugging
        total_nakit_count = db.query(models.Nakit).filter(
            models.Nakit.Sube_ID == sube_id
        ).count()
        logger.info(f"Total Nakit records for this sube: {total_nakit_count}")
        
        result = []
        for record in records:
            try:
                result.append(ReportDataItem(
                    Tarih=record.Tarih.strftime('%Y-%m-%d'),
                    Donem=record.Donem,
                    Tutar=float(record.Tutar)
                ))
            except Exception as e:
                logger.error(f"Error processing Nakit record {record.Nakit_ID}: {e}")
                continue
        
        logger.info(f"Successfully processed {len(result)} Nakit Girişi records")
        return result
        
    except Exception as e:
        logger.error(f"Error in get_nakit_girisi_by_sube_and_donem: {e}")
        return []

# --- Fatura Report CRUD Functions ---
def get_fatura_rapor(db: Session, donem_list: Optional[List[int]] = None, kategori_list: Optional[List[int]] = None, sube_id: Optional[int] = None):
    """
    Get comprehensive EFatura report with grouping by Donem and Kategori
    """
    import logging
    from collections import defaultdict
    from decimal import Decimal
    from sqlalchemy import or_
    from schemas.fatura_rapor import FaturaRaporResponse, DonemGroup, KategoriGroup, FaturaDetail, FaturaRaporTotals, FaturaRaporRequest
    
    logger = logging.getLogger(__name__)
    
    try:
        # Build base query
        query = db.query(models.EFatura)
        
        # Apply filters
        if sube_id:
            query = query.filter(models.EFatura.Sube_ID == sube_id)
            
        if donem_list:
            # Handle period format conversion if needed
            converted_donem_list = []
            for donem in donem_list:
                if len(str(donem)) == 6:
                    converted_donem_list.append(donem - 200000)  # Convert 202508 to 2508
                else:
                    converted_donem_list.append(donem)
            query = query.filter(models.EFatura.Donem.in_(converted_donem_list))
            
        if kategori_list:
            # Include specified categories or uncategorized if requested
            if -1 in kategori_list:  # -1 represents uncategorized
                kategori_list_clean = [k for k in kategori_list if k != -1]
                if kategori_list_clean:
                    query = query.filter(
                        or_(
                            models.EFatura.Kategori_ID.in_(kategori_list_clean),
                            models.EFatura.Kategori_ID.is_(None)
                        )
                    )
                else:
                    query = query.filter(models.EFatura.Kategori_ID.is_(None))
            else:
                query = query.filter(models.EFatura.Kategori_ID.in_(kategori_list))
        
        # Join with Kategori to get category names
        query = query.outerjoin(models.Kategori, models.EFatura.Kategori_ID == models.Kategori.Kategori_ID)
        
        # Order by Donem, Kategori, Fatura_Tarihi
        query = query.order_by(models.EFatura.Donem.desc(), models.EFatura.Kategori_ID, models.EFatura.Fatura_Tarihi.desc())
        
        records = query.all()
        logger.info(f"Found {len(records)} EFatura records for report")
        
        # Group data by Donem and Kategori
        donem_groups = defaultdict(lambda: {
            'donem_total': Decimal('0'),
            'record_count': 0,
            'kategoriler': defaultdict(lambda: {
                'kategori_adi': 'Kategorilendirilmemiş',
                'kategori_total': Decimal('0'),
                'record_count': 0,
                'faturalar': []
            })
        })
        
        # Collect all category names
        kategori_names = {}
        if kategori_list:
            kategoriler = db.query(models.Kategori).filter(models.Kategori.Kategori_ID.in_(kategori_list)).all()
            for kat in kategoriler:
                kategori_names[kat.Kategori_ID] = kat.Kategori_Adi
        
        # Process records
        total_records = 0
        grand_total = Decimal('0')
        donem_totals = defaultdict(lambda: Decimal('0'))
        kategori_totals = defaultdict(lambda: Decimal('0'))
        
        for record in records:
            donem = record.Donem
            kategori_id = record.Kategori_ID or 'uncategorized'
            kategori_adi = 'Kategorilendirilmemiş'
            
            # Get category name
            if record.Kategori_ID and hasattr(record, 'kategori') and record.kategori:
                kategori_adi = record.kategori.Kategori_Adi
            elif record.Kategori_ID in kategori_names:
                kategori_adi = kategori_names[record.Kategori_ID]
            
            # Set category name
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_adi'] = kategori_adi
            
            # Create detail record
            detail = FaturaDetail(
                fatura_id=record.Fatura_ID,
                fatura_tarihi=record.Fatura_Tarihi,
                fatura_numarasi=record.Fatura_Numarasi,
                alici_unvani=record.Alici_Unvani,
                tutar=record.Tutar,
                aciklama=record.Aciklama,
                giden_fatura=record.Giden_Fatura,
                gunluk_harcama=record.Gunluk_Harcama,
                ozel=record.Ozel
            )
            
            # Add to collections
            donem_groups[donem]['kategoriler'][kategori_id]['faturalar'].append(detail)
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += record.Tutar
            donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
            donem_groups[donem]['donem_total'] += record.Tutar
            donem_groups[donem]['record_count'] += 1
            
            # Update totals
            donem_totals[donem] += record.Tutar
            kategori_totals[str(kategori_id)] += record.Tutar
            grand_total += record.Tutar
            total_records += 1
        
        # Convert to response format
        result_data = []
        for donem in sorted(donem_groups.keys(), reverse=True):
            donem_data = donem_groups[donem]
            
            kategori_groups = []
            for kategori_id in sorted(donem_data['kategoriler'].keys(), 
                                    key=lambda x: (x == 'uncategorized', x)):
                kategori_data = donem_data['kategoriler'][kategori_id]
                
                kategori_group = KategoriGroup(
                    kategori_id=None if kategori_id == 'uncategorized' else kategori_id,
                    kategori_adi=kategori_data['kategori_adi'],
                    kategori_total=kategori_data['kategori_total'],
                    record_count=kategori_data['record_count'],
                    faturalar=sorted(kategori_data['faturalar'], key=lambda x: x.fatura_tarihi, reverse=True)
                )
                kategori_groups.append(kategori_group)
            
            donem_group = DonemGroup(
                donem=donem,
                donem_total=donem_data['donem_total'],
                record_count=donem_data['record_count'],
                kategoriler=kategori_groups
            )
            result_data.append(donem_group)
        
        # Create totals
        totals = FaturaRaporTotals(
            donem_totals=dict(donem_totals),
            kategori_totals=dict(kategori_totals),
            grand_total=grand_total
        )
        
        # Create filters applied
        filters_applied = FaturaRaporRequest(
            donem=donem_list,
            kategori=kategori_list,
            sube_id=sube_id
        )
        
        # Create final response
        response = FaturaRaporResponse(
            data=result_data,
            totals=totals,
            filters_applied=filters_applied,
            total_records=total_records
        )
        
        logger.info(f"Successfully generated Fatura report with {len(result_data)} period groups, {total_records} total records")
        return response
        
    except Exception as e:
        logger.error(f"Error in get_fatura_rapor: {e}")
        # Return empty response on error
        empty_response = FaturaRaporResponse(
            data=[],
            totals=FaturaRaporTotals(
                donem_totals={},
                kategori_totals={},
                grand_total=Decimal('0')
            ),
            filters_applied=FaturaRaporRequest(
                donem=donem_list,
                kategori=kategori_list,
                sube_id=sube_id
            ),
            total_records=0
        )
        return empty_response

# --- Fatura & Diğer Harcama Report CRUD Functions ---
def get_fatura_diger_harcama_rapor(db: Session, donem_list: Optional[List[int]] = None, kategori_list: Optional[List[int]] = None, sube_id: Optional[int] = None):
    """
    Get comprehensive report combining both EFatura and DigerHarcama records with grouping by Donem and Kategori
    """
    import logging
    from collections import defaultdict
    from decimal import Decimal
    from sqlalchemy import or_
    from schemas.fatura_diger_harcama_rapor import FaturaDigerHarcamaRaporResponse, DonemGroup, KategoriGroup, KayitDetail, FaturaDigerHarcamaRaporTotals, FaturaRaporRequest
    
    logger = logging.getLogger(__name__)
    
    try:
        # Build queries for both tables
        efatura_query = db.query(models.EFatura)
        diger_harcama_query = db.query(models.DigerHarcama)
        
        # Apply filters to both queries
        if sube_id:
            efatura_query = efatura_query.filter(models.EFatura.Sube_ID == sube_id)
            diger_harcama_query = diger_harcama_query.filter(models.DigerHarcama.Sube_ID == sube_id)
            
        if donem_list:
            # Handle period format conversion if needed
            converted_donem_list = []
            for donem in donem_list:
                if len(str(donem)) == 6:
                    converted_donem_list.append(donem - 200000)  # Convert 202508 to 2508
                else:
                    converted_donem_list.append(donem)
            efatura_query = efatura_query.filter(models.EFatura.Donem.in_(converted_donem_list))
            diger_harcama_query = diger_harcama_query.filter(models.DigerHarcama.Donem.in_(converted_donem_list))
            
        if kategori_list:
            # Include specified categories or uncategorized if requested
            if -1 in kategori_list:  # -1 represents uncategorized
                kategori_list_clean = [k for k in kategori_list if k != -1]
                if kategori_list_clean:
                    efatura_query = efatura_query.filter(
                        or_(
                            models.EFatura.Kategori_ID.in_(kategori_list_clean),
                            models.EFatura.Kategori_ID.is_(None)
                        )
                    )
                    diger_harcama_query = diger_harcama_query.filter(
                        or_(
                            models.DigerHarcama.Kategori_ID.in_(kategori_list_clean),
                            models.DigerHarcama.Kategori_ID.is_(None)
                        )
                    )
                else:
                    efatura_query = efatura_query.filter(models.EFatura.Kategori_ID.is_(None))
                    diger_harcama_query = diger_harcama_query.filter(models.DigerHarcama.Kategori_ID.is_(None))
            else:
                efatura_query = efatura_query.filter(models.EFatura.Kategori_ID.in_(kategori_list))
                diger_harcama_query = diger_harcama_query.filter(models.DigerHarcama.Kategori_ID.in_(kategori_list))
        
        # Join with Kategori to get category names
        efatura_query = efatura_query.outerjoin(models.Kategori, models.EFatura.Kategori_ID == models.Kategori.Kategori_ID)
        diger_harcama_query = diger_harcama_query.outerjoin(models.Kategori, models.DigerHarcama.Kategori_ID == models.Kategori.Kategori_ID)
        
        # Order by Donem, Kategori, Tarih
        efatura_query = efatura_query.order_by(models.EFatura.Donem.desc(), models.EFatura.Kategori_ID, models.EFatura.Fatura_Tarihi.desc())
        diger_harcama_query = diger_harcama_query.order_by(models.DigerHarcama.Donem.desc(), models.DigerHarcama.Kategori_ID, models.DigerHarcama.Belge_Tarihi.desc())
        
        efatura_records = efatura_query.all()
        diger_harcama_records = diger_harcama_query.all()
        
        logger.info(f"Found {len(efatura_records)} EFatura records and {len(diger_harcama_records)} DigerHarcama records for report")
        
        # Group data by Donem and Kategori
        donem_groups = defaultdict(lambda: {
            'donem_total': Decimal('0'),
            'record_count': 0,
            'kategoriler': defaultdict(lambda: {
                'kategori_adi': 'Kategorilendirilmemiş',
                'kategori_total': Decimal('0'),
                'record_count': 0,
                'kayitlar': []
            })
        })
        
        # Collect all category names
        kategori_names = {}
        if kategori_list:
            kategoriler = db.query(models.Kategori).filter(models.Kategori.Kategori_ID.in_(kategori_list)).all()
            for kat in kategoriler:
                kategori_names[kat.Kategori_ID] = kat.Kategori_Adi
        
        # Process EFatura records
        total_records = 0
        grand_total = Decimal('0')
        donem_totals = defaultdict(lambda: Decimal('0'))
        kategori_totals = defaultdict(lambda: Decimal('0'))
        
        for record in efatura_records:
            donem = record.Donem
            kategori_id = record.Kategori_ID or 'uncategorized'
            kategori_adi = 'Kategorilendirilmemiş'
            
            # Get category name
            if record.Kategori_ID and hasattr(record, 'kategori') and record.kategori:
                kategori_adi = record.kategori.Kategori_Adi
            elif record.Kategori_ID in kategori_names:
                kategori_adi = kategori_names[record.Kategori_ID]
            
            # Set category name
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_adi'] = kategori_adi
            
            # Create detail record with appropriate tag
            etiket = "Giden Fatura" if record.Giden_Fatura else "Gelen Fatura"
            
            detail = KayitDetail(
                id=record.Fatura_ID,
                tarih=record.Fatura_Tarihi,
                belge_numarasi=record.Fatura_Numarasi,
                karsi_taraf_adi=record.Alici_Unvani,
                tutar=record.Tutar,
                aciklama=record.Aciklama,
                etiket=etiket,
                gunluk_harcama=record.Gunluk_Harcama,
                ozel=record.Ozel
            )
            
            # Add to collections
            donem_groups[donem]['kategoriler'][kategori_id]['kayitlar'].append(detail)
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += record.Tutar
            donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
            donem_groups[donem]['donem_total'] += record.Tutar
            donem_groups[donem]['record_count'] += 1
            
            # Update totals
            donem_totals[donem] += record.Tutar
            kategori_totals[str(kategori_id)] += record.Tutar
            grand_total += record.Tutar
            total_records += 1
        
        # Process DigerHarcama records
        for record in diger_harcama_records:
            donem = record.Donem
            kategori_id = record.Kategori_ID or 'uncategorized'
            kategori_adi = 'Kategorilendirilmemiş'
            
            # Get category name
            if record.Kategori_ID and hasattr(record, 'kategori') and record.kategori:
                kategori_adi = record.kategori.Kategori_Adi
            elif record.Kategori_ID in kategori_names:
                kategori_adi = kategori_names[record.Kategori_ID]
            
            # Set category name
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_adi'] = kategori_adi
            
            # Create detail record with "Diğer Harcama" tag
            detail = KayitDetail(
                id=record.Harcama_ID,
                tarih=record.Belge_Tarihi,
                belge_numarasi=record.Belge_Numarasi or "",
                karsi_taraf_adi=record.Alici_Adi,
                tutar=record.Tutar,
                aciklama=record.Açıklama,
                etiket="Diğer Harcama",
                gunluk_harcama=record.Gunluk_Harcama,
                ozel=None  # Not applicable for DigerHarcama
            )
            
            # Add to collections
            donem_groups[donem]['kategoriler'][kategori_id]['kayitlar'].append(detail)
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += record.Tutar
            donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
            donem_groups[donem]['donem_total'] += record.Tutar
            donem_groups[donem]['record_count'] += 1
            
            # Update totals
            donem_totals[donem] += record.Tutar
            kategori_totals[str(kategori_id)] += record.Tutar
            grand_total += record.Tutar
            total_records += 1
        
        # Convert to response format
        result_data = []
        for donem in sorted(donem_groups.keys(), reverse=True):
            donem_data = donem_groups[donem]
            
            kategori_groups = []
            for kategori_id in sorted(donem_data['kategoriler'].keys(), 
                                    key=lambda x: (x == 'uncategorized', x)):
                kategori_data = donem_data['kategoriler'][kategori_id]
                
                # Sort records by date
                sorted_kayitlar = sorted(kategori_data['kayitlar'], key=lambda x: x.tarih, reverse=True)
                
                kategori_group = KategoriGroup(
                    kategori_id=None if kategori_id == 'uncategorized' else kategori_id,
                    kategori_adi=kategori_data['kategori_adi'],
                    kategori_total=kategori_data['kategori_total'],
                    record_count=kategori_data['record_count'],
                    kayitlar=sorted_kayitlar
                )
                kategori_groups.append(kategori_group)
            
            donem_group = DonemGroup(
                donem=donem,
                donem_total=donem_data['donem_total'],
                record_count=donem_data['record_count'],
                kategoriler=kategori_groups
            )
            result_data.append(donem_group)
        
        # Create totals
        totals = FaturaDigerHarcamaRaporTotals(
            donem_totals=dict(donem_totals),
            kategori_totals=dict(kategori_totals),
            grand_total=grand_total
        )
        
        # Create filters applied
        filters_applied = FaturaRaporRequest(
            donem=donem_list,
            kategori=kategori_list,
            sube_id=sube_id
        )
        
        # Create final response
        response = FaturaDigerHarcamaRaporResponse(
            data=result_data,
            totals=totals,
            filters_applied=filters_applied,
            total_records=total_records
        )
        
        logger.info(f"Successfully generated Fatura & Diğer Harcama report with {len(result_data)} period groups, {total_records} total records")
        return response
        
    except Exception as e:
        logger.error(f"Error in get_fatura_diger_harcama_rapor: {e}")
        # Return empty response on error
        empty_response = FaturaDigerHarcamaRaporResponse(
            data=[],
            totals=FaturaDigerHarcamaRaporTotals(
                donem_totals={},
                kategori_totals={},
                grand_total=Decimal('0')
            ),
            filters_applied=FaturaRaporRequest(
                donem=donem_list,
                kategori=kategori_list,
                sube_id=sube_id
            ),
            total_records=0
        )
        return empty_response

# --- Odeme Report CRUD Functions ---
def get_odeme_rapor(db: Session, donem_list: Optional[List[int]] = None, kategori_list: Optional[List[int]] = None, sube_id: Optional[int] = None):
    """
    Get comprehensive Odeme report with grouping by Donem, Kategori, and Banka Hesabi
    """
    import logging
    from collections import defaultdict
    from decimal import Decimal
    from sqlalchemy import or_
    from schemas.odeme_rapor import OdemeRaporResponse, DonemGroup, KategoriGroup, BankaHesabiGroup, OdemeDetail, OdemeRaporTotals, OdemeRaporRequest
    
    logger = logging.getLogger(__name__)
    
    try:
        # Build base query
        query = db.query(models.Odeme)
        
        # Apply filters
        if sube_id:
            query = query.filter(models.Odeme.Sube_ID == sube_id)
            
        if donem_list:
            # Handle period format conversion if needed
            converted_donem_list = []
            for donem in donem_list:
                if len(str(donem)) == 6:
                    converted_donem_list.append(donem - 200000)  # Convert 202508 to 2508
                else:
                    converted_donem_list.append(donem)
            query = query.filter(models.Odeme.Donem.in_(converted_donem_list))
            
        if kategori_list:
            # Include specified categories or uncategorized if requested
            if -1 in kategori_list:  # -1 represents uncategorized
                kategori_list_clean = [k for k in kategori_list if k != -1]
                if kategori_list_clean:
                    query = query.filter(
                        or_(
                            models.Odeme.Kategori_ID.in_(kategori_list_clean),
                            models.Odeme.Kategori_ID.is_(None)
                        )
                    )
                else:
                    query = query.filter(models.Odeme.Kategori_ID.is_(None))
            else:
                query = query.filter(models.Odeme.Kategori_ID.in_(kategori_list))
        
        # Join with Kategori to get category names
        query = query.outerjoin(models.Kategori, models.Odeme.Kategori_ID == models.Kategori.Kategori_ID)
        
        # Order by Donem, Kategori, Hesap_Adi, Tarih
        query = query.order_by(models.Odeme.Donem.desc(), models.Odeme.Kategori_ID, models.Odeme.Hesap_Adi, models.Odeme.Tarih.desc())
        
        records = query.all()
        logger.info(f"Found {len(records)} Odeme records for report")
        
        # Group data by Donem, Kategori, and Banka Hesabi
        donem_groups = defaultdict(lambda: {
            'donem_total': Decimal('0'),
            'record_count': 0,
            'kategoriler': defaultdict(lambda: {
                'kategori_adi': 'Kategorilendirilmemiş',
                'kategori_total': Decimal('0'),
                'record_count': 0,
                'banka_hesaplari': defaultdict(lambda: {
                    'hesap_total': Decimal('0'),
                    'record_count': 0,
                    'details': []
                })
            })
        })
        
        # Collect all category names
        kategori_names = {}
        if kategori_list:
            kategoriler = db.query(models.Kategori).filter(models.Kategori.Kategori_ID.in_(kategori_list)).all()
            for kat in kategoriler:
                kategori_names[kat.Kategori_ID] = kat.Kategori_Adi
        
        # Process records
        total_records = 0
        grand_total = Decimal('0')
        donem_totals = defaultdict(lambda: Decimal('0'))
        kategori_totals = defaultdict(lambda: Decimal('0'))
        
        for record in records:
            donem = record.Donem
            kategori_id = record.Kategori_ID or 'uncategorized'
            hesap_adi = record.Hesap_Adi or 'Belirtilmemiş'
            kategori_adi = 'Kategorilendirilmemiş'
            
            # Get category name
            if record.Kategori_ID and hasattr(record, 'kategori') and record.kategori:
                kategori_adi = record.kategori.Kategori_Adi
            elif record.Kategori_ID in kategori_names:
                kategori_adi = kategori_names[record.Kategori_ID]
            
            # Set category name
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_adi'] = kategori_adi
            
            # Create detail record
            detail = OdemeDetail(
                odeme_id=record.Odeme_ID,
                tip=record.Tip,
                hesap_adi=record.Hesap_Adi,
                tarih=record.Tarih,
                aciklama=record.Aciklama,
                tutar=record.Tutar
            )
            
            # Add to collections
            donem_groups[donem]['kategoriler'][kategori_id]['banka_hesaplari'][hesap_adi]['details'].append(detail)
            donem_groups[donem]['kategoriler'][kategori_id]['banka_hesaplari'][hesap_adi]['hesap_total'] += record.Tutar
            donem_groups[donem]['kategoriler'][kategori_id]['banka_hesaplari'][hesap_adi]['record_count'] += 1
            donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += record.Tutar
            donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
            donem_groups[donem]['donem_total'] += record.Tutar
            donem_groups[donem]['record_count'] += 1
            
            # Update totals
            donem_totals[donem] += record.Tutar
            kategori_totals[str(kategori_id)] += record.Tutar
            grand_total += record.Tutar
            total_records += 1
        
        # Convert to response format
        result_data = []
        for donem in sorted(donem_groups.keys(), reverse=True):
            donem_data = donem_groups[donem]
            
            kategori_groups = []
            for kategori_id in sorted(donem_data['kategoriler'].keys(), 
                                    key=lambda x: (x == 'uncategorized', x)):
                kategori_data = donem_data['kategoriler'][kategori_id]
                
                # Create banka hesabi groups
                banka_hesabi_groups = []
                for hesap_adi in sorted(kategori_data['banka_hesaplari'].keys()):
                    hesap_data = kategori_data['banka_hesaplari'][hesap_adi]
                    
                    banka_hesabi_group = BankaHesabiGroup(
                        hesap_adi=hesap_adi,
                        hesap_total=hesap_data['hesap_total'],
                        record_count=hesap_data['record_count'],
                        details=sorted(hesap_data['details'], key=lambda x: x.tarih, reverse=True)
                    )
                    banka_hesabi_groups.append(banka_hesabi_group)
                
                kategori_group = KategoriGroup(
                    kategori_id=None if kategori_id == 'uncategorized' else kategori_id,
                    kategori_adi=kategori_data['kategori_adi'],
                    kategori_total=kategori_data['kategori_total'],
                    record_count=kategori_data['record_count'],
                    banka_hesaplari=banka_hesabi_groups
                )
                kategori_groups.append(kategori_group)
            
            donem_group = DonemGroup(
                donem=donem,
                donem_total=donem_data['donem_total'],
                record_count=donem_data['record_count'],
                kategoriler=kategori_groups
            )
            result_data.append(donem_group)
        
        # Create totals
        totals = OdemeRaporTotals(
            donem_totals=dict(donem_totals),
            kategori_totals=dict(kategori_totals),
            grand_total=grand_total
        )
        
        # Create filters applied
        filters_applied = OdemeRaporRequest(
            donem=donem_list,
            kategori=kategori_list,
            sube_id=sube_id
        )
        
        # Create final response
        response = OdemeRaporResponse(
            data=result_data,
            totals=totals,
            filters_applied=filters_applied,
            total_records=total_records
        )
        
        logger.info(f"Successfully generated Odeme report with {len(result_data)} period groups, {total_records} total records")
        return response
        
    except Exception as e:
        logger.error(f"Error in get_odeme_rapor: {e}")
        # Return empty response on error
        empty_response = OdemeRaporResponse(
            data=[],
            totals=OdemeRaporTotals(
                donem_totals={},
                kategori_totals={},
                grand_total=Decimal('0')
            ),
            filters_applied=OdemeRaporRequest(
                donem=donem_list,
                kategori=kategori_list,
                sube_id=sube_id
            ),
            total_records=0
        )
        return empty_response

import pandas as pd
from fastapi import UploadFile


def process_tabak_sayisi_excel(db: Session, file: UploadFile, sube_id: int):
    try:
        df = pd.read_excel(file.file, header=0)  # Assuming the first row is the header

        # Strip any whitespace from column names
        df.columns = [col.strip() for col in df.columns]
        print(f"Excel columns: {df.columns}")

        # Find the required columns dynamically
        tarih_col = next((col for col in df.columns if 'Tarih' in col), None)
        tabak_col = next((col for col in df.columns if 'Toplam Tabak' in col), None)

        if not tarih_col or not tabak_col:
            missing = []
            if not tarih_col: missing.append("'Tarih' içeren bir sütun")
            if not tabak_col: missing.append("'Toplam Tabak' içeren bir sütun")
            return {"error": f"Excel dosyasında gerekli sütunlar eksik: {', '.join(missing)}"}

        updated_count = 0  
        not_found_count = 0  
        errors = []  

        for index, row in df.iterrows():  
            try:  
                plate_count = row[tabak_col]
                # Try to parse the date with multiple formats
                try:
                    event_date = pd.to_datetime(row[tarih_col]).date()
                except Exception:
                    event_date = pd.to_datetime(row[tarih_col], format='%%d-%%m-%%Y %%H:%%M:%%S').date()  

                gelir_ekstra_record = db.query(models.GelirEkstra).filter(  
                    models.GelirEkstra.Sube_ID == sube_id,  
                    models.GelirEkstra.Tarih == event_date  
                ).first()  
  
                if gelir_ekstra_record:  
                    gelir_ekstra_record.Tabak_Sayisi = int(plate_count)  
                    updated_count += 1  
                else:  
                    not_found_count += 1  
  
            except Exception as e:  
                errors.append(f"Row {index + 2}: {str(e)}")  
  
        db.commit()  
  
        return {  
            "message": "File processed successfully.",  
            "updated_records": updated_count,  
            "records_not_found": not_found_count,  
            "errors": errors  
        }  
  
    except Exception as e:  
        db.rollback()  
        return {"error": f"Failed to process Excel file: {str(e)}"}  

def get_depo_kira_rapor(db: Session, year: int, sube_id: int):
    from sqlalchemy import text

    sql_query = """
    WITH X_Kategorileri AS (
        SELECT Kategori_ID
        FROM SilverCloud.Kategori
        WHERE Kategori_Adi = 'Depo Kira'
    ),
    Tum_Veri AS (
        SELECT Donem, Tutar
        FROM SilverCloud.Diger_Harcama
        WHERE Kategori_ID IN (SELECT Kategori_ID FROM X_Kategorileri)
        AND YEAR(Belge_Tarihi) = :year
        AND Sube_ID = :sube_id

        UNION ALL

        SELECT Donem, Tutar
        FROM SilverCloud.e_Fatura
        WHERE Kategori_ID IN (SELECT Kategori_ID FROM X_Kategorileri)
        AND YEAR(Fatura_Tarihi) = :year
        AND Sube_ID = :sube_id
    )
    SELECT
        Donem,
        SUM(Tutar) AS Toplam_Tutar
    FROM Tum_Veri
    GROUP BY Donem
    ORDER BY Donem;
    """
    
    result = db.execute(text(sql_query), {"year": year, "sube_id": sube_id})
    
    formatted_results = [{"Donem": row.Donem, "Toplam_Tutar": float(row.Toplam_Tutar)} for row in result]

    return formatted_results

def get_all_expenses_by_category_for_donem(db: Session, donem: int):
    """
    Fetches all expenses grouped by category for a given period (Donem).
    Combines data from Diger_Harcama and e_Fatura tables.
    """
    from sqlalchemy import text
    from decimal import Decimal
    import logging
    logger = logging.getLogger(__name__)

    sql_query = """
    WITH X_kategorileri AS (
        SELECT Kategori_ID
        FROM SilverCloud.Kategori
        WHERE Tip = 'Gider'
    ),
    tumunu_veriler AS (
        SELECT dh.Kategori_ID, dh.Tutar
        FROM SilverCloud.Diger_Harcama dh
        WHERE dh.Donem = :donem_param

        UNION ALL

        SELECT ef.Kategori_ID, ef.Tutar
        FROM SilverCloud.e_Fatura ef
        WHERE ef.Donem = :donem_param
    )
    SELECT
        x.Kategori_ID,
        COALESCE(SUM(t.Tutar), 0) AS Toplam_Tutar
    FROM X_kategorileri x
    LEFT JOIN tumunu_veriler t
           ON x.Kategori_ID = t.Kategori_ID
    GROUP BY x.Kategori_ID
    ORDER BY x.Kategori_ID;
    """
    try:
        logger.info(f"Executing get_all_expenses_by_category_for_donem for Donem: {donem}")
        result = db.execute(text(sql_query), {"donem_param": donem})
        
        # Fetch all results and convert to a list of dictionaries
        # Assuming the result has Kategori_ID and Toplam_Tutar
        expenses_data = []
        for row in result:
            expenses_data.append({
                "Kategori_ID": row.Kategori_ID,
                "Toplam_Tutar": float(row.Toplam_Tutar) # Convert Decimal to float for JSON serialization
            })
        logger.info(f"Found {len(expenses_data)} expense categories for Donem: {donem}")
        return expenses_data
    except Exception as e:
        logger.error(f"Error in get_all_expenses_by_category_for_donem: {e}")
        return []

def get_bolunmus_faturalar(db: Session):
    sql_query = """
    SELECT
        t.Fatura_Numarasi AS Bolunmus_Fatura,
        s.Fatura_Numarasi AS Ana_Fatura,
        s.Tutar AS Ana_Tutar,
        k_t.Kategori_Adi AS Kategori_Adi,
        t.Fatura_ID,
        t.Fatura_Tarihi,
        t.Fatura_Numarasi,
        t.Alici_Unvani,
        t.Alici_VKN_TCKN,
        t.Tutar,
        t.Kategori_ID,
        t.Aciklama,
        t.Donem,
        t.Ozel,
        t.Gunluk_Harcama,
        t.Giden_Fatura,
        t.Sube_ID,
        t.Kayit_Tarihi
    FROM SilverCloud.e_Fatura t
    LEFT JOIN SilverCloud.Kategori k_t ON t.Kategori_ID = k_t.Kategori_ID
    INNER JOIN SilverCloud.e_Fatura s
        ON t.Fatura_Numarasi LIKE CONCAT(s.Fatura_Numarasi, '-%') AND t.Fatura_Numarasi != s.Fatura_Numarasi
    INNER JOIN SilverCloud.Kategori k
        ON s.Kategori_ID = k.Kategori_ID
    WHERE k.Kategori_Adi = 'Bölünmüş Fatura'
    ORDER BY t.Fatura_Numarasi;
    """
    from sqlalchemy import text
    result = db.execute(text(sql_query))
    return result.fetchall()


def get_robotpos_tutar(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of RobotPos_Tutar for a given period and branch.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    total_tutar = db.query(func.sum(models.GelirEkstra.RobotPos_Tutar)).filter(
        models.GelirEkstra.Sube_ID == sube_id,
        func.date_format(models.GelirEkstra.Tarih, '%y%m') == str(donem)
    ).scalar()
    
    return total_tutar or 0.0

def get_toplam_satis_gelirleri(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Toplam Satis Gelirleri for a given period and branch.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    ust_kategori_names = ['E-Ticaret Kredi Kart', 'Kredi Kartı', 'Nakit', 'Yemek Çeki']
    
    ust_kategori_ids = db.query(models.UstKategori.UstKategori_ID).filter(
        models.UstKategori.UstKategori_Adi.in_(ust_kategori_names)
    ).all()
    ust_kategori_ids = [id[0] for id in ust_kategori_ids]

    kategori_ids = db.query(models.Kategori.Kategori_ID).filter(
        models.Kategori.Ust_Kategori_ID.in_(ust_kategori_ids)
    ).all()
    kategori_ids = [id[0] for id in kategori_ids]

    total_tutar = db.query(func.sum(models.Gelir.Tutar)).filter(
        models.Gelir.Sube_ID == sube_id,
        func.date_format(models.Gelir.Tarih, '%y%m') == str(donem),
        models.Gelir.Kategori_ID.in_(kategori_ids)
    ).scalar()
    
    return total_tutar or 0.0

def get_nakit_gelirleri(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Nakit Gelirleri for a given period and branch.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    ust_kategori_names = ['Nakit']
    
    ust_kategori_ids = db.query(models.UstKategori.UstKategori_ID).filter(
        models.UstKategori.UstKategori_Adi.in_(ust_kategori_names)
    ).all()
    ust_kategori_ids = [id[0] for id in ust_kategori_ids]

    kategori_ids = db.query(models.Kategori.Kategori_ID).filter(
        models.Kategori.Ust_Kategori_ID.in_(ust_kategori_ids)
    ).all()
    kategori_ids = [id[0] for id in kategori_ids]

    total_tutar = db.query(func.sum(models.Gelir.Tutar)).filter(
        models.Gelir.Sube_ID == sube_id,
        func.date_format(models.Gelir.Tarih, '%y%m') == str(donem),
        models.Gelir.Kategori_ID.in_(kategori_ids)
    ).scalar()
    
    return total_tutar or 0.0

def get_gunluk_harcama_diger(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from Diger_Harcama for a given period and branch
    where Gunluk_Harcama is true.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    total_tutar = db.query(func.sum(models.DigerHarcama.Tutar)).filter(
        models.DigerHarcama.Sube_ID == sube_id,
        models.DigerHarcama.Donem == donem,
        models.DigerHarcama.Gunluk_Harcama == True
    ).scalar()

    return total_tutar or 0.0

def get_gunluk_harcama_efatura(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from e_Fatura for a given period and branch
    where Gunluk_Harcama is true.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    total_tutar = db.query(func.sum(models.EFatura.Tutar)).filter(
        models.EFatura.Sube_ID == sube_id,
        models.EFatura.Donem == donem,
        models.EFatura.Gunluk_Harcama == True
    ).scalar()

    return total_tutar or 0.0

def get_nakit_girisi_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from Nakit for a given period and branch
    where Tip is 'Bankaya Yatan'.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    total_tutar = db.query(func.sum(models.Nakit.Tutar)).filter(
        models.Nakit.Sube_ID == sube_id,
        models.Nakit.Donem == donem,
        models.Nakit.Tip == 'Bankaya Yatan'
    ).scalar()

    return total_tutar or 0.0

def get_bankaya_yatan_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from Odeme for a given period and branch
    where Kategori_Adi is 'ATM Para Yatırma'.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    kategori_id = db.query(models.Kategori.Kategori_ID).filter(
        models.Kategori.Kategori_Adi == 'ATM Para Yatırma'
    ).scalar()

    total_tutar = db.query(func.sum(models.Odeme.Tutar)).filter(
        models.Odeme.Sube_ID == sube_id,
        models.Odeme.Donem == donem,
        models.Odeme.Kategori_ID == kategori_id
    ).scalar()

    return total_tutar or 0.0

def get_gelir_pos_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from Gelir for a given period and branch
    where Kategori_Adi is 'POS'.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    kategori_id = db.query(models.Kategori.Kategori_ID).filter(
        models.Kategori.Kategori_Adi == 'POS'
    ).scalar()

    total_tutar = db.query(func.sum(models.Gelir.Tutar)).filter(
        models.Gelir.Sube_ID == sube_id,
        func.date_format(models.Gelir.Tarih, '%y%m') == str(donem),
        models.Gelir.Kategori_ID == kategori_id
    ).scalar()
    
    return total_tutar or 0.0

def get_pos_hareketleri_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Islem_Tutari from POS_Hareketleri for a given period and branch.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    total_tutar = db.query(func.sum(models.POSHareketleri.Islem_Tutari)).filter(
        models.POSHareketleri.Sube_ID == sube_id,
        func.date_format(models.POSHareketleri.Islem_Tarihi, '%y%m') == str(donem)
    ).scalar()
    
    return total_tutar or 0.0

def get_online_gelir_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from Gelir for a given period and branch
    where UstKategori is 'E-Ticaret Kredi Kart'.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    ust_kategori_names = ['E-Ticaret Kredi Kart']
    
    ust_kategori_ids = db.query(models.UstKategori.UstKategori_ID).filter(
        models.UstKategori.UstKategori_Adi.in_(ust_kategori_names)
    ).all()
    ust_kategori_ids = [id[0] for id in ust_kategori_ids]

    kategori_ids = db.query(models.Kategori.Kategori_ID).filter(
        models.Kategori.Ust_Kategori_ID.in_(ust_kategori_ids)
    ).all()
    kategori_ids = [id[0] for id in kategori_ids]

    total_tutar = db.query(func.sum(models.Gelir.Tutar)).filter(
        models.Gelir.Sube_ID == sube_id,
        func.date_format(models.Gelir.Tarih, '%y%m') == str(donem),
        models.Gelir.Kategori_ID.in_(kategori_ids)
    ).scalar()
    
    return total_tutar or 0.0

def get_online_virman_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from B2B_Ekstre for a given period and branch
    where Aciklama is like '%Online Alacak Virman%'.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    query = db.query(func.coalesce(func.sum(models.B2BEkstre.Alacak), 0) * -1).filter(
        models.B2BEkstre.Sube_ID == sube_id,
        models.B2BEkstre.Donem == donem,
        models.B2BEkstre.Aciklama.like('%Online Alacak Virman%')
    )
    logger.debug(f"Executing query for get_online_virman_toplam: {query}")
    total_tutar = query.scalar()
    
    return total_tutar or 0.0

def get_yemek_ceki_aylik_gelir_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from Gelir for a given period and branch
    where UstKategori is 'Yemek Çeki'.
    """
    from sqlalchemy import func

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    ust_kategori_names = ['Yemek Çeki']
    
    ust_kategori_ids = db.query(models.UstKategori.UstKategori_ID).filter(
        models.UstKategori.UstKategori_Adi.in_(ust_kategori_names)
    ).all()
    ust_kategori_ids = [id[0] for id in ust_kategori_ids]

    kategori_ids = db.query(models.Kategori.Kategori_ID).filter(
        models.Kategori.Ust_Kategori_ID.in_(ust_kategori_ids)
    ).all()
    kategori_ids = [id[0] for id in kategori_ids]

    total_tutar = db.query(func.sum(models.Gelir.Tutar)).filter(
        models.Gelir.Sube_ID == sube_id,
        func.date_format(models.Gelir.Tarih, '%y%m') == str(donem),
        models.Gelir.Kategori_ID.in_(kategori_ids)
    ).scalar()
    
    return total_tutar or 0.0

def get_yemek_ceki_donem_toplam(db: Session, donem: int, sube_id: int) -> float:
    """
    Calculates the sum of Tutar from YemekCeki for a given period and branch.
    """
    from sqlalchemy import func, text

    if len(str(donem)) == 6:
        # Convert YYYYMM to YYMM
        donem_str = str(donem)
        donem = int(donem_str[2:])

    sql = text("""
    WITH Aktif_YemekCeki AS ( 
        SELECT
            Kategori_ID,
            Ilk_Tarih,
            Son_Tarih,
            Tutar
        FROM SilverCloud.Yemek_Ceki
        WHERE CAST(DATE_FORMAT(Ilk_Tarih, '%y%m') AS UNSIGNED) <= :donem
          AND CAST(DATE_FORMAT(Son_Tarih, '%y%m') AS UNSIGNED) >= :donem
          AND Sube_ID = :sube_id
    ),
    Excluded AS ( 
        SELECT
            SUM(g.Tutar) AS Excluded_Tutar
        FROM Aktif_YemekCeki y
        JOIN SilverCloud.Gelir g
          ON g.Kategori_ID = y.Kategori_ID
         AND CAST(DATE_FORMAT(g.Tarih, '%y%m') AS UNSIGNED) <> :donem
         AND g.Tarih >= y.Ilk_Tarih
         AND g.Tarih <= y.Son_Tarih
         AND g.Sube_ID = :sube_id
    ),
    Included AS ( 
        SELECT
            SUM(Tutar) AS Included_Tutar
        FROM Aktif_YemekCeki
    )
    SELECT
        i.Included_Tutar - COALESCE(e.Excluded_Tutar,0) AS Donem_Tutar
    FROM Included i
    CROSS JOIN Excluded e;
    """)

    result = db.execute(sql, {"donem": donem, "sube_id": sube_id}).scalar()
    
    return result or 0.0

def get_mutabakat_rapor(db: Session):
    from sqlalchemy import text
    sql_query = """
    SELECT
    M.Mutabakat_ID,
    M.Cari_ID,
    ( SELECT Alici_Unvani FROM SilverCloud.Cari where M.Cari_ID=Cari_ID) as Alici_Unvani ,
    M.Mutabakat_Tarihi,
    M.Tutar,
    M.Aciklama,
    M.Sube_ID,
    ( SELECT Sube_Adi FROM SilverCloud.Sube where M.Sube_ID=Sube_ID) as Sube_Adi,
    M.Kayit_Tarihi
    FROM SilverCloud.Mutabakat M;
    """
    result = db.execute(text(sql_query))
    
    # Convert the result to a list of dictionaries
    report_data = []
    for row in result:
        report_data.append({
            "Mutabakat_ID": row.Mutabakat_ID,
            "Cari_ID": row.Cari_ID,
            "Alici_Unvani": row.Alici_Unvani,
            "Mutabakat_Tarihi": row.Mutabakat_Tarihi,
            "Tutar": row.Tutar,
            "Aciklama": row.Aciklama,
            "Sube_ID": row.Sube_ID,
            "Sube_Adi": row.Sube_Adi,
            "Kayit_Tarihi": row.Kayit_Tarihi,
        })
    return report_data