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
                try {
                    const response = await fetch(`${API_BASE_URL}/nakit-yatirma-kontrol/${selectedBranch.Sube_ID}/${selectedPeriod}`);
                    if (response.ok) {
                        const data = await response.json();
                        setReportData(data);
                    } else {
                        console.error('Error fetching nakit yatirma raporu:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching nakit yatirma raporu:', error);
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
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-lg text-gray-600">Yükleniyor...</div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Bankaya Yatan Toplam</div>
                                    <div className="text-xl font-bold">{formatCurrency(bankayaYatanTotal)}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Nakit Girişi Toplam</div>
                                    <div className="text-xl font-bold">{formatCurrency(nakitGirisiTotal)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-600">Rapor verisi bulunamadı.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
