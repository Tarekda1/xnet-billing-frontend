// src/api/invoiceQueries.ts
import { useMutation, useQuery, useQueryClient } from 'react-query';
import apiClient from './client';
import { Invoice, InvoicesData } from '../types/types';
import { notify } from '../utils/toastUtils';
import { useMemo } from 'react';

// Function to fetch invoices
const fetchInvoices = async (): Promise<InvoicesData> => {
  const response = await apiClient.get('/invoices/list');
  return response.data;
};

// React Query hook to fetch invoices with optimized configurations
export const useInvoiceQuery = () => {
  const query = useQuery<InvoicesData>('invoices', fetchInvoices, {
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    refetchOnMount: false, // Do not refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Do not refetch on window focus
  });

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

// Function to update invoices
const updateInvoice = async (payload: {
  updatedData: Partial<Invoice>[];
}): Promise<Invoice[]> => {
  const response = await apiClient.post('/invoices/update', payload);
  return response.data;
};

// React Query hook to update invoices with optimized cache updates
export const useUpdateInvoiceQuery = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Invoice[], // Expected data type returned by the mutation
    Error, // Error type
    { updatedData: Partial<Invoice>[] }, // Variables (payload)
    { previousData?: InvoicesData } // Context type
  >(updateInvoice, {
    onMutate: async ({ updatedData }) => {
      const invoiceToUpdate = updatedData[0];
      const invoiceId = invoiceToUpdate.userId; // Use invoiceId
      const newStatus = invoiceToUpdate.status;

      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries('invoices');

      // Snapshot the previous data
      const previousData = queryClient.getQueryData<InvoicesData>('invoices');

      // Optimistically update the cache
      if (previousData) {
        queryClient.setQueryData<InvoicesData>('invoices', {
          ...previousData,
          invoices: previousData.invoices.map((invoice) =>
            invoice.userId === invoiceId
              ? { ...invoice, status: newStatus }
              : invoice,
          ),
        });
      } else {
        console.error('No invoices found in cache');
      }

      // Return the context with the previous data for rollback in case of error
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert to the previous data if the mutation fails
      if (context?.previousData) {
        queryClient.setQueryData<InvoicesData>(
          'invoices',
          context.previousData,
        );
      }
      console.error('Error updating invoice:', err);
      notify(
        `Failed to update invoice: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
        'error',
      );
    },
    onSuccess: (data, variables, context) => {
      // No cache update here to prevent redundant setQueryData
      notify('Invoice updated successfully!', 'success');
    },
    // No onSettled to prevent refetching the entire list
  });
};
