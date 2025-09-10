import React, { useEffect } from 'react';

export const YemekCekiKontrolDashboardPage: React.FC = () => {
    useEffect(() => {
        // Script content will go here
        function updateDashboard() {
            const period = document.getElementById('period') as HTMLSelectElement;
            const periodNames: { [key: string]: string } = {
                '2507': 'Temmuz 2025 (2507)',
                '2508': 'Ağustos 2025 (2508)',
                '2509': 'Eylül 2025 (2509)',
                '2510': 'Ekim 2025 (2510)'
            };

            const tableHeaderTitle = document.querySelector('.table-header-title');
            if (tableHeaderTitle) {
                tableHeaderTitle.innerHTML = `📋 Yemek Çeki Kategorileri Detay Raporu - ${periodNames[period.value]}`;
            }

            // Özet kartları güncelleme animasyonu
            const cards = document.querySelectorAll('.summary-card');
            cards.forEach((card, index) => {
                (card as HTMLElement).style.animation = 'none';
                setTimeout(() => {
                    (card as HTMLElement).style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s`;
                }, 10);
            });
        }

        // Sayfa yüklendiğinde animasyonları başlat
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            (row as HTMLElement).style.opacity = '0';
            (row as HTMLElement).style.transform = 'translateY(20px)';
            setTimeout(() => {
                (row as HTMLElement).style.transition = 'all 0.5s ease';
                (row as HTMLElement).style.opacity = '1';
                (row as HTMLElement).style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Checkbox değişim kontrolü
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            const typedCheckbox = checkbox as HTMLInputElement;
            typedCheckbox.addEventListener('change', function() {
                const row = this.closest('tr');
                if (row) {
                    if (this.checked) {
                        (row as HTMLElement).style.background = 'linear-gradient(135deg, rgba(0, 184, 148, 0.1) 0%, rgba(0, 160, 133, 0.1) 100%)';
                    } else {
                        (row as HTMLElement).style.background = '';
                    }
                }
            });
        });

        // Expose updateDashboard to global scope for onchange attribute
        (window as any).updateDashboard = updateDashboard;

        return () => {
            // Cleanup if necessary
            delete (window as any).updateDashboard;
        };
    }, []);

    return (
        // HTML content will go here, converted to JSX
        <div className="container">
            <div className="header">
                <h1>🍽️ Yemek Çeki Kontrol Dashboard</h1>
            </div>

            <div className="content">
                {/* Özet Kartları */}
                <div className="summary-cards">
                    <div className="summary-card income">
                        <h3>📊 Aylık Toplam Gelir</h3>
                        <div className="amount">₺170,500.00</div>
                    </div>
                    <div className="summary-card paid">
                        <h3>💰 Dönem Tutar Toplamı</h3>
                        <div className="amount">₺166,550.00</div>
                    </div>
                    <div className="summary-card difference">
                        <h3>⚖️ Fark</h3>
                        <div className="amount">-₺3,950.00</div>
                    </div>
                    <div className="summary-card pending">
                        <h3>📝 Kontrol Edilen Kayıt</h3>
                        <div className="amount">9</div>
                    </div>
                </div>

                {/* Yemek Çeki Kategorileri Tablosu */}
                <div className="data-table">
                    <div className="table-header">
                        <div className="table-header-title">
                            📋 Yemek Çeki Kategorileri Detay Raporu - Ağustos 2025 (2508)
                        </div>
                        <div className="period-selector">
                            <label htmlFor="period">Dönem:</label>
                            <select id="period" onChange={() => (window as any).updateDashboard()}>
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
                            {/* MULTINET Kategori Header */}
                            <tr className="category-header">
                                <td>💳 MULTINET</td>
                                <td>Aylık Gelir:</td>
                                <td className="positive-diff">₺85,000.00</td>
                                <td>Toplam Dönem:</td>
                                <td className="positive-diff">₺95,250.00</td>
                                <td>Fark:</td>
                                <td className="positive-diff">+₺10,250.00</td>
                                <td colSpan={4}></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-MLT-001</td>
                                <td>25.07.2025</td>
                                <td>15.08.2025</td>
                                <td className="amount">₺45,200.00</td>
                                <td className="amount negative">-₺8,150.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺37,050.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>16.08.2025</td>
                                <td>25.08.2025</td>
                                <td><input type="checkbox" className="checkbox" defaultChecked /></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-MLT-002</td>
                                <td>01.08.2025</td>
                                <td>31.08.2025</td>
                                <td className="amount">₺58,900.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺58,900.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>02.09.2025</td>
                                <td>12.09.2025</td>
                                <td><input type="checkbox" className="checkbox" defaultChecked /></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-MLT-003</td>
                                <td>15.07.2025</td>
                                <td>10.09.2025</td>
                                <td className="amount">₺11,700.00</td>
                                <td className="amount negative">-₺2,400.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺8,300.00</td>
                                <td><span className="status-badge status-pending">Beklemede</span></td>
                                <td>-</td>
                                <td>-</td>
                                <td><input type="checkbox" className="checkbox" /></td>
                            </tr>

                            {/* TICKET Kategori Header */}
                            <tr className="category-header">
                                <td>🎫 TICKET</td>
                                <td>Aylık Gelir:</td>
                                <td className="negative-diff">₺34,200.00</td>
                                <td>Toplam Dönem:</td>
                                <td className="negative-diff">₺32,500.00</td>
                                <td>Fark:</td>
                                <td className="negative-diff">-₺1,700.00</td>
                                <td colSpan={4}></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-TKT-001</td>
                                <td>01.08.2025</td>
                                <td>31.08.2025</td>
                                <td className="amount">₺18,750.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺18,750.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>01.09.2025</td>
                                <td>08.09.2025</td>
                                <td><input type="checkbox" className="checkbox" defaultChecked /></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-TKT-002</td>
                                <td>20.07.2025</td>
                                <td>25.08.2025</td>
                                <td className="amount">₺17,600.00</td>
                                <td className="amount negative">-₺3,850.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺13,750.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>26.08.2025</td>
                                <td>-</td>
                                <td><input type="checkbox" className="checkbox" /></td>
                            </tr>

                            {/* SODEXO Kategori Header */}
                            <tr className="category-header">
                                <td>🪙 SODEXO</td>
                                <td>Aylık Gelir:</td>
                                <td className="negative-diff">₺29,800.00</td>
                                <td>Toplam Dönem:</td>
                                <td className="negative-diff">₺28,150.00</td>
                                <td>Fark:</td>
                                <td className="negative-diff">-₺1,650.00</td>
                                <td colSpan={4}></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-SDX-001</td>
                                <td>05.08.2025</td>
                                <td>28.08.2025</td>
                                <td className="amount">₺15,900.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺15,900.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>30.08.2025</td>
                                <td>05.09.2025</td>
                                <td><input type="checkbox" className="checkbox" defaultChecked /></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-SDX-002</td>
                                <td>12.08.2025</td>
                                <td>18.09.2025</td>
                                <td className="amount">₺18,450.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount negative">-₺6,200.00</td>
                                <td className="amount positive">₺12,250.00</td>
                                <td><span className="status-badge status-pending">Beklemede</span></td>
                                <td>-</td>
                                <td>-</td>
                                <td><input type="checkbox" className="checkbox" /></td>
                            </tr>

                            {/* METROPOL SETCARD Kategori Header */}
                            <tr className="category-header">
                                <td>🛍️ METROPOL SETCARD</td>
                                <td>Aylık Gelir:</td>
                                <td className="negative-diff">₺21,500.00</td>
                                <td>Toplam Dönem:</td>
                                <td className="negative-diff">₺10,650.00</td>
                                <td>Fark:</td>
                                <td className="negative-diff">-₺10,850.00</td>
                                <td colSpan={4}></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-MET-001</td>
                                <td>10.07.2025</td>
                                <td>05.09.2025</td>
                                <td className="amount">₺26,800.00</td>
                                <td className="amount negative">-₺12,950.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺9,650.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>08.09.2025</td>
                                <td>-</td>
                                <td><input type="checkbox" className="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: '25px' }}>YC-MET-002</td>
                                <td>15.08.2025</td>
                                <td>25.08.2025</td>
                                <td className="amount">₺1,000.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount">₺0.00</td>
                                <td className="amount positive">₺1,000.00</td>
                                <td><span className="status-badge status-invoiced">Kesildi</span></td>
                                <td>26.08.2025</td>
                                <td>28.08.2025</td>
                                <td><input type="checkbox" className="checkbox" defaultChecked /></td>
                            </tr>

                            {/* Genel Toplam */}
                            <tr className="total-row">
                                <td>📊 GENEL TOPLAM</td>
                                <td>Aylık Gelir:</td>
                                <td className="negative-diff">₺170,500.00</td>
                                <td>Toplam Dönem:</td>
                                <td className="negative-diff">₺166,550.00</td>
                                <td>Fark:</td>
                                <td className="negative-diff">-₺3,950.00</td>
                                <td colSpan={4}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="footer">
                📄 Son güncelleme: 08.09.2025 14:30 | 🎯 Toplam kontrol edilen kayıt: 9 | ⚠️ Bekleyen işlem: 3
            </div>
        </div>
    );
};