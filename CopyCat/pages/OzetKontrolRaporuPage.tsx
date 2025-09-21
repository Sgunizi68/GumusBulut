import React, { useEffect, useState } from 'react';
import { Card } from '../components';
import { useAppContext } from '../App';
import { OZET_KONTROL_RAPORU_YETKI_ADI, API_BASE_URL } from '../constants';

const AccessDenied: React.FC<{ title: string }> = ({ title }) => (
    <Card title={title}>
        <div className="text-center py-10">
            <h3 className="text-xl font-bold text-red-600">Erişim Reddedildi</h3>
            <p className="text-gray-600 mt-2">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
    </Card>
);

export const OzetKontrolRaporuPage: React.FC = () => {
    const { hasPermission, selectedBranch, currentPeriod, setPeriod } = useAppContext();
    const pageTitle = "Özet Kontrol Raporu";
    const requiredPermission = OZET_KONTROL_RAPORU_YETKI_ADI;
    const [robotposTutar, setRobotposTutar] = useState<number>(0);
    const [toplamSatis, setToplamSatis] = useState<number>(0);
    const [nakit, setNakit] = useState<number>(0);
    const [periodOptions, setPeriodOptions] = useState<string[]>([]);

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
        if (selectedBranch && currentPeriod) {
            Promise.all([
                fetch(`${API_BASE_URL}/ozet-kontrol-raporu/robotpos-tutar/${selectedBranch.Sube_ID}/${currentPeriod}`).then(res => res.json()),
                fetch(`${API_BASE_URL}/ozet-kontrol-raporu/toplam-satis-gelirleri/${selectedBranch.Sube_ID}/${currentPeriod}`).then(res => res.json()),
                fetch(`${API_BASE_URL}/ozet-kontrol-raporu/nakit/${selectedBranch.Sube_ID}/${currentPeriod}`).then(res => res.json())
            ]).then(([robotposData, toplamSatisData, nakitData]) => {
                setRobotposTutar(robotposData);
                setToplamSatis(toplamSatisData);
                setNakit(nakitData);

                const robotposTutarEl = document.getElementById('robotposTutar');
                if(robotposTutarEl) robotposTutarEl.textContent = formatCurrency(robotposData);

                const toplamSatisEl = document.getElementById('toplamSatis');
                if(toplamSatisEl) toplamSatisEl.textContent = formatCurrency(toplamSatisData);

                const nakitEl = document.getElementById('nakit');
                if(nakitEl) nakitEl.textContent = formatCurrency(nakitData);

                performCalculations(robotposData, toplamSatisData, nakitData);
            });
        }

        // Simulate real-time database updates
        function formatCurrency(amount: number) {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 2
            }).format(amount || 0);
        }

        function updateStatusIndicator(value: number, statusElementId: string) {
            const statusElement = document.getElementById(statusElementId);
            if (!statusElement) return;
            if (value > 0) {
                statusElement.className = 'status-indicator status-positive';
            } else if (value < 0) {
                statusElement.className = 'status-indicator status-negative';
            } else {
                statusElement.className = 'status-indicator status-zero';
            }
        }

        function updateValueColor(value: number, elementId: string) {
            const element = document.getElementById(elementId);
            if (!element) return;
            if (value > 0) {
                element.className = 'calculation-value positive';
            } else if (value < 0) {
                element.className = 'calculation-value negative';
            } else {
                element.className = 'calculation-value zero';
            }
        }

        function performCalculations(robotposTutar: number, toplamSatis: number, nakit: number) {
            // Simulate database values (these would come from actual database)
            const data = {
                robotposTutar: robotposTutar,
                toplamSatis: toplamSatis,
                nakit: nakit,
                gunlukHarcamaEFatura: 1200,
                gunlukHarcamaDiger: 800,
                kalanNakit: 6500,
                bankayaYatan: 6200,
                gelirPOS: 9800,
                posHareketleri: 9650,
                gelirToplam: 22100,
                virmanToplam: 21850,
                aylikGelir: 3400,
                toplamDonem: 3200
            };

            // Perform calculations based on the table formulas
            const calculations: { [key: string]: number } = {
                gelirFark: data.toplamSatis - data.robotposTutar,
                nakitCalculated: data.nakit - data.gunlukHarcamaEFatura - data.gunlukHarcamaDiger,
                nakitFark: data.bankayaYatan - data.kalanNakit,
                krediKartiFark: data.posHareketleri - data.gelirPOS,
                onlineFark: data.virmanToplam - data.gelirToplam,
                yemekCekiFark: data.toplamDonem - data.aylikGelir
            };

            calculations.toplamFark = calculations.gelirFark + calculations.nakitFark + 
                                    calculations.krediKartiFark + calculations.onlineFark + 
                                    calculations.yemekCekiFark;

            // Update display values
            Object.keys(calculations).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = formatCurrency(calculations[key]);
                    updateValueColor(calculations[key], key);
                    
                    // Update status indicators
                    const statusId = key + 'Status';
                    updateStatusIndicator(calculations[key], statusId);
                }
            });
        }
        
        (window as any).exportReport = () => {
            const currentPeriodEl = document.getElementById('currentPeriod');
            const period = currentPeriodEl ? currentPeriodEl.textContent : '';
            showNotification(`${period} dönemi raporu dışa aktarılıyor...`, 'info');
            
            // Simulate export process
            setTimeout(() => {
                showNotification('Rapor başarıyla dışa aktarıldı', 'success');
            }, 2000);
        };

    }, [selectedBranch, currentPeriod]);

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriod(e.target.value);
    }

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
                            <p>Otomatik Hesaplama ve Analiz Raporu <span className="current-period" id="currentPeriod">{currentPeriod}</span></p>
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
                                    <select id="periodSelect" value={currentPeriod} onChange={handlePeriodChange}>
                                        {periodOptions.map(period => (
                                            <option key={period} value={period}>{`${period.substring(0, 2)}${period.substring(2, 4)} - ${new Date(2000 + parseInt(period.substring(0, 2)), parseInt(period.substring(2, 4)) - 1).toLocaleString('tr-TR', { month: 'long' })} ${2000 + parseInt(period.substring(0, 2))}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-actions">
                                    <button className="filter-btn secondary" onClick={() => (window as any).exportReport()}>📊 Raporu Dışa Aktar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="data-section">
                        <h2 className="section-title">💾 Database Verileri</h2>
                        
                        <div className="data-grid">
                            <div className="data-item">
                                <div className="data-label">Robotpos Tutar</div>
                                <div className="data-value" id="robotposTutar">₺ 0.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Toplam Satış Gelirleri</div>
                                <div className="data-value" id="toplamSatis">₺ 0.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Nakit</div>
                                <div className="data-value" id="nakit">₺ 0.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Günlük Harcama-eFatura</div>
                                <div className="data-value" id="gunlukHarcamaEFatura">₺ 1,200.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Günlük Harcama-Diğer</div>
                                <div className="data-value" id="gunlukHarcamaDiger">₺ 800.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Kalan Nakit</div>
                                <div className="data-value" id="kalanNakit">₺ 6,500.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Nakit Girişi Toplam</div>
                                <div className="data-value" id="nakitGirisi">₺ 12,300.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Bankaya Yatan Toplam</div>
                                <div className="data-value" id="bankayaYatan">₺ 6,200.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Gelir POS</div>
                                <div className="data-value" id="gelirPOS">₺ 9,800.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">POS Hareketleri</div>
                                <div className="data-value" id="posHareketleri">₺ 9,650.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Online Gelir Toplam</div>
                                <div className="data-value" id="gelirToplam">₺ 22,100.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Online Virman Toplam</div>
                                <div className="data-value" id="virmanToplam">₺ 21,850.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Yemek Çeki Aylık Gelir</div>
                                <div className="data-value" id="aylikGelir">₺ 3,400.00</div>
                            </div>

                            <div className="data-item">
                                <div className="data-label">Yemek Çeki Dönem Toplamı</div>
                                <div className="data-value" id="toplamDonem">₺ 3,200.00</div>
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
                                <div className="calculation-value positive" id="toplamFark">₺ 1,100.00</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Gelir Fark
                                    <span className="status-indicator status-positive" id="gelirFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Toplam Satış Gelirleri - Robotpos Tutar</div>
                                <div className="calculation-value positive" id="gelirFark">₺ 550.00</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Nakit Fark
                                    <span className="status-indicator status-positive" id="nakitFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Kalan Nakit - Bankaya Yatan Toplam</div>
                                <div className="calculation-value positive" id="nakitFark">₺ 300.00</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Kredi Kartı Fark
                                    <span className="status-indicator status-positive" id="krediKartiFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Gelir POS - POS Hareketleri</div>
                                <div className="calculation-value positive" id="krediKartiFark">₺ 150.00</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Online Fark
                                    <span className="status-indicator status-positive" id="onlineFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Online Gelir Toplam - Online Virman Toplam</div>
                                <div className="calculation-value positive" id="onlineFark">₺ 250.00</div>
                            </div>

                            <div className="calculation-item">
                                <div className="calculation-title">
                                    Yemek Çeki Fark
                                    <span className="status-indicator status-positive" id="yemekCekiFarkStatus"></span>
                                </div>
                                <div className="calculation-formula">Yemek Çeki Aylık Gelir - Yemek Çeki Dönem Toplamı</div>
                                <div className="calculation-value positive" id="yemekCekiFark">₺ 200.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OzetKontrolRaporuPage;