
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon'; // New Icon

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
    // You could also log the error to an error reporting service here
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="bg-slate-800 p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg">
            <ExclamationTriangleIcon className="mx-auto h-20 w-20 text-red-500 mb-6" />
            <h1 className="text-3xl font-bold text-red-400 mb-3">Oops! Something Went Wrong</h1>
            <p className="text-slate-300 text-lg mb-2">
              We encountered an unexpected issue. Our team has been notified.
            </p>
            <p className="text-slate-400 text-md mb-6">
              Please try refreshing the page. If the problem persists, please check back later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left text-xs text-slate-500 bg-slate-700 p-3 rounded">
                <summary className="cursor-pointer hover:text-slate-300">Error Details (Development Only)</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
