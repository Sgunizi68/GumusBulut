import unittest
import json
from datetime import date, datetime
from decimal import Decimal

import sys
import os

# Add the project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import unittest
import json
from datetime import date, datetime
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.main import app
from backend.db.database import Base, get_db
from backend.db import crud
from backend.db.models import Sube, Kullanici, Rol, KullaniciRol
from backend.core.security import get_password_hash
from backend.schemas import gelir_ekstra



# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency for testing
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestGelirEkstraAPI(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)
        self.db = TestingSessionLocal()

        # Create a test Sube
        self.sube = Sube(Sube_Adi="Test Sube", Aciklama="Test Subesi")
        self.db.add(self.sube)
        self.db.commit()
        self.db.refresh(self.sube)

        # Create a test user and role for authentication
        self.test_user = Kullanici(
            Adi_Soyadi="Test User",
            Kullanici_Adi="testuser",
            Password=get_password_hash("testpassword"),
            Email="test@example.com",
            Aktif_Pasif=True
        )
        self.db.add(self.test_user)
        self.db.commit()
        self.db.refresh(self.test_user)

        self.test_role = Rol(Rol_Adi="Admin", Aciklama="Admin Role", Aktif_Pasif=True)
        self.db.add(self.test_role)
        self.db.commit()
        self.db.refresh(self.test_role)

        self.user_role = KullaniciRol(
            Kullanici_ID=self.test_user.Kullanici_ID,
            Rol_ID=self.test_role.Rol_ID,
            Sube_ID=self.sube.Sube_ID,
            Aktif_Pasif=True
        )
        self.db.add(self.user_role)
        self.db.commit()

        # Obtain a token for the test user
        response = self.client.post(
            "/api/v1/token",
            data={"username": "testuser", "password": "testpassword"}
        )
        self.assertEqual(response.status_code, 200)
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def tearDown(self):
        Base.metadata.drop_all(bind=engine)
        self.db.close()

    def test_create_gelir_ekstra(self):
        gelir_ekstra_data = {
            "Sube_ID": self.sube.Sube_ID,
            "Tarih": "2025-01-01",
            "RobotPos_Tutar": 100.50,
            "ZRapor_Tutar": 90.00,
            "Tabak_Sayisi": 5
        }
        response = self.client.post("/api/v1/gelir-ekstra/", json=gelir_ekstra_data, headers=self.headers)
        self.assertEqual(response.status_code, 201, f"Response: {response.json()}")
        data = response.json()
        self.assertEqual(data["Sube_ID"], self.sube.Sube_ID)
        self.assertEqual(data["Tarih"], "2025-01-01")
        self.assertEqual(float(data["RobotPos_Tutar"]), 100.50)
        self.assertEqual(float(data["ZRapor_Tutar"]), 90.00)
        self.assertEqual(data["Tabak_Sayisi"], 5)

    def test_read_gelir_ekstra(self):
        # First create an entry
        gelir_ekstra_data = {
            "Sube_ID": self.sube.Sube_ID,
            "Tarih": "2025-01-02",
            "RobotPos_Tutar": 200.00,
            "ZRapor_Tutar": 180.00,
            "Tabak_Sayisi": 10
        }
        create_response = self.client.post("/api/v1/gelir-ekstra/", json=gelir_ekstra_data, headers=self.headers)
        self.assertEqual(create_response.status_code, 201)
        gelir_ekstra_id = create_response.json()["GelirEkstra_ID"]

        # Then read it
        response = self.client.get(f"/api/v1/gelir-ekstra/{gelir_ekstra_id}", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["GelirEkstra_ID"], gelir_ekstra_id)
        self.assertEqual(data["Sube_ID"], self.sube.Sube_ID)
        self.assertEqual(data["Tarih"], "2025-01-02")
        self.assertEqual(float(data["RobotPos_Tutar"]), 200.00)
        self.assertEqual(float(data["ZRapor_Tutar"]), 180.00)
        self.assertEqual(data["Tabak_Sayisi"], 10)

    def test_update_gelir_ekstra(self):
        # First create an entry
        gelir_ekstra_data = {
            "Sube_ID": self.sube.Sube_ID,
            "Tarih": "2025-01-03",
            "RobotPos_Tutar": 300.00,
            "ZRapor_Tutar": 270.00,
            "Tabak_Sayisi": 15
        }
        create_response = self.client.post("/api/v1/gelir-ekstra/", json=gelir_ekstra_data, headers=self.headers)
        self.assertEqual(create_response.status_code, 201)
        gelir_ekstra_id = create_response.json()["GelirEkstra_ID"]

        # Then update it
        update_data = {
            "RobotPos_Tutar": 350.00,
            "Tabak_Sayisi": 20
        }
        response = self.client.put(f"/api/v1/gelir-ekstra/{gelir_ekstra_id}", json=update_data, headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["GelirEkstra_ID"], gelir_ekstra_id)
        self.assertEqual(float(data["RobotPos_Tutar"]), 350.00)
        self.assertEqual(data["Tabak_Sayisi"], 20)
        # Ensure other fields are unchanged
        self.assertEqual(data["Tarih"], "2025-01-03")
        self.assertEqual(float(data["ZRapor_Tutar"]), 270.00)

    def test_read_gelir_ekstralar(self):
        # Create multiple entries
        gelir_ekstra_data1 = {
            "Sube_ID": self.sube.Sube_ID,
            "Tarih": "2025-01-04",
            "RobotPos_Tutar": 400.00,
            "ZRapor_Tutar": 360.00,
            "Tabak_Sayisi": 25
        }
        gelir_ekstra_data2 = {
            "Sube_ID": self.sube.Sube_ID,
            "Tarih": "2025-01-05",
            "RobotPos_Tutar": 500.00,
            "ZRapor_Tutar": 450.00,
            "Tabak_Sayisi": 30
        }
        self.client.post("/api/v1/gelir-ekstra/", json=gelir_ekstra_data1, headers=self.headers)
        self.client.post("/api/v1/gelir-ekstra/", json=gelir_ekstra_data2, headers=self.headers)

        response = self.client.get("/api/v1/gelir-ekstra/", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 2)
        # Check if Tabak_Sayisi is present in one of the entries
        found_tabak_sayisi = False
        for entry in data:
            if entry.get("Tabak_Sayisi") == 25:
                found_tabak_sayisi = True
                break
        self.assertTrue(found_tabak_sayisi)

    def test_delete_gelir_ekstra(self):
        # First create an entry
        gelir_ekstra_data = {
            "Sube_ID": self.sube.Sube_ID,
            "Tarih": "2025-01-06",
            "RobotPos_Tutar": 600.00,
            "ZRapor_Tutar": 540.00,
            "Tabak_Sayisi": 35
        }
        create_response = self.client.post("/api/v1/gelir-ekstra/", json=gelir_ekstra_data, headers=self.headers)
        self.assertEqual(create_response.status_code, 201)
        gelir_ekstra_id = create_response.json()["GelirEkstra_ID"]

        # Then delete it
        response = self.client.delete(f"/api/v1/gelir-ekstra/{gelir_ekstra_id}", headers=self.headers)
        self.assertEqual(response.status_code, 204)

        # Verify it's deleted
        get_response = self.client.get(f"/api/v1/gelir-ekstra/{gelir_ekstra_id}", headers=self.headers)
        self.assertEqual(get_response.status_code, 404)

if __name__ == "__main__":
    unittest.main()
