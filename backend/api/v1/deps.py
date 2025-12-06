from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional

from core.config import settings
from db import crud, database, models
from schemas.user import UserInDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

def get_current_user(
    db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)
) -> models.Kullanici:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.Kullanici = Depends(get_current_user),
) -> models.Kullanici:
    if not current_user.Aktif_Pasif:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def check_permission(permission_name: str):
    def permission_checker(
        db: Session = Depends(database.get_db),
        current_user: models.Kullanici = Depends(get_current_active_user)
    ):
        # Get user roles
        user_roles = crud.get_kullanici_rolleri(db, kullanici_id=current_user.Kullanici_ID)
        
        # Check if user has the required permission
        for user_role in user_roles:
            # Get role permissions
            role_permissions = crud.get_rol_yetkileri(db, rol_id=user_role.Rol_ID)
            for role_permission in role_permissions:
                permission = crud.get_yetki(db, role_permission.Yetki_ID)
                if permission and permission.Yetki_Adi == permission_name and role_permission.Aktif_Pasif:
                    return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User does not have the required permission: {permission_name}"
        )
    
    return permission_checker