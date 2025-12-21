import { TrendingUp, Lock, Calendar, Target } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type RevenueForecastProps = {
    currentRevenue: number;
    history?: { date: string; revenue: number }[];
};

export default function RevenueForecast({ currentRevenue, history = [] }: RevenueForecastProps) {
    const { isPro, openCheckout } = useSubscription();

    const calculateProjection = () => {
        if (!history || history.length < 2) {
            return {
                nextMonth: currentRevenue * 1.15,
                threeMonth: currentRevenue * 1.52,
                growth: 0.15,
                chartData: []
            };
        }

        const n = history.length;
        let sumW = 0;
        let sumWX = 0;
        let sumWY = 0;
        let sumWXX = 0;
        let sumWXY = 0;

        // Use weighted linear regression: more recent data is more important
        history.forEach((point, i) => {
            const weight = Math.pow(1.1, i); // Exponential weight
            sumW += weight;
            sumWX += i * weight;
            sumWY += point.revenue * weight;
            sumWXX += i * i * weight;
            sumWXY += i * point.revenue * weight;
        });

        const slope = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
        const intercept = (sumWY - slope * sumWX) / sumW;

        // Project next 30 days
        const projectionPoints = Array.from({ length: 30 }, (_, i) => {
            const x = n + i;
            return Math.max(0, slope * x + intercept);
        });

        const nextMonthTotal = projectionPoints.reduce((a, b) => a + b, 0);
        const currentRate = currentRevenue > 0
            ? (nextMonthTotal - currentRevenue) / currentRevenue
            : 0;

        // Prepare chart data
        const chartData = [
            ...history.slice(-7).map(h => ({ date: h.date, revenue: h.revenue, type: 'actual' })),
            ...projectionPoints.slice(0, 7).map((v, i) => ({
                date: `Day ${i + 1}`,
                revenue: Math.round(v),
                type: 'projected'
            }))
        ];

        return {
            nextMonth: nextMonthTotal || currentRevenue * 1.1,
            threeMonth: nextMonthTotal * 3,
            growth: currentRate || 0.1,
            chartData
        };
    };

    const projection = calculateProjection();

    if (!isPro) {
        return (
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-full shadow-sm">
                <div className="absolute inset-0 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 rotate-3">
                        <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Revenue Forecasting</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-[200px]">
                        Leverage AI and historical data to predict your future growth.
                    </p>
                    <button
                        onClick={openCheckout}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                    >
                        Unlock Pro Features
                    </button>
                </div>

                <div className="opacity-30 blur-sm pointer-events-none scale-95 origin-center">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold">Revenue Dashboard</h3>
                    </div>
                    <div className="h-40 w-full bg-slate-100 dark:bg-slate-700 rounded-lg mb-4" />
                    <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-600 rounded" />
                        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-600 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 h-full shadow-sm border-b-4 border-b-emerald-500"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Growth Forecast</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Weighted Predictive Analysis</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mb-1">PRO ENGINE</span>
                    <div className={`flex items-center gap-1 text-sm font-bold ${projection.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {projection.growth > 0 ? '+' : ''}{Math.round(projection.growth * 100)}%
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="h-48 w-full -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projection.chartData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <p className="text-xs font-medium">30-Day Forecast</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            ${projection.nextMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                            <Target className="w-4 h-4" />
                            <p className="text-xs font-medium">90-Day Target</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            ${projection.threeMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

