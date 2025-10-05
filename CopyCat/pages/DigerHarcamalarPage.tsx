import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext, useDataContext } from '../App';
import { API_BASE_URL } from '../constants';
import { Card, Button, Input, Select, Modal } from '../components';
import { Icons } from '../constants';
import { DigerHarcama, Kategori } from '../types';
import { useToast } from '../contexts/ToastContext';

const DigerHarcamalarPage: React.FC = () => {
    const { selectedBranch } = useAppContext();
    const { kategoriList } = useDataContext();
    const { showSuccess, showError } = useToast();

    const [harcamalar, setHarcamalar] = useState<DigerHarcama[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingHarcama, setEditingHarcama] = useState<DigerHarcama | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchHarcamalar = useCallback(async () => {
        if (!selectedBranch) return;
        setLoading(true);
        try {
            const url = new URL(`${API_BASE_URL}/diger-harcamalar/`);
            url.searchParams.append('limit', '1000'); // Fetch more for client-side filtering if needed
            if (searchTerm) {
                url.searchParams.append('search', searchTerm);
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Veri çekilemedi');
            }
            const data: DigerHarcama[] = await response.json();
            setHarcamalar(data.filter(h => h.Sube_ID === selectedBranch.Sube_ID));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, searchTerm]);

    useEffect(() => {
        fetchHarcamalar();
    }, [fetchHarcamalar]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchHarcamalar();
    };

    const openModal = (harcama: DigerHarcama | null) => {
        setEditingHarcama(harcama);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingHarcama(null);
    };

    const handleSave = async (formData: any) => {
        try {
            const url = editingHarcama
                ? `${API_BASE_URL}/diger-harcamalar/${editingHarcama.Harcama_ID}`
                : `${API_BASE_URL}/diger-harcamalar/`;
            
            const method = editingHarcama ? 'PUT' : 'POST';

            const response = await fetch(url, { 
                method,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Kaydetme işlemi başarısız');
            }

            showSuccess(editingHarcama ? 'Harcama güncellendi' : 'Harcama eklendi');
            fetchHarcamalar();
            closeModal();
        } catch (err: any) {
            showError('Hata', err.message);
        }
    };

    return (
        <div className="space-y-6">
            <Card 
                title={`Diğer Harcamalar (Şube: ${selectedBranch?.Sube_Adi})`}
                actions={
                    <Button onClick={() => openModal(null)}>
                        <Icons.Plus className="mr-2 h-4 w-4" />
                        Yeni Harcama
                    </Button>
                }
            >
                <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
                    <Input 
                        placeholder="Alıcı, Belge No, Açıklama ara..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <Button type="submit" variant="secondary">Ara</Button>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alıcı Adı</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Belge No</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4">Yükleniyor...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={6} className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : harcamalar.map(harcama => (
                                <tr key={harcama.Harcama_ID}>
                                    <td className="px-4 py-2 whitespace-nowrap">{harcama.Alici_Adi}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{harcama.Belge_Numarasi}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{harcama.Açıklama}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(harcama.Tutar)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{kategoriList.find(k => k.Kategori_ID === harcama.Kategori_ID)?.Kategori_Adi}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <Button variant="ghost" size="sm" onClick={() => openModal(harcama)}><Icons.Edit /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && (
                <HarcamaFormModal 
                    harcama={editingHarcama}
                    onClose={closeModal}
                    onSave={handleSave}
                    kategoriler={kategoriList.filter(k => k.Tip === 'Gider')}
                    subeId={selectedBranch!.Sube_ID}
                />
            )}
        </div>
    );
};

interface HarcamaFormModalProps {
    harcama: DigerHarcama | null;
    onClose: () => void;
    onSave: (formData: FormData) => void;
    kategoriler: Kategori[];
    subeId: number;
}

const HarcamaFormModal: React.FC<HarcamaFormModalProps> = ({ harcama, onClose, onSave, kategoriler, subeId }) => {
    const [formData, setFormData] = useState({
        Alici_Adi: harcama?.Alici_Adi || '',
        Belge_Numarasi: harcama?.Belge_Numarasi || '',
        Belge_Tarihi: harcama?.Belge_Tarihi || new Date().toISOString().split('T')[0],
        Donem: harcama?.Donem || parseInt(new Date().getFullYear().toString().substring(2) + (new Date().getMonth() + 1).toString().padStart(2, '0')),
        Tutar: harcama?.Tutar || 0,
        Kategori_ID: harcama?.Kategori_ID || '',
        Harcama_Tipi: harcama?.Harcama_Tipi || 'Nakit',
        Açıklama: harcama?.Açıklama || '',
        Sube_ID: subeId,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            fd.append(key, String(value));
        });
        onSave(fd);
    };

    return (
        <Modal title={harcama ? 'Harcama Düzenle' : 'Yeni Harcama'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Alıcı Adı" name="Alici_Adi" value={formData.Alici_Adi} onChange={handleChange} required />
                <Input label="Belge Numarası" name="Belge_Numarasi" value={formData.Belge_Numarasi} onChange={handleChange} />
                <Input label="Açıklama" name="Açıklama" value={formData.Açıklama} onChange={handleChange} />
                <Input label="Tutar" name="Tutar" type="number" step="0.01" value={formData.Tutar} onChange={handleChange} required />
                <Input label="Belge Tarihi" name="Belge_Tarihi" type="date" value={formData.Belge_Tarihi} onChange={handleChange} required />
                <Select label="Kategori" name="Kategori_ID" value={formData.Kategori_ID} onChange={handleChange} required>
                    <option value="">Kategori Seçin</option>
                    {kategoriler.map(k => <option key={k.Kategori_ID} value={k.Kategori_ID}>{k.Kategori_Adi}</option>)}
                </Select>
                <Select label="Harcama Tipi" name="Harcama_Tipi" value={formData.Harcama_Tipi} onChange={handleChange} required>
                    <option>Nakit</option>
                    <option>Banka Ödeme</option>
                    <option>Kredi Kartı</option>
                </Select>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
                    <Button type="submit">Kaydet</Button>
                </div>
            </form>
        </Modal>
    );
};

export default DigerHarcamalarPage;
