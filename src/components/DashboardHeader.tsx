import React, { useState } from 'react';
import { useInvoiceQuery } from '../api/invoiceQueries';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { Invoice } from '../types/types';

const DashboardHeader: React.FC<{ userName: string }> = ({ userName }) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { stats, data: invoices, isLoading, isError } = useInvoiceQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading stats</div>;

  const filteredInvoices =
    selectedStatus === null
      ? []
      : invoices?.invoices.filter(
          (invoice) => invoice.status === selectedStatus,
        );

  return (
    <div>
      {/* Welcome Message */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-700">
          Welcome back, {userName}!
        </h1>
        <p className="text-lg text-gray-600">
          Here’s a quick overview of your invoices and customers.
        </p>
      </div>
      {/* Status Boxes */}
      <div className="relative p-6 bg-blue-500 text-white rounded-lg shadow-md">
        <div className="flex space-x-4">
          <div
            className="flex-1 bg-green-500 text-center py-4 rounded-lg shadow hover:bg-green-600 cursor-pointer flex flex-col items-center"
            onClick={() => setSelectedStatus('Paid')}
          >
            <FaCheckCircle className="text-white text-3xl mb-2" />
            <p className="font-bold text-lg">Paid</p>
            <p>{stats.paid}</p>
          </div>
          <div
            className="flex-1 bg-yellow-500 text-center py-4 rounded-lg shadow hover:bg-yellow-600 cursor-pointer flex flex-col items-center"
            onClick={() => setSelectedStatus('pending')}
          >
            <FaClock className="text-white text-3xl mb-2" />
            <p className="font-bold text-lg">Pending</p>
            <p>{stats.pending}</p>
          </div>
          <div
            className="flex-1 bg-red-500 text-center py-4 rounded-lg shadow hover:bg-red-600 cursor-pointer flex flex-col items-center"
            onClick={() => setSelectedStatus('Not Paid')}
          >
            <FaTimesCircle className="text-white text-3xl mb-2" />
            <p className="font-bold text-lg">Not Paid</p>
            <p>{stats.notPaid}</p>
          </div>
        </div>
      </div>

      {/* Collapsible Section for Invoice List */}
      {selectedStatus && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-2xl font-bold mb-4">{selectedStatus} Invoices</h2>
          {filteredInvoices && filteredInvoices.length > 0 ? (
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">
                    Invoice #
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Customer</th>
                  <th className="border border-gray-300 px-4 py-2">Amount</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Due Date</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice: Invoice) => (
                  <tr key={invoice.userId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {invoice.userId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {invoice.customerName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      ${invoice.amount?.toFixed(2)}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 ${
                        invoice.status?.toLowerCase() === 'paid'
                          ? 'text-green-500'
                          : invoice.status?.toLowerCase() === 'pending'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      {invoice.status}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {invoice.invoiceDate}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {invoice.status !== 'Paid' && (
                        <button
                          className="text-blue-500 hover:underline mr-2"
                          onClick={() =>
                            alert(
                              `Reminder sent for Invoice #${invoice.userId}`,
                            )
                          }
                        >
                          Send Reminder
                        </button>
                      )}
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() =>
                          alert(`Downloading Invoice #${invoice.userId}`)
                        }
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No invoices available for this status.</p>
          )}
          <button
            onClick={() => setSelectedStatus(null)}
            className="mt-4 text-blue-500 hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
