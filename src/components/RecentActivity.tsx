// src/components/RecentActivity.tsx
import React from 'react';

const RecentActivity: React.FC = () => {
  const activities = [
    { id: 1, customer: 'John Doe', status: 'Paid', amount: '$120' },
    { id: 2, customer: 'Jane Smith', status: 'Pending', amount: '$240' },
    { id: 3, customer: 'Alice Johnson', status: 'Overdue', amount: '$350' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Customer</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Amount</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td className="py-2 px-4 border-b">{activity.customer}</td>
              <td className="py-2 px-4 border-b">{activity.status}</td>
              <td className="py-2 px-4 border-b">{activity.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivity;
