import { toast, ToastOptions } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const notify = (
  message: string,
  type: ToastType = 'info',
  options: ToastOptions = {},
) => {
  const baseOptions: ToastOptions = {
    position: 'bottom-left',
    autoClose: 8000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options, // Allow overriding default options
  };

  switch (type) {
    case 'success':
      toast.success(message, baseOptions);
      break;
    case 'error':
      toast.error(message, baseOptions);
      break;
    case 'info':
      toast.info(message, baseOptions);
      break;
    case 'warning':
      toast.warn(message, baseOptions);
      break;
    default:
      toast(message, baseOptions); // Default toast
  }
};
