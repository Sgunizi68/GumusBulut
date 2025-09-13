import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../styles/YemekCekiKontrolDashboard.css';
import { useAppContext, useDataContext } from '../App';
import { Button } from '../components'; // Import Button component
import { Icons, EXCELE_AKTAR_YETKISI_ADI } from '../constants'; // Import Icons and permission names

// Helper function to parse YYYY-MM-DD or DD.MM.YYYY string to Date object safely
const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    let date;
    // Check for YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        date = new Date(dateString);
    } 
    // Check for DD.MM.YYYY format
    else if (/^\d{2}\.\d{2}\.\d{4}/.test(dateString)) {
        const parts = dateString.split('.');
        // new Date(year, monthIndex, day)
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
        // Try default parsing as a fallback
        date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
        console.warn(`Invalid or unhandled date format encountered: ${dateString}`);
        return null;
    }
    return date;
};

// Helper function to get the start and end dates of a given period (e.g., '2508')
const getPeriodDates = (period: string): { startDate: Date, endDate: Date } => {
    const year = 2000 + parseInt(period.substring(0, 2));
    const month = parseInt(period.substring(2, 4));
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    return { startDate, endDate };
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const getPeriodFromDateString = (dateString: string | null | undefined): string => {
    const date = parseDate(dateString);
    if (!date) return '';
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
}

const formatPeriodForDisplay = (period: string): string => {
    if (period.length !== 4) return period;
    const year = `20${period.substring(0, 2)}`;
    const month = period.substring(2, 4);
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const monthName = monthNames[parseInt(month) - 1];
    return `${period} - ${monthName} ${year}`;
}

const getMimeType = (filename: string | undefined | null): string => {
    if (!filename) return 'application/octet-stream';
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'svg':
            return 'image/svg+xml';
        case 'pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
}

export const YemekCekiKontrolDashboardPage: React.FC = () => {
    const { selectedBranch, hasPermission } = useAppContext();
    const { ustKategoriList, kategoriList, yemekCekiList, gelirList, eFaturaList, eFaturaReferansList, odemeList } = useDataContext();

    const [period, setPeriod] = useState('');
    const [periodName, setPeriodName] = useState('');

    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

    const availablePeriods = useMemo(() => {
        const periods = new Set<string>();
        gelirList.forEach(g => periods.add(getPeriodFromDateString(g.Tarih)));
        yemekCekiList.forEach(c => {
            periods.add(getPeriodFromDateString(c.Ilk_Tarih));
            periods.add(getPeriodFromDateString(c.Son_Tarih));
        });
        return Array.from(periods).filter(p => p.length === 4).sort((a, b) => b.localeCompare(a));
    }, [gelirList, yemekCekiList]);

    useEffect(() => {
        if (availablePeriods.length > 0 && !period) {
            setPeriod(availablePeriods[0]);
        }
    }, [availablePeriods, period]);

    useEffect(() => {
        if (period) {
            setPeriodName(formatPeriodForDisplay(period));
        }
    }, [period]);

    const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriod(event.target.value);
    };

    const processedData = useMemo(() => {
        if (!selectedBranch || !yemekCekiList || !kategoriList || !gelirList || !ustKategoriList || !eFaturaList || !eFaturaReferansList || !odemeList || !period) {
            return { groups: [], kontrolEdilenKayitSayisi: 0, totalAylikGelir: 0, totalDonemTutar: 0, totalFark: 0 };
        }

        const { startDate: periodStart, endDate: periodEnd } = getPeriodDates(period);

        const yemekCekiUstKategori = ustKategoriList.find(uk => uk.UstKategori_Adi.trim().toLowerCase() === 'yemek çeki');
        if (!yemekCekiUstKategori) {
            return { groups: [], kontrolEdilenKayitSayisi: 0, totalAylikGelir: 0, totalDonemTutar: 0, totalFark: 0 };
        }
        const allYemekCekiKategoriIDs = kategoriList
            .filter(k => k.Ust_Kategori_ID === yemekCekiUstKategori.UstKategori_ID && k.Aktif_Pasif)
            .map(k => k.Kategori_ID);

        const ilgiliCekler = yemekCekiList.filter(cek => {
            const ilkTarih = parseDate(cek.Ilk_Tarih);
            const sonTarih = parseDate(cek.Son_Tarih);
            if (!ilkTarih || !sonTarih) return false;

            return (
                cek.Sube_ID === selectedBranch.Sube_ID &&
                allYemekCekiKategoriIDs.includes(cek.Kategori_ID) &&
                ilkTarih <= periodEnd &&
                sonTarih >= periodStart
            );
        });

        const kontrolEdilenKayitSayisi = ilgiliCekler.length;

        let totalAylikGelir = 0;
        let totalDonemTutar = 0;

        const groups = kategoriList
            .filter(k => allYemekCekiKategoriIDs.includes(k.Kategori_ID))
            .map(kategori => {
                const grupAylikGelir = gelirList
                    .filter(g => 
                        g.Sube_ID === selectedBranch.Sube_ID &&
                        g.Kategori_ID === kategori.Kategori_ID &&
                        getPeriodFromDateString(g.Tarih) === period
                    )
                    .reduce((sum, g) => sum + g.Tutar, 0);

                let grupDonemTutar = 0;

                const aliciUnvanlariForKategori = eFaturaReferansList
                    .filter(r => r.Referans_Kodu && r.Referans_Kodu.trim().toLowerCase() === kategori.Kategori_Adi.trim().toLowerCase())
                    .map(r => r.Alici_Unvani);

                const cekler = ilgiliCekler
                    .filter(cek => cek.Kategori_ID === kategori.Kategori_ID)
                    .map(cek => {
                        const cekIlk_Tarih = parseDate(cek.Ilk_Tarih)!;
                        const cekSon_Tarih = parseDate(cek.Son_Tarih)!;

                        const oncekiDonemTutar = gelirList
                            .filter(g => {
                                const gelirTarihi = parseDate(g.Tarih);
                                return gelirTarihi &&
                                       g.Kategori_ID === cek.Kategori_ID &&
                                       gelirTarihi < periodStart &&
                                       gelirTarihi >= cekIlk_Tarih;
                            })
                            .reduce((sum, g) => sum + g.Tutar, 0);

                        const sonrakiDonemTutar = gelirList
                            .filter(g => {
                                const gelirTarihi = parseDate(g.Tarih);
                                return gelirTarihi &&
                                       g.Kategori_ID === cek.Kategori_ID &&
                                       gelirTarihi > periodEnd &&
                                       gelirTarihi <= cekSon_Tarih;
                            })
                            .reduce((sum, g) => sum + g.Tutar, 0);

                        const donemTutar = cek.Tutar - oncekiDonemTutar - sonrakiDonemTutar;
                        
                        const isKesildi = eFaturaList.some(f => {
                            const faturaTarihi = parseDate(f.Fatura_Tarihi);
                            const cekSonTarih = parseDate(cek.Son_Tarih);
                            return (
                                f.Giden_Fatura &&
                                Math.abs(f.Tutar - cek.Tutar) < 0.01 &&
                                faturaTarihi && cekSonTarih && faturaTarihi.getTime() === cekSonTarih.getTime() &&
                                aliciUnvanlariForKategori.includes(f.Alici_Unvani)
                            );
                        });

                        let odemeTutari = 0;
                        const odemeTarihi = parseDate(cek.Odeme_Tarih);
                        if (odemeTarihi && odemeTarihi <= new Date()) {
                            const odemeKategoriAdi = `${kategori.Kategori_Adi} Ödemesi`;
                            const odemeKategori = kategoriList.find(k => k.Kategori_Adi.trim().toLowerCase() === odemeKategoriAdi.trim().toLowerCase());
                            if (odemeKategori) {
                                const ilgiliOdeme = odemeList.find(o => 
                                    o.Kategori_ID === odemeKategori.Kategori_ID && 
                                    parseDate(o.Tarih)?.getTime() === odemeTarihi.getTime()
                                );
                                if (ilgiliOdeme) {
                                    odemeTutari = ilgiliOdeme.Tutar;
                                }
                            }
                        }

                        grupDonemTutar += donemTutar;

                        return {
                            ...cek,
                            oncekiDonemTutar,
                            sonrakiDonemTutar,
                            donemTutar,
                            faturaStatus: isKesildi ? 'Kesildi' : 'Beklemede',
                            odemeTutari,
                        };
                    });
                
                totalAylikGelir += grupAylikGelir;
                totalDonemTutar += grupDonemTutar;

                return {
                    ...kategori,
                    cekler: cekler,
                    grupAylikGelir,
                    grupDonemTutar,
                    grupFark: grupDonemTutar - grupAylikGelir
                };
            });

        return { groups, kontrolEdilenKayitSayisi, totalAylikGelir, totalDonemTutar, totalFark: totalDonemTutar - totalAylikGelir };

    }, [yemekCekiList, kategoriList, ustKategoriList, gelirList, eFaturaList, eFaturaReferansList, odemeList, selectedBranch, period]);

    const handleExportToExcel = () => {
        const dataForExport: (string | number)[][] = [];
        dataForExport.push(["Fatura Dosya Adı", "İlk Tarih", "Son Tarih", "Tutar", "Önceki Dönem", "Sonraki Dönem", "Dönem Tutar", "Fatura Durumu", "Fatura Tarihi", "Ödeme Tarihi"]);

        processedData.groups.forEach(grup => {
            dataForExport.push([
                grup.Kategori_Adi.toUpperCase(),
                "Aylık Gelir:",
                grup.grupAylikGelir,
                "Toplam Dönem:",
                grup.grupDonemTutar,
                "Fark:",
                grup.grupFark
            ]);

            grup.cekler.forEach(cek => {
                dataForExport.push([
                    cek.Imaj_Adi || '-',
                    parseDate(cek.Ilk_Tarih)?.toLocaleDateString('tr-TR') || '-',
                    parseDate(cek.Son_Tarih)?.toLocaleDateString('tr-TR') || '-',
                    cek.Tutar,
                    cek.oncekiDonemTutar,
                    cek.sonrakiDonemTutar,
                    cek.donemTutar,
                    cek.faturaStatus,
                    cek.faturaStatus === 'Kesildi' ? parseDate(cek.Son_Tarih)?.toLocaleDateString('tr-TR') : '-',
                    cek.Odeme_Tarih ? parseDate(cek.Odeme_Tarih)?.toLocaleDateString('tr-TR') : '-'
                ]);
            });
        });

        dataForExport.push([
            "GENEL TOPLAM",
            "Aylık Gelir:",
            processedData.totalAylikGelir,
            "Toplam Dönem:",
            processedData.totalDonemTutar,
            "Fark:",
            processedData.totalFark
        ]);

        const ws = XLSX.utils.aoa_to_sheet(dataForExport);
        ws['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Yemek Ceki Raporu');
        XLSX.writeFile(wb, `Yemek_Ceki_Kontrol_${period}.xlsx`);
    };

    useEffect(() => {
        const allRows = document.querySelectorAll('tbody tr');
        allRows.forEach((row, index) => {
            const htmlRow = row as HTMLElement;
            htmlRow.style.opacity = '0';
            htmlRow.style.transform = 'translateY(20px)';
            setTimeout(() => {
                htmlRow.style.transition = 'all 0.5s ease';
                htmlRow.style.opacity = '1';
                htmlRow.style.transform = 'translateY(0)';
            }, index * 50);
        });

        const checkboxes = document.querySelectorAll('.checkbox');
        const handleChange = function(this: HTMLInputElement) {
            const row = this.closest('tr');
            if (row) {
                if (this.checked) {
                    row.style.background = 'linear-gradient(135deg, rgba(0, 184, 148, 0.1) 0%, rgba(0, 160, 133, 0.1) 100%)';
                } else {
                    row.style.background = '';
                }
            }
        };

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleChange as EventListener);
        });

        return () => {
            checkboxes.forEach(checkbox => {
                checkbox.removeEventListener('change', handleChange as EventListener);
            });
        };
    }, [processedData]);

    return (
        <div className="yemek-ceki-dashboard-wrapper">
            <div className="container">
                <div className="header">
                    <h1>🍽️ Yemek Çeki Kontrol Dashboard</h1>
                </div>

                <div className="content">
                    <div className="summary-cards">
                        <div className="summary-card income">
                            <h3>📊 Aylık Toplam Gelir</h3>
                            <div className="amount">{formatCurrency(processedData.totalAylikGelir)}</div>
                        </div>
                        <div className="summary-card paid">
                            <h3>💰 Dönem Tutar Toplamı</h3>
                            <div className="amount">{formatCurrency(processedData.totalDonemTutar)}</div>
                        </div>
                        <div className="summary-card difference">
                            <h3>⚖️ Fark</h3>
                            <div className="amount">{formatCurrency(processedData.totalFark)}</div>
                        </div>
                        <div className="summary-card pending">
                            <h3>📝 Kontrol Edilen Kayıt</h3>
                            <div className="amount">{processedData.kontrolEdilenKayitSayisi}</div>
                        </div>
                    </div>

                    <div className="data-table">
                        <div className="table-header">
                            <div className="table-header-title">
                                📋 Yemek Çeki Kategorileri Detay Raporu - {periodName}
                            </div>
                            <div className="period-selector">
                                {canExportExcel && (
                                    <button onClick={handleExportToExcel} title="Excel'e Aktar" className="text-white hover:bg-white/20 p-2 rounded-full">
                                        <Icons.Download className="w-5 h-5" />
                                    </button>
                                )}
                                <label htmlFor="period">Dönem:</label>
                                <select id="period" value={period} onChange={handlePeriodChange} className="bg-white text-gray-800 border-none rounded-md shadow-sm">
                                    {availablePeriods.map(p => (
                                        <option key={p} value={p}>{formatPeriodForDisplay(p)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '20%' }}>Fatura Dosyası</th>
                                    <th style={{ width: '10%' }}>İlk Tarih</th>
                                    <th style={{ width: '10%' }}>Son Tarih</th>
                                    <th style={{ width: '10%' }}>Tutar</th>
                                    <th style={{ width: '10%' }}>Önceki Dönem</th>
                                    <th style={{ width: '10%' }}>Sonraki Dönem</th>
                                    <th style={{ width: '10%' }}>Dönem Tutar</th>
                                    <th style={{ width: '8%' }}>Fatura</th>
                                    <th style={{ width: '10%' }}>Fatura Tarihi</th>
                                    <th style={{ width: '10%' }}>Ödeme Tarihi</th>
                                    <th style={{ width: '10%' }}>Ödeme Tutarı</th>
                                    <th style={{ width: '3%' }}>✓</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.groups.map(grup => (
                                    <React.Fragment key={grup.Kategori_ID}>
                                        <tr className="category-header">
                                            <td>{grup.Kategori_Adi}</td>
                                            <td>Aylık Gelir:</td>
                                            <td className={grup.grupAylikGelir >= 0 ? 'positive-diff' : 'negative-diff'}>{formatCurrency(grup.grupAylikGelir)}</td>
                                            <td>Toplam Dönem:</td>
                                            <td className={grup.grupDonemTutar >= 0 ? 'positive-diff' : 'negative-diff'}>{formatCurrency(grup.grupDonemTutar)}</td>
                                            <td>Fark:</td>
                                            <td className={grup.grupFark >= 0 ? 'positive-diff' : 'negative-diff'}>{formatCurrency(grup.grupFark)}</td>
                                            <td colSpan={4}></td>
                                        </tr>
                                        {grup.cekler.map(cek => (
                                            <tr key={cek.ID}>
                                                <td style={{ paddingLeft: '25px' }}>
                                                    {cek.Imaj && cek.Imaj_Adi ? (
                                                        <a 
                                                            href={`data:${getMimeType(cek.Imaj_Adi)};base64,${cek.Imaj}`}
                                                            download={cek.Imaj_Adi}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {cek.Imaj_Adi}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>{parseDate(cek.Ilk_Tarih)?.toLocaleDateString('tr-TR') || '-'}</td>
                                                <td>{parseDate(cek.Son_Tarih)?.toLocaleDateString('tr-TR') || '-'}</td>
                                                <td className="amount">{formatCurrency(cek.Tutar)}</td>
                                                <td className={`amount ${cek.oncekiDonemTutar > 0 ? 'negative' : ''}`}>{formatCurrency(cek.oncekiDonemTutar)}</td>
                                                <td className={`amount ${cek.sonrakiDonemTutar > 0 ? 'negative' : ''}`}>{formatCurrency(cek.sonrakiDonemTutar)}</td>
                                                <td className="amount positive">{formatCurrency(cek.donemTutar)}</td>
                                                <td>
                                                    <span className={`status-badge ${cek.faturaStatus === 'Kesildi' ? 'status-invoiced' : 'status-pending'}`}>
                                                        {cek.faturaStatus}
                                                    </span>
                                                </td>
                                                <td>{cek.faturaStatus === 'Kesildi' ? parseDate(cek.Son_Tarih)?.toLocaleDateString('tr-TR') : '-'}</td>
                                                <td>{cek.Odeme_Tarih && parseDate(cek.Odeme_Tarih) ? parseDate(cek.Odeme_Tarih)!.toLocaleDateString('tr-TR') : '-'}</td>
                                                <td>{cek.Odeme_Tarih && cek.odemeTutari !== undefined ? formatCurrency(cek.odemeTutari) : '-'}</td>
                                                <td><input type="checkbox" className="checkbox" defaultChecked={cek.faturaStatus === 'Kesildi'} /></td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}

                                <tr className="total-row">
                                    <td>📊 GENEL TOPLAM</td>
                                    <td>Aylık Gelir:</td>
                                    <td className={processedData.totalAylikGelir >= 0 ? 'positive-diff' : 'negative-diff'}>{formatCurrency(processedData.totalAylikGelir)}</td>
                                    <td>Toplam Dönem:</td>
                                    <td className={processedData.totalDonemTutar >= 0 ? 'positive-diff' : 'negative-diff'}>{formatCurrency(processedData.totalDonemTutar)}</td>
                                    <td>Fark:</td>
                                    <td className={processedData.totalFark >= 0 ? 'positive-diff' : 'negative-diff'}>{formatCurrency(processedData.totalFark)}</td>
                                    <td colSpan={4}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="footer">
                    {/* Footer content can also be dynamic later */}
                </div>
            </div>
        </div>
    );
};