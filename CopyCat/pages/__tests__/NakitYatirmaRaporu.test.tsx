import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { NakitYatirmaRaporuPage } from '../NakitYatirmaRaporu';
import * as AppContext from '../../App';

// Mock the useAppContext hook
const mockUseAppContext = jest.spyOn(AppContext, 'useAppContext');

// Mock data with duplicate amounts to test the new matching algorithm
const mockSelectedBranch = {
  Sube_ID: 1,
  Sube_Adi: 'Test Branch',
  Aktif_Pasif: true
};

const mockReportData = {
  bankaya_yatan: [
    {
      Tarih: '2025-08-01',
      Donem: 2508,
      Tutar: 100.00
    },
    {
      Tarih: '2025-08-02',
      Donem: 2508,
      Tutar: 150.00
    },
    {
      Tarih: '2025-08-03',
      Donem: 2508,
      Tutar: 100.00 // Duplicate amount
    }
  ],
  nakit_girisi: [
    {
      Tarih: '2025-08-01',
      Donem: 2508,
      Tutar: 100.00
    },
    {
      Tarih: '2025-08-02',
      Donem: 2508,
      Tutar: 100.00 // Duplicate amount
    },
    {
      Tarih: '2025-08-03',
      Donem: 2508,
      Tutar: 150.00
    }
  ]
};

describe('NakitYatirmaRaporuPage', () => {
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
        <NakitYatirmaRaporuPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Nakit Yatırma Kontrol Raporu')).toBeInTheDocument();
  });

  test('correctly matches records with duplicate amounts', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData)
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <NakitYatirmaRaporuPage />
      </BrowserRouter>
    );
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Eşleşme Durumu')).toBeInTheDocument();
    });
    
    // Check that we have 2 matched records (not 3 which would indicate incorrect matching)
    // The new algorithm should match:
    // bankaya_yatan[0] (100.00) with nakit_girisi[0] (100.00)
    // bankaya_yatan[1] (150.00) with nakit_girisi[2] (150.00)
    // bankaya_yatan[2] (100.00) with nakit_girisi[1] (100.00)
    // All 3 should be matched correctly
    expect(screen.getByText('3')).toBeInTheDocument(); // Should show 3 matched records
  });

  test('correctly sorts records by date (newest to oldest)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          bankaya_yatan: [
            {
              Tarih: '2025-08-03',
              Donem: 2508,
              Tutar: 100.00
            },
            {
              Tarih: '2025-08-01',
              Donem: 2508,
              Tutar: 150.00
            }
          ],
          nakit_girisi: [
            {
              Tarih: '2025-08-02',
              Donem: 2508,
              Tutar: 100.00
            },
            {
              Tarih: '2025-08-01',
              Donem: 2508,
              Tutar: 150.00
            }
          ]
        })
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <NakitYatirmaRaporuPage />
      </BrowserRouter>
    );
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Bankaya Yatan')).toBeInTheDocument();
    });
    
    // Check that records are sorted by date (descending - newest first)
    // For Bankaya Yatan: 2025-08-03 should come before 2025-08-01
    const bankayaYatanRows = screen.getAllByText(/2025/);
    expect(bankayaYatanRows[0]).toHaveTextContent('03.08.2025');
    expect(bankayaYatanRows[1]).toHaveTextContent('01.08.2025');
  });

  test('shows correct visual indicators for matched/unmatched records', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          bankaya_yatan: [
            {
              Tarih: '2025-08-01',
              Donem: 2508,
              Tutar: 100.00
            },
            {
              Tarih: '2025-08-02',
              Donem: 2508,
              Tutar: 200.00 // This won't match
            }
          ],
          nakit_girisi: [
            {
              Tarih: '2025-08-01',
              Donem: 2508,
              Tutar: 100.00
            },
            {
              Tarih: '2025-08-03',
              Donem: 2508,
              Tutar: 300.00 // This won't match
            }
          ]
        })
      })
    ) as jest.Mock;
    
    render(
      <BrowserRouter>
        <NakitYatirmaRaporuPage />
      </BrowserRouter>
    );
    
    // Wait for report to load
    await waitFor(() => {
      expect(screen.getByText('Eşleşme Durumu')).toBeInTheDocument();
    });
    
    // Check that we have 1 matched and 1 unmatched in each section
    expect(screen.getByText('1')).toBeInTheDocument(); // Matched
    expect(screen.getByText('1')).toBeInTheDocument(); // Unmatched Bankaya
    expect(screen.getByText('1')).toBeInTheDocument(); // Unmatched Nakit
  });
});