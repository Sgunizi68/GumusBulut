import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpandableBankaHesabiRow from '../ExpandableBankaHesabiRow';

// Mock the Icons since they're not relevant for this test
jest.mock('../../constants', () => ({
  Icons: {
    ChevronDown: () => <div data-testid="chevron-down" />,
    ChevronRight: () => <div data-testid="chevron-right" />,
  }
}));

// Mock the formatNumber utility
jest.mock('../../utils/formatNumber', () => ({
  formatNumber: (value: number) => value.toFixed(2).replace('.', ',')
}));

// Mock the SingleLineDetailRow component
jest.mock('../SingleLineDetailRow', () => {
  return function MockSingleLineDetailRow({ detail }: any) {
    return (
      <tr data-testid="single-line-detail">
        <td>{detail.tip} - {detail.hesap_adi} - {detail.tarih} - {detail.aciklama}</td>
        <td></td>
        <td>{detail.tutar}</td>
      </tr>
    );
  };
});

describe('ExpandableBankaHesabiRow', () => {
  const mockBankaHesabiGroup = {
    hesap_adi: 'Ziraat Bankası',
    hesap_total: 5000.00,
    record_count: 2,
    details: [
      {
        odeme_id: 1,
        tip: 'Banka Ödeme',
        hesap_adi: 'Ziraat Bankası',
        tarih: '2023-01-15',
        aciklama: 'Kira ödemesi',
        tutar: 3000.00
      },
      {
        odeme_id: 2,
        tip: 'Banka Ödeme',
        hesap_adi: 'Ziraat Bankası',
        tarih: '2023-01-20',
        aciklama: 'Elektrik faturası',
        tutar: 2000.00
      }
    ]
  };

  it('renders bank account header correctly when collapsed', () => {
    render(
      <table>
        <tbody>
          <ExpandableBankaHesabiRow
            bankaHesabiGroup={mockBankaHesabiGroup}
            donem={2301}
            kategoriId={1}
            isExpanded={false}
            onToggle={jest.fn()}
          />
        </tbody>
      </table>
    );

    // Check bank account name is displayed
    expect(screen.getByText('Ziraat Bankası')).toBeInTheDocument();
    
    // Check record count is displayed
    expect(screen.getByText('2 kayıt')).toBeInTheDocument();
    
    // Check total amount is displayed
    expect(screen.getByText('5.000,00')).toBeInTheDocument();
    
    // Check chevron right icon is displayed (collapsed state)
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    
    // Check details are not rendered
    expect(screen.queryByTestId('single-line-detail')).not.toBeInTheDocument();
  });

  it('renders bank account details when expanded', () => {
    render(
      <table>
        <tbody>
          <ExpandableBankaHesabiRow
            bankaHesabiGroup={mockBankaHesabiGroup}
            donem={2301}
            kategoriId={1}
            isExpanded={true}
            onToggle={jest.fn()}
          />
        </tbody>
      </table>
    );

    // Check bank account name is displayed
    expect(screen.getByText('Ziraat Bankası')).toBeInTheDocument();
    
    // Check chevron down icon is displayed (expanded state)
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    
    // Check details are rendered
    const details = screen.getAllByTestId('single-line-detail');
    expect(details).toHaveLength(2);
    
    // Check first detail content
    expect(screen.getByText('Banka Ödeme - Ziraat Bankası - 2023-01-15 - Kira ödemesi')).toBeInTheDocument();
    expect(screen.getByText('3000')).toBeInTheDocument();
    
    // Check second detail content
    expect(screen.getByText('Banka Ödeme - Ziraat Bankası - 2023-01-20 - Elektrik faturası')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
  });

  it('calls onToggle when bank account header is clicked', () => {
    const mockOnToggle = jest.fn();
    
    render(
      <table>
        <tbody>
          <ExpandableBankaHesabiRow
            bankaHesabiGroup={mockBankaHesabiGroup}
            donem={2301}
            kategoriId={1}
            isExpanded={false}
            onToggle={mockOnToggle}
          />
        </tbody>
      </table>
    );

    // Click on the bank account header button
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    
    // Check that onToggle was called
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});