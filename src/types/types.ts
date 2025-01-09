// src/types.ts (optional, for defining types across your project)
export interface FileObject {
  fileName: string;
  url: string;
  size?: number;
  lastModified?: string;
}

// export interface ExcelRow {
//   column1: string;
//   column2: number;
//   // Add more columns as needed based on your data
// }

export type CellValue = string | number | boolean | undefined;

export interface ExcelRow {
  [key: string]: CellValue;
}

export interface Update {
  username: string;
  field: string;
  value: CellValue;
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
