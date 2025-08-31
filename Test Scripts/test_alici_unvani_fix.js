// Test script to verify the "Alıcı Ünvanı" or "Alıcı Adı" fix
console.log("Testing 'Alıcı Ünvanı' or 'Alıcı Adı' acceptance fix...");

// Mock data simulating Excel column headers
const testData1 = {
  "Fatura Tarihi": "01.01.2023",
  "Fatura Numarası": "FAT2023001",
  "Alıcı Ünvanı": "Test Company A",
  "Tutar": "1500,00"
};

const testData2 = {
  "Fatura Tarihi": "01.01.2023",
  "Fatura Numarası": "FAT2023001",
  "Alıcı Adı": "Test Company A",
  "Tutar": "1500,00"
};

const testData3 = {
  "Fatura Tarihi": "01.01.2023",
  "Fatura Numarası": "FAT2023001",
  "Tutar": "1500,00"
  // Missing "Alıcı Ünvanı" or "Alıcı Adı"
};

// Test function to check if required columns are present
function checkRequiredColumns(data) {
  const requiredColumns = ["Fatura Tarihi", "Fatura Numarası", "Tutar"];
  const hasAliciUnvani = Object.keys(data).some(key => key.includes("Alıcı Ünvanı"));
  const hasAliciAdi = Object.keys(data).some(key => key.includes("Alıcı Adı"));
  const missingColumns = requiredColumns.filter(col => 
    !Object.keys(data).some(key => key.includes(col))
  );

  // Add "Alıcı Ünvanı veya Alıcı Adı" to missing columns if neither is found
  if (!hasAliciUnvani && !hasAliciAdi) {
    missingColumns.push("Alıcı Ünvanı veya Alıcı Adı");
  }

  return missingColumns;
}

// Run tests
console.log("\nTest 1 - With 'Alıcı Ünvanı':");
const missing1 = checkRequiredColumns(testData1);
console.log("Missing columns:", missing1);
console.log(missing1.length === 0 ? "✓ PASS: All required columns found" : "✗ FAIL: Missing columns");

console.log("\nTest 2 - With 'Alıcı Adı':");
const missing2 = checkRequiredColumns(testData2);
console.log("Missing columns:", missing2);
console.log(missing2.length === 0 ? "✓ PASS: All required columns found" : "✗ FAIL: Missing columns");

console.log("\nTest 3 - Missing both 'Alıcı Ünvanı' and 'Alıcı Adı':");
const missing3 = checkRequiredColumns(testData3);
console.log("Missing columns:", missing3);
console.log(missing3.includes("Alıcı Ünvanı veya Alıcı Adı") ? "✓ PASS: Correctly identified missing column" : "✗ FAIL: Should have identified missing column");

console.log("\nFix verification complete!");