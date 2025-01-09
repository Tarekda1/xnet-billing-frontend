// src/api/fileQueries.ts
import { useMutation, useQuery } from 'react-query';
import apiClient from './client';
import { Invoice } from '../types/types'; // Import the type
import { useMemo } from 'react';

// Function to fetch invoices
const fetchInvoices = async (): Promise<{
  invoices: Invoice[];
  metrics: any;
}> => {
  const response = await apiClient.get('/invoices/list');
  return response.data;
};

// React Query hook to fetch invoices
export const useInvoiceQuery = () => {
  const query = useQuery<{ invoices: Invoice[]; metrics: any }>(
    'invoices',
    fetchInvoices,
  );

  // Use useMemo to calculate stats efficiently
  const stats = useMemo(() => {
    if (!query.data) {
      return {
        paid: 0,
        pending: 0,
        notPaid: 0,
        total: 0,
        totalRevenue: 0,
        outstandingBalance: 0,
        invoicesDueSoon: 0,
        overdueInvoices: 0,
      };
    }

    // Destructure metrics and invoices from query data
    const { invoices, metrics } = query.data;

    const paid = invoices.filter(
      (invoice: Invoice) => invoice.status?.toLowerCase() === 'paid',
    ).length;

    const pending = invoices.filter(
      (invoice: Invoice) => invoice.status?.toLowerCase() === 'pending',
    ).length;

    const notPaid = invoices.filter(
      (invoice: Invoice) => invoice.status?.toLowerCase() === 'not_paid',
    ).length;

    return {
      paid,
      pending,
      notPaid,
      total: invoices.length,
      totalRevenue: metrics.totalRevenue || 0,
      outstandingBalance: metrics.outstandingBalance || 0,
      invoicesDueSoon: metrics.invoicesDueSoon || 0,
      overdueInvoices: metrics.overdueInvoices.length || 0,
    };
  }, [query.data]);
  return {
    ...query,
    invoices: query.data?.invoices || [],
    metrics: query.data?.metrics || {},
    stats,
  };
};

//update invoices in table
const updateInvoice = async (payload: { updatedData: Invoice[] }) => {
  const response = await apiClient.post('/invoices/update', payload); // Replace with your save endpoint
  return response.data; // Return the response from the API
};

// React Query hook to save file changes
export const useUpdateInvoiceQuery = () => {
  return useMutation(updateInvoice);
};
