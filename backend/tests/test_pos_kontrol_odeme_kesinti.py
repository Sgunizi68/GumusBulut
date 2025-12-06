import unittest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db import crud
from db.models import Sube, Kategori, Gelir, POSHareketleri, Odeme


class TestPOSKontrolOdemeKesinti(unittest.TestCase):
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

        # Create "Kredi Kartı Komisyon ve BSMV Ödemesi" category
        self.komisyon_kategori = Kategori(
            Kategori_Adi="Kredi Kartı Komisyon ve BSMV Ödemesi",
            Ust_Kategori_ID=1,
            Tip="Ödeme",
            Aktif_Pasif=True,
            Gizli=False
        )
        self.db.add(self.komisyon_kategori)
        self.db.commit()
        self.db.refresh(self.komisyon_kategori)

    def tearDown(self):
        self.db.close()

    def test_odeme_kesinti_calculation_with_negative_tutar(self):
        # Test that only negative Odeme Tutar values are considered for Ödeme Kesinti calculation
        test_date = date(2025, 8, 15)
        hesaba_gecis_date = date(2025, 8, 14)  # Different date for Hesaba_Gecis
        
        # Create POS_Hareketleri record
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=hesaba_gecis_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        
        # Create negative Odeme record (should be included in calculation)
        odeme_negative = Odeme(
            Tip="Kredi Kartı Komisyon",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=hesaba_gecis_date,  # Matching date with Hesaba_Gecis
            Aciklama="Kredi kartı komisyonu",
            Tutar=Decimal("-20.00"),  # Negative value
            Kategori_ID=self.komisyon_kategori.Kategori_ID,
            Donem=2508,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme_negative)
        
        # Create positive Odeme record (should be excluded from calculation)
        odeme_positive = Odeme(
            Tip="Kredi Kartı Komisyon",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=hesaba_gecis_date,  # Matching date with Hesaba_Gecis
            Aciklama="Kredi kartı komisyonu iade",
            Tutar=Decimal("10.00"),  # Positive value
            Kategori_ID=self.komisyon_kategori.Kategori_ID,
            Donem=2508,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme_positive)
        
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
        # Ödeme Kesinti should be 20.00 (absolute value of -20.00)
        # The positive 10.00 should not be included
        self.assertEqual(test_record.Odeme_Kesinti, Decimal("20.00"))

    def test_odeme_kesinti_calculation_with_multiple_matching_records(self):
        # Test that multiple matching Odeme records are correctly summed
        test_date = date(2025, 8, 15)
        hesaba_gecis_date = date(2025, 8, 14)
        
        # Create POS_Hareketleri record
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=hesaba_gecis_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        
        # Create multiple negative Odeme records
        odeme1 = Odeme(
            Tip="Kredi Kartı Komisyon",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=hesaba_gecis_date,
            Aciklama="Kredi kartı komisyonu 1",
            Tutar=Decimal("-15.00"),
            Kategori_ID=self.komisyon_kategori.Kategori_ID,
            Donem=2508,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme1)
        
        odeme2 = Odeme(
            Tip="BSMV",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=hesaba_gecis_date,
            Aciklama="BSMV kesintisi",
            Tutar=Decimal("-5.50"),
            Kategori_ID=self.komisyon_kategori.Kategori_ID,
            Donem=2508,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme2)
        
        self.db.commit()

        # Test the dashboard data
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        # Ödeme Kesinti should be 20.50 (absolute value of -15.00 + absolute value of -5.50)
        self.assertEqual(test_record.Odeme_Kesinti, Decimal("20.50"))

    def test_odeme_kesinti_calculation_no_matching_category(self):
        # Test when "Kredi Kartı Komisyon ve BSMV Ödemesi" category doesn't exist
        # Delete the category
        self.db.delete(self.komisyon_kategori)
        self.db.commit()
        
        test_date = date(2025, 8, 15)
        
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
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        # Ödeme Kesinti should be None or 0 when category doesn't exist
        self.assertIsNone(test_record.Odeme_Kesinti)

    def test_odeme_kesinti_calculation_no_matching_records(self):
        # Test when there are no matching Odeme records
        test_date = date(2025, 8, 15)
        hesaba_gecis_date = date(2025, 8, 14)
        
        # Create POS_Hareketleri record
        pos_hareket = POSHareketleri(
            Islem_Tarihi=test_date,
            Hesaba_Gecis=hesaba_gecis_date,
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        self.db.commit()

        # Test the dashboard data (no Odeme records)
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2508)

        # Find the record for our test date
        test_record = None
        for record in result.data:
            if record.Tarih == "2025-08-15":
                test_record = record
                break

        self.assertIsNotNone(test_record)
        # Ödeme Kesinti should be None or 0 when no matching records
        self.assertIsNone(test_record.Odeme_Kesinti)


if __name__ == "__main__":
    unittest.main()