// InvoiceTable.jsx
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
import { useVirtualizer } from '@tanstack/react-virtual';
import { Invoice } from '../types/types';
import LoadingSpinner from '../components/LoadingSpinner'; // Ensure correct import
import {
  FaEdit,
  FaSave,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from 'react-icons/fa';

type LoadingInvoices = { [key: string]: boolean };

interface TableProps {
  headers: { label: string; accessor: keyof Invoice; tooltip: string }[];
  data: (Invoice & { statusComponent?: React.ReactNode })[];
  onDelete?: (invoiceId: string) => void;
  onEdit?: (invoice: Invoice) => void;
  onPaid?: (invoice: Invoice, newStatus: string) => void; // Updated to match handleStatusChange
  loadingInvoices: LoadingInvoices;
  defaultRowsPerPage: number;
}

const InvoiceTable: React.FC<TableProps> = ({
  headers,
  data,
  onDelete = () => {},
  onEdit = () => {},
  onPaid = () => {},
  loadingInvoices,
  defaultRowsPerPage,
}) => {
  const columnHelper = createColumnHelper<Invoice>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const parentRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedFilters = useMemo(() => {
    return Object.entries(filters).map(([id, value]) => ({ id, value }));
  }, [filters]);

  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        data.map((invoice) => [invoice.userId, invoice.status || '']),
      ),
  );

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
    }, 300); // Increased debounce time for better UX
  };

  const handleStatusChange = (invoice: Invoice, newStatus: string) => {
    onPaid && onPaid(invoice, newStatus);
  };

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
                      handleStatusChange(invoice, e.target.value)
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
                      className={`animate-spin rounded-full border-2 border-t-2 ${'h-4 w-4'} border-gray-300 border-t-blue-500`}
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
              onClick={() => handleStatusChange(invoice, 'Paid')} // Replace 'newStatusValue' accordingly
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

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) return data;
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const table = useReactTable({
    data: paginatedData,
    columns,
    getRowId: (row) => row.userId, // Ensure userId is unique
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters: debouncedFilters },
    onSortingChange: setSorting,
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Adjust based on your actual row height
    overscan: 10,
  });

  useEffect(() => {
    if (parentRef.current) parentRef.current.scrollTop = 0;
  }, [currentPage]);

  return (
    <div>
      {/* Card/List View for screens below 992px */}
      <div className="custom:hidden">
        {paginatedData.map((invoice) => (
          <div
            key={invoice.userId} // Ensure using a unique key
            className="border rounded p-4 my-2 bg-white shadow"
          >
            <div>
              <strong>User ID:</strong> {invoice.userId}
            </div>
            <div>
              <strong>Amount:</strong> {formatCurrency(invoice.amount || 0)}
            </div>
            <div>
              <strong>Invoice Date:</strong>{' '}
              {formatDate(invoice.invoiceDate || '')}
            </div>
            <div>
              <strong>Status:</strong>
              <select
                value={localStatuses[invoice.userId]?.toLowerCase() || ''}
                onChange={(e) => handleStatusChange(invoice, e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm ml-2"
              >
                <option value="paid">Paid</option>
                <option value="not paid">Not Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex space-x-2 mt-2">
              {loadingInvoices[invoice.userId] ? (
                <LoadingSpinner small />
              ) : (
                <>
                  <button
                    onClick={() => onEdit(invoice)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(invoice, 'newStatusValue')
                    } // Replace 'newStatusValue' accordingly
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaSave size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(invoice.userId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Enhanced Pagination Controls for Card View */}
        <div className="flex flex-col items-center mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            {/* First Page Button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="First Page"
            >
              <FaAngleDoubleLeft />
            </button>

            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Previous Page"
            >
              <FaArrowLeft />
            </button>

            {/* Current Page Indicator */}
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Next Page"
            >
              <FaArrowRight />
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
              aria-label="Last Page"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="rowsPerPage" className="text-gray-700">
              Rows per page:
            </label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={(e) => {
                const value = Number(e.target.value);
                setRowsPerPage(value);
                if (value === -1) setCurrentPage(1);
              }}
              className="p-1 border border-gray-300 rounded text-sm"
            >
              {[10, 20, 50, 100, -1].map((size) => (
                <option key={size} value={size}>
                  {size === -1 ? 'All' : size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table View for screens 992px and above */}
      <div className="hidden custom:block overflow-x-auto w-full">
        <div>
          <div className="min-w-full bg-gray-100 border-b sticky top-0 z-10">
            <div className="flex flex-wrap">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    className="py-2 px-2 text-gray-800 text-left text-xs uppercase font-semibold flex-shrink flex-grow break-words"
                    style={{ flex: '1 1 0' }}
                  >
                    {typeof header.column.columnDef.header === 'function'
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header}
                  </div>
                )),
              )}
            </div>
          </div>

          {paginatedData.length === 0 ? (
            <div className="text-center p-4">No invoices available.</div>
          ) : (
            <div ref={parentRef} className="relative scroll-smooth">
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  if (!row) return null;
                  return (
                    <div
                      key={row.id} // row.id corresponds to userId
                      style={{
                        position: 'absolute',
                        top: `${virtualRow.start}px`,
                        left: 0,
                        right: 0,
                        height: `${virtualRow.size}px`,
                      }}
                      className={`flex flex-wrap items-center border-b ${
                        virtualRow.index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-gray-100`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <div
                          key={cell.id}
                          className="py-2 px-4 text-sm text-gray-800 flex-shrink flex-grow break-words"
                          style={{ flex: '1 1 0' }}
                        >
                          {typeof cell.column.columnDef.cell === 'function'
                            ? cell.column.columnDef.cell(cell.getContext())
                            : cell.column.columnDef.cell}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Pagination Controls for Table View */}
          <div className="flex flex-col sm:flex-row justify-center items-center mt-4 space-y-2 sm:space-y-0">
            <div className="flex items-center justify-center align-center space-x-2">
              {/* First Page Button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
                aria-label="First Page"
              >
                <FaAngleDoubleLeft />
              </button>

              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
                aria-label="Previous Page"
              >
                <FaArrowLeft />
              </button>

              {/* Current Page Indicator */}
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
                aria-label="Next Page"
              >
                <FaArrowRight />
              </button>

              {/* Last Page Button */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors`}
                aria-label="Last Page"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="rowsPerPage" className="text-gray-700">
                Rows per page:
              </label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setRowsPerPage(value);
                  if (value === -1) setCurrentPage(1);
                }}
                className="p-1 border border-gray-300 rounded text-sm"
              >
                {[10, 20, 50, 100, -1].map((size) => (
                  <option key={size} value={size}>
                    {size === -1 ? 'All' : size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTable;
