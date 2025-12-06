import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import pandas as pd
from io import BytesIO
from backend.main import app
from backend.schemas import pos_hareketleri
from datetime import date, datetime
from decimal import Decimal

client = TestClient(app)

def test_upload_pos_hareketleri_success():
    # Mock the CRUD function
    with patch('backend.api.v1.endpoints.pos_hareketleri.crud.create_pos_hareketleri_bulk') as mock_create_bulk:
        # Set mock return value
        mock_create_bulk.return_value = {"added": 2, "skipped": 0}
        
        # Create a mock Excel file
        data = {
            "Islem_Tarihi": [date(2023, 5, 15), date(2023, 5, 16)],
            "Hesaba_Gecis": [date(2023, 5, 16), date(2023, 5, 17)],
            "Para_Birimi": ["TRY", "USD"],
            "Islem_Tutari": [Decimal("1000.00"), Decimal("500.00")],
            "Kesinti_Tutari": [Decimal("10.00"), Decimal("5.00")],
            "Net_Tutar": [Decimal("990.00"), Decimal("495.00")]
        }
        df = pd.DataFrame(data)
        excel_buffer = BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        # Make the request
        files = {'file': ('test.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        data = {'sube_id': 1}
        response = client.post("/api/v1/pos-hareketleri/upload/", files=files, data=data)
        
        # Assertions
        assert response.status_code == 200
        result = response.json()
        assert result["message"] == "POS transactions file processed successfully."
        assert result["added"] == 2
        assert result["skipped"] == 0

def test_upload_pos_hareketleri_invalid_file_type():
    # Create a mock text file (invalid type)
    text_content = "This is not an Excel file"
    text_buffer = BytesIO(text_content.encode())
    
    # Make the request
    files = {'file': ('test.txt', text_buffer, 'text/plain')}
    data = {'sube_id': 1}
    response = client.post("/api/v1/pos-hareketleri/upload/", files=files, data=data)
    
    # Assertions
    assert response.status_code == 400
    result = response.json()
    assert "Invalid file type" in result["detail"]

def test_upload_pos_hareketleri_empty_file():
    # Mock the CRUD function to return empty result
    with patch('backend.api.v1.endpoints.pos_hareketleri.crud.create_pos_hareketleri_bulk') as mock_create_bulk:
        mock_create_bulk.return_value = {"added": 0, "skipped": 0}
        
        # Create an empty DataFrame
        df = pd.DataFrame()
        excel_buffer = BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        # Make the request
        files = {'file': ('test.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        data = {'sube_id': 1}
        response = client.post("/api/v1/pos-hareketleri/upload/", files=files, data=data)
        
        # Assertions
        assert response.status_code == 200
        result = response.json()
        assert "empty" in result["message"]
        assert result["added"] == 0
        assert result["skipped"] == 0