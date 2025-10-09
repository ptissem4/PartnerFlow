
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
  const Arrow = isIncrease ? '↑' : '↓';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      {change && changeType && (
        <p className={`text-sm font-semibold mt-2 ${changeColor}`}>
            {Arrow} {change} vs last month
        </p>
      )}
    </div>
  );
};

export default StatCard;