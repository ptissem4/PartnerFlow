import React, { useState, useMemo } from 'react';
import { User, Payout } from '../data/mockData';
import ConfirmationModal from './ConfirmationModal';
import PayoutDetailModal from './PayoutDetailModal';

interface PartnerflowAffiliatesProps {
    affiliates: User[];
    payouts: Payout[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setPayouts: React.Dispatch<React.SetStateAction<Payout[]>>;
    showToast: (message: string) => void;
    currentUser: User;
}

const getStatusBadge = (status: User['status'] | Payout['status']) => {
  if (!status) return '';
  switch (status) {
    case 'Active':
    case 'Paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Pending':
    case 'Due':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
};

const PartnerflowAffiliates: React.FC<PartnerflowAffiliatesProps> = ({ affiliates, payouts, setUsers, setPayouts, showToast, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'manage' | 'payouts'>('manage');
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
    
    const invitationLink = `${window.location.origin}?ref=${currentUser.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(invitationLink);
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
    };

    const handleStatusChange = (id: string, newStatus: User['status']) => {
        setUsers(users => users.map(user => {
            if (user.id === id) {
                showToast(`Affiliate ${user.name} has been ${newStatus}.`);
                return { ...user, status: newStatus };
            }
            return user;
        }));
    };

    const duePayouts = useMemo(() => payouts.filter(p => p.status === 'Due'), [payouts]);
    const historyPayouts = useMemo(() => payouts.filter(p => p.status !== 'Due').sort((a,b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()), [payouts]);
    const totalDueAmount = useMemo(() => duePayouts.reduce((sum, p) => sum + p.amount, 0), [duePayouts]);

    const handleMassPayout = () => {
        if (duePayouts.length === 0) {
            showToast("No due payouts to process.");
            return;
        }
        setPayouts(prevPayouts => 
            prevPayouts.map(p => p.status === 'Due' ? { ...p, status: 'Scheduled' } : p)
        );
        showToast(`${duePayouts.length} PartnerFlow affiliate payouts have been scheduled!`);
    };

    const renderManageTab = () => (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Affiliate</th>
                            <th scope="col" className="px-6 py-3">Sales</th>
                            <th scope="col" className="px-6 py-3">Commission</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {affiliates.map(affiliate => (
                            <tr key={affiliate.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                    <img className="w-10 h-10 rounded-full" src={affiliate.avatar} alt={affiliate.name} />
                                    <div className="pl-3">
                                        <div className="text-base font-semibold">{affiliate.name}</div>
                                        <div className="font-normal text-gray-500">{affiliate.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{affiliate.sales || 0}</td>
                                <td className="px-6 py-4 font-semibold">${(affiliate.commission || 0).toLocaleString()}</td>
                                <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(affiliate.status)}`}>{affiliate.status}</span></td>
                                <td className="px-6 py-4 text-center">
                                    {affiliate.status === 'Pending' && (
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleStatusChange(affiliate.id, 'Active')} className="font-medium text-green-600 dark:text-green-500 hover:underline">Approve</button>
                                            <button onClick={() => handleStatusChange(affiliate.id, 'Inactive')} className="font-medium text-red-600 dark:text-red-500 hover:underline">Deny</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderPayoutsTab = () => (
        <>
            <div className="flex justify-end mb-4">
                 <button
                    onClick={handleMassPayout}
                    className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                >
                    Pay All Due Affiliates (${totalDueAmount.toLocaleString()})
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Affiliate</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Period</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                       {[...duePayouts, ...historyPayouts].map(payout => (
                            <tr key={payout.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                    <img className="w-10 h-10 rounded-full" src={payout.affiliate_avatar} alt={payout.affiliate_name} />
                                    <div className="pl-3">
                                        <div className="text-base font-semibold">{payout.affiliate_name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold">${payout.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">{payout.period}</td>
                                <td className="px-6 py-4"><span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(payout.status)}`}>{payout.status}</span></td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => setSelectedPayout(payout)} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <div className="space-y-6">
            {selectedPayout && <PayoutDetailModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} />}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Your PartnerFlow Affiliate Link</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Share this link to earn a recurring 30% commission on every customer you refer to PartnerFlow.</p>
                <div className="relative mt-4">
                    <input type="text" readOnly value={invitationLink} className="w-full pl-3 pr-24 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"/>
                    <button onClick={handleCopyLink} className="absolute top-1/2 right-1 transform -translate-y-1/2 px-3 py-1 bg-cyan-500 text-white text-sm font-semibold rounded-md hover:bg-cyan-600">
                        {inviteLinkCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('manage')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'manage' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                            Manage Affiliates
                        </button>
                        <button onClick={() => setActiveTab('payouts')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'payouts' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                            Payouts
                        </button>
                    </nav>
                </div>
                <div className="mt-4">
                    {activeTab === 'manage' ? renderManageTab() : renderPayoutsTab()}
                </div>
            </div>
        </div>
    );
};

export default PartnerflowAffiliates;