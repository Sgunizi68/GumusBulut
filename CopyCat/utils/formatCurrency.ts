/**
 * Currency formatting helper
 * @param amount - The number to format as currency
 * @returns Formatted string with currency symbol, thousand separators and 2 decimal places
 */
export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'TRY'
    });
};