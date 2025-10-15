
import React, { useState, useEffect, useRef } from 'react';
// FIX: Updated Plan import to resolve circular dependency.
import { Product, CommissionTier, PerformanceBonus, User, Plan } from '../data/mockData';

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: Partial<Product>, id?: number) => void;
  productToEdit: Product | null;
  currentPlan: Plan;
  currentUser: User;
}

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: (enabled: boolean) => void; disabled: boolean, disabledText: string }> = ({ label, enabled, onToggle, disabled, disabledText }) => (
    <div className="flex items-center justify-between" title={disabled ? disabledText : ''}>
        <span className={`text-gray-700 dark:text-gray-300 ${disabled ? 'opacity-50' : ''}`}>{label}</span>
        <label htmlFor={label} className={`relative inline-flex items-center cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}>
            <input id={label} type="checkbox" className="sr-only" checked={enabled} onChange={(e) => onToggle(e.target.checked)} disabled={disabled} />
            <div className={`block w-14 h-8 rounded-full transition ${enabled && !disabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled && !disabled ? 'transform translate-x-6' : ''}`}></div>
        </label>
    </div>
);


const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSave, productToEdit, currentPlan, currentUser }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salesPageUrl, setSalesPageUrl] = useState('');
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([{ threshold: 0, rate: 20 }]);
  const [bonuses, setBonuses] = useState<PerformanceBonus[]>([]);
  const [isPubliclyListed, setIsPubliclyListed] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!productToEdit;
  const canUseAdvancedFeatures = currentPlan.features.hasTieredCommissions;

  useEffect(() => {
    if (isEditMode) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setSalesPageUrl(productToEdit.sales_page_url);
        setCommissionTiers(productToEdit.commission_tiers.length > 0 ? productToEdit.commission_tiers : [{ threshold: 0, rate: 20 }]);
        setBonuses(productToEdit.bonuses || []);
        setIsPubliclyListed(productToEdit.isPubliclyListed || false);
        setDescription(productToEdit.description || '');
    }
  }, [productToEdit, isEditMode]);

  const insertMarkdown = (syntax: 'bold' | 'italic' | 'list' | 'image', imageUrl?: string) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';
    let selectionStart = start;
    let selectionEnd = start;

    switch (syntax) {
        case 'bold':
            newText = `**${selectedText || 'bold text'}**`;
            selectionStart = start + 2;
            selectionEnd = selectedText ? selectionStart + selectedText.length : start + 9;
            break;
        case 'italic':
            newText = `*${selectedText || 'italic text'}*`;
            selectionStart = start + 1;
            selectionEnd = selectedText ? selectionStart + selectedText.length : start + 12;
            break;
        case 'list':
            const listItems = selectedText.split('\n').map(item => `- ${item}`).join('\n');
            newText = listItems || `\n- List item 1\n- List item 2`;
            selectionStart = start + newText.length;
            selectionEnd = selectionStart;
            break;
        case 'image':
            if (imageUrl) {
                newText = `![${selectedText || 'alt text'}](${imageUrl})`;
                selectionStart = start + 2;
                selectionEnd = selectedText ? selectionStart + selectedText.length : start + 10;
            }
            break;
    }

    if (newText) {
        const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        setDescription(updatedValue);
        
        // Defer focusing and selecting to after the state update has rendered.
        setTimeout(() => {
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(selectionStart, selectionEnd);
            }
        }, 0);
    }
};

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is a base64 Data URL, which works in markdown for images
        insertMarkdown('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleTierChange = (index: number, field: keyof CommissionTier, value: string) => {
    const newTiers = [...commissionTiers];
    const numValue = parseFloat(value);
    newTiers[index] = { ...newTiers[index], [field]: isNaN(numValue) ? '' : numValue };
    setCommissionTiers(newTiers);
  };

  const addTier = () => {
    setCommissionTiers([...commissionTiers, { threshold: 10, rate: 25 }]);
  };

  const removeTier = (index: number) => {
    if (commissionTiers.length > 1) {
      setCommissionTiers(commissionTiers.filter((_, i) => i !== index));
    }
  };
  
  const handleBonusChange = (index: number, field: keyof PerformanceBonus, value: string) => {
    const newBonuses = [...bonuses];
    const parsedValue = field === 'type' ? value : parseFloat(value);
    newBonuses[index] = { ...newBonuses[index], [field]: isNaN(parsedValue as number) ? '' : parsedValue };
    setBonuses(newBonuses);
  };
  
  const addBonus = () => {
    setBonuses([...bonuses, { goal: 50, reward: 100, type: 'sales' }]);
  };

  const removeBonus = (index: number) => {
      setBonuses(bonuses.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !salesPageUrl || commissionTiers.length === 0) {
      setError('Product name, price, URL, and at least one commission tier are required.');
      return;
    }
    
    setError('');
    
    const productData = {
        user_id: currentUser.id,
        name,
        price: parseFloat(price),
        sales_page_url: salesPageUrl,
        commission_tiers: canUseAdvancedFeatures ? commissionTiers : [commissionTiers[0]],
        bonuses: canUseAdvancedFeatures ? bonuses : [],
        isPubliclyListed: canUseAdvancedFeatures ? isPubliclyListed : false,
        description: description,
    };
    
    onSave(productData, productToEdit?.id);
    onClose();
  };
  
  const MarkdownToolbar: React.FC = () => (
    <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 rounded-t-md">
        <button type="button" onClick={() => insertMarkdown('bold')} title="Bold" className="px-2 py-1 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded">B</button>
        <button type="button" onClick={() => insertMarkdown('italic')} title="Italic" className="px-2 py-1 italic hover:bg-gray-200 dark:hover:bg-gray-700 rounded">I</button>
        <button type="button" onClick={() => insertMarkdown('list')} title="Bullet List" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} title="Insert Image" className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </button>
    </div>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required min="0.01" step="0.01" />
                </div>
                <div>
                    <label htmlFor="salesPageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sales Page URL</label>
                    <input type="url" id="salesPageUrl" value={salesPageUrl} onChange={e => setSalesPageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required placeholder="https://..." />
                </div>
            </div>

             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Description</label>
                 <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md">
                    <MarkdownToolbar />
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <textarea
                        id="description"
                        ref={descriptionRef}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={8}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border-none rounded-b-md shadow-sm focus:outline-none focus:ring-0"
                        placeholder="Describe your product for your affiliates. You can use Markdown for formatting."
                    />
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will be shown to affiliates on the marketplace and in their portal.</p>
            </div>
            
            {/* Commission Tiers */}
            <div className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <h3 className="font-semibold text-gray-800 dark:text-white">Commission Tiers</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Set different rates that apply after an affiliate reaches a sales threshold.</p>
                 <div className="grid grid-cols-2 gap-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>After X Sales</span>
                  <span>Rate (%)</span>
                </div>
                {commissionTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input type="number" value={tier.threshold} onChange={e => handleTierChange(index, 'threshold', e.target.value)} disabled={index === 0} className="w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100 dark:disabled:bg-gray-600" placeholder="Sales Threshold"/>
                        <input type="number" value={tier.rate} onChange={e => handleTierChange(index, 'rate', e.target.value)} className="w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="Rate (%)"/>
                        {index > 0 && canUseAdvancedFeatures ? (
                            <button type="button" onClick={() => removeTier(index)} className="text-red-500 hover:text-red-700 font-bold p-1 text-xl">&times;</button>
                        ) : <div className="w-8"></div>}
                    </div>
                ))}
                {canUseAdvancedFeatures ? (
                    <button type="button" onClick={addTier} className="text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline pt-2">+ Add Tier</button>
                ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        Tiered commissions are available on the Growth plan. <a href="#" className="text-cyan-500 hover:underline font-medium">Upgrade</a>
                    </p>
                )}
            </div>
            
             {/* Performance Bonuses */}
            {canUseAdvancedFeatures ? (
                <div className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Performance Bonuses</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reward affiliates with a fixed amount for hitting a specific goal.</p>
                    <div className="grid grid-cols-3 gap-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Goal</span>
                        <span>Reward ($)</span>
                        <span>Type</span>
                    </div>
                    {bonuses.map((bonus, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="number" value={bonus.goal} onChange={e => handleBonusChange(index, 'goal', e.target.value)} className="w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 50"/>
                            <input type="number" value={bonus.reward} onChange={e => handleBonusChange(index, 'reward', e.target.value)} className="w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 100"/>
                            <select value={bonus.type} onChange={e => handleBonusChange(index, 'type', e.target.value)} className="w-full block px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                                <option value="sales">Sales</option>
                                <option value="clicks">Clicks</option>
                            </select>
                            <button type="button" onClick={() => removeBonus(index)} className="text-red-500 hover:text-red-700 font-bold p-1 text-xl">&times;</button>
                        </div>
                    ))}
                    <button type="button" onClick={addBonus} className="text-sm font-medium text-cyan-600 dark:text-cyan-500 hover:underline pt-2">+ Add Bonus</button>
                </div>
            ) : null}

            {/* Marketplace Listing */}
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <Toggle 
                    label="List on Marketplace"
                    enabled={isPubliclyListed}
                    onToggle={setIsPubliclyListed}
                    disabled={!canUseAdvancedFeatures}
                    disabledText="Available on the Growth plan and up."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable this to allow any PartnerFlow affiliate to discover your product and apply to promote it.
                </p>
                 {!canUseAdvancedFeatures && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        The Affiliate Marketplace is available on the Growth plan. <a href="#" className="text-cyan-500 hover:underline font-medium">Upgrade</a>
                    </p>
                )}
            </div>


            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">{isEditMode ? 'Save Changes' : 'Add Product'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;