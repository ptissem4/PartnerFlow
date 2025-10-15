
import React, { useState, useMemo } from 'react';
import { Resource, Product, User, ResourceType } from '../data/mockData';
import AddCreativeModal from './AddCreativeModal';
import ConfirmationModal from './ConfirmationModal';
import { supabase } from '../src/lib/supabaseClient';
import EmptyState from './EmptyState';
import { ActiveView } from '../src/App';

interface CreativesProps {
    resources: Resource[];
    setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
    useMockData: boolean;
    products: Product[];
    showToast: (message: string) => void;
    currentUser: User;
    refetchData: () => void;
    setActiveView: (view: ActiveView) => void;
}

const ResourceIcon: React.FC<{type: ResourceType}> = ({ type }) => {
    const className = "h-5 w-5 text-gray-500 dark:text-gray-400";
    switch (type) {
        case 'Image':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'PDF Guide':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
        case 'Video Link':
            return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case 'Email Swipe':
             return <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
        default:
            return null;
    }
}

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

const ResourceCard: React.FC<{ resource: Resource, onEdit: () => void, onDelete: () => void }> = ({ resource, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between animate-fade-in-up">
        <div>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <ResourceIcon type={resource.type} />
                    <h4 className="font-semibold text-gray-800 dark:text-white">{resource.name}</h4>
                </div>
                <span className="text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded-full flex-shrink-0">{resource.type}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{resource.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-2">
            <button onClick={onEdit} className="font-medium text-sm text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
            <button onClick={onDelete} className="font-medium text-sm text-red-600 dark:text-red-500 hover:underline">Delete</button>
        </div>
    </div>
);

const Creatives: React.FC<CreativesProps> = ({ resources, setResources, useMockData, products, showToast, currentUser, refetchData, setActiveView }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };
    
    const handleSaveResource = async (resourceData: Partial<Resource>, id?: number) => {
        if (useMockData) {
            if (id) {
                setResources(prev => prev.map(r => r.id === id ? { ...r, ...resourceData } as Resource : r));
                showToast("Resource updated in demo mode!");
            } else {
                const newResource: Resource = {
                    id: Date.now(),
                    user_id: currentUser.id,
                    ...resourceData
                } as Resource;
                setResources(prev => [...prev, newResource]);
                showToast("Resource added in demo mode!");
            }
            return;
        }

        if (id) {
            const { id: _, ...updateData } = resourceData;
            const { error } = await supabase.from('resources').update(updateData).eq('id', id);
            if (error) showToast(`Error: ${error.message}`);
            else showToast("Resource updated successfully!");
        } else {
            const { error } = await supabase.from('resources').insert(resourceData);
            if (error) showToast(`Error: ${error.message}`);
            else showToast("Resource added successfully!");
        }
        refetchData();
    };
    
    const handleDeleteResource = async () => {
        if (resourceToDelete) {
             if (useMockData) {
                setResources(prev => prev.filter(r => r.id !== resourceToDelete.id));
                showToast("Resource deleted in demo mode.");
            } else {
                const { error } = await supabase.from('resources').delete().eq('id', resourceToDelete.id);
                if (error) showToast(`Error: ${error.message}`);
                else showToast("Resource deleted successfully.");
                refetchData();
            }
            setResourceToDelete(null);
        }
    };
    
    const handleOpenEditModal = (resource: Resource) => {
        setResourceToEdit(resource);
        setIsAddModalOpen(true);
    };

    const generalResources = useMemo(() => resources.filter(r => r.productIds.length === 0), [resources]);
    const productsWithResources = useMemo(() => products.filter(product => resources.some(res => res.productIds.includes(product.id))), [products, resources]);


    return (
        <div className="space-y-6">
            {isAddModalOpen &&
                <AddCreativeModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveResource}
                    resourceToEdit={resourceToEdit}
                    products={products}
                    currentUser={currentUser}
                />
            }
            {resourceToDelete && (
                <ConfirmationModal
                    title="Delete Resource"
                    message={`Are you sure you want to delete "${resourceToDelete.name}"?`}
                    onConfirm={handleDeleteResource}
                    onCancel={() => setResourceToDelete(null)}
                />
            )}

            <div className="p-4 border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-cyan-700 dark:text-cyan-200">
                        Resources you add here will be available to your affiliates in their portal.
                        <button onClick={() => setActiveView('affiliate')} className="font-bold underline ml-2 hover:text-cyan-600 dark:hover:text-cyan-100">
                           See how it looks &rarr;
                        </button>
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <div className="w-full sm:w-auto">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Resource Library</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all marketing materials for your affiliates.</p>
                    </div>
                    <button
                        onClick={() => { setResourceToEdit(null); setIsAddModalOpen(true); }}
                        className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                    >
                        Add New Resource
                    </button>
                </div>

                {resources.length > 0 ? (
                    <div className="space-y-4">
                        {/* General Resources */}
                        {generalResources.length > 0 && (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                <button onClick={() => toggleAccordion('general')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">
                                    <div className="flex items-center">
                                        <h4 className="font-semibold text-lg text-gray-800 dark:text-white">General Marketing Resources</h4>
                                        <span className="ml-3 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{generalResources.length}</span>
                                    </div>
                                    <ChevronIcon isOpen={openAccordion === 'general'} />
                                </button>
                                {openAccordion === 'general' && (
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {generalResources.map(resource => (
                                            <ResourceCard key={resource.id} resource={resource} onEdit={() => handleOpenEditModal(resource)} onDelete={() => setResourceToDelete(resource)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Product-specific Resources */}
                        {productsWithResources.map(product => {
                            const productResources = resources.filter(r => r.productIds.includes(product.id));
                            return (
                                <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <button onClick={() => toggleAccordion(`product-${product.id}`)} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">
                                        <div className="flex items-center">
                                            <h4 className="font-semibold text-lg text-gray-800 dark:text-white">{product.name}</h4>
                                            <span className="ml-3 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{productResources.length}</span>
                                        </div>
                                        <ChevronIcon isOpen={openAccordion === `product-${product.id}`} />
                                    </button>
                                    {openAccordion === `product-${product.id}` && (
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {productResources.map(resource => (
                                                <ResourceCard key={resource.id} resource={resource} onEdit={() => handleOpenEditModal(resource)} onDelete={() => setResourceToDelete(resource)} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={<BookOpenIcon />}
                        title="No Resources Found"
                        message={"Get started by adding your first resource for affiliates."}
                        actionButton={{ text: 'Add a Resource', onClick: () => setIsAddModalOpen(true)}}
                    />
                )}
            </div>
        </div>
    );
};

const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

export default Creatives;