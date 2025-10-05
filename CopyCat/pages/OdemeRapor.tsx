import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../App';
import { API_BASE_URL } from '../constants';
import { Card, Button, Select } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import { 
    OdemeRaporResponse, 
    OdemeRaporDonemGroup, 
    OdemeRaporKategoriGroup, 
    OdemeRaporBankaHesabiGroup,
    OdemeRaporDetail,
    Kategori 
} from '../types';
import { sortPaymentKategoriler, createKategoriMultiSelectOptions } from '../utils/categoryUtils';
import { formatNumber } from '../utils/formatNumber';
import ExpandableBankaHesabiRow from '../components/ExpandableBankaHesabiRow';

// API constants

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
    expandedBankaHesaplari: Set<string>;
    onBankaHesabiToggle: (bankaHesabiKey: string) => void;
}

const ExpandableKategoriRow: React.FC<ExpandableKategoriRowProps> = ({
    kategoriGroup,
    donem,
    isExpanded,
    onToggle,
    expandedBankaHesaplari,
    onBankaHesabiToggle
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
                    {formatNumber(kategoriGroup.kategori_total)}
                </td>
            </tr>

            {/* Bank Account Groups (shown when category is expanded) */}
            {isExpanded && kategoriGroup.banka_hesaplari.map((bankaHesabiGroup) => {
                const bankaHesabiKey = `${donem}-${kategoriGroup.kategori_id || 'uncategorized'}-${bankaHesabiGroup.hesap_adi}`;
                return (
                    <ExpandableBankaHesabiRow
                        key={bankaHesabiKey}
                        bankaHesabiGroup={bankaHesabiGroup}
                        donem={donem}
                        kategoriId={kategoriGroup.kategori_id}
                        isExpanded={expandedBankaHesaplari.has(bankaHesabiKey)}
                        onToggle={() => onBankaHesabiToggle(bankaHesabiKey)}
                    />
                );
            })}
        </>
    );
};

// Main component
export const OdemeRaporPage: React.FC = () => {
    const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
    
    // Permission checks for export functionality
    const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);
    
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
    const [expandedBankaHesaplari, setExpandedBankaHesaplari] = useState<Set<string>>(new Set());

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
                    // Filter and sort payment categories using utility function
                    const sortedPaymentKategoriler = sortPaymentKategoriler(data);
                    setAvailableKategoriler(sortedPaymentKategoriler);
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
        
        // Also collapse all bank accounts under this category
        const bankaHesabiKeysToRemove: string[] = [];
        expandedBankaHesaplari.forEach((bankaHesabiKey) => {
            if (bankaHesabiKey.startsWith(`${donem}-${kategoriId || 'uncategorized'}-`)) {
                bankaHesabiKeysToRemove.push(bankaHesabiKey);
            }
        });
        
        if (bankaHesabiKeysToRemove.length > 0) {
            const updatedBankaHesaplari = new Set(expandedBankaHesaplari);
            bankaHesabiKeysToRemove.forEach(key => updatedBankaHesaplari.delete(key));
            setExpandedBankaHesaplari(updatedBankaHesaplari);
        }
    };

    // Toggle expanded state for bank accounts
    const toggleBankaHesabi = (bankaHesabiKey: string) => {
        const newExpanded = new Set(expandedBankaHesaplari);
        if (newExpanded.has(bankaHesabiKey)) {
            newExpanded.delete(bankaHesabiKey);
        } else {
            newExpanded.add(bankaHesabiKey);
        }
        setExpandedBankaHesaplari(newExpanded);
    };

    // Filter options for multi-select
    const donemOptions = availableDonemler.map(donem => ({
        value: donem,
        label: donem.toString()
    }));

    const kategoriOptions = useMemo(() => {
        return createKategoriMultiSelectOptions(availableKategoriler, true);
    }, [availableKategoriler]);

    // Export Functions
    const handleGeneratePdf = () => {
        generateDashboardPdf(
            'odeme-rapor-content',
            `Odeme_Rapor_${selectedBranch?.Sube_Adi}_${selectedDonemler.join('_')}.pdf`
        );
    };
    
    const handleExportToExcel = () => {
        if (!reportData || !selectedBranch) return;

        const wb = XLSX.utils.book_new();
        
        // Sheet 1: Summary Data
        const summaryData = [
            {
                'Kategori': 'Genel Bilgiler',
                'Değer': '',
                'Açıklama': ''
            },
            {
                'Kategori': 'Şube',
                'Değer': selectedBranch.Sube_Adi,
                'Açıklama': 'Rapor şubesi'
            },
            {
                'Kategori': 'Dönemler',
                'Değer': selectedDonemler.join(', '),
                'Açıklama': 'Seçilen dönemler'
            },
            {
                'Kategori': 'Toplam Kayıt',
                'Değer': typeof reportData.total_records === 'number' ? reportData.total_records : parseFloat(reportData.total_records) || 0,
                'Açıklama': 'Toplam ödeme kayıt sayısı'
            },
            {
                'Kategori': 'Dönem Sayısı',
                'Değer': typeof reportData.data.length === 'number' ? reportData.data.length : parseFloat(reportData.data.length) || 0,
                'Açıklama': 'Rapordaki dönem sayısı'
            },
            {
                'Kategori': 'Genel Toplam',
                'Değer': typeof reportData.totals.grand_total === 'number' ? reportData.totals.grand_total : parseFloat(reportData.totals.grand_total) || 0,
                'Açıklama': 'Tüm ödemelerin toplam tutarı'
            }
        ];
        
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        wsSummary['!cols'] = [
            { wch: 20 }, // Kategori
            { wch: 20 }, // Değer
            { wch: 30 }  // Açıklama
        ];
        
        // Ensure numeric values in summary sheet are exported as numbers
        const summaryRange = XLSX.utils.decode_range(wsSummary['!ref'] || 'A1');
        for (let row = summaryRange.s.r + 1; row <= summaryRange.e.r; ++row) {
            // "Değer" column is column B (index 1)
            const degerCell = wsSummary[XLSX.utils.encode_cell({ r: row, c: 1 })];
            if (degerCell && degerCell.v !== undefined) {
                // Skip non-numeric values like branch name and periods string
                if (row >= 4) { // Only process numeric rows (Toplam Kayıt, Dönem Sayısı, Genel Toplam)
                    const numericValue = typeof degerCell.v === 'number' ? degerCell.v : parseFloat(degerCell.v);
                    if (!isNaN(numericValue)) {
                        degerCell.t = 'n'; // Set cell type to number
                        degerCell.v = numericValue;
                    }
                }
            }
        };
        
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');
        
        // Sheet 2: Detailed Data by Period
        const detailedData: any[] = [];
        let rowIndex = 1;
        
        reportData.data.forEach((donemGroup) => {
            // Period header
            detailedData.push({
                'Sıra': rowIndex++,
                'Dönem': donemGroup.donem,
                'Kategori': 'DÖNEM TOPLAMI',
                'Kategori Adı': '',
                'Banka Hesabı': '',
                'Tip': '',
                'Tarih': '',
                'Açıklama': '',
                'Tutar': typeof donemGroup.donem_total === 'number' ? donemGroup.donem_total : parseFloat(donemGroup.donem_total) || 0,
                'Kayıt Sayısı': donemGroup.record_count
            });
            
            donemGroup.kategoriler.forEach((kategoriGroup) => {
                // Category header
                detailedData.push({
                    'Sıra': rowIndex++,
                    'Dönem': donemGroup.donem,
                    'Kategori': 'KATEGORİ TOPLAMI',
                    'Kategori Adı': kategoriGroup.kategori_adi,
                    'Banka Hesabı': '',
                    'Tip': '',
                    'Tarih': '',
                    'Açıklama': '',
                    'Tutar': typeof kategoriGroup.kategori_total === 'number' ? kategoriGroup.kategori_total : parseFloat(kategoriGroup.kategori_total) || 0,
                    'Kayıt Sayısı': kategoriGroup.record_count
                });
                
                kategoriGroup.banka_hesaplari.forEach((bankaHesabiGroup) => {
                    // Bank account header
                    detailedData.push({
                        'Sıra': rowIndex++,
                        'Dönem': donemGroup.donem,
                        'Kategori': 'BANKA HESABI TOPLAMI',
                        'Kategori Adı': kategoriGroup.kategori_adi,
                        'Banka Hesabı': bankaHesabiGroup.hesap_adi,
                        'Tip': '',
                        'Tarih': '',
                        'Açıklama': '',
                        'Tutar': typeof bankaHesabiGroup.hesap_total === 'number' ? bankaHesabiGroup.hesap_total : parseFloat(bankaHesabiGroup.hesap_total) || 0,
                        'Kayıt Sayısı': bankaHesabiGroup.record_count
                    });
                    
                    // Detail records
                    bankaHesabiGroup.details.forEach((detail) => {
                        detailedData.push({
                            'Sıra': rowIndex++,
                            'Dönem': donemGroup.donem,
                            'Kategori': 'DETAY',
                            'Kategori Adı': kategoriGroup.kategori_adi,
                            'Banka Hesabı': bankaHesabiGroup.hesap_adi,
                            'Tip': detail.tip,
                            'Tarih': new Date(detail.tarih).toLocaleDateString('tr-TR'),
                            'Açıklama': detail.aciklama,
                            'Tutar': typeof detail.tutar === 'number' ? detail.tutar : parseFloat(detail.tutar) || 0,
                            'Kayıt Sayısı': 1
                        });
                    });
                });
            });
        });
        
        const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
        wsDetailed['!cols'] = [
            { wch: 8 },  // Sıra
            { wch: 10 }, // Dönem
            { wch: 15 }, // Kategori
            { wch: 25 }, // Kategori Adı
            { wch: 20 }, // Banka Hesabı
            { wch: 15 }, // Tip
            { wch: 12 }, // Tarih
            { wch: 30 }, // Açıklama
            { wch: 15 }, // Tutar
            { wch: 12 }  // Kayıt Sayısı
        ];
        
        // Ensure numeric values are exported as numbers, not text
        const range = XLSX.utils.decode_range(wsDetailed['!ref'] || 'A1');
        for (let row = range.s.r + 1; row <= range.e.r; ++row) {
            // Tutar column is column I (index 8)
            const tutarCell = wsDetailed[XLSX.utils.encode_cell({ r: row, c: 8 })];
            if (tutarCell && tutarCell.v !== undefined) {
                const numericValue = typeof tutarCell.v === 'number' ? tutarCell.v : parseFloat(tutarCell.v);
                if (!isNaN(numericValue)) {
                    tutarCell.t = 'n'; // Set cell type to number
                    tutarCell.v = numericValue;
                }
            }
            
            // Also ensure Kayıt Sayısı values are properly typed as numbers
            const kayitSayisiCell = wsDetailed[XLSX.utils.encode_cell({ r: row, c: 9 })]; // Kayıt Sayısı column
            if (kayitSayisiCell && kayitSayisiCell.v !== undefined) {
                const numericValue = typeof kayitSayisiCell.v === 'number' ? kayitSayisiCell.v : parseFloat(kayitSayisiCell.v);
                if (!isNaN(numericValue)) {
                    kayitSayisiCell.t = 'n';
                    kayitSayisiCell.v = numericValue;
                }
            }
        }
        
        XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detaylı Rapor');
        
        // Save the file
        const fileName = `Odeme_Rapor_${selectedBranch.Sube_Adi}_${selectedDonemler.join('_')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="space-y-6" id="odeme-rapor-content">
            <Card 
                title={`Ödeme Rapor (Şube: ${selectedBranch?.Sube_Adi})`}
                actions={
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
                                setExpandedBankaHesaplari(new Set());
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
                                    <div className="text-xl font-bold">{formatNumber(reportData.totals.grand_total)}</div>
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
                                                    Kategori / Banka Hesabı / Detay
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kayıt Sayısı
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
                                                            {formatNumber(donemGroup.donem_total)}
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
                                                                expandedBankaHesaplari={expandedBankaHesaplari}
                                                                onBankaHesabiToggle={toggleBankaHesabi}
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