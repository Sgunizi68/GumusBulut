import React from 'react';
import { Toast, useErrorContext } from '../contexts/ErrorContext';
import { Icons } from '../constants';

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getToastIcon = () => {
    switch (toast.type) {
      case 'error':
        return <Icons.ExclamationTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Icons.ExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <Icons.CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
      default:
        return <Icons.InformationCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`max-w-sm w-full shadow-lg rounded-lg border pointer-events-auto ${getToastStyles()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getToastIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => onClose(toast.id)}
            >
              <span className="sr-only">Kapat</span>
              <Icons.Close className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useErrorContext();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

// Connection Status Banner Component
export const ConnectionStatusBanner: React.FC = () => {
  const { errors, showConnectionErrors } = useErrorContext();
  
  const recentConnectionErrors = errors.filter(
    error => 
      error.type === 'connection' && 
      (Date.now() - error.timestamp.getTime()) < 30000 // Last 30 seconds
  );

  if (recentConnectionErrors.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Icons.ExclamationTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Bağlantı sorunu yaşanıyor. Sistem otomatik olarak yeniden deniyor...
          </p>
          {showConnectionErrors && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-yellow-600 hover:text-yellow-800">
                Teknik detayları göster
              </summary>
              <div className="mt-1 text-xs text-yellow-600 space-y-1">
                {recentConnectionErrors.slice(0, 3).map(error => (
                  <div key={error.id} className="font-mono">
                    {error.url} - {error.message}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility functions for easy toast creation
export const useToast = () => {
  const { addToast } = useErrorContext();

  return {
    showError: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message: message || '', duration });
    },
    showWarning: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message: message || '', duration });
    },
    showSuccess: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message: message || '', duration });
    },
    showInfo: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message: message || '', duration });
    },
  };
};