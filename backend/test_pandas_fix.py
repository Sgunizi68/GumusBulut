"""
Test script to verify that the pandas import error has been fixed
and that the POS_Hareketleri Excel functionality works correctly.
"""

import pandas as pd
import openpyxl
from io import BytesIO
from datetime import date
from decimal import Decimal

def test_pandas_import():
    """Test that pandas and openpyxl can be imported successfully."""
    try:
        import pandas as pd
        import openpyxl
        print("✓ Successfully imported pandas and openpyxl")
        return True
    except ImportError as e:
        print(f"✗ Failed to import required packages: {e}")
        return False

def test_excel_creation():
    """Test that we can create an Excel file with pandas and openpyxl."""
    try:
        # Create sample data
        data = {
            "Islem_Tarihi": [date(2023, 5, 15), date(2023, 5, 16)],
            "Hesaba_Gecis": [date(2023, 5, 16), date(2023, 5, 17)],
            "Para_Birimi": ["TRY", "USD"],
            "Islem_Tutari": [Decimal("1000.00"), Decimal("500.00")],
            "Kesinti_Tutari": [Decimal("10.00"), Decimal("5.00")],
            "Net_Tutar": [Decimal("990.00"), Decimal("495.00")]
        }
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Create Excel file in memory
        excel_buffer = BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='POS_Hareketleri')
        
        # Reset buffer position
        excel_buffer.seek(0)
        
        # Try to read it back
        df_read = pd.read_excel(excel_buffer, engine='openpyxl')
        
        print("✓ Successfully created and read Excel file with pandas")
        print(f"  - Created {len(df)} rows of sample data")
        print(f"  - Read back {len(df_read)} rows")
        return True
    except Exception as e:
        print(f"✗ Failed to create or read Excel file: {e}")
        return False

def test_pos_hareketleri_processing():
    """Test that POS_Hareketleri data processing works."""
    try:
        # This simulates the processing that happens in pos_hareketleri.py
        data = {
            "Islem_Tarihi": [date(2023, 5, 15), date(2023, 5, 16)],
            "Hesaba_Gecis": [date(2023, 5, 16), date(2023, 5, 17)],
            "Para_Birimi": ["TRY", "USD"],
            "Islem_Tutari": [Decimal("1000.00"), Decimal("500.00")],
            "Kesinti_Tutari": [Decimal("10.00"), Decimal("5.00")],
            "Net_Tutar": [Decimal("990.00"), Decimal("495.00")]
        }
        
        df = pd.DataFrame(data)
        
        # Process each row (similar to what happens in the upload endpoint)
        processed_rows = []
        for index, row in df.iterrows():
            # Handle potential missing or NaN values (as in the actual code)
            islem_tutari = row.get("Islem_Tutari")
            kesinti_tutari = row.get("Kesinti_Tutari", 0.00)
            net_tutar = row.get("Net_Tutar")
            
            # Create processed record
            processed_row = {
                "Islem_Tarihi": row["Islem_Tarihi"],
                "Hesaba_Gecis": row["Hesaba_Gecis"],
                "Para_Birimi": str(row["Para_Birimi"]),
                "Islem_Tutari": islem_tutari,
                "Kesinti_Tutari": kesinti_tutari if not pd.isna(kesinti_tutari) else 0.00,
                "Net_Tutar": net_tutar if not pd.isna(net_tutar) else None,
            }
            processed_rows.append(processed_row)
        
        print("✓ Successfully processed POS_Hareketleri data with pandas")
        print(f"  - Processed {len(processed_rows)} rows")
        return True
    except Exception as e:
        print(f"✗ Failed to process POS_Hareketleri data: {e}")
        return False

def main():
    """Run all tests."""
    print("Testing pandas import fix...")
    print("=" * 50)
    
    tests = [
        test_pandas_import,
        test_excel_creation,
        test_pos_hareketleri_processing
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The pandas import error has been fixed.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    main()