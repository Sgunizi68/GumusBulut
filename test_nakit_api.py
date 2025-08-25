#!/usr/bin/env python3
"""
Simple test script to verify the Nakit Yatırma Kontrol Raporu API
"""

import urllib.request
import urllib.error
import json

def test_api():
    """
    Test the nakit yatırma kontrol raporu API
    """
    
    API_BASE_URL = "https://gumusbulut.onrender.com/api/v1"
    
    # Test parameters - using values from mockup
    sube_id = 1  # Assuming Brandium is Sube_ID = 1
    donem = 2508  # August 2025
    
    url = f"{API_BASE_URL}/nakit-yatirma-kontrol/{sube_id}/{donem}"
    
    print(f"🔍 Testing API endpoint: {url}")
    
    try:
        # Create request with timeout
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (compatible; Test Script)')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            print(f"📊 Response Status: {response.getcode()}")
            print(f"📊 Response Headers: {dict(response.headers)}")
            
            if response.getcode() == 200:
                data = json.loads(response.read().decode('utf-8'))
                print(f"✅ Success! Data received:")
                print(f"   - Bankaya Yatan records: {len(data.get('bankaya_yatan', []))}")
                print(f"   - Nakit Girişi records: {len(data.get('nakit_girisi', []))}")
                
                # Show some sample data
                if data.get('bankaya_yatan'):
                    print(f"   - Sample Bankaya Yatan: {data['bankaya_yatan'][0]}")
                if data.get('nakit_girisi'):
                    print(f"   - Sample Nakit Girişi: {data['nakit_girisi'][0]}")
                    
                # Calculate totals
                bankaya_total = sum(item['Tutar'] for item in data.get('bankaya_yatan', []))
                nakit_total = sum(item['Tutar'] for item in data.get('nakit_girisi', []))
                
                print(f"💰 Totals:")
                print(f"   - Bankaya Yatan Total: {bankaya_total:,.2f} TL")
                print(f"   - Nakit Girişi Total: {nakit_total:,.2f} TL")
                print(f"   - Difference: {bankaya_total - nakit_total:,.2f} TL")
                
            else:
                print(f"❌ Error {response.getcode()}")
                
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code}: {e.reason}")
        try:
            error_body = e.read().decode('utf-8')
            print(f"Error details: {error_body}")
        except:
            pass
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    test_api()