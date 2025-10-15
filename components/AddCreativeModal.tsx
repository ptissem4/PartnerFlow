import React, { useState, useEffect } from 'react';
import { Resource, Product, User, ResourceType } from '../data/mockData';

interface AddResourceModalProps {
  onClose: () => void;
  onSave: (resource: Partial<Resource>, id?: number) => void;
  resourceToEdit: Resource | null;
  products: Product[];
  currentUser: User;
}

const AddCreativeModal: React.FC<AddResourceModalProps> = ({ onClose, onSave, resourceToEdit, products, currentUser }) => {
  const [type, setType] = useState<ResourceType>('Image');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const isEditMode = !!resourceToEdit;

  useEffect(() => {
    if (isEditMode) {
      setType(resourceToEdit.type);
      setName(resourceToEdit.name);
      setDescription(resourceToEdit.description);
      setContent(resourceToEdit.content);
      setSelectedProducts(resourceToEdit.productIds);
      setFileName('');
    }
  }, [resourceToEdit, isEditMode]);

  const handleTypeChange = (newType: ResourceType) => {
    setType(newType);
    setContent('');
    setFileName('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleContentUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (fileName) {
        setFileName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      setError('Name and content are required.');
      return;
    }
    
    setError('');

    const resourceData: Partial<Resource> = {
      user_id: currentUser.id,
      name,
      type,
      description,
      content,
      productIds: selectedProducts,
      creation_date: resourceToEdit?.creation_date || new Date().toISOString().split('T')[0],
    };
    
    onSave(resourceData, resourceToEdit?.id);
    onClose();
  };
  
  const handleProductSelection = (productId: number) => {
      setSelectedProducts(prev => 
        prev.includes(productId) 
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
      );
  };

  const getContentLabel = () => {
      switch(type) {
          case 'Image': return 'Image URL';
          case 'PDF Guide': return 'PDF File URL';
          case 'Video Link': return 'Video URL (e.g., YouTube)';
          case 'Email Swipe': return 'Email Body Text';
          default: return 'Content';
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {isEditMode ? 'Edit Resource' : 'Add New Resource'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resource Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ResourceType)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option>Image</option>
              <option>PDF Guide</option>
              <option>Video Link</option>
              <option>Email Swipe</option>
            </select>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name / Title</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
           <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          {type === 'Email Swipe' ? (
             <div>
                <label htmlFor="content-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{getContentLabel()}</label>
                <textarea 
                    id="content-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    required
                />
             </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
                    <div className="mt-1">
                        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept="image/*,video/*,application/pdf"/>
                        <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span>Parcourir les fichiers</span>
                        </label>
                        {fileName && <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{fileName}</span>}
                    </div>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400">OU</span>
                      </div>
                    </div>
                
                    <div>
                        <label htmlFor="content-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{getContentLabel()}</label>
                        <input
                            type="url"
                            id="content-url"
                            value={fileName ? '' : content}
                            onChange={handleContentUrlChange}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="https://..."
                        />
                    </div>
                </div>
            )}
            
           <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to Products (optional)</label>
                <div className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto space-y-2">
                    {products.length > 0 ? products.map(product => (
                        <div key={product.id} className="flex items-center">
                            <input
                                id={`product-${product.id}`}
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleProductSelection(product.id)}
                                className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor={`product-${product.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                {product.name}
                            </label>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">No products available. Please add a product first.</p>
                    )}
                </div>
           </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600"
            >
              {isEditMode ? 'Save Changes' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCreativeModal;