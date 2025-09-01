import requests
import json

# Fetch all EFaturaReferans entries
try:
    response = requests.get("https://gumusbulut.onrender.com/api/v1/e-fatura-referans/")
    if response.status_code == 200:
        referanslar = response.json()
        print(f"Total EFaturaReferans entries: {len(referanslar)}")
        
        # Look for FASDAT entries
        fasdat_entries = [ref for ref in referanslar if "FASDAT" in ref.get("Alici_Unvani", "").upper()]
        print(f"\nFASDAT entries found: {len(fasdat_entries)}")
        
        for entry in fasdat_entries:
            print(f"\nAlici_Unvani: {entry.get('Alici_Unvani')}")
            print(f"Kategori_ID: {entry.get('Kategori_ID')}")
            print(f"Aktif_Pasif: {entry.get('Aktif_Pasif')}")
            print(f"Sube_ID: {entry.get('Sube_ID', 'Not specified')}")
            
        # Save to file for inspection
        with open("efatura_referans_data.json", "w", encoding="utf-8") as f:
            json.dump(referanslar, f, ensure_ascii=False, indent=2)
        print("\nFull data saved to efatura_referans_data.json")
    else:
        print(f"Error fetching data: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")