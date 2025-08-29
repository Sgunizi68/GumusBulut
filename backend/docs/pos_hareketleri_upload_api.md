# POS_Hareketleri Excel Upload API

## Overview

This document describes the implementation of the Excel upload feature for the POS_Hareketleri table. The feature allows users to upload Excel files containing POS transaction data, which will then be parsed and inserted into the database with duplicate detection.

## API Endpoint

```
POST /api/v1/pos-hareketleri/upload/
```

### Parameters

- `sube_id` (Form Data): Integer - Branch ID for the records
- `file` (Form Data): File - Excel file containing POS transaction data (.xls or .xlsx)

### Request Format

```
Content-Type: multipart/form-data
```

### Response Format

Success (201 Created):
```json
{
  "message": "POS transactions file processed successfully.",
  "added": <number_of_records_added>,
  "skipped": <number_of_records_skipped>
}
```

### Error Responses

- 400 Bad Request: Invalid file type or missing parameters
- 500 Internal Server Error: Processing error

## Data Model

### POS_Hareketleri Table

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| ID | Integer | Auto | Primary key |
| Islem_Tarihi | Date | Yes | Transaction date |
| Hesaba_Gecis | Date | Yes | Account transfer date |
| Para_Birimi | String(5) | Yes | Currency code |
| Islem_Tutari | DECIMAL(15,2) | Yes | Transaction amount |
| Kesinti_Tutari | DECIMAL(15,2) | No | Deduction amount |
| Net_Tutar | DECIMAL(15,2) | No | Net amount |
| Sube_ID | Integer | Yes | Branch ID (Foreign Key) |
| Kayit_Tarihi | DateTime | No | Record creation timestamp |

### Excel Data Mapping

The Excel file should contain columns that map to the POS_Hareketleri fields:

| Excel Column | Database Field | Required | Format |
|--------------|----------------|----------|--------|
| Islem_Tarihi | Islem_Tarihi | Yes | Date |
| Hesaba_Gecis | Hesaba_Gecis | Yes | Date |
| Para_Birimi | Para_Birimi | Yes | String (e.g., "TRY") |
| Islem_Tutari | Islem_Tutari | Yes | Numeric |
| Kesinti_Tutari | Kesinti_Tutari | No | Numeric |
| Net_Tutar | Net_Tutar | No | Numeric |

## Duplicate Detection Logic

To prevent duplicate uploads, the system checks for existing records with the same:
- Islem_Tarihi
- Hesaba_Gecis
- Para_Birimi
- Islem_Tutari
- Sube_ID

If a record with these matching fields is found, the new record is skipped.

## Implementation Details

### Backend Implementation

1. **File Validation**: Only .xls and .xlsx files are accepted
2. **Excel Parsing**: Uses pandas with openpyxl engine for parsing
3. **Data Validation**: Validates required fields and data types
4. **Duplicate Detection**: Checks for existing records before insertion
5. **Bulk Insert**: Uses optimized bulk insert operations

### Key Functions

- `is_duplicate_pos_hareket()`: Checks if a POS_Hareketleri record is a duplicate
- `create_pos_hareket()`: Creates a single POS_Hareketleri record with duplicate checking
- `create_pos_hareketleri_bulk()`: Creates multiple POS_Hareketleri records with duplicate checking

## Security Considerations

- File type validation to ensure only Excel files are processed
- Authentication required (same as other POS_Hareketleri endpoints)
- Role-based access control enforced

## Performance Considerations

- Processes Excel files row by row to manage memory usage
- Uses database indexing for efficient duplicate detection
- Provides progress feedback for long-running operations