// src/types.ts (optional, for defining types across your project)
export interface FileObject {
  fileName: string;
  url: string;
  size?: number;
  lastModified?: string;
}

export interface FetchInvoicesParams {
  limit?: number;
  lastKey?: string | null;
  selectedMonthYear?: string;
  statusFilters?: Record<string, boolean>;
}

export type CellValue = string | number | boolean | undefined;

export interface ExcelRow {
  [key: string]: CellValue;
}

export interface Update {
  username: string;
  field: string;
  value: CellValue;
}

export interface Pagination {
  nextPage: number | null;
  page: number;
  limit: number | undefined;
  hasNextPage?: boolean;
  lastKey?: string | null;
  totalInvoices: number;
}

// src/types/invoices.ts
export interface InvoicesData {
  invoices: Invoice[];
  metrics: any; // Replace 'any' with a more specific type if available
  pagination: Pagination;
}

export interface Invoice {
  userId: string;
  customerName?: string;
  providerName?: string;
  amount?: number;
  status?: string;
  invoiceDate?: string;
  monthlyDate?: string;
  notes?: string;
}

export interface Transaction {
  transactionId: string; // Unique identifier for the transaction
  userId: string; // ID of the user associated with the transaction
  amount: number; // Amount of the transaction
  status: 'paid' | 'pending' | 'failed'; // Transaction status
  invoiceId?: string; // Associated invoice ID (optional)
  createdAt: string; // ISO string for the transaction creation date
  updatedAt?: string; // ISO string for the last update date (optional)
  paymentMethod?: string; // Payment method used (optional)
}
