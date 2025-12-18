import { useEffect, useState } from 'react';
import { supabase, Store } from '../lib/supabase';
import { ShoppingCart, TrendingUp, DollarSign, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TopProducts from './TopProducts';

type Metrics = {
  totalCarts: number;
  remindersSent: number;
  recovered: number;
  recoveredRevenue: number;
  totalReviews: number;
  averageRating: number;
};

export default function Overview() {
  const [store, setStore] = useState<Store | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    totalCarts: 0,
    remindersSent: 0,
    recovered: 0,
    recoveredRevenue: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .maybeSingle();

      if (stores) {
        setStore(stores);
        setHasStore(true);
        await loadMetrics(stores.id);
      } else {
        setHasStore(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async (storeId: string) => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('store_id', storeId)
      .gte('created_at', startDate.toISOString());

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('store_id', storeId)
      .gte('created_at', startDate.toISOString());

    const totalCarts = carts?.length || 0;
    const remindersSent = carts?.filter(c => c.reminder_sent).length || 0;
    const recoveredCarts = carts?.filter(c => c.recovered) || [];
    const recovered = recoveredCarts.length;
    const recoveredRevenue = recoveredCarts.reduce((sum, c) => sum + Number(c.total_price), 0);
    const totalReviews = reviews?.length || 0;
    const averageRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    setMetrics({
      totalCarts,
      remindersSent,
      recovered,
      recoveredRevenue,
      totalReviews,
      averageRating,
    });

    // Process chart data
    const lastDays = [...Array(days)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyRevenue = lastDays.map(date => {
      const dayRevenue = recoveredCarts
        .filter(c => c.created_at.startsWith(date))
        .reduce((sum, c) => sum + Number(c.total_price), 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue
      };
    });

    setChartData(dailyRevenue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!hasStore) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">No Store Connected</h3>
            <p className="text-amber-800 dark:text-amber-300 mb-4">
              Connect your e-commerce store to start tracking abandoned carts and analyzing reviews.
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Go to Settings to add your store integration.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const stats = [
    {
      label: 'Abandoned Carts',
      value: metrics.totalCarts,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Reminders Sent',
      value: metrics.remindersSent,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Recovered Carts',
      value: metrics.recovered,
      icon: ShoppingCart,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Recovered Revenue',
      value: `$${metrics.recoveredRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-teal-500',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Total Reviews',
      value: metrics.totalReviews,
      icon: Star,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Average Rating',
      value: metrics.averageRating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const recoveryRate = metrics.totalCarts > 0
    ? ((metrics.recovered / metrics.totalCarts) * 100).toFixed(1)
    : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back!</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Store: <span className="font-medium text-slate-900 dark:text-white">{store?.name}</span>
        </p>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${dateRange === range
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              variants={item}
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value: number | undefined) => [value != null ? `$${value}` : '$0', 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance Insights</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400">Cart Recovery Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-500">{recoveryRate}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${recoveryRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400">Customer Satisfaction</span>
                <span className="font-bold text-amber-600 dark:text-amber-500">
                  {metrics.averageRating.toFixed(1)}/5.0
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-amber-500 dark:bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${(metrics.averageRating / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TopProducts />
      </div>
    </motion.div>
  );
}
