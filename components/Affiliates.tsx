import React, { useState, useMemo } from 'react';
import { User } from '../data/mockData';
import { Plan } from '../App';
import AffiliateDetail from './AffiliateDetail';
import AddAffiliateModal from './AddAffiliateModal';
import ConfirmationModal from './ConfirmationModal';
import InviteAffiliateModal from './InviteAffiliateModal';
import { supabase } from '../lib/supabaseClient';

interface AffiliatesProps {
    affiliates: User[];
    showToast: (message: string) => void;
    currentPlan: Plan;
    currentUser: User;
    refetchData: () => void;
}

const getStatusBadge = (status: User['status']) => {
  if (!status) return '';
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Inactive':
    case 'Suspended':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
};

const Affiliates: React.FC<AffiliatesProps> = ({ affiliates, showToast, currentPlan, currentUser, refetchData }) => {
    const [selectedAffiliate, setSelectedAffiliate] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | User['status']>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<User | null>(null);
    const [affiliateToDelete, setAffiliateToDelete] = useState<User | null>(null);
    const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

    const limitReached = affiliates.length >= currentPlan.limits.affiliates;
    const invitationLink = `${window.location.origin}?ref=${currentUser.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(invitationLink);
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
    };

    const handleStatusChange = async (affiliateId: string, newStatus: User['status']) => {
        const { error } = await supabase
            .from('partnerships')
            .update({ status: newStatus })
            .eq('creator_id', currentUser.id)
            .eq('affiliate_id', affiliateId);
        
        if (error) {
            showToast(`Error: ${error.message}`);
        } else {
            showToast('Affiliate status updated!');
            refetchData();
        }
    };

    const handleSaveAffiliate = async (affiliateData: User) => {
        const isEdit = affiliates.some(u => u.id === affiliateData.id);
        
        const profileData = {
            id: affiliateData.id,
            name: affiliateData.name,
            email: affiliateData.email,
            coupon_code: affiliateData.couponCode,
            avatar: affiliateData.avatar || `https://i.pravatar.cc/150?u=${affiliateData.email}`,
            roles: ['affiliate']
        };

        if (isEdit) {
            const { error } = await supabase.from('profiles').update(profileData).eq('id', affiliateData.id);
            if(error) showToast(`Error: ${error.message}`);
            else showToast("Affiliate updated!");
        } else {
            const { data: newProfile, error } = await supabase.from('profiles').insert(profileData).select().single();
            if (error || !newProfile) {
                showToast(`Error: ${error?.message}`);
                return;
            }
            const { error: partnershipError } = await supabase.from('partnerships').insert({
                creator_id: currentUser.id,
                affiliate_id: newProfile.id,
                status: 'Active'
            });
            if (partnershipError) showToast(`Error: ${partnershipError.message}`);
            else showToast("Affiliate added and approved!");
        }
        refetchData();
    };

    const handleDeleteAffiliate = async () => {
        if (affiliateToDelete) {
            const { error } = await supabase
                .from('partnerships')
                .delete()
                .eq('creator_id', currentUser.id)
                .eq('affiliate_id', affiliateToDelete.id);

            if (error) {
                showToast(`Error: ${error.message}`);
            } else {
                showToast("Affiliate removed from your program.");
            }
            setAffiliateToDelete(null);
            refetchData();
        }
    };

    const handleSendInvite = async (email: string) => {
        const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single();

        let affiliateId = existingUser?.id;

        if (!affiliateId) {
            const { data: newProfile, error } = await supabase.from('profiles').insert({
                name: `(${email.split('@')[0]})`, email, roles: ['affiliate'], status: 'Pending',
                avatar: `https://i.pravatar.cc/150?u=${email}`, joinDate: new Date().toISOString().split('T')[0],
            }).select('id').single();
            if (error || !newProfile) {
                showToast(`Error creating profile: ${error?.message}`);
                return;
            }
            affiliateId = newProfile.id;
        }

        const { error: partnershipError } = await supabase.from('partnerships').insert({
            creator_id: currentUser.id, affiliate_id: affiliateId, status: 'Pending'
        }).select();

        if (partnershipError) {
             if (partnershipError.code === '23505') { // unique constraint violation
                showToast("This affiliate is already in your program or has a pending invite.");
            } else {
                showToast(`Error sending invite: ${partnershipError.message}`);
            }
        } else {
            showToast(`Invitation sent to ${email}.`);
            refetchData();
        }
        setIsInviteModalOpen(false);
    };

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
                if (statusFilter === 'All') return true;
                return affiliate.status === statusFilter;
            })
            .filter(affiliate => {
                const query = searchQuery.toLowerCase();
                return (
                    affiliate.name.toLowerCase().includes(query) ||
                    affiliate.email.toLowerCase().includes(query)
                );
            });
    }, [affiliates, statusFilter, searchQuery]);
    
    if (selectedAffiliate) {
        return <AffiliateDetail affiliate={selectedAffiliate} onBack={() => setSelectedAffiliate(null)} />;
    }

  return (
    <div className="space-y-6">
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
     <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
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
                onChange={(e) => setStatusFilter(e.target.value as 'All' | User['status'])}
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
              <th scope="col" className="px-6 py-3">Affiliate</th>
              <th scope="col" className="px-6 py-3">Sales</th>
              <th scope="col" className="px-6 py-3">Commission</th>
              <th scope="col" className="px-6 py-3">Coupon Code</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAffiliates.length > 0 ? (
                filteredAffiliates.map((affiliate) => (
                <tr key={affiliate.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
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
                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(affiliate.status)}`}>
                        {affiliate.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {affiliate.status === 'Pending' ? (
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
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No affiliates found.
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

export default Affiliates;