import React from 'react';

const ProductRow: React.FC<{ name: string, price: number, sales: number, clicks: number, commission: string }> = ({ name, price, sales, clicks, commission }) => (
    <tr className="border-b border-gray-700">
        <td className="px-4 py-3 font-semibold text-white text-sm">{name}</td>
        <td className="px-4 py-3 text-sm text-gray-300">${price}</td>
        <td className="px-4 py-3 text-sm text-gray-300">{sales}</td>
        <td className="px-4 py-3 text-sm text-gray-300">{clicks}</td>
        <td className="px-4 py-3 text-sm font-medium text-cyan-400">{commission}</td>
        <td className="px-4 py-3 text-center">
             <span className="font-medium text-cyan-400 text-xs">Details</span>
        </td>
    </tr>
);

const ProductsScreenshot = () => (
    <div className="aspect-[1.6/1] w-full bg-gray-900 p-6 font-sans text-gray-200 overflow-hidden">
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Your Products</h3>
                <button className="px-3 py-1.5 bg-cyan-500 text-white font-semibold rounded-md text-sm shadow-[0_0_10px_theme(colors.cyan.500/0.5)]">Add New Product</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-2">Product Name</th>
                            <th className="px-4 py-2">Price</th>
                            <th className="px-4 py-2">Sales</th>
                            <th className="px-4 py-2">Clicks</th>
                            <th className="px-4 py-2">Commission</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <ProductRow name="Ultimate Productivity Course" price={499} sales={20} clicks={450} commission="20% (+ Tiers)" />
                        <ProductRow name="Social Media Mastery" price={299} sales={3} clicks={80} commission="30%" />
                        <ProductRow name="Beginner's Guide to Investing" price={199} sales={5} clicks={120} commission="40%" />
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default ProductsScreenshot;
