from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database
from schemas import e_fatura

router = APIRouter()

@router.post("/e-faturalar/", response_model=e_fatura.EFaturaBulkResponse, status_code=status.HTTP_201_CREATED)
def create_bulk_efatura(efaturas: List[e_fatura.EFaturaCreate], db: Session = Depends(database.get_db)):
    if not efaturas:
        raise HTTPException(status_code=400, detail="No invoices provided")
    return crud.create_efaturas_bulk(db=db, efaturas=efaturas)

@router.post("/e-fatura/", response_model=e_fatura.EFaturaInDB, status_code=status.HTTP_201_CREATED)
def create_single_efatura(efatura: e_fatura.EFaturaCreate, db: Session = Depends(database.get_db)):
    return crud.create_efatura(db=db, efatura=efatura)

@router.get("/e-faturalar/", response_model=List[e_fatura.EFaturaInDB])
def read_efaturalar(db: Session = Depends(database.get_db)):
    efaturalar = crud.get_efaturalar(db)
    return efaturalar

@router.get("/e-faturalar/{efatura_id}", response_model=e_fatura.EFaturaInDB)
def read_efatura(efatura_id: int, db: Session = Depends(database.get_db)):
    db_efatura = crud.get_efatura(db, efatura_id=efatura_id)
    if db_efatura is None:
        raise HTTPException(status_code=404, detail="EFatura not found")
    return db_efatura

@router.get("/e-faturalar/fatura-no/{fatura_numarasi}", response_model=e_fatura.EFaturaInDB)
def read_efatura_by_fatura_numarasi(fatura_numarasi: str, db: Session = Depends(database.get_db)):
    db_efatura = crud.get_efatura_by_fatura_numarasi(db, fatura_numarasi=fatura_numarasi)
    if db_efatura is None:
        raise HTTPException(status_code=404, detail="EFatura not found")
    return db_efatura

@router.put("/e-faturalar/{efatura_id}", response_model=e_fatura.EFaturaInDB)
def update_existing_efatura(efatura_id: int, efatura: e_fatura.EFaturaUpdate, db: Session = Depends(database.get_db)):
    db_efatura = crud.update_efatura(db=db, efatura_id=efatura_id, efatura=efatura)
    if db_efatura is None:
        raise HTTPException(status_code=404, detail="EFatura not found")
    return db_efatura

@router.delete("/e-faturalar/{efatura_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_efatura(efatura_id: int, db: Session = Depends(database.get_db)):
    db_efatura = crud.delete_efatura(db=db, efatura_id=efatura_id)
    if db_efatura is None:
        raise HTTPException(status_code=404, detail="EFatura not found")
    return {"message": "EFatura deleted successfully"}
