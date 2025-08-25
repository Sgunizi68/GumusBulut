import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, useDataContext } from '../App';
import { Button, Card, Select, TableLayout } from '../components';
import { Icons } from '../constants';

interface ReportDataItem {
    Tarih: string;
    Donem: number;
    Tutar: number;
}

interface NakitYatirmaRaporuData {
    bankaya_yatan: ReportDataItem[];
    nakit_girisi: ReportDataItem[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

const API_BASE_URL = "https://gumusbulut.onrender.com/api/v1";

export const NakitYatirmaRaporuPage: React.FC = () => {
    const { selectedBranch, currentPeriod } = useAppContext();
    const [reportData, setReportData] = useState<NakitYatirmaRaporuData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Function moved before usage to fix Temporal Dead Zone error
    const getPreviousPeriod = (periodYYAA: string): string => {
        if (!periodYYAA || periodYYAA.length !== 4) return periodYYAA;
        let year = 2000 + parseInt(periodYYAA.substring(0, 2));
        let month = parseInt(periodYYAA.substring(2, 4));

        month--;
        if (month === 0) {
            month = 12;
            year--;
        }
        return `${(year % 100).toString().padStart(2, '0')}${month.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchReportData = async () => {
            if (selectedBranch && selectedPeriod) {
                setLoading(true);
                setError(null);
                setDebugInfo('');
                
                try {
                    const url = `${API_BASE_URL}/nakit-yatirma-kontrol/${selectedBranch.Sube_ID}/${selectedPeriod}`;
                    console.log('🔍 Fetching report data from:', url);
                    setDebugInfo(`Fetching from: ${url}`);
                    
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Report data received:', data);
                        setReportData(data);
                        
                        // Add debug information
                        const bankCount = data?.bankaya_yatan?.length || 0;
                        const nakitCount = data?.nakit_girisi?.length || 0;
                        setDebugInfo(`Data loaded - Bankaya Yatan: ${bankCount} records, Nakit Girişi: ${nakitCount} records`);
                        
                        if (bankCount === 0 && nakitCount === 0) {
                            setError('Bu dönem için veri bulunamadı. Lütfen başka bir dönem seçin.');
                        }
                    } else {
                        const errorText = await response.text();
                        console.error('❌ Error response:', response.status, errorText);
                        setError(`Veri alınırken hata oluştu: ${response.status} - ${errorText}`);
                    }
                } catch (error) {
                    console.error('❌ Network error:', error);
                    setError(`Bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                }
                setLoading(false);
            }
        };

        fetchReportData();
    }, [selectedBranch, selectedPeriod]);

    const availablePeriods = useMemo(() => {
        const periods = new Set<string>();
        periods.add(currentPeriod);
        let tempPeriod = currentPeriod;
        for (let i = 0; i < 12; i++) { // Show last 12 months
            const prevPeriod = getPreviousPeriod(tempPeriod);
            periods.add(prevPeriod);
            tempPeriod = prevPeriod;
        }
        return Array.from(periods).sort((a,b) => b.localeCompare(a));
    }, [currentPeriod]);

    const bankayaYatanTotal = useMemo(() => {
        return reportData?.bankaya_yatan.reduce((sum, item) => sum + item.Tutar, 0) || 0;
    }, [reportData]);

    const nakitGirisiTotal = useMemo(() => {
        return reportData?.nakit_girisi.reduce((sum, item) => sum + item.Tutar, 0) || 0;
    }, [reportData]);

    const farkTutar = useMemo(() => {
        return bankayaYatanTotal - nakitGirisiTotal;
    }, [bankayaYatanTotal, nakitGirisiTotal]);

    return (
        <div className="space-y-6">
            <Card title={`Nakit Yatırma Kontrol Raporu (Şube: ${selectedBranch?.Sube_Adi})`} actions={
                <div className="flex items-center space-x-2">
                    <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="text-sm py-1"
                    >
                        {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
            }>
                {/* Debug Information */}
                {debugInfo && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        <strong>Debug:</strong> {debugInfo}
                    </div>
                )}
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <div className="ml-3 text-lg text-gray-600">Rapor yükleniyor...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <div className="text-red-600 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Hata</p>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <Button 
                            variant="primary" 
                            onClick={() => window.location.reload()}
                            className="mx-auto"
                        >
                            Tekrar Dene
                        </Button>
                    </div>
                ) : !reportData || (reportData.bankaya_yatan.length === 0 && reportData.nakit_girisi.length === 0) ? (
                    <div className="text-center py-10">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Veri Bulunamadı</p>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedPeriod} döneminde Şube: {selectedBranch?.Sube_Adi} için nakit yatırma verisi bulunamadı.
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                            Not: Rapor için hem Kategori_ID=60 olan Ödeme kayıtları hem de Nakit girişi kayıtları gereklidir.
                        </p>
                    </div>
                ) : reportData ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                <div className="bg-slate-800 text-white text-center py-3 font-semibold">
                                    Bankaya Yatan
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dönem</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reportData.bankaya_yatan.map((item, index) => {
                                                const isMatched = reportData.nakit_girisi.some(nakit => 
                                                    nakit.Tarih === item.Tarih && Math.abs(nakit.Tutar - item.Tutar) < 0.01
                                                );
                                                return (
                                                    <tr key={index} className={isMatched ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {new Date(item.Tarih).toLocaleDateString('tr-TR')}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-center text-blue-600 font-medium">
                                                            {item.Donem}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                                            {formatCurrency(item.Tutar)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                <div className="bg-slate-800 text-white text-center py-3 font-semibold">
                                    Nakit Girişi
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dönem</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reportData.nakit_girisi.map((item, index) => {
                                                const isMatched = reportData.bankaya_yatan.some(odeme => 
                                                    odeme.Tarih === item.Tarih && Math.abs(odeme.Tutar - item.Tutar) < 0.01
                                                );
                                                return (
                                                    <tr key={index} className={isMatched ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {new Date(item.Tarih).toLocaleDateString('tr-TR')}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-center text-blue-600 font-medium">
                                                            {item.Donem}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                                                            {formatCurrency(item.Tutar)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white p-6 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-center">Özet Bilgiler</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Bankaya Yatan Toplam</div>
                                    <div className="text-xl font-bold">{formatCurrency(bankayaYatanTotal)}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Nakit Girişi Toplam</div>
                                    <div className="text-xl font-bold">{formatCurrency(nakitGirisiTotal)}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Fark</div>
                                    <div className={`text-xl font-bold ${
                                        Math.abs(farkTutar) < 0.01 ? 'text-green-300' : 
                                        farkTutar > 0 ? 'text-orange-300' : 'text-red-300'
                                    }`}>
                                        {formatCurrency(farkTutar)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Card>
        </div>
    );
};
