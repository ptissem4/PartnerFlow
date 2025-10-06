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
  company_name?: string;
  
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
    user_id: string; // Foreign key to User.
    name: string;
    price: number;
    sales_page_url: string;
    sales_count: number;
    clicks: number;
    commission_tiers: CommissionTier[];
    bonuses: PerformanceBonus[];
    creatives: Creative[];
    creation_date: string; // ISO format date string e.g., "2023-11-20"
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
    user_id: string; // Foreign key to User (the affiliate)
    affiliate_name: string; // Denormalized for convenience
    affiliate_avatar: string; // Denormalized for convenience
    amount: number;
    period: string;
    due_date: string;
    status: 'Due' | 'Paid' | 'Scheduled';
    sales: Sale[];
}

export interface Payment {
    id: number;
    user_id: string;
    amount: number;
    date: string; // ISO date "YYYY-MM-DD"
    plan: string;
}

export interface Communication {
    id: number;
    sender_id: string;
    subject: string;
    message: string;
    recipients: 'All' | 'Active' | 'Pending';
    date: string; // ISO string
}

export interface UserSettings {
    user_id: string;
    name: string;
    email: string;
    company_name: string;
    clearing_days: number;
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

// --- MOCK DATA POPULATION ---
const today = new Date();
const daysAgo = (days: number) => new Date(today.getTime() - (days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

const MOCK_ADMIN_ID = '00000000-0000-0000-0000-000000000000';
const MOCK_JENNA_ID = 'e5f6g7h8-jenna-s-0000-000000000001';
const MOCK_ALEX_ID = 'a1b2c3d4-alex-doe-0000-000000000002';
const MOCK_EVA_ID = 'b2c3d4e5-eva-gar-0000-000000000003';
const MOCK_ONBOARDING_ID = 'c3d4e5f6-onboard-0000-000000000004';
const MOCK_ELENA_ID = 'd4e5f6g7-elena-r-0000-000000000005';
const MOCK_MARK_ID = 'f6g7h8i9-mark-b-0000-000000000006';
const MOCK_SARA_ID = 'g7h8i9j0-sara-k-0000-000000000007';

export const users: User[] = [
    { id: MOCK_ADMIN_ID, name: 'Super Admin', email: 'admin@partnerflow.app', avatar: 'https://i.pravatar.cc/150?u=admin', roles: ['super_admin', 'creator'], status: 'Active', joinDate: daysAgo(365), company_name: 'PartnerFlow HQ' },
    { id: MOCK_ALEX_ID, name: 'Alex Doe', email: 'alex.doe@example.com', avatar: `https://i.pravatar.cc/150?u=alex.doe@example.com`, roles: ['creator'], currentPlan: 'Starter Plan', joinDate: daysAgo(5), status: 'Active', trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 9)).toISOString(), company_name: 'Alex Courses', onboardingStepCompleted: 5 },
    { id: MOCK_JENNA_ID, name: 'Jenna Smith', email: 'jenna.s@example.com', avatar: `https://i.pravatar.cc/150?u=jenna.s@example.com`, roles: ['creator', 'affiliate'], currentPlan: 'Growth Plan', joinDate: daysAgo(180), status: 'Active', company_name: 'Jenna\'s Coaching', billingCycle: 'monthly', onboardingStepCompleted: 5, partnerIds: [MOCK_ALEX_ID], referralCode: 'JENNA-S', couponCode: 'JENNA10' },
    { id: MOCK_EVA_ID, name: 'Eva Gardner', email: 'eva.gardner@example.com', avatar: `https://i.pravatar.cc/150?u=eva.gardner@example.com`, roles: ['creator'], currentPlan: 'Starter Plan', joinDate: daysAgo(45), status: 'Active', trialEndsAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), company_name: 'Eva\'s Art', onboardingStepCompleted: 5 },
    { id: MOCK_ONBOARDING_ID, name: 'Onboarding Tester', email: 'onboarding.tester@example.com', avatar: `https://i.pravatar.cc/150?u=onboarding.tester@example.com`, roles: ['creator'], currentPlan: 'Starter Plan', joinDate: daysAgo(1), status: 'Active', trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 13)).toISOString(), company_name: 'Setup Co.', onboardingStepCompleted: 0 },
    { id: MOCK_ELENA_ID, name: 'Elena Rodriguez', email: 'elena.r@example.com', avatar: `https://i.pravatar.cc/150?u=elena.r@example.com`, roles: ['affiliate'], joinDate: daysAgo(90), status: 'Active', partnerIds: [MOCK_JENNA_ID], sales: 15, commission: 1498.5, clicks: 350, conversionRate: 4.29, referralCode: 'ELENA-R', couponCode: 'ELENA15' },
    { id: MOCK_MARK_ID, name: 'Mark Brown', email: 'mark.b@example.com', avatar: `https://i.pravatar.cc/150?u=mark.b@example.com`, roles: ['affiliate'], joinDate: daysAgo(60), status: 'Active', partnerIds: [MOCK_JENNA_ID], sales: 8, commission: 799.2, clicks: 180, conversionRate: 4.44, referralCode: 'MARK-B', couponCode: 'MARK10' },
    { id: MOCK_SARA_ID, name: 'Sara Khan', email: 'sara.k@example.com', avatar: `https://i.pravatar.cc/150?u=sara.k@example.com`, roles: ['affiliate'], joinDate: daysAgo(10), status: 'Pending', partnerIds: [MOCK_JENNA_ID], sales: 0, commission: 0, clicks: 12, conversionRate: 0, referralCode: 'SARA-K' },
];

export const products: Product[] = [
  { id: 1, user_id: MOCK_JENNA_ID, name: 'Ultimate Productivity Course', price: 499, sales_page_url: 'https://example.com/productivity', sales_count: 20, clicks: 450, commission_tiers: [{ threshold: 0, rate: 20 }, { threshold: 10, rate: 25 }], bonuses: [{ goal: 20, reward: 250, type: 'sales' }], creatives: [{id: 1, name: 'Banner Ad 1', description: 'A great banner for your blog sidebar.', imageUrl: 'https://i.imgur.com/L8VmTak.png'}], creation_date: daysAgo(150) },
  { id: 2, user_id: MOCK_JENNA_ID, name: 'Social Media Mastery', price: 299, sales_page_url: 'https://example.com/social', sales_count: 3, clicks: 80, commission_tiers: [{ threshold: 0, rate: 30 }], bonuses: [], creatives: [{id: 2, name: 'Instagram Story Graphic', description: 'Perfect for sharing on IG.', imageUrl: 'https://i.imgur.com/L8VmTak.png'}], creation_date: daysAgo(30) },
  { id: 3, user_id: MOCK_ALEX_ID, name: 'Beginner\'s Guide to Investing', price: 199, sales_page_url: 'https://example.com/investing', sales_count: 5, clicks: 120, commission_tiers: [{ threshold: 0, rate: 40 }], bonuses: [], creatives: [], creation_date: daysAgo(4) },
];

export const salesHistory: Sale[] = [
    { id: 1, productId: 1, productName: 'Ultimate Productivity Course', saleAmount: 499, commissionAmount: 99.8, date: daysAgo(45), status: 'Cleared' },
    { id: 2, productId: 1, productName: 'Ultimate Productivity Course', saleAmount: 499, commissionAmount: 99.8, date: daysAgo(40), status: 'Cleared' },
    { id: 3, productId: 1, productName: 'Ultimate Productivity Course', saleAmount: 499, commissionAmount: 124.75, date: daysAgo(35), status: 'Cleared' },
    { id: 4, productId: 2, productName: 'Social Media Mastery', saleAmount: 299, commissionAmount: 89.7, date: daysAgo(25), status: 'Pending' },
    { id: 5, productId: 1, productName: 'Ultimate Productivity Course', saleAmount: 499, commissionAmount: 124.75, date: daysAgo(10), status: 'Pending' },
    { id: 6, productId: 3, productName: 'Beginner\'s Guide to Investing', saleAmount: 199, commissionAmount: 79.6, date: daysAgo(3), status: 'Pending' },
];

export const payouts: Payout[] = [
    { id: 1, user_id: MOCK_ELENA_ID, affiliate_name: 'Elena Rodriguez', affiliate_avatar: users.find(u=>u.id===MOCK_ELENA_ID)!.avatar, amount: 848.9, period: 'Oct 2023', due_date: daysAgo(15), status: 'Paid', sales: [salesHistory[0], salesHistory[1]] },
    { id: 2, user_id: MOCK_MARK_ID, affiliate_name: 'Mark Brown', affiliate_avatar: users.find(u=>u.id===MOCK_MARK_ID)!.avatar, amount: 524.3, period: 'Oct 2023', due_date: daysAgo(15), status: 'Paid', sales: [] },
    { id: 3, user_id: MOCK_ELENA_ID, affiliate_name: 'Elena Rodriguez', affiliate_avatar: users.find(u=>u.id===MOCK_ELENA_ID)!.avatar, amount: 649.6, period: 'Nov 2023', due_date: daysAgo(2), status: 'Due', sales: [salesHistory[2], salesHistory[3], salesHistory[4]] },
];

export const payments: Payment[] = [
    { id: 1, user_id: MOCK_JENNA_ID, amount: 49, date: daysAgo(180), plan: 'Growth Plan' },
    { id: 2, user_id: MOCK_JENNA_ID, amount: 49, date: daysAgo(150), plan: 'Growth Plan' },
    { id: 3, user_id: MOCK_JENNA_ID, amount: 49, date: daysAgo(120), plan: 'Growth Plan' },
    { id: 4, user_id: MOCK_JENNA_ID, amount: 49, date: daysAgo(90), plan: 'Growth Plan' },
    { id: 5, user_id: MOCK_JENNA_ID, amount: 49, date: daysAgo(60), plan: 'Growth Plan' },
    { id: 6, user_id: MOCK_JENNA_ID, amount: 49, date: daysAgo(30), plan: 'Growth Plan' },
    { id: 7, user_id: MOCK_ALEX_ID, amount: 19, date: daysAgo(4), plan: 'Starter Plan'},
];

export const communications: Communication[] = [
    { id: 1, sender_id: MOCK_JENNA_ID, subject: 'Welcome to the Team!', message: 'Hey everyone, just wanted to welcome our new affiliates. So excited to have you on board!', recipients: 'All', date: daysAgo(8) }
];

export const recentReferrals = [];
export const monthlySalesData = [];


// Configuration data that remains.
export const userSettings: UserSettings = {
    user_id: '',
    name: '',
    email: '',
    company_name: '',
    clearing_days: 30,
    notifications: {
        newAffiliate: true,
        monthlyReport: true,
        payoutReminders: false,
    },
    integrations: {
        stripe: 'Disconnected',
        kajabi: 'Disconnected',
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

export const platformSettings: PlatformSettings = {
    announcement: {
        text: '📣 Platform maintenance scheduled for this Sunday at 2 AM EST. Brief downtime is expected.',
        isEnabled: false,
    }
};
