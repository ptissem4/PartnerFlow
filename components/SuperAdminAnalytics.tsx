import React, { useMemo, useState } from 'react';
import { User, Product, Payout } from '../data/mockData';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  Cell,
} from 'recharts';
import DateRangeFilter from './DateRangeFilter';

type DateRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

interface SuperAdminAnalyticsProps {
  users: User[];
  products: Product[];
  payouts: Payout[];
}

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

const StatCard: React.FC<{ title: string; value: string; icon: JSX.Element; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center">
        <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-900/50 mr-4">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const SuperAdminAnalytics: React.FC<SuperAdminAnalyticsProps> = ({ users, products, payouts }) => {
    const [dateRange, setDateRange] = useState<DateRangePreset>('this_year');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const { start, end } = useMemo(() => {
        if (dateRange === 'custom' && customStartDate && customEndDate) {
            return getDateRange('custom', new Date(customStartDate), new Date(customEndDate));
        }
        return getDateRange(dateRange);
    }, [dateRange, customStartDate, customEndDate]);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';

    const statsInPeriod = useMemo(() => {
        const creators = users.filter(u => u.roles.includes('creator') && u.joinDate && new Date(u.joinDate) >= start && new Date(u.joinDate) <= end).length;
        const affiliates = users.filter(u => u.roles.includes('affiliate') && u.joinDate && new Date(u.joinDate) >= start && new Date(u.joinDate) <= end).length;
        const newProducts = products.filter(p => new Date(p.creationDate) >= start && new Date(p.creationDate) <= end).length;
        const commissions = payouts
            .flatMap(p => p.sales)
            .filter(s => new Date(s.date) >= start && new Date(s.date) <= end)
            .reduce((sum, sale) => sum + sale.commissionAmount, 0);

        return { creators, affiliates, newProducts, commissions };
    }, [users, products, payouts, start, end]);

    const userGrowthData = useMemo(() => {
        const monthlyData: { [key: string]: { creators: number; affiliates: number } } = {};
        
        users.forEach(user => {
            if (user.joinDate) {
                const month = user.joinDate.substring(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = { creators: 0, affiliates: 0 };
                }
                if (user.roles.includes('creator')) monthlyData[month].creators++;
                if (user.roles.includes('affiliate')) monthlyData[month].affiliates++;
            }
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        let cumulativeCreators = 0;
        let cumulativeAffiliates = 0;

        return sortedMonths
            .map(month => {
                cumulativeCreators += monthlyData[month].creators;
                cumulativeAffiliates += monthlyData[month].affiliates;
                return { name: month, Creators: cumulativeCreators, Affiliates: cumulativeAffiliates };
            })
            .filter(d => new Date(d.name + "-01T00:00:00") <= end); // Filter data up to the end date
    }, [users, end]);

    const productGrowthData = useMemo(() => {
        const monthlyData: { [key: string]: number } = {};

        products.forEach(product => {
            const month = product.creationDate.substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month]++;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        let cumulativeProducts = 0;
        return sortedMonths
            .map(month => {
                cumulativeProducts += monthlyData[month];
                return { name: month, Products: cumulativeProducts };
            })
            .filter(d => new Date(d.name + "-01T00:00:00") <= end);
    }, [products, end]);
    
    const commissionByMonthData = useMemo(() => {
         const monthlyData: { [key: string]: number } = {};
         payouts.flatMap(p => p.sales)
            .filter(s => new Date(s.date) >= start && new Date(s.date) <= end)
            .forEach(sale => {
                const month = sale.date.substring(0, 7);
                if(!monthlyData[month]) monthlyData[month] = 0;
                monthlyData[month] += sale.commissionAmount;
            });

         return Object.entries(monthlyData)
            .map(([month, commission]) => ({ name: month, Commission: commission }))
            .sort((a,b) => a.name.localeCompare(b.name));

    }, [payouts, start, end]);

    // Onboarding Funnel Analytics
    const onboardingFunnelData = useMemo(() => {
        const creatorUsers = users.filter(u => u.roles.includes('creator'));
        const totalCreators = creatorUsers.length;
        if (totalCreators === 0) return { completionRate: 0, funnelData: [] };

        const steps = [
            { name: "Step 1: Welcome", count: 0 },
            { name: "Step 2: Add Product", count: 0 },
            { name: "Step 3: Tracking", count: 0 },
            { name: "Step 4: Invite Affiliate", count: 0 },
            { name: "Step 5: Complete", count: 0 },
        ];

        creatorUsers.forEach(user => {
            const step = user.onboardingStepCompleted || 0;
            if (step >= 1) steps[0].count++;
            if (step >= 2) steps[1].count++;
            if (step >= 3) steps[2].count++;
            if (step >= 4) steps[3].count++;
            if (step >= 5) steps[4].count++;
        });
        
        const completionRate = (steps[4].count / totalCreators) * 100;

        return {
            completionRate,
            funnelData: steps.map((step, index) => ({
                ...step,
                previousCount: index > 0 ? steps[index-1].count : totalCreators,
            }))
        };
    }, [users]);
    
    const funnelColors = ["#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#cffafe"];


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Platform Analytics</h2>
                <DateRangeFilter 
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    customStartDate={customStartDate}
                    setCustomStartDate={setCustomStartDate}
                    customEndDate={customEndDate}
                    setCustomEndDate={setCustomEndDate}
                />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="New Creators" value={statsInPeriod.creators.toLocaleString()} icon={<UsersIcon className="text-cyan-600 dark:text-cyan-400"/>} />
                <StatCard title="New Affiliates" value={statsInPeriod.affiliates.toLocaleString()} icon={<UsersIcon className="text-cyan-600 dark:text-cyan-400"/>} />
                <StatCard title="New Products" value={statsInPeriod.newProducts.toLocaleString()} icon={<TagIcon className="text-cyan-600 dark:text-cyan-400"/>} />
                <StatCard title="Commissions Generated" value={`$${statsInPeriod.commissions.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<CreditCardIcon className="text-cyan-600 dark:text-cyan-400"/>} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Creator Onboarding Funnel</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                        <p className="text-5xl font-bold text-cyan-500">{onboardingFunnelData.completionRate.toFixed(1)}%</p>
                        <p className="font-semibold text-gray-600 dark:text-gray-300 mt-2">Completion Rate</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {onboardingFunnelData.funnelData[4]?.count} of {users.filter(u=>u.roles.includes('creator')).length} creators completed onboarding.
                        </p>
                    </div>
                     <div className="md:col-span-2 h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={onboardingFunnelData.funnelData} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fill: tickColor, fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(200,200,200,0.1)' }}
                                    contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }}
                                    formatter={(value: number, name, props) => {
                                        const { payload } = props;
                                        const conversion = payload.previousCount > 0 ? ((value / payload.previousCount) * 100).toFixed(1) : 100;
                                        return [`${value} users (${conversion}%)`, 'Reached this step'];
                                    }}
                                />
                                <Bar dataKey="count" barSize={30}>
                                    {onboardingFunnelData.funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={funnelColors[index % funnelColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Cumulative User Growth</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                            <YAxis stroke={tickColor} fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Creators" stroke="#06b6d4" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Affiliates" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Cumulative Product Growth</h3>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={productGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                                <YAxis stroke={tickColor} fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Products" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Commissions Generated Per Month (in Period)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={commissionByMonthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                                <YAxis stroke={tickColor} fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="Commission" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UsersIcon = ({className = ''}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TagIcon = ({className = ''}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11m0-11h11" /></svg>;
const CreditCardIcon = ({className = ''}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

export default SuperAdminAnalytics;