from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from db import crud
from schemas import fatura_bolme

router = APIRouter()

@router.get("/bolunmus-faturalar/", response_model=List[fatura_bolme.FaturaBolme])
def read_bolunmus_faturalar(db: Session = Depends(get_db)):
    return crud.get_bolunmus_faturalar(db=db)
