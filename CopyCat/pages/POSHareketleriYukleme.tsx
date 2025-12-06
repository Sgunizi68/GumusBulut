import React, { useState, useCallback } from 'react';
import { useAppContext, useDataContext } from '../App';
import { useToast } from '../contexts/ToastContext';
import { Card, Button, Input, Select } from '../components';
import { Icons } from '../constants';
import { Sube } from '../types';

const POSHareketleriYuklemePage: React.FC = () => {
  const { selectedBranch, currentPeriod } = useAppContext();
  const { subeList, uploadPosHareketleri } = useDataContext();
  const { showSuccess, showError } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [selectedSubeId, setSelectedSubeId] = useState<number>(selectedBranch?.Sube_ID || 1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ added: number; skipped: number } | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Check file extension
      if (selectedFile.name.toLowerCase().endsWith('.xls')) {
        showError("Eski Excel Formatı", "Lütfen .xls dosyanızı Excel'de açıp .xlsx formatında kaydedin ve tekrar deneyin.");
        setFile(null);
        e.target.value = ''; // Reset the input
        return;
      }
      if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        showError("Geçersiz Dosya Türü", "Lütfen sadece .xlsx formatında bir Excel dosyası yükleyin.");
        setFile(null);
        e.target.value = ''; // Reset the input
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  // Handle form submission
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
      
      const response = await uploadPosHareketleri(formData);
      
      if (response) {
        const { added, skipped } = response;
        setUploadResult({ added, skipped });
        showSuccess("Yükleme Başarılı", `${added} kayıt eklendi, ${skipped} kayıt atlandı`);
      } else {
        showError("Yükleme Hatası", "Sunucudan geçersiz yanıt alındı");
      }
      
      // Reset form
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

  // Handle branch change
  const handleSubeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubeId(parseInt(e.target.value));
  };

  // Get active branches for dropdown
  const activeSubeler = subeList.filter(s => s.Aktif_Pasif);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title="POS Hareketleri Yükleme" icon={Icons.Upload}>
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-center">
          <Icons.InformationCircle className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-sm text-blue-700">
            POS hareketlerini yüklemek için lütfen uygun formatta bir Excel dosyası seçin. 
            Dosya <strong>.xlsx</strong> uzantılı olmalıdır. Eski .xls formatı desteklenmemektedir.
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
                  POS hareketlerinin yükleneceği şubeyi seçin
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
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
                    Yükle
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
                  <p className="text-sm text-gray-600">Eklenen Kayıtlar</p>
                  <p className="text-2xl font-bold text-green-700">{uploadResult.added}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-600">Atlanan Kayıtlar (Tekrarlar)</p>
                  <p className="text-2xl font-bold text-yellow-600">{uploadResult.skipped}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gerekli Excel Sütunları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Islem_Tarihi</p>
                <p className="text-sm text-gray-600">İşlem tarihi (GG.AA.YYYY formatında)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Hesaba_Gecis</p>
                <p className="text-sm text-gray-600">Hesaba geçiş tarihi (GG.AA.YYYY formatında)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Para_Birimi</p>
                <p className="text-sm text-gray-600">Para birimi kodu (örn. "TRY")</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Islem_Tutari</p>
                <p className="text-sm text-gray-600">İşlem tutarı (sayısal değer)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Kesinti_Tutari</p>
                <p className="text-sm text-gray-600">Kesinti tutarı (opsiyonel, sayısal değer)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">Net_Tutar</p>
                <p className="text-sm text-gray-600">Net tutar (opsiyonel, sayısal değer)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default POSHareketleriYuklemePage;