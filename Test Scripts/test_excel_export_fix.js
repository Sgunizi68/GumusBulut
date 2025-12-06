/**
 * Test script to verify Excel export fix for numeric Tutar values
 * This script will check if the exported Excel files have numeric values in the Tutar column
 */

const XLSX = require('xlsx');
const fs = require('fs');

// Test function to check if Tutar values are numeric in exported Excel files
function testExcelExport(filePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return false;
        }

        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        
        // Get the detailed report sheet
        const sheetName = workbook.SheetNames.find(name => name.includes('Detayl'));
        if (!sheetName) {
            console.log('Detailed report sheet not found');
            return false;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the range of the sheet
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        // Find the Tutar column (should be column with header 'Tutar')
        let tutarColumnIndex = -1;
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col }); // Header row
            const cell = worksheet[cellAddress];
            if (cell && cell.v && cell.v.toString().includes('Tutar')) {
                tutarColumnIndex = col;
                break;
            }
        }
        
        if (tutarColumnIndex === -1) {
            console.log('Tutar column not found');
            return false;
        }
        
        console.log(`Tutar column found at index: ${tutarColumnIndex}`);
        
        // Check if Tutar values are numeric
        let allNumeric = true;
        let checkedCount = 0;
        
        for (let row = range.s.r + 1; row <= range.e.r; row++) { // Skip header row
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: tutarColumnIndex });
            const cell = worksheet[cellAddress];
            
            // Skip empty cells
            if (!cell || cell.v === undefined || cell.v === null || cell.v === '') {
                continue;
            }
            
            checkedCount++;
            
            // Check if cell type is numeric
            if (cell.t !== 'n') {
                console.log(`Non-numeric Tutar value found at row ${row + 1}: ${cell.v} (type: ${cell.t})`);
                allNumeric = false;
            } else {
                console.log(`Numeric Tutar value at row ${row + 1}: ${cell.v}`);
            }
        }
        
        console.log(`Checked ${checkedCount} Tutar values. All numeric: ${allNumeric}`);
        return allNumeric;
    } catch (error) {
        console.error('Error testing Excel export:', error);
        return false;
    }
}

// Run tests
console.log('Testing Excel export fix...');

// Test Fatura Rapor export
console.log('\n=== Testing Fatura Rapor Export ===');
// Note: In a real test, you would have an actual exported file to test
// For now, we're just showing the test structure
console.log('Test would check if Tutar values are numeric in Fatura Rapor Excel export');

// Test Odeme Rapor export
console.log('\n=== Testing Odeme Rapor Export ===');
// Note: In a real test, you would have an actual exported file to test
// For now, we're just showing the test structure
console.log('Test would check if Tutar values are numeric in Odeme Rapor Excel export');

console.log('\nTest script completed.');