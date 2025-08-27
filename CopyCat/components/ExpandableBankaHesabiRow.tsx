import React from 'react';
import { Icons } from '../constants';
import { OdemeRaporBankaHesabiGroup, OdemeRaporDetail } from '../types';
import { formatNumber } from '../utils/formatNumber';
import SingleLineDetailRow from './SingleLineDetailRow';

interface ExpandableBankaHesabiRowProps {
    bankaHesabiGroup: OdemeRaporBankaHesabiGroup;
    donem: number;
    kategoriId: number | null;
    isExpanded: boolean;
    onToggle: () => void;
}

const ExpandableBankaHesabiRow: React.FC<ExpandableBankaHesabiRowProps> = ({
    bankaHesabiGroup,
    donem,
    kategoriId,
    isExpanded,
    onToggle
}) => {
    return (
        <>
            {/* Bank Account Header Row */}
            <tr className="bg-gray-100 border-l-4 border-green-500">
                <td className="px-4 py-3">
                    <button
                        onClick={onToggle}
                        className="flex items-center text-left w-full"
                    >
                        {isExpanded ? (
                            <Icons.ChevronDown className="w-4 h-4 mr-2 text-green-600" />
                        ) : (
                            <Icons.ChevronRight className="w-4 h-4 mr-2 text-green-600" />
                        )}
                        <span className="font-medium text-gray-800">{bankaHesabiGroup.hesap_adi}</span>
                    </button>
                </td>
                <td className="px-4 py-3 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {bankaHesabiGroup.record_count} kayıt
                    </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-700">
                    {formatNumber(bankaHesabiGroup.hesap_total)}
                </td>
            </tr>

            {/* Detail Rows (shown when expanded) */}
            {isExpanded && bankaHesabiGroup.details.map((detail) => (
                <SingleLineDetailRow key={detail.odeme_id} detail={detail} />
            ))}
        </>
    );
};

export default ExpandableBankaHesabiRow;