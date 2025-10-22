
import React, { useState } from 'react';

interface InviteAffiliateModalProps {
  onClose: () => void;
  onSend: (email: string) => void;
}

const InviteAffiliateModal: React.FC<InviteAffiliateModalProps> = ({ onClose, onSend }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onSend(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Invite New Affiliate
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Enter the email address of the affiliate you'd like to invite to your program.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              id="invite-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              required
              placeholder="name@example.com"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteAffiliateModal;