import React from 'react';

type DateRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

interface DateRangeFilterProps {
    dateRange: DateRangePreset;
    setDateRange: (value: DateRangePreset) => void;
    customStartDate: string;
    setCustomStartDate: (value: string) => void;
    customEndDate: string;
    setCustomEndDate: (value: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
}) => {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangePreset)}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="custom">Custom Range</option>
            </select>
            {dateRange === 'custom' && (
                <>
                   <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
                   <span className="text-gray-500 dark:text-gray-400">to</span>
                   <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
                </>
            )}
        </div>
    );
};

export default DateRangeFilter;
