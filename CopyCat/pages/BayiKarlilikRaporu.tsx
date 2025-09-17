import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Calendar, TrendingUp, Eye, EyeOff } from "lucide-react";
import { useAppContext, useDataContext } from '../App';
import { Card } from '../components';

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
  "Elektrik", "Su", "Doğalgaz", "Temizlik", "Bakım / Onarım", "Lisans / Yazılım",
  "Sarf Malzemeleri", "Haberleşme / İnternet", "Sigorta", "Danışmanlık", "İzin / Ruhsat",
  "Banka Masrafları", "Eğitim", "Kırtasiye", "Seyahat", "Konaklama", "Temsil / Ağırlama",
  "Ceza / Tazminat", "Diğer"
].map((label) => ({ label, values: Array(12).fill(null), total: null, category: "diger" }));

const moreRows = [
  { label: "Paket Komisyon ve Lojistik Giderleri", values: Array(12).fill(null), total: null, category: "komisyon" },
  { label: "Paket Komisyon ve Lojistik (Paket Satış) %", values: Array(12).fill(null), total: null, category: "komisyon" },
  { label: "Diğer Giderler", values: Array(12).fill(null), total: null, category: "gider" },
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
  const { gelirEkstraList, gelirList, kategoriList, stokFiyatList, stokSayimList, calisanList, ustKategoriList, digerHarcamaList, eFaturaList } = useDataContext();
  const pageTitle = "Bayi Karlılık Raporu";
  const requiredPermission = "Bayi Karlılık Raporu Görüntüleme"; 

  const [year, setYear] = useState(new Date().getFullYear());
  const [showDigerDetayi, setShowDigerDetayi] = useState(false);
  const [compactView, setCompactView] = useState(false);

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
            default:
                return row;
        }
    });

    return { 
        processedExcelRows: newExcelRows, 
        processedDigerRows: digerDetayiRows, 
        processedMoreRows: moreRows 
    };
  }, [year, gelirEkstraList, gelirList, kategoriList, stokFiyatList, stokSayimList, calisanList, ustKategoriList, digerHarcamaList, eFaturaList]);

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
      "Paket Komisyon ve Lojistik (Paket Satış) %", "Toplam Diğer Giderler", "Diğer Giderler %",
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
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
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