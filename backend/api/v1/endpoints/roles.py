from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import role

router = APIRouter()

@router.post("/roles/", response_model=role.RolInDB, status_code=status.HTTP_201_CREATED)
@router.post("/roller/", response_model=role.RolInDB, status_code=status.HTTP_201_CREATED)
def create_new_rol(rol: role.RolCreate, db: Session = Depends(database.get_db)):
    db_rol = crud.get_rol_by_name(db, rol_adi=rol.Rol_Adi)
    if db_rol:
        raise HTTPException(status_code=400, detail="Rol with this name already exists")
    return crud.create_rol(db=db, rol=rol)

@router.get("/roles/", response_model=List[role.RolInDB])
@router.get("/roller/", response_model=List[role.RolInDB])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    roller = crud.get_roller(db, skip=skip, limit=limit)
    return roller

@router.get("/roles/{rol_id}", response_model=role.RolInDB)
@router.get("/roller/{rol_id}", response_model=role.RolInDB)
def read_rol(rol_id: int, db: Session = Depends(database.get_db)):
    db_rol = crud.get_rol(db, rol_id=rol_id)
    if db_rol is None:
        raise HTTPException(status_code=404, detail="Rol not found")
    return db_rol

@router.put("/roles/{rol_id}", response_model=role.RolInDB)
@router.put("/roller/{rol_id}", response_model=role.RolInDB)
def update_existing_rol(rol_id: int, rol: role.RolUpdate, db: Session = Depends(database.get_db)):
    db_rol = crud.update_rol(db=db, rol_id=rol_id, rol=rol)
    if db_rol is None:
        raise HTTPException(status_code=404, detail="Rol not found")
    return db_rol

@router.delete("/roles/{rol_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/roller/{rol_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_rol(rol_id: int, db: Session = Depends(database.get_db)):
    db_rol = crud.delete_rol(db=db, rol_id=rol_id)
    if db_rol is None:
        raise HTTPException(status_code=404, detail="Rol not found")
    return {"message": "Rol deleted successfully"}