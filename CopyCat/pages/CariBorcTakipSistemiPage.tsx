import React from 'react';
import { Card } from '../components';
import { Icons } from '../constants';

const CariBorcTakipSistemiPage: React.FC = () => {
  return (
    <Card title="Cari Borç Takip Sistemi">
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Icons.Dashboard className="w-16 h-16 mb-4" />
        <p className="text-xl">Bu sayfa yapım aşamasındadır.</p>
        <p>"Cari Borç Takip Sistemi" için içerik yakında eklenecektir.</p>
      </div>
    </Card>
  );
};

export default CariBorcTakipSistemiPage;
