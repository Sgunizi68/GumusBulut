import React, { useState } from 'react';
import { Icons } from '../constants';

const FaturaBolmeYonetimiPage = () => {
  const [bolunmusFaturalar, setBolunmusFaturalar] = useState([
    {
      id: 1,
      orijinalFaturaNo: 'T032025000010487',
      aliciUnvani: 'ABC Şirketi Ltd. Şti.',
      faturaTarihi: '2024-03-15',
      toplamTutar: 15000,
      kategori: 'Bölünmüş Fatura',
      aciklama: 'Yazılım Geliştirme Hizmeti',
      donem: '2403',
      gunluk: true,
      detaylar: [
        {
          id: 1,
          faturaNo: 'T032025000010487-1',
          tutar: 8000,
          kategori: 'Yazılım Geliştirme',
          ozel: false
        },
        {
          id: 2,
          faturaNo: 'T032025000010487-2',
          tutar: 7000,
          kategori: 'Yazılım Geliştirme',
          ozel: true
        }
      ],
      acik: true
    },
    {
      id: 2,
      orijinalFaturaNo: 'T032025000010488',
      aliciUnvani: 'XYZ Teknoloji A.Ş.',
      faturaTarihi: '2024-03-16',
      toplamTutar: 25000,
      kategori: 'Bölünmüş Fatura',
      aciklama: 'Danışmanlık Hizmeti',
      donem: '2403',
      gunluk: false,
      detaylar: [
        {
          id: 3,
          faturaNo: 'T032025000010488-1',
          tutar: 12000,
          kategori: 'Danışmanlık',
          ozel: true
        },
        {
          id: 4,
          faturaNo: 'T032025000010488-2',
          tutar: 8000,
          kategori: 'Danışmanlık',
          ozel: false
        },
        {
          id: 5,
          faturaNo: 'T032025000010488-3',
          tutar: 5000,
          kategori: 'Danışmanlık',
          ozel: true
        }
      ],
      acik: false
    },
    {
      id: 3,
      orijinalFaturaNo: 'T032025000010489',
      aliciUnvani: 'DEF Holding A.Ş.',
      faturaTarihi: '2024-02-20',
      toplamTutar: 18000,
      kategori: 'Bölünmüş Fatura',
      aciklama: 'Eğitim Hizmeti',
      donem: '2402',
      gunluk: true,
      detaylar: [
        {
          id: 6,
          faturaNo: 'T032025000010489-1',
          tutar: 10000,
          kategori: 'Eğitim',
          ozel: true
        },
        {
          id: 7,
          faturaNo: 'T032025000010489-2',
          tutar: 8000,
          kategori: 'Eğitim',
          ozel: false
        }
      ],
      acik: false
    }
  ]);

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
    gunluk: '',
    ozel: false
  });

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
    return detaylar.reduce((toplam, detay) => toplam + detay.tutar, 0);
  };

  const yeniDetayEkle = (faturaId) => {
    setBolunmusFaturalar(bolunmusFaturalar.map(fatura => {
      if (fatura.id === faturaId) {
        const yeniSiraNo = fatura.detaylar.length + 1;
        const mevcutToplam = detayTutarToplami(fatura.detaylar);
        const kalanTutar = fatura.toplamTutar - mevcutToplam;
        
        const yeniDetay = {
          id: Date.now() + Math.random(),
          faturaNo: `${fatura.orijinalFaturaNo}-${yeniSiraNo}`,
          tutar: Math.min(1000, kalanTutar > 0 ? kalanTutar : 0),
          kategori: fatura.kategori,
          ozel: false
        };

        return {
          ...fatura,
          detaylar: [...fatura.detaylar, yeniDetay]
        };
      }
      return fatura;
    }));
  };

  const detaySil = (faturaId, detayId) => {
    setBolunmusFaturalar(bolunmusFaturalar.map(fatura => {
      if (fatura.id === faturaId) {
        const yeniDetaylar = fatura.detaylar.filter(detay => detay.id !== detayId);
        
        if (yeniDetaylar.length < 2) {
          alert('En az 2 detay satırı bulunmalıdır!');
          return fatura;
        }

        const duzenliDetaylar = yeniDetaylar.map((detay, index) => ({
          ...detay,
          faturaNo: `${fatura.orijinalFaturaNo}-${index + 1}`
        }));

        return {
          ...fatura,
          detaylar: duzenliDetaylar
        };
      }
      return fatura;
    }));
  };

  const editDetayBaslat = (detay) => {
    setEditingDetay(detay.id);
    setTempValues({
      tutar: detay.tutar,
      kategori: detay.kategori,
      ozel: detay.ozel
    });
  };

  const editDetayKaydet = (faturaId, detayId) => {
    setBolunmusFaturalar(bolunmusFaturalar.map(fatura => {
      if (fatura.id === faturaId) {
        const guncelDetaylar = fatura.detaylar.map(detay => {
          if (detay.id === detayId) {
            const yeniTutar = parseFloat(tempValues.tutar) || 0;
            
            const digerDetaylarToplami = fatura.detaylar
              .filter(d => d.id !== detayId)
              .reduce((toplam, d) => toplam + d.tutar, 0);
            
            if (digerDetaylarToplami + yeniTutar > fatura.toplamTutar) {
              alert(`Toplam tutar ${fatura.toplamTutar.toLocaleString('tr-TR')}₺'yi aşamaz!`);
              return detay;
            }
            
            return {
              ...detay,
              tutar: yeniTutar,
              kategori: tempValues.kategori,
              ozel: tempValues.ozel
            };
          }
          return detay;
        });
        
        return { ...fatura, detaylar: guncelDetaylar };
      }
      return fatura;
    }));
    
    setEditingDetay(null);
    setTempValues({});
  };

  const editDetayIptal = () => {
    setEditingDetay(null);
    setTempValues({});
  };

  const yeniFaturaBul = () => {
    if (!yeniFaturaNo.trim()) {
      alert('Lütfen bir fatura numarası giriniz!');
      return;
    }

    // Simüle edilmiş fatura bulma
    const bulunanFatura = {
      orijinalFaturaNo: yeniFaturaNo,
      aliciUnvani: 'Bulunan Şirket A.Ş.',
      faturaTarihi: '2024-03-20',
      toplamTutar: 20000,
      kategori: 'Normal Fatura',
      aciklama: 'Bulunan Fatura Açıklaması',
      donem: '2403',
      gunluk: false
    };

    setYeniFaturaData(bulunanFatura);
    setYeniFaturaModal(true);
  };

  const yeniFaturaKaydet = () => {
    const yeniFatura = {
      id: Date.now(),
      ...yeniFaturaData,
      kategori: 'Bölünmüş Fatura',
      detaylar: [
        {
          id: Date.now() + 1,
          faturaNo: `${yeniFaturaData.orijinalFaturaNo}-1`,
          tutar: yeniFaturaData.toplamTutar / 2,
          kategori: yeniFaturaData.kategori,
          ozel: false
        },
        {
          id: Date.now() + 2,
          faturaNo: `${yeniFaturaData.orijinalFaturaNo}-2`,
          tutar: yeniFaturaData.toplamTutar / 2,
          kategori: yeniFaturaData.kategori,
          ozel: false
        }
      ],
      acik: true
    };

    setBolunmusFaturalar([...bolunmusFaturalar, yeniFatura]);
    setYeniFaturaModal(false);
    setYeniFaturaNo('');
    setYeniFaturaData({
      aliciUnvani: '',
      faturaTarihi: '',
      toplamTutar: 0,
      kategori: 'Bölünmüş Fatura',
      aciklama: '',
      donem: '',
      gunluk: false
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
            const tutarUyumlu = detayToplami === fatura.toplamTutar;
            
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
                    <div className="mb-4 grid grid-cols-5 gap-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded">
                      <div>Fatura No</div>
                      <div>Alıcı Ünvanı</div>
                      <div>Fatura Tarihi</div>
                      <div>Dönem</div>
                      <div>Günlük</div>
                    </div>
                    <div className="mb-4 grid grid-cols-5 gap-4 text-sm px-4 py-2">
                      <div className="font-medium text-gray-400 line-through">{fatura.orijinalFaturaNo}</div>
                      <div>{fatura.aliciUnvani}</div>
                      <div>{fatura.faturaTarihi}</div>
                      <div>{donemFormatla(fatura.donem)}</div>
                      <div>
                        <input
                          type="checkbox"
                          checked={fatura.gunluk}
                          readOnly
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                      </div>
                    </div>

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
                                      <option value="Bölünmüş Fatura">Bölünmüş Fatura</option>
                                      <option value="Yazılım Geliştirme">Yazılım Geliştirme</option>
                                      <option value="Danışmanlık">Danışmanlık</option>
                                      <option value="Eğitim">Eğitim</option>
                                      <option value="Hizmet">Hizmet</option>
                                      <option value="Malzeme">Malzeme</option>
                                    </select>
                                  ) : (
                                    detay.kategori
                                  )}
                                </td>
                                <td className="px-4 py-2">{fatura.aciklama}</td>
                                <td className="px-4 py-2">{donemFormatla(fatura.donem)}</td>
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
