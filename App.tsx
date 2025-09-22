



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
import LoadingSpinner from './components/LoadingSpinner';
import { 
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
    UserRole,
    CommissionTier
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
  const [isLoading, setIsLoading] = useState(true);

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
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

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
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setCurrentUser(null);
        setUserSettings(null);
        setAppView('landing');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
        fetchUserProfile(session.user.id);
    } else {
        setCurrentUser(null);
        setUserSettings(null);
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

      if (error && error.code !== 'PGRST116') { // Ignore "exact one row was not found" error
          console.error('Error fetching profile:', error);
          handleSupabaseLogout();
          return;
      }
      
      let userToSet = profile as User | null;

      // Auto-create profile if it doesn't exist for an authenticated user
      if (!userToSet && session?.user) {
        const { data: newProfile, error: creationError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.name || session.user.email, // Use metadata from signup
            companyName: session.user.user_metadata.company_name,
            avatar: session.user.user_metadata.avatar || `https://i.pravatar.cc/150?u=${session.user.email}`,
            status: 'Active',
            joinDate: new Date().toISOString().split('T')[0],
          }).select().single();
        
        if (creationError) {
          // This handles a race condition where a DB trigger creates the profile
          // right as the client-side code attempts to. Instead of logging out, retry.
          if (creationError.code === '23505') { // unique_violation
            console.warn("Profile auto-creation failed due to a race condition. Retrying profile fetch.");
            setTimeout(() => fetchUserProfile(session.user.id), 500);
          } else {
            console.error("Failed to auto-create profile:", creationError.message);
            handleSupabaseLogout();
          }
          return; // Stop execution for this run
        }
        userToSet = newProfile as User;
      }

      if (userToSet) {
          userToSet.roles = userToSet.roles || [];

          // Special logic to automatically grant super_admin role
          const adminEmails = ['admin@partnerflow.io', 'ptissem4@hotmail.com'];
          if (adminEmails.includes(userToSet.email) && !userToSet.roles.includes('super_admin')) {
              showToast("Attempting to grant Super Admin access...");
              const updatedRoles = [...userToSet.roles, 'super_admin'];
              
              const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({ roles: updatedRoles })
                .eq('id', userToSet.id)
                .select()
                .single();

              if (updateError) {
                  console.error("Failed to automatically grant admin role:", updateError);
                  showToast("Error granting admin role.");
              } else if (updatedProfile) {
                  userToSet = updatedProfile as User;
                  userToSet.roles = updatedProfile.roles || [];
                  showToast("Super Admin access granted successfully!");
              }
          }
          
          setCurrentUser(userToSet);
          setAppView('app');
          if (userToSet.roles.includes('creator') && (userToSet.onboardingStepCompleted || 0) < 5) {
              setIsOnboarding(true);
          }
      } else {
        console.error('User profile not found and could not be created.');
        handleSupabaseLogout();
      }
  };
  
  const fetchData = async () => {
    if (!currentUser) return;
    showToast("Loading data...");

    const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', currentUser.id).single();
    if (settingsData) setUserSettings(settingsData as UserSettings);
    else setUserSettings(initialUserSettings);
    
    const { data: platformSettingsData } = await supabase.from('platform_settings').select('*').single();
    if (platformSettingsData) setPlatformSettings(platformSettingsData as PlatformSettingsType);

    if (currentUser.roles.includes('super_admin')) {
        const { data: clientsData } = await supabase.from('profiles').select('*').contains('roles', ['creator']);
        setUsers(clientsData as User[] || []);
        
        const { data: allUsersData } = await supabase.from('profiles').select('*');
        setAllUsers(allUsersData as User[] || []);

        const { data: allProductsData } = await supabase.from('products').select('*');
        setProducts(allProductsData as Product[] || []);
        
        const { data: allPayoutsData } = await supabase.from('payouts').select('*');
        setPayouts(allPayoutsData as Payout[] || []);
    } 
    else if (currentUser.roles.includes('creator')) {
        const { data: partnerships, error } = await supabase
            .from('partnerships')
            .select('status, profiles:affiliate_id (*)')
            .eq('creator_id', currentUser.id);

        if (partnerships) {
            const affiliatesWithStatus = partnerships.map((p: any) => ({
                ...p.profiles,
                status: p.status,
            }));
            setUsers(affiliatesWithStatus as User[]);
            
            const affiliateIds = affiliatesWithStatus.map((a: User) => a.id);
            if (affiliateIds.length > 0) {
                const { data: payoutsData } = await supabase.from('payouts').select('*').in('user_id', affiliateIds);
                setPayouts(payoutsData as Payout[] || []);
            } else {
                setPayouts([]);
            }
        } else {
             setUsers([]);
             setPayouts([]);
        }

        const { data: productsData } = await supabase.from('products').select('*').eq('user_id', currentUser.id);
        setProducts(productsData as Product[] || []);

        const { data: commsData } = await supabase.from('communications').select('*').eq('sender_id', currentUser.id);
        setCommunications(commsData as Communication[] || []);
    }
    else if (currentUser.roles.includes('affiliate')) {
        const { data: partnerships } = await supabase.from('partnerships').select('profiles:creator_id (*)').eq('affiliate_id', currentUser.id);

        if (partnerships) {
            const partners = partnerships.map((p: any) => p.profiles);
            setUsers(partners as User[]);

            const partnerIds = partners.map((p: User) => p.id);
            if (partnerIds.length > 0) {
                const { data: productsData } = await supabase.from('products').select('*').in('user_id', partnerIds);
                setProducts(productsData as Product[] || []);
            } else {
                setProducts([]);
            }
        } else {
            setUsers([]);
            setProducts([]);
        }

        const { data: payoutsData } = await supabase.from('payouts').select('*').eq('user_id', currentUser.id);
        setPayouts(payoutsData as Payout[] || []);
    }
    showToast("Data loaded.");
  };

  const trialDaysRemaining = useMemo(() => {
    if (!currentUser?.trialEndsAt) return null;
    const now = new Date();
    const endDate = new Date(currentUser.trialEndsAt);
    if (endDate < now) return 0;
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
    if (!currentUser || !userSettings) return;
    const { error } = await supabase.from('user_settings').update(newSettings).eq('user_id', currentUser.id);
    if(error) {
        showToast("Error updating settings.");
    } else {
        setUserSettings(newSettings);
        showToast("Settings updated successfully!");
    }
  };

  const recordSaleForAffiliate = async (affiliateId: string, productId: number, saleAmount: number) => {
    // This is a complex transactional operation, better handled by a database function.
    // For now, we'll perform sequential updates.
    const { data: product, error: productError } = await supabase.from('products').select('*').eq('id', productId).single();
    if (productError || !product) {
      showToast("Error: Product not found.");
      return;
    }

    const { data: affiliate, error: affiliateError } = await supabase.from('profiles').select('*').eq('id', affiliateId).single();
    if (affiliateError || !affiliate) {
      showToast("Error: Affiliate not found.");
      return;
    }
    
    const applicableTier = product.commission_tiers
        .filter((tier: CommissionTier) => product.sales_count >= tier.threshold)
        .sort((a: CommissionTier, b: CommissionTier) => b.threshold - a.threshold)[0] || { rate: 0 };
    
    const commissionAmount = saleAmount * (applicableTier.rate / 100);

    const { error: productUpdateError } = await supabase.from('products').update({ sales_count: product.sales_count + 1 }).eq('id', productId);
    const { error: profileUpdateError } = await supabase.from('profiles').update({ 
      sales: (affiliate.sales || 0) + 1, 
      commission: (affiliate.commission || 0) + commissionAmount 
    }).eq('id', affiliateId);

    if (productUpdateError || profileUpdateError) {
      showToast("Error recording sale.");
    } else {
      showToast(`Sale recorded for ${affiliate.name}!`);
      fetchData(); // Refresh data
    }
  };
  
  const handleRecordSale = (affiliateId: string, productId: string, saleAmount: number) => {
    recordSaleForAffiliate(affiliateId, Number(productId), saleAmount);
  };

  const handleRecordSaleByCoupon = async (couponCode: string, productId: string, saleAmount: number) => {
    const { data: affiliate } = await supabase.from('profiles').select('id').ilike('coupon_code', couponCode.trim()).single();
    if (affiliate) {
      recordSaleForAffiliate(affiliate.id, Number(productId), saleAmount);
    } else {
      showToast(`Coupon code "${couponCode}" not found.`);
    }
  };

  const handleSimulateClick = async (productId: number, affiliateId: string) => {
    // In a real app, this would be handled server-side to prevent fraud.
    await supabase.rpc('increment_clicks', { p_id: productId, a_id: affiliateId });
    showToast(`Click simulated!`);
    fetchData();
  };

  const handlePasswordLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
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

  const handleAffiliateSignup = async (name: string, email: string) => {
    if (!signupRefCode) {
        showToast("Invalid signup link.");
        return;
    }
    // This flow creates a pending user profile and a partnership application.
    const { data: newProfile, error } = await supabase.from('profiles').insert({
        name, email,
        roles: ['affiliate'],
        status: 'Pending',
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        joinDate: new Date().toISOString().split('T')[0],
        referralCode: name.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 15),
    }).select().single();

    if (error || !newProfile) {
        showToast(`Error submitting application: ${error?.message || 'Unknown error'}`);
        return;
    }

    const { error: partnershipError } = await supabase.from('partnerships').insert({
        creator_id: signupRefCode,
        affiliate_id: newProfile.id,
        status: 'Pending',
    });

    if (partnershipError) {
        showToast(`Error creating partnership: ${partnershipError.message}`);
    } else {
        showToast("Application submitted! It is now pending approval.");
    }
  };

  const handlePartnerflowAffiliateSignup = (name: string, email: string) => {
    showToast("This feature is not yet fully implemented.");
  };

  const handleSupabaseSignup = async (name: string, companyName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // This now relies on a trigger in Supabase to create the profile from metadata.
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                name: name,
                company_name: companyName,
                avatar: `https://i.pravatar.cc/150?u=${email}`,
                // The trigger will be responsible for setting creator-specific defaults
                // like roles, plan, trial, etc.
            }
        }
    });
    
    if (error) {
        console.error("Signup error:", error);
        return { success: false, error: error.message };
    }
    
    // The previous client-side insert was removed as it was likely unauthenticated and causing RLS errors.
    // If a profile isn't created, the auto-creation logic on first login will serve as a fallback.
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
      user_id: currentUser.id,
      name: productName,
      price: productPrice,
      sales_page_url: 'https://example.com/your-sales-page',
      sales_count: 0,
      clicks: 0,
      commission_tiers: [{ threshold: 0, rate: 20 }],
      bonuses: [],
      creatives: [],
      creation_date: new Date().toISOString().split('T')[0],
    };
    const { error } = await supabase.from('products').insert(newProduct);
    if(!error) {
        showToast(`${productName} added successfully!`);
        fetchData();
    } else {
        showToast(`Error adding product.`);
    }
  };
  
  const handleOnboardingInviteAffiliate = async (email: string) => {
    if (!currentUser) return;
     // Create a pending profile and partnership
    const { data: newProfile, error } = await supabase.from('profiles').insert({
        name: `(${email.split('@')[0]})`, email, roles: ['affiliate'], status: 'Pending',
        avatar: `https://i.pravatar.cc/150?u=${email}`, joinDate: new Date().toISOString().split('T')[0],
    }).select().single();

    if (error || !newProfile) {
       showToast(`Error inviting affiliate: ${error?.message || 'Unknown error'}`);
       return;
    }

    const { error: partnershipError } = await supabase.from('partnerships').insert({
        creator_id: currentUser.id, affiliate_id: newProfile.id, status: 'Pending'
    });

    if (partnershipError) {
        showToast(`Error creating partnership: ${partnershipError.message}`);
    } else {
        showToast(`Invitation sent to ${email}.`);
        fetchData();
    }
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
            fetchUserProfile(currentUser.id); // Refetch profile to get all updated details
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
        if(!userSettings) return;
        const newSettings = { ...userSettings, integrations: { ...userSettings.integrations, stripe: 'Connected' as const }};
        handleUserSettingsChange(newSettings);
        setAppView('app');
        showToast("Stripe connected successfully!");
    };

    const handleSendCommunication = async (communication: Omit<Communication, 'id' | 'date' | 'sender_id'>) => {
        if (!currentUser) return;
        const newCommunication = { ...communication, sender_id: currentUser.id, date: new Date().toISOString() };
        const { error } = await supabase.from('communications').insert(newCommunication);
        if(!error) {
            showToast(`Message sent to ${communication.recipients} affiliates.`);
            fetchData();
        }
    };

  const handleAdminPlanChange = async (userId: string, newPlanName: string) => {
    const { error } = await supabase.from('profiles').update({ currentPlan: newPlanName }).eq('id', userId);
    if (!error) {
        showToast(`Successfully updated plan for user to ${newPlanName}.`);
        fetchData();
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (!error) {
        showToast(`User ${user.name} has been ${newStatus}.`);
        fetchData();
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) {
        showToast(`User profile for ID ${userId} has been deleted.`);
        fetchData();
    } else {
        showToast(`Error deleting user: ${error.message}`);
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
          return <Affiliates affiliates={users} showToast={showToast} currentPlan={currentPlan} currentUser={user} refetchData={fetchData} />;
        case 'Products':
          return <Products products={products} showToast={showToast} currentPlan={currentPlan} currentUser={user} refetchData={fetchData} />;
        case 'Payouts':
          return <Payouts 
            payouts={payouts} 
            userSettings={userSettings} 
            setActivePage={setActivePage} 
            showToast={showToast}
            refetchData={fetchData}
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
    const partnerflowPayouts = payouts.filter(p => partnerflowAffiliates.some(a => a.id === p.user_id));

    switch(adminActivePage) {
        case 'AdminDashboard':
            return <SuperAdminDashboard payments={payments} clients={clients} planDetails={planDetails} />;
        case 'Clients':
            return <ClientManagement 
                clients={clients} 
                allUsers={allUsers}
                allProducts={products}
                allPayments={payments}
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
            return <SuperAdminAnalytics users={allUsers} products={products} payouts={payouts} />;
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
            return <SuperAdminDashboard payments={payments} clients={clients} planDetails={planDetails} />;
    }
  };
  
  const renderAppContent = () => {
    if (isLoading) {
        return <LoadingSpinner fullPage />;
    }

    if (session && (!currentUser || !userSettings)) {
        return <LoadingSpinner fullPage />;
    }
    
    if (appView === 'app' && currentUser && userSettings) {
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
                        onStartUpgrade={() => setIsUpgradeFlowActive(true)}
                        refetchData={fetchData}
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
            return <LoginPage onLogin={handlePasswordLogin} onBack={() => setAppView('landing')} onNavigateToRegister={() => setAppView('register')} />;
        case 'register':
            return <RegistrationPage onSignup={handleSupabaseSignup} onBack={() => setAppView('landing')} />;
        case 'signup':
             // In a real app, you'd fetch the entrepreneur details from Supabase based on ref code.
             // For now, this component will show a generic message or be disabled.
             return <AffiliateSignupPage onSignup={handleAffiliateSignup} onBack={() => setAppView('landing')} entrepreneur={{id: signupRefCode, name: 'Creator', companyName: 'Creator'} as User} />;
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