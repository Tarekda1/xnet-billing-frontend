import React from 'react';
import { useInvoiceQuery } from '../../api/invoiceQueries';
import { FaDollarSign, FaFileInvoice, FaClock } from 'react-icons/fa';

const DashboardKeyMetrics: React.FC = () => {
  const { stats, isLoading, isError } = useInvoiceQuery();

  if (isLoading) return <div>Loading metrics...</div>;
  if (isError) return <div>Error loading metrics</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {/* Total Revenue */}
      <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow flex items-center space-x-4">
        <FaDollarSign className="text-3xl" />
        <div>
          <p className="font-bold text-xl">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm">Total Revenue</p>
        </div>
      </div>
      {/* Outstanding Balance */}
      <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow flex items-center space-x-4">
        <FaFileInvoice className="text-3xl" />
        <div>
          <p className="font-bold text-xl">
            ${stats.outstandingBalance.toFixed(2)}
          </p>
          <p className="text-sm">Outstanding Balance</p>
        </div>
      </div>
      {/* Invoices Due Soon */}
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg shadow flex items-center space-x-4">
        <FaClock className="text-3xl" />
        <div>
          <p className="font-bold text-xl">{stats.invoicesDueSoon}</p>
          <p className="text-sm">Invoices Due Soon</p>
        </div>
      </div>
      {/* Invoices Due Soon */}
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg shadow flex items-center space-x-4">
        <FaClock className="text-3xl" />
        <div>
          <p className="font-bold text-xl">{stats.overdueInvoices}</p>
          <p className="text-sm">Invoices OverDue Soon</p>
        </div>
      </div>
      {/* Total Invoices */}
      <div className="bg-green-100 text-green-700 p-4 rounded-lg shadow flex items-center space-x-4">
        <FaFileInvoice className="text-3xl" />
        <div>
          <p className="font-bold text-xl">{stats.total}</p>
          <p className="text-sm">Total Invoices</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardKeyMetrics;
