import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, Calendar, TrendingUp, Eye, EyeOff } from "lucide-react";
import { useAppContext, useDataContext } from '../App';
import { Card } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';

// A simple Access Denied component, can be moved to a shared file if needed
const AccessDenied: React.FC<{ title: string }> = ({ title }) => (
    <Card title={title}>
        <div className="text-center py-10">
            <h3 className="text-xl font-bold text-red-600">Erişim Reddedildi</h3>
            <p className="text-gray-600 mt-2">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
    </Card>
);

const months = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
];

// Base data structure for the report rows.
const excelRows = [
  { label: "Tabak Sayısı", values: Array(12).fill(null), total: null, category: "operasyonel" },
  { label: "Çalışma Gün Sayısı", values: Array(12).fill(null), total: null, category: "operasyonel" },
  { label: "Günlük Ziyaretçi Sayısı", values: Array(12).fill(null), total: null, category: "operasyonel" },
  { label: "Toplam Ciro", values: Array(12).fill(null), total: null, category: "ciro" },
  { label: "Şefteniste Ciro", values: Array(12).fill(null), total: null, category: "ciro" },
  { label: "Restoran Ciro", values: Array(12).fill(null), total: null, category: "ciro" },
  { label: "Ay Başı Stok Değeri", values: Array(12).fill(null), total: null, category: "stok" },
  { label: "Ay içerisindeki Alımlar", values: Array(12).fill(null), total: null, category: "stok" },
  { label: "Ay içerisindeki İade", values: Array(12).fill(null), total: null, category: "stok" },
  { label: "Ay Sonu Sayılan Stok Değeri", values: Array(12).fill(null), total: null, category: "stok" },
  { label: "Maliyet", values: Array(12).fill(null), total: null, category: "maliyet" },
  { label: "Maliyet %", values: Array(12).fill(null), total: null, category: "maliyet" },
  { label: "Personel Sayısı (Sürücü Sayısı Hariç)", values: Array(12).fill(null), total: null, category: "personel" },
  { label: "Toplam Maaş Gideri (Sürücü Maaşı Hariç)", values: Array(12).fill(null), total: null, category: "personel" },
  { label: "Personel Maaş Giderleri; SGK, Stopaj (Muhtasar) Dahil", values: Array(12).fill(null), total: null, category: "personel" },
  { label: "Ortalama Kişi Başı Maaş", values: Array(12).fill(null), total: null, category: "personel" },
  { label: "Maaş Giderleri %", values: Array(12).fill(null), total: null, category: "personel" },
  { label: "VPS (Personel Başına Ziyaretçi Sayısı)", values: Array(12).fill(null), total: null, category: "personel" },
  { label: "Stopajlı Kira", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Sabit Kira", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Ciro kira", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Depo Kira", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Ortak alan ve Genel Giderler", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Toplam Kira", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Toplam Kira %", values: Array(12).fill(null), total: null, category: "kira" },
  { label: "Sürücü Sayısı", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "Yemeksepeti Komisyon ve Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "Paket Taxi Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "Trendyol Komisyon ve Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "Getir Getirsin Komisyon ve Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "Migros Hemen Komisyon ve Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "Dış Paket Kurye Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "İç Paket Kurye Giderleri (Personel Maaş vb.)", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "İç Paket Yakıt Gideleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "İç Paket Bakım Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
  { label: "İç Paket Kiralama Giderleri", values: Array(12).fill(null), total: null, category: "lojistik" },
];

const digerDetayiRows = [
  "Elektrik", "Su", "Doğalgaz Gideri", "İnternet ve Telefon", "Demirbaş Sayılmayan Giderler", "Kredi Kartı Komisyon Giderleri", "Yemek Kartı Komisyon Giderleri", "Personel Yemek Giderleri", "Temizlik Giderleri", "Bakım Onarım", "Personel Tazminat (Kıdem, İhbar vb.)",
  "İlaçlama", "Baca Temizliği", "ÇTV, İşgaliye, İlan Reklam Vergi Bedelleri", "Kırtasiye", "İş güvenliği Uzmanı", "Müşavirlik Ücreti",
  "HIJYEN DENETİMİ", "İşyeri Sigorta Gideri"
].map((label) => ({ label, values: Array(12).fill(null), total: null, category: "diger" }));

const moreRows = [
  { label: "Paket Komisyon ve Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "komisyon" },
  { label: "Paket Komisyon ve Lojistik (Paket Satış) %", values: Array(12).fill(null), total: null, category: "komisyon" },
  { label: "Diğer Giderler", values: Array(12).fill(null), total: null, category: "gider" },
  { label: "Kredi Kartı Komisyon Giderleri", values: Array(12).fill(null), total: null, category: "komisyon" },
  { label: "Yemek Kartı Komisyon Giderleri", values: Array(12).fill(null), total: null, category: "komisyon" },
  { label: "Diğer Detay Toplamı", values: Array(12).fill(null), total: null, category: "gider" },
  { label: "Tavuk Dünyası Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "gider" },
  { label: "Toplam Diğer Giderler", values: Array(12).fill(null), total: null, category: "gider" },
  { label: "Diğer Giderler %", values: Array(12).fill(null), total: null, category: "gider" },
  { label: "Tavuk Dünyası Ciro Primi", values: Array(12).fill(null), total: null, category: "prim" },
  { label: "Tavuk Dünyası Reklam Primi", values: Array(12).fill(null), total: null, category: "prim" },
  { label: "Ciro Primi ve Reklam Primi", values: Array(12).fill(null), total: null, category: "prim" },
  { label: "Ciro Primi ve Reklam %", values: Array(12).fill(null), total: null, category: "prim" },
  { label: "Toplam Kar / Zarar", values: Array(12).fill(null), total: null, category: "kar" },
  { label: "Toplam Kar / Zarar %", values: Array(12).fill(null), total: null, category: "kar" }
];

export const BayiKarlilikRaporuPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { depoKiraRapor, gelirEkstraList, gelirList, kategoriList, stokFiyatList, stokSayimList, calisanList, ustKategoriList, digerHarcamaList, eFaturaList } = useDataContext();
  const pageTitle = "Bayi Karlılık Raporu";
  const requiredPermission = "Bayi Karlılık Raporu Görüntüleme"; 

  const [year, setYear] = useState(new Date().getFullYear());
  const [showDigerDetayi, setShowDigerDetayi] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [allExpensesByCategory, setAllExpensesByCategory] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllExpenses = async () => {
      const currentYearYYMM = `${String(year).slice(2)}01`; // Assuming we need a YYMM format for the API
      try {
        const response = await fetch(`${API_BASE_URL}/report/all-expenses-by-category/${currentYearYYMM}`);
        if (response.ok) {
          const data = await response.json();
          setAllExpensesByCategory(data);
        } else {
          console.error('Error fetching all expenses by category:', response.status, await response.text());
          setAllExpensesByCategory([]);
        }
      } catch (error) {
        console.error('Network error fetching all expenses by category:', error);
        setAllExpensesByCategory([]);
      }
    };

    fetchAllExpenses();
  }, [year]); // Re-fetch when year changes

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (currentYear <= 2025) {
        return [2025];
    }
    const years = [];
    for (let y = 2025; y <= currentYear; y++) {
        years.push(y);
    }
    return years.sort((a, b) => b - a); // Sort descending
  }, []);

  if (!hasPermission(requiredPermission)) {
      return <AccessDenied title={pageTitle} />;
  }

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const headers = months.map((m) => `${m}${String(year).slice(2)}`);

      const { processedExcelRows, processedDigerRows, processedMoreRows } = useMemo(() => {
      const calculateWorkingDays = (monthIndex: number, year: number) => new Date(year, monthIndex + 1, 0).getDate();
  
      // --- Main Calculations ---
      const workingDaysValues = months.map((_, index) => calculateWorkingDays(index, year));
      const totalWorkingDays = workingDaysValues.reduce((sum, days) => sum + days, 0);

    const tabakSayisiValues = Array(12).fill(0);
    const toplamCiroValues = Array(12).fill(0);
    if (gelirEkstraList) {
        gelirEkstraList.forEach(item => {
            const itemDate = new Date(item.Tarih);
            if (itemDate.getFullYear() === year) {
                const monthIndex = itemDate.getMonth();
                tabakSayisiValues[monthIndex] += item.Tabak_Sayisi;
                toplamCiroValues[monthIndex] += item.RobotPos_Tutar;
            }
        });
    }
    const totalTabakSayisi = tabakSayisiValues.reduce((a, b) => a + b, 0);
    const totalToplamCiro = toplamCiroValues.reduce((a, b) => a + b, 0);

    const gunlukZiyaretciValues = months.map((_, i) => {
        const tabak = tabakSayisiValues[i] || 0;
        const günler = workingDaysValues[i] || 0;
        return günler > 0 ? parseFloat((tabak / günler).toFixed(2)) : 0;
    });
    const totalGunlukZiyaretci = totalWorkingDays > 0
        ? parseFloat((totalTabakSayisi / totalWorkingDays).toFixed(2))
        : 0;

    const seftenisteKategoriIds = new Set(
        kategoriList.filter(k => k.Ust_Kategori_ID === 1).map(k => k.Kategori_ID)
    );
    const seftenisteCiroValues = Array(12).fill(0);
    if (gelirList) {
        gelirList.forEach(item => {
            const itemDate = new Date(item.Tarih);
            if (itemDate.getFullYear() === year && seftenisteKategoriIds.has(item.Kategori_ID)) {
                const monthIndex = itemDate.getMonth();
                seftenisteCiroValues[monthIndex] += item.Tutar;
            }
        });
    }
    const totalSeftenisteCiro = seftenisteCiroValues.reduce((a, b) => a + b, 0);

    const restoranCiroValues = months.map((_, i) =>
        (toplamCiroValues[i] || 0) - (seftenisteCiroValues[i] || 0)
    );
    const totalRestoranCiro = totalToplamCiro - totalSeftenisteCiro;

    const getLatestPriceForPeriod = (malzemeKodu: string, periodYYMM: string) => {
        const periodYear = 2000 + parseInt(periodYYMM.substring(0, 2));
        const periodMonth = parseInt(periodYYMM.substring(2, 4));
        const periodStartDate = new Date(periodYear, periodMonth - 1, 1);

        const relevantPrices = stokFiyatList
            .filter(sf => sf.Malzeme_Kodu === malzemeKodu && new Date(sf.Gecerlilik_Baslangic_Tarih) <= periodStartDate)
            .sort((a, b) => new Date(b.Gecerlilik_Baslangic_Tarih).getTime() - new Date(a.Gecerlilik_Baslangic_Tarih).getTime());

        return relevantPrices.length > 0 ? relevantPrices[0].Fiyat : 0;
    };

    const aySonuStokValues = Array(12).fill(0);
    if (stokSayimList) {
        const yearSayimlar = stokSayimList.filter(s => {
            const sayimYear = 2000 + parseInt(s.Donem.substring(0, 2));
            return sayimYear === year;
        });

        yearSayimlar.forEach(sayim => {
            const price = getLatestPriceForPeriod(sayim.Malzeme_Kodu, sayim.Donem);
            const value = sayim.Miktar * price;
            const monthIndex = parseInt(sayim.Donem.substring(2, 4)) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                aySonuStokValues[monthIndex] += value;
            }
        });
    }
    const totalAySonuStok = aySonuStokValues.reduce((a, b) => a + b, 0);

    const prevYear = year - 1;
    const prevYearDonem = (prevYear % 100).toString().padStart(2, '0') + '12';
    const prevYearDecemberSayimlar = stokSayimList.filter(s => s.Donem === prevYearDonem);
    let prevYearDecemberStockValue = 0;
    if (prevYearDecemberSayimlar.length > 0) {
        prevYearDecemberSayimlar.forEach(sayim => {
            const price = getLatestPriceForPeriod(sayim.Malzeme_Kodu, sayim.Donem);
            prevYearDecemberStockValue += sayim.Miktar * price;
        });
    }

    const ayBasiStokValues = Array(12).fill(0);
    ayBasiStokValues[0] = prevYearDecemberStockValue;
    for (let i = 1; i < 12; i++) {
        ayBasiStokValues[i] = aySonuStokValues[i - 1];
    }

    const personelSayisiValues = Array(12).fill(0);
    if (calisanList) {
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            const days = workingDaysValues[monthIndex];
            let dailyCountsForMonth = 0;
            for (let day = 1; day <= days; day++) {
                const currentDate = new Date(year, monthIndex, day);
                const activeEmployeesOnDay = calisanList.filter(c => {
                    if (!c.Sigorta_Giris) return false;
                    const girisDate = new Date(c.Sigorta_Giris);
                    const cikisDate = c.Sigorta_Cikis ? new Date(c.Sigorta_Cikis) : null;
                    return girisDate <= currentDate && (!cikisDate || cikisDate > currentDate);
                }).length;
                dailyCountsForMonth += activeEmployeesOnDay;
            }
            personelSayisiValues[monthIndex] = days > 0 ? parseFloat((dailyCountsForMonth / days).toFixed(2)) : 0;
        }
    }
    const totalPersonelSayisi = personelSayisiValues.length > 0 ? parseFloat((personelSayisiValues.reduce((a, b) => a + b, 0) / 12).toFixed(2)) : 0;

    const ayIciAlimlarValues = Array(12).fill(0);
    const satislarinMaliyetiUstKategori = ustKategoriList.find(uk => uk.UstKategori_Adi === 'Satışların Maliyeti');
    if (satislarinMaliyetiUstKategori && (digerHarcamaList || eFaturaList)) {
        const maliyetKategoriIds = new Set(
            kategoriList
                .filter(k => k.Ust_Kategori_ID === satislarinMaliyetiUstKategori.UstKategori_ID)
                .map(k => k.Kategori_ID)
        );

        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && maliyetKategoriIds.has(item.Kategori_ID)) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        ayIciAlimlarValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalAyIciAlimlar = ayIciAlimlarValues.reduce((a, b) => a + b, 0);

    const ayIadeValues = Array(12).fill(0);
    const totalAyIade = 0;

    const maliyetValues = months.map((_, i) => {
        const ayBasi = ayBasiStokValues[i] || 0;
        const ayIciAlim = ayIciAlimlarValues[i] || 0;
        const ayIade = ayIadeValues[i] || 0;
        const aySonu = aySonuStokValues[i] || 0;
        return ayBasi + ayIciAlim - ayIade - aySonu;
    });
    const totalMaliyet = maliyetValues.reduce((a, b) => a + b, 0);

    const maliyetYuzdeValues = months.map((_, i) => {
        const maliyet = maliyetValues[i] || 0;
        const ciro = toplamCiroValues[i] || 0;
        return ciro > 0 ? parseFloat(((maliyet / ciro) * 100).toFixed(2)) : 0;
    });
    const totalMaliyetYuzde = totalToplamCiro > 0 ? parseFloat(((totalMaliyet / totalToplamCiro) * 100).toFixed(2)) : 0;

    const maasGiderleriUstKategori = ustKategoriList.find(uk => uk.UstKategori_Adi === 'Maaş Giderleri');
    let maasKategoriIds = new Set();
    if (maasGiderleriUstKategori) {
        maasKategoriIds = new Set(
            kategoriList
                .filter(k => k.Ust_Kategori_ID === maasGiderleriUstKategori.UstKategori_ID)
                .map(k => k.Kategori_ID)
        );
    }

    const personelMaasGiderleriValues = Array(12).fill(0);
    if (maasGiderleriUstKategori && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && maasKategoriIds.has(item.Kategori_ID)) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        personelMaasGiderleriValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalPersonelMaasGiderleri = personelMaasGiderleriValues.reduce((a, b) => a + b, 0);

    const maasGiderleriYuzdeValues = months.map((_, i) => {
        const gider = personelMaasGiderleriValues[i] || 0;
        const ciro = toplamCiroValues[i] || 0;
        return ciro > 0 ? parseFloat(((gider / ciro) * 100).toFixed(2)) : 0;
    });
    const totalMaasGiderleriYuzde = totalToplamCiro > 0 ? parseFloat(((totalPersonelMaasGiderleri / totalToplamCiro) * 100).toFixed(2)) : 0;

    const ortalamaKisiBasiMaasValues = months.map((_, i) => {
        const maasGideri = personelMaasGiderleriValues[i] || 0;
        const personelSayisi = personelSayisiValues[i] || 0;
        return personelSayisi > 0 ? parseFloat((maasGideri / personelSayisi).toFixed(2)) : 0;
    });
    const totalOrtalamaKisiBasiMaas = totalPersonelSayisi > 0 ? parseFloat((totalPersonelMaasGiderleri / totalPersonelSayisi).toFixed(2)) : 0;

    const vpsValues = months.map((_, i) => {
        const ziyaretciSayisi = gunlukZiyaretciValues[i] || 0;
        const personelSayisi = personelSayisiValues[i] || 0;
        return personelSayisi > 0 ? parseFloat((ziyaretciSayisi / personelSayisi).toFixed(2)) : 0;
    });
    const totalVps = totalPersonelSayisi > 0 ? parseFloat((totalGunlukZiyaretci / totalPersonelSayisi).toFixed(2)) : 0;

    const stopajliKiraValues = Array(12).fill(0);
    const totalStopajliKira = 0;

    const sabitKiraKategori = kategoriList.find(k => k.Kategori_Adi === 'Sabit Kira');
    let sabitKiraKategoriId = null;
    if (sabitKiraKategori) {
        sabitKiraKategoriId = sabitKiraKategori.Kategori_ID;
    }

    const sabitKiraValues = Array(12).fill(0);
    if (sabitKiraKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === sabitKiraKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        sabitKiraValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalSabitKira = sabitKiraValues.reduce((a, b) => a + b, 0);

    const ciroKiraKategori = kategoriList.find(k => k.Kategori_Adi === 'Ciro Kira');
    let ciroKiraKategoriId = null;
    if (ciroKiraKategori) {
        ciroKiraKategoriId = ciroKiraKategori.Kategori_ID;
    }

    const ciroKiraValues = Array(12).fill(0);
    if (ciroKiraKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === ciroKiraKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        ciroKiraValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalCiroKira = ciroKiraValues.reduce((a, b) => a + b, 0);

    const ortakGiderKategori = kategoriList.find(k => k.Kategori_Adi === 'Ortak Gider');
    let ortakGiderKategoriId = null;
    if (ortakGiderKategori) {
        ortakGiderKategoriId = ortakGiderKategori.Kategori_ID;
    }

    const ortakGiderValues = Array(12).fill(0);
    if (ortakGiderKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === ortakGiderKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        ortakGiderValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalOrtakGider = ortakGiderValues.reduce((a, b) => a + b, 0);

    const depoKiraValues = Array(12).fill(0);
    if (depoKiraRapor) {
        depoKiraRapor.forEach(item => {
            const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
            if (itemYear === year) {
                const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    depoKiraValues[monthIndex] += item.Toplam_Tutar;
                }
            }
        });
    }
    const totalDepoKira = depoKiraValues.reduce((a, b) => a + b, 0);

    const toplamKiraValues = months.map((_, i) => {
        return (stopajliKiraValues[i] || 0) + (sabitKiraValues[i] || 0) + (ciroKiraValues[i] || 0) + (depoKiraValues[i] || 0) + (ortakGiderValues[i] || 0);
    });
    const totalToplamKira = toplamKiraValues.reduce((a, b) => a + b, 0);

    const toplamKiraYuzdeValues = months.map((_, i) => {
        const kira = toplamKiraValues[i] || 0;
        const ciro = toplamCiroValues[i] || 0;
        return ciro > 0 ? parseFloat(((kira / ciro) * 100).toFixed(2)) : 0;
    });
    const totalToplamKiraYuzde = totalToplamCiro > 0 ? parseFloat(((totalToplamKira / totalToplamCiro) * 100).toFixed(2)) : 0;

    const yemekSepetiKomisyonKategori = kategoriList.find(k => k.Kategori_Adi === 'Yemek Sepeti (Online) Komisyonu');
    let yemekSepetiKomisyonKategoriId = null;
    if (yemekSepetiKomisyonKategori) {
        yemekSepetiKomisyonKategoriId = yemekSepetiKomisyonKategori.Kategori_ID;
    }

    const paketKomisyonLojistikGiderleriValues = Array(12).fill(0);
    if (yemekSepetiKomisyonKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === yemekSepetiKomisyonKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        paketKomisyonLojistikGiderleriValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalPaketKomisyonLojistikGiderleri = paketKomisyonLojistikGiderleriValues.reduce((a, b) => a + b, 0);

    const paketKomisyonLojistikYuzdeValues = months.map((_, i) => {
        const gider = paketKomisyonLojistikGiderleriValues[i] || 0;
        const ciro = toplamCiroValues[i] || 0;
        return ciro > 0 ? parseFloat(((gider / ciro) * 100).toFixed(2)) : 0;
    });
    const totalPaketKomisyonLojistikYuzde = totalToplamCiro > 0 ? parseFloat(((totalPaketKomisyonLojistikGiderleri / totalToplamCiro) * 100).toFixed(2)) : 0;

    const tavukDunyasiLojistikGiderleriKategori = kategoriList.find(k => k.Kategori_Adi === 'Tavuk Dünyası Lojistik');
    let tavukDunyasiLojistikGiderleriKategoriId = null;
    if (tavukDunyasiLojistikGiderleriKategori) {
        tavukDunyasiLojistikGiderleriKategoriId = tavukDunyasiLojistikGiderleriKategori.Kategori_ID;
    }

    const tavukDunyasiLojistikGiderleriValues = Array(12).fill(0);
    if (tavukDunyasiLojistikGiderleriKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === tavukDunyasiLojistikGiderleriKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        tavukDunyasiLojistikGiderleriValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalTavukDunyasiLojistikGiderleri = tavukDunyasiLojistikGiderleriValues.reduce((a, b) => a + b, 0);

    const tavukDunyasiCiroPrimiKategori = kategoriList.find(k => k.Kategori_Adi === 'Tavuk Dünyası Ciro Primi');
    let tavukDunyasiCiroPrimiKategoriId = null;
    if (tavukDunyasiCiroPrimiKategori) {
        tavukDunyasiCiroPrimiKategoriId = tavukDunyasiCiroPrimiKategori.Kategori_ID;
    }

    const tavukDunyasiCiroPrimiValues = Array(12).fill(0);
    if (tavukDunyasiCiroPrimiKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === tavukDunyasiCiroPrimiKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        tavukDunyasiCiroPrimiValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalTavukDunyasiCiroPrimi = tavukDunyasiCiroPrimiValues.reduce((a, b) => a + b, 0);

    const tavukDunyasiReklamPrimiKategori = kategoriList.find(k => k.Kategori_Adi === 'Tavuk Dünyası Reklam Primi');
    let tavukDunyasiReklamPrimiKategoriId = null;
    if (tavukDunyasiReklamPrimiKategori) {
        tavukDunyasiReklamPrimiKategoriId = tavukDunyasiReklamPrimiKategori.Kategori_ID;
    }

    const tavukDunyasiReklamPrimiValues = Array(12).fill(0);
    if (tavukDunyasiReklamPrimiKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === tavukDunyasiReklamPrimiKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        tavukDunyasiReklamPrimiValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalTavukDunyasiReklamPrimi = tavukDunyasiReklamPrimiValues.reduce((a, b) => a + b, 0);

    const ciroPrimiVeReklamPrimiValues = months.map((_, i) => {
        return (tavukDunyasiCiroPrimiValues[i] || 0) + (tavukDunyasiReklamPrimiValues[i] || 0);
    });
    const totalCiroPrimiVeReklamPrimi = ciroPrimiVeReklamPrimiValues.reduce((a, b) => a + b, 0);

    const ciroPrimiVeReklamYuzdeValues = months.map((_, i) => {
        const prim = ciroPrimiVeReklamPrimiValues[i] || 0;
        const ciro = toplamCiroValues[i] || 0;
        return ciro > 0 ? parseFloat(((prim / ciro) * 100).toFixed(2)) : 0;
    });
    const totalCiroPrimiVeReklamYuzde = totalToplamCiro > 0 ? parseFloat(((totalCiroPrimiVeReklamPrimi / totalToplamCiro) * 100).toFixed(2)) : 0;

    const elektrikKategori = kategoriList.find(k => k.Kategori_Adi === 'Elektrik');
    let elektrikKategoriId = null;
    if (elektrikKategori) {
        elektrikKategoriId = elektrikKategori.Kategori_ID;
    }

    const elektrikValues = Array(12).fill(0);
    if (elektrikKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === elektrikKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        elektrikValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalElektrik = elektrikValues.reduce((a, b) => a + b, 0);

    const suKategori = kategoriList.find(k => k.Kategori_Adi === 'Su');
    let suKategoriId = null;
    if (suKategori) {
        suKategoriId = suKategori.Kategori_ID;
    }

    const suValues = Array(12).fill(0);
    if (suKategoriId && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && item.Kategori_ID === suKategoriId) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        suValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalSu = suValues.reduce((a, b) => a + b, 0);

    const bankaKomisyonuKategoriIds = new Set(
        kategoriList
            .filter(k => k.Kategori_Adi === 'Banka Komisyonu')
            .map(k => k.Kategori_ID)
    );

    const krediKartiKomisyonGiderleriValues = Array(12).fill(0);
    if (bankaKomisyonuKategoriIds.size > 0 && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && bankaKomisyonuKategoriIds.has(item.Kategori_ID)) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        krediKartiKomisyonGiderleriValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalKrediKartiKomisyonGiderleri = krediKartiKomisyonGiderleriValues.reduce((a, b) => a + b, 0);

    const yemekCekleriKomisyonuKategoriIds = new Set(
        kategoriList
            .filter(k => k.Kategori_Adi === 'Yemek Çekleri Komisyonu')
            .map(k => k.Kategori_ID)
    );

    const yemekKartiKomisyonGiderleriValues = Array(12).fill(0);
    if (yemekCekleriKomisyonuKategoriIds.size > 0 && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && yemekCekleriKomisyonuKategoriIds.has(item.Kategori_ID)) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        yemekKartiKomisyonGiderleriValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalYemekKartiKomisyonGiderleri = yemekKartiKomisyonGiderleriValues.reduce((a, b) => a + b, 0);

    const digerGiderlerUstKategori = ustKategoriList.find(uk => uk.UstKategori_Adi === 'Diğer Giderler');
    let digerGiderlerKategoriIds = new Set();
    if (digerGiderlerUstKategori) {
        digerGiderlerKategoriIds = new Set(
            kategoriList
                .filter(k => k.Ust_Kategori_ID === digerGiderlerUstKategori.UstKategori_ID)
                .map(k => k.Kategori_ID)
        );
    }

    const digerGiderlerValues = Array(12).fill(0);
    if (digerGiderlerKategoriIds.size > 0 && (digerHarcamaList || eFaturaList)) {
        const processList = (list: any[]) => {
            list.forEach(item => {
                const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                if (itemYear === year && digerGiderlerKategoriIds.has(item.Kategori_ID)) {
                    const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        digerGiderlerValues[monthIndex] += item.Tutar;
                    }
                }
            });
        };

        if (digerHarcamaList) processList(digerHarcamaList);
        if (eFaturaList) processList(eFaturaList);
    }
    const totalDigerGiderler = digerGiderlerValues.reduce((a, b) => a + b, 0);

    const digerDetayToplamiValues = months.map((_, i) => {
        return (digerGiderlerValues[i] || 0) + (krediKartiKomisyonGiderleriValues[i] || 0) + (yemekKartiKomisyonGiderleriValues[i] || 0);
    });
    const totalDigerDetayToplami = digerDetayToplamiValues.reduce((a, b) => a + b, 0);

    const toplamDigerGiderlerValues = months.map((_, i) => {
        return (digerDetayToplamiValues[i] || 0) + (tavukDunyasiLojistikGiderleriValues[i] || 0);
    });
    const totalToplamDigerGiderler = toplamDigerGiderlerValues.reduce((a, b) => a + b, 0);

    // Calculate Toplam Kar / Zarar
    const karZararValues = months.map((_, i) => {
        const ciro = toplamCiroValues[i] || 0;
        const maliyet = maliyetValues[i] || 0;
        const personelMaas = personelMaasGiderleriValues[i] || 0;
        const kira = toplamKiraValues[i] || 0;
        const paketKomisyon = paketKomisyonLojistikGiderleriValues[i] || 0;
        const digerGiderler = toplamDigerGiderlerValues[i] || 0;
        const ciroReklamPrimi = ciroPrimiVeReklamPrimiValues[i] || 0;

        return ciro - maliyet - personelMaas - kira - paketKomisyon - digerGiderler - ciroReklamPrimi;
    });
    const totalKarZarar = karZararValues.reduce((a, b) => a + b, 0);

    // Calculate Toplam Kar / Zarar %
    const karZararYuzdeValues = months.map((_, i) => {
        const karZarar = karZararValues[i] || 0;
        const ciro = toplamCiroValues[i] || 0;
        return ciro > 0 ? parseFloat(((karZarar / ciro) * 100).toFixed(2)) : 0;
    });
    const totalKarZararYuzde = totalToplamCiro > 0 ? parseFloat(((totalKarZarar / totalToplamCiro) * 100).toFixed(2)) : 0;

    const yemeksepetiKomisyonVeLojistikGiderleriValues = Array(12).fill(0);
    if (yemekSepetiKomisyonKategoriId && eFaturaList) {
        eFaturaList.forEach(item => {
            const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
            if (
                itemYear === year &&
                item.Kategori_ID === yemekSepetiKomisyonKategoriId &&
                item.Aciklama && item.Aciklama.toLowerCase().includes('yemek sepeti')
            ) {
                const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    yemeksepetiKomisyonVeLojistikGiderleriValues[monthIndex] += item.Tutar;
                }
            }
        });
    }
    const totalYemeksepetiKomisyonVeLojistikGiderleri = yemeksepetiKomisyonVeLojistikGiderleriValues.reduce((a, b) => a + b, 0);

    const trendyolKomisyonVeLojistikGiderleriValues = Array(12).fill(0);
    if (yemekSepetiKomisyonKategoriId && eFaturaList) {
        eFaturaList.forEach(item => {
            const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
            if (
                itemYear === year &&
                item.Kategori_ID === yemekSepetiKomisyonKategoriId &&
                item.Aciklama && item.Aciklama.toLowerCase().includes('trendyol')
            ) {
                const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    trendyolKomisyonVeLojistikGiderleriValues[monthIndex] += item.Tutar;
                }
            }
        });
    }
    const totalTrendyolKomisyonVeLojistikGiderleri = trendyolKomisyonVeLojistikGiderleriValues.reduce((a, b) => a + b, 0);

    const getirKomisyonVeLojistikGiderleriValues = Array(12).fill(0);
    if (yemekSepetiKomisyonKategoriId && eFaturaList) {
        eFaturaList.forEach(item => {
            const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
            if (
                itemYear === year &&
                item.Kategori_ID === yemekSepetiKomisyonKategoriId &&
                item.Aciklama && item.Aciklama.toLowerCase().includes('getir')
            ) {
                const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    getirKomisyonVeLojistikGiderleriValues[monthIndex] += item.Tutar;
                }
            }
        });
    }
    const totalGetirKomisyonVeLojistikGiderleri = getirKomisyonVeLojistikGiderleriValues.reduce((a, b) => a + b, 0);

    const migrosKomisyonVeLojistikGiderleriValues = Array(12).fill(0);
    if (yemekSepetiKomisyonKategoriId && eFaturaList) {
        eFaturaList.forEach(item => {
            const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
            if (
                itemYear === year &&
                item.Kategori_ID === yemekSepetiKomisyonKategoriId &&
                item.Aciklama && item.Aciklama.toLowerCase().includes('migros')
            ) {
                const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    migrosKomisyonVeLojistikGiderleriValues[monthIndex] += item.Tutar;
                }
            }
        });
    }
    const totalMigrosKomisyonVeLojistikGiderleri = migrosKomisyonVeLojistikGiderleriValues.reduce((a, b) => a + b, 0);


    // --- Row Processing ---
    const newExcelRows = excelRows.map(row => {
        switch (row.label) {
            case "Tabak Sayısı":
                return { ...row, values: tabakSayisiValues, total: totalTabakSayisi };
            case "Çalışma Gün Sayısı":
                return { ...row, values: workingDaysValues, total: totalWorkingDays };
            case "Günlük Ziyaretçi Sayısı":
                return { ...row, values: gunlukZiyaretciValues, total: totalGunlukZiyaretci };
            case "Toplam Ciro":
                return { ...row, values: toplamCiroValues, total: totalToplamCiro };
            case "Şefteniste Ciro":
                return { ...row, values: seftenisteCiroValues, total: totalSeftenisteCiro };
            case "Restoran Ciro":
                return { ...row, values: restoranCiroValues, total: totalRestoranCiro };
            case "Ay Sonu Sayılan Stok Değeri":
                return { ...row, values: aySonuStokValues, total: totalAySonuStok };
            case "Ay Başı Stok Değeri":
                return { ...row, values: ayBasiStokValues, total: null }; // Total is not applicable
            case "Personel Sayısı (Sürücü Sayısı Hariç)":
                return { ...row, values: personelSayisiValues, total: totalPersonelSayisi };
            case "Ay içerisindeki Alımlar":
                return { ...row, values: ayIciAlimlarValues, total: totalAyIciAlimlar };
            case "Ay içerisindeki İade":
                return { ...row, values: ayIadeValues, total: totalAyIade };
            case "Maliyet":
                return { ...row, values: maliyetValues, total: totalMaliyet };
            case "Maliyet %":
                return { ...row, values: maliyetYuzdeValues, total: totalMaliyetYuzde };
            case "Personel Maaş Giderleri; SGK, Stopaj (Muhtasar) Dahil":
                return { ...row, values: personelMaasGiderleriValues, total: totalPersonelMaasGiderleri };
            case "Maaş Giderleri %":
                return { ...row, values: maasGiderleriYuzdeValues, total: totalMaasGiderleriYuzde };
            case "Ortalama Kişi Başı Maaş":
                return { ...row, values: ortalamaKisiBasiMaasValues, total: totalOrtalamaKisiBasiMaas };
            case "VPS (Personel Başına Ziyaretçi Sayısı)":
                return { ...row, values: vpsValues, total: totalVps };
            case "Stopajlı Kira":
                return { ...row, values: stopajliKiraValues, total: totalStopajliKira };
            case "Sabit Kira":
                return { ...row, values: sabitKiraValues, total: totalSabitKira };
            case "Ciro kira":
                return { ...row, values: ciroKiraValues, total: totalCiroKira };
            case "Ortak alan ve Genel Giderler":
                return { ...row, values: ortakGiderValues, total: totalOrtakGider };
            case "Depo Kira":
                return { ...row, values: depoKiraValues, total: totalDepoKira };
            case "Toplam Kira":
                return { ...row, values: toplamKiraValues, total: totalToplamKira };
            case "Toplam Kira %":
                return { ...row, values: toplamKiraYuzdeValues, total: totalToplamKiraYuzde };
            case "Yemeksepeti Komisyon ve Lojistik Giderleri":
                return { ...row, values: yemeksepetiKomisyonVeLojistikGiderleriValues, total: totalYemeksepetiKomisyonVeLojistikGiderleri };
            case "Trendyol Komisyon ve Lojistik Giderleri":
                return { ...row, values: trendyolKomisyonVeLojistikGiderleriValues, total: totalTrendyolKomisyonVeLojistikGiderleri };
            case "Getir Getirsin Komisyon ve Lojistik Giderleri":
                return { ...row, values: getirKomisyonVeLojistikGiderleriValues, total: totalGetirKomisyonVeLojistikGiderleri };
            case "Migros Hemen Komisyon ve Lojistik Giderleri":
                return { ...row, values: migrosKomisyonVeLojistikGiderleriValues, total: totalMigrosKomisyonVeLojistikGiderleri };
            default:
                return row;
        }
    });

    const newMoreRows = moreRows.map(row => {
        if (row.label === "Paket Komisyon ve Lojistik Giderleri") {
            return { ...row, values: paketKomisyonLojistikGiderleriValues, total: totalPaketKomisyonLojistikGiderleri };
        }
        if (row.label === "Paket Komisyon ve Lojistik (Paket Satış) %") {
            return { ...row, values: paketKomisyonLojistikYuzdeValues, total: totalPaketKomisyonLojistikYuzde };
        }
        if (row.label === "Diğer Detay Toplamı") {
            return { ...row, values: digerDetayToplamiValues, total: totalDigerDetayToplami };
        }
        if (row.label === "Tavuk Dünyası Lojistik Giderleri") {
            return { ...row, values: tavukDunyasiLojistikGiderleriValues, total: totalTavukDunyasiLojistikGiderleri };
        }
        if (row.label === "Toplam Diğer Giderler") {
            return { ...row, values: toplamDigerGiderlerValues, total: totalToplamDigerGiderler };
        }
        if (row.label === "Diğer Giderler %") {
            const digerGiderlerYuzdeValues = months.map((_, i) => {
                const gider = toplamDigerGiderlerValues[i] || 0;
                const ciro = toplamCiroValues[i] || 0;
                return ciro > 0 ? parseFloat(((gider / ciro) * 100).toFixed(2)) : 0;
            });
            const totalDigerGiderlerYuzde = totalToplamCiro > 0 ? parseFloat(((toplamDigerGiderlerValues.reduce((a, b) => a + b, 0) / totalToplamCiro) * 100).toFixed(2)) : 0;
            return { ...row, values: digerGiderlerYuzdeValues, total: totalDigerGiderlerYuzde };
        }
        if (row.label === "Tavuk Dünyası Ciro Primi") {
            return { ...row, values: tavukDunyasiCiroPrimiValues, total: totalTavukDunyasiCiroPrimi };
        }
        if (row.label === "Tavuk Dünyası Reklam Primi") {
            return { ...row, values: tavukDunyasiReklamPrimiValues, total: totalTavukDunyasiReklamPrimi };
        }
        if (row.label === "Ciro Primi ve Reklam Primi") {
            return { ...row, values: ciroPrimiVeReklamPrimiValues, total: totalCiroPrimiVeReklamPrimi };
        }
        if (row.label === "Ciro Primi ve Reklam %") {
            return { ...row, values: ciroPrimiVeReklamYuzdeValues, total: totalCiroPrimiVeReklamYuzde };
        }
        if (row.label === "Diğer Giderler") {
            return { ...row, values: digerGiderlerValues, total: totalDigerGiderler };
        }
        if (row.label === "Kredi Kartı Komisyon Giderleri") {
            return { ...row, values: krediKartiKomisyonGiderleriValues, total: totalKrediKartiKomisyonGiderleri };
        }
        if (row.label === "Yemek Kartı Komisyon Giderleri") {
            return { ...row, values: yemekKartiKomisyonGiderleriValues, total: totalYemekKartiKomisyonGiderleri };
        }
        if (row.label === "Toplam Kar / Zarar") {
            return { ...row, values: karZararValues, total: totalKarZarar };
        }
        if (row.label === "Toplam Kar / Zarar %") {
            return { ...row, values: karZararYuzdeValues, total: totalKarZararYuzde };
        }
        return row;
    });

    let tempProcessedDigerRows = digerDetayiRows.map(row => {
        if (row.label === "Demirbaş Sayılmayan Giderler") return row;

        if (row.label === "Kredi Kartı Komisyon Giderleri") {
            return { ...row, values: krediKartiKomisyonGiderleriValues, total: totalKrediKartiKomisyonGiderleri };
        }
        if (row.label === "Yemek Kartı Komisyon Giderleri") {
            return { ...row, values: yemekKartiKomisyonGiderleriValues, total: totalYemekKartiKomisyonGiderleri };
        }

        const categoriesToCalculate = [
            "Su", "Elektrik", "Doğalgaz Gideri", "İnternet ve Telefon",
            "Personel Yemek Giderleri", "Temizlik Giderleri", "Bakım Onarım",
            "Personel Tazminat (Kıdem, İhbar vb.)", "İlaçlama", "Baca Temizliği",
            "ÇTV, İşgaliye, İlan Reklam Vergi Bedelleri", "Kırtasiye",
            "Müşavirlik Ücreti", "HIJYEN DENETİMİ", "İşyeri Sigorta Gideri"
        ];

        if (categoriesToCalculate.includes(row.label)) {
            let categoryNameToSearch = row.label;
            if (row.label === "HIJYEN DENETİMİ") {
                categoryNameToSearch = "Hijyen / Gizli Müşteri Denetimi";
            }

            const kategori = kategoriList.find(k => k.Kategori_Adi === categoryNameToSearch);
            if (!kategori) {
                return { ...row, values: Array(12).fill(0), total: 0 };
            }
            const kategoriId = kategori.Kategori_ID;

            const monthlyValues = Array(12).fill(0);

            const processList = (list: any[]) => {
                if (!list) return;
                list.forEach(item => {
                    if (item.Kategori_ID === kategoriId) {
                        const itemYear = 2000 + parseInt(String(item.Donem).substring(0, 2));
                        if (itemYear === year) {
                            const monthIndex = parseInt(String(item.Donem).substring(2, 4)) - 1;
                            if (monthIndex >= 0 && monthIndex < 12) {
                                monthlyValues[monthIndex] += item.Tutar;
                            }
                        }
                    }
                });
            };

            processList(digerHarcamaList);
            processList(eFaturaList);

            const total = monthlyValues.reduce((a, b) => a + b, 0);
            return { ...row, values: monthlyValues, total: total };
        }
        return row;
    });

    const sumOfOtherDigerRowsValues = Array(12).fill(0);
    tempProcessedDigerRows.forEach(row => {
        if (row.label !== "Demirbaş Sayılmayan Giderler") {
            for (let i=0; i<12; i++) {
                sumOfOtherDigerRowsValues[i] += row.values[i] || 0;
            }
        }
    });

    const demirbasSayilmayanGiderlerValues = months.map((_, i) => {
        return digerDetayToplamiValues[i] - sumOfOtherDigerRowsValues[i];
    });
    const totalDemirbasSayilmayanGiderler = demirbasSayilmayanGiderlerValues.reduce((a, b) => a + b, 0);

    const processedDigerRows = tempProcessedDigerRows.map(row => {
        if (row.label === "Demirbaş Sayılmayan Giderler") {
            return { ...row, values: demirbasSayilmayanGiderlerValues, total: totalDemirbasSayilmayanGiderler };
        }
        return row;
    });

    return {
        processedExcelRows: newExcelRows,
        processedDigerRows: processedDigerRows,
        processedMoreRows: newMoreRows
    };
  }, [year, depoKiraRapor, gelirEkstraList, gelirList, kategoriList, stokFiyatList, stokSayimList, calisanList, ustKategoriList, digerHarcamaList, eFaturaList, allExpensesByCategory]);

  const formatCell = (v: any) => {
    if (v === null || v === undefined || v === '' || v === 0) return '';
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return v.toLocaleString('tr-TR');
      return v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(v);
  };

  const getCategoryStyle = (category: string, label: string) => {
    const L = label.toLowerCase();
    if (L.includes('toplam kar')) return 'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg';
    return 'bg-white hover:bg-gray-50';
  };

  const isBoldRow = (label: string) => {
    const boldLabels = [
      "Tabak Sayısı", "Çalışma Gün Sayısı", "Günlük Ziyaretçi Sayısı", "Toplam Ciro", "Maliyet", "Maliyet %",
      "Personel Sayısı (Sürücü Sayısı Hariç)", "Toplam Maaş Gideri (Sürücü Maaşı Hariç)", 
      "Personel Maaş Giderleri; SGK, Stopaj (Muhtasar) Dahil", "Ortalama Kişi Başı Maaş", "Maaş Giderleri %",
      "VPS (Personel Başına Ziyaretçi Sayısı)", "Toplam Kira", "Toplam Kira %", "Paket Komisyon ve Lojistik Giderleri",
      "Paket Komisyon ve Lojistik (Paket Satış) %", "Diğer Detay Toplamı", "Toplam Diğer Giderler", "Diğer Giderler %",
      "Ciro Primi ve Reklam Primi", "Ciro Primi ve Reklam %"
    ];
    return boldLabels.includes(label);
  };

  const isSeparatorRow = (label: string) => {
    const separatorLabels = [
      "Günlük Ziyaretçi Sayısı", "Restoran Ciro", "Maliyet %", "VPS (Personel Başına Ziyaretçi Sayısı)",
      "Toplam Kira %", "Paket Komisyon ve Lojistik (Paket Satış) %", "Diğer Giderler %", "Ciro Primi ve Reklam %"
    ];
    return separatorLabels.includes(label);
  };

  const renderRow = (r: any, idx: number) => (
    <React.Fragment key={idx}>
      <tr className={`${getCategoryStyle(r.category, r.label)} transition-all duration-200 hover:shadow-sm border-b border-gray-200`}>
        <td className={`px-4 py-3 text-gray-800 ${compactView ? 'text-xs' : 'text-sm'} ${isBoldRow(r.label) ? 'font-bold' : 'font-medium'}`}>
          {r.label}
        </td>
        {headers.map((h, i) => (
          <td key={h} className={`px-3 py-3 text-right ${compactView ? 'text-xs' : 'text-sm'} font-mono ${isBoldRow(r.label) ? 'font-bold' : ''}`}>
            {formatCell(r.values[i])}
          </td>
        ))}
        <td className={`px-3 py-3 text-right ${compactView ? 'text-xs' : 'text-sm'} font-mono bg-gray-50 ${isBoldRow(r.label) ? 'font-bold' : 'font-semibold'}`}>
          {formatCell(r.total)}
        </td>
      </tr>
      {isSeparatorRow(r.label) && (
        <tr key={`separator-${idx}`} className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
          <td colSpan={headers.length + 2} className="h-2"></td>
        </tr>
      )}
    </React.Fragment>
  );

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Custom formatter for Turkish locale (dot as thousand separator, comma as decimal separator)
    const formatTurkishNumber = (value: number): string => {
        if (value === null || value === undefined) return '';
        return value.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).replace(/\./g, '#').replace(/,/g, '.').replace(/#/g, ',');
    };

    // Helper to prepare data for a sheet
    const prepareSheetData = (rows: any[], includeTotalColumn: boolean = true) => {
        const data = [];
        // Add headers
        const sheetHeaders = ["Şube Raporu Adı", ...headers, ...(includeTotalColumn ? ["Toplam"] : [])];
        data.push(sheetHeaders);

        rows.forEach(row => {
            const rowData = [row.label, ...row.values.map(formatTurkishNumber)];
            if (includeTotalColumn) {
                rowData.push(formatTurkishNumber(row.total));
            }
            data.push(rowData);
        });
        return data;
    };

    // Sheet 1: Main Report Data (processedExcelRows)
    const excelRowsData = prepareSheetData(processedExcelRows);
    const wsExcelRows = XLSX.utils.aoa_to_sheet(excelRowsData);
    wsExcelRows['!cols'] = [{ wch: 30 }, ...Array(headers.length).fill({ wch: 15 }), { wch: 15 }]; // Adjust column widths
    XLSX.utils.book_append_sheet(wb, wsExcelRows, 'Ana Rapor');

    // Sheet 2: More Rows Data (processedMoreRows)
    const moreRowsData = prepareSheetData(processedMoreRows);
    const wsMoreRows = XLSX.utils.aoa_to_sheet(moreRowsData);
    wsMoreRows['!cols'] = [{ wch: 30 }, ...Array(headers.length).fill({ wch: 15 }), { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsMoreRows, 'Ek Rapor');

    // Sheet 3: Diğer Detayı (processedDigerRows)
    const digerRowsData = prepareSheetData(processedDigerRows);
    const wsDigerRows = XLSX.utils.aoa_to_sheet(digerRowsData);
    wsDigerRows['!cols'] = [{ wch: 30 }, ...Array(headers.length).fill({ wch: 15 }), { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsDigerRows, 'Diğer Detaylar');

    XLSX.writeFile(wb, `Bayi_Karlilik_Raporu_${year}.xlsx`);
  };

  const handleDownloadPdf = () => {
    generateDashboardPdf(
      'bayi-karlilik-raporu-content',
      `Bayi_Karlilik_Raporu_${year}.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bayi Karlılık Raporu</h1>
                <p className="text-sm text-gray-500 mt-1">Detaylı finansal analiz ve performans takibi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCompactView(!compactView)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                {compactView ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {compactView ? 'Detaylı Görünüm' : 'Kompakt Görünüm'}
              </button>
              
              {/* New Export Buttons */}
              {canExportExcel && (
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Icons.Download className="h-4 w-4" />
                  Excel'e Aktar
                </button>
              )}
              {canPrint && (
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Icons.DocumentReport className="h-4 w-4" />
                  PDF olarak İndir
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200" id="bayi-karlilik-raporu-content">
          {/* Top Scroll */}
          <div className="overflow-x-auto scrollbar-thin">
            <div className="h-4 min-w-full bg-transparent"></div>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                  <th className={`px-4 py-4 text-left font-semibold ${compactView ? 'text-xs' : 'text-sm'}`}>
                    Şube Raporu Adı
                  </th>
                  {headers.map((h) => (
                    <th key={h} className={`px-3 py-4 text-center font-semibold ${compactView ? 'text-xs' : 'text-sm'} min-w-[80px]`}>
                      {h}
                    </th>
                  ))}
                  <th className={`px-3 py-4 text-center font-semibold ${compactView ? 'text-xs' : 'text-sm'} bg-gray-800 min-w-[100px]`}>
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedExcelRows.map(renderRow)}

                {processedMoreRows.map(renderRow)}

                {/* Diğer Detayı Başlığı */}
                <tr 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md"
                  onClick={() => setShowDigerDetayi(!showDigerDetayi)}
                >
                  <td className="px-4 py-4 flex items-center justify-between" colSpan={headers.length + 2}>
                    <span className="text-lg font-bold">Diğer Detayı</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-75">
                        {showDigerDetayi ? 'Gizle' : 'Göster'}
                      </span>
                      {showDigerDetayi ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </td>
                </tr>

                {showDigerDetayi && processedDigerRows.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </div>
  );
};