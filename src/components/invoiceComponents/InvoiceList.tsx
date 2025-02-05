import React, { useState, useMemo, useEffect, useRef } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import {
  InvoiceResponse,
  useInvoiceQuery,
  useUpdateInvoiceQuery,
} from '../../api/invoiceQueries';
import { useQueryClient } from 'react-query';
import InvoiceTable from '../InvoiceTable';
import InvoiceSidebar from '../InvoiceSidebar';
import { Invoice, Pagination } from '../../types/types';
import { useInvoiceContext } from '../../context/InvoiceContext';
import MonthYearSelector from '../MonthYearSelector';
import apiClient from '../../api/client';
import { useInvoiceStatus } from '../../context/InvoiceStatusContext';

const InvoiceList: React.FC = () => {
  const { queryParams, setQueryParams } = useInvoiceContext();
  const [lastKeysHistory, setLastKeysHistory] = useState<string[]>([]);
  const { limit, selectedMonthYear, statusFilters, currentPage } = queryParams;
  const { localStatuses, setLocalStatuses } = useInvoiceStatus();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState<
    Record<string, boolean>
  >({});

  const queryClient = useQueryClient();
  const updateInvoices = useUpdateInvoiceQuery();

  const { data, isLoading, isError, isFetching } = useInvoiceQuery({
    ...queryParams,
    lastKey: lastKeysHistory[currentPage - 2] || null, // Ensure correct lastKey is used
  });

  // Extract invoices and pagination info
  const invoices = data?.invoices || [];
  const pagination: Pagination = data?.pagination || {
    page: 1,
    limit: limit,
    hasNextPage: false,
    nextPage: null,
    lastKey: null,
    totalInvoices: 0,
  };
  const totalInvoices = data?.pagination?.totalInvoices || 0;

  const hasNextPage = !!pagination.nextPage;
  const hasPreviousPage = currentPage > 1;

  // Define table headers
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

  // Extract available months and years from invoice data
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

  // Handle invoice status change
  const handleStatusChange = (
    invoiceId: string,
    customerName: string,
    newStatus: string,
  ) => {
    const previousStatus = localStatuses[invoiceId]; // Store previous status
    setLoadingInvoices((prev) => ({ ...prev, [invoiceId]: true }));

    const updates = [
      { userId: invoiceId, customer_name: customerName, status: newStatus },
    ];
    // Optimistically update the status in context
    setLocalStatuses((prev) => ({
      ...prev,
      [invoiceId]: newStatus,
    }));
    updateInvoices.mutate(
      { updatedData: updates },
      {
        onSuccess: () => {
          setLoadingInvoices((prev) => ({ ...prev, [invoiceId]: false }));
          queryClient.invalidateQueries(['invoices', queryParams]); // Refetch invoices after update
        },
        onError: (error: unknown) => {
          setLoadingInvoices((prev) => ({ ...prev, [invoiceId]: false }));
          console.error('Failed to update invoice status:', error);
          setLocalStatuses((prev) => ({
            ...prev,
            [invoiceId]: previousStatus, // Rollback to previous status
          }));
        },
      },
    );
  };

  const handleCloseSidebar = () => {
    setSelectedInvoice(null); // ✅ Close sidebar
  };

  // Handle Next Page
  const handleNextPage = () => {
    if (pagination.lastKey !== null) {
      setLastKeysHistory((prev) => [...prev, pagination.lastKey || '']); // Store lastKey
      setQueryParams((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  };

  // Handler for changing the rows per page
  const handleRowsPerPageChange = (newLimit: number) => {
    setQueryParams((prev) => ({
      ...prev,
      limit: newLimit, // ✅ Update the limit
      currentPage: 1, // ✅ Reset to first page
    }));
  };

  // Handle Previous Page
  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setLastKeysHistory((prev) => prev.slice(0, -1)); // Remove last stored lastKey
      setQueryParams((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  // Prefetch the next page **only if it's not already cached**
  useEffect(() => {
    if (hasNextPage && pagination.lastKey !== null) {
      queryClient.prefetchQuery(
        [
          'invoices',
          { limit, page: currentPage + 1, lastKey: pagination.lastKey },
        ],
        async () => {
          const response = await apiClient.get<InvoiceResponse>(
            '/invoices/list',
            {
              params: {
                limit,
                page: currentPage + 1,
                lastKey: pagination.lastKey,
                selectedMonthYear,
                statusFilters,
              },
            },
          );
          return response.data;
        },
        { staleTime: 5000 }, // Prevent unnecessary refetching
      );
    }
  }, [
    hasNextPage,
    pagination.lastKey,
    currentPage,
    limit,
    selectedMonthYear,
    statusFilters,
    queryClient,
  ]);

  return (
    <div className="mx-auto relative">
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          {/* Filter Container */}
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
                          setQueryParams((prev) => ({
                            ...prev,
                            statusFilters: {
                              ...prev.statusFilters,
                              [status]: !prev.statusFilters?.[status],
                            },
                            currentPage: 1,
                          }))
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

            {/* Loading Spinner - Mobile positioned at bottom */}
            {true && (
              <div className="relative">
                <div className="mt-3 sm:mt-0 sm:absolute sm:right-4 sm:top-3  md:top-[50%] md:mt-[-27px]">
                  <LoadingSpinner small message="Fetching..." />
                </div>
              </div>
            )}
          </div>
        </div>

        <InvoiceTable
          headers={headers} // ✅ Headers properly included!
          data={invoices}
          isFetching={isFetching}
          defaultRowsPerPage={limit || 20}
          loadingInvoices={loadingInvoices}
          totalInvoices={totalInvoices}
          onEdit={(invoice) => setSelectedInvoice(invoice)} // Example status change
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

        {/* Sidebar Component */}
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
    </div>
  );
};

export default InvoiceList;
