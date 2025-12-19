import { useState } from 'react';
import { X, CreditCard, Lock, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';

export default function PaymentModal() {
    const { isCheckoutOpen, closeCheckout } = useSubscription();
    const [method, setMethod] = useState<'card' | 'paypal'>('card');
    const [processing, setProcessing] = useState(false);

    // Form states
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    if (!isCheckoutOpen) return null;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    price_id: 'price_REPLACE_ME_WITH_REAL_ID',
                    return_url: window.location.origin
                }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Payment error:', error);
            // In a real app, show a toast notification here
            setProcessing(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            Secure Checkout
                        </h3>
                        <button
                            onClick={closeCheckout}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total due today</p>
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">$29.00</h2>
                                <span className="text-sm font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                    /month
                                </span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={() => setMethod('card')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-medium transition-all ${method === 'card'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" />
                                Card
                            </button>
                            <button
                                onClick={() => setMethod('paypal')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-medium transition-all ${method === 'paypal'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                                    }`}
                            >
                                <Smartphone className="w-4 h-4" />
                                PayPal
                            </button>
                        </div>

                        {method === 'card' ? (
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            maxLength={19}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Expiry
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            maxLength={5}
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            CVC
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value)}
                                            maxLength={3}
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        'Pay $29.00'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <p className="text-slate-600 dark:text-slate-400">
                                    You will be redirected to PayPal to complete your secure purchase.
                                </p>
                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full py-3 bg-[#0070ba] hover:bg-[#003087] text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>Pay with PayPal</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Encrypted and secure payment processing
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
