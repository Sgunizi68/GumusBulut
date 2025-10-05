import React, { useEffect, useState } from 'react';
import { Card, Button } from '../components';
import { useAppContext } from '../App';
import { OZET_KONTROL_RAPORU_YETKI_ADI, EXCELE_AKTAR_YETKISI_ADI, Icons } from '../constants';
import { fetchData } from '../App';
import { API_BASE_URL } from '../constants';
import * as XLSX from 'xlsx';

const AccessDenied: React.FC<{ title: string }> = ({ title }) => (
    <Card title={title}>
        <div className="text-center py-10">
            <h3 className="text-xl font-bold text-red-600">Erişim Reddedildi</h3>
            <p className="text-gray-600 mt-2">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
    </Card>
);

export const OzetKontrolRaporuPage: React.FC = () => {
    const { hasPermission, selectedBranch, currentPeriod } = useAppContext();
    const [reportPeriod, setReportPeriod] = useState(currentPeriod);
    const pageTitle = "Özet Kontrol Raporu";
    const requiredPermission = OZET_KONTROL_RAPORU_YETKI_ADI;
    const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);
    const [periodOptions, setPeriodOptions] = useState<string[]>([]);

    const [databaseData, setDatabaseData] = useState({
        robotposTutar: 0,
        toplamSatis: 0,
        nakit: 0,
        gunlukHarcamaDiger: 0,
        gunlukHarcamaEFatura: 0,
        nakitGirisiToplam: 0,
        bankayaYatan: 0,
        gelirPOS: 0,
        posHareketleri: 0,
        onlineGelirToplam: 0,
        onlineVirmanToplam: 0,
        yemekCekiAylikGelir: 0,
        yemekCekiDonemToplam: 0,
    });

    useEffect(() => {
        const startYear = 25;
        const startMonth = 7;
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        const options: string[] = [];
        for (let y = startYear; y <= currentYear; y++) {
            const mStart = (y === startYear) ? startMonth : 1;
            const mEnd = (y === currentYear) ? currentMonth : 12;
            for (let m = mStart; m <= mEnd; m++) {
                options.push(`${y}${m.toString().padStart(2, '0')}`);
            }
        }
        setPeriodOptions(options.reverse());
    }, []);

    useEffect(() => {
        if (selectedBranch && reportPeriod) {
            Promise.all([
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/robotpos-tutar/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/toplam-satis-gelirleri/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/nakit/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/gunluk-harcama-diger/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/gunluk-harcama-efatura/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/nakit-girisi-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/bankaya-yatan-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/gelir-pos-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/pos-hareketleri-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/online-gelir-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/online-virman-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/yemek-ceki-aylik-gelir-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`),
                fetchData<number>(`${API_BASE_URL}/ozet-kontrol-raporu/yemek-ceki-donem-toplam/${selectedBranch.Sube_ID}/${reportPeriod}`)
            ]).then(data => {
                setDatabaseData({
                    robotposTutar: data[0],
                    toplamSatis: data[1],
                    nakit: data[2],
                    gunlukHarcamaDiger: data[3],
                    gunlukHarcamaEFatura: data[4],
                    nakitGirisiToplam: data[5],
                    bankayaYatan: data[6],
                    gelirPOS: data[7],
                    posHareketleri: data[8],
                    onlineGelirToplam: data[9] || 0,
                    onlineVirmanToplam: data[10] || 0,
                    yemekCekiAylikGelir: data[11],
                    yemekCekiDonemToplam: data[12],
                });
            });
        }
    }, [selectedBranch, reportPeriod]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const updateStatusIndicator = (value: number, statusElementId: string) => {
        const statusElement = document.getElementById(statusElementId);
        if (!statusElement) return;
        if (value > 0) {
            statusElement.className = 'status-indicator status-positive';
        } else if (value < 0) {
            statusElement.className = 'status-indicator status-negative';
        } else {
            statusElement.className = 'status-indicator status-zero';
        }
    };

    const updateValueColor = (value: number, elementId: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        if (value > 0) {
            element.className = 'calculation-value positive';
        } else if (value < 0) {
            element.className = 'calculation-value negative';
        } else {
            element.className = 'calculation-value zero';
        }
    };

    const kalanNakitCalculated = databaseData.nakit - databaseData.gunlukHarcamaEFatura - databaseData.gunlukHarcamaDiger;

    const calculations = {
        gelirFark: databaseData.toplamSatis - databaseData.robotposTutar,
        nakitFark: databaseData.bankayaYatan - kalanNakitCalculated,
        krediKartiFark: databaseData.posHareketleri - databaseData.gelirPOS,
        onlineFark: databaseData.onlineVirmanToplam - databaseData.onlineGelirToplam,
        yemekCekiFark: databaseData.yemekCekiDonemToplam - databaseData.yemekCekiAylikGelir,
        get toplamFark() {
            return this.gelirFark + this.nakitFark + this.krediKartiFark + this.onlineFark + this.yemekCekiFark;
        }
    };

    useEffect(() => {
        Object.keys(calculations).forEach(key => {
            const value = calculations[key as keyof typeof calculations];
            const element = document.getElementById(key);
            if (element) {
                element.textContent = formatCurrency(value);
                updateValueColor(value, key);
                const statusId = key + 'Status';
                updateStatusIndicator(value, statusId);
            }
        });
    }, [calculations]);

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setReportPeriod(e.target.value);
    }

    const handleExportToExcel = () => {
        const wb = XLSX.utils.book_new();

        const databaseVerileri = [
            { "Veri": "Robotpos Tutar", "Tutar": databaseData.robotposTutar },
            { "Veri": "Toplam Satış Gelirleri", "Tutar": databaseData.toplamSatis },
            { "Veri": "Nakit", "Tutar": databaseData.nakit },
            { "Veri": "Günlük Harcama-eFatura", "Tutar": databaseData.gunlukHarcamaEFatura },
            { "Veri": "Günlük Harcama-Diğer", "Tutar": databaseData.gunlukHarcamaDiger },
            { "Veri": "Kalan Nakit", "Tutar": kalanNakitCalculated },
            { "Veri": "Nakit Girişi Toplam", "Tutar": databaseData.nakitGirisiToplam },
            { "Veri": "Bankaya Yatan Toplam", "Tutar": databaseData.bankayaYatan },
            { "Veri": "Gelir POS", "Tutar": databaseData.gelirPOS },
            { "Veri": "POS Hareketleri", "Tutar": databaseData.posHareketleri },
            { "Veri": "Online Gelir Toplam", "Tutar": databaseData.onlineGelirToplam },
            { "Veri": "Online Virman Toplam", "Tutar": databaseData.onlineVirmanToplam },
            { "Veri": "Yemek Çeki Aylık Gelir", "Tutar": databaseData.yemekCekiAylikGelir },
            { "Veri": "Yemek Çeki Dönem Toplamı", "Tutar": databaseData.yemekCekiDonemToplam },
        ];

        const otomatikHesaplamalar = [
            { "Hesaplama": "Gelir Fark", "Tutar": calculations.gelirFark },
            { "Hesaplama": "Nakit Fark", "Tutar": calculations.nakitFark },
            { "Hesaplama": "Kredi Kartı Fark", "Tutar": calculations.krediKartiFark },
            { "Hesaplama": "Online Fark", "Tutar": calculations.onlineFark },
            { "Hesaplama": "Yemek Çeki Fark", "Tutar": calculations.yemekCekiFark },
            { "Hesaplama": "Toplam Fark", "Tutar": calculations.toplamFark },
        ];

        const ws1 = XLSX.utils.json_to_sheet(databaseVerileri);
        const ws2 = XLSX.utils.json_to_sheet(otomatikHesaplamalar);

        XLSX.utils.book_append_sheet(wb, ws1, "Database Verileri");
        XLSX.utils.book_append_sheet(wb, ws2, "Otomatik Hesaplamalar");

        XLSX.writeFile(wb, `Ozet_Kontrol_Raporu_${selectedBranch?.Sube_Adi}_${reportPeriod}.xlsx`);
    };

    if (!hasPermission(requiredPermission)) {
        return <AccessDenied title={pageTitle} />;
    }

    const css = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        backdrop-filter: blur(10px);
    }

    .header {
        background: linear-gradient(135deg, #2c3e50, #3498db);
        color: white;
        padding: 30px;
        position: relative;
        overflow: hidden;
    }

    .header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
    }

    .header h1 {
        font-size: 2.5rem;
        margin-bottom: 5px;
    }

    .header p {
        font-size: 1.1rem;
        opacity: 0.9;
    }

    .report-info {
        text-align: right;
        font-size: 0.9rem;
    }

    .report-info div {
        margin-bottom: 5px;
    }

    .main-content {
        padding: 30px;
    }

    .data-section {
        background: white;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.05);
        margin-bottom: 25px;
    }

    .section-title {
        font-size: 1.5rem;
        color: #2c3e50;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 3px solid #3498db;
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .section-title::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 50px;
        height: 3px;
        background: #e74c3c;
    }

    .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
    }

    .data-item {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border-radius: 12px;
        padding: 20px;
        border-left: 5px solid #3498db;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .data-item::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 50px;
        height: 50px;
        background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%);
        border-radius: 50%;
    }

    .data-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }

    .data-label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.95rem;
        margin-bottom: 8px;
    }

    .data-value {
        font-size: 1.4rem;
        font-weight: bold;
        color: #27ae60;
        font-family: 'Courier New', monospace;
    }

    .calculation-section {
        background: linear-gradient(135deg, #fff5f5, #ffe8e8);
        border: 2px solid #f39c12;
        border-radius: 15px;
        padding: 25px;
        margin-top: 25px;
    }

    .calculation-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .calculation-item {
        background: white;
        border-radius: 12px;
        padding: 20px;
        border-left: 5px solid #f39c12;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
    }

    .calculation-item:hover {
        transform: translateX(5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }

    .calculation-title {
        font-weight: 700;
        color: #2c3e50;
        font-size: 1.1rem;
        margin-bottom: 8px;
    }

    .calculation-formula {
        font-size: 0.9rem;
        color: #7f8c8d;
        font-style: italic;
        margin-bottom: 10px;
        background: #f8f9fa;
        padding: 8px 12px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
    }

    .calculation-value {
        font-size: 1.5rem;
        font-weight: bold;
        font-family: 'Courier New', monospace;
    }

    .positive {
        color: #27ae60;
    }

    .negative {
        color: #e74c3c;
    }

    .zero {
        color: #7f8c8d;
    }

    .highlight {
        background: linear-gradient(135deg, #f39c12, #e67e22) !important;
        color: white !important;
        border-left-color: #f39c12 !important;
        font-size: 1.2em;
        box-shadow: 0 10px 30px rgba(243, 156, 18, 0.3) !important;
    }

    .highlight .calculation-title,
    .highlight .calculation-formula {
        color: rgba(255, 255, 255, 0.95) !important;
        background: rgba(255, 255, 255, 0.1) !important;
    }

    .highlight .calculation-value {
        color: white !important;
        font-size: 1.8rem !important;
    }

    .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-left: 10px;
    }

    .status-positive {
        background: #27ae60;
        box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
    }

    .status-negative {
        background: #e74c3c;
        box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
    }

    .status-zero {
        background: #7f8c8d;
    }

    @media (max-width: 768px) {
        .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
        }
        
        .header h1 {
            font-size: 2rem;
        }
        
        .data-grid {
            grid-template-columns: 1fr;
        }
        
        body {
            padding: 10px;
        }
    }

    .refresh-indicator {
        position: absolute;
        top: 15px;
        right: 15px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8rem;
    }

    .loading-animation {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .filter-section {
        background: linear-gradient(135deg, #3498db, #2980b9);
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 25px;
        color: white;
        box-shadow: 0 10px 30px rgba(52, 152, 219, 0.3);
    }

    .filter-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }

    .filter-header h3 {
        font-size: 1.3rem;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .filter-controls {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .filter-group label {
        font-size: 0.9rem;
        font-weight: 600;
        opacity: 0.9;
    }

    .filter-group select {
        padding: 10px 15px;
        border: none;
        border-radius: 8px;
        background: white;
        color: #2c3e50;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        min-width: 200px;
        transition: all 0.3s ease;
    }

    .filter-group select:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .filter-group select:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }

    .filter-actions {
        display: flex;
        gap: 10px;
    }

    .filter-btn {
        padding: 10px 20px;
        border: 2px solid white;
        border-radius: 8px;
        background: white;
        color: #3498db;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }

    .filter-btn:hover {
        background: transparent;
        color: white;
        transform: translateY(-2px);
    }

    .filter-btn.secondary {
        background: transparent;
        color: white;
    }

    .filter-btn.secondary:hover {
        background: white;
        color: #3498db;
    }

    @media (max-width: 768px) {
        .filter-container {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
        }
        
        .filter-controls {
            flex-direction: column;
            gap: 15px;
        }
        
        .filter-actions {
            justify-content: center;
        }
    }

    .current-period {
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        display: inline-block;
        margin-left: 10px;
    }
    `;

    return (
        <>
            <style>{css}</style>
            <div className="container">
                <div className="header">
                    <div className="header-content">
                        <div>
                            <h1>📊 Özet Kontrol Raporu</h1>
                            <p>Otomatik Hesaplama ve Analiz Raporu <span className="current-period" id="currentPeriod">{reportPeriod}</span></p>
                        </div>
                    </div>
                </div>

                <div className="main-content">
                    <div className="filter-section">
                        <div className="filter-container">
                            <div className="filter-header">
                                <h3>📅 Dönem Filtresi</h3>
                            </div>
                            <div className="filter-controls">
                                <div className="filter-group">
                                    <label htmlFor="periodSelect">Dönem Seçin:</label>
                                    <select id="periodSelect" value={reportPeriod} onChange={handlePeriodChange}>
                                        {periodOptions.map(period => (
                                            <option key={period} value={period}>{`${period.substring(0, 2)}${period.substring(2, 4)} - ${new Date(2000 + parseInt(period.substring(0, 2)), parseInt(period.substring(2, 4)) - 1).toLocaleString('tr-TR', { month: 'long' })} ${2000 + parseInt(period.substring(0, 2))}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-actions">
                                    {canExportExcel && (
                                        <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                                            <Icons.Download className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="data-section">
                        <h2 className="section-title">💾 Database Verileri</h2>
                        
                        <div className="data-grid">
                            <div className="data-item">
                                <div className="data-label">Robotpos Tutar</div>
                                <div className="data-value" id="robotposTutar">{formatCurrency(databaseData.robotposTutar)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Toplam Satış Gelirleri</div>
                                <div className="data-value" id="toplamSatis">{formatCurrency(databaseData.toplamSatis)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Nakit</div>
                                <div className="data-value" id="nakit">{formatCurrency(databaseData.nakit)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Günlük Harcama-eFatura</div>
                                <div className="data-value" id="gunlukHarcamaEFatura">{formatCurrency(databaseData.gunlukHarcamaEFatura)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Günlük Harcama-Diğer</div>
                                <div className="data-value" id="gunlukHarcamaDiger">{formatCurrency(databaseData.gunlukHarcamaDiger)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Kalan Nakit</div>
                                <div className="data-value" id="kalanNakit">{formatCurrency(kalanNakitCalculated)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Nakit Girişi Toplam</div>
                                <div className="data-value" id="nakitGirisi">{formatCurrency(databaseData.nakitGirisiToplam)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Bankaya Yatan Toplam</div>
                                <div className="data-value" id="bankayaYatan">{formatCurrency(databaseData.bankayaYatan)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Gelir POS</div>
                                <div className="data-value" id="gelirPOS">{formatCurrency(databaseData.gelirPOS)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">POS Hareketleri</div>
                                <div className="data-value" id="posHareketleri">{formatCurrency(databaseData.posHareketleri)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Online Gelir Toplam</div>
                                <div className="data-value" id="gelirToplam">{formatCurrency(databaseData.onlineGelirToplam)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Online Virman Toplam</div>
                                <div className="data-value" id="virmanToplam">{formatCurrency(databaseData.onlineVirmanToplam)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Yemek Çeki Aylık Gelir</div>
                                <div className="data-value" id="aylikGelir">{formatCurrency(databaseData.yemekCekiAylikGelir)}</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Yemek Çeki Dönem Toplamı</div>
                                <div className="data-value" id="toplamDonem">{formatCurrency(databaseData.yemekCekiDonemToplam)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="calculation-section">
                        <h2 className="section-title">🧮 Otomatik Hesaplamalar</h2>
                        
                        <div className="calculation-grid">
                            <div className="calculation-item highlight">
                                <div className="calculation-title">
                                    Toplam Fark
                                    <span className="status-indicator status-positive" id="toplamFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Gelir Fark + Nakit Fark + Kredi Kartı Fark + Online Fark + Yemek Çeki Fark</div>
                                <div className="calculation-value positive" id="toplamFark">{formatCurrency(calculations.toplamFark)}</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Gelir Fark
                                    <span className="status-indicator status-positive" id="gelirFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Toplam Satış Gelirleri - Robotpos Tutar</div>
                                <div className="calculation-value positive" id="gelirFark">{formatCurrency(calculations.gelirFark)}</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Nakit Fark
                                    <span className="status-indicator status-positive" id="nakitFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Bankaya Yatan Toplam - Kalan Nakit</div>
                                <div className="calculation-value positive" id="nakitFark">{formatCurrency(calculations.nakitFark)}</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Kredi Kartı Fark
                                    <span className="status-indicator status-positive" id="krediKartiFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">POS Hareketleri - Gelir POS</div>
                                <div className="calculation-value positive" id="krediKartiFark">{formatCurrency(calculations.krediKartiFark)}</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Online Fark
                                    <span className="status-indicator status-positive" id="onlineFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Online Virman Toplam - Online Gelir Toplam</div>
                                <div className="calculation-value positive" id="onlineFark">{formatCurrency(calculations.onlineFark)}</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Yemek Çeki Fark
                                    <span className="status-indicator status-positive" id="yemekCekiFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Yemek Çeki Dönem Toplamı - Yemek Çeki Aylık Gelir</div>
                                <div className="calculation-value positive" id="yemekCekiFark">{formatCurrency(calculations.yemekCekiFark)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OzetKontrolRaporuPage;