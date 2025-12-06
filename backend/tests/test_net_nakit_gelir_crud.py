import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from backend.db import crud
from backend.db import models

def test_get_gelir_toplam():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = 1000.0
    db.query.return_value = mock_query
    
    # Mock the models.Gelir
    with patch('backend.db.crud.models.Gelir', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.year.return_value = Mock()
            mock_func.month.return_value = Mock()
            mock_func.sum.return_value = Mock()
            
            result = crud.get_gelir_toplam(db, sube_id=1, donem=2508)
            
            # Assertions
            assert result == 1000.0
            db.query.assert_called_once()
            mock_query.filter.assert_called_once()

def test_get_gelir_toplam_with_6_digit_donem():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = 1500.0
    db.query.return_value = mock_query
    
    # Mock the models.Gelir
    with patch('backend.db.crud.models.Gelir', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.year.return_value = Mock()
            mock_func.month.return_value = Mock()
            mock_func.sum.return_value = Mock()
            
            result = crud.get_gelir_toplam(db, sube_id=1, donem=202508)
            
            # Assertions
            assert result == 1500.0
            db.query.assert_called_once()
            mock_query.filter.assert_called_once()

def test_get_gelir_toplam_no_result():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result as None
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = None
    db.query.return_value = mock_query
    
    # Mock the models.Gelir
    with patch('backend.db.crud.models.Gelir', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.year.return_value = Mock()
            mock_func.month.return_value = Mock()
            mock_func.sum.return_value = Mock()
            
            result = crud.get_gelir_toplam(db, sube_id=1, donem=2508)
            
            # Assertions
            assert result == 0.0

def test_get_efatura_harcama_toplam():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = 200.0
    db.query.return_value = mock_query
    
    # Mock the models.EFatura
    with patch('backend.db.crud.models.EFatura', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.sum.return_value = Mock()
            
            result = crud.get_efatura_harcama_toplam(db, sube_id=1, donem=2508)
            
            # Assertions
            assert result == 200.0
            db.query.assert_called_once()
            mock_query.filter.assert_called_once()

def test_get_efatura_harcama_toplam_with_6_digit_donem():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = 250.0
    db.query.return_value = mock_query
    
    # Mock the models.EFatura
    with patch('backend.db.crud.models.EFatura', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.sum.return_value = Mock()
            
            result = crud.get_efatura_harcama_toplam(db, sube_id=1, donem=202508)
            
            # Assertions
            assert result == 250.0

def test_get_efatura_harcama_toplam_no_result():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result as None
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = None
    db.query.return_value = mock_query
    
    # Mock the models.EFatura
    with patch('backend.db.crud.models.EFatura', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.sum.return_value = Mock()
            
            result = crud.get_efatura_harcama_toplam(db, sube_id=1, donem=2508)
            
            # Assertions
            assert result == 0.0

def test_get_diger_harcama_toplam():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = 150.0
    db.query.return_value = mock_query
    
    # Mock the models.DigerHarcama
    with patch('backend.db.crud.models.DigerHarcama', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.sum.return_value = Mock()
            
            result = crud.get_diger_harcama_toplam(db, sube_id=1, donem=2508)
            
            # Assertions
            assert result == 150.0
            db.query.assert_called_once()
            mock_query.filter.assert_called_once()

def test_get_diger_harcama_toplam_with_6_digit_donem():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = 175.0
    db.query.return_value = mock_query
    
    # Mock the models.DigerHarcama
    with patch('backend.db.crud.models.DigerHarcama', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.sum.return_value = Mock()
            
            result = crud.get_diger_harcama_toplam(db, sube_id=1, donem=202508)
            
            # Assertions
            assert result == 175.0

def test_get_diger_harcama_toplam_no_result():
    # Mock database session and query
    db = Mock(spec=Session)
    
    # Mock the query result as None
    mock_query = Mock()
    mock_query.filter.return_value.scalar.return_value = None
    db.query.return_value = mock_query
    
    # Mock the models.DigerHarcama
    with patch('backend.db.crud.models.DigerHarcama', Mock()):
        with patch('backend.db.crud.func') as mock_func:
            mock_func.sum.return_value = Mock()
            
            result = crud.get_diger_harcama_toplam(db, sube_id=1, donem=2508)
            
            # Assertions
            assert result == 0.0