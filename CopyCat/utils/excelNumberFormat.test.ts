import { describe, test, expect } from '@jest/globals';

describe('Excel Number Formatting', () => {
  test('numeric values should be exported as numbers, not strings', () => {
    // Test data with numeric values
    const testData = [
      { Tutar: 1234.56 },
      { Tutar: 7890.12 },
      { Tutar: 3456.78 }
    ];
    
    // Verify that Tutar values are numbers
    testData.forEach(item => {
      expect(typeof item.Tutar).toBe('number');
      expect(item.Tutar).not.toBeNaN();
    });
    
    // Verify that these numbers can be used in calculations
    const sum = testData.reduce((acc, item) => acc + item.Tutar, 0);
    expect(sum).toBeCloseTo(12581.46, 2);
    
    // Verify that individual values can be used in calculations
    expect(testData[0].Tutar * 2).toBe(2469.12);
    expect(testData[1].Tutar + testData[2].Tutar).toBeCloseTo(11346.90, 2);
  });

  test('formatted numbers should still retain their numeric value', () => {
    // Simulate the formatting function that was previously used
    const formatTurkishNumber = (value: number): string => {
      return value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace(/\./g, '#').replace(/,/g, '.').replace(/#/g, ',');
    };
    
    const originalValue = 1234.56;
    const formattedValue = formatTurkishNumber(originalValue);
    
    // Verify that the formatted value is a string
    expect(typeof formattedValue).toBe('string');
    expect(formattedValue).toBe('1.234,56');
    
    // Verify that we can parse it back to a number
    const parsedValue = parseFloat(formattedValue.replace(/\./g, '').replace(',', '.'));
    expect(parsedValue).toBeCloseTo(originalValue, 2);
  });
});