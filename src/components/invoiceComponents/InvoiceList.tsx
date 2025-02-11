import React, { useState, useMemo } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import {
  useInvoiceQuery,
  useUpdateInvoiceQuery,
} from '../../api/invoiceQueries';
import InvoiceTable from './InvoiceTable';
import InvoiceSidebar from '../InvoiceSidebar';
import { Invoice, Pagination } from '../../types/types';
import { useInvoiceContext } from '../../context/InvoiceContext';
import MonthYearSelector from '../MonthYearSelector';
import { useInvoiceStatus } from '../../context/InvoiceStatusContext';
import { queryClient } from '../../api/queryClient';

const InvoiceList: React.FC = () => {
  const { queryParams, setQueryParams } = useInvoiceContext();
  const { limit, selectedMonthYear, statusFilters, currentPage, lastKey } =
    queryParams;
  const { localStatuses, setLocalStatuses } = useInvoiceStatus();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState<
    Record<string, boolean>
  >({});
  // Maintain a history of lastKeys for proper previous page functionality.
  const [lastKeysHistory, setLastKeysHistory] = useState<string[]>([]);

  // Fetch data with lastKey included in query key.
  const { data, isFetching } = useInvoiceQuery({ ...queryParams });
  const invoices = data?.invoices || [];
  const pagination: Pagination = data?.pagination || {
    page: 1,
    limit,
    hasNextPage: false,
    nextPage: null,
    lastKey: null,
    totalInvoices: 0,
  };

  const totalInvoices = pagination.totalInvoices;
  const hasNextPage = !!pagination.nextPage;
  const hasPreviousPage = currentPage > 1;

  // Define table headers.
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
        accessor: 'customerName',
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
      { label: 'Invoice Date', tooltip: 'Due Date', accessor: 'invoiceDate' },
      {
        label: 'Monthly Date',
        tooltip: 'Due date for the payment',
        accessor: 'monthlyDate',
      },
    ];

  const updateInvoices = useUpdateInvoiceQuery(
    limit || 20,
    currentPage,
    lastKey ?? '',
  );

  // Compute Month/Year options from the invoices.
  const monthYearOptions = useMemo(() => {
    const options = new Set<string>();
    invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate || Date.now());
      const monthYear = `${invoiceDate.toLocaleString('default', { month: 'long' })} ${invoiceDate.getFullYear()}`;
      options.add(monthYear);
    });
    return Array.from(options).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
  }, [invoices]);

  // Handle invoice status change.
  const handleStatusChange = (
    invoiceId: string,
    customerName: string,
    newStatus: string,
  ) => {
    const arrKey = `${invoiceId}-${customerName}`;
    const previousStatus = localStatuses[arrKey];
    setLoadingInvoices((prev) => ({ ...prev, [arrKey]: true }));

    const updates = [
      { userId: invoiceId, customer_name: customerName, status: newStatus },
    ];
    // Optimistically update the status.
    setLocalStatuses((prev) => ({ ...prev, [arrKey]: newStatus }));
    updateInvoices.mutate(
      { updatedData: { message: '', updatedInvoices: updates } },
      {
        onSuccess: (updatedInvoice) => {
          setLoadingInvoices((prev) => ({ ...prev, [arrKey]: false }));
        },
        onError: (error: unknown) => {
          setLoadingInvoices((prev) => ({ ...prev, [arrKey]: false }));
          console.error('Failed to update invoice status:', error);
          setLocalStatuses((prev) => ({ ...prev, [arrKey]: previousStatus }));
        },
      },
    );
  };

  const handleCloseSidebar = () => {
    setSelectedInvoice(null);
  };

  // Next Page: Push the current page's lastKey into history and update the query parameters.
  const handleNextPage = () => {
    if (pagination.lastKey) {
      setLastKeysHistory((prev) => [...prev, pagination.lastKey || '']);
      setQueryParams((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        lastKey: pagination.lastKey,
      }));
    }
  };

  // Previous Page: Use the history of lastKeys to update query parameters, ensuring page number doesn't go below 1.
  const handlePreviousPage = () => {
    if (!hasPreviousPage) return;
    const newHistory = lastKeysHistory.slice(0, -1);
    const newLastKey =
      newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
    const newPage = Math.max(currentPage - 1, 1);
    setLastKeysHistory(newHistory);
    setQueryParams((prev) => ({
      ...prev,
      currentPage: newPage,
      lastKey: newLastKey,
    }));
  };

  // When changing rows per page, reset pagination.
  const handleRowsPerPageChange = (newLimit: number) => {
    setLastKeysHistory([]);
    setQueryParams((prev) => ({
      ...prev,
      limit: newLimit,
      currentPage: 1,
      lastKey: null,
    }));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full max-w-screen overflow-hidden bg-white shadow-md rounded-lg border border-gray-300 p-2 sm:p-3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Month/Year Filter */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-sm text-gray-600 font-medium shrink-0">
                Month/Year:
              </label>
              <MonthYearSelector
                value={selectedMonthYear || ''}
                options={monthYearOptions}
                onChange={(e) =>
                  setQueryParams({
                    ...queryParams,
                    selectedMonthYear: e.target.value,
                    currentPage: 1,
                    lastKey: null,
                  })
                }
              />
            </div>
            {/* Status Filters */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-sm text-gray-600 font-medium shrink-0">
                Status:
              </span>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                {['paid', 'pending', 'not paid'].map((status) => (
                  <label
                    key={status}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-150 active:scale-[0.98]"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      checked={statusFilters?.[status] || false}
                      onChange={() =>
                        setQueryParams({
                          ...queryParams,
                          statusFilters: {
                            ...queryParams.statusFilters,
                            [status]: !queryParams.statusFilters?.[status],
                          },
                          currentPage: 1,
                          lastKey: null,
                        })
                      }
                    />
                    <span className="capitalize text-sm font-medium text-gray-700">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {isFetching && (
            <div className="relative">
              <div className="mt-3 sm:mt-0 sm:absolute sm:right-4 sm:top-3 md:top-[50%] md:mt-[-27px]">
                <LoadingSpinner small message="Fetching..." />
              </div>
            </div>
          )}
        </div>
      </div>

      <InvoiceTable
        headers={headers}
        data={invoices}
        isFetching={isFetching}
        defaultRowsPerPage={limit || 20}
        loadingInvoices={loadingInvoices}
        totalInvoices={totalInvoices}
        onEdit={(invoice) => setSelectedInvoice(invoice)}
        onPaid={(invoiceId, customerName, newStatus) =>
          handleStatusChange(invoiceId, customerName || '', newStatus)
        }
        pagination={{
          currentPage,
          hasNextPage,
          hasPreviousPage,
          onPageChange: handleNextPage,
          onPreviousPage: handlePreviousPage,
          limit: limit || 50,
          onRowsPerPageChange: handleRowsPerPageChange,
        }}
      />

      {selectedInvoice && (
        <InvoiceSidebar
          selectedInvoice={selectedInvoice}
          onSave={(updatedInvoice) => {
            handleStatusChange(
              updatedInvoice.userId,
              updatedInvoice.customerName || '',
              updatedInvoice.status || 'pending',
            );
          }}
          onClose={handleCloseSidebar}
        />
      )}
    </>
  );
};

export default InvoiceList;
