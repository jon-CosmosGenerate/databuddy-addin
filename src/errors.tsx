// src/errors.tsx

// Define the types first
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'database' | 'excel' | 'network' | 'validation' | 'auth' | 'unknown';

// Export the AppError class
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: ErrorSeverity,
    public category: ErrorCategory,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static database(message: string, originalError?: unknown): AppError {
    return new AppError(message, 'DB_ERROR', 'high', 'database', originalError);
  }

  static excel(message: string, originalError?: unknown): AppError {
    return new AppError(message, 'EXCEL_ERROR', 'high', 'excel', originalError);
  }

  static validation(message: string): AppError {
    return new AppError(message, 'VALIDATION_ERROR', 'medium', 'validation');
  }

  static function(message: string, originalError?: unknown): AppError {
    return new AppError(message, 'FUNCTION_ERROR', 'high', 'unknown', originalError);
  }
}

// Error context and provider
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ErrorContextType {
  error: AppError | null;
  setError: (error: AppError | null) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<AppError | null>(null);
  const clearError = useCallback(() => setError(null), []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Error logger
class ErrorLogger {
  private static instance: ErrorLogger;
  
  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(error: AppError): void {
    console.error('Error:', {
      message: error.message,
      code: error.code,
      severity: error.severity,
      category: error.category,
      timestamp: new Date(),
    });
  }
}

export const errorLogger = ErrorLogger.getInstance();