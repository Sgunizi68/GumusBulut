// Test script to verify the e-Fatura matching functionality
console.log("Testing e-Fatura matching based on 'Alıcı Ünvanı'...");

// Mock data for testing
const mockEFaturaReferansList = [
  {
    Alici_Unvani: "ABC Company",
    Fatura_Numarasi_Prefix: "ABC",
    Kategori_ID: 10,
    Sube_ID: 1,
    Aktif_Pasif: true
  },
  {
    Alici_Unvani: "XYZ Corporation",
    Fatura_Numarasi_Prefix: "XYZ",
    Kategori_ID: 20,
    Sube_ID: 1,
    Aktif_Pasif: true
  },
  {
    Alici_Unvani: "Test Company",
    Fatura_Numarasi_Prefix: null,
    Kategori_ID: 30,
    Sube_ID: 1,
    Aktif_Pasif: true
  }
];

const testInvoice1 = {
  faturaNumarasi: "ABC2023001",
  aliciUnvani: "ABC Company",
  subeId: 1
};

const testInvoice2 = {
  faturaNumarasi: "XYZ2023001",
  aliciUnvani: "XYZ Corporation",
  subeId: 1
};

const testInvoice3 = {
  faturaNumarasi: "TEST2023001",
  aliciUnvani: "Test Company",
  subeId: 1
};

const testInvoice4 = {
  faturaNumarasi: "NO_MATCH2023001",
  aliciUnvani: "No Match Company",
  subeId: 1
};

// Function to find matching referans (same logic as in the frontend)
function findMatchingReferans(invoice, referansList) {
  // 1. First try to match by Fatura_Numarasi_Prefix
  let matchingReferans = referansList.find(
    ref => ref.Fatura_Numarasi_Prefix && 
           invoice.faturaNumarasi.startsWith(ref.Fatura_Numarasi_Prefix) && 
           ref.Sube_ID === invoice.subeId
  );
  
  // 2. If no match found by prefix, try to match by Alici_Unvani
  if (!matchingReferans) {
    matchingReferans = referansList.find(
      ref => ref.Alici_Unvani && 
             ref.Alici_Unvani === invoice.aliciUnvani && 
             ref.Sube_ID === invoice.subeId
    );
  }
  
  return matchingReferans;
}

// Run tests
console.log("\nTest 1 - Match by Fatura_Numarasi_Prefix:");
const match1 = findMatchingReferans(testInvoice1, mockEFaturaReferansList);
console.log("Invoice:", testInvoice1);
console.log("Match found:", match1 ? `Yes, Kategori_ID: ${match1.Kategori_ID}` : "No");
console.log(match1 ? "✓ PASS: Correctly matched by prefix" : "✗ FAIL: Should have matched by prefix");

console.log("\nTest 2 - Match by Fatura_Numarasi_Prefix:");
const match2 = findMatchingReferans(testInvoice2, mockEFaturaReferansList);
console.log("Invoice:", testInvoice2);
console.log("Match found:", match2 ? `Yes, Kategori_ID: ${match2.Kategori_ID}` : "No");
console.log(match2 ? "✓ PASS: Correctly matched by prefix" : "✗ FAIL: Should have matched by prefix");

console.log("\nTest 3 - Match by Alici_Unvani:");
const match3 = findMatchingReferans(testInvoice3, mockEFaturaReferansList);
console.log("Invoice:", testInvoice3);
console.log("Match found:", match3 ? `Yes, Kategori_ID: ${match3.Kategori_ID}` : "No");
console.log(match3 ? "✓ PASS: Correctly matched by Alici_Unvani" : "✗ FAIL: Should have matched by Alici_Unvani");

console.log("\nTest 4 - No match:");
const match4 = findMatchingReferans(testInvoice4, mockEFaturaReferansList);
console.log("Invoice:", testInvoice4);
console.log("Match found:", match4 ? `Yes, Kategori_ID: ${match4.Kategori_ID}` : "No");
console.log(!match4 ? "✓ PASS: Correctly identified no match" : "✗ FAIL: Should not have matched");

console.log("\nAll tests completed!");