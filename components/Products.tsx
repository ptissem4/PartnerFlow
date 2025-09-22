import React, { useState } from 'react';
import { Product, CommissionTier, User } from '../data/mockData';
import { Plan } from '../App';
import AddProductModal from './AddProductModal';
import ConfirmationModal from './ConfirmationModal';
import ProductDetail from './ProductDetail';
import { supabase } from '../lib/supabaseClient';

interface ProductsProps {
    products: Product[];
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

const Products: React.FC<ProductsProps> = ({ products, showToast, currentPlan, currentUser, refetchData }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const limitReached = products.length >= currentPlan.limits.products;

    const handleOpenAddModal = () => {
        setProductToEdit(null);
        setIsAddModalOpen(true);
    };
    
    // FIX: Update function to accept Partial<Product> to handle various update shapes
    const handleSaveProduct = async (productData: Partial<Product>, id?: number) => {
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
            const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
            if (error) showToast(`Error: ${error.message}`);
            else showToast("Product deleted successfully.");
            
            setProductToDelete(null);
            refetchData();
        }
    };

    if (selectedProduct) {
        return <ProductDetail 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)}
            onUpdateProduct={handleSaveProduct}
            showToast={showToast}
            currentPlan={currentPlan}
            currentUser={currentUser}
        />
    }

    return (
        <>
            {isAddModalOpen && (
                <AddProductModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSave={handleSaveProduct}
                    productToEdit={productToEdit}
                    currentPlan={currentPlan}
                    currentUser={currentUser}
                />
            )}
            {productToDelete && (
                <ConfirmationModal
                    title="Delete Product"
                    message={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
                    onConfirm={handleDeleteProduct}
                    onCancel={() => setProductToDelete(null)}
                />
            )}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <div className="w-full sm:w-auto">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Products</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>{products.length} / {currentPlan.limits.products} products used. </span>
                            {limitReached && <a href="#" className="text-cyan-500 hover:underline font-medium">Upgrade Your Plan</a>}
                        </div>
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={limitReached}
                        title={limitReached ? `You have reached the product limit for the ${currentPlan.name}.` : 'Add a new product'}
                    >
                        Add Product
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Product Name</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3">Commission</th>
                                <th scope="col" className="px-6 py-3">Creatives</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${product.price.toLocaleString()}</td>
                                    <td className="px-6 py-4">{formatCommissionDisplay(product.commission_tiers)}</td>
                                    <td className="px-6 py-4">{product.creatives.length}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => setSelectedProduct(product)} className="font-medium text-cyan-600 dark:text-cyan-500 hover:underline">Manage</button>
                                        <button onClick={() => setProductToDelete(product)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Products;