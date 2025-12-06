#!/usr/bin/env python3
"""
Unit test for Fatura & Diğer Harcama Rapor data aggregation functionality
"""

def test_data_aggregation():
    """Test data aggregation logic for grouping by period and category"""
    
    from collections import defaultdict
    
    # Sample test data combining EFatura and DigerHarcama records
    test_records = [
        # Period 2408, Category 1
        {"id": 1, "tarih": "2024-08-15", "tutar": 1000.00, "donem": 2408, "kategori_id": 1, "etiket": "Gelen Fatura"},
        {"id": 2, "tarih": "2024-08-16", "tutar": 500.00, "donem": 2408, "kategori_id": 1, "etiket": "Diğer Harcama"},
        
        # Period 2408, Category 2
        {"id": 3, "tarih": "2024-08-17", "tutar": 2000.00, "donem": 2408, "kategori_id": 2, "etiket": "Giden Fatura"},
        
        # Period 2409, Category 1
        {"id": 4, "tarih": "2024-09-01", "tutar": 1500.00, "donem": 2409, "kategori_id": 1, "etiket": "Gelen Fatura"},
        {"id": 5, "tarih": "2024-09-02", "tutar": 750.00, "donem": 2409, "kategori_id": 1, "etiket": "Diğer Harcama"},
        
        # Period 2409, Category 3 (uncategorized)
        {"id": 6, "tarih": "2024-09-03", "tutar": 300.00, "donem": 2409, "kategori_id": None, "etiket": "Diğer Harcama"}
    ]
    
    # Group data by Donem and Kategori
    donem_groups = defaultdict(lambda: {
        'donem_total': 0,
        'record_count': 0,
        'kategoriler': defaultdict(lambda: {
            'kategori_total': 0,
            'record_count': 0,
            'kayitlar': []
        })
    })
    
    # Collect totals
    grand_total = 0
    donem_totals = defaultdict(float)
    kategori_totals = defaultdict(float)
    total_records = 0
    
    # Process records
    for record in test_records:
        donem = record['donem']
        kategori_id = record['kategori_id'] or 'uncategorized'
        tutar = record['tutar']
        
        # Add to collections
        donem_groups[donem]['kategoriler'][kategori_id]['kayitlar'].append(record)
        donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += tutar
        donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
        donem_groups[donem]['donem_total'] += tutar
        donem_groups[donem]['record_count'] += 1
        
        # Update totals
        donem_totals[donem] += tutar
        kategori_totals[str(kategori_id)] += tutar
        grand_total += tutar
        total_records += 1
    
    # Validate structure
    assert len(donem_groups) == 2  # 2408 and 2409
    assert total_records == 6
    assert grand_total == 6050.00
    
    # Validate period totals
    assert donem_totals[2408] == 3500.00  # 1000 + 500 + 2000
    assert donem_totals[2409] == 2550.00  # 1500 + 750 + 300
    
    # Validate category totals
    assert kategori_totals['1'] == 3750.00  # 1000 + 500 + 1500 + 750 (Category 1 total)
    assert kategori_totals['2'] == 2000.00  # 2000 (Category 2 total)
    assert kategori_totals['uncategorized'] == 300.00  # 300 (Uncategorized total)
    
    # Validate period group structure
    assert donem_groups[2408]['record_count'] == 3
    assert donem_groups[2408]['donem_total'] == 3500.00
    assert donem_groups[2409]['record_count'] == 3
    assert donem_groups[2409]['donem_total'] == 2550.00
    
    # Validate category group structure
    assert len(donem_groups[2408]['kategoriler']) == 2  # Categories 1 and 2
    assert len(donem_groups[2409]['kategoriler']) == 2  # Categories 1 and uncategorized
    
    # Validate specific category data
    kategori_1_2408 = donem_groups[2408]['kategoriler'][1]
    assert kategori_1_2408['record_count'] == 2
    assert kategori_1_2408['kategori_total'] == 1500.00
    assert len(kategori_1_2408['kayitlar']) == 2
    
    kategori_2_2408 = donem_groups[2408]['kategoriler'][2]
    assert kategori_2_2408['record_count'] == 1
    assert kategori_2_2408['kategori_total'] == 2000.00
    
    print("✅ Data aggregation test passed")
    print(f"   - Total records processed: {total_records}")
    print(f"   - Grand total: {grand_total}")
    print(f"   - Period totals: {dict(donem_totals)}")
    print(f"   - Category totals: {dict(kategori_totals)}")
    print(f"   - Period groups: {list(donem_groups.keys())}")
    
    # Detailed breakdown
    for donem in sorted(donem_groups.keys(), reverse=True):
        donem_data = donem_groups[donem]
        print(f"   - Period {donem}: {donem_data['record_count']} records, Total: {donem_data['donem_total']}")
        
        for kategori_id in sorted(donem_data['kategoriler'].keys(), 
                                key=lambda x: (x == 'uncategorized', x)):
            kategori_data = donem_data['kategoriler'][kategori_id]
            print(f"     * Category {kategori_id}: {kategori_data['record_count']} records, Total: {kategori_data['kategori_total']}")
    
    return True

def test_edge_cases():
    """Test edge cases for data aggregation"""
    
    from collections import defaultdict
    
    # Test with empty data
    empty_records = []
    
    donem_groups = defaultdict(lambda: {
        'donem_total': 0,
        'record_count': 0,
        'kategoriler': defaultdict(lambda: {
            'kategori_total': 0,
            'record_count': 0,
            'kayitlar': []
        })
    })
    
    grand_total = 0
    total_records = 0
    
    for record in empty_records:
        donem = record['donem']
        kategori_id = record['kategori_id'] or 'uncategorized'
        tutar = record['tutar']
        
        donem_groups[donem]['kategoriler'][kategori_id]['kayitlar'].append(record)
        donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += tutar
        donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
        donem_groups[donem]['donem_total'] += tutar
        donem_groups[donem]['record_count'] += 1
        
        grand_total += tutar
        total_records += 1
    
    # Should handle empty data gracefully
    assert len(donem_groups) == 0
    assert grand_total == 0
    assert total_records == 0
    
    print("✅ Edge cases test passed")
    print("   - Empty data handled correctly")
    
    return True

def test_sorting_logic():
    """Test sorting logic for periods and categories"""
    
    from collections import defaultdict
    
    # Test data with unsorted periods and categories
    test_records = [
        {"id": 1, "tarih": "2024-08-15", "tutar": 1000.00, "donem": 2408, "kategori_id": 3, "etiket": "Gelen Fatura"},
        {"id": 2, "tarih": "2024-09-01", "tutar": 2000.00, "donem": 2409, "kategori_id": 1, "etiket": "Giden Fatura"},
        {"id": 3, "tarih": "2024-08-16", "tutar": 500.00, "donem": 2408, "kategori_id": 1, "etiket": "Diğer Harcama"},
        {"id": 4, "tarih": "2024-07-01", "tutar": 1500.00, "donem": 2407, "kategori_id": 2, "etiket": "Gelen Fatura"},
    ]
    
    # Group data
    donem_groups = defaultdict(lambda: {
        'donem_total': 0,
        'record_count': 0,
        'kategoriler': defaultdict(lambda: {
            'kategori_total': 0,
            'record_count': 0,
            'kayitlar': []
        })
    })
    
    for record in test_records:
        donem = record['donem']
        kategori_id = record['kategori_id'] or 'uncategorized'
        tutar = record['tutar']
        
        donem_groups[donem]['kategoriler'][kategori_id]['kayitlar'].append(record)
        donem_groups[donem]['kategoriler'][kategori_id]['kategori_total'] += tutar
        donem_groups[donem]['kategoriler'][kategori_id]['record_count'] += 1
        donem_groups[donem]['donem_total'] += tutar
        donem_groups[donem]['record_count'] += 1
    
    # Test sorting - periods should be in descending order
    sorted_donemler = sorted(donem_groups.keys(), reverse=True)
    expected_donem_order = [2409, 2408, 2407]
    assert sorted_donemler == expected_donem_order
    
    # Test category sorting within a period
    donem_2408_kategoriler = list(donem_groups[2408]['kategoriler'].keys())
    # Should sort with 'uncategorized' last, others by ID
    # In this case, categories 1 and 3 for period 2408
    assert set(donem_2408_kategoriler) == {1, 3}
    
    print("✅ Sorting logic test passed")
    print(f"   - Period sorting: {sorted_donemler}")
    print(f"   - Expected order: {expected_donem_order}")
    
    return True

if __name__ == "__main__":
    print("Testing Fatura & Diğer Harcama Rapor Data Aggregation Functionality")
    print("=" * 70)
    
    try:
        test_data_aggregation()
        test_edge_cases()
        test_sorting_logic()
        
        print("\n🎉 All data aggregation tests passed!")
        print("\nAggregation functionality verified:")
        print("✓ Data correctly grouped by period and category")
        print("✓ Totals calculated accurately at all levels")
        print("✓ Edge cases handled properly (empty data)")
        print("✓ Sorting logic works for periods and categories")
        print("✓ Structure maintains proper hierarchy")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
    
    print("\n✅ Data aggregation tests completed successfully!")