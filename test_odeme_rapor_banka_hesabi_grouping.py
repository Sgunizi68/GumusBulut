import unittest
from unittest.mock import Mock, patch
from decimal import Decimal
from backend.db.crud import get_odeme_rapor
from backend.schemas.odeme_rapor import OdemeRaporResponse

class TestOdemeRaporBankaHesabiGrouping(unittest.TestCase):
    
    def setUp(self):
        # Create mock database session
        self.mock_db = Mock()
        
        # Create mock Odeme records with different bank accounts
        self.mock_odeme_records = [
            Mock(
                Odeme_ID=1,
                Tip="Banka Ödeme",
                Hesap_Adi="Ziraat Bankası",
                Tarih="2023-01-15",
                Aciklama="Kira ödemesi",
                Tutar=Decimal("5000.00"),
                Kategori_ID=1,
                Donem=2301,
                Sube_ID=1
            ),
            Mock(
                Odeme_ID=2,
                Tip="Banka Ödeme",
                Hesap_Adi="Ziraat Bankası",
                Tarih="2023-01-20",
                Aciklama="Elektrik faturası",
                Tutar=Decimal("1500.00"),
                Kategori_ID=1,
                Donem=2301,
                Sube_ID=1
            ),
            Mock(
                Odeme_ID=3,
                Tip="Banka Ödeme",
                Hesap_Adi="İş Bankası",
                Tarih="2023-01-10",
                Aciklama="Malzeme alışverişi",
                Tutar=Decimal("3000.00"),
                Kategori_ID=1,
                Donem=2301,
                Sube_ID=1
            ),
            Mock(
                Odeme_ID=4,
                Tip="Nakit Ödeme",
                Hesap_Adi="Kasa",
                Tarih="2023-01-05",
                Aciklama="Minibüs kirası",
                Tutar=Decimal("2000.00"),
                Kategori_ID=2,
                Donem=2301,
                Sube_ID=1
            ),
        ]
        
        # Create mock Kategori records
        self.mock_kategori_records = [
            Mock(Kategori_ID=1, Kategori_Adi="Kira"),
            Mock(Kategori_ID=2, Kategori_Adi="Araç Giderleri")
        ]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.outerjoin.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = self.mock_odeme_records
        
        self.mock_db.query.return_value = mock_query
        
        # Setup mock for kategori query
        mock_kategori_query = Mock()
        mock_kategori_query.filter.return_value = mock_kategori_query
        mock_kategori_query.all.return_value = self.mock_kategori_records
        
        # Make the kategori query return the right mock based on the model
        def query_side_effect(model):
            if hasattr(model, '__name__') and model.__name__ == 'Kategori':
                return mock_kategori_query
            return mock_query
            
        self.mock_db.query.side_effect = query_side_effect

    @patch('backend.db.crud.logging')
    def test_banka_hesabi_grouping(self, mock_logging):
        # Call the function
        result = get_odeme_rapor(self.mock_db, donem_list=[2301], sube_id=1)
        
        # Verify the result is an OdemeRaporResponse
        self.assertIsInstance(result, OdemeRaporResponse)
        
        # Verify we have data
        self.assertGreater(len(result.data), 0)
        
        # Check the structure of the response
        donem_group = result.data[0]
        self.assertEqual(donem_group.donem, 2301)
        
        # Check category grouping
        self.assertEqual(len(donem_group.kategoriler), 2)
        
        # Find the "Kira" category group
        kira_kategori = None
        for kategori in donem_group.kategoriler:
            if kategori.kategori_adi == "Kira":
                kira_kategori = kategori
                break
        
        self.assertIsNotNone(kira_kategori)
        
        # Check bank account grouping within "Kira" category
        self.assertEqual(len(kira_kategori.banka_hesaplari), 2)
        
        # Check Ziraat Bankası group
        ziraat_group = None
        is_bankasi_group = None
        for banka_hesabi in kira_kategori.banka_hesaplari:
            if banka_hesabi.hesap_adi == "Ziraat Bankası":
                ziraat_group = banka_hesabi
            elif banka_hesabi.hesap_adi == "İş Bankası":
                is_bankasi_group = banka_hesabi
        
        # Verify both bank accounts are present
        self.assertIsNotNone(ziraat_group)
        self.assertIsNotNone(is_bankasi_group)
        
        # Check Ziraat Bankası details
        self.assertEqual(ziraat_group.hesap_total, Decimal("6500.00"))  # 5000 + 1500
        self.assertEqual(ziraat_group.record_count, 2)
        self.assertEqual(len(ziraat_group.details), 2)
        
        # Check İş Bankası details
        self.assertEqual(is_bankasi_group.hesap_total, Decimal("3000.00"))
        self.assertEqual(is_bankasi_group.record_count, 1)
        self.assertEqual(len(is_bankasi_group.details), 1)
        
        # Check Kasa (Nakit) group in Araç Giderleri category
        arac_giderleri_kategori = None
        for kategori in donem_group.kategoriler:
            if kategori.kategori_adi == "Araç Giderleri":
                arac_giderleri_kategori = kategori
                break
        
        self.assertIsNotNone(arac_giderleri_kategori)
        self.assertEqual(len(arac_giderleri_kategori.banka_hesaplari), 1)
        
        kasa_group = arac_giderleri_kategori.banka_hesaplari[0]
        self.assertEqual(kasa_group.hesap_adi, "Kasa")
        self.assertEqual(kasa_group.hesap_total, Decimal("2000.00"))
        self.assertEqual(kasa_group.record_count, 1)

if __name__ == '__main__':
    unittest.main()