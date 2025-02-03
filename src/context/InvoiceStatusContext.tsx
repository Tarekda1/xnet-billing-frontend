import React, { createContext, useContext, useState } from 'react';
import { Invoice } from '../types/types';

interface InvoiceStatusContextType {
  localStatuses: Record<string, string>;
  setLocalStatuses: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

const InvoiceStatusContext = createContext<
  InvoiceStatusContextType | undefined
>(undefined);

export const InvoiceStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    {},
  );

  return (
    <InvoiceStatusContext.Provider value={{ localStatuses, setLocalStatuses }}>
      {children}
    </InvoiceStatusContext.Provider>
  );
};

export const useInvoiceStatus = () => {
  const context = useContext(InvoiceStatusContext);
  if (!context) {
    throw new Error(
      'useInvoiceStatus must be used within an InvoiceStatusProvider',
    );
  }
  return context;
};
