from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import rol_yetki

router = APIRouter()

@router.post("/rol-yetkileri/", response_model=rol_yetki.RolYetkiInDB, status_code=status.HTTP_201_CREATED)
def assign_role_permission(ry: rol_yetki.RolYetkiCreate, db: Session = Depends(database.get_db)):
    db_ry = crud.get_rol_yetki(db, ry.Rol_ID, ry.Yetki_ID)
    if db_ry:
        raise HTTPException(status_code=400, detail="Role permission assignment already exists")
    return crud.create_rol_yetki(db=db, ry=ry)

@router.get("/rol-yetkileri/", response_model=List[rol_yetki.RolYetkiInDB])
def read_role_permissions(rol_id: int | None = None, skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    rol_yetkileri = crud.get_rol_yetkileri(db, rol_id=rol_id, skip=skip, limit=limit)
    # Enrich with names for display
    enriched_rys = []
    for ry in rol_yetkileri:
        rol = crud.get_rol(db, ry.Rol_ID)
        yetki = crud.get_yetki(db, ry.Yetki_ID)
        enriched_rys.append(rol_yetki.RolYetkiInDB(
            Rol_ID=ry.Rol_ID,
            Yetki_ID=ry.Yetki_ID,
            Aktif_Pasif=ry.Aktif_Pasif,
            Rol_Adi=rol.Rol_Adi if rol else None,
            Yetki_Adi=yetki.Yetki_Adi if yetki else None
        ))
    return enriched_rys

@router.put("/rol-yetkileri/{rol_id}/{yetki_id}", response_model=rol_yetki.RolYetkiInDB)
def update_role_permission_status(rol_id: int, yetki_id: int, aktif_pasif: bool, db: Session = Depends(database.get_db)):
    db_ry = crud.update_rol_yetki_status(db, rol_id, yetki_id, aktif_pasif)
    if db_ry is None:
        raise HTTPException(status_code=404, detail="Role permission assignment not found")
    
    rol = crud.get_rol(db, db_ry.Rol_ID)
    yetki = crud.get_yetki(db, db_ry.Yetki_ID)
    return rol_yetki.RolYetkiInDB(
        Rol_ID=db_ry.Rol_ID,
        Yetki_ID=db_ry.Yetki_ID,
        Aktif_Pasif=db_ry.Aktif_Pasif,
        Rol_Adi=rol.Rol_Adi if rol else None,
        Yetki_Adi=yetki.Yetki_Adi if yetki else None
    )

@router.delete("/rol-yetkileri/{rol_id}/{yetki_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role_permission(rol_id: int, yetki_id: int, db: Session = Depends(database.get_db)):
    db_ry = crud.delete_rol_yetki(db, rol_id, yetki_id)
    if db_ry is None:
        raise HTTPException(status_code=404, detail="Role permission assignment not found")
    return {"message": "Role permission assignment deleted successfully"}
