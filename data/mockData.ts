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

// All mock data arrays have been removed.
export const users: User[] = [];
export const products: Product[] = [];
export const payouts: Payout[] = [];
export const payments: Payment[] = [];
export const communications: Communication[] = [];
export const salesHistory = [];
export const monthlySalesData = [];
export const recentReferrals = [];

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
