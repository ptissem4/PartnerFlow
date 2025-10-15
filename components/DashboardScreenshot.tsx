import React from 'react';

const SidebarIcon = ({ path }: { path: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const DashboardScreenshot = () => (
    <div className="aspect-[1.6/1] w-full bg-gray-100 font-sans text-gray-800 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 bg-white p-4 border-r border-gray-200 flex flex-col">
            <div className="flex items-center mb-10">
                <div className="p-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold ml-2">PartnerFlow</h1>
            </div>
            <nav className="space-y-2">
                <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg bg-cyan-500 text-white shadow">
                    <SidebarIcon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    <span className="ml-3">Dashboard</span>
                </button>
                 <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">
                    <SidebarIcon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    <span className="ml-3">Affiliates</span>
                </button>
                 <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">
                    <SidebarIcon path="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11m0-11h11" />
                    <span className="ml-3">Products</span>
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">
                    <SidebarIcon path="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    <span className="ml-3">Resources</span>
                </button>
                 <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">
                    <SidebarIcon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    <span className="ml-3">Payouts</span>
                </button>
                 <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">
                    <SidebarIcon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    <span className="ml-3">Reports</span>
                </button>
                 <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-100">
                    <SidebarIcon path="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    <span className="ml-3">Communicate</span>
                </button>
            </nav>
        </div>

        {/* Main Content */}
        <div className="w-3/4 flex flex-col relative">
            {/* Header */}
            <header className="flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between p-3.5">
                <h2 className="text-xl font-bold">Dashboard</h2>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-gray-200 rounded-full p-0.5 text-xs font-medium">
                        <button className="px-2.5 py-0.5 rounded-full bg-white shadow text-cyan-500">Creator</button>
                        <button className="px-2.5 py-0.5 text-gray-500">Affiliate</button>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span className="text-sm font-medium text-gray-500">Logout</span>
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">Last 30 Days ▼</div>
                        <button className="px-3 py-1.5 bg-teal-500 text-white font-semibold rounded-lg text-sm">Record Manual Sale</button>
                        <button className="px-3 py-1.5 bg-indigo-500 text-white font-semibold rounded-lg text-sm">Simulate Purchase</button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200"><h4 className="text-xs font-medium text-gray-500 mb-1">Payable Commissions</h4><p className="text-2xl font-bold">$0</p></div>
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200"><h4 className="text-xs font-medium text-gray-500 mb-1">Pending Commissions</h4><p className="text-2xl font-bold">$294</p></div>
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200"><h4 className="text-xs font-medium text-gray-500 mb-1">Total Link Clicks</h4><p className="text-2xl font-bold">862</p></div>
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200"><h4 className="text-xs font-medium text-gray-500 mb-1">Active Affiliates</h4><p className="text-2xl font-bold">3</p></div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="col-span-2 bg-white p-4 rounded-lg shadow border border-gray-200">
                        <h3 className="text-md font-semibold mb-2">Affiliate Sales Performance (12 Months)</h3>
                        <div className="h-56 relative">
                             <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                                <g transform="translate(40,10)">
                                    <line x1="0" y1="0" x2="0" y2="170" stroke="#e5e7eb" strokeWidth="1"></line>
                                    <line x1="0" y1="170" x2="450" y2="170" stroke="#e5e7eb" strokeWidth="1"></line>
                                    <line x1="0" y1="127.5" x2="450" y2="127.5" stroke="#f3f4f6" strokeDasharray="3 3" strokeWidth="1"></line>
                                    <line x1="0" y1="85" x2="450" y2="85" stroke="#f3f4f6" strokeDasharray="3 3" strokeWidth="1"></line>
                                    <line x1="0" y1="42.5" x2="450" y2="42.5" stroke="#f3f4f6" strokeDasharray="3 3" strokeWidth="1"></line>
                                    <text x="-8" y="170" textAnchor="end" fontSize="10" fill="#6b7280">$0k</text>
                                    <text x="-8" y="127.5" textAnchor="end" fontSize="10" fill="#6b7280">$0.35k</text>
                                    <text x="-8" y="85" textAnchor="end" fontSize="10" fill="#6b7280">$0.7k</text>
                                    <text x="-8" y="42.5" textAnchor="end" fontSize="10" fill="#6b7280">$1.05k</text>
                                    <text x="-8" y="0" textAnchor="end" fontSize="10" fill="#6b7280">$1.4k</text>
                                    
                                    <path d="M0,170 C100,170 180,170 245,168 C300,165 315,130 345,90 C375,50 400,20 427,15 C440,12 450,45 460,70" stroke="#22d3ee" strokeWidth="2" fill="none"></path>
                                    <circle cx="245" cy="168" r="3" fill="#22d3ee" />
                                    <circle cx="345" cy="90" r="3" fill="#22d3ee" />
                                    <circle cx="427" cy="15" r="3" fill="#22d3ee" />
                                    <circle cx="460" cy="70" r="3" fill="#22d3ee" />

                                    <text x="0" y="185" textAnchor="middle" fontSize="9" fill="#6b7280">Dec '24</text>
                                    <text x="75" y="185" textAnchor="middle" fontSize="9" fill="#6b7280">Feb '25</text>
                                    <text x="150" y="185" textAnchor="middle" fontSize="9" fill="#6b7280">Apr '25</text>
                                    <text x="225" y="185" textAnchor="middle" fontSize="9" fill="#6b7280">Jun '25</text>
                                    <text x="300" y="185" textAnchor="middle" fontSize="9" fill="#6b7280">Aug '25</text>
                                    <text x="375" y="185" textAnchor="middle" fontSize="9" fill="#6b7280">Oct '25</text>
                                </g>
                            </svg>
                        </div>
                    </div>

                    {/* Side Lists */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h3 className="text-md font-semibold mb-2">Top Affiliates</h3>
                            <ul className="space-y-3 text-xs">
                                <li className="flex items-center justify-between gap-2">
                                    <div className="flex items-center min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex-shrink-0"></div>
                                        <div className="truncate">
                                            <p className="font-medium truncate">Elena Rodriguez</p>
                                            <p className="text-gray-500 truncate">elena.r@example.com</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-cyan-500 flex-shrink-0">$2,497.5</span>
                                </li>
                                <li className="flex items-center justify-between gap-2">
                                    <div className="flex items-center min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex-shrink-0"></div>
                                        <div className="truncate">
                                            <p className="font-medium truncate">Mark Brown</p>
                                            <p className="text-gray-500 truncate">mark.b@example.com</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-cyan-500 flex-shrink-0">$1,198.8</span>
                                </li>
                                <li className="flex items-center justify-between gap-2">
                                    <div className="flex items-center min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex-shrink-0"></div>
                                        <div className="truncate">
                                            <p className="font-medium truncate">Sara Khan</p>
                                            <p className="text-gray-500 truncate">sara.k@example.com</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-cyan-500 flex-shrink-0">$79.6</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h3 className="text-md font-semibold mb-2">Top Products</h3>
                            <ul className="space-y-3 text-xs">
                                <li className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 truncate">
                                        <p className="font-medium truncate">Ultimate Productivity Course</p>
                                        <p className="text-gray-500">$499</p>
                                    </div>
                                    <span className="font-semibold bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">20 sales</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-cyan-400 rounded-full shadow-lg flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0m-8.486-2.828l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>
    </div>
);

export default DashboardScreenshot;