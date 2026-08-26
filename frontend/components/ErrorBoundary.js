"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log safe telemetry to console/monitoring without leaking PII
    console.error("[ErrorBoundary] Caught UI error:", error?.message);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-left">
          <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Service Temporarily Unavailable
              </h3>
              <p className="text-xs text-slate-500">
                An unexpected interface issue occurred. Your data remains completely safe. Please try refreshing the page.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="w-3.5 h-3.5" />
                Go to Home
              </Button>
              <Button
                size="sm"
                className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold gap-1.5"
                onClick={this.handleReset}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
