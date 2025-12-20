import { loadStripe, Stripe } from '@stripe/stripe-js';
import { env } from './env';

/**
 * Stripe client configuration and utilities
 */

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance
 * Lazy loads Stripe.js only when needed
 */
export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        if (!env.VITE_STRIPE_PUBLISHABLE_KEY) {
            console.warn('Stripe publishable key not configured');
            return Promise.resolve(null);
        }
        stripePromise = loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

/**
 * Stripe product and price configuration
 */
export const STRIPE_CONFIG = {
    products: {
        pro: {
            name: 'Pro Plan',
            priceMonthly: 29, // $29/month
            priceYearly: 290, // $290/year (save $58)
            features: [
                'AI Copywriter',
                'Revenue Forecasting',
                'Advanced Analytics',
                'Priority Support',
                'Unlimited Email Reminders',
                'Custom Branding',
            ],
        },
    },
    // These will be set in Stripe Dashboard and passed via checkout session
    // For now, we'll create them dynamically or use environment variables
    prices: {
        proMonthly: env.VITE_STRIPE_PUBLISHABLE_KEY ? 'price_pro_monthly' : null,
        proYearly: env.VITE_STRIPE_PUBLISHABLE_KEY ? 'price_pro_yearly' : null,
    },
};

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = (): boolean => {
    return !!env.VITE_STRIPE_PUBLISHABLE_KEY;
};

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
