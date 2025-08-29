import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch
import pandas as pd
from io import BytesIO

from main import app
from db.database import Base
from db import crud, models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test data
@pytest.fixture(scope="module")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create a test branch
    test_sube = models.Sube(
        Sube_Adi="Test Sube",
        Aciklama="Test branch for POS_Hareketleri upload tests"
    )
    db.add(test_sube)
    db.commit()
    db.refresh(test_sube)
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def test_is_duplicate_pos_hareket(test_db):
    """Test the duplicate detection logic"""
    # Create a test POS_Hareketleri record
    pos_hareket_data = models.POSHareketleri(
        Islem_Tarihi="2023-01-01",
        Hesaba_Gecis="2023-01-02",
        Para_Birimi="TRY",
        Islem_Tutari=100.00,
        Kesinti_Tutari=10.00,
        Net_Tutar=90.00,
        Sube_ID=1
    )
    test_db.add(pos_hareket_data)
    test_db.commit()
    
    # Create a duplicate record (same identifying fields)
    duplicate_data = Mock()
    duplicate_data.Islem_Tarihi = "2023-01-01"
    duplicate_data.Hesaba_Gecis = "2023-01-02"
    duplicate_data.Para_Birimi = "TRY"
    duplicate_data.Islem_Tutari = 100.00
    duplicate_data.Sube_ID = 1
    
    # Check if it's detected as duplicate
    assert crud.is_duplicate_pos_hareket(test_db, duplicate_data) == True
    
    # Create a non-duplicate record (different Islem_Tutari)
    non_duplicate_data = Mock()
    non_duplicate_data.Islem_Tarihi = "2023-01-01"
    non_duplicate_data.Hesaba_Gecis = "2023-01-02"
    non_duplicate_data.Para_Birimi = "TRY"
    non_duplicate_data.Islem_Tutari = 200.00  # Different amount
    non_duplicate_data.Sube_ID = 1
    
    # Check if it's not detected as duplicate
    assert crud.is_duplicate_pos_hareket(test_db, non_duplicate_data) == False

def test_create_pos_hareket_duplicate(test_db):
    """Test that duplicate records are not created"""
    # Create a test POS_Hareketleri record
    pos_hareket_data = models.POSHareketleri(
        Islem_Tarihi="2023-01-01",
        Hesaba_Gecis="2023-01-02",
        Para_Birimi="TRY",
        Islem_Tutari=100.00,
        Kesinti_Tutari=10.00,
        Net_Tutar=90.00,
        Sube_ID=1
    )
    test_db.add(pos_hareket_data)
    test_db.commit()
    
    # Try to create a duplicate using CRUD function
    duplicate_create_data = Mock()
    duplicate_create_data.Islem_Tarihi = "2023-01-01"
    duplicate_create_data.Hesaba_Gecis = "2023-01-02"
    duplicate_create_data.Para_Birimi = "TRY"
    duplicate_create_data.Islem_Tutari = 100.00
    duplicate_create_data.Kesinti_Tutari = 10.00
    duplicate_create_data.Net_Tutar = 90.00
    duplicate_create_data.Sube_ID = 1
    
    # Should return None for duplicate
    result = crud.create_pos_hareket(test_db, duplicate_create_data)
    assert result is None

@patch("api.v1.endpoints.pos_hareketleri.pd.read_excel")
def test_upload_pos_hareketleri_endpoint(mock_read_excel, client, test_db):
    """Test the POS_Hareketleri upload endpoint"""
    # Create mock Excel data
    mock_df = pd.DataFrame({
        'Islem_Tarihi': ['2023-01-01', '2023-01-02'],
        'Hesaba_Gecis': ['2023-01-02', '2023-01-03'],
        'Para_Birimi': ['TRY', 'USD'],
        'Islem_Tutari': [100.00, 200.00],
        'Kesinti_Tutari': [10.00, 20.00],
        'Net_Tutar': [90.00, 180.00]
    })
    mock_read_excel.return_value = mock_df
    
    # Create a mock file
    mock_file = Mock()
    mock_file.filename = "test.xlsx"
    mock_file.read = Mock(return_value=b"fake excel content")
    
    # Mock the database dependency
    with patch("api.v1.endpoints.pos_hareketleri.database.get_db", return_value=test_db):
        # Make request to upload endpoint
        response = client.post(
            "/api/v1/pos-hareketleri/upload/",
            data={"sube_id": 1},
            files={"file": ("test.xlsx", mock_file.read(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "added" in data
    assert "skipped" in data

def test_create_pos_hareketleri_bulk_with_duplicates(test_db):
    """Test bulk creation with duplicates"""
    # Create a test POS_Hareketleri record
    pos_hareket_data = models.POSHareketleri(
        Islem_Tarihi="2023-01-01",
        Hesaba_Gecis="2023-01-02",
        Para_Birimi="TRY",
        Islem_Tutari=100.00,
        Kesinti_Tutari=10.00,
        Net_Tutar=90.00,
        Sube_ID=1
    )
    test_db.add(pos_hareket_data)
    test_db.commit()
    
    # Create a list with one duplicate and one new record
    duplicate_data = Mock()
    duplicate_data.Islem_Tarihi = "2023-01-01"
    duplicate_data.Hesaba_Gecis = "2023-01-02"
    duplicate_data.Para_Birimi = "TRY"
    duplicate_data.Islem_Tutari = 100.00
    duplicate_data.Kesinti_Tutari = 10.00
    duplicate_data.Net_Tutar = 90.00
    duplicate_data.Sube_ID = 1
    
    new_data = Mock()
    new_data.Islem_Tarihi = "2023-01-03"
    new_data.Hesaba_Gecis = "2023-01-04"
    new_data.Para_Birimi = "USD"
    new_data.Islem_Tutari = 200.00
    new_data.Kesinti_Tutari = 20.00
    new_data.Net_Tutar = 180.00
    new_data.Sube_ID = 1
    
    pos_hareketleri_list = [duplicate_data, new_data]
    
    # Call bulk creation
    result = crud.create_pos_hareketleri_bulk(test_db, pos_hareketleri_list)
    
    # Should have added 1 and skipped 1
    assert result["added"] == 1
    assert result["skipped"] == 1