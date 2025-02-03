import React, { useState, useEffect } from 'react';
import { Invoice } from '../../types/types';

interface InvoiceEditSidebarProps {
  invoice: Invoice;
  onClose: () => void;
  onSave: (updatedInvoice: Invoice) => void;
}

const InvoiceEditSidebar: React.FC<InvoiceEditSidebarProps> = ({
  invoice,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Invoice>({ ...invoice });
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const formatDate = (dateString: string) => {
      if (!dateString) return ''; // Handle empty values
      return new Date(dateString).toISOString().split('T')[0]; // ✅ Extract "yyyy-MM-dd"
    };
    console.log('invoice', invoice);
    setFormData({
      ...invoice,
      invoiceDate: formatDate(invoice.invoiceDate || new Date().toUTCString()),
      monthlyDate: formatDate(invoice.monthlyDate || new Date().toUTCString()),
    });
  }, [invoice]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle save button click
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-6 z-50 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Edit Invoice</h2>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>

      <div className="mb-4">
        <label
          htmlFor="customer_name"
          className="block text-sm font-medium text-gray-700"
        >
          Client Name
        </label>
        <input
          type="text"
          id="customer_name"
          name="customer_name"
          value={formData.customerName}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status?.toLowerCase()}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="not paid">Not Paid</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700"
        >
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.invoiceDate}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700"
        >
          Monthly Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.monthlyDate}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mr-2"
        >
          Save
        </button>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InvoiceEditSidebar;
