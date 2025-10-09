import React, { useState, useMemo, useEffect } from 'react';
import { User, Product, CommissionTier, PerformanceBonus, Resource, Payout, Sale, ResourceType } from '../data/mockData';
import { supabase } from '../src/lib/supabaseClient';

interface AffiliatePortalProps {
  currentUser: User;
  users: User[];
  products: Product[];
  resources: Resource[];
  payouts: Payout[];
  onSimulateClick: (productId: number, affiliateId: string) => void;
  onStartUpgrade: () => void;
  refetchData: () => void;
  showToast: (message: string) => void;
}

const formatCommissionTiers = (tiers: CommissionTier[]) => {
    if (tiers.length === 0) return "N/A";
    if (tiers.length === 1) return `${tiers[0].rate}%`;
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
    return sortedTiers.map(t => `${t.rate}%`).join(' → ') + ` (after ${sortedTiers[1].threshold} sales)`;
}

const formatBonuses = (bonuses: PerformanceBonus[]) => {
    if (bonuses.length === 0) return null;
    const bonus = bonuses[0]; // Assuming one bonus for simplicity in UI
    return `Bonus: $${bonus.reward} for ${bonus.goal} ${bonus.type}!`;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode, footer?: React.ReactNode }> = ({ title, children, footer }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
    {footer && (
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 text-right rounded-b-lg">
            {footer}
        </div>
    )}
  </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: (enabled: boolean) => void }> = ({ label, enabled, onToggle }) => (
    <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <div className="relative">
        <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
        </div>
  </label>
);

const GetCodeModal: React.FC<{ code: string, onClose: () => void }> = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Embed Code</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Copy and paste this HTML code into your blog or website.</p>
        <div className="relative">
          <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded-lg text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
          <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-md hover:bg-cyan-600">
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div className="text-right mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ currentUser, users, products, resources, payouts, onSimulateClick, onStartUpgrade, refetchData, showToast }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [copiedLink, setCopiedLink] = useState<number | null>(null);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState(currentUser.referralCode || '');
  const [showCodeModal, setShowCodeModal] = useState<string | null>(null);

  // Settings states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [paypalEmail, setPaypalEmail] = useState(currentUser.paypal_email || '');
  const [notifications, setNotifications] = useState(currentUser.notifications || { newSale: true, monthlyReport: false });
  const [expandedSwipe, setExpandedSwipe] = useState<number | null>(null);

  // FIX: Sync local state with currentUser prop when it changes after a refetch
  useEffect(() => {
    if (currentUser) {
        setName(currentUser.name);
        setEmail(currentUser.email);
        setNewReferralCode(currentUser.referralCode || '');
        setPaypalEmail(currentUser.paypal_email || '');
        setNotifications(currentUser.notifications || { newSale: true, monthlyReport: false });
    }
  }, [currentUser]);


  const affiliatePartners = useMemo(() => {
    return users.filter(u => currentUser.partnerIds?.includes(u.id));
  }, [users, currentUser.partnerIds]);

  const { availableCommission, pendingCommission, recentSales } = useMemo(() => {
    let available = 0;
    let pending = 0;
    const sales: Sale[] = [];

    payouts.filter(p => p.user_id === currentUser.id).forEach(p => {
        p.sales.forEach(s => {
            sales.push(s);
            if (s.status === 'Cleared') {
                available += s.commissionAmount;
            } else if (s.status === 'Pending') {
                pending += s.commissionAmount;
            }
        });
    });
    return { 
        availableCommission: available, 
        pendingCommission: pending,
        recentSales: sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    };
  }, [payouts, currentUser.id]);

  const promotableProducts = useMemo(() => {
    if (!selectedPartner) return [];
    return products.filter(p => p.user_id === selectedPartner.id);
  }, [products, selectedPartner]);
  
  const partnerResources = useMemo(() => {
    if (!selectedPartner) return [];
    const promotableProductIds = promotableProducts.map(p => p.id);
    return resources.filter(r => r.productIds.some(id => promotableProductIds.includes(id)));
  }, [resources, promotableProducts, selectedPartner]);

  const handleCopyLink = (link: string, productId: number) => {
    navigator.clipboard.writeText(link).then(() => {
        setCopiedLink(productId);
        setTimeout(() => setCopiedLink(null), 2000);
    });
  };
  
  const handleSaveCode = async () => {
    if (newReferralCode && !/\s/.test(newReferralCode)) {
      const { error } = await supabase
        .from('profiles')
        .update({ referral_code: newReferralCode })
        .eq('id', currentUser.id);

      if (!error) {
        setIsEditingCode(false);
        showToast("Referral code updated!");
        refetchData();
      } else {
        showToast("Error updating referral code.");
      }
    } else {
        showToast("Referral code cannot be empty or contain spaces.");
    }
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
        .from('profiles')
        .update({ name: name, email: email })
        .eq('id', currentUser.id);

    if (error) {
        showToast(`Error updating profile: ${error.message}`);
    } else {
        showToast('Profile updated successfully!');
        refetchData();
    }
  };

  const handleSavePayoutSettings = async () => {
    const { error } = await supabase
        .from('profiles')
        .update({ paypal_email: paypalEmail })
        .eq('id', currentUser.id);

    if (error) {
        showToast(`Error updating payout settings: ${error.message}`);
    } else {
        showToast('Payout settings updated!');
        refetchData();
    }
  }

  const handleSaveNotifications = async () => {
     const { error } = await supabase
        .from('profiles')
        .update({ notifications: notifications })
        .eq('id', currentUser.id);

    if (error) {
        showToast(`Error updating notifications: ${error.message}`);
    } else {
        showToast('Notification settings updated!');
        refetchData();
    }
  }

  const generateEmbedCode = (resource: Resource) => {
    const product = products.find(p => resource.productIds.includes(p.id));
    if (!product || !currentUser.referralCode) return '';
    const affiliateLink = `${product.sales_page_url}?ref=${currentUser.referralCode}`;
    return `<a href="${affiliateLink}" target="_blank" rel="noopener noreferrer">
  <img src="${resource.content}" alt="${resource.description}" />
</a>`;
  };

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
        case 'Cleared': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'Refunded': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  }
  
   const ResourceIcon: React.FC<{type: ResourceType, className?: string}> = ({ type, className="h-full w-full text-gray-400 dark:text-gray-500" }) => {
    switch (type) {
        case 'PDF Guide':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
        case 'Video Link':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case 'Email Swipe':
             return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        default:
            return null;
    }
}

  const renderPartnerDashboard = () => (
    <>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
        
        {!currentUser.roles.includes('creator') && (
            <div className="mb-6 bg-gradient-to-r from-cyan-500 to-teal-400 p-6 rounded-lg shadow text-white">
                <h3 className="text-2xl font-bold">Ready to launch your own affiliate program?</h3>
                <p className="mt-2 mb-4 opacity-90">Become a creator and use PartnerFlow to add your products, invite affiliates, and grow your business.</p>
                <button
                    onClick={onStartUpgrade}
                    className="bg-white text-cyan-600 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                >
                    Become a Creator
                </button>
            </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Your Partners</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Select a partner program to view products and your performance.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {affiliatePartners.map(partner => (
                    <div key={partner.id} onClick={() => setSelectedPartner(partner)} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
                        <img src={partner.avatar} alt={partner.company_name} className="w-16 h-16 rounded-full mb-4"/>
                        <p className="font-bold text-gray-800 dark:text-white text-lg">{partner.company_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">by {partner.name}</p>
                    </div>
                 ))}
             </div>
        </div>
    </>
  );

  const renderProductDashboard = () => (
    <>
    <button onClick={() => setSelectedPartner(null)} className="mb-4 flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Partners
    </button>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Partner Dashboard: {selectedPartner?.company_name}</h2>
    
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Available Commission</h4>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">${availableCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Commission</h4>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">${pendingCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Clicks</h4>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{(currentUser.clicks || 0).toLocaleString()}</p>
        </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</h4>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{currentUser.sales || 0}</p>
        </div>
    </div>

    {/* Product Links Card */}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Your Affiliate Links</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Share these links to earn commissions on products you're approved for.</p>
        <div className="space-y-4">
          {promotableProducts.length > 0 ? promotableProducts.map(product => {
            const affiliateLink = `${product.sales_page_url}?ref=${currentUser.referralCode}`;
            const bonusText = formatBonuses(product.bonuses);
            return (
              <div key={product.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{product.name}</p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-x-3 flex-wrap">
                      <span>${product.price}</span>
                      <span className="font-medium text-cyan-600 dark:text-cyan-400">Commission: {formatCommissionTiers(product.commission_tiers)}</span>
                      {bonusText && <span className="font-medium text-teal-500">{bonusText}</span>}
                    </div>
                  </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
                      <input
                          type="text"
                          readOnly
                          value={affiliateLink}
                          className="w-full sm:w-auto flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                      />
                      <a href={product.sales_page_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-nowrap">
                        Preview Page
                      </a>
                      <button
                          onClick={() => handleCopyLink(affiliateLink, product.id)}
                          className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                      >
                        {copiedLink === product.id ? 'Copied!' : 'Copy Link'}
                      </button>
                        <button
                          onClick={() => onSimulateClick(product.id, currentUser.id)}
                          className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
                      >
                          Simulate Click
                      </button>
                  </div>
                </div>
              </div>
            )
          }) : (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">You are not yet approved to promote any products from this partner.</p>
          )}
        </div>
    </div>

    {/* Marketing Resources */}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Marketing Resources</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Use these pre-made assets for your promotions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerResources.map(resource => {
                const affiliateLink = `${products.find(p => resource.productIds.includes(p.id))?.sales_page_url}?ref=${currentUser.referralCode}`;

                if (resource.type === 'Image') {
                    return (
                        <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
                            <img src={resource.content} alt={resource.name} className="w-full h-48 object-cover bg-gray-200 dark:bg-gray-700"/>
                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{resource.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex-grow">{resource.description}</p>
                                <button onClick={() => setShowCodeModal(generateEmbedCode(resource))} className="w-full mt-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Get Code</button>
                            </div>
                        </div>
                    )
                }
                if (resource.type === 'PDF Guide' || resource.type === 'Video Link') {
                    return (
                        <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col">
                           <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center p-4">
                               <ResourceIcon type={resource.type} />
                           </div>
                           <div className="flex-grow flex flex-col">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{resource.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex-grow">{resource.description}</p>
                                <a href={resource.content} target="_blank" rel="noopener noreferrer" className="w-full mt-auto text-center px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">
                                    {resource.type === 'PDF Guide' ? 'Download PDF' : 'Watch Video'}
                                </a>
                           </div>
                        </div>
                    )
                }
                if (resource.type === 'Email Swipe') {
                    const isExpanded = expandedSwipe === resource.id;
                    const emailContent = resource.content.replace(/\[Your Affiliate Link\]/g, affiliateLink);
                    return (
                        <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col">
                            <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center p-4">
                                <ResourceIcon type={resource.type} />
                           </div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">{resource.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{resource.description}</p>
                            <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <pre className="text-xs whitespace-pre-wrap font-sans p-3 bg-gray-100 dark:bg-gray-900 rounded-md my-2">{emailContent}</pre>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => setExpandedSwipe(isExpanded ? null : resource.id)} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg">{isExpanded ? 'Hide' : 'Show'} Email</button>
                                <button onClick={() => navigator.clipboard.writeText(emailContent)} className="w-full px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Copy Text</button>
                            </div>
                        </div>
                    )
                }
                return null;
            })
          }
        </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Payout Policy</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Commissions are held for a <strong>30-day clearing period</strong> to account for potential customer refunds. After 30 days, cleared commissions become available for payout.
                </p>
            </div>
        </div>
    </div>

    {/* Chart and Recent Referrals */}
    <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Recent Sales</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Commission</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {recentSales.map((sale, index) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{sale.productName}</td>
                            <td className="px-4 py-3 text-green-500">${sale.commissionAmount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{sale.date}</td>
                            <td className="px-4 py-3">
                                  <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(sale.status)}`}>
                                    {sale.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    </div>
    </>
  );

  const renderDashboardContent = () => (
      selectedPartner ? renderProductDashboard() : renderPartnerDashboard()
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <SettingsCard 
                    title="Profile"
                    footer={<button onClick={handleSaveProfile} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Save Changes</button>}
                >
                    <div>
                        <label htmlFor="affiliate-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="affiliate-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="affiliate-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="affiliate-email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <SettingsCard title="Referral & Coupon Codes">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Referral Code</label>
                         {isEditingCode ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    value={newReferralCode}
                                    onChange={(e) => setNewReferralCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                    className="w-full flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                />
                                <button onClick={handleSaveCode} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 text-sm">Save</button>
                                <button onClick={() => setIsEditingCode(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-sm">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{currentUser.referralCode}</span>
                                <button onClick={() => { setIsEditingCode(true); setNewReferralCode(currentUser.referralCode || ''); }} className="font-medium text-sm text-cyan-600 dark:text-cyan-500 hover:underline">Edit</button>
                            </div>
                        )}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Coupon Code</label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="font-mono text-xl font-bold text-teal-500">{currentUser.couponCode || 'N/A'}</span>
                        </div>
                     </div>
                 </SettingsCard>
                 <SettingsCard 
                    title="Payout Settings"
                    footer={<button onClick={handleSavePayoutSettings} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Save Payout Settings</button>}
                 >
                     <div>
                        <label htmlFor="paypal-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PayPal Email</label>
                        <input type="email" id="paypal-email" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} placeholder="your.paypal@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Payments are sent to this PayPal account.</p>
                     </div>
                 </SettingsCard>
                  <SettingsCard 
                    title="Notifications"
                    footer={<button onClick={handleSaveNotifications} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Save Notifications</button>}
                  >
                    <Toggle label="Email me on new sales" enabled={notifications.newSale} onToggle={(val) => setNotifications(p => ({...p, newSale: val}))} />
                    <Toggle label="Send me a monthly performance report" enabled={notifications.monthlyReport} onToggle={(val) => setNotifications(p => ({...p, monthlyReport: val}))} />
                </SettingsCard>
            </div>
        </div>
    </div>
  );

  return (
    <>
      {showCodeModal && <GetCodeModal code={showCodeModal} onClose={() => setShowCodeModal(null)} />}
      <div className="flex flex-col h-full">
         <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'dashboard'
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Dashboard
                </button>
                 <button
                    onClick={() => setActiveTab('settings')}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'settings'
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    Settings
                </button>
            </nav>
        </div>
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? renderDashboardContent() : renderSettingsContent()}
        </main>
      </div>
    </>
  );
};

export default AffiliatePortal;
