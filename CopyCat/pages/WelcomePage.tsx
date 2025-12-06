import React from 'react';
import { Card } from '../components';

export const WelcomePage: React.FC = () => {
  return (
    <Card title="Hoş Geldiniz">
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Gümüş Bulut Sistemine Hoş Geldiniz</h2>
        <p className="text-gray-600 mt-2">Lütfen sol menüden bir işlem seçiniz.</p>
      </div>
    </Card>
  );
};
