
import React, { useState } from 'react';
// FIX: Updated Plan import to resolve circular dependency.
import { User, Product, planDetails, Plan } from '../data/mockData';

interface BillingProps {
    currentUser: User;
    affiliates: User[];
    products: Product[];
    onPlanChange: (newPlanName: string, billingCycle: 'monthly' | 'annual') => void;
    isTrialExpired: boolean;
    isUpgradeFlow?: boolean;
    onCancelUpgrade?: () => void;
}

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const CheckIcon: React.FC = () => (
    <svg className="h-6 w-6 text-cyan-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const Billing: React.FC<BillingProps> = ({ currentUser, affiliates, products, onPlanChange, isTrialExpired, isUpgradeFlow = false, onCancelUpgrade }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(currentUser.billingCycle || 'monthly');
    const currentPlanName = currentUser.currentPlan || 'Starter Plan';
    const currentPlan = planDetails[currentPlanName as keyof typeof planDetails] as Plan;
    const affiliateUsage = affiliates.length;
    const productUsage = products.length;

    const plans = Object.values(planDetails);

    return (
        <div className={`space-y-6 ${isTrialExpired ? 'opacity-100' : ''}`}>
             {isTrialExpired && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md" role="alert">
                    <p className="font-bold">Your 14-day trial has ended.</p>
                    <p>Please choose a plan below to continue using PartnerFlow.</p>
                </div>
            )}
             <div className="flex items-center gap-4">
                {isUpgradeFlow && (
                    <button onClick={onCancelUpgrade} className="flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                )}
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {isUpgradeFlow ? 'Choose a Plan to Become a Creator' : 'Billing & Subscription'}
                </h2>
            </div>
            
            {!isUpgradeFlow && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Current Plan &amp; Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-1 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <p className="text-gray-600 dark:text-gray-300">You are currently on the</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white my-2">{currentPlan.name}</p>
                            {currentUser.trialEndsAt && !isTrialExpired ? (
                                <p className="text-lg font-semibold text-yellow-500">Trial Period</p>
                            ) : (
                                <p className="text-lg font-semibold text-cyan-500">
                                    ${(billingCycle === 'annual' ? currentPlan.annualPrice / 12 : currentPlan.price).toFixed(2)} / month
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Affiliates</span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{affiliateUsage} / {currentPlan.limits.affiliates}</span>
                                </div>
                                <ProgressBar value={affiliateUsage} max={currentPlan.limits.affiliates} />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Products</span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{productUsage} / {currentPlan.limits.products}</span>
                                </div>
                                <ProgressBar value={productUsage} max={currentPlan.limits.products} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{isUpgradeFlow ? 'Select Your Plan' : 'Available Plans'}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl">
                    {isUpgradeFlow ? 'Unlock your Creator Dashboard by subscribing to a plan.' : 'Choose a plan that fits your needs. You can upgrade or downgrade at any time.'}
                </p>
                 <div className="flex justify-center items-center mb-12 space-x-4">
                    <span className={`font-medium ${billingCycle === 'monthly' ? 'text-cyan-500' : ''}`}>Monthly</span>
                    <label htmlFor="billing-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="billing-toggle" className="sr-only peer" checked={billingCycle === 'annual'} onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')} />
                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-500"></div>
                    </label>
                    <span className={`font-medium relative ${billingCycle === 'annual' ? 'text-cyan-500' : ''}`}>
                        Annual
                        <span className="absolute -top-5 -right-12 text-xs font-bold bg-teal-400 text-teal-900 px-2 py-1 rounded-full transform rotate-12">Save 20%</span>
                    </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`p-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm flex flex-col ${plan.name === currentPlan.name && !currentUser.trialEndsAt && !isUpgradeFlow ? 'border-2 border-cyan-500 relative' : 'border border-gray-200 dark:border-gray-700'}`}>
                           {plan.name === currentPlan.name && !currentUser.trialEndsAt && !isUpgradeFlow && <div className="absolute top-0 -translate-y-1/2 bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg self-center">Current Plan</div>}
                            <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{plan.name}</h3>
                            <p className="mb-6 h-16">
                                <span className="text-4xl font-bold text-gray-800 dark:text-white">${(billingCycle === 'annual' ? plan.annualPrice / 12 : plan.price).toFixed(2)}</span> 
                                <span className="text-gray-500 dark:text-gray-400">/ month</span>
                                {billingCycle === 'annual' && <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Billed as ${plan.annualPrice} per year</span>}
                            </p>
                            <ul className="space-y-4 text-left mb-8 flex-grow text-gray-600 dark:text-gray-300">
                                <li className="flex items-start"><CheckIcon /><span>Up to {plan.limits.affiliates} Affiliates</span></li>
                                <li className="flex items-start"><CheckIcon /><span>Up to {plan.limits.products} Products</span></li>
                                <li className="flex items-start"><CheckIcon /><span>Standard commission tracking</span></li>
                                {plan.features.hasTieredCommissions && <li className="flex items-start"><CheckIcon /><span>Tiered commissions & bonuses</span></li>}
                                {plan.features.hasAffiliatePortal && <li className="flex items-start"><CheckIcon /><span>Affiliate portal</span></li>}
                                {plan.features.hasApiAccess && <li className="flex items-start"><CheckIcon /><span>API Access</span></li>}
                            </ul>
                            <button 
                                onClick={() => onPlanChange(plan.name, billingCycle)}
                                disabled={plan.name === currentPlan.name && !currentUser.trialEndsAt && !isUpgradeFlow}
                                className={`w-full mt-auto px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-300 ${
                                    plan.name === currentPlan.name && !currentUser.trialEndsAt && !isUpgradeFlow
                                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                                }`}
                            >
                               {plan.name === currentPlan.name && !currentUser.trialEndsAt && !isUpgradeFlow ? 'Your Current Plan' : (isTrialExpired || isUpgradeFlow) ? 'Subscribe Now' : `Switch to ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Billing;