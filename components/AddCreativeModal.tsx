import React, { useState, useEffect } from 'react';
import { Creative } from '../data/mockData';

interface AddCreativeModalProps {
  onClose: () => void;
  onSave: (creative: Creative) => void;
  creativeToEdit: Creative | null;
  nextId: number;
}

type UploadMethod = 'url' | 'upload';

const AddCreativeModal: React.FC<AddCreativeModalProps> = ({ onClose, onSave, creativeToEdit, nextId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('url');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const isEditMode = !!creativeToEdit;

  useEffect(() => {
    if (isEditMode) {
      setName(creativeToEdit.name);
      setDescription(creativeToEdit.description);
      setImageUrl(creativeToEdit.imageUrl);
      setFilePreview(creativeToEdit.imageUrl);
    }
  }, [creativeToEdit, isEditMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      setImageUrl(previewUrl); // For simulation, we'll use the blob URL
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl) {
      setError('Name and an image are required.');
      return;
    }
    setError('');

    const creativeData: Creative = {
        id: creativeToEdit ? creativeToEdit.id : nextId,
        name,
        description,
        imageUrl,
    };
    
    onSave(creativeData);
    onClose();
  };
  
  const finalImageUrl = uploadMethod === 'upload' ? filePreview : imageUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {isEditMode ? 'Edit Creative' : 'Upload New Creative'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="creative-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Creative Name</label>
                <input type="text" id="creative-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
             <div>
                <label htmlFor="creative-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="creative-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image Source</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button type="button" onClick={() => setUploadMethod('url')} className={`px-4 py-2 rounded-l-md border ${uploadMethod === 'url' ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>From URL</button>
                <button type="button" onClick={() => setUploadMethod('upload')} className={`px-4 py-2 rounded-r-md border-t border-b border-r ${uploadMethod === 'upload' ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>Upload File</button>
              </div>
            </div>

            {uploadMethod === 'url' ? (
              <div>
                  <label htmlFor="creative-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                  <input type="url" id="creative-image" value={imageUrl} onChange={(e) => {setImageUrl(e.target.value); setFilePreview(e.target.value);}} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required placeholder="https://..." />
              </div>
            ) : (
              <div>
                <label htmlFor="creative-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image</label>
                <input type="file" id="creative-file" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"/>
              </div>
            )}

            {finalImageUrl && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</p>
                <img src={finalImageUrl} alt="Creative preview" className="mt-1 max-h-40 w-auto rounded-md border border-gray-200 dark:border-gray-700"/>
              </div>
            )}
          
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">{isEditMode ? 'Save Changes' : 'Add Creative'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddCreativeModal;