# Yemek Çeki Feature Implementation Design

## 1. Overview

This document outlines the design for implementing the Yemek Çeki feature in the SilverCloud system. The feature will allow users to manage meal voucher transactions with specific date ranges and payment dates. This is the first step in implementing the complete feature, focusing on creating the menu item.

## 2. Feature Requirements

Based on the provided SQL schema, the Yemek Çeki feature will include:
- Management of meal voucher transactions with specific date ranges
- Payment date tracking
- Category and branch associations
- Date validation (Ilk_Tarih must be before or equal to Son_Tarih)

## 3. Current Implementation Status

The backend already has:
- Database schema defined in `Yemek_Ceki.sql`
- API endpoints in `backend/api/v1/endpoints/yemek_ceki.py`
- Schema definitions in `backend/schemas/yemek_ceki.py`

However, the following components are missing:
- Database model in `backend/db/models.py`
- CRUD operations in `backend/db/crud.py`
- Router inclusion in `backend/main.py`

## 4. Step 1: Create "Yemek Çeki" Menu Item

### 4.1. Menu Structure Analysis

Based on the existing menu structure in `CopyCat/constants.tsx`, the "Yemek Çeki" menu item should be added under the "Fatura/Harcama" menu group.

Current "Fatura/Harcama" menu group structure:
```typescript
{
    title: 'Fatura/Harcama',
    items: [
        { label: 'Fatura Yükleme', path: '/invoice-upload', icon: Icons.Upload, permission: FATURA_YUKLEME_EKRANI_YETKI_ADI },
        { label: 'Fatura Kategori Atama', path: '/invoice-category-assignment', icon: Icons.Category, permission: FATURA_KATEGORI_ATAMA_EKRANI_YETKI_ADI },
        { label: 'B2B Ekstre Yükleme', path: '/b2b-upload', icon: Icons.ClipboardDocumentList, permission: B2B_YUKLEME_EKRANI_YETKI_ADI },
        { label: 'B2B Ekstre Kategori Atama', path: '/b2b-category-assignment', icon: Icons.Category, permission: B2B_KATEGORI_ATAMA_EKRANI_YETKI_ADI },
        { label: 'Ödeme Yükleme', path: '/odeme-yukleme', icon: Icons.Upload, permission: ODEME_YUKLEME_EKRANI_YETKI_ADI },
        { label: 'Ödeme Kategori Atama', path: '/odeme-kategori-atama', icon: Icons.Category, permission: ODEME_KATEGORI_ATAMA_EKRANI_YETKI_ADI },
        { label: 'Diğer Harcamalar', path: '/other-expenses', icon: Icons.CreditCard, permission: DIGER_HARCAMALAR_EKRANI_YETKI_ADI },
        { label: 'POS Hareketleri Yükleme', path: '/pos-hareketleri-yukleme', icon: Icons.Upload, permission: POS_HAREKETLERI_YUKLEME_EKRANI_YETKI_ADI },
    ]
}
```

### 4.2. Menu Item Implementation Plan

To add the "Yemek Çeki" menu item:
1. Add a new permission constant for the Yemek Çeki screen
2. Add the menu item to the "Fatura/Harcama" group in the MENU_GROUPS array
3. Create a new route for the Yemek Çeki page
4. Create the Yemek Çeki page component

### 4.3. Required Changes

#### 4.3.1. Add Permission Constant
Add a new permission constant in `CopyCat/constants.tsx`:
```typescript
export const YEMEK_CEKI_EKRANI_YETKI_ADI = 'Yemek Çeki Ekranı Görüntüleme';
```

#### 4.3.2. Update MENU_GROUPS
Add the new menu item to the "Fatura/Harcama" group:
```typescript
{
    title: 'Fatura/Harcama',
    items: [
        // ... existing items ...
        { label: 'Yemek Çeki', path: '/yemek-ceki', icon: Icons.CreditCard, permission: YEMEK_CEKI_EKRANI_YETKI_ADI },
    ]
}
```

## 5. Next Steps (To Be Confirmed)

After implementing the menu item, the following steps will be needed:
1. Create the YemekCeki database model
2. Implement CRUD operations for YemekCeki
3. Register the YemekCeki router in main.py
4. Create the frontend page component
5. Implement API integration
6. Add form components for data entry
7. Implement data display and editing functionality