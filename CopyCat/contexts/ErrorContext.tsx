import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Error types for classification
export type ErrorType = 'connection' | 'validation' | 'authentication' | 'permission' | 'general';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  url?: string;
  statusCode?: number;
  shouldDisplay: boolean;
}

export interface Toast {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

interface ErrorContextType {
  errors: AppError[];
  toasts: Toast[];
  showConnectionErrors: boolean;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearErrors: (type?: ErrorType) => void;
  toggleConnectionErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showConnectionErrors, setShowConnectionErrors] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addError = useCallback((errorData: Omit<AppError, 'id' | 'timestamp'>) => {
    const error: AppError = {
      ...errorData,
      id: generateId(),
      timestamp: new Date(),
    };

    setErrors(prev => [...prev.slice(-49), error]); // Keep only last 50 errors

    // Console logging for debugging (always enabled)
    console.error('Error captured:', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      url: error.url,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
    });
  }, []);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'timestamp'>) => {
    const toast: Toast = {
      ...toastData,
      id: generateId(),
      timestamp: new Date(),
      duration: toastData.duration || 5000,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearErrors = useCallback((type?: ErrorType) => {
    if (type) {
      setErrors(prev => prev.filter(error => error.type !== type));
    } else {
      setErrors([]);
    }
  }, []);

  const toggleConnectionErrors = useCallback(() => {
    setShowConnectionErrors(prev => !prev);
  }, []);

  const value: ErrorContextType = {
    errors,
    toasts,
    showConnectionErrors,
    addError,
    addToast,
    removeToast,
    clearErrors,
    toggleConnectionErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Error classification utility functions
export const classifyError = (statusCode?: number, errorMessage?: string, url?: string): { type: ErrorType; severity: ErrorSeverity; shouldDisplay: boolean } => {
  const message = errorMessage?.toLowerCase() || '';
  const endpoint = url?.toLowerCase() || '';

  // Connection-related errors (should be suppressed from UI)
  const connectionErrorPatterns = [
    'network error',
    'fetch error',
    'connection',
    'timeout',
    'aborted',
    'dns',
    'enotfound',
    'database',
    'pool',
    'reset',
    'server unavailable',
    'service unavailable'
  ];

  const connectionStatusCodes = [408, 502, 503, 504, 522, 523, 524];

  // Check for connection errors
  if (
    connectionStatusCodes.includes(statusCode || 0) ||
    connectionErrorPatterns.some(pattern => message.includes(pattern))
  ) {
    return {
      type: 'connection',
      severity: 'medium',
      shouldDisplay: false // Suppress from UI
    };
  }

  // Authentication errors
  if (statusCode === 401) {
    return {
      type: 'authentication',
      severity: 'high',
      shouldDisplay: true
    };
  }

  // Permission errors
  if (statusCode === 403) {
    return {
      type: 'permission',
      severity: 'high',
      shouldDisplay: true
    };
  }

  // Validation errors
  if (statusCode === 422 || statusCode === 400) {
    return {
      type: 'validation',
      severity: 'medium',
      shouldDisplay: true
    };
  }

  // Rate limiting
  if (statusCode === 429) {
    return {
      type: 'general',
      severity: 'medium',
      shouldDisplay: true
    };
  }

  // Default for other errors
  return {
    type: 'general',
    severity: 'medium',
    shouldDisplay: true
  };
};