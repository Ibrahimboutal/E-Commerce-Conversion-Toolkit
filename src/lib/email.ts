import { env } from './env';
import { supabase } from './supabase';

/**
 * Email service utilities for triggering emails via Supabase Edge Function
 */

export type EmailTemplate =
    | 'abandoned_cart'
    | 'welcome'
    | 'subscription_confirmation'
    | 'payment_receipt';

export interface SendEmailRequest {
    to: string;
    template: EmailTemplate;
    data: Record<string, any>;
}

/**
 * Send email via Supabase Edge Function
 */
export async function sendEmail(request: SendEmailRequest): Promise<boolean> {
    try {
        if (!env.VITE_RESEND_API_KEY) {
            console.warn('Resend API key not configured. Email not sent:', request);
            return false;
        }

        const { data, error } = await supabase.functions.invoke('send-email', {
            body: request,
        });

        if (error) {
            console.error('Error sending email:', error);
            return false;
        }

        return data?.success || false;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Send abandoned cart reminder email
 */
export async function sendAbandonedCartEmail(params: {
    customerEmail: string;
    customerName: string | null;
    cartUrl: string | null;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalPrice: number;
    currency: string;
}): Promise<boolean> {
    return sendEmail({
        to: params.customerEmail,
        template: 'abandoned_cart',
        data: {
            customerName: params.customerName || 'Valued Customer',
            cartUrl: params.cartUrl,
            items: params.items,
            totalPrice: params.totalPrice,
            currency: params.currency,
        },
    });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(params: {
    email: string;
    name?: string;
}): Promise<boolean> {
    return sendEmail({
        to: params.email,
        template: 'welcome',
        data: {
            name: params.name || 'there',
        },
    });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(params: {
    email: string;
    plan: string;
    amount: number;
    currency: string;
}): Promise<boolean> {
    return sendEmail({
        to: params.email,
        template: 'subscription_confirmation',
        data: {
            plan: params.plan,
            amount: params.amount,
            currency: params.currency,
        },
    });
}

/**
 * Check if email service is configured
 */
export const isEmailConfigured = (): boolean => {
    return !!env.VITE_RESEND_API_KEY;
};
