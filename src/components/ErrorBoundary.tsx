
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error("Error caught by ErrorBoundary:", error);
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log detailed error information
    console.error("Uncaught error details:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
            <h2 className="text-lg font-bold text-red-700">Something went wrong</h2>
          </div>
          <div className="text-red-600 text-sm mb-4">
            {this.state.error && <p>{this.state.error.toString()}</p>}
            <p className="mt-2 text-sm text-red-500">
              This might be related to a null reference error. Please try refreshing the page.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add a default export that points to the ErrorBoundary class
export default ErrorBoundary;
