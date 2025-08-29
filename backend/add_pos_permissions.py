#!/usr/bin/env python3
"""
Script to add POS-related permissions and assign them to appropriate roles.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from db import database, models, crud
from schemas import permission, rol_yetki

def add_pos_permissions():
    """Add POS-related permissions and assign them to appropriate roles."""
    
    # Create a database session
    db = database.SessionLocal()
    
    try:
        # Define POS permissions
        pos_permissions = [
            {
                "Yetki_Adi": "pos_read",
                "Aciklama": "View POS transactions",
                "Tip": "Islem"
            },
            {
                "Yetki_Adi": "pos_write",
                "Aciklama": "Create/update/delete POS transactions",
                "Tip": "Islem"
            },
            {
                "Yetki_Adi": "pos_import",
                "Aciklama": "Import POS transactions from files",
                "Tip": "Islem"
            },
            {
                "Yetki_Adi": "pos_export",
                "Aciklama": "Export POS transactions to files",
                "Tip": "Islem"
            }
        ]
        
        permission_ids = []
        
        # Create or get each permission
        for perm_data in pos_permissions:
            existing_permission = crud.get_yetki_by_name(db, perm_data["Yetki_Adi"])
            
            if existing_permission:
                print(f"Permission '{perm_data['Yetki_Adi']}' already exists.")
                permission_ids.append(existing_permission.Yetki_ID)
            else:
                # Create the permission
                yetki_create = permission.YetkiCreate(
                    Yetki_Adi=perm_data["Yetki_Adi"],
                    Aciklama=perm_data["Aciklama"],
                    Tip=perm_data["Tip"],
                    Aktif_Pasif=True
                )
                
                new_permission = crud.create_yetki(db, yetki_create)
                permission_ids.append(new_permission.Yetki_ID)
                print(f"Created permission '{perm_data['Yetki_Adi']}' with ID: {new_permission.Yetki_ID}")
        
        # Get the Muhasebeci role (based on the mock data, it has ID 2)
        muhasebeci_role = crud.get_rol(db, 2)
        
        if not muhasebeci_role:
            print("Muhasebeci role not found!")
            return
        
        # Assign all permissions to the Muhasebeci role
        for permission_id in permission_ids:
            # Check if the permission is already assigned to the Muhasebeci role
            existing_role_permission = db.query(models.RolYetki).filter(
                models.RolYetki.Rol_ID == 2,
                models.RolYetki.Yetki_ID == permission_id
            ).first()
            
            if existing_role_permission:
                print(f"Permission ID {permission_id} is already assigned to Muhasebeci role.")
            else:
                # Assign the permission to the Muhasebeci role
                rol_yetki_create = rol_yetki.RolYetkiCreate(
                    Rol_ID=2,
                    Yetki_ID=permission_id,
                    Aktif_Pasif=True
                )
                
                crud.create_rol_yetki(db, rol_yetki_create)
                print(f"Assigned permission ID {permission_id} to Muhasebeci role.")
        
        # Commit the transaction
        db.commit()
        print("Successfully added POS permissions and assigned them to Muhasebeci role.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_pos_permissions()