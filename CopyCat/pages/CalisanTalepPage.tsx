import React from 'react';
import { Card } from '../components';
import { useAppContext } from '../App';
import { CALISAN_TALEP_EKRANI_YETKI_ADI } from '../constants';
import { AccessDenied } from '../pages.tsx';

const CalisanTalepPage: React.FC = () => {
  const { hasPermission } = useAppContext();

  if (!hasPermission(CALISAN_TALEP_EKRANI_YETKI_ADI)) {
    return <AccessDenied title="Çalışan Talep" />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Çalışan Talep</h1>
        <p className="text-gray-600">Bu sayfa yapım aşamasındadır.</p>
      </div>
      <Card className="p-6">
        <p>Çalışan talepleri burada görüntülenecektir.</p>
      </Card>
    </div>
  );
};

export default CalisanTalepPage;