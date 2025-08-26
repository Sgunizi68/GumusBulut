import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../App';
import { Card, Button, Select } from '../components';
import { Icons } from '../constants';
import { 
    OdemeRaporResponse, 
    OdemeRaporDonemGroup, 
    OdemeRaporKategoriGroup, 
    OdemeRaporDetail,
    Kategori 
} from '../types';

// API constants
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Currency formatting helper
const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'TRY'
    });
};

// Multi-select component for filters
interface MultiSelectProps {
    label: string;
    options: Array<{value: number | string, label: string}>;
    selectedValues: Array<number | string>;
    onChange: (values: Array<number | string>) => void;
    placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    selectedValues,
    onChange,
    placeholder = "Seçiniz..."
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (value: number | string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const handleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(opt => opt.value));
        }
    };

    const selectedLabels = options
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div 
                className="border border-gray-300 rounded-md p-2 cursor-pointer bg-white min-h-[38px] flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm text-gray-700 truncate">
                    {selectedValues.length === 0 
                        ? placeholder 
                        : selectedValues.length === options.length
                        ? "Tümü"
                        : `${selectedValues.length} seçili`
                    }
                </span>
                <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
                        >
                            {selectedValues.length === options.length ? "Hiçbirini Seçme" : "Tümünü Seç"}
                        </button>
                    </div>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                            onClick={() => handleToggle(option.value)}
                        >
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option.value)}
                                readOnly
                                className="mr-2"
                            />
                            <span className="text-sm">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Expandable row component for category groups
interface ExpandableKategoriRowProps {
    kategoriGroup: OdemeRaporKategoriGroup;
    donem: number;
    isExpanded: boolean;
    onToggle: () => void;
}

const ExpandableKategoriRow: React.FC<ExpandableKategoriRowProps> = ({
    kategoriGroup,
    donem,
    isExpanded,
    onToggle
}) => {
    return (
        <>
            {/* Category Header Row */}
            <tr className="bg-gray-50 border-l-4 border-blue-500">
                <td className="px-4 py-3">
                    <button
                        onClick={onToggle}
                        className="flex items-center text-left w-full"
                    >
                        {isExpanded ? (
                            <Icons.ChevronDown className="w-4 h-4 mr-2 text-blue-600" />
                        ) : (
                            <Icons.ChevronRight className="w-4 h-4 mr-2 text-blue-600" />
                        )}
                        <span className="font-medium text-gray-800">{kategoriGroup.kategori_adi}</span>
                    </button>
                </td>
                <td className="px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {kategoriGroup.record_count} kayıt
                    </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-blue-700">
                    {formatCurrency(kategoriGroup.kategori_total)}
                </td>
            </tr>

            {/* Detail Rows (shown when expanded) */}
            {isExpanded && kategoriGroup.details.map((detail, index) => (
                <tr key={detail.odeme_id} className="bg-white border-l-4 border-gray-200">
                    <td className="px-6 py-2 text-sm">
                        <div className="pl-6">
                            <div className="font-medium text-gray-700">{detail.tip}</div>
                            <div className="text-gray-500 text-xs">{detail.hesap_adi}</div>
                        </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                        <div className="text-gray-600">{new Date(detail.tarih).toLocaleDateString('tr-TR')}</div>
                        <div className="text-gray-400 text-xs">{detail.aciklama.substring(0, 30)}...</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700">
                        {formatCurrency(detail.tutar)}
                    </td>
                </tr>
            ))}
        </>
    );
};

// Main component
export const OdemeRaporPage: React.FC = () => {
    const { selectedBranch, currentPeriod } = useAppContext();
    
    // State
    const [reportData, setReportData] = useState<OdemeRaporResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const [selectedDonemler, setSelectedDonemler] = useState<number[]>([]);
    const [selectedKategoriler, setSelectedKategoriler] = useState<number[]>([]);
    const [availableKategoriler, setAvailableKategoriler] = useState<Kategori[]>([]);
    
    // Expanded state for groups
    const [expandedDonemler, setExpandedDonemler] = useState<Set<number>>(new Set());
    const [expandedKategoriler, setExpandedKategoriler] = useState<Set<string>>(new Set());

    // Generate available periods (last 12 months)
    const availableDonemler = useMemo(() => {
        const periods: number[] = [];
        const currentPeriodNum = parseInt(currentPeriod);
        
        for (let i = 0; i < 12; i++) {
            let year = Math.floor(currentPeriodNum / 100);
            let month = currentPeriodNum % 100;
            
            month -= i;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            
            const period = year * 100 + month;
            periods.push(period);
        }
        
        return periods.sort((a, b) => b - a);
    }, [currentPeriod]);

    // Fetch available categories
    useEffect(() => {
        const fetchKategoriler = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/kategoriler/`);
                if (response.ok) {
                    const data = await response.json();
                    // Filter only payment categories
                    const paymentKategoriler = data.filter((k: Kategori) => 
                        k.Aktif_Pasif && (k.Tip === 'Ödeme' || k.Tip === 'Gider')
                    );
                    setAvailableKategoriler(paymentKategoriler);
                }
            } catch (error) {
                console.error('Error fetching kategoriler:', error);
            }
        };

        fetchKategoriler();
    }, []);

    // Set default filters (current period)
    useEffect(() => {
        if (availableDonemler.length > 0 && selectedDonemler.length === 0) {
            setSelectedDonemler([availableDonemler[0]]); // Default to current period
        }
    }, [availableDonemler, selectedDonemler.length]);

    // Fetch report data
    const fetchReportData = async () => {
        if (!selectedBranch) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            
            // Add period filters
            selectedDonemler.forEach(donem => {
                params.append('donem', donem.toString());
            });
            
            // Add category filters
            selectedKategoriler.forEach(kategori => {
                params.append('kategori', kategori.toString());
            });
            
            // Add branch filter
            params.append('sube_id', selectedBranch.Sube_ID.toString());

            const url = `${API_BASE_URL}/odeme-rapor/?${params.toString()}`;
            console.log('Fetching Odeme report from:', url);

            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
                console.log('Odeme report data:', data);
            } else {
                const errorText = await response.text();
                setError(`Veri alınırken hata oluştu: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            setError(`Bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }

        setLoading(false);
    };

    // Toggle expanded state for periods
    const toggleDonem = (donem: number) => {
        const newExpanded = new Set(expandedDonemler);
        if (newExpanded.has(donem)) {
            newExpanded.delete(donem);
        } else {
            newExpanded.add(donem);
        }
        setExpandedDonemler(newExpanded);
    };

    // Toggle expanded state for categories
    const toggleKategori = (donem: number, kategoriId: number | null) => {
        const key = `${donem}-${kategoriId || 'uncategorized'}`;
        const newExpanded = new Set(expandedKategoriler);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedKategoriler(newExpanded);
    };

    // Filter options for multi-select
    const donemOptions = availableDonemler.map(donem => ({
        value: donem,
        label: donem.toString()
    }));

    const kategoriOptions = [
        { value: -1, label: 'Kategorilendirilmemiş' }, // Special option for uncategorized
        ...availableKategoriler.map(kategori => ({
            value: kategori.Kategori_ID,
            label: kategori.Kategori_Adi
        }))
    ];

    return (
        <div className="space-y-6">
            <Card 
                title={`Ödeme Rapor (Şube: ${selectedBranch?.Sube_Adi})`}
                actions={
                    <div className="flex items-center space-x-2">
                        <Button 
                            onClick={fetchReportData}
                            disabled={loading || selectedDonemler.length === 0}
                            variant="primary"
                        >
                            {loading ? 'Yükleniyor...' : 'Raporu Getir'}
                        </Button>
                    </div>
                }
            >
                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    <MultiSelect
                        label="Dönem"
                        options={donemOptions}
                        selectedValues={selectedDonemler}
                        onChange={(values) => setSelectedDonemler(values as number[])}
                        placeholder="Dönem seçiniz..."
                    />
                    
                    <MultiSelect
                        label="Kategori"
                        options={kategoriOptions}
                        selectedValues={selectedKategoriler}
                        onChange={(values) => setSelectedKategoriler(values as number[])}
                        placeholder="Kategori seçiniz..."
                    />

                    <div className="flex items-end">
                        <Button 
                            onClick={fetchReportData}
                            disabled={loading || selectedDonemler.length === 0}
                            className="w-full"
                        >
                            Filtrele
                        </Button>
                    </div>

                    <div className="flex items-end">
                        <Button 
                            onClick={() => {
                                setSelectedDonemler([availableDonemler[0]]);
                                setSelectedKategoriler([]);
                                setExpandedDonemler(new Set());
                                setExpandedKategoriler(new Set());
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Temizle
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <div className="ml-3 text-lg text-gray-600">Rapor yükleniyor...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-10">
                        <div className="text-red-600 mb-4">
                            <Icons.ExclamationTriangle className="mx-auto h-12 w-12 mb-2" />
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Hata</p>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <Button 
                            variant="primary" 
                            onClick={fetchReportData}
                            className="mx-auto"
                        >
                            Tekrar Dene
                        </Button>
                    </div>
                )}

                {/* Report Data */}
                {!loading && !error && reportData && (
                    <div className="space-y-6">
                        {/* Summary Section */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white p-6 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-center">Özet Bilgiler</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Toplam Kayıt</div>
                                    <div className="text-xl font-bold">{reportData.total_records}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Dönem Sayısı</div>
                                    <div className="text-xl font-bold">{reportData.data.length}</div>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                                    <div className="text-sm opacity-90 mb-1">Genel Toplam</div>
                                    <div className="text-xl font-bold">{formatCurrency(reportData.totals.grand_total)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Report Table */}
                        {reportData.data.length > 0 ? (
                            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kategori / Detay
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tarih / Kayıt
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tutar
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.data.map((donemGroup) => (
                                                <React.Fragment key={donemGroup.donem}>
                                                    {/* Period Header */}
                                                    <tr className="bg-blue-600 text-white">
                                                        <td className="px-4 py-4 font-bold">
                                                            <button
                                                                onClick={() => toggleDonem(donemGroup.donem)}
                                                                className="flex items-center w-full text-left"
                                                            >
                                                                {expandedDonemler.has(donemGroup.donem) ? (
                                                                    <Icons.ChevronDown className="w-5 h-5 mr-2" />
                                                                ) : (
                                                                    <Icons.ChevronRight className="w-5 h-5 mr-2" />
                                                                )}
                                                                Dönem: {donemGroup.donem}
                                                            </button>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                                                                {donemGroup.record_count} kayıt
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-bold">
                                                            {formatCurrency(donemGroup.donem_total)}
                                                        </td>
                                                    </tr>

                                                    {/* Category Groups (shown when period is expanded) */}
                                                    {expandedDonemler.has(donemGroup.donem) && 
                                                        donemGroup.kategoriler.map((kategoriGroup) => (
                                                            <ExpandableKategoriRow
                                                                key={`${donemGroup.donem}-${kategoriGroup.kategori_id || 'uncategorized'}`}
                                                                kategoriGroup={kategoriGroup}
                                                                donem={donemGroup.donem}
                                                                isExpanded={expandedKategoriler.has(`${donemGroup.donem}-${kategoriGroup.kategori_id || 'uncategorized'}`)}
                                                                onToggle={() => toggleKategori(donemGroup.donem, kategoriGroup.kategori_id)}
                                                            />
                                                        ))
                                                    }
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="text-gray-400 mb-4">
                                    <Icons.DocumentReport className="mx-auto h-12 w-12 mb-2" />
                                </div>
                                <p className="text-gray-600 font-medium mb-2">Veri Bulunamadı</p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Seçilen filtrelere uygun ödeme verisi bulunamadı.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};