// Numeric formatting helper with thousand separators (without currency symbol)
const formatNumber = (amount) => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });
};

// Currency formatting helper
const formatCurrency = (amount) => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'TRY'
    });
};

console.log('Testing formatNumber function:');
console.log('formatNumber(123.45):', formatNumber(123.45));
console.log('formatNumber(1234.56):', formatNumber(1234.56));
console.log('formatNumber(1234567.89):', formatNumber(1234567.89));
console.log('formatNumber(0):', formatNumber(0));
console.log('formatNumber(-1234.56):', formatNumber(-1234.56));
console.log('formatNumber(1000):', formatNumber(1000));
console.log('formatNumber(50):', formatNumber(50));

console.log('\nTesting formatCurrency function:');
console.log('formatCurrency(123.45):', formatCurrency(123.45));
console.log('formatCurrency(1234.56):', formatCurrency(1234.56));
console.log('formatCurrency(1234567.89):', formatCurrency(1234567.89));
console.log('formatCurrency(0):', formatCurrency(0));
console.log('formatCurrency(-1234.56):', formatCurrency(-1234.56));
console.log('formatCurrency(1000):', formatCurrency(1000));
console.log('formatCurrency(50):', formatCurrency(50));