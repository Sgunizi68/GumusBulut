import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';
import { useAppContext, fetchData } from '../App';
import { Cari, CariFormData, Kategori, OdemeReferans } from '../types';
import { API_BASE_URL } from '../constants';

export default function CariYonetim() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCari, setEditingCari] = useState<Cari | null>(null);
  const [cariList, setCariList] = useState<Cari[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [odemeReferansList, setOdemeReferansList] = useState<OdemeReferans[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [cariler, kategoriler, odemeReferanslar] = await Promise.all([
        fetchData<Cari[]>(`${API_BASE_URL}/cari/`),
        fetchData<Kategori[]>(`${API_BASE_URL}/kategoriler/`),
        fetchData<OdemeReferans[]>(`${API_BASE_URL}/Odeme_Referans/`),
      ]);
      if (cariler) setCariList(cariler);
      if (kategoriler) setKategoriList(kategoriler);
      if (odemeReferanslar) setOdemeReferansList(odemeReferanslar);
    };
    loadData();
  }, []);

  const addCari = async (data: CariFormData) => {
    const newCari = await fetchData<Cari>(`${API_BASE_URL}/cari/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (newCari) {
      setCariList(prev => [...prev, newCari]);
      return { success: true, data: newCari };
    }
    return { success: false, message: "Cari eklenirken bir hata oluştu." };
  };

  const updateCari = async (cariId: number, data: CariFormData) => {
    const updatedCari = await fetchData<Cari>(`${API_BASE_URL}/cari/${cariId}`,
     {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (updatedCari) {
      setCariList(prev =>
        prev.map(c => (c.Cari_ID === cariId ? updatedCari : c))
      );
      return { success: true, data: updatedCari };
    }
    return { success: false, message: "Cari güncellenirken bir hata oluştu." };
  };

  const deleteCari = async (cariId: number) => {
    const success = await fetchData<any>(`${API_BASE_URL}/cari/${cariId}`, {
      method: 'DELETE',
    });
    if (success) {
      setCariList(prev => prev.filter(c => c.Cari_ID !== cariId));
      return { success: true };
    }
    return { success: false, message: "Cari silinirken bir hata oluştu." };
  };

  const processedCariList = useMemo(() => {
    if (!cariList || !kategoriList || !odemeReferansList) {
      return [];
    }
    return cariList.map(cari => {
      const kategori = kategoriList.find(k => k.Kategori_ID === cari.e_Fatura_Kategori_ID);
      const odemeReferans = odemeReferansList.find(o => o.Referans_ID === cari.Referans_ID);
      const odemeKategori = odemeReferans ? kategoriList.find(k => k.Kategori_ID === odemeReferans.Kategori_ID) : null;

      return {
        ...cari,
        Kategori_Adi: kategori ? kategori.Kategori_Adi : '-',
        Referans_Detay: odemeReferans ? `#${odemeReferans.Referans_ID} (${odemeReferans.Referans_Metin} - ${odemeKategori ? odemeKategori.Kategori_Adi : ''})` : null,
      };
    });
  }, [cariList, kategoriList, odemeReferansList]);

  const filteredList = useMemo(() => {
    return processedCariList.filter(item => {
      const matchesSearch = item.Alici_Unvani.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [processedCariList, searchTerm]);

  const handleAddNew = () => {
    setEditingCari(null);
    setShowModal(true);
  };

  const handleEdit = (cari: Cari) => {
    setEditingCari(cari);
    setShowModal(true);
  };

  const handleDelete = (cariId: number) => {
    if (window.confirm('Bu cari kaydını silmek istediğinizden emin misiniz?')) {
      deleteCari(cariId);
    }
  };

  const handleSubmit = (formData: CariFormData) => {
    if (editingCari) {
      updateCari(editingCari.Cari_ID, formData);
    } else {
      addCari(formData);
    }
    setShowModal(false);
  };

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
              onClick={handleAddNew}
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
                      {cari.Cari ? (
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
                      {cari.Aktif_Pasif ? (
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
                        <button onClick={() => handleEdit(cari)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cari.Cari_ID)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
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
        <CariModal 
            initialData={editingCari} 
            onSubmit={handleSubmit} 
            onClose={() => setShowModal(false)} 
            kategoriList={kategoriList}
            odemeReferansList={odemeReferansList}
        />
      )}
    </div>
  );
}

const CariModal: React.FC<{initialData: Cari | null, onSubmit: (data: CariFormData) => void, onClose: () => void, kategoriList: Kategori[], odemeReferansList: OdemeReferans[]}> = ({initialData, onSubmit, onClose, kategoriList, odemeReferansList}) => {
    const [formData, setFormData] = useState<CariFormData>(initialData || {
        Alici_Unvani: '',
        e_Fatura_Kategori_ID: undefined,
        Referans_ID: undefined,
        Cari: true,
        Aciklama: '',
        Aktif_Pasif: true,
    });

    useEffect(() => {
        setFormData({ ...initialData });
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleFormSubmit}>
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Cari Düzenle' : 'Yeni Cari Ekle'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alıcı Ünvanı *</label>
                <input type="text" name="Alici_Unvani" value={formData.Alici_Unvani || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-Fatura Kategorisi *</label>
                <select name="e_Fatura_Kategori_ID" value={formData.e_Fatura_Kategori_ID || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Seçiniz...</option>
                  {kategoriList.filter(k => k.Tip === 'Gider' || k.Tip === 'Gelir').map(k => (
                      <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="cari"
                  name="Cari"
                  checked={!!formData.Cari}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                />
                <label htmlFor="cari" className="text-sm font-medium text-slate-700">Cari Hesap</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ödeme e-Referans {formData.Cari && <span className="text-red-600">*</span>}
                </label>
                <select 
                  name="Referans_ID"
                  value={formData.Referans_ID || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!!formData.Cari}
                >
                  <option value="">Seçiniz...</option>
                  {odemeReferansList.map(o => (
                      <option key={o.Referans_ID} value={o.Referans_ID}>{`#${o.Referans_ID} (${o.Referans_Metin})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="aktif" name="Aktif_Pasif" checked={!!formData.Aktif_Pasif} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <label htmlFor="aktif" className="text-sm font-medium text-slate-700">Aktif</label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Kaydet
              </button>
            </div>
            </form>
          </div>
        </div>
    );
}