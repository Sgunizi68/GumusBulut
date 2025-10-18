import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext, useDataContext } from '../App';
import { CARI_BORC_YONETIMI_EKRANI_YETKI_ADI, Icons } from '../constants';
import { Button, Input, Modal, Card, TableLayout, StatusBadge, CariForm, AccessDenied } from '../components';
import { Cari, CariFormData } from '../types';


export const CariYonetimiPage: React.FC = () => {
  const { hasPermission } = useAppContext();
  const { cariList, addCari, updateCari, deleteCari } = useDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCari, setEditingCari] = useState<CariFormData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasPermission(CARI_BORC_YONETIMI_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Cari Borç Yönetimi" />;
  }

  const handleAddCari = () => {
    setEditingCari(null);
    setIsModalOpen(true);
  };

  const handleEditCari = (cari: Cari) => {
    setEditingCari({ ...cari });
    setIsModalOpen(true);
  };

  const handleDeleteCari = async (cariId: number) => {
    if (window.confirm('Bu cari kaydını silmek istediğinizden emin misiniz?')) {
      await deleteCari(cariId);
    }
  };

  const handleSubmit = async (data: CariFormData) => {
    if (editingCari && editingCari.Cari_ID) {
      await updateCari(editingCari.Cari_ID, data);
    } else {
      await addCari(data);
    }
    setIsModalOpen(false);
  };

  const filteredCariler = useMemo(() => {
    return cariList.filter(cari =>
      cari.Alici_Unvani.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cariList, searchTerm]);

  return (
    <div className="space-y-6">
      <Card
        title="Cari Borç Yönetimi"
        actions={
          <div className="flex items-center gap-3">
            <Input
              placeholder="Firma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow min-w-[200px]"
            />
            <Button onClick={handleAddCari} leftIcon={<Icons.Add />}>Yeni Cari</Button>
          </div>
        }
      >
        <TableLayout headers={['ID', 'Alıcı Ünvanı', 'e-Fatura Kategori ID', 'Referans ID', 'Cari', 'İşlemler']}>
          {filteredCariler.map((cari) => (
            <tr key={cari.Cari_ID}>
              <td>{cari.Cari_ID}</td>
              <td>{cari.Alici_Unvani}</td>
              <td>{cari.e_Fatura_Kategori_ID}</td>
              <td>{cari.Referans_ID}</td>
              <td><StatusBadge isActive={cari.Cari} /></td>
              <td className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditCari(cari)}><Icons.Edit /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCari(cari.Cari_ID)}><Icons.Delete /></Button>
              </td>
            </tr>
          ))}
        </TableLayout>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCari ? 'Cari Düzenle' : 'Yeni Cari Ekle'}>
        <CariForm initialData={editingCari} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};