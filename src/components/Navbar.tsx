import React from 'react';
import DarkModeToggle from './DarkModeToggle';
import NotificationButton from './NotificationButton';

const Navbar: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center fixed w-full z-30 transition-margin duration-300">
      {/* Left side with adjusted spacing for mobile toggle */}
      <div className="flex items-center pl-16 md:pl-4">
        {' '}
        {/* Add padding to avoid overlapping */}
        <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
          Dashboard
        </h1>
        <span className="md:hidden text-gray-800 dark:text-white">
          Xnet Billing
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center justify-between gap-4 md:gap-2 w-[8rem]  md:w-[6rem]">
        <NotificationButton className="w-8 h-8 md:w-[2rem] md:h-10" />
        <DarkModeToggle className="w-[2rem] h-8 md:w-[2rem] md:h-10" />
        <div className="h-8 w-8 md:h-10 md:w-[2.5rem] rounded-full bg-gray-300 dark:bg-gray-600 relative">
          {/* Profile image placeholder */}
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
            JD
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
