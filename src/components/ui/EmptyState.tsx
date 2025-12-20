import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Empty state component for when no data is available
 */

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    children,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            {Icon && (
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
            )}

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                    {action.label}
                </button>
            )}

            {children}
        </div>
    );
}

/**
 * Preset empty states for common scenarios
 */

export function EmptyStateNoData({
    title = 'No data available',
    description = 'There is no data to display at the moment.',
    action,
}: Partial<EmptyStateProps>) {
    return (
        <EmptyState
            title={title}
            description={description}
            action={action}
        />
    );
}

export function EmptyStateSearch({
    searchTerm,
    onClear,
}: {
    searchTerm: string;
    onClear: () => void;
}) {
    return (
        <EmptyState
            title="No results found"
            description={`We couldn't find any results for "${searchTerm}". Try adjusting your search.`}
            action={{
                label: 'Clear search',
                onClick: onClear,
            }}
        />
    );
}

export function EmptyStateError({
    title = 'Something went wrong',
    description = 'We encountered an error while loading the data.',
    onRetry,
}: {
    title?: string;
    description?: string;
    onRetry: () => void;
}) {
    return (
        <EmptyState
            title={title}
            description={description}
            action={{
                label: 'Try again',
                onClick: onRetry,
            }}
        />
    );
}
