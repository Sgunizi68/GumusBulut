from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import b2b_ekstre

router = APIRouter()

@router.post("/b2b-ekstreler/", response_model=b2b_ekstre.B2BEkstreInDB, status_code=status.HTTP_201_CREATED)
def create_new_b2b_ekstre(ekstre: b2b_ekstre.B2BEkstreCreate, db: Session = Depends(database.get_db)):
    return crud.create_b2b_ekstre(db=db, ekstre=ekstre)

@router.get("/b2b-ekstreler/", response_model=List[b2b_ekstre.B2BEkstreInDB])
def read_b2b_ekstreler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    ekstreler = crud.get_b2b_ekstreler(db, skip=skip, limit=limit)
    return ekstreler

@router.get("/b2b-ekstreler/{ekstre_id}", response_model=b2b_ekstre.B2BEkstreInDB)
def read_b2b_ekstre(ekstre_id: int, db: Session = Depends(database.get_db)):
    db_ekstre = crud.get_b2b_ekstre(db, ekstre_id=ekstre_id)
    if db_ekstre is None:
        raise HTTPException(status_code=404, detail="B2B Ekstre not found")
    return db_ekstre

@router.put("/b2b-ekstreler/{ekstre_id}", response_model=b2b_ekstre.B2BEkstreInDB)
def update_existing_b2b_ekstre(ekstre_id: int, ekstre: b2b_ekstre.B2BEkstreUpdate, db: Session = Depends(database.get_db)):
    db_ekstre = crud.update_b2b_ekstre(db=db, ekstre_id=ekstre_id, ekstre=ekstre)
    if db_ekstre is None:
        raise HTTPException(status_code=404, detail="B2B Ekstre not found")
    return db_ekstre

@router.delete("/b2b-ekstreler/{ekstre_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_b2b_ekstre(ekstre_id: int, db: Session = Depends(database.get_db)):
    db_ekstre = crud.delete_b2b_ekstre(db=db, ekstre_id=ekstre_id)
    if db_ekstre is None:
        raise HTTPException(status_code=404, detail="B2B Ekstre not found")
    return {"message": "B2B Ekstre deleted successfully"}
