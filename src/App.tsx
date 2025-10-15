import React, { useState, useEffect, useCallback } from 'react';

// Data
import {
    users as mockUsers,
    products as mockProducts,
    payouts as mockPayouts,
    resources as mockResources,
    planDetails as mockPlanDetails,
    communications as mockCommunications,
    userSettings as mockUserSettings,
    platformSettings as mockPlatformSettings,
    payments as mockPayments,
    User,
    Product,
    Payout,
    Resource,
    Communication,
    UserSettings,
    PlatformSettings as PlatformSettingsType,
    Plan,
    Partnership,
    Payment
} from '../data/mockData';
import { supabase } from './lib/supabaseClient';

// Components
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import Affiliates from '../components/Affiliates';
import Products from '../components/Products';
import Creatives from '../components/Creatives';
import Payouts from '../components/Payouts';
import Reports from '../components/Reports';
import Communicate from '../components/Communicate';
import Billing from '../components/Billing';
import Settings from '../components/Settings';
import Toast from '../components/Toast';
import LandingPage from '../components/LandingPage';
import LoginSelector from '../components/LoginSelector';
import LoginPage from '../components/LoginPage';
import AffiliateLoginPage from '../components/AffiliateLoginPage';
import RegistrationPage from '../components/RegistrationPage';
import AffiliatePortal from '../components/AffiliatePortal';
import OnboardingModal from '../components/OnboardingModal';
import StripeConnectPage from '../components/StripeConnectPage';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import ClientManagement from '../components/ClientManagement';
import SuperAdminAnalytics from '../components/SuperAdminAnalytics';
import PlatformSettings from '../components/PlatformSettings';
// FIX: Added missing import for PartnerflowAffiliates.
import PartnerflowAffiliates from '../components/PartnerflowAffiliates';
import AiAssistant from '../components/AiAssistant';
import Marketplace from '../components/Marketplace';
import NotFoundPage from '../components/NotFoundPage';
import PartnerflowAffiliateSignupPage from '../components/PartnerflowAffiliateSignupPage';
import CreatorAffiliateSignupPage from '../components/CreatorAffiliateSignupPage';
import AffiliateSignupPage from '../components/AffiliateSignupPage';
import Financials from '../components/Financials';

// Types
export type Page = 'Dashboard' | 'Affiliates' | 'Products' | 'Resources' | 'Payouts' | 'Reports' | 'Communicate' | 'Billing' | 'Settings';
export type AdminPage = 'AdminDashboard' | 'Clients' | 'Analytics' | 'PartnerflowAffiliates' | 'PlatformSettings' | 'Financials';
export type Theme = 'light' | 'dark';
export type ActiveView = 'creator' | 'affiliate';
export type AppView = 'landing' | 'login_selector' | 'creator_login' | 'affiliate_login' | 'register' | 'creator_affiliate_signup' | 'partnerflow_affiliate_signup' | 'app' | 'stripe_connect' | 'marketplace' | 'not_found' | 'affiliate_apply_signup' | 'affiliate_signup';

const App: React.FC = () => {
    // State management
    const [theme, setTheme] = useState<Theme>('light');
    const [appView, setAppView] = useState<AppView>('landing');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activePage, setActivePage] = useState<Page | AdminPage>('Dashboard');
    const [activeView, setActiveView] = useState<ActiveView>('creator');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedCreatorForAffiliateSignup, setSelectedCreatorForAffiliateSignup] = useState<User | null>(null);

    // Data state
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [payouts, setPayouts] = useState<Payout[]>(mockPayouts);
    const [resources, setResources] = useState<Resource[]>(mockResources);
    const [communications, setCommunications] = useState<Communication[]>(mockCommunications);
    const [userSettings, setUserSettings] = useState<UserSettings>(mockUserSettings);
    const [planDetails, setPlanDetails] = useState(mockPlanDetails);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettingsType>(mockPlatformSettings);
    const [payments, setPayments] = useState<Payment[]>(mockPayments);
    
    const useMockData = !supabase.auth; // simplified check
    
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const user = users.find(u => u.email === email);
        if (user && password === 'password') { // Demo password
            setCurrentUser(user);
            setAppView('app');
            if (user.roles.includes('super_admin')) {
                setActivePage('AdminDashboard');
            } else if (user.roles.includes('affiliate') && !user.roles.includes('creator')) {
                setActiveView('affiliate');
            }
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials for demo.' };
    };

    const handleAffiliateLogin = (email: string, password: string) => {
        const user = users.find(u => u.email === email && u.roles.includes('affiliate'));
        if (user && password === 'password') {
            setCurrentUser(user);
            setActiveView('affiliate');
            setAppView('app');
        } else {
            showToast('Invalid affiliate credentials for demo.');
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setAppView('landing');
        setActivePage('Dashboard');
        setActiveView('creator');
    };
    
    const handleSignup = async (): Promise<{ success: boolean; error?: string; }> => {
        showToast("Registration successful! Please log in.");
        setAppView('creator_login');
        return { success: true };
    };

    const handleAffiliateSignup = (name: string, email: string) => {
        // Create a new general affiliate
        const newAffiliate: User = {
            id: `new-affiliate-${Date.now()}`,
            name,
            email,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            roles: ['affiliate'],
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            partnerships: [],
            sales: 0, commission: 0, clicks: 0, conversionRate: 0,
            referralCode: name.toUpperCase().substring(0,4) + Date.now().toString().slice(-2),
        };
        setUsers(prev => [...prev, newAffiliate]);
        setCurrentUser(newAffiliate);
        setActiveView('affiliate');
        setAppView('app');
        showToast("Welcome to PartnerFlow!");
    };

    const handleAffiliateApply = (creatorId: string) => {
        const creator = users.find(u => u.id === creatorId);
        if (!creator) return;

        if (currentUser && currentUser.roles.includes('affiliate')) {
             setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === currentUser.id) {
                    const existingPartnership = user.partnerships?.find(p => p.creatorId === creatorId);
                    if (existingPartnership) {
                        showToast(`You have already applied to ${creator.company_name}.`);
                        return user;
                    }
                    const newPartnership: Partnership = { creatorId, status: 'Pending' };
                    const updatedUser = {
                        ...user,
                        partnerships: [...(user.partnerships || []), newPartnership]
                    };
                    setCurrentUser(updatedUser); // Update current user state as well
                    return updatedUser;
                }
                return user;
            }));
            showToast(`Application submitted to ${creator.company_name}!`);
        } else {
            // Not logged in affiliate, go to login/signup flow
            setSelectedCreatorForAffiliateSignup(creator);
            setAppView('affiliate_login');
        }
    };

    const handleCreatorAffiliateSignup = (name: string, email: string) => {
        if (!selectedCreatorForAffiliateSignup) return;
        
        const newAffiliate: User = {
            id: `new-affiliate-${Date.now()}`,
            name,
            email,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            roles: ['affiliate'],
            joinDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            partnerships: [{ creatorId: selectedCreatorForAffiliateSignup.id, status: 'Pending' }],
            sales: 0, commission: 0, clicks: 0, conversionRate: 0,
            referralCode: name.toUpperCase().substring(0,4) + '-K',
        };
        setUsers(prev => [...prev, newAffiliate]);
        // The CreatorAffiliateSignupPage will show a success message.
    };

    // Placeholder functions for db interactions
    const refetchData = useCallback(() => {
        // In a real app, this would re-fetch from Supabase
        console.log("Refetching data...");
    }, []);

    const onRecordSale = (affiliateId: string, productId: string, saleAmount: number) => {
        showToast(`Simulated sale recorded for affiliate ID ${affiliateId}`);
    };

    const onRecordSaleByCoupon = (couponCode: string, productId: string, saleAmount: number) => {
        showToast(`Simulated sale recorded with coupon ${couponCode}`);
    };

    // Render logic based on appView
    if (!currentUser || appView !== 'app') {
        // Unauthenticated views
        switch (appView) {
            case 'landing':
                return <LandingPage 
                            onNavigateToLogin={() => setAppView('creator_login')} 
                            onNavigateToRegister={() => setAppView('register')} 
                            onNavigateToDashboard={() => { if(currentUser) setAppView('app') }}
                            onNavigateToMarketplace={() => setAppView('marketplace')}
                            onNavigateToPartnerflowSignup={() => setAppView('partnerflow_affiliate_signup')}
                            platformSettings={platformSettings}
                            currentUser={currentUser}
                        />;
            case 'creator_login':
                return <LoginPage onLogin={handleLogin} onBack={() => setAppView('landing')} onNavigateToRegister={() => setAppView('register')} />;
            case 'affiliate_login':
                return <AffiliateLoginPage 
                            onLogin={handleAffiliateLogin} 
                            onNavigateToMarketplace={() => setAppView('marketplace')}
                            onNavigateToSignup={() => setAppView('affiliate_signup')}
                        />;
            case 'register':
                return <RegistrationPage onSignup={handleSignup} onBack={() => setAppView('landing')} />;
            case 'affiliate_signup':
                return <AffiliateSignupPage onSignup={handleAffiliateSignup} onBack={() => setAppView('affiliate_login')} />;
            case 'creator_affiliate_signup': 
                return <CreatorAffiliateSignupPage onSignup={handleCreatorAffiliateSignup} onBack={() => setAppView('landing')} entrepreneur={selectedCreatorForAffiliateSignup} />;
            case 'partnerflow_affiliate_signup':
                 return <PartnerflowAffiliateSignupPage onSignup={() => {}} onBack={() => setAppView('landing')} />;
            case 'marketplace':
                return <Marketplace 
                    products={products.filter(p => p.isPubliclyListed)} 
                    users={users} 
                    onBack={() => setAppView('landing')}
                    currentUser={currentUser}
                    onApply={handleAffiliateApply}
                />;
            case 'stripe_connect':
                return <StripeConnectPage onConnectSuccess={() => {showToast("Stripe connected!"); setAppView('app'); setActivePage('Settings')}} onCancel={() => setAppView('app')} />;
            case 'login_selector':
                return <LoginSelector onSelect={(view) => setAppView(view)} />;
            default:
                return <NotFoundPage onNavigateHome={() => setAppView('landing')} />;
        }
    }

    // Authenticated views
    const isSuperAdmin = currentUser.roles.includes('super_admin');
    const trialDaysRemaining = currentUser.trialEndsAt ? Math.ceil((new Date(currentUser.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
    const isTrialExpired = trialDaysRemaining !== null && trialDaysRemaining < 0;
    const currentPlan = planDetails[currentUser.currentPlan as keyof typeof planDetails] || planDetails['Starter Plan'];
    const onboardingIncomplete = (currentUser.onboardingStepCompleted || 0) < 5 && !isSuperAdmin;

    if (activeView === 'affiliate' && !isSuperAdmin) {
        return <AffiliatePortal 
                    affiliate={currentUser} 
                    setUsers={setUsers}
                    allUsers={users}
                    allProducts={products}
                    payouts={payouts}
                    allResources={resources}
                    onLogout={handleLogout} 
                    setActiveView={setActiveView}
                    showToast={showToast}
                    onApply={handleAffiliateApply}
                />
    }

    const renderPage = () => {
        if(isSuperAdmin) {
            const creatorClients = users.filter(u => u.roles.includes('creator') && !u.roles.includes('super_admin'));
            const pfAffiliates = users.filter(u => u.partnerships?.some(p => p.creatorId === currentUser.id));

            switch(activePage as AdminPage) {
                case 'AdminDashboard': return <SuperAdminDashboard payments={payments} clients={creatorClients} planDetails={planDetails} />;
                case 'Clients': return <ClientManagement clients={creatorClients} allUsers={users} allProducts={products} allPayments={payments} onPlanChange={()=>{}} onSuspend={()=>{}} onDelete={()=>{}} onImpersonate={(id) => {
                    const impersonatedUser = users.find(u => u.id === id);
                    if (impersonatedUser) {
                        setCurrentUser(impersonatedUser);
                        setActivePage('Dashboard');
                        setActiveView('creator');
                        showToast(`Impersonating ${impersonatedUser.name}`);
                    }
                }} />;
                case 'Analytics': return <SuperAdminAnalytics users={users} products={products} payouts={payouts} />;
                case 'Financials': return <Financials payments={payments} clients={creatorClients} planDetails={planDetails} />;
                case 'PlatformSettings': return <PlatformSettings platformSettings={platformSettings} setPlatformSettings={setPlatformSettings} planDetails={planDetails} setPlanDetails={setPlanDetails} showToast={showToast} />;
                case 'PartnerflowAffiliates': return <PartnerflowAffiliates affiliates={pfAffiliates} payouts={payouts.filter(p => pfAffiliates.some(a => a.id === p.user_id))} setUsers={setUsers} setPayouts={setPayouts} showToast={showToast} currentUser={currentUser} />;
                default: return <SuperAdminDashboard payments={payments} clients={creatorClients} planDetails={planDetails} />;
            }
        }

        if (isTrialExpired) {
            return <Billing currentUser={currentUser} affiliates={[]} products={[]} onPlanChange={() => {showToast("Plan updated!")}} isTrialExpired={true} />;
        }
        
        const myAffiliates = users.filter(u => u.partnerships?.some(p => p.creatorId === currentUser.id));
        const myProducts = products.filter(p => p.user_id === currentUser.id);
        const myPayouts = payouts.filter(payout => myAffiliates.some(aff => aff.id === payout.user_id));
        const myResources = resources.filter(r => r.user_id === currentUser.id);
        const myCommunications = communications.filter(c => c.sender_id === currentUser.id);

        switch (activePage as Page) {
            case 'Dashboard':
                return <Dashboard affiliates={myAffiliates} products={myProducts} payouts={myPayouts} onRecordSale={onRecordSale} onRecordSaleByCoupon={onRecordSaleByCoupon} />;
            case 'Affiliates':
                return <Affiliates affiliates={myAffiliates} allUsers={users} setUsers={setUsers} payouts={myPayouts} showToast={showToast} currentPlan={currentPlan} currentUser={currentUser} refetchData={refetchData} />;
            case 'Products':
                return <Products products={myProducts} setProducts={setProducts} useMockData={useMockData} resources={myResources} showToast={showToast} currentPlan={currentPlan} currentUser={currentUser} refetchData={refetchData} />;
            case 'Resources':
                return <Creatives resources={myResources} setResources={setResources} useMockData={useMockData} products={myProducts} showToast={showToast} currentUser={currentUser} refetchData={refetchData} setActiveView={setActiveView} />;
            case 'Payouts':
                return <Payouts payouts={myPayouts} userSettings={userSettings} setActivePage={setActivePage} showToast={showToast} refetchData={refetchData} />;
            case 'Reports':
                return <Reports affiliates={myAffiliates} products={myProducts} payouts={myPayouts} />;
            case 'Communicate':
                return <Communicate affiliates={myAffiliates} communications={myCommunications} onSend={() => {showToast("Message sent!")}}/>;
            case 'Billing':
                return <Billing currentUser={currentUser} affiliates={myAffiliates} products={myProducts} onPlanChange={()=>{showToast("Plan updated!")}} isTrialExpired={isTrialExpired} />;
            case 'Settings':
                return <Settings currentUser={currentUser} userSettings={userSettings} onSettingsChange={setUserSettings} setAppView={setAppView} />;
            default:
                return <Dashboard affiliates={myAffiliates} products={myProducts} payouts={myPayouts} onRecordSale={onRecordSale} onRecordSaleByCoupon={onRecordSaleByCoupon} />;
        }
    };

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${theme}`}>
            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            {onboardingIncomplete &&
                <OnboardingModal 
                    currentUser={currentUser}
                    onStepChange={() => {}}
                    onAddProduct={() => {}}
                    onInviteAffiliate={() => {}}
                    onComplete={() => {
                        setCurrentUser(u => u ? {...u, onboardingStepCompleted: 5} : null);
                        showToast("Onboarding complete!");
                    }}
                    onSkip={() => {
                        setCurrentUser(u => u ? {...u, onboardingStepCompleted: 5} : null);
                    }}
                />
            }
            <Sidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                currentUser={currentUser}
                isLocked={isTrialExpired && !isSuperAdmin}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title={String(activePage).replace(/([A-Z])/g, ' $1').trim()}
                    theme={theme}
                    setTheme={setTheme}
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    currentUser={currentUser}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    onLogout={handleLogout}
                    platformSettings={platformSettings}
                    trialDaysRemaining={trialDaysRemaining}
                    onUpgradeClick={() => setActivePage('Billing')}
                    onStartOnboarding={() => {}} // This should open the modal, but it's auto-opened
                    onboardingIncomplete={onboardingIncomplete}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderPage()}
                </main>
            </div>
            {!isSuperAdmin && <AiAssistant affiliates={users.filter(u => u.partnerships?.some(p => p.creatorId === currentUser.id))} products={products.filter(p => p.user_id === currentUser.id)} payouts={payouts} />}
        </div>
    );
};

export default App;