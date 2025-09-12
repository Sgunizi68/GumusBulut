import pandas as pd
import pytest
from io import BytesIO
from fastapi import HTTPException
import logging

# Mock the schemas and other dependencies for isolated testing
from pydantic import BaseModel, Field
from datetime import date

class POSHareketleriCreate(BaseModel):
    Islem_Tarihi: date
    Hesaba_Gecis: date
    Para_Birimi: str
    Islem_Tutari: float
    Kesinti_Tutari: float = 0.0
    Net_Tutar: float | None = None
    Sube_ID: int

# This is a simplified version of the function from pos_hareketleri.py for testing the logic
async def process_excel_file(file_content: bytes, sube_id: int):
    logger = logging.getLogger(__name__)

    try:
        excel_file = BytesIO(file_content)
        df = pd.read_excel(excel_file, engine='openpyxl')

        if df.empty:
            return {"added": 0, "skipped": 0}

        # --- Robust Column Name Normalization and Mapping ---
        
        def normalize_column_name(col_name):
            name = str(col_name).strip().lower()
            # Consistent character replacement for robust matching
            replacements = {
                'ı': 'i', 'i̇': 'i', 'ş': 's', 'ç': 'c', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 
                '_': ' ', '-': ' '
            }
            for tr_char, en_char in replacements.items():
                name = name.replace(tr_char, en_char)
            # Consolidate whitespace
            return " ".join(name.split())

        df.columns = [normalize_column_name(col) for col in df.columns]

        # Keys in this map are the fully normalized, ASCII-like versions
        column_mapping = {
            'islem tarihi': 'islem_tarihi',
            'hesaba gecis tarihi': 'hesaba_gecis',
            'para birimi': 'para_birimi',
            'islem tutari': 'islem_tutari',
            'kesinti tutari': 'kesinti_tutari',
            'net tutar': 'net_tutar',
            'tarih': 'islem_tarihi',
            'tutar': 'islem_tutari',
            'hesaba gecis': 'hesaba_gecis',
        }

        df.rename(columns=column_mapping, inplace=True)

        # --- Validation and Type Conversion ---
        required_cols = ["islem_tarihi", "hesaba_gecis", "para_birimi", "islem_tutari"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            error_detail = f"Could not find required columns: {', '.join(missing_cols)}. Found: {df.columns.tolist()}"
            raise HTTPException(status_code=400, detail=error_detail)

        df['islem_tarihi'] = pd.to_datetime(df['islem_tarihi'], dayfirst=True, errors='coerce')
        df['hesaba_gecis'] = pd.to_datetime(df['hesaba_gecis'], dayfirst=True, errors='coerce')
        df['islem_tutari'] = pd.to_numeric(df['islem_tutari'], errors='coerce')
        if 'kesinti_tutari' in df.columns:
            df['kesinti_tutari'] = pd.to_numeric(df['kesinti_tutari'], errors='coerce')
        if 'net_tutar' in df.columns:
            df['net_tutar'] = pd.to_numeric(df['net_tutar'], errors='coerce')

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing Excel file: {e}")

    pos_hareketleri_to_create = []
    df.dropna(subset=['islem_tarihi', 'hesaba_gecis', 'para_birimi', 'islem_tutari'], inplace=True)
    
    for index, row in df.iterrows():
        if pd.isna(row.get("islem_tarihi")) or pd.isna(row.get("hesaba_gecis")) or pd.isna(row.get("para_birimi")) or pd.isna(row.get("islem_tutari")):
            continue
        
        pos_hareket_data = POSHareketleriCreate(
            Islem_Tarihi=row["islem_tarihi"],
            Hesaba_Gecis=row["hesaba_gecis"],
            Para_Birimi=str(row["para_birimi"]),
            Islem_Tutari=row["islem_tutari"],
            Kesinti_Tutari=row.get("kesinti_tutari", 0.00) if not pd.isna(row.get("kesinti_tutari")) else 0.00,
            Net_Tutar=row.get("net_tutar") if not pd.isna(row.get("net_tutar")) else None,
            Sube_ID=sube_id,
        )
        pos_hareketleri_to_create.append(pos_hareket_data)
    
    return {"added": len(pos_hareketleri_to_create), "skipped": df.shape[0] - len(pos_hareketleri_to_create)}

# Test function to simulate the user's scenario
@pytest.mark.asyncio
async def test_process_user_specific_excel_format():
    # 1. Create an in-memory Excel file with the user's specific column names
    data = {
        'İşlem Tarihi': ['01.09.2025', '02.09.2025'],
        'Hesaba Geçiş Tarihi': ['03.09.2025', '04.09.2025'],
        'Para_Birimi': ['TRY', 'USD'],
        'İşlem Tutarı': [100.50, 200.00],
        'Kesinti_Tutari': [5.0, 10.0],
        'Net_Tutar': [95.50, 190.00]
    }
    df = pd.DataFrame(data)
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    file_content = output.getvalue()

    # 2. Process the file using the logic from our endpoint
    result = await process_excel_file(file_content, sube_id=1)

    # 3. Assert that the records were processed correctly
    assert result["added"] == 2
    assert result["skipped"] == 0

@pytest.mark.asyncio
async def test_missing_required_column():
    # Create an in-memory Excel file missing a required column
    data = {
        'Hesaba Geçiş Tarihi': ['03.09.2025'],
        'Para_Birimi': ['TRY'],
        'İşlem Tutarı': [100.50]
    }
    df = pd.DataFrame(data)
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    file_content = output.getvalue()

    # Assert that it raises an HTTPException with the correct detail
    with pytest.raises(HTTPException) as excinfo:
        await process_excel_file(file_content, sube_id=1)
    
    assert excinfo.value.status_code == 400
    assert "Could not find required columns: islem_tarihi" in excinfo.value.detail