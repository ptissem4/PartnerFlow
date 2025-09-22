import React, { useState, useEffect } from 'react';
import { User } from '../data/mockData';

interface AddAffiliateModalProps {
  onClose: () => void;
  onSave: (user: User) => void;
  affiliateToEdit: User | null;
}

const AddAffiliateModal: React.FC<AddAffiliateModalProps> = ({ onClose, onSave, affiliateToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');

  const isEditMode = !!affiliateToEdit;

  useEffect(() => {
    if (isEditMode) {
      setName(affiliateToEdit.name);
      setEmail(affiliateToEdit.email);
      setCouponCode(affiliateToEdit.couponCode || '');
    }
  }, [affiliateToEdit, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Both name and email are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
    }
    
    setError('');

    const userData: User = {
        ...affiliateToEdit, // a null or existing object
        id: affiliateToEdit ? affiliateToEdit.id : crypto.randomUUID(), // temp ID for new users, real one from DB
        roles: ['affiliate'],
        status: affiliateToEdit?.status || 'Active',
        name,
        email,
        couponCode: couponCode.trim() || undefined,
        // The backend will fill in other details like avatar, joinDate etc. for new users
    } as User;
    
    onSave(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {isEditMode ? 'Edit Affiliate' : 'Add New Affiliate'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code (Optional)</label>
            <input
              type="text"
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., PARTNER10"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assign a unique coupon code for tracking sales without a link.</p>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-3 pt-2">
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
              {isEditMode ? 'Save Changes' : 'Add Affiliate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAffiliateModal;