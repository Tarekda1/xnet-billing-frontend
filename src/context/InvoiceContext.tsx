// src/context/InvoiceContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FetchInvoicesParams } from '../types/types';

interface InvoiceContextType {
  queryParams: FetchInvoicesParams & { currentPage: number };
  setQueryParams: React.Dispatch<
    React.SetStateAction<FetchInvoicesParams & { currentPage: number }>
  >;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

interface InvoiceProviderProps {
  children: ReactNode;
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({
  children,
}) => {
  const [queryParams, setQueryParams] = useState<
    FetchInvoicesParams & { currentPage: number }
  >({
    limit: 20,
    lastKey: null,
    selectedMonthYear: '',
    statusFilters: { paid: true, pending: true, 'not paid': true },
    currentPage: 1,
  });

  return (
    <InvoiceContext.Provider value={{ queryParams, setQueryParams }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
};
