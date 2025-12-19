import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default function ErrorBoundary({ children }: Props) {
    return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>
}

class ErrorBoundaryInner extends Component<Props, State> {
    public state: State = {
        hasError: false
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
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-red-100 dark:border-red-900/30">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm">
                            An unexpected error occurred. We've been notified and are working to fix it.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Application
                        </button>

                        {this.state.error && (
                            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded text-xs font-mono text-slate-500 overflow-auto max-h-32">
                                {this.state.error.toString()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
