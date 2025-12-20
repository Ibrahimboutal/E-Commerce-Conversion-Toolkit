/**
 * Skeleton component for loading states
 */

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const baseClasses = 'bg-slate-200 dark:bg-slate-700';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-pulse', // Could implement wave animation with CSS
        none: '',
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
}

/**
 * Skeleton for table rows
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 items-center">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            className="flex-1"
                            height={colIndex === 0 ? 40 : 20}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for cards
 */
export function SkeletonCard() {
    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <Skeleton width="60%" height={24} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="80%" height={16} />
            <div className="flex gap-4 mt-6">
                <Skeleton width={100} height={36} className="rounded-full" />
                <Skeleton width={100} height={36} className="rounded-full" />
            </div>
        </div>
    );
}

/**
 * Skeleton for stats/metrics
 */
export function SkeletonStat() {
    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
                <Skeleton width={120} height={20} />
                <Skeleton variant="circular" width={40} height={40} />
            </div>
            <Skeleton width={80} height={32} className="mb-2" />
            <Skeleton width={150} height={16} />
        </div>
    );
}

/**
 * Skeleton for charts
 */
export function SkeletonChart({ height = 300 }: { height?: number }) {
    return (
        <div className="space-y-4">
            <Skeleton width="40%" height={24} />
            <div className="flex items-end justify-between gap-2" style={{ height }}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="flex-1"
                        height={Math.random() * height * 0.8 + height * 0.2}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Skeleton for list items
 */
export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1 space-y-2">
                        <Skeleton width="30%" height={20} />
                        <Skeleton width="60%" height={16} />
                    </div>
                    <Skeleton width={80} height={32} className="rounded-full" />
                </div>
            ))}
        </div>
    );
}
