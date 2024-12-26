import { Invoice } from '../types/types';
import InvoiceEditSidebar from './invoiceComponents/InvoiceEditSidebar';

const InvoiceSidebar = ({
  selectedInvoice,
  onSave,
  onClose,
}: {
  selectedInvoice: any;
  onSave: (arg0: any) => void;
  onClose: () => void;
}) => {
  if (!selectedInvoice) return null;

  const handleSave = (updatedInvoice: Invoice) => {
    onSave(updatedInvoice);
    onClose();
  };

  return (
    <InvoiceEditSidebar
      invoice={selectedInvoice}
      onClose={onClose}
      onSave={handleSave}
    />
  );
};

export default InvoiceSidebar;
