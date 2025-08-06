from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import calisan

router = APIRouter()

@router.post("/calisanlar/", response_model=calisan.Calisan, status_code=status.HTTP_201_CREATED)
def create_calisan(calisan: calisan.CalisanCreate, db: Session = Depends(database.get_db)):
    return crud.create_calisan(db=db, calisan=calisan)

@router.get("/calisanlar/", response_model=List[calisan.Calisan])
def read_calisanlar(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    print("Request received for /calisanlar/")
    calisanlar = crud.get_calisanlar(db, skip=skip, limit=limit)
    print(f"Returning {len(calisanlar)} calisanlar")
    return calisanlar

@router.get("/calisanlar/{tc_no}", response_model=calisan.Calisan)
def read_calisan(tc_no: str, db: Session = Depends(database.get_db)):
    db_calisan = crud.get_calisan(db, tc_no=tc_no)
    if db_calisan is None:
        raise HTTPException(status_code=404, detail="Calisan not found")
    return db_calisan

@router.put("/calisanlar/{tc_no}", response_model=calisan.Calisan)
def update_calisan(tc_no: str, calisan: calisan.CalisanUpdate, db: Session = Depends(database.get_db)):
    db_calisan = crud.update_calisan(db=db, tc_no=tc_no, calisan=calisan)
    if db_calisan is None:
        raise HTTPException(status_code=404, detail="Calisan not found")
    return db_calisan

@router.delete("/calisanlar/{tc_no}", status_code=status.HTTP_204_NO_CONTENT)
def delete_calisan(tc_no: str, db: Session = Depends(database.get_db)):
    db_calisan = crud.delete_calisan(db=db, tc_no=tc_no)
    if db_calisan is None:
        raise HTTPException(status_code=404, detail="Calisan not found")
    return {"message": "Calisan deleted successfully"}
