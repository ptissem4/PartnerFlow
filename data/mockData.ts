export type UserRole = 'creator' | 'affiliate' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: UserRole[];
  currentPlan?: string;
  joinDate?: string;
  status?: 'Active' | 'Pending' | 'Inactive' | 'Suspended';
  trialEndsAt?: string; // ISO string for trial end date
  billingCycle?: 'monthly' | 'annual';
  onboardingStepCompleted?: number; // 0: not started, 1: welcome, 2: product added, 3: tracking, 4: affiliate invited, 5: complete

  // Creator-specific
  companyName?: string;
  
  // Affiliate-specific
  sales?: number;
  commission?: number;
  clicks?: number;
  conversionRate?: number;
  referralCode?: string;
  couponCode?: string;
  partnerIds?: string[];
}

export interface CommissionTier {
    threshold: number; // e.g., number of sales to reach this tier
    rate: number; // percentage
}

export interface PerformanceBonus {
    goal: number; // e.g., number of sales to achieve
    reward: number; // fixed amount bonus
    type: 'sales' | 'clicks';
}

export interface Creative {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
}

export interface Product {
    id: number;
    userId: string; // Foreign key to User. 0 = PartnerFlow platform itself.
    name: string;
    price: number;
    salesPageUrl: string;
    salesCount: number;
    clicks: number;
    commissionTiers: CommissionTier[];
    bonuses: PerformanceBonus[];
    creatives: Creative[];
    creationDate: string; // ISO format date string e.g., "2023-11-20"
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  saleAmount: number;
  commissionAmount: number;
  date: string; // ISO format date string e.g., "2023-11-20"
  status: 'Pending' | 'Cleared' | 'Refunded';
}

export interface Payout {
    id: number;
    userId: string; // Foreign key to User (the affiliate)
    affiliateName: string; // Denormalized for convenience
    affiliateAvatar: string; // Denormalized for convenience
    amount: number;
    period: string;
    dueDate: string;
    status: 'Due' | 'Paid' | 'Scheduled';
    sales: Sale[];
}

export interface Payment {
    id: number;
    userId: string;
    amount: number;
    date: string; // ISO date "YYYY-MM-DD"
    plan: string;
}

export interface Communication {
    id: number;
    subject: string;
    message: string;
    recipients: 'All' | 'Active' | 'Pending';
    date: string; // ISO string
}

export interface UserSettings {
    name: string;
    email: string;
    companyName: string;
    clearingDays: number;
    notifications: {
        newAffiliate: boolean;
        monthlyReport: boolean;
        payoutReminders: boolean;
    };
    integrations: {
        stripe: 'Connected' | 'Disconnected';
        kajabi: 'Connected' | 'Disconnected';
        thrivecart: 'Connected' | 'Disconnected';
    }
}

export interface PlatformSettings {
    announcement: {
        text: string;
        isEnabled: boolean;
    }
}

// Helper to generate past/future dates as ISO strings
const getDateWithOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const getDate = (daysAgo: number) => {
  return getDateWithOffset(-daysAgo).split('T')[0];
};

export const users: User[] = [
  // Super Admin
  {
    id: '0',
    name: 'Admin User',
    email: 'admin@partnerflow.io',
    avatar: 'https://i.pravatar.cc/150?u=superadmin',
    roles: ['super_admin'],
    joinDate: '2022-01-01',
    status: 'Active',
    onboardingStepCompleted: 5,
    companyName: 'PartnerFlow',
  },
  // User who is BOTH a Creator and an Affiliate (ON TRIAL)
  { 
    id: '1', 
    name: 'Alex Doe', 
    email: 'alex.doe@example.com', 
    avatar: 'https://i.pravatar.cc/150?u=admin',
    roles: ['creator', 'affiliate'],
    currentPlan: 'Starter Plan',
    trialEndsAt: getDateWithOffset(7), // 7 days left in trial
    companyName: 'Creator Inc.',
    joinDate: getDate(7), 
    status: 'Active',
    onboardingStepCompleted: 5,
    // Affiliate stats (promoting other people's products)
    sales: 10, 
    commission: 500, 
    clicks: 400, 
    conversionRate: 2.5, 
    referralCode: 'alex-d',
    couponCode: 'ALEX10',
    partnerIds: ['2', '0'] // Partnered with Jenna Smith AND PartnerFlow
  },
  // User who is ONLY a Creator (Subscribed)
  {
    id: '2', 
    name: 'Jenna Smith', 
    email: 'jenna.s@example.com',
    avatar: 'https://i.pravatar.cc/150?u=jenna',
    roles: ['creator'],
    currentPlan: 'Growth Plan',
    billingCycle: 'monthly',
    companyName: 'Zenith Courses',
    joinDate: '2022-11-15',
    status: 'Active',
    onboardingStepCompleted: 5,
  },
   // User with expired trial
  {
    id: '10',
    name: 'Eva Gardner',
    email: 'eva.gardner@example.com',
    avatar: 'https://i.pravatar.cc/150?u=eva',
    roles: ['creator'],
    currentPlan: 'Starter Plan',
    companyName: 'Expired Ventures',
    joinDate: getDate(20),
    status: 'Active', // Status is active, but app access is locked by trial expiry
    trialEndsAt: getDateWithOffset(-5), // Trial ended 5 days ago
    onboardingStepCompleted: 5,
  },
  // NEW USER FOR ONBOARDING DEMO
  { 
    id: '11', 
    name: 'Onboarding Tester', 
    email: 'onboarding.tester@example.com', 
    avatar: 'https://i.pravatar.cc/150?u=onboarding',
    roles: ['creator'],
    currentPlan: 'Starter Plan',
    trialEndsAt: getDateWithOffset(14),
    companyName: 'Onboarding Demo Co.',
    joinDate: new Date().toISOString().split('T')[0], 
    status: 'Active',
    onboardingStepCompleted: 0,
  },
  // Users who are ONLY Affiliates
  { id: '3', name: 'Elena Rodriguez', email: 'elena.r@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=1', sales: 124, commission: 2480, clicks: 2755, status: 'Active', joinDate: '2023-01-15', conversionRate: 4.5, referralCode: 'elena-r', couponCode: 'ELENA15', partnerIds: ['1', '2'] },
  { id: '4', name: 'Ben Carter', email: 'ben.c@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=2', sales: 98, commission: 1960, clicks: 1921, status: 'Active', joinDate: '2023-02-20', conversionRate: 5.1, referralCode: 'ben-c', couponCode: 'BEN10', partnerIds: ['1'] },
  { id: '5', name: 'Aisha Khan', email: 'aisha.k@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=3', sales: 75, commission: 1500, clicks: 1973, status: 'Active', joinDate: '2023-03-10', conversionRate: 3.8, referralCode: 'aisha-k', couponCode: 'AISHA20', partnerIds: ['1'] },
  { id: '6', name: 'Marcus Chen', email: 'marcus.c@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=4', sales: 52, commission: 1040, clicks: 950, status: 'Pending', joinDate: '2023-10-05', conversionRate: 5.4, referralCode: 'marcus-c', partnerIds: ['1'] },
  { id: '7', name: 'Sophia Loren', email: 'sophia.l@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=5', sales: 30, commission: 600, clicks: 714, status: 'Active', joinDate: '2023-05-25', conversionRate: 4.2, referralCode: 'sophia-l', partnerIds: ['1'] },
  { id: '8', name: 'David Miller', email: 'david.m@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=6', sales: 15, commission: 300, clicks: 600, status: 'Inactive', joinDate: '2023-06-11', conversionRate: 2.5, referralCode: 'david-m', partnerIds: [] },
  { id: '9', name: 'Olivia Garcia', email: 'olivia.g@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=7', sales: 8, commission: 160, clicks: 250, status: 'Pending', joinDate: '2023-10-12', conversionRate: 3.2, referralCode: 'olivia-g', partnerIds: ['1'] },
  // Affiliate for PartnerFlow itself
  { id: '12', name: 'Chloe Davis', email: 'chloe.davis@example.com', roles: ['affiliate'], avatar: 'https://i.pravatar.cc/150?u=chloe', sales: 3, commission: 17.10, clicks: 150, status: 'Active', joinDate: '2023-09-01', conversionRate: 2.0, referralCode: 'chloe-d', partnerIds: ['0'] },
];

export const products: Product[] = [
    // PartnerFlow's own "products" (subscriptions) for its affiliate program
    {
        id: 1,
        userId: '0', // Belongs to Super Admin / PartnerFlow
        name: 'PartnerFlow - Starter Plan',
        price: 19,
        salesPageUrl: 'https://partnerflow.io/pricing',
        salesCount: 2,
        clicks: 100,
        creationDate: '2022-01-01',
        commissionTiers: [{ threshold: 0, rate: 30 }],
        bonuses: [],
        creatives: [],
    },
    {
        id: 2,
        userId: '0', // Belongs to Super Admin / PartnerFlow
        name: 'PartnerFlow - Growth Plan',
        price: 49,
        salesPageUrl: 'https://partnerflow.io/pricing',
        salesCount: 1,
        clicks: 50,
        creationDate: '2022-01-01',
        commissionTiers: [{ threshold: 0, rate: 30 }],
        bonuses: [],
        creatives: [],
    },
    { 
        id: 101, 
        userId: '1', // Belongs to Alex Doe
        name: 'Pro Course Bundle', 
        price: 499, 
        salesPageUrl: 'https://creator.inc/pro-bundle', 
        salesCount: 35, 
        clicks: 800,
        creationDate: '2023-01-10',
        commissionTiers: [
            { threshold: 0, rate: 20 },
            { threshold: 10, rate: 25 }
        ],
        bonuses: [
            { goal: 50, reward: 500, type: 'sales' }
        ],
        creatives: [
            { id: 1, name: 'Pro Course Banner', description: 'A great banner for blogs and sidebars.', imageUrl: 'https://via.placeholder.com/728x90.png?text=Pro+Course+Bundle+-+Enroll+Now!' },
        ]
    },
    { 
        id: 102, 
        userId: '1', // Belongs to Alex Doe
        name: 'Beginner\'s Guide E-book', 
        price: 99, 
        salesPageUrl: 'https://creator.inc/ebook-guide', 
        salesCount: 88, 
        clicks: 2500,
        creationDate: '2023-02-15',
        commissionTiers: [
            { threshold: 0, rate: 30 }
        ],
        bonuses: [],
        creatives: [
            { id: 2, name: 'E-book Social Media Post', description: 'Square image perfect for Instagram or Facebook.', imageUrl: 'https://via.placeholder.com/1080x1080.png?text=Get+The+Beginner\'s+Guide' },
        ]
    },
    { 
        id: 103, 
        userId: '1', // Belongs to Alex Doe
        name: 'Monthly Coaching Subscription', 
        price: 250, 
        salesPageUrl: 'https://creator.inc/coaching', 
        salesCount: 52, 
        clicks: 1500,
        creationDate: '2023-04-01',
        commissionTiers: [
            { threshold: 0, rate: 15 }
        ],
        bonuses: [
            { goal: 1000, reward: 100, type: 'clicks' }
        ],
        creatives: [
            { id: 3, name: 'Coaching Skyscraper Ad', description: 'A vertical banner for website sidebars.', imageUrl: 'https://via.placeholder.com/160x600.png?text=Monthly+Coaching+Available' },
        ]
    },
    { 
        id: 104, 
        userId: '1', // Belongs to Alex Doe
        name: 'Advanced Webinar Series', 
        price: 799, 
        salesPageUrl: 'https://creator.inc/webinar-series', 
        salesCount: 18, 
        clicks: 450,
        creationDate: '2023-06-20',
        commissionTiers: [
            { threshold: 0, rate: 20 }
        ],
        bonuses: [],
        creatives: [
            { id: 4, name: 'Webinar Series Leaderboard', description: 'Wide banner for top of page placement.', imageUrl: 'https://via.placeholder.com/728x90.png?text=Advanced+Webinar+Series' },
        ]
    },
     { 
        id: 201, 
        userId: '2', // Belongs to Jenna Smith
        name: 'The Productivity System', 
        price: 297, 
        salesPageUrl: 'https://zenith.co/productivity', 
        salesCount: 150, 
        clicks: 4500,
        creationDate: '2023-08-05',
        commissionTiers: [
            { threshold: 0, rate: 40 }
        ],
        bonuses: [],
        creatives: [
            { id: 5, name: 'Productivity System FB Ad', description: 'Ad for Facebook feeds.', imageUrl: 'https://via.placeholder.com/1200x628.png?text=Unlock+Peak+Productivity' },
        ]
    },
];

export const payouts: Payout[] = [
    { 
      id: 1, userId: '3', affiliateName: 'Elena Rodriguez', affiliateAvatar: 'https://i.pravatar.cc/150?u=1', 
      amount: 1240, period: 'October 2023', dueDate: '2023-11-05', status: 'Paid',
      sales: [
        { id: 1001, productId: 101, productName: 'Pro Course Bundle', saleAmount: 499, commissionAmount: 99.80, date: getDate(45), status: 'Cleared' },
        { id: 1002, productId: 102, productName: 'Beginner\'s Guide E-book', saleAmount: 99, commissionAmount: 29.70, date: getDate(42), status: 'Cleared' },
      ]
    },
    { 
      id: 2, userId: '4', affiliateName: 'Ben Carter', affiliateAvatar: 'https://i.pravatar.cc/150?u=2', 
      amount: 980, period: 'October 2023', dueDate: '2023-11-05', status: 'Paid',
      sales: [
        { id: 1003, productId: 103, productName: 'Monthly Coaching Subscription', saleAmount: 250, commissionAmount: 37.50, date: getDate(39), status: 'Cleared' },
        { id: 1004, productId: 101, productName: 'Pro Course Bundle', saleAmount: 499, commissionAmount: 99.80, date: getDate(35), status: 'Cleared' },
      ]
    },
    { 
      id: 3, userId: '5', affiliateName: 'Aisha Khan', affiliateAvatar: 'https://i.pravatar.cc/150?u=3', 
      amount: 750, period: 'October 2023', dueDate: '2023-11-05', status: 'Paid',
      sales: [
        { id: 1005, productId: 102, productName: 'Beginner\'s Guide E-book', saleAmount: 99, commissionAmount: 29.70, date: getDate(50), status: 'Cleared' },
      ]
    },
    { 
      id: 4, userId: '7', affiliateName: 'Sophia Loren', affiliateAvatar: 'https://i.pravatar.cc/150?u=5', 
      amount: 300, period: 'October 2023', dueDate: '2023-11-05', status: 'Paid',
      sales: [
        { id: 1006, productId: 102, productName: 'Beginner\'s Guide E-book', saleAmount: 99, commissionAmount: 29.70, date: getDate(60), status: 'Cleared' },
      ]
    },
    { 
      id: 5, userId: '3', affiliateName: 'Elena Rodriguez', affiliateAvatar: 'https://i.pravatar.cc/150?u=1', 
      amount: 1240, period: 'November 2023', dueDate: '2023-12-05', status: 'Due',
      sales: [
        { id: 1007, productId: 104, productName: 'Advanced Webinar Series', saleAmount: 799, commissionAmount: 159.80, date: getDate(25), status: 'Pending' },
        { id: 1008, productId: 101, productName: 'Pro Course Bundle', saleAmount: 499, commissionAmount: 124.75, date: getDate(15), status: 'Pending' },
        { id: 1009, productId: 102, productName: 'Beginner\'s Guide E-book', saleAmount: 99, commissionAmount: 29.70, date: getDate(5), status: 'Pending' },
      ]
    },
    { 
      id: 6, userId: '4', affiliateName: 'Ben Carter', affiliateAvatar: 'https://i.pravatar.cc/150?u=2', 
      amount: 980, period: 'November 2023', dueDate: '2023-12-05', status: 'Due',
      sales: [
        { id: 1010, productId: 102, productName: 'Beginner\'s Guide E-book', saleAmount: 99, commissionAmount: 29.70, date: getDate(12), status: 'Pending' },
      ]
    },
    { 
      id: 7, userId: '5', affiliateName: 'Aisha Khan', affiliateAvatar: 'https://i.pravatar.cc/150?u=3', 
      amount: 750, period: 'November 2023', dueDate: '2023-12-05', status: 'Due',
       sales: [
        { id: 1011, productId: 103, productName: 'Monthly Coaching Subscription', saleAmount: 250, commissionAmount: 37.50, date: getDate(28), status: 'Pending' },
        { id: 1012, productId: 103, productName: 'Monthly Coaching Subscription', saleAmount: 250, commissionAmount: 37.50, date: getDate(2), status: 'Pending' },
      ]
    },
    // Payout for PartnerFlow's own affiliate
    {
        id: 8, userId: '12', affiliateName: 'Chloe Davis', affiliateAvatar: 'https://i.pravatar.cc/150?u=chloe',
        amount: 17.10, period: 'November 2023', dueDate: '2023-12-05', status: 'Due',
        sales: [
            { id: 1013, productId: 1, productName: 'PartnerFlow - Starter Plan', saleAmount: 19, commissionAmount: 5.70, date: getDate(20), status: 'Pending' },
            { id: 1014, productId: 2, productName: 'PartnerFlow - Growth Plan', saleAmount: 49, commissionAmount: 14.70, date: getDate(10), status: 'Pending' },
        ]
    }
];

export const communications: Communication[] = [];

export const userSettings: UserSettings = {
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    companyName: 'Creator Inc.',
    clearingDays: 30,
    notifications: {
        newAffiliate: true,
        monthlyReport: true,
        payoutReminders: false,
    },
    integrations: {
        stripe: 'Connected',
        kajabi: 'Connected',
        thrivecart: 'Disconnected',
    }
};

export let planDetails = {
    'Starter Plan': {
        name: 'Starter Plan',
        price: 19,
        annualPrice: 182, // ~20% discount
        limits: {
            affiliates: 25,
            products: 5,
        },
        features: {
            hasTieredCommissions: false,
            hasAffiliatePortal: true, // All plans get a portal
            hasApiAccess: false,
            prioritySupport: false,
        }
    },
    'Growth Plan': {
        name: 'Growth Plan',
        price: 49,
        annualPrice: 470, // ~20% discount
        limits: {
            affiliates: 100,
            products: 25,
        },
        features: {
            hasTieredCommissions: true,
            hasAffiliatePortal: true,
            hasApiAccess: true,
            prioritySupport: false,
        }
    },
    'Pro Plan': {
        name: 'Pro Plan',
        price: 99,
        annualPrice: 950, // ~20% discount
        limits: {
            affiliates: 500,
            products: 100,
        },
        features: {
            hasTieredCommissions: true,
            hasAffiliatePortal: true,
            hasApiAccess: true,
            prioritySupport: true,
        }
    }
};

// --- Super Admin Data ---

export const platformSettings: PlatformSettings = {
    announcement: {
        text: '📣 Platform maintenance scheduled for this Sunday at 2 AM EST. Brief downtime is expected.',
        isEnabled: false,
    }
};

// Function to generate realistic payment history for admin dashboard
const generatePaymentHistory = (users: User[], plans: typeof planDetails): Payment[] => {
    let paymentId = 1;
    const allPayments: Payment[] = [];
    const creatorUsers = users.filter(u => u.roles.includes('creator') && u.billingCycle); // Only generate for subscribed users

    creatorUsers.forEach(user => {
        if (!user.joinDate || !user.currentPlan) return;
        
        const plan = plans[user.currentPlan as keyof typeof planDetails];
        const price = user.billingCycle === 'annual' ? plan.annualPrice : plan.price;
        if (price === 0) return;

        let currentDate = new Date(user.joinDate);
        const today = new Date();

        while (currentDate <= today) {
            allPayments.push({
                id: paymentId++,
                userId: user.id,
                amount: price,
                plan: user.currentPlan,
                date: currentDate.toISOString().split('T')[0]
            });

            // Move to the next billing period
            if (user.billingCycle === 'annual') {
              currentDate.setFullYear(currentDate.getFullYear() + 1);
            } else {
              currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
    });

    return allPayments;
};

// --- Data Generation for Scale ---
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateScaleData = () => {
    const newCreatorUsers: User[] = [];
    const newProducts: Product[] = [];
    const newAffiliateUsers: User[] = [];
    const newPayouts: Payout[] = [];

    let userIdCounter = Math.max(...users.map(u => Number(u.id)), 0) + 1;
    let productIdCounter = Math.max(...products.map(p => p.id), 0) + 1;
    let payoutIdCounter = Math.max(...payouts.map(p => p.id), 0) + 1;
    const maxSaleId = Math.max(...payouts.flatMap(p => p.sales.map(s => s.id)), 0);
    let saleIdCounter = isFinite(maxSaleId) ? maxSaleId + 1 : 2000;


    const planNames = Object.keys(planDetails);
    
    for (let i = 0; i < 250; i++) {
        const creatorId = (userIdCounter++).toString();
        const joinDate = randomDate(new Date(2022, 0, 1), new Date());
        const planName = planNames[randomBetween(0, planNames.length - 1)];
        const billingCycle = Math.random() > 0.3 ? 'monthly' : 'annual';

        // Simulate onboarding drop-off
        const rand = Math.random();
        let onboardingStep = 5; // Completed
        if (rand < 0.05) onboardingStep = 1; // 5% drop after step 1
        else if (rand < 0.10) onboardingStep = 2; // 5% drop after step 2
        else if (rand < 0.15) onboardingStep = 3; // 5% drop after step 3
        else if (rand < 0.20) onboardingStep = 4; // 5% drop after step 4

        const creator: User = {
            id: creatorId,
            name: `Client #${i + 1}`,
            email: `client${i+1}@example.com`,
            avatar: `https://i.pravatar.cc/150?u=client${i+1}`,
            roles: ['creator'],
            currentPlan: planName,
            billingCycle: billingCycle,
            companyName: `Company ${i + 1}`,
            joinDate: joinDate.toISOString().split('T')[0],
            status: 'Active',
            onboardingStepCompleted: onboardingStep,
        };
        newCreatorUsers.push(creator);

        // Generate products for this creator
        const creatorProducts: Product[] = [];
        const numProducts = randomBetween(1, 5);
        for (let j = 0; j < numProducts; j++) {
            const product: Product = {
                id: productIdCounter++,
                userId: creatorId,
                name: `Product ${j + 1} by Client ${i + 1}`,
                price: randomBetween(19, 99), // More realistic prices
                salesPageUrl: `https://example.com/product${productIdCounter}`,
                salesCount: 0, // Will be calculated
                clicks: randomBetween(200, 10000),
                creationDate: randomDate(joinDate, new Date()).toISOString().split('T')[0],
                commissionTiers: [{ threshold: 0, rate: randomBetween(10, 40) }],
                bonuses: [],
                creatives: [],
            };
            creatorProducts.push(product);
        }
        newProducts.push(...creatorProducts);
        
        // Generate affiliates and their sales for this creator
        const plan = planDetails[planName as keyof typeof planDetails];
        const numAffiliates = randomBetween(5, plan.limits.affiliates);
        for (let k = 0; k < numAffiliates; k++) {
            const affiliateId = (userIdCounter++).toString();
            const affiliateJoinDate = randomDate(joinDate, new Date());
            const affiliate: User = {
                id: affiliateId,
                name: `Affiliate ${k + 1} for Client ${i + 1}`,
                email: `affiliate_c${i+1}_${k+1}@example.com`,
                avatar: `https://i.pravatar.cc/150?u=aff_c${i+1}_${k+1}`,
                roles: ['affiliate'],
                status: 'Active',
                joinDate: affiliateJoinDate.toISOString().split('T')[0],
                partnerIds: [creatorId],
                sales: 0,
                commission: 0,
                clicks: randomBetween(0, 3000),
                conversionRate: 0,
                referralCode: `aff-${i+1}-${k+1}`
            };

            // Generate realistic sales history for this affiliate
            const numSales = Math.random() < 0.8 ? randomBetween(0, 3) : randomBetween(4, 15); // More realistic sales numbers
            const affiliateSales: Sale[] = [];
            let totalCommission = 0;

            for (let s = 0; s < numSales; s++) {
                if (creatorProducts.length === 0) continue;
                const product = creatorProducts[randomBetween(0, creatorProducts.length - 1)];
                const saleAmount = product.price;
                const commissionRate = product.commissionTiers.find(t => numSales >= t.threshold)?.rate || product.commissionTiers[0].rate;
                const commissionAmount = saleAmount * (commissionRate / 100);
                
                totalCommission += commissionAmount;
                product.salesCount++;

                const saleDate = randomDate(affiliateJoinDate, new Date());
                
                affiliateSales.push({
                    id: saleIdCounter++,
                    productId: product.id,
                    productName: product.name,
                    saleAmount,
                    commissionAmount,
                    date: saleDate.toISOString().split('T')[0],
                    status: new Date(saleDate.getTime() + 30 * 24 * 60 * 60 * 1000) > new Date() ? 'Pending' : 'Cleared'
                });
            }

            affiliate.sales = numSales;
            affiliate.commission = totalCommission;
            affiliate.conversionRate = affiliate.clicks > 0 ? parseFloat(((numSales / affiliate.clicks) * 100).toFixed(2)) : 0;
            
            // Group sales into payouts by month
            const salesByMonth: { [key: string]: Sale[] } = {};
            affiliateSales.forEach(sale => {
                const monthKey = sale.date.substring(0, 7); // YYYY-MM
                if (!salesByMonth[monthKey]) salesByMonth[monthKey] = [];
                salesByMonth[monthKey].push(sale);
            });
            
            Object.entries(salesByMonth).forEach(([periodStr, sales]) => {
                const payoutAmount = sales.reduce((sum, s) => sum + s.commissionAmount, 0);
                const periodDate = new Date(`${periodStr}-02`); // Use day 2 to avoid timezone issues
                const dueDate = new Date(periodDate);
                dueDate.setMonth(dueDate.getMonth() + 1);
                dueDate.setDate(5);
                
                const status: Payout['status'] = dueDate > new Date() ? 'Due' : 'Paid';

                newPayouts.push({
                    id: payoutIdCounter++,
                    userId: affiliate.id,
                    affiliateName: affiliate.name,
                    affiliateAvatar: affiliate.avatar,
                    amount: payoutAmount,
                    period: periodDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
                    dueDate: dueDate.toISOString().split('T')[0],
                    status: status,
                    sales: sales
                });
            });

            newAffiliateUsers.push(affiliate);
        }
    }
    return { newCreatorUsers, newProducts, newAffiliateUsers, newPayouts };
};

const { newCreatorUsers, newProducts, newAffiliateUsers, newPayouts } = generateScaleData();
users.push(...newCreatorUsers, ...newAffiliateUsers);
products.push(...newProducts);
payouts.push(...newPayouts);

export const payments: Payment[] = generatePaymentHistory(users, planDetails);


export const salesHistory = [
    { name: 'May', sales: 12 },
    { name: 'Jun', sales: 19 },
    { name: 'Jul', sales: 25 },
    { name: 'Aug', sales: 22 },
    { name: 'Sep', sales: 30 },
    { name: 'Oct', sales: 28 },
];

export const monthlySalesData = [
  { name: 'Jan', sales: 4230 },
  { name: 'Feb', sales: 3810 },
  { name: 'Mar', sales: 5520 },
  { name: 'Apr', sales: 5180 },
  { name: 'May', sales: 6290 },
  { name: 'Jun', sales: 5810 },
  { name: 'Jul', sales: 6450 },
  { name: 'Aug', sales: 7120 },
  { name: 'Sep', sales: 7540 },
  { name: 'Oct', sales: 7980 },
  { name: 'Nov', sales: 8630 },
  { name: 'Dec', sales: 9210 },
];

export const recentReferrals = [
    { product: 'Pro Course Bundle', amount: 499, date: '2023-10-28' },
    { product: 'Monthly Coaching', amount: 250, date: '2023-10-25' },
    { product: 'Beginner\'s Guide', amount: 99, date: '2023-10-21' },
    { product: 'Pro Course Bundle', amount: 499, date: '2023-10-15' },
];