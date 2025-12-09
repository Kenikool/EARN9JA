import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card bg-base-100 border max-w-md w-full">
            <div className="card-body text-center">
              <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
              <h2 className="card-title justify-center text-2xl mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-base-content/60 mb-4">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <div className="alert alert-error text-left">
                  <div className="text-xs">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
