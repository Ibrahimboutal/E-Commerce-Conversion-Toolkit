import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user identity
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { cart_id } = await req.json();

    const { data: cart, error: cartError } = await supabase
      .from('abandoned_carts')
      .select('*, cart_items(*), stores(user_id, name, cart_reminder_template_id, twilio_account_sid, twilio_auth_token, twilio_from_number, sms_reminder_enabled)')
      .eq('id', cart_id)
      .single();

    if (cartError || !cart) {
      throw new Error('Cart not found');
    }

    // Ensure the user owns the store for this cart
    if (cart.stores.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let smsSent = false;
    // Try sending SMS if phone number exists and SMS is enabled
    if (cart.customer_phone && cart.stores.sms_reminder_enabled && cart.stores.twilio_account_sid && cart.stores.twilio_auth_token) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${cart.stores.twilio_account_sid}/Messages.json`;
        const auth = btoa(`${cart.stores.twilio_account_sid}:${cart.stores.twilio_auth_token}`);

        const smsBody = `Hi ${cart.customer_name || 'there'}! You left items in your cart at ${cart.stores.name}. Complete your purchase here: ${cart.cart_url || '#'}`;

        const res = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: cart.customer_phone,
            From: cart.stores.twilio_from_number,
            Body: smsBody,
          }).toString(),
        });

        if (res.ok) {
          smsSent = true;
          console.log(`SMS sent to ${cart.customer_phone}`);
        } else {
          const errorData = await res.json();
          console.error('Twilio error:', errorData);
        }
      } catch (err) {
        console.error('Failed to send SMS:', err);
      }
    }

    // Fetch custom template if exists
    let emailSubject = `Don't forget your items! | ${cart.stores.name}`;
    let emailHtml = '';

    // Check for active A/B tests
    const { data: activeTest } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('store_id', cart.store_id)
      .eq('status', 'active')
      .maybeSingle();

    let selectedVariant = null;
    if (activeTest) {
      selectedVariant = Math.random() > 0.5 ? 'A' : 'B';
      emailSubject = selectedVariant === 'A' ? activeTest.variant_a_subject : activeTest.variant_b_subject;

      // Log the A/B test sent event
      await supabase
        .from('ab_test_events')
        .insert({
          test_id: activeTest.id,
          variant: selectedVariant,
          event_type: 'sent'
        });
    }

    if (cart.stores.cart_reminder_template_id) {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', cart.stores.cart_reminder_template_id)
        .single();

      if (template) {
        emailSubject = template.subject;
        emailHtml = template.body;
      }
    }

    const itemsHtml = cart.cart_items?.map((item: any) => `
      <div style="margin: 16px 0; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <strong style="color: #0f172a;">${item.product_name}</strong><br/>
          <span style="color: #64748b; font-size: 14px;">Quantity: ${item.quantity}</span>
        </div>
        <div style="font-weight: 600; color: #0f172a;">
          $${item.price}
        </div>
      </div>
    `).join('') || '';

    // If using fallback or if template was found, replace variables
    const variables: Record<string, string> = {
      '{{customer_name}}': cart.customer_name || 'there',
      '{{store_name}}': cart.stores.name,
      '{{total_price}}': cart.total_price.toString(),
      '{{currency}}': cart.currency || 'USD',
      '{{cart_url}}': cart.cart_url || '#',
      '{{items_html}}': itemsHtml
    };

    if (!emailHtml) {
      // Premium Default Template
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin-bottom: 10px;">You left something behind!</h1>
              <p style="font-size: 18px; color: #64748b;">Hi {{customer_name}}, we saved your cart for you.</p>
            </div>
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">Your Selection:</h3>
              {{items_html}}
              <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #0f172a; font-size: 18px;">Total:</strong>
                <strong style="color: #10b981; font-size: 20px;">$${cart.total_price} ${cart.currency}</strong>
              </div>
            </div>
            <div style="text-align: center; margin-top: 35px;">
              <a href="{{cart_url}}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Your Purchase</a>
            </div>
          </body>
        </html>
      `;
    }

    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      emailSubject = emailSubject.replace(new RegExp(key, 'g'), value);
      emailHtml = emailHtml.replace(new RegExp(key, 'g'), value);
    });


    // Send email via Resend if SMS was not sent
    if (!smsSent) {
      if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set, logging email instead');
      } else {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${cart.stores.name} <onboarding@resend.dev>`,
            to: [cart.customer_email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Resend error: ${errorData.message || res.statusText}`);
        }
      }
    }

    // Update cart status regardless of channel
    await supabase
      .from('abandoned_carts')
      .update({
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString(),
      })
      .eq('id', cart_id);

    // Log the event
    await supabase
      .from('email_logs')
      .insert({
        cart_id: cart_id,
        email: cart.customer_email,
        subject: smsSent ? '[SMS] ' + emailSubject : emailSubject,
        sent_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: smsSent ? 'SMS reminder sent' : 'Email reminder sent'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending cart reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
