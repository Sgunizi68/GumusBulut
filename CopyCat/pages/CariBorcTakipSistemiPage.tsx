import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAppContext, fetchData } from '../App';
import { API_BASE_URL } from '../constants';

const CariTakipEkrani = () => {
  const { selectedBranch } = useAppContext();
  // Bugünün tarihinden ay başını hesapla
  const getMonthStart = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const [baslangicTarihi, setBaslangicTarihi] = useState(getMonthStart());
  const [subeId, setSubeId] = useState(selectedBranch?.Sube_ID || 1);
  const [expandedFirma, setExpandedFirma] = useState({});
  const [aktifFiltreler, setAktifFiltreler] = useState(['Cari Borç', 'Belirsiz']);

  const [mutabakatData, setMutabakatData] = useState([]);
  const [faturaData, setFaturaData] = useState([]);
  const [odemeData, setOdemeData] = useState([]);

  useEffect(() => {
    if (selectedBranch) {
      setSubeId(selectedBranch.Sube_ID);
    }
  }, [selectedBranch]);

  useEffect(() => {
    const fetchAllData = async () => {
      console.log("Fetching data for subeId:", subeId, "baslangicTarihi:", baslangicTarihi);
      const [mutabakat, fatura, odeme] = await Promise.all([
        fetchData(`${API_BASE_URL}/rapor/cari-mutabakat`),
        fetchData(`${API_BASE_URL}/rapor/cari-fatura?sube_id=${subeId}&baslangic_tarih=${baslangicTarihi}`),
        fetchData(`${API_BASE_URL}/rapor/cari-odeme?sube_id=${subeId}&baslangic_tarih=${baslangicTarihi}`)
      ]);
      console.log("mutabakat", mutabakat);
      console.log("fatura", fatura);
      console.log("odeme", odeme);
      if (mutabakat) setMutabakatData(mutabakat);
      if (fatura) setFaturaData(fatura);
      if (odeme) setOdemeData(odeme);
    }
    fetchAllData();
  }, [baslangicTarihi, subeId]);

  const firmaListesi = useMemo(() => {
    const firmalar = {};

    // Cari Borç firmaları için
    mutabakatData.forEach(mutabakat => {
      const firma = mutabakat.Alici_Unvani;
      if (!firmalar[firma]) {
        firmalar[firma] = {
          cariDurum: 'Cari Borç',
          mutabakat: [],
          faturalar: [],
          odemeler: [],
          mutabakatToplam: 0,
          faturaToplam: 0,
          odemeToplam: 0,
          bakiye: 0
        };
      }
      firmalar[firma].mutabakat.push(mutabakat);
      firmalar[firma].mutabakatToplam = mutabakat.Toplam_Mutabakat_Tutari;
    });

    // Faturaları ekle
    faturaData.forEach(fatura => {
      const firma = fatura.Alici_Unvani;
      if (!firmalar[firma]) {
        firmalar[firma] = {
          cariDurum: fatura.Cari_Durumu,
          mutabakat: [],
          faturalar: [],
          odemeler: [],
          mutabakatToplam: 0,
          faturaToplam: 0,
          odemeToplam: 0,
          bakiye: 0
        };
      }
      firmalar[firma].faturalar.push(fatura);
      firmalar[firma].faturaToplam += fatura.Tutar;
      firmalar[firma].cariDurum = fatura.Cari_Durumu;
    });

    // Ödemeleri ekle
    odemeData.forEach(odeme => {
      const firma = odeme.Alici_Unvani;
      if (firmalar[firma]) {
        firmalar[firma].odemeler.push(odeme);
        firmalar[firma].odemeToplam += odeme.Tutar;
      }
    });

    // Bakiyeleri hesapla
    Object.keys(firmalar).forEach(firma => {
      const f = firmalar[firma];
      f.bakiye = f.mutabakatToplam + f.faturaToplam - f.odemeToplam;
    });

    return firmalar;
  }, [mutabakatData, faturaData, odemeData]);

  // Kategorilere ayır
  const cariBorcFirmalar = Object.entries(firmaListesi).filter(([_, f]) => f.cariDurum === 'Cari Borç');
  const cariOlmayanFirmalar = Object.entries(firmaListesi).filter(([_, f]) => f.cariDurum === 'Cari Olmayan Borç');
  const belirsizFirmalar = Object.entries(firmaListesi).filter(([_, f]) => f.cariDurum === 'Belirsiz');

  const formatTutar = (tutar) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tutar);
  };

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR');
  };

  const toggleFirma = (firma) => {
    setExpandedFirma(prev => ({ ...prev, [firma]: !prev[firma] }));
  };

  const toggleFiltre = (filtre) => {
    if (filtre === 'Tümü') {
      if (aktifFiltreler.length === 3) {
        setAktifFiltreler([]);
      } else {
        setAktifFiltreler(['Cari Borç', 'Cari Olmayan Borç', 'Belirsiz']);
      }
    } else {
      setAktifFiltreler(prev => {
        if (prev.includes(filtre)) {
          return prev.filter(f => f !== filtre);
        } else {
          return [...prev, filtre];
        }
      });
    }
  };

  const tumSecimiAktif = aktifFiltreler.length === 3;

  const FirmaCard = ({ firma, data }) => {
    const isExpanded = expandedFirma[firma];
    const bakiyePositive = data.bakiye > 0;

    return (
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden bg-white shadow-sm">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleFirma(firma)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <div>
              <h3 className="font-semibold text-lg">{firma}</h3>
              <p className="text-sm text-gray-500">{data.cariDurum}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${bakiyePositive ? 'text-red-600' : 'text-green-600'}`}>
              {formatTutar(data.bakiye)}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
              {bakiyePositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              Bakiye
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            {/* Mutabakat */}
            {data.mutabakat.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign size={16} />
                  Mutabakat Kaydı
                </h4>
                {data.mutabakat.map((m, idx) => (
                  <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tarih: {formatTarih(m.Son_Mutabakat_Tarihi)}</span>
                      <span className="font-semibold text-blue-700">{formatTutar(m.Toplam_Mutabakat_Tutari)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Faturalar */}
            {data.faturalar.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Faturalar</h4>
                {data.faturalar.map((f) => (
                  <div key={f.Fatura_ID} className="bg-orange-50 border border-orange-200 rounded p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{f.Fatura_Numarasi}</div>
                        <div className="text-xs text-gray-600">{formatTarih(f.Fatura_Tarihi)}</div>
                      </div>
                      <span className="font-semibold text-orange-700">{formatTutar(f.Tutar)}</span>
                    </div>
                  </div>
                ))}
                <div className="text-right text-sm font-semibold text-gray-700 mt-2">
                  Toplam Fatura: {formatTutar(data.faturaToplam)}
                </div>
              </div>
            )}

            {/* Ödemeler */}
            {data.odemeler.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Ödemeler</h4>
                {data.odemeler.map((o, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded p-3 mb-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{formatTarih(o.Tarih)}</span>
                      <span className="font-semibold text-green-700">-{formatTutar(o.Tutar)}</span>
                    </div>
                  </div>
                ))}
                <div className="text-right text-sm font-semibold text-gray-700 mt-2">
                  Toplam Ödeme: {formatTutar(data.odemeToplam)}
                </div>
              </div>
            )}

            {/* Hesaplama Özeti */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mutabakat Tutarı:</span>
                  <span className="font-medium">{formatTutar(data.mutabakatToplam)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">+ Fatura Tutarı:</span>
                  <span className="font-medium">{formatTutar(data.faturaToplam)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">- Ödeme Tutarı:</span>
                  <span className="font-medium">{formatTutar(data.odemeToplam)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold">Bakiye:</span>
                  <span className={`font-bold ${data.bakiye > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatTutar(data.bakiye)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const KategoriBaslik = ({ baslik, toplam, adet, renk }) => (
    <div className={`${renk} border-l-4 pl-4 py-3 mb-4 rounded-r`}>
      <h2 className="text-xl font-bold">{baslik}</h2>
      <p className="text-sm opacity-90">{adet} Firma - Toplam Bakiye: {formatTutar(toplam)}</p>
    </div>
  );

  const toplamBakiye = (firmalar) => 
    firmalar.reduce((sum, [_, data]) => sum + data.bakiye, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Cari Borç Takip Sistemi</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={baslangicTarihi}
                onChange={(e) => setBaslangicTarihi(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtreler
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleFiltre('Tümü')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    tumSecimiAktif
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => toggleFiltre('Cari Borç')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    aktifFiltreler.includes('Cari Borç')
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cari Borçlar
                </button>
                <button
                  onClick={() => toggleFiltre('Cari Olmayan Borç')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    aktifFiltreler.includes('Cari Olmayan Borç')
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cari Olmayan Borçlar
                </button>
                <button
                  onClick={() => toggleFiltre('Belirsiz')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    aktifFiltreler.includes('Belirsiz')
                      ? 'bg-gray-500 text-white border-gray-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Belirsiz Durumlar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cari Borçlar */}
        {cariBorcFirmalar.length > 0 && aktifFiltreler.includes('Cari Borç') && (
          <div className="mb-8">
            <KategoriBaslik 
              baslik="Cari Borçlar" 
              toplam={toplamBakiye(cariBorcFirmalar)}
              adet={cariBorcFirmalar.length}
              renk="bg-red-50 border-red-500"
            />
            {cariBorcFirmalar.map(([firma, data]) => (
              <FirmaCard key={firma} firma={firma} data={data} />
            ))}
          </div>
        )}

        {/* Cari Olmayan Borçlar */}
        {cariOlmayanFirmalar.length > 0 && aktifFiltreler.includes('Cari Olmayan Borç') && (
          <div className="mb-8">
            <KategoriBaslik 
              baslik="Cari Olmayan Borçlar" 
              toplam={toplamBakiye(cariOlmayanFirmalar)}
              adet={cariOlmayanFirmalar.length}
              renk="bg-yellow-50 border-yellow-500"
            />
            {cariOlmayanFirmalar.map(([firma, data]) => (
              <FirmaCard key={firma} firma={firma} data={data} />
            ))}
          </div>
        )}

        {/* Belirsiz */}
        {belirsizFirmalar.length > 0 && aktifFiltreler.includes('Belirsiz') && (
          <div className="mb-8">
            <KategoriBaslik 
              baslik="Belirsiz Durumlar" 
              toplam={toplamBakiye(belirsizFirmalar)}
              adet={belirsizFirmalar.length}
              renk="bg-gray-50 border-gray-500"
            />
            {belirsizFirmalar.map(([firma, data]) => (
              <FirmaCard key={firma} firma={firma} data={data} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CariTakipEkrani;