import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Users, Clock, Target, BarChart3, Activity } from 'lucide-react';
import { useAppContext, useDataContext } from '../App';

export const VPSDashboardPage: React.FC = () => {
    const { puantajSecimiList, puantajList, gelirEkstraList, calisanList } = useDataContext();
  const { currentPeriod } = useAppContext();
  const [selectedMonth, setSelectedMonth] = useState(currentPeriod);
  const [loadData, setLoadData] = useState(false);

  const months = useMemo(() => {
    const endYear = 2000 + parseInt(currentPeriod.substring(0, 2));
    const endMonth = parseInt(currentPeriod.substring(2, 4));
    const startYear = 2025;
    const startMonth = 7;

    const generatedMonths = [];
    let year = endYear;
    let month = endMonth;

    while (year > startYear || (year === startYear && month >= startMonth)) {
        const monthStr = String(month).padStart(2, '0');
        const yearStr = String(year).substring(2);
        const value = `${yearStr}${monthStr}`;
        
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        const label = `${value} - ${monthNames[month - 1]} ${year}`;
        
        generatedMonths.push({ value, label });

        month--;
        if (month === 0) {
            month = 12;
            year--;
        }
    }
    return generatedMonths;
  }, [currentPeriod]);

  React.useEffect(() => {
    setSelectedMonth(currentPeriod);
  }, [currentPeriod]);

  // Random tarih dizisi oluştur (1-30 arası)
  const dates = useMemo(() => {
    if (!selectedMonth || selectedMonth.length !== 4) return [];
    const year = 2000 + parseInt(selectedMonth.substring(0, 2));
    const month = parseInt(selectedMonth.substring(2, 4));
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedMonth]);

  const mainData = useMemo(() => {
    if (!loadData) return [];
    const year = 2000 + parseInt(selectedMonth.substring(0, 2));
    const month = parseInt(selectedMonth.substring(2, 4));

    const calisanValues = dates.map(day => {
      const currentDayDate = new Date(year, month - 1, day);
      currentDayDate.setHours(0, 0, 0, 0); // Normalize to start of the day

      if (!calisanList) return 0;

      return calisanList.filter(c => {
        const girisDate = new Date(c.Sigorta_Giris);
        girisDate.setHours(0, 0, 0, 0); // Normalize

        const cikisDate = c.Sigorta_Cikis ? new Date(c.Sigorta_Cikis) : null;
        if (cikisDate) {
          cikisDate.setHours(0, 0, 0, 0); // Normalize
        }
        
        // Check if the currentDayDate is within the employee's active period
        // Sigorta_Giris <= currentDayDate AND (Sigorta_Cikis IS NULL OR Sigorta_Cikis > currentDayDate)
        return girisDate <= currentDayDate && (!cikisDate || cikisDate > currentDayDate);
      }).length;
    });
    const aktifCalisanValues = dates.map(day => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (!puantajList || !puantajSecimiList) return 0;

      const activePuantajRecords = puantajList.filter(p => {
        const pDate = p.Tarih.split('T')[0];
        return pDate === dateStr;
      });

      let count = 0;
      activePuantajRecords.forEach(p => {
        const secim = puantajSecimiList.find(s => s.Secim_ID === p.Secim_ID);
        if (secim && secim.Secim.includes('Çalışma')) {
          count++;
        }
      });
      return count;
    });

    const izinliCalisanValues = dates.map(day => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (!puantajList || !puantajSecimiList) return 0;

      const dailyPuantajRecords = puantajList.filter(p => {
        const pDate = p.Tarih.split('T')[0];
        return pDate === dateStr;
      });

      let count = 0;
      dailyPuantajRecords.forEach(p => {
        const secim = puantajSecimiList.find(s => s.Secim_ID === p.Secim_ID);
        if (secim && secim.Secim.includes('İzin')) {
          count++;
        }
      });
      return count;
    });

    // Ortalamaları hesapla
    const calisanOrtalama = (calisanValues.reduce((a, b) => a + b, 0) / calisanValues.length).toFixed(1);
    const aktifCalisanOrtalama = (aktifCalisanValues.reduce((a, b) => a + b, 0) / aktifCalisanValues.length).toFixed(1);
    const izinliCalisanOrtalama = (izinliCalisanValues.reduce((a, b) => a + b, 0) / izinliCalisanValues.length).toFixed(1);

    // Puantaj Günü Calculation
    const secimDegeriMap = new Map<number, number>();
    if(puantajSecimiList) {
        puantajSecimiList.forEach(s => secimDegeriMap.set(s.Secim_ID, s.Degeri));
    }

    const dailyPuantajCounts = new Map<string, Map<number, number>>();
    
    if(puantajList) {
        puantajList.forEach(p => {
          const pDate = new Date(p.Tarih);
          if (pDate.getFullYear() === year && (pDate.getMonth() + 1) === month) {
            const dateStr = p.Tarih.split('T')[0]; // Assuming YYYY-MM-DDTHH:mm:ss format
            if (!dailyPuantajCounts.has(dateStr)) {
              dailyPuantajCounts.set(dateStr, new Map<number, number>());
            }
            const dayMap = dailyPuantajCounts.get(dateStr)!;
            dayMap.set(p.Secim_ID, (dayMap.get(p.Secim_ID) || 0) + 1);
          }
        });
    }

    const puantajGunuValues = dates.map(day => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let totalDeger = 0;
      if (dailyPuantajCounts.has(dateStr)) {
        const dayMap = dailyPuantajCounts.get(dateStr)!;
        for (const [secimId, count] of dayMap.entries()) {
          const degeri = secimDegeriMap.get(secimId) || 0;
          totalDeger += count * degeri;
        }
      }
      return totalDeger;
    });

    // Tabak Sayısı Calculation
    const tabakSayisiValues = dates.map(day => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const gelirEkstra = gelirEkstraList ? gelirEkstraList.find(ge => ge.Tarih.split('T')[0] === dateStr) : null;
      return gelirEkstra ? gelirEkstra.Tabak_Sayisi : 0;
    });

    // VPS Calculation
    const vps = dates.map((_, index) => {
      const tabak = tabakSayisiValues[index];
      const calisan = calisanValues[index];
      if (calisan === 0) {
        return 0;
      }
      return parseFloat((tabak / calisan).toFixed(2));
    });


    const data = [
      { 
        label: `Çalışan Ortalaması`, 
        average: calisanOrtalama,
        values: calisanValues,
        icon: Users,
        color: 'from-blue-500 to-blue-600'
      },
      { 
        label: `Aktif Çalışan Ortalaması`, 
        average: aktifCalisanOrtalama,
        values: aktifCalisanValues,
        icon: Activity,
        color: 'from-green-500 to-green-600'
      },
      { 
        label: `İzinli Çalışan Ortalaması`, 
        average: izinliCalisanOrtalama,
        values: izinliCalisanValues,
        icon: Clock,
        color: 'from-yellow-500 to-yellow-600'
      },
      { 
        label: 'Puantaj Günü', 
        values: puantajGunuValues,
        icon: Calendar,
        color: 'from-purple-500 to-purple-600'
      },
      { 
        label: 'Tabak Sayısı', 
        values: tabakSayisiValues,
        icon: Target,
        color: 'from-orange-500 to-orange-600'
      },
      { 
        label: 'VPS', 
        values: vps,
        icon: BarChart3,
        color: 'from-indigo-500 to-indigo-600'
      }
    ];

    return data.map(row => {
      let totalValue;
      if (row.label === 'VPS') {
        const totalTabak = data.find(r => r.label === 'Tabak Sayısı').values.reduce((a, b) => a + b, 0);
        const totalCalisan = data.find(r => r.label.includes('Çalışan Ortalaması')).values.reduce((a, b) => a + b, 0);
        totalValue = totalCalisan === 0 ? 0 : parseFloat((totalTabak / totalCalisan).toFixed(2));
      } else {
        totalValue = row.values.reduce((a, b) => a + b, 0);
      }
      
      return {
        ...row,
        total: totalValue
      };
    });
  }, [dates, puantajList, puantajSecimiList, selectedMonth, gelirEkstraList, calisanList, loadData]);

  const scoreData = useMemo(() => {
    if (!puantajSecimiList || !puantajList || !selectedMonth || !loadData) return [];

    const year = 2000 + parseInt(selectedMonth.substring(0, 2));
    const month = parseInt(selectedMonth.substring(2, 4));

    const puantajCounts = new Map<string, number>(); // Key: "YYYY-MM-DD_Secim_ID", Value: count

    puantajList.forEach(p => {
      const pDate = new Date(p.Tarih);
      if (pDate.getFullYear() === year && (pDate.getMonth() + 1) === month) {
        const key = `${p.Tarih}_${p.Secim_ID}`;
        puantajCounts.set(key, (puantajCounts.get(key) || 0) + 1);
      }
    });

    const data = puantajSecimiList
      .filter(item => item.Aktif_Pasif)
      .map(secim => {
        const personCounts = dates.map(day => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const key = `${dateStr}_${secim.Secim_ID}`;
          return puantajCounts.get(key) || 0;
        });

        return {
          label: secim.Secim,
          multiplier: `${secim.Degeri.toFixed(1)}x`,
          personCounts: personCounts,
          color: secim.Renk_Kodu || '#888888'
        };
      });

    return data.map(row => ({
      ...row,
      total: row.personCounts.reduce((a, b) => a + b, 0)
    }));
  }, [dates, puantajSecimiList, puantajList, selectedMonth, loadData]);

  const { iseGirenCalisanSayisi, istenCikanCalisanSayisi } = useMemo(() => {
    if (!calisanList || !selectedMonth || !loadData) {
      return { iseGirenCalisanSayisi: 0, istenCikanCalisanSayisi: 0 };
    }

    const year = 2000 + parseInt(selectedMonth.substring(0, 2));
    const month = parseInt(selectedMonth.substring(2, 4));
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const iseGiren = calisanList.filter(c => {
      const girisDate = new Date(c.Sigorta_Giris);
      return girisDate >= firstDayOfMonth && girisDate <= lastDayOfMonth;
    }).length;

    const istenCikan = calisanList.filter(c => {
      if (!c.Sigorta_Cikis) return false;
      const cikisDate = new Date(c.Sigorta_Cikis);
      return cikisDate >= firstDayOfMonth && cikisDate <= lastDayOfMonth;
    }).length;

    return { iseGirenCalisanSayisi: iseGiren, istenCikanCalisanSayisi: istenCikan };
  }, [calisanList, selectedMonth, loadData]);

  const isWeekend = (date) => {
    const day = new Date(2025, parseInt(selectedMonth.slice(2)) - 1, date).getDay();
    return day === 0 || day === 6; // Pazar = 0, Cumartesi = 6
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedMonth(e.target.value);
      setLoadData(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                VPS Dashboard
              </h1>
              <p className="text-slate-600 text-lg">Personel ve performans takip sistemi</p>
            </div>
            
            {/* Month Selector */}
            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={handleMonthChange}
                className="appearance-none px-6 py-3 pr-10 border-2 border-white/50 rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 min-w-56"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {!loadData ? (
            <div className="text-center py-20 bg-white/50 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-700">Raporu Görüntülemek İçin Bir Dönem Seçin</h2>
              <p className="text-slate-500 mt-2">Yukarıdaki menüden bir ay seçerek başlayın.</p>
            </div>
        ) : (
        <>
        {/* Stats Cards - SADECE 4 KART */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* İlk 2 kart: Ortalamalar */}
          {mainData.slice(0, 2).map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-slate-800">{stat.average || '0'}</p>
            </div>
          ))}
          
          {/* 3. kart: İşe Giren Çalışan Sayısı */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">İşe Giren Çalışan Sayısı</h3>
            <p className="text-3xl font-bold text-slate-800">{iseGirenCalisanSayisi}</p>
          </div>
          
          {/* 4. kart: İşten Çıkan Çalışan Sayısı */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">İşten Çıkan Çalışan Sayısı</h3>
            <p className="text-3xl font-bold text-slate-800">{istenCikanCalisanSayisi}</p>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Detaylı Analiz Tablosu
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <th className="text-left p-4 font-bold text-slate-700 w-56 sticky left-0 bg-gradient-to-r from-slate-50 to-slate-100 z-10 border-r-2 border-slate-200">
                    Metrik
                  </th>
                  {dates.map((date) => (
                    <th key={date} className={`text-center p-3 font-bold w-16 border-r border-slate-200 transition-colors duration-200 ${
                      isWeekend(date) 
                        ? 'bg-gradient-to-b from-red-50 to-red-100 text-red-700' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto font-bold ${ 
                        isWeekend(date)
                          ? 'bg-red-200 text-red-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {date}
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-4 font-bold text-slate-700 w-24 sticky right-0 bg-gradient-to-l from-slate-100 to-slate-50 z-10 border-l-2 border-slate-200">
                    Toplam
                  </th>
                </tr>
              </thead>
              
              <tbody>
                {/* Main Data Rows */}
                {mainData.map((row, index) => (
                  <tr key={index} className="border-b border-slate-200/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300 group">
                    <td className="p-4 font-bold text-slate-700 border-r-2 border-slate-200 bg-gradient-to-r from-slate-50/80 to-white/80 sticky left-0 z-10 group-hover:from-blue-100/80 group-hover:to-blue-50/80 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${row.color} shadow-md`}>
                          <row.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{row.label}</div>
                          {row.average && (
                            <div className="text-sm text-slate-600 font-medium">Ort: {row.average}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex} className={`p-3 text-center border-r border-slate-100 transition-all duration-200 ${ 
                        isWeekend(dates[colIndex]) ? 'bg-red-50/30' : ''
                      }`}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto font-bold text-slate-700 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                          {value}
                        </div>
                      </td>
                    ))}
                    <td className="p-4 font-bold text-slate-800 border-l-2 border-slate-200 bg-gradient-to-l from-slate-100/80 to-white/80 sticky right-0 z-10 group-hover:from-blue-100/80 group-hover:to-blue-50/80 transition-all duration-300">
                      <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto font-bold text-blue-800 shadow-md">
                        {row.total}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Separator Row */}
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 border-y-4 border-indigo-200">
                  <td colSpan={dates.length + 2} className="p-6 text-center font-bold text-white text-xl">
                    <div className="flex items-center justify-center gap-3">
                      <Target className="w-8 h-8" />
                      Puantaj Özeti
                    </div>
                  </td>
                </tr>
                
                {/* New Header for Score Data */}
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <th className="text-left p-4 font-bold text-slate-700 w-56 sticky left-0 bg-gradient-to-r from-slate-50 to-slate-100 z-10 border-r-2 border-slate-200">
                    Metrik
                  </th>
                  {dates.map((date) => (
                    <th key={date} className={`text-center p-3 font-bold w-16 border-r border-slate-200 transition-colors duration-200 ${
                      isWeekend(date) 
                        ? 'bg-gradient-to-b from-red-50 to-red-100 text-red-700' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto font-bold ${ 
                        isWeekend(date)
                          ? 'bg-red-200 text-red-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {date}
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-4 font-bold text-slate-700 w-24 sticky right-0 bg-gradient-to-l from-slate-100 to-slate-50 z-10 border-l-2 border-slate-200">
                    Toplam
                  </th>
                </tr>

                {/* Score Data Rows */}
                {scoreData.map((row, index) => (
                  <tr key={`score-${index}`} className="border-b border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-300 group">
                    <td className="p-4 border-r-2 border-slate-200 bg-gradient-to-r from-slate-50/80 to-white/80 sticky left-0 z-10 group-hover:from-slate-100/80 group-hover:to-slate-50/80 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800">{row.label}</div>
                        <div 
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2`}
                          style={{
                            borderColor: row.color,
                            backgroundColor: `${row.color}20`,
                            color: row.color,
                          }}
                        >
                          {row.multiplier}
                        </div>
                      </div>
                    </td>
                    {row.personCounts.map((count, colIndex) => (
                      <td key={colIndex} className={`p-3 text-center border-r border-slate-100 transition-all duration-200 ${ 
                        isWeekend(dates[colIndex]) ? 'bg-red-50/30' : ''
                      }`}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-full min-w-8">
                            {count}
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="p-4 font-bold text-slate-800 border-l-2 border-slate-200 bg-gradient-to-l from-slate-100/80 to-white/80 sticky right-0 z-10 group-hover:from-slate-100/80 group-hover:to-slate-50/80 transition-all duration-300">
                      <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto font-bold text-slate-800 shadow-md">
                        {row.total}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500">
          <p className="text-sm">VPS Dashboard - Real-time personel takip sistemi</p>
        </div>
      </div>
    </div>
  );
};