import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, TrendingUp, Eye, EyeOff } from "lucide-react";

const months = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
];

// Satır başlıkları PDF'den alındı. "Diğer Detayı" gruplaması eklendi.
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
  "Elektrik",
  "Su",
  "Doğalgaz Gideri",
  "İnternet ve Telefon",
  "Demirbaş Sayılmayan Giderler",
  "Lisans / Yazılım",
  "Sarf Malzemeleri",
  "Haberleşme / İnternet",
  "Sigorta",
  "Danışmanlık",
  "İzin / Ruhsat",
  "Banka Masrafları",
  "Eğitim",
  "Kırtasiye",
  "Seyahat",
  "Konaklama",
  "Temsil / Ağırlama",
  "Ceza / Tazminat",
  "Diğer"
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

export default function BayiKarlilikMockup() {
  const [year, setYear] = useState(2024);
  const [showDigerDetayi, setShowDigerDetayi] = useState(false);
  const [compactView, setCompactView] = useState(false);

  // Generate headers dynamically based on selected year (AAAYY format)
  const headers = months.map((m) => `${m}${String(year).slice(2)}`);

  // Calculate working days for each month based on the year (all days of the month)
  const calculateWorkingDays = (monthIndex, year) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  // Update working days in excelRows
  const updatedExcelRows = excelRows.map(row => {
    if (row.label === "Çalışma Gün Sayısı") {
      const workingDaysValues = months.map((_, index) => calculateWorkingDays(index, year));
      const totalWorkingDays = workingDaysValues.reduce((sum, days) => sum + days, 0);
      return {
        ...row,
        values: workingDaysValues,
        total: totalWorkingDays
      };
    }
    return row;
  });

  const formatCell = (v) => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return v.toLocaleString('tr-TR');
      return v.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
    }
    return String(v);
  };

  const getCategoryStyle = (category, label) => {
    const L = label.toLowerCase();
    if (L.includes('toplam kar')) return 'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg';
    return 'bg-white hover:bg-gray-50';
  };

  const isBoldRow = (label) => {
    const boldLabels = [
      "Tabak Sayısı",
      "Çalışma Gün Sayısı", 
      "Günlük Ziyaretçi Sayısı",
      "Toplam Ciro",
      "Maliyet",
      "Maliyet %",
      "Personel Sayısı (Sürücü Sayısı Hariç)",
      "Toplam Maaş Gideri (Sürücü Maaşı Hariç)",
      "Personel Maaş Giderleri; SGK, Stopaj (Muhtasar) Dahil",
      "Ortalama Kişi Başı Maaş",
      "Maaş Giderleri %",
      "VPS (Personel Başına Ziyaretçi Sayısı)",
      "Toplam Kira",
      "Toplam Kira %",
      "Paket Komisyon ve Lojistik Giderleri",
      "Paket Komisyon ve Lojistik (Paket Satış) %",
      "Toplam Diğer Giderler",
      "Diğer Giderler %",
      "Ciro Primi ve Reklam Primi",
      "Ciro Primi ve Reklam %"
    ];
    return boldLabels.includes(label);
  };

  const isSeparatorRow = (label) => {
    const separatorLabels = [
      "Günlük Ziyaretçi Sayısı",
      "Restoran Ciro", 
      "Maliyet %",
      "VPS (Personel Başına Ziyaretçi Sayısı)",
      "Toplam Kira %",
      "Paket Komisyon ve Lojistik (Paket Satış) %",
      "Diğer Giderler %",
      "Ciro Primi ve Reklam %"
    ];
    return separatorLabels.includes(label);
  };

  const renderRow = (r, idx) => (
    <>
      <tr key={idx} className={`${getCategoryStyle(r.category, r.label)} transition-all duration-200 hover:shadow-sm border-b border-gray-200`}>
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
    </>
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
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
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
                {updatedExcelRows.map(renderRow)}

                {moreRows.map(renderRow)}

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

                {showDigerDetayi && digerDetayiRows.map(renderRow)}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </div>
  );
}