import React from 'react';
import { Card } from '../components'; // Assuming Card component is available
import { useAppContext } from '../App'; // Assuming useAppContext for permissions
import { OZET_KONTROL_RAPORU_YETKI_ADI } from '../constants'; // Assuming permission constant

const AccessDenied: React.FC<{ title: string }> = ({ title }) => (
    <Card title={title}>
        <div className="text-center py-10">
            <h3 className="text-xl font-bold text-red-600">Erişim Reddedildi</h3>
            <p className="text-gray-600 mt-2">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
    </Card>
);

export const OzetKontrolRaporuPage: React.FC = () => {
    const { hasPermission } = useAppContext();
    const pageTitle = "Özet Kontrol Raporu";
    const requiredPermission = OZET_KONTROL_RAPORU_YETKI_ADI;

    if (!hasPermission(requiredPermission)) {
        return <AccessDenied title={pageTitle} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Card title={pageTitle}>
                    <div className="text-center py-10">
                        <h3 className="text-xl font-bold text-gray-900">Özet Kontrol Raporu Sayfası</h3>
                        <p className="text-gray-600 mt-2">Bu sayfa henüz geliştirilme aşamasındadır.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default OzetKontrolRaporuPage;
