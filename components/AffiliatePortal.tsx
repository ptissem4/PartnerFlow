

import React, { useState, useMemo } from 'react';
import { User, Product, CommissionTier, PerformanceBonus, Creative, Payout, Sale } from '../data/mockData';
// FIX: Corrected path to import from `src/lib/supabaseClient.ts`.
import { supabase } from '../src/lib/supabaseClient';

interface AffiliatePortalProps {
  currentUser: User;
  users: User[];
  products: Product[];
  payouts: Payout[];
  onSimulateClick: (productId: number, affiliateId: string) => void;
  onStartUpgrade: () => void;
  refetchData: () => void;
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


const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ currentUser, users, products, payouts, onSimulateClick, onStartUpgrade, refetchData }) => {
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [copiedLink, setCopiedLink] = useState<number | null>(null);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState(currentUser.referralCode || '');
  const [showCodeModal, setShowCodeModal] = useState<string | null>(null);

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
        refetchData();
      } else {
        alert("Error updating referral code.");
      }
    } else {
        alert("Referral code cannot be empty or contain spaces.");
    }
  };

  const generateEmbedCode = (creative: Creative, product: Product) => {
    if (!product || !currentUser.referralCode) return '';
    const affiliateLink = `${product.sales_page_url}?ref=${currentUser.referralCode}`;
    return `<a href="${affiliateLink}" target="_blank" rel="noopener noreferrer">
  <img src="${creative.imageUrl}" alt="${creative.description}" />
</a>`;
  };

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
        case 'Cleared': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'Refunded': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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

    {/* Marketing Creatives */}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Marketing Creatives</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Use these pre-made assets for your promotions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotableProducts.flatMap(product => 
            product.creatives.map(creative => (
              <div key={`${product.id}-${creative.id}`} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <img src={creative.imageUrl} alt={creative.name} className="w-full h-auto object-cover bg-gray-200 dark:bg-gray-700"/>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{creative.name}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">For: {product.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{creative.description}</p>
                  <button 
                    onClick={() => setShowCodeModal(generateEmbedCode(creative, product))}
                    className="w-full px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">
                    Get Code
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Your Referral Code</h3>
            {isEditingCode ? (
                <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newReferralCode}
                        onChange={(e) => setNewReferralCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="w-full flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <button onClick={handleSaveCode} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600">Save</button>
                    <button onClick={() => setIsEditingCode(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancel</button>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{currentUser.referralCode}</span>
                    <button onClick={() => { setIsEditingCode(true); setNewReferralCode(currentUser.referralCode || ''); }} className="font-medium text-sm text-cyan-600 dark:text-cyan-500 hover:underline">Edit</button>
                </div>
            )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Your Coupon Code</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <span className="font-mono text-2xl font-bold text-teal-500">{currentUser.couponCode || 'N/A'}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Share this code with your audience! Sales made with this code are automatically tracked to you.</p>
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

  return (
    <>
      {showCodeModal && <GetCodeModal code={showCodeModal} onClose={() => setShowCodeModal(null)} />}
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-y-auto">
          {selectedPartner ? renderProductDashboard() : renderPartnerDashboard()}
        </main>
      </div>
    </>
  );
};

export default AffiliatePortal;