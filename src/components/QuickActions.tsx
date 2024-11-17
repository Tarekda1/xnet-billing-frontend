// src/components/QuickActions.tsx
import React from 'react';

const QuickActions: React.FC = () => (
  <div className="grid grid-cols-3 gap-4 mt-6">
    <button className="bg-blue-500 text-white py-2 px-4 rounded shadow hover:bg-blue-600">
      Create Invoice
    </button>
    <button className="bg-green-500 text-white py-2 px-4 rounded shadow hover:bg-green-600">
      Add Customer
    </button>
    <button className="bg-gray-500 text-white py-2 px-4 rounded shadow hover:bg-gray-600">
      View Reports
    </button>
  </div>
);

export default QuickActions;
