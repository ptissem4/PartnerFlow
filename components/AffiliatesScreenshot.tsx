import React from 'react';

const AffiliateRow: React.FC<{ name: string, email: string, sales: number, commission: number, status: 'Active' | 'Pending' | 'Inactive' }> = ({ name, email, sales, commission, status }) => {
    const statusClass = {
        Active: 'bg-green-900/50 text-green-300 ring-1 ring-inset ring-green-500/20',
        Pending: 'bg-yellow-900/50 text-yellow-300 ring-1 ring-inset ring-yellow-500/20',
        Inactive: 'bg-red-900/50 text-red-300 ring-1 ring-inset ring-red-500/20',
    }[status];

    return (
        <tr className="border-b border-gray-700">
            <td className="px-4 py-3">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
                    <div>
                        <div className="text-sm font-semibold text-white">{name}</div>
                        <div className="text-xs text-gray-400">{email}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-300">{sales}</td>
            <td className="px-4 py-3 text-sm font-semibold text-white">${commission.toLocaleString()}</td>
            <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>{status}</span></td>
            <td className="px-4 py-3 text-center">
                <span className="font-medium text-cyan-400 text-xs">Details</span>
            </td>
        </tr>
    );
};

const AffiliatesScreenshot = () => (
    <div className="aspect-[1.6/1] w-full bg-gray-900 p-6 font-sans text-gray-200 overflow-hidden">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Manage Affiliates</h3>
                <button className="px-3 py-1.5 bg-cyan-500 text-white font-semibold rounded-md text-sm shadow-[0_0_10px_theme(colors.cyan.500/0.5)]">Add Affiliate</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-2">Affiliate</th>
                            <th className="px-4 py-2">Sales</th>
                            <th className="px-4 py-2">Commission</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AffiliateRow name="Elena Rodriguez" email="elena.r@..." sales={25} commission={2497} status="Active" />
                        <AffiliateRow name="Mark Brown" email="mark.b@..." sales={12} commission={1198} status="Active" />
                        <AffiliateRow name="Sara Khan" email="sara.k@..." sales={1} commission={79} status="Pending" />
                        <AffiliateRow name="James Dean" email="james.d@..." sales={0} commission={0} status="Inactive" />
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default AffiliatesScreenshot;