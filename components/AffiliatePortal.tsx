import React, { useState, useMemo } from 'react';
import { User, Product, Payout, Resource, ResourceType, Partnership } from '../data/mockData';
import AffiliateSettings from './AffiliateSettings';
import AffiliateOnboardingModal from './AffiliateOnboardingModal';
import { ActiveView } from '../src/App';
import Marketplace from './Marketplace';
import SalesPerformanceChart from './SalesPerformanceChart';

interface AffiliatePortalProps {
    affiliate: User;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    allUsers: User[];
    allProducts: Product[];
    payouts: Payout[];
    allResources: Resource[];
    onLogout: () => void;
    setActiveView: (view: ActiveView) => void;
    showToast: (message: string) => void;
    onApply: (creatorId: string) => void;
}

type AffiliatePage = 'Dashboard' | 'Programs' | 'Resources' | 'Payouts' | 'Marketplace' | 'Settings';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
);

const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ affiliate, setUsers, allUsers, allProducts, payouts, allResources, onLogout, setActiveView, showToast, onApply }) => {
    const [activePage, setActivePage] = useState<AffiliatePage>('Dashboard');
    const [activeProgram, setActiveProgram] = useState<User | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(affiliate.onboardingStepCompleted === undefined);
    const [copiedResourceId, setCopiedResourceId] = useState<number | null>(null);

    const canSwitchToCreator = affiliate.roles.includes('creator');

    const handleLogoClick = () => {
        setActivePage('Dashboard');
        setActiveProgram(null);
    };

    // FIX: A component must return JSX, not implicitly void.
    const ResourceIcon: React.FC<{type: ResourceType}> = ({ type }) => {
        const className = "h-5 w-5 text-gray-500 dark:text-gray-400";
        switch (type) {
            case 'Image':
                return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case 'PDF Guide':
                return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
            case 'Video Link':
                return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
            case 'Email Swipe':
                 return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        }
        return null;
    };

    const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
        const handleCopy = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(resource.content);
            setCopiedResourceId(resource.id);
            setTimeout(() => setCopiedResourceId(null), 2000);
        };

        const cardContent = (
            <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-x-3 h-full">
                <div className="flex-shrink-0 mt-1">
                    <ResourceIcon type={resource.type} />
                </div>
                <div className="flex-grow">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{resource.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{resource.description}</p>
                </div>
                {resource.type === 'Email Swipe' && (
                    <button onClick={handleCopy} className="self-end px-2 py-1 bg-teal-500 text-white text-xs font-semibold rounded-md hover:bg-teal-600 flex-shrink-0">
                        {copiedResourceId === resource.id ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
        );
    
        if (resource.type === 'Email Swipe') {
            return <div>{cardContent}</div>;
        }

        return (
            <a href={resource.content} target="_blank" rel="noopener noreferrer" className="block hover:shadow-md transition-shadow rounded-lg">
                {cardContent}
            </a>
        );
    };

    const ProgramDetailView: React.FC<{
        affiliate: User,
        partner: User,
        products: Product[],
        resources: Resource[],
        onBack: () => void,
    }> = ({ affiliate, partner, products, resources, onBack }) => {
        const [copiedProductId, setCopiedProductId] = useState<number | null>(null);
    
        const handleCopy = (textToCopy: string, id: number) => {
            navigator.clipboard.writeText(textToCopy);
            setCopiedProductId(id);
            setTimeout(() => setCopiedProductId(null), 2000);
        };

        const generalResources = resources.filter(res => res.productIds.length === 0);
    
        return (
            <div className="space-y-6">
                <button onClick={onBack} className="flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    &larr; Back to My Programs
                </button>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Products from {partner.company_name}</h3>
                    <div className="space-y-4">
                        {products.map(product => {
                            const productUrl = new URL(product.sales_page_url);
                            productUrl.searchParams.set('ref', affiliate.referralCode || '');
                            const productReferralLink = productUrl.toString();
                            return (
                                <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{product.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">${product.price} - <span className="text-cyan-500 font-medium">{product.commission_tiers[0]?.rate || 0}% Commission</span></p>
                                    </div>
                                    <button onClick={() => handleCopy(productReferralLink, product.id)} className="px-3 py-1.5 bg-teal-500 text-white text-sm font-semibold rounded-md hover:bg-teal-600 w-full sm:w-auto flex-shrink-0">
                                        {copiedProductId === product.id ? 'Copied!' : 'Copy Product Link'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Resources</h3>
                    {products.map(product => {
                        const productResources = resources.filter(res => res.productIds.includes(product.id));
                        if (productResources.length === 0) return null;

                        return (
                            <div key={product.id}>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 text-lg">{product.name}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {productResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                                </div>
                            </div>
                        );
                    })}

                    {generalResources.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 text-lg">General Resources</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {generalResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                            </div>
                        </div>
                    )}

                    {resources.length === 0 && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No resources available for this program yet.</p>
                    )}
                </div>
            </div>
        );
    };

    const affiliatePayouts = useMemo(() => payouts.filter(p => p.user_id === affiliate.id), [payouts, affiliate.id]);
    const affiliateResources = useMemo(() => {
        const creatorIds = affiliate.partnerships?.filter(p => p.status === 'Active').map(p => p.creatorId) || [];
        return allResources.filter(r => creatorIds.includes(r.user_id));
    }, [allResources, affiliate.partnerships]);

    const dashboardStats = useMemo(() => {
        const allSales = affiliatePayouts.flatMap(p => p.sales);
        const totalCommission = allSales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
        const pendingCommission = allSales.filter(s => s.status === 'Pending').reduce((sum, sale) => sum + sale.commissionAmount, 0);
        const clicks = affiliate.clicks || 0;
        const totalSalesCount = allSales.length;
        const conversionRate = clicks > 0 ? (totalSalesCount / clicks) * 100 : 0;
        return { totalCommission, pendingCommission, clicks, totalSalesCount, conversionRate, allSales };
    }, [affiliatePayouts, affiliate.clicks]);

    const commissionChartData = useMemo(() => {
        const salesByMonth: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const today = new Date();
        const monthKeys: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
            salesByMonth[monthName] = 0;
            monthKeys.push(monthName);
        }
        
        const startOf6Months = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        dashboardStats.allSales.forEach(sale => {
            const saleDate = new Date(sale.date);
            if (saleDate >= startOf6Months) {
                const saleMonthName = `${monthNames[saleDate.getMonth()]} '${String(saleDate.getFullYear()).slice(-2)}`;
                if (salesByMonth.hasOwnProperty(saleMonthName)) {
                    salesByMonth[saleMonthName] += sale.commissionAmount;
                }
            }
        });
        return monthKeys.map(name => ({ name, sales: salesByMonth[name] }));
    }, [dashboardStats.allSales]);

    const handleUpdateProfile = (updatedData: Partial<User>) => {
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === affiliate.id ? { ...u, ...updatedData } : u)
        );
        showToast("Profile updated successfully!");
    };

    const getPartnershipStatusBadge = (status: Partnership['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    }
    
    const getPayoutStatusBadge = (status: Payout['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Due': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        }
    };
    

    const renderDashboard = () => (
         <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Commission" value={`$${dashboardStats.totalCommission.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="Pending Commission" value={`$${dashboardStats.pendingCommission.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="Total Clicks" value={dashboardStats.clicks.toLocaleString()} />
                <StatCard title="Conversion Rate" value={`${dashboardStats.conversionRate.toFixed(2)}%`} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Commission Performance (6 Months)</h3>
                    <div className="h-80">
                        <SalesPerformanceChart data={commissionChartData} />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Sales</h3>
                    <ul className="space-y-3">
                        {dashboardStats.allSales.slice(0, 5).map(sale => (
                            <li key={sale.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">{sale.productName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(sale.date).toLocaleDateString()}</p>
                                </div>
                                <span className="font-semibold text-green-500">+${sale.commissionAmount.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderPrograms = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Programs</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="space-y-3">
                    {affiliate.partnerships && affiliate.partnerships.length > 0 ? (
                        affiliate.partnerships.map(p => {
                            const creator = allUsers.find(u => u.id === p.creatorId);
                            if (!creator) return null;
                            const canView = p.status === 'Active';
                            return (
                                <div key={p.creatorId} className={`flex items-center justify-between p-4 rounded-lg ${canView ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : 'bg-gray-100 dark:bg-gray-700 opacity-70'}`}
                                     onClick={() => canView && setActiveProgram(creator)}>
                                    <div className="flex items-center">
                                        <img src={creator.avatar} alt={creator.company_name} className="w-10 h-10 rounded-full mr-4" />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{creator.company_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Affiliate Program</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getPartnershipStatusBadge(p.status)}`}>
                                        {p.status}
                                    </span>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">You haven't joined any programs yet. Check out the marketplace!</p>
                    )}
                </div>
            </div>
        </div>
    );
    
    const renderResources = () => {
        const activePartnerships = affiliate.partnerships?.filter(p => p.status === 'Active') || [];
    
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Marketing Resources</h2>
                {activePartnerships.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center text-gray-500 dark:text-gray-400">
                        You haven't joined any active programs yet. Resources will appear here once you're approved.
                    </div>
                )}
                {activePartnerships.map(p => {
                    const creator = allUsers.find(u => u.id === p.creatorId);
                    if (!creator) return null;
    
                    const creatorProducts = allProducts.filter(prod => prod.user_id === creator.id);
                    const creatorResources = affiliateResources.filter(res => res.user_id === creator.id);
    
                    if (creatorResources.length === 0) return null;
    
                    const generalResources = creatorResources.filter(res => res.productIds.length === 0);
    
                    return (
                        <div key={creator.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">From {creator.company_name}</h3>
                            
                            {creatorProducts.map(product => {
                                const productResources = creatorResources.filter(res => res.productIds.includes(product.id));
                                if (productResources.length === 0) return null;
    
                                return (
                                    <div key={product.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">{product.name}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {productResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                                        </div>
                                    </div>
                                );
                            })}
    
                            {generalResources.length > 0 && (
                                 <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">General Resources</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {generalResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };
    
    const renderPayouts = () => (
         <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Payouts</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">From</th>
                            </tr>
                        </thead>
                        <tbody>
                            {affiliatePayouts.sort((a,b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime()).map(payout => {
                                // FIX: Corrected operator precedence bug that compared string and Sale object.
                                // This is a clearer way to find the creator for the payout.
                                const creatorId = payout.sales[0] ? allProducts.find(p => p.id === payout.sales[0].productId)?.user_id : undefined;
                                const creator = creatorId ? allUsers.find(u => u.id === creatorId) : undefined;
                                return (
                                    <tr key={payout.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">{payout.due_date}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${payout.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getPayoutStatusBadge(payout.status)}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                         <td className="px-6 py-4">{creator?.company_name || 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        if (activeProgram) {
            return <ProgramDetailView 
                        affiliate={affiliate} 
                        partner={activeProgram}
                        products={allProducts.filter(p => p.user_id === activeProgram.id)}
                        resources={allResources.filter(r => r.user_id === activeProgram.id)}
                        onBack={() => setActiveProgram(null)}
                    />;
        }

        switch (activePage) {
            case 'Dashboard': return renderDashboard();
            case 'Programs': return renderPrograms();
            case 'Resources': return renderResources();
            case 'Payouts': return renderPayouts();
            case 'Marketplace':
                return <Marketplace 
                            products={allProducts.filter(p => p.isPubliclyListed)}
                            users={allUsers}
                            onBack={() => setActivePage('Dashboard')}
                            currentUser={affiliate}
                            onApply={onApply}
                        />;
            case 'Settings':
                return <AffiliateSettings affiliate={affiliate} onUpdateProfile={handleUpdateProfile} showToast={showToast} />;
        }
    };
    
    const navItems: { page: AffiliatePage, label: string, icon: React.ReactNode }[] = [
        { page: 'Dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { page: 'Programs', label: 'Programs', icon: <BriefcaseIcon /> },
        { page: 'Resources', label: 'Resources', icon: <GiftIcon /> },
        { page: 'Payouts', label: 'Payouts', icon: <WalletIcon /> },
        { page: 'Marketplace', label: 'Marketplace', icon: <StoreIcon /> },
        { page: 'Settings', label: 'Settings', icon: <CogIcon /> },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {showOnboarding && <AffiliateOnboardingModal affiliate={affiliate} onComplete={() => setShowOnboarding(false)} onSkip={() => setShowOnboarding(false)} />}
             <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <div className="flex items-center">
                     <button onClick={handleLogoClick} className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-cyan-500 rounded-lg" aria-label="Go to affiliate dashboard">
                        <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white ml-3">Affiliate Portal</h2>
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    {canSwitchToCreator && (
                        <button onClick={() => setActiveView('creator')} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500">
                            Switch to Creator View
                        </button>
                    )}
                     <button onClick={onLogout} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500">
                        Logout
                    </button>
                    <img src={affiliate.avatar} alt={affiliate.name} className="w-10 h-10 rounded-full" />
                </div>
            </header>
             <div className="flex-1 flex">
                <nav className="w-64 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.page}>
                                <button
                                    onClick={() => { setActivePage(item.page); setActiveProgram(null); }}
                                    className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activePage === item.page && !activeProgram ? 'bg-cyan-500 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default AffiliatePortal;