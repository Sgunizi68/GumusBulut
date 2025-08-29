import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NakitYatirmaRaporuPage } from '../NakitYatirmaRaporu';
import * as AppContext from '../../App';

// Mock the App context
jest.mock('../../App', () => ({
  ...jest.requireActual('../../App'),
  useAppContext: () => ({
    selectedBranch: { Sube_ID: 1, Sube_Adi: 'Test Branch' },
    currentPeriod: '2508',
    hasPermission: jest.fn().mockReturnValue(true),
  }),
  API_BASE_URL: 'http://localhost:8000/api/v1',
}));

// Mock global fetch
global.fetch = jest.fn();

describe('NakitYatirmaRaporuPage - Net Nakit Gelir', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays net nakit gelir data', async () => {
    // Mock the nakit yatirma kontrol response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          bankaya_yatan: [{ Tarih: '2025-08-01', Donem: 2508, Tutar: 1000 }],
          nakit_girisi: [{ Tarih: '2025-08-01', Donem: 2508, Tutar: 900 }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          gelir_toplam: 1500,
          efatura_harcama_toplam: 200,
          diger_harcama_toplam: 150,
          net_nakit_gelir: 1150,
        }),
      });

    render(<NakitYatirmaRaporuPage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('₺1.150')).toBeInTheDocument();
    });

    // Check that net nakit gelir is displayed
    expect(screen.getByText('Net Nakit Gelir')).toBeInTheDocument();
    expect(screen.getByText('₺1.150')).toBeInTheDocument();

    // Check comparison visualization
    expect(screen.getByText('Karşılaştırma')).toBeInTheDocument();
    expect(screen.getByText('Net Nakit Gelir')).toBeInTheDocument();
    expect(screen.getByText('Bankaya Yatan')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock the nakit yatirma kontrol response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          bankaya_yatan: [{ Tarih: '2025-08-01', Donem: 2508, Tutar: 1000 }],
          nakit_girisi: [{ Tarih: '2025-08-01', Donem: 2508, Tutar: 900 }],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    render(<NakitYatirmaRaporuPage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  test('handles network error gracefully', async () => {
    // Mock the nakit yatirma kontrol response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          bankaya_yatan: [{ Tarih: '2025-08-01', Donem: 2508, Tutar: 1000 }],
          nakit_girisi: [{ Tarih: '2025-08-01', Donem: 2508, Tutar: 900 }],
        }),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<NakitYatirmaRaporuPage />);

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});