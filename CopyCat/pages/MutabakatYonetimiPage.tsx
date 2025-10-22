import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';
import { useAppContext } from '../App';
import * as XLSX from 'xlsx';

interface Mutabakat {
  Cari_ID: number;
  Alici_Unvani: string;
  Mutabakat_Tarihi: string; // Assuming date as string for simplicity
  Tutar: number;
  Aciklama: string | null;
  Mutabakat_ID: number;
  Kayit_Tarihi: string; // Add Kayit_Tarihi field
}

interface Cari {
  Cari_ID: number;
  Alici_Unvani: string;
}

interface MutabakatFormData {
  Cari_ID: number | null;
  Mutabakat_Tarihi: string;
  Tutar: number;
  Aciklama: string | null;
}

const MutabakatModal: React.FC<{initialData: Mutabakat | null, onSubmit: (data: MutabakatFormData) => void, onClose: () => void, cariList: Cari[]}> = ({initialData, onSubmit, onClose, cariList}) => {
    console.log("MutabakatModal rendered. initialData:", initialData);
    const [formData, setFormData] = useState<MutabakatFormData>({
        Cari_ID: initialData?.Cari_ID || null,
        Mutabakat_Tarihi: initialData?.Mutabakat_Tarihi || '',
        Tutar: initialData?.Tutar || 0,
        Aciklama: initialData?.Aciklama === "NULL" ? "" : initialData?.Aciklama || '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                Cari_ID: initialData.Cari_ID,
                Mutabakat_Tarihi: initialData.Mutabakat_Tarihi,
                Tutar: initialData.Tutar,
                Aciklama: initialData.Aciklama === "NULL" ? "" : initialData.Aciklama,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
              <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Mutabakat Düzenle' : 'Yeni Mutabakat Ekle'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alıcı Ünvanı *</label>
                <select
                  name="Cari_ID"
                  value={formData.Cari_ID || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, Cari_ID: e.target.value ? parseInt(e.target.value) : null }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!initialData}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Mutabakat Tarihi *</label>
                <input type="date" name="Mutabakat_Tarihi" value={formData.Mutabakat_Tarihi || ''} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tutar *</label>
                <input type="number" name="Tutar" value={formData.Tutar || 0} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea name="Aciklama" value={formData.Aciklama || ''} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              {initialData?.Kayit_Tarihi && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kayıt Tarihi</label>
                  <p className="text-sm text-slate-600">{new Date(initialData.Kayit_Tarihi).toLocaleString()}</p>
                </div>
              )}
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
};

export default function MutabakatYonetim() {
  const { selectedBranch } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [mutabakatList, setMutabakatList] = useState<Mutabakat[]>([]);
  const [cariList, setCariList] = useState<Cari[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMutabakat, setEditingMutabakat] = useState<Mutabakat | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [mutabakatData, cariData] = await Promise.all([
          fetch('http://localhost:8000/api/v1/mutabakat').then(res => res.json()),
          fetch('http://localhost:8000/api/v1/cari').then(res => res.json())
        ]);
        setMutabakatList(mutabakatData);
        setCariList(cariData);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredList = mutabakatList.filter(item => {
    const matchesSearch = item.Alici_Unvani.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">Hata: {error.message}</div>;
  }

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mutabakatlar");
    XLSX.writeFile(wb, "mutabakatlar.xlsx");
  };

  const handleAddNew = () => {
    setEditingMutabakat(null);
    setShowModal(true);
  };

  const handleEdit = (mutabakat: Mutabakat) => {
    console.log("handleEdit called with:", mutabakat);
    setEditingMutabakat(mutabakat);
    setShowModal(true);
  };

  const handleSubmit = async (formData: MutabakatFormData) => {
    try {
      const formattedData = {
        ...formData,
        Sube_ID: selectedBranch?.Sube_ID,
        Mutabakat_Tarihi: new Date(formData.Mutabakat_Tarihi).toISOString().split('T')[0], // Ensure YYYY-MM-DD format
        Aciklama: formData.Aciklama === "" ? null : formData.Aciklama,
      };

      console.log("Data being sent to backend:", formattedData); // Log the data

      const url = editingMutabakat 
        ? `http://localhost:8000/api/v1/mutabakat/${editingMutabakat.Mutabakat_ID}`
        : 'http://localhost:8000/api/v1/mutabakat';
      
      const method = editingMutabakat ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      console.log("Fetch response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend validation error details:", errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const resultData: Mutabakat = await response.json();

      if (editingMutabakat) {
        setMutabakatList(prevList =>
          prevList.map(m => (m.Mutabakat_ID === resultData.Mutabakat_ID ? resultData : m))
        );
      } else {
        setMutabakatList(prevList => [...prevList, resultData]);
      }
      
      setShowModal(false);
    } catch (error: any) {
      setError(error);
    }
  };

  const handleDelete = async (mutabakatId: number) => {
    if (window.confirm("Bu mutabakat kaydını silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/mutabakat/${mutabakatId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        setMutabakatList(prevList => prevList.filter(m => m.Mutabakat_ID !== mutabakatId));
      } catch (error: any) {
        setError(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Mutabakat Yönetimi</h1>
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
            <button onClick={handleExport} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span>Excel'e Aktar</span>
            </button>
            
            <button 
              onClick={handleAddNew}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Alıcı Ünvanı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mutabakat Tarihi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Açıklama</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((mutabakat) => (
                  <tr key={mutabakat.Cari_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">#{mutabakat.Cari_ID}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">{mutabakat.Alici_Unvani}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {mutabakat.Mutabakat_Tarihi}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {mutabakat.Tutar}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {mutabakat.Aciklama === "NULL" ? "-" : mutabakat.Aciklama}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {mutabakat.Kayit_Tarihi ? new Date(mutabakat.Kayit_Tarihi).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(mutabakat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(mutabakat.Mutabakat_ID)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
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
        <MutabakatModal 
            initialData={editingMutabakat} 
            onSubmit={handleSubmit} 
            onClose={() => setShowModal(false)}
            cariList={cariList}
        />
      )}
    </div>
  );
}