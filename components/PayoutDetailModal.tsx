import React from 'react';
import { Payout, Sale } from '../data/mockData';

interface PayoutDetailModalProps {
  payout: Payout;
  onClose: () => void;
}

const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
        case 'Cleared': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'Refunded': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
}

const PayoutDetailModal: React.FC<PayoutDetailModalProps> = ({ payout, onClose }) => {
    
  const handlePrint = () => {
    window.print();
  };

  const payableAmount = payout.sales.reduce((acc, sale) => {
    return sale.status === 'Cleared' ? acc + sale.commissionAmount : acc;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 no-print">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Payout Details</h2>
        </div>
        <div className="p-6 overflow-y-auto printable-area">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Invoice to {payout.affiliateName}</h3>
              <p className="text-gray-500 dark:text-gray-400">For commission period: {payout.period}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount Payable</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">${payableAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className={`font-semibold ${payout.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                Status: {payout.status}
              </p>
            </div>
          </div>
          
          {/* Sales Breakdown */}
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Sales Breakdown</h4>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {payout.sales.length > 0 ? (
                 <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Product</th>
                            <th className="px-4 py-2 text-right">Commission</th>
                            <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payout.sales.map(sale => (
                            <tr key={sale.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-2">{sale.date}</td>
                                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{sale.productName}</td>
                                <td className="px-4 py-2 text-right text-green-500 font-semibold">${sale.commissionAmount.toFixed(2)}</td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(sale.status)}`}>
                                        {sale.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            ) : (
                <p className="p-4 text-center text-gray-500 dark:text-gray-400">No detailed sales records for this payout period.</p>
            )}
          </div>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600"
          >
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutDetailModal;