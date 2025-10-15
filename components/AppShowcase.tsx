import React, { useState, useEffect } from 'react';
import DashboardScreenshot from './DashboardScreenshot';
import AffiliatesScreenshot from './AffiliatesScreenshot';
import ProductsScreenshot from './ProductsScreenshot';

const views = [
    { id: 'dashboard', component: <DashboardScreenshot />, name: 'Dashboard' },
    { id: 'affiliates', component: <AffiliatesScreenshot />, name: 'Affiliates' },
    { id: 'products', component: <ProductsScreenshot />, name: 'Products' },
];

// FIX: Added props interface to accept `initialView` and prevent TypeScript error.
interface AppShowcaseProps {
    initialView?: string;
}

const AppShowcase: React.FC<AppShowcaseProps> = ({ initialView }) => {
    const [activeView, setActiveView] = useState(initialView || views[0].id);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveView(prevView => {
                const currentIndex = views.findIndex(v => v.id === prevView);
                const nextIndex = (currentIndex + 1) % views.length;
                return views[nextIndex].id;
            });
        }, 4000); // Change view every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700/50">
                <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                 <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-6 rounded-md"></div>
            </div>
            <div className="relative aspect-[1.6/1]">
                {views.map(view => (
                    <div
                        key={view.id}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                            activeView === view.id ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {view.component}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppShowcase;