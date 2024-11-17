// src/components/NotificationBanner.tsx
import React from 'react';

const NotificationBanner: React.FC = () => (
  <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mt-6">
    ⚠️ You have 5 overdue invoices! Take action now to avoid late fees.
  </div>
);

export default NotificationBanner;
