


import React, { useState, useEffect } from 'react';
import { PlatformSettings as PlatformSettingsType } from '../data/mockData';
import { Plan } from '../src/App';

interface PlatformSettingsProps {
    platformSettings: PlatformSettingsType;
    setPlatformSettings: React.Dispatch<React.SetStateAction<PlatformSettingsType>>;
    planDetails: { [key: string]: Plan };
    setPlanDetails: React.Dispatch<React.SetStateAction<{ [key: string]: Plan }>>;
    showToast: (message: string) => void;
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

const PlatformSettings: React.FC<PlatformSettingsProps> = ({ platformSettings, setPlatformSettings, planDetails, setPlanDetails, showToast }) => {
    const [announcementText, setAnnouncementText] = useState(platformSettings.announcement.text);
    const [isAnnouncementEnabled, setIsAnnouncementEnabled] = useState(platformSettings.announcement.isEnabled);
    const [editablePlans, setEditablePlans] = useState(planDetails);
    
    useEffect(() => {
        setEditablePlans(planDetails);
    }, [planDetails]);

    const handleSaveAnnouncement = () => {
        setPlatformSettings({
            announcement: {
                text: announcementText,
                isEnabled: isAnnouncementEnabled
            }
        });
        showToast("Announcement settings saved.");
    };
    
    const handlePlanDetailChange = (planName: string, field: 'price' | 'affiliates' | 'products', value: string) => {
        const updatedPlans = JSON.parse(JSON.stringify(editablePlans));
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) return;

        const planToUpdate = updatedPlans[planName];

        if (field === 'price') {
            planToUpdate.price = numValue;
        } else if (field === 'affiliates' || field === 'products') {
            planToUpdate.limits[field] = numValue;
        }
        
        setEditablePlans(updatedPlans);
    };
    
    const handleSavePlans = () => {
        setPlanDetails(editablePlans);
        showToast("Plan details updated.");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Platform Settings</h2>
            
            <SettingsCard
                title="Global Announcement Banner"
                footer={<button onClick={handleSaveAnnouncement} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Save Announcement</button>}
            >
                <div>
                    <label htmlFor="announcement-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banner Text</label>
                    <textarea 
                        id="announcement-text" 
                        rows={3}
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <Toggle
                    label="Enable Announcement Banner"
                    enabled={isAnnouncementEnabled}
                    onToggle={setIsAnnouncementEnabled}
                />
            </SettingsCard>
            
            <SettingsCard
                title="Manage Subscription Plans"
                footer={<button onClick={handleSavePlans} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Save Plan Details</button>}
            >
                <div className="space-y-4">
                    {Object.values(editablePlans).map((plan) => (
                        <div key={plan.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Price ($/mo)</label>
                                    <input 
                                        type="number" 
                                        value={plan.price}
                                        onChange={(e) => handlePlanDetailChange(plan.name, 'price', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                                        disabled={plan.price === 0}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Affiliate Limit</label>
                                    <input 
                                        type="number" 
                                        value={plan.limits.affiliates}
                                        onChange={(e) => handlePlanDetailChange(plan.name, 'affiliates', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Product Limit</label>
                                    <input 
                                        type="number" 
                                        value={plan.limits.products}
                                        onChange={(e) => handlePlanDetailChange(plan.name, 'products', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsCard>
        </div>
    );
};

export default PlatformSettings;