import React, { useState } from 'react';
import { User, UserSettings, planDetails } from '../data/mockData';
import { Plan, AppView } from '../App';
import ConfirmationModal from './ConfirmationModal';


interface SettingsProps {
    currentUser: User;
    userSettings: UserSettings;
    onSettingsChange: (settings: UserSettings) => void;
    setAppView: (view: AppView) => void;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode, footer?: React.ReactNode }> = ({ title, children, footer }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
    {footer && (
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 text-right rounded-b-lg">
            {footer}
        </div>
    )}
  </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: (enabled: boolean) => void }> = ({ label, enabled, onToggle }) => (
    <label htmlFor={label} className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <div className="relative">
        <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
        </div>
  </label>
);

const Settings: React.FC<SettingsProps> = ({ currentUser, userSettings, onSettingsChange, setAppView }) => {
    const [copied, setCopied] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

    const trackingCode = `<script>
  (function() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const d = new Date();
      d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
      let expires = "expires="+ d.toUTCString();
      document.cookie = "partnerflow_ref=" + ref + ";" + expires + ";path=/";
    }
  })();
</script>`;

    const handleCopy = (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
        navigator.clipboard.writeText(text);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
    };

    const handleNotificationToggle = (key: keyof typeof userSettings.notifications, value: boolean) => {
        onSettingsChange({
            ...userSettings,
            notifications: {
                ...userSettings.notifications,
                [key]: value
            }
        });
    };

    const handleDisconnect = () => {
        onSettingsChange({
            ...userSettings,
            integrations: {
                ...userSettings.integrations,
                stripe: 'Disconnected'
            }
        });
        setShowDisconnectConfirm(false);
    };

    const currentPlan = planDetails[currentUser.currentPlan as keyof typeof planDetails] as Plan;
    const isStripeConnected = userSettings.integrations.stripe === 'Connected';
    
  return (
    <>
    {showDisconnectConfirm && (
        <ConfirmationModal 
            title="Disconnect Stripe"
            message="Are you sure you want to disconnect your Stripe account? Mass payouts will be disabled."
            onConfirm={handleDisconnect}
            onCancel={() => setShowDisconnectConfirm(false)}
        />
    )}
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SettingsCard 
            title="Profile"
            footer={<button className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75">Save Changes</button>}
          >
              <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input type="text" id="name" defaultValue={currentUser.name} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
              </div>
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input type="email" id="email" defaultValue={currentUser.email} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
              </div>
              <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                  <input type="text" id="company" defaultValue={currentUser.company_name} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
              </div>
          </SettingsCard>

          <div className="lg:col-span-2 space-y-6">
            <SettingsCard title="Payout Provider">
                <p className="text-sm text-gray-600 dark:text-gray-400">Connect a payment provider to enable automated mass payouts to your affiliates.</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img alt="Stripe logo" src="https://stripe.com/img/v3/home/social.png" className="w-10 h-10 rounded-md mr-3"/>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Stripe</p>
                            <span className={`text-sm font-medium ${isStripeConnected ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                {userSettings.integrations.stripe}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => isStripeConnected ? setShowDisconnectConfirm(true) : setAppView('stripe_connect')} 
                        className={`px-3 py-1 text-sm font-medium rounded-md ${isStripeConnected ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}
                    >
                        {isStripeConnected ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </SettingsCard>
            <SettingsCard title="Other Integrations">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img alt="Kajabi logo" src="https://kajabi.com/images/og-kajabi-logo.png" className="w-10 h-10 rounded-md mr-3 object-cover"/>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Kajabi</p>
                            <span className="text-sm text-gray-500">Not Connected</span>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm font-medium rounded-md bg-cyan-500 text-white hover:bg-cyan-600">Connect</button>
                </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img alt="Thrivecart logo" src="https://thrivecart.com/wp-content/uploads/2021/08/ThriveCart-Logo-for-social.png" className="w-10 h-10 rounded-md mr-3 object-cover"/>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">ThriveCart</p>
                            <span className="text-sm text-gray-500">Not Connected</span>
                        </div>
                    </div>
                    <button className="px-3 py-1 text-sm font-medium rounded-md bg-cyan-500 text-white hover:bg-cyan-600">Connect</button>
                </div>
            </SettingsCard>
          </div>
      </div>
      
      {/* API Access */}
       <SettingsCard title="API Access">
        {currentPlan.features.hasApiAccess ? (
            <>
                <p className="text-gray-600 dark:text-gray-400">
                    Use your API key to integrate PartnerFlow with other services. Do not share your key publicly.
                </p>
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="font-mono text-gray-700 dark:text-gray-300">pf_sk_live_******************1234</span>
                    <button className="ml-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Regenerate Key</button>
                </div>
                 <a href="#" className="text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">View API Documentation &rarr;</a>
            </>
        ) : (
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h4 className="font-semibold text-gray-800 dark:text-white">Unlock API Access</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 max-w-sm">
                    Automate workflows and connect to third-party apps by upgrading to the Growth plan.
                </p>
                <button className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Upgrade to Growth</button>
            </div>
        )}
      </SettingsCard>

      {/* Tracking Setup */}
      <SettingsCard title="Tracking Setup">
        <p className="text-gray-600 dark:text-gray-400">
            To track affiliate sales on your external website, place this code snippet just before the closing <code>&lt;/body&gt;</code> tag on your order confirmation page (the "thank you" page).
        </p>
        <div className="relative">
            <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{trackingCode}</code>
            </pre>
            <button onClick={() => handleCopy(trackingCode, setCopied)} className="absolute top-2 right-2 px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-md hover:bg-cyan-600">
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
         <div className="mt-4 p-4 border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20">
            <h4 className="font-bold text-gray-800 dark:text-white">How it works with multiple products</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Our pixel automatically detects which product was purchased. Ensure your confirmation page includes a JavaScript object with order details, like the example below, before our tracking script.
            </p>
            <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-2 mt-2 rounded-md text-xs overflow-x-auto">
{`// Make sure this object exists on your page
var orderDetails = {
  productId: 'YOUR_PRODUCT_ID',
  amount: 499.00,
  currency: 'USD'
};`}
            </pre>
        </div>
      </SettingsCard>

      {/* Notifications */}
       <SettingsCard title="Notifications">
            <Toggle label="New Affiliate Signup" enabled={userSettings.notifications.newAffiliate} onToggle={(val) => handleNotificationToggle('newAffiliate', val)} />
            <Toggle label="Monthly Performance Report" enabled={userSettings.notifications.monthlyReport} onToggle={(val) => handleNotificationToggle('monthlyReport', val)} />
            <Toggle label="Payout Reminders" enabled={userSettings.notifications.payoutReminders} onToggle={(val) => handleNotificationToggle('payoutReminders', val)} />
       </SettingsCard>
    </div>
    </>
  );
};

export default Settings;