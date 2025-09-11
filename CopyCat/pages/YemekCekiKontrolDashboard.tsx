import React, { useState, useEffect, useMemo } from 'react';
import '../styles/YemekCekiKontrolDashboard.css';
import { useAppContext, useDataContext } from '../App';

// Helper function to parse YYYY-MM-DD string to Date object safely
const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn(`Invalid date string encountered: ${dateString}`);
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

// Helper to calculate the number of days between two dates (inclusive)
const daysBetween = (startDate: Date, endDate: Date): number => {
    if (endDate < startDate) return 0;
    // Use UTC to avoid daylight saving issues
    const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    return Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const YemekCekiKontrolDashboardPage: React.FC = () => {
    const { selectedBranch } = useAppContext();
    const { kategoriList, yemekCekiList } = useDataContext();

    const [period, setPeriod] = useState('2508');
    const [periodName, setPeriodName] = useState('Ağustos 2025 (2508)');

    const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPeriod = event.target.value;
        setPeriod(newPeriod);
        const periodNames: { [key: string]: string } = {
            '2507': 'Temmuz 2025 (2507)',
            '2508': 'Ağustos 2025 (2508)',
            '2509': 'Eylül 2025 (2509)',
            '2510': 'Ekim 2025 (2510)'
        };
        setPeriodName(periodNames[newPeriod] || '');
    };

    const processedData = useMemo(() => {
        if (!selectedBranch || !yemekCekiList || !kategoriList) {
            return { groups: [], kontrolEdilenKayitSayisi: 0, totalAylikGelir: 0, totalDonemTutar: 0, totalFark: 0 };
        }

        const { startDate: periodStart, endDate: periodEnd } = getPeriodDates(period);

        const ilgiliCekler = yemekCekiList.filter(cek => {
            const ilkTarih = parseDate(cek.Ilk_Tarih);
            const sonTarih = parseDate(cek.Son_Tarih);
            if (!ilkTarih || !sonTarih) return false;

            return (
                cek.Sube_ID === selectedBranch.Sube_ID &&
                ilkTarih <= periodEnd &&
                sonTarih >= periodStart
            );
        });

        const kontrolEdilenKayitSayisi = ilgiliCekler.length;

        let totalAylikGelir = 0;
        let totalDonemTutar = 0;

        const kategoriIDsInCekler = [...new Set(ilgiliCekler.map(c => c.Kategori_ID))];

        const groups = kategoriList
            .filter(k => kategoriIDsInCekler.includes(k.Kategori_ID))
            .map(kategori => {
                let grupAylikGelir = 0;
                let grupDonemTutar = 0;

                const cekler = ilgiliCekler
                    .filter(cek => cek.Kategori_ID === kategori.Kategori_ID)
                    .map(cek => {
                        const cekIlk_Tarih = parseDate(cek.Ilk_Tarih)!;
                        const cekSon_Tarih = parseDate(cek.Son_Tarih)!;
                        const toplamGun = daysBetween(cekIlk_Tarih, cekSon_Tarih);
                        const gunlukTutar = toplamGun > 0 ? cek.Tutar / toplamGun : 0;

                        let oncekiDonemTutar = 0;
                        if (cekIlk_Tarih < periodStart) {
                            const oncekiDonemBitis = new Date(periodStart.getTime() - 1);
                            const oncekiDonemGunSayisi = daysBetween(cekIlk_Tarih, oncekiDonemBitis);
                            oncekiDonemTutar = oncekiDonemGunSayisi * gunlukTutar;
                        }

                        let sonrakiDonemTutar = 0;
                        if (cekSon_Tarih > periodEnd) {
                            const sonrakiDonemBaslangic = new Date(periodEnd.getTime() + 1);
                            const sonrakiDonemGunSayisi = daysBetween(sonrakiDonemBaslangic, cekSon_Tarih);
                            sonrakiDonemTutar = sonrakiDonemGunSayisi * gunlukTutar;
                        }

                        const donemTutar = cek.Tutar - oncekiDonemTutar - sonrakiDonemTutar;
                        
                        grupAylikGelir += cek.Tutar;
                        grupDonemTutar += donemTutar;

                        return {
                            ...cek,
                            oncekiDonemTutar,
                            sonrakiDonemTutar,
                            donemTutar,
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
            })
            .filter(g => g.cekler.length > 0);

        return { groups, kontrolEdilenKayitSayisi, totalAylikGelir, totalDonemTutar, totalFark: totalDonemTutar - totalAylikGelir };

    }, [yemekCekiList, kategoriList, selectedBranch, period]);

    useEffect(() => {
        // Re-run animations and event listeners when data changes
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
                            <label htmlFor="period">Dönem:</label>
                            <select id="period" value={period} onChange={handlePeriodChange}>
                                <option value="2508">2508 - Ağustos 2025</option>
                                <option value="2509">2509 - Eylül 2025</option>
                                <option value="2507">2507 - Temmuz 2025</option>
                                <option value="2510">2510 - Ekim 2025</option>
                            </select>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '20%' }}>Kategori</th>
                                <th style={{ width: '10%' }}>İlk Tarih</th>
                                <th style={{ width: '10%' }}>Son Tarih</th>
                                <th style={{ width: '10%' }}>Tutar</th>
                                <th style={{ width: '10%' }}>Önceki Dönem</th>
                                <th style={{ width: '10%' }}>Sonraki Dönem</th>
                                <th style={{ width: '10%' }}>Dönem Tutar</th>
                                <th style={{ width: '8%' }}>Fatura</th>
                                <th style={{ width: '10%' }}>Fatura Tarihi</th>
                                <th style={{ width: '10%' }}>Ödeme Tarihi</th>
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
                                            <td style={{ paddingLeft: '25px' }}>{`YC-${grup.Kategori_Adi.substring(0,3)}-${cek.ID}`}</td>
                                            <td>{parseDate(cek.Ilk_Tarih)?.toLocaleDateString('tr-TR') || '-'}</td>
                                            <td>{parseDate(cek.Son_Tarih)?.toLocaleDateString('tr-TR') || '-'}</td>
                                            <td className="amount">{formatCurrency(cek.Tutar)}</td>
                                            <td className={`amount ${cek.oncekiDonemTutar > 0 ? 'negative' : ''}`}>{formatCurrency(cek.oncekiDonemTutar)}</td>
                                            <td className={`amount ${cek.sonrakiDonemTutar > 0 ? 'negative' : ''}`}>{formatCurrency(cek.sonrakiDonemTutar)}</td>
                                            <td className="amount positive">{formatCurrency(cek.donemTutar)}</td>
                                            <td>
                                                {cek.Imaj ? 
                                                    <span className="status-badge status-invoiced">Kesildi</span> : 
                                                    <span className="status-badge status-pending">Beklemede</span>
                                                }
                                            </td>
                                            <td>{cek.Imaj && parseDate(cek.Tarih) ? parseDate(cek.Tarih)!.toLocaleDateString('tr-TR') : '-'}</td>
                                            <td>{cek.Odeme_Tarih && parseDate(cek.Odeme_Tarih) ? parseDate(cek.Odeme_Tarih)!.toLocaleDateString('tr-TR') : '-'}</td>
                                            <td><input type="checkbox" className="checkbox" defaultChecked={!!cek.Imaj} /></td>
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
    );
};