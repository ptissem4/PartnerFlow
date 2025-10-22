import React, { useState, useEffect, useRef } from 'react';
import { planDetails, User, PlatformSettings as PlatformSettingsType } from '../data/mockData';
import AppShowcase from './AppShowcase';
import DashboardScreenshot from './DashboardScreenshot';
import AffiliatesScreenshot from './AffiliatesScreenshot';
import ReportsScreenshot from './ReportsScreenshot';


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

const HowItWorksStep: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
        <div className="flex justify-center items-center mb-4 h-16 w-16 rounded-full bg-cyan-100 dark:bg-cyan-900/50 mx-auto">
            {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ currentUser, onNavigateToLogin, onNavigateToRegister, onNavigateToDashboard, onNavigateToPartnerflowSignup, onNavigateToMarketplace, platformSettings }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterError, setNewsletterError] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
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
                    <a href="/" className="flex items-center">
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
                            <div className="flex justify-center items-center gap-4 flex-col sm:flex-row">
                                <button onClick={onNavigateToRegister} className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg shadow-xl hover:bg-cyan-600 transform hover:scale-105 transition-transform duration-300">
                                    Start Your 14-Day Free Trial &rarr;
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">No credit card required.</p>
                        </FadeIn>

                        <FadeIn className="mt-20 max-w-5xl mx-auto">
                           <div className="overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
                                <div className="min-w-[800px] lg:min-w-full">
                                    <AppShowcase />
                                </div>
                            </div>
                            <div className="mt-12">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Trusted by leading creators and coaches</p>
                                <div className="flex justify-center items-center gap-8 opacity-60">
                                    <p className="font-bold text-lg">Creator Weekly</p>
                                    <p className="font-bold text-lg">SaaS Hub</p>
                                    <p className="font-bold text-lg">CourseBuilders</p>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>
                
                 <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
                    <FadeIn className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-4">It's simple to get started</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16">Launch your affiliate program in minutes, not weeks.</p>
                        
                        <div className="relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <HowItWorksStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11m0-11h11" /></svg>} title="Connect & Create">Add your products and set your desired commission rates in a few clicks.</HowItWorksStep>
                                <HowItWorksStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} title="Invite & Empower">Onboard affiliates with a unique link and give them the resources they need to succeed.</HowItWorksStep>
                                <HowItWorksStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} title="Track Everything">Our tracking pixel automatically attributes sales. Watch clicks and commissions roll in.</HowItWorksStep>
                                <HowItWorksStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} title="Pay With a Click">Run mass payouts to all your affiliates in one go with our secure Stripe integration.</HowItWorksStep>
                            </div>
                            <div className="absolute top-1/3 left-0 w-full h-20 -translate-y-1/2 hidden lg:block" aria-hidden="true">
                                <svg className="w-full h-full text-gray-300 dark:text-gray-600" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 40 C 150 40, 150 10, 300 10" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                                    <path d="M300 10 C 450 10, 450 70, 600 70" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                                    <path d="M600 70 C 750 70, 750 10, 900 10" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                                </svg>
                            </div>
                        </div>

                    </FadeIn>
                </section>

                <section id="features" className="py-24 px-6 bg-white dark:bg-gray-900">
                     <div className="container mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl font-bold">Everything you need. Nothing you don't.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">PartnerFlow is packed with powerful features designed to save you time and help you grow your affiliate revenue.</p>
                        </div>

                        <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                            <div className="text-left">
                                <h3 className="text-3xl font-bold mb-4">Your Mission Control</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Get a bird's-eye view of your entire affiliate program. Track clicks, sales, and commissions in real-time with a clear, concise, and actionable dashboard.</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Monitor key metrics at a glance.</span></li>
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Identify top-performing affiliates and products instantly.</span></li>
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Visualize your sales trends over time.</span></li>
                                </ul>
                            </div>
                            <div className="relative"><DashboardScreenshot /></div>
                        </FadeIn>
                        
                        <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                            <div className="relative lg:order-2"><AffiliatesScreenshot /></div>
                             <div className="text-left lg:order-1">
                                <h3 className="text-3xl font-bold mb-4">Powerful Affiliate Management</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Effortlessly manage your partners. Invite new affiliates with a unique link, approve applications, and track individual performance.</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Customizable affiliate sign-up link.</span></li>
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Approve or deny pending affiliates with one click.</span></li>
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Empower partners with a dedicated affiliate portal.</span></li>
                                </ul>
                            </div>
                        </FadeIn>

                        <FadeIn className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="text-left">
                                <h3 className="text-3xl font-bold mb-4">Insightful, Actionable Reports</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Dive deep into your data. Understand which products and partners are driving the most growth and make data-driven decisions to scale your program.</p>
                                <ul className="space-y-3">
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Analyze performance by affiliate and product.</span></li>
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Filter reports by date range for precise analysis.</span></li>
                                    <li className="flex items-start"><CheckIcon className="h-5 w-5 text-cyan-500 mr-3 mt-1 flex-shrink-0" /><span>Export your data to CSV for further review.</span></li>
                                </ul>
                            </div>
                            <div className="relative"><ReportsScreenshot /></div>
                        </FadeIn>
                    </div>
                </section>
                
                 <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
                    <FadeIn className="container mx-auto text-center">
                         <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
                         <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-16">Packed with features to make your life easier.</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                            <div className="p-6"><h3 className="text-lg font-semibold mb-2">Professional Affiliate Portal</h3><p className="text-gray-600 dark:text-gray-400 text-sm">Give your affiliates their own dashboard to track performance and get resources.</p></div>
                            <div className="p-6"><h3 className="text-lg font-semibold mb-2">Tiered Commissions & Bonuses</h3><p className="text-gray-600 dark:text-gray-400 text-sm">Incentivize top performers with automated commission increases and performance bonuses.</p></div>
                            <div className="p-6"><h3 className="text-lg font-semibold mb-2">1-Click Mass Payouts</h3><p className="text-gray-600 dark:text-gray-400 text-sm">Pay all your affiliates at once with our secure Stripe integration. No more manual transfers.</p></div>
                            <div className="p-6"><h3 className="text-lg font-semibold mb-2">Marketing Creatives Library</h3><p className="text-gray-600 dark:text-gray-400 text-sm">Upload banners, email swipes, and guides for your affiliates to use.</p></div>
                            <div className="p-6"><h3 className="text-lg font-semibold mb-2">Affiliate Marketplace</h3><p className="text-gray-600 dark:text-gray-400 text-sm">List your product publicly to attract new, high-quality affiliates from the PartnerFlow network.</p></div>
                            <div className="p-6"><h3 className="text-lg font-semibold mb-2">AI-Powered Communication</h3><p className="text-gray-600 dark:text-gray-400 text-sm">Use our built-in AI assistant to draft effective announcement emails to your partners.</p></div>
                         </div>
                    </FadeIn>
                </section>
                
                 <section className="py-24 px-6 bg-white dark:bg-gray-900">
                    <FadeIn className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-16">Loved by creators like you</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">"PartnerFlow saved me at least 10 hours a month. What used to be a spreadsheet nightmare is now a one-click process. I can't imagine running my program without it."</p>
                                <div className="flex items-center"><div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div><div><p className="font-semibold">Jenna Smith</p><p className="text-sm text-gray-500">Course Creator</p></div></div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">"The affiliate dashboard is a game-changer. My partners feel so much more professional and empowered. Their sales have gone up since we switched."</p>
                                <div className="flex items-center"><div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div><div><p className="font-semibold">Alex Doe</p><p className="text-sm text-gray-500">Coach & Entrepreneur</p></div></div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">"Simple, powerful, and beautiful to use. The tracking just works. I finally have a clear view of what's working in my affiliate program."</p>
                                <div className="flex items-center"><div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div><div><p className="font-semibold">Eva Gardner</p><p className="text-sm text-gray-500">Designer & Creator</p></div></div>
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