import React from 'react';
import { OdemeRaporDetail } from '../types';
import { formatNumber } from '../utils/formatNumber';

interface SingleLineDetailRowProps {
    detail: OdemeRaporDetail;
}

const SingleLineDetailRow: React.FC<SingleLineDetailRowProps> = ({ detail }) => {
    return (
        <tr className="bg-white border-l-4 border-gray-300">
            <td className="px-6 py-2 text-sm">
                <div className="pl-10">
                    <span className="text-gray-700">
                        {detail.tip} - {detail.hesap_adi} - {new Date(detail.tarih).toLocaleDateString('tr-TR')} - {detail.aciklama.substring(0, 50)}...
                    </span>
                </div>
            </td>
            <td className="px-4 py-2 text-sm text-center">
                {/* Empty cell for alignment */}
            </td>
            <td className="px-4 py-2 text-sm text-right text-gray-700">
                {formatNumber(detail.tutar)}
            </td>
        </tr>
    );
};

export default SingleLineDetailRow;