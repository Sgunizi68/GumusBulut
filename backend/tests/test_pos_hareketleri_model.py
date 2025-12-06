import unittest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db.models import POSHareketleri, Sube


class TestPOSHareketleriModel(unittest.TestCase):
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

    def tearDown(self):
        self.db.close()

    def test_pos_hareketleri_creation(self):
        # Create a test branch
        sube = Sube(
            Sube_Adi="Test Branch",
            Aciklama="Test branch for POS transactions"
        )
        self.db.add(sube)
        self.db.commit()
        self.db.refresh(sube)

        # Create a POS transaction
        pos_transaction = POSHareketleri(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=sube.Sube_ID
        )
        self.db.add(pos_transaction)
        self.db.commit()
        self.db.refresh(pos_transaction)

        # Verify the transaction was created correctly
        self.assertEqual(pos_transaction.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(pos_transaction.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(pos_transaction.Para_Birimi, "TRY")
        self.assertEqual(pos_transaction.Islem_Tutari, Decimal("1000.00"))
        self.assertEqual(pos_transaction.Kesinti_Tutari, Decimal("50.00"))
        self.assertEqual(pos_transaction.Net_Tutar, Decimal("950.00"))
        self.assertEqual(pos_transaction.Sube_ID, sube.Sube_ID)
        self.assertIsNotNone(pos_transaction.Kayit_Tarihi)
        self.assertIsInstance(pos_transaction.Kayit_Tarihi, datetime)

    def test_pos_hareketleri_with_default_values(self):
        # Create a test branch
        sube = Sube(
            Sube_Adi="Test Branch",
            Aciklama="Test branch for POS transactions"
        )
        self.db.add(sube)
        self.db.commit()
        self.db.refresh(sube)

        # Create a POS transaction with default values
        pos_transaction = POSHareketleri(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="USD",
            Islem_Tutari=Decimal("500.00"),
            Sube_ID=sube.Sube_ID
        )
        self.db.add(pos_transaction)
        self.db.commit()
        self.db.refresh(pos_transaction)

        # Verify default values
        self.assertEqual(pos_transaction.Kesinti_Tutari, Decimal("0.00"))
        self.assertIsNone(pos_transaction.Net_Tutar)

    def test_pos_hareketleri_relationship_with_sube(self):
        # Create a test branch
        sube = Sube(
            Sube_Adi="Test Branch",
            Aciklama="Test branch for POS transactions"
        )
        self.db.add(sube)
        self.db.commit()
        self.db.refresh(sube)

        # Create a POS transaction
        pos_transaction = POSHareketleri(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="EUR",
            Islem_Tutari=Decimal("750.00"),
            Kesinti_Tutari=Decimal("25.00"),
            Net_Tutar=Decimal("725.00"),
            Sube_ID=sube.Sube_ID
        )
        self.db.add(pos_transaction)
        self.db.commit()
        self.db.refresh(pos_transaction)

        # Verify the relationship
        self.assertEqual(pos_transaction.sube.Sube_Adi, "Test Branch")
        self.assertIn(pos_transaction, sube.pos_hareketleri)


if __name__ == "__main__":
    unittest.main()