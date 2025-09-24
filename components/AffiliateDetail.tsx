
import React, { useMemo } from 'react';
import { User, Payout } from '../data/mockData';
import SalesPerformanceChart from './SalesPerformanceChart';

const AffiliateDetail: React.FC<{ affiliate: User, payouts: Payout[], onBack: () => void }> = ({ affiliate, payouts, onBack }) => {
  const { salesHistory, recentReferrals } = useMemo(() => {
    const allSales = payouts.flatMap(p => p.sales);

    const recentReferralsData = allSales
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(sale => ({
            product: sale.productName,
            amount: sale.saleAmount,
            date: sale.date,
        }));
    
    const salesByMonth: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const today = new Date();
    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
        salesByMonth[monthName] = 0;
        monthKeys.push(monthName);
    }
    
    const startOf6Months = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    allSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        if (saleDate >= startOf6Months) {
             const saleMonthName = `${monthNames[saleDate.getMonth()]} '${String(saleDate.getFullYear()).slice(-2)}`;
            if (salesByMonth.hasOwnProperty(saleMonthName)) {
                salesByMonth[saleMonthName] += sale.saleAmount;
            }
        }
    });

    const salesHistoryData = monthKeys.map(name => ({ name, sales: salesByMonth[name] }));
    
    return { salesHistory: salesHistoryData, recentReferrals: recentReferralsData };
  }, [payouts]);

  return (
    <div>
        <button onClick={onBack} className="mb-4 flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Affiliates
        </button>
    
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 flex flex-col sm:flex-row items-center">
        <img src={affiliate.avatar} alt={affiliate.name} className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0" />
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{affiliate.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{affiliate.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Joined on: {affiliate.joinDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</h4>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{affiliate.sales || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Commission</h4>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">${(affiliate.commission || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Clicks</h4>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{(affiliate.clicks || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Conversion Rate</h4>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{affiliate.conversionRate || 0}%</p>
        </div>
      </div>
      
      {/* Chart and Recent Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sales Performance (6 Months)</h3>
          <div className="h-64">
             <SalesPerformanceChart data={salesHistory} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Referrals</h3>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {recentReferrals.length > 0 ? (
                        recentReferrals.map((referral, index) => (
                            <tr key={index} className="border-b dark:border-gray-700">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{referral.product}</td>
                                <td className="px-4 py-3 text-green-500">${referral.amount}</td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{referral.date}</td>
                            </tr>
                        ))
                    ) : (
                         <tr><td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">No recent referrals found.</td></tr>
                    )}
                </tbody>
             </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AffiliateDetail;
