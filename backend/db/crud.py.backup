from sqlalchemy.orm import Session
from typing import List

from db import models
from schemas import sube, user, role, permission, kullanici_rol, rol_yetki, e_fatura, b2b_ekstre, diger_harcama, gelir, gelir_ekstra, stok, stok_fiyat, stok_sayim, calisan, puantaj_secimi, puantaj, avans_istek, ust_kategori, kategori, deger, e_fatura_referans, nakit, odeme, odeme_referans, pos_hareketleri, yemek_ceki
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

def get_b2b_ekstreler(db: Session, skip: int = 0, limit: int = 100):
    ekstreler = db.query(models.B2BEkstre).offset(skip).limit(limit).all()
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
    
    for ekstre_data in ekstreler:
        existing_ekstre = get_b2b_ekstre_by_unique_fields(db, ekstre_data)
        if existing_ekstre:
            logger.info(f"Skipping existing record: {ekstre_data.Fis_No}")
            skipped_count += 1
            continue
        
        ekstre_dict = ekstre_data.dict()
        ekstre_dict['Donem'] = int(ekstre_dict['Donem'])
        db_ekstre = models.B2BEkstre(**ekstre_dict)
        db.add(db_ekstre)
        added_count += 1
    
    try:
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

def get_diger_harcamalar(db: Session, skip: int = 0, limit: int = 100):
    harcamalar = db.query(models.DigerHarcama).offset(skip).limit(limit).all()
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

def get_nakit_entries(db: Session, skip: int = 0, limit: int = 100, sube_id: Optional[int] = None):
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
    return db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()

def get_yemek_cekiler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.YemekCeki).offset(skip).limit(limit).all()

def create_yemek_ceki(db: Session, yemek_ceki_data: yemek_ceki.YemekCekiCreate):
    db_yemek_ceki = models.YemekCeki(**yemek_ceki_data.dict())
    db.add(db_yemek_ceki)
    db.commit()
    db.refresh(db_yemek_ceki)
    return db_yemek_ceki

def update_yemek_ceki(db: Session, yemek_ceki_id: int, yemek_ceki_data: yemek_ceki.YemekCekiUpdate):
    db_yemek_ceki = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    if db_yemek_ceki:
        update_data = yemek_ceki_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_yemek_ceki, key, value)
        db.commit()
        db.refresh(db_yemek_ceki)
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

def get_odemeler(db: Session, skip: int = 0, limit: int = 1000):
    return db.query(models.Odeme).offset(skip).limit(limit).all()

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
def get_pos_kontrol_dashboard_data(db: Session, sube_id: int, donem: int):
    """
    Get POS Kontrol Dashboard data for a specific branch and period
    """
    import logging
    from collections import defaultdict
    from decimal import Decimal
    from datetime import datetime, timedelta
    from sqlalchemy import func, and_, or_
    from schemas.pos_kontrol_dashboard import POSKontrolDailyData, POSKontrolSummary, POSKontrolDashboardResponse
    
    logger = logging.getLogger(__name__)
    
    try:
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
        
        if not pos_kategori:
            logger.warning("POS category not found in database")
            # Return empty response
            return POSKontrolDashboardResponse(
                data=[],
                summary=POSKontrolSummary(
                    total_records=0,
                    successful_matches=0,
                    error_matches=0,
                    success_rate="0%"
                )
            )
        
        pos_kategori_id = pos_kategori.Kategori_ID
        logger.info(f"Found POS category with ID: {pos_kategori_id}")
        
        # Get Gelir data for POS category
        gelir_query = db.query(
            models.Gelir.Tarih,
            func.sum(models.Gelir.Tutar).label('total_tutar')
        ).filter(
            and_(
                models.Gelir.Sube_ID == sube_id,
                models.Gelir.Kategori_ID == pos_kategori_id,
                models.Gelir.Tarih >= first_day.date(),
                models.Gelir.Tarih <= last_day.date()
            )
        ).group_by(models.Gelir.Tarih)
        
        gelir_records = gelir_query.all()
        logger.info(f"Found {len(gelir_records)} Gelir POS records")
        
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
        
        # Get Gelir data for POS category grouped by date
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
        
        # Create dictionaries for easy lookup
        gelir_dict = {record.Tarih: record.total_tutar for record in gelir_records}
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
            
            # For Kontrol Kesinti: Compare POS Kesinti with actual Odeme value for that date
            # We need to get the actual Odeme value for comparison, not the matched POS total
            actual_odeme_for_date = None
            odeme_records_for_date = [r for r in odeme_records if r.Tarih == date]
            if odeme_records_for_date:
                actual_odeme_for_date = sum(r.Tutar for r in odeme_records_for_date) or Decimal('0')
            
            kontrol_kesinti = None
            if pos_kesinti is not None and actual_odeme_for_date is not None:
                if abs(pos_kesinti - actual_odeme_for_date) <= Decimal('0.01'):
                    kontrol_kesinti = "OK"
                else:
                    kontrol_kesinti = "Not OK"
            elif pos_kesinti is None and actual_odeme_for_date is None:
                kontrol_kesinti = "OK"  # Both are None, considered matching
            elif pos_kesinti is not None or actual_odeme_for_date is not None:
                kontrol_kesinti = "Not OK"  # One is None, the other is not
            
            # For Kontrol Net: Compare POS Net with actual Odeme value for that date
            kontrol_net = None
            if pos_net is not None and actual_odeme_for_date is not None:
                if abs(pos_net - actual_odeme_for_date) <= Decimal('0.01'):
                    kontrol_net = "OK"
                else:
                    kontrol_net = "Not OK"
            elif pos_net is None and actual_odeme_for_date is None:
                kontrol_net = "OK"  # Both are None, considered matching
            elif pos_net is not None or actual_odeme_for_date is not None:
                kontrol_net = "Not OK"  # One is None, the other is not
            
            # Set Odeme_Kesinti and Odeme_Net to actual Odeme values for proper comparison
            actual_odeme_for_date = None
            odeme_records_for_date = [r for r in odeme_records if r.Tarih == date]
            if odeme_records_for_date:
                actual_odeme_for_date = sum(r.Tutar for r in odeme_records_for_date) or Decimal('0')
            
            daily_record = POSKontrolDailyData(
                Tarih=date.strftime('%Y-%m-%d'),
                Gelir_POS=gelir_pos,
                POS_Hareketleri=pos_hareketleri,
                POS_Kesinti=pos_kesinti,
                POS_Net=pos_net,
                Odeme=odeme,  # This is the matched POS transactions total
                Odeme_Kesinti=actual_odeme_for_date,  # Actual Odeme value for comparison
                Odeme_Net=actual_odeme_for_date,  # Actual Odeme value for comparison
                Kontrol_POS=kontrol_pos,
                Kontrol_Kesinti=kontrol_kesinti,
                Kontrol_Net=kontrol_net
            )
            
            daily_data.append(daily_record)
        
        # Calculate success rate
        total_records = len(daily_data)
        if total_records > 0:
            success_rate = f"{(successful_matches / total_records) * 100:.0f}%"
        else:
            success_rate = "0%"
        
        # Create summary
        summary = POSKontrolSummary(
            total_records=total_records,
            successful_matches=successful_matches,
            error_matches=error_matches,
            success_rate=success_rate
        )
        
        # Create response
        response = POSKontrolDashboardResponse(
            data=daily_data,
            summary=summary
        )
        
        logger.info(f"Successfully generated POS Kontrol Dashboard data with {total_records} records, {successful_matches} successful matches, {error_matches} error matches, success rate: {success_rate}")
        return response
        
    except Exception as e:
        logger.error(f"Error in get_pos_kontrol_dashboard_data: {e}")
        # Return empty response on error
        return POSKontrolDashboardResponse(
            data=[],
            summary=POSKontrolSummary(
                total_records=0,
                successful_matches=0,
                error_matches=0,
                success_rate="0%"
            )
        )

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
