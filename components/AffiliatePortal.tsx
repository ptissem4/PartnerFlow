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
    onUpdateUser: (userId: string, data: Partial<User>) => void;
}

type AffiliatePage = 'Dashboard' | 'Programs' | 'Resources' | 'Payouts' | 'Marketplace' | 'Settings';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
);

const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ affiliate, setUsers, allUsers, allProducts, payouts, allResources, onLogout, setActiveView, showToast, onApply, onUpdateUser }) => {
    const [activePage, setActivePage] = useState<AffiliatePage>('Dashboard');
    const [activeProgram, setActiveProgram] = useState<User | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(affiliate.onboardingStepCompleted === undefined);
    const [copiedResourceId, setCopiedResourceId] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const canSwitchToCreator = affiliate.roles.includes('creator');

    const handleLogoClick = () => {
        setActivePage('Dashboard');
        setActiveProgram(null);
        setIsSidebarOpen(false);
    };
    
    const handleNavClick = (page: AffiliatePage) => {
        setActivePage(page);
        setActiveProgram(null);
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
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
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Resources</h3>
                    {products.map(product => {
                        const productResources = resources.filter(res => res.productIds.includes(product.id));
                        if (productResources.length > 0) {
                            return (
                                <div key={product.id} className="pt-4 border-t border-gray-200 dark:border-gray-700 first:pt-0 first:border-t-0">
                                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{product.name} Resources</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {productResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {generalResources.length > 0 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 first:pt-0 first:border-t-0">
                             <h4 className="font-semibold text-gray-800 dark:text-white mb-2">General Resources</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {generalResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const affiliatePayouts = useMemo(() => payouts.filter(p => p.user_id === affiliate.id), [payouts, affiliate.id]);
    
    const affiliateSalesHistory = useMemo(() => {
        const allSales = affiliatePayouts.flatMap(p => p.sales);
        const salesByMonth: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const today = new Date();
        const monthKeys: string[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
            salesByMonth[monthName] = 0;
            monthKeys.push(monthName);
        }
        
        const startOf12Months = new Date(today.getFullYear(), today.getMonth() - 11, 1);

        allSales.forEach(sale => {
            const saleDate = new Date(sale.date);
            if (saleDate >= startOf12Months) {
                const saleMonthName = `${monthNames[saleDate.getMonth()]} '${String(saleDate.getFullYear()).slice(-2)}`;
                if (salesByMonth.hasOwnProperty(saleMonthName)) {
                    salesByMonth[saleMonthName] += sale.saleAmount;
                }
            }
        });

        return monthKeys.map(name => ({ name, sales: salesByMonth[name] }));
    }, [affiliatePayouts]);

    const partnerPrograms = useMemo(() => {
        return (affiliate.partnerships || [])
            .map(p => {
                const creator = allUsers.find(u => u.id === p.creatorId);
                return creator ? { ...creator, partnershipStatus: p.status } : null;
            })
            .filter((p): p is User & { partnershipStatus: Partnership['status'] } => p !== null);
    }, [affiliate.partnerships, allUsers]);

    const activeProgramDetails = useMemo(() => {
        if (!activeProgram) return null;
        const products = allProducts.filter(p => p.user_id === activeProgram.id);
        const resources = allResources.filter(r => r.user_id === activeProgram.id);
        return { products, resources };
    }, [activeProgram, allProducts, allResources]);

    const NavItem: React.FC<{ page: AffiliatePage, label: string, icon: React.ReactNode }> = ({ page, label, icon }) => (
        <button
            onClick={() => handleNavClick(page)}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
            activePage === page
                ? 'bg-cyan-500 text-white shadow'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    );

    const renderPageContent = () => {
        if (activeProgram && activeProgramDetails) {
            return <ProgramDetailView 
                affiliate={affiliate}
                partner={activeProgram}
                products={activeProgramDetails.products}
                resources={activeProgramDetails.resources}
                onBack={() => setActiveProgram(null)}
            />;
        }

        switch(activePage) {
            case 'Dashboard':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Affiliate Dashboard</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Sales" value={(affiliate.sales || 0).toString()} />
                            <StatCard title="Total Commission" value={`$${(affiliate.commission || 0).toLocaleString()}`} />
                            <StatCard title="Total Clicks" value={(affiliate.clicks || 0).toLocaleString()} />
                            <StatCard title="Conversion Rate" value={`${(affiliate.conversionRate || 0)}%`} />
                        </div>
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sales Performance (12 Months)</h3>
                          <div className="h-80">
                            <SalesPerformanceChart data={affiliateSalesHistory} />
                          </div>
                        </div>
                    </div>
                )
            case 'Programs':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Programs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partnerPrograms.map(program => (
                                <div key={program.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                    <div className="flex items-center mb-4">
                                        <img src={program.avatar} alt={program.name} className="w-12 h-12 rounded-full mr-4"/>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{program.company_name}</h3>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${program.partnershipStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{program.partnershipStatus}</span>
                                        </div>
                                    </div>
                                    {program.partnershipStatus === 'Active' ? (
                                        <button onClick={() => setActiveProgram(program)} className="w-full mt-4 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">
                                            View Links & Resources
                                        </button>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Your application is pending. You'll be notified upon approval.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Resources':
                 const allPartnerResources = allResources.filter(res => partnerPrograms.some(p => p.id === res.user_id));
                 return (
                     <div>
                         <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">All Resources</h2>
                         <div className="space-y-6">
                             {partnerPrograms.filter(p => p.partnershipStatus === 'Active').map(program => {
                                 const programResources = allPartnerResources.filter(r => r.user_id === program.id);
                                 if (programResources.length === 0) return null;
                                 return (
                                     <div key={program.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                                         <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Resources from {program.company_name}</h3>
                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                             {programResources.map(res => <ResourceCard key={res.id} resource={res} />)}
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                 );
            case 'Payouts':
                return (
                     <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Payouts</h2>
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Payout History</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Period</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {affiliatePayouts.map(payout => (
                                            <tr key={payout.id} className="border-b dark:border-gray-700">
                                                <td className="px-6 py-4">{payout.period}</td>
                                                <td className="px-6 py-4 font-semibold">${payout.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">{payout.status}</span></td>
                                                <td className="px-6 py-4">{payout.due_date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                     </div>
                )
            case 'Marketplace':
                return <Marketplace 
                    products={allProducts.filter(p => p.isPubliclyListed)} 
                    users={allUsers} 
                    onBack={() => {}}
                    currentUser={affiliate}
                    onApply={onApply}
                />
            case 'Settings':
                return <AffiliateSettings affiliate={affiliate} onUpdateProfile={(d) => {
                    onUpdateUser(affiliate.id, d);
                }} showToast={showToast} />;
            default:
                return <div>Dashboard</div>
        }
    }
    
    // Icons for sidebar
    const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
    const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
    const StorefrontIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    
    return (
        <>
        {showOnboarding && (
            <AffiliateOnboardingModal affiliate={affiliate} onComplete={() => setShowOnboarding(false)} onSkip={() => setShowOnboarding(false)} />
        )}
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-200`}>
            {/* Sidebar */}
             <aside className={`fixed inset-y-0 left-0 z-20 w-64 p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <button onClick={handleLogoClick} className="flex items-center mb-10 text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 rounded-lg p-1 -ml-1">
                    <div className="p-2 bg-cyan-500 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold ml-3 text-gray-800 dark:text-white">PartnerFlow</h1>
                 </button>
                 <nav className="space-y-2">
                    <NavItem page="Dashboard" label="Dashboard" icon={<HomeIcon />} />
                    <NavItem page="Programs" label="My Programs" icon={<BriefcaseIcon />} />
                    <NavItem page="Resources" label="All Resources" icon={<BookOpenIcon />} />
                    <NavItem page="Payouts" label="My Payouts" icon={<CreditCardIcon />} />
                    <NavItem page="Marketplace" label="Marketplace" icon={<StorefrontIcon />} />
                    <NavItem page="Settings" label="Settings" icon={<CogIcon />} />
                 </nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                 <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 py-4">
                     <div className="flex items-center">
                        <button className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white ml-4 md:ml-0">{activeProgram ? activeProgram.company_name : activePage}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        {canSwitchToCreator && (
                            <button onClick={() => setActiveView('creator')} className="px-4 py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600">
                                Switch to Creator View
                            </button>
                        )}
                        <button onClick={onLogout} className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-cyan-500">
                            Logout
                        </button>
                        <div className="w-10 h-10">
                            <img className="w-full h-full rounded-full object-cover" src={affiliate.avatar} alt="User avatar" />
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderPageContent()}
                </main>
            </div>
        </div>
        </>
    );
};

export default AffiliatePortal;