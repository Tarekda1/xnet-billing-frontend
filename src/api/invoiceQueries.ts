// src/api/fileQueries.ts
import { useMutation, useQuery } from 'react-query';
import apiClient from './client';
import { Invoice } from '../types/types'; // Import the type
import { useMemo } from 'react';

// Function to fetch invoices
const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get('/invoices/list');
  return response.data?.invoices?.Items || [];
};

// React Query hook to fetch invoices
export const useInvoiceQuery = () => {
  const query = useQuery<Invoice[]>('invoices', fetchInvoices);

  // Use useMemo to calculate stats efficiently
  const stats = useMemo(() => {
    if (!query.data) return { paid: 0, pending: 0, total: 0 };

    const paid = query.data.filter(
      (invoice) => invoice.status?.toLowerCase() === 'paid',
    ).length;
    const pending = query.data.filter(
      (invoice) => invoice.status?.toLowerCase() === 'pending',
    ).length;

    return { paid, pending, total: query.data.length };
  }, [query.data]);
  return { ...query, stats };
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
