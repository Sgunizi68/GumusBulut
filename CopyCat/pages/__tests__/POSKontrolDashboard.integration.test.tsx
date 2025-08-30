import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { POSKontrolDashboardPage } from '../POSKontrolDashboard';
import * as AppContext from '../../App';

// Mock the useAppContext hook
const mockUseAppContext = jest.spyOn(AppContext, 'useAppContext');

// Mock data for POS Kontrol Dashboard
const mockSelectedBranch = {
  Sube_ID: 1,
  Sube_Adi: 'Test Branch',
  Aktif_Pasif: true
};

const mockReportData = {
  data: [
    {
      Tarih: '2025-08-01',
      Gelir_POS: 1000.00,
      POS_Hareketleri: 1000.00,
      POS_Kesinti: 50.00,
      POS_Net: 950.00,
      Odeme: null,
      Odeme_Kesinti: null,
      Odeme_Net: null,
      Kontrol_POS: 'OK',
      Kontrol_Kesinti: 'OK',
      Kontrol_Net: 'OK'
    }
  ],
  summary: {
    total_records: 1,
    successful_matches: 1,
    error_matches: 0,
    success_rate: '100%'
  }
};

describe('POSKontrolDashboardPage Integration', () => {
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

  test('integration test: fetches and displays data correctly', async () => {
    // Mock fetch to return our test data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData)
      })
    ) as jest.Mock;
    
    // Render the component
    render(
      <BrowserRouter>
        <POSKontrolDashboardPage />
      </BrowserRouter>
    );
    
    // Wait for loading to complete and data to be displayed
    await waitFor(() => {
      expect(screen.queryByText('Rapor yükleniyor...')).not.toBeInTheDocument();
    });
    
    // Verify that the main elements are present
    expect(screen.getByText('POS Kontrol Dashboard (Şube: Test Branch)')).toBeInTheDocument();
    expect(screen.getByText('POS Kontrol Verileri')).toBeInTheDocument();
    
    // Verify that data is displayed correctly
    expect(screen.getByText('01.08.2025')).toBeInTheDocument();
    expect(screen.getByText('₺1.000')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    
    // Verify summary statistics
    expect(screen.getByText('Özet İstatistikler')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Total records
    expect(screen.getByText('100%')).toBeInTheDocument(); // Success rate
  });

  test('integration test: handles period selection', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData)
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <POSKontrolDashboardPage />
      </BrowserRouter>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('01.08.2025')).toBeInTheDocument();
    });
    
    // Find the period selection dropdown
    const periodSelect = screen.getByRole('combobox');
    
    // Verify current period is selected
    expect(periodSelect).toHaveValue('2508');
    
    // Note: We're not actually changing the period and testing refetch
    // because that would require more complex mocking of state changes
    // This test primarily verifies the UI element exists and has the right value
  });

  test('integration test: handles export functionality', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData)
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <POSKontrolDashboardPage />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('01.08.2025')).toBeInTheDocument();
    });
    
    // Check that export buttons are present (based on permissions)
    const printButton = screen.getByTitle('PDF Olarak İndir');
    const excelButton = screen.getByTitle("Excel'e Aktar");
    
    expect(printButton).toBeInTheDocument();
    expect(excelButton).toBeInTheDocument();
    
    // Note: We're not actually clicking the buttons and testing the export
    // because that would require mocking the export functions and testing
    // the actual file generation, which is outside the scope of this integration test
  });

  test('integration test: handles empty response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [],
          summary: {
            total_records: 0,
            successful_matches: 0,
            error_matches: 0,
            success_rate: '0%'
          }
        })
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <POSKontrolDashboardPage />
      </BrowserRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Veri Bulunamadı')).toBeInTheDocument();
    });
    
    // Verify that the empty state message is displayed
    expect(screen.getByText('2508 döneminde Şube: Test Branch için POS kontrol verisi bulunamadı.')).toBeInTheDocument();
  });

  test('integration test: handles network errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <POSKontrolDashboardPage />
      </BrowserRouter>
    );
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Hata')).toBeInTheDocument();
    });
    
    // Verify error message
    expect(screen.getByText('Veri alınırken hata oluştu: 500 - Internal Server Error')).toBeInTheDocument();
    
    // Verify retry button exists
    expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
  });
});