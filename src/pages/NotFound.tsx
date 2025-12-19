import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="w-12 h-12 text-slate-400" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
}
