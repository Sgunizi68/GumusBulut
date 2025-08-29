import { describe, test, expect } from '@jest/globals';

describe('Date Sorting Functionality', () => {
  test('sorts dates in descending order (newest to oldest) correctly', () => {
    const mockData = [
      { Tarih: '2025-08-03', Donem: 2508, Tutar: 100.00 },
      { Tarih: '2025-08-01', Donem: 2508, Tutar: 150.00 },
      { Tarih: '2025-08-02', Donem: 2508, Tutar: 200.00 }
    ];
    
    // This is our new sorting implementation (newest to oldest)
    const sortedData = [...mockData].sort((a, b) => 
      new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime()
    );
    
    // Check that the data is sorted correctly (latest date first)
    expect(sortedData[0].Tarih).toBe('2025-08-03');
    expect(sortedData[1].Tarih).toBe('2025-08-02');
    expect(sortedData[2].Tarih).toBe('2025-08-01');
  });

  test('handles different date formats correctly', () => {
    const mockData = [
      { Tarih: '2025-08-03T10:30:00', Donem: 2508, Tutar: 100.00 },
      { Tarih: '2025-08-01T14:15:00', Donem: 2508, Tutar: 150.00 },
      { Tarih: '2025-08-02T09:45:00', Donem: 2508, Tutar: 200.00 }
    ];
    
    // This is our new sorting implementation (newest to oldest)
    const sortedData = [...mockData].sort((a, b) => 
      new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime()
    );
    
    // Check that the data is sorted correctly regardless of time component
    expect(sortedData[0].Tarih).toBe('2025-08-03T10:30:00');
    expect(sortedData[1].Tarih).toBe('2025-08-02T09:45:00');
    expect(sortedData[2].Tarih).toBe('2025-08-01T14:15:00');
  });

  test('maintains stability for equal dates', () => {
    const mockData = [
      { Tarih: '2025-08-01', Donem: 2508, Tutar: 100.00 },
      { Tarih: '2025-08-01', Donem: 2508, Tutar: 150.00 },
      { Tarih: '2025-08-02', Donem: 2508, Tutar: 200.00 }
    ];
    
    // This is our new sorting implementation (newest to oldest)
    const sortedData = [...mockData].sort((a, b) => 
      new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime()
    );
    
    // Check that equal dates maintain their relative order
    expect(sortedData[0].Tarih).toBe('2025-08-02');
    expect(sortedData[1].Tutar).toBe(100.00); // First item with date 2025-08-01
    expect(sortedData[2].Tutar).toBe(150.00); // Second item with date 2025-08-01
  });
});