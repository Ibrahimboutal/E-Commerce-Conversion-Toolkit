// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email templates
const templates = {
    abandoned_cart: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
        .items { margin: 20px 0; }
        .item { padding: 10px; border-bottom: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>You left items in your cart!</h2>
        <p>Hi ${data.customerName},</p>
        <p>We noticed you left some items in your cart. Don't miss out!</p>
        <div class="items">
          ${data.items.map((item: any) => `
            <div class="item">
              <strong>${item.name}</strong> - Qty: ${item.quantity} - $${item.price}
            </div>
          `).join('')}
        </div>
        <p><strong>Total: $${data.totalPrice} ${data.currency}</strong></p>
        ${data.cartUrl ? `<a href="${data.cartUrl}" class="button">Complete Your Purchase</a>` : ''}
        <p>Thanks,<br>Your Store Team</p>
      </div>
    </body>
    </html>
  `,

    welcome: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to E-Commerce Conversion Toolkit!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for signing up! We're excited to help you recover lost revenue and boost your conversions.</p>
        <p>Get started by setting up your store and connecting your platform.</p>
        <a href="${Deno.env.get('SUPABASE_URL')}/dashboard" class="button">Go to Dashboard</a>
        <p>Best regards,<br>The Conversion Toolkit Team</p>
      </div>
    </body>
    </html>
  `,

    subscription_confirmation: (data: any) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .highlight { background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Pro! 🎉</h2>
        <p>Your subscription is now active.</p>
        <div class="highlight">
          <p><strong>Plan:</strong> ${data.plan}</p>
          <p><strong>Amount:</strong> $${data.amount} ${data.currency}/month</p>
        </div>
        <p>You now have access to all Pro features including AI Copywriter, Revenue Forecasting, and Priority Support.</p>
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `,
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { to, template, data } = await req.json();

        if (!to || !template) {
            throw new Error('Missing required fields: to, template');
        }

        if (!templates[template as keyof typeof templates]) {
            throw new Error(`Unknown template: ${template}`);
        }

        const html = templates[template as keyof typeof templates](data);

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Conversion Toolkit <onboarding@resend.dev>',
                to: [to],
                subject: template === 'abandoned_cart' ? 'You left items in your cart!' :
                    template === 'welcome' ? 'Welcome to Conversion Toolkit' :
                        template === 'subscription_confirmation' ? 'Your Pro subscription is active' :
                            'Notification',
                html,
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'Failed to send email');
        }

        return new Response(
            JSON.stringify({ success: true, id: result.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
