import React, { useState } from 'react';
import { User, planDetails, Product, Payment } from '../data/mockData';
import ConfirmationModal from './ConfirmationModal';

interface ClientDetailProps {
    client: User;
    affiliates: User[];
    products: Product[];
    payments: Payment[];
    onBack: () => void;
    onPlanChange: (userId: string, newPlanName: string) => void;
    onSuspend: (userId: string) => void;
    onDelete: (userId: string) => void;
    onImpersonate: (userId: string) => void;
}

const getStatusBadge = (status: User['status']) => {
    if (!status) return '';
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Suspended': return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
};

const ClientDetail: React.FC<ClientDetailProps> = ({ client, affiliates, products, payments, onBack, onPlanChange, onSuspend, onDelete, onImpersonate }) => {
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(client.currentPlan || '');
    const [actionToConfirm, setActionToConfirm] = useState<'suspend' | 'delete' | null>(null);

    const handleSavePlan = () => {
        onPlanChange(client.id, selectedPlan);
        setIsPlanModalOpen(false);
    };
    
    const handleConfirmAction = () => {
        if (actionToConfirm === 'suspend') {
            onSuspend(client.id);
        } else if (actionToConfirm === 'delete') {
            onDelete(client.id);
            onBack(); // Go back to list after deletion
        }
        setActionToConfirm(null);
    };
    
    const renderConfirmationModal = () => {
        if (!actionToConfirm) return null;
        const isSuspending = actionToConfirm === 'suspend';
        const isSuspended = client.status === 'Suspended';
        return (
            <ConfirmationModal
                title={isSuspending ? (isSuspended ? 'Reactivate User' : 'Suspend User') : 'Delete User'}
                message={`Are you sure you want to ${isSuspending ? (isSuspended ? 'reactivate' : 'suspend') : 'delete'} "${client.name}"? ${isSuspending ? 'They will not be able to log in.' : 'This action is irreversible.'}`}
                onConfirm={handleConfirmAction}
                onCancel={() => setActionToConfirm(null)}
            />
        )
    };

    return (
        <>
            {renderConfirmationModal()}
            {isPlanModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={() => setIsPlanModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Change Plan for {client.name}</h2>
                        <div className="mb-4">
                            <label htmlFor="plan-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select new plan</label>
                            <select
                                id="plan-select"
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {Object.keys(planDetails).map(planName => (
                                    <option key={planName} value={planName}>{planName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                            <button onClick={handleSavePlan} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg">Save Plan</button>
                        </div>
                    </div>
                 </div>
            )}
            <div>
                <button onClick={onBack} className="mb-4 flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Clients
                </button>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex flex-col sm:flex-row items-center">
                            <img src={client.avatar} alt={client.name} className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0" />
                            <div className="text-center sm:text-left">
                              <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-x-3">{client.name} <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${getStatusBadge(client.status)}`}>{client.status}</span></h2>
                              <p className="text-gray-500 dark:text-gray-400">{client.email}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Joined on: {client.joinDate}</p>
                            </div>
                        </div>
                         <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 self-center sm:self-start">
                             <button onClick={() => onImpersonate(client.id)} className="px-3 py-2 text-sm bg-teal-500 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-600">Impersonate User</button>
                             <button onClick={() => setActionToConfirm('suspend')} className={`px-3 py-2 text-sm font-semibold rounded-lg shadow-sm ${client.status === 'Suspended' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}>
                                {client.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                             </button>
                             <button onClick={() => setActionToConfirm('delete')} className="px-3 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700">Delete</button>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Subscription</h3>
                            <div className="space-y-2">
                                <p><span className="font-semibold text-gray-500 dark:text-gray-400">Current Plan:</span> {client.currentPlan}</p>
                                <p><span className="font-semibold text-gray-500 dark:text-gray-400">Price:</span> ${planDetails[client.currentPlan as keyof typeof planDetails].price}/mo</p>
                            </div>
                            <button onClick={() => setIsPlanModalOpen(true)} className="w-full mt-4 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">
                                Change Plan
                            </button>
                        </div>
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Products ({products.length})</h3>
                             <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                                {products.map(p => <li key={p.id}>{p.name} - ${p.price}</li>)}
                             </ul>
                        </div>
                    </div>
                     <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Affiliates ({affiliates.length})</h3>
                             <div className="max-h-60 overflow-y-auto">
                                <ul className="space-y-2">
                                    {affiliates.map(a => (
                                        <li key={a.id} className="flex items-center gap-x-3 text-sm">
                                            <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full" />
                                            <span>{a.name}</span>
                                            <span className={`text-xs font-medium ml-auto px-2 py-0.5 rounded-full ${getStatusBadge(a.status)}`}>{a.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Payment History</h3>
                             <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs text-gray-500 uppercase">
                                        <tr><th>Date</th><th>Plan</th><th className="text-right">Amount</th></tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id} className="border-b dark:border-gray-700">
                                                <td className="py-1">{p.date}</td>
                                                <td>{p.plan}</td>
                                                <td className="text-right font-semibold">${p.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </>
    );
};

export default ClientDetail;