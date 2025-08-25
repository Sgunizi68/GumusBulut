#!/usr/bin/env python3
"""
Script to seed test data for Nakit Yatırma Kontrol Raporu
Creates test data for Kategori_ID=60 (Bankaya Yatan) and Nakit entries
"""

import sys
import os
from datetime import date, datetime
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from db import models

def create_test_category(db: Session):
    """Create Kategori_ID=60 if it doesn't exist"""
    existing_category = db.query(models.Kategori).filter(models.Kategori.Kategori_ID == 60).first()
    
    if not existing_category:
        print("Creating Kategori_ID=60 'Bankaya Yatan'...")
        # Create the category directly in the database
        category = models.Kategori(
            Kategori_ID=60,
            Kategori_Adi="Bankaya Yatan",
            Tip="Ödeme",
            Aktif_Pasif=True,
            Gizli=False
        )
        db.add(category)
        db.commit()
        print("✓ Created Kategori_ID=60")
    else:
        print("✓ Kategori_ID=60 already exists")

def create_test_odeme_data(db: Session):
    """Create test Odeme records with Kategori_ID=60"""
    print("Creating test Odeme (Bankaya Yatan) data...")
    
    test_odeme_data = [
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 22),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("3000.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 21),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("9400.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 20),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("13600.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 19),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("5600.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 18),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("3300.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 17),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("9900.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tip": "Bankaya Yatan",
            "Hesap_Adi": "Ana Hesap",
            "Tarih": date(2025, 8, 16),
            "Aciklama": "Nakit Yatırma",
            "Tutar": Decimal("10100.00"),
            "Kategori_ID": 60,
            "Donem": 2508,
            "Sube_ID": 1
        }
    ]
    
    added_count = 0
    for data in test_odeme_data:
        # Check if record already exists
        existing = db.query(models.Odeme).filter(
            models.Odeme.Tarih == data["Tarih"],
            models.Odeme.Tutar == data["Tutar"],
            models.Odeme.Kategori_ID == 60,
            models.Odeme.Sube_ID == data["Sube_ID"]
        ).first()
        
        if not existing:
            odeme = models.Odeme(**data)
            db.add(odeme)
            added_count += 1
    
    db.commit()
    print(f"✓ Added {added_count} Odeme records")

def create_test_nakit_data(db: Session):
    """Create test Nakit records"""
    print("Creating test Nakit (Nakit Girişi) data...")
    
    test_nakit_data = [
        {
            "Tarih": date(2025, 8, 22),
            "Tutar": Decimal("3000.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tarih": date(2025, 8, 21),
            "Tutar": Decimal("9400.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tarih": date(2025, 8, 20),
            "Tutar": Decimal("12800.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tarih": date(2025, 8, 19),
            "Tutar": Decimal("5600.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tarih": date(2025, 8, 18),
            "Tutar": Decimal("4100.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tarih": date(2025, 8, 17),
            "Tutar": Decimal("9900.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        },
        {
            "Tarih": date(2025, 8, 15),
            "Tutar": Decimal("8500.00"),
            "Tip": "Bankaya Yatan",
            "Donem": 2508,
            "Sube_ID": 1
        }
    ]
    
    added_count = 0
    for data in test_nakit_data:
        # Check if record already exists
        existing = db.query(models.Nakit).filter(
            models.Nakit.Tarih == data["Tarih"],
            models.Nakit.Tutar == data["Tutar"],
            models.Nakit.Sube_ID == data["Sube_ID"],
            models.Nakit.Donem == data["Donem"]
        ).first()
        
        if not existing:
            nakit = models.Nakit(**data)
            db.add(nakit)
            added_count += 1
    
    db.commit()
    print(f"✓ Added {added_count} Nakit records")

def ensure_sube_exists(db: Session):
    """Ensure Sube_ID=1 exists"""
    existing_sube = db.query(models.Sube).filter(models.Sube.Sube_ID == 1).first()
    
    if not existing_sube:
        print("Creating Sube_ID=1 'Brandium'...")
        sube = models.Sube(
            Sube_ID=1,
            Sube_Adi="Brandium",
            Aciklama="Test Branch for Nakit Yatırma Raporu",
            Aktif_Pasif=True
        )
        db.add(sube)
        db.commit()
        print("✓ Created Sube_ID=1")
    else:
        print("✓ Sube_ID=1 already exists")

def main():
    """Main function to seed test data"""
    print("🌱 Seeding test data for Nakit Yatırma Kontrol Raporu...")
    
    db = SessionLocal()
    try:
        # Ensure branch exists
        ensure_sube_exists(db)
        
        # Create test category
        create_test_category(db)
        
        # Create test data
        create_test_odeme_data(db)
        create_test_nakit_data(db)
        
        print("\n✅ Test data seeding completed successfully!")
        print("\n📊 Summary:")
        
        # Show counts
        odeme_count = db.query(models.Odeme).filter(
            models.Odeme.Kategori_ID == 60,
            models.Odeme.Donem == 202508,
            models.Odeme.Sube_ID == 1
        ).count()
        
        nakit_count = db.query(models.Nakit).filter(
            models.Nakit.Donem == 202508,
            models.Nakit.Sube_ID == 1
        ).count()
        
        print(f"- Bankaya Yatan (Odeme) records: {odeme_count}")
        print(f"- Nakit Girişi records: {nakit_count}")
        
        # Show totals
        odeme_total = db.query(models.Odeme).filter(
            models.Odeme.Kategori_ID == 60,
            models.Odeme.Donem == 2508,
            models.Odeme.Sube_ID == 1
        ).all()
        
        nakit_total = db.query(models.Nakit).filter(
            models.Nakit.Donem == 202508,
            models.Nakit.Sube_ID == 1
        ).all()
        
        if odeme_total:
            total_odeme = sum(float(record.Tutar) for record in odeme_total)
            print(f"- Total Bankaya Yatan: {total_odeme:,.2f} TL")
        
        if nakit_total:
            total_nakit = sum(float(record.Tutar) for record in nakit_total)
            print(f"- Total Nakit Girişi: {total_nakit:,.2f} TL")
            
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()