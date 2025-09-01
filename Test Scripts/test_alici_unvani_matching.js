// Test script to verify the exact matching issue with "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ"
console.log("Testing exact matching for 'FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ'...");

// Mock data based on what we saw in the CSV
const invoiceAliciUnvani = "FASDAT GIDA DAÄžITIM SANAYÄ° VE TÄ°CARET ANONÄ°M ÅžÄ°RKETÄ°"; // From CSV (encoded)
const referansAliciUnvani = "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ"; // What we expect in referans

console.log("Invoice Alici_Unvani:", invoiceAliciUnvani);
console.log("Referans Alici_Unvani:", referansAliciUnvani);
console.log("Direct match:", invoiceAliciUnvani === referansAliciUnvani);

// Test with includes to see if it's a partial match issue
console.log("Includes match:", invoiceAliciUnvani.includes("FASDAT"));

// Test with a more flexible matching approach
function normalizeText(text) {
  return text
    .replace(/Ä/g, 'A')
    .replace(/Å/g, 'S')
    .replace(/°/g, 'I')
    .replace(/Þ/g, 'Ş')
    .replace(/Ý/g, 'İ')
    .replace(/Ð/g, 'Ğ')
    .replace(/Ü/g, 'Ü')
    .replace(/Ö/g, 'Ö')
    .replace(/Ç/g, 'Ç')
    .trim();
}

const normalizedInvoice = normalizeText(invoiceAliciUnvani);
const normalizedReferans = normalizeText(referansAliciUnvani);

console.log("\nNormalized texts:");
console.log("Normalized Invoice:", normalizedInvoice);
console.log("Normalized Referans:", normalizedReferans);
console.log("Normalized match:", normalizedInvoice === normalizedReferans);

// Test our current matching logic
const mockEFaturaReferansList = [
  {
    Alici_Unvani: referansAliciUnvani,
    Kategori_ID: 17,
    Sube_ID: 1,
    Aktif_Pasif: true
  }
];

const testInvoice = {
  aliciUnvani: invoiceAliciUnvani,
  subeId: 1
};

// Current matching logic
const matchingReferans = mockEFaturaReferansList.find(
  ref => ref.Alici_Unvani && 
         ref.Alici_Unvani === testInvoice.aliciUnvani && 
         ref.Sube_ID === testInvoice.subeId
);

console.log("\nCurrent matching result:");
console.log("Match found:", matchingReferans ? `Yes, Kategori_ID: ${matchingReferans.Kategori_ID}` : "No");

// Improved matching logic with normalization
function findMatchingReferansWithNormalization(invoice, referansList) {
  const normalizedInvoiceUnvani = normalizeText(invoice.aliciUnvani);
  
  return referansList.find(
    ref => ref.Alici_Unvani && 
           normalizeText(ref.Alici_Unvani) === normalizedInvoiceUnvani && 
           ref.Sube_ID === invoice.subeId
  );
}

const improvedMatchingReferans = findMatchingReferansWithNormalization(testInvoice, mockEFaturaReferansList);

console.log("\nImproved matching result:");
console.log("Match found:", improvedMatchingReferans ? `Yes, Kategori_ID: ${improvedMatchingReferans.Kategori_ID}` : "No");

console.log("\nTest completed!");