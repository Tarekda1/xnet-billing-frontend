import React, { useState, useMemo, useReducer } from 'react';
import LoadingSpinner from '../../components/LoadingSprinner'; // Extracted Loading component
import {
  useInvoiceQuery,
  useUpdateInvoiceQuery,
} from '../../api/invoiceQueries';
import { useQueryClient } from 'react-query';
import InvoiceTable from '../InvoiceTable';
import { notify } from '../../utils/toastUtils';
import useFilteredInvoices from '../../hooks/useFilterInvoices';
import InvoiceSidebar from '../InvoiceSidebar';
import { Invoice } from '../../types/types';
import InvoiceReducer, { InvoiceState } from '../../reducers/InvoiceReducer';
import MonthYearSelector from '../MonthYearSelector';

const InvoiceList: React.FC = () => {
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<null | Invoice>(null);
  const initialState: InvoiceState = {
    loading: {},
    status: {},
  };
  const [invoiceState, dispatch] = useReducer(InvoiceReducer, initialState);
  const { invoices, isLoading, isError } = useInvoiceQuery();
  const updateInvoices = useUpdateInvoiceQuery();
  const queryClient = useQueryClient();
  const rowsPerPage = 100;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { filteredInvoices, paginatedData, totalPages } = useFilteredInvoices({
    invoices,
    selectedMonthYear,
    rowsPerPage,
    currentPage,
    invoicesStatus: invoiceState.status,
  });

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

  // Handle month and year change
  const handleMonthYearChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedMonthYear(event.target.value);
  };

  const handlePaidClick = (invoice: Invoice) => {
    handleStatusChange(invoice.userId, invoice.customerName || '', 'Paid');
  };

  // Handle status change
  const handleStatusChange = (
    invoiceId: string,
    customerName: string,
    newStatus: string,
  ) => {
    dispatch({ type: 'SET_LOADING', payload: { invoiceId, isLoading: true } });
    dispatch({ type: 'SET_STATUS', payload: { invoiceId, status: newStatus } });

    let updates: any[] = [];
    updates.push({
      userId: invoiceId,
      customer_name: customerName, // Assuming customerName is not needed for updates
      status: newStatus,
    });

    updateInvoices.mutate(
      { updatedData: updates },
      {
        onSuccess: () => {
          notify('User updated successfully!', 'success');

          // Update the local invoices data list
          queryClient.setQueryData(
            'invoices',
            (oldData: { invoices: Invoice[]; metrics: any } | undefined) => {
              if (!oldData || !oldData.invoices)
                return { invoices: [], metrics: {} };
              return {
                ...oldData,
                invoices: oldData.invoices.map((invoice) =>
                  invoice.userId === invoiceId
                    ? { ...invoice, status: newStatus }
                    : invoice,
                ),
              };
            },
          );
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
          dispatch({
            type: 'SET_LOADING',
            payload: { invoiceId, isLoading: false },
          });
        },
      },
    );
  };

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
              <MonthYearSelector
                value={selectedMonthYear}
                options={monthYearOptions}
                onChange={handleMonthYearChange}
              />
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
            loadingInvoices={invoiceState.loading}
            data={filteredInvoices}
            onEdit={handleEditClick}
            onPaid={handlePaidClick}
            defaultRowsPerPage={rowsPerPage}
          />

          <InvoiceSidebar
            selectedInvoice={selectedInvoice}
            onSave={(updatedInvoice: Invoice) => {
              handleStatusChange(
                updatedInvoice.userId,
                updatedInvoice?.customerName || '',
                updatedInvoice.status || 'pending',
              );
            }}
            onClose={handleCloseSidebar}
          />
        </>
      )}
    </div>
  );
};

export default InvoiceList;
