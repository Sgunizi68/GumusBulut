import React, { useState } from 'react';
import { useAppContext, useDataContext } from '../App';
import { useToast } from '../contexts/ToastContext';
import { Card, Button, Input, Select } from '../components';
import { Icons } from '../constants';

export const TabakSayisiYuklemePage: React.FC = () => {
  const { selectedBranch } = useAppContext();
  const { subeList, uploadTabakSayisi } = useDataContext();
  const { showSuccess, showError } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [selectedSubeId, setSelectedSubeId] = useState<number>(selectedBranch?.Sube_ID || 1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ updated_records: number; records_not_found: number, errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.match(/\.(xls|xlsx)$/i)) {
        showError("Geçersiz Dosya", "Lütfen sadece Excel dosyaları yükleyin (.xls veya .xlsx)");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      showError("Dosya Seçilmedi", "Lütfen bir Excel dosyası seçin");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('sube_id', selectedSubeId.toString());
      formData.append('file', file);
      
      const response = await uploadTabakSayisi(formData);
      
      if (response) {
        const { updated_records, records_not_found, errors } = response;
        setUploadResult({ updated_records, records_not_found, errors });
        showSuccess("Yükleme Başarılı", `${updated_records} kayıt güncellendi, ${records_not_found} kayıt bulunamadı.`);
        if (errors && errors.length > 0) {
            showError("İşlemde Hatalar Mevcut", `Excel dosyasındaki ${errors.length} satır işlenemedi. Detaylar için konsolu kontrol edin.`);
            console.error("İşlenemeyen satırlar:", errors);
        }
      } else {
        showError("Yükleme Hatası", "Sunucudan geçersiz yanıt alındı");
      }
      
      setFile(null);
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.detail || "Dosya yüklenirken bir hata oluştu";
      showError("Yükleme Hatası", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubeId(parseInt(e.target.value));
  };

  const activeSubeler = subeList.filter(s => s.Aktif_Pasif);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="Tabak Sayısı Yükleme" icon={Icons.Upload}>
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex items-center">
              <Icons.InformationCircle className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm text-blue-700">
                Tarih bazlı tabak sayılarını güncellemek için lütfen uygun formatta bir Excel dosyası seçin.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şube Seçimi
                </label>
                <Select
                  value={selectedSubeId}
                  onChange={handleSubeChange}
                  className="w-full"
                >
                  {activeSubeler.map((sube) => (
                    <option key={sube.Sube_ID} value={sube.Sube_ID}>
                      {sube.Sube_Adi}
                    </option>
                  ))}
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Tabak sayılarının güncelleneceği şubeyi seçin.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excel Dosyası
                </label>
                <div className="flex items-center">
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                </div>
                {file && (
                  <p className="mt-1 text-xs text-gray-500">
                    Seçilen dosya: {file.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isUploading || !file}
                className="flex items-center"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Icons.Upload className="mr-2 h-4 w-4" />
                    Yükle ve Güncelle
                  </>
                )}
              </Button>
            </div>
          </form>
          
          {uploadResult && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <Icons.CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-green-800">Yükleme Tamamlandı</h3>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Güncellenen Kayıtlar</p>
                  <p className="text-2xl font-bold text-green-700">{uploadResult.updated_records}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Bulunamayan Kayıtlar</p>
                  <p className="text-2xl font-bold text-yellow-600">{uploadResult.records_not_found}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gerekli Excel Sütunları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Tarih</p>
                <p className="text-sm text-gray-600">İşlem tarihi (DD-MM-YYYY HH:MM:SS formatında)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Toplam Tabak Sayısı</p>
                <p className="text-sm text-gray-600">Günlük toplam tabak sayısı (sayısal değer)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};