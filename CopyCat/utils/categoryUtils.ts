import { Kategori } from '../types';

/**
 * Standardized category sorting function using Turkish locale
 * Follows the design specification for consistent alphabetical sorting
 * 
 * @param kategoriler Array of category objects to sort
 * @returns Sorted array of categories by Kategori_Adi in Turkish alphabetical order
 */
export const sortKategoriler = (kategoriler: Kategori[]): Kategori[] => {
  return kategoriler.sort((a, b) => 
    a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { 
      sensitivity: 'base' 
    })
  );
};

/**
 * Filter and sort active categories
 * Combines filtering for active categories with consistent sorting
 * 
 * @param kategoriler Array of all categories
 * @returns Sorted array of only active categories
 */
export const sortActiveKategoriler = (kategoriler: Kategori[]): Kategori[] => {
  return kategoriler
    .filter(k => k.Aktif_Pasif)
    .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { 
      sensitivity: 'base' 
    }));
};

/**
 * Filter and sort categories by type with visibility permissions
 * Used for specific category type filtering with permission-based visibility
 * 
 * @param kategoriler Array of all categories
 * @param tip Category type filter ("Gelir", "Gider", "Bilgi", "Ödeme", "Giden Fatura")
 * @param canViewGizli Whether user can view hidden categories
 * @returns Sorted array of filtered categories
 */
export const sortKategorilerByType = (
  kategoriler: Kategori[], 
  tip: string, 
  canViewGizli: boolean = true
): Kategori[] => {
  return kategoriler
    .filter(k => 
      k.Aktif_Pasif &&
      k.Tip === tip &&
      (canViewGizli || !k.Gizli)
    )
    .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { 
      sensitivity: 'base' 
    }));
};

/**
 * Filter and sort payment categories (Ödeme and Gider types)
 * Specifically for payment-related category dropdowns
 * 
 * @param kategoriler Array of all categories
 * @returns Sorted array of payment categories
 */
export const sortPaymentKategoriler = (kategoriler: Kategori[]): Kategori[] => {
  return kategoriler
    .filter(k => k.Aktif_Pasif && (k.Tip === 'Ödeme' || k.Tip === 'Gider'))
    .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { 
      sensitivity: 'base' 
    }));
};

/**
 * Filter and sort e-Fatura categories (Giden Fatura type)
 * Specifically for e-Fatura-related category dropdowns
 * 
 * @param kategoriler Array of all categories
 * @returns Sorted array of e-Fatura categories
 */
export const sortEFaturaKategoriler = (kategoriler: Kategori[]): Kategori[] => {
  return kategoriler
    .filter(k => k.Aktif_Pasif && k.Tip === 'Giden Fatura')
    .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { 
      sensitivity: 'base' 
    }));
};

/**
 * Sort categories with Üst Kategori filtering
 * Used for categories that belong to specific parent categories
 * 
 * @param kategoriler Array of all categories
 * @param ustKategoriIds Array of parent category IDs to filter by
 * @returns Sorted array of categories belonging to specified parent categories
 */
export const sortKategorilerByUstKategori = (
  kategoriler: Kategori[], 
  ustKategoriIds: number[]
): Kategori[] => {
  return kategoriler
    .filter(k => 
      k.Aktif_Pasif && 
      ustKategoriIds.includes(k.Ust_Kategori_ID || 0)
    )
    .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { 
      sensitivity: 'base' 
    }));
};

/**
 * Create dropdown options from sorted categories
 * Converts category array to option format for select components
 * 
 * @param kategoriler Sorted array of categories
 * @param includeEmpty Whether to include empty "Seçin..." option
 * @returns Array of option objects for dropdown components
 */
export const createKategoriOptions = (
  kategoriler: Kategori[], 
  includeEmpty: boolean = true
): Array<{value: string | number, label: string}> => {
  const options = kategoriler.map(k => ({
    value: k.Kategori_ID,
    label: k.Kategori_Adi
  }));

  if (includeEmpty) {
    return [{ value: '', label: 'Seçin...' }, ...options];
  }

  return options;
};

/**
 * Create multi-select options for category filters
 * Includes special options for uncategorized items
 * 
 * @param kategoriler Sorted array of categories
 * @param includeUncategorized Whether to include "Kategorilendirilmemiş" option
 * @returns Array of option objects for multi-select components
 */
export const createKategoriMultiSelectOptions = (
  kategoriler: Kategori[],
  includeUncategorized: boolean = true
): Array<{value: string | number, label: string}> => {
  const options = kategoriler.map(k => ({
    value: k.Kategori_ID,
    label: k.Kategori_Adi
  }));

  if (includeUncategorized) {
    return [
      { value: -1, label: 'Kategorilendirilmemiş' },
      ...options
    ];
  }

  return options;
};