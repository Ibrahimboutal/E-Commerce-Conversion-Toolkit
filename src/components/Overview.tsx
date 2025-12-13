import { useEffect, useState } from 'react';
import { supabase, Store, AbandonedCart, Review } from '../lib/supabase';
import { ShoppingCart, TrendingUp, DollarSign, Star, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    loadData();
  }, []);

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
    const { data: carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('store_id', storeId);

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('store_id', storeId);

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
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">No Store Connected</h3>
            <p className="text-amber-800 mb-4">
              Connect your e-commerce store to start tracking abandoned carts and analyzing reviews.
            </p>
            <p className="text-sm text-amber-700">
              Go to Settings to add your store integration.
            </p>
          </div>
        </div>
      </div>
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
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
    },
  ];

  const recoveryRate = metrics.totalCarts > 0
    ? ((metrics.recovered / metrics.totalCarts) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back!</h2>
        <p className="text-slate-600">
          Store: <span className="font-medium">{store?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Insights</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Cart Recovery Rate</span>
              <span className="font-bold text-emerald-600">{recoveryRate}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${recoveryRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Customer Satisfaction</span>
              <span className="font-bold text-amber-600">
                {metrics.averageRating.toFixed(1)}/5.0
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${(metrics.averageRating / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
