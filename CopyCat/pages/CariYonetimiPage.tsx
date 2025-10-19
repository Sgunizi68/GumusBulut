import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';

export default function CariYonetim() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cariChecked, setCariChecked] = useState(false);
  
  // Örnek veri
  const [cariList] = useState([
    {
      Cari_ID: 1,
      Alici_Unvani: 'ABC Teknoloji A.Ş.',
      e_Fatura_Kategori_ID: 1,
      Kategori_Adi: 'Özel Sektör',
      Referans_ID: 101,
      Referans_Detay: '#101 (Transfer İşlemleri Alıcı : G2M Dağıtım - G2M Ödemesi)',
      Cari: 1,
      Aciklama: 'Yazılım hizmetleri müşterisi',
      Kayit_Tarihi: '2024-10-15 14:30:00',
      Aktif_Pasif: 1
    },
    {
      Cari_ID: 2,
      Alici_Unvani: 'XYZ İnşaat Ltd. Şti.',
      e_Fatura_Kategori_ID: 2,
      Kategori_Adi: 'KOBİ',
      Referans_ID: 102,
      Referans_Detay: '#102 (Havale İşlemleri - Tedarikçi Ödemesi)',
      Cari: 1,
      Aciklama: 'İnşaat malzemeleri tedarikçisi',
      Kayit_Tarihi: '2024-09-20 10:15:00',
      Aktif_Pasif: 1
    },
    {
      Cari_ID: 3,
      Alici_Unvani: 'Güneş Enerji Sistemleri',
      e_Fatura_Kategori_ID: 1,
      Kategori_Adi: 'Özel Sektör',
      Referans_ID: null,
      Referans_Detay: null,
      Cari: 0,
      Aciklama: 'Potansiyel müşteri',
      Kayit_Tarihi: '2024-10-01 09:00:00',
      Aktif_Pasif: 0
    }
  ]);

  const filteredList = cariList.filter(item => {
    const matchesSearch = item.Alici_Unvani.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Cari Yönetimi</h1>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ünvan ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span>Dışa Aktar</span>
            </button>
            
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Cari</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">e-Fatura Ünvan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">e-Fatura Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ödeme e-Referans</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cari</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((cari) => (
                  <tr key={cari.Cari_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">#{cari.Cari_ID}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">{cari.Alici_Unvani}</div>
                      {cari.Aciklama && (
                        <div className="text-xs text-slate-500 mt-1">{cari.Aciklama}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {cari.Kategori_Adi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {cari.Referans_Detay || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cari.Cari === 1 ? (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Evet
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          Hayır
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cari.Aktif_Pasif === 1 ? (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Görüntüle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {filteredList.length} kayıt gösteriliyor
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Önceki
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Yeni Cari Ekle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alıcı Ünvanı *</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-Fatura Kategorisi *</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Seçiniz...</option>
                  <option>Özel Sektör</option>
                  <option>KOBİ</option>
                  <option>Kamu</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="cari" 
                  checked={cariChecked}
                  onChange={(e) => setCariChecked(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                />
                <label htmlFor="cari" className="text-sm font-medium text-slate-700">Cari Hesap</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ödeme e-Referans {cariChecked && <span className="text-red-600">*</span>}
                </label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={cariChecked}
                >
                  <option value="">Seçiniz...</option>
                  <option value="101">#101 (Transfer İşlemleri Alıcı : G2M Dağıtım - G2M Ödemesi)</option>
                  <option value="102">#102 (Havale İşlemleri - Tedarikçi Ödemesi)</option>
                  <option value="103">#103 (Kredi Kartı Ödemesi - Peşin)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="aktif" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <label htmlFor="aktif" className="text-sm font-medium text-slate-700">Aktif</label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}