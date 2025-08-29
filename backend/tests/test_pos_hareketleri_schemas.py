import unittest
from datetime import date, datetime
from decimal import Decimal

from schemas.pos_hareketleri import POSHareketleriBase, POSHareketleriCreate, POSHareketleriUpdate, POSHareketleriInDB


class TestPOSHareketleriSchemas(unittest.TestCase):
    def test_pos_hareketleri_base_schema(self):
        # Test valid data
        data = {
            "Islem_Tarihi": date(2023, 1, 15),
            "Hesaba_Gecis": date(2023, 1, 16),
            "Para_Birimi": "TRY",
            "Islem_Tutari": Decimal("1000.00"),
            "Kesinti_Tutari": Decimal("50.00"),
            "Net_Tutar": Decimal("950.00"),
            "Sube_ID": 1
        }
        
        schema = POSHareketleriBase(**data)
        self.assertEqual(schema.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(schema.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(schema.Para_Birimi, "TRY")
        self.assertEqual(schema.Islem_Tutari, Decimal("1000.00"))
        self.assertEqual(schema.Kesinti_Tutari, Decimal("50.00"))
        self.assertEqual(schema.Net_Tutar, Decimal("950.00"))
        self.assertEqual(schema.Sube_ID, 1)

    def test_pos_hareketleri_create_schema(self):
        # Test valid data
        data = {
            "Islem_Tarihi": date(2023, 1, 15),
            "Hesaba_Gecis": date(2023, 1, 16),
            "Para_Birimi": "USD",
            "Islem_Tutari": Decimal("500.00"),
            "Kesinti_Tutari": Decimal("25.00"),
            "Net_Tutar": Decimal("475.00"),
            "Sube_ID": 2
        }
        
        schema = POSHareketleriCreate(**data)
        self.assertEqual(schema.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(schema.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(schema.Para_Birimi, "USD")
        self.assertEqual(schema.Islem_Tutari, Decimal("500.00"))
        self.assertEqual(schema.Kesinti_Tutari, Decimal("25.00"))
        self.assertEqual(schema.Net_Tutar, Decimal("475.00"))
        self.assertEqual(schema.Sube_ID, 2)

    def test_pos_hareketleri_update_schema(self):
        # Test partial update data
        data = {
            "Islem_Tutari": Decimal("750.00"),
            "Net_Tutar": Decimal("725.00")
        }
        
        schema = POSHareketleriUpdate(**data)
        self.assertEqual(schema.Islem_Tutari, Decimal("750.00"))
        self.assertEqual(schema.Net_Tutar, Decimal("725.00"))
        self.assertIsNone(schema.Islem_Tarihi)  # Should be None as not provided
        self.assertIsNone(schema.Hesaba_Gecis)  # Should be None as not provided
        self.assertIsNone(schema.Para_Birimi)  # Should be None as not provided
        self.assertIsNone(schema.Kesinti_Tutari)  # Should be None as not provided
        self.assertIsNone(schema.Sube_ID)  # Should be None as not provided

    def test_pos_hareketleri_indb_schema(self):
        # Test valid data with ID and Kayit_Tarihi
        data = {
            "ID": 1,
            "Islem_Tarihi": date(2023, 1, 15),
            "Hesaba_Gecis": date(2023, 1, 16),
            "Para_Birimi": "EUR",
            "Islem_Tutari": Decimal("1200.00"),
            "Kesinti_Tutari": Decimal("60.00"),
            "Net_Tutar": Decimal("1140.00"),
            "Sube_ID": 3,
            "Kayit_Tarihi": datetime(2023, 1, 15, 10, 30, 0)
        }
        
        schema = POSHareketleriInDB(**data)
        self.assertEqual(schema.ID, 1)
        self.assertEqual(schema.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(schema.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(schema.Para_Birimi, "EUR")
        self.assertEqual(schema.Islem_Tutari, Decimal("1200.00"))
        self.assertEqual(schema.Kesinti_Tutari, Decimal("60.00"))
        self.assertEqual(schema.Net_Tutar, Decimal("1140.00"))
        self.assertEqual(schema.Sube_ID, 3)
        self.assertEqual(schema.Kayit_Tarihi, datetime(2023, 1, 15, 10, 30, 0))

    def test_pos_hareketleri_schema_validation(self):
        # Test validation for Para_Birimi max length
        with self.assertRaises(ValueError):
            POSHareketleriBase(
                Islem_Tarihi=date(2023, 1, 15),
                Hesaba_Gecis=date(2023, 1, 16),
                Para_Birimi="TOOLONG",  # More than 5 characters
                Islem_Tutari=Decimal("1000.00"),
                Kesinti_Tutari=Decimal("50.00"),
                Net_Tutar=Decimal("950.00"),
                Sube_ID=1
            )

        # Test validation for negative Islem_Tutari
        with self.assertRaises(ValueError):
            POSHareketleriBase(
                Islem_Tarihi=date(2023, 1, 15),
                Hesaba_Gecis=date(2023, 1, 16),
                Para_Birimi="TRY",
                Islem_Tutari=Decimal("-1000.00"),  # Negative value
                Kesinti_Tutari=Decimal("50.00"),
                Net_Tutar=Decimal("950.00"),
                Sube_ID=1
            )

        # Test validation for negative Kesinti_Tutari
        with self.assertRaises(ValueError):
            POSHareketleriBase(
                Islem_Tarihi=date(2023, 1, 15),
                Hesaba_Gecis=date(2023, 1, 16),
                Para_Birimi="TRY",
                Islem_Tutari=Decimal("1000.00"),
                Kesinti_Tutari=Decimal("-50.00"),  # Negative value
                Net_Tutar=Decimal("950.00"),
                Sube_ID=1
            )


if __name__ == "__main__":
    unittest.main()