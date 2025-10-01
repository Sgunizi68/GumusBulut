
import React, { useState, useEffect } from 'react';
import { useDataContext, useAppContext } from '@/App';
import { Card } from './Card';
import { Button } from './Button';
import { Icons, DASHBOARD_EKRANI_YETKI_ADI } from '@/constants';

export const AccessDenied: React.FC<{ title: string }> = ({ title }) => {
  const { reloadData } = useDataContext(); 
  const { hasPermission } = useAppContext();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // If permissions are already loaded, don't show retry
    if (hasPermission(DASHBOARD_EKRANI_YETKI_ADI)) return;

    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [hasPermission]);

  const handleRetry = () => {
    setShowRetry(false);
    if(reloadData) {
        reloadData();
    }
  };

  return (
    <Card title={title}>
        <div className="text-center py-10">
            {!showRetry ? (
              <>
                <h3 className="text-xl font-bold text-blue-600">Şu an bağlantıları yapıyorum, lütfen bekleyin</h3>
                <p className="text-gray-600 mt-2">Veriler yükleniyor, bu işlem birkaç saniye sürebilir.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-red-600">Bağlantı Kurulamadı</h3>
                <p className="text-gray-600 mt-2">Sunucudan ilk veriler alınamadı veya yükleme çok uzun sürdü. Lütfen internet bağlantınızı kontrol edin veya yeniden deneyin.</p>
                <Button onClick={handleRetry} className="mt-6">
                  <Icons.Refresh className="w-4 h-4 mr-2" />
                  Tekrar Dene
                </Button>
              </>
            )}
        </div>
    </Card>
  );
};
