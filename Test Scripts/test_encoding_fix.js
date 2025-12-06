// Test script to verify the improved encoding handling for Turkish characters
const fs = require('fs');

// Enhanced normalization function for Turkish characters and encoding issues
const normalizeText = (text) => {
  if (!text) return "";
  
  // Handle various encoding issues for Turkish characters
  return text
    // Common UTF-8 to ISO-8859-9 conversion issues
    .replace(/Ãœ/g, 'Ü')
    .replace(/Ã–/g, 'Ö')
    .replace(/Ã‡/g, 'Ç')
    .replace(/Ãž/g, 'Ş')
    .replace(/Ä°/g, 'İ')
    .replace(/Äž/g, 'ğ')
    .replace(/Åž/g, 'Ş')
    .replace(/Å/g, 'Ş')
    .replace(/Ä/g, 'A')
    .replace(/Ã/g, 'A')
    .replace(/Â/g, '')
    // Additional character fixes
    .replace(/Ð/g, 'Ğ')
    .replace(/Ý/g, 'İ')
    .replace(/Þ/g, 'Ş')
    .replace(/Ð/g, 'Ğ')
    .replace(/ý/g, 'ı')
    .replace(/þ/g, 'ş')
    .replace(/ð/g, 'ğ')
    // Standard Turkish characters
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    // Remove extra spaces and normalize
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// Test cases with various encoding issues
const testCases = [
  {
    name: "Normal Turkish text",
    input: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
    expected: "fasdat gida dagitim sanayi ve ticaret anonim sirketi"
  },
  {
    name: "UTF-8 to ISO-8859-9 conversion issues",
    input: "FASDAT GIDA DAÄžITIM SANAYÄ° VE TÄ°CARET ANONÄ°M ÅžÄ°RKETÄ°",
    expected: "fasdat gida dagitim sanayi ve ticaret anonim sirketi"
  },
  {
    name: "Mixed encoding issues",
    input: "FASDAT GIDA DAÃ°ITIM SANAYÃ VE TÃCARET ANONÃM ÃÃRKETÃ",
    expected: "fasdat gida dagitim sanayi ve ticaret anonim sirketi"
  },
  {
    name: "Extra spaces",
    input: "  FASDAT   GIDA  DAĞITIM  SANAYİ  VE  TİCARET  ANONİM  ŞİRKETİ  ",
    expected: "fasdat gida dagitim sanayi ve ticaret anonim sirketi"
  }
];

console.log("Testing text normalization for Turkish characters...\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input:  "${testCase.input}"`);
  
  const normalized = normalizeText(testCase.input);
  console.log(`Output: "${normalized}"`);
  console.log(`Expected: "${testCase.expected}"`);
  console.log(`Match: ${normalized === testCase.expected ? "✓ PASS" : "✗ FAIL"}`);
  console.log("");
});

// Test matching logic
const mockEFaturaReferansList = [
  {
    Alici_Unvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
    Referans_Kodu: "FASDAT001",
    Kategori_ID: 17,
    Aktif_Pasif: true,
    Sube_ID: 1
  }
];

const testInvoices = [
  {
    invoiceName: "Normal text",
    aliciUnvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ"
  },
  {
    invoiceName: "Encoding issues",
    aliciUnvani: "FASDAT GIDA DAÄžITIM SANAYÄ° VE TÄ°CARET ANONÄ°M ÅžÄ°RKETÄ°"
  },
  {
    invoiceName: "More encoding issues",
    aliciUnvani: "FASDAT GIDA DAÃ°ITIM SANAYÃ VE TÃCARET ANONÃM ÃÃRKETÃ"
  }
];

console.log("Testing matching logic with encoding issues...\n");

testInvoices.forEach((invoice, index) => {
  console.log(`Invoice Test ${index + 1}: ${invoice.invoiceName}`);
  console.log(`Invoice name: "${invoice.aliciUnvani}"`);
  
  const normalizedInvoiceName = normalizeText(invoice.aliciUnvani);
  console.log(`Normalized: "${normalizedInvoiceName}"`);
  
  // Try to find a matching referans
  const matchingReferans = mockEFaturaReferansList.find(ref => {
    const normalizedRefName = normalizeText(ref.Alici_Unvani);
    console.log(`  Comparing with: "${ref.Alici_Unvani}" -> "${normalizedRefName}"`);
    
    // Exact match
    if (normalizedRefName === normalizedInvoiceName) {
      console.log(`  Exact match found!`);
      return true;
    }
    
    // Contains match
    if (normalizedInvoiceName.includes(normalizedRefName) || normalizedRefName.includes(normalizedInvoiceName)) {
      console.log(`  Contains match found!`);
      return true;
    }
    
    return false;
  });
  
  if (matchingReferans) {
    console.log(`  Result: Match found! Kategori_ID = ${matchingReferans.Kategori_ID}`);
  } else {
    console.log(`  Result: No match found!`);
  }
  
  console.log("");
});

console.log("Test completed.");