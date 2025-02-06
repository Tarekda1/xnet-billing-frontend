import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaFileInvoice,
  FaCogs,
  FaUsers,
  FaChartLine,
  FaCreditCard,
  FaLifeRing,
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState !== null ? JSON.parse(savedState) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth < 768 && isMobileMenuOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed md:relative h-screen bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileMenuOpen ? 'left-0 shadow-2xl' : '-left-full md:left-0'
        } flex flex-col z-40`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center p-4">
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              if (window.innerWidth < 768) setIsMobileMenuOpen(false);
            }}
            className={`text-gray-300 hover:text-white focus:outline-none transition-transform duration-300 ${
              isCollapsed ? '' : 'rotate-180'
            }`}
            aria-label="Toggle Sidebar"
          >
            <FaBars size={20} />
          </button>
          <span
            className={`ml-3 text-lg font-semibold whitespace-nowrap transition-opacity duration-300 ${
              isCollapsed
                ? 'opacity-0 pointer-events-none w-0'
                : 'opacity-100 w-auto'
            }`}
          >
            Xnet Billing
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow">
          {[
            { to: '/', label: 'Dashboard', icon: FaTachometerAlt },
            { to: '/monthly-invoice', label: 'Invoices', icon: FaFileInvoice },
            { to: '/clients', label: 'Payments', icon: FaUsers },
            { to: '/reports', label: 'Reports', icon: FaChartLine },
            { to: '/payments', label: 'Payments', icon: FaCreditCard },
            { to: '/settings', label: 'Settings', icon: FaCogs },
            { to: '/support', label: 'Help/Support', icon: FaLifeRing },
          ].map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 space-x-3 ${
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-600'
                }`
              }
              onClick={() =>
                window.innerWidth < 768 && setIsMobileMenuOpen(false)
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isCollapsed
                    ? 'w-0 overflow-hidden opacity-0'
                    : 'w-auto opacity-100'
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto">
          {!isCollapsed && (
            <p className="text-sm text-gray-400">
              © 2024 MyApp. All rights reserved.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
