# POS Hareketleri Excel Upload API

## Endpoint

```
POST /api/v1/pos-hareketleri/upload/
```

## Description

This endpoint allows uploading POS transaction data in Excel format (.xlsx or .xls). The uploaded data will be parsed and inserted into the database, with duplicate records being skipped automatically.

## Request

### Headers

```
Content-Type: multipart/form-data
```

### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sube_id | integer | Yes | The branch ID to associate with the uploaded records |
| file | file | Yes | The Excel file containing POS transaction data |

### Excel File Format

The Excel file should contain the following columns:

| Column Name | Required | Data Type | Description |
|-------------|----------|-----------|-------------|
| Islem_Tarihi | Yes | Date | Transaction date (format: DD.MM.YYYY) |
| Hesaba_Gecis | Yes | Date | Account transfer date (format: DD.MM.YYYY) |
| Para_Birimi | Yes | String (5 chars max) | Currency code (e.g., "TRY", "USD") |
| Islem_Tutari | Yes | Decimal | Transaction amount |
| Kesinti_Tutari | No | Decimal | Deduction amount (default: 0.00) |
| Net_Tutar | No | Decimal | Net amount |

## Response

### Success (200 OK)

```json
{
  "message": "POS transactions file processed successfully.",
  "added": 0,
  "skipped": 0
}
```

### Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 Bad Request | Invalid file type or missing parameters |
| 400 Bad Request | Error reading Excel file |
| 500 Internal Server Error | Processing error |

## Example Usage

### cURL

```bash
curl -X POST "http://localhost:8000/api/v1/pos-hareketleri/upload/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "sube_id=1" \
  -F "file=@pos_transactions.xlsx"
```

### Python (requests)

```python
import requests

url = "http://localhost:8000/api/v1/pos-hareketleri/upload/"
files = {'file': open('pos_transactions.xlsx', 'rb')}
data = {'sube_id': 1}

response = requests.post(url, files=files, data=data)
print(response.json())
```

## Duplicate Detection

The system prevents duplicate uploads by checking for existing records with the same:
- Islem_Tarihi
- Hesaba_Gecis
- Para_Birimi
- Islem_Tutari
- Sube_ID

Duplicate records are skipped and counted in the response.

## Authentication

This endpoint requires the same authentication as other POS_Hareketleri endpoints, using JWT tokens.