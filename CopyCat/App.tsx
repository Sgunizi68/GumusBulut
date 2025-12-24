import React, { useState, createContext, useContext, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AppContextType, Sube, Kullanici, EFatura, InvoiceAssignmentFormData, DataContextType, RolYetki, B2BEkstre, B2BAssignmentFormData, DigerHarcama, DigerHarcamaFormData, Stok, StokFormData, StokFiyat, StokFiyatFormData, StokSayim, Calisan, CalisanFormData, PuantajSecimi, PuantajSecimiFormData, Puantaj, PuantajEntry, Gelir, GelirEkstra, AvansIstek, Rol, Yetki, KullaniciRol, Deger, UstKategori, Kategori, UstKategoriFormData, KategoriFormData, Nakit, NakitFormData, EFaturaReferans, EFaturaReferansFormData, OdemeReferans, OdemeReferansFormData, Odeme, OdemeAssignmentFormData, CalisanTalep } from './types';

import { API_BASE_URL, MENU_GROUPS, DASHBOARD_ITEM, Icons, DEFAULT_PERIOD, OZEL_FATURA_YETKI_ADI, PUANTAJ_HISTORY_ACCESS_YETKI_ADI, GELIR_GECMISI_YETKI_ADI, DEFAULT_END_DATE, STORAGE_KEYS } from './constants';
import { ErrorProvider, useErrorContext, classifyError } from './contexts/ErrorContext';
import { ToastContainer, ConnectionStatusBanner, useToast } from './contexts/ToastContext';

import { LoginPage, DashboardPage, SubePage, UsersPage, RolesPage, PermissionsPage, UserRoleAssignmentPage, RolePermissionAssignmentPage, DegerlerPage, PlaceholderPage, UstKategorilerPage, KategorilerPage, InvoiceUploadPage, InvoiceCategoryAssignmentPage, B2BUploadPage, B2BCategoryAssignmentPage, DigerHarcamalarPage, GelirPage, StokPage, StokFiyatPage, StokSayimPage, CalisanPage, PuantajSecimPage, PuantajPage, AvansPage, NakitPage, OdemeYuklemePage, OdemeReferansPage, OdemeKategoriAtamaPage, POSHareketleriYuklemePage, OnlineKontrolDashboardPage, YemekCekiPage, YemekCekiKontrolDashboardPage } from './pages';
import { TabakSayisiYuklemePage } from './pages/TabakSayisiYukleme';
import { EFaturaReferansPage } from './pages';
import { NakitYatirmaRaporuPage } from './pages/NakitYatirmaRaporu';
import { OdemeRaporPage } from './pages/OdemeRapor';
import { FaturaRaporuPage } from './pages/FaturaRaporu';
import { FaturaDigerHarcamaRaporuPage } from './pages/FaturaDigerHarcamaRaporu';
import { POSKontrolDashboardPage } from './pages/POSKontrolDashboard';
import { VPSDashboardPage } from './pages/VPSDashboard';
import { BayiKarlilikRaporuPage } from './pages/BayiKarlilikRaporu';
import { OzetKontrolRaporuPage } from './pages/OzetKontrolRaporuPage';
import CalisanTalepPage from './pages/CalisanTalepPage';
import NakitAkisGelirRaporuPage from './pages/NakitAkisGelirRaporuPage';
import FaturaBolmeYonetimiPage from './pages/FaturaBolmeYonetimi';
import CariTakipEkrani from './pages/CariBorcTakipSistemiPage';
import CariYonetim from './pages/CariYonetimiPage';
import MutabakatYonetim from './pages/MutabakatYonetimiPage';

import { Input, Select } from './components'; 

// --- Helper types for local storage data ---
interface StoredDataState {
    subeList: Sube[];
    eFaturaList: EFatura[];
    b2bEkstreList: B2BEkstre[];
    digerHarcamaList: DigerHarcama[];
    stokList: Stok[];
    stokFiyatList: StokFiyat[];
    stokSayimList: StokSayim[];
    calisanList: Calisan[];
    puantajSecimiList: PuantajSecimi[];
    puantajList: Puantaj[];
    gelirList: Gelir[];
    gelirEkstraList: GelirEkstra[];
    avansIstekList: AvansIstek[];
    ustKategoriList: UstKategori[];
    kategoriList: Kategori[];
    rolesList: Rol[];
    eFaturaReferansList: EFaturaReferans[];
    nakitList: Nakit[];
    odemeList: Odeme[];
}

interface StoredAppState {
    isAuthenticated: boolean;
    currentUser: Kullanici | null;
    selectedBranch: Sube | null;
    currentPeriod: string;
}

// --- Helper to load from localStorage ---
const loadFromLocalStorage = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
        return fallback;
    }
};


// App Context
const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// Data Context for shared lists
const DataContext = createContext<DataContextType | null>(null);
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataContext must be used within a DataProvider');
  return context;
};

// Layout Components
const Sidebar: React.FC = () => {
  const { hasPermission } = useAppContext();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const activeGroup = MENU_GROUPS.find(g => g.items.some(i => i.path === location.pathname && (!i.permission || hasPermission(i.permission))));
    return activeGroup ? { [activeGroup.title]: true } : {};
  });

  useEffect(() => {
    const activeGroup = MENU_GROUPS.find(g => g.items.some(i => i.path === location.pathname && (!i.permission || hasPermission(i.permission))));
    if (activeGroup && !openGroups[activeGroup.title]) {
      setOpenGroups(prev => ({...prev, [activeGroup.title]: true}));
    }
  }, [location.pathname, hasPermission]);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="w-64 bg-slate-800 text-slate-100 flex flex-col h-full">
      <div className="h-20 flex flex-col items-center justify-center bg-slate-900 p-2 flex-shrink-0">
        <Icons.SilverCloudLogo className="w-10 h-10 mb-1" />
        <h1 className="text-lg font-semibold text-center">SilverCloud System</h1>
      </div>
      <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
        {(!DASHBOARD_ITEM.permission || hasPermission(DASHBOARD_ITEM.permission)) && (
            <NavLink
              key={DASHBOARD_ITEM.label}
              to={DASHBOARD_ITEM.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-slate-700 transition-colors duration-150 ${
                  isActive ? 'bg-slate-700 font-semibold' : ''
                }`
              }
            >
              {DASHBOARD_ITEM.icon && <DASHBOARD_ITEM.icon />}
              <span>{DASHBOARD_ITEM.label}</span>
            </NavLink>
        )}
        
        {MENU_GROUPS.map((group) => {
            const visibleItems = group.items.filter(item => !item.permission || hasPermission(item.permission));
            if (visibleItems.length === 0) return null;
            const isOpen = !!openGroups[group.title];

            return (
                <div key={group.title} className="pt-2">
                    <button
                        onClick={() => toggleGroup(group.title)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-700 transition-colors duration-150 focus:outline-none"
                    >
                        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                            {group.title}
                        </h3>
                        <Icons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isOpen && (
                      <div className="space-y-1 mt-1 pl-2 border-l border-slate-700">
                          {visibleItems.map((item) => (
                            <NavLink
                              key={item.label}
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors duration-150 text-sm ${
                                  isActive ? 'bg-slate-700 font-semibold' : 'text-slate-300'
                                }`
                              }
                            >
                              {item.icon && <item.icon className="w-4 h-4"/>}
                              <span>{item.label}</span>
                            </NavLink>
                          ))}
                      </div>
                    )}
                </div>
            );
        })}
      </nav>
      <div className="p-2 text-center text-xs text-slate-400">
        Version: {import.meta.env.APP_VERSION}
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const { currentUser, logout, selectedBranch, selectBranch, currentPeriod, setPeriod } = useAppContext();
  const { subeList } = useDataContext(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const branchesForDropdown = subeList.filter(s => s.Aktif_Pasif);

  // Helper function to format the period
  const formatPeriod = useCallback((period: string): string => {
    if (period.length !== 4) {
      return period; // Return as is if not in YYMM format
    }
    const year = parseInt(period.substring(0, 2), 10) + 2000; // Assuming 20xx
    const month = parseInt(period.substring(2, 4), 10);

    const monthNames: { [key: number]: string } = {
      1: 'Ocak', 2: 'Şubat', 3: 'Mart', 4: 'Nisan', 5: 'Mayıs', 6: 'Haziran',
      7: 'Temmuz', 8: 'Ağustos', 9: 'Eylül', 10: 'Ekim', 11: 'Kasım', 12: 'Aralık'
    };

    const monthName = monthNames[month] || '';

    return `${period} - ${monthName} ${year}`;
  }, []);

  // Memoize the formatted period to avoid re-calculation on every render
  const formattedPeriod = useMemo(() => formatPeriod(currentPeriod), [currentPeriod, formatPeriod]);

  return (
    <header className="h-16 bg-white shadow-md flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">Hoşgeldiniz, {currentUser?.Kullanici_Adi || ''}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <label htmlFor="period-input" className="text-sm font-medium text-gray-700">Dönem:</label>
            <Input 
                id="period-input"
                type="text" disabled
                value={formattedPeriod}
                onChange={(e) => setPeriod(e.target.value)}
                maxLength={4}
                className="w-36 text-sm py-1.5"
                placeholder="YYAA"
            />
        </div>
        <div className="relative">
            <Select 
                value={selectedBranch?.Sube_ID || ''}
                onChange={(e) => {
                    const branch = branchesForDropdown.find(b => b.Sube_ID === parseInt(e.target.value));
                    if(branch) selectBranch(branch);
                }}
                className="text-sm py-1.5 pl-3 pr-8 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                aria-label="Şube Seçimi"
            >
                {branchesForDropdown.length === 0 && <option value="">Aktif Şube Yok</option>}
                {branchesForDropdown.map(branch => (
                    <option key={branch.Sube_ID} value={branch.Sube_ID}>{branch.Sube_Adi}</option>
                ))}
            </Select>
        </div>
        {currentUser && (
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <Icons.UserCircle />
              <span className="hidden md:inline">{currentUser.Kullanici_Adi}</span>
              <Icons.ChevronDown />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => { logout(); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Icons.Logout className="w-4 h-4"/>
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
              {children}
            </main>
        </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};


// Backende de nereye gideceğini buaradab ayarlıyorum. Lokal veya bulut
// export const API_BASE_URL = "https://gumusbulut.onrender.com/api/v1"; // Hatalı tanım, API adresi constants.tsx'den alınmalı.

// Enhanced fetchData with error classification and suppression
export const fetchData = async <T,>(url: string, options: RequestInit = {}, skipAuth: boolean = false): Promise<T | null> => {
  try {
    // Automatically set Content-Type for JSON, unless it's FormData
    if (options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }

    // Add authentication token if available and not skipped
    if (!skipAuth) {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            options.headers = {
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            };
        }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorDetail = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        // If errorData.detail is an array, format it for better readability
        if (Array.isArray(errorData.detail)) {
            errorDetail = errorData.detail.map((err: any) => `${err.loc.join(' -> ')}: ${err.msg}`).join('\n');
        } else {
            errorDetail = errorData.detail || errorDetail;
        }
      } catch (jsonError) {
        errorDetail = response.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({ success: true } as T);

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusCode = error.response?.status || (error.name === 'TypeError' ? 0 : undefined);
    
    // Classify the error to determine how to handle it
    const { type, severity, shouldDisplay } = classifyError(statusCode, errorMessage, url);
    
    // Always log to console for debugging
    console.error("Error in fetchData:", {
      url,
      errorMessage,
      statusCode,
      type,
      severity,
      shouldDisplay
    });
    
    // Only show user-facing messages for non-connection errors
    if (shouldDisplay) {
      // For authentication errors, show a more user-friendly message
      if (type === 'authentication') {
        console.warn('Authentication error - user may need to login again');
      } else if (type === 'validation') {
        console.warn('Validation error:', errorMessage);
      } else {
        console.warn('General error:', errorMessage);
      }
    }
    
    return null;
  }
};

// DataProvider Component
const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
    const [subeList, setSubeList] = useState<Sube[]>([]);
    const [eFaturaList, setEFaturaList] = useState<EFatura[]>([]);
    const [b2bEkstreList, setB2BEkstreList] = useState<B2BEkstre[]>([]);
    const [digerHarcamaList, setDigerHarcamaList] = useState<DigerHarcama[]>([]);
    const [stokList, setStokList] = useState<Stok[]>([]);
    const [stokFiyatList, setStokFiyatList] = useState<StokFiyat[]>([]);
    const [stokSayimList, setStokSayimList] = useState<StokSayim[]>([]);
    const [calisanList, setCalisanList] = useState<Calisan[]>([]);
    const [puantajSecimiList, setPuantajSecimiList] = useState<PuantajSecimi[]>([]);
    const [puantajList, setPuantajList] = useState<Puantaj[]>([]);
    const [gelirList, setGelirList] = useState<Gelir[]>([]);
    const [gelirEkstraList, setGelirEkstraList] = useState<GelirEkstra[]>([]);
    const [avansIstekList, setAvansIstekList] = useState<AvansIstek[]>([]);
    const [ustKategoriList, setUstKategoriList] = useState<UstKategori[]>([]);
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [degerList, setDegerList] = useState<Deger[]>([]);
    const [userList, setUserList] = useState<Kullanici[]>([]);
    const [rolesList, setRolesList] = useState<Rol[]>([]);
    const [permissionsList, setPermissionsList] = useState<Yetki[]>([]);
    const [userRolesList, setUserRolesList] = useState<KullaniciRol[]>([]);
    const [rolePermissionsList, setRolePermissionsList] = useState<RolYetki[]>([]);
    const [eFaturaReferansList, setEFaturaReferansList] = useState<EFaturaReferans[]>([]);
    const [odemeReferansList, setOdemeReferansList] = useState<OdemeReferans[]>([]);
    const [nakitList, setNakitList] = useState<Nakit[]>([]);
    const [odemeList, setOdemeList] = useState<Odeme[]>([]);
    const [yemekCekiList, setYemekCekiList] = useState<YemekCeki[]>([]);
    const [depoKiraRapor, setDepoKiraRapor] = useState<any[]>([]);
    const [calisanTalepList, setCalisanTalepList] = useState<CalisanTalep[]>([]);

    // Initial data fetching with caching
    useEffect(() => {
        let lastVisible = document.visibilityState === 'visible' ? Date.now() : 0;

        const loadEssentialData = async () => {
            // Load from cache
            const cachedData = loadFromLocalStorage<Partial<StoredDataState>>(STORAGE_KEYS.DATA_STATE, {});
            if (cachedData.subeList) setSubeList(cachedData.subeList);
            if (cachedData.ustKategoriList) setUstKategoriList(cachedData.ustKategoriList);
            if (cachedData.kategoriList) setKategoriList(cachedData.kategoriList);
            if (cachedData.rolesList) setRolesList(cachedData.rolesList);

            // Fetch essential data
            const [
                subeler, ustKategoriler, kategoriler, degerler,
                users, roles, permissions, userRoles, rolePermissions
            ] = await Promise.all([
                fetchData<Sube[]>(`${API_BASE_URL}/subeler/`),
                fetchData<UstKategori[]>(`${API_BASE_URL}/ust-kategoriler/`),
                fetchData<Kategori[]>(`${API_BASE_URL}/kategoriler/`),
                fetchData<Deger[]>(`${API_BASE_URL}/degerler/`),
                fetchData<Kullanici[]>(`${API_BASE_URL}/users/`),
                fetchData<Rol[]>(`${API_BASE_URL}/roles/`),
                fetchData<Yetki[]>(`${API_BASE_URL}/yetkiler/`),
                fetchData<KullaniciRol[]>(`${API_BASE_URL}/kullanici-rolleri/`),
                fetchData<RolYetki[]>(`${API_BASE_URL}/rol-yetkileri/`),
            ]);

            const newDataToCache: Partial<StoredDataState> = {};
            if (subeler) { setSubeList(subeler); newDataToCache.subeList = subeler; }
            if (ustKategoriler) { setUstKategoriList(ustKategoriler); newDataToCache.ustKategoriList = ustKategoriler; }
            if (kategoriler) { setKategoriList(kategoriler); newDataToCache.kategoriList = kategoriler; }
            if (roles) { setRolesList(roles); newDataToCache.rolesList = roles; }
            if (degerler) setDegerList(degerler);
            if (users) setUserList(users);
            if (permissions) setPermissionsList(permissions);
            if (userRoles) setUserRolesList(userRoles);
            if (rolePermissions) setRolePermissionsList(rolePermissions);
            
            try {
                localStorage.setItem(STORAGE_KEYS.DATA_STATE, JSON.stringify(newDataToCache));
            } catch (error) {
                console.warn("Could not cache app data, might be due to storage quota:", error);
            }
        };

        const loadNonEssentialData = async () => {
            const [
                eFaturalar, b2bEkstreler, digerHarcamalar, stoklar, stokFiyatlar,
                stokSayimlar, calisanlar, puantajSecimleri, puantajlar, gelirler,
                gelirEkstralar, avansIstekler, eFaturaReferanslar, odemeReferanslar, nakitler, odemeler, yemekCekiler,
                depoKiraData, calisanTalepler
            ] = await Promise.all([
                fetchData<EFatura[]>(`${API_BASE_URL}/e-faturalar/`),
                fetchData<B2BEkstre[]>(`${API_BASE_URL}/b2b-ekstreler/`),
                fetchData<DigerHarcama[]>(`${API_BASE_URL}/diger-harcamalar/`),
                fetchData<Stok[]>(`${API_BASE_URL}/stoklar/`),
                fetchData<StokFiyat[]>(`${API_BASE_URL}/stok-fiyatlar/`),
                fetchData<StokSayim[]>(`${API_BASE_URL}/stok-sayimlar/`),
                fetchData<Calisan[]>(`${API_BASE_URL}/calisanlar/`),
                fetchData<PuantajSecimi[]>(`${API_BASE_URL}/puantaj-secimi/`),
                fetchData<Puantaj[]>(`${API_BASE_URL}/puantajlar/`),
                fetchData<Gelir[]>(`${API_BASE_URL}/gelirler/`),
                fetchData<GelirEkstra[]>(`${API_BASE_URL}/gelir-ekstra/`),
                fetchData<AvansIstek[]>(`${API_BASE_URL}/avans-istekler/`),
                fetchData<EFaturaReferans[]>(`${API_BASE_URL}/e-fatura-referans/`),
                fetchData<OdemeReferans[]>(`${API_BASE_URL}/Odeme_Referans/`),
                fetchData<Nakit[]>(`${API_BASE_URL}/nakit/`),
                fetchData<Odeme[]>(`${API_BASE_URL}/Odeme/`),
                fetchData<YemekCeki[]>(`${API_BASE_URL}/yemek-cekiler/`),
                fetchData<any[]>(`${API_BASE_URL}/depo-kira-rapor/`),
                fetchData<CalisanTalep[]>(`${API_BASE_URL}/calisan-talepler/`)
            ]);

            if (eFaturalar) setEFaturaList(eFaturalar);
            if (b2bEkstreler) setB2BEkstreList(b2bEkstreler);
            if (digerHarcamalar) setDigerHarcamaList(digerHarcamalar);
            if (stoklar) setStokList(stoklar);
            if (stokFiyatlar) setStokFiyatList(stokFiyatlar);
            if (stokSayimlar) setStokSayimList(stokSayimlar);
            if (calisanlar) setCalisanList(calisanlar);
            if (puantajSecimleri) setPuantajSecimiList(puantajSecimleri);
            if (puantajlar) setPuantajList(puantajlar);
            if (gelirler) setGelirList(gelirler);
            if (gelirEkstralar) setGelirEkstraList(gelirEkstralar);
            if (avansIstekler) setAvansIstekList(avansIstekler);
            if (eFaturaReferanslar) setEFaturaReferansList(eFaturaReferanslar);
            if (odemeReferanslar) setOdemeReferansList(odemeReferanslar);
            if (nakitler) setNakitList(nakitler);
            if (odemeler) setOdemeList(odemeler);
            if (yemekCekiler) setYemekCekiList(yemekCekiler);
            if (depoKiraData) setDepoKiraRapor(depoKiraData);
            if (calisanTalepler) setCalisanTalepList(calisanTalepler);
        };

        const initialize = async () => {
            await loadEssentialData();
            setIsInitialDataLoaded(true);
            loadNonEssentialData(); // no await
        }

        initialize();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const timeout = 5 * 60 * 1000; // 5 minutes
                if (now - lastVisible > timeout) {
                    console.log("Tab was hidden for a while, refreshing data...");
                    initialize();
                }
                lastVisible = now;
            } else {
                lastVisible = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

  const fetchDegerler = useCallback(async () => {
    const degerler = await fetchData<Deger[]>(`${API_BASE_URL}/degerler/`);
    if (degerler) setDegerList(degerler);
  }, []);

  const addDeger = useCallback(async (data: DegerFormData) => {
    const newDeger = await fetchData<Deger>(`${API_BASE_URL}/degerler/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newDeger) {
      setDegerList(prev => [...prev, newDeger]);
      return { success: true };
    }
    return { success: false, message: "Değer eklenirken bir hata oluştu." };
  }, []);

  const updateDeger = useCallback(async (degerId: number, data: DegerFormData) => {
    const updatedDeger = await fetchData<Deger>(`${API_BASE_URL}/degerler/${degerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedDeger) {
      setDegerList(prev =>
        prev.map(d => (d.Deger_ID === degerId ? updatedDeger : d))
      );
      return { success: true };
    }
    return { success: false, message: "Değer güncellenirken bir hata oluştu." };
  }, []);

  const addSube = useCallback(async (subeData: Omit<Sube, 'Sube_ID'>) => {
    const newSube = await fetchData<Sube>(`${API_BASE_URL}/subeler/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subeData),
    });
    if (newSube) {
      setSubeList(prevList => [...prevList, newSube]);
      return { success: true };
    }
    return { success: false, message: "Şube eklenirken bir hata oluştu." };
  }, []);

  const updateSube = useCallback(async (subeId: number, subeData: Omit<Sube, 'Sube_ID'>) => {
    const updatedSube = await fetchData<Sube>(`${API_BASE_URL}/subeler/${subeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subeData),
    });
    if (updatedSube) {
      setSubeList(prevList => 
        prevList.map(s => (s.Sube_ID === subeId ? updatedSube : s))
      );
      return { success: true };
    }
    return { success: false, message: "Şube güncellenirken bir hata oluştu." };
  }, []);

  const addEFaturas = useCallback(async (newFaturas: EFatura[]) => {
    try {
      const response = await fetchData<{ 
        message: string; 
        added: number; 
        skipped: number; 
        errors: number; 
        added_invoices: EFatura[] 
      }>(`${API_BASE_URL}/e-faturalar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaturas),
      });

      if (response && response.added_invoices) {
        setEFaturaList(prevList => [...prevList, ...response.added_invoices]);
        return { 
          successfullyAdded: response.added, 
          skippedRecords: response.skipped, 
          errorRecords: response.errors 
        };
      }
      return { successfullyAdded: 0, skippedRecords: newFaturas.length, errorRecords: 0 };
    } catch (error) {
      console.error("Error in addEFaturas:", error);
      return { successfullyAdded: 0, skippedRecords: 0, errorRecords: newFaturas.length };
    }
  }, []);

  const updateEFatura = useCallback(async (faturaId: number, data: Partial<EFatura>) => {
    const originalFatura = eFaturaList.find(f => f.Fatura_ID === faturaId);
    if (!originalFatura) {
        const errorMsg = `Fatura (ID: ${faturaId}) bulunamadı.`;
        console.error(errorMsg);
        return { success: false, message: errorMsg };
    }

    const payload = { ...originalFatura, ...data };

    if (payload.Kategori_ID !== null && payload.Kategori_ID !== undefined) {
        payload.Kategori_ID = Number(payload.Kategori_ID);
    }
    if (payload.Donem !== null && payload.Donem !== undefined) {
        payload.Donem = Number(payload.Donem);
    }
    payload.Ozel = payload.Ozel ? 1 : 0;
    payload.Gunluk_Harcama = payload.Gunluk_Harcama ? 1 : 0;


    const updatedFaturaFromServer = await fetchData(
        `${API_BASE_URL}/e-faturalar/${faturaId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    );

    if (!updatedFaturaFromServer) {
        return { success: false, message: "API çağrısı başarısız oldu." };
    }

    const finalState = {
        ...updatedFaturaFromServer,
        Ozel: !!updatedFaturaFromServer.Ozel,
        Gunluk_Harcama: !!updatedFaturaFromServer.Gunluk_Harcama,
    };

    setEFaturaList(prevList =>
        prevList.map(f => (f.Fatura_ID === faturaId ? finalState : f))
    );

    return { success: true, data: finalState };
  }, [eFaturaList, fetchData]);

  const addB2BEkstreler = useCallback(async (newEkstreler: B2BEkstre[]) => {
    const successfullyAdded: B2BEkstre[] = [];
    const skippedRecords: Array<{ Fis_No: string, Tarih: string, reason: string }> = [];

    for (const newEkstre of newEkstreler) {
      const response = await fetchData<B2BEkstre>(`${API_BASE_URL}/b2b-ekstreler/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEkstre),
      });
      if (response) {
        successfullyAdded.push(response);
      } else {
        skippedRecords.push({ Fis_No: newEkstre.Fis_No, Tarih: newEkstre.Tarih, reason: 'Fiş No ve Tarih kombinasyonu zaten mevcut veya başka bir hata oluştu.' });
      }
    }
    setB2BEkstreList(prevList => [...prevList, ...successfullyAdded]);
    return { successfullyAdded, skippedRecords };
  }, []);

  const updateB2BEkstre = useCallback(async (ekstreId: number, data: B2BAssignmentFormData) => {
    console.log(`[updateB2BEkstre] API'ye gönderilen veri: ekstreId=${ekstreId}, data=`, data);
    const updatedEkstre = await fetchData<B2BEkstre>(`${API_BASE_URL}/b2b-ekstreler/${ekstreId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedEkstre) {
      setB2BEkstreList(prevList =>
        prevList.map(e => (e.Ekstre_ID === ekstreId ? updatedEkstre : e))
      );
    }
  }, []);

  const uploadB2BEkstre = useCallback(async (formData: FormData) => {
    const result = await fetchData<any>(`${API_BASE_URL}/b2b-ekstreler/upload/`, {
        method: 'POST',
        body: formData,
    });
    return result;
  }, []);

  const uploadOdeme = useCallback(async (formData: FormData) => {
    const result = await fetchData<any>(`${API_BASE_URL}/odeme/upload-csv/`, {
        method: 'POST',
        body: formData,
    });
    return result;
  }, []);

  const uploadPosHareketleri = useCallback(async (formData: FormData) => {
    const result = await fetchData<any>(`${API_BASE_URL}/pos-hareketleri/upload/`, {
        method: 'POST',
        body: formData,
    }, true);
    return result;
  }, []);

  const uploadTabakSayisi = useCallback(async (formData: FormData) => {
    const result = await fetchData<any>(`${API_BASE_URL}/upload-tabak-sayisi/`, {
        method: 'POST',
        body: formData,
    });
    return result;
  }, []);

  const addDigerHarcama = useCallback(async (data: DigerHarcamaFormData) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key as keyof DigerHarcamaFormData];
        if (value instanceof File) {
            formData.append('image', value, value.name); // FastAPI expects the file under 'image' field
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    const newHarcama = await fetchData<DigerHarcama>(`${API_BASE_URL}/diger-harcamalar/`, {
      method: 'POST',
      body: formData,
    });

    if (newHarcama) {
      setDigerHarcamaList(prevList => [...prevList, newHarcama]);
      return { success: true, data: newHarcama };
    }
    return { success: false, message: "Diğer harcama eklenirken bir hata oluştu." };
  }, []);

  const updateDigerHarcama = useCallback(async (harcamaId: number, data: DigerHarcamaFormData) => {
    const formData = new FormData();

    // Append all fields from data to formData
    Object.keys(data).forEach(key => {
        const value = data[key as keyof DigerHarcamaFormData];
        if (value instanceof File) {
            formData.append(key, value, value.name);
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    const updatedHarcama = await fetchData<DigerHarcama>(`${API_BASE_URL}/diger-harcamalar/${harcamaId}`, {
      method: 'PUT',
      body: formData, // No headers needed for FormData, browser sets it
    });

    if (updatedHarcama) {
      setDigerHarcamaList(prevList =>
        prevList.map(h => (h.Harcama_ID === harcamaId ? updatedHarcama : h))
      );
      return { success: true, data: updatedHarcama };
    }
    return { success: false, message: "Diğer harcama güncellenirken bir hata oluştu." };
  }, []);
  
  const deleteDigerHarcama = useCallback(async (harcamaId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/diger-harcamalar/${harcamaId}`, {
      method: 'DELETE',
    });
    if (success) {
      setDigerHarcamaList(prevList => prevList.filter(h => h.Harcama_ID !== harcamaId));
    }
  }, []);

  const addStok = useCallback(async (stok: Stok) => {
    const newStok = await fetchData<Stok>(`${API_BASE_URL}/stoklar/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stok),
    });
    if (newStok) {
      setStokList(prevStokList => [...prevStokList, newStok]);
      return { success: true };
    }
    return { success: false, message: "Stok eklenirken bir hata oluştu." };
  }, []);

  const updateStok = useCallback(async (stokId: number, data: StokFormData) => {
    const updatedStok = await fetchData<Stok>(`${API_BASE_URL}/stoklar/${stokId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedStok) {
      setStokList(prevStokList =>
        prevStokList.map(s => (s.Stok_ID === stokId ? updatedStok : s))
      );
      return { success: true };
    }
    return { success: false, message: "Stok güncellenirken bir hata oluştu." };
  }, []);

  const addStokFiyat = useCallback(async (stokFiyat: StokFiyat) => {
    const newStokFiyat = await fetchData<StokFiyat>(`${API_BASE_URL}/stok-fiyatlar/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stokFiyat),
    });
    if (newStokFiyat) {
      setStokFiyatList(prevStokFiyatList => [...prevStokFiyatList, newStokFiyat]);
      return { success: true };
    }
    return { success: false, message: "Stok fiyatı eklenirken bir hata oluştu." };
  }, []);

  const updateStokFiyat = useCallback(async (fiyatId: number, data: StokFiyatFormData) => {
    const updatedStokFiyat = await fetchData<StokFiyat>(`${API_BASE_URL}/stok-fiyatlar/${fiyatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedStokFiyat) {
      setStokFiyatList(prevStokFiyatList =>
        prevStokFiyatList.map(f => (f.Fiyat_ID === fiyatId ? updatedStokFiyat : f))
      );
      return { success: true };
    }
    return { success: false, message: "Stok fiyatı güncellenirken bir hata oluştu." };
  }, []);

  const addOrUpdateStokSayim = useCallback(async (sayimData: { Malzeme_Kodu: string; Donem: string; Miktar: number; Sube_ID: number }) => {
    const existingSayim = stokSayimList.find(
      s => s.Malzeme_Kodu === sayimData.Malzeme_Kodu && s.Donem === sayimData.Donem && s.Sube_ID === sayimData.Sube_ID
    );

    if (existingSayim) {
      const updatedSayim = await fetchData<StokSayim>(`${API_BASE_URL}/stok-sayimlar/${existingSayim.Sayim_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Miktar: sayimData.Miktar, Donem: sayimData.Donem, Sube_ID: sayimData.Sube_ID, Malzeme_Kodu: sayimData.Malzeme_Kodu }),
      });
      if (updatedSayim) {
        setStokSayimList(prevList =>
          prevList.map(s => (s.Sayim_ID === updatedSayim.Sayim_ID ? updatedSayim : s))
        );
        return { success: true };
      }
    } else {
      const newSayim = await fetchData<StokSayim>(`${API_BASE_URL}/stok-sayimlar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sayimData),
      });
      if (newSayim) {
        setStokSayimList(prevList => [...prevList, newSayim]);
        return { success: true };
      }
    }
    return { success: false, message: "Stok sayım eklenirken/güncellenirken bir hata oluştu." };
  }, [stokSayimList]);

  const addCalisan = useCallback(async (calisan: Calisan) => {
    const newCalisan = await fetchData<Calisan>(`${API_BASE_URL}/calisanlar/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calisan),
    });
    if (newCalisan) {
      setCalisanList(prevList => [...prevList, newCalisan]);
      return { success: true };
    }
    return { success: false, message: "Çalışan eklenirken bir hata oluştu." };
  }, []);

  const updateUser = useCallback(async (userId: number, userData: Partial<KullaniciFormData>) => {
    const updatedUser = await fetchData<Kullanici>(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (updatedUser) {
      setUserList(prevList =>
        prevList.map(u => (u.Kullanici_ID === userId ? updatedUser : u))
      );
      return { success: true };
    }
    return { success: false, message: "Kullanıcı güncellenirken bir hata oluştu." };
  }, []);

  const updateCalisan = useCallback(async (tcNo: string, data: Omit<CalisanFormData, 'TC_No'>) => {
    const updatedCalisan = await fetchData<Calisan>(`${API_BASE_URL}/calisanlar/${tcNo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedCalisan) {
      setCalisanList(prevList =>
        prevList.map(c => (c.TC_No === tcNo ? updatedCalisan : c))
      );
      return { success: true };
    }
    return { success: false, message: "Çalışan güncellenirken bir hata oluştu." };
  }, []);

  const addUser = useCallback(async (userData: KullaniciFormData) => {
    const newUser = await fetchData<Kullanici>(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (newUser) {
      setUserList(prevList => [...prevList, newUser]);
      return { success: true };
    }
    return { success: false, message: "Kullanıcı eklenirken bir hata oluştu." };
  }, []);

  const addPuantajSecimi = useCallback(async (secim: PuantajSecimi) => {
    const newSecim = await fetchData<PuantajSecimi>(`${API_BASE_URL}/puantaj-secimi/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(secim),
    });
    if (newSecim) {
      setPuantajSecimiList(prevList => [...prevList, newSecim]);
      return { success: true };
    }
    return { success: false, message: "Puantaj seçimi eklenirken bir hata oluştu." };
  }, []);

  const updatePuantajSecimi = useCallback(async (secimId: number, data: PuantajSecimiFormData) => {
    const updatedSecim = await fetchData<PuantajSecimi>(`${API_BASE_URL}/puantaj-secimi/${secimId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedSecim) {
      setPuantajSecimiList(prevList =>
        prevList.map(ps => (ps.Secim_ID === secimId ? updatedSecim : ps))
      );
      return { success: true };
    }
    return { success: false, message: "Puantaj seçimi güncellenirken bir hata oluştu." };
  }, []);

  const addOrUpdatePuantajEntry = useCallback(async (entry: PuantajEntry) => {
    const existingPuantaj = puantajList.find(
      p => p.TC_No === entry.TC_No && p.Tarih === entry.Tarih && p.Sube_ID === entry.Sube_ID
    );

    if (entry.Secim_ID === null) {
      if (existingPuantaj) {
        await fetchData<any>(`${API_BASE_URL}/puantajlar/${existingPuantaj.Puantaj_ID}`, {
          method: 'DELETE',
        });
        setPuantajList(prevList => prevList.filter(p => p.Puantaj_ID !== existingPuantaj.Puantaj_ID));
      }
      return;
    }

    const secim = puantajSecimiList.find(s => s.Secim_ID === entry.Secim_ID);
    if (secim && secim.Secim === 'Çıkış') {
        const calisan = calisanList.find(c => c.TC_No === entry.TC_No);
        if (calisan) {
            await updateCalisan(entry.TC_No, { ...calisan, Sigorta_Cikis: entry.Tarih });
        }
    }

    if (existingPuantaj) {
      const updatedPuantaj = await fetchData<Puantaj>(`${API_BASE_URL}/puantajlar/${existingPuantaj.Puantaj_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Secim_ID: entry.Secim_ID }),
      });
      if (updatedPuantaj) {
        setPuantajList(prevList =>
          prevList.map(p => (p.Puantaj_ID === updatedPuantaj.Puantaj_ID ? updatedPuantaj : p))
        );
      }
    } else {
      const newPuantaj = await fetchData<Puantaj>(`${API_BASE_URL}/puantajlar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (newPuantaj) {
        setPuantajList(prevList => [...prevList, newPuantaj]);
      }
    }
  }, [puantajList, puantajSecimiList, calisanList, updateCalisan]);
  
  const getPuantajEntry = useCallback((tcNo: string, tarih: string, subeId: number): Puantaj | undefined => {
    // This function is currently used for local lookup. If direct API call is needed, it should be async.
    return puantajList.find(p => p.TC_No === tcNo && p.Tarih === tarih && p.Sube_ID === subeId);
  }, [puantajList]);

  const deletePuantajEntry = useCallback(async (tcNo: string, tarih: string, subeId: number) => {
    const existingPuantaj = puantajList.find(p => p.TC_No === tcNo && p.Tarih === tarih && p.Sube_ID === subeId);
    if (existingPuantaj) {
      const success = await fetchData<any>(`${API_BASE_URL}/puantajlar/${existingPuantaj.Puantaj_ID}`, {
        method: 'DELETE',
      });
      if (success) {
        setPuantajList(prevList => 
            prevList.filter(p => !(p.TC_No === tcNo && p.Tarih === tarih && p.Sube_ID === subeId))
        );
      }
    }
  }, [puantajList]);

  const addOrUpdateGelirEntry = useCallback(async (entry: Omit<Gelir, 'Gelir_ID' | 'Kayit_Tarihi'>) => {
    const existingGelir = gelirList.find(
      g => g.Sube_ID === entry.Sube_ID && g.Tarih === entry.Tarih && g.Kategori_ID === entry.Kategori_ID
    );

    if (existingGelir) {
      const updatedGelir = await fetchData<Gelir>(`${API_BASE_URL}/gelirler/${existingGelir.Gelir_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tutar: entry.Tutar }),
      });
      if (updatedGelir) {
        setGelirList(prevList =>
          prevList.map(g => (g.Gelir_ID === updatedGelir.Gelir_ID ? updatedGelir : g))
        );
      }
    } else {
      const newGelir = await fetchData<Gelir>(`${API_BASE_URL}/gelirler/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (newGelir) {
        setGelirList(prevList => [...prevList, newGelir]);
      }
    }
  }, [gelirList]);

  const getGelirEntry = useCallback((kategoriId: number, tarih: string, subeId: number): Gelir | undefined => {
    // This function is currently used for local lookup. If direct API call is needed, it should be async.
    return gelirList.find(g => g.Sube_ID === subeId && g.Tarih === tarih && g.Kategori_ID === kategoriId);
  }, [gelirList]);

  const addOrUpdateGelirEkstraEntry = useCallback(async (entry: Omit<GelirEkstra, 'GelirEkstra_ID' | 'Kayit_Tarihi'>) => {
    const existingGelirEkstra = gelirEkstraList.find(
      ge => ge.Sube_ID === entry.Sube_ID && ge.Tarih === entry.Tarih
    );

    if (existingGelirEkstra) {
      const updatedGelirEkstra = await fetchData<GelirEkstra>(`${API_BASE_URL}/gelir-ekstra/${existingGelirEkstra.GelirEkstra_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          RobotPos_Tutar: entry.RobotPos_Tutar,
          Bankaya_Yatan_Tutar: entry.Bankaya_Yatan_Tutar,
          ZRapor_Tutar: entry.ZRapor_Tutar,
        }),
      });
      if (updatedGelirEkstra) {
        setGelirEkstraList(prevList =>
          prevList.map(ge => (ge.GelirEkstra_ID === updatedGelirEkstra.GelirEkstra_ID ? updatedGelirEkstra : ge))
        );
      }
    } else {
      const newGelirEkstra = await fetchData<GelirEkstra>(`${API_BASE_URL}/gelir-ekstra/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (newGelirEkstra) {
        setGelirEkstraList(prevList => [...prevList, newGelirEkstra]);
      }
    }
  }, [gelirEkstraList]);

  const getGelirEkstraEntry = useCallback((tarih: string, subeId: number): GelirEkstra | undefined => {
    // This function is currently used for local lookup. If direct API call is needed, it should be async.
    return gelirEkstraList.find(ge => ge.Sube_ID === subeId && ge.Tarih === tarih);
  }, [gelirEkstraList]);

  const fetchAvansIsteklerByPeriod = useCallback(async (period: string, subeId: number) => {
    const avanslar = await fetchData<AvansIstek[]>(`${API_BASE_URL}/avans-istekler/?donem=${period}&sube_id=${subeId}`);
    if (avanslar) {
      setAvansIstekList(avanslar);
    }
  }, []);

  const addOrUpdateAvansIstek = useCallback(async (data: { TC_No: string; Donem: number; Sube_ID: number; Tutar: number; Aciklama?: string }) => {
    const existingAvans = avansIstekList.find(a => a.TC_No === data.TC_No && a.Donem === data.Donem && a.Sube_ID === data.Sube_ID);

    if (existingAvans) {
      const updatedAvans = await fetchData<AvansIstek>(`${API_BASE_URL}/avans-istekler/${existingAvans.Avans_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tutar: data.Tutar, Aciklama: data.Aciklama }),
      });
      if (updatedAvans) {
        setAvansIstekList(prevList =>
          prevList.map(a => (a.Avans_ID === updatedAvans.Avans_ID ? updatedAvans : a))
        );
        return { success: true };
      }
    } else {
      const newAvans = await fetchData<AvansIstek>(`${API_BASE_URL}/avans-istekler/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (newAvans) {
        setAvansIstekList(prevList => [...prevList, newAvans]);
        return { success: true };
      }
    }
    return { success: false, message: "Avans isteği eklenirken/güncellenirken bir hata oluştu." };
  }, [avansIstekList]);

  const deleteAvansIstek = useCallback(async (tcNo: string, donem: number, subeId: number) => {
    const existingAvans = avansIstekList.find(a => a.TC_No === tcNo && a.Donem === donem && a.Sube_ID === subeId);
    if (existingAvans) {
      const success = await fetchData<any>(`${API_BASE_URL}/avans-istekler/${existingAvans.Avans_ID}`, {
        method: 'DELETE',
      });
      if (success) {
        setAvansIstekList(prevList => prevList.filter(a => !(a.TC_No === tcNo && a.Donem === donem && a.Sube_ID === subeId)));
        return { success: true };
      }
    }
    return { success: false, message: "Avans isteği silinirken bir hata oluştu." };
  }, [avansIstekList]);

  const getAvansIstek = useCallback((tcNo: string, donem: number, subeId: number): AvansIstek | undefined => {
    // This function is currently used for local lookup. If direct API call is needed, it should be async.
    return avansIstekList.find(a => a.TC_No === tcNo && a.Donem === donem && a.Sube_ID === subeId);
  }, [avansIstekList]);

  const addEFaturaReferans = useCallback(async (data: EFaturaReferansFormData) => {
    const newReferans = await fetchData<EFaturaReferans>(`${API_BASE_URL}/e-fatura-referans/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newReferans) {
      setEFaturaReferansList(prev => [...prev, newReferans]);
      return { success: true };
    }
    return { success: false, message: "e-Fatura referansı eklenirken bir hata oluştu." };
  }, []);

  const updateEFaturaReferans = useCallback(async (Alici_Unvani: string, data: Partial<EFaturaReferansFormData>) => {
    const updatedReferans = await fetchData<EFaturaReferans>(`${API_BASE_URL}/e-fatura-referans/${Alici_Unvani}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedReferans) {
      setEFaturaReferansList(prev =>
        prev.map(ref => (ref.Alici_Unvani === Alici_Unvani ? updatedReferans : ref))
      );
      return { success: true };
    }
    return { success: false, message: "e-Fatura referansı güncellenirken bir hata oluştu." };
  }, []);

  const deleteEFaturaReferans = useCallback(async (Alici_Unvani: string) => {
    const success = await fetchData<any>(`${API_BASE_URL}/e-fatura-referans/${Alici_Unvani}`, {
      method: 'DELETE',
    });
    if (success) {
      setEFaturaReferansList(prev => prev.filter(ref => ref.Alici_Unvani !== Alici_Unvani));
      return { success: true };
    }
    return { success: false, message: "e-Fatura referansı silinirken bir hata oluştu." };
  }, []);

  const addOdemeReferans = useCallback(async (data: OdemeReferansFormData) => {
    const newReferans = await fetchData<OdemeReferans>(`${API_BASE_URL}/Odeme_Referans/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newReferans) {
      setOdemeReferansList(prev => [...prev, newReferans]);
      return { success: true };
    }
    return { success: false, message: "Ödeme referansı eklenirken bir hata oluştu." };
  }, []);

  const updateOdemeReferans = useCallback(async (referansId: number, data: Partial<OdemeReferansFormData>) => {
    const updatedReferans = await fetchData<OdemeReferans>(`${API_BASE_URL}/Odeme_Referans/${referansId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedReferans) {
      setOdemeReferansList(prev =>
        prev.map(ref => (ref.Referans_ID === referansId ? updatedReferans : ref))
      );
      return { success: true };
    }
    return { success: false, message: "Ödeme referansı güncellenirken bir hata oluştu." };
  }, []);

  const deleteOdemeReferans = useCallback(async (referansId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/Odeme_Referans/${referansId}`, {
      method: 'DELETE',
    });
    if (success) {
      setOdemeReferansList(prev => prev.filter(ref => ref.Referans_ID !== referansId));
      return { success: true };
    }
    return { success: false, message: "Ödeme referansı silinirken bir hata oluştu." };
  }, []);

  const updateCalisanTalep = useCallback(async (talepId: number, data: Partial<CalisanTalep>) => {
    const updatedTalep = await fetchData<CalisanTalep>(`${API_BASE_URL}/calisan-talepler/${talepId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (updatedTalep) {
      setCalisanTalepList(prev =>
        prev.map(t => (t.Calisan_Talep_ID === talepId ? updatedTalep : t))
      );
      return { success: true, data: updatedTalep };
    }
    return { success: false, message: "Çalışan talebi güncellenirken bir hata oluştu." };
  }, [setCalisanTalepList]);

  const addCalisanTalep = useCallback(async (data: Partial<CalisanTalep>) => {
    const newTalep = await fetchData<CalisanTalep>(`${API_BASE_URL}/calisan-talepler/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (newTalep) {
      setCalisanTalepList(prev => [...prev, newTalep]);
      return { success: true, data: newTalep };
    }
    return { success: false, message: "Çalışan talebi oluşturulurken bir hata oluştu." };
  }, [setCalisanTalepList]);

  const deleteCalisanTalep = useCallback(async (talepId: number) => {
    const result = await fetchData<any>(`${API_BASE_URL}/calisan-talepler/${talepId}`, {
      method: 'DELETE',
    });
    if (result) {
      setCalisanTalepList(prev => prev.filter(t => t.Calisan_Talep_ID !== talepId));
      return { success: true };
    }
    return { success: false, message: "Çalışan talebi silinirken bir hata oluştu." };
  }, []);

  const addUstKategori = useCallback(async (data: UstKategoriFormData) => {    const newUstKategori = await fetchData<UstKategori>(`${API_BASE_URL}/ust-kategoriler/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newUstKategori) {
      setUstKategoriList(prev => [...prev, newUstKategori]);
      return { success: true };
    }
    return { success: false, message: "Üst kategori eklenirken bir hata oluştu." };
  }, []);

  const updateUstKategori = useCallback(async (ustKategoriId: number, data: UstKategoriFormData) => {
    const updatedUstKategori = await fetchData<UstKategori>(`${API_BASE_URL}/ust-kategoriler/${ustKategoriId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedUstKategori) {
      setUstKategoriList(prev =>
        prev.map(uk => (uk.UstKategori_ID === ustKategoriId ? updatedUstKategori : uk))
      );
      return { success: true };
    }
    return { success: false, message: "Üst kategori güncellenirken bir hata oluştu." };
  }, []);
  
  const addKategori = useCallback(async (data: KategoriFormData) => {
      const newKategori = await fetchData<Kategori>(`${API_BASE_URL}/kategoriler/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (newKategori) {
        setKategoriList(prev => [...prev, newKategori]);
        return { success: true };
      }
      return { success: false, message: "Kategori eklenirken bir hata oluştu." };
  }, []);

  const updateKategori = useCallback(async (kategoriId: number, data: KategoriFormData) => {
      const updatedKategori = await fetchData<Kategori>(`${API_BASE_URL}/kategoriler/${kategoriId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (updatedKategori) {
        setKategoriList(prev =>
          prev.map(k => (k.Kategori_ID === kategoriId ? updatedKategori : k))
        );
        return { success: true };
      }
      return { success: false, message: "Kategori güncellenirken bir hata oluştu." };
  }, []);

  const addRole = useCallback(async (data: Rol) => {
    const newRole = await fetchData<Rol>(`${API_BASE_URL}/roles/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newRole) {
      setRolesList(prev => [...prev, newRole]);
      return { success: true };
    }
    return { success: false, message: "Rol eklenirken bir hata oluştu." };
  }, []);

  const updateRole = useCallback(async (roleId: number, data: Rol) => {
    const updatedRole = await fetchData<Rol>(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedRole) {
      setRolesList(prev =>
        prev.map(r => (r.Rol_ID === roleId ? updatedRole : r))
      );
      return { success: true };
    }
    return { success: false, message: "Rol güncellenirken bir hata oluştu." };
  }, []);

  const deleteRole = useCallback(async (roleId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'DELETE',
    });
    if (success) {
      setRolesList(prev => prev.filter(r => r.Rol_ID !== roleId));
      return { success: true };
    }
    return { success: false, message: "Rol silinirken bir hata oluştu." };
  }, []);

  const addPermission = useCallback(async (data: Yetki) => {
    const newPermission = await fetchData<Yetki>(`${API_BASE_URL}/yetkiler/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newPermission) {
      setPermissionsList(prev => [...prev, newPermission]);
      return { success: true };
    }
    return { success: false, message: "Yetki eklenirken bir hata oluştu." };
  }, []);

  const updatePermission = useCallback(async (yetkiId: number, data: Yetki) => {
    const updatedPermission = await fetchData<Yetki>(`${API_BASE_URL}/yetkiler/${yetkiId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedPermission) {
      setPermissionsList(prev =>
        prev.map(p => (p.Yetki_ID === yetkiId ? updatedPermission : p))
      );
      return { success: true };
    }
    return { success: false, message: "Yetki güncellenirken bir hata oluştu." };
  }, []);

  const deletePermission = useCallback(async (yetkiId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/yetkiler/${yetkiId}`, {
      method: 'DELETE',
    });
    if (success) {
      setPermissionsList(prev => prev.filter(p => p.Yetki_ID !== yetkiId));
      return { success: true };
    }
    return { success: false, message: "Yetki silinirken bir hata oluştu." };
  }, []);

  const addUserRole = useCallback(async (userRole: KullaniciRol) => {
    const newUserRole = await fetchData<KullaniciRol>(`${API_BASE_URL}/kullanici-rolleri/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userRole),
    });
    if (newUserRole) {
      // Find the corresponding user to get their Adi_Soyadi and Username
      const userDetails = userList.find(u => u.Kullanici_ID === newUserRole.Kullanici_ID);
      const roleDetails = rolesList.find(r => r.Rol_ID === newUserRole.Rol_ID);
      const subeDetails = subeList.find(s => s.Sube_ID === newUserRole.Sube_ID);

      const enrichedUserRole = {
        ...newUserRole,
        Kullanici_Adi: userDetails?.Kullanici_Adi, // This should be the username
        Rol_Adi: roleDetails?.Rol_Adi,
        Sube_Adi: subeDetails?.Sube_Adi,
      };
      setUserRolesList(prev => [...prev, enrichedUserRole]);
      return { success: true };
    }
    return { success: false, message: "Kullanıcı rolü eklenirken bir hata oluştu." };
  }, [userList, rolesList, subeList]);

  const updateUserRole = useCallback(async (kullaniciId: number, roleId: number, subeId: number, data: Partial<KullaniciRol>) => {
    const existingUserRole = userRolesList.find(ur => ur.Kullanici_ID === kullaniciId && ur.Rol_ID === roleId && ur.Sube_ID === subeId);
    if (!existingUserRole) {
      return { success: false, message: "Güncellenecek kullanıcı rolü bulunamadı." };
    }
    const updatedUserRole = await fetchData<KullaniciRol>(`${API_BASE_URL}/kullanici-rolleri/${kullaniciId}/${roleId}/${subeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedUserRole) {
      setUserRolesList(prev =>
        prev.map(ur => (ur.Kullanici_ID === kullaniciId && ur.Rol_ID === roleId && ur.Sube_ID === subeId ? updatedUserRole : ur))
      );
      return { success: true };
    }
    return { success: false, message: "Kullanıcı rolü güncellenirken bir hata oluştu." };
  }, [userRolesList]);

  const deleteUserRole = useCallback(async (kullaniciId: number, roleId: number, subeId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/kullanici-rolleri/${kullaniciId}/${roleId}/${subeId}`, {
      method: 'DELETE',
    });
    if (success) {
      setUserRolesList(prev => prev.filter(ur => !(ur.Kullanici_ID === kullaniciId && ur.Rol_ID === roleId && ur.Sube_ID === subeId)));
      return { success: true };
    }
    return { success: false, message: "Kullanıcı rolü silinirken bir hata oluştu." };
  }, []);

  const addRolePermission = useCallback(async (rolePermission: RolYetki) => {
    const newRolePermission = await fetchData<RolYetki>(`${API_BASE_URL}/rol-yetkileri/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rolePermission),
    });
    if (newRolePermission) {
      setRolePermissionsList(prev => [...prev, newRolePermission]);
      return { success: true };
    }
    return { success: false, message: "Rol yetkisi eklenirken bir hata oluştu." };
  }, []);

  const updateRolePermission = useCallback(async (roleId: number, yetkiId: number, data: Partial<RolYetki>) => {
    const updatedRolePermission = await fetchData<RolYetki>(`${API_BASE_URL}/rol-yetkileri/${roleId}/${yetkiId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedRolePermission) {
      setRolePermissionsList(prev =>
        prev.map(rp => (rp.Rol_ID === roleId && rp.Yetki_ID === yetkiId ? updatedRolePermission : rp))
      );
      return { success: true };
    }
    return { success: false, message: "Rol yetkisi güncellenirken bir hata oluştu." };
  }, []);

  const deleteRolePermission = useCallback(async (roleId: number, yetkiId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/rol-yetkileri/${roleId}/${yetkiId}`, {
      method: 'DELETE',
    });
    if (success) {
      setRolePermissionsList(prev => prev.filter(rp => !(rp.Rol_ID === roleId && rp.Yetki_ID === yetkiId)));
      return { success: true };
    }
    return { success: false, message: "Rol yetkisi silinirken bir hata oluştu." };
  }, []);

  const addNakit = useCallback(async (data: FormData) => {
    const newNakit = await fetchData<Nakit>(`${API_BASE_URL}/nakit/`, {
      method: 'POST',
      body: data,
    });
    if (newNakit) {
      setNakitList(prev => [...prev, newNakit]);
      return { success: true, message: "Nakit girişi başarıyla eklendi." };
    }
    return { success: false, message: "Nakit girişi eklenirken bir hata oluştu." };
  }, []);

  const updateNakit = useCallback(async (nakitId: number, data: FormData) => {
    const updatedNakit = await fetchData<Nakit>(`${API_BASE_URL}/nakit/${nakitId}`, {
      method: 'PUT',
      body: data,
    });
    if (updatedNakit) {
      setNakitList(prev =>
        prev.map(n => (n.Nakit_ID === nakitId ? updatedNakit : n))
      );
      return { success: true, message: "Nakit girişi başarıyla güncellendi." };
    }
    return { success: false, message: "Nakit girişi güncellenirken bir hata oluştu." };
  }, []);

  const deleteNakit = useCallback(async (nakitId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/nakit/${nakitId}`, {
      method: 'DELETE',
    });
    if (success) {
      setNakitList(prev => prev.filter(n => n.Nakit_ID !== nakitId));
      return { success: true, message: "Nakit girişi başarıyla silindi." };
    }
    return { success: false, message: "Nakit girişi silinirken bir hata oluştu." };
  }, []);

  const addYemekCeki = useCallback(async (formData: FormData) => {
    const newYemekCeki = await fetchData<YemekCeki>(`${API_BASE_URL}/yemek-cekiler/`, {
      method: 'POST',
      body: formData,
    });
    if (newYemekCeki) {
      setYemekCekiList(prev => [...prev, newYemekCeki]);
      return { success: true };
    }
    return { success: false, message: "Yemek çeki eklenirken bir hata oluştu." };
  }, []);

  const updateYemekCeki = useCallback(async (yemekCekiId: number, formData: FormData) => {
    const updatedYemekCeki = await fetchData<YemekCeki>(`${API_BASE_URL}/yemek-cekiler/${yemekCekiId}`, {
      method: 'PUT',
      body: formData,
    });
    if (updatedYemekCeki) {
      setYemekCekiList(prev =>
        prev.map(yc => (yc.ID === yemekCekiId ? updatedYemekCeki : yc))
      );
      return { success: true };
    }
    return { success: false, message: "Yemek çeki güncellenirken bir hata oluştu." };
  }, []);

  const deleteYemekCeki = useCallback(async (yemekCekiId: number) => {
    const result = await fetchData<any>(`${API_BASE_URL}/yemek-cekiler/${yemekCekiId}`, {
      method: 'DELETE',
    });
    if (result) {
      setYemekCekiList(prev => prev.filter(yc => yc.ID !== yemekCekiId));
      return { success: true };
    }
    return { success: false, message: "Yemek çeki silinirken bir hata oluştu." };
  }, []);

  const updateOdeme = useCallback(async (odemeId: number, data: OdemeAssignmentFormData) => {
    console.log(`[updateOdeme] API'ye gönderilen veri: odemeId=${odemeId}, data=`, data);
    const updatedOdeme = await fetchData<Odeme>(`${API_BASE_URL}/Odeme/${odemeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedOdeme) {
      setOdemeList(prevList =>
        prevList.map(o => (o.Odeme_ID === odemeId ? updatedOdeme : o))
      );
    }
  }, []);

  const dataContextValue: DataContextType = useMemo(() => ({
    isInitialDataLoaded,
    calisanTalepList,
    addCalisanTalep,
    updateCalisanTalep,
    deleteCalisanTalep,
    yemekCekiList,
    addYemekCeki,
    updateYemekCeki,
    deleteYemekCeki,
    subeList,
    addSube,
    updateSube,
    eFaturaList,
    addEFaturas,
    updateEFatura,
    b2bEkstreList,
    addB2BEkstreler,
    updateB2BEkstre,
    uploadB2BEkstre,
    digerHarcamaList,
    addDigerHarcama,
    updateDigerHarcama,
    deleteDigerHarcama,
    stokList,
    addStok,
    updateStok,
    stokFiyatList,
    addStokFiyat,
    updateStokFiyat,
    stokSayimList,
    addOrUpdateStokSayim,
    calisanList,
    addCalisan,
    updateCalisan,
    addUser,
    updateUser,
    puantajSecimiList,
    addPuantajSecimi,
    updatePuantajSecimi,
    puantajList,
    addOrUpdatePuantajEntry,
    getPuantajEntry,
    deletePuantajEntry,
    gelirList,
    addOrUpdateGelirEntry,
    getGelirEntry,
    gelirEkstraList,
    addOrUpdateGelirEkstraEntry,
    getGelirEkstraEntry,
    avansIstekList,
    fetchAvansIsteklerByPeriod,
    addOrUpdateAvansIstek,
    deleteAvansIstek,
    getAvansIstek,
    ustKategoriList,
    addUstKategori,
    updateUstKategori,
    kategoriList,
    addKategori,
    updateKategori,
    degerList,
    fetchDegerler,
    addDeger,
    updateDeger,
    userList,
    rolesList,
    addRole,
    updateRole,
    deleteRole,
    permissionsList,
    addPermission,
    updatePermission,
    deletePermission,
    userRolesList,
    addUserRole,
    updateUserRole,
    deleteUserRole,
    rolePermissionsList,
    addRolePermission,
    updateRolePermission,
    deleteRolePermission,
    eFaturaReferansList,
    addEFaturaReferans,
    updateEFaturaReferans,
    deleteEFaturaReferans,
    odemeReferansList,
    addOdemeReferans,
    updateOdemeReferans,
    deleteOdemeReferans,
    nakitList,
    addNakit,
    updateNakit,
    deleteNakit,
    odemeList,
    updateOdeme,
    uploadOdeme,
    uploadPosHareketleri,
    uploadTabakSayisi,
  }), [depoKiraRapor, yemekCekiList, addYemekCeki, updateYemekCeki, deleteYemekCeki, subeList, eFaturaList, b2bEkstreList, digerHarcamaList, stokList, stokFiyatList, stokSayimList, calisanList, puantajSecimiList, puantajList, gelirList, gelirEkstraList, avansIstekList, ustKategoriList, kategoriList, degerList, userList, rolesList, permissionsList, userRolesList, rolePermissionsList, eFaturaReferansList, odemeReferansList, nakitList, odemeList, addSube, updateSube, addEFaturas, updateEFatura, addB2BEkstreler, updateB2BEkstre, addDigerHarcama, updateDigerHarcama, deleteDigerHarcama, addStok, updateStok, addStokFiyat, updateStokFiyat, addOrUpdateStokSayim, addCalisan, updateCalisan, addUser, updateUser, addPuantajSecimi, updatePuantajSecimi, addOrUpdatePuantajEntry, getPuantajEntry, deletePuantajEntry, addOrUpdateGelirEntry, getGelirEntry, addOrUpdateGelirEkstraEntry, getGelirEkstraEntry, addOrUpdateAvansIstek, deleteAvansIstek, getAvansIstek, addUstKategori, updateUstKategori, addKategori, updateKategori, fetchDegerler, addDeger, updateDeger, addRole, updateRole, deleteRole, addPermission, updatePermission, deletePermission, addUserRole, updateUserRole, deleteUserRole, addRolePermission, updateRolePermission, deleteRolePermission, addEFaturaReferans, updateEFaturaReferans, deleteEFaturaReferans, addOdemeReferans, updateOdemeReferans, deleteOdemeReferans, addNakit, updateNakit, deleteNakit, updateOdeme,     uploadOdeme, uploadPosHareketleri, uploadTabakSayisi, calisanTalepList, updateCalisanTalep, deleteCalisanTalep, isInitialDataLoaded]);

  return <DataContext.Provider value={dataContextValue}>{children}</DataContext.Provider>;
};


// Enhanced App component with toast notifications for login
const AppWithToast: React.FC = () => {
  const { showError } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => (loadFromLocalStorage<Partial<StoredAppState>>(STORAGE_KEYS.APP_STATE, {})).isAuthenticated || false);
  const [currentUser, setCurrentUser] = useState<Kullanici | null>(() => (loadFromLocalStorage<Partial<StoredAppState>>(STORAGE_KEYS.APP_STATE, {})).currentUser || null);
  const [selectedBranch, setSelectedBranch] = useState<Sube | null>(() => {
    const storedBranch = (loadFromLocalStorage<Partial<StoredAppState>>(STORAGE_KEYS.APP_STATE, {})).selectedBranch;
    return storedBranch || { Sube_ID: 1, Sube_Adi: 'Brandium', Aktif_Pasif: true }; // Default to Brandium if not in local storage
  });
  const [currentPeriod, setCurrentPeriod] = useState<string>(() => {
    const storedState = loadFromLocalStorage<Partial<StoredAppState>>(STORAGE_KEYS.APP_STATE, {});
    return storedState.currentPeriod || DEFAULT_PERIOD;
  });
  const [currentUserPermissions, setCurrentUserPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    setCurrentPeriod(DEFAULT_PERIOD);
  }, []);

  // Persist App state to localStorage
  const appState = useMemo(() => ({ isAuthenticated, currentUser, selectedBranch, currentPeriod }), [isAuthenticated, currentUser, selectedBranch, currentPeriod]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (currentUser && selectedBranch) {
        const userRoles = await fetchData<KullaniciRol[]>(`${API_BASE_URL}/kullanici-rolleri/?kullanici_id=${currentUser.Kullanici_ID}`);
        if (!userRoles) return;

        const activeUserRoleIds = userRoles
          .filter(ur => ur.Sube_ID === selectedBranch.Sube_ID && ur.Aktif_Pasif)
          .map(ur => ur.Rol_ID);

        const allRoles = await fetchData<Rol[]>(`${API_BASE_URL}/roller/`);
        const isAdminRoleAssigned = allRoles && allRoles.some(role => 
            activeUserRoleIds.includes(role.Rol_ID) && role.Rol_Adi.toLowerCase() === 'admin'
        );

        if (isAdminRoleAssigned || currentUser.Kullanici_Adi.toLowerCase() === 'admin') {
            setIsAdmin(true);
            const allPermissions = await fetchData<Yetki[]>(`${API_BASE_URL}/yetkiler/`);
            if (allPermissions) {
                setCurrentUserPermissions(allPermissions.map(p => p.Yetki_Adi));
            }
        } else {
            setIsAdmin(false);
            const rolePermissions = await fetchData<RolYetki[]>(`${API_BASE_URL}/rol-yetkileri/`);
            const allPermissions = await fetchData<Yetki[]>(`${API_BASE_URL}/yetkiler/`);
            if (rolePermissions && allPermissions) {
                const permissionsForUser = rolePermissions
                    .filter(rp => activeUserRoleIds.includes(rp.Rol_ID) && rp.Aktif_Pasif)
                    .map(rp => allPermissions.find(p => p.Yetki_ID === rp.Yetki_ID)?.Yetki_Adi)
                    .filter((name): name is string => !!name);
                setCurrentUserPermissions(Array.from(new Set(permissionsForUser)));
            }
        }
      } else {
        setCurrentUserPermissions([]);
        setIsAdmin(false);
      }
    };

    fetchPermissions();
  }, [currentUser, selectedBranch]);


  const login = useCallback(async (username: string, password) => {
    const response = await fetchData(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    }, true);

    if (response) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
      const users = await fetchData<Kullanici[]>(`${API_BASE_URL}/users/`);
      const userToLogin = users?.find(u => u.Kullanici_Adi.toLowerCase() === username.toLowerCase());

      if (userToLogin && userToLogin.Aktif_Pasif) {
          setCurrentUser(userToLogin);
          setIsAuthenticated(true);
          
          const subeler = await fetchData<Sube[]>(`${API_BASE_URL}/subeler/`);
          if (subeler && subeler.length > 0) {
              const activeBranches = subeler.filter(b => b.Aktif_Pasif);
              if (!selectedBranch && activeBranches.length > 0) { 
                  setSelectedBranch(activeBranches[0]);
              } else if (!selectedBranch) {
                  setSelectedBranch(subeler[0]);
              }
          }
      } else {
          showError("Giriş Hatası", "Geçersiz kullanıcı adı veya kullanıcı pasif.");
      }
    } else {
      showError("Giriş Hatası", "Geçersiz kullanıcı adı veya şifre.");
    }
  }, [selectedBranch, showError]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedBranch(null);
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }, []);
  
  const selectBranch = useCallback((branch: Sube) => {
    setSelectedBranch(branch);
  }, []);

  const setPeriod = useCallback((period: string) => {
      if (period === "") {
          setCurrentPeriod(DEFAULT_PERIOD);
          return;
      }
      if (/^\d{0,4}$/.test(period)) {
          setCurrentPeriod(period);
      }
  }, []);

  const hasPermission = useCallback((permissionName: string): boolean => {
     return currentUserPermissions.includes(permissionName);
  }, [currentUserPermissions]);

  const appContextValue: AppContextType = {
    isAuthenticated,
    login,
    logout,
    currentUser,
    selectedBranch,
    selectBranch,
    currentPeriod,
    setPeriod,
    hasPermission,
    isAdmin,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ConnectionStatusBanner />
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/branches" element={<SubePage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/roles" element={<RolesPage />} />
                      <Route path="/permissions" element={<PermissionsPage />} />
                      <Route path="/user-role-assignment" element={<UserRoleAssignmentPage />} />
                      <Route path="/role-permission-assignment" element={<RolePermissionAssignmentPage />} />
                      <Route path="/e-fatura-referans" element={<EFaturaReferansPage />} />
                      <Route path="/odeme-referans" element={<OdemeReferansPage />} />
                      <Route path="/degerler" element={<DegerlerPage />} /> 
                      <Route path="/ust-kategoriler" element={<UstKategorilerPage />} />
                      <Route path="/kategoriler" element={<KategorilerPage />} />
                      <Route path="/invoice-upload" element={<InvoiceUploadPage />} />
                      <Route path="/invoice-category-assignment" element={<InvoiceCategoryAssignmentPage />} />
                      <Route path="/fatura-bolme-yonetimi" element={<FaturaBolmeYonetimiPage />} />
                      <Route path="/b2b-upload" element={<B2BUploadPage />} />
                      <Route path="/b2b-category-assignment" element={<B2BCategoryAssignmentPage />} />
                      <Route path="/odeme-yukleme" element={<OdemeYuklemePage />} />
                      <Route path="/odeme-kategori-atama" element={<OdemeKategoriAtamaPage />} />
                      
                      <Route path="/other-expenses" element={<DigerHarcamalarPage />} />
                      <Route path="/gelir" element={<GelirPage />} />
                      <Route path="/pos-hareketleri-yukleme" element={<POSHareketleriYuklemePage />} />
                      <Route path="/tabak-sayisi-yukleme" element={<TabakSayisiYuklemePage />} />
                      <Route path="/nakit-girisi" element={<NakitPage />} />
                      <Route path="/stock-definitions" element={<StokPage />} />
                      <Route path="/stock-prices" element={<StokFiyatPage />} />
                      <Route path="/stock-count" element={<StokSayimPage />} />
                      <Route path="/calisanlar" element={<CalisanPage />} />
                      <Route path="/puantaj-secim" element={<PuantajSecimPage />} />
                      <Route path="/puantaj" element={<PuantajPage />} />
                      <Route path="/avans" element={<AvansPage />} />
                      <Route path="/nakit-yatirma-raporu" element={<NakitYatirmaRaporuPage />} />
                      <Route path="/odeme-rapor" element={<OdemeRaporPage />} />
                      <Route path="/fatura-rapor" element={<FaturaRaporuPage />} />
                      <Route path="/fatura-diger-harcama-rapor" element={<FaturaDigerHarcamaRaporuPage />} />
                      <Route path="/pos-kontrol-dashboard" element={<POSKontrolDashboardPage />} />
                      <Route path="/online-kontrol-dashboard" element={<OnlineKontrolDashboardPage />} />
                      <Route path="/yemek-ceki" element={<YemekCekiPage />} />
                      <Route path="/yemek-ceki-kontrol-dashboard" element={<YemekCekiKontrolDashboardPage />} />
                      <Route path="/vps-dashboard" element={<VPSDashboardPage />} />
                      <Route path="/bayi-karlilik-raporu" element={<BayiKarlilikRaporuPage />} />
                      <Route path="/ozet-kontrol-raporu" element={<OzetKontrolRaporuPage />} />
                      <Route path="/nakit-akis-gelir-raporu" element={<NakitAkisGelirRaporuPage />} />
                      <Route path="/calisan-talep" element={<CalisanTalepPage />} />
                      <Route path="/cari-borc-takip-sistemi" element={<CariTakipEkrani />} />
                      <Route path="/cari-borc-yonetimi" element={<CariYonetim />} />
                      <Route path="/mutabakat-yonetimi" element={<MutabakatYonetim />} />
                      
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
        <ToastContainer />
      </DataProvider>
    </AppContext.Provider>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorProvider>
      <AppWithToast />
    </ErrorProvider>
  );
};

export default App;