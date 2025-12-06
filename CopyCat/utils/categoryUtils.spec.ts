// Unit tests for Category Utilities
// These tests verify the Turkish character sorting functionality

import { 
    sortKategoriler, 
    sortActiveKategoriler, 
    sortKategorilerByType,
    sortPaymentKategoriler,
    sortKategorilerByUstKategori,
    createKategoriOptions,
    createKategoriMultiSelectOptions
} from './categoryUtils';
import { Kategori } from '../types';

// Test data with comprehensive Turkish characters
const testData: Kategori[] = [
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
        Tip: 'Ödeme',
        Aktif_Pasif: true,
        Gizli: false
    },
    {
        Kategori_ID: 7,
        Kategori_Adi: 'Gıda Harcamaları',
        Ust_Kategori_ID: 2,
        Tip: 'Gelir',
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
        Kategori_Adi: 'Ğ ile Başlayan',
        Ust_Kategori_ID: 1,
        Tip: 'Gider',
        Aktif_Pasif: true,
        Gizli: true // Hidden for testing
    },
    {
        Kategori_ID: 10,
        Kategori_Adi: 'Ü ile Başlayan',
        Ust_Kategori_ID: 1,
        Tip: 'Gider',
        Aktif_Pasif: true,
        Gizli: false
    }
];\n\n// Test Functions\nfunction runAllTests(): boolean {\n    let allTestsPassed = true;\n    \n    console.log('🧪 Running Category Sorting Unit Tests\\n');\n    \n    // Test 1: Basic Turkish character sorting\n    try {\n        const sorted = sortKategoriler([...testData]);\n        const expectedOrder = [\n            'Ağ Donanımları',\n            'Büro Malzemeleri', \n            'Çelik Malzemeler',\n            'Ğ ile Başlayan',\n            'Gıda Harcamaları',\n            'İletişim Giderleri',\n            'Özel Harcamalar',\n            'Şirket Araçları',\n            'Ulaşım Giderleri',\n            'Ü ile Başlayan'\n        ];\n        \n        const actualOrder = sorted.map(k => k.Kategori_Adi);\n        const isCorrect = expectedOrder.every((name, index) => actualOrder[index] === name);\n        \n        if (isCorrect) {\n            console.log('✅ Test 1 PASSED: Basic Turkish character sorting');\n        } else {\n            console.log('❌ Test 1 FAILED: Basic Turkish character sorting');\n            console.log('Expected:', expectedOrder);\n            console.log('Actual:', actualOrder);\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 1 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    // Test 2: Active category filtering\n    try {\n        const activeCategories = sortActiveKategoriler([...testData]);\n        const hasInactiveCategory = activeCategories.some(k => !k.Aktif_Pasif);\n        \n        if (!hasInactiveCategory && activeCategories.length === 9) {\n            console.log('✅ Test 2 PASSED: Active category filtering');\n        } else {\n            console.log('❌ Test 2 FAILED: Active category filtering');\n            console.log('Found inactive categories or wrong count:', activeCategories.length);\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 2 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    // Test 3: Type-based filtering\n    try {\n        const giderCategories = sortKategorilerByType([...testData], 'Gider');\n        const allGider = giderCategories.every(k => k.Tip === 'Gider' && k.Aktif_Pasif);\n        \n        if (allGider && giderCategories.length === 6) {\n            console.log('✅ Test 3 PASSED: Type-based filtering');\n        } else {\n            console.log('❌ Test 3 FAILED: Type-based filtering');\n            console.log('Categories:', giderCategories.map(k => ({ name: k.Kategori_Adi, tip: k.Tip, aktif: k.Aktif_Pasif })));\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 3 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    // Test 4: Payment category filtering\n    try {\n        const paymentCategories = sortPaymentKategoriler([...testData]);\n        const allPaymentTypes = paymentCategories.every(k => \n            (k.Tip === 'Ödeme' || k.Tip === 'Gider') && k.Aktif_Pasif\n        );\n        \n        if (allPaymentTypes && paymentCategories.length === 7) {\n            console.log('✅ Test 4 PASSED: Payment category filtering');\n        } else {\n            console.log('❌ Test 4 FAILED: Payment category filtering');\n            console.log('Categories:', paymentCategories.map(k => ({ name: k.Kategori_Adi, tip: k.Tip })));\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 4 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    // Test 5: Üst Kategori filtering\n    try {\n        const ust1Categories = sortKategorilerByUstKategori([...testData], [1]);\n        const allUst1 = ust1Categories.every(k => k.Ust_Kategori_ID === 1 && k.Aktif_Pasif);\n        \n        if (allUst1 && ust1Categories.length === 7) {\n            console.log('✅ Test 5 PASSED: Üst Kategori filtering');\n        } else {\n            console.log('❌ Test 5 FAILED: Üst Kategori filtering');\n            console.log('Expected 7 categories with Ust_Kategori_ID = 1, got:', ust1Categories.length);\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 5 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    // Test 6: Options creation\n    try {\n        const options = createKategoriOptions(sortActiveKategoriler([...testData]), true);\n        const hasEmptyOption = options[0].value === '' && options[0].label === 'Seçin...';\n        \n        if (hasEmptyOption && options.length === 10) { // 9 active + 1 empty\n            console.log('✅ Test 6 PASSED: Options creation with empty');\n        } else {\n            console.log('❌ Test 6 FAILED: Options creation with empty');\n            console.log('First option:', options[0], 'Total length:', options.length);\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 6 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    // Test 7: Multi-select options creation\n    try {\n        const multiOptions = createKategoriMultiSelectOptions(sortActiveKategoriler([...testData]), true);\n        const hasUncategorized = multiOptions[0].value === -1 && multiOptions[0].label === 'Kategorilendirilmemiş';\n        \n        if (hasUncategorized && multiOptions.length === 10) { // 9 active + 1 uncategorized\n            console.log('✅ Test 7 PASSED: Multi-select options creation');\n        } else {\n            console.log('❌ Test 7 FAILED: Multi-select options creation');\n            console.log('First option:', multiOptions[0], 'Total length:', multiOptions.length);\n            allTestsPassed = false;\n        }\n    } catch (error) {\n        console.log('❌ Test 7 ERROR:', error);\n        allTestsPassed = false;\n    }\n    \n    console.log('\\n' + '='.repeat(50));\n    if (allTestsPassed) {\n        console.log('🎉 ALL TESTS PASSED! Category sorting is working correctly.');\n    } else {\n        console.log('💥 SOME TESTS FAILED! Please check the implementation.');\n    }\n    console.log('='.repeat(50) + '\\n');\n    \n    return allTestsPassed;\n}\n\n// Manual verification function for Turkish character order\nfunction verifyTurkishOrder(): void {\n    console.log('\\n📝 Turkish Character Order Verification:');\n    \n    const testWords = ['Ağaç', 'Büyük', 'Çiçek', 'Ğ', 'Gül', 'İyi', 'Öz', 'Şeker', 'Ülke'];\n    const sorted = testWords.sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }));\n    \n    console.log('Sorted Turkish words:', sorted);\n    console.log('Expected order: [\"Ağaç\", \"Büyük\", \"Çiçek\", \"Ğ\", \"Gül\", \"İyi\", \"Öz\", \"Şeker\", \"Ülke\"]');\n}\n\n// Export functions for external use\nexport {\n    runAllTests,\n    verifyTurkishOrder,\n    testData\n};\n\n// Auto-run tests if this file is executed directly\nif (typeof window === 'undefined') {\n    // Node.js environment\n    runAllTests();\n    verifyTurkishOrder();\n} else {\n    // Browser environment\n    (window as any).runCategoryTests = runAllTests;\n    (window as any).verifyTurkishOrder = verifyTurkishOrder;\n    console.log('Category sorting tests available as window.runCategoryTests() and window.verifyTurkishOrder()');\n}