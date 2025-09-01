// Test script with a better encoding fix for Turkish characters
console.log("Testing better encoding fix for Turkish characters...");

// Mock data with encoding issues
const invoiceAliciUnvani = "FASDAT GIDA DAÄžITIM SANAYÄ° VE TÄ°CARET ANONÄ°M ÅžÄ°RKETÄ°"; // From CSV (encoded)
const referansAliciUnvani = "FASDAT GIDA DAĞITIM SANAYİ VE TİCARET ANONİM ŞİRKETİ"; // What we expect in referans

console.log("Invoice Alici_Unvani:", invoiceAliciUnvani);
console.log("Referans Alici_Unvani:", referansAliciUnvani);
console.log("Direct match:", invoiceAliciUnvani === referansAliciUnvani);

// Better normalization function that handles the specific encoding issues
function normalizeTurkishText(text) {
  if (!text) return "";
  
  return text
    // Handle the specific encoding issues we see in the data
    .replace(/Ãœ/g, 'Ü')      // Ãœ -> Ü
    .replace(/Ã–/g, 'Ö')      // Ã– -> Ö
    .replace(/Ã‡/g, 'Ç')      // Ã‡ -> Ç
    .replace(/Ãž/g, 'Ş')      // Ãž -> Ş
    .replace(/Ä°/g, 'İ')      // Ä° -> İ
    .replace(/Äž/g, 'ğ')      // Äž -> ğ
    .replace(/Åž/g, 'Ş')      // Åž -> Ş
    .replace(/Å/g, 'Ş')       // Å -> Ş (approximation)
    .replace(/Ä/g, 'A')       // Ä -> A (approximation)
    .replace(/Ã/g, 'A')       // Ã -> A (approximation)
    .replace(/Â/g, '')         // Remove Â
    // Handle remaining common Turkish character mappings
    .replace(/ü/g, 'ü')
    .replace(/ö/g, 'ö')
    .replace(/ç/g, 'ç')
    .replace(/ş/g, 'ş')
    .replace(/ı/g, 'ı')
    .replace(/i/g, 'i')
    .replace(/ğ/g, 'ğ')
    .trim();
}

const normalizedInvoice = normalizeTurkishText(invoiceAliciUnvani);
const normalizedReferans = normalizeTurkishText(referansAliciUnvani);

console.log("\nNormalized texts:");
console.log("Normalized Invoice:", normalizedInvoice);
console.log("Normalized Referans:", normalizedReferans);
console.log("Normalized match:", normalizedInvoice === normalizedReferans);

// Even more flexible approach - check if one contains the other after normalization
const containsMatch = normalizedInvoice.includes(normalizedReferans) || normalizedReferans.includes(normalizedInvoice);
console.log("Contains match:", containsMatch);

// Test our improved matching logic
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

// Improved matching logic with better normalization
function findMatchingReferansWithBetterNormalization(invoice, referansList) {
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
      .trim();
  };
  
  const normalizedInvoiceUnvani = normalizeText(invoice.aliciUnvani);
  
  return referansList.find(
    ref => ref.Alici_Unvani && 
           (normalizeText(ref.Alici_Unvani) === normalizedInvoiceUnvani ||
            normalizedInvoiceUnvani.includes(normalizeText(ref.Alici_Unvani)) ||
            normalizeText(ref.Alici_Unvani).includes(normalizedInvoiceUnvani)) && 
           ref.Sube_ID === invoice.subeId &&
           ref.Aktif_Pasif === true
  );
}

const improvedMatchingReferans = findMatchingReferansWithBetterNormalization(testInvoice, mockEFaturaReferansList);

console.log("\nImproved matching result:");
console.log("Match found:", improvedMatchingReferans ? `Yes, Kategori_ID: ${improvedMatchingReferans.Kategori_ID}` : "No");

console.log("\nEncoding fix test completed!");