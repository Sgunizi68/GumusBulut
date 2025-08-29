import unittest
import json
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from backend.main import app

class TestOdemeRaporAPIIntegration(unittest.TestCase):
    
    def setUp(self):
        self.client = TestClient(app)
        
        # Mock data that matches the new structure with bank account grouping
        self.mock_response_data = {
            "data": [
                {
                    "donem": 2301,
                    "donem_total": 11500.00,
                    "record_count": 4,
                    "kategoriler": [
                        {
                            "kategori_id": 1,
                            "kategori_adi": "Kira",
                            "kategori_total": 9500.00,
                            "record_count": 3,
                            "banka_hesaplari": [
                                {
                                    "hesap_adi": "Ziraat Bankası",
                                    "hesap_total": 6500.00,
                                    "record_count": 2,
                                    "details": [
                                        {
                                            "odeme_id": 1,
                                            "tip": "Banka Ödeme",
                                            "hesap_adi": "Ziraat Bankası",
                                            "tarih": "2023-01-15",
                                            "aciklama": "Kira ödemesi",
                                            "tutar": 5000.00
                                        },
                                        {
                                            "odeme_id": 2,
                                            "tip": "Banka Ödeme",
                                            "hesap_adi": "Ziraat Bankası",
                                            "tarih": "2023-01-20",
                                            "aciklama": "Elektrik faturası",
                                            "tutar": 1500.00
                                        }
                                    ]
                                },
                                {
                                    "hesap_adi": "İş Bankası",
                                    "hesap_total": 3000.00,
                                    "record_count": 1,
                                    "details": [
                                        {
                                            "odeme_id": 3,
                                            "tip": "Banka Ödeme",
                                            "hesap_adi": "İş Bankası",
                                            "tarih": "2023-01-10",
                                            "aciklama": "Malzeme alışverişi",
                                            "tutar": 3000.00
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "kategori_id": 2,
                            "kategori_adi": "Araç Giderleri",
                            "kategori_total": 2000.00,
                            "record_count": 1,
                            "banka_hesaplari": [
                                {
                                    "hesap_adi": "Kasa",
                                    "hesap_total": 2000.00,
                                    "record_count": 1,
                                    "details": [
                                        {
                                            "odeme_id": 4,
                                            "tip": "Nakit Ödeme",
                                            "hesap_adi": "Kasa",
                                            "tarih": "2023-01-05",
                                            "aciklama": "Minibüs kirası",
                                            "tutar": 2000.00
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "totals": {
                "donem_totals": {
                    "2301": 11500.00
                },
                "kategori_totals": {
                    "1": 9500.00,
                    "2": 2000.00
                },
                "grand_total": 11500.00
            },
            "filters_applied": {
                "donem": [2301],
                "kategori": None,
                "sube_id": 1
            },
            "total_records": 4
        }

    @patch('backend.api.v1.endpoints.odeme.get_odeme_rapor')
    def test_odeme_rapor_endpoint_with_banka_hesabi_grouping(self, mock_get_odeme_rapor):
        # Configure the mock to return our test data
        mock_get_odeme_rapor.return_value = self.mock_response_data
        
        # Make a request to the endpoint
        response = self.client.get("/api/v1/odeme-rapor/?donem=2301&sube_id=1")
        
        # Check that the response status code is 200
        self.assertEqual(response.status_code, 200)
        
        # Parse the JSON response
        response_data = response.json()
        
        # Verify the structure matches our expected format
        self.assertIn("data", response_data)
        self.assertIn("totals", response_data)
        self.assertIn("filters_applied", response_data)
        self.assertIn("total_records", response_data)
        
        # Check the data structure
        self.assertGreater(len(response_data["data"]), 0)
        
        donem_group = response_data["data"][0]
        self.assertEqual(donem_group["donem"], 2301)
        self.assertEqual(donem_group["donem_total"], 11500.00)
        
        # Check category grouping
        self.assertEqual(len(donem_group["kategoriler"]), 2)
        
        # Check the first category (Kira)
        kira_kategori = donem_group["kategoriler"][0]
        self.assertEqual(kira_kategori["kategori_adi"], "Kira")
        self.assertEqual(kira_kategori["kategori_total"], 9500.00)
        
        # Check bank account grouping within Kira category
        self.assertIn("banka_hesaplari", kira_kategori)
        self.assertEqual(len(kira_kategori["banka_hesaplari"]), 2)
        
        # Check Ziraat Bankası group
        ziraat_group = None
        for banka_hesabi in kira_kategori["banka_hesaplari"]:
            if banka_hesabi["hesap_adi"] == "Ziraat Bankası":
                ziraat_group = banka_hesabi
                break
        
        self.assertIsNotNone(ziraat_group)
        self.assertEqual(ziraat_group["hesap_total"], 6500.00)
        self.assertEqual(ziraat_group["record_count"], 2)
        self.assertEqual(len(ziraat_group["details"]), 2)
        
        # Check the details structure
        first_detail = ziraat_group["details"][0]
        self.assertIn("odeme_id", first_detail)
        self.assertIn("tip", first_detail)
        self.assertIn("hesap_adi", first_detail)
        self.assertIn("tarih", first_detail)
        self.assertIn("aciklama", first_detail)
        self.assertIn("tutar", first_detail)
        
        # Verify totals
        self.assertEqual(response_data["totals"]["grand_total"], 11500.00)
        self.assertEqual(response_data["total_records"], 4)

if __name__ == '__main__':
    unittest.main()