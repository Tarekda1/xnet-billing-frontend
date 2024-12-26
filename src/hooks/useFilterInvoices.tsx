import { useMemo } from 'react';
import { Invoice } from '../types/types';

interface UseFilteredInvoicesParams {
  invoices: Invoice[];
  selectedMonthYear: string;
  rowsPerPage: number;
  currentPage: number;
  invoicesStatus: Record<string, string>;
}

interface UseFilteredInvoicesReturn {
  filteredInvoices: Invoice[];
  paginatedData: Invoice[];
  totalPages: number;
}

const useFilteredInvoices = ({
  invoices,
  selectedMonthYear,
  rowsPerPage,
  currentPage,
  invoicesStatus,
}: UseFilteredInvoicesParams): UseFilteredInvoicesReturn => {
  const filteredInvoices = useMemo(() => {
    if (!selectedMonthYear) return invoices;
    return invoices.filter((invoice) => {
      const [month, year] = selectedMonthYear.split(' ');
      const invoiceDate = new Date(invoice.invoice_date || Date.now());
      return (
        invoiceDate.toLocaleString('default', { month: 'long' }) === month &&
        invoiceDate.getFullYear().toString() === year
      );
    });
  }, [invoices, selectedMonthYear]);

  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    return filteredInvoices
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map((invoice) => ({
        ...invoice,
        status: invoicesStatus[invoice.userId] || invoice.status,
      }));
  }, [filteredInvoices, currentPage, rowsPerPage, invoicesStatus]);

  return { filteredInvoices, paginatedData, totalPages };
};

export default useFilteredInvoices;
