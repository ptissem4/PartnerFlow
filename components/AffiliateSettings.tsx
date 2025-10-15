import React, { useState } from 'react';
import { User } from '../data/mockData';

interface AffiliateSettingsProps {
    affiliate: User;
    onUpdateProfile: (updatedData: Partial<User>) => void;
    showToast: (message: string) => void;
}

const AffiliateSettings: React.FC<AffiliateSettingsProps> = ({ affiliate, onUpdateProfile, showToast }) => {
    const [name, setName] = useState(affiliate.name);
    const [paypalEmail, setPaypalEmail] = useState(affiliate.paypal_email || '');
    const [referralCode, setReferralCode] = useState(affiliate.referralCode || '');
    const [couponCode, setCouponCode] = useState(affiliate.couponCode || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            const updatedData: Partial<User> = { name, paypal_email: paypalEmail, referralCode, couponCode };
            onUpdateProfile(updatedData);
            setIsSaving(false);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profile & Payouts</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={affiliate.email}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PayPal Email for Payouts</label>
                        <input
                            type="email"
                            id="paypalEmail"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="your.paypal@example.com"
                            required
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ensure this is correct to receive your commissions.</p>
                    </div>
                    <div>
                        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Referral Code</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400">?ref=</span>
                            <input
                                type="text"
                                id="referralCode"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                className="flex-1 block w-full min-w-0 rounded-none rounded-r-md px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="YOURCODE"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Customize your unique referral ID in links.</p>
                    </div>
                     <div>
                        <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Coupon Code</label>
                        <input
                            type="text"
                            id="couponCode"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., PARTNER10"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If enabled by the creator, this code can be used for tracking sales.</p>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AffiliateSettings;