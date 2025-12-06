import unittest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db import crud
from db.models import Sube, Kategori, Gelir, POSHareketleri, Odeme


class TestOdemeKesintiExample(unittest.TestCase):
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

    def test_example_case_july_1st(self):
        """
        Test the specific example case:
        Two POS transactions on July 1st (Islem_Tarihi) with Hesaba_Gecis = July 2nd
        """
        # Create POS transactions as in the example
        pos_hareket1 = POSHareketleri(
            Islem_Tarihi=date(2025, 7, 1),
            Hesaba_Gecis=date(2025, 7, 2),
            Para_Birimi="TL",
            Islem_Tutari=Decimal("650"),
            Kesinti_Tutari=Decimal("12.97"),
            Net_Tutar=Decimal("637.03"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket1)
        
        pos_hareket2 = POSHareketleri(
            Islem_Tarihi=date(2025, 7, 1),
            Hesaba_Gecis=date(2025, 7, 2),
            Para_Birimi="TL",
            Islem_Tutari=Decimal("360"),
            Kesinti_Tutari=Decimal("7.18"),
            Net_Tutar=Decimal("352.82"),
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(pos_hareket2)
        
        # Create matching Odeme records for July 2nd (Hesaba_Gecis date)
        # Let's say there are two negative Odeme records that match
        odeme1 = Odeme(
            Tip="Kredi Kartı Komisyon",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=date(2025, 7, 2),  # This matches Hesaba_Gecis date
            Aciklama="Kredi kartı komisyonu",
            Tutar=Decimal("-10.00"),  # Negative value
            Kategori_ID=self.komisyon_kategori.Kategori_ID,
            Donem=2507,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme1)
        
        odeme2 = Odeme(
            Tip="BSMV",
            Hesap_Adi="Kredi Kartı Hesabı",
            Tarih=date(2025, 7, 2),  # This matches Hesaba_Gecis date
            Aciklama="BSMV kesintisi",
            Tutar=Decimal("-5.50"),  # Negative value
            Kategori_ID=self.komisyon_kategori.Kategori_ID,
            Donem=2507,
            Sube_ID=self.sube.Sube_ID,
            Kayit_Tarihi=datetime.now()
        )
        self.db.add(odeme2)
        
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
        
        # Check that POS_Hareketleri is the sum of both transactions (650 + 360 = 1010)
        self.assertEqual(july_1st_record.POS_Hareketleri, Decimal("1010.00"))
        
        # Check that POS_Kesinti is the sum of both transaction deductions (12.97 + 7.18 = 20.15)
        self.assertEqual(july_1st_record.POS_Kesinti, Decimal("20.15"))
        
        # Check that Odeme_Kesinti is the sum of absolute values of negative Odeme records
        # abs(-10.00) + abs(-5.50) = 15.50
        self.assertEqual(july_1st_record.Odeme_Kesinti, Decimal("15.50"))


if __name__ == "__main__":
    unittest.main()