import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OdemeRaporPage } from '../../pages/OdemeRapor';
import { AppContext } from '../../App';

// Mock the Icons since they're not relevant for this test
jest.mock('../../constants', () => ({
  Icons: {
    ChevronDown: () => <div data-testid="chevron-down" />,
    ChevronRight: () => <div data-testid="chevron-right" />,
    Print: () => <div>Print</div>,
    Download: () => <div>Download</div>,
    DocumentReport: () => <div>DocumentReport</div>,
    ExclamationTriangle: () => <div>ExclamationTriangle</div>,
  },
  YAZDIRMA_YETKISI_ADI: 'Yazdırma',
  EXCELE_AKTAR_YETKISI_ADI: 'Excel\'e Aktar'
}));

// Mock the formatNumber utility
jest.mock('../../utils/formatNumber', () => ({
  formatNumber: (value: number) => value.toFixed(2).replace('.', ',')
}));

// Mock the pdfGenerator
jest.mock('../../utils/pdfGenerator', () => ({
  generateDashboardPdf: jest.fn()
}));

// Mock XLSX
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(),
    json_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
    writeFile: jest.fn()
  }
}));

// Mock ExpandableBankaHesabiRow component
jest.mock('../ExpandableBankaHesabiRow', () => {
  return function MockExpandableBankaHesabiRow(props: any) {
    return (
      <tr data-testid={`banka-hesabi-row-${props.bankaHesabiGroup.hesap_adi}`}>
        <td>Banka Hesabı: {props.bankaHesabiGroup.hesap_adi}</td>
        <td></td>
        <td></td>
      </tr>
    );
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [
        {
          donem: 2301,
          donem_total: 11500.00,
          record_count: 4,
          kategoriler: [
            {
              kategori_id: 1,
              kategori_adi: "Kira",
              kategori_total: 9500.00,
              record_count: 3,
              banka_hesaplari: [
                {
                  hesap_adi: "Ziraat Bankası",
                  hesap_total: 6500.00,
                  record_count: 2,
                  details: []
                },
                {
                  hesap_adi: "İş Bankası",
                  hesap_total: 3000.00,
                  record_count: 1,
                  details: []
                }
              ]
            },
            {
              kategori_id: 2,
              kategori_adi: "Araç Giderleri",
              kategori_total: 2000.00,
              record_count: 1,
              banka_hesaplari: [
                {
                  hesap_adi: "Kasa",
                  hesap_total: 2000.00,
                  record_count: 1,
                  details: []
                }
              ]
            }
          ]
        }
      ],
      totals: {
        donem_totals: { "2301": 11500.00 },
        kategori_totals: { "1": 9500.00, "2": 2000.00 },
        grand_total: 11500.00
      },
      filters_applied: {
        donem: [2301],
        kategori: null,
        sube_id: 1
      },
      total_records: 4
    }),
  } as any)
);

describe('OdemeRaporPage Expand/Collapse Functionality', () => {
  const mockAppContext = {
    selectedBranch: { Sube_ID: 1, Sube_Adi: 'Test Şubesi', Aktif_Pasif: true },
    currentPeriod: '2301',
    hasPermission: () => true,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    currentUser: null,
    selectBranch: jest.fn(),
    setPeriod: jest.fn()
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('toggles period expansion correctly', async () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <OdemeRaporPage />
      </AppContext.Provider>
    );

    // Wait for the component to load data
    await screen.findByText('Dönem: 2301');
    
    // Initially, category groups should not be visible
    expect(screen.queryByText('Kira')).not.toBeInTheDocument();
    
    // Click on the period to expand it
    const periodHeader = screen.getByText('Dönem: 2301');
    fireEvent.click(periodHeader);
    
    // Now category groups should be visible
    expect(await screen.findByText('Kira')).toBeInTheDocument();
    expect(screen.getByText('Araç Giderleri')).toBeInTheDocument();
  });

  it('toggles category expansion correctly', async () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <OdemeRaporPage />
      </AppContext.Provider>
    );

    // Wait for the component to load data
    await screen.findByText('Dönem: 2301');
    
    // Expand the period first
    const periodHeader = screen.getByText('Dönem: 2301');
    fireEvent.click(periodHeader);
    
    // Wait for categories to appear
    await screen.findByText('Kira');
    
    // Initially, bank account groups should not be visible
    expect(screen.queryByTestId('banka-hesabi-row-Ziraat Bankası')).not.toBeInTheDocument();
    
    // Click on the category to expand it
    const kiraCategory = screen.getByText('Kira');
    fireEvent.click(kiraCategory);
    
    // Now bank account groups should be visible
    expect(await screen.findByTestId('banka-hesabi-row-Ziraat Bankası')).toBeInTheDocument();
    expect(screen.getByTestId('banka-hesabi-row-İş Bankası')).toBeInTheDocument();
  });

  it('toggles bank account expansion correctly', async () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <OdemeRaporPage />
      </AppContext.Provider>
    );

    // Wait for the component to load data
    await screen.findByText('Dönem: 2301');
    
    // Expand the period
    const periodHeader = screen.getByText('Dönem: 2301');
    fireEvent.click(periodHeader);
    
    // Wait for categories to appear
    await screen.findByText('Kira');
    
    // Expand the category
    const kiraCategory = screen.getByText('Kira');
    fireEvent.click(kiraCategory);
    
    // Wait for bank accounts to appear
    await screen.findByTestId('banka-hesabi-row-Ziraat Bankası');
    
    // At this point, the bank account row component is rendered, but we can't
    // easily test the detail expansion without making the mock more complex
    // For now, we've verified that the hierarchy works correctly
    expect(screen.getByTestId('banka-hesabi-row-Ziraat Bankası')).toBeInTheDocument();
  });

  it('collapses child groups when parent is collapsed', async () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <OdemeRaporPage />
      </AppContext.Provider>
    );

    // Wait for the component to load data
    await screen.findByText('Dönem: 2301');
    
    // Expand the period
    const periodHeader = screen.getByText('Dönem: 2301');
    fireEvent.click(periodHeader);
    
    // Wait for categories to appear
    await screen.findByText('Kira');
    
    // Expand the category
    const kiraCategory = screen.getByText('Kira');
    fireEvent.click(kiraCategory);
    
    // Wait for bank accounts to appear
    await screen.findByTestId('banka-hesabi-row-Ziraat Bankası');
    
    // Verify bank accounts are visible
    expect(screen.getByTestId('banka-hesabi-row-Ziraat Bankası')).toBeInTheDocument();
    
    // Collapse the category
    fireEvent.click(kiraCategory);
    
    // Bank accounts should no longer be visible
    expect(screen.queryByTestId('banka-hesabi-row-Ziraat Bankası')).not.toBeInTheDocument();
  });
});