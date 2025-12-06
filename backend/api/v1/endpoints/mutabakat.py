from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from db.database import get_db
from db import mutabakat_crud
from schemas.mutabakat import Mutabakat, MutabakatUpdate, MutabakatCreate

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/mutabakat", response_model=List[Mutabakat])
def read_mutabakat(db: Session = Depends(get_db)):
    try:
        return mutabakat_crud.get_mutabakat_data(db)
    except Exception as e:
        logger.error(f"Error reading mutabakat data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while reading mutabakat data")

@router.post("/mutabakat", response_model=Mutabakat)
def create_mutabakat_endpoint(mutabakat_data: MutabakatCreate, db: Session = Depends(get_db)):
    try:
        return mutabakat_crud.create_mutabakat(db, mutabakat_data)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating mutabakat: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error while creating mutabakat: {e}")

@router.put("/mutabakat/{mutabakat_id}", response_model=Mutabakat)
def update_mutabakat_endpoint(mutabakat_id: int, mutabakat_data: MutabakatUpdate, db: Session = Depends(get_db)):
    try:
        updated_mutabakat = mutabakat_crud.update_mutabakat(db, mutabakat_id, mutabakat_data)
        if updated_mutabakat is None:
            raise HTTPException(status_code=404, detail="Mutabakat not found")
        return updated_mutabakat
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating mutabakat: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error while updating mutabakat: {e}")

@router.delete("/mutabakat/{mutabakat_id}")
def delete_mutabakat_endpoint(mutabakat_id: int, db: Session = Depends(get_db)):
    try:
        return mutabakat_crud.delete_mutabakat(db, mutabakat_id)
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting mutabakat: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error while deleting mutabakat: {e}")
