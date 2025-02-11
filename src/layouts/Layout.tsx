import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumbs';
import { ToastContainer } from 'react-toastify';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`grid-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      {/* isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex flex-col flex-grow overflow-y-auto bg-gray-100 p-6 main-content">
        {/* Breadcrumb */}
        <Breadcrumb />
        {/* Page Content */}
        {children}
      </main>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Layout;
