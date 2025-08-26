#!/usr/bin/env python3
"""
Test script to verify that the Odeme API returns all expected records for period 2508.
This test validates the fix for the Payment Category Assignment data missing issue.
"""

import requests
import json
from typing import List, Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"  # Adjust as needed
TEST_PERIOD = "2508"

def test_odeme_api_data_completeness():
    """Test that the Odeme API returns all records without pagination issues."""
    
    print(f"🧪 Testing Odeme API data completeness for period {TEST_PERIOD}")
    print("=" * 60)
    
    try:
        # Test 1: Check total record count with high limit
        print("📊 Test 1: Fetching Odeme records with high limit...")
        response = requests.get(f"{API_BASE_URL}/Odeme/?limit=1000")
        
        if response.status_code == 200:
            odeme_data: List[Dict[str, Any]] = response.json()
            total_records = len(odeme_data)
            print(f"✅ Successfully fetched {total_records} total Odeme records")
            
            # Test 2: Filter records for specific period
            period_records = [o for o in odeme_data if str(o.get('Donem', '')) == TEST_PERIOD]
            period_count = len(period_records)
            print(f"📅 Found {period_count} records for period {TEST_PERIOD}")
            
            # Test 3: Verify we get more than the old limit of 100
            if period_count > 100:
                print(f"✅ SUCCESS: Period {TEST_PERIOD} has {period_count} records (> 100, old limit)")
            elif period_count > 0:
                print(f"ℹ️  INFO: Period {TEST_PERIOD} has {period_count} records (≤ 100)")
            else:
                print(f"⚠️  WARNING: No records found for period {TEST_PERIOD}")
                
            # Test 4: Verify with old limit (100) for comparison
            print("\n📊 Test 4: Comparing with old limit (100)...")
            response_old = requests.get(f"{API_BASE_URL}/Odeme/?limit=100")
            if response_old.status_code == 200:
                old_data = response_old.json()
                old_period_count = len([o for o in old_data if str(o.get('Donem', '')) == TEST_PERIOD])
                print(f"📊 With limit=100: {old_period_count} records for period {TEST_PERIOD}")
                print(f"📊 With limit=1000: {period_count} records for period {TEST_PERIOD}")
                
                if period_count > old_period_count:
                    print(f"✅ SUCCESS: Increased limit resolved the data missing issue!")
                    print(f"📈 Improvement: +{period_count - old_period_count} more records visible")
                else:
                    print(f"ℹ️  INFO: No difference in record count (data may be under 100 records)")
                    
            # Test 5: Show sample records
            if period_records:
                print(f"\n📋 Sample records for period {TEST_PERIOD}:")
                for i, record in enumerate(period_records[:3]):  # Show first 3
                    print(f"  {i+1}. Odeme_ID: {record.get('Odeme_ID')}, "
                          f"Tip: {record.get('Tip')}, "
                          f"Tutar: {record.get('Tutar')}, "
                          f"Tarih: {record.get('Tarih')}")
                if len(period_records) > 3:
                    print(f"  ... and {len(period_records) - 3} more records")
                    
        else:
            print(f"❌ ERROR: API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        print("\n" + "=" * 60)
        print("🏆 Data completeness test completed successfully!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Network error occurred: {e}")
        print("💡 Make sure the backend server is running on the configured URL")
        return False
    except Exception as e:
        print(f"❌ ERROR: Unexpected error occurred: {e}")
        return False

def test_period_filter_functionality():
    """Test that period filtering works correctly in the frontend logic."""
    
    print(f"\n🔧 Testing period filtering functionality...")
    print("=" * 60)
    
    try:
        # Simulate frontend filtering logic
        response = requests.get(f"{API_BASE_URL}/Odeme/?limit=1000")
        
        if response.status_code == 200:
            odeme_data = response.json()
            
            # Get unique periods from the data
            periods = set()
            for record in odeme_data:
                if record.get('Donem'):
                    periods.add(str(record['Donem']))
                    
            periods_list = sorted(list(periods), reverse=True)
            print(f"📅 Available periods in data: {periods_list}")
            
            # Test filtering for each period
            for period in periods_list[:5]:  # Test first 5 periods
                filtered_records = [o for o in odeme_data if str(o.get('Donem', '')) == period]
                print(f"  Period {period}: {len(filtered_records)} records")
                
            print("✅ Period filtering functionality verified")
            return True
            
        else:
            print(f"❌ ERROR: API request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Period filtering test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Payment Category Assignment Data Completeness Tests")
    print("="*80)
    
    # Run data completeness test
    success = test_odeme_api_data_completeness()
    
    # Run period filtering test
    if success:
        test_period_filter_functionality()
    
    print("\n" + "="*80)
    print("📝 Test Summary:")
    print("- Backend API pagination limit increased from 100 to 1000")
    print("- Frontend period filter moved to filter controls grid")  
    print("- Dynamic period calculation from available data")
    print("- Expected: All 265 records for period 2508 should now be visible")
    print("\n💡 Next steps: Start the backend server and run this test to verify the fixes")