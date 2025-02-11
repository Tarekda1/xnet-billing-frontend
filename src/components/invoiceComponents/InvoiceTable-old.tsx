// src/components/InvoiceTable.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { Invoice } from '../../types/types';
import LoadingSpinner from '../../components/LoadingSpinner'; // Ensure correct import
import {
  FaEdit,
  FaSave,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaArrowDown,
} from 'react-icons/fa';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInvoiceStatus } from '../../context/InvoiceStatusContext';

type LoadingInvoices = { [key: string]: boolean };

interface TableProps {
  headers: { label: string; accessor: keyof Invoice; tooltip: string }[];
  data: Invoice[];
  onDelete?: (invoiceId: string) => void;
  onEdit?: (invoice: Invoice) => void;
  onPaid?: (invoiceId: string, customerName: string, newStatus: string) => void; // Updated to match handleStatusChange
  loadingInvoices: LoadingInvoices;
  defaultRowsPerPage: number;
  totalInvoices: number;
  isFetching: boolean;
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    onPageChange: () => void;
    onPreviousPage: () => void;
    hasPreviousPage: boolean;
    limit: number;
    onRowsPerPageChange: (newLimit: number) => void;
  };
}

const InvoiceTable: React.FC<TableProps> = ({
  headers,
  data,
  onDelete = () => {},
  onEdit = () => {},
  onPaid = () => {},
  loadingInvoices,
  totalInvoices,
  isFetching,
  pagination,
}) => {
  const columnHelper = createColumnHelper<Invoice>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const parentRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const startNumber = (pagination.currentPage - 1) * pagination.limit + 1;
  const endNumber = Math.min(startNumber + data.length - 1, totalInvoices);
  // Add this state at the top of your component
  const [isAtBottom, setIsAtBottom] = useState(false);

  const debouncedFilters = useMemo(() => {
    return Object.entries(filters).map(([id, value]) => ({ id, value }));
  }, [filters]);

  const { localStatuses, setLocalStatuses } = useInvoiceStatus();

  useEffect(() => {
    setLocalStatuses(
      Object.fromEntries(
        data.map((invoice) => [invoice.userId, invoice.status || '']),
      ),
    );
  }, [data]);

  const handleFilterChange = (id: string, value: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, [id]: value }));
    }, 100); // Increased debounce time for better UX
  };

  const handleStatusChange = (
    invoiceId: string,
    customerName: string,
    newStatus: string,
  ) => {
    setLocalStatuses((prev) => ({
      ...prev,
      [invoiceId]: newStatus,
    }));
    onPaid && onPaid(invoiceId, customerName, newStatus);
  };
  const scrollPadding = 40;
  // Scroll to bottom function
  // const scrollToBottom = () => {
  //   if (parentRef.current) {
  //     console.log('Scrolling to bottom');
  //     parentRef.current.scrollTo({
  //       top: parentRef.current.scrollHeight,
  //       behavior: 'smooth',
  //     });
  //   }
  // };
  // Modified scrollToBottom function
  const scrollToBottom = () => {
    if (parentRef.current) {
      parentRef.current.scrollTo({
        top:
          rowVirtualizer.getTotalSize() -
          parentRef.current.clientHeight +
          scrollPadding,
        behavior: 'smooth',
      });
      // Force update after scroll completes
      setTimeout(() => setIsAtBottom(true), 500);
    }
  };

  // Add scroll position handler
  const handleScroll = () => {
    if (!parentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    // More accurate calculation with 1px threshold
    const isBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1;
    setIsAtBottom(isBottom);
  };

  // Add scroll event listener to the container
  useEffect(() => {
    const container = parentRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const providerClasses: Record<string, string> = {
    IDM: 'bg-blue-200 text-blue-800',
    terra: 'bg-green-200 text-green-800',
    tisp: 'bg-yellow-200 text-yellow-800',
    tisp2: 'bg-yellow-200 text-yellow-800',
    ISP11S: 'bg-red-200 text-red-800',
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const VirtualRow = React.memo<{ virtualRow: any; row: any }>(
    ({ virtualRow, row }) => (
      <tr
        key={`${row.original.userId}-${row.original.customerName}`} // Unique key based on userId and customerName
        style={{
          height: `${virtualRow.size}px`, // Dynamic row height
          transition: 'top 0.2s ease, height 0.2s ease', // Smooth transitions
        }}
        className={`border-b ${
          virtualRow.index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
        } hover:bg-gray-100 w-full`}
      >
        {row.getVisibleCells().map((cell: any) => (
          <td
            key={cell.id}
            className="py-2 px-4 text-sm text-gray-800 break-words"
          >
            {typeof cell.column.columnDef.cell === 'function'
              ? cell.column.columnDef.cell(cell.getContext())
              : cell.renderValue()}
          </td>
        ))}
      </tr>
    ),
  );

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
  }, [data]);

  const columns: ColumnDef<Invoice>[] = useMemo(() => {
    const coreColumns = headers.map(
      ({ label, accessor, tooltip }) =>
        columnHelper.accessor(accessor as keyof Invoice, {
          header: (props) => (
            <div className="flex flex-col">
              <div
                className={`cursor-pointer flex items-center ${
                  props.column.getCanSort() ? 'hover:underline' : ''
                }`}
                onClick={props.column.getToggleSortingHandler()}
              >
                <span className="tooltip tooltip-bottom" data-tip={tooltip}>
                  {label}
                </span>
                {props.column.getIsSorted() === 'asc' && <span> ▲</span>}
                {props.column.getIsSorted() === 'desc' && <span> ▼</span>}
              </div>
              {props.column.getCanFilter() && (
                <input
                  type="text"
                  placeholder={`Search ${label}`}
                  value={filters[props.column.id] || ''}
                  onChange={(e) =>
                    handleFilterChange(props.column.id, e.target.value)
                  }
                  className="mt-1 p-1 border border-gray-300 rounded text-sm"
                />
              )}
            </div>
          ),
          cell: (info) => {
            const invoice = info.row.original;
            if (accessor === 'status' && typeof invoice.status === 'string') {
              const statusClasses: Record<string, string> = {
                paid: 'bg-green-200 text-green-800',
                'not paid': 'bg-red-200 text-red-800',
                pending: 'bg-yellow-200 text-yellow-800',
              };
              const currentStatus =
                localStatuses[invoice.userId]?.toLowerCase() || '';
              return (
                <div className="flex items-center space-x-2">
                  <select
                    value={currentStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        invoice.userId,
                        invoice.customerName || '',
                        e.target.value,
                      )
                    }
                    className={`border border-gray-300 rounded px-2 py-1 text-sm ${
                      statusClasses[currentStatus] || ''
                    }`}
                  >
                    <option value="paid">Paid</option>
                    <option value="not paid">Not Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                  {loadingInvoices[invoice.userId] && (
                    <div
                      className={`animate-spin rounded-full border-2 border-t-2 h-4 w-4 border-gray-300 border-t-blue-500`}
                    ></div>
                  )}
                </div>
              );
            }
            if (accessor === 'invoiceDate' && invoice.invoiceDate) {
              return formatDate(invoice.invoiceDate);
            }
            if (accessor === 'userId') {
              return (
                <span className="text-black-500 font-bold">
                  {invoice.userId}
                </span>
              );
            }
            if (accessor === 'amount' && typeof invoice.amount === 'number') {
              return (
                <span className="text-green-600 font-medium">
                  {formatCurrency(invoice.amount)}
                </span>
              );
            }
            if (accessor === 'providerName' && invoice.providerName) {
              const provider = invoice.providerName;
              return (
                <span
                  className={`px-2 py-1 rounded inline-block ${
                    providerClasses[provider] || 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {provider}
                </span>
              );
            }
            return invoice[accessor];
          },
        }) as ColumnDef<Invoice>,
    );

    const actionsColumn: ColumnDef<Invoice> = columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => onEdit(invoice)}
              title="Edit"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() =>
                handleStatusChange(
                  invoice.userId,
                  invoice.customerName || '',
                  'paid',
                )
              } // Replace 'paid' with desired status
              title="Update"
              className={`p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors`}
              disabled={loadingInvoices[invoice.userId]}
            >
              <FaSave size={16} />
            </button>
            <button
              onClick={() => onDelete(invoice.userId)}
              title="Delete"
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <FaTrash size={16} />
            </button>
          </div>
        );
      },
    });

    return [...coreColumns, actionsColumn];
  }, [headers, localStatuses, onEdit, onDelete, loadingInvoices]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.userId, // Ensure userId is unique
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters: debouncedFilters },
    onSortingChange: setSorting,
  });

  // Optionally, implement virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Dynamically calculate row height if needed
      const row = data[index];
      return row?.customerName ? 60 : 60; // Example dynamic height
    },
    overscan: 15,
    scrollPaddingEnd: 10, // Add padding at bottom
  });

  useEffect(() => {
    if (parentRef.current) parentRef.current.scrollTop = 0;
  }, [data]);

  return (
    <div className="h-full">
      {/* Card/List View for screens below 992px */}
      <div className="custom:hidden w-full space-y-2">
        {data.map((invoice) => (
          <div
            key={`${invoice.userId}-${invoice.customerName}`}
            className="w-full max-w-screen xs:w-full custom:w-auto mx-auto my-3
             bg-white shadow-md rounded-lg p-4 border border-gray-100 box-border"
          >
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="font-semibold text-gray-600">User ID:</div>
                <div className="text-gray-800 break-all">{invoice.userId}</div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="font-semibold text-gray-600">Amount:</div>
                <div className="text-green-600 font-medium">
                  {formatCurrency(invoice.amount || 0)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="font-semibold text-gray-600">Invoice Date:</div>
                <div className="text-gray-700">
                  {formatDate(invoice.invoiceDate || '')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="font-semibold text-gray-600">Status:</div>
                <select
                  value={localStatuses[invoice.userId]?.toLowerCase() || ''}
                  onChange={(e) => {
                    handleStatusChange(
                      invoice.userId,
                      invoice.customerName || '',
                      e.target.value,
                    );
                  }}
                  className="w-full sm:w-48 mt-1 sm:mt-0 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="not paid">Not Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-end mt-4">
                {loadingInvoices[invoice.userId] ? (
                  <LoadingSpinner small />
                ) : (
                  <>
                    <button
                      onClick={() => onEdit(invoice)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    >
                      <FaEdit className="text-blue-600" size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(
                          invoice.userId,
                          invoice.customerName || '',
                          'paid',
                        )
                      }
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
                    >
                      <FaSave className="text-green-600" size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(invoice.userId)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                    >
                      <FaTrash className="text-red-600" size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced Pagination Controls for Card View */}
        <div className="flex flex-col items-center mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            {/* Previous Page Button */}
            <button
              onClick={() => pagination.onPreviousPage()}
              disabled={pagination.currentPage === 1 || isFetching}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Previous Page"
            >
              <FaArrowLeft />
            </button>

            {/* Current Page Indicator */}
            <span className="text-gray-700">Page {pagination.currentPage}</span>

            {/* Next Page Button */}
            <button
              onClick={() => pagination.onPageChange()}
              disabled={!pagination.hasNextPage || isFetching}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Next Page"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden custom:block overflow-y-auto w-full h-full">
        {/* Table Container */}
        <table className="min-w-full bg-gray-100 border-b sticky top-0 z-10">
          {/* Table Header */}
          <thead>
            <tr>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2 px-2 text-gray-800 text-left text-xs uppercase font-semibold break-words"
                    style={{ flex: '1 1 0' }}
                  >
                    {typeof header.column.columnDef.header === 'function'
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header}
                  </th>
                )),
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center p-4">
                  No invoices available.
                </td>
              </tr>
            ) : (
              <>
                {table
                  .getRowModel()
                  .rows.map((virtualRow) =>
                    virtualRow ? (
                      <VirtualRow
                        key={`${virtualRow.original.userId}-${virtualRow.original.customerName}`}
                        virtualRow={virtualRow}
                        row={virtualRow}
                      />
                    ) : null,
                  )}
                {false && (
                  <button
                    onClick={scrollToBottom}
                    className="fixed bottom-[30px] right-[60px] bg-blue-500 text-white px-2 py-2 rounded-full shadow-md hover:bg-blue-600 transition"
                  >
                    <FaArrowDown />
                  </button>
                )}
              </>
            )}
          </tbody>
        </table>

        {/* Enhanced Pagination Controls for Table View */}
        <div className="flex flex-col sm:flex-row justify-start items-center mt-4 space-y-2 sm:space-y-0">
          {/* Display current range */}
          <span className="text-gray-700 font-semibold basis-[40%]">
            Showing {startNumber} - {endNumber} of {totalInvoices} invoices
          </span>

          {/* Pagination Buttons */}
          <div className="flex items-center space-x-2 basis-[50%]">
            <button
              onClick={pagination.onPreviousPage}
              disabled={!pagination.hasPreviousPage}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Previous Page"
            >
              <FaArrowLeft />
            </button>
            <span className="text-gray-700">Page {pagination.currentPage}</span>
            <button
              onClick={pagination.onPageChange}
              disabled={pagination.hasNextPage === false}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Next Page"
            >
              <FaArrowRight />
            </button>

            {/* Rows per page dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Rows per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) =>
                  pagination.onRowsPerPageChange(Number(e.target.value))
                }
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTable;
