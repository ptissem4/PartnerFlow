

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
export type AppView = 'landing' | 'login' | 'signup' | 'app' | 'stripe_connect' | 'register' | 'partnerflow_affiliate_signup' | 'admin_login';
export type ActiveView = 'creator' | 'affiliate';
type AuthStatus = 'INITIAL_LOADING' | 'LOGGED_IN' | 'LOGGED_OUT';

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
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('INITIAL_LOADING');

  const [appView, setAppView] = useState<AppView>('landing');
  const [signupRefCode, setSignupRefCode] = useState<string | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isFinalizingAccount, setIsFinalizingAccount] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true); // Start true on initial load
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
        setToastMessage(null);
    }, 3000);
  };

  const handleSupabaseLogout = async () => {
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle resetting state.
  }

  const loadUserAndData = async (session: Session) => {
    setIsDataLoading(true);

    try {
        const createdAt = new Date(session.user.created_at).getTime();
        const lastSignInAt = session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).getTime() : createdAt;
        const isNewUserSignUp = (lastSignInAt - createdAt) < 5000; // Heuristic: sign-in within 5s of creation is a new signup

        let profile: User | null = null;
        let fetchError: any = null;

        if (isNewUserSignUp) {
            // New user: Wait up to 30s for the profile trigger to run.
            setIsFinalizingAccount(true);
            const maxRetries = 30;
            const retryDelay = 1000;
            for (let i = 0; i < maxRetries; i++) {
                const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (data) {
                    profile = data as User;
                    fetchError = null;
                    break;
                }
                fetchError = error;
                if (i < maxRetries - 1) await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        } else {
            // Existing user: Try a few times for network resilience, but fail faster.
            const maxRetries = 3;
            const retryDelay = 1000;
            for (let i = 0; i < maxRetries; i++) {
                const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (data) {
                    profile = data as User;
                    fetchError = null;
                    break;
                }
                fetchError = error;
                if (i < maxRetries - 1) await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

      if (fetchError || !profile) {
          console.error("Fatal error fetching profile after retries:", fetchError);
          const errorMessage = isNewUserSignUp
              ? "There was a problem finalizing your account setup. Please contact support."
              : "Could not load your user data. Please check your connection and try again.";
          showToast(errorMessage);
          await handleSupabaseLogout();
          return;
      }
  
      let userToSet = profile as User;
      
      if (!userToSet.roles) {
          const defaultRoles: UserRole[] = ['creator'];
          const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ roles: defaultRoles })
              .eq('id', userToSet.id)
              .select()
              .single();
          
          if (updateError) {
              console.error("Failed to set default user role in DB:", updateError);
              userToSet.roles = defaultRoles;
          } else {
              userToSet = updatedProfile as User;
          }
      }

      if (userToSet.roles.includes('creator') && !userToSet.trialEndsAt && !userToSet.currentPlan) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ trialEndsAt: trialEndDate.toISOString() })
            .eq('id', userToSet.id)
            .select().single();
        if (updateError) console.error("Failed to set trial end date:", updateError);
        else userToSet = updatedProfile as User;
      }

      const adminEmails = ['admin@partnerflow.app', 'ptissem4@hotmail.com'];
      if (adminEmails.includes(userToSet.email) && !userToSet.roles.includes('super_admin')) {
          const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles').update({ roles: [...(userToSet.roles || []), 'super_admin'] }).eq('id', userToSet.id).select().single();
          if (updateError) console.error("Failed to grant admin role:", updateError);
          else userToSet = updatedProfile as User;
      }
      
      setCurrentUser(userToSet);
      await fetchData(userToSet);
      
      setAppView('app');
      setAuthStatus('LOGGED_IN');
      if (userToSet.roles.includes('creator') && (userToSet.onboardingStepCompleted || 0) < 5) {
          setIsOnboarding(true);
      }
    } catch (e) {
        console.error("A critical error occurred during the login process:", e);
        showToast("An unexpected error occurred. Logging out for safety.");
        await handleSupabaseLogout();
    } finally {
        setIsDataLoading(false);
        setIsFinalizingAccount(false);
    }
  };
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Check initial session
     supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
             setIsDataLoading(false);
             setAuthStatus('LOGGED_OUT');
        }
        setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && !currentUser && !isAuthenticating) {
      setIsAuthenticating(true);
      loadUserAndData(session).finally(() => {
        setIsAuthenticating(false);
      });
    } else if (!session) {
        // Reset state on logout
        setCurrentUser(null);
        setUserSettings(null);
        setUsers([]);
        setAllUsers([]);
        setProducts([]);
        setPayouts([]);
        setPayments([]);
        setCommunications([]);
        setActivePage('Dashboard');
        setAdminActivePage('AdminDashboard');
        setActiveView('creator');
        // Reset to landing page on logout, unless on a specific public page
        if (!['admin_login', 'signup', 'register', 'partnerflow_affiliate_signup'].includes(appView)) {
            setAppView('landing');
        }
        setAuthStatus('LOGGED_OUT');
        setIsDataLoading(false);
    }
  }, [session, currentUser, isAuthenticating]);


  const fetchData = async (currentUser: User) => {
    if (!currentUser) return;

    const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', currentUser.id).single();
    if (settingsData) {
        setUserSettings(settingsData as UserSettings);
    } else {
        const defaultSettings: UserSettings = {
            ...initialUserSettings,
            user_id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            company_name: currentUser.company_name || '',
        };
        setUserSettings(defaultSettings);
        await supabase.from('user_settings').insert(defaultSettings);
    }
    
    const { data: platformSettingsData } = await supabase.from('platform_settings').select('*').single();
    if (platformSettingsData) setPlatformSettings(platformSettingsData as PlatformSettingsType);

    if (currentUser.roles.includes('super_admin')) {
        const { data: clientsData } = await supabase.from('profiles').select('*').contains('roles', ['creator']);
        setUsers(clientsData as User[] || []);
        
        const { data: allUsersData } = await supabase.from('profiles').select('*');
        const allUsersFromDB = allUsersData as User[] || [];

        // Fetch all partnerships to populate partnerIds for affiliates, which is needed for client management affiliate counts.
        const { data: allPartnerships } = await supabase.from('partnerships').select('creator_id, affiliate_id');

        if (allPartnerships) {
            const affiliateToPartnersMap = new Map<string, string[]>();
            allPartnerships.forEach((p: { creator_id: string; affiliate_id: string; }) => {
                if (!affiliateToPartnersMap.has(p.affiliate_id)) {
                    affiliateToPartnersMap.set(p.affiliate_id, []);
                }
                affiliateToPartnersMap.get(p.affiliate_id)!.push(p.creator_id);
            });

            const usersWithPartners = allUsersFromDB.map(user => {
                if (user.roles.includes('affiliate')) {
                    return { ...user, partnerIds: affiliateToPartnersMap.get(user.id) || [] };
                }
                return user;
            });
            setAllUsers(usersWithPartners);
        } else {
            setAllUsers(allUsersFromDB);
        }

        const { data: allProductsData } = await supabase.from('products').select('*');
        setProducts(allProductsData as Product[] || []);
        
        const { data: allPayoutsData } = await supabase.from('payouts').select('*');
        setPayouts(allPayoutsData as Payout[] || []);

        const { data: allPaymentsData } = await supabase.from('payments').select('*');
        setPayments(allPaymentsData as Payment[] || []);
    } 
    else if (currentUser.roles.includes('creator')) {
        const { data: partnerships } = await supabase
            .from('partnerships')
            .select('status, profiles:affiliate_id (*)')
            .eq('creator_id', currentUser.id);

        if (partnerships) {
            const affiliatesWithStatus = partnerships
                .filter((p: any) => p.profiles) // FIX: Filter out partnerships with null profiles
                .map((p: any) => ({
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
            const partners = partnerships
                .filter((p: any) => p.profiles) // FIX: Filter out partnerships with null profiles
                .map((p: any) => p.profiles);
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
    // Handle special routing on initial load
    if (window.location.pathname === '/admin-portal') {
      setAppView('admin_login');
      return;
    }

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

    // Prevent email changes from this form, as it requires a separate auth flow.
    if (newSettings.email !== currentUser.email) {
        showToast("Email address cannot be changed from settings.");
        newSettings.email = currentUser.email; // Revert to original
    }

    // Update settings table
    const { error: settingsError } = await supabase
        .from('user_settings')
        .update(newSettings)
        .eq('user_id', currentUser.id);

    // Update profiles table
    const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ name: newSettings.name, company_name: newSettings.company_name })
        .eq('id', currentUser.id)
        .select()
        .single();

    if (settingsError || profileError) {
        showToast("Error updating settings.");
        console.error("Settings update error:", settingsError || profileError);
    } else {
        setUserSettings(newSettings);
        if (updatedProfile) {
            // Preserve properties on currentUser that are not on the profiles table
            setCurrentUser(prevUser => ({ ...prevUser, ...updatedProfile as User }));
        }
        showToast("Settings updated successfully!");
    }
  };

  const recordSaleForAffiliate = async (affiliateId: string, productId: number, saleAmount: number) => {
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
      if(currentUser) fetchData(currentUser);
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
    await supabase.rpc('increment_clicks', { p_id: productId, a_id: affiliateId });
    showToast(`Click simulated!`);
    if(currentUser) fetchData(currentUser);
  };

  const handlePasswordLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsDataLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Login failed:', JSON.stringify(error, null, 2));
        const userFriendlyError = 'Invalid login credentials. Please check your email and password.';
        showToast(userFriendlyError);
        setIsDataLoading(false);
        return { success: false, error: userFriendlyError };
    }
    // Success will be handled by the useEffect watching the session.
    return { success: true };
  };
  
  const handleImpersonateUser = (userId: string) => {
    const userToImpersonate = allUsers.find(u => u.id === userId);
    if (userToImpersonate) {
        showToast(`Now impersonating ${userToImpersonate.name}.`);
        setCurrentUser(userToImpersonate);
        setActiveView('creator');
    }
  };

  const handleAffiliateSignup = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (!signupRefCode) {
        const errorMsg = "Invalid signup link. Please use the link provided by the creator.";
        showToast(errorMsg);
        return { success: false, error: errorMsg };
    }

    const { data: newProfile, error } = await supabase.from('profiles').insert({
        name, email,
        roles: ['affiliate'],
        status: 'Pending',
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        joinDate: new Date().toISOString().split('T')[0],
        referralCode: name.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 15),
    }).select().single();

    if (error || !newProfile) {
        let errorMsg = `Error submitting application: ${error?.message || 'Unknown error'}`;
        if (error?.code === '23505') {
            errorMsg = "An account with this email already exists.";
        }
        showToast(errorMsg);
        return { success: false, error: errorMsg };
    }

    const { error: partnershipError } = await supabase.from('partnerships').insert({
        creator_id: signupRefCode,
        affiliate_id: newProfile.id,
        status: 'Pending',
    });

    if (partnershipError) {
        const errorMsg = `Error creating partnership: ${partnershipError.message}`;
        showToast(errorMsg);
        await supabase.from('profiles').delete().eq('id', newProfile.id); // Rollback
        return { success: false, error: errorMsg };
    } else {
        return { success: true };
    }
  };

  const handlePartnerflowAffiliateSignup = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    const { data: partnerflowCreator, error: creatorError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'admin@partnerflow.app')
        .single();

    if (creatorError || !partnerflowCreator) {
        const errorMsg = "Could not find the PartnerFlow program. Please try again later.";
        showToast(errorMsg);
        console.error("Error finding PartnerFlow creator account:", creatorError);
        return { success: false, error: errorMsg };
    }

    const { data: newProfile, error: profileError } = await supabase.from('profiles').insert({
        name, 
        email,
        roles: ['affiliate'],
        status: 'Pending',
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        joinDate: new Date().toISOString().split('T')[0],
        referralCode: name.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 15),
    }).select().single();

    if (profileError || !newProfile) {
        let errorMsg = `Error submitting application: ${profileError?.message || 'Unknown error'}`;
        if (profileError?.code === '23505') {
             errorMsg = "An account with this email already exists.";
        }
        showToast(errorMsg);
        return { success: false, error: errorMsg };
    }

    const { error: partnershipError } = await supabase.from('partnerships').insert({
        creator_id: partnerflowCreator.id,
        affiliate_id: newProfile.id,
        status: 'Pending',
    });

    if (partnershipError) {
        const errorMsg = `Error creating partnership application: ${partnershipError.message}`;
        showToast(errorMsg);
        await supabase.from('profiles').delete().eq('id', newProfile.id);
        return { success: false, error: errorMsg };
    } else {
        return { success: true };
    }
  };

  const handleSupabaseSignup = async (name: string, companyName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsDataLoading(true);
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                name: name,
                company_name: companyName,
                avatar: `https://i.pravatar.cc/150?u=${email}`,
            }
        }
    });
    
    if (error) {
        console.error("Signup error:", error);
        setIsDataLoading(false);
        return { success: false, error: error.message };
    }
    
    // Success will be handled by the useEffect watching the session.
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
    if (error) {
        console.error("Onboarding Error: Failed to add product.", JSON.stringify(error, null, 2));
        showToast(`Error: Could not add product. Please try again.`);
    } else {
        showToast(`${productName} added successfully!`);
        fetchData(currentUser);
    }
  };
  
  const handleOnboardingInviteAffiliate = async (email: string) => {
    if (!currentUser) return;
    const { data: newProfile, error: profileError } = await supabase.from('profiles').insert({
        name: `(${email.split('@')[0]})`, email, roles: ['affiliate'], status: 'Pending',
        avatar: `https://i.pravatar.cc/150?u=${email}`, joinDate: new Date().toISOString().split('T')[0],
    }).select().single();

    if (profileError || !newProfile) {
       console.error("Onboarding Error: Failed to create profile for invite.", JSON.stringify(profileError, null, 2));
       showToast(`Error creating invite: ${profileError?.message || 'Please check the email and try again.'}`);
       return;
    }

    const { error: partnershipError } = await supabase.from('partnerships').insert({
        creator_id: currentUser.id, affiliate_id: newProfile.id, status: 'Pending'
    });

    if (partnershipError) {
        console.error("Onboarding Error: Failed to create partnership for invite.", JSON.stringify(partnershipError, null, 2));
        showToast(`Error creating partnership: ${partnershipError.message}`);
    } else {
        showToast(`Invitation sent to ${email}.`);
        fetchData(currentUser);
    }
  };

  const handleOnboardingComplete = () => {
    if (currentUser) {
        handleOnboardingStepChange(5);
    }
    setIsOnboarding(false);
    showToast("Onboarding complete! Let's get started.");
  };

  const handleSkipOnboarding = () => {
    setIsOnboarding(false);
    showToast("Setup paused. You can continue anytime from the header.");
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
        
        if (!error && session) {
            await loadUserAndData(session);
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
            fetchData(currentUser);
        }
    };

  const handleAdminPlanChange = async (userId: string, newPlanName: string) => {
    const { error } = await supabase.from('profiles').update({ currentPlan: newPlanName }).eq('id', userId);
    if (!error && currentUser) {
        showToast(`Successfully updated plan for user to ${newPlanName}.`);
        fetchData(currentUser);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user || !currentUser) return;
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (!error) {
        showToast(`User ${user.name} has been ${newStatus}.`);
        fetchData(currentUser);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error && currentUser) {
        showToast(`User profile for ID ${userId} has been deleted.`);
        fetchData(currentUser);
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
          return <Affiliates affiliates={users} payouts={payouts} showToast={showToast} currentPlan={currentPlan} currentUser={user} refetchData={() => fetchData(user)} />;
        case 'Products':
          return <Products products={products} showToast={showToast} currentPlan={currentPlan} currentUser={user} refetchData={() => fetchData(user)} />;
        case 'Payouts':
          return <Payouts 
            payouts={payouts} 
            userSettings={userSettings} 
            setActivePage={setActivePage} 
            showToast={showToast}
            refetchData={() => fetchData(user)}
          />;
        case 'Reports':
            return <Reports affiliates={users} products={products} payouts={payouts} />;
        case 'Billing':
            return <Billing currentUser={user} affiliates={users} products={products} onPlanChange={handlePlanChange} isTrialExpired={isTrialExpired} />;
        case 'Settings':
          return <Settings currentUser={user} userSettings={userSettings!} onSettingsChange={handleUserSettingsChange} setAppView={setAppView} />;
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
    const partnerflowAffiliates = allUsers.filter(u => u.roles.includes('affiliate'));

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
                payouts={payouts}
                setUsers={setUsers}
                setPayouts={setPayouts}
                showToast={showToast}
                currentUser={user}
            />;
        default:
            return <SuperAdminDashboard payments={payments} clients={clients} planDetails={planDetails} />;
    }
  };

  const renderContent = () => {
    if (isDataLoading) {
      return <LoadingSpinner fullPage />;
    }

    if (isFinalizingAccount) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-screen bg-gray-100 dark:bg-gray-900 text-center p-4">
                <LoadingSpinner />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-6">Finalizing Your Account...</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm">
                    We're setting things up for you. This usually takes just a few moments. The page will load automatically once it's ready.
                </p>
            </div>
        )
    }

    // Handle routing based on appView state
    switch (appView) {
        case 'landing':
            return <LandingPage currentUser={currentUser} onNavigateToLogin={() => setAppView('login')} onNavigateToRegister={() => setAppView('register')} onNavigateToDashboard={() => setAppView('app')} onNavigateToPartnerflowSignup={() => setAppView('partnerflow_affiliate_signup')} />;
        case 'login':
            return <LoginPage onLogin={handlePasswordLogin} onBack={() => setAppView('landing')} onNavigateToRegister={() => setAppView('register')} />;
        case 'admin_login':
            return <LoginPage onLogin={handlePasswordLogin} isAdmin={true} />;
        case 'register':
            return <RegistrationPage onSignup={handleSupabaseSignup} onBack={() => setAppView('login')} />;
        case 'signup': {
            const creator = allUsers.find(u => u.id === signupRefCode);
            return <AffiliateSignupPage onSignup={handleAffiliateSignup} onBack={() => setAppView('landing')} entrepreneur={creator} />;
        }
        case 'partnerflow_affiliate_signup':
            return <PartnerflowAffiliateSignupPage onSignup={handlePartnerflowAffiliateSignup} onBack={() => setAppView('landing')} />;
        case 'stripe_connect':
            return <StripeConnectPage onConnectSuccess={handleStripeConnectSuccess} onCancel={() => {setActivePage('Settings'); setAppView('app');}} />;
        case 'app':
            break; // Continue to app rendering logic
        default:
            return <NotFoundPage onNavigateHome={() => setAppView('landing')} />;
    }
    
    if (authStatus !== 'LOGGED_IN' || !session || !currentUser) {
        // If we have a session but no user, it means we are in the loading state handled by isDataLoading
        // If we have no session, the appView logic above should have already rendered a public page.
        // This is a fallback to prevent rendering a broken app state.
        if (session) {
            return <LoadingSpinner fullPage />;
        }
        return <LandingPage currentUser={null} onNavigateToLogin={() => setAppView('login')} onNavigateToRegister={() => setAppView('register')} onNavigateToPartnerflowSignup={() => setAppView('partnerflow_affiliate_signup')} />;
    }
    
    // Main App View
    const isSuperAdmin = currentUser.roles.includes('super_admin');
    const onboardingIncomplete = !isSuperAdmin && currentUser.roles.includes('creator') && (currentUser.onboardingStepCompleted || 0) < 5;

    let pageTitle = '';
    let mainContent;

    if (isSuperAdmin) {
        pageTitle = getAdminPageTitle(adminActivePage);
        mainContent = renderSuperAdminContent(currentUser);
    } else if (activeView === 'creator') {
        pageTitle = activePage;
        mainContent = renderCreatorContent(currentUser);
    } else { // affiliate view
        pageTitle = 'Affiliate Portal';
        mainContent = <AffiliatePortal 
            currentUser={currentUser} 
            users={users} 
            products={products} 
            payouts={payouts}
            onSimulateClick={handleSimulateClick}
            onStartUpgrade={handleUpgradeFromBanner}
            refetchData={() => fetchData(currentUser)}
        />;
    }

    if (isUpgradeFlowActive) {
        return <div className="p-4 sm:p-6 lg:p-8"><Billing currentUser={currentUser} affiliates={users} products={products} onPlanChange={handlePlanChange} isTrialExpired={false} isUpgradeFlow={true} onCancelUpgrade={() => setIsUpgradeFlowActive(false)} /></div>;
    }

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${activeView === 'affiliate' && !isSuperAdmin ? 'flex-col' : ''}`}>
             {(activeView === 'creator' || isSuperAdmin) && (
                <Sidebar 
                    activePage={isSuperAdmin ? adminActivePage : activePage} 
                    setActivePage={isSuperAdmin ? setAdminActivePage : setActivePage} 
                    isOpen={isSidebarOpen} 
                    setIsOpen={setIsSidebarOpen}
                    currentUser={currentUser}
                    isLocked={isTrialExpired}
                />
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title={pageTitle}
                    theme={theme}
                    setTheme={setTheme}
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    currentUser={currentUser}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    onLogout={handleSupabaseLogout}
                    platformSettings={platformSettings}
                    trialDaysRemaining={trialDaysRemaining}
                    onUpgradeClick={handleUpgradeFromBanner}
                    onStartOnboarding={() => setIsOnboarding(true)}
                    onboardingIncomplete={onboardingIncomplete}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {mainContent}
                </main>
            </div>
            {isOnboarding && <OnboardingModal 
                currentUser={currentUser}
                onStepChange={handleOnboardingStepChange}
                onAddProduct={handleOnboardingAddProduct}
                onInviteAffiliate={handleOnboardingInviteAffiliate}
                onComplete={handleOnboardingComplete}
                // FIX: Corrected typo from handleOnboardingSkip to handleSkipOnboarding
                onSkip={handleSkipOnboarding}
            />}
        </div>
    );
  }

  return (
    <>
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      {renderContent()}
    </>
  );
};

export default App;
