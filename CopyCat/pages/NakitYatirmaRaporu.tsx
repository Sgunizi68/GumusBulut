import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, useDataContext } from '../App';
import { API_BASE_URL } from '../constants';
import { Button, Card, Select, TableLayout } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';

interface ReportDataItem {
    Tarih: string;
    Donem: number;
    Tutar: number;
}

interface NakitYatirmaRaporuData {
    bankaya_yatan: ReportDataItem[];
    nakit_girisi: ReportDataItem[];
}

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true,
    }).format(value);
};

const formatCurrency = (value: number) => {
    return `₺${formatNumber(value)}`;
};

export const NakitYatirmaRaporuPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
    const [reportData, setReportData] = useState<NakitYatirmaRaporuData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const [error, setError] = useState<string | null>(null);
    
    // Permission checks for export functionality
    const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

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
                
                try {
                    const url = `${API_BASE_URL}/nakit-yatirma-kontrol/${selectedBranch.Sube_ID}/${selectedPeriod}`;
                    console.log('🔍 Fetching report data from:', url);
                    
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Report data received:', data);
                        setReportData(data);
                        
                        // Console log for development (debug info removed from UI)
                        const bankCount = data?.bankaya_yatan?.length || 0;
                        const nakitCount = data?.nakit_girisi?.length || 0;
                        console.log(`✅ Data loaded - Bankaya Yatan: ${bankCount} records, Nakit Girişi: ${nakitCount} records`);
                        
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
    
    // Export Functions
    const handleGeneratePdf = () => {
        generateDashboardPdf(
            'nakit-yatirma-raporu-content',
            `Nakit_Yatirma_Kontrol_Raporu_${selectedBranch?.Sube_Adi}_${selectedPeriod}.pdf`
        );
    };
    
    const handleExportToExcel = () => {
        if (!reportData || !selectedBranch) return;

        const wb = XLSX.utils.book_new();
        
        // Custom formatter for Turkish locale (dot as thousand separator, comma as decimal separator)
        const formatTurkishNumber = (value: number): string => {
            return value.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).replace(/\./g, '#').replace(/,/g, '.').replace(/#/g, ',');
        };
        
        // Helper function to check if a record is matched
        const isMatched = (index: number, type: 'bankaya' | 'nakit') => {
            return matchingResults.matched.some(match => match.index[type] === index);
        };
        
        // Sheet 1: Bankaya Yatan (Bank Deposits) - using sorted data
        const bankayaData = sortedBankayaYatan.map((item, index) => {
            // Find the original index for matching purposes
            const originalIndex = reportData?.bankaya_yatan.findIndex(
                (originalItem) => originalItem.Tarih === item.Tarih && 
                originalItem.Donem === item.Donem && 
                originalItem.Tutar === item.Tutar
            ) ?? index;
            
            return {
                'Sıra': index + 1,
                'Tarih': new Date(item.Tarih).toLocaleDateString('tr-TR'),
                'Dönem': item.Donem,
                'Tutar': formatTurkishNumber(item.Tutar),
                'Durum': isMatched(originalIndex, 'bankaya') ? 'Eşleşti' : 'Eşleşmedi'
            };
        });
        
        const wsBankaya = XLSX.utils.json_to_sheet(bankayaData);
        wsBankaya['!cols'] = [
            { wch: 8 },  // Sıra
            { wch: 15 }, // Tarih
            { wch: 10 }, // Dönem
            { wch: 15 }, // Tutar
            { wch: 12 }  // Durum
        ];
        XLSX.utils.book_append_sheet(wb, wsBankaya, 'Bankaya Yatan');
        
        // Sheet 2: Nakit Girişi (Cash Entries) - using sorted data
        const nakitData = sortedNakitGiris.map((item, index) => {
            // Find the original index for matching purposes
            const originalIndex = reportData?.nakit_girisi.findIndex(
                (originalItem) => originalItem.Tarih === item.Tarih && 
                originalItem.Donem === item.Donem && 
                originalItem.Tutar === item.Tutar
            ) ?? index;
            
            return {
                'Sıra': index + 1,
                'Tarih': new Date(item.Tarih).toLocaleDateString('tr-TR'),
                'Dönem': item.Donem,
                'Tutar': formatTurkishNumber(item.Tutar),
                'Durum': isMatched(originalIndex, 'nakit') ? 'Eşleşti' : 'Eşleşmedi'
            };
        });
        
        const wsNakit = XLSX.utils.json_to_sheet(nakitData);
        wsNakit['!cols'] = [
            { wch: 8 },  // Sıra
            { wch: 15 }, // Tarih
            { wch: 10 }, // Dönem
            { wch: 15 }, // Tutar
            { wch: 12 }  // Durum
        ];
        XLSX.utils.book_append_sheet(wb, wsNakit, 'Nakit Girişi');
        
        // Sheet 3: Özet Rapor (Summary Report) - unchanged except for formatting
        const ozet = [
            {
                'Kategori': 'Bankaya Yatan',
                'Toplam Tutar': formatTurkishNumber(bankayaYatanTotal),
                'Kayıt Sayısı': reportData.bankaya_yatan.length,
                'Eşleşen': matchingResults.matched.length,
                'Eşleşmeyen': matchingResults.unmatchedBankaya.length
            },
            {
                'Kategori': 'Nakit Girişi',
                'Toplam Tutar': formatTurkishNumber(nakitGirisiTotal),
                'Kayıt Sayısı': reportData.nakit_girisi.length,
                'Eşleşen': matchingResults.matched.length,
                'Eşleşmeyen': matchingResults.unmatchedNakit.length
            },
            {
                'Kategori': 'Fark',
                'Toplam Tutar': formatTurkishNumber(farkTutar),
                'Kayıt Sayısı': '',
                'Eşleşen': '',
                'Eşleşmeyen': ''
            }
        ];
        
        const wsOzet = XLSX.utils.json_to_sheet(ozet);
        wsOzet['!cols'] = [
            { wch: 20 }, // Kategori
            { wch: 15 }, // Toplam Tutar
            { wch: 12 }, // Kayıt Sayısı
            { wch: 10 }, // Eşleşen
            { wch: 12 }  // Eşleşmeyen
        ];
        XLSX.utils.book_append_sheet(wb, wsOzet, 'Özet Rapor');
        
        // Sheet 4: Eşleşme Analizi (Matching Analysis) - unchanged except for formatting
        const eslesmeler = matchingResults.matched.map((match, index) => ({
            'Sıra': index + 1,
            'Bankaya Yatan Tutar': formatTurkishNumber(match.bankaya.Tutar),
            'Nakit Girişi Tutar': formatTurkishNumber(match.nakit.Tutar),
            'Fark': formatTurkishNumber(Math.abs(match.bankaya.Tutar - match.nakit.Tutar)),
            'Bankaya Yatan Dönem': match.bankaya.Donem,
            'Nakit Girişi Dönem': match.nakit.Donem,
            'Durum': 'Eşleşti'
        }));
        
        const wsEslesmeler = XLSX.utils.json_to_sheet(eslesmeler);
        wsEslesmeler['!cols'] = [
            { wch: 8 },  // Sıra
            { wch: 18 }, // Bankaya Yatan Tutar
            { wch: 18 }, // Nakit Girişi Tutar
            { wch: 10 }, // Fark
            { wch: 18 }, // Bankaya Yatan Dönem
            { wch: 18 }, // Nakit Girişi Dönem
            { wch: 10 }  // Durum
        ];
        XLSX.utils.book_append_sheet(wb, wsEslesmeler, 'Eşleşme Analizi');
        
        // Save the file
        XLSX.writeFile(wb, `Nakit_Yatirma_Kontrol_Raporu_${selectedBranch.Sube_Adi}_${selectedPeriod}.xlsx`);
    };

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

    // Date sorting for Bankaya Yatan records (newest to oldest)
    const sortedBankayaYatan = useMemo(() => {
        if (!reportData?.bankaya_yatan) return [];
        return [...reportData.bankaya_yatan].sort((a, b) => 
            new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime()
        );
    }, [reportData?.bankaya_yatan]);

    // Date sorting for Nakit Giriş records (newest to oldest)
    const sortedNakitGiris = useMemo(() => {
        if (!reportData?.nakit_girisi) return [];
        return [...reportData.nakit_girisi].sort((a, b) => 
            new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime()
        );
    }, [reportData?.nakit_girisi]);

    // Enhanced matching logic with better tolerance and detailed matching info
    const matchingResults = useMemo(() => {
        if (!reportData) return { matched: [], unmatchedBankaya: [], unmatchedNakit: [] };
        
        const tolerance = 0.01; // 1 kuruş tolerance for floating point precision
        const matched: Array<{bankaya: ReportDataItem, nakit: ReportDataItem, index: {bankaya: number, nakit: number}}> = [];
        const unmatchedBankaya: Array<{item: ReportDataItem, index: number}> = [];
        const unmatchedNakit: Array<{item: ReportDataItem, index: number}> = [];
        
        // Create boolean arrays to track matched status for both sections
        const bankayaYatanMatched = new Array(reportData.bankaya_yatan.length).fill(false);
        const nakitGirisMatched = new Array(reportData.nakit_girisi.length).fill(false);
        
        // Find matches for Bankaya Yatan records
        reportData.bankaya_yatan.forEach((bankayaItem, bankayaIndex) => {
            // Skip if already matched
            if (bankayaYatanMatched[bankayaIndex]) return;
            
            // Find first unmatched Nakit Girişi record with same period and amount
            const matchingNakitIndex = reportData.nakit_girisi.findIndex((nakitItem, nakitIndex) => 
                !nakitGirisMatched[nakitIndex] &&
                bankayaItem.Donem === nakitItem.Donem &&
                Math.abs(bankayaItem.Tutar - nakitItem.Tutar) < tolerance
            );
            
            if (matchingNakitIndex !== -1) {
                // Mark both records as matched
                bankayaYatanMatched[bankayaIndex] = true;
                nakitGirisMatched[matchingNakitIndex] = true;
                
                // Add to matched results
                matched.push({
                    bankaya: bankayaItem,
                    nakit: reportData.nakit_girisi[matchingNakitIndex],
                    index: { bankaya: bankayaIndex, nakit: matchingNakitIndex }
                });
            } else {
                // No match found
                unmatchedBankaya.push({ item: bankayaItem, index: bankayaIndex });
            }
        });
        
        // Find unmatched Nakit Girişi records
        reportData.nakit_girisi.forEach((nakitItem, nakitIndex) => {
            if (!nakitGirisMatched[nakitIndex]) {
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
        <div className="space-y-6" id="nakit-yatirma-raporu-content">
            <Card title={`Nakit Yatırma Kontrol Raporu (Şube: ${selectedBranch?.Sube_Adi})`} actions={
                <div className="flex items-center space-x-2 hide-on-pdf">
                    {canPrint && (
                        <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                            <Icons.Print className="w-5 h-5" />
                        </Button>
                    )}
                    {canExportExcel && (
                        <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                            <Icons.Download className="w-5 h-5" />
                        </Button>
                    )}
                    <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="text-sm py-1"
                    >
                        {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
            }>
                {/* Debug Information removed from UI - now only in console logs */}
                
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
                                            {sortedBankayaYatan.map((item, index) => {
                                                // Find the original index for matching purposes
                                                const originalIndex = reportData?.bankaya_yatan.findIndex(
                                                    (originalItem) => originalItem.Tarih === item.Tarih && 
                                                    originalItem.Donem === item.Donem && 
                                                    originalItem.Tutar === item.Tutar
                                                ) ?? index;
                                                
                                                return (
                                                    <tr key={index} className={getRowStyling(originalIndex, 'bankaya')}>
                                                        <td className="px-4 py-3 text-sm text-center">
                                                            {getStatusIcon(originalIndex, 'bankaya')}
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
                                            {sortedNakitGiris.map((item, index) => {
                                                // Find the original index for matching purposes
                                                const originalIndex = reportData?.nakit_girisi.findIndex(
                                                    (originalItem) => originalItem.Tarih === item.Tarih && 
                                                    originalItem.Donem === item.Donem && 
                                                    originalItem.Tutar === item.Tutar
                                                ) ?? index;
                                                
                                                return (
                                                    <tr key={index} className={getRowStyling(originalIndex, 'nakit')}>
                                                        <td className="px-4 py-3 text-sm text-center">
                                                            {getStatusIcon(originalIndex, 'nakit')}
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
