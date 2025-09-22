

import React, { useState, useEffect } from 'react';
import { User, Product } from '../data/mockData';

interface RecordSaleModalProps {
  onClose: () => void;
  onRecordSaleByLink: (affiliateId: string, productId: string, saleAmount: number) => void;
  onRecordSaleByCoupon: (couponCode: string, productId: string, saleAmount: number) => void;
  affiliates: User[];
  products: Product[];
}

const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ onClose, onRecordSaleByLink, onRecordSaleByCoupon, affiliates, products }) => {
  const [trackingMethod, setTrackingMethod] = useState<'link' | 'coupon'>('link');
  const [affiliateId, setAffiliateId] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [saleAmount, setSaleAmount] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (affiliates.length > 0) setAffiliateId(affiliates[0].id.toString());
    if (products.length > 0) {
        setProductId(products[0].id.toString());
        setSaleAmount(products[0].price.toString());
    }
  }, [affiliates, products]);
  
  const handleProductChange = (selectedProductId: string) => {
    setProductId(selectedProductId);
    const product = products.find(p => p.id.toString() === selectedProductId);
    if(product) {
        setSaleAmount(product.price.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (trackingMethod === 'link') {
        if (!affiliateId || !productId || !saleAmount || parseFloat(saleAmount) <= 0) {
          setError('Affiliate, product, and a positive sale amount are required.');
          return;
        }
        onRecordSaleByLink(affiliateId, productId, parseFloat(saleAmount));
    } else { // Coupon
        if (!couponCode || !productId || !saleAmount || parseFloat(saleAmount) <= 0) {
           setError('Coupon code, product, and a positive sale amount are required.');
           return;
        }
        onRecordSaleByCoupon(couponCode, productId, parseFloat(saleAmount));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Simulate Incoming Sale
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">This simulates a sale tracked on an external site.</p>
        
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-sm font-medium mb-4">
            <button
                onClick={() => setTrackingMethod('link')}
                className={`w-1/2 px-3 py-1 rounded-full transition-colors ${trackingMethod === 'link' ? 'bg-white dark:bg-gray-800 shadow text-cyan-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
                By Affiliate Link
            </button>
            <button
                onClick={() => setTrackingMethod('coupon')}
                className={`w-1/2 px-3 py-1 rounded-full transition-colors ${trackingMethod === 'coupon' ? 'bg-white dark:bg-gray-800 shadow text-cyan-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
                By Coupon Code
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {trackingMethod === 'link' ? (
                <div>
                    <label htmlFor="sale-affiliate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Affiliate</label>
                    <select id="sale-affiliate" value={affiliateId} onChange={e => setAffiliateId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                        {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
            ) : (
                <div>
                    <label htmlFor="sale-coupon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
                    <input type="text" id="sale-coupon" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., PARTNER10"/>
                </div>
            )}
            <div>
                <label htmlFor="sale-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                <select id="sale-product" value={productId} onChange={e => handleProductChange(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="sale-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Amount ($)</label>
                <input type="number" id="sale-amount" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required min="0.01" step="0.01"/>
            </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
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
              Record Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordSaleModal;