import { useEffect, useState } from 'react';
import { supabase, AbandonedCart, CartItem } from '../lib/supabase';
import { Mail, Package, DollarSign, Calendar, CheckCircle, XCircle, ExternalLink, FileDown } from 'lucide-react';
import { exportToCSV } from '../utils/export';

type CartWithItems = AbandonedCart & {
  items?: CartItem[];
};

export default function AbandonedCarts() {
  const [carts, setCarts] = useState<CartWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'recovered'>('all');

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .maybeSingle();

      if (!stores) {
        setLoading(false);
        return;
      }

      const { data: cartsData } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('store_id', stores.id)
        .order('abandoned_at', { ascending: false });

      if (cartsData) {
        const cartsWithItems = await Promise.all(
          cartsData.map(async (cart) => {
            const { data: items } = await supabase
              .from('cart_items')
              .select('*')
              .eq('cart_id', cart.id);
            return { ...cart, items: items || [] };
          })
        );
        setCarts(cartsWithItems);
      }
    } catch (error) {
      console.error('Error loading carts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (cartId: string) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-cart-reminder`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart_id: cartId }),
      });

      if (response.ok) {
        await loadCarts();
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const markAsRecovered = async (cartId: string) => {
    try {
      await supabase
        .from('abandoned_carts')
        .update({ recovered: true, recovered_at: new Date().toISOString() })
        .eq('id', cartId);

      await loadCarts();
    } catch (error) {
      console.error('Error marking cart as recovered:', error);
    }
  };

  const filteredCarts = carts.filter((cart) => {
    if (filter === 'pending') return !cart.reminder_sent && !cart.recovered;
    if (filter === 'sent') return cart.reminder_sent && !cart.recovered;
    if (filter === 'recovered') return cart.recovered;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading carts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Abandoned Carts</h2>

        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(filteredCarts, 'abandoned-carts')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors mr-2"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          {(['all', 'pending', 'sent', 'recovered'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredCarts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No abandoned carts found</p>
          <p className="text-sm text-slate-500 mt-2">
            Carts will appear here when customers leave items without completing checkout
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCarts.map((cart) => (
            <div key={cart.id} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {cart.customer_name || 'Anonymous Customer'}
                    </h3>
                    {cart.recovered ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Recovered
                      </span>
                    ) : cart.reminder_sent ? (
                      <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Mail className="w-3 h-3" />
                        Reminder Sent
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm">{cart.customer_email}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-slate-900 mb-1">
                    <DollarSign className="w-5 h-5" />
                    {cart.total_price}
                  </div>
                  <p className="text-xs text-slate-500">{cart.currency}</p>
                </div>
              </div>

              {cart.items && cart.items.length > 0 && (
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">Items:</p>
                  <div className="space-y-2">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-slate-900">{item.product_name}</p>
                          <p className="text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-slate-900">${item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(cart.abandoned_at).toLocaleDateString()}
                  </div>
                  {cart.cart_url && (
                    <a
                      href={cart.cart_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Cart
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  {!cart.recovered && !cart.reminder_sent && (
                    <button
                      onClick={() => sendReminder(cart.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Reminder
                    </button>
                  )}
                  {!cart.recovered && cart.reminder_sent && (
                    <button
                      onClick={() => markAsRecovered(cart.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Recovered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
