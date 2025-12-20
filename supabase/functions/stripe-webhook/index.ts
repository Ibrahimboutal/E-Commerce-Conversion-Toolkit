// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return new Response('Missing signature', { status: 400 });
    }

    try {
        const body = await req.text();
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

        console.log(`Received webhook: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                // Update store subscription status
                const { error } = await supabaseAdmin
                    .from('stores')
                    .update({
                        subscription_tier: 'pro',
                        subscription_status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', session.metadata?.store_id);

                if (error) {
                    console.error('Error updating store:', error);
                    throw error;
                }

                console.log(`Subscription activated for store: ${session.metadata?.store_id}`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                // Get store by customer ID (you'll need to setup customer ID mapping)
                // For now, we'll use metadata if available
                if (subscription.metadata?.store_id) {
                    const status = subscription.status === 'active' ? 'active' :
                        subscription.status === 'past_due' ? 'past_due' :
                            'canceled';

                    await supabaseAdmin
                        .from('stores')
                        .update({
                            subscription_status: status,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', subscription.metadata.store_id);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                if (subscription.metadata?.store_id) {
                    await supabaseAdmin
                        .from('stores')
                        .update({
                            subscription_tier: 'free',
                            subscription_status: 'canceled',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', subscription.metadata.store_id);

                    console.log(`Subscription canceled for store: ${subscription.metadata.store_id}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
