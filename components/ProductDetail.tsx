import React, { useState } from 'react';
import { Product, Creative, User } from '../data/mockData';
import { Plan } from '../src/App';
import AddProductModal from './AddProductModal';
import AddCreativeModal from './AddCreativeModal';
import ConfirmationModal from './ConfirmationModal';

interface ProductDetailProps {
    product: Product;
    onBack: () => void;
    onUpdateProduct: (product: Partial<Product>, id: number) => void;
    showToast: (message: string) => void;
    currentPlan: Plan;
    currentUser: User;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onUpdateProduct, showToast, currentPlan, currentUser }) => {
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [isCreativeModalOpen, setIsCreativeModalOpen] = useState(false);
    const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
    const [creativeToDelete, setCreativeToDelete] = useState<Creative | null>(null);

    const handleOpenAddCreativeModal = () => {
        setEditingCreative(null);
        setIsCreativeModalOpen(true);
    };

    const handleOpenEditCreativeModal = (creative: Creative) => {
        setEditingCreative(creative);
        setIsCreativeModalOpen(true);
    };

    const handleSaveCreative = (creativeData: Creative) => {
        let updatedCreatives: Creative[];
        if (editingCreative) { // Editing existing creative
            updatedCreatives = product.creatives.map(c => c.id === creativeData.id ? creativeData : c);
            showToast("Creative updated successfully!");
        } else { // Adding new creative
            updatedCreatives = [...product.creatives, creativeData];
            showToast("Creative added successfully!");
        }
        onUpdateProduct({ creatives: updatedCreatives }, product.id);
    };
    
    const handleDeleteCreative = () => {
        if (creativeToDelete) {
            const updatedCreatives = product.creatives.filter(c => c.id !== creativeToDelete.id);
            onUpdateProduct({ creatives: updatedCreatives }, product.id);
            setCreativeToDelete(null);
            showToast("Creative deleted successfully.");
        }
    };

    const nextCreativeId = Math.max(0, ...product.creatives.map(c => c.id)) + 1;

    return (
        <>
            {isEditProductModalOpen && 
                <AddProductModal 
                    onClose={() => setIsEditProductModalOpen(false)}
                    onSave={(updatedProduct) => {
                        onUpdateProduct(updatedProduct, product.id);
                        setIsEditProductModalOpen(false);
                    }}
                    productToEdit={product}
                    currentPlan={currentPlan}
                    currentUser={currentUser}
                />
            }
            {isCreativeModalOpen &&
                <AddCreativeModal 
                    onClose={() => setIsCreativeModalOpen(false)}
                    onSave={handleSaveCreative}
                    creativeToEdit={editingCreative}
                    nextId={nextCreativeId}
                />
            }
            {creativeToDelete && (
                <ConfirmationModal
                    title="Delete Creative"
                    message={`Are you sure you want to delete "${creativeToDelete.name}"?`}
                    onConfirm={handleDeleteCreative}
                    onCancel={() => setCreativeToDelete(null)}
                />
            )}
            <div>
                <button onClick={onBack} className="mb-4 flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Products
                </button>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h2>
                            <a href={product.sales_page_url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-600 dark:text-cyan-500 hover:underline">{product.sales_page_url}</a>
                        </div>
                        <button onClick={() => setIsEditProductModalOpen(true)} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Edit Product</button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Marketing Creatives</h3>
                        <button
                            onClick={handleOpenAddCreativeModal}
                            className="w-full sm:w-auto px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
                        >
                            Add Creative
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {product.creatives.length > 0 ? product.creatives.map(creative => (
                            <div key={creative.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group relative">
                                <img src={creative.imageUrl} alt={creative.name} className="w-full h-48 object-cover bg-gray-200 dark:bg-gray-700"/>
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-800 dark:text-white truncate">{creative.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">{creative.description || 'No description'}</p>
                                </div>
                                <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEditCreativeModal(creative)} className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                    </button>
                                     <button onClick={() => setCreativeToDelete(creative)} className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                                No creatives found for this product.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;