import React, { useState, useMemo } from 'react';
import StatCard from './StatCard';
import { User, Product, Payout } from '../data/mockData';
import SalesPerformanceChart from './SalesPerformanceChart';
import RecordSaleModal from './RecordSaleModal';
import DateRangeFilter from './DateRangeFilter';

interface DashboardProps {
  affiliates: User[];
  products: Product[];
  payouts: Payout[];
  onRecordSale: (affiliateId: string, productId: string, saleAmount: number) => void;
  onRecordSaleByCoupon: (couponCode: string, productId: string, saleAmount: number) => void;
  onSimulatePurchase: () => void;
}

type DateRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

// This function is duplicated in multiple components. Ideally, it would be in a utils file.
const getDateRange = (preset: DateRangePreset, customStart?: Date, customEnd?: Date): { start: Date, end: Date } => {
    const end = customEnd ? new Date(customEnd) : new Date();
    end.setHours(23, 59, 59, 999);
    const start = customStart ? new Date(customStart) : new Date();
    start.setHours(0, 0, 0, 0);

    switch (preset) {
        case 'today':
            break;
        case '7d':
            start.setDate(start.getDate() - 6);
            break;
        case '30d':
            start.setDate(start.getDate() - 29);
            break;
        case 'this_month':
            start.setDate(1);
            break;
        case 'last_month':
            start.setMonth(start.getMonth() - 1, 1);
            end.setMonth(end.getMonth(), 0);
            break;
        case 'this_year':
            start.setMonth(0, 1);
            break;
        case 'last_year':
            start.setFullYear(start.getFullYear() - 1, 0, 1);
            end.setFullYear(end.getFullYear() - 1, 11, 31);
            break;
        case 'custom':
            if (customStart) start.setTime(customStart.getTime());
            if (customEnd) end.setTime(customEnd.getTime());
            break;
    }
    return { start, end };
};

const Dashboard: React.FC<DashboardProps> = ({ affiliates, products, payouts, onRecordSale, onRecordSaleByCoupon, onSimulatePurchase }) => {
    const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const { start, end } = useMemo(() => {
        if(dateRange === 'custom' && customStartDate && customEndDate) {
            return getDateRange('custom', new Date(customStartDate), new Date(customEndDate));
        }
        return getDateRange(dateRange);
    }, [dateRange, customStartDate, customEndDate]);

    const monthlySalesData = useMemo(() => {
        const salesByMonth: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const today = new Date();
        const monthKeys: string[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
            salesByMonth[monthName] = 0;
            monthKeys.push(monthName);
        }

        const startOf12Months = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        
        payouts.forEach(payout => {
            payout.sales.forEach(sale => {
                const saleDate = new Date(sale.date);
                if (saleDate >= startOf12Months) {
                    const saleMonthName = `${monthNames[saleDate.getMonth()]} '${String(saleDate.getFullYear()).slice(-2)}`;
                    if (salesByMonth.hasOwnProperty(saleMonthName)) {
                        salesByMonth[saleMonthName] += sale.saleAmount;
                    }
                }
            });
        });

        return monthKeys.map(name => ({ name, sales: salesByMonth[name] }));
    }, [payouts]);

    const topAffiliates = [...affiliates]
        .filter(a => a.status === 'Active')
        .sort((a, b) => (b.commission || 0) - (a.commission || 0))
        .slice(0, 5);

    const topProducts = [...products]
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, 5);

    const { payableCommissions, pendingCommissions } = useMemo(() => {
        let payable = 0;
        let pending = 0;

        const salesInPeriod = payouts
            .flatMap(p => p.sales)
            .filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= start && saleDate <= end;
            });

        salesInPeriod.forEach(sale => {
            if (sale.status === 'Cleared') {
                payable += sale.commissionAmount;
            } else if (sale.status === 'Pending') {
                pending += sale.commissionAmount;
            }
        });
        
        return { payableCommissions: payable, pendingCommissions: pending };
    }, [payouts, start, end]);
    
    const totalLinkClicks = affiliates.reduce((sum, affiliate) => sum + (affiliate.clicks || 0), 0);
    const activeAffiliatesCount = affiliates.filter(a => a.status === 'Active').length;


  return (
    <>
    {isRecordSaleModalOpen && 
        <RecordSaleModal 
            affiliates={affiliates}
            products={products}
            onClose={() => setIsRecordSaleModalOpen(false)}
            onRecordSaleByLink={onRecordSale}
            onRecordSaleByCoupon={onRecordSaleByCoupon}
        />
    }
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
         <DateRangeFilter
            dateRange={dateRange}
            setDateRange={setDateRange}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
         />
        <div className="flex gap-2">
            <button
                onClick={() => setIsRecordSaleModalOpen(true)}
                className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
            >
                Record Manual Sale
            </button>
            <button
                onClick={onSimulatePurchase}
                className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
            >
                Simulate Purchase
            </button>
        </div>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Payable Commissions" value={`$${payableCommissions.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <StatCard title="Pending Commissions" value={`$${pendingCommissions.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        <StatCard title="Total Link Clicks" value={totalLinkClicks.toLocaleString()} />
        <StatCard title="Active Affiliates" value={activeAffiliatesCount.toString()} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Affiliate Sales Performance (12 Months)</h3>
          <div className="h-80">
            <SalesPerformanceChart data={monthlySalesData} />
          </div>
        </div>

        {/* Top Lists */}
        <div className="space-y-6">
            {/* Top Affiliates */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Affiliates</h3>
            <ul className="space-y-4">
                {topAffiliates.map(affiliate => (
                <li key={affiliate.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                    <img src={affiliate.avatar} alt={affiliate.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="font-medium text-gray-800 dark:text-white">{affiliate.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{affiliate.email}</p>
                    </div>
                    </div>
                    <span className="font-semibold text-cyan-500">${(affiliate.commission || 0).toLocaleString()}</span>
                </li>
                ))}
            </ul>
            </div>
             {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Top Products</h3>
            <ul className="space-y-4">
                {topProducts.map(product => (
                <li key={product.id} className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">${product.price}</p>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{product.sales_count} sales</span>
                </li>
                ))}
            </ul>
            </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;