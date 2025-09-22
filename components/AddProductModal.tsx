import React, { useState, useEffect } from 'react';
import { Product, CommissionTier, PerformanceBonus, User } from '../data/mockData';
import { Plan } from '../App';

interface AddProductModalProps {
  onClose: () => void;
  // FIX: Use Partial<Product> for more flexible updates
  onSave: (product: Partial<Product>, id?: number) => void;
  productToEdit: Product | null;
  currentPlan: Plan;
  currentUser: User;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSave, productToEdit, currentPlan, currentUser }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salesPageUrl, setSalesPageUrl] = useState('');
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([{ threshold: 0, rate: 20 }]);
  const [bonuses, setBonuses] = useState<PerformanceBonus[]>([]);
  const [error, setError] = useState('');

  const isEditMode = !!productToEdit;
  const canUseAdvancedFeatures = currentPlan.features.hasTieredCommissions;

  useEffect(() => {
    if (isEditMode) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setSalesPageUrl(productToEdit.sales_page_url);
        setCommissionTiers(productToEdit.commission_tiers.length > 0 ? productToEdit.commission_tiers : [{ threshold: 0, rate: 20 }]);
        setBonuses(productToEdit.bonuses || []);
    }
  }, [productToEdit, isEditMode]);

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
    };
    
    onSave(productData, productToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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