# Gelir Screen Restoration Design Document

## Overview

This document outlines the design and implementation plan to restore the "Gelir Girişi" (Income Entry) screen that was replaced by the Dashboard screen. The Gelir functionality exists in the backend but the frontend component is missing.

## Architecture

### Current State
- Backend API for Gelir operations exists at `/api/v1/gelirler/`
- Gelir database model is implemented with fields: Gelir_ID, Sube_ID, Tarih, Kategori_ID, Tutar, Kayit_Tarihi
- Menu structure in constants.tsx includes "Gelir Girişi" entry pointing to `/gelir` path
- No frontend component exists for the Gelir page

### Target State
- Restore "Gelir Girişi" screen under the "Gelir" menu item
- Implement GelirPage component with CRUD operations
- Maintain consistency with other data entry screens in the application

## Frontend Implementation

### Component Structure
```
GelirPage
├── GelirForm (for create/edit operations)
├── GelirList (to display existing records)
└── GelirFilters (for filtering records)
```

### GelirPage Component
The GelirPage component will be implemented with the following features:
- Display a list of existing Gelir records
- Provide filtering capabilities by period and branch
- Allow creation of new Gelir records
- Enable editing and deletion of existing records
- Implement proper permission checks using `GELIR_GIRISI_EKRANI_YETKI_ADI`

### GelirForm Component
The form component will include fields for:
- Tarih (Date) - Required
- Sube_ID (Branch) - Auto-filled from selected branch context
- Kategori_ID (Category) - Dropdown selection from available categories
- Tutar (Amount) - Numeric input with proper formatting

### Data Flow
1. Fetch Gelir records from backend API on component mount
2. Fetch category data for dropdown population
3. Handle form submissions through API calls (POST for create, PUT for update)
4. Implement real-time updates to the Gelir list after CRUD operations

## Backend API Integration

### Existing Endpoints
The following endpoints are already available in the backend:
- `POST /gelirler/` - Create new Gelir record
- `GET /gelirler/` - Retrieve list of Gelir records
- `GET /gelirler/{gelir_id}` - Retrieve specific Gelir record
- `PUT /gelirler/{gelir_id}` - Update specific Gelir record
- `DELETE /gelirler/{gelir_id}` - Delete specific Gelir record

### Data Models
```typescript
interface Gelir {
  Gelir_ID: number;
  Sube_ID: number;
  Tarih: string; // Date in YYYY-MM-DD format
  Kategori_ID: number;
  Tutar: number;
  Kayit_Tarihi: string; // DateTime
}

interface GelirCreate {
  Sube_ID: number;
  Tarih: string;
  Kategori_ID: number;
  Tutar: number;
}

interface GelirUpdate {
  Tarih?: string;
  Kategori_ID?: number;
  Tutar?: number;
}
```

## Routing and Navigation

### Menu Integration
The "Gelir Girişi" menu item already exists in `constants.tsx`:
```typescript
{
    title: 'Gelir',
    items: [
        { label: 'Gelir Girişi', path: '/gelir', icon: Icons.Income, permission: GELIR_GIRISI_EKRANI_YETKI_ADI },
        { label: 'Nakit Girişi', path: '/nakit-girisi', icon: Icons.Money, permission: NAKIT_GIRISI_EKRANI_YETKI_ADI },
    ]
}
```

### Route Definition
Add the following route to the application routing configuration:
```tsx
<Route path="/gelir" element={<GelirPage />} />
```

## UI/UX Design

### Layout
The Gelir page will follow the standard layout pattern used by other data entry screens in the application:
- Card-based layout with appropriate title
- Action buttons for adding new records
- Responsive table for displaying records
- Filtering controls above the table
- Modal dialogs for form interactions

### User Interactions
1. User navigates to "Gelir" → "Gelir Girişi" from the sidebar menu
2. System displays the GelirPage with existing records
3. User can filter records by date range and other criteria
4. User clicks "Yeni Gelir Girişi" button to open the creation form
5. User fills in the form and submits to create a new record
6. System validates input and sends data to backend API
7. Upon successful creation, system updates the display and shows confirmation

## Security Considerations

### Permission Checking
The GelirPage will implement proper permission checking using:
```typescript
if (!hasPermission(GELIR_GIRISI_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Gelir Girişi" />;
}
```

### Data Validation
- Client-side validation for required fields
- Server-side validation in the backend API
- Proper error handling and user feedback

## Testing Strategy

### Unit Tests
- Test GelirPage component rendering with different permission states
- Test form validation logic
- Test API integration functions

### Integration Tests
- Test complete flow from UI interaction to backend API calls
- Test permission-based access control
- Test error scenarios and edge cases

## Implementation Steps

1. Create GelirPage component in `pages.tsx`
2. Implement GelirForm component with proper validation
3. Add necessary API functions in the data context
4. Register the route in App.tsx
5. Test functionality with various user roles and permissions
6. Validate data persistence and retrieval
7. Perform UI/UX review and adjustments

## Dependencies

- Existing Gelir backend API endpoints
- Available category data from the data context
- Standard UI components (Button, Input, Select, TableLayout, Modal, etc.)
- Permission system already implemented in the application




























































































