# POS Kontrol Dashboard Report Design Document

## 1. Overview

The POS Kontrol Dashboard is a new report that will be added to the "Rapor" menu section, right after the "Nakit Yatırma Kontrol Raporu". This dashboard will display daily data for a selected period (YYMM format) and compare values from the Gelir table (where Kategori = "POS") with values from the POS_Hareketleri table to verify data consistency.

The dashboard will show:
- All days of the selected "Donem" (period)
- POS Gelir values from the Gelir table with Kategori = "POS" for each "Tarih"
- POS Hareketleri values as the sum of Islem_Tutari in the POS_Hareketleri table for each date
- POS Kesinti values as the sum of Kesinti_Tutari in the POS_Hareketleri table for each date
- POS Net values as the sum of Net_Tutar in the POS_Hareketleri table for each date
- Kontrol column showing OK if numbers on the left and right sides are equal, otherwise not OK
- Odeme columns (to be implemented in a next step)

## 2. Architecture

### 2.1 Backend Architecture

The backend will consist of:
1. A new API endpoint in the report module to fetch and aggregate POS control data
2. Database queries to retrieve data from both Gelir and POS_Hareketleri tables
3. Data aggregation and comparison logic to determine matching status

### 2.2 Frontend Architecture

The frontend will consist of:
1. A new React component for the POS Kontrol Dashboard page
2. Integration with the existing menu system and routing
3. Period selection functionality with default to current period
4. Data display in a table format similar to the provided mockup
5. Visual indicators for matching/non-matching records
6. Export functionality (PDF/Excel)

## 3. API Endpoints Reference

### 3.1 POS Kontrol Dashboard Endpoint

**GET** `/api/v1/reports/pos-kontrol/{sube_id}/{donem}`

**Description**: Fetches POS control data for a specific branch and period

**Path Parameters**:
- `sube_id` (integer): Branch ID
- `donem` (integer): Period in YYMM format (e.g., 2508 for August 2025)

**Response**:
```json
{
  "data": [
    {
      "Tarih": "2025-08-01",
      "Gelir_POS": 1500.00,
      "POS_Hareketleri": 1500.00,
      "POS_Kesinti": 75.00,
      "POS_Net": 1425.00,
      "Odeme": null,
      "Odeme_Kesinti": null,
      "Odeme_Net": null,
      "Kontrol_POS": "OK",
      "Kontrol_Kesinti": "OK",
      "Kontrol_Net": "OK"
    }
  ],
  "summary": {
    "total_records": 1,
    "successful_matches": 1,
    "error_matches": 0,
    "success_rate": "100%"
  }
}
```

## 4. Data Models & ORM Mapping

### 4.1 Gelir Model (Existing)
```python
class Gelir(Base):
    __tablename__ = "Gelir"

    Gelir_ID = Column(Integer, primary_key=True, index=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Tarih = Column(Date, nullable=False)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())
```

### 4.2 POSHareketleri Model (Existing)
```python
class POSHareketleri(Base):
    __tablename__ = "POS_Hareketleri"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Islem_Tarihi = Column(Date, nullable=False)
    Hesaba_Gecis = Column(Date, nullable=False)
    Para_Birimi = Column(String(5), nullable=False)
    Islem_Tutari = Column(DECIMAL(15, 2), nullable=False)
    Kesinti_Tutari = Column(DECIMAL(15, 2), default=0.00)
    Net_Tutar = Column(DECIMAL(15, 2), nullable=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=True)
```

### 4.3 Kategori Model (Existing)
```python
class Kategori(Base):
    __tablename__ = "Kategori"

    Kategori_ID = Column(Integer, primary_key=True, index=True)
    Kategori_Adi = Column(String(100), nullable=False)
    Ust_Kategori_ID = Column(Integer, ForeignKey("UstKategori.UstKategori_ID"), nullable=True)
    Tip = Column(Enum('Gelir', 'Gider', 'Bilgi', 'Ödeme', 'Giden Fatura'), nullable=False)
    Aktif_Pasif = Column(Boolean, default=True)
    Gizli = Column(Boolean, default=False)
```

## 5. Business Logic Layer

### 5.1 Data Retrieval and Aggregation Logic

1. **Data Retrieval**:
   - Query Gelir table for records where:
     - Sube_ID matches the selected branch
     - Tarih falls within the selected period (Donem)
     - Kategori_ID corresponds to a category with Kategori_Adi = "POS"
   - Query POS_Hareketleri table for records where:
     - Sube_ID matches the selected branch
     - Islem_Tarihi falls within the selected period

2. **Data Aggregation**:
   - For each date in the period:
     - Aggregate Gelir POS values by summing Tutar where Kategori = "POS"
     - Aggregate POS_Hareketleri values by summing:
       - Islem_Tutari (POS Hareketleri)
       - Kesinti_Tutari (POS Kesinti)
       - Net_Tutar (POS Net)

3. **Data Matching**:
   - Compare aggregated values for each date:
     - Gelir POS vs POS Hareketleri
     - POS Kesinti (no comparison initially)
     - POS Net (no comparison initially)
   - Mark as "OK" if values match within tolerance (0.01), otherwise "Not OK"

### 5.2 Response Structure

The API will return a structured response containing:
1. **Daily Data**: Array of objects with:
   - Date
   - All required financial values
   - Comparison results for each value pair
2. **Summary Data**: Overall statistics including:
   - Total records
   - Successful matches
   - Error matches
   - Success rate

### 5.3 Period Handling

1. Default period is current period in YYMM format (e.g., 2508 for August 2025)
2. Support for selecting different periods from a dropdown
3. Display all days in the selected period, even if no data exists for some days

## 6. Frontend Implementation

### 6.1 Component Structure

```
POSKontrolDashboardPage
├── FilterSection
│   └── PeriodSelector
├── SummaryStatistics
└── DataTable
    ├── GelirPOSColumn
    ├── POSHareketleriColumn
    ├── POSKesintiColumn
    ├── POSNetColumn
    └── KontrolIndicators
```

### 6.2 Menu Integration

The new report will be added to the MENU_GROUPS array in `constants.tsx`:

```typescript
{
    title: 'Rapor',
    items: [
        // ... existing items
        { label: 'Nakit Yatırma Kontrol Raporu', path: '/nakit-yatirma-raporu', icon: Icons.Report, permission: NAKIT_YATIRMA_RAPORU_YETKI_ADI },
        { label: 'POS Kontrol Dashboard', path: '/pos-kontrol-dashboard', icon: Icons.Report, permission: POS_KONTROL_DASHBOARD_YETKI_ADI },
        // ... other reports
    ]
}
```

### 6.3 Permission System

A new permission constant will be added:
```typescript
export const POS_KONTROL_DASHBOARD_YETKI_ADI = 'POS Kontrol Dashboard Görüntüleme';
```

### 6.4 UI Components

1. **Period Selection**: Dropdown to select period (YYMM format)
2. **Summary Cards**: Display total records, successful matches, error matches, and success rate
3. **Data Table**: Main table showing daily data with comparison indicators
4. **Export Buttons**: PDF and Excel export functionality

## 7. Testing

### 7.1 Backend Testing

1. Unit tests for data retrieval functions:
   - Test Gelir POS data retrieval with various date ranges
   - Test POS_Hareketleri data aggregation
   - Test edge cases (no data, partial data)

2. Unit tests for comparison logic:
   - Test matching values within tolerance
   - Test non-matching values
   - Test edge cases (zero values, null values)

### 7.2 Frontend Testing

1. Component rendering tests:
   - Test dashboard with various data scenarios
   - Test filter functionality
   - Test export functionality

2. Integration tests:
   - Test API data fetching and display
   - Test permission-based access control
   - Test responsive design across different screen sizes

## 8. Deployment Considerations

1. Add new permission to database during deployment
2. Update menu configuration in frontend
3. Ensure proper error handling for cases where POS category doesn't exist
4. Performance optimization for large date ranges