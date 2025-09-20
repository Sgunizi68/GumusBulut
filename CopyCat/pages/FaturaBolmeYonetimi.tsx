import React from 'react';
import { useAppContext } from '../App';
import { Card } from '../components';

const AccessDenied: React.FC<{ title: string }> = ({ title }) => (
    <Card title={title}>
        <div className="text-center py-10">
            <h3 className="text-xl font-bold text-red-600">Erişim Reddedildi</h3>
            <p className="text-gray-600 mt-2">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
        </div>
    </Card>
);

export const FaturaBolmeYonetimiPage: React.FC = () => {
    const { hasPermission } = useAppContext();
    const pageTitle = "Fatura Bölme Yönetimi";
    const requiredPermission = "Fatura Bölme Yönetimi Ekranı Görüntüleme";

    if (!hasPermission(requiredPermission)) {
        return <AccessDenied title={pageTitle} />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Fatura Bölme Yönetimi</h1>
            <p>Bu sayfa fatura bölme yönetimi için kullanılacaktır.</p>
        </div>
    );
};