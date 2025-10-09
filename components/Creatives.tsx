import React, { useState, useMemo } from 'react';
import { Resource, Product, User, ResourceType } from '../data/mockData';
import AddResourceModal from './AddCreativeModal'; // Re-using AddCreativeModal as AddResourceModal
import ConfirmationModal from './ConfirmationModal';
import EmptyState from './EmptyState';
import { supabase } from '../src/lib/supabaseClient';

interface ResourcesProps {
    resources: Resource[];
    products: Product[];
    showToast: (message: string) => void;
    currentUser: User;
    refetchData: () => void;
}

const Resources: React.FC<ResourcesProps> = ({ resources, products, showToast, currentUser, refetchData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
    const [filter, setFilter] = useState<ResourceType | 'All'>('All');

    const handleOpenAddModal = () => {
        setResourceToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (resource: Resource) => {
        setResourceToEdit(resource);
        setIsModalOpen(true);
    };

    const handleSaveResource = async (resourceData: Partial<Resource>, id?: number) => {
        if (id) { // Editing
            const { id: _, creation_date, ...updateData } = resourceData;
            const { error } = await supabase.from('resources').update(updateData).eq('id', id);
            if (error) showToast(`Error: ${error.message}`);
            else showToast("Resource updated successfully!");
        } else { // Creating
            const { error } = await supabase.from('resources').insert(resourceData);
            if (error) showToast(`Error: ${error.message}`);
            else showToast("Resource added successfully!");
        }
        refetchData();
    };

    const handleDeleteResource = async () => {
        if (resourceToDelete) {
            const { error } = await supabase.from('resources').delete().eq('id', resourceToDelete.id);
            if (error) {
                showToast(`Error: ${error.message}`);
            } else {
                showToast("Resource deleted successfully.");
            }
            setResourceToDelete(null);
            refetchData();
        }
    };
    
    const filteredResources = useMemo(() => {
        if (filter === 'All') return resources;
        return resources.filter(r => r.type === filter);
    }, [resources, filter]);

    return (
        <>
            {isModalOpen && (
                <AddResourceModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveResource}
                    resourceToEdit={resourceToEdit}
                    products={products}
                    currentUser={currentUser}
                />
            )}
            {resourceToDelete && (
                <ConfirmationModal
                    title="Delete Resource"
                    message={`Are you sure you want to delete "${resourceToDelete.name}"?`}
                    onConfirm={handleDeleteResource}
                    onCancel={() => setResourceToDelete(null)}
                />
            )}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Resource Library</h2>
                    <button
                        onClick={handleOpenAddModal}
                        className="w-full sm:w-auto px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600"
                    >
                        Add New Resource
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 flex-wrap">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Filter by:</span>
                        {(['All', 'Image', 'PDF Guide', 'Video Link', 'Email Swipe'] as const).map(type => (
                             <button key={type} onClick={() => setFilter(type)} className={`px-3 py-1 text-sm font-semibold rounded-full ${filter === type ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                {type}
                             </button>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.length > 0 ? filteredResources.map(resource => (
                            <div key={resource.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group relative animate-fade-in-up">
                                {resource.type === 'Image' ? (
                                    <img src={resource.content} alt={resource.name} className="w-full h-48 object-cover bg-gray-200 dark:bg-gray-700"/>
                                ) : (
                                     <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{resource.type}</span>
                                     </div>
                                )}
                                <div className="p-4">
                                    <h4 className="font-semibold text-gray-800 dark:text-white truncate">{resource.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 h-10 overflow-hidden">{resource.description || 'No description'}</p>
                                    <div className="text-xs">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Assigned to: </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {resource.productIds.map(id => products.find(p=>p.id===id)?.name).join(', ') || 'None'}
                                        </span>
                                    </div>
                                </div>
                                 <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEditModal(resource)} className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                    </button>
                                     <button onClick={() => setResourceToDelete(resource)} className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        )) : (
                           <div className="col-span-full">
                                <EmptyState
                                    icon={<BookOpenIcon />}
                                    title="No Resources Found"
                                    message={filter === 'All' ? "You haven't added any resources yet. Click 'Add New Resource' to get started." : `There are no resources of type "${filter}".`}
                                />
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

export default Resources;
