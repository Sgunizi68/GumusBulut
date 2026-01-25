# B2B Ekstre Kategori Atama Screen Design Document

## 1. Overview

This document outlines the design for the "B2B Ekstre Kategori Atama" screen, which will be used to assign categories to records in the B2B_Ekstre table. The screen will be placed under the "Fatura/Harcama" menu item and will follow the same design, filters, methods, and format as the existing "Fatura Kategori Atama" screen.

### Purpose
The B2B Ekstre Kategori Atama screen allows users to categorize B2B transactions by assigning appropriate categories from the system's category list. This enables better financial tracking and reporting of business-to-business transactions.

### Key Features
- View B2B Ekstre records with filtering capabilities
- Assign categories to individual B2B records
- Inline editing of record descriptions
- Period-based filtering of records
- Search functionality for finding specific records
- Responsive design that works across different screen sizes

## 2. Frontend Architecture

### Component Structure
The B2B Category Assignment screen will be implemented as a React functional component following the same pattern as the InvoiceCategoryAssignmentPage component.

### Technology Stack
- React with TypeScript
- Tailwind CSS for styling
- React Context API for state management
- Axios for API communication

### Component Hierarchy
```
B2BCategoryAssignmentPage
├── Card (Main container)
│   ├── Filters Section
│   │   ├── Search Input
│   │   ├── Period Filter Dropdown
│   │   └── Uncategorized Only Checkbox
│   └── Table Section
│       ├── Table Header
│       └── Table Rows
│           ├── Fiş No
│           ├── Tarih
│           ├── Açıklama (Inline Edit)
│           ├── Borç
│           ├── Alacak
│           ├── Fatura No
│           ├── Kategori Dropdown
│           └── Dönem Dropdown
```

## 3. UI Design

### Layout
The screen will follow a two-section layout:
1. **Filter Section**: Contains search and filter controls
2. **Data Table**: Displays B2B records with category assignment capabilities

### Filters
- **Search Field**: Text input for searching by Fiş No, Açıklama, or Fatura No
- **Period Filter**: Dropdown to filter records by period (YYMM format)
- **Uncategorized Only**: Checkbox to show only records without assigned categories

### Data Table
The table will display the following columns:
- **Fiş No**: B2B transaction reference number
- **Tarih**: Transaction date
- **Açıklama**: Description of the transaction (inline editable)
- **Borç**: Debit amount
- **Alacak**: Credit amount
- **Fatura No**: Associated invoice number
- **Kategori**: Category assignment dropdown
- **Dönem**: Period dropdown for changing the record's period

## 4. Backend API Integration

### Endpoints
The screen will interact with the following existing B2B Ekstre API endpoints:

1. **GET /b2b-ekstreler/** - Retrieve all B2B Ekstre records
2. **PUT /b2b-ekstreler/{ekstre_id}** - Update a specific B2B Ekstre record

### Data Models

#### B2BEkstre (Frontend Interface)
```typescript
interface B2BEkstre {
  Ekstre_ID: number;
  Tarih: string; // DATE
  Fis_No: string; // VARCHAR(50)
  Fis_Turu?: string; // VARCHAR(50)
  Aciklama?: string; // TEXT
  Borc: number; // DECIMAL(15,2)
  Alacak: number; // DECIMAL(15,2)
  Toplam_Bakiye: number; // DECIMAL(15,2)
  Fatura_No?: string; // VARCHAR(50)
  Fatura_Metni?: string; // TEXT
  Donem: string; // INT(4) -> YYAA
  Kategori_ID: number | null;
  Sube_ID: number;
  Kayit_Tarihi: string; // TIMESTAMP
}
```

#### B2BAssignmentFormData (Update Payload)
```typescript
type B2BAssignmentFormData = Partial<Pick<B2BEkstre, 'Kategori_ID' | 'Donem' | 'Aciklama'>>;
```

## 5. Business Logic

### Filtering Logic
1. **Branch Filtering**: Only records belonging to the currently selected branch are displayed
2. **Search Filtering**: Records matching the search term in Fiş No, Açıklama, or Fatura No
3. **Period Filtering**: Records filtered by the selected period
4. **Uncategorized Filtering**: When enabled, only shows records with null Kategori_ID

### Category Assignment
1. Users can select any active category from the dropdown
2. Category selection immediately updates the record in the database
3. The category dropdown shows all active categories with their type (Gelir, Gider, etc.)

### Data Display Logic
1. Records with null Kategori_ID are highlighted (yellow background)
2. Records are sorted with uncategorized items appearing first
3. Within each group, records are sorted by date (newest first)

## 6. State Management

### Component State
- `searchTerm`: String for filtering records
- `filterPeriod`: Selected period for filtering
- `filterUncategorized`: Boolean to show only uncategorized records

### Context State
- `b2bEkstreList`: Complete list of B2B Ekstre records
- `kategoriList`: Complete list of categories
- `selectedBranch`: Currently selected branch
- `updateB2BEkstre`: Function to update a B2B Ekstre record

## 7. Navigation and Routing

### Menu Placement
The screen will be added to the "Fatura/Harcama" menu group with the following properties:
- **Label**: "B2B Ekstre Kategori Atama"
- **Path**: "/b2b-category-assignment"
- **Icon**: Same category icon used for other assignment screens
- **Permission**: New permission "B2B Kategori Atama Ekranı Görüntüleme"

### Route Definition
```jsx
<Route path="/b2b-category-assignment" element={<B2BCategoryAssignmentPage />} />
```

## 8. Security and Permissions

### Required Permissions
- **Screen Access**: "B2B Kategori Atama Ekranı Görüntüleme"
- Users must have the appropriate role assigned with this permission

### Data Filtering
- Users can only view and modify records belonging to their selected branch
- Category dropdown only shows active categories

## 9. Error Handling

### API Errors
- Display user-friendly error messages for failed API requests
- Maintain form state during error conditions
- Provide retry mechanisms where appropriate

### Validation
- Validate that required fields are present before submission
- Handle cases where categories or periods might be invalid

## 10. Performance Considerations

### Data Loading
- Fetch all B2B Ekstre records for the selected branch on initial load
- Implement loading indicators during data fetch
- Consider pagination for branches with large numbers of records

### Filtering
- Use useMemo for efficient filtering operations
- Debounce search input to reduce filtering frequency
- Optimize category dropdown rendering with virtualization if needed

## 11. Testing Strategy

### Unit Tests
- Test filtering logic with various combinations of filters
- Test category assignment functionality
- Test inline editing of descriptions
- Test period dropdown functionality

### Integration Tests
- Test API integration for fetching and updating records
- Test permission-based access control
- Test branch-specific data filtering

### UI Tests
- Test responsive design across different screen sizes
- Test form interactions and validations
- Test error state handling

## 12. Implementation Plan

### Phase 1: Component Development
1. Create B2BCategoryAssignmentPage component
2. Implement filtering controls
3. Create data table with all required columns
4. Implement inline editing for descriptions

### Phase 2: API Integration
1. Connect to existing B2B Ekstre API endpoints
2. Implement update functionality for category assignment
3. Add loading and error states

### Phase 3: Navigation and Permissions
1. Add menu item to "Fatura/Harcama" group
2. Define new permission in backend
3. Implement permission checking in frontend

### Phase 4: Testing and Refinement
1. Conduct unit testing
2. Perform integration testing
3. Validate UI/UX with stakeholders
4. Optimize performance if needed