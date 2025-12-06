import unittest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db import crud
from db.models import Sube, Kategori, Gelir, POSHareketleri


class TestPOSKontrolComparisonLogic(unittest.TestCase):
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
            Aciklama="Test branch for POS kontrol comparison logic"
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

    def test_comparison_logic_exact_match(self):
        # Test exact matching values
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
        
        # Create POS_Hareketleri record with exact same amount
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
        self.assertEqual(test_record.Kontrol_POS, "OK")

    def test_comparison_logic_tolerance_match(self):
        # Test values within tolerance (0.01)
        test_date = date(2025, 8, 15)
        
        # Create Gelir record
        gelir = Gelir(
            Sube_ID=self.sube.Sube_ID,
            Tarih=test_date,
            Kategori_ID=self.pos_kategori.Kategori_ID,
            Tutar=Decimal("1000.005"),  # Slightly different
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(gelir)
        
        # Create POS_Hareketleri record
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=test_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),  # Within tolerance
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

    def test_comparison_logic_outside_tolerance(self):
        # Test values outside tolerance (0.01)
        test_date = date(2025, 8, 15)
        
        # Create Gelir record
        gelir = Gelir(
            Sube_ID=self.sube.Sube_ID,
            Tarih=test_date,
            Kategori_ID=self.pos_kategori.Kategori_ID,
            Tutar=Decimal("1000.02"),  # Outside tolerance
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
        self.assertEqual(test_record.Kontrol_POS, "Not OK")  # Should be Not OK due to being outside tolerance

    def test_comparison_logic_one_null_value(self):
        # Test when one value is null and the other is not
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
        # Note: Not creating POS_Hareketleri record, so it will be null
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
        self.assertIsNone(test_record.POS_Hareketleri)
        self.assertEqual(test_record.Kontrol_POS, "Not OK")  # One null, one not null = Not OK

    def test_comparison_logic_both_null_values(self):
        # Test when both values are null
        test_date = date(2025, 8, 15)
        
        # Not creating any records, so both values will be null
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
        self.assertIsNone(test_record.Gelir_POS)
        self.assertIsNone(test_record.POS_Hareketleri)
        self.assertEqual(test_record.Kontrol_POS, "OK")  # Both null = OK

    def test_comparison_logic_summary_statistics(self):
        # Test that summary statistics are calculated correctly
        test_dates = [date(2025, 8, i) for i in range(1, 6)]  # 5 days
        
        # Create mixed data: 3 matching, 2 non-matching
        for i, test_date in enumerate(test_dates):
            # Create Gelir record
            gelir = Gelir(
                Sube_ID=self.sube.Sube_ID,
                Tarih=test_date,
                Kategori_ID=self.pos_kategori.Kategori_ID,
                Tutar=Decimal(f"{1000.00 + i * 10}"),  # 1000, 1010, 1020, 1030, 1040
                Kayit_Tarihi=datetime.now()
            )
            self.db.add(gelir)
            
            # For first 3 dates, create matching POS_Hareketleri
            # For last 2 dates, create non-matching POS_Hareketleri
            if i < 3:
                pos_amount = Decimal(f"{1000.00 + i * 10}")  # Same as Gelir
            else:
                pos_amount = Decimal(f"{900.00 + i * 10}")  # Different from Gelir
                
            pos_hareket = POSHareketleri(
                Islem_Tarihi=test_date,
                Hesaba_Gecis=test_date,
                Para_Birimi="TRY",
                Islem_Tutari=pos_amount,
                Kesinti_Tutari=Decimal("50.00"),
                Net_Tutar=Decimal(f"{pos_amount - 50}"),
                Sube_ID=self.sube.Sube_ID,
                Kayit_Tarihi=datetime.now()
            )
            self.db.add(pos_hareket)
            
        self.db.commit()

        # Test the dashboard data
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        # Check summary statistics
        self.assertEqual(result.summary.total_records, 31)  # August has 31 days
        self.assertEqual(result.summary.successful_matches, 29)  # 3 matching + 26 days with no data (both null)
        self.assertEqual(result.summary.error_matches, 2)  # 2 non-matching
        self.assertEqual(result.summary.success_rate, "94%")  # 29/31 ≈ 94%

    def test_kontrol_kesinti_and_net_comparison_logic(self):
        # Test the new Kontrol Kesinti and Kontrol Net comparison logic
        from db.models import Odeme
        
        test_date = date(2025, 8, 15)
        
        # Create POS_Hareketleri record with specific Kesinti and Net values
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=test_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),  # POS Kesinti
            Net_Tutar=Decimal("950.00"),      # POS Net
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        
        # Create Odeme record with matching values
        odeme = Odeme(
            Tip="POS Kesinti",
            Hesap_Adi="POS Hesabı",
            Tarih=test_date,
            Aciklama="POS Kesinti",
            Tutar=Decimal("50.00"),  # Same as POS Kesinti
            Donem=2508,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme)
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
        self.assertEqual(test_record.POS_Kesinti, Decimal("50.00"))
        self.assertEqual(test_record.Odeme, Decimal("50.00"))
        self.assertEqual(test_record.Kontrol_Kesinti, "OK")  # Should be OK as they match
        
        # Test with non-matching values
        # Update Odeme record with different value
        odeme.Tutar = Decimal("45.00")  # Different from POS Kesinti (50.00)
        self.db.commit()
        
        # Test the dashboard data again
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)  # August 2025

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        self.assertEqual(test_record.Kontrol_Kesinti, "Not OK")  # Should be Not OK as they don't match

if __name__ == "__main__":
    unittest.main()