// src/layouts/Home.tsx

import React from 'react';
import InvoiceList from '../components/invoiceComponents/InvoiceList';

const HomeLayout: React.FC = () => {
  return (
    <div>
      <InvoiceList />
    </div>
  );
};

export default HomeLayout;
