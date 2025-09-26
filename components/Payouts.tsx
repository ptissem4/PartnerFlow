import React, { useState, useMemo } from 'react';
import { Payout, User, UserSettings } from '../data/mockData';
import PayoutDetailModal from './PayoutDetailModal';
import { Page } from '../src/App';
import { supabase } from '../src/lib/supabaseClient';

interface PayoutsProps {
  payouts: Payout[];
  userSettings: UserSettings | null;
  setActivePage: (page: Page) => void;
  showToast: (message: string) => void;
  refetchData: () => void;
}

const getStatusBadge = (status: Payout['status']) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Due':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
};

const Payouts: React.FC<PayoutsProps> = ({ payouts, userSettings, setActivePage, showToast, refetchData }) => {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [activeTab, setActiveTab] = useState<'due' | 'history'>('due');

  const isStripeConnected = userSettings?.integrations.stripe === 'Connected';

  const duePayouts = useMemo(() => payouts.filter(p => p.status === 'Due'), [payouts]);
  const historyPayouts = useMemo(() => payouts.filter(p => p.status === 'Paid' || p.status === 'Scheduled').sort((a,b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()), [payouts]);
  const totalDueAmount = useMemo(() => duePayouts.reduce((sum, p) => sum + p.amount, 0), [duePayouts]);

  const handleMassPayout = async () => {
    if (!isStripeConnected) {
        showToast("Please connect Stripe in Settings to enable payouts.");
        setActivePage('Settings');
        return;
    }
    if (duePayouts.length === 0) {
        showToast("No due payouts to process.");
        return;
    }

    const duePayoutIds = duePayouts.map(p => p.id);
    const { error } = await supabase
        .from('payouts')
        .update({ status: 'Scheduled' })
        .in('id', duePayoutIds);

    if (error) {
        showToast(`Error scheduling payouts: ${error.message}`);
    } else {
        showToast(`${duePayouts.length} payouts have been scheduled successfully!`);
        refetchData();
    }
  };

  const activePayouts = activeTab === 'due' ? duePayouts : historyPayouts;

  return (
    <>
    {selectedPayout && <PayoutDetailModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} />}
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Payouts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and automate payments to your affiliates.</p>
          </div>
          <button
            onClick={handleMassPayout}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isStripeConnected && totalDueAmount === 0}
          >
            {isStripeConnected ? `Initiate Mass Payout via Stripe ($${totalDueAmount.toLocaleString()})` : 'Configure Payouts to Pay All'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('due')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'due'
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Due Payouts <span className="ml-1.5 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{duePayouts.length}</span>
                </button>
                 <button
                    onClick={() => setActiveTab('history')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'history'
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Payout History
                </button>
            </nav>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Affiliate</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Period</th>
                <th scope="col" className="px-6 py-3">Due Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activePayouts.map((payout) => (
                <tr key={payout.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" onClick={() => setSelectedPayout(payout)}>
                  <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <img className="w-10 h-10 rounded-full" src={payout.affiliate_avatar} alt={`${payout.affiliate_name} image`} />
                    <div className="pl-3">
                      <div className="text-base font-semibold">{payout.affiliate_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${payout.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{payout.period}</td>
                  <td className="px-6 py-4">{payout.due_date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedPayout(payout)} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">View Details</button>
                  </td>
                </tr>
              ))}
               {activePayouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    No payouts in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default Payouts;