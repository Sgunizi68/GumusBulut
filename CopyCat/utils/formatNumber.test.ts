import { describe, it, expect } from '@jest/globals';

// Numeric formatting helper with thousand separators (without currency symbol)
const formatNumber = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });
};

describe('formatNumber', () => {
    it('should format small numbers correctly', () => {
        expect(formatNumber(123.45)).toBe('123,45');
    });

    it('should format medium numbers with thousand separators', () => {
        expect(formatNumber(1234.56)).toBe('1.234,56');
    });

    it('should format large numbers with thousand separators', () => {
        expect(formatNumber(1234567.89)).toBe('1.234.567,89');
    });

    it('should format zero correctly', () => {
        expect(formatNumber(0)).toBe('0,00');
    });

    it('should format negative numbers correctly', () => {
        expect(formatNumber(-1234.56)).toBe('-1.234,56');
    });

    it('should always show two decimal places', () => {
        expect(formatNumber(1000)).toBe('1.000,00');
        expect(formatNumber(50)).toBe('50,00');
    });
});