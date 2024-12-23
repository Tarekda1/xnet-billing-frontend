// src/api/fileQueries.ts
import { useMutation, useQuery } from 'react-query';
import apiClient from './client';
import { Invoice } from '../types'; // Import the type

// Function to fetch invoices
const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await apiClient.get('/invoices/list');
  return response.data?.invoices?.Items || [];
};

// React Query hook to fetch invoices
export const useInvoiceQuery = () => {
  return useQuery<Invoice[]>('invoices', fetchInvoices);
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
