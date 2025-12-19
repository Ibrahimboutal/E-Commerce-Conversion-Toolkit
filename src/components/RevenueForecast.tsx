import { TrendingUp, Lock } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion } from 'framer-motion';

type RevenueForecastProps = {
    currentRevenue: number;
    history?: { date: string; revenue: number }[];
};

export default function RevenueForecast({ currentRevenue, history = [] }: RevenueForecastProps) {
    const { isPro, openCheckout } = useSubscription();

    const calculateProjection = () => {
        if (!history || history.length < 2) {
            // Fallback
            return {
                nextMonth: currentRevenue * 1.15,
                threeMonth: currentRevenue * 1.52,
                growth: 0.15
            };
        }

        const n = history.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        history.forEach((point, i) => {
            sumX += i;
            sumY += point.revenue;
            sumXY += i * point.revenue;
            sumXX += i * i;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Project next 30 days
        const nextMonthDaily = Array.from({ length: 30 }, (_, i) => {
            return slope * (n + i) + intercept;
        });

        const nextMonthTotal = nextMonthDaily.reduce((a, b) => a + Math.max(0, b), 0);

        const currentRate = currentRevenue > 0
            ? (nextMonthTotal - currentRevenue) / currentRevenue
            : 0;

        return {
            nextMonth: nextMonthTotal || currentRevenue * 1.1,
            threeMonth: nextMonthTotal * 3,
            growth: currentRate || 0.1
        };
    };

    const projection = calculateProjection();

    if (!isPro) {
        return (
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-full">
                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Unlock Revenue Forecasts</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        See how much you could earn next month based on current trends.
                    </p>
                    <button
                        onClick={openCheckout}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Upgrade to Pro
                    </button>
                </div>

                {/* Blurred Content Background */}
                <div className="opacity-50 blur-sm pointer-events-none">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Forecast</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500">Next Month Potential</p>
                            <p className="text-2xl font-bold text-slate-900">$12,450.00</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Forecast</h3>
                </div>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                    PRO
                </span>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Next Month Projection</p>
                        <span className={`text-xs font-medium ${projection.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {projection.growth > 0 ? '+' : ''}{Math.round(projection.growth * 100)}% growth
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        ${projection.nextMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Based on {history.length} days of data</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">3 Month Goal</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                        ${projection.threeMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
