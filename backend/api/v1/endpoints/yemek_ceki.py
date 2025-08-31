from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import yemek_ceki

router = APIRouter()

@router.post("/yemek-cekiler/", response_model=yemek_ceki.YemekCekiInDB, status_code=status.HTTP_201_CREATED)
def create_yemek_ceki(yemek_ceki_data: yemek_ceki.YemekCekiCreate, db: Session = Depends(database.get_db)):
    return crud.create_yemek_ceki(db=db, yemek_ceki=yemek_ceki_data)

@router.get("/yemek-cekiler/", response_model=List[yemek_ceki.YemekCekiInDB])
def read_yemek_cekiler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    yemek_cekiler = crud.get_yemek_cekiler(db, skip=skip, limit=limit)
    return yemek_cekiler

@router.get("/yemek-cekiler/{yemek_ceki_id}", response_model=yemek_ceki.YemekCekiInDB)
def read_yemek_ceki(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    db_yemek_ceki = crud.get_yemek_ceki(db, yemek_ceki_id=yemek_ceki_id)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return db_yemek_ceki

@router.put("/yemek-cekiler/{yemek_ceki_id}", response_model=yemek_ceki.YemekCekiInDB)
def update_yemek_ceki(
    yemek_ceki_id: int,
    yemek_ceki_data: yemek_ceki.YemekCekiUpdate,
    db: Session = Depends(database.get_db)
):
    db_yemek_ceki = crud.update_yemek_ceki(db=db, yemek_ceki_id=yemek_ceki_id, yemek_ceki=yemek_ceki_data)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return db_yemek_ceki

@router.delete("/yemek-cekiler/{yemek_ceki_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_yemek_ceki(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    db_yemek_ceki = crud.delete_yemek_ceki(db=db, yemek_ceki_id=yemek_ceki_id)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return {"message": "Yemek Çeki deleted successfully"}