import React, { useState, useMemo } from 'react';
import { User, Product, Payout } from '../data/mockData';

interface ReportsProps {
  affiliates: User[];
  products: Product[];
  payouts: Payout[];
}

type TimeFilter = '30d' | '90d' | 'all';

const Reports: React.FC<ReportsProps> = ({ affiliates, products, payouts }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  const filteredSales = useMemo(() => {
    if (timeFilter === 'all') {
      return payouts.flatMap(p => p.sales.map(s => ({ ...s, affiliateId: p.userId })));
    }
    const now = new Date();
    const days = timeFilter === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.setDate(now.getDate() - days));

    return payouts.flatMap(p => 
      p.sales
        .filter(s => new Date(s.date) >= cutoffDate)
        .map(s => ({ ...s, affiliateId: p.userId }))
    );
  }, [payouts, timeFilter]);

  const affiliateReport = useMemo(() => {
    const stats: { [key: number]: { sales: number; commission: number } } = {};

    filteredSales.forEach(sale => {
      if (!stats[sale.affiliateId]) {
        stats[sale.affiliateId] = { sales: 0, commission: 0 };
      }
      stats[sale.affiliateId].sales += 1;
      stats[sale.affiliateId].commission += sale.commissionAmount;
    });

    return affiliates.map(affiliate => ({
      'Affiliate Name': affiliate.name,
      'Clicks': affiliate.clicks || 0, // Note: Clicks are total, not period-specific in this data model
      'Sales': stats[affiliate.id]?.sales || 0,
      'Conversion Rate (%)': (affiliate.clicks || 0) > 0 ? (((stats[affiliate.id]?.sales || 0) / (affiliate.clicks as number)) * 100).toFixed(2) : '0.00',
      'Commission Earned ($)': (stats[affiliate.id]?.commission || 0).toFixed(2),
    })).sort((a, b) => parseFloat(b['Commission Earned ($)']) - parseFloat(a['Commission Earned ($)']));
  }, [filteredSales, affiliates]);

  const productReport = useMemo(() => {
    const stats: { [key: number]: { sales: number; commission: number } } = {};

    filteredSales.forEach(sale => {
      if (!stats[sale.productId]) {
        stats[sale.productId] = { sales: 0, commission: 0 };
      }
      stats[sale.productId].sales += 1;
      stats[sale.productId].commission += sale.commissionAmount;
    });

    return products.map(product => ({
        'Product Name': product.name,
        'Clicks': product.clicks, // Note: Clicks are total, not period-specific
        'Sales': stats[product.id]?.sales || 0,
        'Conversion Rate (%)': product.clicks > 0 ? (((stats[product.id]?.sales || 0) / product.clicks) * 100).toFixed(2) : '0.00',
        'Commission Generated ($)': (stats[product.id]?.commission || 0).toFixed(2),
    })).sort((a, b) => parseFloat(b['Commission Generated ($)']) - parseFloat(a['Commission Generated ($)']));
  }, [filteredSales, products]);
  
  const handleExport = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = (data: any[], title: string, exportFilename: string) => (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
        <button
          onClick={() => handleExport(data, exportFilename)}
          className="w-full sm:w-auto px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {data.length > 0 && Object.keys(data[0]).map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((row, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                {Object.values(row).map((value, i) => (
                  <td key={i} className={`px-6 py-4 ${i === 0 ? 'font-semibold text-gray-900 dark:text-white' : ''}`}>
                    {String(value)}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-10">No data for this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h2>
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-sm font-medium mt-4 sm:mt-0">
          {(['30d', '90d', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-3 py-1 rounded-full transition-colors ${timeFilter === period ? 'bg-white dark:bg-gray-800 shadow text-cyan-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {period === '30d' && 'Last 30 Days'}
              {period === '90d' && 'This Quarter'}
              {period === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {renderTable(affiliateReport, 'Performance by Affiliate', 'affiliate-performance.csv')}
      {renderTable(productReport, 'Performance by Product', 'product-performance.csv')}
    </div>
  );
};

export default Reports;
