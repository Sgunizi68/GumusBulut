import unittest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db import crud
from db.models import Sube, Kategori, Gelir, POSHareketleri


class TestPOSKontrolDashboard(unittest.TestCase):
    def setUp(self):
        # Create an in-memory SQLite database for testing
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = self.SessionLocal()

        # Create a test branch
        self.sube = Sube(
            Sube_Adi="Test Branch",
            Aciklama="Test branch for POS kontrol dashboard"
        )
        self.db.add(self.sube)
        self.db.commit()
        self.db.refresh(self.sube)

        # Create POS category
        self.pos_kategori = Kategori(
            Kategori_Adi="POS",
            Ust_Kategori_ID=1,
            Tip="Gelir",
            Aktif_Pasif=True,
            Gizli=False
        )
        self.db.add(self.pos_kategori)
        self.db.commit()
        self.db.refresh(self.pos_kategori)

    def tearDown(self):
        self.db.close()

    def test_get_pos_kontrol_dashboard_data_empty(self):
        # Test with no data
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        self.assertEqual(len(result.data), 31)  # August has 31 days
        self.assertEqual(result.summary.total_records, 31)
        self.assertEqual(result.summary.successful_matches, 31)  # All should be "OK" when both are None
        self.assertEqual(result.summary.error_matches, 0)
        self.assertEqual(result.summary.success_rate, "100%")

        # Check that all dates are present
        expected_dates = []
        for day in range(1, 32):  # August has 31 days
            expected_dates.append(f"2025-08-{day:02d}")
        
        actual_dates = [record.Tarih for record in result.data]
        self.assertEqual(actual_dates, expected_dates)

    def test_get_pos_kontrol_dashboard_data_matching_records(self):
        # Create matching Gelir and POS_Hareketleri records
        test_date = date(2025, 8, 15)
        
        # Create Gelir record
        gelir = Gelir(
            Sube_ID=self.sube.Sube_ID,
            Tarih=test_date,
            Kategori_ID=self.pos_kategori.Kategori_ID,
            Tutar=Decimal("1000.00"),
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(gelir)
        
        # Create POS_Hareketleri record
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=test_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        self.db.commit()

        # Test the dashboard data
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        self.assertEqual(test_record.Gelir_POS, Decimal("1000.00"))
        self.assertEqual(test_record.POS_Hareketleri, Decimal("1000.00"))
        self.assertEqual(test_record.POS_Kesinti, Decimal("50.00"))
        self.assertEqual(test_record.POS_Net, Decimal("950.00"))
        self.assertEqual(test_record.Kontrol_POS, "OK")

    def test_get_pos_kontrol_dashboard_data_non_matching_records(self):
        # Create non-matching Gelir and POS_Hareketleri records
        test_date = date(2025, 8, 15)
        
        # Create Gelir record
        gelir = Gelir(
            Sube_ID=self.sube.Sube_ID,
            Tarih=test_date,
            Kategori_ID=self.pos_kategori.Kategori_ID,
            Tutar=Decimal("1000.00"),
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(gelir)
        
        # Create POS_Hareketleri record with different amount
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=test_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("900.00"),  # Different amount
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("850.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        self.db.commit()

        # Test the dashboard data
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        self.assertEqual(test_record.Gelir_POS, Decimal("1000.00"))
        self.assertEqual(test_record.POS_Hareketleri, Decimal("900.00"))
        self.assertEqual(test_record.Kontrol_POS, "Not OK")

    def test_get_pos_kontrol_dashboard_data_tolerance_matching(self):
        # Test that values within 0.01 tolerance are considered matching
        test_date = date(2025, 8, 15)
        
        # Create Gelir record
        gelir = Gelir(
            Sube_ID=self.sube.Sube_ID,
            Tarih=test_date,
            Kategori_ID=self.pos_kategori.Kategori_ID,
            Tutar=Decimal("1000.005"),  # Slightly different value
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(gelir)
        
        # Create POS_Hareketleri record
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=test_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),  # Within 0.01 tolerance
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        self.db.commit()

        # Test the dashboard data
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        self.assertEqual(test_record.Kontrol_POS, "OK")  # Should be OK due to tolerance

    def test_get_pos_kontrol_dashboard_data_missing_pos_category(self):
        # Test when POS category doesn't exist
        # Delete the POS category
        self.db.delete(self.pos_kategori)
        self.db.commit()

        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        # Should return empty data with appropriate summary
        self.assertEqual(len(result.data), 0)
        self.assertEqual(result.summary.total_records, 0)
        self.assertEqual(result.summary.successful_matches, 0)
        self.assertEqual(result.summary.error_matches, 0)
        self.assertEqual(result.summary.success_rate, "0%")


if __name__ == "__main__":
    unittest.main()