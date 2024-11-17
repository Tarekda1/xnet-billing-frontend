// src/config/chartOptions.ts
import { ChartOptions } from 'chart.js';

export const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      type: 'category', // Explicitly define the scale type
      title: {
        display: true,
        text: 'Months',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Revenue ($)',
      },
    },
  },
};
