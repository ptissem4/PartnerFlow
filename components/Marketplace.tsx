import React, { useState, useMemo } from 'react';
import { User } from '../data/mockData';
import { marked } from 'marked';
import { Product } from '../data/mockData';


interface MarketplaceProps {
    products: Product[];
    users: User[];
    onBack: () => void;
    currentUser: User | null;
    onApply: (creatorId: string) => void;
}

const renderMarkdown = (markdown: string) => {
    if (!markdown) return null;
    let html = marked(markdown);
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

const MarketplaceCard: React.FC<{ product: Product, creator?: User, onDetailsClick: () => void, partnershipStatus?: 'Active' | 'Pending' | 'Inactive' }> = ({ product, creator, onDetailsClick, partnershipStatus }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
        <div className="p-6 flex-grow">
            <div className="flex items-center mb-4">
                {creator && <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full mr-3" />}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{product.name}</h3>
                    {creator && <p className="text-sm text-gray-500 dark:text-gray-400">by {creator.company_name}</p>}
                </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 h-20 overflow-hidden text-ellipsis">
              {product.description?.replace(/#+\s/g, '').replace(/[*_`]/g, '').substring(0, 150)}...
            </p>
            <div className="flex justify-between items-center text-sm font-semibold">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-gray-800 dark:text-white">${product.price}</p>
                </div>
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Commission</p>
                    <p className="text-cyan-500">{product.commission_tiers[0]?.rate || 0}%</p>
                </div>
                 {partnershipStatus && (
                    <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400">Status</p>
                         <p className={`font-bold ${partnershipStatus === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>{partnershipStatus}</p>
                    </div>
                 )}
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3">
             <button onClick={onDetailsClick} className="w-full px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75">
                View Details
            </button>
        </div>
    </div>
);

interface ProductDetailViewProps {
    product: Product;
    creator?: User;
    onBack: () => void;
    onApply: () => void;
    currentUser: User | null;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, creator, onBack, onApply, currentUser }) => {
    
    const partnership = currentUser?.partnerships?.find(p => p.creatorId === product.user_id);

    let applyButton;
    if (partnership?.status === 'Active') {
        applyButton = <button disabled className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg cursor-not-allowed">✓ Joined</button>;
    } else if (partnership?.status === 'Pending') {
        applyButton = <button disabled className="px-8 py-3 bg-yellow-500 text-white font-bold rounded-lg cursor-not-allowed">Pending Approval</button>;
    } else {
        applyButton = (
             <button onClick={onApply} className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-xl hover:bg-cyan-600 transform hover:scale-105 transition-transform duration-300">
                {currentUser ? 'Apply to Promote' : 'Login or Sign Up to Apply'}
            </button>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl mx-auto my-12 animate-fade-in-up">
            <div className="p-6">
                <button onClick={onBack} className="text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline mb-4">&larr; Back to Marketplace</button>
                <div className="flex items-center mb-4">
                    {creator && <img src={creator.avatar} alt={creator.name} className="w-16 h-16 rounded-full mr-4" />}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h2>
                        {creator && <p className="text-lg text-gray-500 dark:text-gray-400">by {creator.company_name}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 my-6 text-center">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">${product.price}</p>
                    </div>
                     <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Commission Rate</p>
                        <p className="text-2xl font-bold text-cyan-500">{product.commission_tiers[0]?.rate || 0}%</p>
                    </div>
                </div>
                 <div className="text-gray-600 dark:text-gray-400 space-y-4">
                    {renderMarkdown(product.description || 'No description provided.')}
                </div>

                <div className="mt-8 text-center">
                    {applyButton}
                </div>
            </div>
        </div>
    );
};


const Marketplace: React.FC<MarketplaceProps> = ({ products, users, onBack, currentUser, onApply }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        users.find(u => u.id === p.user_id)?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, users, searchQuery]);

    if (selectedProduct) {
        const creator = users.find(u => u.id === selectedProduct.user_id);
        return <ProductDetailView 
            product={selectedProduct} 
            creator={creator} 
            onBack={() => setSelectedProduct(null)}
            onApply={() => onApply(selectedProduct.user_id)}
            currentUser={currentUser}
        />
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
             {!onBack ? null : (
                <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold ml-3 text-gray-800 dark:text-white">PartnerFlow Marketplace</h1>
                        </div>
                        <button onClick={onBack} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-500">
                            &larr; Back
                        </button>
                    </div>
                </header>
            )}
            <main className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white">Discover Products to Promote</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Find high-quality products from top creators and start earning commissions.</p>
                </div>
                <div className="mb-8 max-w-2xl mx-auto">
                    <input 
                        type="text"
                        placeholder="Search for products, niches, or creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map(product => {
                            const creator = users.find(u => u.id === product.user_id);
                            const partnership = currentUser?.partnerships?.find(p => p.creatorId === product.user_id);
                            return <MarketplaceCard 
                                key={product.id} 
                                product={product} 
                                creator={creator} 
                                onDetailsClick={() => setSelectedProduct(product)}
                                partnershipStatus={partnership?.status}
                            />
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <h3 className="text-xl font-semibold">No products found</h3>
                        <p className="mt-2">Try adjusting your search terms.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Marketplace;