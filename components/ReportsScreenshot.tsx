import React from 'react';

const ReportRow: React.FC<{ name: string, clicks: string, sales: string, conversion: string, commission: string }> = ({ name, clicks, sales, conversion, commission }) => (
    <tr className="border-b border-gray-700">
        <td className="px-4 py-3 font-semibold text-white text-sm">{name}</td>
        <td className="px-4 py-3 text-sm text-gray-300">{clicks}</td>
        <td className="px-4 py-3 text-sm text-gray-300">{sales}</td>
        <td className="px-4 py-3 text-sm text-gray-300">{conversion}%</td>
        <td className="px-4 py-3 text-sm font-semibold text-white">{commission}</td>
    </tr>
);

const ReportsScreenshot = () => (
    <div className="aspect-[1.6/1] w-full bg-gray-900 p-6 font-sans text-gray-200 overflow-hidden">
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Reports</h2>
                <div className="flex items-center bg-gray-800 border border-gray-700 rounded-full p-1 text-xs font-medium">
                    <button className="px-3 py-1 rounded-full bg-gray-700 shadow text-cyan-400">Last 30 Days</button>
                    <button className="px-3 py-1 text-gray-400">This Quarter</button>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Performance by Affiliate</h3>
                    <button className="px-3 py-1 bg-teal-500 text-white font-semibold rounded-md text-xs shadow-[0_0_10px_theme(colors.teal.500/0.5)]">Export to CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2">Affiliate Name</th>
                                <th className="px-4 py-2">Clicks</th>
                                <th className="px-4 py-2">Sales</th>
                                <th className="px-4 py-2">Conv. Rate</th>
                                <th className="px-4 py-2">Commission Earned</th>
                            </tr>
                        </thead>
                        <tbody>
                           <ReportRow name="Elena Rodriguez" clicks="550" sales="25" conversion="4.50" commission="$2,497.50" />
                           <ReportRow name="Mark Brown" clicks="280" sales="12" conversion="4.20" commission="$1,198.80" />
                           <ReportRow name="Jenna Smith" clicks="55" sales="2" conversion="3.60" commission="$159.20" />
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Performance by Product</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2">Product Name</th>
                                <th className="px-4 py-2">Clicks</th>
                                <th className="px-4 py-2">Sales</th>
                                <th className="px-4 py-2">Conv. Rate</th>
                                <th className="px-4 py-2">Commission Generated</th>
                            </tr>
                        </thead>
                         <tbody>
                           <ReportRow name="Ultimate Productivity Course" clicks="450" sales="20" conversion="4.44" commission="$2,245.50" />
                           <ReportRow name="Beginner's Guide to Investing" clicks="120" sales="5" conversion="4.17" commission="$398.00" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

export default ReportsScreenshot;