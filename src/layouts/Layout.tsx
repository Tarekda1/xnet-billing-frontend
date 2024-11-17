import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumbs';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-grow">
        {/* Navbar */}
        <Navbar />
        {/* Scrollable Main Content */}
        <main className="flex-grow overflow-y-auto p-6 bg-gray-100">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
