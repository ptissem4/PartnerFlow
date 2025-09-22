import React, { useState, useMemo } from 'react';
import { User, planDetails, Product, Payment } from '../data/mockData';
import ClientDetail from './ClientDetail';

interface ClientManagementProps {
    clients: User[];
    allUsers: User[];
    allProducts: Product[];
    allPayments: Payment[];
    onPlanChange: (userId: string, newPlanName: string) => void;
    onSuspend: (userId: string) => void;
    onDelete: (userId: string) => void;
    onImpersonate: (userId: string) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients, allUsers, allProducts, allPayments, onPlanChange, onSuspend, onDelete, onImpersonate }) => {
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [planFilter, setPlanFilter] = useState<string>('All');

    const clientData = useMemo(() => {
        return clients.map(client => {
            const affiliateCount = allUsers.filter(u => u.partnerIds?.includes(client.id)).length;
            // FIX: Property 'userId' does not exist on type 'Product'. Did you mean 'user_id'?
            const productCount = allProducts.filter(p => p.user_id === client.id).length;
            // FIX: Property 'userId' does not exist on type 'Payment'. Did you mean 'user_id'?
            const ltv = allPayments.filter(p => p.user_id === client.id).reduce((sum, p) => sum + p.amount, 0);
            return { ...client, affiliateCount, productCount, ltv };
        })
    }, [clients, allUsers, allProducts, allPayments]);

    const filteredClients = useMemo(() => {
        return clientData
            .filter(client => planFilter === 'All' || client.currentPlan === planFilter)
            .filter(client => {
                const query = searchQuery.toLowerCase();
                return (
                    client.name.toLowerCase().includes(query) ||
                    client.email.toLowerCase().includes(query) ||
                    client.companyName?.toLowerCase().includes(query)
                );
            });
    }, [clientData, planFilter, searchQuery]);
    
    if (selectedClient) {
        const clientAffiliates = allUsers.filter(u => u.partnerIds?.includes(selectedClient.id));
        // FIX: Property 'userId' does not exist on type 'Product'. Did you mean 'user_id'?
        const clientProducts = allProducts.filter(p => p.user_id === selectedClient.id);
        // FIX: Property 'userId' does not exist on type 'Payment'. Did you mean 'user_id'?
        const clientPayments = allPayments.filter(p => p.user_id === selectedClient.id);

        return <ClientDetail 
            client={selectedClient} 
            onBack={() => setSelectedClient(null)} 
            onPlanChange={onPlanChange}
            onSuspend={onSuspend}
            onDelete={onDelete}
            onImpersonate={onImpersonate}
            affiliates={clientAffiliates}
            products={clientProducts}
            payments={clientPayments}
        />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Client Management</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <input 
                        type="text"
                        placeholder="Search by name, email, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="All">All Plans</option>
                        {Object.keys(planDetails).map(planName => (
                            <option key={planName} value={planName}>{planName}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Current Plan</th>
                            <th scope="col" className="px-6 py-3">Affiliates</th>
                            <th scope="col" className="px-6 py-3">Products</th>
                            <th scope="col" className="px-6 py-3">LTV</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                    <img className="w-10 h-10 rounded-full" src={client.avatar} alt={client.name} />
                                    <div className="pl-3">
                                        <div className="text-base font-semibold">{client.name}</div>
                                        <div className="font-normal text-gray-500">{client.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-cyan-100 text-cyan-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-cyan-900 dark:text-cyan-300">{client.currentPlan}</span>
                                </td>
                                <td className="px-6 py-4">{client.affiliateCount}</td>
                                <td className="px-6 py-4">{client.productCount}</td>
                                <td className="px-6 py-4 font-semibold">${client.ltv.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => setSelectedClient(client)} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientManagement;