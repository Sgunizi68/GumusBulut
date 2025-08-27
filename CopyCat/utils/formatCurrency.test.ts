import { describe, it, expect } from '@jest/globals';

// Currency formatting helper
const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'TRY'
    });
};

describe('formatCurrency', () => {
    it('should format small numbers correctly with currency symbol', () => {
        expect(formatCurrency(123.45)).toBe('₺123,45');
    });

    it('should format medium numbers with thousand separators and currency symbol', () => {
        expect(formatCurrency(1234.56)).toBe('₺1.234,56');
    });

    it('should format large numbers with thousand separators and currency symbol', () => {
        expect(formatCurrency(1234567.89)).toBe('₺1.234.567,89');
    });

    it('should format zero correctly with currency symbol', () => {
        expect(formatCurrency(0)).toBe('₺0,00');
    });

    it('should format negative numbers correctly with currency symbol', () => {
        expect(formatCurrency(-1234.56)).toBe('-₺1.234,56');
    });

    it('should always show two decimal places with currency symbol', () => {
        expect(formatCurrency(1000)).toBe('₺1.000,00');
        expect(formatCurrency(50)).toBe('₺50,00');
    });
});