import React from 'react';
import DarkModeToggle from './DarkModeToggle';
import NotificationButton from './NotificationButton';

const Navbar: React.FC = () => {
  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <NotificationButton />
        <DarkModeToggle />
        <div className="h-8 w-8 rounded-full bg-gray-300"></div>{' '}
        {/* Placeholder for profile image */}
      </div>
    </div>
  );
};

export default Navbar;
