import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    },
    {
      Tarih: '2025-08-02',
      Gelir_POS: 1500.00,
      POS_Hareketleri: 1400.00,
      POS_Kesinti: 70.00,
      POS_Net: 1330.00,
      Odeme: null,
      Odeme_Kesinti: null,
      Odeme_Net: null,
      Kontrol_POS: 'Not OK',
      Kontrol_Kesinti: 'OK',
      Kontrol_Net: 'OK'
    },
    {
      Tarih: '2025-08-03',
      Gelir_POS: null,
      POS_Hareketleri: null,
      POS_Kesinti: null,
      POS_Net: null,
      Odeme: null,
      Odeme_Kesinti: null,
      Odeme_Net: null,
      Kontrol_POS: 'OK',
      Kontrol_Kesinti: null,
      Kontrol_Net: null
    }
  ],
  summary: {
    total_records: 3,
    successful_matches: 2,
    error_matches: 1,
    success_rate: '67%'
  }
};

describe('POSKontrolDashboardPage', () => {
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
    
    expect(screen.getByText('POS Kontrol Dashboard')).toBeInTheDocument();
  });

  test('displays correct data in the table', async () => {
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
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('POS Kontrol Verileri')).toBeInTheDocument();
    });
    
    // Check that dates are displayed
    expect(screen.getByText('01.08.2025')).toBeInTheDocument();
    expect(screen.getByText('02.08.2025')).toBeInTheDocument();
    expect(screen.getByText('03.08.2025')).toBeInTheDocument();
    
    // Check that values are displayed
    expect(screen.getByText('₺1.000')).toBeInTheDocument();
    expect(screen.getByText('₺1.500')).toBeInTheDocument();
    expect(screen.getByText('₺50,00')).toBeInTheDocument();
    expect(screen.getByText('₺70,00')).toBeInTheDocument();
    expect(screen.getByText('₺950,00')).toBeInTheDocument();
    expect(screen.getByText('₺1.330,00')).toBeInTheDocument();
  });

  test('displays correct status indicators', async () => {
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
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('POS Kontrol Verileri')).toBeInTheDocument();
    });
    
    // Check that status indicators are displayed correctly
    // First row should have "OK" status
    const okStatuses = screen.getAllByText('OK');
    expect(okStatuses.length).toBeGreaterThanOrEqual(3); // At least 3 OK statuses
    
    // Second row should have "Not OK" status
    expect(screen.getByText('Not OK')).toBeInTheDocument();
  });

  test('displays summary statistics correctly', async () => {
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
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Özet İstatistikler')).toBeInTheDocument();
    });
    
    // Check that summary statistics are displayed
    expect(screen.getByText('3')).toBeInTheDocument(); // Total records
    expect(screen.getByText('2')).toBeInTheDocument(); // Successful matches
    expect(screen.getByText('1')).toBeInTheDocument(); // Error matches
    expect(screen.getByText('67%')).toBeInTheDocument(); // Success rate
  });

  test('handles empty data correctly', async () => {
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
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Veri Bulunamadı')).toBeInTheDocument();
    });
  });

  test('handles fetch errors correctly', async () => {
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
    
    expect(screen.getByText('Veri alınırken hata oluştu: 500 - Internal Server Error')).toBeInTheDocument();
  });
});