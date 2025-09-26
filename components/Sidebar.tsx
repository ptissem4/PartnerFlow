
import React from 'react';
// FIX: Corrected path to import from `src/App.tsx`.
import { Page, AdminPage } from '../src/App';
import { User } from '../data/mockData';

interface SidebarProps {
  activePage: Page | AdminPage;
  setActivePage: (page: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: User;
  isLocked?: boolean;
}

const NavItem: React.FC<{
  page: Page | AdminPage;
  // FIX: Replaced JSX.Element with React.ReactNode to resolve namespace error.
  icon: React.ReactNode;
  label: string;
  activePage: Page | AdminPage;
  onClick: (page: Page | AdminPage) => void;
  isDisabled: boolean;
}> = ({ page, icon, label, activePage, onClick, isDisabled }) => (
  <button
    onClick={() => onClick(page)}
    disabled={isDisabled}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      activePage === page
        ? 'bg-cyan-500 text-white shadow-lg'
        : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={isDisabled ? "Please subscribe to access this page." : ""}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen, currentUser, isLocked = false }) => {
  const handleNavClick = (page: Page | AdminPage) => {
    setActivePage(page);
    if (isOpen) {
      setIsOpen(false);
    }
  };
  
  const isSuperAdmin = currentUser.roles.includes('super_admin');

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 w-64 p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center mb-10">
        <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold ml-3 text-gray-800 dark:text-white">PartnerFlow</h1>
      </div>
      <nav className="space-y-2">
        {isSuperAdmin ? (
            <>
                <NavItem page="AdminDashboard" icon={<ShieldCheckIcon />} label="Admin Dashboard" activePage={activePage} onClick={handleNavClick} isDisabled={false} />
                <NavItem page="Clients" icon={<UsersIcon />} label="Clients" activePage={activePage} onClick={handleNavClick} isDisabled={false} />
                <NavItem page="Analytics" icon={<ChartPieIcon />} label="Analytics" activePage={activePage} onClick={handleNavClick} isDisabled={false} />
                <NavItem page="PartnerflowAffiliates" icon={<MegaphoneIcon />} label="PartnerFlow Affiliates" activePage={activePage} onClick={handleNavClick} isDisabled={false} />
                <NavItem page="PlatformSettings" icon={<CogIcon />} label="Platform Settings" activePage={activePage} onClick={handleNavClick} isDisabled={false} />
            </>
        ) : (
            <>
                <NavItem page="Dashboard" icon={<HomeIcon />} label="Dashboard" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
                <NavItem page="Affiliates" icon={<UsersIcon />} label="Affiliates" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
                <NavItem page="Products" icon={<TagIcon />} label="Products" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
                <NavItem page="Payouts" icon={<CreditCardIcon />} label="Payouts" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
                <NavItem page="Reports" icon={<ChartBarIcon />} label="Reports" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
                <NavItem page="Communicate" icon={<PaperAirplaneIcon />} label="Communicate" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
                <NavItem page="Billing" icon={<WalletIcon />} label="Billing" activePage={activePage} onClick={handleNavClick} isDisabled={false} />
                <NavItem page="Settings" icon={<CogIcon />} label="Settings" activePage={activePage} onClick={handleNavClick} isDisabled={isLocked} />
            </>
        )}
      </nav>
    </aside>
  );
};

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11m0-11h11" /></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 21a12.02 12.02 0 009-10.056z" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const PaperAirplaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V4.5a1.5 1.5 0 013 0v1.382m-3 0V3.5a1.5 1.5 0 013 0v2.382m0 0a3 3 0 10-3 3H5a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V11H11m0 0a3 3 0 10-3 3h4m0 0a3 3 0 103-3h-4m0 0V7.5a1.5 1.5 0 013 0V11" /></svg>;


export default Sidebar;