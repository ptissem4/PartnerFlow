import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

interface ChartProps {
  data: { name: string; sales: number }[];
}

const SalesPerformanceChart: React.FC<ChartProps> = ({ data }) => {
  // Use a CSS variable to get the current text color for the chart labels
  const isDarkMode = document.documentElement.classList.contains('dark');
  const tickColor = isDarkMode ? '#9ca3af' : '#6b7280'; // gray-400 or gray-500

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis dataKey="name" stroke={tickColor} fontSize={12} />
        <YAxis 
            stroke={tickColor} 
            fontSize={12}
            tickFormatter={(value) => typeof value === 'number' ? `$${(value / 1000)}k` : ''}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
          itemStyle={{ fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#22d3ee" // cyan-400
          strokeWidth={2}
          dot={{ r: 4, fill: '#06b6d4' }} // cyan-500
          activeDot={{ r: 8, stroke: '#67e8f9' }} // cyan-300
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesPerformanceChart;
