import unittest
from datetime import date
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.database import Base
from db import crud
from db.models import Sube
from schemas.pos_hareketleri import POSHareketleriCreate, POSHareketleriUpdate


class TestPOSHareketleriCRUD(unittest.TestCase):
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
            Aciklama="Test branch for POS transactions"
        )
        self.db.add(self.sube)
        self.db.commit()
        self.db.refresh(self.sube)

    def tearDown(self):
        self.db.close()

    def test_create_pos_hareket(self):
        # Test creating a single POS transaction
        pos_data = POSHareketleriCreate(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID
        )

        created_pos = crud.create_pos_hareket(self.db, pos_data)

        self.assertEqual(created_pos.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(created_pos.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(created_pos.Para_Birimi, "TRY")
        self.assertEqual(created_pos.Islem_Tutari, Decimal("1000.00"))
        self.assertEqual(created_pos.Kesinti_Tutari, Decimal("50.00"))
        self.assertEqual(created_pos.Net_Tutar, Decimal("950.00"))
        self.assertEqual(created_pos.Sube_ID, self.sube.Sube_ID)
        self.assertIsNotNone(created_pos.ID)

    def test_create_pos_hareket_with_auto_net_tutar(self):
        # Test creating a POS transaction with automatic Net_Tutar calculation
        pos_data = POSHareketleriCreate(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="USD",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Sube_ID=self.sube.Sube_ID
            # Net_Tutar is not provided, should be calculated automatically
        )

        created_pos = crud.create_pos_hareket(self.db, pos_data)

        self.assertEqual(created_pos.Islem_Tutari, Decimal("1000.00"))
        self.assertEqual(created_pos.Kesinti_Tutari, Decimal("50.00"))
        self.assertEqual(created_pos.Net_Tutar, Decimal("950.00"))  # Should be calculated

    def test_get_pos_hareket(self):
        # First create a POS transaction
        pos_data = POSHareketleriCreate(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="EUR",
            Islem_Tutari=Decimal("500.00"),
            Kesinti_Tutari=Decimal("25.00"),
            Net_Tutar=Decimal("475.00"),
            Sube_ID=self.sube.Sube_ID
        )

        created_pos = crud.create_pos_hareket(self.db, pos_data)

        # Test retrieving the POS transaction
        retrieved_pos = crud.get_pos_hareket(self.db, created_pos.ID)

        self.assertEqual(retrieved_pos.ID, created_pos.ID)
        self.assertEqual(retrieved_pos.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(retrieved_pos.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(retrieved_pos.Para_Birimi, "EUR")
        self.assertEqual(retrieved_pos.Islem_Tutari, Decimal("500.00"))
        self.assertEqual(retrieved_pos.Kesinti_Tutari, Decimal("25.00"))
        self.assertEqual(retrieved_pos.Net_Tutar, Decimal("475.00"))
        self.assertEqual(retrieved_pos.Sube_ID, self.sube.Sube_ID)

    def test_get_pos_hareketleri(self):
        # Create multiple POS transactions
        for i in range(3):
            pos_data = POSHareketleriCreate(
                Islem_Tarihi=date(2023, 1, 15 + i),
                Hesaba_Gecis=date(2023, 1, 16 + i),
                Para_Birimi="TRY",
                Islem_Tutari=Decimal(f"{1000 + i * 100}.00"),
                Kesinti_Tutari=Decimal(f"{50 + i * 5}.00"),
                Net_Tutar=Decimal(f"{950 + i * 95}.00"),
                Sube_ID=self.sube.Sube_ID
            )
            crud.create_pos_hareket(self.db, pos_data)

        # Test retrieving all POS transactions
        pos_list = crud.get_pos_hareketleri(self.db, skip=0, limit=100)

        self.assertEqual(len(pos_list), 3)

        # Test pagination
        pos_list_paginated = crud.get_pos_hareketleri(self.db, skip=1, limit=2)
        self.assertEqual(len(pos_list_paginated), 2)

    def test_update_pos_hareket(self):
        # First create a POS transaction
        pos_data = POSHareketleriCreate(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="TRY",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Net_Tutar=Decimal("950.00"),
            Sube_ID=self.sube.Sube_ID
        )

        created_pos = crud.create_pos_hareket(self.db, pos_data)

        # Test updating the POS transaction
        update_data = POSHareketleriUpdate(
            Islem_Tutari=Decimal("1200.00"),
            Kesinti_Tutari=Decimal("60.00"),
            Net_Tutar=Decimal("1140.00")
        )

        updated_pos = crud.update_pos_hareket(self.db, created_pos.ID, update_data)

        self.assertEqual(updated_pos.Islem_Tutari, Decimal("1200.00"))
        self.assertEqual(updated_pos.Kesinti_Tutari, Decimal("60.00"))
        self.assertEqual(updated_pos.Net_Tutar, Decimal("1140.00"))
        # Other fields should remain unchanged
        self.assertEqual(updated_pos.Islem_Tarihi, date(2023, 1, 15))
        self.assertEqual(updated_pos.Hesaba_Gecis, date(2023, 1, 16))
        self.assertEqual(updated_pos.Para_Birimi, "TRY")
        self.assertEqual(updated_pos.Sube_ID, self.sube.Sube_ID)

    def test_update_pos_hareket_with_auto_net_tutar(self):
        # First create a POS transaction
        pos_data = POSHareketleriCreate(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="USD",
            Islem_Tutari=Decimal("1000.00"),
            Kesinti_Tutari=Decimal("50.00"),
            Sube_ID=self.sube.Sube_ID
        )

        created_pos = crud.create_pos_hareket(self.db, pos_data)

        # Test updating with automatic Net_Tutar calculation
        update_data = POSHareketleriUpdate(
            Islem_Tutari=Decimal("1200.00"),
            Kesinti_Tutari=Decimal("60.00")
            # Net_Tutar is not provided, should be calculated automatically
        )

        updated_pos = crud.update_pos_hareket(self.db, created_pos.ID, update_data)

        self.assertEqual(updated_pos.Islem_Tutari, Decimal("1200.00"))
        self.assertEqual(updated_pos.Kesinti_Tutari, Decimal("60.00"))
        self.assertEqual(updated_pos.Net_Tutar, Decimal("1140.00"))  # Should be calculated

    def test_delete_pos_hareket(self):
        # First create a POS transaction
        pos_data = POSHareketleriCreate(
            Islem_Tarihi=date(2023, 1, 15),
            Hesaba_Gecis=date(2023, 1, 16),
            Para_Birimi="EUR",
            Islem_Tutari=Decimal("500.00"),
            Kesinti_Tutari=Decimal("25.00"),
            Net_Tutar=Decimal("475.00"),
            Sube_ID=self.sube.Sube_ID
        )

        created_pos = crud.create_pos_hareket(self.db, pos_data)

        # Test deleting the POS transaction
        deleted_pos = crud.delete_pos_hareket(self.db, created_pos.ID)

        self.assertIsNotNone(deleted_pos)

        # Verify it's deleted
        retrieved_pos = crud.get_pos_hareket(self.db, created_pos.ID)
        self.assertIsNone(retrieved_pos)

    def test_create_pos_hareketleri_bulk(self):
        # Test creating multiple POS transactions
        pos_data_list = [
            POSHareketleriCreate(
                Islem_Tarihi=date(2023, 1, 15),
                Hesaba_Gecis=date(2023, 1, 16),
                Para_Birimi="TRY",
                Islem_Tutari=Decimal("1000.00"),
                Kesinti_Tutari=Decimal("50.00"),
                Net_Tutar=Decimal("950.00"),
                Sube_ID=self.sube.Sube_ID
            ),
            POSHareketleriCreate(
                Islem_Tarihi=date(2023, 1, 16),
                Hesaba_Gecis=date(2023, 1, 17),
                Para_Birimi="USD",
                Islem_Tutari=Decimal("2000.00"),
                Kesinti_Tutari=Decimal("100.00"),
                Net_Tutar=Decimal("1900.00"),
                Sube_ID=self.sube.Sube_ID
            )
        ]

        result = crud.create_pos_hareketleri_bulk(self.db, pos_data_list)

        self.assertEqual(result["added"], 2)
        self.assertEqual(result["skipped"], 0)

        # Verify the transactions were created
        pos_list = crud.get_pos_hareketleri(self.db, skip=0, limit=100)
        self.assertEqual(len(pos_list), 2)


if __name__ == "__main__":
    unittest.main()