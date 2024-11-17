import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import CustomizableWidgets from '../components/customizableWidgets';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardHeader userName="John Doe" />
      <CustomizableWidgets />
    </div>
  );
};

export default Dashboard;
