
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { generateDashboardPdf } from './utils/pdfGenerator';
import * as XLSX from 'xlsx';
import { useAppContext, useDataContext, fetchData } from './App';
import { API_BASE_URL } from './constants';
import { useToast } from './contexts/ToastContext';
import { Button, Input, Modal, Card, TableLayout, StatusBadge, UserForm, RoleForm, PermissionForm, Select, DegerForm, Textarea, UstKategoriForm, KategoriForm, InlineEditInput, DigerHarcamaForm, StokForm, StokFiyatForm, NumberSpinnerInput, CalisanForm, PuantajSecimiForm, SubeForm, EFaturaReferansForm, OdemeReferansForm, NakitForm, AvansIstekForm } from './components';
import { 
    Icons, 
    MOCK_USERS, MOCK_ROLES, MOCK_USER_ROLES, MOCK_ROLE_PERMISSIONS, MOCK_BRANCHES, 
    MOCK_DEGERLER, DEFAULT_END_DATE, MOCK_UST_KATEGORILER, MOCK_KATEGORILER, MOCK_E_FATURA_EXCEL_SAMPLE, 
    OZEL_FATURA_YETKI_ADI, DEFAULT_PERIOD, MOCK_B2B_EKSTRE_EXCEL_SAMPLE, HarcamaTipiOptions, 
    MOCK_STOK_FIYATLAR, PUANTAJ_HISTORY_ACCESS_YETKI_ADI, GELIR_GECMISI_YETKI_ADI, 
    GIZLI_KATEGORI_YETKISI_ADI, 
    YAZDIRMA_YETKISI_ADI,
    EXCELE_AKTAR_YETKISI_ADI,
    DASHBOARD_EKRANI_YETKI_ADI, SUBE_YONETIMI_EKRANI_YETKI_ADI, DEGER_YONETIMI_EKRANI_YETKI_ADI, 
    KULLANICI_YONETIMI_EKRANI_YETKI_ADI, ROL_YONETIMI_EKRANI_YETKI_ADI, YETKI_YONETIMI_EKRANI_YETKI_ADI, 
    KULLANICI_ROL_ATAMA_EKRANI_YETKI_ADI, ROL_YETKI_ATAMA_EKRANI_YETKI_ADI, 
    UST_KATEGORI_YONETIMI_EKRANI_YETKI_ADI, KATEGORI_YONETIMI_EKRANI_YETKI_ADI, 
    FATURA_YUKLEME_EKRANI_YETKI_ADI, FATURA_KATEGORI_ATAMA_EKRANI_YETKI_ADI, 
    B2B_YUKLEME_EKRANI_YETKI_ADI, B2B_KATEGORI_ATAMA_EKRANI_YETKI_ADI,
    DIGER_HARCAMALAR_EKRANI_YETKI_ADI, GELIR_GIRISI_EKRANI_YETKI_ADI, 
    STOK_TANIMLAMA_EKRANI_YETKI_ADI, STOK_FIYAT_TANIMLAMA_EKRANI_YETKI_ADI, 
    STOK_SAYIM_EKRANI_YETKI_ADI, CALISAN_YONETIMI_EKRANI_YETKI_ADI, 
    PUANTAJ_SECIM_YONETIMI_EKRANI_YETKI_ADI, PUANTAJ_GIRISI_EKRANI_YETKI_ADI, 
    AVANS_TALEBI_EKRANI_YETKI_ADI, NAKIT_GIRISI_EKRANI_YETKI_ADI, FINANSAL_OZET_YETKI_ADI,
    ODEME_YUKLEME_EKRANI_YETKI_ADI, ODEME_KATEGORI_ATAMA_EKRANI_YETKI_ADI, ODEME_REFERANS_YONETIMI_EKRANI_YETKI_ADI, NAKIT_YATIRMA_RAPORU_YETKI_ADI, ODEME_RAPOR_YETKI_ADI, FATURA_RAPOR_YETKI_ADI, CARI_BORC_TAKIP_SISTEMI_YETKI_ADI // Explicitly add it here
} from './constants';
import { Kullanici, Rol, Yetki, KullaniciRol, RolYetki, KullaniciFormData, RolFormData, YetkiFormData, Sube, SubeFormData, Deger, DegerFormData, UstKategori, Kategori, UstKategoriFormData, KategoriFormData, EFatura, EFaturaExcelRow, InvoiceAssignmentFormData, B2BEkstre, B2BEkstreExcelRow, B2BAssignmentFormData, DigerHarcama, DigerHarcamaFormData, Stok, StokFormData, StokFiyat, StokFiyatFormData, StokSayim, Calisan, CalisanFormData, PuantajSecimi, PuantajSecimiFormData, PuantajEntry, HarcamaTipi, Gelir, GelirEkstra, KategoriTip, AvansIstek, AvansIstekFormData, OdemeReferans, OdemeReferansFormData, Odeme, OdemeAssignmentFormData } from './types'; 

// --- HELPER COMPONENTS & FUNCTIONS ---

export const AccessDenied: React.FC<{ title: string }> = ({ title }) => (
    <Card title={title}>
        <div className="text-center py-10">
            <h3 className="text-xl font-bold text-blue-600">Şu an bağlantıları yapıyorum, lütfen bekleyin</h3>
            <p className="text-gray-600 mt-2">Veriler yükleniyor, bu işlem birkaç saniye sürebilir.</p>
        </div>
    </Card>
);

// Helper function to convert DD.MM.YYYY to YYYY-MM-DD
const parseDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    // Assuming DD.MM.YYYY
    const [day, month, year] = parts;
    if (day && month && year && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  // If already YYYY-MM-DD or other, return as is (could add more robust parsing)
  return dateStr; 
};

const parseDMYDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  // Handles DD-MM-YY, DD.MM.YY, DD/MM/YY
  const parts = dateStr.split(/[-./]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    if (day && month && year) {
        if (year.length === 2) {
            const currentYear = new Date().getFullYear();
            const currentCentury = Math.floor(currentYear / 100) * 100;
            let fullYear = currentCentury + parseInt(year, 10);
            // If the resulting year is more than, say, 20 years in the future, assume it's from the previous century
            if (fullYear > currentYear + 20) {
                fullYear -= 100;
            }
            year = String(fullYear);
        }
        if (year.length === 4) {
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
  }
  // Also handle Excel's integer date format
  if (!isNaN(Number(dateStr))) {
      const excelEpoch = new Date(1899, 11, 30);
      const excelDate = new Date(excelEpoch.getTime() + Number(dateStr) * 24 * 60 * 60 * 1000);
      if (!isNaN(excelDate.getTime())) {
          const year = excelDate.getFullYear();
          const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
          const day = excelDate.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
      }
  }
  return dateStr; // Return original if format is not recognized
};

// Helper function to parse currency values that might be strings or numbers
const parseCurrencyValue = (value: string | number | undefined | null): number => {
    console.log(`Parsing currency value: ${value} (Type: ${typeof value})`);
    if (typeof value === 'number') {
        const num = isNaN(value) ? 0 : value;
        console.log(`Parsed as number: ${num}`);
        return num;
    }
    if (typeof value === 'string') {
        const sanitizedValue = value.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(sanitizedValue);
        console.log(`Parsed as string: ${sanitizedValue} -> ${num}`);
        return isNaN(num) ? 0 : num;
    }
    console.log(`Parsed as 0 (default)`);
    return 0; // Default for undefined, null, or other types
};


const calculatePeriod = (dateString: string): string => { // Expects YYYY-MM-DD
  try {
    const date = new Date(dateString); 
    if (isNaN(date.getTime())) throw new Error("Invalid date for period calculation");
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  } catch (e) {
    console.error("Error calculating period for date:", dateString, e);
    const now = new Date();
    const year = now.getFullYear().toString().substring(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`; // Fallback to current period
  }
};

const getPreviousPeriod = (periodYYAA: string): string => {
  if (!periodYYAA || periodYYAA.length !== 4) return periodYYAA; // Basic validation
  let year = 2000 + parseInt(periodYYAA.substring(0, 2));
  let month = parseInt(periodYYAA.substring(2, 4));

  month--;
  if (month === 0) {
    month = 12;
    year--;
  }
  return `${(year % 100).toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
};

const getNextPeriod = (periodYYAA: string): string => {
  if (!periodYYAA || periodYYAA.length !== 4) return periodYYAA;
  let year = 2000 + parseInt(periodYYAA.substring(0, 2));
  let month = parseInt(periodYYAA.substring(2, 4));

  month++;
  if (month > 12) {
    month = 1;
    year++;
  }
  return `${(year % 100).toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
};


const generatePeriodsInRange = (startYYAA: string, endYYAA: string): string[] => {
  const periods: string[] = [];
  if (!startYYAA || !endYYAA || startYYAA.length !== 4 || endYYAA.length !== 4) return periods;

  let currentYear = 2000 + parseInt(startYYAA.substring(0, 2));
  let currentMonth = parseInt(startYYAA.substring(2, 4));

  const finalYear = 2000 + parseInt(endYYAA.substring(0, 2));
  const finalMonth = parseInt(endYYAA.substring(2, 4));

  // If start is after end, return empty list
  if (currentYear > finalYear || (currentYear === finalYear && currentMonth > finalMonth)) {
    return [];
  }

  while (currentYear < finalYear || (currentYear === finalYear && currentMonth <= finalMonth)) {
    periods.push(
      `${(currentYear % 100).toString().padStart(2, '0')}${currentMonth.toString().padStart(2, '0')}`
    );
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  return periods;
};

const formatNumberForDisplay = (value: number | undefined | null, precision: number): string => {
  const numToFormat = (value === undefined || value === null || isNaN(value))
    ? 0
    : (precision === 0 ? Math.round(value) : value);

  return numToFormat.toLocaleString('tr-TR', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping: true,
  });
};

const formatTrCurrencyAdvanced = (value: number | undefined | null, defaultPrecision = 2): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return ''; 
    }
    return value.toLocaleString('tr-TR', {
        minimumFractionDigits: defaultPrecision,
        maximumFractionDigits: defaultPrecision,
        useGrouping: true,
    });
};


const getDaysInMonth = (periodYYAA: string): number => {
    if (!periodYYAA || periodYYAA.length !== 4) return 30; // Default fallback
    const year = 2000 + parseInt(periodYYAA.substring(0, 2));
    const month = parseInt(periodYYAA.substring(2, 4));
    return new Date(year, month, 0).getDate();
};

const isPeriodEditable = (periodYYAA: string, currentAppPeriod: string): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const periodYear = 2000 + parseInt(periodYYAA.substring(0, 2));
  const periodMonth = parseInt(periodYYAA.substring(2, 4));

  // Current period is always editable
  if (periodYear === currentYear && periodMonth === currentMonth) {
    return true;
  }

  // Previous period is editable within the first 5 days of the current month
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 0); // Last day of previous month
  const previousPeriodYear = previousMonthDate.getFullYear();
  const previousPeriodMonth = previousMonthDate.getMonth() + 1;

  if (periodYear === previousPeriodYear && periodMonth === previousPeriodMonth) {
    return currentDay <= 5;
  }

  // Any other period is not editable
  return false;
};

// Helper to determine text color based on background
const getTextColorForBackground = (hexColor: string): string => {
    if (!hexColor) return '#000000'; // Default to black
    try {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        // Standard luminance calculation
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF'; // Black for light bg, White for dark bg
    } catch (e) {
        return '#000000'; // Fallback
    }
};

// --- Avans Page Number Formatting Helpers ---
const formatAvansTutarForDisplay = (value: string | number | undefined): string => {
  if (value === undefined || value === null || value === '') return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : Math.round(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('tr-TR');
};

const parseAvansTutarForStorage = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  const num = parseInt(formattedValue.replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// Helper to get day's total from a Map, returns 0 if not found
const getDailyTotal = (dailyTotalsMap: Map<string, number>, dateString: string) => {
    return dailyTotalsMap.get(dateString) || 0;
};


// --- PAGES ---

export const LoginPage: React.FC = () => {
  const { login } = useAppContext();
  const { showError } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) { 
      login(username, password);
    } else {
      showError("Giriş Hatası", "Kullanıcı adı ve şifre gereklidir.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <Card title="SilverCloud System Giriş" className="w-full max-w-md bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Kullanıcı Adı" 
            id="username" 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Kullanıcı adınızı girin"
            required 
          />
          <Input 
            label="Şifre" 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Şifrenizi girin"
            required 
          />
          <Button type="submit" variant="primary" className="w-full text-lg">
            Giriş Yap
          </Button>
        </form>
      </Card>
    </div>
  );
};

// --- DASHBOARD PAGE ---
interface DashboardRowData {
  label: string;
  value: number;
  isFromPreviousPeriod?: boolean;
  isSubItem?: boolean;
  isSubSubItem?: boolean;
  isBold?: boolean;
  isEmphasized?: boolean;
  isTitle?: boolean;
  bgColor?: string;
  textColor?: string;
  percentage?: number;
}

export const DashboardPage: React.FC = () => {
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
  const [gidenFaturaData, setGidenFaturaData] = useState<any[]>([]);
  const {
    gelirEkstraList, eFaturaList, b2bEkstreList, digerHarcamaList, gelirList,
    stokSayimList, stokFiyatList, stokList, kategoriList, ustKategoriList
  } = useDataContext();
  const [loadData, setLoadData] = useState(false);

  if (!selectedBranch) {
    return <Card title="Dashboard Raporu"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  const canViewGizliKategoriler = hasPermission(GIZLI_KATEGORI_YETKISI_ADI);
  const canViewFullHistory = hasPermission(GIZLI_KATEGORI_YETKISI_ADI); // As per doc, Gizli Kategori permission allows viewing all past periods.
  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const [selectedPeriodForDashboard, setSelectedPeriodForDashboard] = useState(currentPeriod || DEFAULT_PERIOD);

  const availablePeriodsForDashboard = useMemo(() => {
    const cp = currentPeriod || DEFAULT_PERIOD;
    let periods = [cp, getPreviousPeriod(cp)];
    if (canViewFullHistory) {
      let tempPeriod = periods[periods.length - 1];
      for (let i = 0; i < 10; i++) { // Show up to ~12 past periods
        tempPeriod = getPreviousPeriod(tempPeriod);
        periods.push(tempPeriod);
      }
    }
    return Array.from(new Set(periods)).sort((a, b) => b.localeCompare(a));
  }, [currentPeriod, canViewFullHistory]);

  useEffect(() => {
    if (!availablePeriodsForDashboard.includes(selectedPeriodForDashboard)) {
      setSelectedPeriodForDashboard(currentPeriod || DEFAULT_PERIOD);
    }
  }, [currentPeriod, availablePeriodsForDashboard, selectedPeriodForDashboard]);

  useEffect(() => {
    if (loadData && selectedBranch && selectedPeriodForDashboard) {
      fetchData<any[]>(`${API_BASE_URL}/rapor/giden-fatura?donem=${selectedPeriodForDashboard}&sube_id=${selectedBranch.Sube_ID}`)
        .then(data => {
          if (data) {
            setGidenFaturaData(data);
          }
        });
    }
  }, [loadData, selectedBranch, selectedPeriodForDashboard]);

  // Helper to get latest price (copied from StokSayimPage, can be centralized)
  const getLatestPriceForPeriod = useCallback((malzemeKodu: string, periodYYAA: string): number => {
    if (!periodYYAA || periodYYAA.length !== 4) return 0;
    const periodYear = 2000 + parseInt(periodYYAA.substring(0, 2));
    const periodMonth = parseInt(periodYYAA.substring(2, 4));
    const periodEndDate = new Date(periodYear, periodMonth, 0);

    const relevantPrices = stokFiyatList
      .filter(sf => sf.Malzeme_Kodu === malzemeKodu)
      .filter(sf => {
        try {
          const priceDate = new Date(parseDateString(sf.Gecerlilik_Baslangic_Tarih));
          return !isNaN(priceDate.getTime()) && priceDate <= periodEndDate;
        } catch { return false; }
      })
      .sort((a, b) => new Date(b.Gecerlilik_Baslangic_Tarih).getTime() - new Date(a.Gecerlilik_Baslangic_Tarih).getTime());
    return relevantPrices.length > 0 ? relevantPrices[0].Fiyat : 0;
  }, [stokFiyatList]);


  const getDetailedGiderItems = useCallback((kategoriId: number, targetPeriod: string) => {
    const detailedItems: { Alici_Unvani: string; Aciklama: string; Tutar: number; }[] = [];

    // eFaturaList
    eFaturaList
      .filter(ef => ef.Sube_ID === selectedBranch?.Sube_ID && ef.Kategori_ID === kategoriId && ef.Donem === parseInt(targetPeriod))
      .forEach(ef => detailedItems.push({
        Alici_Unvani: ef.Alici_Unvani,
        Aciklama: ef.Aciklama !== undefined && ef.Aciklama !== null ? ef.Aciklama : ef.Fatura_Numarasi,
        Tutar: ef.Tutar,
      }));

    // digerHarcamaList
    digerHarcamaList
      .filter(dh => dh.Sube_ID === selectedBranch?.Sube_ID && dh.Kategori_ID === kategoriId && dh.Donem === parseInt(targetPeriod))
      .forEach(dh => detailedItems.push({
        Alici_Unvani: dh.Alici_Adi,
        Aciklama: dh.Açıklama !== undefined && dh.Açıklama !== null ? dh.Açıklama : '',
        Tutar: dh.Tutar,
      }));

    // b2bEkstreList
    b2bEkstreList
      .filter(b2b => b2b.Sube_ID === selectedBranch?.Sube_ID && b2b.Kategori_ID === kategoriId && b2b.Donem === targetPeriod)
      .forEach(b2b => detailedItems.push({
        Alici_Unvani: b2b.Fis_No,
        Aciklama: b2b.Aciklama !== undefined && b2b.Aciklama !== null ? b2b.Aciklama : (b2b.Fis_Turu || b2b.Fatura_Metni),
        Tutar: b2b.Borc, // Assuming Borc is the expense for B2B
      }));

    return detailedItems;
  }, [selectedBranch, eFaturaList, digerHarcamaList, b2bEkstreList]);

  const dashboardColumns = useMemo(() => {
    if (!selectedBranch || !loadData) return null;

    const gelirlerData: DashboardRowData[] = [];
    const giderlerData: DashboardRowData[] = [];
    const ozetData: DashboardRowData[] = [];

    // Helper to get category total for a period, with fallback to previous periods
    const getCategoryTotalForPeriod = (
      kategoriId: number,
      targetPeriod: string,
      kategoriTip: KategoriTip,
      maxLookback = 6 // Look back up to 6 months
    ): { value: number; periodUsed: string; isFromPrevious: boolean } => {
      let currentLookupPeriod = targetPeriod;
      for (let i = 0; i <= maxLookback; i++) {
        let periodTotal = 0;
        if (kategoriTip === 'Gelir') {
          periodTotal = gelirList
            .filter(g => g.Sube_ID === selectedBranch.Sube_ID && g.Kategori_ID === kategoriId && calculatePeriod(parseDateString(g.Tarih)) === currentLookupPeriod)
            .reduce((sum, g) => sum + g.Tutar, 0);
        } else if (kategoriTip === 'Gider') {
          eFaturaList
            .filter(ef => ef.Sube_ID === selectedBranch.Sube_ID && ef.Kategori_ID === kategoriId && ef.Donem === parseInt(currentLookupPeriod))
            .forEach(ef => periodTotal += ef.Tutar);
          digerHarcamaList
            .filter(dh => dh.Sube_ID === selectedBranch.Sube_ID && dh.Kategori_ID === kategoriId && dh.Donem === parseInt(currentLookupPeriod))
            .forEach(dh => periodTotal += dh.Tutar);
          b2bEkstreList
            .filter(b2b => b2b.Sube_ID === selectedBranch.Sube_ID && b2b.Kategori_ID === kategoriId && b2b.Donem === currentLookupPeriod)
            .forEach(b2b => periodTotal += b2b.Borc); // Assuming Borc is expense for a Gider Kategori
        }

        if (periodTotal !== 0 || i === 0) { // Found data or it's the target period (even if zero)
          if (i > 0 && periodTotal !== 0) { // Data found from a previous period
            return { value: periodTotal, periodUsed: currentLookupPeriod, isFromPrevious: true };
          }
          if (i === 0) { // Target period data (can be zero)
            return { value: periodTotal, periodUsed: currentLookupPeriod, isFromPrevious: false };
          }
        }
        if (i < maxLookback) currentLookupPeriod = getPreviousPeriod(currentLookupPeriod);
      }
      return { value: 0, periodUsed: targetPeriod, isFromPrevious: false }; // Default if no data found in lookback
    };

    // 1. Gelirler & Giderler
    let grandTotalGelir = 0;
    let grandTotalGider = 0;

    (['Gelir', 'Gider'] as KategoriTip[]).forEach(tip => {
      const dataRows = tip === 'Gelir' ? gelirlerData : giderlerData;
      dataRows.push({ label: tip === 'Gelir' ? 'GELİRLER' : 'GİDERLER', value: 0, isTitle: true, bgColor: tip === 'Gelir' ? 'bg-green-100' : 'bg-red-100' });
      let tipTotal = 0;

      const relevantUstKategoriler = ustKategoriList.filter(uk => uk.Aktif_Pasif);

      relevantUstKategoriler.forEach(ustKategori => {
        const kategorilerInUst = kategoriList.filter(k =>
          k.Ust_Kategori_ID === ustKategori.UstKategori_ID &&
          k.Tip === tip &&
          k.Aktif_Pasif &&
          (canViewGizliKategoriler || !k.Gizli)
        );

        if (kategorilerInUst.length > 0) {
          const subRows: DashboardRowData[] = [];
          let ustKategoriTotal = 0;

          kategorilerInUst.forEach(kategori => {
            const { value, isFromPrevious } = getCategoryTotalForPeriod(kategori.Kategori_ID, selectedPeriodForDashboard, tip);
            subRows.push({
              label: kategori.Kategori_Adi + (kategori.Gizli ? " (Gizli)" : ""),
              value: value,
              isSubItem: true,
              isFromPreviousPeriod: isFromPrevious
            });
            ustKategoriTotal += value;

            if (tip === 'Gider' && kategori.Kategori_Adi === 'Plan Dışı Giderler') {
              const detailedGiderler = getDetailedGiderItems(kategori.Kategori_ID, selectedPeriodForDashboard);
              if (detailedGiderler.length > 0) {
                ozetData.push({ label: 'Plan Dışı Giderler Detayları', value: 0, isTitle: true, bgColor: 'bg-gray-100' });
                let planDisiToplam = 0;
                detailedGiderler.forEach(detail => {
                  ozetData.push({
                    label: `${detail.Alici_Unvani} - ${detail.Aciklama}`,
                    value: detail.Tutar,
                    isSubItem: true,
                    isSubSubItem: true,
                  });
                  planDisiToplam += detail.Tutar;
                });
                ozetData.push({ label: 'Plan Dışı Giderler Toplamı', value: planDisiToplam, isBold: true, isSubItem: false, bgColor: 'bg-gray-200' });
              }
            }
          });

          dataRows.push({ label: ustKategori.UstKategori_Adi, value: ustKategoriTotal, isBold: true, isSubItem: false, bgColor: tip === 'Gelir' ? 'bg-green-50' : 'bg-red-50' });
          dataRows.push(...subRows);

          tipTotal += ustKategoriTotal;
        }
      });
      dataRows.push({ label: `TOPLAM ${tip.toUpperCase()}`, value: tipTotal, isEmphasized: true });
      if (tip === 'Gelir') grandTotalGelir = tipTotal;
      if (tip === 'Gider') grandTotalGider = tipTotal;
    });

    // 2. Ozet data
    const totalRobotPos = gelirEkstraList
      .filter(ge => ge.Sube_ID === selectedBranch.Sube_ID && calculatePeriod(ge.Tarih) === selectedPeriodForDashboard)
      .reduce((sum, ge) => sum + ge.RobotPos_Tutar, 0);
    ozetData.push({ label: 'RobotPos Toplamı', value: totalRobotPos, isBold: true, bgColor: 'bg-blue-50', textColor: 'text-blue-700' });


    const calculateStokTotalForPeriod = (period: string) => {
      if (!period || period.length !== 4) return 0;
      return stokSayimList
        .filter(ss => ss.Sube_ID === selectedBranch.Sube_ID && ss.Donem === period)
        .reduce((sum, ss) => sum + (ss.Miktar * getLatestPriceForPeriod(ss.Malzeme_Kodu, period)), 0);
    };

    const currentPeriodStokTotal = calculateStokTotalForPeriod(selectedPeriodForDashboard);
    const previousPeriodStokTotal = calculateStokTotalForPeriod(getPreviousPeriod(selectedPeriodForDashboard));
    const stokSayimFarki = currentPeriodStokTotal - previousPeriodStokTotal;

    if (gidenFaturaData.length > 0) {
      ozetData.push({ label: 'GİDEN FATURA', value: 0, isTitle: true, bgColor: 'bg-orange-100' });
      let gidenFaturaToplam = 0;
      gidenFaturaData.forEach(fatura => {
        ozetData.push({
          label: `${fatura.Kategori_Adi} - ${fatura.Alici_Unvani}`,
          value: fatura.Tutar,
          isSubItem: true,
        });
        gidenFaturaToplam += fatura.Tutar;
      });
      ozetData.push({ label: 'Giden Fatura Toplamı', value: gidenFaturaToplam, isBold: true, bgColor: 'bg-orange-50' });
    }

    ozetData.push({ label: 'STOK DURUMU', value: 0, isTitle: true, bgColor: 'bg-yellow-100' });
    ozetData.push({ label: `Dönem (${selectedPeriodForDashboard}) Stok Değeri`, value: currentPeriodStokTotal });
    ozetData.push({ label: `Önceki Dönem (${getPreviousPeriod(selectedPeriodForDashboard)}) Stok Değeri`, value: previousPeriodStokTotal });
    ozetData.push({ label: 'Stok Değer Farkı', value: stokSayimFarki, isBold: true });

    const cirodanKalan = grandTotalGelir - grandTotalGider;
    const donemKarZarari = cirodanKalan + stokSayimFarki;

    if (hasPermission(FINANSAL_OZET_YETKI_ADI)) {
      ozetData.push({ label: 'FİNANSAL ÖZET', value: 0, isTitle: true, bgColor: 'bg-purple-100' });
      ozetData.push({ label: 'Cirodan Kalan (Gelir - Gider)', value: cirodanKalan, isBold: true });
      ozetData.push({ label: 'Dönem Kâr / Zararı (Cirodan Kalan + Stok Farkı)', value: donemKarZarari, isEmphasized: true });
    }

    const addPercentages = (data: DashboardRowData[]): DashboardRowData[] => {
      if (grandTotalGelir === 0) return data;
      return data.map(row => {
        if (row.isTitle || row.value === 0) {
          return row;
        }
        return {
          ...row,
          percentage: (row.value / grandTotalGelir) * 100
        };
      });
    };

    return {
      gelirler: addPercentages(gelirlerData),
      giderler: addPercentages(giderlerData),
      ozet: addPercentages(ozetData)
    };

  }, [
    selectedBranch, selectedPeriodForDashboard, gelirEkstraList, eFaturaList, b2bEkstreList,
    digerHarcamaList, gelirList, stokSayimList, stokFiyatList, stokList, kategoriList, ustKategoriList,
    gidenFaturaData,
    canViewGizliKategoriler, getLatestPriceForPeriod, getDetailedGiderItems, loadData
  ]);

  if (!hasPermission(DASHBOARD_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Dashboard" />;
  }

  const renderDashboardColumn = (data: DashboardRowData[], title: string) => (
    <div className="space-y-1">
      {data.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className={`py-2 px-3 rounded-md flex justify-between items-center
            ${row.isTitle ? `font-bold text-lg ${row.bgColor || 'bg-gray-200'} ${row.textColor || 'text-gray-800'} mt-4 mb-2` : ''}
            ${row.bgColor && !row.isTitle ? row.bgColor : ''}
            ${row.textColor && !row.isTitle ? row.textColor : 'text-gray-700'}
            ${row.isFromPreviousPeriod ? 'border-l-4 border-red-400 pl-1.5' : ''}
            ${!row.isTitle && !row.isSubItem && !row.isEmphasized ? 'text-base' : ''}
            ${row.isEmphasized ? 'text-lg font-bold' : ''}
          `}>
          <span className={`
            ${row.isSubItem ? 'ml-4' : ''}
            ${row.isSubSubItem ? 'ml-8 text-sm' : ''}
            ${row.isBold && !row.isEmphasized ? 'font-semibold' : ''}
          `}>
            {row.label} {row.isFromPreviousPeriod && <span className="text-red-500 text-xs italic">(Önceki Dönem Verisi)</span>}
          </span>
          {!row.isTitle && (
            <span className={`flex items-baseline ${row.isBold || row.isEmphasized ? 'font-semibold' : ''} ${row.isEmphasized ? 'text-base' : ''}`}>
              {formatTrCurrencyAdvanced(row.value, 2)}
              {row.percentage !== undefined && (
                <span className="ml-2 text-xs text-gray-500 font-normal italic">
                  ({row.percentage.toFixed(2)}%)
                </span>
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  const handleGeneratePdf = () => {
    // Use enhanced PDF generation for better results
    generateDashboardPdf('dashboard-content', `Dashboard_Raporu_${selectedBranch?.Sube_Adi}_${selectedPeriodForDashboard}.pdf`);
  };

  const handleExportToExcel = () => {
    if (!dashboardColumns) return;

    const wb = XLSX.utils.book_new();

    // Helper function to create formatted data with better structure
    const createFormattedData = (data: DashboardRowData[], sectionTitle: string) => {
      const formattedData: any[] = [];

      // Add section header
      formattedData.push({
        'Kategori': sectionTitle.toUpperCase(),
        'Kalem Adı': '',
        'Tutar (₺)': '',
        'Durum': ''
      });

      // Add an empty row for better spacing
      formattedData.push({
        'Kategori': '',
        'Kalem Adı': '',
        'Tutar (₺)': '',
        'Durum': ''
      });

      data.forEach(row => {
        let category = '';
        let itemName = row.label;
        let status = '';

        // Determine hierarchy and formatting
        if (row.isTitle) {
          category = 'BAŞLIK';
          status = 'Kategori Başlığı';
        } else if (row.isSubItem) {
          category = 'Alt Kalem';
          itemName = row.label; // Remove indentation for Excel
          status = row.isFromPreviousPeriod ? 'Önceki Dönem' : 'Mevcut Dönem';
        } else if (row.isSubSubItem) {
          category = 'Detay';
          itemName = row.label; // Remove indentation for Excel
          status = row.isFromPreviousPeriod ? 'Önceki Dönem' : 'Mevcut Dönem';
        } else {
          category = 'Ana Kalem';
          status = row.isFromPreviousPeriod ? 'Önceki Dönem' : 'Mevcut Dönem';
        }

        if (row.isFromPreviousPeriod) {
          itemName = `${itemName} (Önceki Dönem Verisi)`;
        }

        formattedData.push({
          'Kategori': category,
          'Kalem Adı': itemName,
          'Tutar (₺)': row.isTitle ? '' : typeof row.value === 'number' ? row.value : parseFloat(row.value) || 0,
          'Durum': status
        });
      });

      return formattedData;
    };

    // Create main summary sheet with all data
    const allData = [
      ...createFormattedData(dashboardColumns.gelirler, 'Gelirler'),
      // Add separator
      { 'Kategori': '', 'Kalem Adı': '', 'Tutar (₺)': '', 'Durum': '' },
      ...createFormattedData(dashboardColumns.giderler, 'Giderler'),
      // Add separator
      { 'Kategori': '', 'Kalem Adı': '', 'Tutar (₺)': '', 'Durum': '' },
      ...createFormattedData(dashboardColumns.ozet, 'Özet')
    ];

    const mainWs = XLSX.utils.json_to_sheet(allData);

    // Set column widths for better display
    mainWs['!cols'] = [
      { wch: 15 }, // Kategori
      { wch: 50 }, // Kalem Adı
      { wch: 20 }, // Tutar
      { wch: 20 }  // Durum
    ];

    // Ensure numeric values are exported as numbers, not text
    const mainRange = XLSX.utils.decode_range(mainWs['!ref'] || 'A1');
    for (let row = mainRange.s.r + 1; row <= mainRange.e.r; ++row) {
      // Tutar column is column C (index 2)
      const tutarCell = mainWs[XLSX.utils.encode_cell({ r: row, c: 2 })];
      if (tutarCell && tutarCell.v !== undefined && tutarCell.v !== '') {
        const numericValue = typeof tutarCell.v === 'number' ? tutarCell.v : parseFloat(tutarCell.v);
        if (!isNaN(numericValue)) {
          tutarCell.t = 'n'; // Set cell type to number
          tutarCell.v = numericValue;
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, mainWs, 'Tam Rapor');

    // Create separate sheets for each section
    const gelirlerWs = XLSX.utils.json_to_sheet(createFormattedData(dashboardColumns.gelirler, 'Gelirler'));
    gelirlerWs['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 20 }, { wch: 20 }];

    // Ensure numeric values are exported as numbers, not text
    const gelirlerRange = XLSX.utils.decode_range(gelirlerWs['!ref'] || 'A1');
    for (let row = gelirlerRange.s.r + 1; row <= gelirlerRange.e.r; ++row) {
      // Tutar column is column C (index 2)
      const tutarCell = gelirlerWs[XLSX.utils.encode_cell({ r: row, c: 2 })];
      if (tutarCell && tutarCell.v !== undefined && tutarCell.v !== '') {
        const numericValue = typeof tutarCell.v === 'number' ? tutarCell.v : parseFloat(tutarCell.v);
        if (!isNaN(numericValue)) {
          tutarCell.t = 'n'; // Set cell type to number
          tutarCell.v = numericValue;
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, gelirlerWs, 'Gelirler');

    const giderlerWs = XLSX.utils.json_to_sheet(createFormattedData(dashboardColumns.giderler, 'Giderler'));
    giderlerWs['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 20 }, { wch: 20 }];

    // Ensure numeric values are exported as numbers, not text
    const giderlerRange = XLSX.utils.decode_range(giderlerWs['!ref'] || 'A1');
    for (let row = giderlerRange.s.r + 1; row <= giderlerRange.e.r; ++row) {
      // Tutar column is column C (index 2)
      const tutarCell = giderlerWs[XLSX.utils.encode_cell({ r: row, c: 2 })];
      if (tutarCell && tutarCell.v !== undefined && tutarCell.v !== '') {
        const numericValue = typeof tutarCell.v === 'number' ? tutarCell.v : parseFloat(tutarCell.v);
        if (!isNaN(numericValue)) {
          tutarCell.t = 'n'; // Set cell type to number
          tutarCell.v = numericValue;
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, giderlerWs, 'Giderler');

    const ozetWs = XLSX.utils.json_to_sheet(createFormattedData(dashboardColumns.ozet, 'Özet'));
    ozetWs['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 20 }, { wch: 20 }];

    // Ensure numeric values are exported as numbers, not text
    const ozetRange = XLSX.utils.decode_range(ozetWs['!ref'] || 'A1');
    for (let row = ozetRange.s.r + 1; row <= ozetRange.e.r; ++row) {
      // Tutar column is column C (index 2)
      const tutarCell = ozetWs[XLSX.utils.encode_cell({ r: row, c: 2 })];
      if (tutarCell && tutarCell.v !== undefined && tutarCell.v !== '') {
        const numericValue = typeof tutarCell.v === 'number' ? tutarCell.v : parseFloat(tutarCell.v);
        if (!isNaN(numericValue)) {
          tutarCell.t = 'n'; // Set cell type to number
          tutarCell.v = numericValue;
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ozetWs, 'Özet');

    // Create a summary statistics sheet
    const summaryData = [];

    // Calculate totals
    const gelirTotal = dashboardColumns.gelirler
      .filter(row => !row.isTitle && !row.isSubItem && !row.isSubSubItem)
      .reduce((sum, row) => sum + row.value, 0);

    const giderTotal = dashboardColumns.giderler
      .filter(row => !row.isTitle && !row.isSubItem && !row.isSubSubItem)
      .reduce((sum, row) => sum + row.value, 0);

    summaryData.push(
      { 'Açıklama': 'Rapor Özeti', 'Değer': '' },
      { 'Açıklama': '', 'Değer': '' },
      { 'Açıklama': 'Şube', 'Değer': selectedBranch?.Sube_Adi || '' },
      { 'Açıklama': 'Dönem', 'Değer': selectedPeriodForDashboard },
      { 'Açıklama': 'Rapor Tarihi', 'Değer': new Date().toLocaleDateString('tr-TR') },
      { 'Açıklama': '', 'Değer': '' },
      { 'Açıklama': 'Toplam Gelir', 'Değer': typeof gelirTotal === 'number' ? gelirTotal : parseFloat(gelirTotal) || 0 },
      { 'Açıklama': 'Toplam Gider', 'Değer': typeof giderTotal === 'number' ? giderTotal : parseFloat(giderTotal) || 0 },
      { 'Açıklama': 'Net Fark (Gelir - Gider)', 'Değer': typeof (gelirTotal - giderTotal) === 'number' ? (gelirTotal - giderTotal) : parseFloat(gelirTotal - giderTotal) || 0 }
    );

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 30 }, { wch: 25 }];

    // Ensure numeric values are exported as numbers, not text
    const summaryRange = XLSX.utils.decode_range(summaryWs['!ref'] || 'A1');
    for (let row = summaryRange.s.r + 1; row <= summaryRange.e.r; ++row) {
      // Değer column is column B (index 1)
      const degerCell = summaryWs[XLSX.utils.encode_cell({ r: row, c: 1 })];
      if (degerCell && degerCell.v !== undefined && degerCell.v !== '') {
        const numericValue = typeof degerCell.v === 'number' ? degerCell.v : parseFloat(degerCell.v);
        if (!isNaN(numericValue)) {
          degerCell.t = 'n'; // Set cell type to number
          degerCell.v = numericValue;
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet İstatistik');

    XLSX.writeFile(wb, `Dashboard_Raporu_${selectedBranch?.Sube_Adi}_${selectedPeriodForDashboard}.xlsx`);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriodForDashboard(e.target.value);
    setLoadData(true);
  };

  return (
    <Card title={`Dashboard Raporu (Şube: ${selectedBranch.Sube_Adi})`} actions={
      <div className="flex items-center space-x-2 hide-on-pdf">
        {canPrint && (
          <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
            <Icons.Print className="w-5 h-5" />
          </Button>
        )}
        {canExportExcel && (
          <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
            <Icons.Download className="w-5 h-5" />
          </Button>
        )}
        <label htmlFor="dashboard-period-select" className="text-sm font-medium text-gray-700">Dönem:</label>
        <Select
          id="dashboard-period-select"
          value={selectedPeriodForDashboard}
          onChange={handlePeriodChange}
          className="text-sm py-1"
        >
          {availablePeriodsForDashboard.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>
    }>
      {dashboardColumns ? (
        <div id="dashboard-content" className="w-full">
          {/* For screen: use grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
            {renderDashboardColumn(dashboardColumns.gelirler, "Gelirler")}
            {renderDashboardColumn(dashboardColumns.giderler, "Giderler")}
            {renderDashboardColumn(dashboardColumns.ozet, "Özet")}
          </div>

          {/* For PDF: use stacked layout */}
          <div className="hidden print:block space-y-8">
            <div className="w-full">
              <h3 className="text-lg font-bold mb-4 text-green-800 border-b-2 border-green-200 pb-2">GELİRLER</h3>
              <div className="space-y-1">
                {dashboardColumns.gelirler.map((row, index) => (
                  <div
                    key={`gelir-${row.label}-${index}`}
                    className={`py-2 px-3 rounded-md flex justify-between items-center
                      ${row.isTitle ? `font-bold text-lg ${row.bgColor || 'bg-gray-200'} ${row.textColor || 'text-gray-800'} mt-4 mb-2` : ''}
                      ${row.bgColor && !row.isTitle ? row.bgColor : ''}
                      ${row.textColor && !row.isTitle ? row.textColor : 'text-gray-700'}
                      ${row.isFromPreviousPeriod ? 'border-l-4 border-red-400 pl-1.5' : ''}
                      ${!row.isTitle && !row.isSubItem && !row.isEmphasized ? 'text-base' : ''}
                      ${row.isEmphasized ? 'text-lg font-bold' : ''}
                    `}>
                    <span className={`
                      ${row.isSubItem ? 'ml-4' : ''}
                      ${row.isSubSubItem ? 'ml-8 text-sm' : ''}
                      ${row.isBold && !row.isEmphasized ? 'font-semibold' : ''}
                    `}>
                      {row.label} {row.isFromPreviousPeriod && <span className="text-red-500 text-xs italic">(Önceki Dönem Verisi)</span>}
                    </span>
                    {!row.isTitle && (
                      <span className={`
                        ${row.isBold || row.isEmphasized ? 'font-semibold' : ''}
                        ${row.isEmphasized ? 'text-base' : ''}
                      `}>
                        {formatTrCurrencyAdvanced(row.value, 2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-lg font-bold mb-4 text-red-800 border-b-2 border-red-200 pb-2">GİDERLER</h3>
              <div className="space-y-1">
                {dashboardColumns.giderler.map((row, index) => (
                  <div
                    key={`gider-${row.label}-${index}`}
                    className={`py-2 px-3 rounded-md flex justify-between items-center
                      ${row.isTitle ? `font-bold text-lg ${row.bgColor || 'bg-gray-200'} ${row.textColor || 'text-gray-800'} mt-4 mb-2` : ''}
                      ${row.bgColor && !row.isTitle ? row.bgColor : ''}
                      ${row.textColor && !row.isTitle ? row.textColor : 'text-gray-700'}
                      ${row.isFromPreviousPeriod ? 'border-l-4 border-red-400 pl-1.5' : ''}
                      ${!row.isTitle && !row.isSubItem && !row.isEmphasized ? 'text-base' : ''}
                      ${row.isEmphasized ? 'text-lg font-bold' : ''}
                    `}>
                    <span className={`
                      ${row.isSubItem ? 'ml-4' : ''}
                      ${row.isSubSubItem ? 'ml-8 text-sm' : ''}
                      ${row.isBold && !row.isEmphasized ? 'font-semibold' : ''}
                    `}>
                      {row.label} {row.isFromPreviousPeriod && <span className="text-red-500 text-xs italic">(Önceki Dönem Verisi)</span>}
                    </span>
                    {!row.isTitle && (
                      <span className={`
                        ${row.isBold || row.isEmphasized ? 'font-semibold' : ''}
                        ${row.isEmphasized ? 'text-base' : ''}
                      `}>
                        {formatTrCurrencyAdvanced(row.value, 2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">ÖZET</h3>
              <div className="space-y-1">
                {dashboardColumns.ozet.map((row, index) => (
                  <div
                    key={`ozet-${row.label}-${index}`}
                    className={`py-2 px-3 rounded-md flex justify-between items-center
                      ${row.isTitle ? `font-bold text-lg ${row.bgColor || 'bg-gray-200'} ${row.textColor || 'text-gray-800'} mt-4 mb-2` : ''}
                      ${row.bgColor && !row.isTitle ? row.bgColor : ''}
                      ${row.textColor && !row.isTitle ? row.textColor : 'text-gray-700'}
                      ${row.isFromPreviousPeriod ? 'border-l-4 border-red-400 pl-1.5' : ''}
                      ${!row.isTitle && !row.isSubItem && !row.isEmphasized ? 'text-base' : ''}
                      ${row.isEmphasized ? 'text-lg font-bold' : ''}
                    `}>
                    <span className={`
                      ${row.isSubItem ? 'ml-4' : ''}
                      ${row.isSubSubItem ? 'ml-8 text-sm' : ''}
                      ${row.isBold && !row.isEmphasized ? 'font-semibold' : ''}
                    `}>
                      {row.label} {row.isFromPreviousPeriod && <span className="text-red-500 text-xs italic">(Önceki Dönem Verisi)</span>}
                    </span>
                    {!row.isTitle && (
                      <span className={`
                        ${row.isBold || row.isEmphasized ? 'font-semibold' : ''}
                        ${row.isEmphasized ? 'text-base' : ''}
                      `}>
                        {formatTrCurrencyAdvanced(row.value, 2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-lg font-bold mb-4 text-blue-800 border-b-2 border-blue-200 pb-2">ÖZET</h3>
              <div className="space-y-1">
                {dashboardColumns.ozet.map((row, index) => (
                  <div
                    key={`ozet-${row.label}-${index}`}
                    className={`py-2 px-3 rounded-md flex justify-between items-center
                      ${row.isTitle ? `font-bold text-lg ${row.bgColor || 'bg-gray-200'} ${row.textColor || 'text-gray-800'} mt-4 mb-2` : ''}
                      ${row.bgColor && !row.isTitle ? row.bgColor : ''}
                      ${row.textColor && !row.isTitle ? row.textColor : 'text-gray-700'}
                      ${row.isFromPreviousPeriod ? 'border-l-4 border-red-400 pl-1.5' : ''}
                      ${!row.isTitle && !row.isSubItem && !row.isEmphasized ? 'text-base' : ''}
                      ${row.isEmphasized ? 'text-lg font-bold' : ''}
                    `}>
                    <span className={`
                      ${row.isSubItem ? 'ml-4' : ''}
                      ${row.isSubSubItem ? 'ml-8 text-sm' : ''}
                      ${row.isBold && !row.isEmphasized ? 'font-semibold' : ''}
                    `}>
                      {row.label} {row.isFromPreviousPeriod && <span className="text-red-500 text-xs italic">(Önceki Dönem Verisi)</span>}
                    </span>
                    {!row.isTitle && (
                      <span className={`
                        ${row.isBold || row.isEmphasized ? 'font-semibold' : ''}
                        ${row.isEmphasized ? 'text-base' : ''}
                      `}>
                        {formatTrCurrencyAdvanced(row.value, 2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Raporu görüntülemek için lütfen bir dönem seçin.</p>
        </div>
      )}
    </Card>
  );
};


// --- PLACEHOLDER PAGE ---
export const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Card title={title}>
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Icons.Dashboard className="w-16 h-16 mb-4" />
        <p className="text-xl">Bu sayfa yapım aşamasındadır.</p>
        <p>"{title}" için içerik yakında eklenecektir.</p>
      </div>
    </Card>
  );
};

// --- ŞUBE YÖNETİMİ PAGE ---
export const SubePage: React.FC = () => {
  const { subeList, addSube, updateSube } = useDataContext();
  const { hasPermission } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSube, setEditingSube] = useState<SubeFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasPermission(SUBE_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Şube Yönetimi" />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddSube = () => {
    setEditingSube(null);
    setIsModalOpen(true);
  };

  const handleEditSube = (sube: Sube) => {
    setEditingSube({ ...sube });
    setIsModalOpen(true);
  };

  const handleToggleActive = (subeId: number) => {
    const subeToUpdate = subeList.find(s => s.Sube_ID === subeId);
    if (subeToUpdate) {
      const result = updateSube(subeId, { ...subeToUpdate, Aktif_Pasif: !subeToUpdate.Aktif_Pasif });
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };

  const handleSubmit = async (data: SubeFormData) => {
    let result;
    if (editingSube && editingSube.Sube_ID) {
      result = await updateSube(editingSube.Sube_ID, data);
    } else {
      result = await addSube(data);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingSube(null);
    } else if (result && result.message) {
      alert(result.message);
    }
  };

  const filteredSubeler = useMemo(() => {
    return subeList.filter(sube =>
      sube.Sube_Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sube.Aciklama && sube.Aciklama.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subeList, searchTerm]);

  const handleGeneratePdf = () => {
    generateDashboardPdf('sube-yonetimi-content', `Sube_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredSubeler.map(sube => ({
        'ID': sube.Sube_ID,
        'Şube Adı': sube.Sube_Adi,
        'Açıklama': sube.Aciklama || '-',
        'Aktif': sube.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 50 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Şube Listesi');
    XLSX.writeFile(wb, `Sube_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="sube-yonetimi-content">
      <Card
        title="Şube Yönetimi"
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input
              placeholder="Şube ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Button onClick={handleAddSube} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Şube</Button>
          </div>
        }
      >
        <TableLayout headers={['ID', 'Şube Adı', 'Açıklama', 'Aktif', 'İşlemler']} compact={true}>
          {filteredSubeler.map((sube) => (
            <tr key={sube.Sube_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{sube.Sube_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{sube.Sube_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={sube.Aciklama}>{sube.Aciklama || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button onClick={() => handleToggleActive(sube.Sube_ID)} className="focus:outline-none">
                  <StatusBadge isActive={sube.Aktif_Pasif} />
                </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditSube(sube)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
              </td>
            </tr>
          ))}
        </TableLayout>
        {filteredSubeler.length === 0 && <p className="text-center py-4 text-gray-500">Arama kriterlerine uygun şube bulunamadı.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSube ? 'Şube Düzenle' : 'Yeni Şube Ekle'}>
        <SubeForm initialData={editingSube} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};


// --- USERS PAGE ---
export const UsersPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { userList, addUser, updateUser } = useDataContext();
  const [users, setUsers] = useState<Kullanici[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<KullaniciFormData | null>(null);

  useEffect(() => {
    setUsers(userList);
  }, [userList]);

  if (!hasPermission(KULLANICI_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Kullanıcı Yönetimi" />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: Kullanici) => {
    const formData: KullaniciFormData = { ...user, Password: '' }; // Clear password for edit form
    setEditingUser(formData);
    setIsModalOpen(true);
  };
  
  const handleToggleActive = (userId: number) => {
    const userToUpdate = users.find(u => u.Kullanici_ID === userId);
    if (userToUpdate) {
      updateUser(userId, { ...userToUpdate, Aktif_Pasif: !userToUpdate.Aktif_Pasif });
    }
  };

  const handleSubmit = async (data: KullaniciFormData) => {
    let result;
    if (editingUser && editingUser.Kullanici_ID) {
      // If password is empty, don't send it to the backend
      const dataToSend = data.Password ? data : { ...data, Password: undefined };
      result = await updateUser(editingUser.Kullanici_ID, dataToSend);
    } else {
      result = await addUser(data);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingUser(null);
    } else if (result && result.message) {
      alert(result.message);
    }
  };

  const handleGeneratePdf = () => {
    generateDashboardPdf('user-yonetimi-content', `Kullanici_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = users.map(user => ({
        'ID': user.Kullanici_ID,
        'Adı Soyadı': user.Adi_Soyadi,
        'Kullanıcı Adı': user.Kullanici_Adi,
        'Email': user.Email || '-',
        'Aktif': user.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 40 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcı Listesi');
    XLSX.writeFile(wb, `Kullanici_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="user-yonetimi-content">
      <Card 
        title="Kullanıcı Yönetimi"
        actions={
            <div className="flex items-center gap-3 hide-on-pdf">
                {canPrint && (
                    <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                        <Icons.Print className="w-5 h-5" />
                    </Button>
                )}
                {canExportExcel && (
                    <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <Button onClick={handleAddUser} leftIcon={<Icons.Add className="w-4 h-4" />} className="text-sm px-3">Yeni Kullanıcı</Button>
            </div>
        }
      >
        <TableLayout headers={['ID', 'Adı Soyadı', 'Kullanıcı Adı', 'Email', 'Aktif', 'İşlemler']} compact={true}>
          {users.map((user) => (
            <tr key={user.Kullanici_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.Kullanici_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.Adi_Soyadi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.Kullanici_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{user.Email || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                 <button onClick={() => handleToggleActive(user.Kullanici_ID)} className="focus:outline-none">
                    <StatusBadge isActive={user.Aktif_Pasif} />
                  </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle"/>
              </td>
            </tr>
          ))}
        </TableLayout>
        {users.length === 0 && <p className="text-center py-4 text-gray-500">Kayıtlı kullanıcı bulunmamaktadır.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}>
        <UserForm initialData={editingUser} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};


// --- ROLES PAGE ---
export const RolesPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { rolesList, addRole, updateRole, deleteRole } = useDataContext();
  const [roles, setRoles] = useState<Rol[]>([]);

  useEffect(() => {
    setRoles(rolesList);
  }, [rolesList]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RolFormData | null>(null);

  if (!hasPermission(ROL_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Rol Yönetimi" />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Rol) => {
    const formData: RolFormData = { ...role };
    setEditingRole(formData);
    setIsModalOpen(true);
  };
  
  const handleToggleActive = async (roleId: number) => {
    const roleToUpdate = roles.find(r => r.Rol_ID === roleId);
    if (roleToUpdate) {
      const result = await updateRole(roleId, { ...roleToUpdate, Aktif_Pasif: !roleToUpdate.Aktif_Pasif });
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };


  const handleSubmit = async (data: RolFormData) => {
    let result;
    if (editingRole && editingRole.Rol_ID) {
      result = await updateRole(editingRole.Rol_ID, data);
    } else {
      result = await addRole(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingRole(null);
    } else if (result.message) {
      alert(result.message);
    }
  };

  const handleGeneratePdf = () => {
    generateDashboardPdf('rol-yonetimi-content', `Rol_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = roles.map(role => ({
        'ID': role.Rol_ID,
        'Rol Adı': role.Rol_Adi,
        'Açıklama': role.Aciklama || '-',
        'Aktif': role.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 50 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Rol Listesi');
    XLSX.writeFile(wb, `Rol_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="rol-yonetimi-content">
      <Card 
        title="Rol Yönetimi"
        actions={
            <div className="flex items-center gap-3 hide-on-pdf">
                {canPrint && (
                    <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                        <Icons.Print className="w-5 h-5" />
                    </Button>
                )}
                {canExportExcel && (
                    <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <Button onClick={handleAddRole} leftIcon={<Icons.Add className="w-4 h-4" />} className="text-sm px-3">Yeni Rol</Button>
            </div>
        }
      >
        <TableLayout headers={['ID', 'Rol Adı', 'Açıklama', 'Aktif', 'İşlemler']} compact={true}>
          {roles.map((role) => (
            <tr key={role.Rol_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{role.Rol_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{role.Rol_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={role.Aciklama}>{role.Aciklama || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button onClick={() => handleToggleActive(role.Rol_ID)} className="focus:outline-none">
                  <StatusBadge isActive={role.Aktif_Pasif} />
                </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
              </td>
            </tr>
          ))}
        </TableLayout>
         {roles.length === 0 ? (
          <p className="text-center py-4 text-gray-500">Yükleniyor veya kayıtlı rol bulunmamaktadır...</p>
        ) : null}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? 'Rol Düzenle' : 'Yeni Rol Ekle'}>
        <RoleForm initialData={editingRole} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};


// --- PERMISSIONS PAGE ---
export const PermissionsPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { permissionsList, addPermission, updatePermission, deletePermission } = useDataContext();
  const [permissions, setPermissions] = useState<Yetki[]>([]);

  useEffect(() => {
    setPermissions(permissionsList);
  }, [permissionsList]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<YetkiFormData | null>(null);

  if (!hasPermission(YETKI_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Yetki Yönetimi" />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission: Yetki) => {
    const formData: YetkiFormData = { ...permission };
    setEditingPermission(formData);
    setIsModalOpen(true);
  };
  
  const handleToggleActive = async (permissionId: number) => {
    const permissionToUpdate = permissions.find(p => p.Yetki_ID === permissionId);
    if (permissionToUpdate) {
      const result = await updatePermission(permissionId, { ...permissionToUpdate, Aktif_Pasif: !permissionToUpdate.Aktif_Pasif });
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };

  const handleSubmit = async (data: YetkiFormData) => {
    let result;
    if (editingPermission && editingPermission.Yetki_ID) {
      result = await updatePermission(editingPermission.Yetki_ID, data);
    } else {
      result = await addPermission(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingPermission(null);
    } else if (result.message) {
      alert(result.message);
    }
  };

  const handleGeneratePdf = () => {
    generateDashboardPdf('yetki-yonetimi-content', `Yetki_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = permissions.map(permission => ({
        'ID': permission.Yetki_ID,
        'Yetki Adı': permission.Yetki_Adi,
        'Tip': permission.Tip || '-',
        'Açıklama': permission.Aciklama || '-',
        'Aktif': permission.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 50 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Yetki Listesi');
    XLSX.writeFile(wb, `Yetki_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="yetki-yonetimi-content">
      <Card 
        title="Yetki Yönetimi"
        actions={
            <div className="flex items-center gap-3 hide-on-pdf">
                {canPrint && (
                    <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                        <Icons.Print className="w-5 h-5" />
                    </Button>
                )}
                {canExportExcel && (
                    <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <Button onClick={handleAddPermission} leftIcon={<Icons.Add className="w-4 h-4" />} className="text-sm px-3">Yeni Yetki</Button>
            </div>
        }
      >
        <TableLayout headers={['ID', 'Yetki Adı', 'Tip', 'Açıklama', 'Aktif', 'İşlemler']} compact={true}>
          {permissions.map((permission) => (
            <tr key={permission.Yetki_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{permission.Yetki_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{permission.Yetki_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{permission.Tip || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={permission.Aciklama}>{permission.Aciklama || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button onClick={() => handleToggleActive(permission.Yetki_ID)} className="focus:outline-none">
                   <StatusBadge isActive={permission.Aktif_Pasif} />
                </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditPermission(permission)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
              </td>
            </tr>
          ))}
        </TableLayout>
        {permissions.length === 0 && <p className="text-center py-4 text-gray-500">Kayıtlı yetki bulunmamaktadır.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPermission ? 'Yetki Düzenle' : 'Yeni Yetki Ekle'}>
        <PermissionForm initialData={editingPermission} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};


// --- USER ROLE ASSIGNMENT PAGE ---
export const UserRoleAssignmentPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { userRolesList, updateUserRole, addUserRole, deleteUserRole } = useDataContext();
  const { userList: users } = useDataContext();
  const { rolesList: roles } = useDataContext();
  const { subeList } = useDataContext();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTermUsers, setSearchTermUsers] = useState('');
  const [searchTermAssignedRoles, setSearchTermAssignedRoles] = useState('');

  if (!hasPermission(KULLANICI_ROL_ATAMA_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Kullanıcı Rol Atama" />;
  }

  // Form state for new assignment
  const [formRoleId, setFormRoleId] = useState<number | ''>('');
  const [formBranchId, setFormBranchId] = useState<number | ''>('');
  const [formAssignmentStatus, setFormAssignmentStatus] = useState<boolean>(true);

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);
    setSearchTermAssignedRoles(''); // Reset assigned roles search
    // Reset new assignment form
    setFormRoleId('');
    setFormBranchId(activeBranchesForForm.length > 0 ? activeBranchesForForm[0].Sube_ID : '');
    setFormAssignmentStatus(true);
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => user.Aktif_Pasif)
      .filter(user => 
        user.Kullanici_Adi.toLowerCase().includes(searchTermUsers.toLowerCase()) ||
        (user.Adi_Soyadi && user.Adi_Soyadi.toLowerCase().includes(searchTermUsers.toLowerCase()))
      )
      .sort((a, b) => a.Kullanici_Adi.localeCompare(b.Kullanici_Adi));
  }, [users, searchTermUsers]);

  const selectedUserDetails = useMemo(() => {
    return selectedUserId ? users.find(u => u.Kullanici_ID === selectedUserId) : null;
  }, [selectedUserId, users]);

  const assignedUserRoles = useMemo(() => {
    if (!selectedUserId || !userRolesList || roles.length === 0 || subeList.length === 0) return [];
    
    const mappedUserRoles = userRolesList
      .filter(ur => ur.Kullanici_ID === selectedUserId)
      .map(ur => {
        const role = roles.find(r => r.Rol_ID === ur.Rol_ID);
        const sube = subeList.find(s => s.Sube_ID === ur.Sube_ID);
        console.log("Processing user role assignment:", ur, "Found role:", role, "Found sube:", sube); // Debugging line
        const rolAdi = role?.Rol_Adi || 'Bilinmeyen Rol';
        const subeAdi = sube?.Sube_Adi || 'Bilinmeyen Şube';
        return {
          ...ur,
          Rol_Adi: rolAdi,
          Sube_Adi: subeAdi,
        };
      });

    return mappedUserRoles
      .filter(ur => 
        String(ur.Rol_Adi).toLowerCase().includes(searchTermAssignedRoles.toLowerCase()) ||
        String(ur.Sube_Adi).toLowerCase().includes(searchTermAssignedRoles.toLowerCase())
      )
      .sort((a,b) => String(a.Rol_Adi + a.Sube_Adi).localeCompare(String(b.Rol_Adi + b.Sube_Adi)));
  }, [selectedUserId, userRolesList, roles, subeList, searchTermAssignedRoles]);
  
  const activeRolesForForm = useMemo(() => roles.filter(r => r.Aktif_Pasif), [roles]);
  const activeBranchesForForm = useMemo(() => subeList.filter(s => s.Aktif_Pasif), [subeList]);

  const handleAddAssignment = async () => {
    if (!selectedUserId || formRoleId === '' || formBranchId === '') {
      alert("Kullanıcı, Rol ve Şube seçimi zorunludur.");
      return;
    }

    const roleIdNum = Number(formRoleId);
    const branchIdNum = Number(formBranchId);

    const existingAssignment = userRolesList.find(
      ur => ur.Kullanici_ID === selectedUserId && ur.Rol_ID === roleIdNum && ur.Sube_ID === branchIdNum
    );

    if (existingAssignment) {
      alert("Bu kullanıcıya bu rol ve şube kombinasyonu zaten atanmış.");
      return;
    }
    
    const newAssignment: KullaniciRol = {
      Kullanici_ID: selectedUserId,
      Rol_ID: roleIdNum,
      Sube_ID: branchIdNum,
      Aktif_Pasif: formAssignmentStatus,
    };
    
    const result = await addUserRole(newAssignment);
    if (!result.success && result.message) {
      alert(result.message);
    }
    
    // Reset form
    setFormRoleId('');
    setFormBranchId(activeBranchesForForm.length > 0 ? activeBranchesForForm[0].Sube_ID : '');
    setFormAssignmentStatus(true);
  };

  const handleRemoveAssignment = async (roleId: number, subeId: number) => {
    if (!selectedUserId) return;

    if (selectedUserDetails?.Kullanici_Adi.toLowerCase() === 'admin') {
      const roleBeingRemoved = roles.find(r => r.Rol_ID === roleId);
      if (roleBeingRemoved?.Rol_Adi.toLowerCase() === 'admin') {
         alert("Admin kullanıcısının Admin rolü kaldırılamaz.");
         return;
      }
    }

    const result = await deleteUserRole(selectedUserId, roleId, subeId);
    if (!result.success && result.message) {
      alert(result.message);
    }
  };
  
  const handleToggleAssignmentStatus = async (roleId: number, subeId: number) => {
     if (!selectedUserId) return;

    if (selectedUserDetails?.Kullanici_Adi.toLowerCase() === 'admin') {
      const roleBeingToggled = roles.find(r => r.Rol_ID === roleId);
      if (roleBeingToggled?.Rol_Adi.toLowerCase() === 'admin') {
         alert("Admin kullanıcısının Admin rolünün durumu değiştirilemez.");
         return;
      }
    }

    const assignmentToUpdate = userRolesList.find(ur => ur.Kullanici_ID === selectedUserId && ur.Rol_ID === roleId && ur.Sube_ID === subeId);
    if (assignmentToUpdate) {
      const result = await updateUserRole(selectedUserId, roleId, subeId, { Aktif_Pasif: !assignmentToUpdate.Aktif_Pasif });
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };


  return (
    <Card title="Kullanıcı Rol Atama" className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Panel: Users */}
        <div className="w-1/3 flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="p-3 border-b">
            <Input
              placeholder="Kullanıcı Ara..."
              value={searchTermUsers}
              onChange={e => setSearchTermUsers(e.target.value)}
              className="text-sm"
            />
          </div>
          <ul className="flex-grow overflow-y-auto p-2 space-y-1">
            {filteredUsers.map(user => (
              <li key={user.Kullanici_ID}>
                <button
                  onClick={() => handleSelectUser(user.Kullanici_ID)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${selectedUserId === user.Kullanici_ID ? 'bg-blue-500 text-white font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {user.Kullanici_Adi} ({user.Adi_Soyadi})
                </button>
              </li>
            ))}
            {filteredUsers.length === 0 && <li className="px-3 py-2 text-sm text-gray-400 text-center">Kullanıcı bulunamadı.</li>}
          </ul>
        </div>

        {/* Right Panel: Role Assignments */}
        <div className="w-2/3 flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white">
          {selectedUserId === null ? (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              <p className="text-lg">Lütfen soldaki listeden bir kullanıcı seçin.</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Roller: <span className="text-blue-600">{selectedUserDetails?.Kullanici_Adi}</span>
                </h3>
              </div>
              <div className="flex-grow p-3 overflow-y-auto space-y-4">
                {/* Assigned Roles List */}
                <div className="border border-gray-200 rounded-md">
                    <div className="p-2.5 border-b bg-gray-50">
                        <h4 className="font-medium text-gray-700 text-sm">Atanmış Roller ({assignedUserRoles.length})</h4>
                        <Input
                        placeholder="Rol veya Şube Ara..."
                        value={searchTermAssignedRoles}
                        onChange={e => setSearchTermAssignedRoles(e.target.value)}
                        className="mt-1.5 text-xs py-1"
                        />
                    </div>
                    {assignedUserRoles.length > 0 ? (
                        <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                            {assignedUserRoles.map(ur => (
                            <li key={`${ur.Rol_ID}-${ur.Sube_ID}`} className="flex items-center justify-between p-2 hover:bg-gray-50 text-xs">
                                <div>
                                    <span className="font-semibold">{ur.Rol_Adi}</span>
                                    <span className="text-gray-500"> @ {ur.Sube_Adi}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => handleToggleAssignmentStatus(ur.Rol_ID, ur.Sube_ID)}
                                    title={ur.Aktif_Pasif ? "Pasif Yap" : "Aktif Yap"}
                                    className="focus:outline-none"
                                    disabled={selectedUserDetails?.Kullanici_Adi.toLowerCase() === 'admin' && ur.Rol_Adi.toLowerCase() === 'admin'}
                                >
                                    <StatusBadge isActive={ur.Aktif_Pasif} />
                                </button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveAssignment(ur.Rol_ID, ur.Sube_ID)}
                                    title="Atamayı Kaldır"
                                    className="p-1"
                                    disabled={selectedUserDetails?.Kullanici_Adi.toLowerCase() === 'admin' && ur.Rol_Adi.toLowerCase() === 'admin'}
                                >
                                    <Icons.Delete className="w-3.5 h-3.5 text-red-500" />
                                </Button>
                                </div>
                            </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-3 text-xs text-gray-400 text-center">Bu kullanıcıya atanmış rol bulunmamaktadır.</p>
                    )}
                </div>

                {/* Assign New Role Form */}
                <div className="pt-3 border-t">
                    <h4 className="font-medium text-gray-700 text-sm mb-2">Yeni Rol Ata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                        <Select 
                            label="Rol Seçin" 
                            value={formRoleId} 
                            onChange={e => setFormRoleId(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="text-sm"
                        >
                            <option value="">-- Rol --</option>
                            {activeRolesForForm.map(r => <option key={r.Rol_ID} value={r.Rol_ID}>{r.Rol_Adi}</option>)}
                        </Select>
                        <Select 
                            label="Şube Seçin" 
                            value={formBranchId} 
                            onChange={e => setFormBranchId(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="text-sm"
                        >
                            <option value="">-- Şube --</option>
                            {activeBranchesForForm.map(s => <option key={s.Sube_ID} value={s.Sube_ID}>{s.Sube_Adi}</option>)}
                        </Select>
                         <label className="flex items-center space-x-2 text-sm md:mt-6">
                            <input 
                                type="checkbox" 
                                checked={formAssignmentStatus} 
                                onChange={e => setFormAssignmentStatus(e.target.checked)} 
                                className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span className="text-gray-700">Aktif</span>
                        </label>
                        <Button onClick={handleAddAssignment} variant="primary" className="text-sm md:self-end">
                            <Icons.Add className="w-3.5 h-3.5 mr-1.5"/> Rol Ata
                        </Button>
                    </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};


// --- ROLE PERMISSION ASSIGNMENT PAGE ---
export const RolePermissionAssignmentPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { rolePermissionsList, addRolePermission, updateRolePermission, deleteRolePermission } = useDataContext();
  const { rolesList: roles } = useDataContext();
  const { permissionsList } = useDataContext();
  const [permissions, setPermissions] = useState<Yetki[]>([]);

  useEffect(() => {
    setPermissions(permissionsList);
  }, [permissionsList]);

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [searchTermRoles, setSearchTermRoles] = useState('');
  const [searchTermAvailable, setSearchTermAvailable] = useState('');
  const [searchTermAssigned, setSearchTermAssigned] = useState('');

  if (!hasPermission(ROL_YETKI_ATAMA_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Rol Yetki Atama" />;
  }

  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(roleId);
    // Reset search terms when role changes
    setSearchTermAvailable('');
    setSearchTermAssigned('');
  };

  const handleAddPermission = async (permissionId: number) => {
    if (!selectedRoleId) return;

    const selectedRole = roles.find(r => r.Rol_ID === selectedRoleId);
    if (selectedRole?.Rol_Adi.toLowerCase() === 'admin') {
        alert("Admin rolünün yetkileri değiştirilemez.");
        return;
    }

    const alreadyAssigned = rolePermissionsList.some(
      rp => rp.Rol_ID === selectedRoleId && rp.Yetki_ID === permissionId
    );

    if (!alreadyAssigned) {
      const newAssignment: RolYetki = {
        Rol_ID: selectedRoleId,
        Yetki_ID: permissionId,
        Aktif_Pasif: true, // Default to active when assigning
      };
      const result = await addRolePermission(newAssignment);
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    if (!selectedRoleId) return;
    const selectedRole = roles.find(r => r.Rol_ID === selectedRoleId);
    if (selectedRole?.Rol_Adi.toLowerCase() === 'admin') {
        alert("Admin rolünün yetkileri değiştirilemez.");
        return;
    }
    const result = await deleteRolePermission(selectedRoleId, permissionId);
    if (!result.success && result.message) {
      alert(result.message);
    }
  };
  
  const handleToggleAssignmentStatus = async (permissionId: number, currentStatus: boolean) => {
     if (!selectedRoleId) return;
     const selectedRole = roles.find(r => r.Rol_ID === selectedRoleId);
    if (selectedRole?.Rol_Adi.toLowerCase() === 'admin') {
        alert("Admin rolünün yetkileri değiştirilemez.");
        return;
    }
    const result = await updateRolePermission(selectedRoleId, permissionId, { Aktif_Pasif: !currentStatus });
    if (!result.success && result.message) {
      alert(result.message);
    }
  };

  const filteredRoles = useMemo(() => {
    return roles
      .filter(role => role.Aktif_Pasif) // Only show active roles for assignment
      .filter(role => role.Rol_Adi.toLowerCase().includes(searchTermRoles.toLowerCase()))
      .sort((a, b) => a.Rol_Adi.localeCompare(b.Rol_Adi));
  }, [roles, searchTermRoles]);

  const assignedPermissions = useMemo(() => {
    if (!selectedRoleId) return [];
    const selectedRole = roles.find(r => r.Rol_ID === selectedRoleId);
    if (selectedRole?.Rol_Adi.toLowerCase() === 'admin') { // Admin role always has all permissions
        return permissions
            .filter(p => p.Aktif_Pasif && p.Yetki_Adi.toLowerCase().includes(searchTermAssigned.toLowerCase()))
            .map(p => ({...p, Aktif_Pasif_Atama: true, Rol_ID: selectedRoleId})) // Add Aktif_Pasif_Atama for display
            .sort((a,b) => a.Yetki_Adi.localeCompare(b.Yetki_Adi));
    }

    return rolePermissionsList
      .filter(rp => rp.Rol_ID === selectedRoleId)
      .map(rp => {
        const permissionDetails = permissions.find(p => p.Yetki_ID === rp.Yetki_ID);
        return permissionDetails ? { ...permissionDetails, Aktif_Pasif_Atama: rp.Aktif_Pasif, Rol_ID: rp.Rol_ID } : null;
      })
      .filter(p => p !== null && p.Aktif_Pasif) // Only show active permissions
      .filter(p => p!.Yetki_Adi.toLowerCase().includes(searchTermAssigned.toLowerCase()))
      .sort((a,b) => a!.Yetki_Adi.localeCompare(b!.Yetki_Adi)) as (Yetki & {Aktif_Pasif_Atama: boolean, Rol_ID: number})[];
  }, [selectedRoleId, rolePermissionsList, permissions, searchTermAssigned, roles]);

  const availablePermissions = useMemo(() => {
    if (!selectedRoleId) return [];
    const selectedRole = roles.find(r => r.Rol_ID === selectedRoleId);
    if (selectedRole?.Rol_Adi.toLowerCase() === 'admin') return []; // Admin has all, none available


    const assignedPermissionIds = new Set(assignedPermissions.map(p => p.Yetki_ID));
    return permissions
      .filter(p => p.Aktif_Pasif && !assignedPermissionIds.has(p.Yetki_ID))
      .filter(p => p.Yetki_Adi.toLowerCase().includes(searchTermAvailable.toLowerCase()))
      .sort((a,b) => a.Yetki_Adi.localeCompare(b.Yetki_Adi));
  }, [selectedRoleId, assignedPermissions, permissions, searchTermAvailable, roles]);
  
  const selectedRoleName = useMemo(() => {
      return selectedRoleId ? roles.find(r => r.Rol_ID === selectedRoleId)?.Rol_Adi : null;
  }, [selectedRoleId, roles]);

  return (
    <Card title="Rol Yetki Atama" className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Panel: Roles */}
        <div className="w-1/3 flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="p-3 border-b">
            <Input
              placeholder="Rol Ara..."
              value={searchTermRoles}
              onChange={e => setSearchTermRoles(e.target.value)}
              className="text-sm"
            />
          </div>
          <ul className="flex-grow overflow-y-auto p-2 space-y-1">
            {filteredRoles.map(role => (
              <li key={role.Rol_ID}>
                <button
                  onClick={() => handleSelectRole(role.Rol_ID)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${selectedRoleId === role.Rol_ID ? 'bg-blue-500 text-white font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {role.Rol_Adi}
                </button>
              </li>
            ))}
            {filteredRoles.length === 0 && <li className="px-3 py-2 text-sm text-gray-400 text-center">Rol bulunamadı.</li>}
          </ul>
        </div>

        {/* Right Panel: Permissions */}
        <div className="w-2/3 flex flex-col border border-gray-200 rounded-lg shadow-sm bg-white">
          {selectedRoleId === null ? (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              <p className="text-lg">Lütfen soldaki listeden bir rol seçin.</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b bg-gray-50 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">
                  Yetkiler: <span className="text-blue-600">{selectedRoleName}</span>
                </h3>
                 {selectedRoleName?.toLowerCase() === 'admin' && (
                    <p className="text-xs text-orange-600 mt-1">Admin rolünün yetkileri sabittir ve değiştirilemez.</p>
                )}
              </div>
              <div className="flex-grow flex gap-3 p-3 overflow-hidden">
                {/* Available Permissions */}
                <div className="w-1/2 flex flex-col border border-gray-200 rounded-md">
                  <div className="p-2.5 border-b bg-gray-50 flex-shrink-0">
                    <h4 className="font-medium text-gray-700 text-sm">Kullanılabilir Yetkiler ({availablePermissions.length})</h4>
                    <Input
                      placeholder="Yetki Ara..."
                      value={searchTermAvailable}
                      onChange={e => setSearchTermAvailable(e.target.value)}
                      className="mt-1.5 text-xs py-1"
                      disabled={selectedRoleName?.toLowerCase() === 'admin'}
                    />
                  </div>
                  <ul className="flex-grow overflow-y-auto p-1.5 space-y-0.5">
                    {availablePermissions.map(permission => (
                      <li key={permission.Yetki_ID} className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 text-xs text-gray-600">
                        <span>{permission.Yetki_Adi} <span className="text-gray-400">({permission.Tip})</span></span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddPermission(permission.Yetki_ID)}
                          title="Role Ekle"
                          className="p-1"
                           disabled={selectedRoleName?.toLowerCase() === 'admin'}
                        >
                          <Icons.Add className="w-3.5 h-3.5 text-green-500" />
                        </Button>
                      </li>
                    ))}
                    {availablePermissions.length === 0 && selectedRoleName?.toLowerCase() !== 'admin' && <li className="p-1.5 text-xs text-gray-400 text-center">Tüm yetkiler atanmış veya arama sonucu boş.</li>}
                  </ul>
                </div>

                {/* Assigned Permissions */}
                <div className="w-1/2 flex flex-col border border-gray-200 rounded-md">
                  <div className="p-2.5 border-b bg-gray-50 flex-shrink-0">
                    <h4 className="font-medium text-gray-700 text-sm">Atanmış Yetkiler ({assignedPermissions.length})</h4>
                    <Input
                      placeholder="Yetki Ara..."
                      value={searchTermAssigned}
                      onChange={e => setSearchTermAssigned(e.target.value)}
                      className="mt-1.5 text-xs py-1"
                    />
                  </div>
                  <ul className="flex-grow overflow-y-auto p-1.5 space-y-0.5">
                    {assignedPermissions.map(permission => (
                      <li key={permission.Yetki_ID} className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 text-xs text-gray-600">
                        <div className="flex items-center">
                           <button 
                             onClick={() => handleToggleAssignmentStatus(permission.Yetki_ID, permission.Aktif_Pasif_Atama)}
                             title={permission.Aktif_Pasif_Atama ? "Pasif Yap" : "Aktif Yap"}
                             className="mr-2 focus:outline-none"
                             disabled={selectedRoleName?.toLowerCase() === 'admin'}
                           >
                             <StatusBadge isActive={permission.Aktif_Pasif_Atama} />
                           </button>
                           {permission.Yetki_Adi} <span className="text-gray-400 ml-1">({permission.Tip})</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePermission(permission.Yetki_ID)}
                          title="Rolden Kaldır"
                          className="p-1"
                          disabled={selectedRoleName?.toLowerCase() === 'admin'}
                        >
                          <Icons.Delete className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </li>
                    ))}
                     {assignedPermissions.length === 0 && <li className="p-1.5 text-xs text-gray-400 text-center">Bu role atanmış yetki yok.</li>}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};


// --- DEGERLER (VALUES) PAGE ---
export const DegerlerPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { degerList, fetchDegerler, addDeger, updateDeger } = useDataContext();
  const [degerler, setDegerler] = useState<Deger[]>([]);

  useEffect(() => {
    fetchDegerler();
  }, [fetchDegerler]);

  useEffect(() => {
    setDegerler(degerList);
  }, [degerList]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeger, setEditingDeger] = useState<DegerFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasPermission(DEGER_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Değer Yönetimi" />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddDeger = () => {
    setEditingDeger(null);
    setIsModalOpen(true);
  };

  const handleEditDeger = (deger: Deger) => {
    setEditingDeger({ ...deger });
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (data: DegerFormData) => {
    let result;
    if (editingDeger && editingDeger.Deger_ID) {
      result = await updateDeger(editingDeger.Deger_ID, data);
    } else {
      result = await addDeger(data);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingDeger(null);
    } else if (result && result.message) {
      alert(result.message);
    }
  };

  const filteredDegerler = useMemo(() => {
    return degerler.filter(d =>
      d.Deger_Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.Deger_Aciklama && d.Deger_Aciklama.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [degerler, searchTerm]);

  const handleGeneratePdf = () => {
    generateDashboardPdf('deger-yonetimi-content', `Deger_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredDegerler.map(deger => ({
        'ID': deger.Deger_ID,
        'Değer Adı': deger.Deger_Adi,
        'Başlangıç Tarihi': parseDateString(deger.Gecerli_Baslangic_Tarih),
        'Bitiş Tarihi': parseDateString(deger.Gecerli_Bitis_Tarih),
        'Değer': deger.Deger,
        'Açıklama': deger.Deger_Aciklama || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Değer Listesi');
    XLSX.writeFile(wb, `Deger_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="deger-yonetimi-content">
      <Card 
        title="Değer Yönetimi"
        actions={
            <div className="flex items-center gap-3 hide-on-pdf">
                {canPrint && (
                    <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                        <Icons.Print className="w-5 h-5" />
                    </Button>
                )}
                {canExportExcel && (
                    <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <Input 
                    placeholder="Değer ara..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow min-w-[200px] text-sm py-2"
                />
                <Button onClick={handleAddDeger} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Değer</Button>
            </div>
        }
      >
        <TableLayout headers={['ID', 'Değer Adı', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Değer', 'Açıklama', 'İşlemler']} compact={true}>
          {filteredDegerler.map((deger) => (
            <tr key={deger.Deger_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{deger.Deger_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{deger.Deger_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{parseDateString(deger.Gecerli_Baslangic_Tarih)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{parseDateString(deger.Gecerli_Bitis_Tarih)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{deger.Deger.toFixed(2)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={deger.Deger_Aciklama}>{deger.Deger_Aciklama || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditDeger(deger)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
              </td>
            </tr>
          ))}
        </TableLayout>
         {filteredDegerler.length === 0 && <p className="text-center py-4 text-gray-500">Arama kriterlerine uygun değer bulunamadı.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDeger ? 'Değer Düzenle' : 'Yeni Değer Ekle'}>
        <DegerForm initialData={editingDeger} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};


// --- UST KATEGORI PAGE ---
export const UstKategorilerPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { ustKategoriList, addUstKategori, updateUstKategori } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUstKategori, setEditingUstKategori] = useState<UstKategoriFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleGeneratePdf = () => {
    generateDashboardPdf('ust-kategori-content', `Ust_Kategori_Yonetimi.pdf`);
  };

  const handleExportToExcelForUstKategori = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredUstKategoriler.map(uk => ({
        'ID': uk.UstKategori_ID,
        'Üst Kategori Adı': uk.UstKategori_Adi,
        'Aktif': uk.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Üst Kategori Listesi');
    XLSX.writeFile(wb, `Ust_Kategori_Yonetimi.xlsx`);
  };

  if (!hasPermission(UST_KATEGORI_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Üst Kategori Yönetimi" />;
  }

  const handleAddUstKategori = () => {
    setEditingUstKategori(null);
    setIsModalOpen(true);
  };

  const handleEditUstKategori = (ustKategori: UstKategori) => {
    setEditingUstKategori({ ...ustKategori });
    setIsModalOpen(true);
  };

  const handleToggleActive = (ustKategori: UstKategori) => {
    updateUstKategori(ustKategori.UstKategori_ID, { ...ustKategori, Aktif_Pasif: !ustKategori.Aktif_Pasif });
  };

  const handleSubmit = (data: UstKategoriFormData) => {
    if (editingUstKategori && editingUstKategori.UstKategori_ID) {
      updateUstKategori(editingUstKategori.UstKategori_ID, data);
    } else {
      addUstKategori(data);
    }
    setIsModalOpen(false);
    setEditingUstKategori(null);
  };

  const filteredUstKategoriler = useMemo(() => {
    return ustKategoriList.filter(uk =>
      uk.UstKategori_Adi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ustKategoriList, searchTerm]);

  return (
    <div className="space-y-6" id="ust-kategori-content">
      <Card
        title="Üst Kategori Yönetimi"
        actions={
            <div className="flex items-center gap-3 hide-on-pdf">
                {canPrint && (
                    <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                        <Icons.Print className="w-5 h-5" />
                    </Button>
                )}
                {canExportExcel && (
                    <Button onClick={handleExportToExcelForUstKategori} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <Input 
                    placeholder="Üst Kategori ara..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow min-w-[200px] text-sm py-2"
                />
                <Button onClick={handleAddUstKategori} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Üst Kategori</Button>
            </div>
        }
      >
        <TableLayout headers={['ID', 'Üst Kategori Adı', 'Aktif', 'İşlemler']} compact={true}>
          {filteredUstKategoriler.map((ustKategori) => (
            <tr key={ustKategori.UstKategori_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{ustKategori.UstKategori_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ustKategori.UstKategori_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                 <button onClick={() => handleToggleActive(ustKategori)} className="focus:outline-none">
                    <StatusBadge isActive={ustKategori.Aktif_Pasif} />
                </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditUstKategori(ustKategori)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
              </td>
            </tr>
          ))}
        </TableLayout>
         {filteredUstKategoriler.length === 0 && <p className="text-center py-4 text-gray-500">Arama kriterlerine uygun üst kategori bulunamadı.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUstKategori ? 'Üst Kategori Düzenle' : 'Yeni Üst Kategori Ekle'}>
        <UstKategoriForm initialData={editingUstKategori} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

// --- KATEGORI PAGE ---
export const KategorilerPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { kategoriList, addKategori, updateKategori, ustKategoriList } = useDataContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<KategoriFormData | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUstKategoriFilter, setSelectedUstKategoriFilter] = useState<string>('');
  const [selectedTipFilter, setSelectedTipFilter] = useState<string>('');
  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleGeneratePdf = () => {
    generateDashboardPdf('kategori-content', `Kategori_Yonetimi.pdf`);
  };

  const handleExportToExcelForKategori = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredKategoriler.map(k => ({
        'ID': k.Kategori_ID,
        'Kategori Adı': k.Kategori_Adi,
        'Üst Kategori': ustKategoriList.find(uk => uk.UstKategori_ID === k.Ust_Kategori_ID)?.UstKategori_Adi || 'N/A',
        'Tip': k.Tip,
        'Aktif': k.Aktif_Pasif ? 'Evet' : 'Hayır',
        'Gizli': k.Gizli ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Kategori Listesi');
    XLSX.writeFile(wb, `Kategori_Yonetimi.xlsx`);
  };

  if (!hasPermission(KATEGORI_YONETIMI_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Kategori Yönetimi" />;
  }

  const handleAddKategori = () => {
    setEditingKategori(null);
    setIsModalOpen(true);
  };

  const handleEditKategori = (kategori: Kategori) => {
    setEditingKategori({ ...kategori });
    setIsModalOpen(true);
  };
  
  const handleToggleAktif = (kategori: Kategori) => {
    updateKategori(kategori.Kategori_ID, { ...kategori, Aktif_Pasif: !kategori.Aktif_Pasif });
  };
  
  const handleToggleGizli = (kategori: Kategori) => {
    updateKategori(kategori.Kategori_ID, { ...kategori, Gizli: !kategori.Gizli });
  };

  const handleSubmit = (data: KategoriFormData) => {
    if (editingKategori && editingKategori.Kategori_ID) {
      updateKategori(editingKategori.Kategori_ID, data);
    } else {
      addKategori(data);
    }
    setIsModalOpen(false);
    setEditingKategori(null);
  };

  const filteredKategoriler = useMemo(() => {
    return kategoriList.filter(k => {
      const ustKategori = ustKategoriList.find(uk => uk.UstKategori_ID === k.Ust_Kategori_ID);
      const matchesSearch = k.Kategori_Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (ustKategori && ustKategori.UstKategori_Adi.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesUstKategori = selectedUstKategoriFilter ? k.Ust_Kategori_ID === parseInt(selectedUstKategoriFilter) : true;
      const matchesTip = selectedTipFilter ? k.Tip === selectedTipFilter : true;
      return matchesSearch && matchesUstKategori && matchesTip;
    });
  }, [kategoriList, ustKategoriList, searchTerm, selectedUstKategoriFilter, selectedTipFilter]);

  const activeUstKategorilerForFilter = useMemo(() => ustKategoriList.filter(uk => uk.Aktif_Pasif), [ustKategoriList]);

  return (
    <div className="space-y-6" id="kategori-content">
      <Card
        title="Kategori Yönetimi"
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcelForKategori} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input 
              placeholder="Kategori ara..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-auto min-w-[200px] max-w-xs text-sm py-2"
            />
            <Select 
              value={selectedUstKategoriFilter} 
              onChange={e => setSelectedUstKategoriFilter(e.target.value)}
              className="flex-auto min-w-[200px] max-w-xs text-sm py-2"
              wrapperClassName="flex-auto min-w-[200px] max-w-xs"
            >
              <option value="">Tüm Üst Kategoriler</option>
              {activeUstKategorilerForFilter.map(uk => <option key={uk.UstKategori_ID} value={uk.UstKategori_ID}>{uk.UstKategori_Adi}</option>)}
            </Select>
            <Select 
              value={selectedTipFilter} 
              onChange={e => setSelectedTipFilter(e.target.value)}
              className="flex-auto min-w-[150px] max-w-xs text-sm py-2"
              wrapperClassName="flex-auto min-w-[150px] max-w-xs"
            >
              <option value="">Tüm Tipler</option>
              <option value="Gelir">Gelir</option>
              <option value="Gider">Gider</option>
              <option value="Bilgi">Bilgi</option>
              <option value="Ödeme">Ödeme</option>
              <option value="Giden Fatura">Giden Fatura</option>
            </Select>
            <Button onClick={handleAddKategori} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">
              Yeni Kategori
            </Button>
          </div>
        }
      >
        <TableLayout headers={['ID', 'Kategori Adı', 'Üst Kategori', 'Tip', 'Aktif', 'Gizli', 'İşlemler']} compact={true}>
          {filteredKategoriler.map((kategori) => {
            const ustKategoriAdi = ustKategoriList.find(uk => uk.UstKategori_ID === kategori.Ust_Kategori_ID)?.UstKategori_Adi || 'N/A';
            return (
            <tr key={kategori.Kategori_ID}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{kategori.Kategori_ID}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{kategori.Kategori_Adi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{ustKategoriAdi}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{kategori.Tip}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button onClick={() => handleToggleAktif(kategori)} className="focus:outline-none">
                  <StatusBadge isActive={kategori.Aktif_Pasif} />
                </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <button onClick={() => handleToggleGizli(kategori)} className="focus:outline-none">
                  {kategori.Gizli ? <Icons.EyeSlash className="w-4 h-4 text-orange-500" /> : <Icons.Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditKategori(kategori)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
              </td>
            </tr>
          )})}
        </TableLayout>
         {filteredKategoriler.length === 0 && <p className="text-center py-4 text-gray-500">Arama kriterlerine uygun kategori bulunamadı.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingKategori ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}>
        <KategoriForm initialData={editingKategori} ustKategoriler={ustKategoriList} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};


// --- E-FATURA YUKLEME PAGE ---
export const InvoiceUploadPage: React.FC = () => {
  const { selectedBranch, hasPermission, currentPeriod } = useAppContext();
  const { addEFaturas, eFaturaReferansList } = useDataContext();
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!hasPermission(FATURA_YUKLEME_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Fatura Yükleme" />;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setFeedback(null);
      } else {
        setFeedback({ message: "Lütfen geçerli bir Excel dosyası (.xlsx veya .xls) seçin.", type: 'error' });
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setFeedback({ message: "Lütfen bir dosya seçin.", type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setFeedback(null);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      console.log("Raw JSON data from Excel:", jsonData);

      if (jsonData.length === 0) {
        setFeedback({ message: "Excel dosyası boş veya okunamadı.", type: 'error' });
        return;
      }

      const requiredColumns = ["Fatura Tarihi", "Fatura Numarası", "Tutar"];
      // Special handling for "Alıcı Ünvanı" or "Alıcı Adı"
      const hasAliciUnvani = Object.keys(jsonData[0]).some(key => key.includes("Alıcı Ünvanı"));
      const hasAliciAdi = Object.keys(jsonData[0]).some(key => key.includes("Alıcı Adı"));
      const missingColumns = requiredColumns.filter(col => 
        !Object.keys(jsonData[0]).some(key => key.includes(col))
      );

      // Add "Alıcı Ünvanı veya Alıcı Adı" to missing columns if neither is found
      if (!hasAliciUnvani && !hasAliciAdi) {
        missingColumns.push("Alıcı Ünvanı veya Alıcı Adı");
      }

      if (missingColumns.length > 0) {
        setFeedback({ 
          message: `Gerekli sütunlar eksik: ${missingColumns.join(', ')}. Lütfen şablonu kullanın.`, 
          type: 'error' 
        });
        return;
      }

      const newInvoices: EFatura[] = jsonData
        .map((row, index) => {
          try {
            // Find the actual column names (they might have extra characters)
            const dateKey = Object.keys(row).find(key => key.includes("Fatura Tarihi")) || "Fatura Tarihi";
            const numberKey = Object.keys(row).find(key => key.includes("Fatura Numarası")) || "Fatura Numarası";
            // Look for either "Alıcı Ünvanı" or "Alıcı Adı"
            const aliciUnvaniKey = Object.keys(row).find(key => key.includes("Alıcı Ünvanı") || key.includes("Alıcı Adı")) || "Alıcı Ünvanı";
            const tutarKey = Object.keys(row).find(key => key.includes("Tutar")) || "Tutar";

            const dateStr = parseDateString(row[dateKey]);
            if (!dateStr) {
              throw new Error(`Geçersiz tarih formatı: ${row[dateKey]}`);
            }

            const period = calculatePeriod(dateStr); // Calculate period from invoice date

            const faturaNumarasi = String(row[numberKey] || "").trim();
            if (!faturaNumarasi) {
              throw new Error("Fatura numarası boş olamaz");
            }

            const aliciUnvani = String(row[aliciUnvaniKey] || "").trim();
            if (!aliciUnvani) {
              throw new Error("Alıcı ünvanı boş olamaz");
            }

            // Try to find a matching referans by Alici_Unvani
            const matchingReferans = eFaturaReferansList.find(
              ref => ref.Alici_Unvani.toLowerCase() === aliciUnvani.toLowerCase()
            );

            const durumKey = Object.keys(row).find(key => key.includes("Durum")) || "Durum";
            const durum = String(row[durumKey] || "").trim();
            const isGidenFatura = durum === "Gönderildi" || durum === "Alıcı Kabul Etti (Otomatik)";

            return {
              Sube_ID: selectedBranch?.Sube_ID || 0,
              Fatura_Numarasi: faturaNumarasi,
              Alici_Unvani: aliciUnvani,
              Fatura_Tarihi: dateStr,
              Tutar: parseCurrencyValue(row[tutarKey]),
              Donem: period,
              Ozel: false,
              Gunluk_Harcama: false,
              Giden_Fatura: isGidenFatura,
              Kategori_ID: isGidenFatura ? null : (matchingReferans ? matchingReferans.Kategori_ID : null),
            };
          } catch (e: any) {
            console.error(`Satır ${index + 2} işlenirken hata:`, row, e);
            throw new Error(`Satır ${index + 2}: ${e.message}`);
          }
        });

      if (newInvoices.length === 0) {
        setFeedback({ message: "İşlenecek fatura bulunamadı. Lütfen dosya içeriğini kontrol edin.", type: 'error' });
        return;
      }

      const result = await addEFaturas(newInvoices);

      let feedbackMessage = `${result.successfullyAdded} fatura başarıyla eklendi.`;
      if (result.skippedRecords > 0) {
        feedbackMessage += ` ${result.skippedRecords} fatura zaten mevcut olduğu veya fatura numarası boş olduğu için atlandı.`;
      }
      if (result.errorRecords > 0) {
        feedbackMessage += ` ${result.errorRecords} faturada hata oluştu.`;
      }

      setFeedback({ 
        message: feedbackMessage, 
        type: result.errorRecords > 0 || result.skippedRecords > 0 ? 'warning' : 'success' 
      });
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";

    } catch (error: any) {
      console.error("e-Fatura dosyası işlenirken hata:", error);
      setFeedback({ 
        message: `Dosya işlenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // In a real app, this would trigger a download of an Excel template file.
    // For this mockup, we'll just log it.
    alert("Excel şablonu indirme işlemi simüle edildi. Konsolu kontrol edin.");
    console.log("Excel Şablon İndirme İsteği:", MOCK_E_FATURA_EXCEL_SAMPLE[0]); // Show headers basically
  };

  return (
    <Card title={`e-Fatura Yükleme (Şube: ${selectedBranch?.Sube_Adi || 'Seçilmedi'})`}>
      <div className="space-y-6">
        <div>
          <label htmlFor="invoice-file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Excel Dosyası (.xlsx, .xls)
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <Input 
              type="file" 
              id="invoice-file-upload"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileChange} 
              className="flex-grow"
              disabled={isLoading}
            />
            <Button onClick={handleUpload} disabled={!file || isLoading} variant="primary">
              {isLoading ? (
                <>
                  <Icons.Loading className="mr-2 w-4 h-4" /> İşleniyor...
                </>
              ) : (
                <>
                  <Icons.Upload className="mr-2 w-4 h-4" /> Yükle
                </>
              )}
            </Button>
          </div>
          {file && <p className="text-sm text-gray-500 mt-1">Seçilen dosya: {file.name}</p>}
        </div>

        {feedback && (
          <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : feedback.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.message}
          </div>
        )}

        
      </div>
    </Card>
  );
};


// --- INVOICE CATEGORY ASSIGNMENT PAGE ---
export const InvoiceCategoryAssignmentPage: React.FC = () => {
  const { eFaturaList, updateEFatura, kategoriList } = useDataContext();
  const { selectedBranch, currentPeriod: currentAppContextPeriod, hasPermission } = useAppContext(); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState(""); // Default to "Tümü"
  const [filterUncategorized, setFilterUncategorized] = useState(true);
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState(''); // New state for Kategori filter
  const [filterGidenFatura, setFilterGidenFatura] = useState<boolean | undefined>(false); // Default to Gelen Fatura (false)
  const canPrint = hasPermission("Yazdırma Yetkisi");
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleGeneratePdf = () => {
    generateDashboardPdf('invoice-category-assignment-content', `Fatura_Kategori_Atama_${selectedBranch?.Sube_Adi}_${filterPeriod}.pdf`);
  };

  const handleExportToExcelForFaturaKategori = () => {
    if (!selectedBranch) return;

    const wb = XLSX.utils.book_new();
    const ws_data = filteredFaturas.map(fatura => {
        const kategori = kategoriList.find(k => k.Kategori_ID === fatura.Kategori_ID);
        const row: any = {
            'Fatura No': fatura.Fatura_Numarasi,
            'Alıcı Ünvanı': fatura.Alici_Unvani,
            'Fatura Tarihi': parseDateString(fatura.Fatura_Tarihi),
            'Tutar': fatura.Tutar,
            'Kategori': kategori ? kategori.Kategori_Adi : 'Kategorisiz',
            'Açıklama': fatura.Aciklama || '',
            'Dönem': fatura.Donem,
            'Günlük': fatura.Gunluk_Harcama ? 'Evet' : 'Hayır',
            'Fatura Türü': fatura.Giden_Fatura ? 'Giden Fatura' : 'Gelen Fatura',
        };
        if (canViewAndEditSpecial) {
            row['Özel'] = fatura.Ozel ? 'Evet' : 'Hayır';
        }
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 40 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Fatura Kategori Atama');

    XLSX.writeFile(wb, `Fatura_Kategori_Atama_${selectedBranch?.Sube_Adi}_${filterPeriod}.xlsx`);
  };
  const [filterSpecial, setFilterSpecial] = useState<boolean | undefined>(undefined);

  if (!hasPermission(FATURA_KATEGORI_ATAMA_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Fatura Kategori Atama" />;
  }

  const canViewAndEditSpecial = hasPermission(OZEL_FATURA_YETKI_ADI);
  const canViewGizliKategoriler = hasPermission(GIZLI_KATEGORI_YETKISI_ADI);

  const previousAppContextPeriod = useMemo(() => getPreviousPeriod(currentAppContextPeriod || DEFAULT_PERIOD), [currentAppContextPeriod]);

  const availableMainFilterPeriods = useMemo(() => {
    const periods = new Set(eFaturaList.map(f => String(f.Donem)));
    periods.add(String(currentAppContextPeriod || DEFAULT_PERIOD));
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [eFaturaList, currentAppContextPeriod]);
  
  const getRowDropdownPeriods = useCallback((faturaDonem: string): string[] => {
    const current = String(faturaDonem);
    if (!current || current.length !== 4) return [current];

    const prev = getPreviousPeriod(current);
    const next = getNextPeriod(current);
    
    return Array.from(new Set([next, current, prev])).sort((a, b) => b.localeCompare(a));
  }, []); 


  const filteredFaturas = useMemo(() => {
    if (!selectedBranch) return [];

    let invoicesToDisplay = eFaturaList.filter(f => f.Sube_ID === selectedBranch.Sube_ID);

    // --- Permission-based Filters ---
    if (!canViewAndEditSpecial) {
      invoicesToDisplay = invoicesToDisplay.filter(f => !f.Ozel);
    }

    // --- User-driven Filters ---

    // Search Term
    if (searchTerm) {
      invoicesToDisplay = invoicesToDisplay.filter(f =>
        f.Fatura_Numarasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.Alici_Unvani.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.Aciklama && f.Aciklama.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // "Özel Fatura" Dropdown
    if (canViewAndEditSpecial && filterSpecial !== undefined) {
      invoicesToDisplay = invoicesToDisplay.filter(f => f.Ozel === filterSpecial);
    }

    // Period Dropdown
    if (filterPeriod) { // An empty string means "Tümü"
      invoicesToDisplay = invoicesToDisplay.filter(f => String(f.Donem) === filterPeriod);
    }

    // "Sadece Kategorisizleri Göster" Checkbox
    if (filterUncategorized) {
      invoicesToDisplay = invoicesToDisplay.filter(f => f.Kategori_ID === null);
    }
    // Kategori Filter
    if (selectedKategoriFilter) {
      invoicesToDisplay = invoicesToDisplay.filter(f => String(f.Kategori_ID) === selectedKategoriFilter);
    }

    // Giden/Gelen Fatura Filter
    if (filterGidenFatura !== undefined) {
      invoicesToDisplay = invoicesToDisplay.filter(f => f.Giden_Fatura === filterGidenFatura);
    }
    
    // --- Sorting ---
    invoicesToDisplay.sort((a, b) => {
        const aUncat = a.Kategori_ID === null;
        const bUncat = b.Kategori_ID === null;
        if (aUncat && !bUncat) return -1; // Uncategorized first
        if (!aUncat && bUncat) return 1;
        // Then sort by date descending
        return new Date(parseDateString(b.Fatura_Tarihi)).getTime() - new Date(parseDateString(a.Fatura_Tarihi)).getTime();
    });

    return invoicesToDisplay;

  }, [eFaturaList, selectedBranch, searchTerm, filterSpecial, filterPeriod, filterUncategorized, selectedKategoriFilter, filterGidenFatura, canViewAndEditSpecial]);


  // Enhanced category filtering function for invoice type based filtering
  const getCategoriesForInvoiceType = useMemo(() => {
    return (isGidenFatura: boolean) => {
      const allowedTips = isGidenFatura 
        ? ['Bilgi', 'Giden Fatura'] 
        : ['Bilgi', 'Gider'];
      
      return kategoriList.filter(k => 
        k.Aktif_Pasif &&
        allowedTips.includes(k.Tip) &&
        (canViewGizliKategoriler || !k.Gizli)
      ).sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
    };
  }, [kategoriList, canViewGizliKategoriler]);

  // Pre-computed category lists for performance optimization
  const gidenFaturaCategories = useMemo(() => 
    getCategoriesForInvoiceType(true), [getCategoriesForInvoiceType]);

  const gelenFaturaCategories = useMemo(() => 
    getCategoriesForInvoiceType(false), [getCategoriesForInvoiceType]);

  // Legacy activeKategoriler for backward compatibility (used in filter dropdown)
  const activeKategoriler = useMemo(() => {
    return kategoriList.filter(k => 
      k.Aktif_Pasif &&
      k.Tip === "Gider" &&
      (canViewGizliKategoriler || !k.Gizli)
    ).sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriList, canViewGizliKategoriler]);

  const handleUpdate = (faturaId: number, field: keyof InvoiceAssignmentFormData, value: any) => {
    const dataToUpdate: InvoiceAssignmentFormData = { [field]: value };
    
    if (field === 'Kategori_ID' && value !== null) {
      const fatura = eFaturaList.find(f => f.Fatura_ID === faturaId);
      if (fatura && fatura.Ozel && !canViewAndEditSpecial) {
        dataToUpdate.Ozel = false; 
      }
    }
    updateEFatura(faturaId, dataToUpdate);
  };
  
  const handleToggleOzel = (faturaId: number, currentValue: boolean) => {
    if (!canViewAndEditSpecial) {
      alert("Bu faturanın 'Özel' işaretini değiştirmek için yetkiniz bulunmamaktadır.");
      return;
    }
    updateEFatura(faturaId, { Ozel: !currentValue });
  };
  
  const tableHeaders = useMemo(() => {
    const headers = ['Fatura No', 'Alıcı Ünvanı', 'Fatura Tarihi', 'Tutar', 'Kategori', 'Açıklama', 'Dönem', 'Günlük'];
    if (canViewAndEditSpecial) {
        headers.push('Özel');
    }
    return headers;
  }, [canViewAndEditSpecial]);


  if (!selectedBranch) {
    return <Card title="Fatura Kategori Atama"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-2" id="invoice-category-assignment-content">
      <Card 
        title={`Fatura Kategori Atama (Şube: ${selectedBranch.Sube_Adi})`}
        actions={
          <div className="flex items-center space-x-2 hide-on-pdf">
            {canPrint && (
              <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                <Icons.Print className="w-5 h-5" />
              </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcelForFaturaKategori} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
          <Input 
            label="Ara (Fatura No, Alıcı, Açıklama)"
            placeholder="Arama terimi..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select label="Dönem Filtresi" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}> 
            <option value="">Tümü (Varsayılan: Kategorisiz + Cari/Önceki Dönem)</option>
            {availableMainFilterPeriods.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select label="Fatura Türü" value={filterGidenFatura === undefined ? "" : (filterGidenFatura ? "true" : "false")} onChange={e => setFilterGidenFatura(e.target.value === "" ? undefined : e.target.value === "true")}>
            <option value="false">Gelen Fatura</option>
            <option value="true">Giden Fatura</option>
            <option value="">Tümü</option>
          </Select>
          {canViewAndEditSpecial && (
            <Select label="Özel Fatura" value={filterSpecial === undefined ? "" : (filterSpecial ? "true" : "false")} onChange={e => setFilterSpecial(e.target.value === "" ? undefined : e.target.value === "true")}>
                <option value="">Tümü</option>
                <option value="true">Evet</option>
                <option value="false">Hayır</option>
            </Select>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
          <Select label="Kategori Filtresi" value={selectedKategoriFilter} onChange={e => setSelectedKategoriFilter(e.target.value)}>
            <option value="">Tüm Kategoriler</option>
            {activeKategoriler.map(kategori => (
              <option key={kategori.Kategori_ID} value={kategori.Kategori_ID}>
                {kategori.Kategori_Adi}
              </option>
            ))}
          </Select>
          <label className="flex items-center space-x-2 pt-6">
            <input 
              type="checkbox" 
              checked={filterUncategorized} 
              onChange={e => setFilterUncategorized(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 text-sm">Sadece Kategorisizleri Göster</span>
          </label>
          <div></div>
          <div></div>
        </div>
      </Card>

      <div className="overflow-x-auto">
        <TableLayout headers={tableHeaders} compact={true}>
            {filteredFaturas.map(fatura => {
              const rowSpecificPeriods = getRowDropdownPeriods(String(fatura.Donem));
              return (
                <tr key={fatura.Fatura_ID} className={`${fatura.Kategori_ID === null ? 'bg-yellow-50' : ''}`}>
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 w-[150px]">{fatura.Fatura_Numarasi}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 w-[180px]">{fatura.Alici_Unvani}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 w-[100px]">{parseDateString(fatura.Fatura_Tarihi)}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-right text-gray-600 w-[100px]">{formatTrCurrencyAdvanced(fatura.Tutar)}</td>
                  <td className="px-2 py-1.5 text-xs w-[200px]">
                    <Select
                      value={fatura.Kategori_ID || ""}
                      onChange={(e) => handleUpdate(fatura.Fatura_ID, "Kategori_ID", e.target.value === "" ? null : parseInt(e.target.value))}
                      className="text-xs p-1 w-full"
                    >
                      <option value="">Seçin...</option>
                      {(fatura.Giden_Fatura ? gidenFaturaCategories : gelenFaturaCategories).map((kategori) => (
                        <option key={kategori.Kategori_ID} value={kategori.Kategori_ID}>
                          {kategori.Kategori_Adi}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-2 py-1.5 text-xs min-w-[300px]">
                    <InlineEditInput
                      value={fatura.Aciklama || ""}
                      onSave={(value) => handleUpdate(fatura.Fatura_ID, "Aciklama", value)}
                      placeholder="Açıklama..."
                      className="w-full text-xs"
                      aria-label={`Fatura ${fatura.Fatura_Numarasi} için açıklama`}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-xs min-w-[120px]">
                    <Select
                      value={String(fatura.Donem)}
                      onChange={(e) => handleUpdate(fatura.Fatura_ID, "Donem", e.target.value)}
                      className="text-xs p-1 w-full"
                    >
                      {rowSpecificPeriods.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-2 py-1.5 text-xs text-center">
                    {fatura.Giden_Fatura ? (
                      <span className="text-gray-600 font-medium">Giden</span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={fatura.Gunluk_Harcama}
                        onChange={() => handleUpdate(fatura.Fatura_ID, "Gunluk_Harcama", !fatura.Gunluk_Harcama)}
                        className="form-checkbox h-4 w-4 text-blue-500 cursor-pointer"
                        aria-label={`Fatura ${fatura.Fatura_Numarasi} için günlük harcama`}
                      />
                    )}
                  </td>
                  {canViewAndEditSpecial && (
                    <td className="px-2 py-1.5 text-xs text-center">
                      <input
                        type="checkbox"
                        checked={fatura.Ozel}
                        onChange={() => handleToggleOzel(fatura.Fatura_ID, fatura.Ozel)}
                        disabled={!canViewAndEditSpecial}
                        className={`form-checkbox h-4 w-4 ${canViewAndEditSpecial ? "text-purple-500 cursor-pointer" : "text-purple-300 cursor-not-allowed"}`}
                        aria-label={`Fatura ${fatura.Fatura_Numarasi} için özel fatura`}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
        </TableLayout>
      </div>
      {filteredFaturas.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-4">Filtre kriterlerine uygun fatura bulunamadı.</p>
        </Card>
      )}
    </div>
  );
};


// --- B2B EKSTRE YUKLEME PAGE ---
export const B2BUploadPage: React.FC = () => {
  const { selectedBranch, hasPermission } = useAppContext();
  const { updateEFatura, uploadB2BEkstre } = useDataContext(); // Use uploadB2BEkstre from context
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!hasPermission(B2B_YUKLEME_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="B2B Ekstre Yükleme" />;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setFeedback(null);
      } else {
        setFeedback({ message: "Lütfen geçerli bir Excel (.xlsx, .xls) veya CSV dosyası seçin.", type: 'error' });
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedBranch) {
      setFeedback({ message: "Lütfen bir dosya seçin ve şubenin seçili olduğundan emin olun.", type: 'error' });
      return;
    }

    setFeedback({ message: `Dosya yükleniyor ve işleniyor...`, type: 'info' });

    try {
        let fileToUpload: File;

        // If the file is an excel file, convert it to CSV
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csvData], { type: 'text/csv' });
            fileToUpload = new File([blob], "uploaded_ekstre.csv", { type: 'text/csv' });
        } else {
            fileToUpload = file;
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('sube_id', selectedBranch.Sube_ID.toString());

        const result = await uploadB2BEkstre(formData);

        if (result) {
            setFeedback({ 
                message: `İşlem tamamlandı. Eklenen kayıtlar: ${result.added}, Atlanan kayıtlar: ${result.skipped}`,
                type: 'success' 
            });
        } else {
            setFeedback({ 
                message: "Dosya yüklenirken bir hata oluştu. Lütfen backend loglarını kontrol edin.", 
                type: 'error' 
            });
        }

    } catch (error) {
        console.error("File processing error:", error);
        setFeedback({ message: "Dosya işlenirken bir hata oluştu. Lütfen dosyanın formatını kontrol edin.", type: 'error' });
    }

    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    alert("Bu ekran, yükleyeceğiniz Excel dosyasındaki 'Fiş No' ve 'Açıklama' sütunlarını kullanarak mevcut e-Faturaların açıklama alanlarını günceller. Lütfen Excel dosyanızın 'Fiş No' ve 'Açıklama' sütunlarını içerdiğinden emin olun.");
    console.log("B2B Açıklama Güncelleme Excel Şablonu Bilgisi: Excel dosyanızda 'Fiş No' ve 'Açıklama' sütunları bulunmalıdır.");
  };

  return (
    <Card title={`B2B Ekstre Yükleme (Şube: ${selectedBranch?.Sube_Adi || 'Seçilmedi'})`}>
      <div className="space-y-6">
        <div>
          <label htmlFor="b2b-file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Excel Dosyası (.xlsx, .xls)
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <Input 
              type="file" 
              id="b2b-file-upload"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileChange} 
              className="flex-grow"
            />
            <Button onClick={handleUpload} disabled={!file} variant="primary">
              <Icons.Upload className="mr-2 w-4 h-4" /> Yükle
            </Button>
          </div>
          {file && <p className="text-sm text-gray-500 mt-1">Seçilen dosya: {file.name}</p>}
        </div>

        {feedback && (
          <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.message}
          </div>
        )}

        <div>
          <Button onClick={handleDownloadTemplate} variant="secondary" size="sm" leftIcon={<Icons.Download className="w-4 h-4" />}>
            Örnek Şablon İndir
          </Button>
           <p className="text-xs text-gray-500 mt-1">
             Yüklenecek Excel dosyasının sütunları: "Fatura Tarihi", "Fatura Numarası", "Alıcı Ünvanı", "Tutar".
          </p>
        </div>
      </div>
    </Card>
  );
};


// --- B2B EKSTRE KATEGORI ATAMA PAGE ---
export const B2BCategoryAssignmentPage: React.FC = () => {
  const { b2bEkstreList, updateB2BEkstre, kategoriList } = useDataContext();
  const { selectedBranch, currentPeriod: currentAppContextPeriod, hasPermission } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState(currentAppContextPeriod || ""); // Default to "Tüm Dönemler"
  const [filterUncategorized, setFilterUncategorized] = useState(true);

  if (!hasPermission(B2B_KATEGORI_ATAMA_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="B2B Kategori Atama" />;
  }

  const previousAppContextPeriod = useMemo(() => getPreviousPeriod(currentAppContextPeriod || DEFAULT_PERIOD), [currentAppContextPeriod]);

  const availableMainFilterPeriods = useMemo(() => {
    const periods = new Set(b2bEkstreList.map(e => e.Donem));
    periods.add(currentAppContextPeriod || DEFAULT_PERIOD);
    return Array.from(periods).sort((a,b)=> b.localeCompare(a)); 
  }, [b2bEkstreList, currentAppContextPeriod]);

  const getRowDropdownPeriodsForB2B = useCallback((ekstreDonem: string): string[] => {
    const current = ekstreDonem;
    if (!current || current.length !== 4) return [current];

    const prev = getPreviousPeriod(current);
    const next = getNextPeriod(current);
    
    return Array.from(new Set([next, current, prev])).sort((a, b) => b.localeCompare(a));
  }, []); 


  const filteredEkstreler = useMemo(() => {
    if (!selectedBranch) return [];

    let baseList = b2bEkstreList.filter(e => e.Sube_ID === selectedBranch.Sube_ID);

    if (searchTerm) {
      baseList = baseList.filter(e =>
        e.Fis_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.Aciklama && e.Aciklama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.Fatura_No && e.Fatura_No.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    let ekstrelerToDisplay;

    if (filterPeriod) { // A specific period is selected from the main filter
        ekstrelerToDisplay = baseList.filter(e => e.Donem === filterPeriod);
        if (filterUncategorized) { 
            ekstrelerToDisplay = ekstrelerToDisplay.filter(e => e.Kategori_ID === null);
        }
    } else { // "Tüm Dönemler" is selected (filterPeriod is "")
        if (filterUncategorized) { 
            // Show only uncategorized from all periods
            ekstrelerToDisplay = baseList.filter(e => e.Kategori_ID === null);
        } else {
            // Show uncategorized from all periods + all from current/previous periods
            ekstrelerToDisplay = baseList;
        }
    }

    ekstrelerToDisplay.sort((a, b) => {
        const aUncat = a.Kategori_ID === null;
        const bUncat = b.Kategori_ID === null;
        if (aUncat && !bUncat) return -1;
        if (!aUncat && bUncat) return 1;
        return new Date(parseDateString(b.Tarih)).getTime() - new Date(parseDateString(a.Tarih)).getTime();
    });

    return ekstrelerToDisplay;

  }, [b2bEkstreList, selectedBranch, searchTerm, filterPeriod, filterUncategorized, currentAppContextPeriod, previousAppContextPeriod]);

  const activeKategoriler = useMemo(() => kategoriList.filter(k => k.Aktif_Pasif).sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' })), [kategoriList]); // All active categories

  const handleUpdate = (ekstreId: number, field: keyof B2BAssignmentFormData, value: any) => {
    console.log(`[B2BCategoryAssignmentPage] handleUpdate called for ekstreId: ${ekstreId}, field: ${field}, value: ${value}`);
    const dataToUpdate: B2BAssignmentFormData = { [field]: value };
    updateB2BEkstre(ekstreId, dataToUpdate);
  };
  
  if (!selectedBranch) {
    return <Card title="B2B Ekstre Kategori Atama"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-2">
      <Card title={`B2B Ekstre Kategori Atama (Şube: ${selectedBranch.Sube_Adi})`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 items-end">
          <Input 
            label="Ara (Fiş No, Açıklama, Fatura No)"
            placeholder="Arama terimi..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select label="Dönem Filtresi" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
            <option value="">Tüm Dönemler (Varsayılan: Kategorisiz + Cari/Önceki Dönem)</option>
            {availableMainFilterPeriods.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          <label className="flex items-center space-x-2 pt-6">
            <input 
              type="checkbox" 
              checked={filterUncategorized} 
              onChange={e => setFilterUncategorized(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 text-sm">Sadece Kategorisizleri Göster</span>
          </label>
        </div>
      </Card>

      <div className="overflow-x-auto">
        <TableLayout headers={['Fiş No', 'Tarih', 'Açıklama', 'Borç', 'Alacak', 'Fatura No', 'Kategori', 'Dönem']} compact={true}>
            {filteredEkstreler.map(ekstre => {
              const rowSpecificPeriods = getRowDropdownPeriodsForB2B(ekstre.Donem);
              return (
                <tr key={ekstre.Ekstre_ID} className={`${ekstre.Kategori_ID === null ? 'bg-yellow-50' : ''}`}>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700">{ekstre.Fis_No}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700">{parseDateString(ekstre.Tarih)}</td>
                    <td className="px-2 py-1.5 text-xs min-w-[300px]">
                        <InlineEditInput 
                            value={ekstre.Aciklama || ''}
                            onSave={(newValue) => handleUpdate(ekstre.Ekstre_ID, 'Aciklama', newValue)}
                            placeholder="Açıklama..."
                        />
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 text-right">{formatTrCurrencyAdvanced(ekstre.Borc, 2)}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700 text-right">{formatTrCurrencyAdvanced(ekstre.Alacak, 2)}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-700">{ekstre.Fatura_No || "-"}</td>
                    <td className="px-2 py-1.5 text-xs min-w-[180px]">
                        <Select
                            value={ekstre.Kategori_ID?.toString() || ""}
                            onChange={(e) => handleUpdate(ekstre.Ekstre_ID, 'Kategori_ID', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full text-xs py-1"
                            aria-label={`Ekstre ${ekstre.Fis_No} için kategori`}
                        >
                            <option value="">Seçin...</option>
                            {activeKategoriler.map(k => (
                                <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi} ({k.Tip})</option>
                            ))}
                        </Select>
                    </td>
                    <td className="px-2 py-1.5 text-xs min-w-[120px]">
                         <Select
                            value={ekstre.Donem}
                            onChange={(e) => handleUpdate(ekstre.Ekstre_ID, 'Donem', e.target.value)}
                            className="w-full text-xs py-1"
                            aria-label={`Ekstre ${ekstre.Fis_No} için dönem`}
                        >
                            {rowSpecificPeriods.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                             {rowSpecificPeriods.length === 0 && <option value={ekstre.Donem} disabled>{ekstre.Donem} (Başka seçenek yok)</option>}
                        </Select>
                    </td>
                </tr>
              )
            })}
        </TableLayout>
      </div>
      {filteredEkstreler.length === 0 && (
        <Card>
          <p className="text-center text-gray-500 py-4">Filtre kriterlerine uygun B2B Ekstre kaydı bulunamadı.</p>
        </Card>
      )}
    </div>
  );
};


// --- DIGER HARCAMALAR PAGE ---
export const DigerHarcamalarPage: React.FC = () => {
  const { digerHarcamaList, addDigerHarcama, updateDigerHarcama, deleteDigerHarcama, kategoriList } = useDataContext();
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHarcama, setEditingHarcama] = useState<DigerHarcama | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTip, setFilterTip] = useState<HarcamaTipi | ''>('');
  const [filterPeriod, setFilterPeriod] = useState<string>(currentPeriod || '');

  useEffect(() => {
    setFilterPeriod(currentPeriod || '');
  }, [currentPeriod]);

  const availablePeriods = useMemo(() => {
    const periods = new Set(digerHarcamaList.map(h => String(h.Donem)));
    periods.add(currentPeriod || '');
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [digerHarcamaList, currentPeriod]);

  if (!hasPermission(DIGER_HARCAMALAR_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Diğer Harcamalar" />;
  }
  
  const canViewGizliKategoriler = hasPermission(GIZLI_KATEGORI_YETKISI_ADI);
  const canEditDonem = hasPermission(GIZLI_KATEGORI_YETKISI_ADI); // Added this line
  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleExportToExcel = () => {
    if (!selectedBranch) return;

    const wb = XLSX.utils.book_new();
    const ws_data = filteredHarcamalar.map(h => {
        const kategoriAdi = kategoriList.find(k => k.Kategori_ID === h.Kategori_ID)?.Kategori_Adi || 'N/A';
        return {
            'Alıcı Adı': h.Alici_Adi,
            'Belge No': h.Belge_Numarasi || '-',
            'Belge Tarihi': parseDateString(h.Belge_Tarihi),
            'Tutar': h.Tutar,
            'Kategori': kategoriAdi,
            'Tip': h.Harcama_Tipi,
            'Günlük': h.Gunluk_Harcama ? 'Evet' : 'Hayır',
            'Resim': h.Imaj_Adi || '-',
        };
    });

    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Diğer Harcamalar');
    XLSX.writeFile(wb, `Diger_Harcamalar_${selectedBranch?.Sube_Adi}_${filterPeriod}.xlsx`);
  };

  const handleGeneratePdf = () => {
    generateDashboardPdf('diger-harcamalar-content', `Diger_Harcamalar_${selectedBranch?.Sube_Adi}_${filterPeriod}.pdf`);
  };

  const handleAddNew = () => {
    setEditingHarcama(null);
    setIsModalOpen(true);
  };

  const handleEdit = (harcama: DigerHarcama) => {
    setEditingHarcama(harcama);
    setIsModalOpen(true);
  };

  const handleDelete = (harcamaId: number) => {
    if (window.confirm("Bu harcamayı silmek istediğinizden emin misiniz?")) {
      deleteDigerHarcama(harcamaId);
    }
  };

  const handleSubmit = async (data: DigerHarcamaFormData) => {
    console.log("Form data received:", data);
    if (!selectedBranch) {
      alert("Lütfen önce bir şube seçin.");
      return;
    }
    const derivedDonem = data.Donem ? data.Donem : calculatePeriod(data.Belge_Tarihi);

    const harcamaData = {
        ...data,
        Donem: derivedDonem,
        Sube_ID: selectedBranch.Sube_ID,
    };

    let result;
    if (editingHarcama) {
        result = await updateDigerHarcama(editingHarcama.Harcama_ID, harcamaData);
    } else {
        result = await addDigerHarcama(harcamaData);
    }

    if (result && result.success) {
        setIsModalOpen(false);
        setEditingHarcama(null);
    } else if (result && result.message) {
        alert(result.message);
    }
  };
  
  const filteredHarcamalar = useMemo(() => {
    return digerHarcamaList
      .filter(h => {
          const kategori = kategoriList.find(k => k.Kategori_ID === h.Kategori_ID);
          if (kategori && kategori.Gizli && !canViewGizliKategoriler) {
            return false;
          }
          return h.Sube_ID === selectedBranch?.Sube_ID
      })
      .filter(h => 
        h.Alici_Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.Belge_Numarasi && h.Belge_Numarasi.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(h => filterTip ? h.Harcama_Tipi === filterTip : true)
      .filter(h => filterPeriod ? String(h.Donem) === filterPeriod : true)
      .sort((a,b) => new Date(parseDateString(b.Belge_Tarihi)).getTime() - new Date(parseDateString(a.Belge_Tarihi)).getTime());
  }, [digerHarcamaList, selectedBranch, searchTerm, filterTip, filterPeriod, kategoriList, canViewGizliKategoriler]);

  const activeKategorilerForForm = useMemo(() => {
    return kategoriList.filter(k => k.Aktif_Pasif && k.Tip === 'Gider' && (canViewGizliKategoriler || !k.Gizli)).sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriList, canViewGizliKategoriler]);

  if (!selectedBranch) {
    return <Card title="Diğer Harcamalar"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-6" id="diger-harcamalar-content">
      <Card title={`Diğer Harcamalar (Şube: ${selectedBranch.Sube_Adi})`} actions={
         <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input 
                placeholder="Alıcı/Belge No ara..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Select 
                value={filterTip} 
                onChange={e => setFilterTip(e.target.value as HarcamaTipi | '')}
                className="min-w-[150px] text-sm py-2"
            >
                <option value="">Tüm Tipler</option>
                {HarcamaTipiOptions.map(tip => <option key={tip} value={tip}>{tip}</option>)}
            </Select>
            <Select 
                value={filterPeriod} 
                onChange={e => setFilterPeriod(e.target.value)}
                className="min-w-[150px] text-sm py-2"
            >
                <option value="">Tüm Dönemler</option>
                {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Button onClick={handleAddNew} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Harcama</Button>
        </div>
      }>
        <TableLayout headers={['Alıcı Adı', 'Belge No', 'Belge Tarihi', 'Tutar', 'Kategori', 'Tip', 'Günlük', 'Resim', 'İşlemler']} compact={true}>
          {filteredHarcamalar.map(h => {
            const kategoriAdi = kategoriList.find(k => k.Kategori_ID === h.Kategori_ID)?.Kategori_Adi || 'N/A';
            return (
            <tr key={h.Harcama_ID}>
              <td className="px-4 py-2 text-sm text-gray-900">{h.Alici_Adi}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{h.Belge_Numarasi || '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{parseDateString(h.Belge_Tarihi)}</td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right">{h.Tutar.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{kategoriAdi}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{h.Harcama_Tipi}</td>
              <td className="px-4 py-2 text-sm text-center">
                {h.Gunluk_Harcama ? <Icons.CheckedSquare className="w-4 h-4 text-green-500" /> : <Icons.EmptySquare className="w-4 h-4 text-gray-300" />}
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {h.Imaj_Adi && (
                  <a href={`data:image/jpeg;base64,${h.Imaj}`} download={h.Imaj_Adi} className="text-blue-600 hover:underline flex items-center space-x-1">
                    <Icons.Download className="w-4 h-4" />
                    <span>{h.Imaj_Adi}</span>
                  </a>
                )}
              </td>
              <td className="px-4 py-2 text-sm font-medium flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(h)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
                <Button variant="ghost" size="sm" onClick={() => handleDelete(h.Harcama_ID)} leftIcon={<Icons.Delete className="w-4 h-4" />} title="Sil" />
              </td>
            </tr>
            )
          })}
        </TableLayout>
         {filteredHarcamalar.length === 0 && <p className="text-center py-4 text-gray-500">Kayıtlı harcama bulunmamaktadır.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHarcama ? 'Harcama Düzenle' : 'Yeni Harcama Ekle'}>
        <DigerHarcamaForm 
            initialData={editingHarcama} 
            kategoriler={activeKategorilerForForm} 
            onSubmit={handleSubmit} 
            onCancel={() => setIsModalOpen(false)}
            canEditDonem={canEditDonem}
        />
      </Modal>
    </div>
  );
};

// --- GELIR PAGE ---
export const GelirPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission, isAdmin } = useAppContext();
    const { 
        gelirList, addOrUpdateGelirEntry, getGelirEntry, 
        gelirEkstraList, addOrUpdateGelirEkstraEntry, getGelirEkstraEntry,
        eFaturaList, digerHarcamaList,
        kategoriList, ustKategoriList
    } = useDataContext();

    if (!hasPermission(GELIR_GIRISI_EKRANI_YETKI_ADI)) {
        return <AccessDenied title="Gelir Girişi" />;
    }

    const canAccessHistory = hasPermission(GELIR_GECMISI_YETKI_ADI);
    const canViewGizliKategoriler = hasPermission(GIZLI_KATEGORI_YETKISI_ADI);
    const canPrint = hasPermission("Yazdırma Yetkisi");
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

    const [viewedPeriod, setViewedPeriod] = useState(currentPeriod);
    const [isEditingDisabled, setIsEditingDisabled] = useState(false);
    const [dailyErrors, setDailyErrors] = useState<Record<string, string | null>>({});
    
    const handleGeneratePdf = () => {
        generateDashboardPdf('gelir-content', `Gelir_Giris_${selectedBranch?.Sube_Adi}_${viewedPeriod}.pdf`);
    };

    const handleExportToExcelForGelir = () => {
        if (!selectedBranch) return;
    
        const wb = XLSX.utils.book_new();
        const ws_data: any[][] = [];
    
        // Header Row
        const header = ['Gelir Kalemi'];
        daysInViewedMonth.forEach(d => header.push(String(d.day)));
        header.push('Aylık Toplam');
        ws_data.push(header);
    
        // Data Rows
        const dataRows: {key: string, label: string, dataGetter: (dateString: string) => number | undefined}[] = [
            { key: 'robotpos-tutar', label: 'RobotPos Tutar', dataGetter: (dateString) => getGelirEkstraEntry(dateString, selectedBranch.Sube_ID)?.RobotPos_Tutar },
            { key: 'z-rapor-tutar', label: 'Z Rapor Tutar', dataGetter: (dateString) => getGelirEkstraEntry(dateString, selectedBranch.Sube_ID)?.ZRapor_Tutar },
        ];

        dataRows.forEach(dataRow => {
            const row = [dataRow.label];
            let monthlyTotal = 0;
            daysInViewedMonth.forEach(day => {
                const value = dataRow.dataGetter(day.dateString) || 0;
                row.push(value);
                monthlyTotal += value;
            });
            row.push(monthlyTotal);
            ws_data.push(row);
        });

        Object.entries(gelirKategoriler.grouped).forEach(([ustKategoriAdi, kategoriler]) => {
            const ustKategoriRow = [ustKategoriAdi];
            let ustKategoriMonthlyTotal = 0;
            daysInViewedMonth.forEach(({ dateString }) => {
                const dailyUstKategoriTotal = kategoriler.reduce((sum, kategori) => {
                    return sum + (getGelirEntry(kategori.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0);
                }, 0);
                ustKategoriRow.push(dailyUstKategoriTotal);
                ustKategoriMonthlyTotal += dailyUstKategoriTotal;
            });
            ustKategoriRow.push(ustKategoriMonthlyTotal);
            ws_data.push(ustKategoriRow);

            kategoriler.forEach(kategori => {
                const kategoriRow = [kategori.Kategori_Adi];
                let kategoriMonthlyTotal = 0;
                daysInViewedMonth.forEach(day => {
                    const value = getGelirEntry(kategori.Kategori_ID, day.dateString, selectedBranch.Sube_ID)?.Tutar || 0;
                    kategoriRow.push(value);
                    kategoriMonthlyTotal += value;
                });
                kategoriRow.push(kategoriMonthlyTotal);
                ws_data.push(kategoriRow);
            });
        });

        gelirKategoriler.ungrouped.forEach(kategori => {
            const kategoriRow = [kategori.Kategori_Adi];
            let kategoriMonthlyTotal = 0;
            daysInViewedMonth.forEach(day => {
                const value = getGelirEntry(kategori.Kategori_ID, day.dateString, selectedBranch.Sube_ID)?.Tutar || 0;
                kategoriRow.push(value);
                kategoriMonthlyTotal += value;
            });
            kategoriRow.push(kategoriMonthlyTotal);
            ws_data.push(kategoriRow);
        });

        // Summary Rows
        const summaryRows = [
            {
                label: 'Toplam Satış Gelirleri',
                dailyTotalGetter: (dateString: string) => kategoriList.filter(k => k.Tip === 'Gelir' && k.Aktif_Pasif).reduce((sum, cat) => sum + (getGelirEntry(cat.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0), 0),
            },
            {
                label: 'GÜNLÜK TOPLAM',
                dailyTotalGetter: (dateString: string) => {
                    const gelir = kategoriList.filter(k => k.Tip === 'Gelir' && k.Aktif_Pasif).reduce((sum, cat) => sum + (getGelirEntry(cat.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0), 0);
                    const harcamaEFatura = getDailyTotal(dailyEFaturaTotals, dateString);
                    const harcamaDiger = getDailyTotal(dailyDigerHarcamaTotals, dateString);
                    return gelir - harcamaEFatura - harcamaDiger;
                },
            },
            {
                label: 'Günlük Harcama-eFatura',
                dailyTotalGetter: (dateString: string) => getDailyTotal(dailyEFaturaTotals, dateString),
            },
            {
                label: 'Günlük Harcama-Diğer',
                dailyTotalGetter: (dateString: string) => getDailyTotal(dailyDigerHarcamaTotals, dateString),
            }
        ];

        summaryRows.forEach(summaryRow => {
            const row = [summaryRow.label];
            let monthlyTotal = 0;
            daysInViewedMonth.forEach(day => {
                const value = summaryRow.dailyTotalGetter(day.dateString);
                row.push(value);
                monthlyTotal += value;
            });
            row.push(monthlyTotal);
            ws_data.push(row);
        });
    
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [{ wch: 30 }]; // Set width for the first column
        XLSX.utils.book_append_sheet(wb, ws, 'Gelir Raporu');
    
        XLSX.writeFile(wb, `Gelir_Raporu_${selectedBranch?.Sube_Adi}_${viewedPeriod}.xlsx`);
    };
    
    useEffect(() => { setViewedPeriod(currentPeriod); }, [currentPeriod]);
    useEffect(() => {
        if (isAdmin) {
            setIsEditingDisabled(false);
            return;
        }
        const today = new Date();
        const currentDayOfMonth = today.getDate();
        const previousPeriod = getPreviousPeriod(currentPeriod);

        let disable = false;
        if (viewedPeriod === currentPeriod) {
            disable = false; // Always allow editing for the current month
        } else if (viewedPeriod === previousPeriod) {
            // Allow editing previous month only during the first 5 days of the current month
            disable = currentDayOfMonth > 5;
        } else {
            disable = true; // Disable editing for all other past months
        }

        setIsEditingDisabled(disable);
    }, [viewedPeriod, currentPeriod, canAccessHistory, isAdmin]);

    const handlePreviousPeriod = () => {
        if (!canAccessHistory) { alert("Geçmiş dönem verilerini görüntüleme yetkiniz yok."); return; }
        setViewedPeriod(getPreviousPeriod(viewedPeriod));
    };
    const handleNextPeriod = () => {
        const next = getNextPeriod(viewedPeriod);
        if (next.localeCompare(currentPeriod) <= 0) setViewedPeriod(next);
    };

    const daysInViewedMonth = useMemo(() => {
        if (!viewedPeriod) return [];
        const numDays = getDaysInMonth(viewedPeriod);
        const year = 2000 + parseInt(viewedPeriod.substring(0, 2));
        const month = parseInt(viewedPeriod.substring(2, 4));
        return Array.from({ length: numDays }, (_, i) => {
            const day = i + 1;
            const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return { day, dateString };
        });
    }, [viewedPeriod]);

    const satisGelirleriUstKategoriId = useMemo(() => 
        ustKategoriList.find(uk => uk.UstKategori_Adi === 'Satış Gelirleri')?.UstKategori_ID,
    [ustKategoriList]);

    const satisGelirleriKategoriler = useMemo(() => {
        if (!satisGelirleriUstKategoriId) return [];
        return kategoriList.filter(k => k.Tip === 'Gelir' && k.Ust_Kategori_ID === satisGelirleriUstKategoriId && k.Aktif_Pasif)
            .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
    }, [kategoriList, satisGelirleriUstKategoriId]);

    const gelirKategoriler = useMemo(() => {
        const grouped: { [key: string]: any[] } = {};
        const ungrouped: any[] = [];

        kategoriList
            .filter(k =>
                k.Tip === 'Gelir' &&
                k.Aktif_Pasif &&
                (canViewGizliKategoriler || !k.Gizli)
            )
            .forEach(kategori => {
                if (kategori.Ust_Kategori_ID) {
                    const ustKategori = ustKategoriList.find(uk => uk.UstKategori_ID === kategori.Ust_Kategori_ID && uk.Aktif_Pasif);
                    if (ustKategori) {
                        if (!grouped[ustKategori.UstKategori_Adi]) {
                            grouped[ustKategori.UstKategori_Adi] = [];
                        }
                        grouped[ustKategori.UstKategori_Adi].push(kategori);
                        return;
                    }
                }
                ungrouped.push(kategori);
            });

        const sortedGrouped = Object.keys(grouped).sort().reduce(
            (obj, key) => {
                obj[key] = grouped[key];
                return obj;
            },
            {} as { [key: string]: any[] }
        );

        return { grouped: sortedGrouped, ungrouped };
    }, [kategoriList, ustKategoriList, canViewGizliKategoriler]);

    // This effect will run to validate the daily totals against RobotPos
    useEffect(() => {
        if (!selectedBranch) {
            setDailyErrors({});
            return;
        };

        const newErrors: Record<string, string | null> = {};
        const allGelirKategoriler = kategoriList.filter(k => k.Tip === 'Gelir' && k.Aktif_Pasif && (canViewGizliKategoriler || !k.Gizli));

        daysInViewedMonth.forEach(({ dateString }) => {
            const robotPosTutar = getGelirEkstraEntry(dateString, selectedBranch.Sube_ID)?.RobotPos_Tutar || 0;
            
            const toplamSatisGelirleri = allGelirKategoriler.reduce((sum, cat) => {
                return sum + (getGelirEntry(cat.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0);
            }, 0);

            // Show warning only when RobotPos is greater than Toplam Satış Gelirleri
            if (robotPosTutar > toplamSatisGelirleri && (robotPosTutar - toplamSatisGelirleri) > 0.01) {
                newErrors[dateString] = `Uyarı: RobotPos (${formatNumberForDisplay(robotPosTutar,2)}) > Toplam Satış (${formatNumberForDisplay(toplamSatisGelirleri,2)})`;
            } else {
                newErrors[dateString] = null;
            }
        });

        setDailyErrors(newErrors);

    }, [
        gelirList, 
        gelirEkstraList, 
        daysInViewedMonth, 
        selectedBranch, 
        kategoriList,
        canViewGizliKategoriler,
        getGelirEkstraEntry, 
        getGelirEntry
    ]);

    const dailyEFaturaTotals = useMemo(() => {
        const dailyTotals = new Map<string, number>();
        eFaturaList
            .filter(f => f.Sube_ID === selectedBranch?.Sube_ID && f.Gunluk_Harcama)
            .forEach(f => {
                const dateKey = f.Fatura_Tarihi;
                dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + Number(f.Tutar));
            });
        return dailyTotals;
    }, [eFaturaList, selectedBranch]);

    const dailyDigerHarcamaTotals = useMemo(() => {
        const dailyTotals = new Map<string, number>();
        digerHarcamaList
            .filter(h => h.Sube_ID === selectedBranch?.Sube_ID && h.Gunluk_Harcama)
            .forEach(h => {
                const dateKey = h.Belge_Tarihi;
                dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + Number(h.Tutar));
            });
        return dailyTotals;
    }, [digerHarcamaList, selectedBranch]);


    const handleEkstraChange = (tarih: string, field: 'RobotPos_Tutar' | 'ZRapor_Tutar', value: number | undefined) => {
        if (!selectedBranch || isEditingDisabled) return;
        const tutar = value || 0;
        const existingEntry = getGelirEkstraEntry(tarih, selectedBranch.Sube_ID);

        addOrUpdateGelirEkstraEntry({
            Tarih: tarih,
            Sube_ID: selectedBranch.Sube_ID,
            RobotPos_Tutar: field === 'RobotPos_Tutar' ? tutar : (existingEntry?.RobotPos_Tutar || 0),
            ZRapor_Tutar: field === 'ZRapor_Tutar' ? tutar : (existingEntry?.ZRapor_Tutar || 0)
        });
    };

    const handleTutarChange = (kategoriId: number, tarih: string, value: number | undefined) => {
        if (!selectedBranch || isEditingDisabled) return;
        const tutar = value || 0;
        addOrUpdateGelirEntry({ Kategori_ID: kategoriId, Tarih: tarih, Tutar: tutar, Sube_ID: selectedBranch.Sube_ID });
    };

    const renderDataRow = (
        key: string,
        label: string, 
        dataGetter: (dateString: string) => number | undefined, 
        onDataChange: (dateString: string, value: number | undefined) => void,
        rowStyle: string,
        showErrorIcon: boolean = false
    ) => {
        const monthlyTotal = daysInViewedMonth.reduce((sum, day) => sum + (dataGetter(day.dateString) || 0), 0);
        return (
            <tr key={key} className={rowStyle}>
                <th scope="row" className="border border-gray-300 px-2 py-1 text-sm font-medium text-left sticky left-0 bg-inherit z-10">{label}</th>
                {daysInViewedMonth.map(({ dateString }) => {
                    const error = showErrorIcon ? dailyErrors[dateString] : null;
                    return (
                        <td key={dateString} className="border border-gray-300 p-0">
                            <div className="flex items-center">
                                <NumberSpinnerInput
                                    value={dataGetter(dateString)}
                                onChange={(val) => onDataChange(dateString, val)}
                                disabled={isEditingDisabled || new Date(dateString) > new Date()}
                                precision={2}
                                inputClassName="w-full h-full text-sm text-right border-0 rounded-none bg-transparent focus:ring-1 focus:ring-blue-400"
                                />
                                {error && (
                                    <div title={error} className="ml-1">
                                        <Icons.ExclamationTriangle className="w-4 h-4 text-red-600" />
                                    </div>
                                )}
                            </div>
                        </td>
                    );
                })}
                <td className="border border-gray-300 px-2 py-1 text-sm text-right font-semibold">
                    {formatNumberForDisplay(monthlyTotal, 2)}
                </td>
            </tr>
        );
    };

    const renderSummaryRow = (
        key: string,
        label: string, 
        dailyTotalGetter: (dateString: string) => number, 
        rowStyle: string
    ) => {
        const monthlyTotal = daysInViewedMonth.reduce((sum, day) => sum + dailyTotalGetter(day.dateString), 0);
        return (
            <tr key={key} className={rowStyle}>
                <th scope="row" className="border border-gray-300 px-2 py-1 text-sm font-medium text-left sticky left-0 bg-inherit z-10">{label}</th>
                {daysInViewedMonth.map(({ dateString }) => (
                    <td key={dateString} className="border border-gray-300 px-2 py-1 text-sm text-right font-medium">
                        {formatNumberForDisplay(dailyTotalGetter(dateString), 2)}
                    </td>
                ))}
                <td className="border border-gray-300 px-2 py-1 text-sm text-right font-bold">
                    {formatNumberForDisplay(monthlyTotal, 2)}
                </td>
            </tr>
        );
    };

    if (!selectedBranch) {
        return <Card title="Gelir Girişi"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
    }

    return (
        <Card title={`Gelir Girişi (Şube: ${selectedBranch.Sube_Adi})`}
            actions={
                <div className="flex items-center space-x-2 hide-on-pdf">
                    {canPrint && (
                        <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                            <Icons.Print className="w-5 h-5" />
                        </Button>
                    )}
                    {canExportExcel && (
                        <Button onClick={handleExportToExcelForGelir} variant="ghost" size="sm" title="Excel'e Aktar">
                            <Icons.Download className="w-5 h-5" />
                        </Button>
                    )}
                    <Button onClick={handlePreviousPeriod} disabled={!canAccessHistory} size="sm" variant="secondary" title="Önceki Dönem">‹</Button>
                    <span className="font-semibold text-lg">{viewedPeriod}</span>
                    <Button onClick={handleNextPeriod} disabled={viewedPeriod === currentPeriod} size="sm" variant="secondary" title="Sonraki Dönem">›</Button>
                    {isEditingDisabled && <p className="text-sm text-red-500 ml-4">Bu dönem için veri girişi kapalıdır.</p>}
                </div>
            }
        >
             <div className="overflow-x-auto" id="gelir-content">
                <table className="min-w-full border-collapse border border-gray-300">
                    <colgroup>
                        <col style={{minWidth: '180px'}} />
                        {daysInViewedMonth.map(d => <col key={d.day} style={{minWidth: '120px'}} />)}
                        <col style={{minWidth: '120px'}} />
                    </colgroup>
                    <thead>
                        <tr className="bg-gray-100">
                            <th scope="col" className="border border-gray-300 px-2 py-2 text-left text-sm font-medium text-gray-600 sticky left-0 bg-gray-100 z-20">Gelir Kalemi</th>
                            {daysInViewedMonth.map(d => {
                                const error = dailyErrors[d.dateString];
                                return (
                                    <th 
                                        scope="col" 
                                        key={d.day} 
                                        className={`border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-600 transition-colors ${error ? 'bg-red-200' : ''}`}
                                    >
                                        <div className="flex items-center justify-center space-x-1">
                                            <span>{d.day}</span>
                                            {error && (
                                                <div title={error}>
                                                    <Icons.ExclamationTriangle className="w-4 h-4 text-red-600" />
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                            <th scope="col" className="border border-gray-300 px-2 py-2 text-sm font-medium text-gray-600">Aylık Toplam</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {renderDataRow(
                            'robotpos-tutar',
                            'RobotPos Tutar',
                            (dateString) => getGelirEkstraEntry(dateString, selectedBranch.Sube_ID)?.RobotPos_Tutar,
                            (dateString, value) => handleEkstraChange(dateString, 'RobotPos_Tutar', value),
                            'bg-blue-100',
                            true
                        )}
                        {renderDataRow(
                            'z-rapor-tutar',
                            'Z Rapor Tutar',
                            (dateString) => getGelirEkstraEntry(dateString, selectedBranch.Sube_ID)?.ZRapor_Tutar,
                            (dateString, value) => handleEkstraChange(dateString, 'ZRapor_Tutar', value),
                            'bg-yellow-100'
                        )}
                        
                        {Object.entries(gelirKategoriler.grouped).map(([ustKategoriAdi, kategoriler]) => (
                            <React.Fragment key={ustKategoriAdi}>
                                <tr className="bg-gray-200 font-semibold">
                                    <td className="border border-gray-300 px-2 py-1 text-sm font-medium text-left sticky left-0 bg-inherit z-10">
                                        {ustKategoriAdi}
                                    </td>
                                    {daysInViewedMonth.map(({ dateString }) => {
                                        const dailyUstKategoriTotal = kategoriler.reduce((sum, kategori) => {
                                            return sum + (getGelirEntry(kategori.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0);
                                        }, 0);
                                        return (
                                            <td key={dateString} className="border border-gray-300 px-2 py-1 text-sm text-right font-semibold">
                                                {formatNumberForDisplay(dailyUstKategoriTotal, 2)}
                                            </td>
                                        );
                                    })}
                                    <td className="border border-gray-300 px-2 py-1 text-sm text-right font-bold">
                                        {formatNumberForDisplay(
                                            kategoriler.reduce((monthlySum, kategori) => {
                                                return monthlySum + daysInViewedMonth.reduce((dailySum, day) => {
                                                    return dailySum + (getGelirEntry(kategori.Kategori_ID, day.dateString, selectedBranch.Sube_ID)?.Tutar || 0);
                                                }, 0);
                                            }, 0),
                                            2
                                        )}
                                    </td>
                                </tr>
                                {kategoriler.map(kategori => 
                                    renderDataRow(
                                        `kategori-${kategori.Kategori_ID}`,
                                        kategori.Kategori_Adi,
                                        (dateString) => getGelirEntry(kategori.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar,
                                        (dateString, value) => handleTutarChange(kategori.Kategori_ID, dateString, value),
                                        'bg-white hover:bg-gray-50'
                                    )
                                )}
                            </React.Fragment>
                        ))}
                        {gelirKategoriler.ungrouped.map(kategori => 
                            renderDataRow(
                                `kategori-ungrouped-${kategori.Kategori_ID}`,
                                kategori.Kategori_Adi,
                                (dateString) => getGelirEntry(kategori.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar,
                                (dateString, value) => handleTutarChange(kategori.Kategori_ID, dateString, value),
                                'bg-white hover:bg-gray-50'
                            )
                        )}

                        {renderSummaryRow(
                            'toplam-satis-gelirleri',
                            'Toplam Satış Gelirleri',
                            (dateString) => kategoriList.filter(k => k.Tip === 'Gelir' && k.Aktif_Pasif).reduce((sum, cat) => sum + (getGelirEntry(cat.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0), 0),
                            'bg-gray-200'
                        )}

                        {renderSummaryRow(
                            'gunluk-toplam-kategoriler',
                            'GÜNLÜK TOPLAM ',
                             (dateString) => {
                                const gelir = kategoriList.filter(k => k.Tip === 'Gelir' && k.Aktif_Pasif).reduce((sum, cat) => sum + (getGelirEntry(cat.Kategori_ID, dateString, selectedBranch.Sube_ID)?.Tutar || 0), 0);
                                const harcamaEFatura = getDailyTotal(dailyEFaturaTotals, dateString);
                                const harcamaDiger = getDailyTotal(dailyDigerHarcamaTotals, dateString);
                                return gelir - harcamaEFatura - harcamaDiger;
                             },
                            'bg-purple-200 text-purple-900 font-bold'
                        )}
                        {renderSummaryRow(
                            'gunluk-harcama-efatura',
                            'Günlük Harcama-eFatura',
                             (dateString) => getDailyTotal(dailyEFaturaTotals, dateString),
                            'bg-orange-200 text-orange-900 font-bold'
                        )}
                        {renderSummaryRow(
                            'gunluk-harcama-diger',
                            'Günlük Harcama-Diğer',
                             (dateString) => getDailyTotal(dailyDigerHarcamaTotals, dateString),
                            'bg-pink-200 text-pink-900 font-bold'
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- STOK PAGE ---
export const StokPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { stokList, addStok, updateStok } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStok, setEditingStok] = useState<Stok | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasPermission(STOK_TANIMLAMA_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Stok Tanımlama" />;
  }

  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddNew = () => {
    setEditingStok(null);
    setIsModalOpen(true);
  };
  const handleEdit = (stok: Stok) => {
    setEditingStok(stok);
    setIsModalOpen(true);
  };
  const handleToggleActive = (stok: Stok) => {
    updateStok(stok.Stok_ID, { ...stok, Aktif_Pasif: !stok.Aktif_Pasif });
  };
  const handleSubmit = async (data: StokFormData) => {
    let result;
    if (editingStok) {
      result = await updateStok(editingStok.Stok_ID, data);
    } else {
      const newStok: Stok = {
        ...data,
      };
      result = await addStok(newStok);
    }
    if (result && result.success) {
      setIsModalOpen(false);
      setEditingStok(null);
    } else if (result && result.message) {
      alert(result.message);
    } else if (result === null) {
      // fetchData returned null, meaning an alert was already shown by fetchData
      // No need to show another alert here, but we can log for debugging
      console.log("API call failed, message already displayed by fetchData.");
    } else {
      // Fallback for unexpected result structure
      alert("Beklenmedik bir hata oluştu.");
    }
  };

  const filteredStoklar = useMemo(() => {
    return stokList.filter(s => 
      s.Malzeme_Kodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.Malzeme_Aciklamasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.Urun_Grubu.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stokList, searchTerm]);

  const handleExportToExcelForStok = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredStoklar.map(stok => ({
        'Kod': stok.Malzeme_Kodu,
        'Açıklama': stok.Malzeme_Aciklamasi,
        'Grup': stok.Urun_Grubu,
        'Birim': stok.Birimi,
        'Sınıf': stok.Sinif || '-',
        'Aktif': stok.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Stok Listesi');
    XLSX.writeFile(wb, `Stok_Tanimlama.xlsx`);
  };

  return (
    <div className="space-y-6">
      <Card title="Stok Tanımlama" actions={
        <div className="flex items-center gap-3 hide-on-pdf">
            {canExportExcel && (
                <Button onClick={handleExportToExcelForStok} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
          <Input placeholder="Stok Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Button onClick={handleAddNew} leftIcon={<Icons.Add />}>Yeni Stok</Button>
        </div>
      }>
        <TableLayout headers={['Kod', 'Açıklama', 'Grup', 'Birim', 'Sınıf', 'Aktif', 'İşlemler']}>
          {filteredStoklar.map(stok => (
            <tr key={stok.Stok_ID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stok.Malzeme_Kodu}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stok.Malzeme_Aciklamasi}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stok.Urun_Grubu}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stok.Birimi}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stok.Sinif || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => handleToggleActive(stok)}><StatusBadge isActive={stok.Aktif_Pasif} /></button></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(stok)} leftIcon={<Icons.Edit />} />
              </td>
            </tr>
          ))}
        </TableLayout>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStok ? 'Stok Düzenle' : 'Yeni Stok Ekle'}>
        <StokForm initialData={editingStok} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

// --- STOK FIYAT PAGE ---
export const StokFiyatPage: React.FC = () => {
  const { stokFiyatList, addStokFiyat, updateStokFiyat, stokList } = useDataContext();
  const { hasPermission, selectedBranch } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFiyat, setEditingFiyat] = useState<StokFiyat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasPermission(STOK_FIYAT_TANIMLAMA_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Stok Fiyat Tanımlama" />;
  }

  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddNew = () => {
    setEditingFiyat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (fiyat: StokFiyat) => {
    setEditingFiyat(fiyat);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: StokFiyatFormData) => {
    if (!selectedBranch) {
      alert("Lütfen önce bir şube seçin.");
      return;
    }
    let result;
    const payload = { ...data, Sube_ID: selectedBranch.Sube_ID };

    if (editingFiyat) {
      result = await updateStokFiyat(editingFiyat.Fiyat_ID, payload);
    } else {
      result = await addStokFiyat(payload);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingFiyat(null);
    } else if (result && result.message) {
      alert(result.message);
    } else if (result === null) {
      console.log("API call failed, message already displayed by fetchData.");
    } else {
      alert("Beklenmedik bir hata oluştu.");
    }
  };

  const handleExportToExcelForStokFiyat = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredFiyatlar.map(fiyat => ({
        'Malzeme Kodu': fiyat.Malzeme_Kodu,
        'Malzeme Açıklaması': fiyat.Malzeme_Aciklamasi,
        'Başlangıç Tarihi': parseDateString(fiyat.Gecerlilik_Baslangic_Tarih),
        'Fiyat': fiyat.Fiyat,
        'Aktif': fiyat.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Stok Fiyat Listesi');
    XLSX.writeFile(wb, `Stok_Fiyat_Tanimlama.xlsx`);
  };

  const filteredFiyatlar = useMemo(() => {
    return stokFiyatList
      .filter(fiyat =>
        fiyat.Malzeme_Kodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiyat.Malzeme_Aciklamasi.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.Gecerlilik_Baslangic_Tarih).getTime() - new Date(a.Gecerlilik_Baslangic_Tarih).getTime());
  }, [stokFiyatList, searchTerm]);

  if (!selectedBranch) {
    return <Card title="Stok Fiyat Tanımlama"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card
        title="Stok Fiyat Tanımlama"
        actions={
          <div className="flex items-center gap-3">
            {canExportExcel && (
                <Button onClick={handleExportToExcelForStokFiyat} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input
              placeholder="Malzeme Kodu/Açıklaması Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleAddNew} leftIcon={<Icons.Add />} >Yeni Fiyat</Button>
          </div>
        }
      >
        <TableLayout headers={["Malzeme Kodu", "Malzeme Açıklaması", "Başlangıç Tarihi", "Fiyat", "Aktif", "İşlemler"]}>
          {filteredFiyatlar.map(fiyat => (
            <tr key={fiyat.Fiyat_ID}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fiyat.Malzeme_Kodu}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fiyat.Malzeme_Aciklamasi}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseDateString(fiyat.Gecerlilik_Baslangic_Tarih)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatTrCurrencyAdvanced(fiyat.Fiyat, 2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button onClick={() => { const { Fiyat_ID, ...rest } = fiyat; updateStokFiyat(Fiyat_ID, { ...rest, Aktif_Pasif: !fiyat.Aktif_Pasif }); }} className="focus:outline-none">
                  <StatusBadge isActive={fiyat.Aktif_Pasif} />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(fiyat)} leftIcon={<Icons.Edit />} />
              </td>
            </tr>
          ))}
        </TableLayout>
        {filteredFiyatlar.length === 0 && <p className="text-center py-4 text-gray-500">Kayıtlı fiyat bulunmamaktadır.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingFiyat ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle'}>
        <StokFiyatForm initialData={editingFiyat} stokList={stokList} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

// --- STOK SAYIM PAGE ---
export const StokSayimPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
    const { stokList, stokSayimList, addOrUpdateStokSayim, stokFiyatList } = useDataContext();

    if (!hasPermission(STOK_SAYIM_EKRANI_YETKI_ADI)) {
        return <AccessDenied title="Stok Sayım" />;
    }
    
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);
    const [viewedPeriod, setViewedPeriod] = useState(currentPeriod);
    const [isEditingDisabled, setIsEditingDisabled] = useState(false);
    
    useEffect(() => { setViewedPeriod(currentPeriod); }, [currentPeriod]);

    useEffect(() => {
        setIsEditingDisabled(!isPeriodEditable(viewedPeriod, currentPeriod));
    }, [viewedPeriod, currentPeriod]);

    const handlePreviousPeriod = () => setViewedPeriod(getPreviousPeriod(viewedPeriod));
    const handleNextPeriod = () => {
        const next = getNextPeriod(viewedPeriod);
        if (next.localeCompare(currentPeriod) <= 0) setViewedPeriod(next);
    };

    const getLatestPriceForPeriod = useCallback((malzemeKodu: string, periodYYAA: string): number => {
        const periodYear = 2000 + parseInt(periodYYAA.substring(0, 2));
        const periodMonth = parseInt(periodYYAA.substring(2, 4));
        const periodEndDate = new Date(periodYear, periodMonth, 0);

        const relevantPrices = stokFiyatList
            .filter(sf => sf.Malzeme_Kodu === malzemeKodu && new Date(parseDateString(sf.Gecerlilik_Baslangic_Tarih)) <= periodEndDate)
            .sort((a, b) => new Date(b.Gecerlilik_Baslangic_Tarih).getTime() - new Date(a.Gecerlilik_Baslangic_Tarih).getTime());

        return relevantPrices.length > 0 ? relevantPrices[0].Fiyat : 0;
    }, [stokFiyatList]);


    const getMiktarForStok = useCallback((malzemeKodu: string, period: string, subeId: number) => {
        return stokSayimList.find(s => s.Malzeme_Kodu === malzemeKodu && s.Donem === period && s.Sube_ID === subeId)?.Miktar;
    }, [stokSayimList]);

    const handleMiktarChange = (malzemeKodu: string, miktar: number | undefined) => {
        if (!selectedBranch) return;
        addOrUpdateStokSayim({
            Malzeme_Kodu: malzemeKodu,
            Donem: viewedPeriod,
            Miktar: miktar === undefined ? 0 : miktar,
            Sube_ID: selectedBranch.Sube_ID,
        });
    };

    const activeStokList = useMemo(() => stokList.filter(s => s.Aktif_Pasif), [stokList]);

    const groupedStokList = useMemo(() => {
        const groups: { [key: string]: Stok[] } = {};
        activeStokList.forEach(stok => {
            const groupName = stok.Urun_Grubu || 'Diğer';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(stok);
        });

        // Sort groups by name and items within each group by Malzeme_Kodu
        const sortedGroups = Object.keys(groups).sort().map(groupName => ({
            name: groupName,
            items: groups[groupName].sort((a, b) => a.Malzeme_Kodu.localeCompare(b.Malzeme_Kodu))
        }));

        return sortedGroups;
    }, [activeStokList]);

    const totalStokValue = useMemo(() => {
        if (!selectedBranch) return 0;
        return activeStokList.reduce((total, stok) => {
            const miktar = getMiktarForStok(stok.Malzeme_Kodu, viewedPeriod, selectedBranch.Sube_ID) || 0;
            const fiyat = getLatestPriceForPeriod(stok.Malzeme_Kodu, viewedPeriod);
            return total + (miktar * fiyat);
        }, 0);
    }, [activeStokList, viewedPeriod, selectedBranch, getMiktarForStok, getLatestPriceForPeriod]);
    
    const handleExportToExcelForStokSayim = () => {
        if (!selectedBranch) return;
    
        const wb = XLSX.utils.book_new();
        const ws_data: any[][] = [];
    
        // Header Row
        ws_data.push(['Kod', 'Açıklama', 'Birim', 'Miktar', 'Birim Fiyat', 'Toplam Tutar']);
    
        groupedStokList.forEach(group => {
            // Group Header Row
            const groupTotal = group.items.reduce((sum, stok) => {
                const miktar = getMiktarForStok(stok.Malzeme_Kodu, viewedPeriod, selectedBranch.Sube_ID) || 0;
                const fiyat = getLatestPriceForPeriod(stok.Malzeme_Kodu, viewedPeriod);
                return sum + (miktar * fiyat);
            }, 0);
            ws_data.push([group.name, '', '', '', '', groupTotal]);
    
            // Item Rows
            group.items.forEach(stok => {
                const miktar = getMiktarForStok(stok.Malzeme_Kodu, viewedPeriod, selectedBranch.Sube_ID) || 0;
                const fiyat = getLatestPriceForPeriod(stok.Malzeme_Kodu, viewedPeriod);
                const toplamTutar = miktar * fiyat;
                ws_data.push([
                    stok.Malzeme_Kodu,
                    stok.Malzeme_Aciklamasi,
                    stok.Birimi,
                    miktar,
                    fiyat,
                    toplamTutar
                ]);
            });
        });
    
        // Footer Row (Grand Total)
        ws_data.push(['', '', '', '', 'Genel Toplam', totalStokValue]);
    
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Stok Sayım Raporu');
        XLSX.writeFile(wb, `Stok_Sayim_${selectedBranch?.Sube_Adi}_${viewedPeriod}.xlsx`);
    };

    if (!selectedBranch) {
        return <Card title="Stok Sayım"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
    }
    
    return (
        <Card title={`Stok Sayım (Şube: ${selectedBranch.Sube_Adi})`} actions={
            <div className="flex items-center space-x-2">
                {canExportExcel && (
                    <Button onClick={handleExportToExcelForStokSayim} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <Button onClick={handlePreviousPeriod} size="sm" variant="secondary" disabled={isEditingDisabled}>‹</Button>
                <span className="font-semibold text-lg">{viewedPeriod}</span>
                <Button onClick={handleNextPeriod} disabled={viewedPeriod === currentPeriod} size="sm" variant="secondary">›</Button>
                {isEditingDisabled && <p className="text-sm text-red-500 ml-4">Bu dönem için veri girişi kapalıdır.</p>}
                <div className="pl-4 ml-4 border-l">
                    <span className="text-sm font-medium text-gray-600">Toplam Stok Değeri: </span>
                    <span className="font-bold text-lg text-blue-600">{formatTrCurrencyAdvanced(totalStokValue, 2)}</span>
                </div>
            </div>
        }>
            <TableLayout headers={['Kod', 'Açıklama', 'Birim', 'Miktar', 'Birim Fiyat', 'Toplam Tutar']}>
                {groupedStokList.map(group => (
                    <React.Fragment key={group.name}>
                        <tr className="bg-gray-100">
                            <td colSpan={5} className="px-6 py-2 text-left text-sm font-semibold text-gray-800">{group.name}</td>
                            <td className="px-6 py-2 text-right text-sm font-semibold text-gray-800">
                                {formatTrCurrencyAdvanced(group.items.reduce((sum, stok) => {
                                    const miktar = getMiktarForStok(stok.Malzeme_Kodu, viewedPeriod, selectedBranch.Sube_ID) || 0;
                                    const fiyat = getLatestPriceForPeriod(stok.Malzeme_Kodu, viewedPeriod);
                                    return sum + (miktar * fiyat);
                                }, 0), 2)}
                            </td>
                        </tr>
                        {group.items.map(stok => {
                            const miktar = getMiktarForStok(stok.Malzeme_Kodu, viewedPeriod, selectedBranch.Sube_ID);
                            const fiyat = getLatestPriceForPeriod(stok.Malzeme_Kodu, viewedPeriod);
                            const toplamTutar = (miktar || 0) * fiyat;
                            return (
                                <tr key={stok.Stok_ID}>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{stok.Malzeme_Kodu}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{stok.Malzeme_Aciklamasi}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{stok.Birimi}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm w-40">
                                        <NumberSpinnerInput
                                            value={miktar}
                                            onChange={(val) => handleMiktarChange(stok.Malzeme_Kodu, val)}
                                            precision={2}
                                            disabled={!isPeriodEditable(viewedPeriod, currentPeriod)}
                                        />
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatTrCurrencyAdvanced(fiyat, 2)}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">{formatTrCurrencyAdvanced(toplamTutar, 2)}</td>
                                </tr>
                            );
                        })}
                    </React.Fragment>
                ))}
            </TableLayout>
        </Card>
    );
};

// --- CALISAN PAGE ---
export const CalisanPage: React.FC = () => {
    const { selectedBranch, hasPermission } = useAppContext();
    const { calisanList, addCalisan, updateCalisan } = useDataContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCalisan, setEditingCalisan] = useState<Calisan | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const canPrint = hasPermission("Yazdırma Yetkisi");

    const handleGeneratePdf = () => {
        generateDashboardPdf('calisan-content', `Calisan_Yonetimi_${selectedBranch?.Sube_Adi}.pdf`);
    };

    if (!hasPermission(CALISAN_YONETIMI_EKRANI_YETKI_ADI)) {
        return <AccessDenied title="Çalışan Yönetimi" />;
    }

    const handleAddNew = () => {
        setEditingCalisan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (calisan: Calisan) => {
        setEditingCalisan(calisan);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData: CalisanFormData, tcNo: string) => {
        if (!selectedBranch) return;

        let result;
        if (editingCalisan) {
            result = await updateCalisan(tcNo, formData);
        } else {
            const newCalisan: Calisan = {
                ...formData,
                TC_No: tcNo,
                Sube_ID: selectedBranch.Sube_ID,
            };
            result = await addCalisan(newCalisan);
        }

        if (result && result.success) {
            setIsModalOpen(false);
        } else if (result && result.message) {
            alert(result.message);
        }
    };
    
    const handleToggleActive = (calisan: Calisan) => {
        const { Sube_ID, ...formData } = calisan;
        updateCalisan(calisan.TC_No, { ...formData, Aktif_Pasif: !calisan.Aktif_Pasif });
    };

    const filteredCalisanlar = useMemo(() => {
        if (!selectedBranch) return [];
        return calisanList
            .filter(c => c.Sube_ID === selectedBranch.Sube_ID)
            .filter(c => 
                c.Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.Soyadi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.TC_No.includes(searchTerm)
            );
    }, [calisanList, selectedBranch, searchTerm]);

    if (!selectedBranch) {
        return <Card title="Çalışan Yönetimi"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
    }
    
    return (
        <div className="space-y-6" id="calisan-content">
            <Card title={`Çalışan Yönetimi (Şube: ${selectedBranch.Sube_Adi})`} actions={
                <div className="flex items-center gap-3 hide-on-pdf">
                    {canPrint && (
                        <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                            <Icons.Print className="w-5 h-5" />
                        </Button>
                    )}
                    <Input placeholder="Çalışan Ara (Ad, Soyad, TC)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Button onClick={handleAddNew} leftIcon={<Icons.Add />}>Yeni Çalışan</Button>
                </div>
            }>
                <TableLayout headers={['TC No', 'Adı Soyadı', 'Net Maaş', 'Sigorta Giriş', 'Sigorta Çıkış', 'Aktif', 'İşlemler']}>
                    {filteredCalisanlar.map(calisan => (
                        <tr key={calisan.TC_No}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{calisan.TC_No}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calisan.Adi} {calisan.Soyadi}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatTrCurrencyAdvanced(calisan.Net_Maas)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calisan.Sigorta_Giris ? parseDateString(calisan.Sigorta_Giris) : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calisan.Sigorta_Cikis ? parseDateString(calisan.Sigorta_Cikis) : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => handleToggleActive(calisan)}><StatusBadge isActive={calisan.Aktif_Pasif} /></button></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(calisan)} leftIcon={<Icons.Edit />} />
                            </td>
                        </tr>
                    ))}
                </TableLayout>
                {filteredCalisanlar.length === 0 && <p className="text-center py-4 text-gray-500">Bu şubede çalışan bulunamadı.</p>}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCalisan ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}>
                <CalisanForm
                    initialData={editingCalisan}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isEditMode={!!editingCalisan}
                />
            </Modal>
        </div>
    );
};

// --- PUANTAJ SECIM PAGE ---
export const PuantajSecimPage: React.FC = () => {
    const { hasPermission } = useAppContext();
    const { puantajSecimiList, addPuantajSecimi, updatePuantajSecimi } = useDataContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSecim, setEditingSecim] = useState<PuantajSecimi | null>(null);

    if (!hasPermission(PUANTAJ_SECIM_YONETIMI_EKRANI_YETKI_ADI)) {
        return <AccessDenied title="Puantaj Seçim Yönetimi" />;
    }
    
    const handleAddNew = () => {
        setEditingSecim(null);
        setIsModalOpen(true);
    };

    const handleEdit = (secim: PuantajSecimi) => {
        setEditingSecim(secim);
        setIsModalOpen(true);
    };
    
    const handleSubmit = async (data: PuantajSecimiFormData) => {
        let result;
        if (editingSecim) {
            result = await updatePuantajSecimi(editingSecim.Secim_ID, data);
        } else {
            const newSecim: PuantajSecimi = {
                Secim_ID: Date.now(), // Mock ID
                ...data,
            };
            result = await addPuantajSecimi(newSecim);
        }
        if (result.success) {
            setIsModalOpen(false);
        } else {
            alert(result.message || 'Beklenmedik bir hata oluştu.');
        }
    };
    
    const handleToggleActive = (secim: PuantajSecimi) => {
        updatePuantajSecimi(secim.Secim_ID, { ...secim, Aktif_Pasif: !secim.Aktif_Pasif });
    };
    
    return (
        <div className="space-y-6">
            <Card title="Puantaj Seçim Yönetimi" actions={
                <Button onClick={handleAddNew} leftIcon={<Icons.Add />}>Yeni Seçim</Button>
            }>
                <TableLayout headers={['ID', 'Seçim Adı', 'Değeri', 'Renk', 'Aktif', 'İşlemler']}>
                    {puantajSecimiList.map(secim => (
                        <tr key={secim.Secim_ID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{secim.Secim_ID}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{secim.Secim}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{secim.Degeri.toFixed(1)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 rounded border" style={{ backgroundColor: secim.Renk_Kodu }}></div>
                                    <span>{secim.Renk_Kodu}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><button onClick={() => handleToggleActive(secim)}><StatusBadge isActive={secim.Aktif_Pasif} /></button></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(secim)} leftIcon={<Icons.Edit />} />
                            </td>
                        </tr>
                    ))}
                </TableLayout>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSecim ? 'Seçim Düzenle' : 'Yeni Seçim Ekle'}>
                <PuantajSecimiForm initialData={editingSecim} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

// --- PUANTAJ PAGE ---
export const PuantajPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
    const { calisanList, puantajSecimiList, puantajList, getPuantajEntry, addOrUpdatePuantajEntry } = useDataContext();

    const [viewedPeriod, setViewedPeriod] = useState(currentPeriod);
    const [isEditingDisabled, setIsEditingDisabled] = useState(false);
    const [popoverState, setPopoverState] = useState<{ tcNo: string; dateString: string; top: number; left: number } | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const overflowContainerRef = useRef<HTMLDivElement>(null); // Added

    if (!hasPermission(PUANTAJ_GIRISI_EKRANI_YETKI_ADI)) {
        return <AccessDenied title="Puantaj Girişi" />;
    }
    const canAccessHistory = hasPermission(PUANTAJ_HISTORY_ACCESS_YETKI_ADI);
    const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

    const handleExportToExcelForPuantaj = () => {
        if (!selectedBranch) return;
    
        const wb = XLSX.utils.book_new();
        const ws_data: any[][] = [];
    
        // Header Row
        const header = ['Çalışan'];
        daysInViewedMonth.forEach(d => header.push(String(d.day)));
        header.push('Toplam');
        ws_data.push(header);
    
        // Data Rows
        activeCalisanlar.forEach(calisan => {
            const row = [`${calisan.Adi} ${calisan.Soyadi}`];
            let calisanTotal = 0;
            daysInViewedMonth.forEach(day => {
                const entry = getPuantajEntry(calisan.TC_No, day.dateString, selectedBranch.Sube_ID);
                const secim = entry ? puantajSecimiList.find(s => s.Secim_ID === entry.Secim_ID) : null;
                const degeri = secim ? secim.Degeri : 0;
                calisanTotal += degeri;
                row.push(secim ? secim.Secim : '--');
            });
            row.push(calisanTotal.toFixed(1));
            ws_data.push(row);
        });

        // Empty row separator
        ws_data.push([]);

        // Legend Data
        ws_data.push(['Lejant']);
        legendData.forEach(item => {
            ws_data.push([`${item.Secim} (${item.Degeri.toFixed(1)})`]);
        });

    
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [{ wch: 30 }]; // Set width for the first column
        XLSX.utils.book_append_sheet(wb, ws, 'Puantaj Raporu');
    
        XLSX.writeFile(wb, `Puantaj_Raporu_${selectedBranch?.Sube_Adi}_${viewedPeriod}.xlsx`);
    };

    const handleGeneratePdf = async () => {
        if (!selectedBranch) return;

        // Create a temporary div to render the full table
        const tempDiv = document.createElement('div');
        tempDiv.id = 'puantaj-full-content';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px'; // Move off-screen
        tempDiv.style.width = 'max-content'; // Allow content to expand
        document.body.appendChild(tempDiv);

        // Reconstruct the table HTML with all days
        let tableHtml = `
            <table style="border-collapse: collapse;">
                <thead style="background-color: #f7fafc;">
                    <tr>
                        <th style="padding: 4px 8px; text-align: left; font-size: 10px; font-weight: 500; color: #718096; border: 1px solid #e2e8f0; min-width: 120px;">Çalışan</th>
                        ${daysInViewedMonth.map(d => `<th style="padding: 4px; text-align: center; font-size: 10px; font-weight: 500; color: #718096; border: 1px solid #e2e8f0; width: 32px;">${d.day}</th>`).join('')}
                        <th style="padding: 4px 8px; text-align: center; font-size: 10px; font-weight: 500; color: #718096; border: 1px solid #e2e8f0; min-width: 50px;">Toplam</th>
                    </tr>
                </thead>
                <tbody style="background-color: #ffffff;">
                    ${activeCalisanlar.map(calisan => {
                        let calisanTotal = 0;
                        const cellsHtml = daysInViewedMonth.map(day => {
                            const entry = getPuantajEntry(calisan.TC_No, day.dateString, selectedBranch.Sube_ID);
                            const secim = entry ? puantajSecimiList.find(s => s.Secim_ID === entry.Secim_ID) : null;
                            const degeri = secim ? secim.Degeri : 0;
                            calisanTotal += degeri;
                            const bgColor = secim ? secim.Renk_Kodu : '#FFFFFF';
                            const textColor = secim ? getTextColorForBackground(secim.Renk_Kodu) : '#4B5563';
                            return `
                                <td style="border: 1px solid #e2e8f0; padding: 0; text-align: center; vertical-align: middle;">
                                    <div style="background-color: ${bgColor}; color: ${textColor}; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 10px;">
                                        ${secim ? secim.Secim : '--'}
                                    </div>
                                </td>
                            `;
                        }).join('');
                        return `
                            <tr>
                                <td style="padding: 4px 8px; white-space: nowrap; font-size: 11px; font-weight: 500; color: #4a5568; border: 1px solid #e2e8f0;">${calisan.Adi} ${calisan.Soyadi}</td>
                                ${cellsHtml}
                                <td style="padding: 4px 8px; white-space: nowrap; font-size: 11px; text-align: center; font-weight: 600; border: 1px solid #e2e8f0;">
                                    ${calisanTotal.toFixed(1)}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div style="margin-top: 16px; display: block;">
                ${legendData.map(item => `
                    <div style="display: inline-block; border: 1px solid #ccc; padding: 4px 8px; margin: 4px; border-radius: 4px; font-size: 10px;">
                        <div style="display: inline-block; width: 12px; height: 12px; background-color: ${item.Renk_Kodu}; margin-right: 6px; vertical-align: middle;"></div>
                        <span style="color: #374151; vertical-align: middle;">${item.Secim} (${item.Degeri.toFixed(1)})</span>
                    </div>
                `).join('')}
            </div>
        `;
        tempDiv.innerHTML = tableHtml;

        try {
            await generateDashboardPdf('puantaj-full-content', `Puantaj_Giris_${selectedBranch?.Sube_Adi}_${viewedPeriod}.pdf`);
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    useEffect(() => { setViewedPeriod(currentPeriod); }, [currentPeriod]);
    
    useEffect(() => {
        const today = new Date();
        const currentDayOfMonth = today.getDate();
        const previousPeriod = getPreviousPeriod(currentPeriod);

        let disable = false;
        if (viewedPeriod === currentPeriod) {
            disable = false; // Always allow editing for the current month
        } else if (viewedPeriod === previousPeriod) {
            // Allow editing previous month only during the first 5 days of the current month
            disable = currentDayOfMonth > 5;
        } else {
            disable = true; // Disable editing for all other past months
        }

        setIsEditingDisabled(disable);
    }, [viewedPeriod, currentPeriod, canAccessHistory]);

    const availablePeriods = useMemo(() => {
        const periods = new Set<string>();
        periods.add(currentPeriod);
        if (canAccessHistory) {
            let tempPeriod = currentPeriod;
            for (let i = 0; i < 24; i++) { // Go back 2 years
                tempPeriod = getPreviousPeriod(tempPeriod);
                periods.add(tempPeriod);
            }
        }
        return Array.from(periods).sort((a,b) => b.localeCompare(a));
    }, [currentPeriod, canAccessHistory]);

    const activeCalisanlar = useMemo(() => {
        if (!selectedBranch) return [];
        return calisanList.filter(c => {
            if (c.Sube_ID !== selectedBranch.Sube_ID || !c.Aktif_Pasif) {
                return false;
            }
            if (c.Sigorta_Cikis) {
                const cikisPeriod = calculatePeriod(parseDateString(c.Sigorta_Cikis));
                if (cikisPeriod < viewedPeriod) {
                    return false;
                }
            }
            return true;
        })
        .sort((a, b) => a.Adi.localeCompare(b.Adi));
    }, [calisanList, selectedBranch, viewedPeriod]);

    const daysInViewedMonth = useMemo(() => {
        if (!viewedPeriod) return [];
        const numDays = getDaysInMonth(viewedPeriod);
        const year = 2000 + parseInt(viewedPeriod.substring(0, 2));
        const month = parseInt(viewedPeriod.substring(2, 4));
        return Array.from({ length: numDays }, (_, i) => ({
            day: i + 1,
            dateString: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
        }));
    }, [viewedPeriod]);

    const activeSecimler = useMemo(() => puantajSecimiList.filter(s => s.Aktif_Pasif), [puantajSecimiList]);

    const legendData = useMemo(() => {
        if (!selectedBranch || !viewedPeriod) return [];
        const counts = new Map<number, number>();
        activeSecimler.forEach(s => counts.set(s.Secim_ID, 0));

        puantajList
            .filter(p => p.Sube_ID === selectedBranch.Sube_ID && calculatePeriod(p.Tarih) === viewedPeriod)
            .forEach(p => {
                if (counts.has(p.Secim_ID)) {
                    counts.set(p.Secim_ID, counts.get(p.Secim_ID)! + 1);
                }
            });
        
        return activeSecimler.map(secim => ({
            ...secim,
            count: counts.get(secim.Secim_ID) || 0
        })).sort((a,b) => a.Secim.localeCompare(b.Secim));
    }, [puantajList, activeSecimler, viewedPeriod, selectedBranch]);

    const handleCellClick = (event: React.MouseEvent, tcNo: string, dateString: string) => {
        if (isEditingDisabled) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to start of day

        const cellDate = new Date(dateString);
        cellDate.setHours(0, 0, 0, 0); // Normalize cellDate to start of day

        if (cellDate > today) {
            alert("Gelecek tarihlere puantaj girişi yapılamaz.");
            return;
        }

        const calisan = calisanList.find(c => c.TC_No === tcNo);
        if (calisan) {
            if (calisan.Sigorta_Giris) {
                const girisDate = new Date(parseDateString(calisan.Sigorta_Giris));
                girisDate.setHours(0, 0, 0, 0);
                if (cellDate < girisDate) {
                    alert("Çalışanın sigorta giriş tarihinden öncesine puantaj girişi yapılamaz.");
                    return;
                }
            }
            if (calisan.Sigorta_Cikis) {
                const cikisDate = new Date(parseDateString(calisan.Sigorta_Cikis));
                cikisDate.setHours(0, 0, 0, 0);
                if (cellDate > cikisDate) {
                    alert("Çalışanın sigorta çıkış tarihinden sonrasına puantaj girişi yapılamaz.");
                    return;
                }
            }
        }

        const cell = event.currentTarget as HTMLElement;
        const popoverWidth = 200;
    
        if (popoverState && popoverState.tcNo === tcNo && popoverState.dateString === dateString) {
            setPopoverState(null);
            return;
        }

        const container = tableContainerRef.current;
        if (!container) return;

        const cellRect = cell.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        let left = cellRect.left - containerRect.left;
        let top = cellRect.bottom - containerRect.top;
        
        if (left + popoverWidth > container.clientWidth) {
            left = cellRect.right - containerRect.left - popoverWidth;
        }

        setPopoverState({ tcNo, dateString, top, left });
    };

    const handlePopoverSelect = (secimId: number | null) => {
        if (!popoverState || !selectedBranch) return;
        addOrUpdatePuantajEntry({ TC_No: popoverState.tcNo, Tarih: popoverState.dateString, Secim_ID: secimId, Sube_ID: selectedBranch.Sube_ID });
        setPopoverState(null);
    };

    const PuantajCellPopover = ({ activeSecimler, onSelect, onClose }: { activeSecimler: PuantajSecimi[], onSelect: (id: number | null) => void, onClose: () => void }) => {
        const popoverRef = useRef<HTMLDivElement>(null);
    
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [onClose]);
    
        return (
            <div ref={popoverRef} className="absolute z-20 bg-white shadow-xl rounded-lg p-2 border border-gray-300 w-48 max-h-60 overflow-y-auto">
                 <ul className="space-y-1">
                    <li>
                        <button onClick={() => onSelect(null)} className="w-full text-left text-sm px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors">
                            -- Boş --
                        </button>
                    </li>
                    {activeSecimler.map(secim => (
                         <li key={secim.Secim_ID}>
                            <button onClick={() => onSelect(secim.Secim_ID)} className="w-full text-left text-sm px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-2">
                                 <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: secim.Renk_Kodu }} />
                                 <span>{secim.Secim}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    
    if (!selectedBranch) {
        return <Card title="Puantaj Girişi"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
    }

    return (
      <div className="space-y-4" id="puantaj-content">
        <Card title={`Puantaj Girişi (Şube: ${selectedBranch.Sube_Adi})`} actions={
            <div className="flex items-center space-x-2 hide-on-pdf">
                {canPrint && (
                    <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                        <Icons.Print className="w-5 h-5" />
                    </Button>
                )}
                {canExportExcel && (
                    <Button onClick={handleExportToExcelForPuantaj} variant="ghost" size="sm" title="Excel'e Aktar">
                        <Icons.Download className="w-5 h-5" />
                    </Button>
                )}
                <label htmlFor="puantaj-period-select" className="text-sm font-medium text-gray-700">Dönem:</label>
                <Select
                  id="puantaj-period-select"
                  value={viewedPeriod}
                  onChange={(e) => setViewedPeriod(e.target.value)}
                  className="w-28 text-sm py-1.5"
                >
                  {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
            </div>
        }>
            <div className="relative" ref={tableContainerRef}>
              <div className="overflow-x-auto border border-gray-200 rounded-lg" ref={overflowContainerRef}>
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th scope="col" className="sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Çalışan</th>
                              {daysInViewedMonth.map(d => <th key={d.day} scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">{d.day}</th>)}
                              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[100px]">Toplam</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {activeCalisanlar.map(calisan => (
                              <tr key={calisan.TC_No}>
                                  <td className="sticky left-0 bg-white px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-800">{calisan.Adi} {calisan.Soyadi}</td>
                                  {(() => {
                                      let calisanTotal = 0;
                                      const cells = daysInViewedMonth.map(day => {
                                          const entry = getPuantajEntry(calisan.TC_No, day.dateString, selectedBranch.Sube_ID);
                                          const secim = entry ? puantajSecimiList.find(s => s.Secim_ID === entry.Secim_ID) : null;
                                          const bgColor = secim ? secim.Renk_Kodu : '#FFFFFF';
                                          const textColor = secim ? getTextColorForBackground(secim.Renk_Kodu) : '#4B5563';
                                          const degeri = secim ? secim.Degeri : 0;
                                          calisanTotal += degeri;
                                          return (
                                              <td key={day.dateString} className="p-0 whitespace-nowrap">
                                                  <button
                                                      onClick={(e) => handleCellClick(e, calisan.TC_No, day.dateString)}
                                                      disabled={isEditingDisabled}
                                                      className="w-full h-full text-xs text-center transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-70"
                                                      style={{ backgroundColor: bgColor, color: textColor, width: '2.5rem', height: '2.5rem' }}
                                                  >
                                                      {secim ? secim.Secim : '--'}
                                                  </button>
                                              </td>
                                          );
                                      });
                                      cells.push(
                                          <td key="total" className="px-1 py-1 whitespace-nowrap text-sm text-center font-semibold">
                                              {calisanTotal.toFixed(1)}
                                          </td>
                                      );
                                      return cells;
                                  })()}
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {activeCalisanlar.length === 0 && <p className="text-center py-4 text-gray-500">Bu şubede gösterilecek aktif çalışan bulunamadı.</p>}
              </div>
              {popoverState && (
                  <div style={{ position: 'absolute', top: `${popoverState.top}px`, left: `${popoverState.left}px` }}>
                      <PuantajCellPopover
                          activeSecimler={activeSecimler}
                          onSelect={handlePopoverSelect}
                          onClose={() => setPopoverState(null)}
                      />
                  </div>
              )}
            </div>
        </Card>
        
        <Card>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {legendData.map(item => (
                <div key={item.Secim_ID} className="flex items-center space-x-2 text-sm">
                   <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: item.Renk_Kodu }}></div>
                   <span className="text-gray-700">{item.Secim} ({item.Degeri.toFixed(1)})</span>
                </div>
              ))}
            </div>
        </Card>
      </div>
    );
};


// --- E-FATURA REFERANS YÖNETİMİ PAGE ---
export const EFaturaReferansPage: React.FC = () => {
  const { eFaturaReferansList, addEFaturaReferans, updateEFaturaReferans, deleteEFaturaReferans } = useDataContext();
  const { kategoriList } = useDataContext();
  const { hasPermission } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReferans, setEditingReferans] = useState<EFaturaReferansFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Permissions check (assuming a permission for this page exists)
  // if (!hasPermission(E_FATURA_REFERANS_YONETIMI_EKRANI_YETKI_ADI)) {
  //     return <AccessDenied title="e-Fatura Referans Yönetimi" />;
  // }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddReferans = () => {
    setEditingReferans(null);
    setIsModalOpen(true);
  };

  const handleEditReferans = (referans: EFaturaReferans) => {
    setEditingReferans({ ...referans });
    setIsModalOpen(true);
  };

  const handleDeleteReferans = async (aliciUnvani: string) => {
    if (window.confirm(`Are you sure you want to delete ${aliciUnvani}?`)) {
      const result = await deleteEFaturaReferans(aliciUnvani);
      if (result && result.success) {
        alert("Referans başarıyla silindi.");
      } else if (result && result.message) {
        alert(result.message);
      } else {
        alert("Referans silinirken bir hata oluştu.");
      }
    }
  };

  const handleSubmit = async (data: EFaturaReferansFormData) => {
    let result;
    if (editingReferans && editingReferans.Alici_Unvani) {
      result = await updateEFaturaReferans(editingReferans.Alici_Unvani, data);
    } else {
      result = await addEFaturaReferans(data);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingReferans(null);
    } else if (result && result.message) {
      alert(result.message);
    }
  };

  const filteredReferanslar = useMemo(() => {
    return eFaturaReferansList.filter(ref =>
      ref.Alici_Unvani.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.Aciklama && ref.Aciklama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kategoriList.find(k => k.Kategori_ID === ref.Kategori_ID)?.Kategori_Adi || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [eFaturaReferansList, searchTerm, kategoriList]);

  const handleGeneratePdf = () => {
    generateDashboardPdf('efatura-referans-yonetimi-content', `EFatura_Referans_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredReferanslar.map(referans => ({
        'Alıcı Ünvanı': referans.Alici_Unvani,
        'Referans Kodu': referans.Referans_Kodu,
        'Kategori': kategoriList.find(k => k.Kategori_ID === referans.Kategori_ID)?.Kategori_Adi || '-',
        'Açıklama': referans.Aciklama || '-',
        'Aktif': referans.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 50 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'e-Fatura Referans Listesi');
    XLSX.writeFile(wb, `EFatura_Referans_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="efatura-referans-yonetimi-content">
      <Card
        title="e-Fatura Referans Yönetimi"
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input
              placeholder="Alıcı Ünvanı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Button onClick={handleAddReferans} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Referans</Button>
          </div>
        }
      >
        <TableLayout headers={['ALICI ÜNVAANI', 'KATEGORI', 'İŞLEMLER']} compact={true}>
          {filteredReferanslar.map((referans) => {
            const kategoriAdi = kategoriList.find(k => k.Kategori_ID === referans.Kategori_ID)?.Kategori_Adi || '-';
            return (
              <tr key={referans.Alici_Unvani}>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm text-gray-900">{referans.Alici_Unvani}</td>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm text-gray-500">{kategoriAdi}</td>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm font-medium flex items-center justify-center space-x-0.5">
                  <Button variant="ghost" size="sm" onClick={() => handleEditReferans(referans)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" className="p-1" />
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteReferans(referans.Alici_Unvani)} leftIcon={<Icons.Delete className="w-4 h-4 text-red-500" />} title="Sil" className="p-1" />
                </td>
              </tr>
            );
          })}
        </TableLayout>
        {filteredReferanslar.length === 0 && <p className="text-center py-4 text-gray-500">Arama kriterlerine uygun referans bulunamadı.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingReferans ? 'e-Fatura Referans Düzenle' : 'Yeni e-Fatura Referans Ekle'}>
        <EFaturaReferansForm initialData={editingReferans} kategoriler={kategoriList} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

// --- AVANS TALEBİ PAGE ---
export const AvansPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { avansIstekList, addOrUpdateAvansIstek, deleteAvansIstek, getAvansIstek, calisanList, fetchAvansIsteklerByPeriod } = useDataContext();
  const { selectedBranch, currentPeriod } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvans, setEditingAvans] = useState<AvansIstekFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterPeriod, setSelectedFilterPeriod] = useState(currentPeriod); // New state for filter period
  const canPrint = hasPermission("Yazdırma Yetkisi");

  const handleGeneratePdf = () => {
    generateDashboardPdf('avans-content', `Avans_Talepleri_${selectedBranch?.Sube_Adi}_${selectedFilterPeriod}.pdf`);
  };

  // Determine if the currently selected filter period is editable
  const isCurrentPeriodEditable = useMemo(() => {
    return selectedFilterPeriod === currentPeriod;
  }, [selectedFilterPeriod, currentPeriod]);

  // Generate available periods for the filter dropdown
  const availableFilterPeriods = useMemo(() => {
    const periods: string[] = [];
    let tempPeriod = currentPeriod;
    for (let i = 0; i < 12; i++) { // Show current and 11 past periods
      periods.push(tempPeriod);
      tempPeriod = getPreviousPeriod(tempPeriod);
    }
    return periods.sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [currentPeriod]);

  useEffect(() => {
    // Ensure selectedFilterPeriod is always a valid period, default to current if not
    if (!availableFilterPeriods.includes(selectedFilterPeriod)) {
      setSelectedFilterPeriod(currentPeriod);
    }
    // Fetch avans requests for the selected period and branch
    if (selectedBranch && selectedFilterPeriod) {
      fetchAvansIsteklerByPeriod(selectedFilterPeriod, selectedBranch.Sube_ID);
    }
  }, [currentPeriod, availableFilterPeriods, selectedFilterPeriod, selectedBranch, fetchAvansIsteklerByPeriod]);

  if (!hasPermission(AVANS_TALEBI_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Avans Talebi" />;
  }

  const handleAddAvans = () => {
    if (!isCurrentPeriodEditable) {
      alert("Geçmiş döneme avans ekleyemezsiniz.");
      return;
    }
    setEditingAvans(null);
    setIsModalOpen(true);
  };

  const handleEditAvans = (avans: AvansIstek) => {
    if (!isCurrentPeriodEditable) {
      alert("Geçmiş döneme ait avansları düzenleyemezsiniz.");
      return;
    }
    setEditingAvans({ ...avans, Tutar: formatAvansTutarForDisplay(avans.Tutar) });
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: AvansIstekFormData) => {
    if (!selectedBranch) {
      alert("Lütfen bir şube seçin.");
      return;
    }
    if (!currentPeriod) {
      alert("Lütfen bir dönem seçin.");
      return;
    }
    if (!isCurrentPeriodEditable) {
      alert("Geçmiş döneme avans ekleyemez/düzenleyemezsiniz.");
      return;
    }

    const payload = {
      ...data,
      Donem: parseInt(currentPeriod),
      Sube_ID: selectedBranch.Sube_ID,
      Tutar: parseAvansTutarForStorage(data.Tutar as string), // Ensure Tutar is number for API
    };

    let result;
    if (editingAvans && editingAvans.Avans_ID) {
      result = await addOrUpdateAvansIstek({ ...payload, Avans_ID: editingAvans.Avans_ID });
    } else {
      result = await addOrUpdateAvansIstek(payload);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingAvans(null);
    } else if (result && result.message) {
      alert(result.message);
    }
  };

  const handleDeleteAvans = async (tcNo: string, donem: number, subeId: number) => {
    if (!isCurrentPeriodEditable) {
      alert("Geçmiş döneme ait avansları silemezsiniz.");
      return;
    }
    if (window.confirm("Bu avans talebini silmek istediğinizden emin misiniz?")) {
      const result = await deleteAvansIstek(tcNo, donem, subeId);
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };

  const filteredAvanslar = useMemo(() => {
    if (!selectedBranch) return [];

    return avansIstekList.filter(avans =>
      avans.Sube_ID === selectedBranch.Sube_ID &&
      String(avans.Donem) === selectedFilterPeriod &&
      (calisanList.find(c => c.TC_No === avans.TC_No)?.Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
       calisanList.find(c => c.TC_No === avans.TC_No)?.Soyadi.toLowerCase().includes(searchTerm.toLowerCase()) ||
       avans.Aciklama?.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => new Date(b.Kayit_Tarihi).getTime() - new Date(a.Kayit_Tarihi).getTime());
  }, [avansIstekList, selectedBranch, currentPeriod, calisanList, searchTerm]);

  return (
    <div className="space-y-6" id="avans-content">
      <Card
        title={`Avans Talepleri (Şube: ${selectedBranch?.Sube_Adi || 'Seçilmedi'}, Dönem: ${selectedFilterPeriod})`}
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            <Input
              placeholder="Çalışan veya açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Select
              value={selectedFilterPeriod}
              onChange={(e) => setSelectedFilterPeriod(e.target.value)}
              className="text-sm py-1.5"
            >
              {availableFilterPeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </Select>
            <Button onClick={handleAddAvans} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3" disabled={!isCurrentPeriodEditable}>Yeni Avans</Button>
          </div>
        }
      >
        <TableLayout headers={['ID', 'Dönem', 'Çalışan', 'Tutar', 'Açıklama', 'Kayıt Tarihi', 'İşlemler']} compact={true}>
          {filteredAvanslar.map((avans) => {
            const calisan = calisanList.find(c => c.TC_No === avans.TC_No);
            const calisanAdiSoyadi = calisan ? `${calisan.Adi} ${calisan.Soyadi}` : avans.TC_No;
            return (
              <tr key={avans.Avans_ID}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{avans.Avans_ID}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{avans.Donem}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{calisanAdiSoyadi}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{formatTrCurrencyAdvanced(avans.Tutar, 2)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={avans.Aciklama}>{avans.Aciklama || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(avans.Kayit_Tarihi).toLocaleDateString('tr-TR')}</td>
                <td className="px-2 py-1 whitespace-nowrap text-sm font-medium flex space-x-1 justify-center">
                  <Button variant="ghost" size="sm" onClick={() => handleEditAvans(avans)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" className="p-1" disabled={!isCurrentPeriodEditable} />
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAvans(avans.TC_No, avans.Donem, avans.Sube_ID)} leftIcon={<Icons.Delete className="w-4 h-4 text-red-500" />} title="Sil" className="p-1" disabled={!isCurrentPeriodEditable} />
                </td>
              </tr>
            );
          })}
        </TableLayout>
        {filteredAvanslar.length === 0 && <p className="text-center py-4 text-gray-500">Bu dönem için avans talebi bulunmamaktadır.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAvans ? 'Avans Talebi Düzenle' : 'Yeni Avans Talebi Ekle'}>
        <AvansIstekForm initialData={editingAvans} calisanList={calisanList} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export const NakitPage: React.FC = () => {
  const { hasPermission, currentPeriod, selectedBranch } = useAppContext();
  const { nakitList, addNakit, updateNakit, deleteNakit } = useDataContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNakit, setEditingNakit] = useState<NakitFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const canPrint = hasPermission("Yazdırma Yetkisi");

  const handleGeneratePdf = () => {
    generateDashboardPdf('nakit-content', `Nakit_Girisleri_${selectedBranch?.Sube_Adi}.pdf`);
  };

  useEffect(() => {
    console.log("NakitPage - nakitList changed:", nakitList);
  }, [nakitList]);

  if (!hasPermission(NAKIT_GIRISI_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Nakit Girişi" />;
  }

  const handleAddNakit = () => {
    setEditingNakit(null);
    setIsModalOpen(true);
  };

  const handleEditNakit = (nakit: Nakit) => {
    setEditingNakit({ ...nakit, Tutar: nakit.Tutar.toString() }); // Convert Decimal to string for form
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: NakitFormData) => {
    const branchId = selectedBranch?.Sube_ID || 1;

    const formData = new FormData();
    formData.append('tarih', data.Tarih);
    formData.append('tutar', data.Tutar.toString());
    formData.append('tip', data.Tip || "Bankaya Yatan");
    formData.append('donem', data.Donem.toString()); // Use the period from the form data
    formData.append('sube_id', branchId.toString());
    if (data.Imaj instanceof File) {
      formData.append('imaj', data.Imaj);
      formData.append('imaj_adi', data.Imaj.name);
    } else if (data.Imaj_Adı === "") { // Explicitly clear image
      formData.append('imaj_adi', "");
    }

    let result;
    if (editingNakit && editingNakit.Nakit_ID) {
      result = await updateNakit(editingNakit.Nakit_ID, formData);
    } else {
      result = await addNakit(formData);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingNakit(null);
    } else if (result && result.message) {
      alert(`Nakit girişi güncellenirken bir hata oluştu: ${result.message}`);
    } else {
        alert("Nakit girişi güncellenirken bilinmeyen bir hata oluştu.");
    }
  };

  const handleDeleteNakit = async (nakitId: number) => {
    if (window.confirm("Bu nakit girişini silmek istediğinizden emin misiniz?")) {
      const result = await deleteNakit(nakitId);
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
  };

  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState(currentPeriod.toString());

  const availablePeriods = useMemo(() => {
    const periods = new Set((nakitList || []).map(nakit => String(nakit.Donem)));
    periods.add(currentPeriod.toString());
    const allPeriods = Array.from(periods).sort((a, b) => b.localeCompare(a));
    return ["", ...allPeriods];
  }, [nakitList, currentPeriod]);

  useEffect(() => {
    if (!availablePeriods.includes(selectedPeriodFilter)) {
      setSelectedPeriodFilter(currentPeriod.toString());
    }
  }, [currentPeriod, availablePeriods, selectedPeriodFilter]);

  const filteredNakitler = useMemo(() => {
    const branchId = selectedBranch?.Sube_ID || 1;

    const filtered = (nakitList || []).filter(nakit => {
      const matchesBranch = nakit.Sube_ID === branchId;
      const matchesPeriod = selectedPeriodFilter === "" || String(nakit.Donem) === selectedPeriodFilter;
      const matchesSearch = !searchTerm || (nakit.Tip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             nakit.Imaj_Adı?.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesBranch && matchesPeriod && matchesSearch;
    }).sort((a, b) => new Date(b.Kayit_Tarih).getTime() - new Date(a.Kayit_Tarih).getTime());

    return filtered;
  }, [nakitList, selectedBranch, searchTerm, selectedPeriodFilter]);

  const totalTutar = useMemo(() => {
    return filteredNakitler.reduce((total, nakit) => total + parseFloat(nakit.Tutar.toString()), 0);
  }, [filteredNakitler]);

  return (
    <div className="space-y-6" id="nakit-content">
      <Card
        title={`Nakit Girişleri (Şube: ${selectedBranch?.Sube_Adi || 'Seçilmedi'})`}
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            <Select
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="text-sm py-1"
            >
              {availablePeriods.map(p => <option key={p} value={p}>{p === "" ? "Tüm Dönemler" : p}</option>)}
            </Select>
            <Input
              placeholder="Tip veya resim adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Button onClick={handleAddNakit} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Nakit Girişi</Button>
          </div>
        }
      >
        <TableLayout headers={['ID', 'Tarih', 'Tutar', 'Tip', 'Dönem', 'Resim', 'Kayıt Tarihi', 'İşlemler']} compact={true}>
          {filteredNakitler.length > 0 ? (
            filteredNakitler.map((nakit) => (
              <tr key={nakit.Nakit_ID}>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-500">{nakit.Nakit_ID}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900">{new Date(nakit.Tarih).toLocaleDateString('tr-TR')}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-500 text-right">{formatTrCurrencyAdvanced(nakit.Tutar, 2)}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900">{nakit.Tip}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-500">{nakit.Donem}</td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-500">
                  {nakit.Imaj && nakit.Imaj_Adı ? (
                    <a href={`data:image/jpeg;base64,${nakit.Imaj}`} download={nakit.Imaj_Adı} className="text-blue-600 hover:underline">
                      {nakit.Imaj_Adı}
                    </a>
                  ) : '-'}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-500">{nakit.Kayit_Tarih ? new Date(nakit.Kayit_Tarih).toLocaleDateString('tr-TR') : '-'}</td>
                <td className="px-1 py-0.5 whitespace-nowrap text-sm font-medium flex items-center justify-center space-x-0.5">
                  <Button variant="ghost" size="sm" onClick={() => handleEditNakit(nakit)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" />
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNakit(nakit.Nakit_ID)} leftIcon={<Icons.Delete className="w-4 h-4 text-red-500" />} title="Sil" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">Bu dönem için nakit girişi bulunmamaktadır.</td>
            </tr>
          )}
        </TableLayout>
        <div className="text-right font-bold pr-4 py-2">
          Toplam Tutar: {formatTrCurrencyAdvanced(totalTutar, 2)}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNakit ? 'Nakit Girişi Düzenle' : 'Yeni Nakit Girişi Ekle'}>
        <NakitForm initialData={editingNakit} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

// --- ÖDEME YÜKLEME PAGE ---
export const OdemeYuklemePage: React.FC = () => {
  const { selectedBranch, hasPermission } = useAppContext();
  const { uploadOdeme } = useDataContext();
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!hasPermission(ODEME_YUKLEME_EKRANI_YETKI_ADI)) {
      return <AccessDenied title="Ödeme Yükleme" />;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setFeedback(null);
      } else {
        setFeedback({ message: "Lütfen geçerli bir CSV veya Excel dosyası seçin.", type: 'error' });
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedBranch) {
      setFeedback({ message: "Lütfen bir dosya seçin ve şubenin seçili olduğundan emin olun.", type: 'error' });
      return;
    }

    setFeedback({ message: `Dosya yükleniyor ve işleniyor...`, type: 'info' });
    setIsLoading(true);

    try {
        let fileToUpload: File = file;

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 1) {
                const header = jsonData[0];
                const dateColumnIndex = header.findIndex((h: string) => h.toLowerCase().includes('tarih'));

                if (dateColumnIndex !== -1) {
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        const dateValue = row[dateColumnIndex];
                        if (dateValue) {
                            // Convert Excel date number to JS date, then format, or parse string
                            if (typeof dateValue === 'number') {
                                const jsDate = XLSX.SSF.parse_date_code(dateValue);
                                row[dateColumnIndex] = `${jsDate.d.toString().padStart(2, '0')}/${jsDate.m.toString().padStart(2, '0')}/${jsDate.y}`;
                            } else {
                                // Assuming string format DD-MM-YY or similar
                                const dateParts = String(dateValue).split(/[-./]/);
                                if (dateParts.length === 3) {
                                    let [day, month, year] = dateParts;
                                    if (year.length === 2) year = `20${year}`;
                                    row[dateColumnIndex] = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
                                }
                            }
                        }
                    }
                }
            }
            
            const newWs = XLSX.utils.aoa_to_sheet(jsonData);
            const csvData = XLSX.utils.sheet_to_csv(newWs, { FS: ';' });
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            fileToUpload = new File([blob], file.name.replace(/\.(xlsx|xls)$/, '.csv'), { type: 'text/csv;charset=utf-8;' });
        }

        const formData = new FormData();
        formData.append('file', fileToUpload);

        const result = await uploadOdeme(formData);

        if (result && result.message) {
            setFeedback({ 
                message: result.message,
                type: 'success' 
            });
        } else {
            setFeedback({ 
                message: "Dosya yüklenirken bir hata oluştu. Lütfen backend loglarını kontrol edin.", 
                type: 'error' 
            });
        }

    } catch (error: any) {
        console.error("File processing error:", error);
        setFeedback({ message: `Dosya işlenirken bir hata oluştu: ${error.message || error}. Lütfen dosyanın formatını kontrol edin.`, type: 'error' });
    } finally {
        setIsLoading(false);
    }

    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    alert("Ödeme yükleme CSV şablonu indirme işlemi simüle edildi. Konsolu kontrol edin.");
    console.log("Ödeme Yükleme CSV Şablonu Bilgisi: CSV dosyanızda 'Tip', 'Hesap_Adi', 'Tarih' (GG/AA/YYYY), 'Açıklama', 'Tutar' sütunları bulunmalıdır.");
  };

  return (
    <Card title={`Ödeme Yükleme (Şube: ${selectedBranch?.Sube_Adi || 'Seçilmedi'})`}>
      <div className="space-y-6">
        <div>
          <label htmlFor="odeme-file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            CSV Dosyası (.csv)
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <Input 
              type="file" 
              id="odeme-file-upload"
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange} 
              className="flex-grow"
              disabled={isLoading}
            />
            <Button onClick={handleUpload} disabled={!file || isLoading} variant="primary">
              {isLoading ? (
                <>
                  <Icons.Loading className="mr-2 w-4 h-4 animate-spin" /> İşleniyor...
                </>
              ) : (
                <>
                  <Icons.Upload className="mr-2 w-4 h-4" /> Yükle
                </>
              )}
            </Button>
          </div>
          {file && <p className="text-sm text-gray-500 mt-1">Seçilen dosya: {file.name}</p>}
        </div>

        {feedback && (
          <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : feedback.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.message}
          </div>
        )}

        
      </div>
    </Card>
  );
};

// --- ÖDEME REFERANS YÖNETİMİ PAGE ---
export const OdemeReferansPage: React.FC = () => {
  const { odemeReferansList, addOdemeReferans, updateOdemeReferans, deleteOdemeReferans } = useDataContext();
  const { kategoriList } = useDataContext();
  const { hasPermission } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReferans, setEditingReferans] = useState<OdemeReferansFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Permissions check
  // if (!hasPermission(ODEME_REFERANS_YONETIMI_EKRANI_YETKI_ADI)) {
  //     return <AccessDenied title="Ödeme Referans Yönetimi" />;
  // }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleAddReferans = () => {
    setEditingReferans(null);
    setIsModalOpen(true);
  };

  const handleEditReferans = (referans: OdemeReferans) => {
    setEditingReferans({ ...referans });
    setIsModalOpen(true);
  };

  const handleDeleteReferans = async (referansId: number) => {
    if (window.confirm(`Bu referansı silmek istediğinizden emin misiniz?`)) {
      const result = await deleteOdemeReferans(referansId);
      if (result && result.success) {
        alert("Referans başarıyla silindi.");
      } else if (result && result.message) {
        alert(result.message);
      } else {
        alert("Referans silinirken bir hata oluştu.");
      }
    }
  };

  const handleSubmit = async (data: OdemeReferansFormData) => {
    let result;
    if (editingReferans && editingReferans.Referans_ID) {
      result = await updateOdemeReferans(editingReferans.Referans_ID, data);
    } else {
      result = await addOdemeReferans(data);
    }

    if (result && result.success) {
      setIsModalOpen(false);
      setEditingReferans(null);
    } else if (result && result.message) {
      alert(result.message);
    }
  };

  const filteredReferanslar = useMemo(() => {
    return odemeReferansList.filter(ref =>
      ref.Referans_Metin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kategoriList.find(k => k.Kategori_ID === ref.Kategori_ID)?.Kategori_Adi || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [odemeReferansList, searchTerm, kategoriList]);

  const handleGeneratePdf = () => {
    generateDashboardPdf('odeme-referans-yonetimi-content', `Odeme_Referans_Yonetimi.pdf`);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredReferanslar.map(referans => ({
        'Referans Metni': referans.Referans_Metin,
        'Kategori': kategoriList.find(k => k.Kategori_ID === referans.Kategori_ID)?.Kategori_Adi || '-',
        'Aktif': referans.Aktif_Pasif ? 'Evet' : 'Hayır',
    }));
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Ödeme Referans Listesi');
    XLSX.writeFile(wb, `Odeme_Referans_Yonetimi.xlsx`);
  };

  return (
    <div className="space-y-6" id="odeme-referans-yonetimi-content">
      <Card
        title="Ödeme Referans Yönetimi"
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input
              placeholder="Referans metni ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Button onClick={handleAddReferans} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">Yeni Referans</Button>
          </div>
        }
      >
        <TableLayout headers={['REFERANS METNİ', 'KATEGORİ', 'AKTİF', 'İŞLEMLER']} compact={true}>
          {filteredReferanslar.map((referans) => {
            const kategoriAdi = kategoriList.find(k => k.Kategori_ID === referans.Kategori_ID)?.Kategori_Adi || '-';
            return (
              <tr key={referans.Referans_ID}>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm text-gray-900">{referans.Referans_Metin}</td>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm text-gray-500">{kategoriAdi}</td>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm text-gray-500">{referans.Aktif_Pasif ? 'Evet' : 'Hayır'}</td>
                <td className="px-4 py-0.5 whitespace-nowrap text-sm font-medium flex items-center justify-center space-x-0.5">
                  <Button variant="ghost" size="sm" onClick={() => handleEditReferans(referans)} leftIcon={<Icons.Edit className="w-4 h-4" />} title="Düzenle" className="p-1" />
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteReferans(referans.Referans_ID)} leftIcon={<Icons.Delete className="w-4 h-4 text-red-500" />} title="Sil" className="p-1" />
                </td>
              </tr>
            );
          })}
        </TableLayout>
        {filteredReferanslar.length === 0 && <p className="text-center py-4 text-gray-500">Arama kriterlerine uygun referans bulunamadı.</p>}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingReferans ? 'Ödeme Referans Düzenle' : 'Yeni Ödeme Referans Ekle'}>
        <OdemeReferansForm initialData={editingReferans} kategoriler={kategoriList} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

// --- ÖDEME KATEGORİ ATAMA PAGE ---
export const OdemeKategoriAtamaPage: React.FC = () => {
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
  const { odemeList, updateOdeme, kategoriList, ustKategoriList } = useDataContext();

  // Permission check
  if (!hasPermission(ODEME_KATEGORI_ATAMA_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Ödeme Kategori Atama" />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [viewedPeriod, setViewedPeriod] = useState(currentPeriod);
  const [showOnlyUncategorized, setShowOnlyUncategorized] = useState(false);

  // Period navigation
  const handlePreviousPeriod = () => setViewedPeriod(getPreviousPeriod(viewedPeriod));
  const handleNextPeriod = () => {
    const next = getNextPeriod(viewedPeriod);
    if (next.localeCompare(currentPeriod) <= 0) setViewedPeriod(next);
  };

  // Available periods calculation based on actual data
  const availablePeriods = useMemo(() => {
    const periods = new Set(odemeList.map(o => o.Donem?.toString() || ''));
    periods.add(currentPeriod);
    return Array.from(periods).filter(p => p).sort((a, b) => b.localeCompare(a));
  }, [odemeList, currentPeriod]);

  // Filter kategoriler from "Ödeme Sistemleri" and "Bilgi" UstKategori, sorted alphabetically
  const paymentKategoriler = useMemo(() => {
    const odemeUstKategori = ustKategoriList.find(uk => uk.UstKategori_Adi === 'Ödeme Sistemleri');
    const bilgiUstKategori = ustKategoriList.find(uk => uk.UstKategori_Adi === 'Bilgi');
    
    return kategoriList.filter(k => 
      k.Aktif_Pasif && 
      (k.Ust_Kategori_ID === odemeUstKategori?.UstKategori_ID || 
       k.Ust_Kategori_ID === bilgiUstKategori?.UstKategori_ID)
    ).sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriList, ustKategoriList]);

  // Filter odeme records
  const filteredOdemeList = useMemo(() => {
    if (!selectedBranch) return [];
    
    return odemeList.filter(odeme => {
      const matchesBranch = odeme.Sube_ID === selectedBranch.Sube_ID;
      const matchesPeriod = odeme.Donem === parseInt(viewedPeriod);
      const matchesSearch = 
        odeme.Tip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        odeme.Hesap_Adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        odeme.Aciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        odeme.Tutar.toString().includes(searchTerm);
      const matchesCategory = showOnlyUncategorized ? !odeme.Kategori_ID : true;
      
      return matchesBranch && matchesPeriod && matchesSearch && matchesCategory;
    });
  }, [odemeList, selectedBranch, viewedPeriod, searchTerm, showOnlyUncategorized]);

  // Update handlers
  const handleKategoriChange = async (odemeId: number, kategoriId: number | null) => {
    await updateOdeme(odemeId, { Kategori_ID: kategoriId });
  };

  const handleDonemChange = async (odemeId: number, donem: number | null) => {
    await updateOdeme(odemeId, { Donem: donem });
  };



  // Export functions
  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = filteredOdemeList.map(odeme => {
      const kategori = kategoriList.find(k => k.Kategori_ID === odeme.Kategori_ID);
      return {
        'Tip': odeme.Tip,
        'Hesap Adı': odeme.Hesap_Adi,
        'Tarih': parseDateString(odeme.Tarih),
        'Açıklama': odeme.Aciklama,
        'Tutar': typeof odeme.Tutar === 'number' ? odeme.Tutar : parseFloat(odeme.Tutar) || 0,
        'Kategori': kategori?.Kategori_Adi || '-',
        'Dönem': odeme.Donem || '-'
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 10 }];
    
    // Ensure numeric values are exported as numbers, not text
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = range.s.r + 1; row <= range.e.r; ++row) {
      // Tutar column is column E (index 4)
      const tutarCell = ws[XLSX.utils.encode_cell({ r: row, c: 4 })];
      if (tutarCell && tutarCell.v !== undefined) {
        const numericValue = typeof tutarCell.v === 'number' ? tutarCell.v : parseFloat(tutarCell.v);
        if (!isNaN(numericValue)) {
          tutarCell.t = 'n'; // Set cell type to number
          tutarCell.v = numericValue;
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Ödeme Kategori Atama');
    XLSX.writeFile(wb, `Odeme_Kategori_Atama_${selectedBranch?.Sube_Adi}_${viewedPeriod}.xlsx`);
  };

  const handleGeneratePdf = () => {
    generateDashboardPdf('odeme-kategori-atama-content', `Odeme_Kategori_Atama_${selectedBranch?.Sube_Adi}_${viewedPeriod}.pdf`);
  };

  if (!selectedBranch) {
    return <Card title="Ödeme Kategori Atama"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-6" id="odeme-kategori-atama-content">
      <Card
        title={`Ödeme Kategori Atama - ${selectedBranch.Sube_Adi} (${viewedPeriod})`}
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
              <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir">
                <Icons.Print className="w-5 h-5" />
              </Button>
            )}
            {canExportExcel && (
              <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                <Icons.Download className="w-5 h-5" />
              </Button>
            )}
          </div>
        }
      >
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
            <Input
              placeholder="Tip, hesap adı, açıklama, tutar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dönem Filtresi</label>
            <select
              value={viewedPeriod}
              onChange={(e) => setViewedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availablePeriods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
          
          <div></div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyUncategorized}
                onChange={(e) => setShowOnlyUncategorized(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Sadece kategorisiz</span>
            </label>
          </div>
        </div>

        {/* Ödeme Table */}
        <TableLayout headers={['TİP', 'HESAP ADI', 'TARİH', 'AÇIKLAMA', 'TUTAR', 'KATEGORİ', 'DÖNEM']}>
          {filteredOdemeList.map((odeme) => {
            const kategori = kategoriList.find(k => k.Kategori_ID === odeme.Kategori_ID);
            
            return (
              <tr key={odeme.Odeme_ID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{odeme.Tip}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{odeme.Hesap_Adi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseDateString(odeme.Tarih)}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={odeme.Aciklama}>{odeme.Aciklama}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatTrCurrencyAdvanced(odeme.Tutar, 2)}</td>
                
                {/* Kategori Dropdown */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={odeme.Kategori_ID || ''}
                    onChange={(e) => handleKategoriChange(odeme.Odeme_ID, e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seçin...</option>
                    {paymentKategoriler.map(k => (
                      <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>
                    ))}
                  </select>
                </td>
                
                {/* Dönem Dropdown */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={odeme.Donem || ''}
                    onChange={(e) => handleDonemChange(odeme.Odeme_ID, e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seçin...</option>
                    {availablePeriods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </TableLayout>
        
        {filteredOdemeList.length === 0 && (
          <p className="text-center py-4 text-gray-500">
            {showOnlyUncategorized ? 'Kategorisiz ödeme bulunamadı.' : 'Arama kriterlerine uygun ödeme bulunamadı.'}
          </p>
        )}
      </Card>
    </div>
  );
};

export { default as POSHareketleriYuklemePage } from "./pages/POSHareketleriYukleme";
export { default as YemekCekiPage } from "./pages/YemekCekiPage";
export { YemekCekiKontrolDashboardPage } from "./pages/YemekCekiKontrolDashboard";

// --- ONLINE KONTROL DASHBOARD PAGE ---
export const OnlineKontrolDashboardPage: React.FC = () => {
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
  const { kategoriList, ustKategoriList, b2bEkstreList, gelirList } = useDataContext();

  const [viewedPeriod, setViewedPeriod] = useState(currentPeriod);
  const [loadData, setLoadData] = useState(false);

  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const platforms = useMemo(() => {
    if (!loadData) return [];
    return kategoriList.filter(k => k.Ust_Kategori_ID === 1 && k.Aktif_Pasif);
  }, [kategoriList, loadData]);

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const weeklyHeaders = useMemo(() => {
    if (!viewedPeriod || !loadData) return [];
    const year = 2000 + parseInt(viewedPeriod.substring(0, 2));
    const month = parseInt(viewedPeriod.substring(2, 4));
    const monthName = monthNames[month - 1];
    const daysInMonth = new Date(year, month, 0).getDate();

    const headers = [
      `01-07 ${monthName}`,
      `08-14 ${monthName}`,
      `15-21 ${monthName}`,
      `22-28 ${monthName}`,
    ];

    if (daysInMonth > 28) {
      headers.push(`29-${daysInMonth} ${monthName}`);
    }

    return headers;
  }, [viewedPeriod, loadData]);

  const calculateVirman = (platformName: string, weekHeader: string) => {
    if (!loadData) return 0;
    return 0;
  };

  const calculateMonthlyKomisyon = (platformName: string) => {
    if (!viewedPeriod || !b2bEkstreList || !loadData) return 0;

    const month = parseInt(viewedPeriod.substring(2, 4));
    const monthName = monthNames[month - 1];

    const platformNameWithoutOnline = platformName.replace(' Online', '');
    
    const keywords = [
        monthName,
        platformNameWithoutOnline,
        'Komisyon',
        'Yansıtma'
    ];

    const komisyon = b2bEkstreList
      .filter(ekstre => {
        const ekstreDonem = String(ekstre.Donem).trim();
        if (ekstreDonem !== viewedPeriod) return false;

        const ekstreAciklama = ekstre.Aciklama ? ekstre.Aciklama.toLowerCase() : '';
        
        // Check if all keywords are present in the description
        return keywords.every(keyword => ekstreAciklama.includes(keyword.toLowerCase()));
      })
      .reduce((total, ekstre) => total + ekstre.Borc, 0); // Switched to Borc

    return komisyon;
  };

  const calculateWeeklyGelir = (platformId: number, weekHeader: string) => {
    if (!loadData) return 0;
    return 0;
  };

  const calculateKismiGelir = (platformId: number, virmanSonGun: number | null) => {
    if (!viewedPeriod || !gelirList || virmanSonGun === null || !loadData) return 0;

    const year = 2000 + parseInt(viewedPeriod.substring(0, 2));
    const month = parseInt(viewedPeriod.substring(2, 4));
    
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month - 1, virmanSonGun);
    endDate.setHours(23, 59, 59, 999);

    const gelir = gelirList
      .filter(g => {
        const [gYear, gMonth, gDay] = g.Tarih.split('-').map(Number);
        const gelirTarih = new Date(gYear, gMonth - 1, gDay);
        
        return g.Kategori_ID === platformId &&
               gelirTarih >= startDate &&
               gelirTarih <= endDate;
      })
      .reduce((total, g) => total + g.Tutar, 0);

    return gelir;
  };

  const availablePeriods = useMemo(() => {
    const periods = [];
    let period = currentPeriod;
    for (let i = 0; i < 6; i++) {
      periods.push(period);
      period = getPreviousPeriod(period);
    }
    return periods;
  }, [currentPeriod]);

  const weeklyGelirTotals = useMemo(() => {
    if (!loadData) return [];
    return weeklyHeaders.map(header =>
      platforms.reduce((sum, platform) => sum + calculateWeeklyGelir(platform.Kategori_ID, header), 0)
    );
  }, [weeklyHeaders, platforms, calculateWeeklyGelir, loadData]);

  const weeklyVirmanTotals = useMemo(() => {
    if (!loadData) return [];
    return weeklyHeaders.map(header =>
      platforms.reduce((sum, platform) => sum + calculateVirman(platform.Kategori_Adi, header), 0)
    );
  }, [weeklyHeaders, platforms, calculateVirman, loadData]);

  const grandTotalGelir = useMemo(() => {
    if (!loadData) return 0;
    return platforms.reduce((sum, platform) => {
        const totalGelir = gelirList
            .filter(g => {
                if (!g.Tarih) return false;
                const gDonem = calculatePeriod(parseDateString(g.Tarih));
                return g.Kategori_ID === platform.Kategori_ID && gDonem === viewedPeriod && g.Sube_ID === selectedBranch?.Sube_ID;
            })
            .reduce((total, g) => total + g.Tutar, 0);
        return sum + totalGelir;
    }, 0);
  }, [platforms, gelirList, viewedPeriod, selectedBranch, calculatePeriod, parseDateString, loadData]);

  const grandTotalVirman = useMemo(() => {
    if (!loadData) return 0;
    return weeklyVirmanTotals.reduce((sum, total) => sum + total, 0);
  }, [weeklyVirmanTotals, loadData]);

  const grandTotalKomisyon = useMemo(() => {
    if (!loadData) return 0;
    return platforms.reduce((sum, platform) => sum + calculateMonthlyKomisyon(platform.Kategori_Adi), 0);
  }, [platforms, calculateMonthlyKomisyon, loadData]);

  const calculateVirmanSonGun = useCallback((platformName: string) => {
    if (!viewedPeriod || !b2bEkstreList || !loadData) return null;

    const virmanGunleri = b2bEkstreList
      .filter(ekstre => {
        const ekstreDonem = String(ekstre.Donem).trim();
        const ekstreAciklama = ekstre.Aciklama ? ekstre.Aciklama.toLowerCase() : '';
        const hasDateRange = /(\d+)-(\d+)/.test(ekstre.Aciklama || '');
        return ekstreDonem === viewedPeriod && ekstreAciklama.includes(platformName.toLowerCase()) && hasDateRange;
      })
      .map(ekstre => {
        const aciklama = ekstre.Aciklama || '';
        const match = aciklama.match(/(\d+)-(\d+)/);
        if (match && match[2]) {
          return parseInt(match[2], 10);
        }
        return null;
      })
      .filter(day => day !== null) as number[];

    if (virmanGunleri.length === 0) {
      return null;
    }

    return Math.max(...virmanGunleri);
  }, [b2bEkstreList, viewedPeriod, loadData]);

  const calculateToplamVirman = useCallback((platformName: string) => {
    if (!viewedPeriod || !b2bEkstreList || !loadData) return 0;

    const toplamVirman = b2bEkstreList
      .filter(ekstre => {
        const ekstreDonem = String(ekstre.Donem).trim();
        const ekstreAciklama = ekstre.Aciklama ? ekstre.Aciklama.toLowerCase() : '';
        const hasDateRange = /(\d+)-(\d+)/.test(ekstre.Aciklama || '');
        return ekstreDonem === viewedPeriod && ekstreAciklama.includes(platformName.toLowerCase()) && hasDateRange;
      })
      .reduce((total, ekstre) => total + ekstre.Alacak, 0);

    return -1 * toplamVirman;
  }, [b2bEkstreList, viewedPeriod, loadData]);

  const grandTotalToplamVirman = useMemo(() => {
    if (!loadData) return 0;
    return platforms.reduce((sum, platform) => sum + calculateToplamVirman(platform.Kategori_Adi), 0);
  }, [platforms, calculateToplamVirman, loadData]);

  const handleExportToExcel = () => {
    const dataForExport: (string | number)[][] = [];

    const header: string[] = ['Platform'];

            header.push('Gelir Toplam', 'Virman Son Gün', 'Toplam Virman', 'Kısmı Gelir', 'Fark', 'Komisyon Toplam', 'Komisyon %');
            dataForExport.push(header);
    
            platforms.forEach(platform => {
                const row: (string | number)[] = [platform.Kategori_Adi];
                const totalGelir = gelirList
                            .filter(g => {
                                if (!g.Tarih) return false;
                                const gDonem = calculatePeriod(parseDateString(g.Tarih));
                                return g.Kategori_ID === platform.Kategori_ID && gDonem === viewedPeriod && g.Sube_ID === selectedBranch?.Sube_ID;
                            })
                            .reduce((total, g) => total + g.Tutar, 0);
                const totalVirman = weeklyHeaders.reduce((sum, header) => sum + calculateVirman(platform.Kategori_Adi, header), 0);
                const virmanSonGun = calculateVirmanSonGun(platform.Kategori_Adi);
                        const toplamVirmanYeni = calculateToplamVirman(platform.Kategori_Adi);
                        const kismiGelir = calculateKismiGelir(platform.Kategori_ID, virmanSonGun);
                        

                
                        row.push(totalGelir);
                        row.push(virmanSonGun !== null ? virmanSonGun : 'N/A');
                        row.push(toplamVirmanYeni);
                        row.push(kismiGelir); // Kısmı Gelir
                        row.push(toplamVirmanYeni - kismiGelir); // Fark
                        const monthlyKomisyon = calculateMonthlyKomisyon(platform.Kategori_Adi);
                        row.push(monthlyKomisyon);
                        const komisyonPercentage = toplamVirmanYeni !== 0 ? (monthlyKomisyon / toplamVirmanYeni) * 100 : 0;
                        row.push(komisyonPercentage.toFixed(2) + '%');
                
                        dataForExport.push(row);
                    });
                
                    const footer: (string | number)[] = ['GENEL TOPLAM'];

                    footer.push(grandTotalGelir);
                    footer.push('N/A');
                    const grandTotalKismiGelir = platforms.reduce((sum, p) => sum + calculateKismiGelir(p.Kategori_ID, calculateVirmanSonGun(p.Kategori_Adi)), 0);
                    footer.push(grandTotalToplamVirman);
                    footer.push(grandTotalKismiGelir);
                    footer.push(grandTotalToplamVirman - grandTotalKismiGelir);
                    footer.push(grandTotalKomisyon);
                    const grandTotalKomisyonPercentage = grandTotalToplamVirman !== 0 ? (grandTotalKomisyon / grandTotalToplamVirman) * 100 : 0;
            footer.push(grandTotalKomisyonPercentage.toFixed(2) + '%');
            dataForExport.push(footer);
    const ws = XLSX.utils.aoa_to_sheet(dataForExport);
    ws['!cols'] = [ { wch: 20 } ];
    for (let i = 0; i < weeklyHeaders.length * 2; i++) {
        ws['!cols'].push({ wch: 15 });
    }
    ws['!cols'].push({ wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Online Kontrol Raporu');
    XLSX.writeFile(wb, `Online_Kontrol_Dashboard_${viewedPeriod}.xlsx`);
  };


  if (!hasPermission('Online Kontrol Dashboard Görüntüleme')) {
      return <AccessDenied title="Online Kontrol Dashboard" />;
  }

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewedPeriod(e.target.value);
    setLoadData(true);
  };

  return (
    <Card title="Online Kontrol Dashboard" actions={
        <div className="flex items-center space-x-2">
            {canExportExcel && (
                <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <label htmlFor="period-select" className="text-sm font-medium">Dönem:</label>
            <Select id="period-select" value={viewedPeriod} onChange={handlePeriodChange}>
                {availablePeriods.map(p => {
                    const year = 2000 + parseInt(p.substring(0, 2));
                    const month = parseInt(p.substring(2, 4));
                    const monthName = monthNames[month - 1];
                    return <option key={p} value={p}>{`${p} - ${monthName} ${year}`}</option>
                })}
            </Select>
        </div>
    }>
      {!loadData ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Raporu görüntülemek için lütfen bir dönem seçin.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th rowSpan={2} className="border p-2 bg-gray-700 text-white">Platform</th>

                        <th rowSpan={2} className="border p-2 bg-green-600 text-white">Gelir Toplam</th>
                        
                        <th rowSpan={2} className="border p-2 bg-sky-600 text-white">Virman Son Gün</th>
                        <th rowSpan={2} className="border p-2 bg-indigo-600 text-white">Toplam Virman</th>
                        <th rowSpan={2} className="border p-2 bg-teal-600 text-white">Kısmı Gelir</th>
                        <th rowSpan={2} className="border p-2 bg-slate-600 text-white">Fark</th>
                        <th rowSpan={2} className="border p-2 bg-purple-600 text-white">Komisyon Toplam</th>
                        <th rowSpan={2} className="border p-2 bg-pink-600 text-white">Komisyon %</th>
                    </tr>
                    <tr>

                        <th className="border p-1 bg-pink-100 text-xs">%</th>
                    </tr>
                </thead>
                <tbody>
                    {platforms.map(platform => {
                        const totalGelir = gelirList
                            .filter(g => {
                                if (!g.Tarih) return false;
                                const gDonem = calculatePeriod(parseDateString(g.Tarih));
                                return g.Kategori_ID === platform.Kategori_ID && gDonem === viewedPeriod && g.Sube_ID === selectedBranch?.Sube_ID;
                            })
                            .reduce((total, g) => total + g.Tutar, 0);
                        const totalVirman = weeklyHeaders.reduce((sum, header) => sum + calculateVirman(platform.Kategori_Adi, header), 0);
                        const monthlyKomisyon = calculateMonthlyKomisyon(platform.Kategori_Adi);
                        const virmanSonGun = calculateVirmanSonGun(platform.Kategori_Adi);
                        const toplamVirmanYeni = calculateToplamVirman(platform.Kategori_Adi);
                        const kismiGelir = calculateKismiGelir(platform.Kategori_ID, virmanSonGun);
                        
                        const komisyonPercentage = toplamVirmanYeni !== 0 
                            ? (monthlyKomisyon / toplamVirmanYeni) * 100 
                            : 0;

                        return (
                            <tr key={platform.Kategori_ID}>
                                <td className="border p-2 font-bold bg-red-100 text-red-800 text-left">{platform.Kategori_Adi}</td>

                                <td className="border p-2 text-right font-bold bg-green-100">{formatTrCurrencyAdvanced(totalGelir, 2)}</td>
                                
                                <td className="border p-2 text-right">{virmanSonGun !== null ? virmanSonGun : 'N/A'}</td>
                                <td className="border p-2 text-right">{formatTrCurrencyAdvanced(toplamVirmanYeni, 2)}</td>
                                <td className="border p-2 text-right">{formatTrCurrencyAdvanced(kismiGelir, 2)}</td>
                                <td className="border p-2 text-right">{formatTrCurrencyAdvanced(toplamVirmanYeni - kismiGelir, 2)}</td>
                                <td className="border p-2 text-right font-bold bg-purple-100">{formatTrCurrencyAdvanced(monthlyKomisyon, 2)}</td>
                                <td className="border p-2 text-right font-bold bg-pink-100">
                                    {komisyonPercentage.toFixed(2)}%
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-700 text-white font-bold">
                        <td className="border p-2 text-left">GENEL TOPLAM</td>

                        <td className="border p-2 text-right">{formatTrCurrencyAdvanced(grandTotalGelir, 2)}</td>
                        
                        <td className="border p-2 text-right">N/A</td>
                        <td className="border p-2 text-right">{formatTrCurrencyAdvanced(grandTotalToplamVirman, 2)}</td>
                        <td className="border p-2 text-right">{formatTrCurrencyAdvanced(platforms.reduce((sum, p) => sum + calculateKismiGelir(p.Kategori_ID, calculateVirmanSonGun(p.Kategori_Adi)), 0), 2)}</td>
                        <td className="border p-2 text-right">{formatTrCurrencyAdvanced(grandTotalToplamVirman - platforms.reduce((sum, p) => sum + calculateKismiGelir(p.Kategori_ID, calculateVirmanSonGun(p.Kategori_Adi)), 0), 2)}</td>
                        <td className="border p-2 text-right">{formatTrCurrencyAdvanced(grandTotalKomisyon, 2)}</td>
                        <td className="border p-2 text-right">
                            {(grandTotalToplamVirman !== 0 
                                ? (grandTotalKomisyon / grandTotalToplamVirman) * 100 
                                : 0).toFixed(2)}%
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
      )}
    </Card>
  );
};
