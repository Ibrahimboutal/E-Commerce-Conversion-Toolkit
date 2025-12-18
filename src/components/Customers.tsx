import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Mail, ShoppingBag, DollarSign, Calendar, FileDown, Crown, Shield, AlertTriangle, Lock } from 'lucide-react';
import { exportToCSV } from '../utils/export';
import { useSubscription } from '../contexts/SubscriptionContext';

type Customer = {
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastSeen: string;
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPro, openCheckout } = useSubscription();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .maybeSingle();

      if (!stores) {
        setLoading(false);
        return;
      }

      // Fetch all carts and reviews to aggregate customer data
      const { data: carts } = await supabase
        .from('abandoned_carts')
        .select('customer_email, customer_name, total_price, recovered, created_at')
        .eq('store_id', stores.id);

      const customerMap = new Map<string, Customer>();

      carts?.forEach((cart) => {
        const email = cart.customer_email;
        if (!email) return;

        const current = customerMap.get(email) || {
          email,
          name: cart.customer_name || 'Anonymous',
          totalOrders: 0,
          totalSpent: 0,
          lastSeen: cart.created_at,
        };

        if (cart.recovered) {
          current.totalOrders += 1;
          current.totalSpent += Number(cart.total_price);
        }

        // Update last seen if this cart is newer
        if (new Date(cart.created_at) > new Date(current.lastSeen)) {
          current.lastSeen = cart.created_at;
        }

        // Update name if we have a better one
        if (cart.customer_name && current.name === 'Anonymous') {
          current.name = cart.customer_name;
        }

        customerMap.set(email, current);
      });

      setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(customers, 'customers')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium">
            {customers.length} Total Customers
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Customer</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Segments</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Orders</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Total Spent</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {customers.map((customer) => {
                const isVip = customer.totalSpent > 500;
                const isLoyal = customer.totalOrders > 2;
                const daysSinceSeen = Math.floor((new Date().getTime() - new Date(customer.lastSeen).getTime()) / (1000 * 3600 * 24));
                const isRisk = daysSinceSeen > 60;

                return (
                  <tr key={customer.email} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
                          <Users className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{customer.name}</p>
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {!isPro ? (
                        <div className="relative group cursor-pointer" onClick={openCheckout}>
                          <div className="flex gap-1 blur-sm opacity-60 select-none">
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">VIP</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">Loyal</span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {isVip && (
                            <div className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                              <Crown className="w-3 h-3" /> VIP
                            </div>
                          )}
                          {isLoyal && (
                            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                              <Shield className="w-3 h-3" /> Loyal
                            </div>
                          )}
                          {isRisk && (
                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" /> Risk
                            </div>
                          )}
                          {!isVip && !isLoyal && !isRisk && (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-500">
                        <DollarSign className="w-4 h-4" />
                        {customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(customer.lastSeen).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>

                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No customer data found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
