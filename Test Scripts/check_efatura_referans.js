// Test script to check EFaturaReferans entries and matching logic
const fs = require('fs');

// Function to normalize Turkish characters
const normalizeText = (text) => {
  if (!text) return "";
  return text
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
    .toLowerCase()
    .trim();
};

// Mock EFaturaReferans data (simulating what would come from the database)
const mockEFaturaReferansList = [
  {
    Alici_Unvani: "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ",
    Referans_Kodu: "FASDAT001",
    Kategori_ID: 17,
    Aktif_Pasif: true,
    Sube_ID: 1
  },
  {
    Alici_Unvani: "TAVUK DÜNYASI GIDA SANAYİ VE TİCARET A.Ş",
    Referans_Kodu: "TAVUK001",
    Kategori_ID: 5,
    Aktif_Pasif: true,
    Sube_ID: 1
  }
];

// Test data from the CSV file
const testInvoices = [
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

console.log("Testing EFaturaReferans matching logic...\n");

// Test the matching logic
testInvoices.forEach((invoice, index) => {
  console.log(`Invoice ${index + 1}:`);
  console.log(`  Fatura ID: ${invoice.Fatura_ID}`);
  console.log(`  Alıcı Ünvanı: ${invoice.Alici_Unvani}`);
  console.log(`  Normalized Alıcı Ünvanı: ${normalizeText(invoice.Alici_Unvani)}`);
  
  const normalizedAliciUnvani = normalizeText(invoice.Alici_Unvani);
  
  // Try to find a matching referans
  const matchingReferans = mockEFaturaReferansList.find(
    ref => ref.Alici_Unvani && 
           ref.Sube_ID === invoice.Sube_ID &&
           ref.Aktif_Pasif === true &&
           (normalizeText(ref.Alici_Unvani) === normalizedAliciUnvani ||
            normalizedAliciUnvani.includes(normalizeText(ref.Alici_Unvani)) ||
            normalizeText(ref.Alici_Unvani).includes(normalizedAliciUnvani))
  );
  
  if (matchingReferans) {
    console.log(`  Match found! Kategori_ID: ${matchingReferans.Kategori_ID}`);
  } else {
    console.log(`  No match found!`);
  }
  
  console.log("");
});

console.log("Test completed.");