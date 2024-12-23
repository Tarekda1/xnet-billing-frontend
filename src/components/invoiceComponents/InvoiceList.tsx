import React, { useState, useCallback, useMemo } from 'react';
import Pagination from '../../components/Pagination'; // Extracted Pagination component
import LoadingSpinner from '../../components/LoadingSprinner'; // Extracted Loading component
import {
  useInvoiceQuery,
  useUpdateInvoiceQuery,
} from '../../api/invoiceQueries';
import InvoiceTable from '../InvoiceTable';
import InvoiceEditSidebar from './InvoiceEditSidebar'; // Sidebar component for editing
import { Invoice } from '../../types';
import { notify } from '../../utils/toastUtils';

const InvoiceList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');
  const [invoicesStatus, setInvoicesStatus] = useState<{
    [key: string]: string;
  }>({});
  const [selectedInvoice, setSelectedInvoice] = useState<null | Invoice>(null);
  const [loadingInvoices, setLoadingInvoices] = useState<{
    [key: string]: boolean;
  }>({});

  const rowsPerPage = 100; // Number of rows per page
  const { data: invoices = [], isLoading, isError } = useInvoiceQuery();
  const updateInvoices = useUpdateInvoiceQuery();

  // Extract available months and years from invoice data
  const monthYearOptions = useMemo(() => {
    const options = new Set<string>();
    invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.invoice_date || Date.now());
      const monthYear = `${invoiceDate.toLocaleString('default', { month: 'long' })} ${invoiceDate.getFullYear()}`;
      options.add(monthYear);
    });
    return Array.from(options).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
  }, [invoices]);

  // Handle month and year change
  const handleMonthYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedMonthYear(event.target.value);
    setCurrentPage(1);
  };

  const handlePaidClick = (invoice: Invoice) => {
    handleStatusChange(invoice.userId, 'Paid');
  };

  // Handle status change
  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    setLoadingInvoices((prev) => ({ ...prev, [invoiceId]: true }));
    setInvoicesStatus((prevStatus) => ({
      ...prevStatus,
      [invoiceId]: newStatus,
    }));
    let updates: Invoice[] = [];
    updates.push({
      userId: invoiceId,
      status: newStatus,
    });
    updateInvoices.mutate(
      { updatedData: updates },
      {
        onSuccess: () => {
          notify('User updated successfully!', 'success');
        },
        onError: (error: unknown) => {
          notify(
            `Failed to save changes: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            'error',
            { autoClose: 3000 },
          );
        },
        onSettled: () => {
          setLoadingInvoices((prev) => ({ ...prev, [invoiceId]: false }));
        },
      },
    );
  };

  // Filter invoices by selected month and year
  const filteredInvoices = useMemo(() => {
    if (!selectedMonthYear) return invoices;
    return invoices.filter((invoice) => {
      const [month, year] = selectedMonthYear.split(' ');
      const invoiceDate = new Date(invoice.invoice_date || Date.now());
      const monthMatches =
        invoiceDate.toLocaleString('default', { month: 'long' }) === month;
      const yearMatches = invoiceDate.getFullYear().toString() === year;
      return monthMatches && yearMatches;
    });
  }, [invoices, selectedMonthYear]);

  // Calculate total pages based on filtered data
  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    return filteredInvoices
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map((invoice) => ({
        ...invoice,
        status: invoicesStatus[invoice.userId] || invoice.status,
      }));
  }, [filteredInvoices, currentPage, rowsPerPage, invoicesStatus]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  // Handle edit click to open sidebar
  const handleEditClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  // Close sidebar
  const handleCloseSidebar = () => {
    setSelectedInvoice(null);
  };
  const headers: { label: string; accessor: keyof Invoice; tooltip: string }[] =
    [
      {
        label: 'User ID',
        tooltip: 'Unique identifier for the invoice',
        accessor: 'userId',
      },
      {
        label: 'Client Name',
        tooltip: 'Name of the client',
        accessor: 'customer_name',
      },
      { label: 'Provider', tooltip: 'ISP provider', accessor: 'providerName' },
      {
        label: 'Amount',
        tooltip: 'Total amount of the invoice',
        accessor: 'amount',
      },
      {
        label: 'Status',
        tooltip: 'Current status of the invoice',
        accessor: 'status',
      },
      { label: 'Invoice Date', tooltip: 'Due Date', accessor: 'invoice_date' },
      {
        label: 'Monthly Date',
        tooltip: 'Due date for the payment',
        accessor: 'monthly_date',
      },
    ];

  return (
    <div className="mx-auto relative">
      {isLoading ? (
        <LoadingSpinner message="Loading invoices..." />
      ) : isError ? (
        <p className="text-red-500">
          Failed to load invoices. Please try again later.
        </p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <div>
                <label
                  htmlFor="monthYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Month and Year
                </label>
                <select
                  id="monthYear"
                  value={selectedMonthYear}
                  onChange={handleMonthYearChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All</option>
                  {monthYearOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() =>
                alert('Functionality to create invoice coming soon!')
              }
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Create New Invoice
            </button>
          </div>

          <InvoiceTable
            headers={headers}
            // data={paginatedData.map((invoice) => ({
            //   ...invoice,
            // }))}
            loadingInvoices={loadingInvoices}
            data={filteredInvoices}
            onEdit={handleEditClick}
            onPaid={handlePaidClick}
          />

          {/* <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          /> */}

          {selectedInvoice && (
            <InvoiceEditSidebar
              invoice={selectedInvoice}
              onClose={handleCloseSidebar}
              onSave={(updatedInvoice) => {
                handleStatusChange(
                  updatedInvoice.userId,
                  updatedInvoice.status || 'pending',
                );
                handleCloseSidebar();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InvoiceList;
