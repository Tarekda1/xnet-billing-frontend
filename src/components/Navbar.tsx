import { useEffect, useRef, useState } from 'react';
import NotificationButton from './NotificationButton';
import DarkModeToggle from './DarkModeToggle';
import { CSSTransition } from 'react-transition-group';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        parentRef.current &&
        !parentRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
      {/* Left Side */}
      <div className="flex items-center pl-2 sm:pl-4 md:pl-8 lg:pl-16">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white hidden sm:block truncate">
          Dashboard
        </h1>
        <span className="sm:hidden text-gray-800 dark:text-white text-sm sm:text-base truncate">
          Xnet Billing
        </span>
      </div>

      {/* Right Side Controls */}
      <div className="relative">
        {/* Hamburger Icon for Mobile */}
        <button
          className="sm:hidden w-8 h-8 bg-gray-300 rounded-full"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Dropdown Menu */}
        {/* Dropdown Menu */}
        {isMenuOpen && (
          <CSSTransition
            in={isMenuOpen}
            timeout={300}
            classNames="dropdown"
            unmountOnExit
          >
            <div
              ref={parentRef}
              className="absolute top-full right-4 mt-2 bg-[#c1c1c1] dark:bg-gray-800 shadow-md rounded-md p-2 sm:p-3"
              style={{ minWidth: '50px' }} // Ensure a consistent width
            >
              {/* Notification Button */}
              <NotificationButton
                className="w-6 h-6 sm:w-8 sm:h-8 mb-5 sm:mb-[1rem]" // Smaller size on mobile
              />

              {/* Dark Mode Toggle */}
              <DarkModeToggle
                className="w-10 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" // Smaller size on mobile
              />

              {/* Profile Image Placeholder */}
              <div className="w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 relative overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">
                  JD
                </span>
              </div>
            </div>
          </CSSTransition>
        )}

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          <NotificationButton className="w-8 h-8 sm:w-10 sm:h-10" />
          <DarkModeToggle className="w-8 h-8 sm:w-10 sm:h-10" />
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-600 relative overflow-hidden">
            <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-300">
              JD
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
