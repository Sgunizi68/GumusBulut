import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { B2BEkstreRaporuPage } from '../B2BEkstreRaporu';
import * as AppContext from '../../App';

// Mock the useAppContext hook
const mockUseAppContext = jest.spyOn(AppContext, 'useAppContext');

// Mock data
const mockSelectedBranch = {
  Sube_ID: 1,
  Sube_Adi: 'Test Branch',
  Aktif_Pasif: true
};

const mockReportData = {
  data: [
    {
      donem: 2508,
      donem_total: 150.00,
      record_count: 2,
      kategoriler: [
        {
          kategori_id: 1,
          kategori_adi: 'Test Category',
          kategori_total: 150.00,
          record_count: 2,
          kayitlar: [
            {
              ekstre_id: 1,
              tarih: '2025-08-01',
              fis_no: 'FIS001',
              aciklama: 'Test transaction 1',
              borc: 100.00,
              alacak: 50.00,
              tutar: 50.00
            },
            {
              ekstre_id: 2,
              tarih: '2025-08-02',
              fis_no: 'FIS002',
              aciklama: 'Test transaction 2',
              borc: 150.00,
              alacak: 50.00,
              tutar: 100.00
            }
          ]
        }
      ]
    }
  ],
  totals: {
    donem_totals: { 2508: 150.00 },
    kategori_totals: { '1': 150.00 },
    grand_total: 150.00
  },
  filters_applied: {
    donem: [2508],
    kategori: [1],
    sube_id: 1
  },
  total_records: 2
};

describe('B2BEkstreRaporuPage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock useAppContext
    mockUseAppContext.mockReturnValue({
      selectedBranch: mockSelectedBranch,
      currentPeriod: '2508',
      hasPermission: jest.fn().mockReturnValue(true)
    } as any);
  });

  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <B2BEkstreRaporuPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('B2B Ekstre Raporu')).toBeInTheDocument();
    expect(screen.getByText('Dönem Seçimi')).toBeInTheDocument();
    expect(screen.getByText('Kategori Seçimi')).toBeInTheDocument();
  });

  test('shows access denied when user lacks permission', () => {
    // Mock useAppContext to return false for hasPermission
    mockUseAppContext.mockReturnValue({
      selectedBranch: mockSelectedBranch,
      currentPeriod: '2508',
      hasPermission: jest.fn().mockReturnValue(false)
    } as any);
    
    render(
      <BrowserRouter>
        <B2BEkstreRaporuPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Erişim Yetkiniz Bulunmamaktadır')).toBeInTheDocument();
  });

  test('shows loading state when generating report', async () => {
    // Mock fetch to simulate loading
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData)
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <B2BEkstreRaporuPage />
      </BrowserRouter>
    );
    
    // Select a period
    const periodCheckbox = screen.getByLabelText('2508');
    fireEvent.click(periodCheckbox);
    
    // Click generate report
    const filterButton = screen.getByText('Filtrele');
    fireEvent.click(filterButton);
    
    // Check if loading state is shown
    await waitFor(() => {
      expect(screen.getByText('Oluşturuluyor...')).toBeInTheDocument();
    });
  });

  test('displays report data correctly', async () => {
    // Mock fetch to return mock data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData)
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <B2BEkstreRaporuPage />
      </BrowserRouter>
    );
    
    // Select a period
    const periodCheckbox = screen.getByLabelText('2508');
    fireEvent.click(periodCheckbox);
    
    // Click generate report
    const filterButton = screen.getByText('Filtrele');
    fireEvent.click(filterButton);
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Rapor Detayları')).toBeInTheDocument();
    });
    
    // Check if report data is displayed
    expect(screen.getByText('2508')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('FIS001')).toBeInTheDocument();
    expect(screen.getByText('FIS002')).toBeInTheDocument();
    expect(screen.getByText('150,00 ₺')).toBeInTheDocument(); // Grand total
  });

  test('shows no data message when no records found', async () => {
    // Mock fetch to return empty data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [],
          totals: {
            donem_totals: {},
            kategori_totals: {},
            grand_total: 0
          },
          filters_applied: {
            donem: [],
            kategori: [],
            sube_id: 1
          },
          total_records: 0
        })
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <B2BEkstreRaporuPage />
      </BrowserRouter>
    );
    
    // Select a period
    const periodCheckbox = screen.getByLabelText('2508');
    fireEvent.click(periodCheckbox);
    
    // Click generate report
    const filterButton = screen.getByText('Filtrele');
    fireEvent.click(filterButton);
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Kayıt Bulunamadı')).toBeInTheDocument();
    });
  });
});