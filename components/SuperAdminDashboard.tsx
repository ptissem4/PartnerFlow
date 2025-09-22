import React, { useState, useMemo } from 'react';
import { planDetails as PlanDetailsType, Payment, User } from '../data/mockData';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import DateRangeFilter from './DateRangeFilter';

type DateRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

interface SuperAdminDashboardProps {
  payments: Payment[];
  clients: User[];
  planDetails: typeof PlanDetailsType;
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

const StatCard: React.FC<{ title: string; value: string; change?: string; }> = ({ title, value, change }) => {
    const isIncrease = change && parseFloat(change) >= 0;
    const changeColor = !change ? 'text-gray-500' : isIncrease ? 'text-green-500' : 'text-red-500';
    const Arrow = !change ? null : isIncrease ? '↑' : '↓';
  
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
        <div className="flex items-baseline gap-x-2">
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
             {change && <p className={`text-sm font-semibold ${changeColor}`}>{Arrow} {change}</p>}
        </div>
      </div>
    );
};

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ payments, clients, planDetails }) => {
    const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const { start, end } = useMemo(() => {
        if(dateRange === 'custom' && customStartDate && customEndDate) {
            return getDateRange('custom', new Date(customStartDate), new Date(customEndDate));
        }
        return getDateRange(dateRange);
    }, [dateRange, customStartDate, customEndDate]);
    
    // Calculate previous period for comparison
    const { prevStart, prevEnd } = useMemo(() => {
        const duration = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - duration);
        return { prevStart, prevEnd };
    }, [start, end]);
    
    const calculateMRR = (endDate: Date, clients: User[], plans: typeof PlanDetailsType): number => {
        return clients.reduce((totalMRR, client) => {
            const joinDate = client.joinDate ? new Date(client.joinDate) : null;
            // Only count subscribed users who joined before the end date of the period
            if (joinDate && joinDate <= endDate && client.billingCycle && client.currentPlan) {
                const plan = plans[client.currentPlan as keyof typeof plans];
                if (plan) {
                    const monthlyValue = client.billingCycle === 'annual' ? plan.annualPrice / 12 : plan.price;
                    return totalMRR + monthlyValue;
                }
            }
            return totalMRR;
        }, 0);
    };

    const calculateStats = (startDate: Date, endDate: Date) => {
        const filteredPayments = payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate >= startDate && paymentDate <= endDate;
        });
        const newClients = clients.filter(c => {
            const joinDate = c.joinDate ? new Date(c.joinDate) : new Date(0);
            return joinDate >= startDate && joinDate <= endDate;
        });

        const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const activeCustomers = new Set(filteredPayments.map(p => p.userId)).size;
        const mrr = calculateMRR(endDate, clients, planDetails);
        
        return { totalRevenue, activeCustomers, newClientsCount: newClients.length, mrr };
    };

    const currentPeriodStats = useMemo(() => calculateStats(start, end), [start, end, payments, clients, planDetails]);
    const previousPeriodStats = useMemo(() => calculateStats(prevStart, prevEnd), [prevStart, prevEnd, payments, clients, planDetails]);

    const getChangePercent = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '100.0%' : '0.0%';
        const change = ((current - previous) / previous) * 100;
        return `${change.toFixed(1)}%`;
    };

    const chartData = useMemo(() => {
        const dailyData: { [key: string]: number } = {};
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const useMonthly = diffDays > 90;

        payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate >= start && paymentDate <= end;
        }).forEach(p => {
            const key = useMonthly ? p.date.substring(0, 7) : p.date; // YYYY-MM or YYYY-MM-DD
            if (!dailyData[key]) dailyData[key] = 0;
            dailyData[key] += p.amount;
        });

        return Object.entries(dailyData)
            .map(([date, revenue]) => ({ name: date, revenue }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    }, [payments, start, end]);
    
    const recentActivity = clients
        .sort((a,b) => (b.joinDate && a.joinDate) ? new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime() : 0)
        .slice(0, 5);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Super Admin Dashboard</h2>
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
                 <StatCard title="Total Revenue" value={`$${currentPeriodStats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} change={getChangePercent(currentPeriodStats.totalRevenue, previousPeriodStats.totalRevenue)} />
                 <StatCard title="MRR" value={`$${currentPeriodStats.mrr.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} change={getChangePercent(currentPeriodStats.mrr, previousPeriodStats.mrr)} />
                 <StatCard title="Active Customers" value={currentPeriodStats.activeCustomers.toString()} change={getChangePercent(currentPeriodStats.activeCustomers, previousPeriodStats.activeCustomers)} />
                 <StatCard title="New Customers" value={currentPeriodStats.newClientsCount.toString()} change={getChangePercent(currentPeriodStats.newClientsCount, previousPeriodStats.newClientsCount)} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Revenue Over Time</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                        <YAxis stroke={tickColor} fontSize={12} tickFormatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : ''} />
                        <Tooltip
                            contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                            formatter={(value: number) => `$${value.toFixed(2)}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
                    <ul className="space-y-4">
                        {recentActivity.map(client => (
                            <li key={client.id} className="flex items-center">
                                <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full mr-3" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">{client.name} just signed up!</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.joinDate}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;