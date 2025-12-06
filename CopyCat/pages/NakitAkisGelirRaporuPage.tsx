import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAppContext, useDataContext, fetchData } from '../App';
import { API_BASE_URL } from '../constants';

export const NakitAkisGelirRaporuPage: React.FC = () => {
  const { showError } = useToast();
  const { selectedBranch } = useAppContext();
  const { degerList, gelirList, kategoriList, ustKategoriList } = useDataContext();
  const [nakitGelirData, setNakitGelirData] = useState([]);
  const [posOdemeleriData, setPosOdemeleriData] = useState([]);
  const [yemekCekiData, setYemekCekiData] = useState([]);
  const [onlineVirmanData, setOnlineVirmanData] = useState([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const getDefaultEndDate = () => {
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(5);
    return nextMonth;
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(formatDateForInput(today));
  const [endDate, setEndDate] = useState(formatDateForInput(getDefaultEndDate()));

  useEffect(() => {
    if (selectedBranch) {
        const queryStartDate = new Date(startDate);
        const queryEndDate = new Date(endDate);

        fetchData<any[]>(`${API_BASE_URL}/gelir/nakit-tahmin?start_date=${formatDateForInput(queryStartDate)}&end_date=${formatDateForInput(queryEndDate)}&sube_id=${selectedBranch.Sube_ID}`)
            .then(data => {
                if (data) {
                    setNakitGelirData(data);
                }
            });

        fetchData<any[]>(`${API_BASE_URL}/rapor/pos-odemeleri?start_date=${formatDateForInput(queryStartDate)}&end_date=${formatDateForInput(queryEndDate)}&sube_id=${selectedBranch.Sube_ID}`)
            .then(data => {
                if (data) {
                    setPosOdemeleriData(data);
                }
            });

        fetchData<any[]>(`${API_BASE_URL}/rapor/yemek-ceki?start_date=${formatDateForInput(queryStartDate)}&end_date=${formatDateForInput(queryEndDate)}&sube_id=${selectedBranch.Sube_ID}`)
            .then(data => {
                if (data) {
                    setYemekCekiData(data);
                }
            });

        fetchData<any[]>(`${API_BASE_URL}/rapor/online-virman?start_date=${formatDateForInput(queryStartDate)}&end_date=${formatDateForInput(queryEndDate)}&sube_id=${selectedBranch.Sube_ID}`)
            .then(data => {
                if (data) {
                    setOnlineVirmanData(data);
                }
            });
    }
  }, [startDate, endDate, selectedBranch]);

  const generateCashFlowData = (start, end, gelirData, posOdemeleriData, yemekCekiData, onlineVirmanData) => {
    const data = [];
    const currentDate = new Date(start);
    const endDateTime = new Date(end);
    
    const gelirMap = new Map(gelirData.map(item => [formatDateForInput(new Date(item.Tarih)), item.Tutar]));
    const posOdemeleriMap = new Map(posOdemeleriData.map(item => [formatDateForInput(new Date(item.Gun)), item.POS_Odemesi]));
    const yemekCekiMap = new Map(yemekCekiData.map(item => [formatDateForInput(new Date(item.Gun)), item.Yemek_Ceki]));
    const onlineVirmanMap = new Map(onlineVirmanData.map(item => [formatDateForInput(new Date(item.Gun)), item.Online_Virman]));

    while (currentDate <= endDateTime) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const priorDate = new Date(currentDate);
      priorDate.setDate(priorDate.getDate() - 28);
      const formattedPriorDate = formatDateForInput(priorDate);

      const estimatedCash = gelirMap.get(formattedPriorDate) || 0;
      
      const posPayment = posOdemeleriMap.get(formatDateForInput(currentDate)) || 0;
      const mealVoucher = yemekCekiMap.get(formatDateForInput(currentDate)) || 0;
      const onlineTransfer = onlineVirmanMap.get(formatDateForInput(currentDate)) || 0;
      
      const total = posPayment + mealVoucher + onlineTransfer;
      
      data.push({
        date: new Date(currentDate),
        estimatedCash,
        posPayment,
        mealVoucher,
        onlineTransfer,
        total
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const cashFlowData = useMemo(() => {
    return generateCashFlowData(startDate, endDate, nakitGelirData, posOdemeleriData, yemekCekiData, onlineVirmanData);
  }, [startDate, endDate, nakitGelirData, posOdemeleriData, yemekCekiData, onlineVirmanData]);

  const totals = useMemo(() => {
    return cashFlowData.reduce((acc, row) => ({
      estimatedCash: acc.estimatedCash + row.estimatedCash,
      posPayment: acc.posPayment + row.posPayment,
      mealVoucher: acc.mealVoucher + row.mealVoucher,
      onlineTransfer: acc.onlineTransfer + row.onlineTransfer,
      total: acc.total + row.total
    }), {
      estimatedCash: 0,
      posPayment: 0,
      mealVoucher: 0,
      onlineTransfer: 0,
      total: 0
    });
  }, [cashFlowData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getDayName = (date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
  };

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    const [year, month, day] = newDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    
    if (selectedDate >= today) {
      setStartDate(newDate);
    } else {
        showError("Geçersiz Tarih", "Başlangıç tarihi bugünden önce olamaz.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-800">Nakit Akış - Gelir Raporu</h1>
          </div>
          
          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={startDate}
                min={formatDateForInput(today)}
                onChange={handleStartDateChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-sm opacity-90 mb-1">Tahmini Nakit</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.estimatedCash)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-sm opacity-90 mb-1">POS Ödemesi</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.posPayment)}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-sm opacity-90 mb-1">Yemek Çeki</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.mealVoucher)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <div className="text-sm opacity-90 mb-1">Toplam Gelir</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Gün</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Tahmini Nakit</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">POS Ödemesi</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Yemek Çeki</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Online Virman</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cashFlowData.map((row, index) => {
                  const isWeekend = row.date.getDay() === 0 || row.date.getDay() === 6;
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-slate-50 transition-colors ${isWeekend ? 'bg-amber-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{formatDate(row.date)}</div>
                        <div className="text-xs text-slate-500">{getDayName(row.date)}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">
                        {formatCurrency(row.estimatedCash)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatCurrency(row.posPayment)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatCurrency(row.mealVoucher)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        {formatCurrency(row.onlineTransfer)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                        {formatCurrency(row.total)}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="bg-slate-800 text-white font-bold">
                  <td className="px-6 py-4">TOPLAM</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totals.estimatedCash)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totals.posPayment)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totals.mealVoucher)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totals.onlineTransfer)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(totals.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Bu rapordaki değerler tahmin edilmiştir. Hafta sonları ve hafta içi günler için farklı 
            tahmin algoritmaları kullanılmaktadır. Gerçek değerler değişiklik gösterebilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NakitAkisGelirRaporuPage;
