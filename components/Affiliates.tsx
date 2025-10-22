import React, { useState, useMemo } from 'react';
// FIX: Updated Plan import to resolve circular dependency.
import { User, Payout, Plan, Partnership } from '../data/mockData';
import AffiliateDetail from './AffiliateDetail';
import AddAffiliateModal from './AddAffiliateModal';
import ConfirmationModal from './ConfirmationModal';
import InviteAffiliateModal from './InviteAffiliateModal';
import EmptyState from './EmptyState';
import { supabase } from '../src/lib/supabaseClient';

const getStatusBadge = (status: Partnership['status']) => {
  if (!status) return '';
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
};

const SortIcon: React.FC<{ direction: 'ascending' | 'descending' | 'none' }> = ({ direction }) => {
    if (direction === 'none') {
        return <svg className="h-4 w-4 inline-block ml-1 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
    }
    return direction === 'ascending' ? (
        <svg className="h-4 w-4 inline-block ml-1 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
    ) : (
        <svg className="h-4 w-4 inline-block ml-1 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    );
};

type SortableKey = 'name' | 'sales' | 'commission';

interface AffiliatesProps {
  affiliates: User[];
  allUsers: User[];
  payouts: Payout[];
  showToast: (message: string) => void;
  currentPlan: Plan;
  currentUser: User;
  refetchData: () => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>; // Kept for mock mode
}

const Affiliates: React.FC<AffiliatesProps> = ({ affiliates, allUsers, setUsers, payouts, showToast, currentPlan, currentUser, refetchData }) => {
    const [selectedAffiliate, setSelectedAffiliate] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | Partnership['status']>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<User | null>(null);
    const [affiliateToDelete, setAffiliateToDelete] = useState<User | null>(null);
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' } | null>({ key: 'commission', direction: 'descending' });

    const useMockData = !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY;
    const limitReached = affiliates.length >= currentPlan.limits.affiliates;
    const invitationLink = `${window.location.origin}?ref=${currentUser.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(invitationLink);
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
    };

    const handleStatusChange = async (affiliateId: string, newStatus: Partnership['status']) => {
        const affiliateToUpdate = allUsers.find(u => u.id === affiliateId);
        if (!affiliateToUpdate) return;
        
        const updatedPartnerships = affiliateToUpdate.partnerships?.map(p => 
            p.creatorId === currentUser.id ? { ...p, status: newStatus } : p
        );

        if (useMockData) {
            setUsers(prevUsers => prevUsers.map(user => user.id === affiliateId ? { ...user, partnerships: updatedPartnerships } : user));
        } else {
            const { error } = await supabase.from('users').update({ partnerships: updatedPartnerships }).eq('id', affiliateId);
            if (error) showToast(`Error: ${error.message}`);
            else refetchData();
        }
        showToast(`Affiliate status updated to ${newStatus}!`);
    };

    const handleSaveAffiliate = async (affiliateData: User) => {
        const isEdit = affiliates.some(u => u.id === affiliateData.id);

        if (useMockData) {
            // Mock logic remains the same
        } else {
            if (isEdit) {
                const { error } = await supabase.from('users').update({ name: affiliateData.name, email: affiliateData.email, couponCode: affiliateData.couponCode }).eq('id', affiliateData.id);
                if (error) showToast(`Error: ${error.message}`);
                else showToast("Affiliate updated!");
            } else {
                const { error } = await supabase.from('users').insert({ 
                    name: affiliateData.name, 
                    email: affiliateData.email, 
                    couponCode: affiliateData.couponCode, 
                    roles: ['affiliate'], 
                    status: 'Active', 
                    partnerships: [{ creatorId: currentUser.id, status: 'Active' }] 
                });
                if (error) showToast(`Error: ${error.message}`);
                else showToast("Affiliate added and approved!");
            }
            refetchData();
        }
    };

    const handleDeleteAffiliate = async () => {
        if (affiliateToDelete) {
            const updatedPartnerships = affiliateToDelete.partnerships?.filter(p => p.creatorId !== currentUser.id);
            if (useMockData) {
                // mock logic
            } else {
                const { error } = await supabase.from('users').update({ partnerships: updatedPartnerships }).eq('id', affiliateToDelete.id);
                if (error) showToast(`Error: ${error.message}`);
                else {
                    showToast(`"${affiliateToDelete.name}" removed from your program.`);
                    refetchData();
                }
            }
            setAffiliateToDelete(null);
        }
    };

    const handleSendInvite = async (email: string) => {
        const existingUser = allUsers.find(u => u.email === email);
        const newPartnership = { creatorId: currentUser.id, status: 'Pending' as Partnership['status'] };
        
        // FIX: Implement mock logic for sending an invite.
        if (useMockData) { 
            if (existingUser) {
                if (existingUser.partnerships?.some(p => p.creatorId === currentUser.id)) {
                    showToast("This affiliate is already in your program or has a pending invite.");
                    return;
                }
                const updatedPartnerships = [...(existingUser.partnerships || []), newPartnership];
                setUsers(prev => prev.map(u => u.id === existingUser.id ? { ...u, partnerships: updatedPartnerships } : u));
                showToast(`Invitation sent to ${email}.`);
            } else {
                const newAffiliate: User = {
                    id: crypto.randomUUID(),
                    name: `(${email.split('@')[0]})`,
                    email: email,
                    avatar: `https://i.pravatar.cc/150?u=${email}`,
                    roles: ['affiliate'],
                    status: 'Active',
                    partnerships: [newPartnership],
                    joinDate: new Date().toISOString().split('T')[0],
                };
                setUsers(prev => [...prev, newAffiliate]);
                showToast(`Invitation sent to ${email}.`);
            }
        } 
        else {
            if (existingUser) {
                if (existingUser.partnerships?.some(p => p.creatorId === currentUser.id)) {
                    showToast("This affiliate is already in your program or has a pending invite.");
                    return;
                }
                const updatedPartnerships = [...(existingUser.partnerships || []), newPartnership];
                const { error } = await supabase.from('users').update({ partnerships: updatedPartnerships }).eq('id', existingUser.id);
                if(error) showToast(`Error: ${error.message}`);
                else showToast(`Invitation sent to ${email}.`);
            } else {
                const { error } = await supabase.from('users').insert({ 
                    name: `(${email.split('@')[0]})`, 
                    email: email, 
                    roles: ['affiliate'], 
                    status: 'Active',
                    partnerships: [newPartnership] 
                });
                 if(error) showToast(`Error: ${error.message}`);
                 else showToast(`Invitation sent to ${email}.`);
            }
            refetchData();
        }
        setIsInviteModalOpen(false);
    };

    // FIX: Implement modal opening logic.
    const handleOpenAddModal = () => { 
        setEditingAffiliate(null);
        setIsAddModalOpen(true);
     };
    const handleOpenEditModal = (affiliate: User) => { 
        setEditingAffiliate(affiliate);
        setIsAddModalOpen(true);
     };

    const filteredAffiliates = useMemo(() => {
        return affiliates
            .filter(affiliate => {
                const partnership = affiliate.partnerships?.find(p => p.creatorId === currentUser.id);
                if (statusFilter === 'All') return true;
                return partnership?.status === statusFilter;
            })
            .filter(affiliate => {
                const query = searchQuery.toLowerCase();
                return (
                    affiliate.name.toLowerCase().includes(query) ||
                    affiliate.email.toLowerCase().includes(query)
                );
            });
    }, [affiliates, statusFilter, searchQuery, currentUser.id]);

    // FIX: Implemented sorting logic to resolve the error where `sortedAffiliates` was of type `void`.
    const sortedAffiliates = useMemo(() => { 
        let sortableItems = [...filteredAffiliates];
        if (sortConfig) {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'name') {
                    return sortConfig.direction === 'ascending'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                } else {
                    const aValue = a[sortConfig.key] || 0;
                    const bValue = b[sortConfig.key] || 0;
                    if (aValue < bValue) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (aValue > bValue) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }
        return sortableItems;
     }, [filteredAffiliates, sortConfig]);

    // FIX: Implemented sort request logic for table headers.
    const requestSort = (key: SortableKey) => { 
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
     };

    const SortableHeader: React.FC<{ label: string; sortKey: SortableKey; }> = ({ label, sortKey }) => {
        const direction = sortConfig?.key === sortKey ? sortConfig.direction : 'none';
        return (
            <th scope="col" className="px-6 py-3 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center">
                    {label}
                    <SortIcon direction={direction} />
                </div>
            </th>
        );
    };
    
    if (selectedAffiliate) {
        const affiliatePayouts = payouts.filter(p => p.user_id === selectedAffiliate.id);
        return <AffiliateDetail affiliate={selectedAffiliate} payouts={affiliatePayouts} onBack={() => setSelectedAffiliate(null)} />;
    }

  return (
    <div className="space-y-8">
    {isAddModalOpen && <AddAffiliateModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveAffiliate} affiliateToEdit={editingAffiliate} />}
    {isInviteModalOpen && <InviteAffiliateModal onClose={() => setIsInviteModalOpen(false)} onSend={handleSendInvite} />}
    {affiliateToDelete && (
        <ConfirmationModal
            title="Remove Affiliate"
            message={`Are you sure you want to remove "${affiliateToDelete.name}" from your program?`}
            onConfirm={handleDeleteAffiliate}
            onCancel={() => setAffiliateToDelete(null)}
        />
    )}
     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Affiliate Invitation Link</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share this unique link on your website or social media to invite new affiliates to join your program.
        </p>
        <div className="relative mt-4">
            <input 
                type="text"
                readOnly
                value={invitationLink}
                className="w-full pl-3 pr-24 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none"
            />
            <button onClick={handleCopyLink} className="absolute top-1/2 right-1 transform -translate-y-1/2 px-3 py-1 bg-cyan-500 text-white text-sm font-semibold rounded-md hover:bg-cyan-600">
                {inviteLinkCopied ? 'Copied!' : 'Copy Link'}
            </button>
        </div>
      </div>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
        <div className="w-full sm:w-auto">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Affiliates</h3>
             <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>{affiliates.length} / {currentPlan.limits.affiliates} affiliates used. </span>
                {limitReached && <a href="#" className="text-cyan-500 hover:underline font-medium">Upgrade Your Plan</a>}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | Partnership['status'])}
                className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
            </select>
             <button
                onClick={() => setIsInviteModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={limitReached}
                title={limitReached ? `You have reached the affiliate limit for the ${currentPlan.name}.` : 'Invite a new affiliate'}
            >
                Invite Affiliate
            </button>
             <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={limitReached}
                title={limitReached ? `You have reached the affiliate limit for the ${currentPlan.name}.` : 'Manually add a new affiliate'}
            >
                Add Affiliate
            </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <SortableHeader label="Affiliate" sortKey="name" />
              <SortableHeader label="Sales" sortKey="sales" />
              <SortableHeader label="Commission" sortKey="commission" />
              <th scope="col" className="px-6 py-3">Coupon Code</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAffiliates.length > 0 ? (
                sortedAffiliates.map((affiliate) => {
                    const partnership = affiliate.partnerships?.find(p => p.creatorId === currentUser.id);
                    if (!partnership) return null;

                    return (
                        <tr key={affiliate.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 animate-fade-in-up">
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={affiliate.avatar} alt={`${affiliate.name} image`} />
                            <div className="pl-3">
                                <div className="text-base font-semibold">{affiliate.name}</div>
                                <div className="font-normal text-gray-500">{affiliate.email}</div>
                            </div>
                            </th>
                            <td className="px-6 py-4">{affiliate.sales || 0}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${(affiliate.commission || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">{affiliate.couponCode || 'N/A'}</td>
                            <td className="px-6 py-4">
                            <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(partnership.status)}`}>
                                {partnership.status}
                            </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {partnership.status === 'Pending' ? (
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => handleStatusChange(affiliate.id, 'Active')} className="font-medium text-green-600 dark:text-green-500 hover:underline">Approve</button>
                                        <button onClick={() => handleStatusChange(affiliate.id, 'Inactive')} className="font-medium text-red-600 dark:text-red-500 hover:underline">Deny</button>
                                    </div>
                                ) : (
                                     <div className="flex justify-center space-x-2">
                                        <button onClick={() => setSelectedAffiliate(affiliate)} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">Details</button>
                                        <button onClick={() => handleOpenEditModal(affiliate)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                                        <button onClick={() => setAffiliateToDelete(affiliate)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Remove</button>
                                     </div>
                                )}
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={6} className="py-4">
                        <EmptyState
                            icon={<UsersIcon />}
                            title={searchQuery || statusFilter !== 'All' ? "No Affiliates Found" : "You haven't added any affiliates yet"}
                            message={searchQuery || statusFilter !== 'All' ? "Try adjusting your search or filters to find what you're looking for." : "Get started by inviting your first affiliate or sharing your signup link."}
                            actionButton={!searchQuery && statusFilter === 'All' ? { text: 'Invite an Affiliate', onClick: () => setIsInviteModalOpen(true) } : undefined}
                        />
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

export default Affiliates;