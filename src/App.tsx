import React, { useState, useEffect, useCallback } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

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
    Payment,
    Sale
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
import PartnerflowAffiliates from '../components/PartnerflowAffiliates';
import AiAssistant from '../components/AiAssistant';
import Marketplace from '../components/Marketplace';
import NotFoundPage from '../components/NotFoundPage';
import PartnerflowAffiliateSignupPage from '../components/PartnerflowAffiliateSignupPage';
import CreatorAffiliateSignupPage from '../components/CreatorAffiliateSignupPage';
import AffiliateSignupPage from '../components/AffiliateSignupPage';
import Financials from '../components/Financials';
import LoadingSpinner from '../components/LoadingSpinner';
import CheckoutPage from '../components/CheckoutPage';
import ThankYouPage from '../components/ThankYouPage';
import CreatorProfilePage from '../components/CreatorProfilePage';


// Types
export type Page = 'Dashboard' | 'Affiliates' | 'Products' | 'Resources' | 'Payouts' | 'Reports' | 'Communicate' | 'Billing' | 'Settings';
export type AdminPage = 'AdminDashboard' | 'Clients' | 'Analytics' | 'PartnerflowAffiliates' | 'PlatformSettings' | 'Financials';
export type Theme = 'light' | 'dark';
export type ActiveView = 'creator' | 'affiliate';
export type AppView = 'landing' | 'login_selector' | 'creator_login' | 'affiliate_login' | 'register' | 'creator_affiliate_signup' | 'partnerflow_affiliate_signup' | 'app' | 'stripe_connect' | 'marketplace' | 'not_found' | 'affiliate_apply_signup' | 'affiliate_signup' | 'checkout-status' | 'thank_you' | 'public_creator_page';

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
    const [isLoading, setIsLoading] = useState(true);
    const [planToCheckout, setPlanToCheckout] = useState<{ plan: Plan, cycle: 'monthly' | 'annual'} | null>(null);
    const [publicCreator, setPublicCreator] = useState<User | null>(null);


    // Data state
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [communications, setCommunications] = useState<Communication[]>([]);
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [planDetails, setPlanDetails] = useState(mockPlanDetails);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettingsType>(mockPlatformSettings);
    const [payments, setPayments] = useState<Payment[]>([]);
    
    const useMockData = !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY;
    
    const fetchData = useCallback(async (sessionUser: any) => {
        if (useMockData) {
            setUsers(mockUsers);
            setProducts(mockProducts);
            setPayouts(mockPayouts);
            setResources(mockResources);
            setCommunications(mockCommunications);
            setUserSettings(mockUserSettings);
            setPayments(mockPayments);
            return;
        }

        setIsLoading(true);
        // NOTE: These selects will fetch ALL data. In a production app, you MUST enable
        // Row Level Security (RLS) in Supabase to ensure users can only access their own data.
        const [
            { data: usersData, error: usersError }, 
            { data: productsData, error: productsError }, 
            { data: payoutsData, error: payoutsError }, 
            { data: resourcesData, error: resourcesError }, 
            { data: commsData, error: commsError }, 
            { data: settingsData, error: settingsError },
            { data: paymentsData, error: paymentsError }
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('products').select('*'),
            supabase.from('payouts').select('*'),
            supabase.from('resources').select('*'),
            supabase.from('communications').select('*'),
            supabase.from('user_settings').select('*').eq('user_id', sessionUser.id).single(),
            supabase.from('payments').select('*'),
        ]);

        if (usersError) console.warn('Error fetching users:', usersError.message);
        if (productsError) console.warn('Error fetching products:', productsError.message);
        if (payoutsError) console.warn('Error fetching payouts:', payoutsError.message);
        if (resourcesError) console.warn('Error fetching resources:', resourcesError.message);
        if (commsError) console.warn('Error fetching communications:', commsError.message);
        // A missing settings row is not a critical error, so we don't warn.
        if (paymentsError) console.warn('Error fetching payments:', paymentsError.message);

        setUsers(usersData as User[] || []);
        setProducts(productsData as Product[] || []);
        setPayouts(payoutsData as Payout[] || []);
        setResources(resourcesData as Resource[] || []);
        setCommunications(commsData as Communication[] || []);
        setUserSettings(settingsData as UserSettings || null);
        setPayments(paymentsData as Payment[] || []);
        setIsLoading(false);

    }, [useMockData]);

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

    useEffect(() => {
        if (useMockData) {
            setIsLoading(false);
            setUsers(mockUsers);
            setProducts(mockProducts);
            setPayouts(mockPayouts);
            setResources(mockResources);
            setCommunications(mockCommunications);
            setUserSettings(mockUserSettings);
            setPayments(mockPayments);
            // Public page routing for mock data
            const path = window.location.pathname;
            const urlParams = new URLSearchParams(window.location.search);
            const refCreatorId = urlParams.get('ref');

            if (refCreatorId) {
                const creator = mockUsers.find(u => u.id === refCreatorId);
                if (creator) {
                    setSelectedCreatorForAffiliateSignup(creator);
                    setAppView('creator_affiliate_signup');
                } else {
                    setAppView('not_found');
                }
            } else if (path !== '/' && path.length > 1) {
                const slug = path.substring(1);
                const creator = mockUsers.find(u => u.slug === slug && u.roles.includes('creator'));
                if (creator) {
                    setPublicCreator(creator);
                    setAppView('public_creator_page');
                } else {
                    setAppView('not_found');
                }
            } else {
                setAppView('landing');
            }
            return;
        }

        setIsLoading(true);
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (session) {
                let { data: userProfile, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();

                // Handle new user from Google sign-in
                if (!userProfile && session.user.app_metadata.provider === 'google' && event === 'SIGNED_IN') {
                    const newUser: Partial<User> = {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata.full_name,
                        avatar: session.user.user_metadata.avatar_url,
                        roles: ['affiliate'], // Default role for Google signups
                        status: 'Active',
                        joinDate: new Date().toISOString(),
                        onboardingStepCompleted: 0,
                    };
                    const { data: newProfileData, error: insertError } = await supabase.from('users').insert(newUser).select().single();
                    if (insertError) {
                        console.error("Error creating profile for Google user:", insertError);
                        handleLogout();
                        return;
                    }
                    userProfile = newProfileData;
                    showToast(`Welcome, ${userProfile.name}! Your affiliate account has been created.`);
                }
                
                if (userProfile) {
                    setCurrentUser(userProfile);
                    await fetchData(session.user);
                    setPublicCreator(null);
                    setAppView('app');

                    if (userProfile.roles.includes('super_admin')) setActivePage('AdminDashboard');
                    else if (userProfile.roles.includes('affiliate') && !userProfile.roles.includes('creator')) setActiveView('affiliate');
                    else setActivePage('Dashboard');
                } else {
                    setCurrentUser(null);
                    setAppView('landing');
                }
            } else {
                 const path = window.location.pathname;
                const urlParams = new URLSearchParams(window.location.search);
                const refCreatorId = urlParams.get('ref');
                
                if (refCreatorId) {
                    const { data: creator } = await supabase.from('users').select('*').eq('id', refCreatorId).single();
                    if (creator) {
                        setSelectedCreatorForAffiliateSignup(creator);
                        setAppView('creator_affiliate_signup');
                    } else {
                        setAppView('not_found');
                    }
                } else if (path !== '/' && path.length > 1) {
                    const slug = path.substring(1);
                    const { data: creator } = await supabase.from('users').select('*').eq('slug', slug).single();
                    if (creator) {
                        setPublicCreator(creator);
                        setAppView('public_creator_page');
                    } else {
                        setAppView('not_found');
                    }
                } else {
                    setCurrentUser(null);
                    setAppView('landing');
                }
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [useMockData, fetchData]);


    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (useMockData) {
            const user = users.find(u => u.email === email);
            if (user && password === 'password') {
                setCurrentUser(user);
                setAppView('app');
                if (user.roles.includes('super_admin')) setActivePage('AdminDashboard');
                else if (user.roles.includes('affiliate') && !user.roles.includes('creator')) setActiveView('affiliate');
                return { success: true };
            }
            return { success: false, error: 'Invalid credentials for demo.' };
        }
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        // onAuthStateChange will handle the rest
        return { success: true };
    };

    const handleGoogleSignIn = async () => {
        if (useMockData) {
            showToast("Google Sign-In is not available in demo mode.");
            return;
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            showToast(`Google Sign-In Error: ${error.message}`);
        }
    };
    
    const handleLogout = async () => {
        if (useMockData) {
            setCurrentUser(null);
            setAppView('landing');
            setActivePage('Dashboard');
            setActiveView('creator');
            // Hard refresh to simulate logout and clear URL state
            window.location.href = '/';
            return;
        }
        await supabase.auth.signOut();
        setCurrentUser(null);
        setAppView('landing');
         window.location.href = '/';
    };
    
    const handleSignup = async (name: string, companyName: string, email: string, password: string): Promise<{ success: boolean; error?: string; }> => {
        if (useMockData) {
            showToast("Signup successful! You can now log in with demo credentials.");
            setAppView('creator_login');
            return { success: true };
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { success: false, error: error.message };

        if (data.user) {
            const { error: profileError } = await supabase.from('users').insert({
                id: data.user.id,
                name,
                email,
                avatar: `https://i.pravatar.cc/150?u=${email}`,
                roles: ['creator'],
                company_name: companyName,
                currentPlan: 'Starter Plan',
                joinDate: new Date().toISOString(),
                status: 'Active',
                trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
                onboardingStepCompleted: 0,
            });

            if(profileError) {
                // If profile creation fails, it's best to inform the user and maybe clean up the auth user.
                // For now, just returning the error is sufficient.
                return { success: false, error: `Could not create user profile: ${profileError.message}` };
            }

            showToast("Registration successful! Please check your email to confirm your account.");
            setAppView('creator_login');
            return { success: true };
        }
        return { success: false, error: 'An unknown error occurred during signup.' };
    };
    
    const handlePlanChange = async (newPlanName: string, billingCycle: 'monthly' | 'annual') => {
        const plan = planDetails[newPlanName as keyof typeof planDetails];
        if (plan) {
            setPlanToCheckout({ plan, cycle: billingCycle });
            setAppView('checkout-status');
        }
    };
    
    const handleSubscriptionSuccess = async () => {
        if (!currentUser || !planToCheckout) return;

        const newPlan = planToCheckout.plan;
        const newCycle = planToCheckout.cycle;
        const amount = newCycle === 'annual' ? newPlan.annualPrice : newPlan.price;

        // NEW LOGIC: Upgrade role if user is an affiliate
        const isUpgrading = !currentUser.roles.includes('creator');
        let updatedRoles = currentUser.roles;
        if (isUpgrading) {
            updatedRoles = [...currentUser.roles, 'creator'];
        }

        if (useMockData) {
            setCurrentUser(u => u ? { ...u, currentPlan: newPlan.name, billingCycle: newCycle, trialEndsAt: undefined, roles: updatedRoles } : null);
            setPayments(p => [...p, { id: Date.now(), user_id: currentUser.id, amount, date: new Date().toISOString().split('T')[0], plan: newPlan.name }]);
            showToast(`Successfully subscribed to the ${newPlan.name}!`);
             if (isUpgrading) {
                showToast("You've been upgraded to a Creator! Redirecting to your new dashboard...");
                setActiveView('creator');
                setActivePage('Dashboard');
            }
            return;
        }

        const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
                currentPlan: newPlan.name, 
                billingCycle: newCycle, 
                trialEndsAt: null,
                roles: updatedRoles // Update roles in DB
            })
            .eq('id', currentUser.id);

        if (userUpdateError) {
            showToast(`Error: ${userUpdateError.message}`);
            return;
        }

        const { error: paymentInsertError } = await supabase.from('payments').insert({
            user_id: currentUser.id,
            amount,
            date: new Date().toISOString().split('T')[0],
            plan: newPlan.name
        });

        if (paymentInsertError) {
            showToast(`Error recording payment: ${paymentInsertError.message}`);
        } else {
            showToast(`Successfully subscribed to the ${newPlan.name}!`);
        }
        
        if (isUpgrading) {
            showToast("You've been upgraded to a Creator!");
            setActiveView('creator');
            setActivePage('Dashboard');
        }

        await fetchData(currentUser); // Refetch all data to update UI
    };

    const handleStripeConnectSuccess = async () => {
        if (!currentUser) return;
    
        if (useMockData) {
            setUserSettings(prev => prev ? { ...prev, integrations: { ...prev.integrations, stripe: 'Connected' } } : null);
        } else {
            if (!userSettings) return; // Should not happen for a logged-in user
            const newIntegrations = { ...userSettings.integrations, stripe: 'Connected' as 'Connected' | 'Disconnected' };
            const { error } = await supabase.from('user_settings').upsert({ ...userSettings, integrations: newIntegrations });
            if (error) {
                showToast(`Error connecting Stripe: ${error.message}`);
            } else {
                await fetchData(currentUser); // Refetch to get updated settings
            }
        }
        
        showToast("Stripe connected successfully!");
        setAppView('app');
        setActivePage('Settings');
    };

    const handleTrackSale = (referralCode: string, saleDetails: { productId: string; amount: number; }) => {
        if (!useMockData) {
            showToast("Sale tracking simulation is only available in demo mode.");
            return;
        }

        const affiliate = users.find(u => u.referralCode === referralCode || u.couponCode === referralCode);
        if (!affiliate) {
          showToast(`Sale tracked, but no affiliate found for code: ${referralCode}`);
          return;
        }
    
        const product = products.find(p => p.id.toString() === saleDetails.productId);
        if (!product) {
          showToast(`Sale tracked, but product ID ${saleDetails.productId} not found.`);
          return;
        }
    
        // Calculate commission
        let commissionRate = 0;
        const sortedTiers = [...product.commission_tiers].sort((a, b) => b.threshold - a.threshold);
        for (const tier of sortedTiers) {
          if ((affiliate.sales || 0) >= tier.threshold) {
            commissionRate = tier.rate;
            break;
          }
        }
        const commissionAmount = saleDetails.amount * (commissionRate / 100);
    
        // Create new sale object
        const newSale: Sale = {
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          saleAmount: saleDetails.amount,
          commissionAmount,
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
        };
    
        // Find or create payout for the current month
        const today = new Date();
        const currentMonthPeriod = `${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;
        
        let updatedPayouts = [...payouts];
        let affiliatePayout = updatedPayouts.find(p => p.user_id === affiliate.id && p.period === currentMonthPeriod);
    
        if (affiliatePayout) {
          affiliatePayout.sales.push(newSale);
          affiliatePayout.amount += commissionAmount;
        } else {
          affiliatePayout = {
            id: Date.now() + 1,
            user_id: affiliate.id,
            affiliate_name: affiliate.name,
            affiliate_avatar: affiliate.avatar,
            amount: commissionAmount,
            period: currentMonthPeriod,
            due_date: new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split('T')[0], // End of next month
            status: 'Due',
            sales: [newSale],
          };
          updatedPayouts.push(affiliatePayout);
        }
        setPayouts(updatedPayouts);
    
        // Update product and affiliate stats
        const updatedProducts = products.map(p => 
          p.id === product.id ? { ...p, sales_count: p.sales_count + 1 } : p
        );
        setProducts(updatedProducts);
    
        const updatedUsers = users.map(u => 
          u.id === affiliate.id ? { 
            ...u, 
            sales: (u.sales || 0) + 1,
            commission: (u.commission || 0) + commissionAmount 
          } : u
        );
        setUsers(updatedUsers);
    
        showToast(`Success! Sale of ${product.name} attributed to ${affiliate.name}.`);
      };

    const handleAffiliateSignup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string; }> => {
        if (useMockData) {
             const newAffiliate: User = {
                id: crypto.randomUUID(), name, email, avatar: `https://i.pravatar.cc/150?u=${email}`, roles: ['affiliate'], status: 'Active',
                joinDate: new Date().toISOString().split('T')[0], partnerships: [], onboardingStepCompleted: 0,
            };
            setUsers(prev => [...prev, newAffiliate]);
            setCurrentUser(newAffiliate);
            setActiveView('affiliate');
            setAppView('app');
            showToast("Welcome to PartnerFlow!");
            return { success: true };
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { success: false, error: error.message };

        if (data.user) {
            const { error: profileError } = await supabase.from('users').insert({
                id: data.user.id, name, email, avatar: `https://i.pravatar.cc/150?u=${email}`, roles: ['affiliate'],
                status: 'Active', joinDate: new Date().toISOString(), partnerships: [], onboardingStepCompleted: 0,
            });

            if(profileError) { return { success: false, error: `Could not create user profile: ${profileError.message}` }; }
            
            // onAuthStateChange will log them in.
            return { success: true };
        }
        return { success: false, error: 'An unknown error occurred during signup.' };
    };
    
    const handleUpdateUser = async (userId: string, data: Partial<User>) => {
        if (useMockData) {
            setUsers(users => users.map(u => u.id === userId ? {...u, ...data} : u));
            if (currentUser?.id === userId) {
                setCurrentUser(u => u ? { ...u, ...data} : null);
            }
            showToast("Profile updated in demo mode.");
            return;
        }

        const { error } = await supabase.from('users').update(data).eq('id', userId);

        if (error) {
            showToast(`Error updating profile: ${error.message}`);
        } else {
            showToast("Profile updated successfully.");
            if (currentUser) {
                await fetchData(currentUser);
            }
        }
    };
    
    const handleSettingsChange = async (newSettings: UserSettings) => {
        setUserSettings(newSettings); // Optimistic update

        if (useMockData) {
            showToast("Settings updated in demo mode.");
            return;
        }

        if (!currentUser) return;

        const { error } = await supabase.from('user_settings').upsert(newSettings);

        if (error) {
            showToast(`Error saving settings: ${error.message}`);
            fetchData(currentUser); // Revert
        } else {
            showToast("Settings saved successfully.");
        }
    };

    const handleAffiliateApply = async (creatorId: string) => {
        if (!currentUser) {
            showToast("Please log in or sign up to apply for programs.");
            setAppView('affiliate_login');
            return;
        }

        const creator = users.find(u => u.id === creatorId);
        if (!creator) return;

        if (currentUser.partnerships?.some(p => p.creatorId === creatorId)) {
            showToast(`You have already applied to or joined ${creator.company_name}'s program.`);
            return;
        }
        
        const newPartnership: Partnership = { creatorId: creatorId, status: 'Pending' };
        const updatedPartnerships = [...(currentUser.partnerships || []), newPartnership];
        
        await handleUpdateUser(currentUser.id, { partnerships: updatedPartnerships });
        
        showToast(`Application to ${creator.company_name}'s program submitted!`);
    };
    
    const handleCreatorAffiliateSignup = async (name: string, email: string) => {
        if (!selectedCreatorForAffiliateSignup) return;
        const creator = selectedCreatorForAffiliateSignup;

        if (useMockData) {
            const newPartnership: Partnership = { creatorId: creator.id, status: 'Pending' };
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                setUsers(users.map(u => u.id === existingUser.id ? {...u, partnerships: [...(u.partnerships || []), newPartnership]} : u));
            } else {
                 setUsers(prev => [...prev, {
                    id: crypto.randomUUID(), name, email, avatar: `https://i.pravatar.cc/150?u=${email}`, roles: ['affiliate'], status: 'Active',
                    joinDate: new Date().toISOString().split('T')[0], partnerships: [newPartnership], onboardingStepCompleted: 0,
                 }]);
            }
            showToast(`Application submitted to ${creator.company_name}! You'll be notified upon approval.`);
            return;
        }
        
        const newPartnership: Partnership = { creatorId: creator.id, status: 'Pending' };
        const { data: existingUser } = await supabase.from('users').select('id, partnerships').eq('email', email).single();

        if (existingUser) {
            if (existingUser.partnerships?.some(p => p.creatorId === creator.id)) {
                showToast("This user has already applied to this program."); return;
            }
            const { error } = await supabase.from('users').update({ partnerships: [...(existingUser.partnerships || []), newPartnership] }).eq('id', existingUser.id);
            if (error) showToast(`Error: ${error.message}`);
        } else {
            const { error } = await supabase.from('users').insert({
                name, email, avatar: `https://i.pravatar.cc/150?u=${email}`, roles: ['affiliate'], status: 'Active',
                joinDate: new Date().toISOString().split('T')[0], partnerships: [newPartnership], onboardingStepCompleted: 0,
            });
            if (error) showToast(`Error: ${error.message}`);
        }
        
        showToast(`Application submitted to ${creator.company_name}! You'll be notified upon approval.`);
    };

    const onRecordSale = (affiliateId: string, productId: string, saleAmount: number) => { 
        if (!useMockData) {
            showToast("Manual sale recording is a demo feature.");
            return;
        }
        showToast(`Simulated sale recorded for affiliate ID ${affiliateId}`); 
    };
    const onRecordSaleByCoupon = (couponCode: string, productId: string, saleAmount: number) => { 
        if (!useMockData) {
            showToast("Manual sale recording is a demo feature.");
            return;
        }
        showToast(`Simulated sale recorded with coupon ${couponCode}`); 
    };

    if (isLoading) {
        return <LoadingSpinner fullPage />;
    }
    
    if (!currentUser || appView !== 'app') {
        switch (appView) {
            case 'public_creator_page':
                if (publicCreator) {
                    const creatorProducts = (useMockData ? mockProducts : products).filter(p => p.user_id === publicCreator.id && p.isPubliclyListed);
                    return <CreatorProfilePage 
                        creator={publicCreator}
                        products={creatorProducts}
                        onJoin={(creatorId) => {
                            const creator = (useMockData ? mockUsers : users).find(u => u.id === creatorId);
                            setSelectedCreatorForAffiliateSignup(creator || null);
                            setAppView('creator_affiliate_signup');
                        }}
                    />
                }
                return <NotFoundPage onNavigateHome={() => setAppView('landing')} />;
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
                return <LoginPage onLogin={handleLogin} onBack={() => setAppView('landing')} onNavigateToRegister={() => setAppView('register')} onGoogleSignIn={handleGoogleSignIn} />;
            case 'affiliate_login':
                return <AffiliateLoginPage 
                            onLogin={handleLogin} 
                            onNavigateToMarketplace={() => setAppView('marketplace')}
                            onNavigateToSignup={() => setAppView('affiliate_signup')}
                            onGoogleSignIn={handleGoogleSignIn}
                        />;
            case 'register':
                return <RegistrationPage onSignup={handleSignup} onBack={() => setAppView('landing')} onGoogleSignIn={handleGoogleSignIn} />;
            case 'affiliate_signup':
                return <AffiliateSignupPage onSignup={handleAffiliateSignup} onBack={() => setAppView('affiliate_login')} onGoogleSignIn={handleGoogleSignIn} />;
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
                return <StripeConnectPage onConnectSuccess={handleStripeConnectSuccess} onCancel={() => { setAppView('app'); setActivePage('Settings'); }} />;
            case 'checkout-status':
                return <CheckoutPage
                            planToCheckout={planToCheckout}
                            onSuccess={handleSubscriptionSuccess}
                            onReturnToApp={() => { 
                                setAppView('app'); 
                                setActivePage('Billing');
                                setPlanToCheckout(null);
                            }}
                        />;
            case 'thank_you':
                return <ThankYouPage onNavigateHome={() => setAppView('app')} onTrackSale={handleTrackSale} />;
            case 'login_selector':
                return <LoginSelector onSelect={(view) => setAppView(view)} />;
            default:
                return <NotFoundPage onNavigateHome={() => setAppView('landing')} />;
        }
    }

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
                    onUpdateUser={handleUpdateUser}
                    onBecomeCreator={() => {
                        setActiveView('creator');
                        setActivePage('Billing');
                    }}
                />
    }

    const handleOnboardingStepChange = async (step: number) => {
        if (useMockData) {
            setCurrentUser(u => u ? {...u, onboardingStepCompleted: step} : null);
            return;
        }
        const { error } = await supabase.from('users').update({ onboardingStepCompleted: step }).eq('id', currentUser.id);
        if (error) showToast(`Error saving progress: ${error.message}`);
        else await fetchData(currentUser);
    };

    const handleOnboardingAddProduct = async (name: string, price: number) => {
        const productData = {
            user_id: currentUser.id,
            name,
            price,
            sales_page_url: 'https://example.com/your-product',
            commission_tiers: [{ threshold: 0, rate: 20 }],
            bonuses: [],
            isPubliclyListed: false,
            description: `This is a new product for ${name}.`,
            creation_date: new Date().toISOString().split('T')[0],
        };

        if (useMockData) {
            setProducts(p => [...p, { ...productData, id: Date.now(), sales_count: 0, clicks: 0 }]);
        } else {
            const { error } = await supabase.from('products').insert(productData);
            if (error) showToast(`Error adding product: ${error.message}`);
            else await fetchData(currentUser);
        }
        showToast(`${name} has been added!`);
    };

    const handleOnboardingInviteAffiliate = async (email: string) => {
        if (useMockData) {
            // Mock logic is handled in Affiliates component, this is a simplified version
            showToast(`Invite sent to ${email} in demo mode.`);
            return;
        }

        const { data: existingUser } = await supabase.from('users').select('id, partnerships').eq('email', email).single();
        const newPartnership = { creatorId: currentUser.id, status: 'Pending' as Partnership['status'] };

        if (existingUser) {
            const updatedPartnerships = [...(existingUser.partnerships || []), newPartnership];
            const { error } = await supabase.from('users').update({ partnerships: updatedPartnerships }).eq('id', existingUser.id);
            if(error) showToast(`Error: ${error.message}`);
        } else {
            const { error } = await supabase.from('users').insert({ name: `(${email.split('@')[0]})`, email, roles: ['affiliate'], status: 'Active', partnerships: [newPartnership] });
            if(error) showToast(`Error: ${error.message}`);
        }
        showToast(`Invitation sent to ${email}.`);
        await fetchData(currentUser);
    };


    const renderPage = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
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
            return <Billing currentUser={currentUser} affiliates={[]} products={[]} onPlanChange={handlePlanChange} isTrialExpired={true} />;
        }
        
        const myAffiliates = users.filter(u => u.partnerships?.some(p => p.creatorId === currentUser.id));
        const myProducts = products.filter(p => p.user_id === currentUser.id);
        const myPayouts = payouts.filter(payout => myAffiliates.some(aff => aff.id === payout.user_id));
        const myResources = resources.filter(r => r.user_id === currentUser.id);
        const myCommunications = communications.filter(c => c.sender_id === currentUser.id);

        switch (activePage as Page) {
            case 'Dashboard':
                return <Dashboard 
                            affiliates={myAffiliates} 
                            products={myProducts} 
                            payouts={myPayouts} 
                            onRecordSale={onRecordSale} 
                            onRecordSaleByCoupon={onRecordSaleByCoupon} 
                            onSimulatePurchase={() => {
                                document.cookie = "partnerflow_ref=ELENA-R;path=/"; // Set a demo cookie
                                setAppView('thank_you');
                            }}
                        />;
            case 'Affiliates':
                return <Affiliates affiliates={myAffiliates} allUsers={users} setUsers={setUsers} payouts={myPayouts} showToast={showToast} currentPlan={currentPlan} currentUser={currentUser} refetchData={() => fetchData(currentUser)} />;
            case 'Products':
                return <Products products={myProducts} setProducts={setProducts} useMockData={useMockData} resources={myResources} showToast={showToast} currentPlan={currentPlan} currentUser={currentUser} refetchData={() => fetchData(currentUser)} />;
            case 'Resources':
                return <Creatives resources={myResources} setResources={setResources} useMockData={useMockData} products={myProducts} showToast={showToast} currentUser={currentUser} refetchData={() => fetchData(currentUser)} setActiveView={setActiveView} />;
            case 'Payouts':
                return <Payouts payouts={myPayouts} userSettings={userSettings} setActivePage={setActivePage} showToast={showToast} refetchData={() => fetchData(currentUser)} />;
            case 'Reports':
                return <Reports affiliates={myAffiliates} products={myProducts} payouts={myPayouts} />;
            case 'Communicate':
                return <Communicate affiliates={myAffiliates} communications={myCommunications} onSend={async (comm) => {
                    if (useMockData) {
                        setCommunications(prev => [...prev, { ...comm, id: Date.now(), date: new Date().toISOString(), sender_id: currentUser.id }]);
                    } else {
                        await supabase.from('communications').insert({ ...comm, sender_id: currentUser.id });
                        fetchData(currentUser);
                    }
                    showToast("Message sent!");
                }}/>;
            case 'Billing':
                return <Billing currentUser={currentUser} affiliates={myAffiliates} products={myProducts} onPlanChange={handlePlanChange} isTrialExpired={isTrialExpired} />;
            case 'Settings':
                return <Settings currentUser={currentUser} userSettings={userSettings} onSettingsChange={handleSettingsChange} setAppView={setAppView} />;
            default:
                return <Dashboard 
                            affiliates={myAffiliates} 
                            products={myProducts} 
                            payouts={myPayouts} 
                            onRecordSale={onRecordSale} 
                            onRecordSaleByCoupon={onRecordSaleByCoupon}
                            onSimulatePurchase={() => {
                                document.cookie = "partnerflow_ref=ELENA-R;path=/"; // Set a demo cookie
                                setAppView('thank_you');
                            }}
                        />;
        }
    };

    return (
        <div className={`flex h-screen bg-gray-50 dark:bg-gray-950 ${theme}`}>
            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            {onboardingIncomplete &&
                <OnboardingModal 
                    currentUser={currentUser}
                    onStepChange={handleOnboardingStepChange}
                    onAddProduct={handleOnboardingAddProduct}
                    onInviteAffiliate={handleOnboardingInviteAffiliate}
                    onComplete={async () => {
                        await handleOnboardingStepChange(5);
                        showToast("Onboarding complete!");
                    }}
                    onSkip={async () => {
                        await handleOnboardingStepChange(5);
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
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    {renderPage()}
                </main>
            </div>
            {!isSuperAdmin && <AiAssistant affiliates={users.filter(u => u.partnerships?.some(p => p.creatorId === currentUser.id))} products={products.filter(p => p.user_id === currentUser.id)} payouts={payouts} />}
        </div>
    );
};

export default App;