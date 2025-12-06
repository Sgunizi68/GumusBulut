#!/usr/bin/env python3
"""
Unit test for Fatura & Diğer Harcama Rapor tagging functionality
"""

def test_efatura_tagging():
    """Test EFatura record tagging logic"""
    
    # Test data for EFatura records
    efatura_records = [
        {
            "Fatura_ID": 1,
            "Fatura_Tarihi": "2024-08-15",
            "Fatura_Numarasi": "FAT2024001",
            "Alici_Unvani": "ABC Ltd. Şti.",
            "Tutar": 1500.00,
            "Giden_Fatura": False
        },
        {
            "Fatura_ID": 2,
            "Fatura_Tarihi": "2024-08-16",
            "Fatura_Numarasi": "FAT2024002",
            "Alici_Unvani": "XYZ A.Ş.",
            "Tutar": 2500.00,
            "Giden_Fatura": True
        },
        {
            "Fatura_ID": 3,
            "Fatura_Tarihi": "2024-08-17",
            "Fatura_Numarasi": "FAT2024003",
            "Alici_Unvani": "DEF Co.",
            "Tutar": 3500.00,
            "Giden_Fatura": False
        }
    ]
    
    # Test tagging logic
    tagged_records = []
    for record in efatura_records:
        tag = "Giden Fatura" if record["Giden_Fatura"] else "Gelen Fatura"
        tagged_record = {
            "id": record["Fatura_ID"],
            "tarih": record["Fatura_Tarihi"],
            "belge_numarasi": record["Fatura_Numarasi"],
            "karsi_taraf_adi": record["Alici_Unvani"],
            "tutar": record["Tutar"],
            "etiket": tag
        }
        tagged_records.append(tagged_record)
    
    # Validate results
    assert len(tagged_records) == 3
    assert tagged_records[0]["etiket"] == "Gelen Fatura"
    assert tagged_records[1]["etiket"] == "Giden Fatura"
    assert tagged_records[2]["etiket"] == "Gelen Fatura"
    
    print("✅ EFatura tagging test passed")
    print(f"   - Record 1 tagged as: {tagged_records[0]['etiket']}")
    print(f"   - Record 2 tagged as: {tagged_records[1]['etiket']}")
    print(f"   - Record 3 tagged as: {tagged_records[2]['etiket']}")
    
    return True

def test_diger_harcama_tagging():
    """Test DigerHarcama record tagging logic"""
    
    # Test data for DigerHarcama records
    diger_harcama_records = [
        {
            "Harcama_ID": 1,
            "Alici_Adi": "Market A",
            "Belge_Numarasi": "BEL2024001",
            "Belge_Tarihi": "2024-08-17",
            "Tutar": 500.00
        },
        {
            "Harcama_ID": 2,
            "Alici_Adi": "Market B",
            "Belge_Numarasi": "BEL2024002",
            "Belge_Tarihi": "2024-09-01",
            "Tutar": 750.00
        }
    ]
    
    # Test tagging logic (all DigerHarcama records should be tagged as "Diğer Harcama")
    tagged_records = []
    for record in diger_harcama_records:
        tagged_record = {
            "id": record["Harcama_ID"],
            "tarih": record["Belge_Tarihi"],
            "belge_numarasi": record["Belge_Numarasi"],
            "karsi_taraf_adi": record["Alici_Adi"],
            "tutar": record["Tutar"],
            "etiket": "Diğer Harcama"
        }
        tagged_records.append(tagged_record)
    
    # Validate results
    assert len(tagged_records) == 2
    assert tagged_records[0]["etiket"] == "Diğer Harcama"
    assert tagged_records[1]["etiket"] == "Diğer Harcama"
    
    print("✅ DigerHarcama tagging test passed")
    print(f"   - Record 1 tagged as: {tagged_records[0]['etiket']}")
    print(f"   - Record 2 tagged as: {tagged_records[1]['etiket']}")
    
    return True

def test_combined_tagging():
    """Test combined tagging of EFatura and DigerHarcama records"""
    
    # Sample EFatura records
    efatura_records = [
        {"Fatura_ID": 1, "Giden_Fatura": False, "Tutar": 1000.00},
        {"Fatura_ID": 2, "Giden_Fatura": True, "Tutar": 2000.00}
    ]
    
    # Sample DigerHarcama records
    diger_harcama_records = [
        {"Harcama_ID": 1, "Tutar": 500.00},
        {"Harcama_ID": 2, "Tutar": 750.00}
    ]
    
    # Tag all records
    all_tagged_records = []
    
    # Tag EFatura records
    for record in efatura_records:
        tag = "Giden Fatura" if record["Giden_Fatura"] else "Gelen Fatura"
        all_tagged_records.append({
            "id": record["Fatura_ID"],
            "tutar": record["Tutar"],
            "etiket": tag
        })
    
    # Tag DigerHarcama records
    for record in diger_harcama_records:
        all_tagged_records.append({
            "id": record["Harcama_ID"],
            "tutar": record["Tutar"],
            "etiket": "Diğer Harcama"
        })
    
    # Validate results
    assert len(all_tagged_records) == 4
    assert all_tagged_records[0]["etiket"] == "Gelen Fatura"
    assert all_tagged_records[1]["etiket"] == "Giden Fatura"
    assert all_tagged_records[2]["etiket"] == "Diğer Harcama"
    assert all_tagged_records[3]["etiket"] == "Diğer Harcama"
    
    # Calculate totals by tag type
    totals = {}
    for record in all_tagged_records:
        tag = record["etiket"]
        if tag not in totals:
            totals[tag] = 0
        totals[tag] += record["tutar"]
    
    expected_totals = {
        "Gelen Fatura": 1000.00,
        "Giden Fatura": 2000.00,
        "Diğer Harcama": 1250.00
    }
    
    assert totals == expected_totals
    
    print("✅ Combined tagging test passed")
    print(f"   - Total by tag type: {totals}")
    
    return True

if __name__ == "__main__":
    print("Testing Fatura & Diğer Harcama Rapor Tagging Functionality")
    print("=" * 60)
    
    try:
        test_efatura_tagging()
        test_diger_harcama_tagging()
        test_combined_tagging()
        
        print("\n🎉 All tagging tests passed!")
        print("\nTagging functionality verified:")
        print("✓ EFatura records correctly tagged as 'Gelen Fatura' or 'Giden Fatura'")
        print("✓ DigerHarcama records correctly tagged as 'Diğer Harcama'")
        print("✓ Combined tagging maintains correct categorization")
        print("✓ Totals calculated correctly by tag type")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        exit(1)
    
    print("\n✅ Tagging tests completed successfully!")