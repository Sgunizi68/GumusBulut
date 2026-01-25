# Ödeme Kesinti Recalculation Design Document

## 1. Overview

The current implementation of the Ödeme Kesinti value calculation in the POS Kontrol Dashboard is incorrect. The system needs to be updated to properly calculate Ödeme Kesinti values based on the specified matching criteria.

This document outlines the design for correcting the Ödeme Kesinti calculation to properly match POS transactions with Odeme records based on the following criteria:
1. Find all POS transactions where `POS_Hareketleri.Islem_Tarihi = Tarih` (the screen date)
2. For each transaction, check if there is a matching Odeme record such that:
   - `Odeme.Kategori = "Kredi Kartı Komisyon ve BSMV Ödemesi"`
   - `POS_Hareketleri.Hesaba_Gecis = Odeme.Tarih`
   - `Odeme.Tutar < 0`
3. If matches are found, sum the absolute values of matching `Odeme.Tutar` entries to calculate the Ödeme Kesinti value displayed on the screen

## 2. Architecture

### 2.1 Current Implementation

The current POS Kontrol Dashboard implementation in `backend/db/crud.py` does not correctly calculate the Ödeme Kesinti values according to the specified requirements. The calculation needs to be updated to:
1. Use the correct category: "Kredi Kartı Komisyon ve BSMV Ödemesi"
2. Properly match POS transactions with Odeme records based on `POS_Hareketleri.Hesaba_Gecis = Odeme.Tarih`
3. Consider only negative `Odeme.Tutar` values
4. Calculate the sum of absolute values for the Ödeme Kesinti field

### 2.2 Proposed Implementation

The new implementation will:
1. Filter records by branch, period, and category 'Kredi Kartı Komisyon ve BSMV Ödemesi'
2. Match Odeme records by Hesaba_Gecis = Tarih
3. Include only negative Tutar values for accurate calculation
4. Sum the absolute values of matching Odeme.Tutar entries, ensuring no double-counting when multiple POS transactions share the same Hesaba_Gecis date

## 3. Data Models & ORM Mapping

### 3.1 Relevant Database Models

#### POSHareketleri Model
```python
class POSHareketleri(Base):
    __tablename__ = "POS_Hareketleri"
    
    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Islem_Tarihi = Column(Date, nullable=False)  # Used for matching
    Hesaba_Gecis = Column(Date, nullable=False)   # Used for matching with Odeme.Tarih
    Para_Birimi = Column(String(5), nullable=False)
    Islem_Tutari = Column(DECIMAL(15, 2), nullable=False)
    Kesinti_Tutari = Column(DECIMAL(15, 2), default=0.00)
    Net_Tutar = Column(DECIMAL(15, 2), nullable=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=True)
```

#### Odeme Model
```python
class Odeme(Base):
    __tablename__ = "Odeme"
    
    Odeme_ID = Column(Integer, primary_key=True, index=True)
    Tip = Column(String(50), nullable=False)
    Hesap_Adi = Column(String(50), nullable=False)
    Tarih = Column(Date, nullable=False)  # Used for matching with POSHareketleri.Hesaba_Gecis
    Aciklama = Column(String(200), nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False, default=0.00)  # Should be negative for deductions
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=True)
    Donem = Column(Integer, nullable=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), default=1)
    Kayit_Tarihi = Column(DateTime, default=func.now())
```

#### Kategori Model
```python
class Kategori(Base):
    __tablename__ = "Kategori"
    
    Kategori_ID = Column(Integer, primary_key=True, index=True)
    Kategori_Adi = Column(String(100), nullable=False)  # Will look for "Kredi Kartı Komisyon ve BSMV Ödemesi"
    Ust_Kategori_ID = Column(Integer, ForeignKey("UstKategori.UstKategori_ID"), nullable=True)
    Tip = Column(Enum('Gelir', 'Gider', 'Bilgi', 'Ödeme', 'Giden Fatura'), nullable=False)
    Aktif_Pasif = Column(Boolean, default=True)
    Gizli = Column(Boolean, default=False)
```

## 4. Business Logic Layer

### 4.1 Current Logic Issues

The current implementation in `get_pos_kontrol_dashboard_data` function has the following issues:
1. Uses incorrect category name
2. Matches records based on incorrect criteria
3. Doesn't filter for negative Tutar values
4. Doesn't calculate absolute values for the Ödeme Kesinti field

### 4.2 New Calculation Logic

The corrected implementation will follow these steps:

1. **Filter records by branch, period, and category 'Kredi Kartı Komisyon ve BSMV Ödemesi'**

2. **Match Odeme records by Hesaba_Gecis = Tarih**
3. **Include only negative Tutar values for accurate calculation**
4. **Sum the absolute values of matching Odeme.Tutar entries, ensuring no double-counting when multiple POS transactions share the same Hesaba_Gecis date**

## 5. API Endpoints Reference

### 5.1 Modified Endpoint
- **Endpoint**: `/pos-kontrol/{sube_id}/{donem}`
- **Method**: GET
- **Description**: Returns POS Kontrol Dashboard data with corrected Ödeme Kesinti calculation

### 5.2 Response Schema
The response structure remains the same, but the `Odeme_Kesinti` field will now contain the correctly calculated values:

```json
{
  "data": [
    {
      "Tarih": "2025-08-01",
      "Gelir_POS": 1000.00,
      "POS_Hareketleri": 1000.00,
      "POS_Kesinti": 20.00,
      "POS_Net": 980.00,
      "Odeme": 1000.00,
      "Odeme_Kesinti": 20.00,  // This value will be recalculated correctly
      "Odeme_Net": 980.00,
      "Kontrol_POS": "OK",
      "Kontrol_Kesinti": "OK",
      "Kontrol_Net": "OK"
    }
  ],
  "summary": {
    "total_records": 31,
    "successful_matches": 31,
    "error_matches": 0,
    "success_rate": "100%"
  }
}
```

## 6. Frontend Integration

The frontend component `POSKontrolDashboard.tsx` will continue to work with the same data structure. No changes are required on the frontend since the API response format remains unchanged, only the calculation logic is corrected.

## 7. Testing

### 7.1 Unit Tests

Unit tests should be added to verify the new calculation logic:

1. **Category Lookup Test**
   - Verify that the system correctly finds the "Kredi Kartı Komisyon ve BSMV Ödemesi" category
   - Test behavior when the category doesn't exist

2. **Matching Logic Test**
   - Test that POS transactions correctly match with Odeme records based on Hesaba_Gecis = Tarih
   - Verify that only negative Tutar values are considered
   - Test that absolute values are correctly calculated

3. **Edge Cases Test**
   - Test with no matching records
   - Test with multiple matching records for the same date
   - Test with zero values
   - Test with various date ranges

### 7.2 Integration Tests

Integration tests should verify that the complete flow works correctly:
1. API endpoint returns correctly calculated values
2. Frontend displays the values correctly
3. Summary statistics are accurate

## 8. Implementation Plan

### 8.1 Backend Changes
1. Modify the `get_pos_kontrol_dashboard_data` function in `backend/db/crud.py`
2. Update category lookup to use "Kredi Kartı Komisyon ve BSMV Ödemesi"
3. Implement correct matching logic based on Hesaba_Gecis = Tarih
4. Add filtering for negative Tutar values
5. Calculate absolute values for the Ödeme Kesinti field

### 8.2 Testing
1. Add unit tests for the new calculation logic
2. Run integration tests to verify the complete flow
3. Perform manual testing with sample data

### 8.3 Deployment
1. Deploy backend changes
2. Monitor for any issues in production
3. Verify that the dashboard displays correct values


























