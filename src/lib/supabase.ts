import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Store = {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  webhook_secret: string;
  api_key: string | null;
  cart_reminder_enabled: boolean;
  cart_reminder_delay_hours: number;
  created_at: string;
  updated_at: string;
  subscription_tier: 'free' | 'pro';
  subscription_status: 'active' | 'past_due' | 'canceled';
};

export type AbandonedCart = {
  id: string;
  store_id: string;
  customer_email: string;
  customer_name: string | null;
  cart_token: string;
  cart_url: string | null;
  total_price: number;
  currency: string;
  abandoned_at: string;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  recovered: boolean;
  recovered_at: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  created_at: string;
};

export type Review = {
  id: string;
  store_id: string;
  product_id: string;
  product_name: string;
  customer_name: string | null;
  rating: number;
  review_text: string | null;
  keywords: string[] | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  analyzed: boolean;
  created_at: string;
};
