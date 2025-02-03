// src/layouts/Home.tsx

import React from 'react';
import InvoiceList from '../components/invoiceComponents/InvoiceList';
import { InvoiceStatusProvider } from '../context/InvoiceStatusContext';

const HomeLayout: React.FC = () => {
  return (
    <div>
      <InvoiceStatusProvider>
        <InvoiceList />
      </InvoiceStatusProvider>
    </div>
  );
};

export default HomeLayout;
