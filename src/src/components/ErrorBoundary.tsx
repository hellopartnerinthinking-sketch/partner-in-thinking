import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-serif mb-4">Something went wrong.</h2>
            <p className="text-brand-ink/60 mb-6">
              {this.state.error?.message.startsWith('{') 
                ? "There was a database permission error. Please check the security rules."
                : "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest"
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
