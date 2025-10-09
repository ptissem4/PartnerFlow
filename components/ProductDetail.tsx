import React, { useState } from 'react';
import { Product, Resource, User, ResourceType } from '../data/mockData';
import { Plan } from '../src/App';
import AddProductModal from './AddProductModal';

interface ProductDetailProps {
    product: Product;
    resources: Resource[];
    onBack: () => void;
    onUpdateProduct: (product: Partial<Product>, id: number) => void;
    showToast: (message: string) => void;
    currentPlan: Plan;
    currentUser: User;
}

const ResourceIcon: React.FC<{type: ResourceType}> = ({ type }) => {
    switch (type) {
        case 'Image':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'PDF Guide':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
        case 'Video Link':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case 'Email Swipe':
             return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        default:
            return null;
    }
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, resources, onBack, onUpdateProduct, showToast, currentPlan, currentUser }) => {
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    
    const assignedResources = resources.filter(r => r.productIds.includes(product.id));

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
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Assigned Resources</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage all resources from the new central <button onClick={onBack} className="font-medium text-cyan-500 hover:underline">Resource Library</button>.</p>
                    </div>
                    
                    <div className="space-y-3">
                        {assignedResources.length > 0 ? assignedResources.map(resource => (
                            <div key={resource.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex items-center">
                                <ResourceIcon type={resource.type} />
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-800 dark:text-white">{resource.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{resource.description}</p>
                                </div>
                                <span className="text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {resource.type}
                                </span>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                                No resources assigned to this product yet.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default ProductDetail;
