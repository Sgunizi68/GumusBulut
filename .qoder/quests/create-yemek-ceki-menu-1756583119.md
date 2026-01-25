# Yemek Çeki Feature Design Document

## 1. Overview

This document outlines the design for implementing the "Yemek Çeki" feature in the SilverCloud system. The feature will allow users to manage Yemek Çeki records with CRUD operations, following the same patterns as the existing "Diğer Harcamalar" feature. The Yemek Çeki menu item will be placed under the "Fatura/Harcama" menu group.

## 2. Requirements

- Create a new "Yemek Çeki" menu item under the "Fatura/Harcama" menu group
- Implement CRUD operations for Yemek_Ceki table records
- Use the same UI patterns and API structure as the "Diğer Harcamalar" feature
- No additional security settings beyond what exists for "Diğer Harcamalar"
- Follow existing database connection patterns

## 3. Database Schema

Based on the provided schema, the Yemek_Ceki table has the following structure:

```sql
CREATE TABLE Yemek_Ceki (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Kategori_ID INT NOT NULL,
    Tarih DATE NOT NULL,
    Tutar DECIMAL(15,2) NOT NULL,
    Odeme_Tarih DATE NOT NULL,
    Ilk_Tarih DATE NOT NULL,
    Son_Tarih DATE NOT NULL,
    Sube_ID INT NOT NULL DEFAULT 1,
    Kayit_Tarihi DATETIME DEFAULT NOW(),
    CONSTRAINT fk_YEF_sube 
        FOREIGN KEY (Sube_ID) REFERENCES Sube(Sube_ID),
    CONSTRAINT fk_YEF_Kategori 
        FOREIGN KEY (Kategori_ID) REFERENCES Kategori(Kategori_ID),
    CONSTRAINT chk_YEF_Tarih CHECK (Ilk_Tarih <= Son_Tarih)
);
```

## 4. Backend Implementation

### 4.1 Database Model

Add a new model in `backend/db/models.py`:

```python
class YemekCeki(Base):
    __tablename__ = "Yemek_Ceki"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=False)
    Tarih = Column(Date, nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Odeme_Tarih = Column(Date, nullable=False)
    Ilk_Tarih = Column(Date, nullable=False)
    Son_Tarih = Column(Date, nullable=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False, default=1)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori", back_populates="yemek_cekiler")
    sube = relationship("Sube", back_populates="yemek_cekiler")
```

Also add the relationship to the existing Kategori and Sube models:

```python
# In Kategori model
yemek_cekiler = relationship("YemekCeki", back_populates="kategori")

# In Sube model
yemek_cekiler = relationship("YemekCeki", back_populates="sube")
```

### 4.2 Schema Definition

Create `backend/schemas/yemek_ceki.py`:

```python
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class YemekCekiBase(BaseModel):
    Kategori_ID: int
    Tarih: date
    Tutar: float
    Odeme_Tarih: date
    Ilk_Tarih: date
    Son_Tarih: date
    Sube_ID: int = 1

class YemekCekiCreate(YemekCekiBase):
    pass

class YemekCekiUpdate(BaseModel):
    Kategori_ID: Optional[int] = None
    Tarih: Optional[date] = None
    Tutar: Optional[float] = None
    Odeme_Tarih: Optional[date] = None
    Ilk_Tarih: Optional[date] = None
    Son_Tarih: Optional[date] = None
    Sube_ID: Optional[int] = None

class YemekCekiInDB(YemekCekiBase):
    ID: int
    Kayit_Tarihi: Optional[datetime] = None

    class Config:
        from_attributes = True
```

### 4.3 CRUD Operations

Add CRUD functions in `backend/db/crud.py`:

```python
# YemekCeki CRUD operations
def get_yemek_ceki(db: Session, yemek_ceki_id: int):
    return db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()

def get_yemek_cekiler(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.YemekCeki).offset(skip).limit(limit).all()

def create_yemek_ceki(db: Session, yemek_ceki: yemek_ceki.YemekCekiCreate):
    db_yemek_ceki = models.YemekCeki(**yemek_ceki.dict())
    db.add(db_yemek_ceki)
    db.commit()
    db.refresh(db_yemek_ceki)
    return db_yemek_ceki

def update_yemek_ceki(db: Session, yemek_ceki_id: int, yemek_ceki: yemek_ceki.YemekCekiUpdate):
    db_yemek_ceki = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    if db_yemek_ceki:
        update_data = yemek_ceki.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_yemek_ceki, key, value)
        db.commit()
        db.refresh(db_yemek_ceki)
    return db_yemek_ceki

def delete_yemek_ceki(db: Session, yemek_ceki_id: int):
    db_yemek_ceki = db.query(models.YemekCeki).filter(models.YemekCeki.ID == yemek_ceki_id).first()
    if db_yemek_ceki:
        db.delete(db_yemek_ceki)
        db.commit()
    return db_yemek_ceki
```

### 4.4 API Endpoints

Create `backend/api/v1/endpoints/yemek_ceki.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db import crud, database, models
from schemas import yemek_ceki

router = APIRouter()

@router.post("/yemek-cekiler/", response_model=yemek_ceki.YemekCekiInDB, status_code=status.HTTP_201_CREATED)
def create_yemek_ceki(yemek_ceki_data: yemek_ceki.YemekCekiCreate, db: Session = Depends(database.get_db)):
    return crud.create_yemek_ceki(db=db, yemek_ceki=yemek_ceki_data)

@router.get("/yemek-cekiler/", response_model=List[yemek_ceki.YemekCekiInDB])
def read_yemek_cekiler(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    yemek_cekiler = crud.get_yemek_cekiler(db, skip=skip, limit=limit)
    return yemek_cekiler

@router.get("/yemek-cekiler/{yemek_ceki_id}", response_model=yemek_ceki.YemekCekiInDB)
def read_yemek_ceki(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    db_yemek_ceki = crud.get_yemek_ceki(db, yemek_ceki_id=yemek_ceki_id)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return db_yemek_ceki

@router.put("/yemek-cekiler/{yemek_ceki_id}", response_model=yemek_ceki.YemekCekiInDB)
def update_yemek_ceki(
    yemek_ceki_id: int,
    yemek_ceki_data: yemek_ceki.YemekCekiUpdate,
    db: Session = Depends(database.get_db)
):
    db_yemek_ceki = crud.update_yemek_ceki(db=db, yemek_ceki_id=yemek_ceki_id, yemek_ceki=yemek_ceki_data)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return db_yemek_ceki

@router.delete("/yemek-cekiler/{yemek_ceki_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_yemek_ceki(yemek_ceki_id: int, db: Session = Depends(database.get_db)):
    db_yemek_ceki = crud.delete_yemek_ceki(db=db, yemek_ceki_id=yemek_ceki_id)
    if db_yemek_ceki is None:
        raise HTTPException(status_code=404, detail="Yemek Çeki not found")
    return {"message": "Yemek Çeki deleted successfully"}
```

### 4.5 API Registration

Add the router to `backend/main.py`:

```python
# Import the router
from api.v1.endpoints import yemek_ceki

# Register the router
app.include_router(yemek_ceki.router, prefix="/api/v1", tags=["Yemek Ceki"])
```

## 5. Frontend Implementation

### 5.1 Menu Item

Add the menu item to `CopyCat/constants.tsx` in the "Fatura/Harcama" group:

```typescript
{
    title: 'Fatura/Harcama',
    items: [
        // ... existing items
        { label: 'Diğer Harcamalar', path: '/other-expenses', icon: Icons.CreditCard, permission: DIGER_HARCAMALAR_EKRANI_YETKI_ADI },
        { label: 'Yemek Çeki', path: '/yemek-cekiler', icon: Icons.CreditCard, permission: DIGER_HARCAMALAR_EKRANI_YETKI_ADI }, // Add this line
        { label: 'POS Hareketleri Yükleme', path: '/pos-hareketleri-yukleme', icon: Icons.Upload, permission: POS_HAREKETLERI_YUKLEME_EKRANI_YETKI_ADI },
    ]
}
```

### 5.2 Route Registration

Add the route in `CopyCat/App.tsx`:

```typescript
<Route path="/other-expenses" element={<DigerHarcamalarPage />} />
<Route path="/yemek-cekiler" element={<YemekCekiPage />} /> // Add this line
```

### 5.3 Type Definitions

Add the type definitions in `CopyCat/types.ts`:

```typescript
export interface YemekCeki {
    ID: number;
    Kategori_ID: number;
    Tarih: string; // YYYY-MM-DD
    Tutar: number;
    Odeme_Tarih: string; // YYYY-MM-DD
    Ilk_Tarih: string; // YYYY-MM-DD
    Son_Tarih: string; // YYYY-MM-DD
    Sube_ID: number;
    Kayit_Tarihi?: string; // YYYY-MM-DD HH:MM:SS
}

export interface YemekCekiFormData {
    Kategori_ID: number;
    Tarih: string; // YYYY-MM-DD
    Tutar: number;
    Odeme_Tarih: string; // YYYY-MM-DD
    Ilk_Tarih: string; // YYYY-MM-DD
    Son_Tarih: string; // YYYY-MM-DD
    Sube_ID: number;
}
```

### 5.4 Data Context

Add to the DataContext in `CopyCat/App.tsx`:

```typescript
// State
const [yemekCekiList, setYemekCekiList] = useState<YemekCeki[]>([]);

// Fetch function
const fetchYemekCekiler = useCallback(async () => {
    const data = await fetchData<YemekCeki[]>(`${API_BASE_URL}/yemek-cekiler/`);
    if (data) {
        setYemekCekiList(data);
    }
}, []);

// Add to fetchAllData
const fetchAllData = useCallback(async () => {
    // ... existing fetch calls
    await fetchYemekCekiler(); // Add this line
}, [/* ... existing dependencies */, fetchYemekCekiler]);

// Add to DataContextType interface
yemekCekiList: YemekCeki[];
addYemekCeki: (data: YemekCekiFormData) => Promise<{ success: boolean; message?: string }>;
updateYemekCeki: (id: number, data: Partial<YemekCekiFormData>) => Promise<{ success: boolean; message?: string }>;
deleteYemekCeki: (id: number) => Promise<{ success: boolean; message?: string }>;

// Add to DataContext value
yemekCekiList,
addYemekCeki: async (data) => {
    const newYemekCeki = await fetchData<YemekCeki>(`${API_BASE_URL}/yemek-cekiler/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (newYemekCeki) {
        setYemekCekiList(prev => [...prev, newYemekCeki]);
        return { success: true };
    }
    return { success: false, message: "Yemek çeki eklenirken bir hata oluştu." };
},
updateYemekCeki: async (id, data) => {
    const updatedYemekCeki = await fetchData<YemekCeki>(`${API_BASE_URL}/yemek-cekiler/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (updatedYemekCeki) {
        setYemekCekiList(prev =>
            prev.map(yc => (yc.ID === id ? updatedYemekCeki : yc))
        );
        return { success: true };
    }
    return { success: false, message: "Yemek çeki güncellenirken bir hata oluştu." };
},
deleteYemekCeki: async (id) => {
    const success = await fetchData<any>(`${API_BASE_URL}/yemek-cekiler/${id}`, {
        method: 'DELETE',
    });
    if (success) {
        setYemekCekiList(prev => prev.filter(yc => yc.ID !== id));
        return { success: true };
    }
    return { success: false, message: "Yemek çeki silinirken bir hata oluştu." };
},
```

### 5.5 UI Component

Create `CopyCat/pages/YemekCekiPage.tsx` based on the DigerHarcamalarPage pattern:

```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, useDataContext } from '../App';
import { Button, Input, Modal, Card, TableLayout, Select } from '../components';
import { Icons, DIGER_HARCAMALAR_EKRANI_YETKI_ADI, GIZLI_KATEGORI_YETKISI_ADI } from '../constants';
import { YemekCeki, YemekCekiFormData } from '../types';
import { YemekCekiForm } from '../components';

export const YemekCekiPage: React.FC = () => {
  const { yemekCekiList, addYemekCeki, updateYemekCeki, deleteYemekCeki, kategoriList } = useDataContext();
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYemekCeki, setEditingYemekCeki] = useState<YemekCeki | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>(currentPeriod || '');

  useEffect(() => {
    setFilterPeriod(currentPeriod || '');
  }, [currentPeriod]);

  const availablePeriods = useMemo(() => {
    const periods = new Set(yemekCekiList.map(yc => {
      // Extract period from Tarih field (YYMM format)
      const date = new Date(yc.Tarih);
      const year = date.getFullYear().toString().substring(2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}${month}`;
    }));
    periods.add(currentPeriod || '');
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [yemekCekiList, currentPeriod]);

  if (!hasPermission(DIGER_HARCAMALAR_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Yemek Çeki" />;
  }
  
  const canViewGizliKategoriler = hasPermission(GIZLI_KATEGORI_YETKISI_ADI);

  const handleAddNew = () => {
    setEditingYemekCeki(null);
    setIsModalOpen(true);
  };

  const handleEdit = (yemekCeki: YemekCeki) => {
    setEditingYemekCeki(yemekCeki);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu yemek çeki kaydını silmek istediğinizden emin misiniz?")) {
      deleteYemekCeki(id);
    }
  };

  const handleSubmit = async (data: YemekCekiFormData) => {
    if (!selectedBranch) {
      alert("Lütfen önce bir şube seçin.");
      return;
    }

    const yemekCekiData = {
        ...data,
        Sube_ID: selectedBranch.Sube_ID,
    };

    let result;
    if (editingYemekCeki) {
        result = await updateYemekCeki(editingYemekCeki.ID, yemekCekiData);
    } else {
        result = await addYemekCeki(yemekCekiData);
    }

    if (result && result.success) {
        setIsModalOpen(false);
        setEditingYemekCeki(null);
    } else if (result && result.message) {
        alert(result.message);
    }
  };
  
  const filteredYemekCekiler = useMemo(() => {
    return yemekCekiList
      .filter(yc => {
          const kategori = kategoriList.find(k => k.Kategori_ID === yc.Kategori_ID);
          if (kategori && kategori.Gizli && !canViewGizliKategoriler) {
            return false;
          }
          return yc.Sube_ID === selectedBranch?.Sube_ID
      })
      .filter(yc => 
        (yc.Tarih.includes(searchTerm) || 
         kategoriList.find(k => k.Kategori_ID === yc.Kategori_ID)?.Kategori_Adi.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(yc => filterPeriod ? 
        (() => {
          const date = new Date(yc.Tarih);
          const year = date.getFullYear().toString().substring(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${year}${month}` === filterPeriod;
        })() : true)
      .sort((a,b) => new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime());
  }, [yemekCekiList, selectedBranch, searchTerm, filterPeriod, kategoriList, canViewGizliKategoriler]);

  const activeKategorilerForForm = useMemo(() => {
    return kategoriList.filter(k => k.Aktif_Pasif && k.Tip === 'Gider' && (canViewGizliKategoriler || !k.Gizli)).sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriList, canViewGizliKategoriler]);

  if (!selectedBranch) {
    return <Card title="Yemek Çeki"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card title={`Yemek Çeki (Şube: ${selectedBranch.Sube_Adi})`} actions={
         <div className="flex items-center gap-3">
            <Input 
                placeholder="Tarih/Kategori ara..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Select 
                value={filterPeriod} 
                onChange={e => setFilterPeriod(e.target.value)}
                className="min-w-[150px] text-sm py-2"
            >
                <option value="">Tüm Dönemler</option>
                {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Button onClick={handleAddNew} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Kayıt</Button>
        </div>
      }>
        <TableLayout headers={['Tarih', 'Kategori', 'Tutar', 'Ödeme Tarihi', 'İlk Tarih', 'Son Tarih', 'İşlemler']} compact={true}>
          {filteredYemekCekiler.map(yc => {
            const kategoriAdi = kategoriList.find(k => k.Kategori_ID === yc.Kategori_ID)?.Kategori_Adi || 'N/A';
            return (
            <tr key={yc.ID}>
              <td className="px-4 py-2 text-sm text-gray-900">{yc.Tarih}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{kategoriAdi}</td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right">{yc.Tutar.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{yc.Odeme_Tarih}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{yc.Ilk_Tarih}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{yc.Son_Tarih}</td>
              <td className="px-4 py-2 text-sm font-medium flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(yc)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
                <Button variant="ghost" size="sm" onClick={() => handleDelete(yc.ID)} leftIcon={<Icons.Delete className="w-4 h-4" />} title="Sil" />
              </td>
            </tr>
            )
          })}
        </TableLayout>
         {filteredYemekCekiler.length === 0 && <p className="text-center py-4 text-gray-500">Kayıtlı yemek çeki bulunmamaktadır.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingYemekCeki ? 'Yemek Çeki Düzenle' : 'Yeni Yemek Çeki Ekle'}>
        <YemekCekiForm 
            initialData={editingYemekCeki} 
            kategoriler={activeKategorilerForForm} 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
```

### 5.6 Form Component

Create `CopyCat/components/YemekCekiForm.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Textarea } from './index';
import { Kategori, YemekCeki, YemekCekiFormData } from '../types';

interface YemekCekiFormProps {
    initialData?: YemekCeki | null;
    kategoriler: Kategori[];
    onSubmit: (data: YemekCekiFormData) => void;
    onCancel: () => void;
}

export const YemekCekiForm: React.FC<YemekCekiFormProps> = ({ 
    initialData, 
    kategoriler, 
    onSubmit, 
    onCancel 
}) => {
    const [formData, setFormData] = useState<YemekCekiFormData>({
        Kategori_ID: kategoriler[0]?.Kategori_ID || 0,
        Tarih: new Date().toISOString().split('T')[0],
        Tutar: 0,
        Odeme_Tarih: new Date().toISOString().split('T')[0],
        Ilk_Tarih: new Date().toISOString().split('T')[0],
        Son_Tarih: new Date().toISOString().split('T')[0],
        Sube_ID: 1
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                Kategori_ID: initialData.Kategori_ID,
                Tarih: initialData.Tarih,
                Tutar: initialData.Tutar,
                Odeme_Tarih: initialData.Odeme_Tarih,
                Ilk_Tarih: initialData.Ilk_Tarih,
                Son_Tarih: initialData.Son_Tarih,
                Sube_ID: initialData.Sube_ID
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes('Tarih') ? value : 
                   (name === 'Tutar' || name.includes('_ID')) ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <Select
                        name="Kategori_ID"
                        value={formData.Kategori_ID}
                        onChange={handleChange}
                        required
                    >
                        {kategoriler.map(kategori => (
                            <option key={kategori.Kategori_ID} value={kategori.Kategori_ID}>
                                {kategori.Kategori_Adi}
                            </option>
                        ))}
                    </Select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                    <Input
                        type="date"
                        name="Tarih"
                        value={formData.Tarih}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                    <Input
                        type="number"
                        name="Tutar"
                        value={formData.Tutar}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
                    <Input
                        type="date"
                        name="Odeme_Tarih"
                        value={formData.Odeme_Tarih}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İlk Tarih</label>
                    <Input
                        type="date"
                        name="Ilk_Tarih"
                        value={formData.Ilk_Tarih}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Son Tarih</label>
                    <Input
                        type="date"
                        name="Son_Tarih"
                        value={formData.Son_Tarih}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    İptal
                </Button>
                <Button type="submit">
                    {initialData ? 'Güncelle' : 'Kaydet'}
                </Button>
            </div>
        </form>
    );
};
```

### 5.7 Component Export

Add to `CopyCat/components.tsx`:

```typescript
export { YemekCekiForm } from './components/YemekCekiForm';
```

Add to `CopyCat/pages.tsx`:

```typescript
export { YemekCekiPage } from './pages/YemekCekiPage';
```

## 6. Integration Points

1. **Database Migration**: The Yemek_Ceki table needs to be created in the database
2. **API Integration**: The new endpoints need to be registered in the main application
3. **Frontend Integration**: The new page needs to be added to the routing and menu system
4. **Permissions**: The feature will use the same permissions as "Diğer Harcamalar"

## 7. Testing

### 7.1 Backend Testing
- Unit tests for CRUD operations in `backend/tests/`
- API endpoint tests to verify all operations work correctly

### 7.2 Frontend Testing
- Component rendering tests for YemekCekiPage
- Form validation tests
- Integration tests for API calls

## 8. Deployment

The implementation follows the existing patterns in the codebase, so deployment should be straightforward:
1. Apply database schema changes
2. Deploy backend changes
3. Deploy frontend changes