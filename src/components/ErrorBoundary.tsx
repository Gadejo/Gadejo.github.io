import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-red-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😵</span>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-red-600">
            We encountered an unexpected error. Don't worry, your data is safe!
          </p>
        </div>

        {/* Error Actions */}
        <div className="space-y-4 mb-6">
          <button
            onClick={onReset}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🔄 Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transform hover:scale-105 transition-all duration-200"
          >
            🔃 Refresh Page
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h3 className="font-medium text-blue-800 mb-2">What you can do:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Try refreshing the page</li>
            <li>• Check your internet connection</li>
            <li>• Clear your browser cache</li>
            <li>• Try logging out and back in</li>
          </ul>
        </div>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <details className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <summary className="font-medium text-gray-700 cursor-pointer hover:text-gray-900 mb-2">
              🔍 Error Details (Development Only)
            </summary>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-red-600">Error:</strong>
                <pre className="bg-red-50 p-2 rounded mt-1 overflow-auto text-xs">
                  {error.message}
                </pre>
              </div>
              <div>
                <strong className="text-red-600">Stack Trace:</strong>
                <pre className="bg-red-50 p-2 rounded mt-1 overflow-auto text-xs">
                  {error.stack}
                </pre>
              </div>
              {errorInfo && (
                <div>
                  <strong className="text-red-600">Component Stack:</strong>
                  <pre className="bg-red-50 p-2 rounded mt-1 overflow-auto text-xs">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Handled error:', error, errorInfo);
    
    // In production, send to error reporting service
    // reportError(error, errorInfo);
    
    throw error; // Re-throw to trigger error boundary
  };
}

export default ErrorBoundary;