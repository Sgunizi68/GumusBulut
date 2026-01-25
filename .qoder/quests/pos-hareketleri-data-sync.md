# POS_Hareketleri Data Sync Implementation Design

## 1. Overview

This document outlines the design for implementing backend functionality to pull and push data for the `POS_Hareketleri` table. The implementation will follow the existing patterns in the SilverCloud system to ensure consistency with other modules.

The `POS_Hareketleri` table stores Point of Sale transaction data with the following schema:
- ID (INT, AUTO_INCREMENT, PRIMARY KEY)
- Islem_Tarihi (DATE, NOT NULL)
- Hesaba_Gecis (DATE, NOT NULL)
- Para_Birimi (VARCHAR(5), NOT NULL)
- Islem_Tutari (DECIMAL(15,2), NOT NULL)
- Kesinti_Tutari (DECIMAL(15,2), DEFAULT 0.00)
- Net_Tutar (DECIMAL(15,2))
- Kayit_Tarihi (DATETIME, DEFAULT NOW())

The implementation will provide full CRUD (Create, Read, Update, Delete) operations through a RESTful API, following the same patterns used by other modules in the SilverCloud system.

## 2. Architecture

The implementation will follow the existing MVC-like architecture pattern used throughout the SilverCloud backend:

```
┌─────────────────┐    ┌────────────────┐    ┌──────────────────┐
│   API Layer     │    │ Business Logic │    │   Data Access    │
│ (endpoints)     │───▶│    (CRUD)      │───▶│     (Models)     │
└─────────────────┘    └────────────────┘    └──────────────────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌─────────────────┐    ┌────────────────┐    ┌──────────────────┐
│  Schema Layer   │    │  Database      │    │  Database Table  │
│ (Pydantic)      │    │ (SQLAlchemy)   │    │ (POS_Hareketleri)│
└─────────────────┘    └────────────────┘    └──────────────────┘
```

### 2.1 Component Structure

The implementation will consist of the following components:
- **Model**: SQLAlchemy model for database mapping
- **Schema**: Pydantic models for data validation
- **CRUD Operations**: Data access layer functions
- **API Endpoints**: RESTful API endpoints for data operations
- **Main Application**: Integration with the main FastAPI application

### 2.2 File Structure

The implementation will involve creating/modifying the following files:

```
backend/
├── db/
│   ├── models.py (add POSHareketleri model)
│   └── crud.py (add POS Hareketleri CRUD functions)
├── schemas/
│   └── pos_hareketleri.py (new file)
├── api/v1/endpoints/
│   └── pos_hareketleri.py (new file)
├── main.py (add import and router)
└── tests/
    ├── test_pos_hareketleri_crud.py (new file)
    └── test_pos_hareketleri_api.py (new file)
```

## 3. Data Models & ORM Mapping

### 3.1 Database Model

The SQLAlchemy model for `POS_Hareketleri` will be defined in `backend/db/models.py`:

```python
class POSHareketleri(Base):
    __tablename__ = "POS_Hareketleri"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Islem_Tarihi = Column(Date, nullable=False)
    Hesaba_Gecis = Column(Date, nullable=False)
    Para_Birimi = Column(String(5), nullable=False)
    Islem_Tutari = Column(DECIMAL(15, 2), nullable=False)
    Kesinti_Tutari = Column(DECIMAL(15, 2), default=0.00)
    Net_Tutar = Column(DECIMAL(15, 2))
    Kayit_Tarihi = Column(DateTime, default=func.now())
```

### 3.2 Schema Definitions

Pydantic schemas will be defined in `backend/schemas/pos_hareketleri.py`:

- `POSHareketleriBase`: Base schema with common fields
- `POSHareketleriCreate`: Schema for creating new records
- `POSHareketleriUpdate`: Schema for updating existing records
- `POSHareketleriInDB`: Schema for database records with ID and metadata

**Schema Details:**
```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class POSHareketleriBase(BaseModel):
    Islem_Tarihi: date
    Hesaba_Gecis: date
    Para_Birimi: str = Field(..., max_length=5)
    Islem_Tutari: Decimal = Field(..., ge=0, decimal_places=2)
    Kesinti_Tutari: Decimal = Field(0.00, ge=0, decimal_places=2)
    Net_Tutar: Optional[Decimal] = Field(None, ge=0, decimal_places=2)

class POSHareketleriCreate(POSHareketleriBase):
    pass

class POSHareketleriUpdate(POSHareketleriBase):
    Islem_Tarihi: Optional[date] = None
    Hesaba_Gecis: Optional[date] = None
    Para_Birimi: Optional[str] = Field(None, max_length=5)
    Islem_Tutari: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    Kesinti_Tutari: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    Net_Tutar: Optional[Decimal] = Field(None, ge=0, decimal_places=2)

class POSHareketleriInDB(POSHareketleriBase):
    ID: int
    Kayit_Tarihi: datetime

    class Config:
        from_attributes = True
```

## 4. API Endpoints Reference

The following RESTful endpoints will be implemented in `backend/api/v1/endpoints/pos_hareketleri.py`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pos-hareketleri/` | Retrieve a list of POS transactions |
| GET | `/api/v1/pos-hareketleri/{id}` | Retrieve a specific POS transaction |
| POST | `/api/v1/pos-hareketleri/` | Create a new POS transaction |
| PUT | `/api/v1/pos-hareketleri/{id}` | Update an existing POS transaction |
| DELETE | `/api/v1/pos-hareketleri/{id}` | Delete a POS transaction |

### 4.1 Request/Response Schema

#### GET `/api/v1/pos-hareketleri/`
**Response:**
```json
[
  {
    "ID": 1,
    "Islem_Tarihi": "2023-05-15",
    "Hesaba_Gecis": "2023-05-16",
    "Para_Birimi": "TRY",
    "Islem_Tutari": 1000.00,
    "Kesinti_Tutari": 10.00,
    "Net_Tutar": 990.00,
    "Kayit_Tarihi": "2023-05-15T14:30:00"
  }
]
```

#### POST `/api/v1/pos-hareketleri/`
**Request:**
```json
{
  "Islem_Tarihi": "2023-05-15",
  "Hesaba_Gecis": "2023-05-16",
  "Para_Birimi": "TRY",
  "Islem_Tutari": 1000.00,
  "Kesinti_Tutari": 10.00,
  "Net_Tutar": 990.00
}
```

**Response:**
```json
{
  "ID": 1,
  "Islem_Tarihi": "2023-05-15",
  "Hesaba_Gecis": "2023-05-16",
  "Para_Birimi": "TRY",
  "Islem_Tutari": 1000.00,
  "Kesinti_Tutari": 10.00,
  "Net_Tutar": 990.00,
  "Kayit_Tarihi": "2023-05-15T14:30:00"
}
```

#### API Endpoint Implementation

The API endpoints will be implemented in `backend/api/v1/endpoints/pos_hareketleri.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import pos_hareketleri

router = APIRouter()

@router.get("/", response_model=List[pos_hareketleri.POSHareketleriInDB])
def read_pos_hareketleri(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    pos_hareketleri = crud.get_pos_hareketleri(db, skip=skip, limit=limit)
    return pos_hareketleri

@router.get("/{pos_id}", response_model=pos_hareketleri.POSHareketleriInDB)
def read_pos_hareket(pos_id: int, db: Session = Depends(database.get_db)):
    db_pos = crud.get_pos_hareket(db, pos_id=pos_id)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS Hareketi not found")
    return db_pos

@router.post("/", response_model=pos_hareketleri.POSHareketleriInDB, status_code=status.HTTP_201_CREATED)
def create_pos_hareket(pos_hareket: pos_hareketleri.POSHareketleriCreate, db: Session = Depends(database.get_db)):
    return crud.create_pos_hareket(db=db, pos_hareket=pos_hareket)

@router.put("/{pos_id}", response_model=pos_hareketleri.POSHareketleriInDB)
def update_pos_hareket(
    pos_id: int,
    pos_hareket: pos_hareketleri.POSHareketleriUpdate,
    db: Session = Depends(database.get_db)
):
    db_pos = crud.update_pos_hareket(db=db, pos_id=pos_id, pos_hareket=pos_hareket)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS Hareketi not found")
    return db_pos

@router.delete("/{pos_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pos_hareket(pos_id: int, db: Session = Depends(database.get_db)):
    db_pos = crud.delete_pos_hareket(db=db, pos_id=pos_id)
    if db_pos is None:
        raise HTTPException(status_code=404, detail="POS Hareketi not found")
    return {"ok": True}
```

## 5. Business Logic Layer

### 5.1 CRUD Operations

The following CRUD operations will be implemented in `backend/db/crud.py`:

```python
def get_pos_hareketleri(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.POSHareketleri).offset(skip).limit(limit).all()

def get_pos_hareket(db: Session, pos_id: int):
    return db.query(models.POSHareketleri).filter(models.POSHareketleri.ID == pos_id).first()

def create_pos_hareket(db: Session, pos_hareket: pos_hareketleri.POSHareketleriCreate):
    db_pos = models.POSHareketleri(**pos_hareket.dict())
    db.add(db_pos)
    db.commit()
    db.refresh(db_pos)
    return db_pos

def update_pos_hareket(db: Session, pos_id: int, pos_hareket: pos_hareketleri.POSHareketleriUpdate):
    db_pos = db.query(models.POSHareketleri).filter(models.POSHareketleri.ID == pos_id).first()
    if db_pos:
        update_data = pos_hareket.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_pos, key, value)
        db.commit()
        db.refresh(db_pos)
    return db_pos

def delete_pos_hareket(db: Session, pos_id: int):
    db_pos = db.query(models.POSHareketleri).filter(models.POSHareketleri.ID == pos_id).first()
    if db_pos:
        db.delete(db_pos)
        db.commit()
    return db_pos
```

### 5.2 Data Validation

Validation will be handled by Pydantic schemas:
- Required fields will be enforced
- Data types will be validated
- Decimal precision will be maintained (15,2)
- Date formats will be validated

### 5.3 Error Handling

Error handling will follow the existing patterns in the SilverCloud system:
- HTTP 404 errors for not found records
- HTTP 422 errors for validation failures
- HTTP 500 errors for server-side issues
- Proper error messages will be returned to clients

## 6. Integration Points

### 6.1 Main Application Integration

The new endpoint will be integrated into the main application by:
1. Adding import in `backend/main.py`
2. Including the router with appropriate prefix and tags

**Integration Steps:**

1. In `backend/main.py`, add the import:
   ```python
   from api.v1.endpoints import pos_hareketleri
   ```

2. Include the router in the app:
   ```python
   app.include_router(pos_hareketleri.router, prefix="/api/v1/pos-hareketleri", tags=["POS Hareketleri"])
   ```

### 6.2 Database Integration

The table will be automatically created when the application starts through the `Base.metadata.create_all(bind=engine)` call in `main.py`.

The model will be added to the existing models in `backend/db/models.py`:

```python
from sqlalchemy import Column, Integer, String, Date, DateTime, DECIMAL
from sqlalchemy.sql import func
from .database import Base

class POSHareketleri(Base):
    __tablename__ = "POS_Hareketleri"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Islem_Tarihi = Column(Date, nullable=False)
    Hesaba_Gecis = Column(Date, nullable=False)
    Para_Birimi = Column(String(5), nullable=False)
    Islem_Tutari = Column(DECIMAL(15, 2), nullable=False)
    Kesinti_Tutari = Column(DECIMAL(15, 2), default=0.00)
    Net_Tutar = Column(DECIMAL(15, 2))
    Kayit_Tarihi = Column(DateTime, default=func.now())
```

## 6.3 Security Considerations

The POS Hareketleri endpoints will follow the existing security patterns in the SilverCloud system:
- Authentication will be required for all endpoints
- Role-based access control will be implemented
- Data access will be restricted based on user permissions

## 6.4 Dependencies

The implementation will use existing dependencies in the project:
- FastAPI for the web framework
- SQLAlchemy for ORM
- Pydantic for data validation
- No additional dependencies are required

## 7. Testing Strategy

### 7.1 Unit Tests

Unit tests will be implemented for:
- CRUD operations in `backend/tests/test_pos_hareketleri_crud.py`
- API endpoints in `backend/tests/test_pos_hareketleri_api.py`

### 7.2 Test Coverage

Tests will cover:
- Successful creation, retrieval, update, and deletion of records
- Error handling for invalid data
- Edge cases (empty results, large datasets)
- Data validation scenarios

**Sample Test Cases:**

1. **Create POS Hareketi Test**
   - Verify successful creation with valid data
   - Verify validation errors with invalid data (e.g., negative amounts)
   - Verify default values are applied correctly

2. **Retrieve POS Hareketi Test**
   - Verify retrieval of existing records
   - Verify 404 error for non-existent records
   - Verify pagination works correctly

3. **Update POS Hareketi Test**
   - Verify successful update of existing records
   - Verify partial updates work correctly
   - Verify 404 error for non-existent records

4. **Delete POS Hareketi Test**
   - Verify successful deletion of existing records
   - Verify 404 error for non-existent records
   - Verify records are actually removed from database