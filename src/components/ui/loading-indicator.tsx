
import React from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The loading state
   */
  isLoading?: boolean;
  /**
   * The error state
   */
  error?: string | null;
  /**
   * The success state
   */
  success?: boolean;
  /**
   * The loading message
   */
  loadingMessage?: string;
  /**
   * The error message
   */
  errorMessage?: string;
  /**
   * The success message
   */
  successMessage?: string;
  /**
   * The size of the indicator
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show a retry button when there's an error
   */
  showRetry?: boolean;
  /**
   * Callback for retry button
   */
  onRetry?: () => void;
  /**
   * Whether to show the spinner
   */
  showSpinner?: boolean;
}

export function LoadingIndicator({
  isLoading = false,
  error = null,
  success = false,
  loadingMessage = 'Loading...',
  errorMessage,
  successMessage = 'Completed successfully',
  size = 'md',
  showRetry = false,
  onRetry,
  showSpinner = true,
  className,
  ...props
}: LoadingIndicatorProps) {
  // Determine the size of the spinner and text
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];
  
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  // Determine content to render based on state
  if (error) {
    return (
      <div className={cn('flex items-center', className)} {...props}>
        <AlertCircle className={cn('text-red-500 mr-2', spinnerSize)} />
        <div className="flex-grow">
          <p className={cn('text-red-500 font-medium', textSize)}>
            {errorMessage || error}
          </p>
        </div>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            className={cn(
              'ml-2 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50',
              textSize
            )}
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  
  if (success) {
    return (
      <div className={cn('flex items-center', className)} {...props}>
        <CheckCircle className={cn('text-green-500 mr-2', spinnerSize)} />
        <p className={cn('text-green-600 font-medium', textSize)}>
          {successMessage}
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={cn('flex items-center', className)} {...props}>
        {showSpinner && (
          <Loader2 className={cn('animate-spin text-primary mr-2', spinnerSize)} />
        )}
        <p className={cn('text-slate-600', textSize)}>
          {loadingMessage}
        </p>
      </div>
    );
  }
  
  // Return null if none of the states match
  return null;
}

export default LoadingIndicator;
