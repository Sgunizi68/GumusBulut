#!/usr/bin/env python3
"""
Script to verify that the B2B Ekstre Rapor permission is properly assigned to the Muhasebeci role.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from db import database, models, crud
from schemas import permission, rol_yetki

def verify_b2b_ekstre_rapor_permission():
    """Verify that the B2B Ekstre Rapor permission is properly assigned to the Muhasebeci role."""
    
    # Create a database session
    db = database.SessionLocal()
    
    try:
        # Check if the permission exists
        existing_permission = crud.get_yetki_by_name(db, "B2B Ekstre Rapor Görüntüleme")
        
        if not existing_permission:
            print("Permission 'B2B Ekstre Rapor Görüntüleme' does not exist!")
            return
        
        print(f"Permission 'B2B Ekstre Rapor Görüntüleme' exists with ID: {existing_permission.Yetki_ID}")
        
        # Get the Muhasebeci role (based on the mock data, it has ID 2)
        muhasebeci_role = crud.get_rol(db, 2)
        
        if not muhasebeci_role:
            print("Muhasebeci role not found!")
            return
        
        print(f"Muhasebeci role exists with ID: {muhasebeci_role.Rol_ID} and name: {muhasebeci_role.Rol_Adi}")
        
        # Check if the permission is assigned to the Muhasebeci role
        existing_role_permission = db.query(models.RolYetki).filter(
            models.RolYetki.Rol_ID == 2,
            models.RolYetki.Yetki_ID == existing_permission.Yetki_ID
        ).first()
        
        if existing_role_permission:
            print("Permission is assigned to Muhasebeci role.")
            print(f"Role-Permission assignment details:")
            print(f"  Rol_ID: {existing_role_permission.Rol_ID}")
            print(f"  Yetki_ID: {existing_role_permission.Yetki_ID}")
            print(f"  Aktif_Pasif: {existing_role_permission.Aktif_Pasif}")
        else:
            print("Permission is NOT assigned to Muhasebeci role!")
        
        # List all permissions assigned to the Muhasebeci role
        print("\nAll permissions assigned to Muhasebeci role:")
        role_permissions = db.query(models.RolYetki).filter(
            models.RolYetki.Rol_ID == 2
        ).all()
        
        for rp in role_permissions:
            yetki = crud.get_yetki(db, rp.Yetki_ID)
            if yetki:
                print(f"  - {yetki.Yetki_Adi} (ID: {yetki.Yetki_ID})")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_b2b_ekstre_rapor_permission()