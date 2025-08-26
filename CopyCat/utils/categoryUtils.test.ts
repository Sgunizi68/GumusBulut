import { sortKategoriler, sortActiveKategoriler, sortKategorilerByType } from '../utils/categoryUtils';
import { Kategori } from '../types';

// Test data with Turkish characters
const testKategoriler: Kategori[] = [
  {
    Kategori_ID: 1,
    Kategori_Adi: 'Çelik Malzemeler',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 2,
    Kategori_Adi: 'Büro Malzemeleri',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 3,
    Kategori_Adi: 'Şirket Araçları',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 4,
    Kategori_Adi: 'Ağ Donanımları',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 5,
    Kategori_Adi: 'İletişim Giderleri',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 6,
    Kategori_Adi: 'Özel Harcamalar',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 7,
    Kategori_Adi: 'Gıda Harcamaları',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 8,
    Kategori_Adi: 'Ulaşım Giderleri',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: false, // Inactive for testing
    Gizli: false
  },
  {
    Kategori_ID: 9,
    Kategori_Adi: 'Ğ ile Başlayan Kategori',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  },
  {
    Kategori_ID: 10,
    Kategori_Adi: 'Ü ile Başlayan Kategori',
    Ust_Kategori_ID: 1,
    Tip: 'Gider',
    Aktif_Pasif: true,
    Gizli: false
  }
];

// Test Turkish character sorting
function testTurkishSorting() {
  console.log('\n=== Testing Turkish Character Sorting ===\n');
  
  // Test basic sorting
  const sorted = sortKategoriler([...testKategoriler]);
  console.log('Sorted Categories (all):');
  sorted.forEach((k, index) => {
    console.log(`${index + 1}. ${k.Kategori_Adi}`);
  });
  
  // Expected order with Turkish collation rules:
  // 1. Ağ Donanımları
  // 2. Büro Malzemeleri
  // 3. Çelik Malzemeler
  // 4. Ğ ile Başlayan Kategori
  // 5. Gıda Harcamaları
  // 6. İletişim Giderleri
  // 7. Özel Harcamalar
  // 8. Şirket Araçları
  // 9. Ulaşım Giderleri
  // 10. Ü ile Başlayan Kategori
  
  console.log('\n=== Testing Active Category Filtering and Sorting ===\n');
  
  // Test active filtering with sorting
  const activeAndSorted = sortActiveKategoriler([...testKategoriler]);
  console.log('Active Categories (sorted):');
  activeAndSorted.forEach((k, index) => {
    console.log(`${index + 1}. ${k.Kategori_Adi}`);
  });
  
  console.log('\n=== Testing Type-based Filtering and Sorting ===\n');
  
  // Test type filtering with sorting
  const giderKategoriler = sortKategorilerByType([...testKategoriler], 'Gider');
  console.log('Gider Categories (sorted):');
  giderKategoriler.forEach((k, index) => {
    console.log(`${index + 1}. ${k.Kategori_Adi}`);
  });
  
  // Verification
  console.log('\n=== Verification ===\n');
  
  // Check that Turkish characters are sorted correctly
  const firstCategory = activeAndSorted[0];
  const secondCategory = activeAndSorted[1];
  
  console.log(`First category: ${firstCategory.Kategori_Adi}`);
  console.log(`Second category: ${secondCategory.Kategori_Adi}`);
  
  // Verify that 'Ağ' comes before 'Büro' in Turkish collation
  if (firstCategory.Kategori_Adi === 'Ağ Donanımları' && secondCategory.Kategori_Adi === 'Büro Malzemeleri') {
    console.log('✅ Turkish character sorting is working correctly!');
  } else {
    console.log('❌ Turkish character sorting may have issues.');
  }
  
  // Verify that inactive categories are filtered out
  const hasInactiveCategory = activeAndSorted.some(k => !k.Aktif_Pasif);
  if (!hasInactiveCategory) {
    console.log('✅ Inactive category filtering is working correctly!');
  } else {
    console.log('❌ Inactive categories are not being filtered properly.');
  }
  
  // Verify that all returned categories are of the requested type
  const allGiderType = giderKategoriler.every(k => k.Tip === 'Gider');
  if (allGiderType) {
    console.log('✅ Type filtering is working correctly!');
  } else {
    console.log('❌ Type filtering may have issues.');
  }
  
  console.log('\n=== Test Complete ===\n');
}

// Export for use in other files or run directly
if (typeof window === 'undefined') {
  // Node.js environment
  testTurkishSorting();
} else {
  // Browser environment
  (window as any).testTurkishSorting = testTurkishSorting;
  console.log('Turkish sorting test function is available as window.testTurkishSorting()');
}

export { testTurkishSorting };