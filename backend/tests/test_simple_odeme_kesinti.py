import unittest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db import crud
from db.models import Sube, Kategori, POSHareketleri, Odeme


class TestSimpleOdemeKesinti(unittest.TestCase):
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

    def test_simple_case(self):
        """
        Simple test case to verify the calculation:
        - One POS transaction on July 1st with Hesaba_Gecis = July 2nd
        - One matching Odeme record for July 2nd
        """
        # Create POS transaction
        pos_hareket = POSHareketleri(
            Islem_Tarihi=date(2025, 7, 1),
            Hesaba_Gecis=date(2025, 7, 2),
            Para_Birimi="TL",
            Islem_Tutari=Decimal("100"),
            Kesinti_Tutari=Decimal("5.00"),
            Net_Tutar=Decimal("95.00"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket)
        
        # Create matching Odeme record
        odeme = Odeme(
            Tip="Kredi Kartı Komisyon",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=date(2025, 7, 2),  # This matches Hesaba_Gecis date
            Aciklama="Kredi kartı komisyonu",
            Tutar=Decimal("-3.00"),  # Negative value
            Kategori_ID=self.komisyon_kategori.Kategori_ID,  # Correct category
            Donem=2507,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme)
        
        self.db.commit()

        # Test the dashboard data for July 2025
        result = crud.get_pos_kontrol_dashboard_data(self.db, self.sube.Sube_ID, 2507)

        # Find the record for July 1st
        july_1st_record = None
        for record in result.data:
            if record.Tarih == "2025-07-01":
                july_1st_record = record
                break

        self.assertIsNotNone(july_1st_record)
        
        # Check that POS_Hareketleri is 100
        self.assertEqual(july_1st_record.POS_Hareketleri, Decimal("100.00"))
        
        # Check that POS_Kesinti is 5.00
        self.assertEqual(july_1st_record.POS_Kesinti, Decimal("5.00"))
        
        # Check that Odeme_Kesinti is 3.00 (absolute value of -3.00)
        self.assertEqual(july_1st_record.Odeme_Kesinti, Decimal("3.00"))


if __name__ == "__main__":
    unittest.main()