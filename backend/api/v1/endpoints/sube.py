from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import sube

router = APIRouter()

@router.post("/subeler/", response_model=sube.SubeInDB, status_code=status.HTTP_201_CREATED)
def create_new_sube(sube: sube.SubeCreate, db: Session = Depends(database.get_db)):
    db_sube = crud.get_sube_by_name(db, sube_adi=sube.Sube_Adi)
    if db_sube:
        raise HTTPException(status_code=400, detail="Sube with this name already exists")
    return crud.create_sube(db=db, sube=sube)

@router.get("/subeler/", response_model=List[sube.SubeInDB])
def read_subeler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    subeler = crud.get_subeler(db, skip=skip, limit=limit)
    return subeler

@router.get("/subeler/{sube_id}", response_model=sube.SubeInDB)
def read_sube(sube_id: int, db: Session = Depends(database.get_db)):
    db_sube = crud.get_sube(db, sube_id=sube_id)
    if db_sube is None:
        raise HTTPException(status_code=404, detail="Sube not found")
    return db_sube

@router.put("/subeler/{sube_id}", response_model=sube.SubeInDB)
def update_existing_sube(sube_id: int, sube: sube.SubeUpdate, db: Session = Depends(database.get_db)):
    db_sube = crud.update_sube(db=db, sube_id=sube_id, sube=sube)
    if db_sube is None:
        raise HTTPException(status_code=404, detail="Sube not found")
    return db_sube

@router.delete("/subeler/{sube_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_sube(sube_id: int, db: Session = Depends(database.get_db)):
    db_sube = crud.delete_sube(db=db, sube_id=sube_id)
    if db_sube is None:
        raise HTTPException(status_code=404, detail="Sube not found")
    return {"message": "Sube deleted successfully"}
