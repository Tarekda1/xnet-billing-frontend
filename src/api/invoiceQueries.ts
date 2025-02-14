import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Correct v4 import
import apiClient from './client';
import {
  FetchInvoicesParams,
  Invoice,
  InvoicesData,
  Pagination,
} from '../types/types';
import { notify } from '../utils/toastUtils';
import { useInvoiceContext } from '../context/InvoiceContext';

const fetchInvoices = async ({
  limit = 20,
  lastKey = null,
  page = 1,
  search,
}: FetchInvoicesParams): Promise<InvoicesData> => {
  const params: Record<string, string> = {
    limit: limit.toString(),
    page: page.toString(),
    search: search || '', // Include search term if provided
  };
  if (lastKey) params.lastKey = lastKey;

  const response = await apiClient.get<InvoicesData>('/invoices/list', {
    params,
  });
  return response.data;
};

export const useInvoiceQuery = ({
  limit = 20,
  lastKey = null,
  page = 1,
  search = '',
}: FetchInvoicesParams) => {
  console.log({
    limit,
    lastKey,
    page,
    search,
  });
  const { queryParams } = useInvoiceContext();
  const query = useQuery({
    queryKey: [
      'invoices',
      queryParams.page,
      queryParams.limit,
      queryParams.lastKey,
      queryParams.search,
    ],
    queryFn: () => fetchInvoices({ page, limit, lastKey, search }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60, // Renamed from cacheTime to gcTime in v4
    // Optional: Add keepPreviousData for better pagination UX
  });

  return {
    ...query, // Contains isLoading, isFetching, etc.
    invoices: query.data?.invoices || [],
    lastKey: query.data?.pagination.lastKey || null,
  };
};

const updateInvoice = async (payload: { updatedInvoices: Invoice[] }) => {
  console.log(`payload`, payload);
  const response = await apiClient.post('/invoices/update', {
    updatedData: payload.updatedInvoices,
  });
  return response.data; // ✅ Ensure API returns { message: string; updatedInvoices: Invoice[] }
};

export const useUpdateInvoiceQuery = (
  limit: number,
  page: number,
  lastKey: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; updatedInvoices: (Invoice | undefined)[] }, // ✅ Expected response type
    Error,
    {
      updatedData: {
        message: string;
        updatedInvoices: Invoice[];
      };
    }, // ✅ Expected mutation variables
    { previousData?: InvoicesData } // ✅ Context type for optimistic updates
  >({
    mutationFn: async ({ updatedData }) => {
      const response = await updateInvoice({
        updatedInvoices: updatedData.updatedInvoices,
      });

      if (!response) {
        throw new Error('Invalid API response');
      }

      return response; // ✅ Ensure correct structure is returned
    },
    onError: (err, variables, context) => {
      const queryKey = ['invoices', page, limit, lastKey];
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.error('Error updating invoice:', err);
    },
    onSuccess: (InvoicesData) => {
      const queryKey = ['invoices'];

      const allCachedKeys = queryClient.getQueriesData<InvoicesData>({
        queryKey: queryKey,
      });
      console.log(
        '🔍 Existing Cache Keys:',
        allCachedKeys.map(([key]) => key),
      );

      if (!allCachedKeys) {
        console.warn('No cached data found for key:', queryKey);
        return;
      }

      allCachedKeys.forEach(([cachedKey, oldData]) => {
        if (!oldData || !oldData.invoices) return;
        queryClient.setQueryData(cachedKey, {
          ...oldData,
          invoices: oldData.invoices.map((invoice) => {
            const updatedInvoice = InvoicesData.updatedInvoices.find(
              (u) => u?.userId === invoice.userId,
            );
            return updatedInvoice
              ? convertApiResponseToOriginalFormat(updatedInvoice)
              : invoice;
          }),
        });

        console.log(`✅ Updated cache for key:`, cachedKey);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoices', page, limit, lastKey],
      });
    },
  });
};

const convertApiResponseToOriginalFormat = (
  apiResponse: Record<string, any>,
) => {
  return {
    amount: apiResponse.amount,
    customerName: apiResponse.customer_name, // Convert `customer_name` → `customerName`
    invoiceDate: apiResponse.invoice_date,
    monthlyDate: apiResponse.monthly_date, // Convert `monthly_date` → `monthlyDate`
    notes: apiResponse.notes,
    providerName: apiResponse.providerName,
    status: apiResponse.status,
    userId: apiResponse.userId,
  };
};

// export const useUpdateInvoiceQuery = (
//   limit: number,
//   page: number,
//   lastKey: string | null,
// ) => {
//   const queryClient = useQueryClient();

//   return useMutation<
//     Invoice[], // Response type
//     Error, // Error type
//     { updatedData: Partial<Invoice>[] }, // Variables type (what you pass to mutate)
//     { previousData?: InvoicesData } // Context type (for optimistic updates)
//   >({
//     mutationFn: async ({ updatedData }) => {
//       // Assuming updateInvoice is your API call function
//       const response = await updateInvoice(updatedData);
//       return response;
//     },
//     onMutate: async ({ updatedData }) => {
//       const queryKey = ['invoices', page, limit, lastKey];

//       // Cancel any outgoing refetches
//       await queryClient.cancelQueries({ queryKey });

//       // Snapshot the previous value
//       const previousData = queryClient.getQueryData<InvoicesData>(queryKey);

//       if (previousData) {
//         // Optimistically update the cache
//         const updatedInvoices = previousData.invoices.map((invoice) => {
//           const update = updatedData.find((u) => u.userId === invoice.userId);
//           return update ? { ...invoice, ...update } : invoice;
//         });

//         queryClient.setQueryData<InvoicesData>(queryKey, {
//           ...previousData,
//           invoices: updatedInvoices,
//         });
//       }

//       // Return the previous data for potential rollback
//       return { previousData };
//     },
//     onError: (err, variables, context) => {
//       const queryKey = ['invoices', page, limit, lastKey];
//       if (context?.previousData) {
//         queryClient.setQueryData(queryKey, context.previousData);
//       }
//       console.error('Error updating invoice:', err);
//       notify(
//         `Failed to update invoice: ${err instanceof Error ? err.message : 'Unknown error'}`,
//         'error',
//       );
//     },
//     onSuccess: (data) => {
//       // Optional: Invalidate and refetch to ensure fresh data
//       queryClient.invalidateQueries({
//         queryKey: ['invoices', page, limit, lastKey],
//       });
//       notify('Invoice updated successfully!', 'success');
//     },
//   });
// };

// export const useUpdateInvoiceQuery = (
//   limit: number,
//   page: number,
//   lastKey: string | null,
// ) => {
//   return useMutation<
//     Invoice[],
//     Error,
//     { updatedData: Partial<Invoice>[] },
//     { previousData?: InvoicesData }
//   >(() => updateInvoice(updatedData), {
//     onMutate: async ({ updatedData }) => {
//       const invoiceToUpdate = updatedData[0];
//       const invoiceId = invoiceToUpdate.userId;
//       const newStatus = invoiceToUpdate.status;

//       const queryKey = ['invoices', page, limit, lastKey];
//       await queryClient.cancelQueries({ queryKey });

//       const previousData = queryClient.getQueryData<InvoicesData>(queryKey);

//       if (previousData) {
//         queryClient.setQueryData<InvoicesData>(queryKey, {
//           ...previousData,
//           invoices: previousData.invoices.map((invoice) =>
//             invoice.userId === invoiceId
//               ? { ...invoice, status: newStatus }
//               : invoice,
//           ),
//         });
//       } else {
//         console.warn('No invoices found in cache for queryKey:', queryKey);
//         return { previousData: undefined };
//       }

//       return { previousData };
//     },
//     onError: (err, variables, context) => {
//       if (context?.previousData) {
//         queryClient.setQueryData(
//           ['invoices', page, limit, lastKey],
//           context.previousData,
//         );
//       }
//       console.error('Error updating invoice:', err);
//       notify(
//         `Failed to update invoice: ${err instanceof Error ? err.message : 'Unknown error'}`,
//         'error',
//       );
//     },
//     onSuccess: () => {
//       notify('Invoice updated successfully!', 'success');
//     },
//   });
// };
