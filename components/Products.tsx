import React, { useState } from 'react';
// FIX: Updated Plan import to resolve circular dependency.
import { Product, CommissionTier, User, Resource, Plan } from '../data/mockData';
import AddProductModal from './AddProductModal';
import ConfirmationModal from './ConfirmationModal';
import ProductDetail from './ProductDetail';
import { supabase } from '../src/lib/supabaseClient';
import EmptyState from './EmptyState';

interface ProductsProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    useMockData: boolean;
    resources: Resource[];
    showToast: (message: string) => void;
    currentPlan: Plan;
    currentUser: User;
    refetchData: () => void;
}

const formatCommissionDisplay = (tiers: CommissionTier[]) => {
    if (!tiers || tiers.length === 0) return 'N/A';
    const baseTier = tiers.find(t => t.threshold === 0) || tiers[0];
    let displayText = `${baseTier.rate}%`;
    if (tiers.length > 1) {
        displayText += ' (+ Tiers)';
    }
    return displayText;
};

const Products: React.FC<ProductsProps> = ({ products, setProducts, useMockData, resources, showToast, currentPlan, currentUser, refetchData }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const limitReached = products.length >= currentPlan.limits.products;

    const handleOpenAddModal = () => {
        setProductToEdit(null);
        setIsAddModalOpen(true);
    };
    
    const handleSaveProduct = async (productData: Partial<Product>, id?: number) => {
        if (useMockData) {
            if (id) { // Editing in demo mode
                setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } as Product : p));
                showToast("Product updated in demo mode!");
                if (selectedProduct?.id === id) {
                     setSelectedProduct(prev => ({...prev, ...productData} as Product));
                }
            } else { // Creating in demo mode
                const newProduct: Product = {
                    id: Date.now(),
                    user_id: currentUser.id,
                    name: productData.name || 'New Product',
                    price: productData.price || 0,
                    sales_page_url: productData.sales_page_url || '',
                    commission_tiers: productData.commission_tiers || [],
                    bonuses: productData.bonuses || [],
                    sales_count: 0,
                    clicks: 0,
                    creation_date: new Date().toISOString().split('T')[0],
                    isPubliclyListed: productData.isPubliclyListed || false,
                    description: productData.description || '',
                };
                setProducts(prev => [...prev, newProduct]);
                showToast("Product added in demo mode!");
            }
            return;
        }

        // Supabase logic
        if (id) { // Editing
            const { id: _, creation_date, sales_count, clicks, ...updateData } = productData;
            const { error } = await supabase.from('products').update(updateData).eq('id', id);
            if(error) showToast(`Error: ${error.message}`);
            else showToast("Product updated successfully!");
        } else { // Creating
            const { error } = await supabase.from('products').insert(productData);
            if(error) showToast(`Error: ${error.message}`);
            else showToast("Product added successfully!");
        }

        if (selectedProduct) {
            const { data } = await supabase.from('products').select('*').eq('id', selectedProduct.id).single();
            if (data) setSelectedProduct(data as Product);
        }
        
        refetchData();
    };
    
    const handleDeleteProduct = async () => {
        if (productToDelete) {
             if (useMockData) {
                setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
                showToast("Product deleted in demo mode.");
                setProductToDelete(null);
                return;
            }

            const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
            if (error) {
                showToast(`Error: ${error.message}`);
            } else {
                showToast("Product deleted successfully.");
            }
            setProductToDelete(null);
            refetchData();
        }
    };
    
    const handleOpenEditModal = (product: Product) => {
        setProductToEdit(product);
        setIsAddModalOpen(true);
    };

    if (selectedProduct) {
        return <ProductDetail 
            product={selectedProduct} 
            resources={resources}
            onBack={() => setSelectedProduct(null)} 
            onUpdateProduct={handleSaveProduct}
            showToast={showToast}
            currentPlan={currentPlan}
            currentUser={currentUser}
        />;
    }

  return (
    <div className="space-y-6">
    {isAddModalOpen && 
        <AddProductModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSaveProduct} 
            productToEdit={productToEdit} 
            currentPlan={currentPlan}
            currentUser={currentUser}
        />
    }
    {productToDelete && (
        <ConfirmationModal
            title="Delete Product"
            message={`Are you sure you want to delete "${productToDelete.name}"? This will also remove any associated creatives.`}
            onConfirm={handleDeleteProduct}
            onCancel={() => setProductToDelete(null)}
        />
    )}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
        <div className="w-full sm:w-auto">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Your Products</h3>
             <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>{products.length} / {currentPlan.limits.products} products used. </span>
                {limitReached && <a href="#" className="text-cyan-500 hover:underline font-medium">Upgrade Your Plan</a>}
            </div>
        </div>
        <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={limitReached}
            title={limitReached ? `You have reached the product limit for the ${currentPlan.name}.` : ''}
        >
            Add New Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Product Name</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Sales</th>
              <th scope="col" className="px-6 py-3">Clicks</th>
              <th scope="col" className="px-6 py-3">Commission</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
             {products.length > 0 ? (
                products.map((product) => (
                <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 animate-fade-in-up">
                    <td scope="row" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:underline"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                          {product.isPubliclyListed && <EyeIcon />}
                        </div>
                    </td>
                    <td className="px-6 py-4">${product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">{product.sales_count}</td>
                    <td className="px-6 py-4">{product.clicks}</td>
                    <td className="px-6 py-4 font-medium text-cyan-600 dark:text-cyan-500">{formatCommissionDisplay(product.commission_tiers)}</td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                            <button onClick={() => setSelectedProduct(product)} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">Details</button>
                            <button onClick={() => handleOpenEditModal(product)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                            <button onClick={() => setProductToDelete(product)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                        </div>
                    </td>
                </tr>
                ))
            ) : (
                 <tr>
                    <td colSpan={6} className="py-4">
                        <EmptyState
                            icon={<TagIcon />}
                            title="You haven't added any products yet"
                            message="Products are the items or services you want your affiliates to promote. Add your first product to get started."
                            actionButton={{ text: 'Add Your First Product', onClick: handleOpenAddModal }}
                        />
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11m0-11h11" /></svg>;
// FIX: Replaced the invalid 'title' prop with a <title> element for accessibility and to fix the TypeScript error.
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Publicly listed on marketplace</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);


export default Products;