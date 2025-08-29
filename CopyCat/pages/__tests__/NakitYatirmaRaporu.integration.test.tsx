import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { NakitYatirmaRaporuPage } from '../NakitYatirmaRaporu';
import * as AppContext from '../../App';

// Mock the useAppContext hook
const mockUseAppContext = jest.spyOn(AppContext, 'useAppContext');

// Mock XLSX functions
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    json_to_sheet: jest.fn((data) => data),
    book_append_sheet: jest.fn(),
    writeFile: jest.fn()
  }
}));

// Mock data with duplicate amounts to test the new matching algorithm
const mockSelectedBranch = {
  Sube_ID: 1,
  Sube_Adi: 'Test Branch',
  Aktif_Pasif: true
};

const mockReportData = {
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
    },
    {
      Tarih: '2025-08-02',
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

describe('NakitYatirmaRaporuPage Integration Tests', () => {
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

  test('Excel export contains correctly sorted and matched data', async () => {
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
    
    // Find and click the Excel export button
    const exportButton = screen.getByTitle('Excel\'e Aktar');
    fireEvent.click(exportButton);
    
    // Verify that XLSX functions were called
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(4); // 4 sheets
    expect(XLSX.utils.writeFile).toHaveBeenCalled();
    
    // Verify that the data is sorted correctly in the export (newest to oldest)
    const jsonToSheetCalls = (XLSX.utils.json_to_sheet as jest.Mock).mock.calls;
    
    // First sheet (Bankaya Yatan) should be sorted by date (newest first)
    const bankayaSheetData = jsonToSheetCalls[0][0];
    expect(bankayaSheetData[0].Tarih).toBe('03.08.2025');
    expect(bankayaSheetData[1].Tarih).toBe('02.08.2025');
    expect(bankayaSheetData[2].Tarih).toBe('01.08.2025');
    
    // Second sheet (Nakit Girişi) should be sorted by date (newest first)
    const nakitSheetData = jsonToSheetCalls[1][0];
    expect(nakitSheetData[0].Tarih).toBe('03.08.2025');
    expect(nakitSheetData[1].Tarih).toBe('02.08.2025');
    expect(nakitSheetData[2].Tarih).toBe('01.08.2025');
    
    // Verify matching status is correctly indicated
    // The matching should be:
    // bankaya_yatan[1] (2025-08-01, 150.00) <-> nakit_girisi[2] (2025-08-03, 150.00)
    // bankaya_yatan[2] (2025-08-02, 100.00) <-> nakit_girisi[0] (2025-08-01, 100.00)
    // bankaya_yatan[0] (2025-08-03, 100.00) <-> nakit_girisi[1] (2025-08-02, 100.00)
    
    // Check that all records are marked as matched (since we have 3 pairs)
    expect(bankayaSheetData[0].Durum).toBe('Eşleşti');
    expect(bankayaSheetData[1].Durum).toBe('Eşleşti');
    expect(bankayaSheetData[2].Durum).toBe('Eşleşti');
    
    expect(nakitSheetData[0].Durum).toBe('Eşleşti');
    expect(nakitSheetData[1].Durum).toBe('Eşleşti');
    expect(nakitSheetData[2].Durum).toBe('Eşleşti');
  });

  test('Excel export uses proper Turkish number formatting', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          bankaya_yatan: [
            {
              Tarih: '2025-08-01',
              Donem: 2508,
              Tutar: 1234.56
            }
          ],
          nakit_girisi: [
            {
              Tarih: '2025-08-01',
              Donem: 2508,
              Tutar: 1234.56
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
    
    // Find and click the Excel export button
    const exportButton = screen.getByTitle('Excel\'e Aktar');
    fireEvent.click(exportButton);
    
    // Verify that the numbers are formatted correctly for Turkish locale
    // (dot as thousand separator, comma as decimal separator)
    const jsonToSheetCalls = (XLSX.utils.json_to_sheet as jest.Mock).mock.calls;
    
    const bankayaSheetData = jsonToSheetCalls[0][0];
    // Check if the number is formatted correctly (this would depend on our implementation)
    // Since we're mocking json_to_sheet, we can't directly test the formatting here
    // But we can verify that the function was called with the data
    expect(bankayaSheetData[0].Tutar).toBe('1.234,56');
  });
});