import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Eye, X } from 'lucide-react';

export default function MutabakatYonetim() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMutabakat, setSelectedMutabakat] = useState(null);
  
  // Örnek veri
  const [mutabakatList, setMutabakatList] = useState([
    {
      Mutabakat_ID: 1,
      Cari_ID: 1,
      Cari_Unvani: 'ABC Teknoloji A.Ş.',
      Mutabakat_Tarihi: '2024-10-15',
      Tutar: 125000.00,
      Aciklama: 'Ekim ayı mutabakat tutarı',
      Sube_ID: 1,
      Sube_Adi: 'Merkez Şube',
      Kayit_Tarihi: '2024-10-15 14:30:00'
    },
    {
      Mutabakat_ID: 2,
      Cari_ID: 2,
      Cari_Unvani: 'XYZ İnşaat Ltd. Şti.',
      Mutabakat_Tarihi: '2024-09-20',
      Tutar: 85000.00,
      Aciklama: 'Malzeme tedarik mutabakatı',
      Sube_ID: 2,
      Sube_Adi: 'Anadolu Şube',
      Kayit_Tarihi: '2024-09-20 10:15:00'
    },
    {
      Mutabakat_ID: 3,
      Cari_ID: 1,
      Cari_Unvani: 'ABC Teknoloji A.Ş.',
      Mutabakat_Tarihi: '2024-09-01',
      Tutar: 95000.00,
      Aciklama: 'Eylül ayı mutabakat tutarı',
      Sube_ID: 1,
      Sube_Adi: 'Merkez Şube',
      Kayit_Tarihi: '2024-09-01 09:00:00'
    }
  ]);

  const [cariList] = useState([
    { Cari_ID: 1, Alici_Unvani: 'ABC Teknoloji A.Ş.' },
    { Cari_ID: 2, Alici_Unvani: 'XYZ İnşaat Ltd. Şti.' },
    { Cari_ID: 3, Alici_Unvani: 'Güneş Enerji Sistemleri' }
  ]);

  const [subeList] = useState([
    { Sube_ID: 1, Sube_Adi: 'Merkez Şube' },
    { Sube_ID: 2, Sube_Adi: 'Anadolu Şube' },
    { Sube_ID: 3, Sube_Adi: 'Avrupa Şube' }
  ]);

  const filteredList = mutabakatList.filter(item => {
    const matchesSearch = item.Cari_Unvani.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.Aciklama?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (mutabakat) => {
    setSelectedMutabakat(mutabakat);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu mutabakat kaydını silmek istediğinizden emin misiniz?')) {
      setMutabakatList(mutabakatList.filter(m => m.Mutabakat_ID !== id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedMutabakat(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Cari Mutabakat Yönetimi</h1>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari veya açıklama ara..."
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
              <span>Yeni Mutabakat</span>
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cari Ünvan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mutabakat Tarihi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Şube</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((mutabakat) => (
                  <tr key={mutabakat.Mutabakat_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">#{mutabakat.Mutabakat_ID}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">{mutabakat.Cari_Unvani}</div>
                      <div className="text-xs text-slate-500 mt-1">Cari ID: {mutabakat.Cari_ID}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(mutabakat.Mutabakat_Tarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-green-700">
                        {parseFloat(mutabakat.Tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {mutabakat.Sube_Adi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {mutabakat.Aciklama || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(mutabakat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(mutabakat.Mutabakat_ID)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Sil"
                        >
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
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {editMode ? 'Mutabakat Düzenle' : 'Yeni Mutabakat Ekle'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cari Firma *
                </label>
                <select 
                  defaultValue={selectedMutabakat?.Cari_ID || ''}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {cariList.map(cari => (
                    <option key={cari.Cari_ID} value={cari.Cari_ID}>
                      {cari.Alici_Unvani}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mutabakat Tarihi *
                </label>
                <input 
                  type="date" 
                  defaultValue={selectedMutabakat?.Mutabakat_Tarihi || ''}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tutar (₺) *
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedMutabakat?.Tutar || ''}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Şube *
                </label>
                <select 
                  defaultValue={selectedMutabakat?.Sube_ID || ''}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {subeList.map(sube => (
                    <option key={sube.Sube_ID} value={sube.Sube_ID}>
                      {sube.Sube_Adi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea 
                  rows="4" 
                  defaultValue={selectedMutabakat?.Aciklama || ''}
                  placeholder="Mutabakat ile ilgili notlar..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {editMode ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}