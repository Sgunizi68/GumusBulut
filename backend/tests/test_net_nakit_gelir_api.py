import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from backend.main import app
from backend.schemas.report import NetNakitGelirResponse

client = TestClient(app)

def test_get_net_nakit_gelir_success():
    # Mock the CRUD functions
    with patch('backend.api.v1.endpoints.report.crud.get_gelir_toplam') as mock_gelir, \
         patch('backend.api.v1.endpoints.report.crud.get_efatura_harcama_toplam') as mock_efatura, \
         patch('backend.api.v1.endpoints.report.crud.get_diger_harcama_toplam') as mock_diger:
        
        # Set mock return values
        mock_gelir.return_value = 1000.0
        mock_efatura.return_value = 200.0
        mock_diger.return_value = 150.0
        
        # Make the request
        response = client.get("/api/v1/report/net-nakit-gelir/1/2508")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["gelir_toplam"] == 1000.0
        assert data["efatura_harcama_toplam"] == 200.0
        assert data["diger_harcama_toplam"] == 150.0
        assert data["net_nakit_gelir"] == 650.0  # 1000 - 200 - 150

def test_get_net_nakit_gelir_with_6_digit_donem():
    # Mock the CRUD functions
    with patch('backend.api.v1.endpoints.report.crud.get_gelir_toplam') as mock_gelir, \
         patch('backend.api.v1.endpoints.report.crud.get_efatura_harcama_toplam') as mock_efatura, \
         patch('backend.api.v1.endpoints.report.crud.get_diger_harcama_toplam') as mock_diger:
        
        # Set mock return values
        mock_gelir.return_value = 1500.0
        mock_efatura.return_value = 250.0
        mock_diger.return_value = 175.0
        
        # Make the request
        response = client.get("/api/v1/report/net-nakit-gelir/1/202508")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["gelir_toplam"] == 1500.0
        assert data["efatura_harcama_toplam"] == 250.0
        assert data["diger_harcama_toplam"] == 175.0
        assert data["net_nakit_gelir"] == 1075.0  # 1500 - 250 - 175

def test_get_net_nakit_gelir_invalid_sube_id():
    # Make the request with invalid sube_id
    response = client.get("/api/v1/report/net-nakit-gelir/0/2508")
    
    # Assertions
    assert response.status_code == 400
    assert "Invalid sube_id" in response.json()["detail"]

def test_get_net_nakit_gelir_invalid_donem():
    # Make the request with invalid donem
    response = client.get("/api/v1/report/net-nakit-gelir/1/123")
    
    # Assertions
    assert response.status_code == 400
    assert "Invalid donem format" in response.json()["detail"]

def test_get_net_nakit_gelir_crud_exception():
    # Mock the CRUD functions to raise an exception
    with patch('backend.api.v1.endpoints.report.crud.get_gelir_toplam') as mock_gelir:
        mock_gelir.side_effect = Exception("Database error")
        
        # Make the request
        response = client.get("/api/v1/report/net-nakit-gelir/1/2508")
        
        # Assertions
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"]