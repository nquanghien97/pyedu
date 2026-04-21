import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  hideProgressBar: true,
  autoClose: 1000,
  position: 'top-right',
  pauseOnHover: false,
  closeOnClick: true,
  draggable: true,
};

export const notification = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultOptions, ...options }),

  info: (message: string, options?: ToastOptions) =>
    toast.info(message, { ...defaultOptions, ...options }),

  warning: (message: string, options?: ToastOptions) =>
    toast.warning(message, { ...defaultOptions, ...options }),
};
