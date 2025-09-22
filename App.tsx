

import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Affiliates from './components/Affiliates';
import Payouts from './components/Payouts';
import Settings from './components/Settings';
import AffiliatePortal from './components/AffiliatePortal';
import Products from './components/Products';
import Toast from './components/Toast';
import Reports from './components/Reports';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import AffiliateSignupPage from './components/AffiliateSignupPage';
import PartnerflowAffiliateSignupPage from './components/PartnerflowAffiliateSignupPage';
import PartnerflowAffiliates from './components/PartnerflowAffiliates';
import Billing from './components/Billing';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ClientManagement from './components/ClientManagement';
import PlatformSettings from './components/PlatformSettings';
import SuperAdminAnalytics from './components/SuperAdminAnalytics';
import StripeConnectPage from './components/StripeConnectPage';
import OnboardingModal from './components/OnboardingModal';
import Communicate from './components/Communicate';
import NotFoundPage from './components/NotFoundPage';
import { 
    users as initialUsers,
    products as initialProducts, 
    payouts as initialPayouts,
    payments as initialPayments,
    communications as initialCommunications,
    planDetails as initialPlanDetails,
    platformSettings as initialPlatformSettings,
    userSettings as initialUserSettings,
    User,
    Product,
    Payout,
    Payment,
    Communication,
    PlatformSettings as PlatformSettingsType,
    UserSettings,
    UserRole
} from './data/mockData';


export type Page = 'Dashboard' | 'Affiliates' | 'Products' | 'Payouts' | 'Settings' | 'Reports' | 'Billing' | 'Communicate';
export type AdminPage = 'AdminDashboard' | 'Clients' | 'PlatformSettings' | 'Analytics' | 'PartnerflowAffiliates';
export type Theme = 'light' | 'dark';
export type AppView = 'landing' | 'login' | 'signup' | 'app' | 'stripe_connect' | 'register' | 'partnerflow_affiliate_signup';
export type ActiveView = 'creator' | 'affiliate';

export type Plan = {
    name: string;
    price: number;
    annualPrice: number;
    limits: {
        affiliates: number;
        products: number;
    };
    features: {
        hasTieredCommissions: boolean;
        hasAffiliatePortal: boolean;
        hasApiAccess: boolean;
        prioritySupport?: boolean;
    };
};


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appView, setAppView] = useState<AppView>('landing');
  const [signupRefCode, setSignupRefCode] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [adminActivePage, setAdminActivePage] = useState<AdminPage>('AdminDashboard');
  const [activeView, setActiveView] = useState<ActiveView>('creator');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpgradeFlowActive, setIsUpgradeFlowActive] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Used by admin
  const [products, setProducts] = useState<Product[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsType>(initialPlatformSettings);
  const [planDetails, setPlanDetails] = useState(initialPlanDetails);
  const [userSettings, setUserSettings] = useState<UserSettings>(initialUserSettings);

  const getDateWithOffset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
        setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setCurrentUser(null);
        setAppView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
        fetchUserProfile(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (currentUser) {
        fetchData();
    }
  }, [currentUser]);


  const fetchUserProfile = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
          console.error('Error fetching profile:', error);
          handleSupabaseLogout();
          return;
      }
      
      if (profile) {
          let userToSet = { ...profile, roles: profile.roles || [] } as User;

          // Special logic to automatically grant super_admin role to the specified user
          if (profile.email === 'ptissem4@hotmail.com' && !userToSet.roles.includes('super_admin')) {
              showToast("Attempting to grant Super Admin access...");
              const updatedRoles = [...userToSet.roles, 'super_admin'];
              
              const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({ roles: updatedRoles })
                .eq('id', userId)
                .select()
                .single();

              if (updateError) {
                  console.error("Failed to automatically grant admin role:", updateError);
                  showToast("Error granting admin role. Please check Supabase logs.");
              } else if (updatedProfile) {
                  userToSet = { ...updatedProfile, roles: updatedProfile.roles || [] } as User;
                  showToast("Super Admin access granted successfully!");
              }
          }

          setCurrentUser(userToSet);
          setAppView('app');
          if (userToSet.roles.includes('creator') && (userToSet.onboardingStepCompleted || 0) < 5) {
              setIsOnboarding(true);
          }
      } else {
        console.error('User profile not found in database.');
        handleSupabaseLogout();
      }
  };
  
  const fetchData = async () => {
    if (!currentUser) return;
    showToast("Loading data...");

    const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', currentUser.id).single();
    if (settingsData) setUserSettings(settingsData as UserSettings);
    
    const { data: platformSettingsData } = await supabase.from('platform_settings').select('*').single();
    if (platformSettingsData) setPlatformSettings(platformSettingsData as PlatformSettingsType);

    if (currentUser.roles.includes('super_admin')) {
        const { data: clientsData } = await supabase.from('profiles').select('*').contains('roles', ['creator']);
        if (clientsData) setUsers(clientsData as User[]);
        
        const { data: allUsersData } = await supabase.from('profiles').select('*');
        if (allUsersData) setAllUsers(allUsersData as User[]);

        const { data: allProductsData } = await supabase.from('products').select('*');
        if(allProductsData) setProducts(allProductsData as Product[]);
    } 
    else if (currentUser.roles.includes('creator')) {
        const { data: affiliatesData } = await supabase.from('partnerships').select('affiliate:profiles(*)').eq('creator_id', currentUser.id);
        if (affiliatesData) setUsers(affiliatesData.map((a: any) => a.affiliate) as User[]);

        const { data: productsData } = await supabase.from('products').select('*').eq('user_id', currentUser.id);
        if (productsData) setProducts(productsData as Product[]);
    }
    else if (currentUser.roles.includes('affiliate')) {
        const { data: partnersData } = await supabase.from('partnerships').select('creator:profiles(*)').eq('affiliate_id', currentUser.id);
        if (partnersData) setUsers(partnersData.map((p: any) => p.creator) as User[]);
    }
    showToast("Data loaded.");
  };

  const trialDaysRemaining = useMemo(() => {
    if (!currentUser?.trialEndsAt) return null;
    const now = new Date();
    const endDate = new Date(currentUser.trialEndsAt);
    if (endDate < now) return 0; // Trial has expired
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [currentUser]);

  const isTrialExpired = trialDaysRemaining === 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
        setSignupRefCode(refCode);
        setAppView('signup');
    }
  }, []);

  useEffect(() => {
    if (isTrialExpired && currentUser?.roles.includes('creator')) {
        setActivePage('Billing');
    }
  }, [isTrialExpired, currentUser]);
  
  const currentPlan = currentUser?.currentPlan 
    ? planDetails[currentUser.currentPlan as keyof typeof planDetails] as Plan 
    : planDetails['Starter Plan'] as Plan;


  const [theme, setTheme] = useState<Theme>(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleUserSettingsChange = async (newSettings: UserSettings) => {
    if (!currentUser) return;
    const { error } = await supabase.from('user_settings').update(newSettings).eq('user_id', currentUser.id);
    if(error) {
        showToast("Error updating settings.");
    } else {
        setUserSettings(newSettings);
        showToast("Settings updated successfully!");
    }
  };

  // This is a complex transactional operation, left to modify local state for now.
  const recordSaleForAffiliate = (affiliateId: string, productId: number, saleAmount: number) => {
    const product = products.find(p => p.id === productId);
    const affiliate = users.find(u => u.id === affiliateId);

    if (!product || !affiliate) {
      showToast("Error recording sale. Affiliate or product not found.");
      return false;
    }
    
    const currentSalesCount = product.salesCount;
    const applicableTier = product.commissionTiers
        .filter(tier => currentSalesCount >= tier.threshold)
        .sort((a, b) => b.threshold - a.threshold)[0] || { rate: 0 };
    
    const commissionAmount = saleAmount * (applicableTier.rate / 100);

    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, salesCount: p.salesCount + 1 } : p
    ));

    setUsers(prev => prev.map(u => 
      u.id === affiliateId ? { 
        ...u, 
        sales: (u.sales || 0) + 1, 
        commission: (u.commission || 0) + commissionAmount 
      } : u
    ));
    
    showToast(`Sale of $${saleAmount} recorded for ${affiliate.name}!`);
    return true;
  };
  
  const handleRecordSale = (affiliateId: string, productId: string, saleAmount: number) => {
    recordSaleForAffiliate(affiliateId, Number(productId), saleAmount);
  };

  const handleRecordSaleByCoupon = (couponCode: string, productId: string, saleAmount: number) => {
    const affiliate = users.find(u => u.couponCode?.toLowerCase() === couponCode.toLowerCase().trim());
    if (affiliate) {
      recordSaleForAffiliate(affiliate.id, Number(productId), saleAmount);
    } else {
      showToast(`Coupon code "${couponCode}" not found.`);
    }
  };

  const handleSimulateClick = (productId: number, affiliateId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === affiliateId 
        ? { ...u, clicks: (u.clicks || 0) + 1 }
        : u
    ));
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, clicks: p.clicks + 1 }
        : p
    ));
    showToast(`Click simulated! A tracking cookie would now be stored.`);
  };

  const handlePasswordLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
    // The onAuthStateChange listener will handle setting the session and navigating to the app.
    return { success: true };
  };

  const handleSupabaseLogout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setAppView('landing');
      setIsUpgradeFlowActive(false);
  }
  
  const handleImpersonateUser = (userId: string) => {
    const userToImpersonate = allUsers.find(u => u.id === userId);
    if (userToImpersonate) {
        showToast(`Now impersonating ${userToImpersonate.name}.`);
        setCurrentUser(userToImpersonate);
        setActiveView('creator');
    }
  };

  const handleAffiliateSignup = (name: string, email: string) => {
    // This would be a more complex flow in a real app, creating a user and then a partnership record.
    // For now, we simulate by adding to local state. A full implementation would use Supabase.
    if (!signupRefCode) {
        showToast("Invalid signup link.");
        return;
    }
    const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        roles: ['affiliate'],
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        sales: 0,
        commission: 0,
        clicks: 0,
        status: 'Pending',
        joinDate: new Date().toISOString().split('T')[0],
        conversionRate: 0,
        referralCode: name.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 15),
        partnerIds: [signupRefCode],
    };
    setUsers(prev => [newUser, ...prev]);
    showToast("Application submitted! It is now pending approval.");
  };

  const handlePartnerflowAffiliateSignup = (name: string, email: string) => {
    // Similar to above, this is a local simulation.
    const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        roles: ['affiliate'],
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        sales: 0, commission: 0, clicks: 0, status: 'Pending',
        joinDate: new Date().toISOString().split('T')[0],
        conversionRate: 0,
        referralCode: name.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 15),
        partnerIds: ['0'], // Partnered with PartnerFlow (Super Admin)
    };
    setUsers(prev => [newUser, ...prev]);
    showToast("Application submitted to the PartnerFlow affiliate program!");
  };

  const handleSupabaseSignup = async (name: string, companyName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
    }
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id, name, companyName, email,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            roles: ['creator'], status: 'Active',
            joinDate: new Date().toISOString().split('T')[0],
            currentPlan: 'Starter Plan',
            trialEndsAt: getDateWithOffset(14),
            onboardingStepCompleted: 0,
        });
        if (profileError) {
            console.error("Error creating profile:", profileError.message, profileError);
            if (profileError.message.includes('violates row-level security policy')) {
                 return { success: false, error: "Database permission error. Please run the required security policy script in your Supabase SQL editor." };
            }
            return { success: false, error: `Error creating profile: ${profileError.message}` };
        }
    }
    return { success: true };
  };

  const handleOnboardingStepChange = async (step: number) => {
      if (!currentUser) return;
      const { error } = await supabase.from('profiles').update({ onboardingStepCompleted: step }).eq('id', currentUser.id);
      if(!error) {
        const updatedUser = { ...currentUser, onboardingStepCompleted: step };
        setCurrentUser(updatedUser);
      }
  };

  const handleOnboardingAddProduct = async (productName: string, productPrice: number) => {
    if (!currentUser) return;
    const newProduct = {
      userId: currentUser.id,
      name: productName,
      price: productPrice,
      salesPageUrl: 'https://example.com/your-sales-page',
      salesCount: 0,
      clicks: 0,
      commissionTiers: [{ threshold: 0, rate: 20 }],
      bonuses: [],
      creatives: [],
      creationDate: new Date().toISOString().split('T')[0],
    };
    const { data, error } = await supabase.from('products').insert(newProduct).select();
    if(data) {
        setProducts(prev => [...prev, data[0] as Product]);
        showToast(`${productName} added successfully!`);
    } else {
        showToast(`Error adding product.`);
    }
  };
  
  const handleOnboardingInviteAffiliate = (email: string) => {
    // This is a complex action (invite user, create pending partnership). Simulating locally for now.
    if (!currentUser) return;
    const newUser: User = {
      id: crypto.randomUUID(), name: `(${email.split('@')[0]})`, email,
      roles: ['affiliate'], avatar: `https://i.pravatar.cc/150?u=${email}`, status: 'Pending',
      joinDate: new Date().toISOString().split('T')[0],
      partnerIds: [currentUser.id],
    };
    setUsers(prev => [...prev, newUser]);
    showToast(`Invitation sent to ${email}.`);
  };

  const handleOnboardingComplete = () => {
    if (currentUser) {
        handleOnboardingStepChange(5);
    }
    setIsOnboarding(false);
    showToast("Onboarding complete! Let's get started.");
  };

  const handlePlanChange = async (newPlanName: string, billingCycle: 'monthly' | 'annual') => {
    if (currentUser) {
        const isUpgradingFromAffiliate = !currentUser.roles.includes('creator');
        const newRoles = isUpgradingFromAffiliate ? [...currentUser.roles, 'creator'] as UserRole[] : currentUser.roles;

        const { error } = await supabase.from('profiles').update({
            currentPlan: newPlanName,
            billingCycle: billingCycle,
            trialEndsAt: null,
            roles: newRoles,
        }).eq('id', currentUser.id);
        
        if (!error) {
            setCurrentUser(prev => prev ? ({ ...prev, currentPlan: newPlanName, billingCycle, trialEndsAt: undefined, roles: newRoles }) : null);
             if (isUpgradingFromAffiliate) {
                showToast(`Successfully subscribed! Welcome to the Creator Dashboard.`);
                setActiveView('creator');
                setIsUpgradeFlowActive(false);
            } else {
                showToast(`Successfully subscribed to the ${newPlanName} (${billingCycle})!`);
            }
        } else {
            showToast('Error updating your plan.');
        }
    }
  };
  
    const handleStripeConnectSuccess = () => {
        const newSettings = { ...userSettings, integrations: { ...userSettings.integrations, stripe: 'Connected' as const }};
        handleUserSettingsChange(newSettings);
        setAppView('app');
        showToast("Stripe connected successfully!");
    };

    const handleSendCommunication = async (communication: Omit<Communication, 'id' | 'date'>) => {
        const newCommunication = { ...communication, date: new Date().toISOString() };
        const { data, error } = await supabase.from('communications').insert(newCommunication).select();
        if(data) {
            setCommunications(prev => [data[0] as Communication, ...prev]);
            showToast(`Message sent to ${communication.recipients} affiliates.`);
        }
    };

  const handleAdminPlanChange = async (userId: string, newPlanName: string) => {
    const { error } = await supabase.from('profiles').update({ currentPlan: newPlanName }).eq('id', userId);
    if (!error) {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, currentPlan: newPlanName } : u));
        showToast(`Successfully updated plan for user to ${newPlanName}.`);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (!error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast(`User ${user.name} has been ${newStatus}.`);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    // Deleting auth user is complex, for now we just delete the profile.
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast(`User ID ${userId} has been deleted.`);
    }
  };

  const handleUpgradeFromBanner = () => {
    if (currentUser?.roles.includes('creator')) {
        if (activeView !== 'creator') setActiveView('creator');
        setActivePage('Billing');
    } else {
        setIsUpgradeFlowActive(true);
    }
  };

  const renderCreatorContent = (user: User) => {
      if (isTrialExpired) {
        return <Billing currentUser={user} affiliates={users} products={products} onPlanChange={handlePlanChange} isTrialExpired={true} />;
      }

      switch (activePage) {
        case 'Dashboard':
          return <Dashboard affiliates={users} products={products} payouts={payouts} onRecordSale={handleRecordSale} onRecordSaleByCoupon={handleRecordSaleByCoupon} />;
        case 'Affiliates':
          return <Affiliates affiliates={users} setUsers={setUsers} showToast={showToast} currentPlan={currentPlan} currentUser={user} />;
        case 'Products':
          return <Products products={products} setProducts={setProducts} showToast={showToast} currentPlan={currentPlan} currentUser={user} />;
        case 'Payouts':
          return <Payouts 
            payouts={payouts} 
            setPayouts={setPayouts} 
            affiliates={users} 
            userSettings={userSettings} 
            setActivePage={setActivePage} 
            showToast={showToast}
          />;
        case 'Reports':
            return <Reports affiliates={users} products={products} payouts={payouts} />;
        case 'Billing':
            return <Billing currentUser={user} affiliates={users} products={products} onPlanChange={handlePlanChange} isTrialExpired={isTrialExpired} />;
        case 'Settings':
          return <Settings currentUser={user} userSettings={userSettings} onSettingsChange={handleUserSettingsChange} setAppView={setAppView} />;
        case 'Communicate':
            return <Communicate affiliates={users} communications={communications} onSend={handleSendCommunication} />;
        default:
          return <Dashboard affiliates={users} products={products} payouts={payouts} onRecordSale={handleRecordSale} onRecordSaleByCoupon={handleRecordSaleByCoupon} />;
      }
  };

  const getAdminPageTitle = (page: AdminPage) => {
    switch(page) {
      case 'AdminDashboard': return 'Admin Dashboard';
      case 'Clients': return 'Clients';
      case 'PlatformSettings': return 'Platform Settings';
      case 'Analytics': return 'Analytics';
      case 'PartnerflowAffiliates': return 'PartnerFlow Affiliates';
      default: return 'Admin';
    }
  }

  const renderSuperAdminContent = (user: User) => {
    const clients = users.filter(u => u.roles.includes('creator'));
    const partnerflowAffiliates = allUsers.filter(u => u.partnerIds?.includes('0'));
    const partnerflowPayouts = initialPayouts.filter(p => partnerflowAffiliates.some(a => a.id === p.userId));

    switch(adminActivePage) {
        case 'AdminDashboard':
            return <SuperAdminDashboard payments={initialPayments} clients={clients} planDetails={planDetails} />;
        case 'Clients':
            return <ClientManagement 
                clients={clients} 
                allUsers={allUsers}
                allProducts={products}
                allPayments={initialPayments}
                onPlanChange={handleAdminPlanChange} 
                onSuspend={handleSuspendUser}
                onDelete={handleDeleteUser}
                onImpersonate={handleImpersonateUser}
            />;
        case 'PlatformSettings':
            return <PlatformSettings 
                platformSettings={platformSettings}
                setPlatformSettings={setPlatformSettings}
                planDetails={planDetails}
                setPlanDetails={setPlanDetails}
                showToast={showToast}
            />;
        case 'Analytics':
            return <SuperAdminAnalytics users={allUsers} products={products} payouts={initialPayouts} />;
        case 'PartnerflowAffiliates':
            return <PartnerflowAffiliates 
                affiliates={partnerflowAffiliates}
                payouts={partnerflowPayouts}
                setUsers={setAllUsers}
                setPayouts={setPayouts}
                showToast={showToast}
                currentUser={user}
            />;
        default:
            return <SuperAdminDashboard payments={initialPayments} clients={clients} planDetails={planDetails} />;
    }
  };
  
  const renderAppContent = () => {
    if (appView === 'app' && currentUser) {
        const isSuperAdmin = currentUser.roles.includes('super_admin');
        const mainContent = isSuperAdmin 
            ? renderSuperAdminContent(currentUser)
            : activeView === 'creator' && currentUser.roles.includes('creator') 
                ? renderCreatorContent(currentUser) 
                : isUpgradeFlowActive 
                    ? <Billing
                        currentUser={currentUser}
                        affiliates={[]}
                        products={[]}
                        onPlanChange={handlePlanChange}
                        isTrialExpired={false}
                        isUpgradeFlow={true}
                        onCancelUpgrade={() => setIsUpgradeFlowActive(false)}
                      />
                    : <AffiliatePortal
                        currentUser={currentUser}
                        users={users}
                        products={products}
                        payouts={payouts}
                        onSimulateClick={handleSimulateClick}
                        setUsers={setUsers}
                        onStartUpgrade={() => setIsUpgradeFlowActive(true)}
                      />;

        return (
            <>
                <div className="flex h-full bg-gray-100 dark:bg-gray-900">
                    { (activeView === 'creator' || isSuperAdmin) && (
                      <>
                        <Sidebar 
                            activePage={isSuperAdmin ? adminActivePage : activePage} 
                            setActivePage={isSuperAdmin ? setAdminActivePage : setActivePage} 
                            isOpen={isSidebarOpen} 
                            setIsOpen={setIsSidebarOpen}
                            currentUser={currentUser}
                            isLocked={isTrialExpired && !isSuperAdmin}
                        />
                        {isSidebarOpen && (
                            <div 
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                            aria-hidden="true"
                            ></div>
                        )}
                      </>
                    )}
        
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                      title={isSuperAdmin ? getAdminPageTitle(adminActivePage) : (activeView === 'creator' ? activePage : 'Affiliate Portal')}
                      theme={theme} 
                      setTheme={setTheme} 
                      onMenuClick={() => setIsSidebarOpen(true)}
                      currentUser={currentUser}
                      activeView={activeView}
                      setActiveView={setActiveView}
                      onLogout={handleSupabaseLogout}
                      platformSettings={platformSettings}
                      trialDaysRemaining={trialDaysRemaining}
                      onUpgradeClick={handleUpgradeFromBanner}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
                      {mainContent}
                    </main>
                  </div>
                </div>
                {isOnboarding && 
                    <OnboardingModal 
                        currentUser={currentUser} 
                        onStepChange={handleOnboardingStepChange}
                        onAddProduct={handleOnboardingAddProduct}
                        onInviteAffiliate={handleOnboardingInviteAffiliate}
                        onComplete={handleOnboardingComplete} 
                    />
                }
            </>
        );
    }
    
    switch(appView) {
        case 'landing':
            return <LandingPage 
                        currentUser={currentUser}
                        onNavigateToLogin={() => setAppView('login')} 
                        onNavigateToRegister={() => setAppView('register')}
                        onNavigateToDashboard={() => setAppView('app')}
                        onNavigateToPartnerflowSignup={() => setAppView('partnerflow_affiliate_signup')} 
                    />;
        case 'login':
            return <LoginPage onLogin={handlePasswordLogin} onBack={() => setAppView('landing')} users={initialUsers} onNavigateToRegister={() => setAppView('register')} />;
        case 'register':
            return <RegistrationPage onSignup={handleSupabaseSignup} onBack={() => setAppView('landing')} />;
        case 'signup':
             const entrepreneur = initialUsers.find(u => u.id === signupRefCode);
             return <AffiliateSignupPage onSignup={handleAffiliateSignup} onBack={() => setAppView('landing')} entrepreneur={entrepreneur} />;
        case 'partnerflow_affiliate_signup':
            return <PartnerflowAffiliateSignupPage onSignup={handlePartnerflowAffiliateSignup} onBack={() => setAppView('landing')} />;
        case 'stripe_connect':
            return <StripeConnectPage onConnectSuccess={handleStripeConnectSuccess} onCancel={() => setAppView('app')} />;
        default:
             return <NotFoundPage onNavigateHome={() => setAppView('landing')} />;
    }
  }

  return (
    <div className={`h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300`}>
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      {renderAppContent()}
    </div>
  );
};

export default App;