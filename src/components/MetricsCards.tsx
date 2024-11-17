// src/components/MetricsCards.tsx
import React from 'react';

const metrics = [
  { title: 'Total Invoices', value: 120, icon: '📄', bgColor: 'bg-blue-100' },
  {
    title: 'Pending Payments',
    value: 15,
    icon: '⏳',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
  },
  {
    title: 'Revenue',
    value: '$15,000',
    icon: '💰',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  {
    title: 'Overdue Invoices',
    value: 5,
    icon: '❗',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
];

const MetricsCards: React.FC = () => (
  <div className="grid grid-cols-4 gap-4 mt-6">
    {metrics.map((metric, index) => (
      <div
        key={index}
        className={`p-6 rounded-lg shadow-md flex items-center justify-between ${metric.bgColor}`}
      >
        <div>
          <h3 className="text-sm font-medium">{metric.title}</h3>
          <p className={`text-2xl font-bold ${metric.textColor || ''}`}>
            {metric.value}
          </p>
        </div>
        <div className="text-4xl">{metric.icon}</div>
      </div>
    ))}
  </div>
);

export default MetricsCards;
