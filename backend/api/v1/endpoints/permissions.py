from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import permission

router = APIRouter()

@router.post("/permissions/", response_model=permission.YetkiInDB, status_code=status.HTTP_201_CREATED)
@router.post("/yetkiler/", response_model=permission.YetkiInDB, status_code=status.HTTP_201_CREATED)
def create_new_yetki(yetki: permission.YetkiCreate, db: Session = Depends(database.get_db)):
    db_yetki = crud.get_yetki_by_name(db, yetki_adi=yetki.Yetki_Adi)
    if db_yetki:
        raise HTTPException(status_code=400, detail="Yetki with this name already exists")
    return crud.create_yetki(db=db, yetki=yetki)

@router.get("/permissions/", response_model=List[permission.YetkiInDB])
@router.get("/yetkiler/", response_model=List[permission.YetkiInDB])
def read_yetkiler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    yetkiler = crud.get_yetkiler(db, skip=skip, limit=limit)
    return yetkiler

@router.get("/permissions/{yetki_id}", response_model=permission.YetkiInDB)
@router.get("/yetkiler/{yetki_id}", response_model=permission.YetkiInDB)
def read_yetki(yetki_id: int, db: Session = Depends(database.get_db)):
    db_yetki = crud.get_yetki(db, yetki_id=yetki_id)
    if db_yetki is None:
        raise HTTPException(status_code=404, detail="Yetki not found")
    return db_yetki

@router.put("/permissions/{yetki_id}", response_model=permission.YetkiInDB)
@router.put("/yetkiler/{yetki_id}", response_model=permission.YetkiInDB)
def update_existing_yetki(yetki_id: int, yetki: permission.YetkiUpdate, db: Session = Depends(database.get_db)):
    db_yetki = crud.update_yetki(db=db, yetki_id=yetki_id, yetki=yetki)
    if db_yetki is None:
        raise HTTPException(status_code=404, detail="Yetki not found")
    return db_yetki

@router.delete("/permissions/{yetki_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/yetkiler/{yetki_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_yetki(yetki_id: int, db: Session = Depends(database.get_db)):
    db_yetki = crud.delete_yetki(db=db, yetki_id=yetki_id)
    if db_yetki is None:
        raise HTTPException(status_code=404, detail="Yetki not found")
    return {"message": "Yetki deleted successfully"}