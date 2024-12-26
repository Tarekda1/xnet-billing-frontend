export type InvoiceState = {
  loading: Record<string, boolean>;
  status: Record<string, string>;
};

type Action =
  | { type: 'SET_LOADING'; payload: { invoiceId: string; isLoading: boolean } }
  | { type: 'SET_STATUS'; payload: { invoiceId: string; status: string } }
  | { type: 'RESET_LOADING'; payload: { invoiceId: string } };

// const [invoiceState, setInvoiceState] = useState({
//   loading: {},
//   status: {},
// });
const InvoiceReducer = (state: InvoiceState, action: Action): InvoiceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.invoiceId]: action.payload.isLoading,
        },
      };
    case 'SET_STATUS':
      return {
        ...state,
        status: {
          ...state.status,
          [action.payload.invoiceId]: action.payload.status,
        },
      };
    case 'RESET_LOADING':
      const { [action.payload.invoiceId]: _, ...remainingLoading } =
        state.loading;
      return {
        ...state,
        loading: remainingLoading,
      };
    default:
      return state;
  }
};

export default InvoiceReducer;
