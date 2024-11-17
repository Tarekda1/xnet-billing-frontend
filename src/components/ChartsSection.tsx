import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { lineChartOptions } from '../config/chartOptions';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const ChartsSection: React.FC = () => {
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200, 1500, 1800, 2400, 3000, 4000],
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const pieChartData = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [70, 20, 10],
        backgroundColor: ['#4caf50', '#ffeb3b', '#f44336'],
      },
    ],
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {/* Line Chart */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
        <div className="h-64">
          {' '}
          {/* Constrain the height of the chart */}
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Pie Chart */}
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Payment Status Breakdown</h3>
        <Pie data={pieChartData} />
      </div>
    </div>
  );
};

export default ChartsSection;
