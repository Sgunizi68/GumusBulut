#!/usr/bin/env python3
"""
Test script to verify the Kategori_ID fix
"""
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from sqlalchemy.orm import Session
from backend.db.database import SessionLocal
from backend.db import crud, models

def test_fix():
    """Test if the CRUD function now returns Odeme records"""
    db = SessionLocal()
    
    try:
        print("🔍 Testing Kategori_ID fix...")
        
        # Test the fixed CRUD function
        sube_id = 1
        donem = 202508
        
        print(f"Calling get_bankaya_yatan_by_sube_and_donem(sube_id={sube_id}, donem={donem})")
        
        # Call the fixed CRUD function
        bankaya_yatan = crud.get_bankaya_yatan_by_sube_and_donem(db, sube_id=sube_id, donem=donem)
        nakit_girisi = crud.get_nakit_girisi_by_sube_and_donem(db, sube_id=sube_id, donem=donem)
        
        print(f"✅ Found {len(bankaya_yatan)} Bankaya Yatan records")
        print(f"✅ Found {len(nakit_girisi)} Nakit Girişi records")
        
        # Show sample data
        if bankaya_yatan:
            print("\n📊 Sample Bankaya Yatan records:")
            for i, record in enumerate(bankaya_yatan[:3]):  # Show first 3
                print(f"  {i+1}. Date: {record.Tarih}, Amount: {record.Tutar}")
        else:
            print("❌ No Bankaya Yatan records found - the fix may not be working")
            
        if nakit_girisi:
            print("\n📊 Sample Nakit Girişi records:")
            for i, record in enumerate(nakit_girisi[:3]):  # Show first 3
                print(f"  {i+1}. Date: {record.Tarih}, Amount: {record.Tutar}")
                
        # Check if we have Kategori_ID=60 in database
        print("\n🔍 Checking database for Kategori_ID=60...")
        kategori_60 = db.query(models.Kategori).filter(models.Kategori.Kategori_ID == 60).first()
        if kategori_60:
            print(f"✅ Found Kategori_ID=60: {kategori_60.Kategori_Adi}")
        else:
            print("❌ Kategori_ID=60 not found in database")
            
        # Check raw Odeme records
        print("\n🔍 Checking raw Odeme records...")
        odeme_records = db.query(models.Odeme).filter(
            models.Odeme.Donem == donem,
            models.Odeme.Kategori_ID == 60
        ).all()
        print(f"✅ Found {len(odeme_records)} raw Odeme records with Kategori_ID=60")
        
        if len(bankaya_yatan) > 0:
            print("\n🎉 SUCCESS: The fix is working! Odeme records are now being retrieved.")
        else:
            print("\n❌ ISSUE: Still no records returned. May need to check database data.")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_fix()