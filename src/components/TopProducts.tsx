import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

type TopProduct = {
    id: string;
    name: string;
    image: string | null;
    abandonedCount: number;
    potentialRevenue: number;
};

export default function TopProducts() {
    const [products, setProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTopProducts();
    }, []);

    const loadTopProducts = async () => {
        try {
            const { data: stores } = await supabase
                .from('stores')
                .select('id')
                .maybeSingle();

            if (!stores) {
                setLoading(false);
                return;
            }

            // Join abandoned_carts to ensure we only count items from carts that belong to this store
            // However, supabase-js basic select doesn't support deep filtering easily without foreign keys set up perfectly or using RPC
            // So we'll fetch carts first, then items for those carts.

            const { data: carts } = await supabase
                .from('abandoned_carts')
                .select('id')
                .eq('store_id', stores.id);

            if (!carts || carts.length === 0) {
                setLoading(false);
                return;
            }

            const cartIds = carts.map(c => c.id);

            const { data: items } = await supabase
                .from('cart_items')
                .select('*')
                .in('cart_id', cartIds);

            const productMap = new Map<string, TopProduct>();

            items?.forEach((item) => {
                const current = productMap.get(item.product_id) || {
                    id: item.product_id,
                    name: item.product_name,
                    image: item.product_image,
                    abandonedCount: 0,
                    potentialRevenue: 0,
                };

                current.abandonedCount += item.quantity;
                current.potentialRevenue += item.price * item.quantity;

                productMap.set(item.product_id, current);
            });

            // Sort by potential revenue and take top 5
            setProducts(Array.from(productMap.values()).sort((a, b) => b.potentialRevenue - a.potentialRevenue).slice(0, 5));

        } catch (error) {
            console.error('Error loading top products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>;

    if (products.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Abandoned Products</h3>
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No product data available yet.
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Top Abandoned Products
            </h3>
            <div className="space-y-4">
                {products.map((product, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={product.id}
                        className="flex items-center gap-4 group"
                    >
                        <div className="relative">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-700"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                    <Package className="w-6 h-6" />
                                </div>
                            )}
                            <div className="absolute -top-2 -left-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                {index + 1}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                {product.name}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {product.abandonedCount} items abandoned
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="font-semibold text-slate-900 dark:text-white">
                                ${product.potentialRevenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                potential
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
