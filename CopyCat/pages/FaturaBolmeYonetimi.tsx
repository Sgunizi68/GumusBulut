import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { API_BASE_URL } from '../constants';
import { useDataContext } from '../App';

const FaturaBolmeYonetimiPage = () => {
  const { kategoriList } = useDataContext();
  const [bolunmusFaturalar, setBolunmusFaturalar] = useState([]);
  const [editingDetay, setEditingDetay] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [donemFiltresi, setDonemFiltresi] = useState('');
  const [yeniFaturaNo, setYeniFaturaNo] = useState('');
  const [yeniFaturaModal, setYeniFaturaModal] = useState(false);
  const [yeniFaturaData, setYeniFaturaData] = useState({
    aliciUnvani: '',
    faturaTarihi: '',
    toplamTutar: 0,
    kategori: 'Bölünmüş Fatura',
    aciklama: '',
    donem: '',
    gunluk: false,
    ozel: false
  });

  useEffect(() => {
    const fetchBolunmusFaturalar = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bolunmus-faturalar/`);
        const data = await response.json();

        const groupedByAnaFatura = data.reduce((acc, fatura) => {
          const anaFaturaNo = fatura.Ana_Fatura;
          if (!acc[anaFaturaNo]) {
            acc[anaFaturaNo] = [];
          }
          acc[anaFaturaNo].push(fatura);
          return acc;
        }, {});

        const faturaPromises = Object.keys(groupedByAnaFatura).map(async (anaFaturaNo) => {
          const detaylar = groupedByAnaFatura[anaFaturaNo];
          const firstDetail = detaylar[0];

          // Fetch the main invoice to get the correct total amount
          try {
            const anaFaturaResponse = await fetch(`${API_BASE_URL}/e-faturalar/fatura-no/${anaFaturaNo}`);
            if (!anaFaturaResponse.ok) {
              throw new Error('Ana fatura bulunamadı');
            }
            const anaFaturaData = await anaFaturaResponse.json();

            return {
              id: anaFaturaNo,
              orijinalFaturaNo: anaFaturaNo,
              aliciUnvani: anaFaturaData.Alici_Unvani,
              faturaTarihi: anaFaturaData.Fatura_Tarihi,
              toplamTutar: parseFloat(anaFaturaData.Tutar),
              kategori: 'Bölünmüş Fatura',
              aciklama: anaFaturaData.Aciklama,
              donem: anaFaturaData.Donem ? anaFaturaData.Donem.toString() : '',
              gunluk: anaFaturaData.Gunluk_Harcama,
              detaylar: detaylar.map(d => ({
                id: d.Fatura_ID,
                faturaNo: d.Bolunmus_Fatura,
                tutar: parseFloat(d.Tutar),
                kategori: d.Kategori_Adi || 'Kategorisiz',
                ozel: d.Ozel,
                donem: d.Donem ? d.Donem.toString() : ''
              })),
              acik: false,
            };
          } catch (error) {
            console.warn(`Ana fatura alınamadı: ${anaFaturaNo}. Detaylar toplamı kullanılacak.`, error);
            const totalFromDetails = detaylar.reduce((sum, d) => sum + parseFloat(d.Tutar), 0);
            return {
              id: anaFaturaNo,
              orijinalFaturaNo: anaFaturaNo,
              aliciUnvani: firstDetail.Alici_Unvani,
              faturaTarihi: firstDetail.Fatura_Tarihi,
              toplamTutar: totalFromDetails,
              kategori: 'Bölünmüş Fatura',
              aciklama: firstDetail.Aciklama,
              donem: firstDetail.Donem.toString(),
              gunluk: firstDetail.Gunluk_Harcama,
              detaylar: detaylar.map(d => ({
                id: d.Fatura_ID,
                faturaNo: d.Bolunmus_Fatura,
                tutar: parseFloat(d.Tutar),
                kategori: d.Kategori_Adi || 'Kategorisiz',
                ozel: d.Ozel,
                donem: d.Donem.toString()
              })),
              acik: true,
            };
          }
        });

        const resolvedFaturalar = await Promise.all(faturaPromises);
        setBolunmusFaturalar(resolvedFaturalar);

      } catch (error) {
        console.error('Bölünmüş faturalar alınırken hata oluştu:', error);
      }
    };

    fetchBolunmusFaturalar();
  }, []);

  // Dönem formatını dönüştürme fonksiyonu
  const donemFormatla = (donem) => {
    if (!donem || donem.length !== 4) return donem;
    const yil = '20' + donem.substring(0, 2);
    const ay = parseInt(donem.substring(2, 4));
    const ayAdlari = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${donem} - ${ayAdlari[ay - 1]} ${yil}`;
  };

  // Benzersiz dönemleri al
  const benzersizDonemler = [...new Set(bolunmusFaturalar.map(f => f.donem))].sort();

  // Filtrelenmiş faturalar
  const filtrelenmis = bolunmusFaturalar.filter(fatura => 
    !donemFiltresi || fatura.donem === donemFiltresi
  );

  const faturaAcKapat = (faturaId) => {
    setBolunmusFaturalar(bolunmusFaturalar.map(fatura =>
      fatura.id === faturaId
        ? { ...fatura, acik: !fatura.acik }
        : fatura
    ));
  };

  const detayTutarToplami = (detaylar) => {
    return detaylar.reduce((toplam, detay) => toplam + (parseFloat(detay.tutar) || 0), 0);
  };

  const yeniDetayEkle = (faturaId) => {
    setBolunmusFaturalar(bolunmusFaturalar.map(fatura => {
      if (fatura.id === faturaId) {
        const maxSiraNo = fatura.detaylar.reduce((max, detay) => {
          const match = detay.faturaNo.match(/-\d+$/);
          if (match) {
            return Math.max(max, parseInt(match[0].substring(1)));
          }
          return max;
        }, 0);
        const yeniSiraNo = maxSiraNo + 1;
        const mevcutToplam = detayTutarToplami(fatura.detaylar);
        const kalanTutar = fatura.toplamTutar - mevcutToplam;
        
        const yeniDetay = {
          id: Date.now(), // Temporary ID
          isNew: true, // Flag for new item
          faturaNo: `${fatura.orijinalFaturaNo}-${yeniSiraNo}`,
          tutar: Math.min(1000, kalanTutar > 0 ? kalanTutar : 0),
          kategori: 'Yeni Detay',
          ozel: false,
          donem: fatura.donem
        };

        return {
          ...fatura,
          detaylar: [...fatura.detaylar, yeniDetay]
        };
      }
      return fatura;
    }));
  };

  const editDetayKaydet = async (faturaId, detayId) => {
    const fatura = bolunmusFaturalar.find(f => f.id === faturaId);
    if (!fatura) return;

    const detay = fatura.detaylar.find(d => d.id === detayId);
    if (!detay) return;

    const yeniTutar = parseFloat(tempValues.tutar) || 0;
    const digerDetaylarToplami = fatura.detaylar
      .filter(d => d.id !== detayId)
      .reduce((toplam, d) => toplam + d.tutar, 0);

    if (digerDetaylarToplami + yeniTutar > fatura.toplamTutar) {
      alert(`Toplam tutar ${fatura.toplamTutar.toLocaleString('tr-TR')}₺'yi aşamaz!`);
      return;
    }

    const kategori = kategoriList.find(k => k.Kategori_Adi === tempValues.kategori);
    const kategoriId = kategori ? kategori.Kategori_ID : null;

    const payload = {
      Fatura_Tarihi: fatura.faturaTarihi,
      Fatura_Numarasi: detay.faturaNo,
      Alici_Unvani: fatura.aliciUnvani,
      Tutar: yeniTutar,
      Kategori_ID: kategoriId,
      Aciklama: fatura.aciklama,
      Donem: tempValues.donem,
      Ozel: tempValues.ozel,
      Gunluk_Harcama: fatura.gunluk,
      Giden_Fatura: false, // Assuming this is the default
      Sube_ID: 1 // Assuming a default Sube_ID, you might need to get this from context
    };

    try {
      console.log('Sending payload:', payload); // Log the payload

      let response;
      if (detay.isNew) {
        response = await fetch(`${API_BASE_URL}/e-fatura/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/e-faturalar/${detayId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No error message from server' }));
        console.error('API Error:', response.status, response.statusText, errorData); // Log API error details
        console.log('Detailed validation errors:', errorData.detail); // Explicitly log the detail array
        throw new Error(`Fatura kaydedilirken bir hata oluştu: ${JSON.stringify(errorData.detail, null, 2) || errorData.message || response.statusText}`);
      }

      const savedDetay = await response.json();

      setBolunmusFaturalar(bolunmusFaturalar.map(f => {
        if (f.id === faturaId) {
          const guncelDetaylar = f.detaylar.map(d => {
            if (d.id === detayId) {
              return {
                ...d,
                id: savedDetay.Fatura_ID, // Update with the real ID from the backend
                isNew: false, // No longer a new item
                tutar: yeniTutar,
                kategori: tempValues.kategori,
                ozel: tempValues.ozel,
                donem: tempValues.donem
              };
            }
            return d;
          });
          return { ...f, detaylar: guncelDetaylar };
        }
        return f;
      }));

      setEditingDetay(null);
      setTempValues({});

    } catch (error) {
      alert(error.message);
    }
  };

  const editDetayIptal = () => {
    setEditingDetay(null);
    setTempValues({});
  };

  const editDetayBaslat = (detay) => {
    setEditingDetay(detay.id);
    setTempValues({
      tutar: detay.tutar,
      kategori: detay.kategori,
      ozel: detay.ozel,
      donem: detay.donem,
    });
  };

  const detaySil = async (faturaId, detayId) => {
    if (window.confirm('Bu detayı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/e-faturalar/${detayId}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error('Detay silinirken bir hata oluştu.');
        }
  
        setBolunmusFaturalar(bolunmusFaturalar.map(f => {
          if (f.id === faturaId) {
            const guncelDetaylar = f.detaylar.filter(d => d.id !== detayId);
            return { ...f, detaylar: guncelDetaylar };
          }
          return f;
        }));
  
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const yeniFaturaBul = async () => {
    if (!yeniFaturaNo.trim()) {
      alert('Lütfen bir fatura numarası giriniz!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/e-faturalar/fatura-no/${yeniFaturaNo}`);
      if (!response.ok) {
        throw new Error('Fatura bulunamadı');
      }
      const fatura = await response.json();

      setYeniFaturaData({
        orijinalFaturaNo: fatura.Fatura_Numarasi,
        aliciUnvani: fatura.Alici_Unvani,
        faturaTarihi: fatura.Fatura_Tarihi,
        toplamTutar: parseFloat(fatura.Tutar),
        kategori: fatura.Kategori_Adi || 'Kategorisiz',
        aciklama: fatura.Aciklama,
        donem: fatura.Donem.toString(),
        gunluk: fatura.Gunluk_Harcama,
        ozel: fatura.Ozel,
        originalFaturaId: fatura.Fatura_ID
      });
      setYeniFaturaModal(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const yeniFaturaKaydet = async () => {
    const yeniFatura = {
      id: Date.now(), // Temporary ID for the parent group
      ...yeniFaturaData,
      kategori: 'Bölünmüş Fatura',
      detaylar: [
        {
          id: Date.now() + 1, // Temporary ID
          faturaNo: `${yeniFaturaData.orijinalFaturaNo}-1`,
          tutar: yeniFaturaData.toplamTutar / 2,
          kategori: yeniFaturaData.kategori,
          ozel: false,
          donem: yeniFaturaData.donem,
          isNew: true // Mark as new
        },
        {
          id: Date.now() + 2, // Temporary ID
          faturaNo: `${yeniFaturaData.orijinalFaturaNo}-2`,
          tutar: yeniFaturaData.toplamTutar / 2,
          kategori: yeniFaturaData.kategori,
          ozel: false,
          donem: yeniFaturaData.donem,
          isNew: true // Mark as new
        }
      ],
      acik: true
    };

    const savedDetaylar = [];
    for (const detay of yeniFatura.detaylar) {
      const payload = {
        Fatura_Tarihi: yeniFaturaData.faturaTarihi,
        Fatura_Numarasi: detay.faturaNo,
        Alici_Unvani: yeniFaturaData.aliciUnvani,
        Tutar: detay.tutar,
        Kategori_ID: kategoriList.find(k => k.Kategori_Adi === detay.kategori)?.Kategori_ID || null,
        Aciklama: yeniFaturaData.aciklama,
        Donem: detay.donem,
        Ozel: detay.ozel,
        Gunluk_Harcama: yeniFaturaData.gunluk,
        Giden_Fatura: false,
        Sube_ID: 1
      };

      try {
        const response = await fetch(`${API_BASE_URL}/e-fatura/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'No error message from server' }));
          console.error('Yeni detay kaydedilirken API Hatası:', response.status, response.statusText, errorData);
          alert(`Yeni detay kaydedilemedi: ${JSON.stringify(errorData.detail, null, 2) || errorData.message || response.statusText}`);
          continue;
        }

        const savedDetay = await response.json();
        savedDetaylar.push({
          ...detay,
          id: savedDetay.Fatura_ID,
          isNew: false
        });

      } catch (error) {
        console.error('Yeni detay kaydetme hatası:', error);
        alert(`Yeni detay kaydedilemedi: ${error.message}`);
        continue;
      }
    }

    // Update the frontend state with the saved details
    setBolunmusFaturalar(prevFaturalar => [
      ...prevFaturalar,
      { ...yeniFatura, detaylar: savedDetaylar }
    ]);

    // After saving split details, update the original invoice's Kategori_ID
    if (yeniFaturaData.originalFaturaId) {
      const originalInvoiceUpdatePayload = {
        Kategori_ID: 88, // 'Bölünmüş Fatura'
        Fatura_Tarihi: yeniFaturaData.faturaTarihi,
        Fatura_Numarasi: yeniFaturaData.orijinalFaturaNo,
        Alici_Unvani: yeniFaturaData.aliciUnvani,
        Tutar: yeniFaturaData.toplamTutar,
        Aciklama: yeniFaturaData.aciklama,
        Donem: yeniFaturaData.donem,
        Ozel: yeniFaturaData.ozel,
        Gunluk_Harcama: yeniFaturaData.gunluk,
        Giden_Fatura: false, // Assuming default
        Sube_ID: 1 // Assuming default
      };

      try {
        const response = await fetch(`${API_BASE_URL}/e-faturalar/${yeniFaturaData.originalFaturaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(originalInvoiceUpdatePayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'No error message from server' }));
          console.error('Ana fatura güncellenirken API Hatası:', response.status, response.statusText, errorData);
          alert(`Ana fatura güncellenemedi: ${JSON.stringify(errorData.detail, null, 2) || errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error('Ana fatura güncelleme hatası:', error);
        alert(`Ana fatura güncellenemedi: ${error.message}`);
      }
    }

    setYeniFaturaModal(false);
    setYeniFaturaNo('');
    setYeniFaturaData({
      aliciUnvani: '',
      faturaTarihi: '',
      toplamTutar: 0,
      kategori: 'Bölünmüş Fatura',
      aciklama: '',
      donem: '',
      gunluk: false,
      ozel: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fatura Bölme Yönetimi</h1>
          
          {/* Filtreler ve Yeni Fatura Bölme */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Dönem:</label>
              <select
                value={donemFiltresi}
                onChange={(e) => setDonemFiltresi(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Dönemler</option>
                {benzersizDonemler.map(donem => (
                  <option key={donem} value={donem}>
                    {donemFormatla(donem)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setYeniFaturaModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              <Icons.Add className="w-4 h-4 mr-2" />
              Yeni Fatura Bölme
            </button>
          </div>
        </div>

        {/* Yeni Fatura Bölme Modal */}
        {yeniFaturaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
              <h3 className="text-lg font-semibold mb-4">Yeni Fatura Bölme</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura Numarası
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={yeniFaturaNo}
                      onChange={(e) => setYeniFaturaNo(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Fatura numarasını giriniz"
                    />
                    <button
                      onClick={yeniFaturaBul}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Icons.Dashboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {yeniFaturaData.aliciUnvani && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Bulunan Fatura:</h4>
                    <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                      <p><strong>Alıcı:</strong> {yeniFaturaData.aliciUnvani}</p>
                      <p><strong>Tarih:</strong> {yeniFaturaData.faturaTarihi}</p>
                      <p><strong>Tutar:</strong> {yeniFaturaData.toplamTutar.toLocaleString('tr-TR')}₺</p>
                      <p><strong>Açıklama:</strong> {yeniFaturaData.aciklama}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={yeniFaturaKaydet}
                  disabled={!yeniFaturaData.aliciUnvani}
                  className={`flex-1 py-2 px-4 rounded-md font-medium ${
                    yeniFaturaData.aliciUnvani
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Faturayı Böl
                </button>
                <button
                  onClick={() => setYeniFaturaModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {filtrelenmis.map((fatura) => {
            const detayToplami = detayTutarToplami(fatura.detaylar);
            const tutarUyumlu = Math.abs(detayToplami - fatura.toplamTutar) < 0.01;
            
            return (
              <div key={fatura.id} className="bg-white rounded-lg shadow-md">
                <div 
                  className={`px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    !tutarUyumlu ? 'bg-red-50 border-red-200' : ''
                  }`}
                  onClick={() => faturaAcKapat(fatura.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {fatura.acik ? (
                        <Icons.ChevronDown className="w-5 h-5 text-gray-400 transform rotate-180" />
                      ) : (
                        <Icons.ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {fatura.orijinalFaturaNo} - {fatura.aliciUnvani}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {fatura.faturaTarihi} | {donemFormatla(fatura.donem)} | {fatura.aciklama}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={fatura.gunluk}
                              readOnly
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-1 text-sm text-gray-600">Günlük</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">Toplam Tutar</p>
                          <p className="text-lg font-bold text-gray-900">
                            {fatura.toplamTutar.toLocaleString('tr-TR')}₺
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Detay Toplamı</p>
                          <p className={`text-lg font-bold ${
                            tutarUyumlu ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {detayToplami.toLocaleString('tr-TR')}₺
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Detay Sayısı</p>
                          <p className="text-lg font-bold text-blue-600">
                            {fatura.detaylar.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!tutarUyumlu && (
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      ⚠️ Detay toplamı ana fatura tutarı ile eşleşmiyor! 
                      Fark: {(fatura.toplamTutar - detayToplami).toLocaleString('tr-TR')}₺
                    </div>
                  )}
                </div>

                {fatura.acik && (
                  <div className="px-6 py-4">


                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Bölünmüş Fatura Detayları</h4>
                        <button
                          onClick={() => yeniDetayEkle(fatura.id)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          <Icons.Add className="w-4 h-4 mr-1" />
                          Yeni Detay Ekle
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fatura No</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alıcı Ünvanı</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fatura Tarihi</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dönem</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Günlük</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Özel</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {fatura.detaylar.map((detay) => (
                              <tr key={detay.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-mono text-blue-600">{detay.faturaNo}</td>
                                <td className="px-4 py-2">{fatura.aliciUnvani}</td>
                                <td className="px-4 py-2">{fatura.faturaTarihi}</td>
                                <td className="px-4 py-2">
                                  {editingDetay === detay.id ? (
                                    <input
                                      type="number"
                                      value={tempValues.tutar || ''}
                                      onChange={(e) => setTempValues({...tempValues, tutar: parseFloat(e.target.value) || 0})}
                                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                      step="0.01"
                                    />
                                  ) : (
                                    `${detay.tutar.toLocaleString('tr-TR')}₺`
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {editingDetay === detay.id ? (
                                    <select
                                      value={tempValues.kategori || ''}
                                      onChange={(e) => setTempValues({...tempValues, kategori: e.target.value})}
                                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      <option value="">Kategori Seçin</option>
                                      {kategoriList.map(kat => (
                                        <option key={kat.Kategori_ID} value={kat.Kategori_Adi}>{kat.Kategori_Adi}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    detay.kategori
                                  )}
                                </td>
                                <td className="px-4 py-2">{fatura.aciklama}</td>
                                <td className="px-4 py-2">
                                  {editingDetay === detay.id ? (
                                     <select
                                      value={tempValues.donem || ''}
                                      onChange={(e) => setTempValues({...tempValues, donem: e.target.value})}
                                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                      {benzersizDonemler.map(donem => (
                                        <option key={donem} value={donem}>{donemFormatla(donem)}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    donemFormatla(detay.donem)
                                  )}
                                  </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={fatura.gunluk}
                                    readOnly
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  {editingDetay === detay.id ? (
                                    <input
                                      type="checkbox"
                                      checked={tempValues.ozel || false}
                                      onChange={(e) => setTempValues({...tempValues, ozel: e.target.checked})}
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={detay.ozel}
                                      readOnly
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                    />
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex space-x-1">
                                    {editingDetay === detay.id ? (
                                      <>
                                        <button
                                          onClick={() => editDetayKaydet(fatura.id, detay.id)}
                                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                                        >
                                          <Icons.CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={editDetayIptal}
                                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                          <Icons.Close className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => editDetayBaslat(detay)}
                                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        >
                                          <Icons.Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => detaySil(fatura.id, detay.id)}
                                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          disabled={fatura.detaylar.length <= 2}
                                        >
                                          <Icons.Delete className={`w-4 h-4 ${fatura.detaylar.length <= 2 ? 'text-gray-400' : ''}`} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr className="font-medium">
                              <td colSpan="3" className="px-4 py-2 text-right">TOPLAM:</td>
                              <td className={`px-4 py-2 ${tutarUyumlu ? 'text-green-600' : 'text-red-600'}`}>
                                {detayToplami.toLocaleString('tr-TR')}₺
                              </td>
                              <td colSpan="5" className="px-4 py-2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {filtrelenmis.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              {donemFiltresi ? 
                `Seçili dönem (${donemFormatla(donemFiltresi)}) için bölünmüş fatura bulunmuyor.` :
                'Bölünmüş fatura bulunmuyor.'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaturaBolmeYonetimiPage;
