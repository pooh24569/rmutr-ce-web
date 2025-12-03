// frontend/src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);

    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-neutral-600 mb-4">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>

                        {process.env.NODE_ENV === "development" && (
                            <details className="text-left bg-neutral-100 p-4 rounded-lg mb-4 text-xs">
                                <summary className="cursor-pointer font-semibold mb-2">
                                    Error Details
                                </summary>
                                <pre className="overflow-auto">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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