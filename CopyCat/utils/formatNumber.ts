/**
 * Numeric formatting helper with thousand separators (without currency symbol)
 * @param amount - The number to format
 * @returns Formatted string with thousand separators and 2 decimal places
 */
export const formatNumber = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });
};