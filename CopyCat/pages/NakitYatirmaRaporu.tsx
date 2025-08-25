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

    // Enhanced matching logic with better tolerance and detailed matching info
    const matchingResults = useMemo(() => {
        if (!reportData) return { matched: [], unmatchedBankaya: [], unmatchedNakit: [] };
        
        const tolerance = 0.01; // 1 kuruş tolerance for floating point precision
        const matched: Array<{bankaya: ReportDataItem, nakit: ReportDataItem, index: {bankaya: number, nakit: number}}> = [];
        const unmatchedBankaya: Array<{item: ReportDataItem, index: number}> = [];
        const unmatchedNakit: Array<{item: ReportDataItem, index: number}> = [];
        
        const usedNakitIndices = new Set<number>();
        
        // Find matches for Bankaya Yatan records
        reportData.bankaya_yatan.forEach((bankayaItem, bankayaIndex) => {
            let matchFound = false;
            
            reportData.nakit_girisi.forEach((nakitItem, nakitIndex) => {
                if (usedNakitIndices.has(nakitIndex)) return;
                
                // Match criteria: same period and amount within tolerance (ignoring date)
                const samePeriod = bankayaItem.Donem === nakitItem.Donem;
                const sameAmount = Math.abs(bankayaItem.Tutar - nakitItem.Tutar) < tolerance;
                
                if (samePeriod && sameAmount) {
                    matched.push({
                        bankaya: bankayaItem,
                        nakit: nakitItem,
                        index: { bankaya: bankayaIndex, nakit: nakitIndex }
                    });
                    usedNakitIndices.add(nakitIndex);
                    matchFound = true;
                    return;
                }
            });
            
            if (!matchFound) {
                unmatchedBankaya.push({ item: bankayaItem, index: bankayaIndex });
            }
        });
        
        // Find unmatched Nakit Girişi records
        reportData.nakit_girisi.forEach((nakitItem, nakitIndex) => {
            if (!usedNakitIndices.has(nakitIndex)) {
                unmatchedNakit.push({ item: nakitItem, index: nakitIndex });
            }
        });
        
        return { matched, unmatchedBankaya, unmatchedNakit };
    }, [reportData]);

    // Helper function to get row styling based on matching status
    const getRowStyling = (index: number, type: 'bankaya' | 'nakit') => {
        const isMatched = matchingResults.matched.some(match => 
            match.index[type] === index
        );
        
        if (isMatched) {
            return 'bg-green-100 border-l-4 border-green-500';
        } else {
            return 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100';
        }
    };

    // Get status icon for matched/unmatched records
    const getStatusIcon = (index: number, type: 'bankaya' | 'nakit') => {
        const isMatched = matchingResults.matched.some(match => 
            match.index[type] === index
        );
        
        if (isMatched) {
            return (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            );
        }
    };

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
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dönem</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reportData.bankaya_yatan.map((item, index) => {
                                                return (
                                                    <tr key={index} className={getRowStyling(index, 'bankaya')}>
                                                        <td className="px-4 py-3 text-sm text-center">
                                                            {getStatusIcon(index, 'bankaya')}
                                                        </td>
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
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dönem</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reportData.nakit_girisi.map((item, index) => {
                                                return (
                                                    <tr key={index} className={getRowStyling(index, 'nakit')}>
                                                        <td className="px-4 py-3 text-sm text-center">
                                                            {getStatusIcon(index, 'nakit')}
                                                        </td>
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
                        
                        {/* Matching Statistics */}
                        <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Eşleşme Durumu</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-800 font-medium">Eşleşen</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-700">{matchingResults.matched.length}</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <svg className="w-4 h-4 text-red-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-red-800 font-medium">Bankaya Eşleşmeyen</span>
                                    </div>
                                    <div className="text-2xl font-bold text-red-700">{matchingResults.unmatchedBankaya.length}</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <svg className="w-4 h-4 text-red-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-red-800 font-medium">Nakit Eşleşmeyen</span>
                                    </div>
                                    <div className="text-2xl font-bold text-red-700">{matchingResults.unmatchedNakit.length}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <span className="text-blue-800 font-medium">Eşleşme Oranı</span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        {reportData && (reportData.bankaya_yatan.length + reportData.nakit_girisi.length) > 0 
                                            ? Math.round((matchingResults.matched.length * 2) / (reportData.bankaya_yatan.length + reportData.nakit_girisi.length) * 100)
                                            : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold mb-2 text-gray-700">Açıklama</h4>
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-100 border-l-4 border-green-500 mr-2 rounded"></div>
                                    <svg className="w-3 h-3 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-600">Eşleşen kayıtlar (aynı dönem ve tutar)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-50 border-l-4 border-red-400 mr-2 rounded"></div>
                                    <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-600">Eşleşmeyen kayıtlar</span>
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
