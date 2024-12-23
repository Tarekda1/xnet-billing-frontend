type LoadingInvoices = { [key: string]: boolean };

export interface TableProps {
  headers: { label: string; accessor: keyof Invoice; tooltip: string }[];
  data: (Invoice & { statusComponent?: React.ReactNode })[];
  onDelete?: (invoiceId: string) => void;
  onEdit?: (invoice: Invoice) => void;
  onPaid?: (invoice: Invoice) => void;
  loadingInvoices: LoadingInvoices;
}
