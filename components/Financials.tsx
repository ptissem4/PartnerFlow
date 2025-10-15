import React, { useState, useMemo } from 'react';
import { Payment, User, Plan } from '../data/mockData';
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
} from 'recharts';
import DateRangeFilter from './DateRangeFilter';
import EmptyState from './EmptyState';

type DateRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

interface FinancialsProps {
  payments: Payment[];
  clients: User[];
  planDetails: { [key: string]: Plan };
}

const getDateRange = (preset: DateRangePreset, customStart?: Date, customEnd?: Date): { start: Date, end: Date } => {
    const end = customEnd ? new Date(customEnd) : new Date();
    end.setHours(23, 59, 59, 999);
    const start = customStart ? new Date(customStart) : new Date();
    start.setHours(0, 0, 0, 0);

    switch (preset) {
        case 'today': break;
        case '7d': start.setDate(start.getDate() - 6); break;
        case '30d': start.setDate(start.getDate() - 29); break;
        case 'this_month': start.setDate(1); break;
        case 'last_month': start.setMonth(start.getMonth() - 1, 1); end.setMonth(end.getMonth(), 0); break;
        case 'this_year': start.setMonth(0, 1); break;
        case 'last_year': start.setFullYear(start.getFullYear() - 1, 0, 1); end.setFullYear(end.getFullYear() - 1, 11, 31); break;
        case 'custom': if (customStart) start.setTime(customStart.getTime()); if (customEnd) end.setTime(customEnd.getTime()); break;
    }
    return { start, end };
};

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
    <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
  </div>
);

const Financials: React.FC<FinancialsProps> = ({ payments, clients, planDetails }) => {
    const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const { start, end } = useMemo(() => {
        if (dateRange === 'custom' && customStartDate && customEndDate) {
            return getDateRange('custom', new Date(customStartDate), new Date(customEndDate));
        }
        return getDateRange(dateRange);
    }, [dateRange, customStartDate, customEndDate]);

    const filteredPayments = useMemo(() => payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate >= start && paymentDate <= end;
    }), [payments, start, end]);

    const stats = useMemo(() => {
        const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const activeSubscriptions = new Set(filteredPayments.map(p => p.user_id)).size;
        
        const newClientsInPeriod = clients.filter(c => {
            const joinDate = c.joinDate ? new Date(c.joinDate) : new Date(0);
            return joinDate >= start && joinDate <= end;
        });

        const newMrr = newClientsInPeriod.reduce((sum, client) => {
            if (client.currentPlan && planDetails[client.currentPlan]) {
                const plan = planDetails[client.currentPlan];
                return sum + (client.billingCycle === 'annual' ? plan.annualPrice / 12 : plan.price);
            }
            return sum;
        }, 0);

        const arpu = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

        return { totalRevenue, newMrr, arpu, activeSubscriptions };
    }, [filteredPayments, clients, planDetails, start, end]);

    const revenueOverTimeData = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredPayments.forEach(p => {
            if (!data[p.date]) data[p.date] = 0;
            data[p.date] += p.amount;
        });
        return Object.entries(data)
            .map(([date, revenue]) => ({ name: date, revenue }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [filteredPayments]);
    
    const revenueByPlanData = useMemo(() => {
        const data: { [key: string]: number } = {};
        filteredPayments.forEach(p => {
            if (!data[p.plan]) data[p.plan] = 0;
            data[p.plan] += p.amount;
        });
        return Object.entries(data).map(([plan, revenue]) => ({ name: plan, revenue }));
    }, [filteredPayments]);

    const recentPayments = useMemo(() => filteredPayments
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map(p => ({
            ...p,
            client: clients.find(c => c.id === p.user_id)
        })), [filteredPayments, clients]);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Financials</h2>
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
                <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="New MRR" value={`$${stats.newMrr.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="ARPU" value={`$${stats.arpu.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="Active Subscriptions" value={stats.activeSubscriptions.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Revenue Over Time</h3>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueOverTimeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                                <YAxis stroke={tickColor} fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }} formatter={(v: number) => `$${v.toFixed(2)}`} />
                                <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Revenue by Plan</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByPlanData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
                                <YAxis stroke={tickColor} fontSize={12} tickFormatter={(v) => `$${Number(v) / 1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }} formatter={(v: number) => `$${v.toFixed(2)}`} />
                                <Bar dataKey="revenue" fill="#22d3ee" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Payments</h3>
                  <div className="overflow-x-auto">
                    {recentPayments.length > 0 ? (
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.map(p => (
                                    <tr key={p.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 flex items-center gap-x-3">
                                            <img src={p.client?.avatar} alt={p.client?.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-medium text-gray-800 dark:text-white">{p.client?.name}</span>
                                        </td>
                                        <td className="px-6 py-4">{p.plan}</td>
                                        <td className="px-6 py-4 font-semibold">${p.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">{p.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState 
                            icon={<BanknotesIcon />}
                            title="No Payments Found"
                            message="There are no payment records for the selected period."
                        />
                    )}
                </div>
             </div>
        </div>
    );
};

const BanknotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-cyan-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;

export default Financials;