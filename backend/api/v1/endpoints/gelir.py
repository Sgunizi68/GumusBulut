from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
import logging

from db import crud, database, models
from schemas import gelir
from api.v1 import deps

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/gelirler/", response_model=gelir.GelirInDB, status_code=status.HTTP_201_CREATED)
def create_gelir(gelir: gelir.GelirCreate, db: Session = Depends(database.get_db)):
    return crud.create_gelir(db=db, gelir=gelir)

@router.get("/gelirler/", response_model=List[gelir.GelirInDB])
def read_gelirler(skip: int = 0, limit: int | None = None, db: Session = Depends(database.get_db)):
    gelirler = crud.get_gelirler(db, skip=skip, limit=limit)
    return gelirler

@router.get("/gelirler/{gelir_id}", response_model=gelir.GelirInDB)
def read_gelir(gelir_id: int, db: Session = Depends(database.get_db)):
    db_gelir = crud.get_gelir(db, gelir_id=gelir_id)
    if db_gelir is None:
        raise HTTPException(status_code=404, detail="Gelir not found")
    return db_gelir

@router.put("/gelirler/{gelir_id}", response_model=gelir.GelirInDB)
def update_gelir(gelir_id: int, gelir: gelir.GelirUpdate, db: Session = Depends(database.get_db), current_user: models.Kullanici = Depends(deps.get_current_active_user)):
    db_gelir = crud.update_gelir(db=db, gelir_id=gelir_id, gelir=gelir, current_user=current_user)
    if db_gelir is None:
        raise HTTPException(status_code=404, detail="Gelir not found")
    return db_gelir

@router.delete("/gelirler/{gelir_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gelir(gelir_id: int, db: Session = Depends(database.get_db)):
    db_gelir = crud.delete_gelir(db=db, gelir_id=gelir_id)
    if db_gelir is None:
        raise HTTPException(status_code=404, detail="Gelir not found")
    return {"message": "Gelir deleted successfully"}

@router.get("/gelir/nakit-tahmin", response_model=List[gelir.GelirInDB])
def get_nakit_tahmin(
    start_date: date,
    end_date: date,
    sube_id: int,
    db: Session = Depends(database.get_db)
):
    logger.info(f"get_nakit_tahmin called with start_date: {start_date}, end_date: {end_date}, sube_id: {sube_id}")
    query_start_date = start_date - timedelta(days=28)
    query_end_date = end_date - timedelta(days=28)
    logger.info(f"Querying for dates: {query_start_date} to {query_end_date}")
    
    result = crud.get_nakit_gelir_by_date_range(
        db=db,
        start_date=query_start_date,
        end_date=query_end_date,
        sube_id=sube_id
    )
    logger.info(f"Found {len(result)} records.")
    return result