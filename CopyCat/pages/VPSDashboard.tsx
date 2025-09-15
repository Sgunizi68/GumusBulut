import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Users, Clock, Target, BarChart3, Activity } from 'lucide-react';

export const VPSDashboardPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2509');

  const months = [
    { value: '2509', label: '2509 - Eylül 2025' },
    { value: '2508', label: '2508 - Ağustos 2025' },
    { value: '2507', label: '2507 - Temmuz 2025' },
    { value: '2506', label: '2506 - Haziran 2025' }
  ];

  // Random tarih dizisi oluştur (1-30 arası)
  const dates = useMemo(() => {
    const randomDates = [];
    const dayCount = Math.floor(Math.random() * 10) + 15; // 15-25 gün arası
    const allDays = Array.from({length: 30}, (_, i) => i + 1);
    
    // Rastgele günler seç
    for (let i = 0; i < dayCount; i++) {
      const randomIndex = Math.floor(Math.random() * allDays.length);
      randomDates.push(allDays[randomIndex]);
      allDays.splice(randomIndex, 1);
    }
    
    return randomDates.sort((a, b) => a - b);
  }, [selectedMonth]);

  const mainData = useMemo(() => {
    const calisan = dates.map(() => Math.floor(Math.random() * 10) + 5); // 5-15 arası
    const aktifCalisan = dates.map(() => Math.floor(Math.random() * 8) + 3); // 3-11 arası
    const tabakSayisi = dates.map(() => Math.floor(Math.random() * 40) + 30); // 30-70 arası
    const vps = dates.map(() => Math.floor(Math.random() * 3) + 2); // 2-4 arası

    // Ortalamaları hesapla
    const calisanOrtalama = (calisan.reduce((a, b) => a + b, 0) / calisan.length).toFixed(1);
    const aktifCalisanOrtalama = (aktifCalisan.reduce((a, b) => a + b, 0) / aktifCalisan.length).toFixed(1);

    return [
      { 
        label: `Çalışan Ortalaması`, 
        average: calisanOrtalama,
        values: calisan,
        icon: Users,
        color: 'from-blue-500 to-blue-600'
      },
      { 
        label: `Aktif Çalışan Ortalaması`, 
        average: aktifCalisanOrtalama,
        values: aktifCalisan,
        icon: Activity,
        color: 'from-green-500 to-green-600'
      },
      { 
        label: 'Puantaj Günü', 
        values: dates,
        icon: Calendar,
        color: 'from-purple-500 to-purple-600'
      },
      { 
        label: 'Tabak Sayısı', 
        values: tabakSayisi,
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
  }, [dates]);

  const scoreData = useMemo(() => {
    const generateRandomValues = (probability = 0.3, value = '') => {
      return dates.map(() => Math.random() < probability ? value : '');
    };

    const generatePersonCounts = () => {
      return dates.map(() => Math.floor(Math.random() * 8) + 1);
    };

    const categories = [
      { 
        label: 'Bayram Arife', 
        multiplier: '1.5x',
        values: generateRandomValues(0.05, '1.5'), // Daha az göster
        className: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200',
        activeClass: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
      },
      { 
        label: 'Bayram Tatil', 
        multiplier: '2.0x',
        values: generateRandomValues(0.08, '2.0'), // Daha az göster
        className: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200',
        activeClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
      },
      { 
        label: 'Çalışıyor', 
        multiplier: '1.0x',
        values: generateRandomValues(0.05, '1.0'), // Daha az göster
        className: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200',
        activeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105'
      },
      { 
        label: 'Çıkış', 
        multiplier: '0.0x',
        values: generateRandomValues(0.03, '0.0'), // Daha az göster
        className: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200',
        activeClass: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
      },
      { 
        label: 'Haftalık İzin', 
        multiplier: '1.0x',
        values: generateRandomValues(0.04, '1.0'), // Daha az göster
        className: 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-800 border-violet-200',
        activeClass: 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-lg scale-105'
      },
      { 
        label: 'İzinde Çalışma', 
        multiplier: '2.0x',
        values: generateRandomValues(0.02, '2.0'), // Çok az göster
        className: 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border-teal-200',
        activeClass: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg scale-105'
      },
      { 
        label: 'Yıllık İzin', 
        multiplier: '1.0x',
        values: generateRandomValues(0.03, '1.0'), // Daha az göster
        className: 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 border-pink-200',
        activeClass: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg scale-105'
      }
    ];

    // Her kategori için kişi sayılarını hesapla - her hücre için
    return categories.map(category => ({
      ...category,
      personCounts: generatePersonCounts() // Her gün için kişi sayısı
    }));
  }, [dates]);

  const isWeekend = (date) => {
    const day = new Date(2025, parseInt(selectedMonth.slice(2)) - 1, date).getDay();
    return day === 0 || day === 6; // Pazar = 0, Cumartesi = 6
  };

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
                onChange={(e) => setSelectedMonth(e.target.value)}
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
            <p className="text-3xl font-bold text-slate-800">{Math.floor(Math.random() * 5) + 8}</p>
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
            <p className="text-3xl font-bold text-slate-800">{Math.floor(Math.random() * 3) + 1}</p>
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
              {/* Header */}
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
                  </tr>
                ))}
                
                {/* Separator Row */}
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 border-y-4 border-indigo-200">
                  <td colSpan={dates.length + 1} className="p-6 text-center font-bold text-white text-xl">
                    <div className="flex items-center justify-center gap-3">
                      <Target className="w-8 h-8" />
                      Puantaj Özeti
                    </div>
                  </td>
                </tr>
                
                {/* Score Data Rows */}
                {scoreData.map((row, index) => (
                  <tr key={`score-${index}`} className="border-b border-slate-200/50 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-300 group">
                    <td className="p-4 border-r-2 border-slate-200 bg-gradient-to-r from-slate-50/80 to-white/80 sticky left-0 z-10 group-hover:from-slate-100/80 group-hover:to-slate-50/80 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800">{row.label}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${row.className}`}>
                          {row.multiplier}
                        </div>
                      </div>
                    </td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex} className={`p-3 text-center border-r border-slate-100 transition-all duration-200 ${ 
                        isWeekend(dates[colIndex]) ? 'bg-red-50/30' : ''
                      }`}>
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-full min-w-8">
                            {row.personCounts && row.personCounts[colIndex] ? row.personCounts[colIndex] : 0}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500">
          <p className="text-sm">VPS Dashboard - Real-time personel takip sistemi</p>
        </div>
      </div>
    </div>
  );
};