import React, { useState, useEffect } from 'react';
import { FaChartBar, FaPlus, FaUser } from 'react-icons/fa';
import DashboardKeyMetrics from './xnet-components/DashboardKeyMetrics';
import DashboardTransactions from './xnet-components/DashboardTransactions';

interface WidgetToggle {
  [key: string]: boolean;
}

const widgetDefaults: WidgetToggle = {
  charts: true,
  activities: true,
  logs: true,
  quicklinks: true,
};

const CustomizableWidgets: React.FC = () => {
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetToggle>(() => {
    const savedState = localStorage.getItem('widgetVisibility');
    return savedState ? JSON.parse(savedState) : widgetDefaults;
  });

  // Save visibility state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('widgetVisibility', JSON.stringify(widgetVisibility));
  }, [widgetVisibility]);

  const closeWidget = (widget: string) => {
    setWidgetVisibility((prev) => ({
      ...prev,
      [widget]: false,
    }));
  };

  const restoreWidgets = () => {
    setWidgetVisibility(widgetDefaults); // Restore default state
  };

  return (
    <div className="space-y-6 transition-opacity duration-300 ease-in-out">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customizable Widgets</h2>
        <button
          onClick={restoreWidgets}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Restore All Widgets
        </button>
      </div>

      {/* Widgets */}
      {widgetVisibility.quicklinks && (
        <div className="relative p-4 bg-white rounded-lg shadow-md">
          <button
            onClick={() => closeWidget('quicklinks')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close Charts Widget"
          >
            ✖
          </button>
          <h3 className="text-lg font-semibold mb-4">Quick links</h3>
          {/* Quick Links */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow flex items-center space-x-4 cursor-pointer hover:bg-blue-200">
              <FaPlus className="text-3xl" />
              <span className="font-bold">Create New Invoice</span>
            </div>
            <div className="bg-green-100 text-green-700 p-4 rounded-lg shadow flex items-center space-x-4 cursor-pointer hover:bg-green-200">
              <FaUser className="text-3xl" />
              <span className="font-bold">View All Invoices</span>
            </div>
            <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg shadow flex items-center space-x-4 cursor-pointer hover:bg-yellow-200">
              <FaChartBar className="text-3xl" />
              <span className="font-bold">Generate Reports</span>
            </div>
          </div>
        </div>
      )}

      {widgetVisibility.activities && (
        <div className="relative p-4 bg-white rounded-lg shadow-md">
          <button
            onClick={() => closeWidget('activities')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close Activities Widget"
          >
            ✖
          </button>
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <DashboardKeyMetrics />
        </div>
      )}

      {/* Widgets */}
      {widgetVisibility.charts && (
        <div className="relative p-4 bg-white rounded-lg shadow-md">
          <button
            onClick={() => closeWidget('charts')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close Charts Widget"
          >
            ✖
          </button>
          <h3 className="text-lg font-semibold mb-4">Charts Section</h3>
          <div className="h-32 bg-blue-100">[Charts Placeholder]</div>
        </div>
      )}

      {widgetVisibility.logs && (
        <div className="relative p-4 bg-white rounded-lg shadow-md">
          <button
            onClick={() => closeWidget('logs')}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close Logs Widget"
          >
            ✖
          </button>
          <h3 className="text-lg font-semibold mb-4">Activity Logs</h3>
          <DashboardTransactions />
        </div>
      )}
    </div>
  );
};

export default CustomizableWidgets;
