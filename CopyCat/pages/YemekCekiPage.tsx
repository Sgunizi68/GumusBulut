import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, useDataContext } from '../App';
import { API_BASE_URL } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { Card, Button, Input, Select, TableLayout, Modal } from '../components';
import { Icons, YAZDIRMA_YETKISI_ADI, EXCELE_AKTAR_YETKISI_ADI } from '../constants';
import { generateDashboardPdf } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import { YemekCeki, YemekCekiFormData } from '../types';

const getMimeType = (imageName?: string | null): string => {
    if (!imageName) return 'image/jpeg'; // Default
    const extension = imageName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'svg': return 'image/svg+xml';
        case 'webp': return 'image/webp';
        case 'jpg':
        case 'jpeg':
        default:
            return 'image/jpeg';
    }
};

const YemekCekiPage: React.FC = () => {
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
  const {
    kategoriList,
    yemekCekiList,
    addYemekCeki,
    updateYemekCeki,
    deleteYemekCeki,
  } = useDataContext();

  useEffect(() => {
    console.log("YemekCekiList updated in component:", yemekCekiList);
  }, [yemekCekiList]);
  const { showSuccess, showError } = useToast();

  const canPrint = hasPermission(YAZDIRMA_YETKISI_ADI);
  const canExportExcel = hasPermission(EXCELE_AKTAR_YETKISI_ADI);

  const handleGeneratePdf = () => {
    generateDashboardPdf('yemek-ceki-content', `Yemek_Ceki_${selectedBranch?.Sube_Adi}_${filterPeriod}.pdf`);
  };

  const handleExportToExcel = () => {
    if (!selectedBranch) return;

    const wb = XLSX.utils.book_new();
    const ws_data = filteredYemekCekiList.map(y => {
        const kategoriAdi = kategoriList.find(k => k.Kategori_ID === y.Kategori_ID)?.Kategori_Adi || 'N/A';
        return {
            'Kategori': kategoriAdi,
            'Tarih': y.Tarih,
            'Tutar': y.Tutar,
            'Ödeme Tarihi': y.Odeme_Tarih,
            'İlk Tarih': y.Ilk_Tarih,
            'Son Tarih': y.Son_Tarih,
            'Resim Adı': y.Imaj_Adi || '-',
        };
    });

    const ws = XLSX.utils.json_to_sheet(ws_data);
    ws['!cols'] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Yemek Ceki');
    XLSX.writeFile(wb, `Yemek_Ceki_${selectedBranch?.Sube_Adi}_${filterPeriod}.xlsx`);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYemekCeki, setEditingYemekCeki] = useState<YemekCeki | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>(currentPeriod || '');

  const [formData, setFormData] = useState<YemekCekiFormData>({
    Kategori_ID: 0,
    Tarih: new Date().toISOString().split('T')[0],
    Tutar: 0,
    Odeme_Tarih: new Date().toISOString().split('T')[0],
    Ilk_Tarih: new Date().toISOString().split('T')[0],
    Son_Tarih: new Date().toISOString().split('T')[0],
    Sube_ID: selectedBranch?.Sube_ID,
    Imaj: null,
    Imaj_Adi: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setFilterPeriod(currentPeriod || '');
  }, [currentPeriod]);

  useEffect(() => {
    if (selectedBranch) {
      setFormData(prev => ({
        ...prev,
        Sube_ID: selectedBranch.Sube_ID,
      }));
    }
  }, [selectedBranch]);

  const availablePeriods = useMemo(() => {
    const periods = new Set(yemekCekiList.map(y => {
      const date = new Date(y.Tarih);
      const year = date.getFullYear().toString().substring(2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}${month}`;
    }));
    periods.add(currentPeriod || '');
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [yemekCekiList, currentPeriod]);

  const filteredYemekCekiList = useMemo(() => {
    return yemekCekiList
      .filter(y => y.Sube_ID === selectedBranch?.Sube_ID)
      .filter(y => {
        const kategori = kategoriList.find(k => k.Kategori_ID === y.Kategori_ID);
        return kategori?.Aktif_Pasif;
      })
      .filter(y =>
        searchTerm === '' ||
        (kategoriList.find(k => k.Kategori_ID === y.Kategori_ID)?.Kategori_Adi || '')
          .toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(y => filterPeriod ?
        (() => {
          const date = new Date(y.Tarih);
          const year = date.getFullYear().toString().substring(2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          return `${year}${month}` === filterPeriod;
        })() : true)
      .sort((a, b) => new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime());
  }, [yemekCekiList, selectedBranch, searchTerm, filterPeriod, kategoriList]);

  const activeKategoriler = useMemo(() => {
    // Using the provided ID directly is more robust.
    const yemekCekiUstKategoriID = 3; 

    const filtered = kategoriList
      .filter(k => k.Aktif_Pasif && k.Ust_Kategori_ID === yemekCekiUstKategoriID && k.Tip === 'Gelir');
    
    console.log("Yemek Çeki kategorileri (ID ile filtrelendi):", filtered);

    return filtered.sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
        const file = (e.target as HTMLInputElement).files?.[0] || null;
        setFormData(prev => ({ ...prev, Imaj: file, Imaj_Adi: file ? file.name : null }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'Kategori_ID') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) {
        showError("Hata", "Lütfen bir şube seçin.");
        return;
    }
    
    if (!formData.Kategori_ID || formData.Kategori_ID === 0) {
        showError("Hata", "Lütfen bir kategori seçin.");
        return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    // Append all fields from formData to the FormData object
    Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (key === 'Imaj' && value instanceof File) {
            data.append('image', value, value.name);
        } else if (value !== null && value !== undefined) {
            data.append(key, String(value));
        }
    });

    try {
      if (new Date(formData.Ilk_Tarih) > new Date(formData.Son_Tarih)) {
        showError("Tarih Hatası", "İlk tarih, son tarihten sonra olamaz");
        setIsSubmitting(false);
        return;
      }

      let result;
      if (editingYemekCeki) {
        result = await updateYemekCeki(editingYemekCeki.ID, data);
      } else {
        result = await addYemekCeki(data);
      }

      if (result.success) {
        showSuccess("Başarılı", `Yemek çeki kaydı ${editingYemekCeki ? 'güncellendi' : 'oluşturuldu'}`);
        setIsModalOpen(false);
        setEditingYemekCeki(null);
      } else {
        showError("Hata", result.message || "İşlem sırasında bir hata oluştu.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showError("Hata", "Beklenmedik bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    setEditingYemekCeki(null);
    setFormData({
      Kategori_ID: 0,
      Tarih: new Date().toISOString().split('T')[0],
      Tutar: 0,
      Odeme_Tarih: new Date().toISOString().split('T')[0],
      Ilk_Tarih: new Date().toISOString().split('T')[0],
      Son_Tarih: new Date().toISOString().split('T')[0],
      Sube_ID: selectedBranch?.Sube_ID,
      Imaj: null,
      Imaj_Adi: null,
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (yemekCekiId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/yemek-cekiler/${yemekCekiId}`);
        if (!response.ok) {
            throw new Error("Yemek çeki detayı alınamadı.");
        }
        const yemekCeki: YemekCeki = await response.json();
        
        setEditingYemekCeki(yemekCeki);
        setFormData({
          Kategori_ID: yemekCeki.Kategori_ID,
          Tarih: yemekCeki.Tarih,
          Tutar: yemekCeki.Tutar,
          Odeme_Tarih: yemekCeki.Odeme_Tarih,
          Ilk_Tarih: yemekCeki.Ilk_Tarih,
          Son_Tarih: yemekCeki.Son_Tarih,
          Sube_ID: yemekCeki.Sube_ID,
          Imaj: null, // Will not re-upload file, just show existing
          Imaj_Adi: yemekCeki.Imaj_Adi,
        });
        const mimeType = getMimeType(yemekCeki.Imaj_Adi);
        setImagePreview(yemekCeki.Imaj ? `data:${mimeType};base64,${yemekCeki.Imaj}` : null);
        setIsModalOpen(true);
    } catch (error) {
        showError("Hata", error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.");
    }
  };

  const handleDelete = async (yemekCekiId: number) => {
    if (window.confirm("Bu yemek çeki kaydını silmek istediğinizden emin misiniz?")) {
        const result = await deleteYemekCeki(yemekCekiId);
        if (result.success) {
            showSuccess("Başarılı", "Yemek çeki kaydı silindi");
        } else {
            showError("Hata", result.message || "Silme işlemi sırasında bir hata oluştu.");
        }
    }
  };

  const handleRemoveImage = () => {
      setFormData(prev => ({ ...prev, Imaj: null, Imaj_Adi: "" })); // Set Imaj_Adi to empty to signal removal
      setImagePreview(null);
  }

  if (!selectedBranch) {
    return <Card title="Yemek Çeki"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-6" id="yemek-ceki-content">
      <Card title={`Yemek Çeki (Şube: ${selectedBranch.Sube_Adi})`}
        actions={
          <div className="flex items-center gap-3 hide-on-pdf">
            {canPrint && (
                <Button onClick={handleGeneratePdf} variant="ghost" size="sm" title="PDF Olarak İndir" className="print-button">
                    <Icons.Print className="w-5 h-5" />
                </Button>
            )}
            {canExportExcel && (
                <Button onClick={handleExportToExcel} variant="ghost" size="sm" title="Excel'e Aktar">
                    <Icons.Download className="w-5 h-5" />
                </Button>
            )}
            <Input
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px] text-sm py-2"
            />
            <Select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              className="min-w-[150px] text-sm py-2"
            >
              <option value="">Tüm Dönemler</option>
              {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Button onClick={handleAddNew} leftIcon={<Icons.Add className="w-4 h-4" />} className="flex-shrink-0 text-sm px-3">
              Yeni Kayıt
            </Button>
          </div>
        }>
        <TableLayout
          headers={['Kategori', 'Tarih', 'Tutar', 'Ödeme Tarihi', 'İlk Tarih', 'Son Tarih', 'Resim', 'İşlemler']}
          compact={true}
        >
          {filteredYemekCekiList.map(y => {
            const kategoriAdi = kategoriList.find(k => k.Kategori_ID === y.Kategori_ID)?.Kategori_Adi || 'N/A';
            const mimeType = getMimeType(y.Imaj_Adi);
            return (
              <tr key={y.ID}>
                <td className="px-4 py-2 text-sm text-gray-900">{kategoriAdi}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{y.Tarih}</td>
                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                  {y.Tutar.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{y.Odeme_Tarih}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{y.Ilk_Tarih}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{y.Son_Tarih}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                    {y.has_imaj && (
                        <a href={`${API_BASE_URL}/yemek-cekiler/${y.ID}/image`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            Görüntüle
                        </a>
                    )}
                </td>
                <td className="px-4 py-2 text-sm font-medium flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(y.ID)}
                    leftIcon={<Icons.Edit className="w-4 h-4" />}
                    title="Düzenle"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(y.ID)}
                    leftIcon={<Icons.Delete className="w-4 h-4" />}
                    title="Sil"
                  />
                </td>
              </tr>
            );
          })}
        </TableLayout>
        {filteredYemekCekiList.length === 0 && (
          <p className="text-center py-4 text-gray-500">Kayıtlı yemek çeki bulunmamaktadır.</p>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingYemekCeki ? 'Yemek Çeki Düzenle' : 'Yeni Yemek Çeki Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tarih"
            name="Tarih"
            type="date"
            value={formData.Tarih}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Tutar"
            name="Tutar"
            type="number"
            step="0.01"
            value={formData.Tutar.toString()}
            onChange={handleInputChange}
            required
          />
          <Select
            label="Kategori (Gider)"
            name="Kategori_ID"
            value={formData.Kategori_ID?.toString() || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Kategori Seçin...</option>
            {activeKategoriler.map(k => (
              <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>
            ))}
          </Select>
          <Input
            label="Ödeme Tarihi"
            name="Odeme_Tarih"
            type="date"
            value={formData.Odeme_Tarih}
            onChange={handleInputChange}
            required
          />
          <Input
            label="İlk Tarih"
            name="Ilk_Tarih"
            type="date"
            value={formData.Ilk_Tarih}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Son Tarih"
            name="Son_Tarih"
            type="date"
            value={formData.Son_Tarih}
            onChange={handleInputChange}
            required
          />
          <Input 
            label="Resim"
            name="Imaj"
            type="file"
            onChange={handleInputChange}
            accept="image/*"
          />
          {imagePreview && (
            <div className="mt-2 relative">
                <img src={imagePreview} alt="Önizleme" className="max-h-40 rounded-md" />
                <Button 
                    type="button"
                    variant="danger"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={handleRemoveImage}
                    title="Resmi Kaldır"
                >
                    <Icons.Close className="w-4 h-4" />
                </Button>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default YemekCekiPage;