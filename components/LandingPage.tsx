import React, { useState, useEffect, useRef } from 'react';
import { planDetails, User, PlatformSettings as PlatformSettingsType } from '../data/mockData';

interface LandingPageProps {
  currentUser?: User | null;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToPartnerflowSignup: () => void;
  onNavigateToMarketplace: () => void;
  platformSettings: PlatformSettingsType;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-cyan-500 mr-2 flex-shrink-0" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
            }
        );
        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            id={id}
            className={`${className} transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
            {children}
        </div>
    );
};

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-4">
            <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="text-lg font-medium">{question}</h4>
                <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                 <div className="overflow-hidden">
                    <p className="text-gray-600 dark:text-gray-400 pt-4">{children}</p>
                 </div>
            </div>
        </div>
    );
};

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;


const features = [
    {
        id: 'dashboard',
        title: 'Your Mission Control',
        description: 'Get a bird\'s-eye view of your entire affiliate program. Track clicks, sales, and commissions in real-time with a clear, concise, and actionable dashboard.',
        imageUrl: 'https://i.imgur.com/5zV8V18.png',
        icon: <DashboardIcon />
    },
    {
        id: 'affiliates',
        title: 'Powerful Affiliate Management',
        description: 'Effortlessly manage your partners. Invite new affiliates with a unique link, approve applications, and track individual performance.',
        imageUrl: 'https://i.imgur.com/OQSv5xN.png',
        icon: <UsersIcon />
    },
    {
        id: 'reports',
        title: 'Insightful, Actionable Reports',
        description: 'Dive deep into your data. Understand which products and partners are driving the most growth and make data-driven decisions to scale your program.',
        imageUrl: 'https://i.imgur.com/pYVv8aM.png',
        icon: <ChartBarIcon />
    }
];

const LandingPage: React.FC<LandingPageProps> = ({ currentUser, onNavigateToLogin, onNavigateToRegister, onNavigateToDashboard, onNavigateToPartnerflowSignup, onNavigateToMarketplace, platformSettings }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterError, setNewsletterError] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [activeFeature, setActiveFeature] = useState('dashboard');
    const plans = Object.values(planDetails);
    
    const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(false);

    useEffect(() => {
        const isDismissed = sessionStorage.getItem('announcementDismissed') === 'true';
        const shouldBeVisible = platformSettings.announcement.isEnabled && !isDismissed;
        setIsAnnouncementVisible(shouldBeVisible);
    }, [platformSettings]);

    const handleDismissAnnouncement = () => {
        sessionStorage.setItem('announcementDismissed', 'true');
        setIsAnnouncementVisible(false);
    };

    const currentFeature = features.find(f => f.id === activeFeature) || features[0];

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setNewsletterError('');
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
            setNewsletterError("Please enter a valid email address.");
            return;
        }
    
        // Simulate subscription
        console.log(`Subscribing ${newsletterEmail} to the newsletter.`);
        setIsSubscribed(true);
    };

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans overflow-x-hidden">
            {isAnnouncementVisible && (
                <div className="bg-cyan-500 text-white text-sm font-medium p-2 text-center relative">
                    <span>{platformSettings.announcement.text}</span>
                    <button onClick={handleDismissAnnouncement} className="absolute top-1/2 right-4 transform -translate-y-1/2">&times;</button>
                </div>
            )}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="flex items-center">
                        <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold ml-3 text-gray-800 dark:text-white">PartnerFlow</h1>
                    </a>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <a href="#features" className="hover:text-cyan-500 transition-colors">Features</a>
                        <button onClick={onNavigateToMarketplace} className="hover:text-cyan-500 transition-colors">Marketplace</button>
                        <a href="#pricing" className="hover:text-cyan-500 transition-colors">Pricing</a>
                        <a href="#faq" className="hover:text-cyan-500 transition-colors">FAQ</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                             <button onClick={onNavigateToDashboard} className="px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-transform hover:scale-105">
                                Go to Dashboard &rarr;
                            </button>
                        ) : (
                            <>
                                <button onClick={onNavigateToLogin} className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Login</button>
                                <button onClick={onNavigateToRegister} className="hidden md:block px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-transform hover:scale-105">
                                    Start Free Trial
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className="relative text-center pt-24 pb-16 md:pt-32 md:pb-20 px-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                     <div className="absolute inset-0 bg-grid-gray-200/50 dark:bg-grid-gray-700/20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
                    <div className="relative z-10 container mx-auto">
                        <FadeIn>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                Your Affiliate Program on <span className="bg-gradient-to-r from-cyan-400 to-teal-400 text-transparent bg-clip-text">Autopilot</span>.
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                                Stop drowning in spreadsheets. PartnerFlow is the all-in-one platform for creators to launch, manage, and scale their affiliate programs with ease.
                            </p>
                            <div className="flex justify-center items-center gap-4">
                                <button onClick={onNavigateToRegister} className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg shadow-xl hover:bg-cyan-600 transform hover:scale-105 transition-transform duration-300">
                                    Start Your 14-Day Free Trial &rarr;
                                </button>
                            </div>
                        </FadeIn>

                        <FadeIn className="mt-20 max-w-5xl mx-auto">
                            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px]">
                                <div className="rounded-lg overflow-hidden h-[156px] md:h-[278px] bg-white dark:bg-gray-800">
                                    <img src="https://i.imgur.com/5zV8V18.png" className="h-[156px] md:h-[278px] w-full object-cover object-left-top" alt="PartnerFlow Dashboard Screenshot" />
                                </div>
                            </div>
                            <div className="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl h-[24px] max-w-[301px] md:h-[42px] md:max-w-[512px]">
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-gray-800"></div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">Trusted by leading creators and coaches</p>
                        </FadeIn>
                    </div>
                </section>

                <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900">
                    <FadeIn className="container mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold">Everything you need. Nothing you don't.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">PartnerFlow is packed with powerful features designed to save you time and help you grow your affiliate revenue.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                            <div className="lg:col-span-1 space-y-4">
                                {features.map(feature => (
                                    <button
                                        key={feature.id}
                                        onClick={() => setActiveFeature(feature.id)}
                                        className={`w-full text-left p-6 rounded-lg transition-all duration-300 ${activeFeature === feature.id ? 'bg-cyan-50 dark:bg-cyan-900/20 ring-2 ring-cyan-500 shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-md mr-4 ${activeFeature === feature.id ? 'text-cyan-600' : 'text-gray-500'}`}>
                                                {feature.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold">{feature.title}</h3>
                                        </div>
                                        {activeFeature === feature.id && (
                                            <p className="text-gray-600 dark:text-gray-400 mt-2 pl-12 text-sm">{feature.description}</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="lg:col-span-2 sticky top-24">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg blur-2xl opacity-20 dark:opacity-30"></div>
                                    <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                                        {features.map(feature => (
                                            <img
                                                key={feature.id}
                                                src={feature.imageUrl}
                                                alt={feature.title}
                                                className={`rounded-md w-full h-auto transition-opacity duration-500 ${activeFeature === feature.id ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </section>
                
                <section id="pricing" className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
                    <FadeIn className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                            Choose a plan that scales with you. Every plan starts with a 14-day free trial.
                        </p>
                         <div className="flex justify-center items-center mb-12 space-x-4">
                            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-cyan-500' : ''}`}>Monthly</span>
                            <label htmlFor="billing-toggle-2" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="billing-toggle-2" className="sr-only peer" checked={billingCycle === 'annual'} onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')} />
                                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-500"></div>
                            </label>
                            <span className={`font-medium relative ${billingCycle === 'annual' ? 'text-cyan-500' : ''}`}>
                                Annual
                                <span className="absolute -top-5 -right-12 text-xs font-bold bg-teal-400 text-teal-900 px-2 py-1 rounded-full transform rotate-12">Save 20%</span>
                            </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                          {plans.map((plan) => (
                            <div key={plan.name} className={`p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col transition transform hover:scale-[1.02] ${plan.name === 'Growth Plan' ? 'ring-2 ring-cyan-500 relative shadow-[0_0_20px_theme(colors.cyan.500/0.5)]' : 'border border-gray-200 dark:border-gray-700'}`}>
                              {plan.name === 'Growth Plan' && <div className="absolute top-0 -translate-y-1/2 bg-cyan-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg self-center">Most Popular</div>}
                              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                               <p className="mb-6 h-16 text-gray-600 dark:text-gray-400">
                                 <span className="text-4xl font-bold text-gray-800 dark:text-white">${(billingCycle === 'annual' ? plan.annualPrice / 12 : plan.price).toFixed(2)}</span> 
                                 / month
                                 {billingCycle === 'annual' && <span className="block text-sm font-medium">Billed as ${plan.annualPrice} per year</span>}
                               </p>
                              <ul className="space-y-4 text-left mb-8 flex-grow">
                                <li className="flex items-center"><CheckIcon /><span>Up to <strong>{plan.limits.affiliates}</strong> Affiliates</span></li>
                                <li className="flex items-center"><CheckIcon /><span>Up to <strong>{plan.limits.products}</strong> Products</span></li>
                              </ul>
                              <button onClick={onNavigateToRegister} className={`w-full mt-auto px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-300 ${plan.name === 'Growth Plan' ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                Start 14-Day Free Trial
                              </button>
                            </div>
                          ))}
                        </div>

                         <div className="mt-12 w-full max-w-6xl mx-auto">
                            <h3 className="text-2xl font-bold mb-6">Compare All Features</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="py-4 px-2 font-semibold">Feature</th>
                                            {plans.map(p => <th key={p.name} className="py-4 px-2 font-semibold text-center">{p.name}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 dark:text-gray-400">
                                        <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50"><td colSpan={4} className="py-3 px-2 font-bold text-gray-800 dark:text-white">Core Features</td></tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">Affiliate Limit</td>
                                            {plans.map(p => <td key={p.name} className="py-3 px-2 text-center font-medium text-gray-800 dark:text-white">{p.limits.affiliates}</td>)}
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">Product Limit</td>
                                            {plans.map(p => <td key={p.name} className="py-3 px-2 text-center font-medium text-gray-800 dark:text-white">{p.limits.products}</td>)}
                                        </tr>
                                         <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">Affiliate Portal</td>
                                            {plans.map(p => <td key={p.name} className="py-3 px-2 text-center">{p.features.hasAffiliatePortal ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon />}</td>)}
                                        </tr>
                                         <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">Automated Payouts (Stripe)</td>
                                            <td className="py-3 px-2 text-center"><CheckIcon className="h-5 w-5 text-green-500 mx-auto" /></td>
                                            <td className="py-3 px-2 text-center"><CheckIcon className="h-5 w-5 text-green-500 mx-auto" /></td>
                                            <td className="py-3 px-2 text-center"><CheckIcon className="h-5 w-5 text-green-500 mx-auto" /></td>
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50"><td colSpan={4} className="py-3 px-2 font-bold text-gray-800 dark:text-white mt-4">Advanced Features</td></tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">Tiered Commissions & Bonuses</td>
                                            {plans.map(p => <td key={p.name} className="py-3 px-2 text-center">{p.features.hasTieredCommissions ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon />}</td>)}
                                        </tr>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">API Access</td>
                                            {plans.map(p => <td key={p.name} className="py-3 px-2 text-center">{p.features.hasApiAccess ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon />}</td>)}
                                        </tr>
                                         <tr className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-800/50">
                                            <td className="py-3 px-2">Priority Support</td>
                                            {plans.map(p => <td key={p.name} className="py-3 px-2 text-center">{p.features.prioritySupport ? <CheckIcon className="h-5 w-5 text-green-500 mx-auto" /> : <XIcon />}</td>)}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                <section id="faq" className="py-24 px-6 bg-white dark:bg-gray-900">
                    <FadeIn className="container mx-auto max-w-3xl">
                        <h2 className="text-4xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                        <FaqItem question="What happens after my 14-day free trial ends?">
                            After your trial ends, you'll be asked to choose a plan and enter your payment details to continue using PartnerFlow. Your data and settings from the trial period will be saved.
                        </FaqItem>
                        <FaqItem question="What platforms does PartnerFlow integrate with?">
                            PartnerFlow is designed to be platform-agnostic. Our simple tracking pixel can be placed on any website or checkout page where you can add custom scripts, including Kajabi, Thrivecart, Teachable, Podia, and custom-built sites. We also offer direct API access on our Growth & Pro Plans for deeper integrations.
                        </FaqItem>
                        <FaqItem question="Is there a limit on sales or revenue?">
                            No! We believe in transparent pricing. We never charge you based on your success. There are no limits on the number of sales you can track or the amount of commission you generate. Your plan is only limited by the number of active affiliates and products.
                        </FaqItem>
                        <FaqItem question="How do payouts work?">
                            You connect your Stripe account to PartnerFlow. At the end of your payout period (e.g., monthly), you can review all due commissions and initiate a mass payout with a single click. PartnerFlow handles the calculations and tells Stripe to send the correct amount to each of your affiliates, saving you hours of manual work.
                        </FaqItem>
                         <FaqItem question="Can I change my plan later?">
                            Of course! You can upgrade or downgrade your plan at any time from your billing settings. The change will take effect immediately.
                        </FaqItem>
                         <FaqItem question="Is my data secure?">
                            Yes, security is our top priority. All data is encrypted in transit and at rest. We use industry-standard security practices to protect your information and your affiliates' data.
                        </FaqItem>
                    </FadeIn>
                     <FadeIn className="container mx-auto max-w-3xl text-center mt-16">
                        <h3 className="text-2xl font-bold">Still have questions?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">Our team is here to help you get started.</p>
                        <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Contact Support
                        </button>
                    </FadeIn>
                </section>

                <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
                    <FadeIn className="container mx-auto max-w-3xl text-center">
                         <svg className="mx-auto h-12 w-12 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-4xl font-bold mb-4">Join Our Newsletter</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            Get expert tips, case studies, and industry news on affiliate marketing delivered straight to your inbox.
                        </p>
                        {isSubscribed ? (
                            <div className="text-lg font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg max-w-lg mx-auto">
                                <p>✅ Success! Thanks for subscribing. Check your inbox for a confirmation.</p>
                            </div>
                        ) : (
                            <div>
                                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterError(''); }}
                                        placeholder="Enter your email address"
                                        className="w-full px-5 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        required
                                        aria-label="Email for newsletter"
                                    />
                                    <button
                                        type="submit"
                                        className="flex-shrink-0 px-8 py-3 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                                {newsletterError && <p className="text-red-500 text-sm mt-2">{newsletterError}</p>}
                            </div>
                        )}
                    </FadeIn>
                </section>

                <section className="relative py-24 px-6 bg-gray-900 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-400 opacity-10"></div>
                    <FadeIn className="relative z-10">
                        <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business on Autopilot?</h2>
                        <p className="text-lg text-gray-300 mb-8">Stop managing, start growing. See how PartnerFlow can transform your partnership program.</p>
                        <button onClick={onNavigateToRegister} className="px-8 py-4 bg-white text-cyan-600 font-bold rounded-lg shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-transform duration-300">
                            Start Your Free Trial - No Card Required
                        </button>
                    </FadeIn>
                </section>
            </main>
            
            <footer className="bg-white dark:bg-gray-900">
                <div className="container mx-auto px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    <div className="mb-4">
                        <button onClick={onNavigateToPartnerflowSignup} className="text-sm hover:text-cyan-500 transition-colors">Become an Affiliate</button>
                    </div>
                    <p>&copy; {new Date().getFullYear()} PartnerFlow. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;