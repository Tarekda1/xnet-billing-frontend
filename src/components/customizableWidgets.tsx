import React, { useState, useEffect } from 'react';

interface WidgetToggle {
  [key: string]: boolean;
}

const widgetDefaults: WidgetToggle = {
  charts: true,
  activities: true,
  logs: true,
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
          <div className="h-32 bg-green-100">[Activities Placeholder]</div>
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
          <div className="h-32 bg-yellow-100">[Logs Placeholder]</div>
        </div>
      )}
    </div>
  );
};

export default CustomizableWidgets;
