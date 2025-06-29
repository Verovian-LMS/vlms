
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface ErrorOptions {
  title?: string;
  source?: string;
  context?: Record<string, any>;
  silent?: boolean;
}

export function useErrorHandler() {
  const { toast } = useToast();
  
  const handleError = useCallback((error: unknown, options: ErrorOptions = {}) => {
    // Extract error message based on error type
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
        ? error
        : 'An unknown error occurred';
    
    // Log the error with context for debugging
    console.error(`Error in ${options.source || 'unknown component'}:`, {
      message: errorMessage,
      error,
      context: options.context || {}
    });
    
    // Only show toast if not silent
    if (!options.silent) {
      toast({
        title: options.title || 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    return errorMessage;
  }, [toast]);
  
  return { handleError };
}
