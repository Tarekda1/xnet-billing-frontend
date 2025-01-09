import React from 'react';
import { useTransactionsQuery } from '../../api/transactionsQueries';
import { Transaction } from '../../types/types';

const DashboardTransactions = () => {
  const { transactions, isLoading, isError } = useTransactionsQuery();

  if (isLoading)
    return <div className="text-center">Loading transactions...</div>;
  if (isError)
    return (
      <div className="text-center text-red-500">
        Error loading transactions.
      </div>
    );

  // Get the last 5 transactions
  const lastTransactions = transactions.slice(-5).reverse();

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Invoice ID</th>
            </tr>
          </thead>
          <tbody>
            {lastTransactions.map((transaction: Transaction) => (
              <tr key={transaction.transactionId}>
                <td className="truncate max-w-xs">
                  {transaction.transactionId}
                </td>
                <td className="truncate max-w-xs">{transaction.userId}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>
                  <span
                    className={`badge ${
                      transaction.status === 'paid'
                        ? 'badge-success'
                        : transaction.status === 'pending'
                          ? 'badge-warning'
                          : 'badge-error'
                    }`}
                  >
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.invoiceId || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTransactions;
