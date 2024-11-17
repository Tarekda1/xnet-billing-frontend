// src/components/DashboardHeader.tsx
import React, { useState } from 'react';

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative p-6 bg-blue-500 text-white rounded-lg shadow-md">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-white hover:text-gray-300"
        aria-label="Close Header"
      >
        ✖
      </button>
      <h1 className="text-2xl">Welcome back! {userName}!</h1>
      <p className="text-sm mt-1">
        Here’s a quick overview of your invoices and customers.
      </p>
    </div>
  );
};

export default DashboardHeader;
