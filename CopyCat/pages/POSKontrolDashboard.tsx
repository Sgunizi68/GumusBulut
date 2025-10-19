import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../App';
import { API_BASE_URL } from '../constants';
import { Button, Card, Select } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';

// Interfaces remain the same
interface POSKontrolDailyData {
    Tarih: string;
    Gelir_POS: number | string | null;
    POS_Hareketleri: number | string | null;
    POS_Kesinti: number | string | null;
    POS_Net: number | string | null;
    Odeme: number | string | null;
    Odeme_Kesinti: number | string | null;
    Odeme_Net: number | string | null;
    Kontrol_POS: string | null;
    Kontrol_Kesinti: string | null;
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

const formatDecimal = (value: number | string | null) => {
    if (value === null || value === undefined) return '-';
    let numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return '-';
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue);
};

export const POSKontrolDashboardPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
    const [reportData, setReportData] = useState<POSKontrolDashboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit] = useState<number>(31);
    const [loadData, setLoadData] = useState(false);

    const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

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

    const fetchReportData = useCallback(async (isPolling = false) => {
        if (loadData && selectedBranch && selectedPeriod) {
            if (!isPolling) setLoading(true);
            setError(null);
            const skip = (currentPage - 1) * limit;

            try {
                const url = `${API_BASE_URL}/pos-kontrol/${selectedBranch.Sube_ID}/${selectedPeriod}?skip=${skip}&limit=${limit}`;
                const response = await fetch(url);

                if (response.ok) {
                    const newData: POSKontrolDashboardResponse = await response.json();
                    setReportData(newData);
                    if (newData.data.length === 0 && currentPage === 1) {
                        setError('Bu dönem için veri bulunamadı. Lütfen başka bir dönem seçin.');
                    }
                } else {
                    const errorText = await response.text();
                    setError(`Veri alınırken hata oluştu: ${response.status} - ${errorText}`);
                    setReportData(null);
                }
            } catch (err) {
                setError(`Bağlantı hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
                setReportData(null);
            }
            if (!isPolling) setLoading(false);
        }
    }, [loadData, selectedBranch, selectedPeriod, currentPage, limit]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('Polling for new data...');
            fetchReportData(true);
        }, 30000);

        return () => clearInterval(intervalId);
    }, [fetchReportData]);

    useEffect(() => {
        setCurrentPage(1);
        setReportData(null);
    }, [selectedBranch, selectedPeriod]);
    
    const handleGeneratePdf = () => { generateDashboardPdf('pos-kontrol-dashboard-content', `POS_Kontrol_Dashboard_${selectedBranch?.Sube_Adi}_${selectedPeriod}.pdf`); };
    const handleExportToExcel = () => {
        if (!reportData || !selectedBranch) return;
        const wb = XLSX.utils.book_new();
        const mainData = reportData.data.map((item, index) => ({
            'Sıra': index + 1,
            'Tarih': new Date(item.Tarih).toLocaleDateString('tr-TR'),
            'Gelir POS': typeof item.Gelir_POS === 'string' ? parseFloat(item.Gelir_POS) : item.Gelir_POS,
            'POS Hareketleri': typeof item.POS_Hareketleri === 'string' ? parseFloat(item.POS_Hareketleri) : item.POS_Hareketleri,
            'POS Kesinti': typeof item.POS_Kesinti === 'string' ? parseFloat(item.POS_Kesinti) : item.POS_Kesinti,
            'POS Net': typeof item.POS_Net === 'string' ? parseFloat(item.POS_Net) : item.POS_Net,
            'Ödeme': typeof item.Odeme === 'string' ? parseFloat(item.Odeme) : item.Odeme,
            'Ödeme Kesinti': typeof item.Odeme_Kesinti === 'string' ? parseFloat(item.Odeme_Kesinti) : item.Odeme_Kesinti,
            'Ödeme Net': typeof item.Odeme_Net === 'string' ? parseFloat(item.Odeme_Net) : item.Odeme_Net,
            'Kontrol POS': item.Kontrol_POS || '-',
            'Kontrol Kesinti': item.Kontrol_Kesinti || '-'
        }));
        const wsMain = XLSX.utils.json_to_sheet(mainData);
        wsMain['!cols'] = [ { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 } ];
        XLSX.utils.book_append_sheet(wb, wsMain, 'POS Kontrol Verileri');
        const summary = [reportData.summary];
        const wsSummary = XLSX.utils.json_to_sheet(summary);
        wsSummary['!cols'] = [ { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 15 } ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');
        XLSX.writeFile(wb, `POS_Kontrol_Dashboard_${selectedBranch.Sube_Adi}_${selectedPeriod}.xlsx`);
    };

    const availablePeriods = useMemo(() => {
        const periods = new Set<string>();
        periods.add(currentPeriod);
        let tempPeriod = currentPeriod;
        for (let i = 0; i < 12; i++) {
            const prevPeriod = getPreviousPeriod(tempPeriod);
            periods.add(prevPeriod);
            tempPeriod = prevPeriod;
        }
        return Array.from(periods).sort((a,b) => b.localeCompare(a));
    }, [currentPeriod]);
    
    const calculateGrandTotals = useMemo(() => {
        if (!reportData || !reportData.data) return null;
        return reportData.data.reduce(
            (totals, item) => {
                const gelirPos = typeof item.Gelir_POS === 'string' ? parseFloat(item.Gelir_POS) : item.Gelir_POS;
                const posHareketleri = typeof item.POS_Hareketleri === 'string' ? parseFloat(item.POS_Hareketleri) : item.POS_Hareketleri;
                const posKesinti = typeof item.POS_Kesinti === 'string' ? parseFloat(item.POS_Kesinti) : item.POS_Kesinti;
                const posNet = typeof item.POS_Net === 'string' ? parseFloat(item.POS_Net) : item.POS_Net;
                const odeme = typeof item.Odeme === 'string' ? parseFloat(item.Odeme) : item.Odeme;
                const odemeKesinti = typeof item.Odeme_Kesinti === 'string' ? parseFloat(item.Odeme_Kesinti) : item.Odeme_Kesinti;
                const odemeNet = typeof item.Odeme_Net === 'string' ? parseFloat(item.Odeme_Net) : item.Odeme_Net;
                return {
                    Gelir_POS: totals.Gelir_POS + (gelirPos || 0),
                    POS_Hareketleri: totals.POS_Hareketleri + (posHareketleri || 0),
                    POS_Kesinti: totals.POS_Kesinti + (posKesinti || 0),
                    POS_Net: totals.POS_Net + (posNet || 0),
                    Odeme: totals.Odeme + (odeme || 0),
                    Odeme_Kesinti: totals.Odeme_Kesinti + (odemeKesinti || 0),
                    Odeme_Net: totals.Odeme_Net + (odemeNet || 0),
                };
            },
            { Gelir_POS: 0, POS_Hareketleri: 0, POS_Kesinti: 0, POS_Net: 0, Odeme: 0, Odeme_Kesinti: 0, Odeme_Net: 0 }
        );
    }, [reportData]);

    const getRowStyling = (kontrolStatus: string | null) => {
        if (kontrolStatus === 'OK') return 'bg-green-100 border-l-4 border-green-500';
        if (kontrolStatus === 'Not OK') return 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100';
        return 'bg-gray-50 border-l-4 border-gray-300';
    };

    const getStatusIcon = (kontrolStatus: string | null) => {
        if (kontrolStatus === 'OK') return <svg className="w-5 h-5 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
        if (kontrolStatus === 'Not OK') return <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
        return <svg className="w-5 h-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg>;
    };

    const isNextDisabled = !reportData || reportData.data.length < limit || (reportData.summary && currentPage * limit >= reportData.summary.total_records);

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPeriod(e.target.value);
        setLoadData(true);
    };

    return (
        <div className="space-y-6" id="pos-kontrol-dashboard-content">
            <Card title={`POS Kontrol Dashboard (Şube: ${selectedBranch?.Sube_Adi})`} actions={
                <div className="flex items-center space-x-2 hide-on-pdf">
                    {canPrint && <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button"><Icons.Print className="w-5 h-5" /></Button>}
                    {canExportExcel && <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar"><Icons.Download className="w-5 h-5" /></Button>}
                    <Select value={selectedPeriod} onChange={handlePeriodChange} className="text-sm py-1">
                        {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
            }>
                {!loadData ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Raporu görüntülemek için lütfen bir dönem seçin.</p>
                    </div>
                ) : loading && !reportData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="ml-3 text-lg text-gray-600">Rapor yükleniyor...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10"><p className="text-red-600">{error}</p></div>
                ) : !reportData || reportData.data.length === 0 ? (
                    <div className="text-center py-10"><p className="text-gray-600">Veri Bulunamadı</p></div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-slate-800 text-white text-center py-3 font-semibold">POS Kontrol Verileri</div>
                            <div className="overflow-x-auto">
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
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reportData.data.map((item, index) => (
                                            <tr key={index} className={getRowStyling(item.Kontrol_POS)}>
                                                <td className="px-4 py-3 text-sm text-center">{getStatusIcon(item.Kontrol_POS)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.Tarih).toLocaleDateString('tr-TR')}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">{formatDecimal(item.Gelir_POS)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-green-600">{formatDecimal(item.POS_Hareketleri)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">{formatDecimal(item.POS_Kesinti)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">{formatDecimal(item.POS_Net)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-yellow-600">{formatDecimal(item.Odeme)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-orange-600">{formatDecimal(item.Odeme_Kesinti)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{formatDecimal(item.Odeme_Net)}</td>
                                                <td className="px-4 py-3 text-sm text-center font-semibold">{getStatusIcon(item.Kontrol_POS)}</td>
                                                <td className="px-4 py-3 text-sm text-center font-semibold">{getStatusIcon(item.Kontrol_Kesinti)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                            <td className="px-4 py-3 text-sm text-center" colSpan={2}>Toplam</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.Gelir_POS) : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.POS_Hareketleri) : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.POS_Kesinti) : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.POS_Net) : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.Odeme) : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.Odeme_Kesinti) : '-'}</td>
                                            <td className="px-4 py-3 text-sm text-right">{calculateGrandTotals ? formatDecimal(calculateGrandTotals.Odeme_Net) : '-'}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 hide-on-pdf">
                            <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || loading} variant="secondary">Önceki Sayfa</Button>
                            <span className="text-sm text-gray-700">
                                Sayfa {currentPage} / {reportData.summary ? Math.ceil(reportData.summary.total_records / limit) : 1}
                            </span>
                            <Button onClick={() => setCurrentPage(p => p + 1)} disabled={isNextDisabled || loading} variant="secondary">Sonraki Sayfa</Button>
                        </div>

                        <div className="bg-white border rounded-lg shadow-sm p-4 mb-4">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Özet İstatistikler</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                                    <div className="text-blue-800 font-medium mb-1">Toplam Kayıt</div>
                                    <div className="text-2xl font-bold text-blue-700">{reportData?.summary?.total_records || 0}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                                    <div className="text-green-800 font-medium mb-1">Başarılı Eşleşmeler</div>
                                    <div className="text-2xl font-bold text-green-700">{reportData?.summary?.successful_matches || 0}</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                                    <div className="text-red-800 font-medium mb-1">Hatalı Eşleşmeler</div>
                                    <div className="text-2xl font-bold text-red-700">{reportData?.summary?.error_matches || 0}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                                    <div className="text-purple-800 font-medium mb-1">Başarı Oranı</div>
                                    <div className="text-2xl font-bold text-purple-700">{reportData?.summary?.success_rate || '0%'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};