"""
Manual test script for POS_Hareketleri upload functionality
"""
import sys
import os
from datetime import date
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock

from db import crud, models
from db.database import Base

def test_duplicate_detection():
    """Test the duplicate detection logic"""
    print("Testing duplicate detection...")
    
    # Setup test database
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test_pos.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    try:
        # Create a test branch
        test_sube = models.Sube(
            Sube_Adi="Test Sube",
            Aciklama="Test branch for POS_Hareketleri upload tests"
        )
        db.add(test_sube)
        db.commit()
        db.refresh(test_sube)
        print(f"Created test branch with ID: {test_sube.Sube_ID}")
        
        # Create a test POS_Hareketleri record
        pos_hareket_data = models.POSHareketleri(
            Islem_Tarihi=date(2023, 1, 1),
            Hesaba_Gecis=date(2023, 1, 2),
            Para_Birimi="TRY",
            Islem_Tutari=100.00,
            Kesinti_Tutari=10.00,
            Net_Tutar=90.00,
            Sube_ID=test_sube.Sube_ID
        )
        db.add(pos_hareket_data)
        db.commit()
        print("Created test POS_Hareketleri record")
        
        # Create a duplicate record (same identifying fields)
        duplicate_data = Mock()
        duplicate_data.Islem_Tarihi = date(2023, 1, 1)
        duplicate_data.Hesaba_Gecis = date(2023, 1, 2)
        duplicate_data.Para_Birimi = "TRY"
        duplicate_data.Islem_Tutari = 100.00
        duplicate_data.Sube_ID = test_sube.Sube_ID
        
        # Check if it's detected as duplicate
        is_duplicate = crud.is_duplicate_pos_hareket(db, duplicate_data)
        print(f"Duplicate detection result: {is_duplicate}")
        assert is_duplicate == True, "Should detect duplicate record"
        
        # Create a non-duplicate record (different Islem_Tutari)
        non_duplicate_data = Mock()
        non_duplicate_data.Islem_Tarihi = date(2023, 1, 1)
        non_duplicate_data.Hesaba_Gecis = date(2023, 1, 2)
        non_duplicate_data.Para_Birimi = "TRY"
        non_duplicate_data.Islem_Tutari = 200.00  # Different amount
        non_duplicate_data.Sube_ID = test_sube.Sube_ID
        
        # Check if it's not detected as duplicate
        is_duplicate = crud.is_duplicate_pos_hareket(db, non_duplicate_data)
        print(f"Non-duplicate detection result: {is_duplicate}")
        assert is_duplicate == False, "Should not detect non-duplicate record"
        
        print("All duplicate detection tests passed!")
        
        # Test bulk creation with duplicates
        print("\nTesting bulk creation with duplicates...")
        
        # Create a list with one duplicate and one new record
        duplicate_data = Mock()
        duplicate_data.Islem_Tarihi = date(2023, 1, 1)
        duplicate_data.Hesaba_Gecis = date(2023, 1, 2)
        duplicate_data.Para_Birimi = "TRY"
        duplicate_data.Islem_Tutari = 100.00
        duplicate_data.Kesinti_Tutari = 10.00
        duplicate_data.Net_Tutar = 90.00
        duplicate_data.Sube_ID = test_sube.Sube_ID
        
        new_data = Mock()
        new_data.Islem_Tarihi = date(2023, 1, 3)
        new_data.Hesaba_Gecis = date(2023, 1, 4)
        new_data.Para_Birimi = "USD"
        new_data.Islem_Tutari = 200.00
        new_data.Kesinti_Tutari = 20.00
        new_data.Net_Tutar = 180.00
        new_data.Sube_ID = test_sube.Sube_ID
        
        pos_hareketleri_list = [duplicate_data, new_data]
        
        # Call bulk creation
        result = crud.create_pos_hareketleri_bulk(db, pos_hareketleri_list)
        print(f"Bulk creation result: {result}")
        
        # Should have added 1 and skipped 1
        assert result["added"] == 1, "Should have added 1 record"
        assert result["skipped"] == 1, "Should have skipped 1 record"
        
        print("Bulk creation with duplicates test passed!")
        
    finally:
        db.close()
        # Clean up test database
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("./test_pos.db"):
            try:
                os.remove("./test_pos.db")
            except:
                print("Could not remove test database file")

if __name__ == "__main__":
    test_duplicate_detection()
    print("\nAll tests passed successfully!")