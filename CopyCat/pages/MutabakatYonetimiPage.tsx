import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';

export default function MutabakatYonetim() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mutabakatList, setMutabakatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMutabakatData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/mutabakat');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMutabakatList(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMutabakatData();
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

  const handleAddNew = () => {
    alert("Yeni mutabakat ekleme özelliği henüz mevcut değil.");
  };

  const handleEdit = (mutabakat: any) => {
    alert("Mutabakat düzenleme özelliği henüz mevcut değil.");
  };

  const handleDelete = (mutabakatId: number) => {
    alert("Mutabakat silme özelliği henüz mevcut değil.");
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
            <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span>Dışa Aktar</span>
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Görüntüle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(mutabakat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(mutabakat.Cari_ID)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
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
    </div>
  );
}