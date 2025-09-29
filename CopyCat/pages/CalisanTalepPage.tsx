import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, FileText, Users } from 'lucide-react';
import { useAppContext, useDataContext } from '../App';
import { CALISAN_TALEP_ISE_GIRIS_ONAYI_YETKI_ADI, CALISAN_TALEP_SSK_ONAYI_YETKI_ADI } from '../constants';

// Types
interface CalisanTalep {
  Calisan_Talep_ID: number;
  TC_No: string;
  Adi: string;
  Soyadi: string;
  Ilk_Soyadi: string;
  Hesap_No?: string;
  IBAN?: string;
  Ogrenim_Durumu?: string;
  Cinsiyet: 'Erkek' | 'Kadın';
  Gorevi?: string;
  Anne_Adi?: string;
  Baba_Adi?: string;
  Dogum_Yeri?: string;
  Dogum_Tarihi?: string;
  Medeni_Hali: 'Bekar' | 'Evli';
  Cep_No?: string;
  Adres_Bilgileri: string;
  Gelir_Vergisi_Matrahi?: number;
  SSK_Cikis_Nedeni: string;
  Net_Maas?: number;
  Sigorta_Giris?: string;
  Sigorta_Cikis?: string;
  Talep: 'İşten Çıkış' | 'İşe Giriş';
  Sube_ID: number;
  Imaj_Adi?: string;
  Kayit_Tarih: string;
  Is_Onay_Tarih?: string | null;
  SSK_Onay_Tarih?: string | null;
  Is_Onay_Veren_Kullanici_ID?: number;
  SSK_Onay_Veren_Kullanici_ID?: number;
}

interface ActiveEmployee {
  id: string;
  TC_No: string;
  Adi: string;
  Soyadi: string;
  Gorevi?: string;
}

const CalisanTalepSistemi: React.FC = () => {
  const { hasPermission, currentUser } = useAppContext();
  const { calisanTalepList, addCalisanTalep, updateCalisanTalep, calisanList } = useDataContext();
  const isCurrentUserAdmin = currentUser?.Kullanici_Adi.toLowerCase() === 'sgunizi';
  const [talepler, setTalepler] = useState<CalisanTalep[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedTalep, setSelectedTalep] = useState<CalisanTalep | null>(null);
  const [filter, setFilter] = useState<'all' | 'İşe Giriş' | 'İşten Çıkış'>('all');
  const [showOnlyApproved, setShowOnlyApproved] = useState(false);

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<CalisanTalep>>({
    TC_No: '',
    Adi: '',
    Soyadi: '',
    Ilk_Soyadi: '',
    Hesap_No: '',
    IBAN: '',
    Ogrenim_Durumu: '',
    Cinsiyet: 'Erkek',
    Gorevi: '',
    Anne_Adi: '',
    Baba_Adi: '',
    Dogum_Yeri: '',
    Dogum_Tarihi: '',
    Medeni_Hali: 'Bekar',
    Cep_No: '',
    Adres_Bilgileri: '',
    Gelir_Vergisi_Matrahi: 0,
    SSK_Cikis_Nedeni: '',
    Net_Maas: 0,
    Sigorta_Giris: '',
    Sigorta_Cikis: '',
    Talep: 'İşe Giriş',
    Sube_ID: 1
  });

  const [exitFormData, setExitFormData] = useState({
    employeeId: '',
    exitDate: todayISO,
    exitReason: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (calisanTalepList) {
      setTalepler(calisanTalepList);
    }
  }, [calisanTalepList]);

  useEffect(() => {
    if (calisanList) {
      const today = new Date();
      const active = calisanList.filter(calisan => {
        // If Sigorta_Cikis is not set, or is in the future, consider them active
        if (!calisan.Sigorta_Cikis) return true;
        const cikisDate = new Date(calisan.Sigorta_Cikis);
        return cikisDate > today;
      }).map(calisan => ({
        id: calisan.TC_No,
        TC_No: calisan.TC_No,
        Adi: calisan.Adi,
        Soyadi: calisan.Soyadi,
        Gorevi: calisan.Gorevi
      }));
      setActiveEmployees(active);
    }
  }, [calisanList]);

  const resetForm = () => {
    setFormData({
      TC_No: '',
      Adi: '',
      Soyadi: '',
      Ilk_Soyadi: '',
      Hesap_No: '',
      IBAN: '',
      Ogrenim_Durumu: '',
      Cinsiyet: 'Erkek',
      Gorevi: '',
      Anne_Adi: '',
      Baba_Adi: '',
      Dogum_Yeri: '',
      Dogum_Tarihi: '',
      Medeni_Hali: 'Bekar',
      Cep_No: '',
      Adres_Bilgileri: '',
      Gelir_Vergisi_Matrahi: 0,
      SSK_Cikis_Nedeni: '',
      Net_Maas: 0,
      Sigorta_Giris: '',
      Sigorta_Cikis: '',
      Talep: 'İşe Giriş',
      Sube_ID: 1,
      status: 'pending'
    });
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const preparedData: Partial<CalisanTalep> = { ...formData };
    if (preparedData.Dogum_Tarihi === '') preparedData.Dogum_Tarihi = null;
    if (preparedData.Sigorta_Giris === '') preparedData.Sigorta_Giris = null;
    if (preparedData.Sigorta_Cikis === '') preparedData.Sigorta_Cikis = null;

    if (modalType === 'add') {
      const newTalep: CalisanTalep = {
        ...preparedData,
        Calisan_Talep_ID: 0, // Will be set by backend
        Kayit_Tarih: new Date().toISOString(),
        Imaj_Adi: selectedFile?.name
      } as CalisanTalep;
      
      await addCalisanTalep(newTalep);
    } else {
      if (selectedTalep) {
        updateCalisanTalep(selectedTalep.Calisan_Talep_ID, preparedData);
      }
    }
    
    setShowModal(false);
    resetForm();
    setSelectedTalep(null);
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const employee = activeEmployees.find(emp => emp.id === exitFormData.employeeId);
    if (!employee) return;

    const fullEmployeeData = calisanList.find(c => c.TC_No === employee.TC_No);
    if (!fullEmployeeData) return; // Should not happen if activeEmployees is derived from calisanList

    const newExitRequest: Partial<CalisanTalep> = {
      Calisan_Talep_ID: 0, // Will be set by backend
      TC_No: fullEmployeeData.TC_No,
      Adi: fullEmployeeData.Adi,
      Soyadi: fullEmployeeData.Soyadi,
      Ilk_Soyadi: fullEmployeeData.Ilk_Soyadi || '',
      Hesap_No: fullEmployeeData.Hesap_No || '',
      IBAN: fullEmployeeData.IBAN || '',
      Ogrenim_Durumu: fullEmployeeData.Ogrenim_Durumu || '',
      Cinsiyet: fullEmployeeData.Cinsiyet || 'Erkek',
      Gorevi: fullEmployeeData.Gorevi || '',
      Anne_Adi: fullEmployeeData.Anne_Adi || '',
      Baba_Adi: fullEmployeeData.Baba_Adi || '',
      Dogum_Yeri: fullEmployeeData.Dogum_Yeri || '',
      Dogum_Tarihi: fullEmployeeData.Dogum_Tarihi,
      Medeni_Hali: fullEmployeeData.Medeni_Hali || 'Bekar',
      Cep_No: fullEmployeeData.Cep_No || '',
      Adres_Bilgileri: fullEmployeeData.Adres_Bilgileri || '',
      Gelir_Vergisi_Matrahi: fullEmployeeData.Gelir_Vergisi_Matrahi || 0,
      SSK_Cikis_Nedeni: exitFormData.exitReason,
      Net_Maas: fullEmployeeData.Net_Maas || 0,
      Sigorta_Giris: fullEmployeeData.Sigorta_Giris,
      Sigorta_Cikis: exitFormData.exitDate,
      Talep: 'İşten Çıkış',
      Sube_ID: fullEmployeeData.Sube_ID,
      Imaj_Adi: '', // Not applicable for exit request
      Kayit_Tarih: new Date().toISOString(),
      Is_Onay_Tarih: null,
      SSK_Onay_Tarih: null,
    };

    if (newExitRequest.Dogum_Tarihi === '') newExitRequest.Dogum_Tarihi = null;
    if (newExitRequest.Sigorta_Giris === '') newExitRequest.Sigorta_Giris = null;


    await addCalisanTalep(newExitRequest);
    setShowExitModal(false);
    setExitFormData({ employeeId: '', exitDate: todayISO, exitReason: '' });
  };

  const handleEdit = (talep: CalisanTalep) => {
    setFormData(talep);
    setSelectedTalep(talep);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setTalepler(talepler.filter(t => t.Calisan_Talep_ID !== id));
  };

  const handleHRApproval = (id: number) => {
    const talepToUpdate = talepler.find(t => t.Calisan_Talep_ID === id);
    if (talepToUpdate) {
      updateCalisanTalep(id, {
        ...talepToUpdate,
        Is_Onay_Tarih: new Date().toISOString(),
        Is_Onay_Veren_Kullanici_ID: currentUser?.Kullanici_ID,
      });
    }
  };

  const handleSSKApproval = (id: number) => {
    const talepToUpdate = talepler.find(t => t.Calisan_Talep_ID === id);
    if (talepToUpdate) {
      updateCalisanTalep(id, {
        ...talepToUpdate,
        SSK_Onay_Tarih: new Date().toISOString(),
        SSK_Onay_Veren_Kullanici_ID: currentUser?.Kullanici_ID,
      });
    }
  };

  const getStatusText = (talep: CalisanTalep): string => {
    if (talep.Talep === 'İşe Giriş') {
      if (!talep.Is_Onay_Tarih) {
        return 'İşe Giriş Onayı Bekleniyor';
      }
      if (!talep.SSK_Onay_Tarih) {
        return 'SSK Onayı Bekleniyor';
      }
      return 'SSK Onaylandı';
    } else { // İşten Çıkış
      if (!talep.SSK_Onay_Tarih) {
        return 'SSK Onayı Bekleniyor';
      }
      return 'SSK Onaylandı';
    }
  };

  const getStatusColor = (talep: CalisanTalep): string => {
    const status = getStatusText(talep);
    switch (status) {
      case 'İşe Giriş Onayı Bekleniyor': return 'bg-yellow-100 text-yellow-800';
      case 'SSK Onayı Bekleniyor': return 'bg-blue-100 text-blue-800';
      case 'SSK Onaylandı': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTalepler = talepler.filter(talep => {
    const typeMatch = filter === 'all' || talep.Talep === filter;
    const approvalMatch = showOnlyApproved ? getStatusText(talep) === 'SSK Onaylandı' : getStatusText(talep) !== 'SSK Onaylandı';
    return typeMatch && approvalMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Çalışan Talep Yönetimi</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setModalType('add');
                    setShowModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Yeni İşe Giriş
                </button>
                <button
                  onClick={() => setShowExitModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  İşten Çıkış
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                {(['all', 'İşe Giriş', 'İşten Çıkış'] as const).map(filterType => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterType === 'all' ? 'Tümü' : filterType}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ssk-approved"
                  checked={showOnlyApproved}
                  onChange={(e) => setShowOnlyApproved(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="ssk-approved" className="text-sm font-medium text-gray-700">
                  SSK Onaylandı
                </label>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">TC No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ad Soyad</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Maaş</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Talep Türü</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTalepler.map((talep) => (
                    <tr key={talep.Calisan_Talep_ID} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{talep.TC_No}</td>
                      <td className="py-3 px-4">{`${talep.Adi} ${talep.Soyadi}`}</td>
                      <td className="py-3 px-4">{(talep.Net_Maas || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          talep.Talep === 'İşe Giriş' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {talep.Talep}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(talep.Kayit_Tarih).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(talep)}`}>
                          {getStatusText(talep)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!talep.Is_Onay_Tarih && !talep.SSK_Onay_Tarih && (
                            <button
                              onClick={() => handleEdit(talep)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {talep.Talep === 'İşten Çıkış' && !talep.Is_Onay_Tarih && !talep.SSK_Onay_Tarih && (isCurrentUserAdmin || hasPermission(CALISAN_TALEP_ISE_GIRIS_ONAYI_YETKI_ADI)) && (
                            <button
                              onClick={() => handleDelete(talep.Calisan_Talep_ID)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {talep.Talep === 'İşe Giriş' && !talep.Is_Onay_Tarih && (isCurrentUserAdmin || hasPermission(CALISAN_TALEP_ISE_GIRIS_ONAYI_YETKI_ADI)) && (
                            <>
                              <button
                                onClick={() => handleDelete(talep.Calisan_Talep_ID)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleHRApproval(talep.Calisan_Talep_ID)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="İşe Giriş Onayı"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                                                    {((talep.Talep === 'İşe Giriş' && talep.Is_Onay_Tarih && !talep.SSK_Onay_Tarih) || (talep.Talep === 'İşten Çıkış' && !talep.SSK_Onay_Tarih)) && (isCurrentUserAdmin || hasPermission(CALISAN_TALEP_SSK_ONAYI_YETKI_ADI)) && (
                            <button
                              onClick={() => handleSSKApproval(talep.Calisan_Talep_ID)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="SSK Onayı"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* İşe Giriş/Düzenleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalType === 'add' ? 'Yeni İşe Giriş Talebi' : 'Talep Düzenle'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(modalType === 'edit' && selectedTalep?.Talep === 'İşten Çıkış') ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TC No</label>
                      <input type="text" disabled value={formData.TC_No || ''} className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adı</label>
                      <input type="text" disabled value={formData.Adi || ''} className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soyadı</label>
                      <input type="text" disabled value={formData.Soyadi || ''} className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sigorta Çıkış Tarihi</label>
                      <input
                        type="date"
                        value={formData.Sigorta_Cikis || ''}
                        onChange={(e) => setFormData({...formData, Sigorta_Cikis: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">SSK Çıkış Nedeni</label>
                      <select
                        value={formData.SSK_Cikis_Nedeni || ''}
                        onChange={(e) => setFormData({...formData, SSK_Cikis_Nedeni: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Neden seçin...</option>
                        <option value="İstifa">İstifa</option>
                        <option value="Fesih">Fesih</option>
                        <option value="Emeklilik">Emeklilik</option>
                        <option value="Ölüm">Ölüm</option>
                        <option value="İş Sözleşmesi Sona Erme">İş Sözleşmesi Sona Erme</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TC No *</label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={formData.TC_No}
                        onChange={(e) => setFormData({...formData, TC_No: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                      <input
                        type="text"
                        required
                        value={formData.Adi}
                        onChange={(e) => setFormData({...formData, Adi: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
                      <input
                        type="text"
                        required
                        value={formData.Soyadi}
                        onChange={(e) => setFormData({...formData, Soyadi: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">İlk Soyad</label>
                      <input
                        type="text"
                    value={formData.Ilk_Soyadi}
                    onChange={(e) => setFormData({...formData, Ilk_Soyadi: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                      <select
                        value={formData.Cinsiyet}
                        onChange={(e) => setFormData({...formData, Cinsiyet: e.target.value as 'Erkek' | 'Kadın'})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medeni Hal</label>
                      <select
                        value={formData.Medeni_Hali}
                        onChange={(e) => setFormData({...formData, Medeni_Hali: e.target.value as 'Bekar' | 'Evli'})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Bekar">Bekar</option>
                        <option value="Evli">Evli</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                      <input
                        type="date"
                        value={formData.Dogum_Tarihi}
                        onChange={(e) => setFormData({...formData, Dogum_Tarihi: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Yeri</label>
                      <input
                        type="text"
                        value={formData.Dogum_Yeri}
                        onChange={(e) => setFormData({...formData, Dogum_Yeri: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anne Adı</label>
                      <input
                        type="text"
                        value={formData.Anne_Adi}
                        onChange={(e) => setFormData({...formData, Anne_Adi: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Baba Adı</label>
                      <input
                        type="text"
                        value={formData.Baba_Adi}
                        onChange={(e) => setFormData({...formData, Baba_Adi: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cep Telefonu</label>
                      <input
                        type="tel"
                        value={formData.Cep_No}
                        onChange={(e) => setFormData({...formData, Cep_No: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Görev</label>
                      <input
                        type="text"
                        value={formData.Gorevi}
                        onChange={(e) => setFormData({...formData, Gorevi: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Öğrenim Durumu</label>
                      <input
                        type="text"
                        value={formData.Ogrenim_Durumu}
                        onChange={(e) => setFormData({...formData, Ogrenim_Durumu: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                      <input
                        type="text"
                        maxLength={26}
                        value={formData.IBAN}
                        onChange={(e) => setFormData({...formData, IBAN: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hesap No</label>
                      <input
                        type="text"
                        value={formData.Hesap_No}
                        onChange={(e) => setFormData({...formData, Hesap_No: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Net Maaş *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.Net_Maas}
                        onChange={(e) => setFormData({...formData, Net_Maas: parseFloat(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sigorta Giriş Tarihi *</label>
                      <input
                        type="date"
                        required
                        value={formData.Sigorta_Giris}
                        onChange={(e) => setFormData({...formData, Sigorta_Giris: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres Bilgileri *</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.Adres_Bilgileri}
                        onChange={(e) => setFormData({...formData, Adres_Bilgileri: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosya Ekle</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {selectedFile && (
                        <p className="mt-1 text-sm text-gray-600">Seçilen dosya: {selectedFile.name}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setSelectedTalep(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {modalType === 'add' ? 'Kaydet' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* İşten Çıkış Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">İşten Çıkış Talebi</h2>
            </div>
            
            <form onSubmit={handleExitSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Çalışan Seçin *</label>
                  <select
                    required
                    value={exitFormData.employeeId}
                    onChange={(e) => setExitFormData({...exitFormData, employeeId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Çalışan seçin...</option>
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.Adi} {emp.Soyadi} - {emp.TC_No} ({emp.Gorevi})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={exitFormData.exitDate}
                    onChange={(e) => setExitFormData({...exitFormData, exitDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Nedeni *</label>
                  <select
                    required
                    value={exitFormData.exitReason}
                    onChange={(e) => setExitFormData({...exitFormData, exitReason: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Neden seçin...</option>
                    <option value="İstifa">İstifa</option>
                    <option value="Fesih">Fesih</option>
                    <option value="Emeklilik">Emeklilik</option>
                    <option value="Ölüm">Ölüm</option>
                    <option value="İş Sözleşmesi Sona Erme">İş Sözleşmesi Sona Erme</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowExitModal(false);
                    setExitFormData({ employeeId: '', exitDate: todayISO, exitReason: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Çıkış Talebi Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalisanTalepSistemi;
