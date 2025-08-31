import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext, useDataContext } from '../App';
import { useToast } from '../contexts/ToastContext';
import { Card, Button, Input, Select, TableLayout, Modal } from '../components';
import { Icons } from '../constants';
import { YemekCeki } from '../types';

const YemekCekiPage: React.FC = () => {
  const { selectedBranch, currentPeriod, hasPermission } = useAppContext();
  const { subeList, kategoriList } = useDataContext();
  const { showSuccess, showError } = useToast();
  
  const [yemekCekiList, setYemekCekiList] = useState<YemekCeki[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYemekCeki, setEditingYemekCeki] = useState<YemekCeki | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>(currentPeriod || '');
  
  // Form state
  const [formData, setFormData] = useState<Omit<YemekCeki, 'ID' | 'Kayit_Tarihi'>>({
    Kategori_ID: 0,
    Tarih: new Date().toISOString().split('T')[0],
    Tutar: 0,
    Odeme_Tarih: new Date().toISOString().split('T')[0],
    Ilk_Tarih: new Date().toISOString().split('T')[0],
    Son_Tarih: new Date().toISOString().split('T')[0],
    Sube_ID: selectedBranch?.Sube_ID || 1
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFilterPeriod(currentPeriod || '');
  }, [currentPeriod]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      Sube_ID: selectedBranch?.Sube_ID || 1
    }));
  }, [selectedBranch]);

  const availablePeriods = useMemo(() => {
    const periods = new Set(yemekCekiList.map(y => {
      // Extract period from Tarih field (assuming format YYYY-MM-DD)
      const date = new Date(y.Tarih);
      const year = date.getFullYear().toString().substring(2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}${month}`;
    }));
    periods.add(currentPeriod || '');
    return Array.from(periods).sort((a, b) => b.localeCompare(a));
  }, [yemekCekiList, currentPeriod]);

  // Filter yemek çeki records
  const filteredYemekCekiList = useMemo(() => {
    return yemekCekiList
      .filter(y => y.Sube_ID === selectedBranch?.Sube_ID)
      .filter(y => {
        const kategori = kategoriList.find(k => k.Kategori_ID === y.Kategori_ID);
        return kategori && kategori.Aktif_Pasif; // Only show active categories
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

  // Get active categories for form
  const activeKategoriler = useMemo(() => {
    return kategoriList
      .filter(k => k.Aktif_Pasif && k.Tip === 'Gider')
      .sort((a, b) => a.Kategori_Adi.localeCompare(b.Kategori_Adi, 'tr', { sensitivity: 'base' }));
  }, [kategoriList]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'Kategori_ID') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation
      if (new Date(formData.Ilk_Tarih) > new Date(formData.Son_Tarih)) {
        showError("Tarih Hatası", "İlk tarih, son tarihten sonra olamaz");
        return;
      }
      
      // TODO: Implement API call to create/update YemekCeki record
      // This is a placeholder for the actual implementation
      console.log("Submitting YemekCeki data:", formData);
      
      // For now, just add to local state
      if (editingYemekCeki) {
        // Update existing record
        setYemekCekiList(prev => prev.map(y => 
          y.ID === editingYemekCeki.ID 
            ? { ...formData, ID: editingYemekCeki.ID, Kayit_Tarihi: editingYemekCeki.Kayit_Tarihi } 
            : y
        ));
        showSuccess("Başarılı", "Yemek çeki kaydı güncellendi");
      } else {
        // Add new record
        const newYemekCeki: YemekCeki = {
          ...formData,
          ID: Date.now(), // Temporary ID
          Kayit_Tarihi: new Date().toISOString()
        };
        setYemekCekiList(prev => [...prev, newYemekCeki]);
        showSuccess("Başarılı", "Yemek çeki kaydı oluşturuldu");
      }
      
      // Reset form and close modal
      setFormData({
        Kategori_ID: 0,
        Tarih: new Date().toISOString().split('T')[0],
        Tutar: 0,
        Odeme_Tarih: new Date().toISOString().split('T')[0],
        Ilk_Tarih: new Date().toISOString().split('T')[0],
        Son_Tarih: new Date().toISOString().split('T')[0],
        Sube_ID: selectedBranch?.Sube_ID || 1
      });
      setIsModalOpen(false);
      setEditingYemekCeki(null);
    } catch (error: any) {
      console.error("Submission error:", error);
      showError("Hata", "Yemek çeki kaydı oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingYemekCeki(null);
    setFormData({
      Kategori_ID: 0,
      Tarih: new Date().toISOString().split('T')[0],
      Tutar: 0,
      Odeme_Tarih: new Date().toISOString().split('T')[0],
      Ilk_Tarih: new Date().toISOString().split('T')[0],
      Son_Tarih: new Date().toISOString().split('T')[0],
      Sube_ID: selectedBranch?.Sube_ID || 1
    });
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (yemekCeki: YemekCeki) => {
    setEditingYemekCeki(yemekCeki);
    setFormData({
      Kategori_ID: yemekCeki.Kategori_ID,
      Tarih: yemekCeki.Tarih,
      Tutar: yemekCeki.Tutar,
      Odeme_Tarih: yemekCeki.Odeme_Tarih,
      Ilk_Tarih: yemekCeki.Ilk_Tarih,
      Son_Tarih: yemekCeki.Son_Tarih,
      Sube_ID: yemekCeki.Sube_ID
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (yemekCekiId: number) => {
    if (window.confirm("Bu yemek çeki kaydını silmek istediğinizden emin misiniz?")) {
      // TODO: Implement API call to delete YemekCeki record
      setYemekCekiList(prev => prev.filter(y => y.ID !== yemekCekiId));
      showSuccess("Başarılı", "Yemek çeki kaydı silindi");
    }
  };

  // Get active branches for dropdown
  const activeSubeler = subeList.filter(s => s.Aktif_Pasif);

  if (!selectedBranch) {
    return <Card title="Yemek Çeki"><p className="text-red-500">Lütfen önce bir şube seçin.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card title={`Yemek Çeki (Şube: ${selectedBranch.Sube_Adi})`} 
        actions={
          <div className="flex items-center gap-3">
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
          headers={['Kategori', 'Tarih', 'Tutar', 'Ödeme Tarihi', 'İlk Tarih', 'Son Tarih', 'İşlemler']} 
          compact={true}
        >
          {filteredYemekCekiList.map(y => {
            const kategoriAdi = kategoriList.find(k => k.Kategori_ID === y.Kategori_ID)?.Kategori_Adi || 'N/A';
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
                <td className="px-4 py-2 text-sm font-medium flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(y)} 
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