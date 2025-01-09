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
import { formatDate } from '../utils/dateUtil';
import LoadingSpinner from './LoadingSprinner';

type LoadingInvoices = { [key: string]: boolean };

interface TableProps {
  headers: { label: string; accessor: keyof Invoice; tooltip: string }[];
  data: (Invoice & { statusComponent?: React.ReactNode })[];
  onDelete?: (invoiceId: string) => void;
  onEdit?: (invoice: Invoice) => void;
  onPaid?: (invoice: Invoice) => void;
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
    return Object.entries(filters).map(([id, value]) => ({
      id,
      value,
    }));
  }, [filters]);

  // Parent state to manage local status for all rows
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        data.map((invoice) => [invoice.userId, invoice.status || '']), // Ensure status is always a string
      ),
  );

  const handleStatusChange = (userId: string, newStatus: string) => {
    setLocalStatuses((prev) => ({ ...prev, [userId]: newStatus }));
  };

  const handleUpdate = (invoice: Invoice) => {
    const updatedInvoice = {
      ...invoice,
      status: localStatuses[invoice.userId],
    };
    onPaid(updatedInvoice); // Trigger the update
  };

  const handleFilterChange = (id: string, value: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        [id]: value,
      }));
    }, 25);
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
              return (
                <select
                  value={localStatuses[invoice.userId]?.toLowerCase() || ''}
                  onChange={(e) =>
                    handleStatusChange(invoice.userId, e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="paid">Paid</option>
                  <option value="not paid">Not Paid</option>
                  <option value="pending">Pending</option>
                </select>
              );
            }

            if (
              accessor === 'invoiceDate' &&
              typeof invoice.invoiceDate === 'string'
            ) {
              return formatDate(invoice.invoiceDate);
            }

            if (accessor === 'userId') {
              return (
                <span className="text-black-500 font-bold">
                  {invoice.userId}
                </span>
              );
            }

            return invoice[accessor];
          },
        }) as ColumnDef<Invoice>,
    );

    const actionsColumn: ColumnDef<Invoice> = columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const invoice = row.original;

        return (
          <div className="flex space-x-2 items-center">
            {loadingInvoices[invoice.userId] ? (
              <LoadingSpinner small />
            ) : (
              <>
                <button
                  onClick={() => onEdit(invoice)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleUpdate(invoice)} // Trigger update with local state
                  className="text-green-500 hover:underline"
                >
                  Update
                </button>
                <button
                  onClick={() => onDelete(invoice.userId)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        );
      },
    });

    return [...coreColumns, actionsColumn];
  }, [headers, localStatuses, onEdit, onDelete, loadingInvoices]);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) {
      return data; // Show all rows
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, rowsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters: debouncedFilters,
    },
    onSortingChange: setSorting,
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  return (
    <div>
      {/* Table Header */}
      <div className="min-w-full bg-gray-100 border-b sticky top-0 z-10">
        <div className="flex">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="py-2 px-2 text-gray-800 text-left text-xs uppercase font-semibold flex-shrink-0"
                style={{
                  flex: '1 1 0px',
                  width: `${header.column.getSize()}px`,
                }}
              >
                {typeof header.column.columnDef.header === 'function'
                  ? header.column.columnDef.header(header.getContext())
                  : header.column.columnDef.header}
              </div>
            )),
          )}
        </div>
      </div>

      {/* Scrollable Rows */}
      {paginatedData.length === 0 ? (
        <div className="text-center p-4">No invoices available.</div>
      ) : (
        <div ref={parentRef} className="overflow-y-auto h-[500px] relative">
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              if (!row || typeof row.getVisibleCells !== 'function')
                return null;
              return (
                <div
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: `${virtualRow.start}px`,
                    left: 0,
                    right: 0,
                    height: `${virtualRow.size}px`,
                  }}
                  className={`flex items-center border-b ${
                    virtualRow.index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="py-2 px-4 text-sm text-gray-800 flex-shrink-0"
                      style={{
                        flex: '1 1 0px',
                        width: `${cell.column.getSize()}px`,
                      }}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || rowsPerPage === -1} // Disable paging when showing all rows
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of{' '}
          {rowsPerPage === -1 ? 1 : Math.ceil(data.length / rowsPerPage)}
        </span>
        <button
          onClick={() =>
            handlePageChange(
              Math.min(currentPage + 1, Math.ceil(data.length / rowsPerPage)),
            )
          }
          disabled={
            currentPage === Math.ceil(data.length / rowsPerPage) ||
            rowsPerPage === -1
          } // Disable paging when showing all rows
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
        <div className="flex items-center space-x-2">
          <label htmlFor="rowsPerPage">Rows per page:</label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRowsPerPage(value);
              if (value === -1) {
                setCurrentPage(1); // Reset to page 1 when showing all rows
              }
            }}
            className="p-1 border border-gray-300 rounded"
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
  );
};

export default InvoiceTable;
