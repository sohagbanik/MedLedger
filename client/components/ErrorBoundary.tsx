"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Here we would ideally send the error to Sentry or another monitoring service
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050510] p-6 text-white">
          <div className="w-full max-w-md rounded-2xl border border-[#f87171]/20 bg-[#f87171]/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f87171]/20 text-[#f87171]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#f87171]">Something went wrong</h2>
            </div>
            <p className="mb-6 text-sm text-white/70">
              An unexpected error occurred in the application. Please try refreshing the page.
            </p>
            <div className="mb-6 rounded-lg bg-black/50 p-4 font-mono text-xs text-[#f87171]/80 overflow-auto max-h-32">
              {this.state.error?.message || "Unknown error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-gradient-to-r from-[#7c6cf0] to-[#5b8cf0] py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(124,108,240,0.4)] active:scale-[0.98]"
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
