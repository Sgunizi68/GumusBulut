from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import kullanici_rol

router = APIRouter()

@router.post("/kullanici-rolleri/", response_model=kullanici_rol.KullaniciRolInDB, status_code=status.HTTP_201_CREATED)
def assign_user_role(kr: kullanici_rol.KullaniciRolCreate, db: Session = Depends(database.get_db)):
    db_kr = crud.get_kullanici_rol(db, kr.Kullanici_ID, kr.Rol_ID, kr.Sube_ID)
    if db_kr:
        raise HTTPException(status_code=400, detail="User role assignment already exists")
    return crud.create_kullanici_rol(db=db, kr=kr)

@router.get("/kullanici-rolleri/", response_model=List[kullanici_rol.KullaniciRolInDB])
def read_user_roles(kullanici_id: int | None = None, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    kullanici_rolleri = crud.get_kullanici_rolleri(db, kullanici_id=kullanici_id, skip=skip, limit=limit)
    # Enrich with names for display
    enriched_krs = []
    for kr in kullanici_rolleri:
        kullanici = crud.get_user(db, kr.Kullanici_ID)
        rol = crud.get_rol(db, kr.Rol_ID)
        sube = crud.get_sube(db, kr.Sube_ID)
        enriched_krs.append(kullanici_rol.KullaniciRolInDB(
            Kullanici_ID=kr.Kullanici_ID,
            Rol_ID=kr.Rol_ID,
            Sube_ID=kr.Sube_ID,
            Aktif_Pasif=kr.Aktif_Pasif,
            Kullanici_Adi=kullanici.Adi_Soyadi if kullanici else None,
            Rol_Adi=rol.Rol_Adi if rol else None,
            Sube_Adi=sube.Sube_Adi if sube else None
        ))
    return enriched_krs

@router.put("/kullanici-rolleri/{kullanici_id}/{rol_id}/{sube_id}", response_model=kullanici_rol.KullaniciRolInDB)
def update_user_role_status(kullanici_id: int, rol_id: int, sube_id: int, aktif_pasif: bool, db: Session = Depends(database.get_db)):
    db_kr = crud.update_kullanici_rol_status(db, kullanici_id, rol_id, sube_id, aktif_pasif)
    if db_kr is None:
        raise HTTPException(status_code=404, detail="User role assignment not found")
    
    kullanici = crud.get_user(db, db_kr.Kullanici_ID)
    rol = crud.get_rol(db, db_kr.Rol_ID)
    sube = crud.get_sube(db, db_kr.Sube_ID)
    return kullanici_rol.KullaniciRolInDB(
        Kullanici_ID=db_kr.Kullanici_ID,
        Rol_ID=db_kr.Rol_ID,
        Sube_ID=db_kr.Sube_ID,
        Aktif_Pasif=db_kr.Aktif_Pasif,
        Kullanici_Adi=kullanici.Adi_Soyadi if kullanici else None,
        Rol_Adi=rol.Rol_Adi if rol else None,
        Sube_Adi=sube.Sube_Adi if sube else None
    )

@router.delete("/kullanici-rolleri/{kullanici_id}/{rol_id}/{sube_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_role(kullanici_id: int, rol_id: int, sube_id: int, db: Session = Depends(database.get_db)):
    db_kr = crud.delete_kullanici_rol(db, kullanici_id, rol_id, sube_id)
    if db_kr is None:
        raise HTTPException(status_code=404, detail="User role assignment not found")
    return {"message": "User role assignment deleted successfully"}
