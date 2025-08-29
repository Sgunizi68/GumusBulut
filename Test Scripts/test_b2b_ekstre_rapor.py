import unittest
from unittest.mock import Mock, patch
from decimal import Decimal
from sqlalchemy.orm import Session
from db.crud import get_b2b_ekstre_rapor
from db import models
from schemas.b2b_ekstre_rapor import B2BEkstreRaporResponse

class TestB2BEkstreRapor(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.db = Mock(spec=Session)
        self.donem_list = [2508, 2509]
        self.kategori_list = [1, 2]
        self.sube_id = 1

    def test_get_b2b_ekstre_rapor_empty_results(self):
        """Test get_b2b_ekstre_rapor with no records found."""
        # Mock the query to return empty results
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.outerjoin.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = []
        
        self.db.query.return_value = mock_query

        # Call the function
        result = get_b2b_ekstre_rapor(
            db=self.db,
            donem_list=self.donem_list,
            kategori_list=self.kategori_list,
            sube_id=self.sube_id
        )

        # Assertions
        self.assertIsInstance(result, B2BEkstreRaporResponse)
        self.assertEqual(len(result.data), 0)
        self.assertEqual(result.total_records, 0)
        self.assertEqual(result.totals.grand_total, Decimal('0'))

    def test_get_b2b_ekstre_rapor_with_records(self):
        """Test get_b2b_ekstre_rapor with records."""
        # Create mock B2B Ekstre records
        mock_ekstre1 = Mock(spec=models.B2BEkstre)
        mock_ekstre1.Ekstre_ID = 1
        mock_ekstre1.Tarih = '2025-08-01'
        mock_ekstre1.Fis_No = 'FIS001'
        mock_ekstre1.Aciklama = 'Test transaction 1'
        mock_ekstre1.Borc = Decimal('100.00')
        mock_ekstre1.Alacak = Decimal('50.00')
        mock_ekstre1.Donem = 2508
        mock_ekstre1.Kategori_ID = 1
        mock_ekstre1.Sube_ID = 1

        mock_ekstre2 = Mock(spec=models.B2BEkstre)
        mock_ekstre2.Ekstre_ID = 2
        mock_ekstre2.Tarih = '2025-08-02'
        mock_ekstre2.Fis_No = 'FIS002'
        mock_ekstre2.Aciklama = 'Test transaction 2'
        mock_ekstre2.Borc = Decimal('200.00')
        mock_ekstre2.Alacak = Decimal('75.00')
        mock_ekstre2.Donem = 2508
        mock_ekstre2.Kategori_ID = 1
        mock_ekstre2.Sube_ID = 1

        # Mock the query to return these records
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.outerjoin.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [mock_ekstre1, mock_ekstre2]
        
        self.db.query.return_value = mock_query

        # Mock category
        mock_kategori = Mock(spec=models.Kategori)
        mock_kategori.Kategori_ID = 1
        mock_kategori.Kategori_Adi = 'Test Category'

        # Mock category query
        mock_kategori_query = Mock()
        mock_kategori_query.filter.return_value = mock_kategori_query
        mock_kategori_query.all.return_value = [mock_kategori]
        
        # Mock the outerjoin to return category info
        mock_ekstre1.kategori = mock_kategori
        mock_ekstre2.kategori = mock_kategori

        # Call the function
        result = get_b2b_ekstre_rapor(
            db=self.db,
            donem_list=self.donem_list,
            kategori_list=self.kategori_list,
            sube_id=self.sube_id
        )

        # Assertions
        self.assertIsInstance(result, B2BEkstreRaporResponse)
        self.assertEqual(result.total_records, 2)
        self.assertEqual(result.totals.grand_total, Decimal('175.00'))  # (100-50) + (200-75)
        self.assertEqual(len(result.data), 1)  # One period group
        self.assertEqual(result.data[0].donem, 2508)
        self.assertEqual(result.data[0].donem_total, Decimal('175.00'))
        self.assertEqual(len(result.data[0].kategoriler), 1)  # One category group
        self.assertEqual(result.data[0].kategoriler[0].kategori_id, 1)
        self.assertEqual(result.data[0].kategoriler[0].kategori_adi, 'Test Category')
        self.assertEqual(result.data[0].kategoriler[0].kategori_total, Decimal('175.00'))
        self.assertEqual(len(result.data[0].kategoriler[0].kayitlar), 2)

    def test_get_b2b_ekstre_rapor_with_uncategorized_records(self):
        """Test get_b2b_ekstre_rapor with uncategorized records."""
        # Create mock B2B Ekstre record without category
        mock_ekstre = Mock(spec=models.B2BEkstre)
        mock_ekstre.Ekstre_ID = 1
        mock_ekstre.Tarih = '2025-08-01'
        mock_ekstre.Fis_No = 'FIS001'
        mock_ekstre.Aciklama = 'Test transaction'
        mock_ekstre.Borc = Decimal('100.00')
        mock_ekstre.Alacak = Decimal('50.00')
        mock_ekstre.Donem = 2508
        mock_ekstre.Kategori_ID = None
        mock_ekstre.Sube_ID = 1

        # Mock the query to return this record
        mock_query = Mock()
        mock_query.filter.return_value = mock_query
        mock_query.outerjoin.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = [mock_ekstre]
        
        self.db.query.return_value = mock_query

        # Mock the outerjoin to return None for category
        mock_ekstre.kategori = None

        # Call the function with -1 in kategori_list to include uncategorized
        result = get_b2b_ekstre_rapor(
            db=self.db,
            donem_list=self.donem_list,
            kategori_list=[-1],  # Include uncategorized
            sube_id=self.sube_id
        )

        # Assertions
        self.assertIsInstance(result, B2BEkstreRaporResponse)
        self.assertEqual(result.total_records, 1)
        self.assertEqual(result.totals.grand_total, Decimal('50.00'))  # 100-50
        self.assertEqual(len(result.data), 1)
        self.assertEqual(result.data[0].donem, 2508)
        self.assertEqual(len(result.data[0].kategoriler), 1)
        self.assertIsNone(result.data[0].kategoriler[0].kategori_id)
        self.assertEqual(result.data[0].kategoriler[0].kategori_adi, 'Kategorilendirilmemiş')

    @patch('db.crud.logging')
    def test_get_b2b_ekstre_rapor_exception_handling(self, mock_logging):
        """Test get_b2b_ekstre_rapor handles exceptions gracefully."""
        # Mock the query to raise an exception
        mock_query = Mock()
        mock_query.filter.side_effect = Exception("Database error")
        self.db.query.return_value = mock_query

        # Call the function
        result = get_b2b_ekstre_rapor(
            db=self.db,
            donem_list=self.donem_list,
            kategori_list=self.kategori_list,
            sube_id=self.sube_id
        )

        # Assertions
        self.assertIsInstance(result, B2BEkstreRaporResponse)
        self.assertEqual(len(result.data), 0)
        self.assertEqual(result.total_records, 0)
        self.assertEqual(result.totals.grand_total, Decimal('0'))
        mock_logging.getLogger.return_value.error.assert_called()

if __name__ == '__main__':
    unittest.main()