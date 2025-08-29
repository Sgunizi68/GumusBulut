import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from backend.db import crud
from backend.db import models
from backend.schemas import pos_hareketleri
from datetime import date
from decimal import Decimal

def test_get_pos_hareket_by_unique_fields():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Create test data
    pos_hareket_data = pos_hareketleri.POSHareketleriCreate(
        Islem_Tarihi=date(2023, 5, 15),
        Hesaba_Gecis=date(2023, 5, 16),
        Para_Birimi="TRY",
        Islem_Tutari=Decimal("1000.00"),
        Kesinti_Tutari=Decimal("10.00"),
        Net_Tutar=Decimal("990.00"),
        Sube_ID=1
    )
    
    # Mock the query result
    mock_query = Mock()
    mock_filter = Mock()
    mock_first = Mock()
    
    mock_query.filter.return_value = mock_filter
    mock_filter.first.return_value = mock_first
    db.query.return_value = mock_query
    
    # Mock the models.POSHareketleri
    with patch('backend.db.crud.models.POSHareketleri', Mock()):
        result = crud.get_pos_hareket_by_unique_fields(db, pos_hareket_data)
        
        # Assertions
        assert result == mock_first
        db.query.assert_called_once()
        mock_query.filter.assert_called_once()

def test_create_pos_hareketleri_bulk():
    # Mock database session
    db = Mock(spec=Session)
    
    # Create test data
    pos_hareketler_data = [
        pos_hareketleri.POSHareketleriCreate(
            Islem_Tarihi=date(2023, 5, 15),
            Hesaba_Gecis=date(2023, 5, 16),
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("10.00"),
            Net_Tutar=Decimal("990.00"),
            Sube_ID=1
        ),
        pos_hareketleri.POSHareketleriCreate(
            Islem_Tarihi=date(2023, 5, 16),
            Hesaba_Gecis=date(2023, 5, 17),
            Para_Birimi="USD",
            Islem_Tutari=Decimal("500.00"),
            Kesinti_Tutari=Decimal("5.00"),
            Net_Tutar=Decimal("495.00"),
            Sube_ID=1
        )
    ]
    
    # Mock the duplicate check to return None (no duplicates)
    with patch('backend.db.crud.get_pos_hareket_by_unique_fields') as mock_get_by_unique:
        mock_get_by_unique.return_value = None
        
        # Mock the models.POSHareketleri
        mock_pos_hareket = Mock()
        with patch('backend.db.crud.models.POSHareketleri') as mock_model:
            mock_model.return_value = mock_pos_hareket
            
            result = crud.create_pos_hareketleri_bulk(db, pos_hareketler_data)
            
            # Assertions
            assert result["added"] == 2
            assert result["skipped"] == 0
            assert mock_get_by_unique.call_count == 2
            assert mock_model.call_count == 2
            assert db.add.call_count == 2
            db.commit.assert_called_once()

def test_create_pos_hareketleri_bulk_with_duplicates():
    # Mock database session
    db = Mock(spec=Session)
    
    # Create test data
    pos_hareketler_data = [
        pos_hareketleri.POSHareketleriCreate(
            Islem_Tarihi=date(2023, 5, 15),
            Hesaba_Gecis=date(2023, 5, 16),
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("10.00"),
            Net_Tutar=Decimal("990.00"),
            Sube_ID=1
        ),
        pos_hareketleri.POSHareketleriCreate(
            Islem_Tarihi=date(2023, 5, 16),
            Hesaba_Gecis=date(2023, 5, 17),
            Para_Birimi="USD",
            Islem_Tutari=Decimal("500.00"),
            Kesinti_Tutari=Decimal("5.00"),
            Net_Tutar=Decimal("495.00"),
            Sube_ID=1
        )
    ]
    
    # Mock the duplicate check - first record is duplicate, second is not
    with patch('backend.db.crud.get_pos_hareket_by_unique_fields') as mock_get_by_unique:
        mock_get_by_unique.side_effect = [Mock(), None]  # First call returns a duplicate, second returns None
        
        # Mock the models.POSHareketleri
        mock_pos_hareket = Mock()
        with patch('backend.db.crud.models.POSHareketleri') as mock_model:
            mock_model.return_value = mock_pos_hareket
            
            result = crud.create_pos_hareketleri_bulk(db, pos_hareketler_data)
            
            # Assertions
            assert result["added"] == 1
            assert result["skipped"] == 1
            assert mock_get_by_unique.call_count == 2
            assert mock_model.call_count == 1  # Only one record should be added
            assert db.add.call_count == 1
            db.commit.assert_called_once()