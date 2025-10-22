import React from 'react';
import { User, Product } from '../data/mockData';

const CreatorProfilePage: React.FC<{
  creator: User;
  products: Product[];
  onJoin: (creatorId: string) => void;
}> = ({ creator, products, onJoin }) => {
  const baseCommission = products?.[0]?.commission_tiers?.[0]?.rate;

  const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: string | number | undefined }> = ({ icon, label, value }) => (
    <div className="flex items-start">
      <div className="flex-shrink-0 text-cyan-500">{icon}</div>
      <div className="ml-3">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md font-bold text-gray-800 dark:text-white">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center">
            <img src={creator.avatar} alt={creator.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg mb-4 sm:mb-0 sm:mr-6" />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{creator.company_name}</h1>
              <p className="text-md text-gray-500 dark:text-gray-400">Affiliate Program</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: About & CTA */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">About Our Program</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{creator.publicBio || 'Join our affiliate program to earn commissions by promoting our products!'}</p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => onJoin(creator.id)}
                  className="px-8 py-4 bg-cyan-500 text-white font-bold text-lg rounded-lg shadow-xl hover:bg-cyan-600 transform hover:scale-105 transition-transform duration-300"
                >
                  Join Program & Start Earning
                </button>
                <p className="text-sm text-gray-500 mt-2">Sign up to get your unique referral links.</p>
              </div>
            </div>

            {/* Right Column: Program Details */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sticky top-10">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">Program Details</h2>
                <div className="space-y-6">
                  {baseCommission && <DetailItem icon={<DollarSignIcon />} label="Commission Rate" value={`${baseCommission}%+`} />}
                  <DetailItem icon={<ClockIcon />} label="Cookie Duration" value={`${creator.cookieDuration || 'N/A'} Days`} />
                  <DetailItem icon={<WalletIcon />} label="Payouts via" value={creator.payoutMethod || 'N/A'} />
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Products You Can Promote</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {products.map(product => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h3>
                      <div className="flex justify-between items-center text-sm font-semibold mb-4 border-t border-b border-gray-200 dark:border-gray-700 py-3 my-3">
                          <div className="text-center">
                              <p className="text-gray-500 dark:text-gray-400">Price</p>
                              <p className="text-gray-800 dark:text-white text-lg">${product.price}</p>
                          </div>
                          <div className="text-center">
                              <p className="text-gray-500 dark:text-gray-400">Commission</p>
                              <p className="text-cyan-500 text-lg">{product.commission_tiers[0]?.rate || 0}%</p>
                          </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm h-20 overflow-hidden text-ellipsis">
                        {product.description?.replace(/#+\s/g, '').replace(/[*_`]/g, '').substring(0, 150)}...
                      </p>
                    </div>
                     <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 mt-auto">
                       <a href={product.sales_page_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center justify-center">
                          View Sales Page <span className="ml-1">&rarr;</span>
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">This creator hasn't listed any products publicly yet.</p>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        Powered by <a href="/" className="font-bold text-gray-700 dark:text-gray-300 hover:underline">PartnerFlow</a>
      </footer>
    </div>
  );
};

const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1v.01M12 18v-1m0-1v.01m0-1V17m0 1v-1m-3.5-5.043A4.008 4.008 0 0112 8c1.657 0 3 .895 3 2s-1.343 2-3 2m0 0c-1.657 0-3 .895-3 2s1.343 2 3 2m0 0c1.11 0 2.08.402 2.599 1M12 4a8 8 0 100 16 8 8 0 000-16z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

export default CreatorProfilePage;