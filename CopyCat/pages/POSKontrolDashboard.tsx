import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, useDataContext, API_BASE_URL } from '../App';
import { Button, Card, Select } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';

interface POSKontrolDailyData {
    Tarih: string;
    Gelir_POS: number | null;
    POS_Hareketleri: number | null;
    POS_Kesinti: number | null;
    POS_Net: number | null;
    Odeme: number | null;
    Odeme_Kesinti: number | null;
    Odeme_Net: number | null;
    Kontrol_POS: string | null;
    Kontrol_Kesinti: string | null;
    Kontrol_Net: string | null;
}

interface POSKontrolSummary {
    total_records: number;
    successful_matches: number;
    error_matches: number;
    success_rate: string;
}

interface POSKontrolDashboardResponse {
    data: POSKontrolDailyData[];
    summary: POSKontrolSummary;
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

const formatDecimal = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const POSKontrolDashboardPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
    const [reportData, setReportData] = useState<POSKontrolDashboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const [error, setError] = useState<string | null>(null);
    
    // Permission checks for export functionality
    const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

    // Function to get previous period
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
                    const url = `${API_BASE_URL}/pos-kontrol/${selectedBranch.Sube_ID}/${selectedPeriod}`;
                    console.log('🔍 Fetching POS kontrol dashboard data from:', url);
                    
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ POS kontrol dashboard data received:', data);
                        setReportData(data);
                        
                        if (data.data.length === 0) {
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
            'pos-kontrol-dashboard-content',
            `POS_Kontrol_Dashboard_${selectedBranch?.Sube_Adi}_${selectedPeriod}.pdf`
        );
    };
    
    const handleExportToExcel = () => {
        if (!reportData || !selectedBranch) return;

        const wb = XLSX.utils.book_new();
        
        // Custom formatter for Turkish locale
        const formatTurkishNumber = (value: number | null): string => {
            if (value === null) return '-';
            return value.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).replace(/\./g, '#').replace(/,/g, '.').replace(/#/g, ',');
        };
        
        // Main data sheet
        const mainData = reportData.data.map((item, index) => ({
            'Sıra': index + 1,
            'Tarih': new Date(item.Tarih).toLocaleDateString('tr-TR'),
            'Gelir POS': formatTurkishNumber(item.Gelir_POS),
            'POS Hareketleri': formatTurkishNumber(item.POS_Hareketleri),
            'POS Kesinti': formatTurkishNumber(item.POS_Kesinti),
            'POS Net': formatTurkishNumber(item.POS_Net),
            'Ödeme': formatTurkishNumber(item.Odeme),
            'Ödeme Kesinti': formatTurkishNumber(item.Odeme_Kesinti),
            'Ödeme Net': formatTurkishNumber(item.Odeme_Net),
            'Kontrol POS': item.Kontrol_POS || '-',
            'Kontrol Kesinti': item.Kontrol_Kesinti || '-',
            'Kontrol Net': item.Kontrol_Net || '-'
        }));
        
        const wsMain = XLSX.utils.json_to_sheet(mainData);
        wsMain['!cols'] = [
            { wch: 8 },   // Sıra
            { wch: 15 },  // Tarih
            { wch: 15 },  // Gelir POS
            { wch: 15 },  // POS Hareketleri
            { wch: 15 },  // POS Kesinti
            { wch: 15 },  // POS Net
            { wch: 15 },  // Ödeme
            { wch: 15 },  // Ödeme Kesinti
            { wch: 15 },  // Ödeme Net
            { wch: 12 },  // Kontrol POS
            { wch: 15 },  // Kontrol Kesinti
            { wch: 12 }   // Kontrol Net
        ];
        XLSX.utils.book_append_sheet(wb, wsMain, 'POS Kontrol Verileri');
        
        // Summary sheet
        const summary = [
            {
                'Toplam Kayıt': reportData.summary.total_records,
                'Başarılı Eşleşmeler': reportData.summary.successful_matches,
                'Hatalı Eşleşmeler': reportData.summary.error_matches,
                'Başarı Oranı': reportData.summary.success_rate
            }
        ];
        
        const wsSummary = XLSX.utils.json_to_sheet(summary);
        wsSummary['!cols'] = [
            { wch: 15 }, // Toplam Kayıt
            { wch: 20 }, // Başarılı Eşleşmeler
            { wch: 18 }, // Hatalı Eşleşmeler
            { wch: 15 }  // Başarı Oranı
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');
        
        // Save the file
        XLSX.writeFile(wb, `POS_Kontrol_Dashboard_${selectedBranch.Sube_Adi}_${selectedPeriod}.xlsx`);
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

    // Helper function to get row styling based on matching status
    const getRowStyling = (kontrolStatus: string | null) => {
        if (kontrolStatus === 'OK') {
            return 'bg-green-100 border-l-4 border-green-500';
        } else if (kontrolStatus === 'Not OK') {
            return 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100';
        } else {
            return 'bg-gray-50 border-l-4 border-gray-300';
        }
    };

    // Get status icon for matched/unmatched records
    const getStatusIcon = (kontrolStatus: string | null) => {
        if (kontrolStatus === 'OK') {
            return (
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else if (kontrolStatus === 'Not OK') {
            return (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    return (
        <div className="space-y-6" id="pos-kontrol-dashboard-content">
            <Card title={`POS Kontrol Dashboard (Şube: ${selectedBranch?.Sube_Adi})`} actions={
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
                ) : !reportData || reportData.data.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Veri Bulunamadı</p>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedPeriod} döneminde Şube: {selectedBranch?.Sube_Adi} için POS kontrol verisi bulunamadı.
                        </p>
                    </div>
                ) : reportData ? (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-slate-800 text-white text-center py-3 font-semibold">
                                POS Kontrol Verileri
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gelir POS</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">POS Hareketleri</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">POS Kesinti</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">POS Net</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Kesinti</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Net</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kontrol POS</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kontrol Kesinti</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kontrol Net</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.data.map((item, index) => (
                                            <tr key={index} className={getRowStyling(item.Kontrol_POS)}>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    {getStatusIcon(item.Kontrol_POS)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {new Date(item.Tarih).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                                                    {formatDecimal(item.Gelir_POS)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                                                    {formatDecimal(item.POS_Hareketleri)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">
                                                    {formatDecimal(item.POS_Kesinti)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                                    {formatDecimal(item.POS_Net)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-yellow-600">
                                                    {formatDecimal(item.Odeme)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-orange-600">
                                                    {formatDecimal(item.Odeme_Kesinti)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                                    {formatDecimal(item.Odeme_Net)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center font-semibold">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        item.Kontrol_POS === 'OK' ? 'bg-green-100 text-green-800' :
                                                        item.Kontrol_POS === 'Not OK' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {item.Kontrol_POS || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center font-semibold">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        item.Kontrol_Kesinti === 'OK' ? 'bg-green-100 text-green-800' :
                                                        item.Kontrol_Kesinti === 'Not OK' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {item.Kontrol_Kesinti || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center font-semibold">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        item.Kontrol_Net === 'OK' ? 'bg-green-100 text-green-800' :
                                                        item.Kontrol_Net === 'Not OK' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {item.Kontrol_Net || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Summary Statistics */}
                        <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Özet İstatistikler</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                                    <div className="text-blue-800 font-medium mb-1">Toplam Kayıt</div>
                                    <div className="text-2xl font-bold text-blue-700">{reportData.summary.total_records}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                                    <div className="text-green-800 font-medium mb-1">Başarılı Eşleşmeler</div>
                                    <div className="text-2xl font-bold text-green-700">{reportData.summary.successful_matches}</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                                    <div className="text-red-800 font-medium mb-1">Hatalı Eşleşmeler</div>
                                    <div className="text-2xl font-bold text-red-700">{reportData.summary.error_matches}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                                    <div className="text-purple-800 font-medium mb-1">Başarı Oranı</div>
                                    <div className="text-2xl font-bold text-purple-700">{reportData.summary.success_rate}</div>
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
                                    <span className="text-gray-600">Veriler eşleşiyor (OK)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-50 border-l-4 border-red-400 mr-2 rounded"></div>
                                    <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-600">Veriler eşleşmiyor (Not OK)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-gray-50 border-l-4 border-gray-300 mr-2 rounded"></div>
                                    <svg className="w-3 h-3 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-600">Veri yok (-)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Card>
        </div>
    );
};