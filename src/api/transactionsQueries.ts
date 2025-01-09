import { useQuery } from 'react-query';
import apiClient from './client';
import { Transaction } from '../types/types'; // Import the Transaction type
import { useMemo } from 'react';

// Function to fetch transactions
const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.get('/transactions/list');
  return response.data.transactions; // Assuming the API returns an array of transactions
};

// React Query hook to fetch transactions
export const useTransactionsQuery = () => {
  const query = useQuery<Transaction[]>('transactions', fetchTransactions);

  // Use useMemo to calculate transaction stats or derived data efficiently
  const stats = useMemo(() => {
    if (!query.data) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
      };
    }

    const totalTransactions = query.data.length;

    const totalAmount = query.data.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);

    const completedTransactions = query.data.filter(
      (transaction) => transaction.status?.toLowerCase() === 'paid',
    ).length;

    const pendingTransactions = query.data.filter(
      (transaction) => transaction.status?.toLowerCase() === 'pending',
    ).length;

    return {
      totalTransactions,
      totalAmount,
      completedTransactions,
      pendingTransactions,
    };
  }, [query.data]);

  return {
    ...query,
    transactions: query.data || [],
    stats,
  };
};
