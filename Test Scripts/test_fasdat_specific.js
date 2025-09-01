// Test script specifically for the FASDAT company case mentioned in the issue
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

// Test the specific case from the CSV file
const csvInvoiceData = [
  {
    Fatura_ID: 3696,
    Fatura_Tarihi: "2025-08-28",
    Fatura_Numarasi: "FSE2025000679159",
    Alici_Unvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
    Tutar: 2424.00,
    Sube_ID: 1
  },
  {
    Fatura_ID: 3697,
    Fatura_Tarihi: "2025-08-28",
    Fatura_Numarasi: "FSE2025000678837",
    Alici_Unvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
    Tutar: 1116.52,
    Sube_ID: 1
  },
  {
    Fatura_ID: 3698,
    Fatura_Tarihi: "2025-08-26",
    Fatura_Numarasi: "FSF2025000084913",
    Alici_Unvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
    Tutar: 2424.00,
    Sube_ID: 1
  }
];

// Mock EFaturaReferans entry that should exist in the database
const mockEFaturaReferans = {
  Alici_Unvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
  Referans_Kodu: "FASDAT001",
  Kategori_ID: 17,
  Aktif_Pasif: true,
  Sube_ID: 1
};

console.log("Testing FASDAT company matching...\n");

csvInvoiceData.forEach((invoice, index) => {
  console.log(`Invoice ${index + 1} (ID: ${invoice.Fatura_ID}):`);
  console.log(`  Alıcı Ünvanı: ${invoice.Alici_Unvani}`);
  
  const normalizedInvoiceName = normalizeText(invoice.Alici_Unvani);
  const normalizedReferansName = normalizeText(mockEFaturaReferans.Alici_Unvani);
  
  console.log(`  Normalized invoice name: ${normalizedInvoiceName}`);
  console.log(`  Normalized referans name: ${normalizedReferansName}`);
  
  // Check for exact match
  if (normalizedInvoiceName === normalizedReferansName) {
    console.log(`  ✓ Exact match found! Should get Kategori_ID: ${mockEFaturaReferans.Kategori_ID}`);
  } else {
    console.log(`  ✗ No exact match`);
    
    // Check for contains match
    if (normalizedInvoiceName.includes(normalizedReferansName) || normalizedReferansName.includes(normalizedInvoiceName)) {
      console.log(`  ✓ Contains match found! Should get Kategori_ID: ${mockEFaturaReferans.Kategori_ID}`);
    } else {
      console.log(`  ✗ No contains match either`);
    }
  }
  
  console.log("");
});

console.log("Test completed. All FASDAT invoices should get Kategori_ID: 17");