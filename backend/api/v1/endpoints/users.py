from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import user

router = APIRouter()

@router.post("/users/", response_model=user.UserInDB, status_code=status.HTTP_201_CREATED)
def create_new_user(user: user.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_username(db, username=user.Kullanici_Adi)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this username already exists")
    return crud.create_user(db=db, user=user)

@router.post("/users/register", response_model=user.UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(user_data: user.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_username(db, username=user_data.Kullanici_Adi)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user_data)

@router.get("/users/", response_model=List[user.UserInDB])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/users/{user_id}", response_model=user.UserInDB)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/users/{user_id}", response_model=user.UserInDB)
def update_existing_user(user_id: int, user: user.UserUpdate, db: Session = Depends(database.get_db)):
    db_user = crud.update_user(db=db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = crud.delete_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
