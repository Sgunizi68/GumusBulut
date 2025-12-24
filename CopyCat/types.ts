export interface Sube {
  Sube_ID: number;
  Sube_Adi: string;
  Aciklama?: string;
  Aktif_Pasif: boolean;
}

export interface Kullanici {
  Kullanici_ID: number;
  Kullanici_Adi: string;
  Username: string;
  Email?: string;
  Expire_Date?: string; // Date string
  Aktif_Pasif: boolean;
  Password?: string; // Added for form submission, not for retrieval
}

export interface Rol {
  Rol_ID: number;
  Rol_Adi: string;
  Aciklama?: string;
  Aktif_Pasif: boolean;
}

export interface Yetki {
  Yetki_ID: number;
  Yetki_Adi:string;
  Aciklama?: string;
  Tip?: string; // e.g., 'Ekran', 'Islem'
  Aktif_Pasif: boolean;
}

export interface Deger {
  Deger_ID: number;
  Deger_Adi: string;
  Gecerli_Baslangic_Tarih: string; // DATE string YYYY-MM-DD
  Gecerli_Bitis_Tarih: string; // DATE string YYYY-MM-DD
  Deger_Aciklama?: string;
  Deger: number; // DECIMAL(15,2)
}

export interface UstKategori {
  UstKategori_ID: number;
  UstKategori_Adi: string;
  Aktif_Pasif: boolean;
}

export type KategoriTip = 'Gelir' | 'Gider' | 'Bilgi' | 'Ödeme' | 'Giden Fatura';

export interface Kategori {
  Kategori_ID: number;
  Kategori_Adi: string;
  Ust_Kategori_ID: number; // Foreign Key to UstKategori - Made mandatory
  Tip: KategoriTip;
  Aktif_Pasif: boolean;
  Gizli: boolean; // Default FALSE
}

export interface KullaniciRol {
  Kullanici_ID: number;
  Rol_ID: number;
  Sube_ID: number;
  Aktif_Pasif: boolean;
  // For display purposes, we might want to include names
  Kullanici_Adi?: string;
  Rol_Adi?: string;
  Sube_Adi?: string;
}

export interface RolYetki {
  Rol_ID: number;
  Yetki_ID: number;
  Aktif_Pasif: boolean;
   // For display purposes
  Rol_Adi?: string;
  Yetki_Adi?: string;
}

// For UI state, e.g. forms
export type SubeFormData = Omit<Sube, 'Sube_ID'> & { Sube_ID?: number };
export type KullaniciFormData = Omit<Kullanici, 'Kullanici_ID'> & { Kullanici_ID?: number };
export type RolFormData = Omit<Rol, 'Rol_ID'> & { Rol_ID?: number };
export type YetkiFormData = Omit<Yetki, 'Yetki_ID'> & { Yetki_ID?: number };
export type DegerFormData = Omit<Deger, 'Deger_ID'> & { Deger_ID?: number };
export type UstKategoriFormData = Omit<UstKategori, 'UstKategori_ID'> & { UstKategori_ID?: number };
export type KategoriFormData = Omit<Kategori, 'Kategori_ID' | 'Ust_Kategori_ID'> & { Kategori_ID?: number; Ust_Kategori_ID: number; };


export interface EFatura {
  Fatura_ID: number; // Primary Key, AUTO_INCREMENT
  Fatura_Tarihi: string; // DATE, NOT NULL (YYYY-MM-DD)
  Fatura_Numarasi: string; // VARCHAR(50), UNIQUE, NOT NULL
  Alici_Unvani: string; // VARCHAR(200), NOT NULL
  Alici_VKN_TCKN?: string; // VARCHAR(20)
  Tutar: number; // DECIMAL(15,2), NOT NULL
  Kategori_ID: number | null; // Foreign Key to Kategori.Kategori_ID
  Aciklama?: string; // TEXT
  Donem: string; // INT(4) -> string YYAA format (örn: "2307")
  Ozel: boolean; // BOOLEAN, DEFAULT FALSE
  Gunluk_Harcama: boolean; // BOOLEAN, DEFAULT FALSE
  Giden_Fatura: boolean; // TINYINT(1) -> boolean
  Sube_ID: number; // Foreign Key to Sube.Sube_ID, NOT NULL
  Kayit_Tarihi: string; // TIMESTAMP, DEFAULT CURRENT_TIMESTAMP (YYYY-MM-DD HH:mm:ss)
}

// Represents a row from the eFatura Excel file
export interface EFaturaExcelRow {
  "Alici Adi": string;
  "Fatura Numarasi": string;
  "Fatura Tarihi": string; // Expecting parsable date string, e.g., DD.MM.YYYY or YYYY-MM-DD
  "Geliş Tarihi"?: string; // Not directly in e_Fatura table
  "Senaryo"?: string; // Not directly in e_Fatura table
  "Durum": string; // e.g., "Onaylandı"
  "Tutar": number;
  "Alici VKN/TCKN"?: string; // Added based on database schema
  "Aciklama"?: string; // Added based on database schema
}

export type EFaturaFormData = Omit<EFatura, 'Fatura_ID' | 'Kayit_Tarihi' | 'Sube_ID' | 'Donem'> & { Fatura_ID?: number};

// For the InvoiceCategoryAssignment (inline editing or form)
export type InvoiceAssignmentFormData = Partial<Pick<EFatura, 'Kategori_ID' | 'Donem' | 'Gunluk_Harcama' | 'Ozel' | 'Aciklama' | 'Giden_Fatura'>>;

export interface B2BEkstre {
  Ekstre_ID: number;
  Tarih: string; // DATE
  Fis_No: string; // VARCHAR(50)
  Fis_Turu?: string; // VARCHAR(50)
  Aciklama?: string; // TEXT
  Borc: number; // DECIMAL(15,2), DEFAULT 0
  Alacak: number; // DECIMAL(15,2), DEFAULT 0
  Toplam_Bakiye: number; // DECIMAL(15,2)
  Fatura_No?: string; // VARCHAR(50)
  Fatura_Metni?: string; // TEXT
  Donem: string; // INT(4) -> YYAA
  Kategori_ID: number | null;
  Sube_ID: number;
  Kayit_Tarihi: string; // TIMESTAMP
}

export interface B2BEkstreExcelRow {
  "Tarih": string; // DD.MM.YYYY
  "Fiş No": string;
  "Fiş Türü"?: string;
  "Açıklama"?: string;
  "Borç"?: number;
  "Alacak"?: number;
  "Toplam Bakiye": number;
  "Fatura No"?: string;
  "Fatura Metni"?: string;
}

export type B2BAssignmentFormData = Partial<Pick<B2BEkstre, 'Kategori_ID' | 'Donem'>>;

export type HarcamaTipi = 'Nakit' | 'Banka Ödeme' | 'Kredi Kartı';

export interface DigerHarcama {
  Harcama_ID: number;
  Alici_Adi: string;
  Belge_Numarasi?: string;
  Belge_Tarihi: string; // DATE
  Donem: string; // YYAA
  Tutar: number;
  Kategori_ID: number | null;
  Harcama_Tipi: HarcamaTipi;
  Gunluk_Harcama: boolean;
  Sube_ID: number;
  Kayit_Tarihi: string; // TIMESTAMP
  Imaj?: string; // Base64 encoded image
  Imaj_Adi?: string; // Image filename
  Açıklama?: string; // TEXT
}

// DigerHarcamaFormData can now include 'Donem' for users with special permissions
export type DigerHarcamaFormData = Omit<DigerHarcama, 'Harcama_ID' | 'Sube_ID' | 'Kayit_Tarihi' | 'Imaj' | 'Imaj_Adi'> & { Harcama_ID?: number; Açıklama?: string; Imaj?: File | null; Imaj_Adi?: string | null; Donem?: string; };

export interface Stok {
  Stok_ID: number;
  Urun_Grubu: string;
  Malzeme_Kodu: string; // UNIQUE
  Malzeme_Aciklamasi: string;
  Birimi: string;
  Sinif?: string;
  Aktif_Pasif: boolean;
}
export type StokFormData = Omit<Stok, 'Stok_ID'>;

export interface StokFiyat {
  Fiyat_ID: number;
  Malzeme_Kodu: string; // Foreign Key to Stok.Malzeme_Kodu
  Gecerlilik_Baslangic_Tarih: string; // DATE
  Fiyat: number; // DECIMAL(10,2)
  Sube_ID: number; // Foreign Key to Sube.Sube_ID
  Aktif_Pasif: boolean; // BOOLEAN, DEFAULT TRUE
}
export type StokFiyatFormData = Omit<StokFiyat, 'Fiyat_ID'>;

export interface StokSayim {
  Sayim_ID: number;
  Malzeme_Kodu: string; // FK Stok.Malzeme_Kodu
  Donem: string; // YYAA format
  Miktar: number; // DECIMAL(10,3)
  Sube_ID: number; // FK Sube.Sube_ID
  Kayit_Tarihi: string; // TIMESTAMP
}

export interface Calisan {
  TC_No: string; // CHAR(11), Primary Key
  Adi: string; // VARCHAR(50)
  Soyadi: string; // VARCHAR(50)
  Hesap_No?: string; // VARCHAR(30)
  IBAN?: string; // CHAR(26)
  Net_Maas?: number; // DECIMAL(10,2)
  Sigorta_Giris?: string; // DATE (YYYY-MM-DD)
  Sigorta_Cikis?: string; // DATE (YYYY-MM-DD)
  Aktif_Pasif: boolean; // BOOLEAN, DEFAULT TRUE
  Sube_ID: number; // Foreign Key to Sube.Sube_ID
}

export type CalisanFormData = Omit<Calisan, 'Sube_ID' | 'TC_No'> & { TC_No?: string };

export interface PuantajSecimi {
  Secim_ID: number; // Primary Key, AUTO_INCREMENT
  Secim: string; // VARCHAR(100), UNIQUE, NOT NULL
  Degeri: number; // DECIMAL(3,1), NOT NULL
  Renk_Kodu: string; // VARCHAR(15), NOT NULL (e.g., #FF0000 or a color name)
  Aktif_Pasif: boolean; // BOOLEAN, DEFAULT TRUE
}

export type PuantajSecimiFormData = Omit<PuantajSecimi, 'Secim_ID'> & { Secim_ID?: number };

export interface Puantaj {
  Puantaj_ID: number; // Primary Key, AUTO_INCREMENT
  Tarih: string; // DATE (YYYY-MM-DD), NOT NULL
  TC_No: string; // Foreign Key -> Calisan.TC_No, NOT NULL
  Secim_ID: number; // Foreign Key -> Puantaj_Secimi.Secim_ID, NOT NULL
  Sube_ID: number; // Foreign Key -> Sube.Sube_ID, NOT NULL
}

// For creating/updating Puantaj entries easily
export interface PuantajEntry {
  Tarih: string; // YYYY-MM-DD
  TC_No: string;
  Secim_ID: number | null; // Allow null for clearing an entry
  Sube_ID: number;
}

export interface Gelir {
  Gelir_ID: number;
  Sube_ID: number;
  Tarih: string; // YYYY-MM-DD
  Kategori_ID: number;
  Tutar: number;
  Kayit_Tarihi: string; // TIMESTAMP
}

export interface GelirEkstra {
  GelirEkstra_ID: number;
  Sube_ID: number;
  Tarih: string; // YYYY-MM-DD
  RobotPos_Tutar: number;
  Bankaya_Yatan_Tutar: number;
  Kayit_Tarihi: string; // TIMESTAMP
}

export interface AvansIstek {
  Avans_ID: number;
  Donem: string; // YYAA format
  TC_No: string;
  Tutar: number;
  Aciklama?: string;
  Sube_ID: number;
  Kayit_Tarihi: string; // Timestamp
}

export interface EFaturaReferans {
  Alici_Unvani: string;
  Referans_Kodu: string;
  Kategori_ID: number | null;
  Aciklama: string;
  Aktif_Pasif: boolean;
  Kayit_Tarihi: string;
}

export type EFaturaReferansFormData = Partial<Omit<EFaturaReferans, 'Kayit_Tarihi'>>;

export interface OdemeReferans {
  Referans_ID: number;
  Referans_Metin: string;
  Kategori_ID: number;
  Aktif_Pasif: boolean;
  Kayit_Tarihi: string;
}

export type OdemeReferansFormData = Omit<OdemeReferans, 'Referans_ID' | 'Kayit_Tarihi'> & { Referans_ID?: number };

export interface Odeme {
  Odeme_ID: number;
  Tip: string; // VARCHAR(50)
  Hesap_Adi: string; // VARCHAR(50)
  Tarih: string; // DATE (YYYY-MM-DD)
  Aciklama: string; // VARCHAR(200)
  Tutar: number; // DECIMAL(15,2)
  Kategori_ID: number | null; // Foreign Key to Kategori.Kategori_ID
  Donem: number | null; // INT
  Sube_ID: number; // Foreign Key to Sube.Sube_ID
  Kayit_Tarihi: string; // TIMESTAMP
}

export type OdemeAssignmentFormData = Partial<Pick<Odeme, 'Kategori_ID' | 'Donem'>>;

export interface Nakit {
  Nakit_ID: number;
  Tarih: string; // DATE (YYYY-MM-DD)
  Kayıt_Tarih: string; // TIMESTAMP
  Tutar: number; // DECIMAL(15,2)
  Tip: string; // ENUM ('Bankaya Yatan', 'Elden', 'Banka Transferi')
  Donem: number; // INT
  Imaj_Adı?: string; // VARCHAR(255)
  Imaj?: string; // LONGBLOB (Base64 encoded string)
}

// --- ODEME REPORT TYPES ---
export interface OdemeRaporRequest {
  donem?: number[];     // Optional array of periods (e.g., [2508, 2509])
  kategori?: number[];  // Optional array of category IDs
  sube_id?: number;     // Branch filter (from context)
}

export interface OdemeRaporDetail {
  odeme_id: number;
  tip: string;
  hesap_adi: string;
  tarih: string;        // Date in YYYY-MM-DD format
  aciklama: string;
  tutar: number;
}

export interface OdemeRaporBankaHesabiGroup {
  hesap_adi: string;
  hesap_total: number;
  record_count: number;
  details: OdemeRaporDetail[];
}

export interface OdemeRaporKategoriGroup {
  kategori_id: number | null;
  kategori_adi: string;
  kategori_total: number;
  record_count: number;
  banka_hesaplari: OdemeRaporBankaHesabiGroup[];
}

export interface OdemeRaporDonemGroup {
  donem: number;
  donem_total: number;
  record_count: number;
  kategoriler: OdemeRaporKategoriGroup[];
}

export interface OdemeRaporTotals {
  donem_totals: { [donem: number]: number };
  kategori_totals: { [kategori_id: string]: number };
  grand_total: number;
}

export interface OdemeRaporResponse {
  data: OdemeRaporDonemGroup[];
  totals: OdemeRaporTotals;
  filters_applied: OdemeRaporRequest;
  total_records: number;
}

// --- FATURA & DİĞER HARCAMA REPORT TYPES ---
export interface FaturaDigerHarcamaRaporRequest {
  donem?: number[];     // Optional array of periods (e.g., [2508, 2509])
  kategori?: number[];  // Optional array of category IDs
  sube_id?: number;     // Branch filter (from context)
}

export interface FaturaDigerHarcamaRaporDetail {
  id: number;
  tarih: string;  // Date in YYYY-MM-DD format
  belge_numarasi: string;
  karsi_taraf_adi: string;
  tutar: number;
  aciklama?: string;
  etiket: string;  // "Gelen Fatura", "Giden Fatura", or "Diğer Harcama"
  gunluk_harcama?: boolean;
  ozel?: boolean;
}

export interface FaturaDigerHarcamaRaporKategoriGroup {
  kategori_id: number | null;
  kategori_adi: string;
  kategori_total: number;
  record_count: number;
  kayitlar: FaturaDigerHarcamaRaporDetail[];
}

export interface FaturaDigerHarcamaRaporDonemGroup {
  donem: number;
  donem_total: number;
  record_count: number;
  kategoriler: FaturaDigerHarcamaRaporKategoriGroup[];
}

export interface FaturaDigerHarcamaRaporTotals {
  donem_totals: { [donem: number]: number };
  kategori_totals: { [kategori_id: string]: number };
  grand_total: number;
}

export interface FaturaDigerHarcamaRaporResponse {
  data: FaturaDigerHarcamaRaporDonemGroup[];
  totals: FaturaDigerHarcamaRaporTotals;
  filters_applied: FaturaDigerHarcamaRaporRequest;
  total_records: number;
}

// --- FATURA REPORT TYPES ---
export interface FaturaRaporRequest {
  donem?: number[];     // Optional array of periods (e.g., [2508, 2509])
  kategori?: number[];  // Optional array of category IDs
  sube_id?: number;     // Branch filter (from context)
}

export interface FaturaRaporDetail {
  fatura_id: number;
  fatura_tarihi: string;  // Date in YYYY-MM-DD format
  fatura_numarasi: string;
  alici_unvani: string;
  tutar: number;
  aciklama?: string;
  giden_fatura?: boolean;
  gunluk_harcama?: boolean;
  ozel?: boolean;
}

export interface FaturaRaporKategoriGroup {
  kategori_id: number | null;
  kategori_adi: string;
  kategori_total: number;
  record_count: number;
  faturalar: FaturaRaporDetail[];
}

export interface FaturaRaporDonemGroup {
  donem: number;
  donem_total: number;
  record_count: number;
  kategoriler: FaturaRaporKategoriGroup[];
}

export interface FaturaRaporTotals {
  donem_totals: { [donem: number]: number };
  kategori_totals: { [kategori_id: string]: number };
  grand_total: number;
}

export interface FaturaRaporResponse {
  data: FaturaRaporDonemGroup[];
  totals: FaturaRaporTotals;
  filters_applied: FaturaRaporRequest;
  total_records: number;
}

export type NakitFormData = Omit<Nakit, 'Nakit_ID' | 'Kayıt_Tarih' | 'Imaj' | 'Donem'> & { Nakit_ID?: number; Imaj?: File | null; Imaj_Adı?: string | null; Donem?: number | string; };


export interface AppContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  currentUser: Kullanici | null;
  selectedBranch: Sube | null;
  selectBranch: (branch: Sube) => void;
  currentPeriod: string; // YYAA format, e.g., "2307"
  setPeriod: (period: string) => void;
  hasPermission: (permissionName: string) => boolean;
  isAdmin: boolean;
}

export interface DataContextType {
  calisanTalepList: CalisanTalep[];
  addCalisanTalep: (data: Partial<CalisanTalep>) => Promise<{ success: boolean, data?: CalisanTalep, message?: string }>;
  updateCalisanTalep: (talepId: number, data: Partial<CalisanTalep>) => Promise<{ success: boolean, data?: CalisanTalep, message?: string }>;
  deleteCalisanTalep: (talepId: number) => Promise<{ success: boolean, message?: string }>;
  cariList: Cari[];
  addCari: (data: CariFormData) => Promise<{ success: boolean; data?: Cari, message?: string }>;
  updateCari: (cariId: number, data: CariFormData) => Promise<{ success: boolean; data?: Cari, message?: string }>;
  deleteCari: (cariId: number) => Promise<{ success: boolean; message?: string }>;
  depoKiraRapor: any[];
  yemekCekiList: YemekCeki[];
  addYemekCeki: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  updateYemekCeki: (yemekCekiId: number, formData: FormData) => Promise<{ success: boolean; message?: string }>;
  deleteYemekCeki: (yemekCekiId: number) => Promise<{ success: boolean; message?: string }>;

  subeList: Sube[];
  addSube: (subeData: Omit<Sube, 'Sube_ID'>) => Promise<{ success: boolean; message?: string }>;
  updateSube: (subeId: number, subeData: Omit<Sube, 'Sube_ID'>) => Promise<{ success: boolean; message?: string }>;

  eFaturaList: EFatura[];
  addEFaturas: (newFaturas: EFatura[]) => Promise<{ successfullyAdded: EFatura[], skippedInvoices: Array<{ Fatura_Numarasi: string, reason: string }> }>;
  updateEFatura: (faturaId: number, data: InvoiceAssignmentFormData) => Promise<void>;

  b2bEkstreList: B2BEkstre[];
  addB2BEkstreler: (newEkstreler: B2BEkstre[]) => Promise<{ successfullyAdded: B2BEkstre[], skippedRecords: Array<{ Fis_No: string, Tarih: string, reason: string }> }>;
  updateB2BEkstre: (ekstreId: number, data: B2BAssignmentFormData) => Promise<void>;
  uploadB2BEkstre: (formData: FormData) => Promise<{ added: number, skipped: number } | null>;

  digerHarcamaList: DigerHarcama[];
  addDigerHarcama: (harcama: FormData) => Promise<void>;
  updateDigerHarcama: (harcamaId: number, data: FormData) => Promise<void>;
  deleteDigerHarcama: (harcamaId: number) => Promise<void>;

  stokList: Stok[];
  addStok: (stok: Stok) => Promise<{ success: boolean, message?: string }>;
  updateStok: (stokId: number, data: StokFormData) => Promise<{ success: boolean, message?: string }>;
  
  stokFiyatList: StokFiyat[];
  addStokFiyat: (stokFiyat: StokFiyat) => Promise<void>;
  updateStokFiyat: (fiyatId: number, data: StokFiyatFormData) => Promise<void>;

  stokSayimList: StokSayim[];
  addOrUpdateStokSayim: (sayimData: { Malzeme_Kodu: string; Donem: string; Miktar: number; Sube_ID: number }) => Promise<void>;

  calisanList: Calisan[];
  addCalisan: (calisan: Calisan) => Promise<{ success: boolean; message?: string }>;
  updateCalisan: (tcNo: string, data: Omit<CalisanFormData, 'TC_No'>) => Promise<{ success: boolean; message?: string }>;

  puantajSecimiList: PuantajSecimi[];
  addPuantajSecimi: (secim: PuantajSecimi) => Promise<{ success: boolean; message?: string }>;
  updatePuantajSecimi: (secimId: number, data: PuantajSecimiFormData) => Promise<{ success: boolean; message?: string }>;

  puantajList: Puantaj[];
  addOrUpdatePuantajEntry: (entry: PuantajEntry) => Promise<void>;
  getPuantajEntry: (tcNo: string, tarih: string, subeId: number) => Puantaj | undefined;
  deletePuantajEntry: (tcNo: string, tarih: string, subeId: number) => Promise<void>;

  gelirList: Gelir[];
  addOrUpdateGelirEntry: (entry: Omit<Gelir, 'Gelir_ID' | 'Kayit_Tarihi'>) => Promise<void>;
  getGelirEntry: (kategoriId: number, tarih: string, subeId: number) => Gelir | undefined;
  
  gelirEkstraList: GelirEkstra[];
  addOrUpdateGelirEkstraEntry: (entry: Omit<GelirEkstra, 'GelirEkstra_ID' | 'Kayit_Tarihi' | 'Sube_ID'> & { Sube_ID: number }) => Promise<void>;
  getGelirEkstraEntry: (tarih: string, subeId: number) => GelirEkstra | undefined;

  avansIstekList: AvansIstek[];
  fetchAvansIsteklerByPeriod: (period: string, subeId: number) => Promise<void>;
  addOrUpdateAvansIstek: (data: { TC_No: string; Donem: number; Sube_ID: number; Tutar: number; Aciklama?: string }) => Promise<{ success: boolean; message?: string }>;
  deleteAvansIstek: (tcNo: string, donem: number, subeId: number) => Promise<{ success: boolean; message?: string }>;
  getAvansIstek: (tcNo: string, donem: number, subeId: number) => AvansIstek | undefined;

  eFaturaReferansList: EFaturaReferans[];
  addEFaturaReferans: (data: EFaturaReferansFormData) => Promise<{ success: boolean; message?: string }>;
  updateEFaturaReferans: (Alici_Unvani: string, data: Partial<EFaturaReferansFormData>) => Promise<{ success: boolean; message?: string }>;
  deleteEFaturaReferans: (Alici_Unvani: string) => Promise<{ success: boolean; message?: string }>;

  odemeReferansList: OdemeReferans[];
  addOdemeReferans: (data: OdemeReferansFormData) => Promise<{ success: boolean; message?: string }>;
  updateOdemeReferans: (referansId: number, data: Partial<OdemeReferansFormData>) => Promise<{ success: boolean; message?: string }>;
  deleteOdemeReferans: (referansId: number) => Promise<{ success: boolean; message?: string }>;

  ustKategoriList: UstKategori[];
  addUstKategori: (data: UstKategoriFormData) => Promise<{ success: boolean; message?: string }>;
  updateUstKategori: (ustKategoriId: number, data: UstKategoriFormData) => Promise<{ success: boolean; message?: string }>;

  kategoriList: Kategori[];
  permissionsList: Yetki[];
  userRolesList: KullaniciRol[];
  addUserRole: (userRole: KullaniciRol) => Promise<{ success: boolean; message?: string }>;
  updateUserRole: (kullaniciId: number, roleId: number, subeId: number, data: Partial<KullaniciRol>) => Promise<{ success: boolean; message?: string }>;
  deleteUserRole: (kullaniciId: number, roleId: number, subeId: number) => Promise<{ success: boolean; message?: string }>;
  addPermission: (data: Yetki) => Promise<{ success: boolean; message?: string }>;
  updatePermission: (yetkiId: number, data: Yetki) => Promise<{ success: boolean; message?: string }>;
  deletePermission: (yetkiId: number) => Promise<{ success: boolean; message?: string }>;
  rolesList: Rol[];
  addRole: (data: Rol) => Promise<{ success: boolean; message?: string }>;
  updateRole: (roleId: number, data: Rol) => Promise<{ success: boolean; message?: string }>;
  deleteRole: (roleId: number) => Promise<{ success: boolean; message?: string }>;
  degerList: Deger[];
  fetchDegerler: () => Promise<void>;
  addDeger: (data: DegerFormData) => Promise<{ success: boolean; message?: string }>;
  updateDeger: (degerId: number, data: DegerFormData) => Promise<{ success: boolean; message?: string }>;
  addKategori: (data: KategoriFormData) => Promise<{ success: boolean; message?: string }>;
  updateKategori: (kategoriId: number, data: KategoriFormData) => Promise<{ success: boolean; message?: string }>;

  nakitList: Nakit[];
  addNakit: (data: FormData) => Promise<{ success: boolean; message?: string }>;
  updateNakit: (nakitId: number, data: FormData) => Promise<{ success: boolean; message?: string }>;
  deleteNakit: (nakitId: number) => Promise<{ success: boolean; message?: string }>;

  odemeList: Odeme[];
  updateOdeme: (odemeId: number, data: OdemeAssignmentFormData) => Promise<void>;
  uploadOdeme: (formData: FormData) => Promise<{ added: number; skipped: number } | null>;
  uploadPosHareketleri: (formData: FormData) => Promise<{ added: number; skipped: number } | null>;
}

  }


export enum PermissionOperation {
  EKLEME = "E",
  GUNCELLEME = "G",
  SILME = "S",
  AKTIF_YAPMA = "A",
  PASIF_YAPMA = "P",
  DOSYA_YUKLEME = "D",
  RAPOR = "R",
}

export interface YemekCeki {
  ID: number;
  Kategori_ID: number;
  Tarih: string; // DATE
  Tutar: number; // DECIMAL(15,2)
  Odeme_Tarih: string; // DATE
  Ilk_Tarih: string; // DATE
  Son_Tarih: string; // DATE
  Sube_ID: number;
  Imaj?: string; // Base64 encoded image
  Imaj_Adi?: string; // Image filename
  Kayit_Tarihi?: string; // TIMESTAMP
  Gelir: number;
  has_imaj: boolean;
}

// YemekCekiFormData can be used for form submissions
export type YemekCekiFormData = Omit<YemekCeki, 'ID' | 'Kayit_Tarihi' | 'has_imaj' | 'Gelir'> & { Imaj?: File | null };
export interface CalisanTalep {
  Talep_ID: number;
  TC_No: string;
  Talep_Tipi: string;
  Aciklama: string;
  Durum: string;
  Onay_Tarihi: string | null;
  Red_Tarihi: string | null;
  Sube_ID: number;
  Kayit_Tarihi: string;
}

export interface Cari {
  Cari_ID: number;
  Alici_Unvani: string;
  e_Fatura_Kategori_ID: number;
  Kategori_Adi?: string;
  Referans_ID: number | null;
  Referans_Detay?: string | null;
  Cari: boolean;
  Aciklama: string | null;
  Kayit_Tarihi?: string;
  Aktif_Pasif: boolean;
}

export type CariFormData = Partial<Omit<Cari, 'Cari_ID' | 'Kategori_Adi' | 'Referans_Detay' | 'Kayit_Tarihi'>>;