#!/usr/bin/env python3
"""
Script to add the missing B2B Ekstre Rapor permission and assign it to the Muhasebeci role.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from db import database, models, crud
from schemas import permission, rol_yetki

def add_b2b_ekstre_rapor_permission():
    """Add the B2B Ekstre Rapor permission and assign it to the Muhasebeci role."""
    
    # Create a database session
    db = database.SessionLocal()
    
    try:
        # Check if the permission already exists
        existing_permission = crud.get_yetki_by_name(db, "B2B Ekstre Rapor Görüntüleme")
        
        if existing_permission:
            print("Permission 'B2B Ekstre Rapor Görüntüleme' already exists.")
            permission_id = existing_permission.Yetki_ID
        else:
            # Create the permission
            yetki_create = permission.YetkiCreate(
                Yetki_Adi="B2B Ekstre Rapor Görüntüleme",
                Aciklama="B2B Ekstre Raporunu görüntüleme yetkisi",
                Tip="Ekran",
                Aktif_Pasif=True
            )
            
            new_permission = crud.create_yetki(db, yetki_create)
            permission_id = new_permission.Yetki_ID
            print(f"Created permission 'B2B Ekstre Rapor Görüntüleme' with ID: {permission_id}")
        
        # Get the Muhasebeci role (based on the mock data, it has ID 2)
        muhasebeci_role = crud.get_rol(db, 2)
        
        if not muhasebeci_role:
            print("Muhasebeci role not found!")
            return
        
        # Check if the permission is already assigned to the Muhasebeci role
        existing_role_permission = db.query(models.RolYetki).filter(
            models.RolYetki.Rol_ID == 2,
            models.RolYetki.Yetki_ID == permission_id
        ).first()
        
        if existing_role_permission:
            print("Permission is already assigned to Muhasebeci role.")
        else:
            # Assign the permission to the Muhasebeci role
            rol_yetki_create = rol_yetki.RolYetkiCreate(
                Rol_ID=2,
                Yetki_ID=permission_id,
                Aktif_Pasif=True
            )
            
            crud.create_rol_yetki(db, rol_yetki_create)
            print("Assigned permission to Muhasebeci role.")
        
        # Commit the transaction
        db.commit()
        print("Successfully added B2B Ekstre Rapor permission and assigned it to Muhasebeci role.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_b2b_ekstre_rapor_permission()