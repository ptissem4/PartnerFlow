import React, { useState, useEffect, useRef } from 'react';
import { Resource, ResourceType, Product, User } from '../data/mockData';

interface AddResourceModalProps {
  onClose: () => void;
  onSave: (resource: Partial<Resource>, id?: number) => void;
  resourceToEdit: Resource | null;
  products: Product[];
  currentUser: User;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ onClose, onSave, resourceToEdit, products, currentUser }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('Image');
  const [content, setContent] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [error, setError] = useState('');

  const isEditMode = !!resourceToEdit;

  useEffect(() => {
    if (isEditMode) {
      setName(resourceToEdit.name);
      setDescription(resourceToEdit.description);
      setType(resourceToEdit.type);
      setContent(resourceToEdit.content);
      setSelectedProducts(resourceToEdit.productIds);
    }
  }, [resourceToEdit, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content || !type) {
      setError('Name, type, and content are required.');
      return;
    }
    setError('');

    const resourceData: Partial<Resource> = {
        user_id: currentUser.id,
        name,
        description,
        type,
        content,
        productIds: selectedProducts,
    };
    
    onSave(resourceData, resourceToEdit?.id);
    onClose();
  };

  const getContentLabel = () => {
    switch(type) {
        case 'Image': return 'Image URL';
        case 'PDF Guide': return 'PDF File URL';
        case 'Video Link': return 'Video URL (e.g., YouTube)';
        case 'Email Swipe': return 'Email Body Text';
        default: return 'Content';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEditMode ? 'Edit Resource' : 'Add New Resource'}
            </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resource Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                    <option value="Image">Image (Banner, Social Graphic)</option>
                    <option value="PDF Guide">PDF Guide (Lead Magnet)</option>
                    <option value="Video Link">Video Link</option>
                    <option value="Email Swipe">Email Swipe</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"></textarea>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{getContentLabel()}</label>
                {type === 'Email Swipe' ? (
                     <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required></textarea>
                ) : (
                    <input type="url" value={content} onChange={(e) => setContent(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" required placeholder="https://..." />
                )}
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Products (Optional)</label>
                <select multiple value={selectedProducts.map(String)} onChange={(e) => setSelectedProducts(Array.from(e.target.selectedOptions, option => Number(option.value)))} className="mt-1 block w-full h-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
          
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" formNoValidate onClick={handleSubmit} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">{isEditMode ? 'Save Changes' : 'Add Resource'}</button>
        </div>
      </div>
    </div>
  );
};

export default AddResourceModal;
